"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { normaliseRole, type AppRole } from "@/lib/rbac";
import { isDemoAccount } from "@/lib/demoMode";
import { LOGIN_PATH, UNAUTHORISED_PATH, SUSPENDED_PATH } from "@/lib/auth";
import { getImpersonation } from "@/lib/impersonation";
import { afterMount } from "@/lib/safeNavigate";

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
    const pendingRedirects: Array<() => void> = [];

    const redirect = (path: string) => {
      pendingRedirects.push(
        afterMount(() => {
          if (active) router.replace(path);
        })
      );
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
      pendingRedirects.forEach((cancel) => cancel());
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
        <div role="status" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-[#3A3F3A] px-4 py-3 text-sm text-white">
          <span className="flex items-center gap-2 font-semibold">
            <i className="ri-eye-line" aria-hidden="true"></i>
            You&apos;re in the demo
          </span>
          <span className="text-white/80">This is a sample agency. Nothing you do here is saved, and no account has been created.</span>
          <span className="flex items-center gap-2">
            <a href="/register" className="rounded-md bg-[#C28A78] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B07A69]">
              Create your account
            </a>
            <button
              type="button"
              onClick={async () => {
                const { deactivateDemoSession } = await import("@/lib/demoMode");
                deactivateDemoSession();
                window.location.assign("/");
              }}
              className="rounded-md border border-white/40 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              Exit demo
            </button>
          </span>
        </div>
      ) : null}
      {children}
    </>
  );
}