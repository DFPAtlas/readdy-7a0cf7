"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";
import { requirementTypeIcons, requirementTypeColors } from "@/lib/complianceStatus";

interface ComplianceCheck {
  id: number;
  type: string;
  property: string;
  status: "overdue" | "today" | "upcoming" | "completed" | "draft";
  expiryDate: string;
  assignedTo: string;
  lastUpdated: string;
  offline: boolean;
}

const complianceChecks: ComplianceCheck[] = [
  { id: 1, type: "Gas Safety Certificate", property: "45 Baker Street", status: "overdue", expiryDate: "25 May 2026", assignedTo: "You", lastUpdated: "22 May 2026", offline: false },
  { id: 2, type: "Smoke Alarm Check", property: "8 The Crescent", status: "today", expiryDate: "30 Jun 2026", assignedTo: "You", lastUpdated: "—", offline: false },
  { id: 3, type: "EPC Assessment", property: "12 Rose Avenue", status: "today", expiryDate: "15 Oct 2026", assignedTo: "Alex Turner", lastUpdated: "—", offline: false },
  { id: 4, type: "EICR Inspection", property: "Flat 4B Oak Street", status: "upcoming", expiryDate: "15 Jan 2029", assignedTo: "You", lastUpdated: "—", offline: false },
  { id: 5, type: "Legionella Assessment", property: "45 Baker Street", status: "upcoming", expiryDate: "20 Mar 2027", assignedTo: "You", lastUpdated: "—", offline: false },
  { id: 6, type: "Fire Risk Assessment", property: "14 Oak Avenue", status: "completed", expiryDate: "30 Sep 2026", assignedTo: "You", lastUpdated: "18 Jun 2026", offline: false },
  { id: 7, type: "Smoke Alarm Check", property: "22 Riverside Court", status: "draft", expiryDate: "—", assignedTo: "You", lastUpdated: "20 Jun 2026", offline: true },
  { id: 8, type: "EICR Inspection", property: "9 Hillcrest Road", status: "completed", expiryDate: "10 Apr 2027", assignedTo: "Alex Turner", lastUpdated: "15 Jun 2026", offline: false },
];

const statusLabels: Record<string, string> = {
  overdue: "Overdue",
  today: "Today",
  upcoming: "Upcoming",
  completed: "Completed",
  draft: "Draft",
};

const statusBadgeStyles: Record<string, string> = {
  overdue: "bg-[#C46868]/10 text-[#C46868]",
  today: "bg-[#D4A85C]/10 text-[#D4A85C]",
  upcoming: "bg-[#8A9FB0]/10 text-[#8A9FB0]",
  completed: "bg-[#7A9A7E]/10 text-[#7A9A7E]",
  draft: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

const filterOptions = ["All", "Overdue", "Today", "Upcoming", "Completed"];

export default function MobileCompliancePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  const filtered = activeFilter === "All"
    ? complianceChecks
    : complianceChecks.filter((c) => c.status === activeFilter.toLowerCase());

  const overdueCount = complianceChecks.filter((c) => c.status === "overdue").length;
  const todayCount = complianceChecks.filter((c) => c.status === "today").length;
  const draftCount = complianceChecks.filter((c) => c.status === "draft").length;
  const completedCount = complianceChecks.filter((c) => c.status === "completed").length;

  return (
    <MobileLayout>
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-5">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Compliance Checks</h1>
          <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <i className="ri-add-line text-lg"></i>
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/70">
          <span>{overdueCount} overdue</span>
          <span>{todayCount} today</span>
          {draftCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A85C]"></span>
              {draftCount} offline draft{draftCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 -mt-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Overdue", value: overdueCount, color: "text-[#C46868]" },
            { label: "Today", value: todayCount, color: "text-[#D4A85C]" },
            { label: "Drafts", value: draftCount, color: "text-[#94A3B8]" },
            { label: "Done", value: completedCount, color: "text-[#7A9A7E]" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => {
                const mapping: Record<string, string> = { Overdue: "Overdue", Today: "Today", Drafts: "Draft", Done: "Completed" };
                setActiveFilter(mapping[s.label] || s.label);
              }}
              className="bg-white rounded-xl shadow-sm p-2.5 text-center"
            >
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-[#687068]">{s.label}</p>
            </button>
          ))}
        </div>
      </div>

      {draftCount > 0 && (
        <div className="px-4 mt-3">
          <div className="flex items-center gap-2 bg-[#D4A85C]/10 border border-[#D4A85C]/20 rounded-lg px-3 py-2">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-smartphone-line text-[#D4A85C] text-sm"></i>
            </div>
            <p className="text-xs text-[#D4A85C]">
              {draftCount} check{draftCount > 1 ? "s" : ""} saved offline. Connect to sync.
            </p>
          </div>
        </div>
      )}

      <div className="px-4 mt-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setActiveFilter(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === opt ? "bg-[#C28A78] text-white" : "bg-white text-[#687068] border border-[#D5D9D5]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 space-y-3 mb-6">
        {filtered.map((check) => (
          <button
            key={check.id}
            onClick={() => setSelectedCheck(check)}
            className="w-full bg-white rounded-xl p-4 shadow-sm text-left"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${requirementTypeColors[check.type] || "bg-[#8A9FB0]"} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${requirementTypeIcons[check.type] || "ri-shield-check-line"} text-white`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[#3A3F3A] truncate">{check.type}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {check.offline && (
                      <div className="w-4 h-4 flex items-center justify-center" title="Saved offline">
                        <i className="ri-smartphone-line text-[#D4A85C] text-xs"></i>
                      </div>
                    )}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadgeStyles[check.status]}`}>
                      {statusLabels[check.status]}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#687068] mb-1">{check.property}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#94A3B8]">
                    {check.status === "completed" || check.status === "draft"
                      ? `Updated ${check.lastUpdated}`
                      : check.status === "overdue"
                      ? `Expired ${check.expiryDate}`
                      : `Due ${check.expiryDate}`}
                  </span>
                  {check.status === "today" && (
                    <span className="text-[10px] font-medium text-[#D4A85C]">Start check &rarr;</span>
                  )}
                  {check.status === "draft" && (
                    <span className="text-[10px] font-medium text-[#C28A78]">Resume &rarr;</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedCheck && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedCheck(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#D5D9D5] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Check Details</h3>
              <button onClick={() => setSelectedCheck(null)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 ${requirementTypeColors[selectedCheck.type] || "bg-[#8A9FB0]"} rounded-xl flex items-center justify-center`}>
                <i className={`${requirementTypeIcons[selectedCheck.type] || "ri-shield-check-line"} text-white text-2xl`}></i>
              </div>
              <div>
                <p className="font-semibold text-[#3A3F3A]">{selectedCheck.type}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeStyles[selectedCheck.status]}`}>
                  {statusLabels[selectedCheck.status]}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-[#FBF9F4] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Property</span>
                <span className="text-sm text-[#3A3F3A]">{selectedCheck.property}</span>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Assigned to</span>
                <span className="text-sm text-[#3A3F3A]">{selectedCheck.assignedTo}</span>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Due / Expiry</span>
                <span className={`text-sm ${selectedCheck.status === "overdue" ? "text-[#C46868] font-medium" : "text-[#3A3F3A]"}`}>{selectedCheck.expiryDate}</span>
              </div>
              {selectedCheck.offline && (
                <div className="bg-[#D4A85C]/10 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className="ri-smartphone-line text-[#D4A85C] text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#D4A85C]">Saved locally</p>
                    <p className="text-[10px] text-[#D4A85C]/70">Connect to the internet to sync this check</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selectedCheck.status === "today" || selectedCheck.status === "overdue" ? (
                <>
                  <button onClick={() => setShowUploadSheet(true)} className="py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                    <i className="ri-upload-cloud-line mr-1"></i>Add Evidence
                  </button>
                  <button className="py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl whitespace-nowrap">
                    <i className="ri-check-line mr-1"></i>Mark Done
                  </button>
                </>
              ) : selectedCheck.status === "draft" ? (
                <>
                  <button className="py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                    <i className="ri-edit-line mr-1"></i>Resume
                  </button>
                  <button className="py-3 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-xl whitespace-nowrap">
                    <i className="ri-delete-bin-line mr-1"></i>Discard
                  </button>
                </>
              ) : (
                <button className="py-3 col-span-2 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl whitespace-nowrap">
                  <i className="ri-file-text-line mr-1"></i>View Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showUploadSheet && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1 bg-[#D5D9D5] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Add Evidence</h3>
              <button onClick={() => setShowUploadSheet(false)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 border border-[#D5D9D5] rounded-xl">
                <div className="w-10 h-10 bg-[#EBE5DA] rounded-xl flex items-center justify-center">
                  <i className="ri-camera-line text-[#687068] text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#3A3F3A]">Take Photo</p>
                  <p className="text-xs text-[#94A3B8]">Capture evidence directly</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-4 border border-[#D5D9D5] rounded-xl">
                <div className="w-10 h-10 bg-[#EBE5DA] rounded-xl flex items-center justify-center">
                  <i className="ri-image-line text-[#687068] text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#3A3F3A]">Choose from Gallery</p>
                  <p className="text-xs text-[#94A3B8]">Select existing photos</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-4 border border-[#D5D9D5] rounded-xl">
                <div className="w-10 h-10 bg-[#EBE5DA] rounded-xl flex items-center justify-center">
                  <i className="ri-file-text-line text-[#687068] text-lg"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#3A3F3A]">Upload Document</p>
                  <p className="text-xs text-[#94A3B8]">PDF, JPG or PNG</p>
                </div>
              </button>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Notes</label>
                <textarea placeholder="Add observation notes..." maxLength={500} rows={3} className="w-full px-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4] focus:outline-none focus:border-[#C28A78] resize-none"></textarea>
              </div>
              <button className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                Save Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}