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

A migration file being present in Git does not prove that it has been applied to production. The documented live history below is a dated baseline snapshot, not a current migration ledger. In particular, the claims that `011` and `012` were applied live have not been reconciled against a current ledger in this review. Verify the production migration ledger and schema fingerprint before classifying any unverified migration as applied or applying it.

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
| `009_tenant_isolation_hardening.sql` | Revoke browser-role `TRUNCATE`; remove cross-agency contractor reads | Forward-only — verify current live status before applying |
| `010_registration_invite_hardening.sql` | Restrict self-registration roles and browser access to portal invitations/grants | Forward-only — verify current live status before applying |
| `011_tenancy_relationship_flow.sql` | Tenant ownership scope, scoped tenant policies and browser insert lockdown | Reported applied live; current ledger verification pending |
| `012_tenant_notes.sql` | Add free-text `tenants.notes` column | Reported applied live; current ledger verification pending |
| `013_user_security_events.sql` | Add per-user security-event storage with own-row read/insert policies | Forward-only — verify current live status before applying |
| `014_maintenance_job_details.sql` | Add maintenance-job details and constrain priority/status values | Forward-only — verify current live status and review its existing-row status normalization before applying |

The next new migration must be numbered `015`. Do not replay migrations `001`–`008`, or treat `009`–`014` as pending, based only on the filename sequence.

### Forward-only migration record: `009_tenant_isolation_hardening.sql`

Classification: **Forward-only security hardening migration — verify live migration status before applying.**

Purpose:

- Revoke `TRUNCATE` from browser roles.
- Prevent future public tables from inheriting `TRUNCATE` for `anon`/`authenticated`.
- Remove the cross-agency read policy `cp_agency_read` from `contractor_profiles`.
- Remove the cross-agency read policy `cp_perf_agency_read` from `contractor_performance`.

### Forward-only migration record: `010_registration_invite_hardening.sql`

Classification: **Forward-only security hardening migration — verify live migration status before applying.**

Purpose:

- Restrict public self-registration to `estate_agent_admin` and `landlord` by tightening `enforce_profile_role_integrity()`.
- Assign new auth users a least-privilege placeholder profile (`client`) in `handle_new_user()` so tenant/contractor/platform admin roles can only come from trusted service-role flows.
- Make `portal_invites` unreadable and unwritable from the browser; tokens are validated server-side only.
- Prevent the browser from creating or amending `portal_access`, `owner_portal_access` and `tenant_portal_access` grants outside agency-managed scope.

Invitation acceptance is performed by the trusted `accept-portal-invite` Edge Function (service role), and self-registration role assignment by `complete-registration`.

### Migration record: `011_tenancy_relationship_flow.sql`

Classification: **Reported applied live in this document; verify the current production ledger before relying on that status.**

Purpose:

- Add trusted ownership scope to `tenants` (`managing_agency_id`, `landlord_id`, `created_by_profile_id`) so tenants can exist independently of a property until linked through `tenancy_parties`.
- Add `can_manage_tenant(uuid)` and scoped `tenants_scope_read` / `tenants_scope_update` policies.
- Block browser tenant creation (insert policies now require `is_platform_admin`) and guard tenant scope changes via `prevent_tenant_scope_change`.

Tenant creation runs through the trusted `create-tenant` Edge Function and tenancy creation through `create-tenancy`, which verifies property and tenant scope, rejects duplicate active tenancies for a property, writes the `tenancies` row and its lead `tenancy_parties` row, and rolls back the tenancy if the party link cannot be written. Both run with the service role; the browser cannot create tenants or tenancies against an arbitrary property outside its scope.

### Migration record: `012_tenant_notes.sql`

Classification: **Reported applied live in this document; verify the current production ledger before relying on that status.**

Purpose:

- Add a free-text `notes` column to `public.tenants` so tenant notes persist instead of being discarded by the UI. `notes` is operational metadata and is intentionally not a scope field, so it is editable under the existing `tenants_scope_update` policy.

Tenant notes are written by the trusted `create-tenant` Edge Function on creation and by the scoped `tenants_scope_update` policy on edit.

### Forward-only migration record: `013_user_security_events.sql`

Classification: **Forward-only migration — verify live migration status before applying.**

Purpose:

- Create `public.user_security_events` for durable account security and device-trust events.
- Allow authenticated users to read and append only their own events. The migration defines no update or delete policies.

### Forward-only migration record: `014_maintenance_job_details.sql`

Classification: **Forward-only migration — verify live migration status before applying and review the existing-row updates.**

Purpose:

- Add operational detail columns to `public.maintenance_jobs` for priority, category, reporter, target date, access notes, estimated cost and update time.
- Normalize null or unrecognized priorities to `normal` and null or unrecognized statuses to `reported`, then add check constraints for the allowed values.
- Leave existing RLS policies unchanged.

The status normalization changes existing rows. Confirm the proposed mapping is acceptable and inspect affected row counts before applying this migration to production.

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
