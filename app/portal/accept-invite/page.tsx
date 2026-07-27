"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AcceptInvitePage() {
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"input" | "details" | "register" | "accepted">("input");
  const [inviteDetails, setInviteDetails] = useState<{ type: string; portalAccessId: string; email: string; date: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, []);

  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (token.trim().length < 4) {
      setError("Please enter a valid invite code.");
      return;
    }
    setLoading(true);

    const { data: invite, error: inviteError } = await supabase
      .from("portal_invites")
      .select("id, portal_access_id, status, expires_at, created_at")
      .eq("token_hash", token.trim())
      .maybeSingle();

    if (inviteError) {
      setLoading(false);
      setError("Unable to verify this invitation. Please try again.");
      return;
    }

    if (!invite) {
      setLoading(false);
      setError("Invitation not found. Please check your invite code and try again.");
      return;
    }

    if (invite.status === "accepted") {
      setLoading(false);
      setError("This invitation has already been accepted. Please sign in to your portal.");
      return;
    }

    if (invite.status === "revoked") {
      setLoading(false);
      setError("This invitation has been revoked. Please contact your letting agent.");
      return;
    }

    if (new Date(invite.expires_at) < new Date()) {
      setLoading(false);
      setError("This invitation has expired. Please contact your letting agent for a new one.");
      return;
    }

    const { data: portalAccess } = await supabase
      .from("portal_access")
      .select("id, user_type")
      .eq("id", invite.portal_access_id)
      .maybeSingle();

    if (!portalAccess) {
      setLoading(false);
      setError("Unable to verify this invitation. Please contact your letting agent.");
      return;
    }

    const inviteType = portalAccess.user_type === "owner" ? "owner" : "tenant";

    setInviteDetails({
      type: inviteType,
      portalAccessId: invite.portal_access_id,
      email: "",
      date: new Date(invite.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    });

    setStep("register");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: inviteDetails?.type === "owner" ? "landlord" : "tenant",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    if (inviteDetails?.type === "owner") {
      await supabase.from("owner_portal_access").upsert({
        profile_id: userId,
        is_active: true,
        created_at: new Date().toISOString(),
      }, { onConflict: "profile_id" });
    } else {
      await supabase.from("tenant_portal_access").upsert({
        profile_id: userId,
        is_active: true,
        created_at: new Date().toISOString(),
      }, { onConflict: "profile_id" });
    }

    setStep("accepted");
    setLoading(false);
  };

  if (step === "accepted") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-[#10B981]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-[#10B981] text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mb-2">Invite Accepted!</h1>
          <p className="text-sm text-[#687068] mb-2">Your {inviteDetails?.type === "owner" ? "owner" : "tenant"} portal account is ready.</p>
          <p className="text-sm text-[#687068] mb-8">You can now sign in to access your dashboard.</p>
          <Link
            href={inviteDetails?.type === "owner" ? "/owner/login" : "/tenant/login"}
            className="inline-flex items-center gap-2 bg-[#C28A78] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
          >
            Go to Sign In
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    );
  }

  if (step === "register" && inviteDetails) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="font-['Pacifico'] text-3xl text-[#C28A78]">LetHub</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Create Your Account</h1>
            <p className="text-sm text-[#687068] mt-1">You have been invited as an {inviteDetails.type}</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <div className="bg-[#F0FDF4] rounded-xl p-4 mb-6 flex items-center gap-3">
              <div className={`w-10 h-10 ${inviteDetails.type === "owner" ? "bg-[#3B82F6]" : "bg-[#8B5CF6]"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${inviteDetails.type === "owner" ? "ri-macbook-line" : "ri-smartphone-line"} text-white text-lg`}></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3A3F3A] capitalize">{inviteDetails.type} Portal</p>
                <p className="text-xs text-[#687068]">Invited {inviteDetails.date}</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-error-warning-line text-sm"></i>
                  </div>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C28A78] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#143828] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Setting up..." : "Accept Invite & Create Account"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setStep("input")} className="text-xs text-[#687068] hover:text-[#3A3F3A] transition-colors">
                Use a different invite code
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-['Pacifico'] text-3xl text-[#C28A78]">LetHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Accept Portal Invite</h1>
          <p className="text-sm text-[#687068] mt-1">Enter your invite code to get started</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <form onSubmit={handleManualLookup} className="space-y-4">
            {error && (
              <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-error-warning-line text-sm"></i>
                </div>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Invite Code</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your invite code or link here"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
              />
              <p className="text-xs text-[#94A3B8] mt-1.5">You should have received this from your letting agent.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C28A78] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Look Up Invite"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
            <p className="text-xs text-[#94A3B8]">Already have an account?</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link href="/owner/login" className="text-sm font-medium text-[#C28A78] hover:underline">Owner Sign In</Link>
              <span className="text-[#E2E8F0]">|</span>
              <Link href="/tenant/login" className="text-sm font-medium text-[#C28A78] hover:underline">Tenant Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}