# LetHub

LetHub is a multi-role UK property-management platform built with Next.js 15, React 19 and Supabase.

## Local development

Use Node.js 20, 21 or 22 and the npm version pinned in `package.json`.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

Run the same checks used by GitHub Actions:

```bash
npm run check:repo
npm run check:migrations
npm run typecheck
npm run lint
npm run build
```

Or run the combined command:

```bash
npm run check:ci
```

The root TypeScript and ESLint configuration validates the Next.js application. Supabase Edge Functions are Deno applications and are intentionally excluded from the Node.js compiler pass.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It provides three checks:

- `Repository controls`
- `TypeScript and ESLint`
- `Production build`

Configure the GitHub ruleset for `main` to require a pull request and all three checks before merging. The connected GitHub app used to prepare this branch cannot change repository rulesets, so this is a one-time repository-admin setting.

Repository controls reject tracked environment files, generated output, private-key formats, missing lockfiles and invalid or out-of-order Supabase migration filenames.

## Production runtime

LetHub requires a Next.js server runtime. Static export hosting is unsupported because the application uses:

- authenticated role-based dashboards;
- request-time route handlers and redirects;
- Supabase-backed dynamic UUID routes;
- records that are created after the application build.

Build and run the production server with:

```bash
npm ci
npm run build
npm run start
```

Use `GET /api/health` as the deployment health check. See `DEPLOYMENT.md` for environment variables, proxy rules and the post-deployment smoke-test checklist.

## Current branch sequence

Security, architecture and build work is being delivered as stacked pull requests:

1. Batch 1 — credential, entitlement and PWA cache containment.
2. Batch 2 — authentication and dashboard RBAC.
3. Batch 3 — server deployment and runtime dynamic routes.
4. Batch 4 — Stripe-authoritative subscriptions and trusted registration.
5. Batch 5 — deterministic dependencies, CI and repository controls.

Merge the batches in order.
