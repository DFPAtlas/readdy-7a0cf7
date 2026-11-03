export const SERVICE_WORKER_SOURCE = `
const CACHE_VERSION = "lethub-v7-pwa";
const STATIC_CACHE = CACHE_VERSION + "-static";
const PUBLIC_PAGE_CACHE = CACHE_VERSION + "-public-pages";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PUBLIC_PAGE_CACHE);
    try { await cache.add(new Request(OFFLINE_URL, { cache: "reload" })); } catch (_) {}
  })());
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data && data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clientsList.forEach((client) => {
      client.postMessage({ type: "SW_ACTIVATED", version: CACHE_VERSION });
    });
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
    url.pathname.startsWith("/api/");
}

function isServiceWorkerScript(url) {
  return url.pathname === "/sw" || url.pathname === "/sw.js";
}

function isStaticAsset(url) {
  if (isServiceWorkerScript(url)) return false;
  return url.pathname.includes("/_next/static/") ||
    /\\.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/.test(url.pathname);
}

function mayStore(response) {
  if (!response || !response.ok || response.type === "opaque") return false;
  const cacheControl = response.headers.get("cache-control") || "";
  return !/no-store|private/i.test(cacheControl) && !response.headers.has("set-cookie");
}

async function offlineFallback() {
  const cached = await caches.match(OFFLINE_URL);
  if (cached) return cached;
  return new Response(
    '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:system-ui;padding:40px;text-align:center">You are offline.</body>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
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
    return (await caches.match(request)) || (await offlineFallback());
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isServiceWorkerScript(url)) return;

  if (isSensitiveRequest(request, url)) {
    if (request.mode === "navigate") {
      event.respondWith((async () => {
        try {
          return await fetch(request);
        } catch (_) {
          return offlineFallback();
        }
      })());
    }
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPublicPage(request));
  }
});
`;