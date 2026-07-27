"use client"

import { useState } from "react"
import Link from "next/link"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar, BarChart } from "recharts"
import DashboardShell from "@/components/DashboardShell"
import EnterpriseSummary from "@/components/dashboard/EnterpriseSummary"
import LeadershipActionCentre from "@/components/dashboard/LeadershipActionCentre"
import { formatCurrency, healthColor } from "@/lib/enterpriseSystem"
import type { LeadershipAction } from "@/lib/enterpriseSystem"
import { offices, staff, aggregateStats, crossPortfolioInsights, officeRiskMatrix, getTopPerformers, getOfficeTrends } from "./EnterpriseOpsData"

const OFFICE_COLORS: Record<string, string> = {
  "London HQ": "#C28A78", "Manchester": "#3B82F6", "Birmingham": "#F59E0B", "Bristol": "#8B5CF6",
}

function scoreBg(s: number): string { return s >= 90 ? "bg-[#10B981]/10" : s >= 75 ? "bg-[#F59E0B]/10" : "bg-[#EF4444]/10" }
function scoreColor(s: number): string { return s >= 90 ? "text-[#10B981]" : s >= 75 ? "text-[#F59E0B]" : "text-[#EF4444]" }
function riskColor(s: number): string { return s <= 10 ? "bg-[#10B981]" : s <= 20 ? "bg-[#F59E0B]" : "bg-[#EF4444]" }

const leadershipActions: LeadershipAction[] = [
  { id: "la1", priority: "critical", regionOrOffice: "Manchester", issue: "Compliance rate dropped to 93% — lowest across all offices", impact: "Regulatory exposure on 3 properties", owner: "James Okonkwo", dueDate: "28 Jul", actionLabel: "Audit Review", actionHref: "/dashboard/compliance", category: "compliance" },
  { id: "la2", priority: "high", regionOrOffice: "London HQ", issue: "Maintenance backlog at 8 open jobs — heaviest load across network", impact: "Tenant satisfaction risk, potential legal exposure", owner: "Sarah Mitchell", dueDate: "01 Aug", actionLabel: "Review Capacity", actionHref: "/dashboard/maintenance", category: "maintenance" },
  { id: "la3", priority: "high", regionOrOffice: "Birmingham", issue: "Revenue per property below network average by 9%", impact: "£3.7k/mo gap vs target", owner: "Priya Sharma", dueDate: "05 Aug", actionLabel: "Revenue Review", actionHref: "/dashboard/financial-hub", category: "rent" },
  { id: "la4", priority: "medium", regionOrOffice: "All Offices", issue: "Quarterly board report due for submission", impact: "Investor reporting cycle", owner: "Sarah Mitchell", dueDate: "15 Aug", actionLabel: "Prepare Report", actionHref: "/dashboard/reports", category: "data" },
  { id: "la5", priority: "medium", regionOrOffice: "Bristol", issue: "Contractor capacity low — only 2 active contractors serving 32 properties", impact: "Risk of maintenance delays in peak periods", owner: "Tom Fletcher", dueDate: "10 Aug", actionLabel: "Recruit Contractors", actionHref: "/dashboard/contractors", category: "capacity" },
]

const topStats = [
  { label: "Properties", value: aggregateStats.totalPortfolio.toString(), icon: "ri-home-4-line", color: "#3B82F6", secondary: `${offices.length} offices` },
  { label: "Rent Collection", value: "94%", icon: "ri-coins-line", color: "#10B981", secondary: formatCurrency(offices.reduce((s, o) => s + o.revenueMonthly, 0)) + "/mo collected" },
  { label: "Avg Compliance", value: aggregateStats.avgCompliance + "%", icon: "ri-shield-check-line", color: "#C28A78", secondary: "Bristol leads at 98%" },
  { label: "Open Maintenance", value: aggregateStats.totalMaintenance.toString(), icon: "ri-tools-line", color: "#F59E0B", secondary: "London HQ: 8 jobs" },
  { label: "Staff Headcount", value: aggregateStats.totalStaff.toString(), icon: "ri-team-line", color: "#8B5CF6", secondary: `${aggregateStats.totalPortfolio / aggregateStats.totalStaff} props/staff` },
]

const trendData = [
  { month: "Jan", "London HQ": 81200, Manchester: 43800, Birmingham: 37100, Bristol: 31800 },
  { month: "Feb", "London HQ": 82300, Manchester: 44200, Birmingham: 37900, Bristol: 32400 },
  { month: "Mar", "London HQ": 83700, Manchester: 45100, Birmingham: 38600, Bristol: 32800 },
  { month: "Apr", "London HQ": 85100, Manchester: 46600, Birmingham: 39400, Bristol: 33600 },
  { month: "May", "London HQ": 86400, Manchester: 47500, Birmingham: 39900, Bristol: 34800 },
  { month: "Jun", "London HQ": 89200, Manchester: 48600, Birmingham: 41200, Bristol: 35800 },
]

export default function EnterpriseOpsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "offices" | "risk">("overview")
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null)

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const html = `<!DOCTYPE html><html><head><title>LetHub Enterprise Ops Report</title><style>body{font-family:system-ui,sans-serif;padding:60px 48px;max-width:900px;margin:0 auto;color:#3A3F3A}h1{font-size:28px;margin-bottom:4px}.date{color:#687068;font-size:14px;margin-bottom:32px}h2{font-size:18px;margin:32px 0 16px;padding-bottom:8px;border-bottom:2px solid #C28A78}table{width:100%;border-collapse:collapse;margin-bottom:32px}th{text-align:left;padding:10px 12px;background:#F8FAFC;font-size:12px;color:#687068;text-transform:uppercase;border-bottom:2px solid #E2E8F0}td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:14px}.footer{margin-top:40px;font-size:11px;color:#94A3B8;text-align:center}</style></head><body><h1>LetHub Enterprise Operations Report</h1><p class="date">${new Date().toLocaleDateString("en-GB", {day:"numeric",month:"long",year:"numeric"})}</p><h2>Office Performance</h2><table><tr><th>Office</th><th>Properties</th><th>Revenue</th><th>Compliance</th></tr>${offices.map(o=>`<tr><td>${o.name}</td><td>${o.portfolioSize}</td><td>${formatCurrency(o.revenueMonthly)}</td><td>${o.complianceRate}%</td></tr>`).join("")}</table><p class="footer">Generated by LetHub</p></body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Enterprise Operations Centre</h1>
            <p className="text-sm text-[#687068] mt-1">Multi-office oversight — performance, risk, and leadership actions across your portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#0F2B1F] transition-colors whitespace-nowrap cursor-pointer">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line text-sm"></i></div>
              Export PDF
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
          {[
            { key: "overview" as const, label: "Overview" },
            { key: "offices" as const, label: "Offices & Regions" },
            { key: "risk" as const, label: "Risk Matrix" },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedOffice(null) }}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <EnterpriseSummary kpis={topStats} />
            <LeadershipActionCentre actions={leadershipActions} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Monthly Revenue by Office</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v as number)} />
                    <Tooltip formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
                    <Legend iconType="rect" wrapperStyle={{ fontSize: 12 }} />
                    {Object.entries(OFFICE_COLORS).map(([name, color]) => (
                      <Bar key={name} dataKey={name} fill={color} radius={[4, 4, 0, 0]} name={name} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Cross-Portfolio Insights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {crossPortfolioInsights.slice(0, 6).map(insight => (
                    <div key={insight.label} className="bg-[#F8FAFC] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-5 h-5 rounded bg-[#C28A78]/10 flex items-center justify-center">
                          <i className={`${insight.icon} text-[#C28A78] text-xs`}></i>
                        </div>
                        <span className="text-[10px] text-[#687068] uppercase">{insight.label}</span>
                      </div>
                      <p className="text-lg font-bold text-[#3A3F3A]">{insight.value}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-[#94A3B8]">Best: {insight.bestOffice}</span>
                        <span className="text-[#10B981] font-medium">{insight.bestValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Executive Centre", href: "/dashboard/executive-centre", icon: "ri-pie-chart-line" },
                { label: "BI Centre", href: "/dashboard/business-intelligence", icon: "ri-bar-chart-grouped-line" },
                { label: "Risk Centre", href: "/dashboard/risk-centre", icon: "ri-shield-flash-line" },
                { label: "Financial Hub", href: "/dashboard/financial-hub", icon: "ri-funds-box-line" },
              ].map(link => (
                <Link key={link.href} href={link.href} className="bg-white rounded-xl border border-[#E2E8F0] p-3 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3 cursor-pointer">
                  <div className="w-9 h-9 bg-[#C28A78] rounded-lg flex items-center justify-center"><i className={`${link.icon} text-white text-base`}></i></div>
                  <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === "offices" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {offices.map(office => (
                <div key={office.id} onClick={() => setSelectedOffice(selectedOffice === office.id ? null : office.id)}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${selectedOffice === office.id ? "border-[#C28A78] shadow-md ring-1 ring-[#C28A78]/20" : "border-[#E2E8F0] hover:border-[#C28A78]/20 hover:shadow-md"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-[#3A3F3A]">{office.name}</h3>
                      <p className="text-xs text-[#94A3B8]">{office.city} &bull; {office.managerName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${office.complianceRate >= 95 ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                      {office.complianceRate >= 95 ? "Healthy" : "Needs Attention"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[{ label: "Properties", value: office.portfolioSize }, { label: "Revenue", value: formatCurrency(office.revenueMonthly) + "/mo" }, { label: "Compliance", value: office.complianceRate + "%" }, { label: "Maintenance", value: office.maintenanceLoad }].map(m => (
                      <div key={m.label} className="text-center"><p className="text-lg font-bold text-[#3A3F3A]">{m.value}</p><p className="text-[10px] text-[#94A3B8] uppercase">{m.label}</p></div>
                    ))}
                  </div>
                  {selectedOffice === office.id && (
                    <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                      <h4 className="text-xs font-semibold text-[#687068] uppercase mb-2">Team (Top 3)</h4>
                      <div className="space-y-2">
                        {getTopPerformers("performanceScore", 3).filter(s => s.officeId === office.id).map(s => (
                          <div key={s.id} className="flex items-center justify-between">
                            <span className="text-sm text-[#3A3F3A]">{s.name} <span className="text-xs text-[#94A3B8]">{s.role}</span></span>
                            <span className={`text-xs font-bold ${scoreColor(s.performanceScore)}`}>{s.performanceScore}/100</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Staff Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#687068]">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#687068]">Office</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-[#687068]">Role</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-[#687068]">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTopPerformers("performanceScore", 8).map(s => (
                      <tr key={s.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#3A3F3A]">{s.name}</td>
                        <td className="py-3 px-4 text-[#687068] text-xs">{s.officeName}</td>
                        <td className="py-3 px-4 text-[#687068] text-xs">{s.role}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${scoreBg(s.performanceScore)} ${scoreColor(s.performanceScore)}`}>{s.performanceScore}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "risk" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {officeRiskMatrix.map(office => (
                <div key={office.name} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-[#3A3F3A]">{office.name.replace("LetHub ", "")}</h3>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${riskColor(office.riskScore)}`}>{office.riskScore}</div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Compliance Gap", value: (100 - office.complianceRate) + "%", bad: office.complianceRate < 95 },
                      { label: "Maintenance Load", value: office.maintenanceLoad + " open", bad: office.maintenanceLoad > 3 },
                      { label: "Revenue vs Target", value: formatCurrency(office.revenue), bad: false },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between text-xs">
                        <span className="text-[#687068]">{r.label}</span>
                        <span className={`font-medium ${r.bad ? "text-[#EF4444]" : "text-[#10B981]"}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#FFF7ED] to-[#FEF3C7] rounded-xl border border-[#F59E0B]/20 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                  <i className="ri-error-warning-line text-[#F59E0B] text-lg"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-[#3A3F3A] text-sm">Risk Alerts</h4>
                  <div className="mt-2 space-y-1.5 text-xs text-[#687068]">
                    <p>&bull; Manchester compliance at 93% — schedule audit review before month end.</p>
                    <p>&bull; London HQ carries heaviest maintenance load (8 open) — consider contractor capacity review.</p>
                    <p>&bull; Bristol maintains best-in-class compliance (98%) — model for other offices.</p>
                    <p>&bull; Birmingham compliance improved 4pts in H1 2026 — trending positively.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <p className="text-center text-[10px] text-[#CBD5E1]">Enterprise view shows aggregated portfolio data. Drill into individual offices, regions, or BI Centre for detailed analysis.</p>
      </div>
    </DashboardShell>
  )
}