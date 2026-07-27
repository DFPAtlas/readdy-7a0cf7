export const dynamic = "force-static";

import { NextResponse } from "next/server";

export async function GET() {
  const swCode = `
const CACHE_VERSION = "lethub-v4-security";
const STATIC_CACHE = CACHE_VERSION + "-static";
const PUBLIC_PAGE_CACHE = CACHE_VERSION + "-public-pages";
const PUBLIC_PRELOAD_PAGES = ["/offline", "/mobile/role"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PUBLIC_PAGE_CACHE);
    try { await cache.addAll(PUBLIC_PRELOAD_PAGES); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    const allowed = new Set([STATIC_CACHE, PUBLIC_PAGE_CACHE]);
    await Promise.all(
      names
        .filter((name) => name.startsWith("lethub-") && !allowed.has(name))
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch (_) {
    payload = { title: "LetHub", body: event.data.text() };
  }

  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    data: { url: payload.url || "/dashboard/notifications" },
    tag: payload.tag || "lethub-notification",
    renotify: Boolean(payload.renotify),
    requireInteraction: Boolean(payload.requireInteraction),
    actions: Array.isArray(payload.actions) ? payload.actions : [],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "LetHub", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/dashboard/notifications";
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = clientsList.find((client) => client.url.startsWith(self.location.origin));
    if (existing && "focus" in existing) {
      await existing.focus();
      existing.postMessage({ type: "NOTIFICATION_CLICK", url: urlToOpen });
      return;
    }
    await self.clients.openWindow(urlToOpen);
  })());
});

function isSupabaseRequest(url) {
  return url.hostname.endsWith("supabase.co") ||
    url.pathname.includes("/rest/v1/") ||
    url.pathname.includes("/auth/v1/") ||
    url.pathname.includes("/storage/v1/") ||
    url.pathname.includes("/functions/v1/");
}

function isPrivatePath(pathname) {
  return [
    "/dashboard",
    "/owner",
    "/tenant",
    "/contractor",
    "/portal",
    "/mobile/agent",
    "/mobile/landlord",
    "/mobile/tenant",
    "/mobile/contractor",
    "/mobile/account",
    "/mobile/documents",
    "/mobile/rent",
    "/mobile/compliance",
    "/mobile/maintenance",
    "/mobile/inspections",
  ].some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function isSensitiveRequest(request, url) {
  return Boolean(request.headers.get("authorization")) ||
    isSupabaseRequest(url) ||
    isPrivatePath(url.pathname) ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/sw";
}

function isStaticAsset(url) {
  return url.pathname.includes("/_next/static/") ||
    /\\.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/.test(url.pathname);
}

function isPublicNavigation(request, url) {
  return request.mode === "navigate" && !isPrivatePath(url.pathname);
}

function mayStore(response) {
  if (!response || !response.ok || response.type === "opaque") return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cacheControl) && !response.headers.has("set-cookie");
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (mayStore(response)) await cache.put(request, response.clone());
  return response;
}

async function networkFirstPublicPage(request) {
  try {
    const response = await fetch(request);
    if (mayStore(response)) {
      const cache = await caches.open(PUBLIC_PAGE_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return (await caches.match(request)) || (await caches.match("/offline")) ||
      new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Never cache authenticated, tenant-specific, payment, Supabase or Edge Function data.
  if (isSensitiveRequest(request, url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isPublicNavigation(request, url)) {
    event.respondWith(networkFirstPublicPage(request));
  }
});
`;

  return new NextResponse(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
