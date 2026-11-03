"use client";

import { useEffect } from "react";

const WORKER_CANDIDATES = ["/sw.js", "/sw"];
const UPDATE_READY_EVENT = "lethub:pwa-update-ready";
const APPLY_UPDATE_EVENT = "lethub:pwa-apply-update";
const CHECK_INTERVAL_MS = 30 * 60 * 1000;
const MIN_CHECK_GAP_MS = 10 * 60 * 1000;

let activeRegistration: ServiceWorkerRegistration | null = null;
let updateRequested = false;
let lastCheckAt = 0;

function isPreviewEnvironment() {
  if (typeof window === "undefined") return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  const path = window.location.pathname;
  if (path.startsWith("/viewer")) return true;
  if (host === "readdy.ai" || host.endsWith(".readdy.ai")) return true;
  return false;
}

async function registerWorker() {
  for (const url of WORKER_CANDIDATES) {
    try {
      const registration = await navigator.serviceWorker.register(url, {
        scope: "/",
        updateViaCache: "none",
      });
      registration.update().catch(() => {});
      return registration;
    } catch (_) {}
  }
  return null;
}

function announceUpdate() {
  window.dispatchEvent(new CustomEvent(UPDATE_READY_EVENT));
}

function watchRegistration(registration: ServiceWorkerRegistration) {
  const checkWaiting = () => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      announceUpdate();
    }
  };

  checkWaiting();

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        announceUpdate();
      }
    });
  });
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (isPreviewEnvironment() || window.isSecureContext === false) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().catch(() => {});
          });
        })
        .catch(() => {});
      return;
    }

    const handleControllerChange = () => {
      if (!updateRequested) return;
      window.location.reload();
    };

    const handleApplyUpdate = () => {
      const waiting = activeRegistration?.waiting;
      if (!waiting) {
        window.location.reload();
        return;
      }
      updateRequested = true;
      waiting.postMessage({ type: "SKIP_WAITING" });
      window.setTimeout(() => {
        if (updateRequested) window.location.reload();
      }, 6000);
    };

    const checkForUpdate = (force: boolean) => {
      const now = Date.now();
      if (!force && now - lastCheckAt < MIN_CHECK_GAP_MS) return;
      lastCheckAt = now;
      activeRegistration?.update().catch(() => {});
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkForUpdate(false);
    };

    const handleOnline = () => checkForUpdate(true);

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    window.addEventListener(APPLY_UPDATE_EVENT, handleApplyUpdate);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    registerWorker().then((registration) => {
      if (!registration) return;
      activeRegistration = registration;
      watchRegistration(registration);
    });

    const interval = window.setInterval(() => checkForUpdate(false), CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      window.removeEventListener(APPLY_UPDATE_EVENT, handleApplyUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}