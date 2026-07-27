import type { NextConfig } from "next";

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
