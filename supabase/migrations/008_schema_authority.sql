-- LetHub Batch 0B: Database Schema Authority
-- Applied to production on 2026-07-28 as Supabase migration
-- 20260728214449_batch_0b_schema_authority.
--
-- Purpose:
--   * establish a private, service-role-only schema authority ledger;
--   * generate a deterministic fingerprint for the public schema;
--   * make future dashboard-only schema drift detectable;
--   * record the production baseline without exposing it through the Data API.

BEGIN;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;

CREATE TABLE IF NOT EXISTS app_private.schema_authority (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  release_tag text NOT NULL UNIQUE,
  schema_sha256 text NOT NULL CHECK (schema_sha256 ~ '^[0-9a-f]{64}$'),
  table_count integer NOT NULL,
  rls_table_count integer NOT NULL,
  view_count integer NOT NULL,
  function_count integer NOT NULL,
  policy_count integer NOT NULL,
  trigger_count integer NOT NULL,
  index_count integer NOT NULL,
  enum_count integer NOT NULL,
  migration_versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

REVOKE ALL ON TABLE app_private.schema_authority FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE app_private.schema_authority_id_seq FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE app_private.schema_authority TO service_role;
GRANT USAGE, SELECT ON SEQUENCE app_private.schema_authority_id_seq TO service_role;

CREATE OR REPLACE FUNCTION app_private.compute_public_schema_authority()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = pg_catalog, public, extensions
AS $$
WITH object_counts AS (
  SELECT
    (SELECT count(*)::integer
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r') AS table_count,
    (SELECT count(*)::integer
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm')) AS view_count,
    (SELECT count(*)::integer
       FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public') AS function_count,
    (SELECT count(*)::integer FROM pg_policies WHERE schemaname = 'public') AS policy_count,
    (SELECT count(*)::integer
       FROM pg_trigger t
       JOIN pg_class c ON c.oid = t.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND NOT t.tgisinternal) AS trigger_count,
    (SELECT count(*)::integer FROM pg_indexes WHERE schemaname = 'public') AS index_count,
    (SELECT count(*)::integer
       FROM pg_type t
       JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typtype = 'e') AS enum_count,
    (SELECT count(*)::integer
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relrowsecurity) AS rls_table_count
), signature_parts AS (
  SELECT 'table|' || c.oid::regclass::text || '|' || c.relrowsecurity::text || '|' || c.relforcerowsecurity::text AS part
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm')
  UNION ALL
  SELECT 'column|' || table_schema || '.' || table_name || '|' || ordinal_position || '|' || column_name || '|' || data_type || '|' || coalesce(udt_name, '') || '|' || is_nullable || '|' || coalesce(column_default, '')
    FROM information_schema.columns
   WHERE table_schema = 'public'
  UNION ALL
  SELECT 'policy|' || schemaname || '.' || tablename || '|' || policyname || '|' || permissive || '|' || roles::text || '|' || cmd || '|' || coalesce(qual, '') || '|' || coalesce(with_check, '')
    FROM pg_policies
   WHERE schemaname = 'public'
  UNION ALL
  SELECT 'function|' || p.oid::regprocedure::text || '|' || p.prosecdef::text || '|' || pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
  UNION ALL
  SELECT 'index|' || schemaname || '.' || indexname || '|' || indexdef
    FROM pg_indexes
   WHERE schemaname = 'public'
  UNION ALL
  SELECT 'trigger|' || c.oid::regclass::text || '|' || t.tgname || '|' || pg_get_triggerdef(t.oid, true)
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND NOT t.tgisinternal
), fingerprint AS (
  SELECT encode(
    extensions.digest(string_agg(part, E'\n' ORDER BY part), 'sha256'),
    'hex'
  ) AS schema_sha256
  FROM signature_parts
)
SELECT jsonb_build_object(
  'schema_sha256', fingerprint.schema_sha256,
  'table_count', object_counts.table_count,
  'rls_table_count', object_counts.rls_table_count,
  'view_count', object_counts.view_count,
  'function_count', object_counts.function_count,
  'policy_count', object_counts.policy_count,
  'trigger_count', object_counts.trigger_count,
  'index_count', object_counts.index_count,
  'enum_count', object_counts.enum_count
)
FROM object_counts, fingerprint;
$$;

REVOKE ALL ON FUNCTION app_private.compute_public_schema_authority()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.compute_public_schema_authority()
  TO service_role;

WITH authority AS (
  SELECT app_private.compute_public_schema_authority() AS value
), migrations AS (
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object('version', version::text, 'name', name::text)
      ORDER BY version
    ),
    '[]'::jsonb
  ) AS value
  FROM supabase_migrations.schema_migrations
)
INSERT INTO app_private.schema_authority (
  release_tag,
  schema_sha256,
  table_count,
  rls_table_count,
  view_count,
  function_count,
  policy_count,
  trigger_count,
  index_count,
  enum_count,
  migration_versions,
  notes
)
SELECT
  'batch-0b-2026-07-28',
  authority.value ->> 'schema_sha256',
  (authority.value ->> 'table_count')::integer,
  (authority.value ->> 'rls_table_count')::integer,
  (authority.value ->> 'view_count')::integer,
  (authority.value ->> 'function_count')::integer,
  (authority.value ->> 'policy_count')::integer,
  (authority.value ->> 'trigger_count')::integer,
  (authority.value ->> 'index_count')::integer,
  (authority.value ->> 'enum_count')::integer,
  migrations.value,
  'Production schema authority established after Batch 0A containment. Future schema changes must be delivered through tracked migrations.'
FROM authority, migrations
ON CONFLICT (release_tag) DO NOTHING;

COMMIT;
