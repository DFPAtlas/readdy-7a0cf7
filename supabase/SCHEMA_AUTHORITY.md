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

## Migration authority model

The repository contains eight numbered SQL files, `001` through `008`, with no numbering gaps. They are **not** a complete production bootstrap chain. Much of the original LetHub schema was created outside the numbered migration files, so replaying `001` through `008` against production or a blank database is unsafe and unsupported.

The Batch 0B production fingerprint above is the authority for existing production state. Numbered files `001` through `006` are retained as historical reconstruction/hardening records. Files `007` and `008` are repository backfills of production migrations that are explicitly recorded in the live Supabase migration ledger.

### Repository migration inventory

| File | Purpose | Authority classification | Production status / dependency |
|---|---|---|---|
| `001_core_schema.sql` | Seed subscription plans, create/update helper trigger and attach updated-at triggers to existing tables. | Historical / reconstruction. **Do not replay on production.** | Assumes substantial schema already existed outside Git; comments state objects were already created via SQL tooling. |
| `002_schema_foundation.sql` | RLS policy hardening, view security, indexes, portal/storage preparation. | Historical / hardening. **Do not replay on production.** | Declares `001` as prerequisite, but is not represented as a timestamped entry in the Batch 0B production ledger. |
| `003_security_containment.sql` | Hash legacy API/webhook secrets, revoke browser credential mutation and enable RLS on credential tables. | Historical / hardening. **Do not replay on production.** | Built on pre-existing tables and policies; exact application is not represented as its own Batch 0B ledger entry. |
| `004_auth_rbac_hardening.sql` | Protect profile role integrity and prevent browser role escalation. | Historical / hardening. **Do not replay on production.** | Depends on the existing `profiles` table/auth model; exact application is not represented as its own Batch 0B ledger entry. |
| `005_billing_authority.sql` | Make Stripe/webhooks authoritative for subscription state and harden subscription RLS/grants. | Historical / hardening. **Do not replay on production.** | Depends on existing billing tables/functions; exact application is not represented as its own Batch 0B ledger entry. |
| `006_enable_missing_rls.sql` | Enable/force RLS on tables whose policies existed but whose tracked history did not enable RLS. | Historical diagnostic/hardening. **Do not replay on production.** | `007` records that the live audit found RLS already enabled on every public table. Applying `006` now would not be a valid way to reconstruct production history. |
| `007_fix_permissive_rls_policies.sql` | Replace permissive live RLS policies discovered by the security audit. | **Already applied production backfill. Do not replay.** | Exact live entry: `20260728184005_fix_permissive_rls_policies`. |
| `008_schema_authority.sql` | Create the private schema-authority ledger/fingerprint and record Batch 0B baseline. | **Already applied production backfill. Do not replay.** | Exact live entry: `20260728214449_batch_0b_schema_authority`. Requires the production state after Batch 0A containment. |

There are currently **no numbered repository migrations in 001–008 that should be blindly applied to the existing production database**.

The next ordinary forward schema change must be introduced as a new reviewed migration beginning at `009_...`, but only after the live drift check confirms that production still matches the recorded Batch 0B authority baseline.

## Documented live Supabase migration history

The production migration history recorded at the Batch 0B baseline is:

| Version | Name | Repository mapping |
|---|---|---|
| `20260728184005` | `fix_permissive_rls_policies` | `007_fix_permissive_rls_policies.sql` |
| `20260728213651` | `batch_0a_immediate_containment` | **No exact numbered SQL counterpart identified in the current repository.** Production state is incorporated into the Batch 0B fingerprint; provenance must be verified against the live project before any attempt to recreate it. |
| `20260728214449` | `batch_0b_schema_authority` | `008_schema_authority.sql` |

The missing exact repository counterpart for `20260728213651_batch_0a_immediate_containment` is a provenance gap, not permission to invent or replay SQL. Resolve it by inspecting the live Supabase migration record/history in the dedicated live drift-verification task.

## Deployment rule for existing production

For `gejxrnreuafnyzwrchvy`:

1. **Do not run `001`–`008` as a sequence.**
2. Verify the current production fingerprint against the latest row in `app_private.schema_authority`.
3. Verify the live `supabase_migrations.schema_migrations` ledger, including the exact SQL/provenance of Batch 0A where available.
4. If the fingerprint and ledger match the recorded authority, create future changes only as new forward-only migrations starting at `009`.
5. Test each new migration in a Supabase development branch cloned from the authoritative production state.
6. Apply only the reviewed, not-yet-applied forward migration to production.
7. Regenerate checked-in TypeScript database types and record a new authority release/fingerprint.

For a brand-new blank database, the numbered files in this repository are **not a supported bootstrap** because the original schema is incomplete in tracked migration history. Use an authoritative schema snapshot/branching workflow instead of replaying `001`–`008`.

## Required workflow

All future schema changes must follow this sequence:

1. Confirm production matches the latest recorded schema-authority fingerprint.
2. Create the next sequential tracked migration in `supabase/migrations` (currently `009_...`).
3. Review the migration for data preservation, RLS, grants, function execution privileges and rollback risk.
4. Apply and test it in a Supabase development branch cloned from the authoritative baseline.
5. Run database security and performance advisors.
6. Apply the reviewed migration to production.
7. Regenerate the checked-in TypeScript database types.
8. Recompute and record a new schema-authority release entry.
9. Confirm every exposed public table still has RLS enabled.

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

Also compare the live migration ledger:

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

Do not infer application of repository files `001`–`006` merely because their intended effects appear in the current schema.

## Type generation

Types must be regenerated from the live project after every accepted schema migration. The Batch 0B audit successfully generated types against PostgREST `14.5`, covering all current tables, views, functions and enums. The generated file should be consumed by the Supabase client rather than maintaining handwritten table interfaces.
