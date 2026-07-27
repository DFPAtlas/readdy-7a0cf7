"use client";

import { TenantRecord, portalStatusBadge, portalStatusLabel } from "@/app/dashboard/tenants/TenantsData";

interface TenantCardProps {
  tenant: TenantRecord;
  onView: (tenant: TenantRecord) => void;
}

export default function TenantCard({ tenant, onView }: TenantCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-[#3B82F6]">{tenant.fullName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <button onClick={() => onView(tenant)} className="text-sm font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors truncate block">
            {tenant.fullName}
          </button>
          {tenant.currentPropertyName && (
            <p className="text-xs text-[#687068] truncate">{tenant.currentPropertyName}</p>
          )}
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[tenant.portalStatus]}`}>
          {portalStatusLabel[tenant.portalStatus]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#FBF9F4] rounded-lg p-2">
          <p className="text-[10px] text-[#94A3B8]">Tenancy</p>
          <p className="text-xs font-medium text-[#3A3F3A]">{tenant.tenancyStatus || "Unlinked"}</p>
        </div>
        <div className="bg-[#FBF9F4] rounded-lg p-2">
          <p className="text-[10px] text-[#94A3B8]">Contact</p>
          <p className="text-xs font-medium text-[#3A3F3A] truncate">{tenant.email || "—"}</p>
        </div>
      </div>

      <button
        onClick={() => onView(tenant)}
        className="w-full py-2 text-xs font-medium text-[#C28A78] border border-[#D5D9D5] rounded-lg hover:bg-[#FBF9F4] transition-colors whitespace-nowrap"
      >
        View Details
      </button>
    </div>
  );
}