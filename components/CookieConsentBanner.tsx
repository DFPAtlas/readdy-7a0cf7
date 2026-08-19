"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
};

const STORAGE_KEY = "lethub_cookie_prefs";

function getSavedPrefs(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function savePrefs(prefs: CookiePreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    const saved = getSavedPrefs();
    if (!saved) {
      setShowBanner(true);
    } else {
      setPrefs(saved);
    }
  }, []);

  function handleAcceptAll() {
    const all: CookiePreferences = { necessary: true, functional: true, analytics: true };
    savePrefs(all);
    setPrefs(all);
    setShowBanner(false);
  }

  function handleSavePreferences() {
    savePrefs(prefs);
    setShowBanner(false);
    setShowModal(false);
  }

  function handleRejectAll() {
    const minimal: CookiePreferences = { necessary: true, functional: false, analytics: false };
    savePrefs(minimal);
    setPrefs(minimal);
    setShowBanner(false);
  }

  function reopenPreferences() {
    const saved = getSavedPrefs();
    if (saved) setPrefs(saved);
    else setPrefs({ necessary: true, functional: true, analytics: true });
    setShowModal(true);
  }

  function togglePref(key: keyof CookiePreferences) {
    if (key === "necessary") return;
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
          <div className="bg-white border-t border-[#E2E8F0] shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 pr-4">
                  <p className="text-sm text-[#475569] leading-relaxed">
                    We use cookies to enhance your experience. By continuing to browse, you agree to our use of{" "}
                    <span className="font-semibold text-[#3A3F3A]">strictly necessary</span>,{" "}
                    <span className="font-semibold text-[#3A3F3A]">functional</span>, and{" "}
                    <span className="font-semibold text-[#3A3F3A]">analytics</span> cookies.{" "}
                    <Link href="/cookies" className="text-[#C28A78] underline whitespace-nowrap">
                      Learn more
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleRejectAll}
                    className="whitespace-nowrap px-5 py-2.5 text-sm font-semibold text-[#687068] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                  >
                    Reject all
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="whitespace-nowrap px-5 py-2.5 text-sm font-semibold text-[#3A3F3A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="whitespace-nowrap px-5 py-2.5 text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#B07A68] rounded-xl transition-colors cursor-pointer"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#3A3F3A]">Cookie preferences</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-[#687068]"></i>
                </button>
              </div>

              <p className="text-sm text-[#475569] leading-relaxed mb-6">
                Choose which cookies you allow. Strictly necessary cookies are always on — they keep the platform secure and functional.{" "}
                <Link href="/cookies" className="text-[#C28A78] underline whitespace-nowrap" onClick={() => setShowModal(false)}>
                  Full cookie policy
                </Link>
              </p>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 p-4 bg-[#FAFBFC] rounded-xl border border-[#E2E8F0]">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#3A3F3A] text-sm">Strictly necessary</h3>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                      Authentication, session management, security. The platform cannot work without these.
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-10 h-6 bg-[#C28A78]/30 rounded-full flex items-center px-0.5 cursor-default">
                      <div className="w-5 h-5 bg-[#C28A78] rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 p-4 bg-[#FAFBFC] rounded-xl border border-[#E2E8F0]">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#3A3F3A] text-sm">Functional</h3>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                      Remember your preferences, layout choices, and billing period selection.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePref("functional")}
                    className={`flex-shrink-0 w-10 h-6 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                      prefs.functional ? "bg-[#C28A78]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        prefs.functional ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4 p-4 bg-[#FAFBFC] rounded-xl border border-[#E2E8F0]">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#3A3F3A] text-sm">Analytics</h3>
                    <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                      Anonymous usage data to help us understand how people use the platform and improve it.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePref("analytics")}
                    className={`flex-shrink-0 w-10 h-6 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                      prefs.analytics ? "bg-[#C28A78]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        prefs.analytics ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={() => {
                    savePrefs(prefs);
                    setShowBanner(false);
                    setShowModal(false);
                  }}
                  className="whitespace-nowrap flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-[#C28A78] hover:bg-[#B07A68] rounded-xl transition-colors cursor-pointer"
                >
                  Save preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={reopenPreferences}
        className={[
          "fixed bottom-4 left-4 z-[9998] w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] shadow-md hover:shadow-lg transition-all cursor-pointer",
          showBanner ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
        aria-label="Cookie settings"
      >
        <i className="ri-shield-check-line text-lg text-[#C28A78]"></i>
      </button>
    </>
  );
}