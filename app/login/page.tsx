"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { activateDemoSession, deactivateDemoSession } from "@/lib/demoMode";
import { getRoleHome, normaliseRole } from "@/lib/rbac";
import EmailOtpLogin from "@/components/auth/EmailOtpLogin";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const completeRegistration = async () => {
    const { error: registrationError } = await supabase.functions.invoke("complete-registration", { body: {} });
    if (registrationError) {
      console.warn("Registration completion was unavailable", registrationError.message);
    }
  };

  const resolveTrustedHome = async (userId: string): Promise<{ home: string | null; error: string | null }> => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        home: null,
        error: "Your account is authenticated but does not have a configured LetHub profile. Please contact support.",
      };
    }

    const role = normaliseRole(profile.role);
    if (!role) {
      return { home: null, error: "Your account role is invalid. Please contact a platform administrator." };
    }
    if (role === "suspended") {
      return { home: null, error: "This account has been suspended. Please contact a platform administrator." };
    }

    return { home: getRoleHome(role), error: null };
  };

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkSession = async () => {
      try {
        deactivateDemoSession();
        const { data, error: userError } = await supabase.auth.getUser();
        if (!active) return;

        if (!userError && data.user) {
          await completeRegistration();
          const { home, error: homeError } = await resolveTrustedHome(data.user.id);
          if (!active) return;
          if (home) {
            startTransition(() => {
              router.replace(home);
            });
            return;
          }
          await supabase.auth.signOut();
          if (homeError) setError(homeError);
        }
      } catch (e) {
        console.error("LetHub session check failed:", e);
      }
      if (!active) return;
      setCheckingSession(false);
    };

    timer = setTimeout(() => {
      if (!active) return;
      console.warn("LetHub session check timed out; showing login form.");
      setCheckingSession(false);
    }, 5000);

    checkSession();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleOtpVerified = async (userId: string): Promise<string | null> => {
    await completeRegistration();
    const { home, error: homeError } = await resolveTrustedHome(userId);
    if (!home) {
      await supabase.auth.signOut();
      return homeError;
    }

    startTransition(() => {
      router.replace(home);
    });
    return null;
  };

  const handleDemoLogin = () => {
    setDemoLoading(true);
    activateDemoSession();
    startTransition(() => {
      router.replace("/dashboard");
    });
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#687068]">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] py-8">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="font-['Pacifico'] text-3xl text-[#C28A78] inline-block">LetHub</Link>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Welcome back</h1>
          <p className="text-sm text-[#687068] mt-1">Sign in to your LetHub account</p>
        </div>

        <EmailOtpLogin onVerified={handleOtpVerified} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#D5D9D5]"></div></div>
          <div className="relative flex justify-center"><span className="bg-[#FBF9F4] px-4 text-xs text-[#94A3B8]">or</span></div>
        </div>

        <button onClick={handleDemoLogin} disabled={demoLoading} className="w-full bg-gradient-to-r from-[#C28A78]/10 to-[#14B8A6]/10 border border-[#C28A78]/30 text-[#C28A78] font-medium py-3 rounded-lg hover:bg-[#C28A78]/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
          <i className="ri-eye-line text-sm"></i>
          {demoLoading ? "Entering demo..." : "Explore Demo Account"}
        </button>
        <p className="text-center text-xs text-[#94A3B8] mt-2">No sign-up required · Estate Agent view</p>

        <p className="text-center text-sm text-[#687068] mt-6">
          Don&apos;t have an account? <Link href="/register" className="text-[#C28A78] font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}