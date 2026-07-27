"use client";

import { TenantRecord, portalStatusBadge, portalStatusLabel } from "@/app/dashboard/tenants/TenantsData";

interface TenantQuickViewProps {
  tenant: TenantRecord;
  onClose: () => void;
}

export default function TenantQuickView({ tenant, onClose }: TenantQuickViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#D5D9D5] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-[#3B82F6]">{tenant.fullName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#3A3F3A]">{tenant.fullName}</h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[tenant.portalStatus]}`}>
                {portalStatusLabel[tenant.portalStatus]}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs font-medium text-[#94A3B8] mb-3">Contact Information</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-[#3B82F6] text-sm"></i>
                </div>
                <div>
                  <p className="text-sm text-[#3A3F3A]">{tenant.email || "—"}</p>
                  <p className="text-xs text-[#94A3B8]">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-phone-line text-[#10B981] text-sm"></i>
                </div>
                <div>
                  <p className="text-sm text-[#3A3F3A]">{tenant.phone || "—"}</p>
                  <p className="text-xs text-[#94A3B8]">Phone</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#94A3B8] mb-3">Tenancy</p>
            <div className="bg-[#FBF9F4] rounded-xl p-4">
              {tenant.currentPropertyName ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">Property</span>
                    <span className="text-sm font-medium text-[#3A3F3A]">{tenant.currentPropertyName}</span>
                  </div>
                  {tenant.tenancyRef && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">Reference</span>
                      <span className="text-sm font-medium text-[#3A3F3A]">{tenant.tenancyRef}</span>
                    </div>
                  )}
                  {tenant.tenancyStatus && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">Status</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tenant.tenancyStatus === "active" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                        {tenant.tenancyStatus}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8]">No property linked</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#94A3B8] mb-3">Portal</p>
            <div className="bg-[#FBF9F4] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${portalStatusBadge[tenant.portalStatus]}`}>
                  {portalStatusLabel[tenant.portalStatus]}
                </span>
              </div>
              {tenant.lastLogin && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Last Login</span>
                  <span className="text-sm text-[#3A3F3A]">{tenant.lastLogin}</span>
                </div>
              )}
              {tenant.inviteDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Invited</span>
                  <span className="text-sm text-[#3A3F3A]">{tenant.inviteDate}</span>
                </div>
              )}
            </div>
          </div>

          {tenant.notes && (
            <div>
              <p className="text-xs font-medium text-[#94A3B8] mb-3">Notes</p>
              <div className="bg-[#FBF9F4] rounded-xl p-4">
                <p className="text-sm text-[#3A3F3A]">{tenant.notes}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-[#94A3B8]">Added {tenant.dateAdded}</p>
          </div>
        </div>
      </div>
    </div>
  );
}