"use client";

import Link from "next/link";

export default function AdminAccessDenied({ role }: { role?: string }) {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center px-4">
      <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-shield-flash-line text-[#EF4444] text-2xl"></i>
        </div>
        <h1 className="text-xl font-bold text-[#E2E8F0] mb-2">Access Denied</h1>
        <p className="text-sm text-[#94A3B8] mb-6">
          You do not have permission to access the Platform Administration panel.
          {role && <span className="block mt-1">Your current role: <strong className="text-[#E2E8F0]">{role}</strong></span>}
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}