# LetHub Database Authority

## Authoritative baseline

The live Supabase project `gejxrnreuafnyzwrchvy` is the authoritative database state for LetHub as of Batch 0B on 28 July 2026.

Production fingerprint:

```text
release: batch-0b-2026-07-28
sha256: 7ab444ffe62ddba5d673adfe701b065610f27f7445c202a7250d098730b38d2b
public tables: 83
RLS-enabled public tables: 83
views: 7
public functions: 31
policies: 237
indexes: 162
enums: 18
non-internal public triggers: 0
```

The fingerprint covers public relations, columns, RLS state, policies, public function definitions, indexes and non-internal triggers. The authority ledger is stored in `app_private.schema_authority` and is accessible only through trusted service-role operations.

## Migration reconciliation

The repository contains migrations `001` through `007`, but much of the production schema was originally created outside the tracked migration chain. Those older files are retained as historical reconstruction and hardening work; they must not be blindly replayed against production.

The live Supabase migration history at the Batch 0B baseline is:

| Version | Name |
|---|---|
| `20260728184005` | `fix_permissive_rls_policies` |
| `20260728213651` | `batch_0a_immediate_containment` |
| `20260728214449` | `batch_0b_schema_authority` |

Repository migration `008_schema_authority.sql` records the exact Batch 0B authority migration applied to production.

## Required workflow

All future schema changes must follow this sequence:

1. Create a new tracked migration in `supabase/migrations`.
2. Review the migration for data preservation, RLS, grants, function execution privileges and rollback risk.
3. Apply and test it in a Supabase development branch before production.
4. Run database security and performance advisors.
5. Apply the reviewed migration to production.
6. Regenerate the checked-in TypeScript database types.
7. Recompute and record a new schema-authority release entry.
8. Confirm every exposed public table still has RLS enabled.

Direct dashboard schema edits are prohibited during ordinary development. An emergency production containment change must be backfilled into Git immediately and identified by its exact Supabase migration version.

## Drift verification

Run the service-role-only function:

```sql
select app_private.compute_public_schema_authority();
```

Compare its result with the newest row in:

```sql
select *
from app_private.schema_authority
order by recorded_at desc
limit 1;
```

A different fingerprint without a corresponding reviewed migration means the database has drifted from its recorded authority.

## Type generation

Types must be regenerated from the live project after every accepted schema migration. The Batch 0B audit successfully generated types against PostgREST `14.5`, covering all current tables, views, functions and enums. The generated file should be consumed by the Supabase client rather than maintaining handwritten table interfaces.
