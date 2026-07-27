"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw").catch(() => {
      // Registration failure is non-fatal; the app remains available online.
    });
  }, []);

  return null;
}
