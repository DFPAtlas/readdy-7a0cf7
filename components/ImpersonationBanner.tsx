"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getImpersonation,
  clearImpersonation,
  type ImpersonationState,
} from "@/lib/impersonation";
import { ROLE_LABELS } from "@/lib/rbac";

export default function ImpersonationBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ImpersonationState | null>(null);

  useEffect(() => {
    setState(getImpersonation());
  }, []);

  if (!state || pathname.startsWith("/dashboard/supa-admin")) return null;

  const roleLabel = ROLE_LABELS[state.role] || state.role;

  const handleExit = () => {
    clearImpersonation();
    router.replace("/dashboard/supa-admin");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] bg-[#F59E0B] text-white shadow-lg">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-6 w-6 items-center justify-center flex-shrink-0 rounded-full bg-white/20">
            <i className="ri-eye-line text-sm"></i>
          </span>
          <p className="text-sm font-medium truncate">
            Previewing as <span className="font-bold">{state.targetName || "user"}</span>
            <span className="text-white/80"> ({roleLabel})</span>
          </p>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-white/80 whitespace-nowrap">
            <i className="ri-information-line"></i>
            You are viewing the site through this role
          </span>
        </div>
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          <i className="ri-logout-box-r-line"></i>
          Exit preview
        </button>
      </div>
    </div>
  );
}