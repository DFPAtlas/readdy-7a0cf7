# LetHub deployment architecture

LetHub must run with a Next.js server runtime. It is not compatible with a static-only host because the application contains authenticated dashboards, request-time route handlers, redirects and database-backed dynamic routes.

## Supported targets

Use one of the following:

- Vercel or another platform with native Next.js App Router support.
- A Node.js service that runs `npm run build` followed by `npm run start`.
- A container or application platform that supports a persistent Node.js web process.

Do not deploy the `out` directory or configure the project as a static export.

## Required environment variables

Configure these in the hosting platform rather than committing production values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Supabase Edge Functions use their own project secrets. The Batch 1 `api-security-admin` function also requires:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SB_SERVICE_ROLE_KEY=
APP_ORIGINS=
```

`APP_ORIGINS` should contain a comma-separated allowlist of production and approved preview origins.

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
3. An old `/dashboard/property/<id>` bookmark redirects to the portfolio detail route.
4. A newly created record can be opened without rebuilding the application.
5. `/sw` returns the service worker and authenticated Supabase requests do not enter Cache Storage.
6. Role-based dashboard restrictions from Batch 2 still apply on a direct URL visit.

## Proxy and CDN rules

- Do not cache `/dashboard/*`, `/api/*`, Supabase responses or authenticated HTML.
- Allow normal long-lived caching for hashed files under `/_next/static/*`.
- Forward the original scheme and host headers to the Next.js server.
- Keep HTTPS enabled for all production and preview environments.

## Rollback

If this batch must be rolled back, revert the deployment to the Batch 2 branch and restore the previous hosting configuration. Do not restore `output: "export"` while live UUID routes remain in use; doing so will make records created after build time unreachable.
