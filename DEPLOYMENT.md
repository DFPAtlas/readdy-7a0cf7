# LetHub deployment architecture

LetHub must run with a Next.js server runtime. It is not compatible with a static-only host because the application contains authenticated dashboards, request-time route handlers, redirects and database-backed dynamic routes.

## Supported targets

Use one of the following:

- Vercel or another platform with native Next.js App Router support.
- A Node.js service that runs `npm run build` followed by `npm run start`.
- A container or application platform that supports a persistent Node.js web process.

Do not deploy the `out` directory or configure the project as a static export.

## Next.js environment variables

Configure these in the hosting platform rather than committing production values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Use `.env.example` as the local template. Environment files other than examples must not be committed.

## Supabase Edge Function secrets

The security and billing functions require:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_ORIGINS=https://lethub.uk,https://www.lethub.uk
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

`SB_SERVICE_ROLE_KEY` remains supported temporarily by the functions for compatibility, but new deployments should use the standard `SUPABASE_SERVICE_ROLE_KEY` secret.

`APP_ORIGINS` is a comma-separated allowlist. Include only production and explicitly approved preview origins.

## Stripe plan configuration

Checkout never creates Stripe Products or Prices. Before enabling billing, populate the approved IDs on `subscription_plans`:

```text
stripe_product_id
stripe_monthly_price_id
stripe_annual_price_id
```

Starter, Professional and Business must each have an active recurring monthly and annual Price. Enterprise is handled through sales and is not available through self-service Checkout.

Create a Stripe webhook endpoint for:

```text
https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
```

Subscribe it to at least:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

The webhook endpoint must use the same pinned Stripe API version expected by the function until an API upgrade has been tested in Stripe Workbench.

## Function authentication

`supabase/config.toml` declares:

- JWT verification enabled for registration completion, Checkout, billing portal and API administration.
- JWT verification disabled only for `stripe-webhook`, because Stripe authenticates that endpoint with its signature header.

The webhook still rejects every request without a valid Stripe signature.

## Database migrations

> **DO NOT run migrations 001–008 sequentially against the existing production database.**

The existing production Supabase database is authoritative. Its live schema and migration ledger already reflect the accepted historical work, so the repository migration files are not a replay script.

- Migrations `001` through `006` are historical reconstruction/hardening records and must not be replayed against production.
- Migration `007_fix_permissive_rls_policies.sql` is already represented in the live production migration history.
- Migration `008_schema_authority.sql` is already represented in the live production migration history.
- Migration `009_tenant_isolation_hardening.sql` is the first forward-only migration after the historical/reconciliation chain.
- Before applying migration `009`, verify the production schema fingerprint and `supabase_migrations.schema_migrations`.
- Only apply migration `009` if it is not already recorded as applied in production.
- The next new migration must be numbered `010`.
- Future migrations must be tested on a Supabase development branch cloned from the authoritative production state.

Run `npm run check:migrations` before deployment. It validates migration files only and does not prove historical migrations are safe to replay.

## Build and start

Install exactly the dependency graph recorded in `package-lock.json`:

```bash
npm ci
npm run check:repo
npm run check:migrations
npm run typecheck
npm run lint
npm run build
npm run start
```

Do not replace `npm ci` with an unlocked production install. Update `package.json` and `package-lock.json` together through a reviewed pull request.

## GitHub merge controls

The permanent workflow `.github/workflows/ci.yml` runs these pull-request checks:

```text
Repository controls
TypeScript and ESLint
Production build
```

Configure the `main` branch ruleset to require a pull request and all three checks. The workflow also runs after pushes to `main` as a post-merge confirmation.

## Runtime checks

After deployment, verify:

1. `GET /api/health` returns JSON containing `"runtime":"nextjs-server"`.
2. A real Supabase property UUID opens at `/dashboard/portfolio/<uuid>` after authentication.
3. A new account cannot insert or update `account_subscriptions` from the browser.
4. Registration with immediate login opens Stripe Checkout and does not create a subscription row beforehand.
5. A signed `checkout.session.completed` event creates or updates the subscription projection.
6. An invalid webhook signature returns HTTP 400 and changes no billing data.
7. A deliberately failed webhook attempt is stored as `failed` and can be processed on Stripe retry.
8. A Stripe subscription using an unmapped Price is rejected rather than granting a plan.
9. `/sw` remains available and authenticated Supabase requests do not enter Cache Storage.
10. Batch 2 direct-route RBAC restrictions still apply.

## Proxy and CDN rules

- Do not cache `/dashboard/*`, `/api/*`, Supabase responses or authenticated HTML.
- Allow normal long-lived caching for hashed files under `/_next/static/*`.
- Forward the original scheme and host headers to the Next.js server.
- Keep HTTPS enabled for all production and preview environments.

## Rollback

If Batch 5 must be rolled back, deploy the Batch 4 application branch and keep the Batch 4 database and Stripe authority boundary intact. Do not restore tracked environment files, unlocked dependency installation or browser mutation rights on `account_subscriptions`.
