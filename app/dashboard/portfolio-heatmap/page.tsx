"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import { isDemoAccount } from "@/lib/demoMode";
import {
  heatmapProperties,
  heatmapSummary,
  healthLevelConfig,
} from "./HeatmapData";

export default function PortfolioHeatmapPage() {
  const [selectedMetric, setSelectedMetric] = useState<"healthScore" | "complianceHealth" | "maintenanceHealth" | "rentHealth" | "inspectionHealth">("healthScore");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (isDemoAccount()) setDemoMode(true);
  }, []);

  const metricLabels: Record<string, string> = {
    healthScore: "Overall Health",
    complianceHealth: "Compliance",
    maintenanceHealth: "Maintenance",
    rentHealth: "Rent",
    inspectionHealth: "Inspections",
  };

  const metricColors: Record<string, { green: string; amber: string; red: string }> = {
    healthScore: { green: "bg-[#10B981]", amber: "bg-[#F59E0B]", red: "bg-[#EF4444]" },
    complianceHealth: { green: "bg-[#059669]", amber: "bg-[#D97706]", red: "bg-[#DC2626]" },
    maintenanceHealth: { green: "bg-[#0891B2]", amber: "bg-[#CA8A04]", red: "bg-[#B91C1C]" },
    rentHealth: { green: "bg-[#7C3AED]", amber: "bg-[#EA580C]", red: "bg-[#991B1B]" },
    inspectionHealth: { green: "bg-[#2563EB]", amber: "bg-[#B45309]", red: "bg-[#7F1D1D]" },
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Portfolio Heat Map</h1>
            <p className="text-sm text-[#687068] mt-1">Colour-coded portfolio view — green healthy, amber needs attention, red urgent</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="portfolio-heatmap" title="Portfolio Heat Map">
              See your entire portfolio at a glance with colour coding. Green = everything in order, Amber = action needed soon, Red = urgent intervention required. Toggle between health dimensions.
            </DemoHelperTip>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#687068]">Health Metric:</span>
            <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1">
              {(Object.keys(metricLabels) as any[]).map((key: any) => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedMetric === key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                  }`}
                >
                  {metricLabels[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Green (Healthy)", value: heatmapSummary.green, color: "bg-[#10B981]", icon: "ri-check-line", borderColor: "border-[#10B981]/30" },
            { label: "Amber (Attention)", value: heatmapSummary.amber, color: "bg-[#F59E0B]", icon: "ri-time-line", borderColor: "border-[#F59E0B]/30" },
            { label: "Red (Urgent)", value: heatmapSummary.red, color: "bg-[#EF4444]", icon: "ri-error-warning-line", borderColor: "border-[#EF4444]/30" },
            { label: "Avg Health Score", value: heatmapSummary.averageHealth, color: "bg-[#3B82F6]", icon: "ri-heart-pulse-line", borderColor: "border-[#3B82F6]/30" },
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

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-xs text-[#687068]">Healthy (70-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-xs text-[#687068]">Attention (40-69)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span className="text-xs text-[#687068]">Urgent (0-39)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5">
            {heatmapProperties.map((prop) => {
              const value = prop[selectedMetric];
              let level: "green" | "amber" | "red" = "green";
              if (value < 40) level = "red";
              else if (value < 70) level = "amber";

              const colors = metricColors[selectedMetric];
              const bgColor = level === "green" ? colors.green : level === "amber" ? colors.amber : colors.red;
              const config = healthLevelConfig[level];

              return (
                <Link
                  key={prop.id}
                  href={`/dashboard/property/${prop.id}`}
                  className="block rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="relative h-36">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                    <div className="absolute top-0 left-0 right-0 h-1.5 z-20" style={{ backgroundColor: bgColor.replace("bg-[", "").replace("]", "") }}></div>
                    <div className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-xs font-bold">{value}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <h3 className="text-sm font-semibold text-white truncate">{prop.name}</h3>
                      <p className="text-xs text-white/80 truncate">{prop.city}, {prop.postcode}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{prop.status}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#687068]">{prop.tenant}</span>
                      <span className="text-[#3A3F3A] font-medium">£{prop.rentAmount.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-semibold text-[#3A3F3A]">Detailed Health Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Overall</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Compliance</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Maintenance</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Rent</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Inspections</th>
                  <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {heatmapProperties.map((prop) => {
                  const config = healthLevelConfig[prop.healthLevel];
                  const scoreColor = (s: number) => {
                    if (s >= 70) return "text-[#10B981]";
                    if (s >= 40) return "text-[#F59E0B]";
                    return "text-[#EF4444]";
                  };
                  return (
                    <tr key={prop.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                          <div>
                            <p className="font-medium text-[#3A3F3A]">{prop.name}</p>
                            <p className="text-xs text-[#94A3B8]">{prop.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${prop.healthScore >= 70 ? "bg-[#10B981]" : prop.healthScore >= 40 ? "bg-[#F59E0B]" : "bg-[#EF4444]"} text-white text-xs font-bold`}>
                          {prop.healthScore}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-center font-medium ${scoreColor(prop.complianceHealth)}`}>{prop.complianceHealth}%</td>
                      <td className={`px-5 py-3.5 text-center font-medium ${scoreColor(prop.maintenanceHealth)}`}>{prop.maintenanceHealth}%</td>
                      <td className={`px-5 py-3.5 text-center font-medium ${scoreColor(prop.rentHealth)}`}>{prop.rentHealth}%</td>
                      <td className={`px-5 py-3.5 text-center font-medium ${scoreColor(prop.inspectionHealth)}`}>{prop.inspectionHealth}%</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}