-- 023: stop signed-out visitors calling SECURITY DEFINER helpers that nothing
-- public needs.
--
-- These ten functions are not used by any RLS policy, so revoking them from
-- anon can't break a policy check; the app only calls them after sign-in.
-- The other helpers (is_platform_admin, can_manage_property, my_agency_ids,
-- ...) stay callable by anon on purpose: policies written "TO public" call
-- them while anon reads public tables such as subscription_plans, and the
-- policy check would fail without EXECUTE. They only ever answer questions
-- about the caller, so for a signed-out visitor they return false/empty.
--
-- Non-destructive: privilege changes only. Signed-in users and the service
-- role keep EXECUTE.

DO $$
DECLARE
  fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.can_create_portal_invite()',
    'public.can_manage_tenancy(uuid)',
    'public.count_user_properties()',
    'public.get_current_plan_slug()',
    'public.get_user_account_id()',
    'public.get_user_permissions()',
    'public.get_user_roles()',
    'public.is_contractor_of_job(uuid)',
    'public.is_subscription_active_or_trialing()',
    'public.is_tenant_of_tenancy(uuid)'
  ]
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn);
  END LOOP;
END $$;
