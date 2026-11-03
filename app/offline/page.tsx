"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/features": "Features",
  "/pricing": "Pricing",
  "/mobile/role": "Choose your role",
  "/mobile/agent": "Agent dashboard",
  "/mobile/landlord": "Landlord dashboard",
  "/mobile/tenant": "Tenant dashboard",
  "/mobile/contractor": "Contractor dashboard",
  "/mobile/owner": "Owner dashboard",
  "/mobile/inspections": "Inspections",
  "/mobile/maintenance": "Maintenance",
  "/mobile/documents": "Documents",
  "/mobile/rent": "Rent",
  "/mobile/compliance": "Compliance",
};

type CachedPage = { path: string; label: string };

function isCandidate(pathname: string) {
  if (pathname === "/offline") return false;
  if (pathname.startsWith("/_next/")) return false;
  if (pathname === "/sw" || pathname === "/sw.js") return false;
  return !/\.(?:css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/.test(pathname);
}

export default function OfflinePage() {
  const [pages, setPages] = useState<CachedPage[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof caches === "undefined") return;
      try {
        const names = await caches.keys();
        const found = new Map<string, string>();

        for (const name of names.filter((key) => key.startsWith("lethub-"))) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          for (const request of requests) {
            const url = new URL(request.url);
            if (url.origin !== window.location.origin) continue;
            if (!isCandidate(url.pathname)) continue;
            if (!found.has(url.pathname)) {
              found.set(url.pathname, PAGE_LABELS[url.pathname] || url.pathname.replace(/^\//, ""));
            }
          }
        }

        if (!cancelled) {
          setPages(
            Array.from(found.entries())
              .map(([path, label]) => ({ path, label }))
              .slice(0, 6)
          );
        }
      } catch (_) {}
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 rounded-2xl bg-[#C28A78] flex items-center justify-center mb-6">
          <i className="ri-wifi-off-line text-white text-2xl"></i>
        </div>

        <h1 className="text-xl font-bold text-[#3A3F3A] mb-1">You&apos;re Offline</h1>
        <p className="text-sm text-[#687068] mb-8 text-center max-w-sm leading-relaxed">
          No internet connection. Public pages you already visited may still open below — live account data needs a
          connection.
        </p>

        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">
            Saved on this device
          </p>

          {pages.length === 0 ? (
            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] text-center">
              <p className="text-sm text-[#687068]">Nothing saved yet. Pages you visit are kept for offline use.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#E2E8F0] hover:border-[#C28A78]/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#C28A78]/10 flex items-center justify-center flex-shrink-0">
                    <i className="ri-file-list-3-line text-[#C28A78] text-base"></i>
                  </div>
                  <span className="text-sm font-medium text-[#3A3F3A] truncate">{page.label}</span>
                  <i className="ri-arrow-right-s-line text-[#94A3B8] ml-auto"></i>
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2.5 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-2"
        >
          <i className="ri-refresh-line"></i>
          Try Again
        </button>
      </div>

      <p className="text-center text-xs text-[#94A3B8] pb-6">
        LetHub PWA · Cached pages available offline
      </p>
    </div>
  );
}