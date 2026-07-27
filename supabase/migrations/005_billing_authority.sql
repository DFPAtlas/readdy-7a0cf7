-- LetHub Billing Authority Migration 005
-- Stripe webhooks are the only authority for paid subscription state.

-- Replace the legacy tenant-only signup bootstrap with a strict allowlist. User
-- metadata is treated as a registration request, never as an unrestricted role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'requested_role', ''),
    NULLIF(NEW.raw_user_meta_data->>'role', ''),
    'tenant'
  );
  derived_account_type text;
BEGIN
  IF requested_role NOT IN ('estate_agent_admin', 'landlord', 'tenant', 'contractor') THEN
    requested_role := 'tenant';
  END IF;

  derived_account_type := CASE requested_role
    WHEN 'estate_agent_admin' THEN 'agency'
    WHEN 'landlord' THEN 'owner'
    ELSE requested_role
  END;

  INSERT INTO public.profiles (id, full_name, email, role, account_type, created_at)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email),
    NEW.email,
    requested_role,
    derived_account_type,
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.account_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON public.account_subscriptions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.subscription_plans FROM anon, authenticated;

DROP POLICY IF EXISTS "Allow all access to account_subscriptions" ON public.account_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.account_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.account_subscriptions;
DROP POLICY IF EXISTS "account_subscriptions_insert_own" ON public.account_subscriptions;
DROP POLICY IF EXISTS "account_subscriptions_update_own" ON public.account_subscriptions;
DROP POLICY IF EXISTS "account_subscriptions_delete_own" ON public.account_subscriptions;
DROP POLICY IF EXISTS "account_subscriptions_read_own" ON public.account_subscriptions;
DROP POLICY IF EXISTS "account_subscriptions_admin" ON public.account_subscriptions;
DROP POLICY IF EXISTS "account_subscriptions_owner_boundary" ON public.account_subscriptions;

CREATE POLICY "account_subscriptions_read_own"
  ON public.account_subscriptions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "account_subscriptions_admin"
  ON public.account_subscriptions FOR SELECT TO authenticated
  USING (is_platform_admin());

-- Restrictive policies are ANDed with every permissive policy. This prevents an
-- older broad SELECT policy from exposing another user's billing projection.
CREATE POLICY "account_subscriptions_owner_boundary"
  ON public.account_subscriptions AS RESTRICTIVE
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR is_platform_admin());

DROP POLICY IF EXISTS "Allow all access to subscription_plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_public_read" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_authenticated_read" ON public.subscription_plans;

CREATE POLICY "subscription_plans_public_read"
  ON public.subscription_plans FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "subscription_plans_authenticated_read"
  ON public.subscription_plans FOR SELECT TO authenticated
  USING (is_active = true OR is_platform_admin());

GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT SELECT ON public.account_subscriptions TO authenticated;

UPDATE public.account_subscriptions
SET status = 'incomplete',
    current_period_start = NULL,
    current_period_end = NULL,
    updated_at = now()
WHERE stripe_subscription_id IS NULL
  AND status IN ('active', 'trialing', 'past_due', 'pending');

ALTER TABLE public.processed_stripe_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processed',
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_processed_stripe_events_event_id_unique
  ON public.processed_stripe_events(stripe_event_id);

REVOKE ALL ON public.processed_stripe_events FROM anon, authenticated;

COMMENT ON TABLE public.account_subscriptions IS
  'Stripe-authoritative subscription projection. Browser clients have read-only access to their own row.';
