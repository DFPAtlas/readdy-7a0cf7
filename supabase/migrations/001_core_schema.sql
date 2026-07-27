-- Phase 4: Core Schema Migrations
-- Created: 2026-06-27

-- Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper: Auto-updating updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- processed_stripe_events (idempotency)
-- Already created via SQL tool

-- Seed subscription plans (safe upsert)
INSERT INTO subscription_plans (slug, name, monthly_price, annual_price, trial_days, max_properties, max_team_members, storage_gb, has_basic_compliance, has_full_compliance, has_ai_assistant, has_quote_workflow, has_contractor_panel, has_white_label_portal, has_api_access, has_bulk_operations, has_financial_tracking, has_advanced_analytics, has_priority_support, is_enterprise, is_active)
VALUES
  ('starter', 'Starter', 29, 24, 14, 5, 2, 5, true, false, false, false, false, false, false, false, false, false, false, false, true),
  ('professional', 'Professional', 79, 66, 14, 25, 5, 50, true, true, true, true, true, false, false, false, true, false, true, false, true),
  ('business', 'Business', 199, 166, 14, 100, 15, 200, true, true, true, true, true, true, true, true, true, true, true, false, true),
  ('enterprise', 'Enterprise', null, null, 14, null, null, null, true, true, true, true, true, true, true, true, true, true, true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  trial_days = EXCLUDED.trial_days,
  max_properties = EXCLUDED.max_properties,
  max_team_members = EXCLUDED.max_team_members,
  storage_gb = EXCLUDED.storage_gb,
  has_basic_compliance = EXCLUDED.has_basic_compliance,
  has_full_compliance = EXCLUDED.has_full_compliance,
  has_ai_assistant = EXCLUDED.has_ai_assistant,
  has_quote_workflow = EXCLUDED.has_quote_workflow,
  has_contractor_panel = EXCLUDED.has_contractor_panel,
  has_white_label_portal = EXCLUDED.has_white_label_portal,
  has_api_access = EXCLUDED.has_api_access,
  has_bulk_operations = EXCLUDED.has_bulk_operations,
  has_financial_tracking = EXCLUDED.has_financial_tracking,
  has_advanced_analytics = EXCLUDED.has_advanced_analytics,
  has_priority_support = EXCLUDED.has_priority_support,
  is_enterprise = EXCLUDED.is_enterprise,
  updated_at = now();

-- Add updated_at triggers to key tables (if column exists and trigger not already present)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('profiles','properties','tenants','landlords','tenancies','maintenance_jobs','quotes','quote_items',
      'rent_payments','account_subscriptions','documents','signatures','api_keys','n8n_agents','portal_access',
      'notifications','platform_audit_log','contractor_profiles','contractor_jobs','inspections','messages','arrears_cases')
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'updated_at') THEN
      EXECUTE format('
        DO $inner$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = ''trg_%s_updated_at'') THEN
            CREATE TRIGGER trg_%s_updated_at
              BEFORE UPDATE ON %I
              FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
          END IF;
        END;
        $inner$;
      ', tbl, tbl, tbl);
    END IF;
  END LOOP;
END;
$$;