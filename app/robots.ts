import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/mobile",
        "/mobile/",
        "/owner/dashboard",
        "/tenant/dashboard",
        "/portal",
        "/portal/",
        "/api/",
      ],
    },
    sitemap: "https://lethub.uk/sitemap.xml",
    host: "https://lethub.uk",
  };
}
