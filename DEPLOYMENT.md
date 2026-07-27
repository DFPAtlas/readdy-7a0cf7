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

Apply the migrations in sequence:

```text
003_security_containment.sql
004_auth_rbac_hardening.sql
005_billing_authority.sql
```

Migration 005 removes browser write access to subscription state and changes any paid/trial row without a Stripe subscription ID to `incomplete`.

## Build and start

```bash
npm install
npm run typecheck
npm run build
npm run start
```

The repository does not currently contain a lockfile, so `npm install` is required until dependency-locking work is completed in a later batch.

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

If Batch 4 must be rolled back, disable new Checkout links first and keep the Stripe webhook running while existing events drain. Do not restore browser mutation rights on `account_subscriptions`. Reverting the UI without reverting the database authority boundary is safer than allowing the client to assign plans or trials again.
