-- Run with a trusted database role after applying migrations.
-- The test fails when production has drifted from the Batch 0B baseline.

DO $$
DECLARE
  expected_sha constant text := '7ab444ffe62ddba5d673adfe701b065610f27f7445c202a7250d098730b38d2b';
  current_authority jsonb;
  latest_record app_private.schema_authority%ROWTYPE;
BEGIN
  SELECT app_private.compute_public_schema_authority()
    INTO current_authority;

  SELECT *
    INTO latest_record
    FROM app_private.schema_authority
   ORDER BY recorded_at DESC
   LIMIT 1;

  IF latest_record.id IS NULL THEN
    RAISE EXCEPTION 'Schema authority has not been recorded';
  END IF;

  IF (current_authority ->> 'table_count')::integer <> 83 THEN
    RAISE EXCEPTION 'Expected 83 public tables, found %', current_authority ->> 'table_count';
  END IF;

  IF (current_authority ->> 'rls_table_count')::integer
     <> (current_authority ->> 'table_count')::integer THEN
    RAISE EXCEPTION 'Not every public table has RLS enabled: %', current_authority;
  END IF;

  IF latest_record.release_tag = 'batch-0b-2026-07-28'
     AND latest_record.schema_sha256 <> expected_sha THEN
    RAISE EXCEPTION 'Recorded Batch 0B fingerprint does not match repository baseline';
  END IF;

  IF current_authority ->> 'schema_sha256' <> latest_record.schema_sha256 THEN
    RAISE EXCEPTION
      'Database schema drift detected. Current %, recorded %',
      current_authority ->> 'schema_sha256',
      latest_record.schema_sha256;
  END IF;
END
$$;
