-- LetHub Migration 014: Maintenance Job Detail Columns
-- Forward-only migration. Verify the live migration ledger before applying
-- (see supabase/SCHEMA_AUTHORITY.md). Next migration after this must be 015.
--
-- Purpose:
--   * add the operational detail columns the maintenance workflow screens need
--     on public.maintenance_jobs (priority, category, reporter, target date,
--     access notes, estimated cost, updated_at).
--   * preserve the existing `open` and `scheduled` job statuses used by the
--     application while constraining the accepted status set.
--
-- RLS policies on public.maintenance_jobs are intentionally left unchanged.

BEGIN;

ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';
ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS reported_by text;
ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS target_date date;
ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS access_notes text;
ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS estimated_cost numeric(10,2);
ALTER TABLE public.maintenance_jobs ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.maintenance_jobs
SET priority = 'normal'
WHERE priority IS NULL OR priority NOT IN ('low', 'normal', 'high', 'critical', 'emergency');

ALTER TABLE public.maintenance_jobs DROP CONSTRAINT IF EXISTS maintenance_jobs_priority_check;
ALTER TABLE public.maintenance_jobs
  ADD CONSTRAINT maintenance_jobs_priority_check
  CHECK (priority IN ('low', 'normal', 'high', 'critical', 'emergency'));

UPDATE public.maintenance_jobs
SET status = 'reported'
WHERE status IS NULL OR status NOT IN (
  'open',
  'scheduled',
  'reported',
  'triage',
  'awaiting_approval',
  'finding_contractor',
  'quote_requested',
  'quote_received',
  'appointment_scheduled',
  'in_progress',
  'awaiting_confirmation',
  'completed',
  'closed',
  'cancelled'
);

ALTER TABLE public.maintenance_jobs DROP CONSTRAINT IF EXISTS maintenance_jobs_status_check;
ALTER TABLE public.maintenance_jobs
  ADD CONSTRAINT maintenance_jobs_status_check
  CHECK (status IN (
    'open',
    'scheduled',
    'reported',
    'triage',
    'awaiting_approval',
    'finding_contractor',
    'quote_requested',
    'quote_received',
    'appointment_scheduled',
    'in_progress',
    'awaiting_confirmation',
    'completed',
    'closed',
    'cancelled'
  ));

COMMENT ON COLUMN public.maintenance_jobs.priority IS
  'Triage priority: low, normal, high, critical or emergency.';
COMMENT ON COLUMN public.maintenance_jobs.category IS
  'Repair category used for routing and reporting.';
COMMENT ON COLUMN public.maintenance_jobs.reported_by IS
  'Free-text name or role of the person who reported the issue.';
COMMENT ON COLUMN public.maintenance_jobs.target_date IS
  'Target completion date for the job.';
COMMENT ON COLUMN public.maintenance_jobs.access_notes IS
  'Access instructions for the attending contractor.';
COMMENT ON COLUMN public.maintenance_jobs.estimated_cost IS
  'Estimated cost in GBP.';
COMMENT ON COLUMN public.maintenance_jobs.updated_at IS
  'Last time the job record was updated.';

COMMIT;