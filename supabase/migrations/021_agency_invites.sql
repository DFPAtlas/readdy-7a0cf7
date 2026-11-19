-- 021: invitations for agency staff (Settings -> Team).
--
-- Tokens are random and only their SHA-256 hash is stored. Rows are created,
-- accepted and revoked by the manage-agency-invites / accept-agency-invite
-- Edge Functions (service role). Agency admins can read their own agency's
-- invites.

CREATE TABLE IF NOT EXISTS public.agency_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('estate_agent_staff', 'estate_agent_admin')),
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS agency_invites_agency_idx ON public.agency_invites (agency_id);
CREATE INDEX IF NOT EXISTS agency_invites_email_idx ON public.agency_invites (lower(email));
CREATE INDEX IF NOT EXISTS agency_invites_invited_by_idx ON public.agency_invites (invited_by);
CREATE INDEX IF NOT EXISTS agency_invites_accepted_by_idx ON public.agency_invites (accepted_by);
-- One open invite per email per agency.
CREATE UNIQUE INDEX IF NOT EXISTS agency_invites_open_unique
  ON public.agency_invites (agency_id, lower(email))
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

ALTER TABLE public.agency_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agency_invites_admin_read ON public.agency_invites;
CREATE POLICY agency_invites_admin_read ON public.agency_invites
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin()
    OR (
      agency_id IN (SELECT public.my_agency_ids())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role::text = 'estate_agent_admin'
      )
    )
  );

REVOKE ALL ON public.agency_invites FROM anon;
GRANT SELECT ON public.agency_invites TO authenticated;
