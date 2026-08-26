"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { normaliseRole, type AppRole } from "@/lib/rbac";
import { isDemoAccount } from "@/lib/demoMode";
import { LOGIN_PATH, UNAUTHORISED_PATH, SUSPENDED_PATH } from "@/lib/auth";
import { getImpersonation } from "@/lib/impersonation";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  allowDemo?: boolean;
  showDemoBanner?: boolean;
}

export default function AuthGuard({
  children,
  allowedRoles,
  allowDemo = false,
  showDemoBanner = false,
}: AuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const redirect = (path: string) => {
      setTimeout(() => {
        if (active) router.replace(path);
      }, 0);
    };

    const check = async () => {
      try {
        if (allowDemo && isDemoAccount()) {
          if (!active) return;
          setDemo(true);
          setReady(true);
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user ?? null;

        if (!active) return;

        if (!user) {
          redirect(LOGIN_PATH);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        const role = normaliseRole(profile?.role ?? null);

        if (!profile || !role) {
          redirect(UNAUTHORISED_PATH);
          return;
        }

        let effectiveRole = role;
        const impersonation = getImpersonation();
        if (
          impersonation &&
          role === "platform_admin" &&
          impersonation.realUserId === user.id &&
          allowedRoles &&
          allowedRoles.some((r) => r === "landlord" || r === "tenant" || r === "contractor")
        ) {
          effectiveRole = impersonation.role;
        }

        if (effectiveRole === "suspended") {
          redirect(SUSPENDED_PATH);
          return;
        }

        if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
          redirect(UNAUTHORISED_PATH);
          return;
        }

        if (active) setReady(true);
      } catch {
        if (!active) return;
        redirect(LOGIN_PATH);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    timeoutId = setTimeout(() => {
      if (!active) return;
      redirect(LOGIN_PATH);
    }, 15000);

    check();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, allowedRoles, allowDemo]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#687068]">Checking your access...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {demo && showDemoBanner ? (
        <div className="flex items-center justify-center gap-2 bg-[#C28A78] px-4 py-1.5 text-xs font-medium text-white">
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-eye-line"></i>
          </span>
          Demo Mode — sample data only. No live customer data is shown.
        </div>
      ) : null}
      {children}
    </>
  );
}