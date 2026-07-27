"use client";

import { Owner, portalStatusLabel } from "@/app/dashboard/landlords/LandlordsData";

const portalBadge = (status: string): string => {
  const map: Record<string, string> = {
    active: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
    invited: "bg-[#3B82F6]/10 text-[#3B82F6]",
    not_invited: "bg-[#94A3B8]/10 text-[#94A3B8]",
    disabled: "bg-[#EF4444]/10 text-[#EF4444]",
  };
  return map[status] || "bg-[#94A3B8]/10 text-[#94A3B8]";
};

export default function LandlordQuickView({
  owner,
  onClose,
  onInvite,
  onResend,
  onDisable,
  onCopyLink,
  copiedToken,
  onViewFull,
}: {
  owner: Owner;
  onClose: () => void;
  onInvite: (o: Owner) => void;
  onResend: (o: Owner) => void;
  onDisable: (o: Owner) => void;
  onCopyLink: (token: string | undefined) => void;
  copiedToken: string | null;
  onViewFull: (o: Owner) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-[#D5D9D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C28A78]/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-[#C28A78]">{owner.fullName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#3A3F3A]">{owner.fullName}</h3>
              {owner.companyName && <p className="text-xs text-[#94A3B8]">{owner.companyName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Portal Status */}
          <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#687068] uppercase tracking-wide">Portal Access</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${portalBadge(owner.portalStatus)}`}>
                {portalStatusLabel[owner.portalStatus]}
              </span>
            </div>
            {owner.portalStatus === "active" && (
              <div className="space-y-2 text-sm">
                <p className="text-[#3A3F3A]">Last login: {owner.lastLogin || "—"}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => onCopyLink(owner.portalToken)} className="text-xs font-medium text-[#C28A78] hover:underline cursor-pointer">
                    {copiedToken === owner.portalToken ? "Copied!" : "Copy invite link"}
                  </button>
                  <button onClick={() => onDisable(owner)} className="text-xs font-medium text-[#EF4444] hover:underline cursor-pointer">Disable</button>
                </div>
              </div>
            )}
            {owner.portalStatus === "invited" && (
              <div className="space-y-2 text-sm">
                <p className="text-[#687068]">Invited {owner.inviteDate || "—"} · Awaiting response</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => onResend(owner)} className="text-xs font-medium text-[#3B82F6] hover:underline cursor-pointer">Resend invite</button>
                  <button onClick={() => onCopyLink(owner.portalToken)} className="text-xs font-medium text-[#C28A78] hover:underline cursor-pointer">Copy link</button>
                </div>
              </div>
            )}
            {owner.portalStatus === "not_invited" && (
              <button onClick={() => onInvite(owner)} className="text-sm font-medium text-[#C28A78] hover:underline cursor-pointer">
                Send portal invitation →
              </button>
            )}
            {owner.portalStatus === "disabled" && (
              <div className="space-y-2 text-sm">
                <p className="text-[#687068]">Portal access has been disabled</p>
                <button onClick={() => onInvite(owner)} className="text-xs font-medium text-[#C28A78] hover:underline cursor-pointer">Re-invite</button>
              </div>
            )}
          </div>

          {/* Contact Summary */}
          <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
            <p className="text-xs font-medium text-[#687068] uppercase tracking-wide mb-3">Contact</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <i className="ri-mail-line text-[#94A3B8]"></i>
                <span className="text-[#3A3F3A]">{owner.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <i className="ri-phone-line text-[#94A3B8]"></i>
                <span className="text-[#3A3F3A]">{owner.phone}</span>
              </div>
              {owner.address && owner.address !== "-" && (
                <div className="flex items-center gap-2 text-sm">
                  <i className="ri-map-pin-line text-[#94A3B8]"></i>
                  <span className="text-[#3A3F3A]">{owner.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
            <p className="text-xs font-medium text-[#687068] uppercase tracking-wide mb-3">Portfolio</p>
            <p className="text-2xl font-bold text-[#3A3F3A]">{owner.totalProperties}</p>
            <p className="text-xs text-[#687068] mt-1">properties · Added {owner.dateAdded}</p>
            {owner.linkedProperties.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {owner.linkedProperties.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm text-[#3A3F3A]">
                    <i className="ri-building-4-line text-[#94A3B8] text-xs"></i>
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {owner.notes && (
            <div className="bg-[#FBF9F4] rounded-xl border border-[#D5D9D5] p-4">
              <p className="text-xs font-medium text-[#687068] uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-[#3A3F3A]">{owner.notes}</p>
            </div>
          )}

          {/* Full details */}
          <button
            onClick={() => onViewFull(owner)}
            className="w-full text-sm font-medium text-[#C28A78] py-3 border border-[#D5D9D5] rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer whitespace-nowrap"
          >
            View full landlord details →
          </button>
        </div>
      </div>
    </div>
  );
}