"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAccountProfile } from "@/lib/accountProfile";
import { logSecurityEvent } from "@/lib/securityEvents";

interface PasswordSectionProps {
  onToast: (message: string) => void;
}

const FIELD_CLASS =
  "w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]";

export default function PasswordSection({ onToast }: PasswordSectionProps) {
  const { profile } = useAccountProfile();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const email = profile?.email || "";
  const demo = profile?.demo === true;

  const validate = (): string | null => {
    if (!current) return "Enter your current password.";
    if (next.length < 8) return "Your new password needs at least 8 characters.";
    if (next === current) return "Your new password must be different from your current password.";
    if (next !== confirm) return "The new passwords don't match.";
    return null;
  };

  const requestSubmit = () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setModalOpen(true);
  };

  const applyChange = async () => {
    setSaving(true);
    setError(null);

    if (demo) {
      setSaving(false);
      setModalOpen(false);
      setError("Password changes aren't available in the demo workspace. Sign in with a real account to update it.");
      return;
    }

    if (!email) {
      setSaving(false);
      setModalOpen(false);
      setError("We couldn't confirm your account email. Please refresh and try again.");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });

    if (verifyError) {
      setSaving(false);
      setModalOpen(false);
      setError("That current password isn't correct. Please check and try again.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: next });

    if (updateError) {
      setSaving(false);
      setModalOpen(false);
      setError(updateError.message || "We couldn't update your password. Please try again.");
      return;
    }

    setSaving(false);
    setModalOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    await logSecurityEvent("password_changed", "Password changed from your device");
    onToast("Password updated");
  };

  const strength = next.length === 0 ? 0 : next.length < 8 ? 1 : next.length < 12 ? 2 : 3;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-[#3A3F3A]">Password &amp; Security</h2>
        <p className="text-xs text-[#687068] mt-1">
          You&apos;ll stay signed in on this device after changing it.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-3 py-2.5">
          <i className="ri-error-warning-line text-[#EF4444] text-sm mt-0.5"></i>
          <p className="text-xs text-[#B91C1C] leading-relaxed">{error}</p>
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          requestSubmit();
        }}
      >
        <div>
          <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Current password</label>
          <input
            type="password"
            name="current_password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Enter current password"
            className={FIELD_CLASS}
            disabled={demo}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">New password</label>
          <input
            type="password"
            name="new_password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Min 8 characters"
            className={FIELD_CLASS}
            disabled={demo}
          />
          {next.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                <div
                  className={`h-full transition-all ${strength === 1 ? "w-1/3 bg-[#F59E0B]" : strength === 2 ? "w-2/3 bg-[#C28A78]" : "w-full bg-[#10B981]"}`}
                ></div>
              </div>
              <span className="text-[11px] font-medium text-[#687068]">
                {strength === 1 ? "Weak" : strength === 2 ? "Good" : "Strong"}
              </span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Confirm new password</label>
          <input
            type="password"
            name="confirm_password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className={FIELD_CLASS}
            disabled={demo}
          />
          {confirm.length > 0 && confirm !== next && (
            <p className="text-[11px] text-[#EF4444] mt-1.5">Passwords don&apos;t match yet</p>
          )}
        </div>

        {demo && (
          <div className="flex items-start gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 rounded-lg px-3 py-2.5">
            <i className="ri-information-line text-[#8B5CF6] text-sm mt-0.5"></i>
            <p className="text-xs text-[#6D28D9] leading-relaxed">
              You&apos;re in the demo workspace, so password changes are disabled here.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-[#D5D9D5]">
          <button
            type="submit"
            disabled={demo}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </form>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F172A]/40"
            onClick={() => (saving ? null : setModalOpen(false))}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C28A78]/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-lock-password-line text-[#C28A78] text-lg"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#3A3F3A]">Change your password?</h3>
                <p className="text-sm text-[#687068] mt-1 leading-relaxed">
                  We&apos;ll sign you in with your current password to verify it&apos;s really you, then set the new one.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#3A3F3A] border border-[#D5D9D5] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={applyChange}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#C28A78] hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                    Updating
                  </>
                ) : (
                  "Yes, update password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}