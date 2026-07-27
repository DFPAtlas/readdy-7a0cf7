-- LetHub Authentication and RBAC Hardening Migration 004
-- Purpose: prevent browser clients from assigning privileged roles or changing
-- their role after profile creation.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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
  -- Administrative role changes must run through a trusted Edge Function or
  -- database administration context using the service role.
  IF trusted_database_role THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF actor_id IS NULL OR NEW.id IS DISTINCT FROM actor_id THEN
      RAISE EXCEPTION 'Profiles may only be created for the authenticated user';
    END IF;

    IF NEW.role IS NULL OR NEW.role NOT IN (
      'estate_agent_admin',
      'landlord',
      'tenant',
      'contractor'
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

DROP TRIGGER IF EXISTS trg_profiles_role_integrity ON public.profiles;
CREATE TRIGGER trg_profiles_role_integrity
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_role_integrity();

COMMENT ON FUNCTION public.enforce_profile_role_integrity() IS
  'Blocks direct client role escalation. Privileged role changes must use a service-role Edge Function with its own authorisation checks.';
