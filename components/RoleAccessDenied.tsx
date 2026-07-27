"use client";

import Link from "next/link";
import { AppRole, getRoleHome, ROLE_LABELS } from "@/lib/rbac";

export default function RoleAccessDenied({
  role,
  reason = "Your account does not have permission to open this area.",
}: {
  role: AppRole;
  reason?: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#FECACA] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
          <i className="ri-shield-keyhole-line text-2xl text-[#DC2626]"></i>
        </div>
        <h1 className="text-xl font-bold text-[#3A3F3A]">Access restricted</h1>
        <p className="mt-2 text-sm leading-6 text-[#687068]">{reason}</p>
        <div className="mt-4 rounded-lg bg-[#F8FAFC] px-4 py-3 text-xs text-[#687068]">
          Signed in as <span className="font-semibold text-[#3A3F3A]">{ROLE_LABELS[role]}</span>
        </div>
        <Link
          href={getRoleHome(role)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C28A78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B07A69]"
        >
          <i className="ri-arrow-left-line"></i>
          Return to your dashboard
        </Link>
      </div>
    </div>
  );
}
