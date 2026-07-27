"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import DashboardShell from "@/components/DashboardShell"
import EnterpriseSummary from "@/components/dashboard/EnterpriseSummary"
import LeadershipActionCentre from "@/components/dashboard/LeadershipActionCentre"
import { formatCurrency, healthColor, healthLabel, healthBg, healthTextColor, REGION_COLORS } from "@/lib/enterpriseSystem"
import { fetchRegions, fetchRegionDashboardData, monthlyRegionTrends } from "./RegionalManagementData"
import type { RegionRecord, RegionDashboardData } from "./RegionalManagementData"
import type { LeadershipAction } from "@/lib/enterpriseSystem"

export default function RegionalManagementPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "rent">("overview")
  const [regions, setRegions] = useState<RegionRecord[]>([])
  const [dashboardData, setDashboardData] = useState<Map<string, RegionDashboardData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const regionsData = await fetchRegions()
      setRegions(regionsData)
      const dataMap = new Map<string, RegionDashboardData>()
      for (const region of regionsData) {
        dataMap.set(region.id, await fetchRegionDashboardData(region))
      }
      setDashboardData(dataMap)
      setLoading(false)
    }
    load()
  }, [])

  const allDashboards = Array.from(dashboardData.values())
  const totalProps = allDashboards.reduce((s, d) => s + d.propertyCount, 0)
  const totalCollected = allDashboards.reduce((s, d) => s + d.rentCollected, 0)
  const totalOutstanding = allDashboards.reduce((s, d) => s + d.rentOutstanding, 0)
  const avgCompliance = allDashboards.length > 0 ? Math.round(allDashboards.reduce((s, d) => s + d.complianceRate, 0) / allDashboards.length) : 0
  const avgHealth = allDashboards.length > 0 ? Math.round(allDashboards.reduce((s, d) => s + d.avgHealthScore, 0) / allDashboards.length) : 0

  const regionKPIs = [
    { label: "Regions", value: allDashboards.length.toString(), icon: "ri-earth-line", color: "#C28A78", secondary: `${allDashboards.reduce((s,d)=>s+d.officeCount,0)} offices` },
    { label: "Properties", value: totalProps.toString(), icon: "ri-home-4-line", color: "#3B82F6", secondary: `${allDashboards.reduce((s,d)=>s+d.scoredProperties,0)} scored` },
    { label: "Rent Collected", value: formatCurrency(totalCollected), icon: "ri-coins-line", color: "#10B981", secondary: `${formatCurrency(totalOutstanding)} outstanding` },
    { label: "Avg Compliance", value: avgCompliance + "%", icon: "ri-shield-check-line", color: avgCompliance >= 90 ? "#10B981" : "#F59E0B", secondary: `Highest: ${Math.max(...allDashboards.map(d=>d.complianceRate))}%` },
    { label: "Avg Health", value: avgHealth.toString(), icon: "ri-heart-pulse-line", color: healthColor(avgHealth), secondary: healthLabel(avgHealth) },
  ]

  const regionActions: LeadershipAction[] = allDashboards.filter(d => d.complianceRate < 90 || d.rentCollectionRate < 85).slice(0, 4).map((d, i) => ({
    id: `region-${i}`, priority: d.complianceRate < 85 ? "critical" as const : "high" as const,
    regionOrOffice: d.region.region_name, issue: d.complianceRate < 90 ? `Compliance at ${d.complianceRate}% — ${d.overdueItems} overdue items` : `Rent collection at ${d.rentCollectionRate}%`,
    impact: `${d.propertyCount} properties · ${d.officeCount} offices`, owner: "Regional Manager", dueDate: "Review",
    actionLabel: "View Region", actionHref: `/dashboard/regional-management`, category: d.complianceRate < 90 ? "compliance" : "rent"
  }))

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Regional Management</h1>
            <p className="text-sm text-[#687068] mt-1">Organisation → Region → Office → Portfolio — compliance, rent, and health across all regions</p>
          </div>
          <Link href="/dashboard/offices" className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#0F2B1F] transition-colors whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-4-line text-sm"></i></div>
            Office Management
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
          {[
            { key: "overview" as const, label: "Overview" },
            { key: "compliance" as const, label: "Compliance" },
            { key: "rent" as const, label: "Rent Performance" },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedRegion(null) }}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <>
            {activeTab === "overview" && (
              <>
                <EnterpriseSummary kpis={regionKPIs} />
                {regionActions.length > 0 && <LeadershipActionCentre actions={regionActions} maxItems={4} />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {allDashboards.map(d => (
                    <div key={d.region.id} onClick={() => setSelectedRegion(d.region.id)}
                      className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${selectedRegion === d.region.id ? "border-[#C28A78] shadow-md ring-1 ring-[#C28A78]/20" : "border-[#E2E8F0] hover:shadow-md hover:border-[#C28A78]/20"}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${REGION_COLORS[d.region.region_code] || "#C28A78"}15` }}>
                            <i className="ri-earth-line text-sm" style={{ color: REGION_COLORS[d.region.region_code] || "#C28A78" }}></i>
                          </div>
                          <div><h3 className="font-semibold text-[#3A3F3A]">{d.region.region_name}</h3><p className="text-xs text-[#94A3B8]">{d.region.region_code} &bull; {d.officeCount} offices &bull; {d.propertyCount} properties</p></div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${healthTextColor(d.avgHealthScore)} ${healthBg(d.avgHealthScore)}`}>{healthLabel(d.avgHealthScore)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Compliance", value: d.complianceRate + "%", color: d.complianceRate >= 90 ? "#10B981" : "#F59E0B" },
                          { label: "Collected", value: formatCurrency(d.rentCollected), color: "#3B82F6" },
                          { label: "Maintenance", value: d.openMaintenanceJobs.toString(), color: d.openMaintenanceJobs <= 3 ? "#10B981" : "#F59E0B" },
                          { label: "Health", value: d.avgHealthScore.toString(), color: healthColor(d.avgHealthScore) },
                        ].map(m => (
                          <div key={m.label} className="text-center"><p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p><p className="text-[10px] text-[#94A3B8] uppercase">{m.label}</p></div>
                        ))}
                      </div>
                      {selectedRegion === d.region.id && (
                        <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-2 gap-3">
                          <div><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-[#94A3B8] uppercase">Rent Collection</span><span className="text-xs font-bold">{d.rentCollectionRate}%</span></div>
                            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${d.rentCollectionRate}%`, backgroundColor: healthColor(d.rentCollectionRate) }}></div></div>
                          </div>
                          <div><div className="flex items-center justify-between mb-1"><span className="text-[10px] text-[#94A3B8] uppercase">Outstanding</span><span className="text-xs font-bold text-[#EF4444]">{formatCurrency(d.rentOutstanding)}</span></div>
                            <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#EF4444] rounded-full" style={{ width: `${d.rentCollectionRate > 0 ? 100 - d.rentCollectionRate : 0}%` }}></div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "compliance" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {allDashboards.map(d => (
                    <div key={d.region.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${REGION_COLORS[d.region.region_code] || "#C28A78"}15` }}>
                            <i className="ri-shield-check-line text-sm" style={{ color: REGION_COLORS[d.region.region_code] || "#C28A78" }}></i>
                          </div>
                          <div><h3 className="font-semibold text-sm text-[#3A3F3A]">{d.region.region_name}</h3><p className="text-[10px] text-[#94A3B8]">{d.propertyCount} properties</p></div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${d.complianceRate >= 90 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#F59E0B] bg-[#F59E0B]/10"}`}>{d.complianceRate}%</span>
                      </div>
                      <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden mb-4">
                        <div className="h-full rounded-full" style={{ width: `${d.complianceRate}%`, backgroundColor: d.complianceRate >= 90 ? "#10B981" : "#F59E0B" }}></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-lg font-bold text-[#10B981]">{d.compliantItems}</p><p className="text-[10px] text-[#94A3B8]">Compliant</p></div>
                        <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-lg font-bold text-[#EF4444]">{d.overdueItems}</p><p className="text-[10px] text-[#94A3B8]">Overdue</p></div>
                        <div className="bg-[#F8FAFC] rounded-lg p-2 text-center"><p className="text-lg font-bold text-[#3A3F3A]">{d.totalComplianceItems}</p><p className="text-[10px] text-[#94A3B8]">Total</p></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Compliance Rate by Region (H1 2026)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={Object.values(monthlyRegionTrends.reduce((acc, t) => {
                      if (!acc[t.month]) acc[t.month] = { month: t.month }
                      acc[t.month][t.region] = t.compliance; return acc
                    }, {} as Record<string, Record<string, number | string>>))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v + "%"} />
                      <Tooltip formatter={(value: any) => [value + "%", "Compliance"]} />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: 12 }} />
                      {allDashboards.map(d => (
                        <Line key={d.region.region_code} type="monotone" dataKey={d.region.region_name} stroke={REGION_COLORS[d.region.region_code] || "#C28A78"} strokeWidth={2} dot={{ r: 3 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "rent" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {allDashboards.map(d => (
                    <div key={d.region.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${REGION_COLORS[d.region.region_code] || "#C28A78"}15` }}>
                            <i className="ri-coins-line text-sm" style={{ color: REGION_COLORS[d.region.region_code] || "#C28A78" }}></i>
                          </div>
                          <div><h3 className="font-semibold text-sm text-[#3A3F3A]">{d.region.region_name}</h3><p className="text-[10px] text-[#94A3B8]">{d.totalRentPayments} payments</p></div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${d.rentCollectionRate >= 90 ? "text-[#10B981] bg-[#10B981]/10" : "text-[#F59E0B] bg-[#F59E0B]/10"}`}>{d.rentCollectionRate}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-[#10B981]/5 rounded-lg p-3"><p className="text-lg font-bold text-[#10B981]">{formatCurrency(d.rentCollected)}</p><p className="text-[10px] text-[#94A3B8]">Collected</p></div>
                        <div className="bg-[#EF4444]/5 rounded-lg p-3"><p className="text-lg font-bold text-[#EF4444]">{formatCurrency(d.rentOutstanding)}</p><p className="text-[10px] text-[#94A3B8]">Outstanding</p></div>
                      </div>
                      <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#10B981] rounded-full" style={{ width: `${d.rentCollectionRate}%` }}></div></div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Rent Collection Rate by Region (H1 2026)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={Object.values(monthlyRegionTrends.reduce((acc, t) => {
                      if (!acc[t.month]) acc[t.month] = { month: t.month }
                      acc[t.month][t.region] = t.rentCollection; return acc
                    }, {} as Record<string, Record<string, number | string>>))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v + "%"} />
                      <Tooltip formatter={(value: any) => [value + "%", "Collection Rate"]} />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: 12 }} />
                      {allDashboards.map(d => (
                        <Line key={d.region.region_code} type="monotone" dataKey={d.region.region_name} stroke={REGION_COLORS[d.region.region_code] || "#C28A78"} strokeWidth={2} dot={{ r: 3 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Office Management", href: "/dashboard/offices", icon: "ri-building-4-line" },
                { label: "Enterprise Ops", href: "/dashboard/enterprise-ops", icon: "ri-building-2-line" },
                { label: "Portfolio", href: "/dashboard/portfolio", icon: "ri-building-4-line" },
                { label: "Compliance", href: "/dashboard/compliance", icon: "ri-shield-check-line" },
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