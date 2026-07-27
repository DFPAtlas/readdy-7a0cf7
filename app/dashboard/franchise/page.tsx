"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import DashboardShell from "@/components/DashboardShell"
import EnterpriseSummary from "@/components/dashboard/EnterpriseSummary"
import LeadershipActionCentre from "@/components/dashboard/LeadershipActionCentre"
import { formatCurrency, healthColor } from "@/lib/enterpriseSystem"
import { fetchFranchises, fetchFranchiseDashboardData, fetchAllOfficePerformance, FRANCHISE_COLOR_MAP, franchiseMonthlyRevenue } from "./FranchisePlatformData"
import type { FranchiseRecord, FranchiseDashboardData, OfficePerformanceData } from "./FranchisePlatformData"
import type { LeadershipAction } from "@/lib/enterpriseSystem"

const statusColors: Record<string, string> = { active: "#10B981", suspended: "#F59E0B", inactive: "#94A3B8" }

export default function FranchisePlatformPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "compliance">("overview")
  const [franchises, setFranchises] = useState<FranchiseRecord[]>([])
  const [dashboardData, setDashboardData] = useState<Map<string, FranchiseDashboardData>>(new Map())
  const [officePerformance, setOfficePerformance] = useState<OfficePerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [fData, perf] = await Promise.all([fetchFranchises(), fetchAllOfficePerformance()])
      setFranchises(fData); setOfficePerformance(perf)
      const dataMap = new Map<string, FranchiseDashboardData>()
      for (const f of fData) dataMap.set(f.id, await fetchFranchiseDashboardData(f))
      setDashboardData(dataMap)
      if (fData.length > 0 && !selectedFranchiseId) setSelectedFranchiseId(fData[0].id)
      setLoading(false)
    }
    load()
  }, [])

  const allDashboards = Array.from(dashboardData.values())
  const totalOffices = allDashboards.reduce((s, d) => s + d.officeCount, 0)
  const totalProps = allDashboards.reduce((s, d) => s + d.propertyCount, 0)
  const totalCollected = allDashboards.reduce((s, d) => s + d.rentCollected, 0)
  const totalOutstanding = allDashboards.reduce((s, d) => s + d.rentOutstanding, 0)
  const avgCompliance = allDashboards.length > 0 ? Math.round(allDashboards.reduce((s, d) => s + d.complianceRate, 0) / allDashboards.length) : 0

  const franchiseKPIs = [
    { label: "Franchises", value: allDashboards.filter(d=>d.franchise.is_active).length.toString(), icon: "ri-store-2-line", color: "#C28A78", secondary: `${totalOffices} offices across network` },
    { label: "Properties", value: totalProps.toString(), icon: "ri-home-4-line", color: "#3B82F6", secondary: `${Math.round(totalProps/totalOffices||0)} avg per office` },
    { label: "Rent Collected", value: formatCurrency(totalCollected), icon: "ri-coins-line", color: "#10B981", secondary: `${formatCurrency(totalOutstanding)} outstanding` },
    { label: "Open Maintenance", value: allDashboards.reduce((s,d)=>s+d.openMaintenanceJobs,0).toString(), icon: "ri-tools-line", color: "#F59E0B", secondary: `${allDashboards.filter(d=>d.openMaintenanceJobs>3).length} franchises elevated` },
    { label: "Avg Compliance", value: avgCompliance + "%", icon: "ri-shield-check-line", color: avgCompliance >= 90 ? "#10B981" : "#F59E0B", secondary: `Range: ${Math.min(...allDashboards.map(d=>d.complianceRate))}%-${Math.max(...allDashboards.map(d=>d.complianceRate))}%` },
  ]

  const franchiseActions: LeadershipAction[] = allDashboards.filter(d => d.complianceRate < 90 || d.rentCollectionRate < 85).slice(0, 4).map((d, i) => ({
    id: `franchise-${i}`, priority: d.complianceRate < 85 ? "critical" as const : "high" as const,
    regionOrOffice: d.franchise.franchise_name,
    issue: d.complianceRate < 90 ? `Compliance at ${d.complianceRate}% — ${d.overdueItems} overdue items` : `Rent collection at ${d.rentCollectionRate}%`,
    impact: `${d.officeCount} offices · ${d.propertyCount} properties`, owner: "Franchise Manager", dueDate: "Review",
    actionLabel: "View Details", actionHref: "/dashboard/franchise", category: d.complianceRate < 90 ? "compliance" : "rent"
  }))

  const selectedFranchise = selectedFranchiseId ? dashboardData.get(selectedFranchiseId) : null

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Franchise Platform</h1>
            <p className="text-sm text-[#687068] mt-1">Enterprise franchise network — offices, performance, compliance, and multi-franchise oversight</p>
          </div>
          <Link href="/dashboard/regional-management" className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#0F2B1F] transition-colors whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-earth-line text-sm"></i></div>
            Regional Management
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
          {[
            { key: "overview" as const, label: "Overview" },
            { key: "performance" as const, label: "Performance" },
            { key: "compliance" as const, label: "Compliance" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {franchises.map(f => (
                <button key={f.id} onClick={() => setSelectedFranchiseId(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${selectedFranchiseId === f.id ? "text-white border-transparent shadow-sm" : "text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]/30 hover:text-[#3A3F3A]"}`}
                  style={selectedFranchiseId === f.id ? { backgroundColor: FRANCHISE_COLOR_MAP[f.franchise_code] || "#C28A78" } : {}}>
                  {f.franchise_name}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <>
                <EnterpriseSummary kpis={franchiseKPIs} />
                {franchiseActions.length > 0 && <LeadershipActionCentre actions={franchiseActions} maxItems={4} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {allDashboards.map(d => {
                    const color = FRANCHISE_COLOR_MAP[d.franchise.franchise_code] || "#C28A78"
                    return (
                      <div key={d.franchise.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedFranchiseId(d.franchise.id)}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                            <i className="ri-store-2-line text-lg" style={{ color }}></i>
                          </div>
                          <div><h3 className="font-semibold text-[#3A3F3A]">{d.franchise.franchise_name}</h3><p className="text-[10px] text-[#94A3B8]">{d.officeCount} offices &bull; {d.propertyCount} properties</p></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-sm font-bold" style={{ color: d.complianceRate >= 90 ? "#10B981" : "#F59E0B" }}>{d.complianceRate}%</p><p className="text-[10px] text-[#94A3B8]">Compliance</p></div>
                          <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-sm font-bold text-[#3B82F6]">{formatCurrency(d.rentCollected)}</p><p className="text-[10px] text-[#94A3B8]">Collected</p></div>
                          <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-sm font-bold" style={{ color: healthColor(d.avgHealthScore) }}>{d.avgHealthScore}</p><p className="text-[10px] text-[#94A3B8]">Health</p></div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedFranchise && (
                  <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                    <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">{selectedFranchise.franchise.franchise_name} — Offices</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedFranchise.offices.map(o => (
                        <div key={o.office_id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#C28A78]/10"><i className="ri-building-4-line text-[#C28A78] text-sm"></i></div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[#3A3F3A]">{o.office_name}</p><p className="text-[11px] text-[#94A3B8] truncate">{o.address}</p></div>
                          <span className="text-[10px] text-[#94A3B8] whitespace-nowrap">{o.region_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Monthly Revenue by Franchise</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={franchiseMonthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v)} />
                      <Tooltip formatter={(value: any) => [formatCurrency(value), ""]} />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: 12 }} />
                      {franchises.map(f => (
                        <Area key={f.franchise_code} type="monotone" dataKey={f.franchise_name} stroke={FRANCHISE_COLOR_MAP[f.franchise_code] || "#C28A78"} fill={`${FRANCHISE_COLOR_MAP[f.franchise_code] || "#C28A78"}15`} strokeWidth={2} dot={false} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {activeTab === "performance" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {officePerformance.map(perf => {
                    const color = FRANCHISE_COLOR_MAP[perf.franchiseCode] || "#C28A78"
                    return (
                      <div key={perf.officeCode} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}><i className="ri-building-4-line text-sm" style={{ color }}></i></div>
                            <div><h3 className="font-semibold text-sm text-[#3A3F3A]">{perf.officeName}</h3><p className="text-[10px] text-[#94A3B8]">{perf.propertyCount} properties &bull; {perf.tenancyCount} tenancies</p></div>
                          </div>
                          <span className="text-[10px] text-[#94A3B8]">{perf.franchiseCode}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: "Compliance", value: perf.complianceRate + "%", color: perf.complianceRate >= 90 ? "#10B981" : "#F59E0B" },
                            { label: "Rent", value: perf.rentCollectionRate + "%", color: perf.rentCollectionRate >= 90 ? "#10B981" : "#F59E0B" },
                            { label: "Open Jobs", value: perf.openMaintenance.toString(), color: perf.openMaintenance === 0 ? "#10B981" : "#F59E0B" },
                            { label: "Health", value: perf.avgHealthScore.toString(), color: healthColor(perf.avgHealthScore) },
                          ].map(m => (<div key={m.label} className="text-center"><p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p><p className="text-[10px] text-[#94A3B8]">{m.label}</p></div>))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {allDashboards.map(d => {
                  const color = FRANCHISE_COLOR_MAP[d.franchise.franchise_code] || "#C28A78"
                  return (
                    <div key={d.franchise.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}><i className="ri-shield-check-line text-sm" style={{ color }}></i></div>
                          <div><h3 className="font-semibold text-sm text-[#3A3F3A]">{d.franchise.franchise_name}</h3><p className="text-[10px] text-[#94A3B8]">{d.propertyCount} properties</p></div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${d.complianceRate >= 90 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#F59E0B] bg-[#F59E0B]/10"}`}>{d.complianceRate}%</span>
                      </div>
                      <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden mb-4"><div className="h-full rounded-full" style={{ width: `${d.complianceRate}%`, backgroundColor: d.complianceRate >= 90 ? "#10B981" : "#F59E0B" }}></div></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-base font-bold text-[#10B981]">{d.compliantItems}</p><p className="text-[10px] text-[#94A3B8]">Compliant</p></div>
                        <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-base font-bold text-[#EF4444]">{d.overdueItems}</p><p className="text-[10px] text-[#94A3B8]">Overdue</p></div>
                        <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-base font-bold text-[#3A3F3A]">{d.totalComplianceItems}</p><p className="text-[10px] text-[#94A3B8]">Total</p></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Regional Management", href: "/dashboard/regional-management", icon: "ri-earth-line" },
                { label: "Office Management", href: "/dashboard/offices", icon: "ri-building-4-line" },
                { label: "Enterprise Ops", href: "/dashboard/enterprise-ops", icon: "ri-building-2-line" },
                { label: "Integrations", href: "/dashboard/integrations", icon: "ri-puzzle-2-line" },
              ].map(link => (
                <Link key={link.href} href={link.href} className="bg-white rounded-xl border border-[#E2E8F0] p-3 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3 cursor-pointer">
                  <div className="w-9 h-9 bg-[#C28A78] rounded-lg flex items-center justify-center"><i className={`${link.icon} text-white text-base`}></i></div>
                  <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}