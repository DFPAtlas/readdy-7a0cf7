import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetHub — Property Management Platform",
    short_name: "LetHub",
    description: "Property management for UK letting agents, landlords, tenants and contractors.",
    start_url: "/login",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#C28A78",
    theme_color: "#C28A78",
    orientation: "portrait",
    scope: "/",
    id: "lethub-pwa",
    lang: "en-GB",
    dir: "ltr",
    categories: ["business", "productivity", "utilities"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Report Maintenance",
        short_name: "Report",
        description: "Log a maintenance issue quickly",
        url: "/dashboard/maintenance",
        icons: [
          {
            src: "/icons/shortcut-96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Inspections",
        short_name: "Inspect",
        description: "View and complete property inspections",
        url: "/dashboard/inspections",
        icons: [
          {
            src: "/icons/shortcut-96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Documents",
        short_name: "Docs",
        description: "Access tenancy documents",
        url: "/dashboard/documents",
        icons: [
          {
            src: "/icons/shortcut-96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Rent Collection",
        short_name: "Pay",
        description: "Track rent collection",
        url: "/dashboard/rent-collection",
        icons: [
          {
            src: "/icons/shortcut-96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  };
}