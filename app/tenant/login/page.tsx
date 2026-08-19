"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { usePortalBranding } from "@/components/PortalBranding";

export default function TenantLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { branding, primary, primaryHover } = usePortalBranding();

  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError("Unable to verify your account. Please try again.");
      setLoading(false);
      return;
    }

    const { data: portalAccess, error: portalError } = await supabase
      .from("tenant_portal_access")
      .select("id, tenant_id, is_active")
      .eq("profile_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (portalError || !portalAccess) {
      await supabase.auth.signOut();
      setError("No tenant portal access found for this account. Please contact your letting agent.");
      setLoading(false);
      return;
    }

    window.location.href = "/tenant/dashboard";
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSent(false);
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt={branding.agencyName} className="h-8 mx-auto object-contain" />
                ) : (
                  <span className="font-['Pacifico'] text-3xl" style={{ color: primary }}>{branding.agencyName}</span>
                )}
              </Link>
              <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Forgot your password?</h1>
              <p className="text-sm text-[#687068] mt-1">We will send you a reset link to your email</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              {resetSent ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-checkbox-circle-line text-[#16A34A] text-lg"></i>
                      </div>
                      <span className="font-medium text-sm text-[#16A34A]">Check your inbox</span>
                    </div>
                    <p className="text-sm text-[#687068]">We have sent a password reset link to <strong>{resetEmail}</strong>.</p>
                  </div>
                  <button type="button" onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail(""); setError(""); }} className="w-full text-white text-sm font-medium py-2.5 rounded-lg transition-colors whitespace-nowrap" style={{ backgroundColor: primary }}>
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && (
                    <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-error-warning-line text-sm"></i>
                      </div>
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="tenant@email.com"
                      className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-white"
                      style={{ borderColor: "#E2E8F0" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = primary)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
                    />
                  </div>
                  <button type="submit" disabled={resetLoading} className="w-full text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap" style={{ backgroundColor: primary }}>
                    {resetLoading ? "Sending..." : "Send reset link"}
                  </button>
                  <button type="button" onClick={() => { setForgotMode(false); setError(""); }} className="w-full text-sm text-[#687068] hover:text-[#3A3F3A] py-1.5 transition-colors whitespace-nowrap">
                    Back to sign in
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.agencyName} className="h-8 mx-auto object-contain" />
              ) : (
                <span className="font-['Pacifico'] text-3xl" style={{ color: primary }}>{branding.agencyName}</span>
              )}
            </Link>
            <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Tenant Portal</h1>
            <p className="text-sm text-[#687068] mt-1">Sign in to manage your tenancy</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-error-warning-line text-sm"></i>
                  </div>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenant@email.com"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:ring-1 bg-white"
                  style={{ outlineColor: primary, borderColor: "#E2E8F0" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = primary)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:ring-1 bg-white"
                  style={{ outlineColor: primary, borderColor: "#E2E8F0" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = primary)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
                />
                <div className="mt-1.5 text-right">
                  <button type="button" onClick={() => { setForgotMode(true); setError(""); }} className="text-xs hover:underline whitespace-nowrap" style={{ color: primary }}>
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                style={{ backgroundColor: primary }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = primaryHover; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = primary; }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
              <p className="text-xs text-[#94A3B8] mb-2">Received an invite link?</p>
              <Link href="/portal/accept-invite" className="text-sm font-medium hover:underline" style={{ color: primary }}>
                Accept your invite
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/login" className="text-xs text-[#687068] hover:text-[#3A3F3A] transition-colors">
              Are you an agent? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}