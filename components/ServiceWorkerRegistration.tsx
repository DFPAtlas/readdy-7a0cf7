"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw").then((registration: ServiceWorkerRegistration) => {
      initializePushSubscription(registration);
    }).catch(() => {});
  }, []);

  return null;
}

function initializePushSubscription(registration: ServiceWorkerRegistration) {
  if (!("PushManager" in window)) return;

  registration.pushManager.getSubscription().then((subscription: PushSubscription | null) => {
    if (!subscription) {
      requestPushPermission(registration);
    }
  });
}

function requestPushPermission(registration: ServiceWorkerRegistration) {
  const vapidPublicKey = "BEl62i2YI63B2gM1NqE2B2LmFUdJKH4EswB3mK6pNQkFvGYO7JPE1Cj8fPq3T0SDYuIW6xV2aEr4ZbGmLn8RdNk";

  Notification.requestPermission().then((permission: NotificationPermission) => {
    if (permission === "granted") {
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as Uint8Array<ArrayBuffer>,
        })
        .then(() => {})
        .catch(() => {});
    }
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}