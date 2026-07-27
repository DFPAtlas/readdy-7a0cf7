"use client";

import Link from "next/link";

const offlinePages = [
  { label: "Dashboard", href: "/mobile/agent", icon: "ri-dashboard-line" },
  { label: "Inspections", href: "/mobile/inspections", icon: "ri-search-eye-line" },
  { label: "Maintenance", href: "/mobile/maintenance", icon: "ri-tools-line" },
  { label: "Documents", href: "/mobile/documents", icon: "ri-file-list-3-line" },
  { label: "Rent", href: "/mobile/rent", icon: "ri-money-pound-circle-line" },
  { label: "Compliance", href: "/mobile/compliance", icon: "ri-shield-check-line" },
];

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#C28A78] flex items-center justify-center mb-6">
          <span className="text-white text-lg" style={{ fontFamily: "Pacifico, serif" }}>
            logo
          </span>
        </div>

        <h1 className="text-xl font-bold text-[#3A3F3A] mb-1">You&apos;re Offline</h1>
        <p className="text-sm text-[#687068] mb-8 text-center">
          No internet connection. Here&apos;s what you can still access:
        </p>

        <div className="w-full max-w-sm space-y-2">
          {offlinePages.map((page) => (
            <Link
              key={page.label}
              href={page.href}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#E2E8F0] hover:border-[#C28A78]/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#C28A78]/10 flex items-center justify-center">
                <i className={`${page.icon} text-[#C28A78] text-lg`}></i>
              </div>
              <span className="text-sm font-medium text-[#3A3F3A]">{page.label}</span>
              <i className="ri-arrow-right-s-line text-[#94A3B8] ml-auto"></i>
            </Link>
          ))}
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
        LetHub PWA · Cached content available offline
      </p>
    </div>
  );
}