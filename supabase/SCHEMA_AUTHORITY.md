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

This file is the source of truth for the documented migration classification and database baseline. The repository contains migrations `001` through `014`. Much of the production schema was originally created outside the tracked migration chain (via the Supabase dashboard and SQL tool), so files `001`–`008` are retained as historical reconstruction and hardening work and must not be replayed against production.

A migration file being present in Git does not prove that it has been applied to production. The current production ledger and schema were checked on 5 November 2026; the July 2026 authority record below is only a dated baseline. The live ledger includes later security and agent migrations not found by the repository-wide GitHub search, while catalog checks confirm core effects from migrations `010`–`013` without matching migration names in the ledger. Reconcile these records before applying or recording any migration.

### Complete migration inventory

| File | Purpose | Replay status |
|---|---|---|
| `001_core_schema.sql` | Extension, `trigger_set_updated_at`, seed subscription plans, `updated_at` triggers | Historical — do not replay |
| `002_schema_foundation.sql` | RLS hardening, view `security_invoker`, indexes, storage policies, `handle_new_user` | Historical — do not replay |
| `003_security_containment.sql` | Remove browser credential mutation, hash legacy secrets, SSRF constraint | Historical — do not replay |
| `004_auth_rbac_hardening.sql` | Profiles RLS, role-integrity trigger | Historical — do not replay |
| `005_billing_authority.sql` | Stripe-authoritative subscriptions, `status = incomplete` backfill | Historical — do not replay |
| `006_enable_missing_rls.sql` | Enable + force RLS on 21 tables | Historical — do not replay |
| `007_fix_permissive_rls_policies.sql` | Re-scope permissive RLS policies | Recorded as applied in the 28 July 2026 baseline |
| `008_schema_authority.sql` | Authority ledger + fingerprint function | Recorded as applied in the 28 July 2026 baseline |
| `009_tenant_isolation_hardening.sql` | Revoke browser-role `TRUNCATE`; remove cross-agency contractor reads | Applied live under ledger name `tenant_isolation_hardening` (2026-10-02); checked effects confirmed |
| `010_registration_invite_hardening.sql` | Restrict self-registration roles and browser access to portal invitations/grants | Core effects observed live; matching migration ledger name not found — reconcile before any replay |
| `011_tenancy_relationship_flow.sql` | Tenant ownership scope, scoped tenant policies and browser insert lockdown | Core fields and function observed live; matching migration ledger name not found — reconcile before any replay |
| `012_tenant_notes.sql` | Add free-text `tenants.notes` column | Column observed live; matching migration ledger name not found — reconcile before any replay |
| `013_user_security_events.sql` | Add per-user security-event storage with own-row read/insert policies | Table, RLS and own-row policies observed live; matching migration ledger name not found — reconcile before any replay |
| `014_maintenance_job_details.sql` | Add maintenance-job details and constrain priority/status values | Detail columns absent live; pending code must preserve existing `open` and `scheduled` statuses before it is considered |

The next new migration must be numbered `015`. Do not replay migrations `001`–`008`, or treat `009`–`014` as pending, based only on the filename sequence.

### Production verification on 5 November 2026

The connected LetHub account identifies project `gejxrnreuafnyzwrchvy` as `Lethub UK Overview (via Readdy)`, active and healthy in `eu-west-2`.

Current schema fingerprint:

```text
sha256: d12e8b007ffdd06eeade9940d32ddd475ae256d587554afe84b90ce80e9d5ca1
public tables: 91
RLS-enabled public tables: 91
views: 7
public functions: 43
policies: 245
indexes: 192
enums: 18
non-internal public triggers: 2
```

The only row in `app_private.schema_authority` is still `batch-0b-2026-07-28`, fingerprint `7ab444ffe62ddba5d673adfe701b065610f27f7445c202a7250d098730b38d2b` (83 tables, 83 RLS-enabled, 7 views, 31 functions, 237 policies, 162 indexes, 18 enums and 0 non-internal triggers). The live schema has changed since that record, but the current fingerprint has not been recorded as a newer authority release.

The current migration ledger contains 15 entries:

| Version | Name | Repository mapping |
|---|---|---|
| `20260728184005` | `fix_permissive_rls_policies` | `007_fix_permissive_rls_policies.sql` |
| `20260728213651` | `batch_0a_immediate_containment` | No tracked file |
| `20260728214449` | `batch_0b_schema_authority` | `008_schema_authority.sql` |
| `20260907164953` | `security_01a_pin_function_search_paths` | No matching file found in this repository |
| `20260907165044` | `security_01b_harden_rls_helper_search_paths` | No matching file found in this repository |
| `20260907165245` | `agent_db_01_extend_agent_registry` | No matching file found in this repository |
| `20260907165342` | `agent_db_02_event_task_approval_heartbeat` | No matching file found in this repository |
| `20260907165436` | `agent_registry_01_seed_lethub_agents` | No matching file found in this repository |
| `20260907165531` | `agent_registry_02_tools_and_approval_rules` | No matching file found in this repository |
| `20260907165628` | `agent_engine_01_event_router` | No matching file found in this repository |
| `20260907165738` | `agent_engine_02_run_and_heartbeat_functions` | No matching file found in this repository |
| `20260907165816` | `agent_engine_03_dfp_status_payload` | No matching file found in this repository |
| `20260907165858` | `agent_engine_04_database_heartbeat` | No matching file found in this repository |
| `20260907165949` | `agent_engine_05_unified_status_and_workflow_contract` | No matching file found in this repository |
| `20261002164159` | `tenant_isolation_hardening` | Corresponds by name to migration 009; live effects checked |

Catalog checks on the current database confirmed:

- All 91 public tables have RLS enabled; no public table grants `TRUNCATE` to `anon` or `authenticated`.
- The two cross-agency contractor policies named in migration 009 are absent.
- The profile role-integrity trigger and the portal-access policies described by migration 010 are present.
- Migration 011's tenant scope columns and `can_manage_tenant(uuid)`, migration 012's `tenants.notes`, and migration 013's `user_security_events` table, RLS and own-row policies are present, but their corresponding named migrations do not appear in the ledger.
- Migration 014's detail columns are absent. Existing maintenance-job statuses are 8 `open`, 4 `reported`, 3 `scheduled` and 2 `in_progress`. The current draft migration would rewrite the 8 `open` and 3 `scheduled` rows to `reported`; the application uses both `open` and `scheduled`, so this must be corrected before applying it.
- No Supabase development branches are currently listed for the project.

These findings show why filename order alone is unsafe. Reconcile the unmatched schema changes and record a current authority fingerprint. Do not apply migrations 010–014 to production until the ledger/source mapping is clear; migration 014 also needs the status-preserving fix and development-branch validation.

### Migration record: `009_tenant_isolation_hardening.sql`

Classification: **Applied live under migration ledger entry `20261002164159 tenant_isolation_hardening`; catalog checks confirm browser roles cannot `TRUNCATE` public tables and the two named cross-agency policies are absent.**

Purpose:

- Revoke `TRUNCATE` from browser roles.
- Prevent future public tables from inheriting `TRUNCATE` for `anon`/`authenticated`.
- Remove the cross-agency read policy `cp_agency_read` from `contractor_profiles`.
- Remove the cross-agency read policy `cp_perf_agency_read` from `contractor_performance`.

### Migration record: `010_registration_invite_hardening.sql`

Classification: **Core effects are visible live: the profile role-integrity trigger and expected portal-access policies exist. No matching `registration_invite_hardening` ledger entry was found. Do not replay this file; reconcile it with the recorded security migrations first.**

Purpose:

- Restrict public self-registration to `estate_agent_admin` and `landlord` by tightening `enforce_profile_role_integrity()`.
- Assign new auth users a least-privilege placeholder profile (`client`) in `handle_new_user()` so tenant/contractor/platform admin roles can only come from trusted service-role flows.
- Make `portal_invites` unreadable and unwritable from the browser; tokens are validated server-side only.
- Prevent the browser from creating or amending `portal_access`, `owner_portal_access` and `tenant_portal_access` grants outside agency-managed scope.

Invitation acceptance is performed by the trusted `accept-portal-invite` Edge Function (service role), and self-registration role assignment by `complete-registration`.

### Migration record: `011_tenancy_relationship_flow.sql`

Classification: **Tenant scope columns, `can_manage_tenant(uuid)` and `tenants_scope_update` are present live. No matching `tenancy_relationship_flow` ledger entry was found; do not replay until the source of these objects is reconciled.**

Purpose:

- Add trusted ownership scope to `tenants` (`managing_agency_id`, `landlord_id`, `created_by_profile_id`) so tenants can exist independently of a property until linked through `tenancy_parties`.
- Add `can_manage_tenant(uuid)` and scoped `tenants_scope_read` / `tenants_scope_update` policies.
- Block browser tenant creation (insert policies now require `is_platform_admin`) and guard tenant scope changes via `prevent_tenant_scope_change`.

Tenant creation runs through the trusted `create-tenant` Edge Function and tenancy creation through `create-tenancy`, which verifies property and tenant scope, rejects duplicate active tenancies for a property, writes the `tenancies` row and its lead `tenancy_parties` row, and rolls back the tenancy if the party link cannot be written. Both run with the service role; the browser cannot create tenants or tenancies against an arbitrary property outside its scope.

### Migration record: `012_tenant_notes.sql`

Classification: **The `tenants.notes` column is present live. No matching `tenant_notes` ledger entry was found; do not replay until the source of this column is reconciled.**

Purpose:

- Add a free-text `notes` column to `public.tenants` so tenant notes persist instead of being discarded by the UI. `notes` is operational metadata and is intentionally not a scope field, so it is editable under the existing `tenants_scope_update` policy.

Tenant notes are written by the trusted `create-tenant` Edge Function on creation and by the scoped `tenants_scope_update` policy on edit.

### Migration record: `013_user_security_events.sql`

Classification: **The table, RLS and own-row select/insert policies are present live. No matching `user_security_events` ledger entry was found; do not replay until the source is reconciled.**

Purpose:

- Create `public.user_security_events` for durable account security and device-trust events.
- Allow authenticated users to read and append only their own events. The migration defines no update or delete policies.

### Forward-only migration record: `014_maintenance_job_details.sql`

Classification: **The detail columns and constraints are absent from the live schema and no matching ledger entry exists. The current file would rewrite eight `open` and three `scheduled` jobs to `reported`; update the migration to preserve both statuses before applying.**

Purpose:

- Add operational detail columns to `public.maintenance_jobs` for priority, category, reporter, target date, access notes, estimated cost and update time.
- Normalize null or unrecognized priorities to `normal` and null or unrecognized statuses to `reported`, then add check constraints for the allowed values.
- Leave existing RLS policies unchanged.

The status normalization changes existing rows. The live application uses `open` and `scheduled` statuses, so both must remain allowed in the constraint and must not be normalized to `reported`.

## Live Supabase migration history

The following is the migration history documented for the Batch 0B baseline on 28 July 2026. It is not a current ledger snapshot:

| Version | Name | Git file |
|---|---|---|
| `20260728184005` | `fix_permissive_rls_policies` | `007_fix_permissive_rls_policies.sql` |
| `20260728213651` | `batch_0a_immediate_containment` | *(none — live-only, backfill pending)* |
| `20260728214449` | `batch_0b_schema_authority` | `008_schema_authority.sql` |

`batch_0a_immediate_containment` (`20260728213651`) was applied directly to production as an emergency containment change and has no tracked file in Git yet. It must be backfilled into `supabase/migrations/` in a future change, identified by its exact Supabase version.

The later documentation entries for migrations `011` and `012` report them as applied live, but the current production ledger has not been checked in this review. Do not infer their status, or the status of migrations `009`, `010`, `013` or `014`, from this dated baseline.

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

Before applying any new SQL to production, the deployment verification must:

1. Verify that `app_private.compute_public_schema_authority()` returns a value.
2. Compare that result with the latest record in `app_private.schema_authority`.
3. Check `supabase_migrations.schema_migrations` to confirm which migrations are already recorded live.
4. Resolve any mismatch between the computed fingerprint, the recorded authority and the live migration ledger before applying new SQL.

## Type generation

Types must be regenerated from the live project after every accepted schema migration. The Batch 0B audit successfully generated types against PostgREST `14.5`, covering all current tables, views, functions and enums. The generated file should be consumed by the Supabase client rather than maintaining handwritten table interfaces.
