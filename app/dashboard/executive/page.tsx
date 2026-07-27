"use client"

import { useState } from "react"
import Link from "next/link"
import DashboardShell from "@/components/DashboardShell"
import EnterpriseSummary from "@/components/dashboard/EnterpriseSummary"
import LeadershipActionCentre from "@/components/dashboard/LeadershipActionCentre"
import type { LeadershipAction } from "@/lib/enterpriseSystem"
import { executiveHealthMetrics, portfolioSummary, recentAlerts, executivePropertyBreakdown } from "./ExecutiveData"

const executiveKPIs = [
  { label: "Total Properties", value: portfolioSummary.totalProperties.toString(), icon: "ri-building-4-line", color: "#C28A78", secondary: `${portfolioSummary.occupied} occupied · ${portfolioSummary.vacant} vacant` },
  { label: "Occupancy Rate", value: portfolioSummary.occupancyRate + "%", icon: "ri-home-4-line", color: "#10B981", secondary: `${portfolioSummary.occupied} of ${portfolioSummary.totalProperties} units` },
  { label: "Monthly Rent Roll", value: "£" + portfolioSummary.totalRentMonthly.toLocaleString(), icon: "ri-coins-line", color: "#3B82F6", secondary: `£${portfolioSummary.rentCollectedThisMonth.toLocaleString()} collected this month` },
  { label: "Arrears Outstanding", value: "£" + portfolioSummary.arrearsTotal.toLocaleString(), icon: "ri-alarm-warning-line", color: "#F59E0B", secondary: `${portfolioSummary.arrearsCount} active cases` },
  { label: "Overall Health", value: Math.round(executiveHealthMetrics.reduce((s, m) => s + m.score, 0) / executiveHealthMetrics.length).toString(), icon: "ri-heart-pulse-line", color: "#8B5CF6", secondary: "Across 4 dimensions" },
]

const execActions: LeadershipAction[] = [
  { id: "ex1", priority: "critical", regionOrOffice: "Maple Gardens House", issue: "5 expired certificates — serious compliance breach", impact: "Legal risk + potential fines", owner: "Property Manager", dueDate: "Immediate", actionLabel: "Resolve Now", actionHref: "/dashboard/compliance", category: "compliance" },
  { id: "ex2", priority: "high", regionOrOffice: "Riverside Court", issue: "2 certificates expiring within 30 days", impact: "Compliance gap developing", owner: "Compliance Officer", dueDate: "20 Aug", actionLabel: "Schedule Renewal", actionHref: "/dashboard/compliance", category: "compliance" },
  { id: "ex3", priority: "high", regionOrOffice: "Portfolio Wide", issue: "£2,850 rent outstanding across 3 tenancies", impact: "Cash flow pressure — £4,850 total arrears", owner: "Rent Collection", dueDate: "01 Aug", actionLabel: "Review Arrears", actionHref: "/dashboard/arrears", category: "rent" },
  { id: "ex4", priority: "medium", regionOrOffice: "8 The Crescent", issue: "Maintenance health score at 30 — 2 urgent jobs open", impact: "Property condition deteriorating", owner: "Maintenance Lead", dueDate: "05 Aug", actionLabel: "Prioritise Repairs", actionHref: "/dashboard/maintenance", category: "maintenance" },
]

const alertBg: Record<string, string> = { critical: "bg-[#EF4444]/10", warning: "bg-[#F59E0B]/10", info: "bg-[#3B82F6]/10" }
const alertText: Record<string, string> = { critical: "text-[#EF4444]", warning: "text-[#F59E0B]", info: "text-[#3B82F6]" }

export default function ExecutiveDashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Executive Dashboard</h1>
            <p className="text-sm text-[#687068] mt-1">Portfolio-wide health — compliance, maintenance, rent, and property overview</p>
          </div>
          <Link href="/dashboard/executive-centre" className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#0F2B1F] transition-colors whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line text-sm"></i></div>
            Full Enterprise Report
          </Link>
        </div>

        <EnterpriseSummary kpis={executiveKPIs} />
        <LeadershipActionCentre actions={execActions} maxItems={4} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {executiveHealthMetrics.map(metric => (
            <div key={metric.label} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}20` }}>
                    <i className={`${metric.icon} text-lg`} style={{ color: metric.color }}></i>
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#3A3F3A]">{metric.label}</h2>
                    <p className="text-xs" style={{ color: metric.trend === "up" ? "#10B981" : metric.trend === "down" ? "#EF4444" : "#94A3B8" }}>
                      <i className={`${metric.trend === "up" ? "ri-arrow-up-line" : metric.trend === "down" ? "ri-arrow-down-line" : "ri-subtract-line"} text-xs mr-0.5`}></i>
                      {metric.trendValue}
                    </p>
                  </div>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke={metric.color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(metric.score / metric.maxScore) * 176} 176`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: metric.color }}>{metric.score}</span>
                </div>
              </div>
              <div className="p-5 space-y-2">
                {metric.details.map(d => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-[#475569]">{d.label}</span>
                    <span className={`font-medium ${d.status === "critical" ? "text-[#EF4444]" : d.status === "warning" ? "text-[#F59E0B]" : "text-[#10B981]"}`}>
                      {d.status === "critical" && <i className="ri-error-warning-line text-xs mr-1"></i>}
                      {d.status === "warning" && <i className="ri-alert-line text-xs mr-1"></i>}
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Property Health Overview</h2>
              <Link href="/dashboard/portfolio-heatmap" className="text-xs text-[#C28A78] font-medium hover:underline">Full Heat Map</Link>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#EF4444]"></div><span className="text-[#687068]">Urgent</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div><span className="text-[#687068]">Attention</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10B981]"></div><span className="text-[#687068]">Healthy</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {executivePropertyBreakdown.slice(0, 6).map(prop => {
                  const barColor = prop.level === "green" ? "bg-[#10B981]" : prop.level === "amber" ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                  const textColor = prop.level === "green" ? "text-[#10B981]" : prop.level === "amber" ? "text-[#F59E0B]" : "text-[#EF4444]"
                  return (
                    <Link key={prop.id} href={`/dashboard/property/${prop.id}`} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] hover:border-[#C28A78]/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-[#3A3F3A]">{prop.name}</h4>
                        <span className={`text-xs font-bold ${textColor}`}>{prop.health}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#E2E8F0] rounded-full mb-3 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${prop.health}%` }}></div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {[{ label: "Comp", value: prop.compliance }, { label: "Maint", value: prop.maintenance }, { label: "Rent", value: prop.rent }, { label: "Insp", value: prop.inspections }].map(d => (
                          <div key={d.label}><p className="text-[10px] text-[#94A3B8]">{d.label}</p><p className={`text-xs font-medium ${d.value >= 70 ? "text-[#10B981]" : d.value >= 40 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>{d.value}%</p></div>
                        ))}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Recent Alerts</h2>
              <span className="text-xs text-[#94A3B8]">{recentAlerts.filter(a => a.type !== "info").length} active</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0] max-h-[500px]">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alertBg[alert.type]}`}>
                    <i className={`${alert.icon} ${alertText[alert.type]} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#3A3F3A]">{alert.title}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Enterprise Reporting", href: "/dashboard/executive-centre", icon: "ri-file-chart-line", color: "bg-[#C28A78]" },
            { label: "Risk Centre", href: "/dashboard/risk-centre", icon: "ri-shield-flash-line", color: "bg-[#EF4444]" },
            { label: "Portfolio Heat Map", href: "/dashboard/portfolio-heatmap", icon: "ri-grid-line", color: "bg-[#3B82F6]" },
            { label: "Financial Hub", href: "/dashboard/financial-hub", icon: "ri-funds-box-line", color: "bg-[#8B5CF6]" },
          ].map(link => (
            <Link key={link.label} href={link.href} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3">
              <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}><i className={`${link.icon} text-white text-lg`}></i></div>
              <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}