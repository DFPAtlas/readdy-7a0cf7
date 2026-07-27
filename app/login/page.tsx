"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { activateDemoSession } from "@/lib/demoMode";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/dashboard";
        return;
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleDemoLogin = () => {
    setDemoLoading(true);
    activateDemoSession();
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const msg = authError.message || "";
      if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("not confirmed")) {
        setError("Your email hasn't been confirmed yet. Please check your inbox for the confirmation link, or contact your platform administrator to have your account confirmed manually.");
      } else if (msg.toLowerCase().includes("invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(msg);
      }
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Login succeeded but session was not created. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.session.user.id)
      .maybeSingle();

    if (profile?.role === "platform_admin") {
      window.location.href = "/dashboard/supa-admin";
    } else {
      window.location.href = "/dashboard";
    }
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
          <Link href="/" className="font-['Pacifico'] text-3xl text-[#C28A78] inline-block">
            LetHub
          </Link>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Welcome back</h1>
          <p className="text-sm text-[#687068] mt-1">Sign in to your LetHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email address</label>
            <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-mail-line text-[#94A3B8] text-sm"></i>
              </div>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Password</label>
            <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-lock-line text-[#94A3B8] text-sm"></i>
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-5 h-5 flex items-center justify-center"
              >
                <i className={showPassword ? "ri-eye-off-line text-[#94A3B8] text-sm" : "ri-eye-line text-[#94A3B8] text-sm"}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium py-3 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D5D9D5]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FBF9F4] px-4 text-xs text-[#94A3B8]">or</span>
          </div>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full bg-gradient-to-r from-[#C28A78]/10 to-[#14B8A6]/10 border border-[#C28A78]/30 text-[#C28A78] font-medium py-3 rounded-lg hover:bg-[#C28A78]/20 transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-eye-line text-sm"></i>
          </div>
          {demoLoading ? "Entering demo..." : "Explore Demo Account"}
        </button>
        <p className="text-center text-xs text-[#94A3B8] mt-2">No sign-up required · Estate Agent view</p>

        <p className="text-center text-sm text-[#687068] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#C28A78] font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}