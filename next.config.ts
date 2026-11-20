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

const nextConfig: NextConfig = {
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
