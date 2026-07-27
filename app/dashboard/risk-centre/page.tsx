"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount } from "@/lib/demoMode";
import {
  propertyRisks,
  maintenanceHotspots,
  highRiskSummary,
  riskLevelConfig,
  PropertyRisk,
  RiskFactor,
  MaintenanceHotspot,
} from "./RiskCentreData";

const riskScoreColor = (score: number) => {
  if (score <= 30) return "text-[#EF4444]";
  if (score <= 60) return "text-[#F59E0B]";
  return "text-[#10B981]";
};

const riskScoreBg = (score: number) => {
  if (score <= 30) return "bg-[#EF4444]";
  if (score <= 60) return "bg-[#F59E0B]";
  return "bg-[#10B981]";
};

export default function RiskCentrePage() {
  const [selectedProperty, setSelectedProperty] = useState<PropertyRisk | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  if (!demoMode && isDemoAccount()) setDemoMode(true);

  const sortedByRisk = [...propertyRisks].sort((a, b) => a.riskScore - b.riskScore);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Property Risk Centre</h1>
            <p className="text-sm text-[#687068] mt-1">Identify and manage risk across your entire portfolio</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="risk-centre" title="Property Risk Centre">
              The Risk Centre aggregates compliance, maintenance, and inspection data to assign risk scores per property. Lower scores = higher risk. Use this to prioritise which properties need attention first.
            </DemoHelperTip>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Critical Risk", value: highRiskSummary.criticalCount, color: "bg-[#EF4444]", icon: "ri-error-warning-line", borderColor: "border-[#EF4444]/30" },
            { label: "High Risk", value: highRiskSummary.highCount, color: "bg-[#F97316]", icon: "ri-alert-line", borderColor: "border-[#F97316]/30" },
            { label: "Medium Risk", value: highRiskSummary.mediumCount, color: "bg-[#F59E0B]", icon: "ri-information-line", borderColor: "border-[#F59E0B]/30" },
            { label: "Low Risk", value: highRiskSummary.lowCount, color: "bg-[#10B981]", icon: "ri-check-line", borderColor: "border-[#10B981]/30" },
            { label: "Avg Risk Score", value: highRiskSummary.averageRiskScore, color: "bg-[#3B82F6]", icon: "ri-bar-chart-line", borderColor: "border-[#3B82F6]/30" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl border ${s.borderColor} p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 flex items-center justify-center ${s.color} rounded-md`}>
                  <i className={`${s.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Properties by Risk Level</h2>
                <span className="text-xs text-[#94A3B8]">{propertyRisks.length} properties</span>
              </div>
              <div className="p-5 space-y-3">
                {sortedByRisk.map((prop) => {
                  const config = riskLevelConfig[prop.riskLevel];
                  return (
                    <div key={prop.id} className={`rounded-xl border p-4 ${config.bg} cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setSelectedProperty(prop)}>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={prop.image} alt={prop.propertyName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-[#3A3F3A]">{prop.propertyName}</h3>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                              {prop.riskLevel.charAt(0).toUpperCase() + prop.riskLevel.slice(1)} Risk
                            </span>
                          </div>
                          <p className="text-xs text-[#687068]">{prop.address}, {prop.city} {prop.postcode}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {prop.expiredCertificates > 0 && (
                              <span className="text-xs font-medium text-[#EF4444] flex items-center gap-1">
                                <i className="ri-close-circle-line text-xs"></i>
                                {prop.expiredCertificates} expired
                              </span>
                            )}
                            {prop.expiringCertificates > 0 && (
                              <span className="text-xs font-medium text-[#F59E0B] flex items-center gap-1">
                                <i className="ri-time-line text-xs"></i>
                                {prop.expiringCertificates} expiring
                              </span>
                            )}
                            {prop.overdueInspections > 0 && (
                              <span className="text-xs font-medium text-[#8B5CF6] flex items-center gap-1">
                                <i className="ri-clipboard-line text-xs"></i>
                                {prop.overdueInspections} inspection overdue
                              </span>
                            )}
                            {prop.maintenanceUrgent > 0 && (
                              <span className="text-xs font-medium text-[#F97316] flex items-center gap-1">
                                <i className="ri-tools-line text-xs"></i>
                                {prop.maintenanceUrgent} urgent job{prop.maintenanceUrgent > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className={`w-14 h-14 rounded-full ${riskScoreBg(prop.riskScore)} flex items-center justify-center`}>
                            <span className="text-white text-lg font-bold">{prop.riskScore}</span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-1">Risk Score</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Maintenance Hotspots</h2>
              </div>
              <div className="p-5 space-y-3">
                {maintenanceHotspots.map((hotspot) => (
                  <div key={hotspot.trade} className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#3A3F3A]">{hotspot.trade}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        hotspot.trend === "up" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                        hotspot.trend === "down" ? "bg-[#10B981]/10 text-[#10B981]" :
                        "bg-[#94A3B8]/10 text-[#94A3B8]"
                      }`}>
                        <i className={`${hotspot.trend === "up" ? "ri-arrow-up-line" : hotspot.trend === "down" ? "ri-arrow-down-line" : "ri-subtract-line"} text-xs mr-0.5`}></i>
                        {hotspot.trend === "up" ? "Rising" : hotspot.trend === "down" ? "Falling" : "Stable"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#687068]">
                      <span>{hotspot.count} open jobs</span>
                      <span>{hotspot.avgDaysOpen}d avg open</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1.5">{hotspot.properties.slice(0, 2).join(", ")}{hotspot.properties.length > 2 ? ` +${hotspot.properties.length - 2} more` : ""}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Risk Breakdown</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Expired Certificates", value: highRiskSummary.totalExpiredCerts, color: "bg-[#EF4444]", icon: "ri-close-circle-line" },
                  { label: "Expiring Certificates", value: highRiskSummary.totalExpiringCerts, color: "bg-[#F59E0B]", icon: "ri-time-line" },
                  { label: "Overdue Inspections", value: highRiskSummary.overdueInspections, color: "bg-[#8B5CF6]", icon: "ri-clipboard-line" },
                  { label: "Open Maintenance", value: highRiskSummary.totalOpenMaintenance, color: "bg-[#3B82F6]", icon: "ri-tools-line" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 flex items-center justify-center ${item.color} rounded-md`}>
                        <i className={`${item.icon} text-white text-xs`}></i>
                      </div>
                      <span className="text-sm text-[#475569]">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#3A3F3A]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedProperty && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProperty(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${riskScoreBg(selectedProperty.riskScore)}`}>
                    <span className="text-white text-lg font-bold">{selectedProperty.riskScore}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">{selectedProperty.propertyName}</h3>
                    <p className="text-xs text-[#687068]">{selectedProperty.address}, {selectedProperty.city} {selectedProperty.postcode}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProperty(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#3A3F3A] mb-3">Risk Factors</h4>
                  <div className="space-y-2">
                    {selectedProperty.riskFactors.map((factor, i) => (
                      <div key={i} className={`rounded-lg p-3 border ${
                        factor.severity === "critical" ? "bg-[#FEF2F2] border-[#FECACA]" :
                        factor.severity === "high" ? "bg-[#FFF7ED] border-[#FED7AA]" :
                        "bg-[#FFFBEB] border-[#FDE68A]"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            factor.severity === "critical" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                            factor.severity === "high" ? "bg-[#F97316]/10 text-[#F97316]" :
                            "bg-[#F59E0B]/10 text-[#F59E0B]"
                          }`}>
                            {factor.severity}
                          </span>
                          <span className="text-xs font-medium text-[#3A3F3A]">{factor.type}</span>
                        </div>
                        <p className="text-sm text-[#475569]">{factor.description}</p>
                        {factor.daysOverdue > 0 && (
                          <p className="text-xs text-[#EF4444] mt-1 font-medium">{factor.daysOverdue} days overdue</p>
                        )}
                      </div>
                    ))}
                    {selectedProperty.riskFactors.length === 0 && (
                      <p className="text-sm text-[#94A3B8]">No active risk factors</p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/property/${selectedProperty.id}`}
                  className="block w-full text-center text-xs font-medium text-white bg-[#C28A78] rounded-lg py-2.5 hover:bg-[#143828] transition-colors"
                >
                  View Property Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}