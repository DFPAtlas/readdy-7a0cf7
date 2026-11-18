-- LetHub Migration 017: Subscription access for agency staff and portal users
-- Forward-only, idempotent. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 018.
--
-- Problem:
--   is_account_read_only(), is_subscription_active_or_trialing() and
--   get_current_plan_slug() only look at account_subscriptions rows whose
--   user_id is the caller. Consequences:
--     * agency staff invited by the subscribing admin have no row of their own,
--       so every RESTRICTIVE "readonly" insert/delete policy blocks them;
--     * landlords, tenants and contractors never subscribe, so they cannot
--       create anything the restrictive policies cover (for example a tenant
--       reporting a repair into maintenance_jobs or sending a message).
--
-- Change:
--   * new helper current_account_subscription(): the caller's own latest
--     subscription, otherwise the latest subscription held by any member of
--     the caller's agency (agency_members);
--   * portal roles (landlord, tenant, contractor) are never treated as
--     read-only by the subscription check; their writes remain limited by the
--     existing permissive, scoped policies;
--   * plan and status helpers use the same lookup so staff inherit the
--     agency's plan entitlements.
--
-- Function signatures, owners and SECURITY DEFINER settings are unchanged, so
-- no policy needs to be recreated.

BEGIN;

CREATE OR REPLACE FUNCTION public.current_account_subscription()
RETURNS public.account_subscriptions
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT s.*
  FROM public.account_subscriptions s
  WHERE s.user_id = auth.uid()
     OR s.user_id IN (
       SELECT am.profile_id
       FROM public.agency_members am
       WHERE am.agency_id IN (SELECT public.my_agency_ids())
     )
  ORDER BY (s.user_id = auth.uid()) DESC, s.created_at DESC
  LIMIT 1
$function$;

REVOKE ALL ON FUNCTION public.current_account_subscription() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_account_subscription() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_account_read_only()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role::text IN ('landlord', 'tenant', 'contractor')
    ) THEN false
    ELSE NOT EXISTS (
      SELECT 1
      FROM public.current_account_subscription() s
      WHERE s.id IS NOT NULL
        AND (
          s.status IN ('active', 'past_due', 'demo')
          OR (s.status = 'trialing' AND (s.trial_ends_at IS NULL OR s.trial_ends_at >= now()))
        )
    )
  END
$function$;

CREATE OR REPLACE FUNCTION public.is_subscription_active_or_trialing()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.current_account_subscription() s
    WHERE s.id IS NOT NULL
      AND (
        s.status IN ('active', 'demo')
        OR (s.status = 'trialing' AND (s.trial_ends_at IS NULL OR s.trial_ends_at >= now()))
      )
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_plan_slug()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  SELECT COALESCE((SELECT (public.current_account_subscription()).plan_slug), 'starter')
$function$;

COMMIT;
