-- LetHub Migration 010: Registration & Invitation Security Hardening
-- Forward-only migration. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 011.
--
-- Purpose:
--   * restrict public self-registration profiles to estate_agent_admin / landlord;
--   * give new auth users a least-privilege placeholder profile so privileged
--     roles can only be assigned by trusted service-role flows;
--   * make portal invitation tokens unreadable/unwritable from the browser;
--   * stop the browser creating or amending privileged portal-access grants;
--   * keep platform_admin unreachable from every public registration/invite path.
--
-- Invitation tokens are validated entirely by the trusted accept-portal-invite
-- Edge Function (service role). The browser never reads portal_invites.

BEGIN;

-- 1. Public self-registration may only ever create these two roles.
--    Tenant/contractor/platform_admin can only be assigned by the service role.
CREATE OR REPLACE FUNCTION public.enforce_profile_role_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  actor_id uuid := (SELECT auth.uid());
  trusted_database_role boolean := current_user IN (
    'postgres',
    'service_role',
    'supabase_auth_admin'
  );
BEGIN
  IF trusted_database_role THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF actor_id IS NULL OR NEW.id IS DISTINCT FROM actor_id THEN
      RAISE EXCEPTION 'Profiles may only be created for the authenticated user';
    END IF;

    IF NEW.role IS NULL OR NEW.role NOT IN (
      'estate_agent_admin',
      'landlord'
    ) THEN
      RAISE EXCEPTION 'The requested self-registration role is not permitted';
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Account roles cannot be changed from the browser client';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_profile_role_integrity() IS
  'Blocks direct client role escalation. Only estate_agent_admin and landlord may be self-registered; every other role (tenant, contractor, platform_admin) must be assigned by a trusted service-role flow.';

-- 1b. Attach the role-integrity guard to profiles. Without this trigger the
--     profiles_safe_self_update policy would let a signed-in user rewrite their
--     own role from the browser.
DROP TRIGGER IF EXISTS enforce_profile_role_integrity ON public.profiles;
CREATE TRIGGER enforce_profile_role_integrity
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_role_integrity();

-- 2. New auth users receive a least-privilege placeholder profile. The real role
--    is assigned afterwards by complete-registration or accept-portal-invite.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, account_type, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'client',
    NULL,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Remove every pre-existing policy on the portal tables so no permissive
--    legacy policy can survive.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN ('portal_invites', 'portal_access', 'owner_portal_access', 'tenant_portal_access')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 4. portal_invites: no browser access at all. Tokens are hashed secrets handled
--    only by the service role.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portal_invites') THEN
    ALTER TABLE public.portal_invites ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.portal_invites FORCE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public.portal_invites FROM anon, authenticated;
    EXECUTE 'CREATE POLICY portal_invites_admin ON public.portal_invites FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())';
  END IF;
END $$;

-- 5. portal_access: browser may read scoped records, never write.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portal_access') THEN
    ALTER TABLE public.portal_access ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.portal_access FORCE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON TABLE public.portal_access FROM anon, authenticated;
    EXECUTE 'CREATE POLICY portal_access_admin ON public.portal_access FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())';
    EXECUTE 'CREATE POLICY portal_access_read ON public.portal_access FOR SELECT TO authenticated USING (public.is_platform_admin() OR public.can_manage_property(property_id) OR user_id = (SELECT auth.uid()) OR created_by = (SELECT auth.uid()))';
  END IF;
END $$;

-- 6. owner_portal_access: browser may read scoped records; grants can only be
--    created or changed for agency-managed landlords.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'owner_portal_access') THEN
    ALTER TABLE public.owner_portal_access ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.owner_portal_access FORCE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON TABLE public.owner_portal_access FROM anon;
    EXECUTE 'CREATE POLICY opa_admin ON public.owner_portal_access FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())';
    EXECUTE 'CREATE POLICY opa_read ON public.owner_portal_access FOR SELECT TO authenticated USING (profile_id = (SELECT auth.uid()) OR public.is_platform_admin() OR public.can_manage_landlord(landlord_id) OR EXISTS (SELECT 1 FROM public.properties p WHERE p.landlord_id = owner_portal_access.landlord_id AND public.can_manage_property(p.id)))';
    EXECUTE 'CREATE POLICY opa_manage ON public.owner_portal_access FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin() OR public.can_manage_landlord(landlord_id))';
    EXECUTE 'CREATE POLICY opa_update ON public.owner_portal_access FOR UPDATE TO authenticated USING (public.is_platform_admin() OR public.can_manage_landlord(landlord_id)) WITH CHECK (public.is_platform_admin() OR public.can_manage_landlord(landlord_id))';
    EXECUTE 'CREATE POLICY opa_delete ON public.owner_portal_access FOR DELETE TO authenticated USING (public.is_platform_admin() OR public.can_manage_landlord(landlord_id))';
  END IF;
END $$;

-- 7. tenant_portal_access: browser may read scoped records; grants can only be
--    created or changed for tenants attached to agency-managed properties.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenant_portal_access') THEN
    ALTER TABLE public.tenant_portal_access ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.tenant_portal_access FORCE ROW LEVEL SECURITY;
    REVOKE INSERT, UPDATE, DELETE ON TABLE public.tenant_portal_access FROM anon;
    EXECUTE 'CREATE POLICY tpa_admin ON public.tenant_portal_access FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin())';
    EXECUTE 'CREATE POLICY tpa_read ON public.tenant_portal_access FOR SELECT TO authenticated USING (profile_id = (SELECT auth.uid()) OR public.is_platform_admin() OR EXISTS (SELECT 1 FROM public.tenancy_parties tp JOIN public.tenancies t ON t.id = tp.tenancy_id WHERE tp.tenant_id = tenant_portal_access.tenant_id AND public.can_manage_property(t.property_id)))';
    EXECUTE 'CREATE POLICY tpa_manage ON public.tenant_portal_access FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin() OR EXISTS (SELECT 1 FROM public.tenancy_parties tp JOIN public.tenancies t ON t.id = tp.tenancy_id WHERE tp.tenant_id = tenant_portal_access.tenant_id AND public.can_manage_property(t.property_id)))';
    EXECUTE 'CREATE POLICY tpa_update ON public.tenant_portal_access FOR UPDATE TO authenticated USING (public.is_platform_admin() OR EXISTS (SELECT 1 FROM public.tenancy_parties tp JOIN public.tenancies t ON t.id = tp.tenancy_id WHERE tp.tenant_id = tenant_portal_access.tenant_id AND public.can_manage_property(t.property_id))) WITH CHECK (public.is_platform_admin() OR EXISTS (SELECT 1 FROM public.tenancy_parties tp JOIN public.tenancies t ON t.id = tp.tenancy_id WHERE tp.tenant_id = tenant_portal_access.tenant_id AND public.can_manage_property(t.property_id)))';
    EXECUTE 'CREATE POLICY tpa_delete ON public.tenant_portal_access FOR DELETE TO authenticated USING (public.is_platform_admin() OR EXISTS (SELECT 1 FROM public.tenancy_parties tp JOIN public.tenancies t ON t.id = tp.tenancy_id WHERE tp.tenant_id = tenant_portal_access.tenant_id AND public.can_manage_property(t.property_id)))';
  END IF;
END $$;

COMMIT;