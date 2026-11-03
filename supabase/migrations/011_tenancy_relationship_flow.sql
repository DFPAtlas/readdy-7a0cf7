-- LetHub Migration 011: Tenant -> Tenancy -> Property Relationship Flow
-- Forward-only migration. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 012.
--
-- Purpose:
--   * give tenants a trusted ownership scope (agency / landlord / creator) so
--     they can exist independently of a property until linked via tenancy_parties;
--   * let scoped managers read and edit only the tenants they are responsible for;
--   * stop the browser creating tenant rows directly (creation runs through the
--     trusted create-tenant Edge Function);
--   * tenancy + lead tenancy_party creation runs through the trusted create-tenancy
--     Edge Function (service role), which rolls back the tenancy if the party link
--     cannot be written.

BEGIN;

-- 1. Tenant ownership scope columns (nullable so existing rows are unaffected).
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS managing_agency_id uuid;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS landlord_id uuid;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS created_by_profile_id uuid;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenants_managing_agency_id_fkey') THEN
    ALTER TABLE public.tenants
      ADD CONSTRAINT tenants_managing_agency_id_fkey
      FOREIGN KEY (managing_agency_id) REFERENCES public.agencies(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenants_landlord_id_fkey') THEN
    ALTER TABLE public.tenants
      ADD CONSTRAINT tenants_landlord_id_fkey
      FOREIGN KEY (landlord_id) REFERENCES public.landlords(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenants_created_by_profile_id_fkey') THEN
    ALTER TABLE public.tenants
      ADD CONSTRAINT tenants_created_by_profile_id_fkey
      FOREIGN KEY (created_by_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tenants_managing_agency ON public.tenants(managing_agency_id);
CREATE INDEX IF NOT EXISTS idx_tenants_landlord ON public.tenants(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_property_status ON public.tenancies(property_id, status);

-- 2. Trusted scope check for a tenant.
CREATE OR REPLACE FUNCTION public.can_manage_tenant(t_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  select public.is_platform_admin()
      or exists (
        select 1 from public.tenants tn
        left join public.landlords l on l.id = tn.landlord_id
        where tn.id = t_id and (
             tn.created_by_profile_id = auth.uid()
          or l.owner_profile_id = auth.uid()
          or coalesce(tn.managing_agency_id, l.managing_agency_id) in (select public.my_agency_ids())
        )
      )
      or exists (
        select 1 from public.tenancy_parties tp
        join public.tenancies t on t.id = tp.tenancy_id
        where tp.tenant_id = t_id and public.can_manage_property(t.property_id)
      );
$function$;

COMMENT ON FUNCTION public.can_manage_tenant(uuid) IS
  'True when the current user may read or edit this tenant, based on the trusted tenant scope (creator, landlord, agency) or an existing managed tenancy link.';

-- 3. Scoped read/update policies and no direct browser inserts.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenants_scope_read'
  ) THEN
    CREATE POLICY tenants_scope_read ON public.tenants
      FOR SELECT TO authenticated
      USING (public.can_manage_tenant(id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tenants' AND policyname = 'tenants_scope_update'
  ) THEN
    CREATE POLICY tenants_scope_update ON public.tenants
      FOR UPDATE TO authenticated
      USING (public.can_manage_tenant(id))
      WITH CHECK (public.can_manage_tenant(id));
  END IF;
END $$;

REVOKE INSERT ON TABLE public.tenants FROM anon, authenticated;

-- 4. Prevent the browser from re-pointing a tenant at another owner/agency.
CREATE OR REPLACE FUNCTION public.prevent_tenant_scope_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  trusted_database_role boolean := current_user IN (
    'postgres',
    'service_role',
    'supabase_auth_admin'
  );
BEGIN
  IF trusted_database_role THEN
    RETURN NEW;
  END IF;

  IF NEW.managing_agency_id IS DISTINCT FROM OLD.managing_agency_id
     OR NEW.landlord_id IS DISTINCT FROM OLD.landlord_id
     OR NEW.created_by_profile_id IS DISTINCT FROM OLD.created_by_profile_id
     OR NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    RAISE EXCEPTION 'Tenant scope fields cannot be changed from the browser client';
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_tenant_scope_change') THEN
    CREATE TRIGGER prevent_tenant_scope_change
      BEFORE UPDATE ON public.tenants
      FOR EACH ROW EXECUTE FUNCTION public.prevent_tenant_scope_change();
  END IF;
END $$;

COMMIT;