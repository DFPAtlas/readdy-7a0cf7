"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LOAD_ERROR_EVENT } from "@/lib/loadError";

/** Shown when any query on the current page reports a failure via reportLoadError(). */
export default function LoadErrorBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener(LOAD_ERROR_EVENT, show);
    return () => window.removeEventListener(LOAD_ERROR_EVENT, show);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-3 rounded-lg border border-[#EF4444]/30 bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        <i className="ri-error-warning-line text-base"></i>
      </div>
      <p className="flex-1">
        Some information on this page couldn&apos;t be loaded, so what you see may be incomplete. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-md border border-[#EF4444]/40 px-3 py-1 text-xs font-medium hover:bg-[#EF4444]/10 whitespace-nowrap"
      >
        Retry
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[#EF4444]/10"
      >
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}
