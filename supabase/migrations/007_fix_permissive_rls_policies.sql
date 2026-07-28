-- LetHub Permissive RLS Policy Fix Migration 007
-- Applied directly to the live database on 2026-07-28 (Supabase migration
-- name: fix_permissive_rls_policies, version 20260728184005). Added here
-- retroactively so it's captured in tracked migration history rather than
-- only existing live.
--
-- Context: migration 006 confirmed RLS was already enabled on every public
-- table in the live database (it had been turned on directly via the
-- Supabase dashboard, never captured in a tracked migration). However,
-- RLS being *enabled* does not mean the policies themselves are correctly
-- scoped. A live audit of pg_policies found that a large number of tables
-- had "shell" RLS: enabled, but with permissive policies (`qual = true`)
-- granted to `public`, `anon`, and/or `authenticated` roles -- meaning the
-- tables were, in practice, still fully open to reads and in several cases
-- writes/deletes, regardless of the RLS flag.
--
-- Confirmed exposed with live data present at time of fix:
--   - open_banking_connections (4 rows)  -- banking API connection records
--   - open_banking_transactions (15 rows) -- financial transaction data
--   - workspace_connections (2 rows)      -- Google/Microsoft OAuth-style connections
--   - workspace_sync_logs (7 rows)
--   - marketplace_transactions (30 rows)  -- ALL access for any authenticated
--                                            user (any tenant/role/agency),
--                                            plus SELECT for anon (unauthenticated)
--   - n8n_agents (18 rows) / n8n_agent_runs (35 rows)
--   - api_audit_log (16 rows)             -- your own security audit trail, world-readable
--   - contractor_performance (22 rows)
--   - property_health_scores (12 rows)
--   - franchises / franchise_offices / offices / regions (structural/reference data)
--   - owner_monthly_reports (0 rows -- empty at time of fix)
--
-- This migration re-scopes each of the above using patterns already
-- established correctly elsewhere in the schema (my_agency_ids(),
-- can_manage_property(), is_platform_admin(), is_tenant_of_property(),
-- is_assigned_contractor()) rather than inventing a new authorization model.
--
-- Two things intentionally left as narrower interim fixes rather than full
-- per-tenant scoping, because the schema has no resolving function for
-- them yet:
--   1. franchises / franchise_offices / offices / regions key off an
--      `account_id` column with no `my_account_ids()`-equivalent function
--      anywhere in the schema. Fixed here to admin-write + authenticated-read
--      (removing anon and cross-tenant write access), but NOT scoped per
--      account/tenant. Needs a decision on the intended enterprise/franchise
--      ownership model before tightening further.
--   2. owner_monthly_reports stores owner_id/property_id as `text` with no
--      foreign key, so there's no safe way to scope it to "the reports for
--      this owner" from the schema alone. Locked to platform-admin-only.
--      Table was empty at time of fix, so this is a safe stopgap, but the
--      landlord-facing "my monthly reports" UI (if it exists) should be
--      re-tested once real scoping is designed, since it will currently
--      return nothing for a non-admin landlord.
--
-- See PR #13 discussion / conversation history for the full pg_policies
-- audit that produced this list.

-- open_banking_connections
DROP POLICY IF EXISTS "Allow full access to open_banking_connections" ON public.open_banking_connections;

CREATE POLICY obc_admin ON public.open_banking_connections
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY obc_read ON public.open_banking_connections
  FOR SELECT TO authenticated
  USING (agency_id IN (SELECT my_agency_ids()));

CREATE POLICY obc_insert ON public.open_banking_connections
  FOR INSERT TO authenticated
  WITH CHECK (agency_id IN (SELECT my_agency_ids()));

-- open_banking_transactions
DROP POLICY IF EXISTS "Allow full access to open_banking_transactions" ON public.open_banking_transactions;

CREATE POLICY obt_admin ON public.open_banking_transactions
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY obt_read ON public.open_banking_transactions
  FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.open_banking_connections WHERE agency_id IN (SELECT my_agency_ids())
  ));

-- workspace_connections
DROP POLICY IF EXISTS "Allow select on workspace_connections" ON public.workspace_connections;
DROP POLICY IF EXISTS "Allow insert on workspace_connections" ON public.workspace_connections;
DROP POLICY IF EXISTS "Allow update on workspace_connections" ON public.workspace_connections;

CREATE POLICY wc_admin ON public.workspace_connections
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY wc_read ON public.workspace_connections
  FOR SELECT TO authenticated
  USING (agency_id IN (SELECT my_agency_ids()));

CREATE POLICY wc_insert ON public.workspace_connections
  FOR INSERT TO authenticated
  WITH CHECK (agency_id IN (SELECT my_agency_ids()));

-- workspace_sync_logs
DROP POLICY IF EXISTS "Allow select on workspace_sync_logs" ON public.workspace_sync_logs;
DROP POLICY IF EXISTS "Allow insert on workspace_sync_logs" ON public.workspace_sync_logs;
DROP POLICY IF EXISTS "Allow update on workspace_sync_logs" ON public.workspace_sync_logs;

CREATE POLICY wsl_admin ON public.workspace_sync_logs
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY wsl_read ON public.workspace_sync_logs
  FOR SELECT TO authenticated
  USING (connection_id IN (
    SELECT id FROM public.workspace_connections WHERE agency_id IN (SELECT my_agency_ids())
  ));

-- marketplace_transactions
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.marketplace_transactions;
DROP POLICY IF EXISTS "Allow select for anon" ON public.marketplace_transactions;

CREATE POLICY mt_admin ON public.marketplace_transactions
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY mt_agency_manage ON public.marketplace_transactions
  FOR ALL TO authenticated
  USING (can_manage_property(property_id))
  WITH CHECK (can_manage_property(property_id));

CREATE POLICY mt_contractor_read ON public.marketplace_transactions
  FOR SELECT TO authenticated
  USING (contractor_id IN (
    SELECT id FROM public.contractor_profiles WHERE profile_id = auth.uid()
  ));

-- n8n_agents
DROP POLICY IF EXISTS "Anyone can read n8n_agents" ON public.n8n_agents;
DROP POLICY IF EXISTS "Authenticated users can update n8n_agents" ON public.n8n_agents;

CREATE POLICY n8n_agents_admin ON public.n8n_agents
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY n8n_agents_read ON public.n8n_agents
  FOR SELECT TO authenticated
  USING (agency_id IN (SELECT my_agency_ids()));

CREATE POLICY n8n_agents_update ON public.n8n_agents
  FOR UPDATE TO authenticated
  USING (agency_id IN (SELECT my_agency_ids()))
  WITH CHECK (agency_id IN (SELECT my_agency_ids()));

-- n8n_agent_runs
DROP POLICY IF EXISTS "Anyone can read n8n_agent_runs" ON public.n8n_agent_runs;
DROP POLICY IF EXISTS "Anyone can insert n8n_agent_runs" ON public.n8n_agent_runs;

CREATE POLICY n8n_runs_admin ON public.n8n_agent_runs
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY n8n_runs_read ON public.n8n_agent_runs
  FOR SELECT TO authenticated
  USING (agent_id IN (
    SELECT id FROM public.n8n_agents WHERE agency_id IN (SELECT my_agency_ids())
  ));

-- api_audit_log
DROP POLICY IF EXISTS "Allow select on api_audit_log" ON public.api_audit_log;

CREATE POLICY audit_log_admin_read ON public.api_audit_log
  FOR SELECT TO authenticated
  USING (is_platform_admin());

-- contractor_performance
DROP POLICY IF EXISTS "Anyone can read contractor_performance" ON public.contractor_performance;
DROP POLICY IF EXISTS "Authenticated users can insert contractor_performance" ON public.contractor_performance;
DROP POLICY IF EXISTS "Authenticated users can update contractor_performance" ON public.contractor_performance;

CREATE POLICY cp_perf_admin ON public.contractor_performance
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY cp_perf_agency_read ON public.contractor_performance
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agency_members am WHERE am.profile_id = auth.uid()));

CREATE POLICY cp_perf_self_read ON public.contractor_performance
  FOR SELECT TO authenticated
  USING (contractor_id IN (
    SELECT id FROM public.contractor_profiles WHERE profile_id = auth.uid()
  ));

-- property_health_scores
DROP POLICY IF EXISTS "Users can view health scores for their properties" ON public.property_health_scores;
DROP POLICY IF EXISTS "Users can insert health scores" ON public.property_health_scores;
DROP POLICY IF EXISTS "Users can update health scores" ON public.property_health_scores;

CREATE POLICY phs_admin ON public.property_health_scores
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY phs_read ON public.property_health_scores
  FOR SELECT TO authenticated
  USING (
    can_manage_property(property_id)
    OR is_tenant_of_property(property_id)
    OR is_assigned_contractor(property_id)
  );

CREATE POLICY phs_agency_write ON public.property_health_scores
  FOR ALL TO authenticated
  USING (can_manage_property(property_id))
  WITH CHECK (can_manage_property(property_id));

-- franchises / franchise_offices / offices / regions -- interim fix only,
-- see note above. Removes anon + cross-tenant write access.
DROP POLICY IF EXISTS "select_franchises" ON public.franchises;
DROP POLICY IF EXISTS "insert_franchises" ON public.franchises;
DROP POLICY IF EXISTS "update_franchises" ON public.franchises;

CREATE POLICY franchises_admin ON public.franchises
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY franchises_read ON public.franchises
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "select_franchise_offices" ON public.franchise_offices;
DROP POLICY IF EXISTS "insert_franchise_offices" ON public.franchise_offices;
DROP POLICY IF EXISTS "update_franchise_offices" ON public.franchise_offices;

CREATE POLICY franchise_offices_admin ON public.franchise_offices
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY franchise_offices_read ON public.franchise_offices
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow select on offices" ON public.offices;
DROP POLICY IF EXISTS "Allow insert on offices" ON public.offices;
DROP POLICY IF EXISTS "Allow update on offices" ON public.offices;

CREATE POLICY offices_admin ON public.offices
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY offices_read ON public.offices
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "select_regions" ON public.regions;
DROP POLICY IF EXISTS "insert_regions" ON public.regions;
DROP POLICY IF EXISTS "update_regions" ON public.regions;

CREATE POLICY regions_admin ON public.regions
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

CREATE POLICY regions_read ON public.regions
  FOR SELECT TO authenticated
  USING (true);

-- owner_monthly_reports -- interim admin-only lockdown, see note above.
DROP POLICY IF EXISTS "select_owner_reports" ON public.owner_monthly_reports;
DROP POLICY IF EXISTS "insert_owner_reports" ON public.owner_monthly_reports;
DROP POLICY IF EXISTS "update_owner_reports" ON public.owner_monthly_reports;
DROP POLICY IF EXISTS "delete_owner_reports" ON public.owner_monthly_reports;

CREATE POLICY omr_admin_only ON public.owner_monthly_reports
  FOR ALL TO authenticated
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());
