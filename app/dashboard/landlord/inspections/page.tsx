"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { inspectionReports, properties } from "../LandlordData";

export default function LandlordInspectionsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("reports");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Portal</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">Inspection Reports</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Inspection Reports</h1>
              <p className="text-sm text-[#687068] mt-1">View property inspection reports and findings</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Completed", value: inspectionReports.filter((r) => r.status === "Completed").length, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
            { label: "Scheduled", value: inspectionReports.filter((r) => r.status === "Scheduled").length, icon: "ri-calendar-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "Total", value: inspectionReports.length, icon: "ri-clipboard-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <i className={`${stat.icon} ${stat.color} text-sm`}></i>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center border-b border-[#E2E8F0] overflow-x-auto">
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "reports" ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className="ri-clipboard-line text-sm"></i>
              Inspection Reports
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "upcoming" ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className="ri-calendar-line text-sm"></i>
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("observations")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "observations" ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className="ri-eye-line text-sm"></i>
              Observations
            </button>
          </div>

          <div className="p-6">
            {activeTab === "reports" && (
              <div className="space-y-3">
                {inspectionReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    <button
                      onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${report.status === "Completed" ? "bg-[#10B981]/10" : "bg-[#3B82F6]/10"}`}>
                        <i className={`${report.status === "Completed" ? "ri-check-double-line text-[#10B981]" : "ri-calendar-line text-[#3B82F6]"} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[#3A3F3A]">{report.type}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${report.status === "Completed" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#3B82F6]/10 text-[#3B82F6]"}`}>
                            {report.status}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${report.rating === "Excellent" ? "bg-[#10B981]/10 text-[#10B981]" : report.rating === "Good" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                            {report.rating}
                          </span>
                        </div>
                        <p className="text-xs text-[#687068] mt-0.5">{report.property} · {report.date} · {report.inspector}</p>
                      </div>
                      <i className={`ri-arrow-down-s-line text-[#94A3B8] text-sm ${selectedReport === report.id ? "rotate-180" : ""}`}></i>
                    </button>
                    {selectedReport === report.id && (
                      <div className="px-5 pb-4 border-t border-[#E2E8F0] pt-3">
                        <p className="text-sm text-[#687068] mb-4">{report.notes}</p>
                        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                          <span className="flex items-center gap-1">
                            <i className="ri-user-line"></i>
                            Inspector: {report.inspector}
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-calendar-line"></i>
                            {report.date}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button className="text-sm font-medium text-[#C28A78] hover:text-[#143828] hover:underline flex items-center gap-1">
                            <i className="ri-file-line text-xs"></i>
                            View Full Report
                          </button>
                          <button className="text-sm font-medium text-[#687068] hover:text-[#3A3F3A] hover:underline flex items-center gap-1">
                            <i className="ri-download-line text-xs"></i>
                            Download PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "upcoming" && (
              <div className="space-y-3">
                {inspectionReports
                  .filter((r) => r.status === "Scheduled")
                  .map((report) => (
                    <div key={report.id} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-calendar-line text-[#3B82F6] text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#3A3F3A]">{report.type}</p>
                          <p className="text-xs text-[#687068]">{report.property} · {report.date}</p>
                        </div>
                        <span className="text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">Scheduled</span>
                      </div>
                    </div>
                  ))}
                {inspectionReports.filter((r) => r.status === "Scheduled").length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-calendar-check-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#94A3B8]">No upcoming inspections</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "observations" && (
              <div className="space-y-3">
                {inspectionReports
                  .filter((r) => r.status === "Completed" && r.notes)
                  .map((report) => (
                    <div key={report.id} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{report.type}</span>
                        <span className="text-xs text-[#94A3B8]">{report.property} · {report.date}</span>
                      </div>
                      <p className="text-sm text-[#475569]">{report.notes}</p>
                    </div>
                  ))}
                {inspectionReports.filter((r) => r.status === "Completed" && r.notes).length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-eye-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#94A3B8]">No observations recorded</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Properties with Inspection History */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Properties</h3>
          <div className="space-y-3">
            {properties.map((property) => {
              const reports = inspectionReports.filter((r) => r.property === property.name);
              return (
                <div key={property.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <img src={property.image} alt={property.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{property.name}</p>
                      <p className="text-xs text-[#687068]">{property.address}, {property.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[#94A3B8]">{reports.length} reports</span>
                    <Link href={`/dashboard/portfolio/${property.id}`} className="text-xs font-medium text-[#C28A78] hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[#3A3F3A]">Request Inspection Report</h3>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <p className="text-sm text-[#687068] mb-4">Request your agent to generate a formal inspection report for your records.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Property</label>
                <div className="flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  <span className="text-sm text-[#3A3F3A]">Rose Court Flat 2A</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Inspection Type</label>
                <div className="flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  <span className="text-sm text-[#3A3F3A]">Routine Inspection</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setShowSuccessToast(true);
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
                  }}
                  className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap"
                >
                  <i className="ri-send-plane-line mr-1"></i>
                  Request Report
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#C28A78] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <i className="ri-checkbox-circle-line text-lg"></i>
          <div>
            <p className="text-sm font-medium">Request Sent</p>
            <p className="text-xs text-white/70">Your agent will generate the report</p>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}