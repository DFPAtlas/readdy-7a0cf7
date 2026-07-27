-- LetHub: Schema Foundation Migration 002
-- Purpose: RLS hardening, view security, indexes, portal security, storage readiness
-- Prerequisites: 001_core_schema.sql already applied

-- ============================================================
-- SECTION 1: RLS HARDENING — DROP WEAK POLICIES, ADD PROPER ONES
-- ============================================================

-- franchises
DROP POLICY IF EXISTS "select_franchises" ON franchises;
DROP POLICY IF EXISTS "insert_franchises" ON franchises;
DROP POLICY IF EXISTS "update_franchises" ON franchises;
CREATE POLICY "franchises_admin" ON franchises FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "franchises_agency_read" ON franchises FOR SELECT TO authenticated USING (account_id IN (SELECT my_agency_ids()));
CREATE POLICY "franchises_agency_insert" ON franchises FOR INSERT TO authenticated WITH CHECK (account_id IN (SELECT my_agency_ids()));
CREATE POLICY "franchises_agency_update" ON franchises FOR UPDATE TO authenticated USING (account_id IN (SELECT my_agency_ids())) WITH CHECK (account_id IN (SELECT my_agency_ids()));

-- franchise_offices
DROP POLICY IF EXISTS "select_franchise_offices" ON franchise_offices;
DROP POLICY IF EXISTS "insert_franchise_offices" ON franchise_offices;
DROP POLICY IF EXISTS "update_franchise_offices" ON franchise_offices;
CREATE POLICY "franchise_offices_admin" ON franchise_offices FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "franchise_offices_read" ON franchise_offices FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM franchises f WHERE f.id = franchise_offices.franchise_id AND f.account_id IN (SELECT my_agency_ids()))
);

-- regions
DROP POLICY IF EXISTS "select_regions" ON regions;
DROP POLICY IF EXISTS "insert_regions" ON regions;
DROP POLICY IF EXISTS "update_regions" ON regions;
CREATE POLICY "regions_admin" ON regions FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "regions_agency_read" ON regions FOR SELECT TO authenticated USING (account_id IN (SELECT my_agency_ids()));
CREATE POLICY "regions_agency_insert" ON regions FOR INSERT TO authenticated WITH CHECK (account_id IN (SELECT my_agency_ids()));
CREATE POLICY "regions_agency_update" ON regions FOR UPDATE TO authenticated USING (account_id IN (SELECT my_agency_ids())) WITH CHECK (account_id IN (SELECT my_agency_ids()));

-- offices
DROP POLICY IF EXISTS "Allow select on offices" ON offices;
DROP POLICY IF EXISTS "Allow insert on offices" ON offices;
DROP POLICY IF EXISTS "Allow update on offices" ON offices;
CREATE POLICY "offices_admin" ON offices FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "offices_agency_read" ON offices FOR SELECT TO authenticated USING (account_id IN (SELECT my_agency_ids()));
CREATE POLICY "offices_agency_insert" ON offices FOR INSERT TO authenticated WITH CHECK (account_id IN (SELECT my_agency_ids()));
CREATE POLICY "offices_agency_update" ON offices FOR UPDATE TO authenticated USING (account_id IN (SELECT my_agency_ids())) WITH CHECK (account_id IN (SELECT my_agency_ids()));

-- marketplace_transactions
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON marketplace_transactions;
DROP POLICY IF EXISTS "Allow select for anon" ON marketplace_transactions;
CREATE POLICY "marketplace_read" ON marketplace_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "marketplace_write" ON marketplace_transactions FOR INSERT TO authenticated WITH CHECK (is_platform_admin());

-- open_banking_connections
DROP POLICY IF EXISTS "Allow full access to open_banking_connections" ON open_banking_connections;
CREATE POLICY "ob_admin" ON open_banking_connections FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "ob_agency_read" ON open_banking_connections FOR SELECT TO authenticated USING (agency_id IN (SELECT my_agency_ids()));
CREATE POLICY "ob_agency_insert" ON open_banking_connections FOR INSERT TO authenticated WITH CHECK (agency_id IN (SELECT my_agency_ids()));
CREATE POLICY "ob_agency_update" ON open_banking_connections FOR UPDATE TO authenticated USING (agency_id IN (SELECT my_agency_ids())) WITH CHECK (agency_id IN (SELECT my_agency_ids()));

-- open_banking_transactions
DROP POLICY IF EXISTS "Allow full access to open_banking_transactions" ON open_banking_transactions;
CREATE POLICY "ob_txn_admin" ON open_banking_transactions FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "ob_txn_agency_read" ON open_banking_transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM open_banking_connections obc WHERE obc.id = open_banking_transactions.connection_id AND obc.agency_id IN (SELECT my_agency_ids()))
);

-- webhook_endpoints
DROP POLICY IF EXISTS "Allow select on webhook_endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Allow insert on webhook_endpoints" ON webhook_endpoints;
DROP POLICY IF EXISTS "Allow update on webhook_endpoints" ON webhook_endpoints;
CREATE POLICY "webhooks_admin" ON webhook_endpoints FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "webhooks_read_own" ON webhook_endpoints FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid() AND am.agency_id = webhook_endpoints.agency_id)
);

-- workspace_connections
DROP POLICY IF EXISTS "Allow select on workspace_connections" ON workspace_connections;
DROP POLICY IF EXISTS "Allow insert on workspace_connections" ON workspace_connections;
DROP POLICY IF EXISTS "Allow update on workspace_connections" ON workspace_connections;
CREATE POLICY "workspace_admin" ON workspace_connections FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "workspace_read_own" ON workspace_connections FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid() AND am.agency_id = workspace_connections.agency_id)
);

-- workspace_sync_logs
DROP POLICY IF EXISTS "Allow select on workspace_sync_logs" ON workspace_sync_logs;
DROP POLICY IF EXISTS "Allow insert on workspace_sync_logs" ON workspace_sync_logs;
DROP POLICY IF EXISTS "Allow update on workspace_sync_logs" ON workspace_sync_logs;
CREATE POLICY "workspace_sync_admin" ON workspace_sync_logs FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "workspace_sync_read" ON workspace_sync_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM workspace_connections wc WHERE wc.id = workspace_sync_logs.connection_id AND wc.agency_id IN (SELECT my_agency_ids()))
);

-- api_keys — restrict to own agency
DROP POLICY IF EXISTS "Allow select on api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow insert on api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow update on api_keys" ON api_keys;
CREATE POLICY "api_keys_admin" ON api_keys FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "api_keys_read_own" ON api_keys FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid() AND am.agency_id = api_keys.agency_id)
);
CREATE POLICY "api_keys_insert_own" ON api_keys FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid() AND am.agency_id = api_keys.agency_id)
);

-- api_audit_log — scope to agency
DROP POLICY IF EXISTS "Allow select on api_audit_log" ON api_audit_log;
CREATE POLICY "api_audit_admin" ON api_audit_log FOR SELECT TO authenticated USING (is_platform_admin());
CREATE POLICY "api_audit_read_own" ON api_audit_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM api_keys ak WHERE ak.id = api_audit_log.api_key_id AND ak.agency_id IN (SELECT my_agency_ids()))
);

-- property_health_scores — scope to agency
DROP POLICY IF EXISTS "Users can view health scores for their properties" ON property_health_scores;
DROP POLICY IF EXISTS "Users can insert health scores" ON property_health_scores;
DROP POLICY IF EXISTS "Users can update health scores" ON property_health_scores;
CREATE POLICY "phs_admin" ON property_health_scores FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "phs_read" ON property_health_scores FOR SELECT TO authenticated USING (can_manage_property(property_id));
CREATE POLICY "phs_insert" ON property_health_scores FOR INSERT TO authenticated WITH CHECK (can_manage_property(property_id));
CREATE POLICY "phs_update" ON property_health_scores FOR UPDATE TO authenticated USING (can_manage_property(property_id)) WITH CHECK (can_manage_property(property_id));

-- owner_monthly_reports — scope to agency
DROP POLICY IF EXISTS "select_owner_reports" ON owner_monthly_reports;
DROP POLICY IF EXISTS "insert_owner_reports" ON owner_monthly_reports;
DROP POLICY IF EXISTS "update_owner_reports" ON owner_monthly_reports;
DROP POLICY IF EXISTS "delete_owner_reports" ON owner_monthly_reports;
CREATE POLICY "omr_admin" ON owner_monthly_reports FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "omr_read" ON owner_monthly_reports FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = owner_monthly_reports.property_id AND can_manage_property(p.id))
  OR EXISTS (SELECT 1 FROM owner_portal_access opa WHERE opa.landlord_id = owner_monthly_reports.landlord_id AND opa.profile_id = auth.uid())
);

-- contractor_performance — scope read, admin write
DROP POLICY IF EXISTS "Anyone can read contractor_performance" ON contractor_performance;
DROP POLICY IF EXISTS "Authenticated users can insert contractor_performance" ON contractor_performance;
DROP POLICY IF EXISTS "Authenticated users can update contractor_performance" ON contractor_performance;
CREATE POLICY "cp_admin" ON contractor_performance FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "cp_read" ON contractor_performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "cp_insert" ON contractor_performance FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid())
);

-- n8n_agents — scope to agency
DROP POLICY IF EXISTS "Anyone can read n8n_agents" ON n8n_agents;
DROP POLICY IF EXISTS "Authenticated users can update n8n_agents" ON n8n_agents;
CREATE POLICY "n8n_admin" ON n8n_agents FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "n8n_read" ON n8n_agents FOR SELECT TO authenticated USING (
  agency_id IN (SELECT my_agency_ids())
);
CREATE POLICY "n8n_update" ON n8n_agents FOR UPDATE TO authenticated USING (
  agency_id IN (SELECT my_agency_ids())
) WITH CHECK (agency_id IN (SELECT my_agency_ids()));

-- n8n_agent_runs — scope through agent
DROP POLICY IF EXISTS "Anyone can read n8n_agent_runs" ON n8n_agent_runs;
DROP POLICY IF EXISTS "Anyone can insert n8n_agent_runs" ON n8n_agent_runs;
CREATE POLICY "n8n_runs_admin" ON n8n_agent_runs FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "n8n_runs_read" ON n8n_agent_runs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM n8n_agents na WHERE na.id = n8n_agent_runs.agent_id AND na.agency_id IN (SELECT my_agency_ids()))
);

-- import_log — scope to agency/user
DROP POLICY IF EXISTS "import_log_read" ON import_log;
DROP POLICY IF EXISTS "import_log_write" ON import_log;
CREATE POLICY "import_admin" ON import_log FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "import_read_own" ON import_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "import_insert_own" ON import_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- accounting_connections — scope to agency
DROP POLICY IF EXISTS "accounting_connections_admin" ON accounting_connections;
DROP POLICY IF EXISTS "accounting_connections_read" ON accounting_connections;
DROP POLICY IF EXISTS "accounting_connections_write" ON accounting_connections;
CREATE POLICY "acct_conn_admin" ON accounting_connections FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "acct_conn_read" ON accounting_connections FOR SELECT TO authenticated USING (agency_id IN (SELECT my_agency_ids()));
CREATE POLICY "acct_conn_insert" ON accounting_connections FOR INSERT TO authenticated WITH CHECK (agency_id IN (SELECT my_agency_ids()));

-- accounting_sync_logs — scope through connection
DROP POLICY IF EXISTS "accounting_sync_logs_admin" ON accounting_sync_logs;
DROP POLICY IF EXISTS "accounting_sync_logs_read" ON accounting_sync_logs;
CREATE POLICY "acct_sync_admin" ON accounting_sync_logs FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "acct_sync_read" ON accounting_sync_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM accounting_connections ac WHERE ac.id = accounting_sync_logs.connection_id AND ac.agency_id IN (SELECT my_agency_ids()))
);

-- notification_preferences — no policies existed. Add them.
DROP POLICY IF EXISTS "notif_pref_admin" ON notification_preferences;
DROP POLICY IF EXISTS "notif_pref_self" ON notification_preferences;
CREATE POLICY "notif_pref_admin" ON notification_preferences FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "notif_pref_self" ON notification_preferences FOR ALL TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- email_queue — restrict to own agency
DROP POLICY IF EXISTS "email_queue_admin" ON email_queue;
DROP POLICY IF EXISTS "email_queue_agency" ON email_queue;
CREATE POLICY "email_queue_admin" ON email_queue FOR ALL TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());
CREATE POLICY "email_queue_read" ON email_queue FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid() AND am.agency_id = email_queue.agency_id)
);

-- ============================================================
-- SECTION 2: VIEW SECURITY — SET SECURITY_INVOKER
-- ============================================================

-- Critical: v_dashboard_kpi exposes cross-agency data. Must be security_invoker.
ALTER VIEW v_dashboard_kpi SET (security_invoker = true);
ALTER VIEW v_compliance_dashboard SET (security_invoker = true);
ALTER VIEW v_epc_below_c SET (security_invoker = true);
ALTER VIEW v_rent_collection SET (security_invoker = true);
ALTER VIEW v_inspection_schedule SET (security_invoker = true);
ALTER VIEW v_contractor_performance SET (security_invoker = true);
ALTER VIEW v_arrears_summary SET (security_invoker = true);

-- Add RLS to v_dashboard_kpi to prevent anon access to aggregate data
DROP POLICY IF EXISTS "v_dashboard_kpi_select" ON v_dashboard_kpi;
CREATE POLICY "v_dashboard_kpi_select" ON v_dashboard_kpi FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid())
);

-- ============================================================
-- SECTION 3: PORTAL TOKEN SECURITY
-- ============================================================

-- Add attempt tracking columns to portal_invites if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portal_invites' AND column_name = 'attempt_count') THEN
    ALTER TABLE portal_invites ADD COLUMN attempt_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portal_invites' AND column_name = 'accepted_at') THEN
    ALTER TABLE portal_invites ADD COLUMN accepted_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portal_invites' AND column_name = 'revoked_at') THEN
    ALTER TABLE portal_invites ADD COLUMN revoked_at timestamptz;
  END IF;
END $$;

-- Add created_by to portal_access if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portal_access' AND column_name = 'created_by') THEN
    ALTER TABLE portal_access ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;
END $$;

-- ============================================================
-- SECTION 4: MISSING INDEXES
-- ============================================================

-- Properties: agency + status queries
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_agency') THEN
  CREATE INDEX idx_properties_agency ON properties(managing_agency_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_region') THEN
  CREATE INDEX idx_properties_region ON properties(region);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_branch') THEN
  CREATE INDEX idx_properties_branch ON properties(branch);
END IF; END $$;

-- Tenancies: dates + status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenancies_start_date') THEN
  CREATE INDEX idx_tenancies_start_date ON tenancies(start_date);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenancies_end_date') THEN
  CREATE INDEX idx_tenancies_end_date ON tenancies(end_date);
END IF; END $$;

-- Maintenance: status + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_maintenance_status') THEN
  CREATE INDEX idx_maintenance_status ON maintenance_jobs(status);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_maintenance_created') THEN
  CREATE INDEX idx_maintenance_created ON maintenance_jobs(created_at);
END IF; END $$;

-- Rent payments: dates + status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rent_payments_status') THEN
  CREATE INDEX idx_rent_payments_status ON rent_payments(status);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rent_payments_due_date') THEN
  CREATE INDEX idx_rent_payments_due_date ON rent_payments(due_date);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rent_payments_property') THEN
  CREATE INDEX idx_rent_payments_property ON rent_payments(property_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rent_payments_tenancy') THEN
  CREATE INDEX idx_rent_payments_tenancy ON rent_payments(tenancy_id);
END IF; END $$;

-- Arrears: status + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_arrears_status') THEN
  CREATE INDEX idx_arrears_status ON arrears_cases(status);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_arrears_property') THEN
  CREATE INDEX idx_arrears_property ON arrears_cases(property_id);
END IF; END $$;

-- Inspections: dates + status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inspections_status') THEN
  CREATE INDEX idx_inspections_status ON inspections(status);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inspections_scheduled') THEN
  CREATE INDEX idx_inspections_scheduled ON inspections(scheduled_date);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inspections_property') THEN
  CREATE INDEX idx_inspections_property ON inspections(property_id);
END IF; END $$;

-- Documents: dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documents_created') THEN
  CREATE INDEX idx_documents_created ON documents(created_at);
END IF; END $$;

-- Signatures: status + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_signatures_status') THEN
  CREATE INDEX idx_signatures_status ON signatures(status);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_signatures_signed_by') THEN
  CREATE INDEX idx_signatures_signed_by ON signatures(signed_by);
END IF; END $$;

-- Messages: recipients + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_recipient') THEN
  CREATE INDEX idx_messages_recipient ON messages(recipient_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_sender') THEN
  CREATE INDEX idx_messages_sender ON messages(sender_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_created') THEN
  CREATE INDEX idx_messages_created ON messages(created_at);
END IF; END $$;

-- Notifications: profile + read status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_profile') THEN
  CREATE INDEX idx_notifications_profile ON notifications(profile_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_read') THEN
  CREATE INDEX idx_notifications_read ON notifications(profile_id, is_read);
END IF; END $$;

-- Portal access: property + status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_portal_access_property') THEN
  CREATE INDEX idx_portal_access_property ON portal_access(property_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_portal_access_status') THEN
  CREATE INDEX idx_portal_access_status ON portal_access(status);
END IF; END $$;

-- Tenant portal access
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenant_portal_tenant') THEN
  CREATE INDEX idx_tenant_portal_tenant ON tenant_portal_access(tenant_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenant_portal_profile') THEN
  CREATE INDEX idx_tenant_portal_profile ON tenant_portal_access(profile_id);
END IF; END $$;

-- Owner portal access
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_owner_portal_landlord') THEN
  CREATE INDEX idx_owner_portal_landlord ON owner_portal_access(landlord_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_owner_portal_profile') THEN
  CREATE INDEX idx_owner_portal_profile ON owner_portal_access(profile_id);
END IF; END $$;

-- Contractor jobs: dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractor_jobs_maint') THEN
  CREATE INDEX idx_contractor_jobs_maint ON contractor_jobs(maintenance_job_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractor_jobs_status') THEN
  CREATE INDEX idx_contractor_jobs_status ON contractor_jobs(status);
END IF; END $$;

-- Quotes: dates + job
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quotes_maint_job') THEN
  CREATE INDEX idx_quotes_maint_job ON quotes(maintenance_job_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quotes_status') THEN
  CREATE INDEX idx_quotes_status ON quotes(status);
END IF; END $$;

-- Compliance items: dates + status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pci_status') THEN
  CREATE INDEX idx_pci_status ON property_compliance_items(status);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pci_next_due') THEN
  CREATE INDEX idx_pci_next_due ON property_compliance_items(next_due);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pci_property') THEN
  CREATE INDEX idx_pci_property ON property_compliance_items(property_id);
END IF; END $$;

-- Billing events: agency + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_billing_agency') THEN
  CREATE INDEX idx_billing_agency ON billing_events(agency_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_billing_profile') THEN
  CREATE INDEX idx_billing_profile ON billing_events(profile_id);
END IF; END $$;

-- Agency members: profile lookup
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agency_members_profile') THEN
  CREATE INDEX idx_agency_members_profile ON agency_members(profile_id);
END IF; END $$;

-- Landlords: agency scope
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_landlords_agency') THEN
  CREATE INDEX idx_landlords_agency ON landlords(managing_agency_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_landlords_owner') THEN
  CREATE INDEX idx_landlords_owner ON landlords(owner_profile_id);
END IF; END $$;

-- Tenants: profile lookup
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenants_profile') THEN
  CREATE INDEX idx_tenants_profile ON tenants(profile_id);
END IF; END $$;

-- Profiles: role lookup
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
  CREATE INDEX idx_profiles_role ON profiles(role);
END IF; END $$;

-- Stripe events: unique + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_stripe_events_event_id') THEN
  CREATE UNIQUE INDEX idx_stripe_events_event_id ON processed_stripe_events(stripe_event_id);
END IF; END $$;

-- Platform audit: actor + dates
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_actor') THEN
  CREATE INDEX idx_audit_actor ON platform_audit_log(actor_profile_id);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_created') THEN
  CREATE INDEX idx_audit_created ON platform_audit_log(created_at);
END IF; END $$;

-- api_keys: agency scope
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_api_keys_agency') THEN
  CREATE INDEX idx_api_keys_agency ON api_keys(agency_id);
END IF; END $$;

-- tenancy_parties: tenancy lookup
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tenancy_parties_tenant') THEN
  CREATE INDEX idx_tenancy_parties_tenant ON tenancy_parties(tenant_id);
END IF; END $$;

-- ============================================================
-- SECTION 5: ADD AGENCY_ID TO TABLES THAT NEED IT
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'agency_id') THEN
    ALTER TABLE api_keys ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_endpoints' AND column_name = 'agency_id') THEN
    ALTER TABLE webhook_endpoints ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspace_connections' AND column_name = 'agency_id') THEN
    ALTER TABLE workspace_connections ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'open_banking_connections' AND column_name = 'agency_id') THEN
    ALTER TABLE open_banking_connections ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'n8n_agents' AND column_name = 'agency_id') THEN
    ALTER TABLE n8n_agents ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_queue' AND column_name = 'agency_id') THEN
    ALTER TABLE email_queue ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'accounting_connections' AND column_name = 'agency_id') THEN
    ALTER TABLE accounting_connections ADD COLUMN agency_id uuid REFERENCES agencies(id);
  END IF;
END $$;

-- ============================================================
-- SECTION 6: DATA INTEGRITY CONSTRAINTS
-- ============================================================

-- Ensure rent_payments.amount is non-negative
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_rent_payment_amount') THEN
    ALTER TABLE rent_payments ADD CONSTRAINT chk_rent_payment_amount CHECK (amount >= 0);
  END IF;
END $$;

-- Ensure processed_stripe_events has unique stripe_event_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_processed_stripe_event') THEN
    ALTER TABLE processed_stripe_events ADD CONSTRAINT uq_processed_stripe_event UNIQUE (stripe_event_id);
  END IF;
END $$;

-- Ensure subscription_plans.slug is unique
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_subscription_plan_slug') THEN
    ALTER TABLE subscription_plans ADD CONSTRAINT uq_subscription_plan_slug UNIQUE (slug);
  END IF;
END $$;

-- ============================================================
-- SECTION 7: STORAGE BUCKETS — already created via SQL, verify with:
-- SELECT name, public, file_size_limit FROM storage.buckets ORDER BY name;
-- ============================================================

-- ============================================================
-- SECTION 8: STORAGE RLS POLICIES
-- Run this entire section in Supabase Dashboard > SQL Editor
-- (requires storage.objects ownership, which the Dashboard SQL Editor has)
-- ============================================================

-- Drop any pre-existing storage policies to avoid conflicts
DO $$ DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- ============================================================
-- BRANDING BUCKET (public read, admin write)
-- ============================================================

CREATE POLICY "branding_select_public" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'branding');

CREATE POLICY "branding_select_auth" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'branding');

CREATE POLICY "branding_insert_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND is_platform_admin());

CREATE POLICY "branding_update_admin" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND is_platform_admin())
  WITH CHECK (bucket_id = 'branding' AND is_platform_admin());

CREATE POLICY "branding_delete_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND is_platform_admin());

CREATE POLICY "branding_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND EXISTS (
    SELECT 1 FROM agency_members am WHERE am.profile_id = auth.uid()
  ));

-- ============================================================
-- PROPERTY-IMAGES BUCKET (agency-scoped)
-- ============================================================

CREATE POLICY "propimg_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'property-images' AND is_platform_admin());

CREATE POLICY "propimg_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'property-images' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "propimg_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "propimg_update_agency" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ))
  WITH CHECK (bucket_id = 'property-images' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "propimg_delete_agency" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

-- ============================================================
-- DOCUMENTS BUCKET (agency-scoped + portal access)
-- ============================================================

CREATE POLICY "docs_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND is_platform_admin());

CREATE POLICY "docs_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "docs_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "docs_update_agency" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ))
  WITH CHECK (bucket_id = 'documents' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "docs_delete_agency" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

-- Tenant portal: can read their tenancy documents
CREATE POLICY "docs_select_tenant" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM tenant_portal_access tpa
    JOIN tenancies t ON t.id = tpa.tenancy_id
    WHERE tpa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = t.managing_agency_id::text
  ));

-- Owner portal: can read their property documents
CREATE POLICY "docs_select_owner" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND EXISTS (
    SELECT 1 FROM owner_portal_access opa
    JOIN properties p ON p.id = opa.property_id
    WHERE opa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = p.managing_agency_id::text
  ));

-- ============================================================
-- COMPLIANCE BUCKET (agency-scoped + portal read)
-- ============================================================

CREATE POLICY "comp_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'compliance' AND is_platform_admin());

CREATE POLICY "comp_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'compliance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "comp_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'compliance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "comp_update_agency" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'compliance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ))
  WITH CHECK (bucket_id = 'compliance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "comp_delete_agency" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'compliance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

-- Owner portal: can read their property compliance docs
CREATE POLICY "comp_select_owner" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'compliance' AND EXISTS (
    SELECT 1 FROM owner_portal_access opa
    JOIN properties p ON p.id = opa.property_id
    WHERE opa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = p.managing_agency_id::text
  ));

-- ============================================================
-- INSPECTIONS BUCKET (agency-scoped + portal read)
-- ============================================================

CREATE POLICY "insp_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'inspections' AND is_platform_admin());

CREATE POLICY "insp_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'inspections' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "insp_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'inspections' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "insp_update_agency" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'inspections' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ))
  WITH CHECK (bucket_id = 'inspections' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "insp_delete_agency" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'inspections' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "insp_select_tenant" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'inspections' AND EXISTS (
    SELECT 1 FROM tenant_portal_access tpa
    JOIN tenancies t ON t.id = tpa.tenancy_id
    WHERE tpa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = t.managing_agency_id::text
  ));

CREATE POLICY "insp_select_owner" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'inspections' AND EXISTS (
    SELECT 1 FROM owner_portal_access opa
    JOIN properties p ON p.id = opa.property_id
    WHERE opa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = p.managing_agency_id::text
  ));

-- ============================================================
-- MAINTENANCE BUCKET (agency-scoped + portal + contractor access)
-- ============================================================

CREATE POLICY "maint_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'maintenance' AND is_platform_admin());

CREATE POLICY "maint_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'maintenance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "maint_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'maintenance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "maint_update_agency" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'maintenance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ))
  WITH CHECK (bucket_id = 'maintenance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "maint_delete_agency" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'maintenance' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "maint_select_tenant" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'maintenance' AND EXISTS (
    SELECT 1 FROM tenant_portal_access tpa
    JOIN tenancies t ON t.id = tpa.tenancy_id
    WHERE tpa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = t.managing_agency_id::text
  ));

CREATE POLICY "maint_select_owner" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'maintenance' AND EXISTS (
    SELECT 1 FROM owner_portal_access opa
    JOIN properties p ON p.id = opa.property_id
    WHERE opa.profile_id = auth.uid()
    AND split_part(name, '/', 1) = p.managing_agency_id::text
  ));

CREATE POLICY "maint_select_contractor" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'maintenance' AND EXISTS (
    SELECT 1 FROM contractor_jobs cj
    JOIN contractor_profiles cp ON cp.id = cj.contractor_id
    WHERE cp.profile_id = auth.uid()
    AND split_part(name, '/', 1) = (
      SELECT p.managing_agency_id::text FROM maintenance_jobs mj
      JOIN properties p ON p.id = mj.property_id
      WHERE mj.id = cj.maintenance_job_id
    )
  ));

-- ============================================================
-- CONTRACTOR-FILES BUCKET (agency + contractor access)
-- ============================================================

CREATE POLICY "cf_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'contractor-files' AND is_platform_admin());

CREATE POLICY "cf_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'contractor-files' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "cf_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contractor-files' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "cf_update_agency" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'contractor-files' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ))
  WITH CHECK (bucket_id = 'contractor-files' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "cf_delete_agency" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'contractor-files' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "cf_select_contractor" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'contractor-files' AND EXISTS (
    SELECT 1 FROM contractor_profiles cp WHERE cp.profile_id = auth.uid()
  ));

CREATE POLICY "cf_insert_contractor" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contractor-files' AND EXISTS (
    SELECT 1 FROM contractor_profiles cp WHERE cp.profile_id = auth.uid()
  ));

-- ============================================================
-- MESSAGE-ATTACHMENTS BUCKET (agency + sender/recipient access)
-- ============================================================

CREATE POLICY "msg_attach_select_platform" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'message-attachments' AND is_platform_admin());

CREATE POLICY "msg_attach_select_agency" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'message-attachments' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "msg_attach_insert_agency" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments' AND split_part(name, '/', 1) = ANY (
    SELECT id::text FROM agencies WHERE id IN (SELECT my_agency_ids())
  ));

CREATE POLICY "msg_attach_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'message-attachments' AND owner = auth.uid());

CREATE POLICY "msg_attach_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-attachments' AND owner = auth.uid());

CREATE POLICY "msg_attach_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'message-attachments' AND owner = auth.uid());

-- ============================================================
-- SECTION 9: REALTIME (already configured, no changes needed)
-- ============================================================
-- 17 operational tables already in supabase_realtime publication.
-- messages table is NOT in the main publication (only in dated partitions).
-- If live messaging is needed, add messages table to publication:
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- SECTION 10: NEW-USER PROFILE HANDLER (idempotent trigger function)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, account_type, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'tenant',
    'agency',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SECTION 11: SUBSCRIPTION STATUS HELPER (already exists, verify)
-- ============================================================

-- is_account_read_only() already exists — used by restrictive RLS policies
-- is_subscription_active_or_trialing() already exists — used by entitlement checks
-- can_create_property() already exists — enforces plan limits

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================