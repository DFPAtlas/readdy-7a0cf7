"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/MobileBottomNav";
import {
  ownerProperties,
  ownerReports,
  ownerQuickActions,
  ownerSummary,
  healthLevelConfig,
  getScoreColor,
} from "./data";

export default function MobileOwnerPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports">("dashboard");
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalHealth = ownerProperties.length > 0
    ? Math.round(ownerProperties.reduce((s, p) => s + p.healthScore, 0) / ownerProperties.length)
    : 0;

  const healthColor = getScoreColor(totalHealth);
  const atRiskCount = ownerProperties.filter((p) => p.healthLevel === "high_risk" || p.healthLevel === "critical").length;

  return (
    <MobileLayout>
      <div className="bg-gradient-to-b from-[#C28A78] to-[#143728] text-white px-4 pt-3 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-white/60">Owner Dashboard</p>
            <h1 className="text-xl font-bold">James Wilson</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactSheet(true)}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <i className="ri-customer-service-2-line text-lg"></i>
            </button>
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center text-sm font-bold">
              JW
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/60">Properties</p>
            <p className="text-lg font-bold">{ownerSummary.totalProperties}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/60">Monthly Rent</p>
            <p className="text-lg font-bold">£{ownerSummary.totalMonthlyRent.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[10px] text-white/60">Occupancy</p>
            <p className="text-lg font-bold">{ownerSummary.occupancyRate}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke={healthColor} strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - totalHealth / 100)}
              />
            </svg>
            <span className="absolute text-base font-bold" style={{ color: healthColor }}>{totalHealth}</span>
          </div>
          <div>
            <p className="text-sm font-semibold">Portfolio Health Score</p>
            <p className="text-[11px] text-white/60">
              {atRiskCount > 0
                ? `${atRiskCount} propert${atRiskCount > 1 ? "ies" : "y"} need${atRiskCount === 1 ? "s" : ""} attention`
                : "All properties in good standing"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3">
        <div className="grid grid-cols-4 gap-2">
          {ownerQuickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform relative"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: action.color + "14" }}
              >
                <i className={`${action.icon} text-lg`} style={{ color: action.color }}></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] text-center leading-tight whitespace-nowrap">
                {action.label}
              </span>
              {action.badge && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "dashboard" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "reports" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3 pb-4" ref={scrollRef}>
        {activeTab === "dashboard" && (
          <>
            {ownerProperties.map((prop) => {
              const hc = healthLevelConfig[prop.healthLevel];
              const sc = getScoreColor(prop.healthScore);
              const circ = 2 * Math.PI * 18;
              const off = circ * (1 - prop.healthScore / 100);

              return (
                <div key={prop.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setSelectedProperty(selectedProperty === prop.id ? null : prop.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                          <circle
                            cx="22" cy="22" r="18" fill="none" stroke={sc} strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={circ} strokeDashoffset={off}
                          />
                        </svg>
                        <span className="absolute text-xs font-bold" style={{ color: sc }}>
                          {prop.healthScore}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#3A3F3A]">{prop.name}</p>
                        <p className="text-[11px] text-[#94A3B8]">{prop.address}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: hc.bg + "20", color: hc.color }}
                          >
                            {hc.label}
                          </span>
                          <span className="text-[11px] text-[#687068]">{prop.tenantName}</span>
                        </div>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <i className={`${selectedProperty === prop.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-[#94A3B8]`}></i>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-[#94A3B8]">Rent</p>
                        <p className={`text-sm font-bold ${prop.rentStatus === "overdue" ? "text-[#EF4444]" : "text-[#3A3F3A]"}`}>
                          £{prop.monthlyRent.toLocaleString()}
                        </p>
                        <p className={`text-[10px] font-medium ${
                          prop.rentStatus === "paid" ? "text-[#10B981]" :
                          prop.rentStatus === "pending" ? "text-[#F59E0B]" : "text-[#EF4444]"
                        }`}>
                          {prop.rentStatus === "paid" ? "Paid" : prop.rentStatus === "pending" ? "Pending" : "Overdue"}
                        </p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-[#94A3B8]">Compliance</p>
                        <p className="text-sm font-bold text-[#3A3F3A]">{prop.complianceOk}/{prop.complianceTotal}</p>
                        <p className={`text-[10px] font-medium ${prop.complianceOk === prop.complianceTotal ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                          {prop.complianceOk === prop.complianceTotal ? "All clear" : `${prop.complianceTotal - prop.complianceOk} issues`}
                        </p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-[#94A3B8]">Maintenance</p>
                        <p className="text-sm font-bold text-[#3A3F3A]">{prop.openMaintenance}</p>
                        <p className={`text-[10px] font-medium ${prop.openMaintenance === 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                          {prop.openMaintenance === 0 ? "None open" : "Open jobs"}
                        </p>
                      </div>
                    </div>
                  </button>

                  {selectedProperty === prop.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-[#F1F5F9] bg-[#F8FAFC]/50">
                      <div className="grid grid-cols-2 gap-2 pt-3">
                        <Link
                          href="/mobile/documents"
                          className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#3A3F3A]"
                        >
                          <div className="w-7 h-7 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-folder-line text-[#3B82F6] text-sm"></i>
                          </div>
                          Documents
                        </Link>
                        <Link
                          href="/mobile/inspections"
                          className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#3A3F3A]"
                        >
                          <div className="w-7 h-7 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-clipboard-line text-[#14B8A6] text-sm"></i>
                          </div>
                          Inspections
                        </Link>
                        <Link
                          href="/mobile/maintenance"
                          className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#3A3F3A]"
                        >
                          <div className="w-7 h-7 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-tools-line text-[#F59E0B] text-sm"></i>
                          </div>
                          Maintenance
                        </Link>
                        <Link
                          href="/mobile/rent"
                          className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#3A3F3A]"
                        >
                          <div className="w-7 h-7 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-coins-line text-[#10B981] text-sm"></i>
                          </div>
                          Rent
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {activeTab === "reports" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Recent Reports</h3>
                <span className="text-[10px] text-[#C28A78] font-medium">{ownerReports.length} reports</span>
              </div>
              <div className="space-y-2">
                {ownerReports.map((report) => {
                  const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
                    inspection: { icon: "ri-clipboard-line", color: "#14B8A6", bg: "#14B8A6" },
                    financial: { icon: "ri-line-chart-line", color: "#3B82F6", bg: "#3B82F6" },
                    compliance: { icon: "ri-shield-check-line", color: "#10B981", bg: "#10B981" },
                    maintenance: { icon: "ri-tools-line", color: "#F59E0B", bg: "#F59E0B" },
                  };
                  const tc = typeConfig[report.type] || typeConfig.inspection;
                  return (
                    <div key={report.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9]">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tc.bg + "14" }}
                      >
                        <i className={`${tc.icon} text-base`} style={{ color: tc.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3A3F3A]">{report.title}</p>
                        <p className="text-[11px] text-[#687068]">{report.property} · {report.date}</p>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className="ri-download-line text-[#94A3B8] text-sm"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Portfolio Overview</h3>
              <div className="space-y-3">
                {[
                  { label: "Rent Collected", value: `£${ownerSummary.rentCollected.toLocaleString()}`, total: `£${ownerSummary.totalMonthlyRent.toLocaleString()}`, pct: Math.round((ownerSummary.rentCollected / ownerSummary.totalMonthlyRent) * 100), color: "#10B981" },
                  { label: "Compliance Rate", value: `${ownerSummary.totalProperties * 6 - ownerSummary.complianceIssues}/${ownerSummary.totalProperties * 6}`, pct: Math.round(((ownerSummary.totalProperties * 6 - ownerSummary.complianceIssues) / (ownerSummary.totalProperties * 6)) * 100), color: "#3B82F6" },
                  { label: "Occupancy", value: `${ownerSummary.occupancyRate}%`, pct: ownerSummary.occupancyRate, color: "#14B8A6" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[#687068]">{item.label}</span>
                      <span className="text-xs font-medium text-[#3A3F3A]">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showContactSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setShowContactSheet(false)}>
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="text-base font-semibold text-[#3A3F3A] mb-4">Contact Your Agency</h3>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                <div className="w-10 h-10 bg-[#C28A78] rounded-xl flex items-center justify-center">
                  <i className="ri-building-4-line text-white text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">Cooper & Co Estates</p>
                  <p className="text-[11px] text-[#687068]">Your managing agent</p>
                </div>
              </div>

              <Link
                href="tel:+441613290456"
                className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl active:bg-[#F1F5F9]"
              >
                <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
                  <i className="ri-phone-line text-[#10B981] text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">0161 329 0456</p>
                  <p className="text-[11px] text-[#687068]">Mon-Fri, 9am-5pm</p>
                </div>
              </Link>

              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
                  <i className="ri-mail-line text-[#3B82F6] text-lg"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">owners@cooperco.co.uk</p>
                  <p className="text-[11px] text-[#687068]">Response within 24 hours</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContactSheet(false)}
              className="w-full py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl active:bg-[#F8FAFC]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}