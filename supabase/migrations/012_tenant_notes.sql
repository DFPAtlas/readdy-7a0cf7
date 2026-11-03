-- LetHub Migration 012: Tenant Notes Column
-- Forward-only migration. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 013.
--
-- Purpose:
--   * add a free-text `notes` column to public.tenants so tenant notes can be
--     persisted instead of silently discarded by the UI.

BEGIN;

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS notes text;

COMMENT ON COLUMN public.tenants.notes IS
  'Free-text operational notes about the tenant. Editable by any scoped manager (not a scope field).';

COMMIT;