"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "lethub_update_notice_hidden";
const READY_EVENT = "lethub:pwa-update-ready";
const APPLY_EVENT = "lethub:pwa-apply-update";

export default function PWAUpdateNotice() {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "true") return;
    const onReady = () => setReady(true);
    window.addEventListener(READY_EVENT, onReady);
    return () => window.removeEventListener(READY_EVENT, onReady);
  }, []);

  if (!ready || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    sessionStorage.setItem(DISMISS_KEY, "true");
  };

  const apply = () => {
    setHidden(true);
    window.dispatchEvent(new CustomEvent(APPLY_EVENT));
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 left-0 right-0 z-[60] px-4 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_10px_40px_-12px_rgba(58,63,58,0.25)] animate-slide-up">
        <div className="flex items-center gap-3 p-3 pr-2">
          <div className="w-9 h-9 rounded-xl bg-[#C28A78]/12 flex items-center justify-center flex-shrink-0">
            <i className="ri-loop-right-line text-[#C28A78] text-base"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#3A3F3A] leading-tight">
              New version ready
            </p>
            <p className="text-[11px] text-[#687068] leading-tight mt-0.5">
              Refresh to pick up the latest fixes.
            </p>
          </div>
          <button
            type="button"
            onClick={apply}
            className="px-3 py-1.5 rounded-lg bg-[#C28A78] text-white text-[12px] font-medium whitespace-nowrap cursor-pointer hover:bg-[#B27A68] transition-colors"
          >
            Update
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hide update notice"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}