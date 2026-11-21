-- 024: database tidy-up from the second audit.
--
-- 1. Missing/duplicate indexes on quotes and compliance items.
-- 2. Three read policies that were wider than intended:
--    - email_queue: any member of any agency could read every agency's
--      queued emails. Now: own agency only (or platform admin).
--    - import_log: anyone, signed in or not, could read import logs (which
--      can hold rows from other agencies' imports). Now: own imports only.
--    - offices: every signed-in user could read every agency's offices.
--      Now: own agency only.
-- 3. Policies that called auth.uid() once per row now call it once per query
--    by wrapping it in a sub-select. This changes performance only, never
--    who can see what.
--
-- Non-destructive: no data changes. Policy rewrites keep each expression
-- identical apart from the auth.uid() wrapping.

CREATE INDEX IF NOT EXISTS quote_items_quote_id_idx ON public.quote_items (quote_id);
CREATE INDEX IF NOT EXISTS quotes_contractor_id_idx ON public.quotes (contractor_id);
-- idx_pci_due and idx_pci_next_due are identical; keep one.
DROP INDEX IF EXISTS public.idx_pci_due;

DROP POLICY IF EXISTS agency_admin_email_queue ON public.email_queue;
CREATE POLICY agency_admin_email_queue ON public.email_queue
  FOR SELECT TO authenticated
  USING (agency_id IN (SELECT public.my_agency_ids()));

DROP POLICY IF EXISTS import_log_read ON public.import_log;
CREATE POLICY import_log_read ON public.import_log
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_platform_admin());

DROP POLICY IF EXISTS offices_read ON public.offices;
CREATE POLICY offices_read ON public.offices
  FOR SELECT TO authenticated
  USING (public.is_platform_admin() OR account_id IN (SELECT public.my_agency_ids()));

DO $$
DECLARE
  target record;
  pol record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR target IN SELECT * FROM (VALUES
    ('account_subscriptions', 'Users can read own subscriptions'),
    ('admin_tasks', 'tasks_read_own'),
    ('agency_invites', 'agency_invites_admin_read'),
    ('agency_members', 'agency_members_self_read'),
    ('anti_discrimination_checks', 'Agency members can see their checks'),
    ('billing_events', 'be_self_read'),
    ('compliance_documents', 'Users can delete agency compliance_documents'),
    ('compliance_documents', 'Users can insert agency compliance_documents'),
    ('compliance_documents', 'Users can update agency compliance_documents'),
    ('compliance_documents', 'Users can view agency compliance_documents'),
    ('contractor_jobs', 'cj_contractor_read'),
    ('contractor_performance', 'cp_perf_self_read'),
    ('contractor_profiles', 'cp_self_read'),
    ('contractor_profiles', 'cp_self_update'),
    ('documents', 'documents_read'),
    ('email_queue', 'agency_admin_email_queue'),
    ('enterprise_offices', 'Agency admins can insert offices'),
    ('enterprise_offices', 'Agency admins can update offices'),
    ('enterprise_offices', 'Agency members can view their offices'),
    ('enterprise_offices', 'Platform admins can manage all offices'),
    ('enterprise_permission_audit', 'ep_audit_self'),
    ('enterprise_staff', 'Agency admins can insert staff'),
    ('enterprise_staff', 'Agency admins can update staff'),
    ('enterprise_staff', 'Agency members can view staff'),
    ('enterprise_staff', 'Platform admins can manage all staff'),
    ('enterprise_user_roles', 'ep_user_roles_self'),
    ('feature_usage', 'Users can read own feature usage'),
    ('landlords', 'landlords_read'),
    ('landlords', 'landlords_write'),
    ('maintenance_jobs', 'jobs_contractor_update'),
    ('maintenance_jobs', 'jobs_read'),
    ('marketplace_transactions', 'mt_contractor_read'),
    ('messages', 'msg_insert'),
    ('messages', 'msg_read'),
    ('messages', 'msg_update_own'),
    ('messages', 'restrict_messages_insert_readonly'),
    ('notification_preferences', 'notif_pref_self'),
    ('notifications', 'notif_own'),
    ('platform_audit_log', 'audit_self_read'),
    ('portal_audit_log', 'agency_admin_audit'),
    ('profiles', 'own profile read'),
    ('profiles', 'profiles_self_read'),
    ('prs_registrations', 'prs_rw'),
    ('quote_items', 'qi_read'),
    ('quotes', 'q_contractor'),
    ('signatures', 'sig_read'),
    ('signatures', 'sig_sign'),
    ('signatures', 'sig_write'),
    ('tenant_complaints', 'Agency members can see their complaints'),
    ('tenants', 'tenants_read'),
    ('tenants', 'tenants_self_update'),
    ('user_security_events', 'Users insert own security events'),
    ('user_security_events', 'Users read own security events')
  ) AS t(tbl, pname)
  LOOP
    SELECT qual, with_check INTO pol
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = target.tbl AND policyname = target.pname;
    IF NOT FOUND THEN
      CONTINUE;
    END IF;
    new_qual := regexp_replace(pol.qual, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    new_check := regexp_replace(pol.with_check, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g');
    stmt := format('ALTER POLICY %I ON public.%I', target.pname, target.tbl);
    IF pol.qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', new_qual);
    END IF;
    IF pol.with_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', new_check);
    END IF;
    EXECUTE stmt;
  END LOOP;
END $$;
