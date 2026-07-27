import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LetHub — Property Management Platform",
    short_name: "LetHub",
    description: "The UK's most powerful property management platform — for agents, landlords, tenants & contractors",
    start_url: "/mobile/role",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#C28A78",
    theme_color: "#C28A78",
    orientation: "portrait",
    scope: "/",
    id: "lethub-pwa",
    lang: "en",
    dir: "ltr",
    categories: ["business", "productivity", "utilities"],
    prefer_related_applications: false,
    screenshots: [
      {
        src: "https://readdy.ai/api/search-image?query=A%20modern%20dark%20green%20property%20management%20mobile%20app%20dashboard%20showing%20portfolio%20overview%20with%20property%20cards%20rental%20income%20statistics%20and%20occupancy%20rates%20on%20a%20smartphone%20screen%20clean%20professional%20UK%20real%20estate%20interface&width=390&height=844&seq=lethub-screenshot-1&orientation=portrait",
        sizes: "390x844",
        type: "image/jpeg",
      },
      {
        src: "https://readdy.ai/api/search-image?query=A%20mobile%20app%20screen%20showing%20maintenance%20job%20tracking%20with%20repair%20statuses%20work%20orders%20contractor%20assignments%20and%20inspection%20schedule%20for%20a%20UK%20property%20management%20platform%20clean%20professional%20interface&width=390&height=844&seq=lethub-screenshot-2&orientation=portrait",
        sizes: "390x844",
        type: "image/jpeg",
      },
      {
        src: "https://readdy.ai/api/search-image?query=A%20mobile%20app%20interface%20showing%20document%20management%20with%20tenancy%20agreements%20compliance%20certificates%20and%20digital%20signatures%20for%20a%20UK%20letting%20agency%20platform%20clean%20modern%20design&width=390&height=844&seq=lethub-screenshot-3&orientation=portrait",
        sizes: "390x844",
        type: "image/jpeg",
      },
    ],
    icons: [
      {
        src: "https://readdy.ai/api/search-image?query=A%20simple%20elegant%20square%20app%20icon%20with%20the%20letter%20L%20in%20white%20on%20a%20dark%20forest%20green%20background%20minimal%20modern%20design%20suitable%20for%20a%20property%20management%20PWA%20app%20icon%20no%20text%20just%20the%20letter%20mark&width=192&height=192&seq=lethub-icon-192&orientation=squarish",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://readdy.ai/api/search-image?query=A%20simple%20elegant%20square%20app%20icon%20with%20the%20letter%20L%20in%20white%20on%20a%20dark%20forest%20green%20background%20minimal%20modern%20design%20suitable%20for%20a%20property%20management%20PWA%20app%20icon%20no%20text%20just%20the%20letter%20mark&width=512&height=512&seq=lethub-icon-512&orientation=squarish",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "https://readdy.ai/api/search-image?query=A%20simple%20elegant%20square%20app%20icon%20with%20the%20letter%20L%20in%20white%20on%20a%20dark%20forest%20green%20background%20minimal%20modern%20design%20suitable%20for%20a%20property%20management%20PWA%20maskable%20icon%20with%20padding%20around%20the%20edges%20for%20safe%20zone%20cropping&width=512&height=512&seq=lethub-maskable-512&orientation=squarish",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Report Maintenance",
        short_name: "Report",
        description: "Log a maintenance issue quickly",
        url: "/mobile/maintenance",
        icons: [
          {
            src: "https://readdy.ai/api/search-image?query=A%20small%20square%20icon%20of%20a%20wrench%20tool%20in%20white%20on%20dark%20green%20background%20simple%20minimal%20design%2096x96%20pixels&width=96&height=96&seq=lethub-shortcut-maintenance&orientation=squarish",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Inspections",
        short_name: "Inspect",
        description: "View and complete property inspections",
        url: "/mobile/inspections",
        icons: [
          {
            src: "https://readdy.ai/api/search-image?query=A%20small%20square%20icon%20of%20a%20magnifying%20glass%20in%20white%20on%20dark%20green%20background%20simple%20minimal%20design%2096x96%20pixels&width=96&height=96&seq=lethub-shortcut-inspections&orientation=squarish",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Documents",
        short_name: "Docs",
        description: "Access tenancy documents",
        url: "/mobile/documents",
        icons: [
          {
            src: "https://readdy.ai/api/search-image?query=A%20small%20square%20icon%20of%20a%20document%20file%20in%20white%20on%20dark%20green%20background%20simple%20minimal%20design%2096x96%20pixels&width=96&height=96&seq=lethub-shortcut-documents&orientation=squarish",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "Rent Payments",
        short_name: "Pay",
        description: "View and make rent payments",
        url: "/mobile/rent",
        icons: [
          {
            src: "https://readdy.ai/api/search-image?query=A%20small%20square%20icon%20of%20a%20pound%20sterling%20symbol%20in%20white%20on%20dark%20green%20background%20simple%20minimal%20design%2096x96%20pixels&width=96&height=96&seq=lethub-shortcut-rent&orientation=squarish",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  };
}