"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { complianceItems, propertyCompliance, ComplianceItem, PropertyCompliance } from "../../compliance/ComplianceData";
import {
  ComplianceStatusKey,
  complianceStatusMap,
  getComplianceStatus,
  requirementTypeIcons,
  requirementTypeColors,
  LEGAL_DISCLAIMER,
} from "@/lib/complianceStatus";

export default function LandlordCompliancePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyCompliance | null>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewItem, setRenewItem] = useState<ComplianceItem | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const filtered = complianceItems.filter((item) => {
    const matchesSearch = item.type.toLowerCase().includes(search.toLowerCase()) || item.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const criticalCount = complianceItems.filter((i) => i.status === "Critical" || i.status === "Expired" || i.status === "Action Required").length;
  const expiringCount = complianceItems.filter((i) => i.status === "Expiring Soon").length;
  const scheduledCount = 0;
  const validCount = complianceItems.filter((i) => i.status === "Valid").length;

  const handleRenew = () => { setShowRenewModal(false); setRenewItem(null); };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Overview</Link>
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line text-xs"></i></div>
            <span className="text-[#3A3F3A] font-medium">Compliance</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Property Compliance</h1>
              <p className="text-sm text-[#687068] mt-1">Track certificates and legal requirements across your properties</p>
            </div>
          </div>
        </div>

        {criticalCount > 0 && (
          <div className="flex items-center gap-3 bg-[#C46868]/10 border border-[#C46868]/20 rounded-lg px-4 py-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#C46868] rounded-lg flex-shrink-0">
              <i className="ri-error-warning-line text-white text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#C46868]">{criticalCount} issue{criticalCount > 1 ? "s" : ""} require{criticalCount === 1 ? "s" : ""} your attention</p>
              <p className="text-xs text-[#687068]">Expired or missing certificates need action</p>
            </div>
          </div>
        )}

        {criticalCount === 0 && expiringCount > 0 && (
          <div className="flex items-center gap-3 bg-[#D4A85C]/10 border border-[#D4A85C]/20 rounded-lg px-4 py-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#D4A85C] rounded-lg flex-shrink-0">
              <i className="ri-time-line text-white text-sm"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#D4A85C]">{expiringCount} certificate{expiringCount > 1 ? "s" : ""} expiring soon</p>
              <p className="text-xs text-[#687068]">Schedule renewals before the expiry date</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Critical Issues", value: criticalCount, key: "critical", bg: "bg-[#C46868]", icon: "ri-error-warning-line", color: "text-[#C46868]" },
            { label: "Expiring Soon", value: expiringCount, key: "expiring", bg: "bg-[#D4A85C]", icon: "ri-time-line", color: "text-[#D4A85C]" },
            { label: "Scheduled", value: scheduledCount, key: "scheduled", bg: "bg-[#8A9FB0]", icon: "ri-calendar-check-line", color: "text-[#8A9FB0]" },
            { label: "Up to Date", value: validCount, key: "valid", bg: "bg-[#7A9A7E]", icon: "ri-check-line", color: "text-[#7A9A7E]" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => {
                if (stat.key === "critical") setStatusFilter("Expired");
                else if (stat.key === "expiring") setStatusFilter("Expiring Soon");
                else if (stat.key === "valid") setStatusFilter("Valid");
                else setStatusFilter("All");
              }}
              className="bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:shadow-md hover:border-[#C28A78] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 flex items-center justify-center ${stat.bg} rounded-md`}>
                  <i className={`${stat.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#3A3F3A] mb-3">Your Properties</h2>
          <div className="space-y-3">
            {propertyCompliance.map((property) => {
              const items = complianceItems.filter((i) => i.propertyId === property.propertyId);
              const nextDeadline = items.filter((i) => i.status !== "Valid" && i.status !== "N/A").sort((a, b) => {
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
              })[0];
              return (
                <div key={property.propertyId} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FBF9F4] transition-colors"
                    onClick={() => setSelectedProperty(selectedProperty?.propertyId === property.propertyId ? null : property)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={property.image} alt={property.propertyName} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#3A3F3A]">{property.propertyName}</h3>
                        {property.isHMO && <span className="text-[10px] font-medium px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-full">HMO</span>}
                      </div>
                      <p className="text-xs text-[#687068]">{property.address}, {property.city}</p>
                      {nextDeadline && (
                        <p className="text-xs text-[#C46868] mt-0.5">Next: {nextDeadline.type} — {nextDeadline.expiryDate}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                        property.overallStatus === "Compliant" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" :
                        property.overallStatus === "Attention" ? "bg-[#D4A85C]/10 text-[#D4A85C]" :
                        "bg-[#C46868]/10 text-[#C46868]"
                      }`}>
                        {property.overallStatus}
                      </span>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={`${selectedProperty?.propertyId === property.propertyId ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-[#94A3B8]`}></i>
                      </div>
                    </div>
                  </div>
                  {selectedProperty?.propertyId === property.propertyId && (
                    <div className="border-t border-[#D5D9D5] px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
                            <div className={`w-8 h-8 ${requirementTypeColors[item.type] || item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className={`${requirementTypeIcons[item.type] || item.icon} text-white text-sm`}></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#3A3F3A] truncate">{item.type}</p>
                              <p className="text-xs text-[#687068]">{item.expiryDate} &middot; {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : item.daysLeft > 500 ? "N/A" : `${item.daysLeft}d left`}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getComplianceStatus(complianceStatusMap[item.status] as ComplianceStatusKey || "valid").bg}/10 ${getComplianceStatus(complianceStatusMap[item.status] as ComplianceStatusKey || "valid").color}`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-search-line text-[#94A3B8] text-sm"></i></div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificates..." className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
          </div>
          <div className="relative">
            <button onClick={() => setStatusDropdown(!statusDropdown)} className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]">
              <span>Status: {statusFilter}</span>
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i></div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[140px]">
                {["All", "Critical", "Expired", "Expiring Soon", "Action Required", "Valid", "N/A"].map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#EBE5DA]">{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-[#D5D9D5] p-5 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedItem(item)}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 ${requirementTypeColors[item.type] || item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <div className="w-5 h-5 flex items-center justify-center"><i className={`${requirementTypeIcons[item.type] || item.icon} text-white text-lg`}></i></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#3A3F3A] truncate">{item.type}</h3>
                  <p className="text-xs text-[#687068] truncate">{item.propertyName}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getComplianceStatus(complianceStatusMap[item.status] as ComplianceStatusKey || "valid").bg}/10 ${getComplianceStatus(complianceStatusMap[item.status] as ComplianceStatusKey || "valid").color}`}>
                  {item.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-xs text-[#687068]">Expiry</span><span className="text-sm font-medium text-[#3A3F3A]">{item.expiryDate}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-[#687068]">Days left</span><span className={`text-sm font-medium ${item.daysLeft < 0 ? "text-[#C46868]" : item.daysLeft <= 30 ? "text-[#D4A85C]" : "text-[#7A9A7E]"}`}>{item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : item.daysLeft > 500 ? "N/A" : `${item.daysLeft}d`}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-[#687068]">Reference</span><span className="text-xs font-medium text-[#3A3F3A] font-mono">{item.referenceNumber}</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D5D9D5] flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="flex-1 text-center text-xs font-medium text-[#C28A78] hover:text-[#143828] py-1.5 rounded-lg hover:bg-[#EBE5DA] transition-colors">View Details</button>
                <button onClick={(e) => { e.stopPropagation(); setRenewItem(item); setShowRenewModal(true); }} className="flex-1 text-center text-xs font-medium text-[#C28A78] hover:text-[#143828] py-1.5 rounded-lg hover:bg-[#EBE5DA] transition-colors">Renew</button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-[#D5D9D5]">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-[#EBE5DA] rounded-full">
              <i className="ri-file-search-line text-[#94A3B8] text-xl"></i>
            </div>
            <p className="text-sm text-[#687068]">No certificates found</p>
            <p className="text-xs text-[#94A3B8] mt-1">Try adjusting your filters</p>
          </div>
        )}

        {showDisclaimer && (
          <div className="bg-[#EBE5DA]/50 rounded-lg p-3 text-xs text-[#687068] italic">{LEGAL_DISCLAIMER}</div>
        )}
        <button onClick={() => setShowDisclaimer(!showDisclaimer)} className="text-xs text-[#94A3B8] hover:text-[#687068] underline">
          {showDisclaimer ? "Hide guidance" : "Important guidance about compliance information"}
        </button>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-[#D5D9D5]">
              <div className={`w-10 h-10 ${requirementTypeColors[selectedItem.type] || selectedItem.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <div className="w-5 h-5 flex items-center justify-center"><i className={`${requirementTypeIcons[selectedItem.type] || selectedItem.icon} text-white text-lg`}></i></div>
              </div>
              <div className="flex-1"><h3 className="text-sm font-semibold text-[#3A3F3A]">{selectedItem.type}</h3><p className="text-xs text-[#687068]">{selectedItem.propertyName}</p></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getComplianceStatus(complianceStatusMap[selectedItem.status] as ComplianceStatusKey || "valid").bg}/10 ${getComplianceStatus(complianceStatusMap[selectedItem.status] as ComplianceStatusKey || "valid").color}`}>{selectedItem.status}</span>
              <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-[#94A3B8] mb-1">Reference</p><p className="text-sm font-medium text-[#3A3F3A] font-mono">{selectedItem.referenceNumber}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Category</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.category}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Issued</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.issuedDate}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Expiry</p><p className={`text-sm font-medium ${selectedItem.daysLeft < 0 ? "text-[#C46868]" : selectedItem.daysLeft <= 30 ? "text-[#D4A85C]" : "text-[#3A3F3A]"}`}>{selectedItem.expiryDate}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Issuer</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.issuer}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Required</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.requiredByLaw ? "Yes" : "No"}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Renewal</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.renewalPeriod}</p></div>
                <div><p className="text-xs text-[#94A3B8] mb-1">Last Action</p><p className="text-sm font-medium text-[#3A3F3A]">{selectedItem.lastAction}</p></div>
              </div>
              <div><p className="text-xs text-[#94A3B8] mb-1">Notes</p><p className="text-sm text-[#3A3F3A]">{selectedItem.notes || "No notes"}</p></div>
              <div className="flex items-center gap-3 pt-2">
                <button className="flex-1 bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Download</button>
                <button onClick={() => { setSelectedItem(null); setRenewItem(selectedItem); setShowRenewModal(true); }} className="flex-1 border border-[#D5D9D5] text-sm font-medium py-2.5 rounded-lg hover:bg-[#EBE5DA] transition-colors text-[#3A3F3A]">Renew</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRenewModal && renewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRenewModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#D5D9D5]">
              <h3 className="text-sm font-semibold text-[#3A3F3A]">Renew Certificate</h3>
              <button onClick={() => setShowRenewModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-[#FBF9F4] rounded-lg p-3"><p className="text-xs text-[#94A3B8] mb-1">Certificate</p><p className="text-sm font-medium text-[#3A3F3A]">{renewItem.type}</p><p className="text-xs text-[#687068]">{renewItem.propertyName}</p></div>
              <div><label className="text-xs text-[#687068] mb-1 block">New Expiry Date</label><input type="date" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">New Reference Number</label><input type="text" placeholder="Enter new reference number" className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78]" /></div>
              <div><label className="text-xs text-[#687068] mb-1 block">Notes</label><textarea placeholder="Add renewal notes..." maxLength={500} rows={3} className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"></textarea></div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowRenewModal(false)} className="flex-1 border border-[#D5D9D5] text-sm font-medium py-2.5 rounded-lg hover:bg-[#EBE5DA] transition-colors text-[#3A3F3A]">Cancel</button>
                <button onClick={handleRenew} className="flex-1 bg-[#C28A78] hover:bg-[#143828] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">Confirm Renewal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}