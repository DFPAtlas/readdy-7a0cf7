import type { NextConfig } from "next";

// Production deploys must have real Supabase settings. lib/supabaseClient.ts
// falls back to a placeholder so design previews still render, which would
// otherwise let a misconfigured production build ship and fail at runtime.
if (process.env.VERCEL_ENV === "production") {
  const missing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Production build is missing required environment variables: ${missing.join(", ")}`);
  }
}

// Browser security headers. Production only: Readdy's editor previews the app
// inside a frame, which these headers would block. A full Content-Security-
// Policy isn't set yet because pages load icons, fonts and images from several
// third-party hosts; frame-ancestors/object-src/base-uri are safe to enforce now.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.VERCEL_ENV !== "production") return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // LetHub requires a Next.js server runtime. Authenticated dashboards, route
  // handlers and Supabase-backed UUID routes cannot be produced as a static export.
  images: {
    // Existing designs use several remote image providers. Keep this explicit
    // until those assets are migrated to durable local or Supabase-hosted files.
    unoptimized: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
