-- LetHub Tenant Isolation Hardening Migration 009
-- Forward-only. This is the next forward-applicable migration after the
-- historical/reconstruction chain 001-008. Do NOT edit 001-008.
--
-- Scope: repair only the confirmed access-control findings from the live
-- drift verification (Prompt 3). No schema redesign, no table renames, no
-- data changes.
--
-- Problems addressed
-- ------------------
-- 1. TRUNCATE granted to anon (82 public tables) and authenticated (86
--    public tables). PostgreSQL row-level security does NOT govern
--    TRUNCATE, so any anonymous visitor or any logged-in user could wipe an
--    entire table (profiles, properties, rent_payments, platform_audit_log,
--    etc.) regardless of RLS. This is the dominant P0 finding.
-- 2. cp_agency_read on contractor_profiles granted SELECT to any agency
--    member using `EXISTS (SELECT 1 FROM agency_members WHERE profile_id =
--    auth.uid())`. This leaks every agency's contractor business/contact/
--    insurance/certification data to any member of any unrelated agency
--    (cross-agency read).
-- 3. cp_perf_agency_read on contractor_performance used the identical
--    cross-agency pattern, leaking contractor performance records across
--    agency boundaries.
--
-- What is intentionally NOT changed here (see final report):
-- * compliance_obligation_types_read (qual=true): intentionally public
--   reference/lookup data, low sensitivity.
-- * anon EXECUTE on helper predicates: required so RLS policy evaluation
--   does not fail with "permission denied"; helpers are SECURITY DEFINER
--   with pinned search_path and resolve from trusted DB state.
-- * broad anon INSERT/UPDATE/DELETE grants: currently governed by RLS
--   (auth.uid() is null for anon); tightening is defense-in-depth and
--   deferred pending workflow testing.

BEGIN;

-- 1. Revoke TRUNCATE from browser roles across every current public table.
--    RLS does not apply to TRUNCATE, so this is the only correct fix.
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public
  FROM anon, authenticated, PUBLIC;

-- 2. Stop future public tables from inheriting TRUNCATE for browser roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE ON TABLES
  FROM anon, authenticated, PUBLIC;

-- 3. Remove the cross-agency contractor profile read policy. The remaining
--    policies on contractor_profiles are cp_self_read (contractor reads own
--    profile) and cp_admin_all (platform admin), which preserve the correct
--    boundaries. Agency staff browsing the contractor directory must use a
--    future non-sensitive directory view; see final report.
DROP POLICY IF EXISTS cp_agency_read ON public.contractor_profiles;

-- 4. Remove the identical cross-agency policy on contractor performance.
--    Remaining policies: cp_perf_self_read (contractor reads own) and
--    cp_perf_admin (platform admin).
DROP POLICY IF EXISTS cp_perf_agency_read ON public.contractor_performance;

COMMIT;