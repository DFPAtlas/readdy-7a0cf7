export const dynamic = "force-static";

import { NextResponse } from "next/server";

export async function GET() {
  const swCode = `
const CACHE_VERSION = "lethub-v3";
const STATIC_CACHE = CACHE_VERSION + "-static";
const PAGE_CACHE = CACHE_VERSION + "-pages";
const API_CACHE = CACHE_VERSION + "-api";
const PUSH_DB = "lethub-push-store";

const PRELOAD_PAGES = [
  "/mobile/role",
  "/mobile/agent",
  "/mobile/landlord",
  "/mobile/tenant",
  "/mobile/contractor",
  "/mobile/maintenance",
  "/mobile/inspections",
  "/mobile/documents",
  "/mobile/rent",
  "/mobile/compliance",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pageCache = await caches.open(PAGE_CACHE);
      try {
        await pageCache.addAll(PRELOAD_PAGES);
      } catch (e) {}
      return self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [STATIC_CACHE, PAGE_CACHE, API_CACHE];
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith("lethub-") && !validCaches.includes(name))
          .map((name) => caches.delete(name))
      );
      return self.clients.claim();
    })()
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "LetHub", body: event.data.text(), icon: "/icon-192.png" };
  }

  const options = {
    body: payload.body || "",
    icon: payload.icon || "https://readdy.ai/api/search-image?query=A%20simple%20elegant%20square%20app%20icon%20with%20the%20letter%20L%20in%20white%20on%20a%20dark%20forest%20green%20background%20minimal%20modern%20design%20192x192&width=192&height=192&seq=lethub-push-icon&orientation=squarish",
    badge: "https://readdy.ai/api/search-image?query=A%20simple%20elegant%20square%20app%20icon%20with%20the%20letter%20L%20in%20white%20on%20a%20dark%20forest%20green%20background%20minimal%20modern%20design%2096x96&width=96&height=96&seq=lethub-push-badge&orientation=squarish",
    data: {
      url: payload.url || "/dashboard/notifications",
      type: payload.type || "info",
      timestamp: Date.now(),
    },
    tag: payload.tag || "lethub-notification",
    renotify: true,
    requireInteraction: payload.requireInteraction || false,
    vibrate: [200, 100, 200],
    actions: payload.actions || [],
  };

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window" });
      const hasFocused = allClients.some((client) => client.focused);

      if (!hasFocused) {
        await self.registration.showNotification(payload.title || "LetHub", options);
      }

      const db = await self.caches.open(PUSH_DB);
      const storedNotifications = await db.match("notifications");
      let notifications = storedNotifications ? await storedNotifications.json() : [];
      notifications.unshift({
        id: "push-" + Date.now(),
        title: payload.title,
        body: payload.body,
        type: payload.type,
        url: payload.url,
        timestamp: new Date().toISOString(),
      });
      if (notifications.length > 50) notifications = notifications.slice(0, 50);
      await db.put(
        new Response(JSON.stringify(notifications), {
          headers: { "Content-Type": "application/json" },
        }),
        "notifications"
      );
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard/notifications";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window" });
      const matchingClient = allClients.find(
        (c) => c.url.includes(self.location.origin) && "focus" in c
      );

      if (matchingClient) {
        await matchingClient.focus();
        matchingClient.postMessage({
          type: "NOTIFICATION_CLICK",
          url: urlToOpen,
        });
      } else {
        await self.clients.openWindow(urlToOpen);
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "GET_STORED_NOTIFICATIONS") {
    event.waitUntil(
      (async () => {
        const db = await self.caches.open(PUSH_DB);
        const stored = await db.match("notifications");
        const notifications = stored ? await stored.json() : [];
        const client = event.source;
        if (client) {
          client.postMessage({
            type: "STORED_NOTIFICATIONS",
            notifications,
          });
        }
      })()
    );
  }
});

function isApiRequest(url) {
  return url.pathname.includes("/api/") || url.hostname.includes("supabase");
}

function isPageRequest(url) {
  const path = url.pathname;
  return !path.includes(".") || path.endsWith(".html");
}

function isStaticAsset(url) {
  const path = url.pathname;
  return (
    path.match(/\\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/) ||
    path.includes("/_next/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isPageRequest(url)) {
    event.respondWith(networkFirst(request, PAGE_CACHE));
    return;
  }

  event.respondWith(fetch(request));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
      })
      .catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (isPageRequest(new URL(request.url))) {
      return caches.match("/offline");
    }

    return new Response(
      JSON.stringify({ error: "You are offline", cached: false }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}`;

  return new NextResponse(swCode, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}