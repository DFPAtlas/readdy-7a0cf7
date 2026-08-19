"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasResetToken = hashParams.has("access_token") && hashParams.get("type") === "recovery";

      if (hasResetToken) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.hash.substring(1)
        );
        if (!active) return;
        if (exchangeError) {
          setError("This password reset link is invalid or has expired. Please request a new one.");
          setHasSession(false);
        } else {
          setHasSession(true);
        }
      } else if (data.session) {
        setHasSession(true);
      } else {
        setError("This password reset link is invalid or has expired. Please request a new one.");
        setHasSession(false);
      }
      if (!active) return;
      setChecking(false);
    };
    checkSession();
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess("Your password has been reset. You can now sign in with your new password.");
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#687068]">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4] py-8">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="font-['Pacifico'] text-3xl text-[#C28A78] inline-block">LetHub</Link>
          <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Set new password</h1>
          <p className="text-sm text-[#687068] mt-1">Choose a new password for your account</p>
        </div>

        {hasSession === false && error && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626]">{error}</div>
            <Link href="/login" className="block w-full text-center bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium py-3 rounded-lg transition-colors">
              Back to sign in
            </Link>
          </div>
        )}

        {hasSession === true && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#DC2626]">{error}</div>}
            {success && <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#16A34A]">{success}</div>}

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">New password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
                <i className="ri-lock-line text-[#94A3B8] text-sm"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  required
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="w-5 h-5 flex items-center justify-center" aria-label={showPassword ? "Hide password" : "Show password"}>
                  <i className={showPassword ? "ri-eye-off-line text-[#94A3B8] text-sm" : "ri-eye-line text-[#94A3B8] text-sm"}></i>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Confirm password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white focus-within:border-[#C28A78] focus-within:ring-1 focus-within:ring-[#C28A78]">
                <i className="ri-lock-line text-[#94A3B8] text-sm"></i>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {success ? (
              <Link href="/login" className="block w-full text-center bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium py-3 rounded-lg transition-colors">
                Go to sign in
              </Link>
            ) : (
              <button type="submit" disabled={loading} className="w-full bg-[#C28A78] hover:bg-[#B07A69] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">
                {loading ? "Updating..." : "Reset password"}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}