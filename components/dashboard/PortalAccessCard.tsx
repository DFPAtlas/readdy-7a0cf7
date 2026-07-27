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
}

interface Props {
  user: PortalUser;
  onClick: () => void;
}

export default function PortalAccessCard({ user, onClick }: Props) {
  const status = getPortalStatus(user.accessKey);
  const typeConfig = portalTypeConfig[user.portalType] || portalTypeConfig.owner;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-[#D5D9D5] p-4 hover:border-[#C28A78] hover:shadow-sm transition-all text-left cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${typeConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <i className={`${typeConfig.icon} ${typeConfig.color} text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[#3A3F3A] truncate">{user.personName}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-[#687068] mt-0.5">{user.personEmail}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded">{typeConfig.label}</span>
            <span className="text-[10px] text-[#687068] truncate">{user.relatedRecord}</span>
          </div>
          {user.inviteDate && (
            <p className="text-[10px] text-[#94A3B8] mt-1">Invited {user.inviteDate}</p>
          )}
        </div>
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <i className="ri-arrow-right-s-line text-[#94A3B8]"></i>
        </div>
      </div>
    </button>
  );
}