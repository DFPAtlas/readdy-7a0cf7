"use client";

import Link from "next/link";

export default function AdminAccessDenied({ role }: { role?: string }) {
  return (
    <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-shield-flash-line text-[#EF4444] text-2xl"></i>
        </div>
        <h1 className="text-xl font-bold text-[#3A3F3A] mb-2">Access Denied</h1>
        <p className="text-sm text-[#687068] mb-6">
          You do not have permission to access the Platform Administration panel.
          {role && <span className="block mt-1">Your current role: <strong>{role}</strong></span>}
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}