"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { isDemoAccount } from "@/lib/demoMode";
import {
  dailyBriefing,
  top10Recommendations,
  operationsKPIs,
  todaySummary,
  weeklyTrend,
} from "./OperationsDirectorData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const urgencyColors: Record<string, string> = {
  critical: "bg-[#EF4444]",
  high: "bg-[#F59E0B]",
  medium: "bg-[#3B82F6]",
  low: "bg-[#94A3B8]",
};

const urgencyTextColors: Record<string, string> = {
  critical: "text-[#EF4444]",
  high: "text-[#F59E0B]",
  medium: "text-[#3B82F6]",
  low: "text-[#94A3B8]",
};

const urgencyLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const categoryIcons: Record<string, string> = {
  inspection: "ri-clipboard-line",
  compliance: "ri-shield-check-line",
  maintenance: "ri-tools-line",
  quote: "ri-file-list-3-line",
  arrears: "ri-alarm-warning-line",
  vacancy: "ri-home-4-line",
  risk: "ri-shield-flash-line",
};

const impactColors: Record<string, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#94A3B8",
};

export default function OperationsDirectorPage() {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const [selectedKPI, setSelectedKPI] = useState(0);
  const [filterUrgency, setFilterUrgency] = useState<string>("all");

  const filteredBriefing = filterUrgency === "all"
    ? dailyBriefing
    : dailyBriefing.filter((b) => b.urgency === filterUrgency);

  if (isDemoAccount()) {}

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C28A78] to-[#2D6A4F] flex items-center justify-center shadow-lg">
                <i className="ri-brain-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#3A3F3A]">AI Operations Director</h1>
                <p className="text-xs text-[#687068]">Good Morning, Martin &middot; {todaySummary.date}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#FEF2F2] rounded-xl px-4 py-2 flex items-center gap-2">
              <i className="ri-error-warning-line text-[#EF4444]"></i>
              <span className="text-sm font-bold text-[#EF4444]">{todaySummary.criticalCount} critical</span>
            </div>
            <div className="bg-[#FFFBEB] rounded-xl px-4 py-2 flex items-center gap-2">
              <i className="ri-alert-line text-[#F59E0B]"></i>
              <span className="text-sm font-bold text-[#F59E0B]">{todaySummary.highCount} high priority</span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-sm text-[#687068]">£{todaySummary.estimatedRevenueAtRisk.toLocaleString()} at risk</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0F172A] via-[#3A3F3A] to-[#0F172A] rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
              <span className="text-xs text-[#94A3B8] uppercase tracking-wider">Daily Briefing</span>
            </div>
            <p className="text-white text-lg font-medium mb-1">
              You have <span className="text-[#10B981] font-bold">{todaySummary.totalActions}</span> actions needing attention today across <span className="text-[#3B82F6] font-bold">{todaySummary.propertiesAffected}</span> properties.
            </p>
            <p className="text-[#94A3B8] text-sm">
              {todaySummary.criticalCount} items require immediate action. Estimated revenue at risk: <span className="text-[#EF4444] font-bold">£{todaySummary.estimatedRevenueAtRisk.toLocaleString()}</span>.
            </p>
          </div>
          <div className="grid grid-cols-7 gap-0 border-t border-white/10">
            {weeklyTrend.map((day, i) => (
              <div key={day.day} className={`p-3 text-center ${i === 4 ? "bg-white/5" : ""}`}>
                <p className="text-xs text-[#94A3B8] mb-1">{day.day}</p>
                <div className="flex justify-center gap-1 mb-1">
                  <div className="h-8 w-3 rounded-full bg-[#3B82F6]/40 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-[#3B82F6] rounded-full" style={{ height: `${(day.completed / day.actions) * 100}%` }}></div>
                  </div>
                  <div className="h-8 w-3 rounded-full bg-[#F59E0B]/40 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-[#F59E0B] rounded-full" style={{ height: `${((day.actions - day.completed) / day.actions) * 100}%` }}></div>
                  </div>
                </div>
                <p className="text-[10px] text-[#687068]">{day.actions} actions</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Items Requiring Attention</h2>
                <div className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                  {["all", "critical", "high", "medium"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterUrgency(f)}
                      className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                        filterUrgency === f ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                      }`}
                    >
                      {f === "all" ? "All" : urgencyLabels[f]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[#E2E8F0] max-h-[600px] overflow-y-auto">
                {filteredBriefing.map((item) => (
                  <Link
                    key={item.id}
                    href={item.actionHref}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.urgency === "critical" ? "bg-[#EF4444]/10" :
                      item.urgency === "high" ? "bg-[#F59E0B]/10" :
                      item.urgency === "medium" ? "bg-[#3B82F6]/10" :
                      "bg-[#94A3B8]/10"
                    }`}>
                      <i className={`${categoryIcons[item.category]} ${
                        item.urgency === "critical" ? "text-[#EF4444]" :
                        item.urgency === "high" ? "text-[#F59E0B]" :
                        item.urgency === "medium" ? "text-[#3B82F6]" :
                        "text-[#94A3B8]"
                      } text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors">{item.title}</h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${urgencyColors[item.urgency]} text-white whitespace-nowrap`}>
                          {urgencyLabels[item.urgency]}
                        </span>
                      </div>
                      <p className="text-xs text-[#687068] mb-1">{item.detail}</p>
                      <p className="text-xs text-[#94A3B8]">{item.property}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-xs font-medium text-[#C28A78] whitespace-nowrap hidden sm:block group-hover:underline">{item.action}</span>
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className="ri-arrow-right-s-line text-[#94A3B8] group-hover:text-[#C28A78]"></i>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center">
                    <i className="ri-sparkling-line text-white text-sm"></i>
                  </div>
                  <h2 className="font-semibold text-[#3A3F3A]">AI Recommendations</h2>
                </div>
                <span className="text-xs text-[#94A3B8]">Top 10 · ordered by impact</span>
              </div>
              <div className="divide-y divide-[#E2E8F0]">
                {top10Recommendations.map((rec) => {
                  const isExpanded = expandedRec === rec.rank;
                  return (
                    <div key={rec.rank}>
                      <button
                        onClick={() => setExpandedRec(isExpanded ? null : rec.rank)}
                        className="w-full flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm" style={{ backgroundColor: `${impactColors[rec.impact]}15`, color: impactColors[rec.impact] }}>
                          {rec.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-[#3A3F3A]">{rec.title}</h3>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: impactColors[rec.impact] }}>
                              {rec.impact === "critical" ? "CRITICAL" : rec.impact.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-[#687068]">{rec.category}</span>
                            <span className="text-[#10B981] font-medium">{rec.estimatedValue}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-[#94A3B8]`}></i>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4 pl-[68px]">
                          <p className="text-sm text-[#475569] mb-3">{rec.description}</p>
                          <div className="flex items-center gap-3">
                            <div className="bg-[#F8FAFC] rounded-lg px-3 py-1.5">
                              <span className="text-xs text-[#687068]">{rec.metric}</span>
                            </div>
                            <Link
                              href={rec.actionHref}
                              className="bg-[#C28A78] hover:bg-[#143828] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                            >
                              {rec.action}
                              <i className="ri-arrow-right-line text-xs"></i>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Health Overview</h2>
              </div>
              <div className="p-5">
                <div className="flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1 mb-4">
                  {operationsKPIs.map((kpi, i) => (
                    <button
                      key={kpi.label}
                      onClick={() => setSelectedKPI(i)}
                      className={`flex-1 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                        selectedKPI === i ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                      }`}
                    >
                      {kpi.label.split(" ")[0]}
                    </button>
                  ))}
                </div>

                {(() => {
                  const kpi = operationsKPIs[selectedKPI];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                            <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }}></i>
                          </div>
                          <span className="text-sm font-semibold text-[#3A3F3A]">{kpi.label}</span>
                        </div>
                        <span className={`text-xs font-medium flex items-center gap-0.5 ${
                          kpi.trend === "up" ? "text-[#10B981]" : kpi.trend === "down" ? "text-[#EF4444]" : "text-[#94A3B8]"
                        }`}>
                          <i className={`${
                            kpi.trend === "up" ? "ri-arrow-up-s-line" : kpi.trend === "down" ? "ri-arrow-down-s-line" : "ri-subtract-line"
                          } text-xs`}></i>
                          {kpi.trendValue}
                        </span>
                      </div>

                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                          <circle
                            cx="60" cy="60" r="52" fill="none" stroke={kpi.color} strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${(kpi.value / kpi.max) * 327} 327`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold" style={{ color: kpi.color }}>{kpi.value}</span>
                          <span className="text-xs text-[#94A3B8]">/ {kpi.max}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {kpi.subMetrics.map((sm) => (
                          <div key={sm.label}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs text-[#687068]">{sm.label}</span>
                              <span className="text-xs font-medium text-[#3A3F3A]">{sm.value}/{sm.max}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(sm.value / sm.max) * 100}%`,
                                  backgroundColor: (sm.value / sm.max) >= 0.7 ? "#10B981" : (sm.value / sm.max) >= 0.4 ? "#F59E0B" : "#EF4444",
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Weekly Action Load</h2>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyTrend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#687068", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#687068", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                    <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actions" stackId="a" fill="#E2E8F0" name="Remaining" radius={[0, 0, 0, 0]}>
                      {weeklyTrend.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.day === "Fri" ? "#F59E0B" : "#E2E8F0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-[#10B981]/20 flex items-center justify-center">
                  <i className="ri-sparkling-line text-[#10B981] text-xs"></i>
                </div>
                <span className="text-sm font-semibold text-white">AI Insight</span>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Your portfolio health is trending up at 81/100, but maintenance is dragging you down. Three overdue jobs are creating legal exposure. Fixing the boiler at Clifton Road and the roof at Buckingham Gate would lift your maintenance score by 12 points and reduce risk exposure from 34% to 22%.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: "58%" }}></div>
                </div>
                <span className="text-xs text-[#10B981] font-medium">+12 pts potential</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Risk Centre", href: "/dashboard/risk-centre", icon: "ri-shield-flash-line", color: "#EF4444" },
                { label: "Compliance", href: "/dashboard/compliance", icon: "ri-shield-check-line", color: "#3B82F6" },
                { label: "Maintenance", href: "/dashboard/maintenance", icon: "ri-tools-line", color: "#F59E0B" },
                { label: "Inspections", href: "/dashboard/inspections", icon: "ri-clipboard-line", color: "#10B981" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-3 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${link.color}15` }}>
                    <i className={`${link.icon} text-sm`} style={{ color: link.color }}></i>
                  </div>
                  <span className="text-xs font-medium text-[#3A3F3A]">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}