"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  formatSessionDate,
  formatTimeZone,
  useActiveDevice,
} from "@/lib/accountSession";
import { logSecurityEvent } from "@/lib/securityEvents";

interface SessionsSectionProps {
  onToast: (message: string) => void;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <i className={`${icon} text-[#94A3B8] text-sm`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#687068]">{label}</p>
        <p className="text-sm text-[#3A3F3A] font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export default function SessionsSection({ onToast }: SessionsSectionProps) {
  const router = useRouter();
  const { device, loading, error } = useActiveDevice();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const signOutOthers = async () => {
    setWorking(true);
    setActionError(null);

    const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });

    setWorking(false);
    setConfirmOpen(false);

    if (signOutError) {
      setActionError("We couldn't sign out your other sessions. Please try again.");
      return;
    }

    await logSecurityEvent("session_revoked", "Signed out of all other sessions");
    onToast("Signed out of all other sessions");
  };

  const signOutThisDevice = async () => {
    setWorking(true);
    setActionError(null);
    await supabase.auth.signOut({ scope: "local" });
    router.push("/login");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-[#3A3F3A]">Active Sessions</h2>
        <p className="text-xs text-[#687068] mt-1">
          The device you&apos;re signed in on right now, taken from your live session.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-3 py-2.5">
          <i className="ri-error-warning-line text-[#EF4444] text-sm mt-0.5"></i>
          <p className="text-xs text-[#B91C1C] leading-relaxed">{error}</p>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-2 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-3 py-2.5">
          <i className="ri-error-warning-line text-[#EF4444] text-sm mt-0.5"></i>
          <p className="text-xs text-[#B91C1C] leading-relaxed">{actionError}</p>
        </div>
      )}

      {loading && !device && (
        <div className="flex items-center gap-3 p-4 bg-[#FBF9F4] rounded-xl border border-[#D5D9D5]">
          <i className="ri-loader-4-line animate-spin text-[#C28A78]"></i>
          <p className="text-sm text-[#687068]">Checking this device...</p>
        </div>
      )}

      {device && (
        <div className="rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-4 bg-[#FBF9F4]">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className={`${device.icon} text-[#C28A78] text-lg`}></i>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[#3A3F3A]">{device.deviceLabel}</p>
                  <span className="text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">
                    This device
                  </span>
                  {device.standalone && (
                    <span className="text-[10px] font-medium text-[#687068] bg-[#E2E8F0] px-1.5 py-0.5 rounded-full">
                      Installed app
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#687068] mt-1">
                  {device.demo
                    ? "Demo workspace session"
                    : `${formatTimeZone(device.timeZone)}${device.language ? ` · ${device.language}` : ""}`}
                </p>
              </div>
            </div>
            <button
              onClick={signOutThisDevice}
              disabled={working}
              className="text-xs font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              Sign out
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white">
            <InfoRow
              icon="ri-login-box-line"
              label="Signed in"
              value={device.demo ? "Demo workspace" : formatSessionDate(device.signedInAt)}
            />
            <InfoRow icon="ri-shield-keyhole-line" label="Sign-in method" value={device.method} />
            <InfoRow
              icon="ri-time-line"
              label="Session renews until"
              value={device.demo ? "Not applicable in demo" : formatSessionDate(device.expiresAt)}
            />
            <InfoRow
              icon="ri-global-line"
              label="Time zone"
              value={device.timeZone ? formatTimeZone(device.timeZone) : "Not reported"}
            />
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 bg-[#F1F5F9] rounded-lg px-3 py-2.5">
        <i className="ri-information-line text-[#687068] text-sm mt-0.5"></i>
        <p className="text-xs text-[#687068] leading-relaxed">
          Only the device you&apos;re using can be verified from here. If you think someone else has your
          password, sign out of all other sessions and change it below.
        </p>
      </div>

      <div className="pt-4 border-t border-[#D5D9D5]">
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={device?.demo === true || working}
          className="text-sm font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign out of all other sessions
        </button>
        {device?.demo && (
          <p className="text-[11px] text-[#94A3B8] mt-1">Not available in the demo workspace.</p>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F172A]/40"
            onClick={() => (working ? null : setConfirmOpen(false))}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center flex-shrink-0">
                <i className="ri-logout-box-r-line text-[#EF4444] text-lg"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#3A3F3A]">Sign out other sessions?</h3>
                <p className="text-sm text-[#687068] mt-1 leading-relaxed">
                  Every other browser and device signed into this account will be signed out. You&apos;ll stay
                  signed in here.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={working}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#3A3F3A] border border-[#D5D9D5] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={signOutOthers}
                disabled={working}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {working ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                    Signing out
                  </>
                ) : (
                  "Yes, sign out others"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}