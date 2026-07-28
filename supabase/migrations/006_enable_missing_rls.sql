-- LetHub RLS Enforcement Gap Migration 006
-- Purpose: these tables already have CREATE POLICY statements from migration
-- 002 (schema_foundation), but row level security was never switched on for
-- them anywhere in migration history. A policy with RLS disabled on its table
-- is inert in Postgres -- the table remains fully readable/writable by any
-- role holding a grant (including `anon`/`authenticated` under Supabase's
-- default grants) regardless of what the policy says.
--
-- Before applying: confirm the current state on the live database with:
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public'
--     and tablename in (
--       'accounting_connections','accounting_sync_logs','api_audit_log',
--       'contractor_performance','email_queue','franchise_offices','franchises',
--       'import_log','marketplace_transactions','n8n_agent_runs','n8n_agents',
--       'notification_preferences','offices','open_banking_connections',
--       'open_banking_transactions','owner_monthly_reports',
--       'property_health_scores','regions','workspace_connections',
--       'workspace_sync_logs'
--     );
--
-- `ALTER TABLE IF EXISTS` is used throughout so this migration is safe to run
-- even in environments where a given table doesn't exist (e.g. a table that
-- was planned but never actually created outside of migrations).

ALTER TABLE IF EXISTS public.accounting_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounting_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contractor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.franchise_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.import_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.n8n_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.n8n_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.open_banking_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.open_banking_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.owner_monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workspace_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workspace_sync_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too, so even the migration/service role's default
-- table-owner bypass doesn't accidentally leave a hole if anything ever runs
-- these queries as the owning role instead of `service_role`.
ALTER TABLE IF EXISTS public.accounting_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounting_sync_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contractor_performance FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_queue FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.franchise_offices FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.franchises FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.import_log FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketplace_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.n8n_agent_runs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.n8n_agents FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offices FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.open_banking_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.open_banking_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.owner_monthly_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_health_scores FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.regions FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workspace_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workspace_sync_logs FORCE ROW LEVEL SECURITY;

-- NOTE: this migration only flips the switch. It does not audit whether the
-- USING/WITH CHECK clauses on the existing policies for these tables are
-- correct or complete (e.g. properly scoped to the acting agency/tenant).
-- Once applied, re-test each affected page as a non-admin role to confirm
-- rows are now actually being filtered rather than just previously-open.
--
-- The core business tables (properties, tenants, landlords, tenancies,
-- maintenance_jobs, quotes, documents, contractor_profiles, messages,
-- arrears_cases, etc.) are NOT covered by this migration because they were
-- never created via tracked migrations in the first place (see migration 001
-- comment "Already created via SQL tool"). Their RLS status must be checked
-- directly against the live database -- do not assume this migration covers
-- them.
