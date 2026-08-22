"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { normaliseRole, getRoleHome } from "@/lib/rbac";
import { safeInternalPath } from "@/lib/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    let active = true;

    const run = async () => {
      const code = searchParams.get("code");
      const fallback = safeInternalPath(searchParams.get("next")) || "/dashboard";

      if (!code) {
        if (active) setStatus("Invalid sign-in link. Redirecting...");
        setTimeout(() => router.replace("/login?error=auth"), 800);
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!active) return;

      if (error) {
        setStatus("Unable to verify your sign-in link. Redirecting...");
        setTimeout(() => router.replace("/login?error=auth"), 800);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        const role = normaliseRole(profile?.role ?? null);
        if (role && role !== "suspended") {
          router.replace(getRoleHome(role));
          return;
        }
      }

      router.replace(fallback);
    };

    run();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-[#687068]">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}