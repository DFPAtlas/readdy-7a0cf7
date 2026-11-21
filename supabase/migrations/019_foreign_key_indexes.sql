-- 019: indexes for foreign keys used by RLS checks, joins and the Stripe
-- webhook, plus removal of two duplicate indexes.
--
-- Non-destructive: only CREATE INDEX IF NOT EXISTS and DROP INDEX IF EXISTS on
-- redundant copies. No data changes. Tables are small today, so plain
-- CREATE INDEX (brief lock) is fine; on large tables use CONCURRENTLY outside
-- a transaction instead.

CREATE INDEX IF NOT EXISTS arrears_cases_tenancy_id_idx ON public.arrears_cases (tenancy_id);
CREATE INDEX IF NOT EXISTS arrears_cases_tenant_id_idx ON public.arrears_cases (tenant_id);
CREATE INDEX IF NOT EXISTS documents_tenancy_id_idx ON public.documents (tenancy_id);
CREATE INDEX IF NOT EXISTS documents_served_to_idx ON public.documents (served_to);
CREATE INDEX IF NOT EXISTS inspections_tenancy_id_idx ON public.inspections (tenancy_id);
CREATE INDEX IF NOT EXISTS inspections_created_by_idx ON public.inspections (created_by);
CREATE INDEX IF NOT EXISTS maintenance_jobs_tenancy_id_idx ON public.maintenance_jobs (tenancy_id);
CREATE INDEX IF NOT EXISTS messages_property_id_idx ON public.messages (property_id);
CREATE INDEX IF NOT EXISTS messages_parent_message_id_idx ON public.messages (parent_message_id);
CREATE INDEX IF NOT EXISTS portal_access_created_by_idx ON public.portal_access (created_by);
CREATE INDEX IF NOT EXISTS portal_invites_portal_access_id_idx ON public.portal_invites (portal_access_id);
CREATE INDEX IF NOT EXISTS properties_office_id_idx ON public.properties (office_id);
CREATE INDEX IF NOT EXISTS property_compliance_items_document_id_idx ON public.property_compliance_items (document_id);
CREATE INDEX IF NOT EXISTS property_compliance_items_obligation_code_idx ON public.property_compliance_items (obligation_code);
CREATE INDEX IF NOT EXISTS rent_payments_tenant_id_idx ON public.rent_payments (tenant_id);
CREATE INDEX IF NOT EXISTS tenants_created_by_profile_id_idx ON public.tenants (created_by_profile_id);

-- Lookups made by the stripe-webhook function.
CREATE INDEX IF NOT EXISTS account_subscriptions_stripe_customer_id_idx ON public.account_subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS account_subscriptions_stripe_subscription_id_idx ON public.account_subscriptions (stripe_subscription_id);

-- processed_stripe_events.stripe_event_id already has the unique constraint
-- processed_stripe_events_stripe_event_id_key; these two are duplicates.
DROP INDEX IF EXISTS public.idx_processed_stripe_events_event_id;
DROP INDEX IF EXISTS public.idx_stripe_events_event_id;
