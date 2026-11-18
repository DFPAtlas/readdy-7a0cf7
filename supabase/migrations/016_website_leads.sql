-- LetHub Migration 016: Website lead capture
-- Forward-only, idempotent. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 017.
--
-- Purpose:
--   Store contact-form and demo-request submissions from the marketing site in
--   LetHub's own database instead of a third-party form endpoint.
--
-- Access model:
--   Rows are written only by the `submit-website-lead` Edge Function using the
--   service role. RLS is enabled and forced with a read policy for platform
--   admins only, so browsers can neither read nor write this table directly.

BEGIN;

CREATE TABLE IF NOT EXISTS public.website_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL CHECK (form_type IN ('contact', 'demo')),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 200),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 50),
  company text CHECK (company IS NULL OR char_length(company) <= 200),
  reason text CHECK (reason IS NULL OR char_length(reason) <= 200),
  properties_count text CHECK (properties_count IS NULL OR char_length(properties_count) <= 50),
  message text CHECK (message IS NULL OR char_length(message) <= 5000),
  source_page text CHECK (source_page IS NULL OR char_length(source_page) <= 300),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON public.website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS website_leads_email_idx ON public.website_leads (lower(email));

ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_leads FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.website_leads FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.website_leads FROM authenticated;
GRANT SELECT, UPDATE ON public.website_leads TO authenticated;

DROP POLICY IF EXISTS website_leads_admin_read ON public.website_leads;
CREATE POLICY website_leads_admin_read ON public.website_leads
  FOR SELECT TO authenticated
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS website_leads_admin_update ON public.website_leads;
CREATE POLICY website_leads_admin_update ON public.website_leads
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

COMMENT ON TABLE public.website_leads IS
  'Marketing-site contact and demo requests. Written by the submit-website-lead Edge Function only.';

COMMIT;
