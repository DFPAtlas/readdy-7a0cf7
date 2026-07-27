"use client";

import { useEffect, useState } from "react";

let deferredPrompt: any = null;
let installListeners: ((show: boolean) => void)[] = [];

export function triggerInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((result: any) => {
      deferredPrompt = null;
      notifyListeners(false);
    });
  }
}

function notifyListeners(show: boolean) {
  installListeners.forEach((fn) => fn(show));
}

export function onInstallReady(cb: (show: boolean) => void) {
  installListeners.push(cb);
  return () => {
    installListeners = installListeners.filter((f) => f !== cb);
  };
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      setPlatform("ios");
    } else if (/Android/.test(ua)) {
      setPlatform("android");
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      if (!dismissed) {
        setShowPrompt(true);
        notifyListeners(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setShowPrompt(false);
      deferredPrompt = null;
      notifyListeners(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [dismissed]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-out">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="w-12 h-12 rounded-xl bg-[#C28A78] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm" style={{ fontFamily: "Pacifico, serif" }}>
              logo
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#3A3F3A]">Install LetHub</p>
            <p className="text-xs text-[#687068] mt-0.5">
              {platform === "ios"
                ? "Tap the share icon then Add to Home Screen"
                : "Add LetHub to your home screen for quick access"}
            </p>
          </div>

          <button
            onClick={() => {
              setShowPrompt(false);
              setDismissed(true);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] flex-shrink-0"
          >
            <i className="ri-close-line text-[#94A3B8] text-sm"></i>
          </button>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          {platform === "ios" ? (
            <button
              onClick={() => {
                setShowPrompt(false);
                setDismissed(true);
              }}
              className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              Got it
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowPrompt(false);
                  setDismissed(true);
                }}
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
                      notifyListeners(false);
                    });
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