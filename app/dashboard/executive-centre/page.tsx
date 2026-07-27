"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import DashboardShell from "@/components/DashboardShell"
import EnterpriseSummary from "@/components/dashboard/EnterpriseSummary"
import LeadershipActionCentre from "@/components/dashboard/LeadershipActionCentre"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency, formatFullCurrency, HEALTH_LEVEL_LABELS, HEALTH_LEVEL_COLORS, fetchExecutiveReport, fetchHighRiskProperties, fetchOpenIssues, fetchRegionalBreakdown, monthlyReportTrends } from "./ExecutiveCentreData"
import type { ExecutiveReportData, HighRiskProperty, OpenIssue, RegionalBreakdown } from "./ExecutiveCentreData"
import type { LeadershipAction } from "@/lib/enterpriseSystem"

export default function ExecutiveCentrePage() {
  const [report, setReport] = useState<ExecutiveReportData | null>(null)
  const [highRisk, setHighRisk] = useState<HighRiskProperty[]>([])
  const [openIssues, setOpenIssues] = useState<OpenIssue[]>([])
  const [regionalData, setRegionalData] = useState<RegionalBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [exportMenu, setExportMenu] = useState(false)
  const [lastRefresh, setLastRefresh] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "regional">("overview")

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [r, hr, oi, rd] = await Promise.all([fetchExecutiveReport(), fetchHighRiskProperties(), fetchOpenIssues(), fetchRegionalBreakdown()])
    setReport(r); setHighRisk(hr); setOpenIssues(oi); setRegionalData(rd)
    setLastRefresh(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  function generateCSV(): string {
    if (!report) return ""
    const rows: string[] = []
    rows.push("Enterprise Reporting Centre — LetHub"); rows.push("")
    rows.push(`Portfolio Value,${formatFullCurrency(report.portfolioValue)}`)
    rows.push(`Properties Managed,${report.totalProperties}`)
    rows.push(`Compliance Rate,${report.complianceRate}%`)
    rows.push(`Rent Collection Rate,${report.rentCollectionRate}%`)
    rows.push(`Avg Health Score,${report.avgHealthScore}`); rows.push("")
    rows.push("REGIONAL BREAKDOWN"); rows.push("Region,Properties,Compliance,Rent Collection,Health")
    regionalData.forEach(r => rows.push(`${r.region},${r.propertyCount},${r.complianceRate}%,${r.rentCollectionRate}%,${r.avgHealthScore}`))
    return rows.join("\n")
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    setExportMenu(false)
  }

  const trendChartData = monthlyReportTrends.map(t => ({ month: t.month.slice(0, 3), "Compliance %": t.compliance, "Rent Collection %": t.rentCollection, "Health Score": t.healthScore }))

  const leadershipActions: LeadershipAction[] = highRisk.slice(0, 3).map((p, i) => ({
    id: `hr-${i}`, priority: p.healthLevel === "critical" ? "critical" as const : p.healthLevel === "high_risk" ? "high" as const : "medium" as const,
    regionOrOffice: `${p.city} ${p.postcode}`, issue: `${p.address} — Health Score ${p.overallScore} (${HEALTH_LEVEL_LABELS[p.healthLevel] || p.healthLevel})`,
    impact: `Compliance: ${p.complianceScore}% · Maintenance: ${p.maintenanceScore}% · Rent: ${p.rentScore}%`, owner: "Property Manager", dueDate: "Review now",
    actionLabel: "View Property", actionHref: `/dashboard/property/${p.id}`, category: "risk"
  }))

  const kpis = report ? [
    { label: "Portfolio Value", value: formatCurrency(report.portfolioValue), icon: "ri-building-4-line", color: "#C28A78", secondary: `${report.totalProperties} properties · ${report.activeTenancies} tenancies`, href: "/dashboard/portfolio" },
    { label: "Compliance Health", value: report.complianceRate + "%", icon: "ri-shield-check-line", color: report.complianceRate >= 90 ? "#10B981" : "#F59E0B", secondary: `${report.compliantItems}/${report.totalCompliance} compliant · ${report.overdueCompliance} overdue` },
    { label: "Maintenance", value: (report.maintenanceOpen + report.maintenanceInProgress).toString(), icon: "ri-tools-line", color: "#F59E0B", secondary: `${report.maintenanceOpen} open · ${report.maintenanceInProgress} in progress · ${report.maintenanceCompleted} done` },
    { label: "Rent Collection", value: report.rentCollectionRate + "%", icon: "ri-coins-line", color: report.rentCollectionRate >= 90 ? "#10B981" : "#F59E0B", secondary: `${formatCurrency(report.rentCollected)} of ${formatCurrency(report.totalRentAmount)} collected`, href: "/dashboard/rent-collection" },
    { label: "Avg Health Score", value: report.avgHealthScore.toString(), icon: "ri-heart-pulse-line", color: "#8B5CF6", secondary: `${report.totalProperties} properties scored` },
  ] : []

  return (
    <DashboardShell>
      <div id="executive-centre" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Enterprise Reporting Centre</h1>
            <p className="text-sm text-[#687068] mt-1">Executive portfolio overview — compliance, maintenance, rent, risk, and regional breakdown</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8]">Updated {lastRefresh || "--:--"}</span>
            <button onClick={loadAll} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors" title="Refresh">
              <i className="ri-refresh-line text-[#687068]"></i>
            </button>
            <Link href="/dashboard/executive" className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] bg-white text-[#687068] hover:text-[#3A3F3A] transition-colors whitespace-nowrap">Quick View</Link>
            <div className="relative">
              <button onClick={() => setExportMenu(!exportMenu)} className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white rounded-lg font-medium text-sm hover:bg-[#143728] transition-colors whitespace-nowrap">
                <i className="ri-download-line text-sm"></i>Export
              </button>
              {exportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-20 overflow-hidden">
                    <button onClick={() => window.print()} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#3A3F3A] hover:bg-[#F8FAFC] whitespace-nowrap"><i className="ri-file-pdf-2-line text-[#EF4444] text-lg w-5 h-5 flex items-center justify-center"></i>Export as PDF</button>
                    <button onClick={() => downloadFile(generateCSV(), `executive-report-${new Date().toISOString().split("T")[0]}.csv`, "text/csv")} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#3A3F3A] hover:bg-[#F8FAFC] whitespace-nowrap"><i className="ri-file-text-line text-[#3B82F6] text-lg w-5 h-5 flex items-center justify-center"></i>Export as CSV</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loading && !report ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-[#687068]">Loading executive data...</span>
            </div>
          </div>
        ) : report ? (
          <>
            <EnterpriseSummary kpis={kpis} />
            <LeadershipActionCentre actions={leadershipActions} maxItems={3} />

            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
              <button onClick={() => setActiveTab("overview")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === "overview" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}>Portfolio Trends</button>
              <button onClick={() => setActiveTab("regional")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === "regional" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}>Regional Breakdown</button>
            </div>

            {activeTab === "overview" && (
              <>
                <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                    <h2 className="font-semibold text-[#3A3F3A]">Portfolio Trends — Last 6 Months</h2>
                  </div>
                  <div className="p-5">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Compliance %" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 4 }} />
                        <Line type="monotone" dataKey="Rent Collection %" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 4 }} />
                        <Line type="monotone" dataKey="Health Score" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                      <h2 className="font-semibold text-[#3A3F3A]">High Risk Properties</h2>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${highRisk.length > 0 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#10B981]/10 text-[#10B981]"}`}>{highRisk.length} flagged</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                          <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Property</th>
                          <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Health</th>
                          <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Level</th>
                          <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Compliance</th>
                        </tr></thead>
                        <tbody>{highRisk.length === 0 ? (
                          <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-[#94A3B8]"><i className="ri-check-line text-[#10B981] text-xl block mb-2"></i>No high-risk properties</td></tr>
                        ) : highRisk.map(p => (
                          <tr key={p.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-5 py-3.5"><Link href={`/dashboard/property/${p.id}`} className="font-medium text-[#3A3F3A] hover:text-[#C28A78] transition-colors">{p.address}</Link><p className="text-xs text-[#94A3B8]">{p.city} {p.postcode}</p></td>
                            <td className="px-5 py-3.5 text-center"><span className="font-bold text-sm" style={{ color: HEALTH_LEVEL_COLORS[p.healthLevel] || "#687068" }}>{p.overallScore}</span></td>
                            <td className="px-5 py-3.5 text-center"><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: (HEALTH_LEVEL_COLORS[p.healthLevel] || "#687068") + "15", color: HEALTH_LEVEL_COLORS[p.healthLevel] || "#687068" }}>{HEALTH_LEVEL_LABELS[p.healthLevel] || p.healthLevel}</span></td>
                            <td className="px-5 py-3.5 text-center"><span className={p.complianceScore >= 70 ? "text-[#10B981]" : p.complianceScore >= 40 ? "text-[#F59E0B]" : "text-[#EF4444]"}>{p.complianceScore}%</span></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                      <h2 className="font-semibold text-[#3A3F3A]">Open Issues</h2>
                      <span className="text-xs text-[#94A3B8]">{openIssues.length} total</span>
                    </div>
                    <div className="overflow-y-auto max-h-[420px]">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] sticky top-0">
                          <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Category</th>
                          <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Issue</th>
                          <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Property</th>
                        </tr></thead>
                        <tbody>{openIssues.length === 0 ? (
                          <tr><td colSpan={3} className="px-5 py-12 text-center text-sm text-[#94A3B8]"><i className="ri-check-line text-[#10B981] text-xl block mb-2"></i>No open issues</td></tr>
                        ) : openIssues.map((issue, i) => (
                          <tr key={issue.category + "-" + issue.issueId + "-" + i} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${issue.category === "compliance" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{issue.category === "compliance" ? "Compliance" : "Maintenance"}</span></td>
                            <td className="px-5 py-3 text-[#3A3F3A]">{issue.issueTitle}</td>
                            <td className="px-5 py-3 text-[#687068] text-xs">{issue.propertyAddress}, {issue.propertyCity}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "regional" && regionalData.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Regional Breakdown</h2>
                  <span className="text-xs text-[#94A3B8]">{regionalData.length} regions</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Region</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Properties</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Compliance</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Rent Collection</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Health</th>
                    </tr></thead>
                    <tbody>{regionalData.map(r => (
                      <tr key={r.region} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#3A3F3A]">{r.region}</td>
                        <td className="px-5 py-3.5 text-center text-[#3A3F3A]">{r.propertyCount}</td>
                        <td className="px-5 py-3.5 text-center"><span className={r.complianceRate >= 80 ? "text-[#10B981]" : r.complianceRate >= 50 ? "text-[#F59E0B]" : "text-[#EF4444]"}>{r.complianceRate}%</span></td>
                        <td className="px-5 py-3.5 text-center"><span className={r.rentCollectionRate >= 80 ? "text-[#10B981]" : r.rentCollectionRate >= 50 ? "text-[#F59E0B]" : "text-[#EF4444]"}>{r.rentCollectionRate}%</span></td>
                        <td className="px-5 py-3.5 text-center"><span className={r.avgHealthScore >= 80 ? "text-[#10B981]" : r.avgHealthScore >= 60 ? "text-[#F59E0B]" : "text-[#EF4444]"}>{r.avgHealthScore}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Executive Dashboard", href: "/dashboard/executive", icon: "ri-dashboard-line", color: "bg-[#C28A78]" },
                { label: "Business Intelligence", href: "/dashboard/business-intelligence", icon: "ri-line-chart-line", color: "bg-[#3B82F6]" },
                { label: "Risk Centre", href: "/dashboard/risk-centre", icon: "ri-shield-flash-line", color: "bg-[#EF4444]" },
                { label: "Portfolio Heatmap", href: "/dashboard/portfolio-heatmap", icon: "ri-grid-line", color: "bg-[#8B5CF6]" },
              ].map(link => (
                <Link key={link.label} href={link.href} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3">
                  <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}><i className={`${link.icon} text-white text-lg`}></i></div>
                  <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </DashboardShell>
  )
}