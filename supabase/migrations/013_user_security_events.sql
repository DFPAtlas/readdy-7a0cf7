-- LetHub Migration 013: User Security Events Table
-- Forward-only migration. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 014.
--
-- Purpose:
--   * create public.user_security_events so account security features
--     (lib/securityEvents.ts, lib/deviceTrust.ts) have a durable table.
--   * scope access strictly per user: a signed-in user may read and append
--     only their own events. No update or delete policies are granted.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text NOT NULL,
  device text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_security_events_user_id_created_at_idx
  ON public.user_security_events (user_id, created_at DESC);

ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_security_events_select_own ON public.user_security_events;
CREATE POLICY user_security_events_select_own
  ON public.user_security_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_security_events_insert_own ON public.user_security_events;
CREATE POLICY user_security_events_insert_own
  ON public.user_security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

COMMIT;