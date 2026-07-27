"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import DashboardShell from "@/components/DashboardShell"
import EnterpriseSummary from "@/components/dashboard/EnterpriseSummary"
import { formatCurrency, OFFICE_COLORS_EXTENDED, healthColor } from "@/lib/enterpriseSystem"
import { fetchOffices, fetchOfficeDashboardData, fetchOfficeProperties, OFFICE_COLORS, monthlyOfficeTrends, formatCurrencyStatic } from "./OfficeManagementData"
import type { OfficeRecord, OfficeDashboardData, OfficePropertySummary } from "./OfficeManagementData"

function scoreColor(s: number): string { return s >= 90 ? "text-[#10B981]" : s >= 75 ? "text-[#F59E0B]" : "text-[#EF4444]" }
function paymentLabel(s: string | null): string { if (!s) return "Unknown"; if (s === "paid") return "Paid"; if (s === "overdue") return "Overdue"; return "Pending" }
function paymentColor(s: string | null): string { if (!s) return "text-[#94A3B8] bg-[#F1F5F9]"; if (s === "paid") return "text-[#10B981] bg-[#10B981]/10"; if (s === "overdue") return "text-[#EF4444] bg-[#EF4444]/10"; return "text-[#F59E0B] bg-[#F59E0B]/10" }

export default function OfficeManagementPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "list" | "performance">("overview")
  const [offices, setOffices] = useState<OfficeRecord[]>([])
  const [dashboardData, setDashboardData] = useState<Map<string, OfficeDashboardData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null)
  const [officeProperties, setOfficeProperties] = useState<OfficePropertySummary[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await fetchOffices()
      setOffices(data)
      const dataMap = new Map<string, OfficeDashboardData>()
      for (const office of data) dataMap.set(office.id, await fetchOfficeDashboardData(office))
      setDashboardData(dataMap)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedOfficeId) return
    fetchOfficeProperties(selectedOfficeId).then(setOfficeProperties)
  }, [selectedOfficeId])

  const allDashboards = Array.from(dashboardData.values())
  const totalProps = allDashboards.reduce((s, d) => s + d.propertyCount, 0)
  const totalCollected = allDashboards.reduce((s, d) => s + d.rentCollected, 0)
  const totalOutstanding = allDashboards.reduce((s, d) => s + d.rentDue + d.rentOverdue, 0)
  const totalMaintenance = allDashboards.reduce((s, d) => s + d.maintenanceOpen, 0)
  const avgCompliance = allDashboards.length ? Math.round(allDashboards.reduce((s, d) => s + d.complianceRate, 0) / allDashboards.length) : 0

  const officeKPIs = [
    { label: "Offices", value: allDashboards.length.toString(), icon: "ri-building-4-line", color: "#C28A78", secondary: `${allDashboards.reduce((s,d)=>s+d.regionCount,0)} regions · ${allDashboards.reduce((s,d)=>s+d.branchCount,0)} branches` },
    { label: "Properties", value: totalProps.toString(), icon: "ri-home-4-line", color: "#3B82F6", secondary: `${Math.round(totalProps/allDashboards.length||0)} avg per office` },
    { label: "Rent Collected", value: formatCurrency(totalCollected), icon: "ri-coins-line", color: "#10B981", secondary: `${formatCurrency(totalOutstanding)} outstanding` },
    { label: "Open Maintenance", value: totalMaintenance.toString(), icon: "ri-tools-line", color: "#F59E0B", secondary: `${allDashboards.filter(d=>d.maintenanceOpen>3).length} offices above threshold` },
    { label: "Avg Compliance", value: avgCompliance + "%", icon: "ri-shield-check-line", color: avgCompliance >= 90 ? "#10B981" : "#F59E0B", secondary: `Range: ${Math.min(...allDashboards.map(d=>d.complianceRate))}%-${Math.max(...allDashboards.map(d=>d.complianceRate))}%` },
  ]

  const selectedDashboard = selectedOfficeId ? dashboardData.get(selectedOfficeId) : null

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Office Management</h1>
            <p className="text-sm text-[#687068] mt-1">Multi-office architecture — properties, regions, branches, and performance across your network</p>
          </div>
          <Link href="/dashboard/regional-management" className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#0F2B1F] transition-colors whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-earth-line text-sm"></i></div>
            Regional View
          </Link>
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
          {[
            { key: "overview" as const, label: "Overview" },
            { key: "list" as const, label: "Office Directory" },
            { key: "performance" as const, label: "Performance" },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedOfficeId(null) }}
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
                <EnterpriseSummary kpis={officeKPIs} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {allDashboards.map(d => (
                    <div key={d.office.id} onClick={() => setSelectedOfficeId(d.office.id)}
                      className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${selectedOfficeId === d.office.id ? "border-[#C28A78] shadow-md ring-1 ring-[#C28A78]/20" : "border-[#E2E8F0] hover:shadow-md hover:border-[#C28A78]/20"}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div><h3 className="font-semibold text-[#3A3F3A]">{d.office.office_name}</h3><p className="text-xs text-[#94A3B8]">{d.office.office_code} &bull; {d.propertyCount} properties</p></div>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${OFFICE_COLORS_EXTENDED[d.office.office_code] || "#C28A78"}15` }}>
                          <i className="ri-building-4-line text-lg" style={{ color: OFFICE_COLORS_EXTENDED[d.office.office_code] || "#C28A78" }}></i>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Properties", value: d.propertyCount.toString() },
                          { label: "Compliance", value: d.complianceRate + "%" },
                          { label: "Open Jobs", value: d.maintenanceOpen.toString() },
                          { label: "Collection", value: d.rentCollectionRate + "%" },
                        ].map(m => (<div key={m.label} className="text-center"><p className="text-lg font-bold text-[#3A3F3A]">{m.value}</p><p className="text-[10px] text-[#94A3B8] uppercase">{m.label}</p></div>))}
                      </div>
                      {selectedOfficeId === d.office.id && (
                        <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-2 gap-3">
                          <div className="bg-[#10B981]/5 rounded-lg p-2 text-center"><p className="text-lg font-bold text-[#10B981]">{formatCurrency(d.rentCollected)}</p><p className="text-[10px] text-[#687068]">Collected</p></div>
                          <div className="bg-[#EF4444]/5 rounded-lg p-2 text-center"><p className="text-lg font-bold text-[#EF4444]">{formatCurrency(d.rentOverdue)}</p><p className="text-[10px] text-[#687068]">Overdue</p></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                  <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Monthly Rent Collection by Office</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.values(monthlyOfficeTrends.reduce((acc, t) => {
                      if (!acc[t.month]) acc[t.month] = { month: t.month }
                      acc[t.month][t.officeName] = t.rentCollected; return acc
                    }, {} as Record<string, Record<string, number | string>>))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrencyStatic(v)} />
                      <Tooltip formatter={(value: any) => [formatCurrencyStatic(value), "Collected"]} />
                      <Legend iconType="rect" wrapperStyle={{ fontSize: 12 }} />
                      {Object.entries(OFFICE_COLORS).map(([code, color]) => {
                        const office = allDashboards.find(d => d.office.office_code === code)
                        return <Bar key={code} dataKey={office ? office.office.office_name.replace("LetHub ", "") : code} fill={color} radius={[4, 4, 0, 0]} name={office ? office.office.office_name.replace("LetHub ", "") : code} />
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {activeTab === "list" && (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <button onClick={() => setSelectedOfficeId(null)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${!selectedOfficeId ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:text-[#3A3F3A]"}`}>All Offices</button>
                  {allDashboards.map(d => (
                    <button key={d.office.id} onClick={() => setSelectedOfficeId(d.office.id)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${selectedOfficeId === d.office.id ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:text-[#3A3F3A]"}`}>
                      {d.office.office_name.replace("LetHub ", "")}
                    </button>
                  ))}
                </div>

                {selectedDashboard && (
                  <div className="bg-white rounded-xl border border-[#C28A78]/20 shadow-md p-6 mb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div><h3 className="text-lg font-bold text-[#3A3F3A]">{selectedDashboard.office.office_name}</h3>
                        <p className="text-sm text-[#687068]">{selectedDashboard.office.address}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#687068]">
                          {selectedDashboard.office.phone && <span><i className="ri-phone-line mr-1"></i>{selectedDashboard.office.phone}</span>}
                          {selectedDashboard.office.email && <span><i className="ri-mail-line mr-1"></i>{selectedDashboard.office.email}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[{ label: "Properties", value: selectedDashboard.propertyCount }, { label: "Regions", value: selectedDashboard.regionCount }, { label: "Branches", value: selectedDashboard.branchCount }, { label: "Compliance", value: selectedDashboard.complianceRate + "%" }].map(m => (
                          <div key={m.label} className="text-center p-2 bg-[#F8FAFC] rounded-lg min-w-[70px]"><p className="text-lg font-bold text-[#3A3F3A]">{m.value}</p><p className="text-[10px] text-[#94A3B8]">{m.label}</p></div>
                        ))}
                      </div>
                    </div>

                    {officeProperties.length > 0 && (
                      <div className="border-t border-[#F1F5F9] pt-4">
                        <h4 className="text-sm font-semibold text-[#3A3F3A] mb-3">Properties ({officeProperties.length})</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                              <th className="text-left py-3 px-4 text-xs font-medium text-[#687068] uppercase">Address</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-[#687068] uppercase">Beds</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-[#687068] uppercase">Rent</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-[#687068] uppercase">Tenancy</th>
                              <th className="text-left py-3 px-4 text-xs font-medium text-[#687068] uppercase">Payment</th>
                            </tr></thead>
                            <tbody>{officeProperties.map((prop, i) => (
                              <tr key={prop.propertyId} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "bg-white" : "bg-[#FCFCFD]"}`}>
                                <td className="py-3 px-4"><p className="text-sm font-medium text-[#3A3F3A]">{prop.line1}</p><p className="text-[11px] text-[#94A3B8]">{prop.city}, {prop.postcode}</p></td>
                                <td className="py-3 px-4 text-sm text-[#3A3F3A]">{prop.bedrooms}</td>
                                <td className="py-3 px-4 text-sm font-medium text-[#3A3F3A]">{formatCurrencyStatic(prop.rentAmount)}</td>
                                <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${prop.status === "active" ? "text-[#10B981] bg-[#10B981]/10" : "text-[#94A3B8] bg-[#F1F5F9]"}`}>{prop.status === "active" ? "Active" : prop.status}</span></td>
                                <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${paymentColor(prop.latestPaymentStatus)}`}>{paymentLabel(prop.latestPaymentStatus)}</span></td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!selectedOfficeId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {allDashboards.map(d => (
                      <div key={d.office.id} onClick={() => setSelectedOfficeId(d.office.id)} className="bg-white rounded-xl border border-[#E2E8F0] p-5 cursor-pointer hover:border-[#C28A78]/20 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div><h3 className="font-semibold text-[#3A3F3A]">{d.office.office_name}</h3><p className="text-xs text-[#94A3B8]">{d.office.office_code} &bull; {d.propertyCount} properties</p></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-[#F8FAFC] rounded-lg p-2"><p className="text-sm font-bold text-[#3A3F3A]">{d.complianceRate}%</p><p className="text-[10px] text-[#94A3B8]">Compliance</p></div>
                          <div className="bg-[#F8FAFC] rounded-lg p-2"><p className="text-sm font-bold text-[#3A3F3A]">{formatCurrency(d.rentCollected)}</p><p className="text-[10px] text-[#94A3B8]">Collected</p></div>
                          <div className="bg-[#F8FAFC] rounded-lg p-2"><p className="text-sm font-bold text-[#3A3F3A]">{d.maintenanceOpen}</p><p className="text-[10px] text-[#94A3B8]">Open Jobs</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "performance" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allDashboards.map(d => (
                    <div key={d.office.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                      <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-sm text-[#3A3F3A]">{d.office.office_name}</h3><span className="text-[10px] text-[#94A3B8]">{d.office.office_code}</span></div>
                      <div className="space-y-3">
                        {[
                          { label: "Compliance", value: d.complianceRate, unit: "%", color: d.complianceRate >= 95 ? "#10B981" : "#F59E0B" },
                          { label: "Rent Collection", value: d.rentCollectionRate, unit: "%", color: d.rentCollectionRate >= 90 ? "#10B981" : "#F59E0B" },
                          { label: "Maintenance", value: d.maintenanceOpen, unit: " open", color: d.maintenanceOpen <= 3 ? "#10B981" : "#F59E0B" },
                        ].map(m => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between mb-1"><span className="text-xs text-[#687068]">{m.label}</span><span className="text-xs font-bold" style={{ color: m.color }}>{m.value}{m.unit}</span></div>
                            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(m.label === "Maintenance" ? m.value * 10 : m.value, 100)}%`, backgroundColor: m.color }}></div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Properties", href: "/dashboard/properties", icon: "ri-home-4-line" },
                { label: "Enterprise Ops", href: "/dashboard/enterprise-ops", icon: "ri-building-2-line" },
                { label: "Portfolio", href: "/dashboard/portfolio", icon: "ri-building-4-line" },
                { label: "Tenancies", href: "/dashboard/tenancies", icon: "ri-file-text-line" },
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