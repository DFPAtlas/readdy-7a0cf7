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

export default function LandlordCard({
  owner,
  onInvite,
  onResend,
  onDisable,
  onCopyLink,
  copiedToken,
  onEdit,
  onView,
}: {
  owner: Owner;
  onInvite: (o: Owner) => void;
  onResend: (o: Owner) => void;
  onDisable: (o: Owner) => void;
  onCopyLink: (token: string | undefined) => void;
  copiedToken: string | null;
  onEdit: (o: Owner) => void;
  onView: (o: Owner) => void;
}) {
  const hasActions = owner.portalStatus === "active" || owner.portalStatus === "invited" || owner.portalStatus === "disabled";

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-[#C28A78]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[#C28A78]">{owner.fullName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3A3F3A] truncate">{owner.fullName}</p>
            {owner.companyName && <p className="text-xs text-[#94A3B8] truncate">{owner.companyName}</p>}
            <p className="text-xs text-[#687068] mt-0.5">{owner.email}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${portalBadge(owner.portalStatus)}`}>
          {portalStatusLabel[owner.portalStatus]}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#687068]">
        <span className="flex items-center gap-1">
          <i className="ri-building-4-line text-[#94A3B8]"></i>
          {owner.totalProperties} properties
        </span>
        <span>{owner.phone}</span>
      </div>

      <div className="flex items-center gap-1.5 pt-1 border-t border-[#D5D9D5]">
        <button
          onClick={() => onView(owner)}
          className="flex-1 text-xs font-medium text-[#C28A78] py-1.5 rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap cursor-pointer"
        >
          View details
        </button>
        <button
          onClick={() => onEdit(owner)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          <i className="ri-edit-line text-[#687068] text-xs"></i>
        </button>
        {owner.portalStatus === "not_invited" && (
          <button
            onClick={() => onInvite(owner)}
            className="px-2.5 py-1 text-xs font-medium text-[#C28A78] bg-[#C28A78]/5 rounded-lg hover:bg-[#C28A78]/10 transition-colors whitespace-nowrap cursor-pointer"
          >
            Invite
          </button>
        )}
        {owner.portalStatus === "invited" && (
          <>
            <button onClick={() => onResend(owner)} className="px-2.5 py-1 text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/5 rounded-lg hover:bg-[#3B82F6]/10 transition-colors whitespace-nowrap cursor-pointer">Resend</button>
            <button onClick={() => onDisable(owner)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FEE2E2] transition-colors cursor-pointer">
              <i className="ri-close-circle-line text-[#EF4444] text-xs"></i>
            </button>
          </>
        )}
        {owner.portalStatus === "active" && (
          <>
            <button onClick={() => onCopyLink(owner.portalToken)} className={`w-7 h-7 flex items-center justify-center rounded hover:bg-[#D5D9D5] transition-colors cursor-pointer ${copiedToken === owner.portalToken ? "text-[#7A9A7E]" : "text-[#94A3B8]"}`}>
              <i className={`${copiedToken === owner.portalToken ? "ri-check-line" : "ri-file-copy-line"} text-xs`}></i>
            </button>
            <button onClick={() => onDisable(owner)} className="px-2.5 py-1 text-xs font-medium text-[#EF4444] bg-[#EF4444]/5 rounded-lg hover:bg-[#FEE2E2] transition-colors whitespace-nowrap cursor-pointer">Disable</button>
          </>
        )}
      </div>
    </div>
  );
}