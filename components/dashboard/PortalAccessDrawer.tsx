"use client";

import { getPortalStatus, portalTypeConfig } from "@/lib/portalStatus";

interface PortalUser {
  id: string
  personName: string
  personEmail: string
  portalType: string
  relatedRecord: string
  accessKey: string
  inviteDate?: string
  lastActivity?: string
  token?: string
}

interface Props {
  user: PortalUser | null;
  onClose: () => void;
  onResend: (user: PortalUser) => void;
  onSuspend: (user: PortalUser) => void;
  onRestore: (user: PortalUser) => void;
  onRevoke: (user: PortalUser) => void;
  onCopyLink: (user: PortalUser) => void;
  copiedToken: string | null;
  demoMode: boolean;
}

export default function PortalAccessDrawer({ user, onClose, onResend, onSuspend, onRestore, onRevoke, onCopyLink, copiedToken, demoMode }: Props) {
  if (!user) return null;

  const status = getPortalStatus(user.accessKey);
  const typeConfig = portalTypeConfig[user.portalType] || portalTypeConfig.owner;

  const canResend = ["invitation_sent", "invitation_delivered", "expired", "delivery_failed"].includes(user.accessKey);
  const canSuspend = user.accessKey === "active";
  const canRestore = ["suspended", "revoked"].includes(user.accessKey);
  const canRevoke = ["active", "suspended", "invitation_sent", "invitation_delivered", "expired"].includes(user.accessKey);
  const canCopy = !!user.token;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#D5D9D5] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${typeConfig.bg} rounded-lg flex items-center justify-center`}>
              <i className={`${typeConfig.icon} ${typeConfig.color} text-lg`}></i>
            </div>
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">{user.personName}</h2>
              <p className="text-xs text-[#687068]">{typeConfig.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${status.bg} ${status.color}`}>
              <i className={`${status.icon} mr-1.5`}></i>
              {status.label}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-[#FBF9F4] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Email</span>
                <span className="text-sm text-[#3A3F3A]">{user.personEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Related Record</span>
                <span className="text-sm text-[#3A3F3A]">{user.relatedRecord}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Portal Type</span>
                <span className="text-sm text-[#3A3F3A]">{typeConfig.label}</span>
              </div>
              {user.inviteDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Invitation Date</span>
                  <span className="text-sm text-[#3A3F3A]">{user.inviteDate}</span>
                </div>
              )}
              {user.lastActivity && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Last Activity</span>
                  <span className="text-sm text-[#3A3F3A]">{user.lastActivity}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Status</span>
                <span className={`text-sm font-medium ${status.color}`}>{status.meaning}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-[#3A3F3A]">Available Actions</p>
            <div className="flex flex-wrap gap-2">
              {canResend && (
                <button
                  onClick={() => onResend(user)}
                  disabled={demoMode}
                  className="px-4 py-2 text-sm font-medium text-[#3B82F6] bg-[#3B82F6]/10 rounded-lg hover:bg-[#3B82F6]/20 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  Resend Invitation
                </button>
              )}
              {canSuspend && (
                <button
                  onClick={() => onSuspend(user)}
                  disabled={demoMode}
                  className="px-4 py-2 text-sm font-medium text-[#F59E0B] bg-[#F59E0B]/10 rounded-lg hover:bg-[#F59E0B]/20 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  Suspend Access
                </button>
              )}
              {canRestore && (
                <button
                  onClick={() => onRestore(user)}
                  disabled={demoMode}
                  className="px-4 py-2 text-sm font-medium text-[#7A9A7E] bg-[#7A9A7E]/10 rounded-lg hover:bg-[#7A9A7E]/20 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  Restore Access
                </button>
              )}
              {canRevoke && (
                <button
                  onClick={() => onRevoke(user)}
                  disabled={demoMode}
                  className="px-4 py-2 text-sm font-medium text-[#EF4444] bg-[#EF4444]/10 rounded-lg hover:bg-[#EF4444]/20 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  Revoke Access
                </button>
              )}
              {canCopy && (
                <button
                  onClick={() => onCopyLink(user)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    copiedToken === user.token
                      ? "bg-[#7A9A7E] text-white"
                      : "text-[#687068] bg-[#F1F5F9] hover:bg-[#D5D9D5]"
                  }`}
                >
                  {copiedToken === user.token ? "Copied!" : "Copy Invite Link"}
                </button>
              )}
            </div>
          </div>

          {demoMode && (
            <div className="bg-[#FEF9F5] border border-[#F59E0B]/20 rounded-xl p-4">
              <p className="text-xs text-[#687068]">
                Portal actions are disabled in demo mode. In a live account, invitation tokens are generated securely through Supabase Edge Functions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}