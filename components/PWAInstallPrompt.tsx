"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "lethub_pwa_dismissed";

let deferredPrompt: any = null;
let openListeners: (() => void)[] = [];

export function triggerInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
    return;
  }
  openListeners.forEach((fn) => fn());
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    if (isIos) setPlatform("ios");
    else if (/Android/.test(ua)) setPlatform("android");

    const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === "true";

    const open = () => {
      if (isStandaloneMode()) return;
      setShowPrompt(true);
    };
    openListeners.push(open);

    if (isStandaloneMode()) {
      return () => {
        openListeners = openListeners.filter((fn) => fn !== open);
      };
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      if (!alreadyDismissed) setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setShowPrompt(false);
      deferredPrompt = null;
    };
    window.addEventListener("appinstalled", installedHandler);

    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos && !alreadyDismissed) {
      iosTimer = setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      openListeners = openListeners.filter((fn) => fn !== open);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const close = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#C28A78] flex items-center justify-center flex-shrink-0">
            <span className="brand-wordmark text-white text-sm">
              LetHub
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#3A3F3A]">Install LetHub</p>
            <p className="text-xs text-[#687068] mt-0.5 leading-relaxed">
              {platform === "ios"
                ? "Tap the Share icon in Safari, then choose Add to Home Screen."
                : platform === "android"
                  ? "Add LetHub to your home screen for full-screen, offline-ready access."
                  : "Install LetHub for faster launch and offline access."}
            </p>
          </div>

          <button
            onClick={close}
            aria-label="Dismiss install prompt"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] flex-shrink-0 cursor-pointer"
          >
            <i className="ri-close-line text-[#94A3B8] text-sm"></i>
          </button>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          {platform === "ios" ? (
            <button
              onClick={close}
              className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              Got it
            </button>
          ) : (
            <>
              <button
                onClick={close}
                className="flex-1 py-2.5 bg-[#F1F5F9] text-[#475569] rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer"
              >
                Not now
              </button>
              <button
                onClick={() => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(() => {
                      deferredPrompt = null;
                      setShowPrompt(false);
                    });
                  } else {
                    setShowPrompt(false);
                  }
                }}
                className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
              >
                <i className="ri-download-line"></i>
                Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}