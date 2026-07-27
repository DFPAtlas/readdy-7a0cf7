# LetHub

LetHub is a multi-role UK property-management platform built with Next.js 15, React 19 and Supabase.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run build
```

The repository does not currently contain a dependency lockfile or GitHub Actions workflow, so automated build validation is not yet enforced.

## Production runtime

LetHub requires a Next.js server runtime. Static export hosting is unsupported because the application uses:

- authenticated role-based dashboards;
- request-time route handlers and redirects;
- Supabase-backed dynamic UUID routes;
- records that are created after the application build.

Build and run the production server with:

```bash
npm run build
npm run start
```

Use `GET /api/health` as the deployment health check. See `DEPLOYMENT.md` for environment variables, proxy rules and the post-deployment smoke-test checklist.

## Current branch sequence

Security and architecture work is being delivered as stacked pull requests:

1. Batch 1 — credential, entitlement and PWA cache containment.
2. Batch 2 — authentication and dashboard RBAC.
3. Batch 3 — server deployment and runtime dynamic routes.

Merge the batches in order.
