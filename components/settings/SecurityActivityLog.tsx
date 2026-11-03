"use client";

import { formatEventTime, useSecurityEvents } from "@/lib/securityEvents";
import type { SecurityEventType } from "@/lib/securityEvents";

const EVENT_STYLES: Record<SecurityEventType, { icon: string; tone: string; label: string }> = {
  sign_in: { icon: "ri-login-box-line", tone: "#10B981", label: "Sign in" },
  email_otp: { icon: "ri-mail-check-line", tone: "#10B981", label: "Email code" },
  sign_out: { icon: "ri-logout-box-r-line", tone: "#687068", label: "Sign out" },
  password_changed: { icon: "ri-lock-password-line", tone: "#F59E0B", label: "Password changed" },
  session_revoked: { icon: "ri-shield-keyhole-line", tone: "#EF4444", label: "Sessions revoked" },
  profile_updated: { icon: "ri-user-settings-line", tone: "#C28A78", label: "Profile updated" },
};

export default function SecurityActivityLog() {
  const { events, loading, error, reload } = useSecurityEvents(12);

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-[#3A3F3A]">Security Activity</h2>
          <p className="text-xs text-[#687068] mt-1">
            Recent sign-ins, password changes and session actions on your account.
          </p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-[#687068] hover:text-[#3A3F3A] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <i className={`ri-refresh-line text-sm ${loading ? "animate-spin" : ""}`}></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-3 py-2.5">
          <i className="ri-error-warning-line text-[#EF4444] text-sm mt-0.5"></i>
          <p className="text-xs text-[#B91C1C] leading-relaxed">{error}</p>
        </div>
      )}

      {loading && events.length === 0 && (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3 p-3 rounded-lg bg-[#FBF9F4] animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-[#E2E8F0]"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 rounded bg-[#E2E8F0]"></div>
                <div className="h-2.5 w-24 rounded bg-[#E2E8F0]"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-3">
            <i className="ri-shield-check-line text-[#94A3B8] text-xl"></i>
          </div>
          <p className="text-sm text-[#3A3F3A] font-medium">No activity recorded yet</p>
          <p className="text-xs text-[#687068] mt-1">
            Your next sign-in or password change will appear here.
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="divide-y divide-[#D5D9D5]">
          {events.map((event) => {
            const style = EVENT_STYLES[event.event_type] || EVENT_STYLES.sign_in;
            return (
              <div key={event.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${style.tone}1A` }}
                >
                  <i className={`${style.icon} text-sm`} style={{ color: style.tone }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#3A3F3A]">
                      {event.description || style.label}
                    </p>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${style.tone}1A`, color: style.tone }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#687068] mt-0.5 truncate">
                    {formatEventTime(event.created_at)}
                    {event.device ? ` · ${event.device}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}