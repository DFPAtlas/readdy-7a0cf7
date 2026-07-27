"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import DashboardShell from "@/components/DashboardShell"
import {
  fetchMonetisationData,
  formatCurrency,
  formatFullCurrency,
  PIPELINE_LABELS,
  PIPELINE_COLORS,
  SOURCE_ICONS,
  type MonetisationData,
  type FeaturedListing,
  type RevenueBySource,
  type ServicePerformance,
} from "./MonetisationData"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"

const PRIORITY_LABELS: Record<number, string> = { 1: "Platinum", 2: "Gold", 3: "Silver", 4: "Standard" }
const PRIORITY_COLORS: Record<number, string> = { 1: "#8B5CF6", 2: "#F59E0B", 3: "#94A3B8", 4: "#CBD5E1" }
const PRIORITY_BG: Record<number, string> = { 1: "bg-[#8B5CF6]/10", 2: "bg-[#F59E0B]/10", 3: "bg-[#94A3B8]/10", 4: "bg-[#F1F5F9]" }

const PIE_COLORS = ["#C28A78", "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#F97316", "#EF4444", "#06B6D4"]

export default function MarketplaceMonetisationPage() {
  const [data, setData] = useState<MonetisationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"revenue" | "listings" | "leads" | "referrals">("revenue")
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({})
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchMonetisationData()
      setData(result)
      const toggles: Record<string, boolean> = {}
      result.featuredListings.forEach((f) => { toggles[f.id] = f.status === "active" })
      setToggleStates(toggles)
    } catch {
      setError("Could not load monetisation data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleListing = (id: string) => {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-[#687068]">Loading monetisation data...</span>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error || !data) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24 text-[#94A3B8]">
          <div className="text-center">
            <i className="ri-error-warning-line text-4xl block mb-3"></i>
            <p>{error || "No data available"}</p>
            <button onClick={load} className="mt-4 text-sm text-[#C28A78] hover:underline font-medium">Try again</button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const { summary, revenueBySource, servicePerformance, featuredListings, leadTracking, referralSummary } = data

  const sourceChartData = revenueBySource.map((r) => ({
    name: r.label.length > 16 ? r.label.slice(0, 16) + "..." : r.label,
    revenue: r.revenueGenerated,
    fee: r.feeEarned,
    leads: r.leadsGenerated,
  }))

  const pieData = revenueBySource.slice(0, 7).map((r) => ({
    name: r.label,
    value: r.feeEarned,
  }))

  const filteredListings = priorityFilter ? featuredListings.filter((f) => f.priorityLevel === priorityFilter) : featuredListings

  const activeListings = featuredListings.filter((f) => f.status === "active").length
  const totalLeadsFromListings = featuredListings.reduce((s, f) => s + f.leadsGenerated, 0)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Marketplace Monetisation Engine</h1>
            <p className="text-sm text-[#687068] mt-1">
              Generate revenue beyond subscriptions — featured listings, lead tracking, service performance, and referral analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full font-medium">
              <i className="ri-arrow-up-line mr-1"></i>+{summary.monthOverMonthGrowth}% this month
            </span>
            <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors" title="Refresh">
              <i className="ri-refresh-line text-[#687068]"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Leads Generated", value: summary.totalLeads, sub: `${summary.leadsConverted} converted`, icon: "ri-user-add-line", color: "bg-[#3B82F6]" },
            { label: "Jobs Won", value: summary.totalJobsWon, sub: `${summary.totalJobsCompleted} completed`, icon: "ri-briefcase-line", color: "bg-[#10B981]" },
            { label: "Est. Revenue", value: formatCurrency(summary.estimatedRevenue), sub: `${summary.avgFeeRate}% avg fee rate`, icon: "ri-coins-line", color: "bg-[#C28A78]" },
            { label: "Actual Revenue", value: formatCurrency(summary.actualRevenue), sub: `${summary.totalJobsCompleted} transactions`, icon: "ri-bank-card-line", color: "bg-[#8B5CF6]" },
            { label: "Active Listings", value: activeListings, sub: `${totalLeadsFromListings} leads generated`, icon: "ri-store-2-line", color: "bg-[#F97316]" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${card.icon} text-white text-sm`}></i>
                </div>
                <span className="text-xs text-[#687068]">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{card.value}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-2xl p-1 w-fit">
          {[
            { key: "revenue" as const, label: "Revenue Analytics", icon: "ri-line-chart-line" },
            { key: "listings" as const, label: "Featured Listings", icon: "ri-star-line" },
            { key: "leads" as const, label: "Lead Tracking", icon: "ri-user-search-line" },
            { key: "referrals" as const, label: "Referrals", icon: "ri-share-line" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white text-[#3A3F3A] shadow-sm border border-[#E2E8F0]"
                  : "text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className={`${tab.icon} text-sm w-4 h-4 flex items-center justify-center`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Revenue by Referral Source</h2>
                  <span className="text-xs text-[#94A3B8]">{revenueBySource.length} sources</span>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sourceChartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#687068" }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 12 }} formatter={(v: any) => [formatFullCurrency(v), ""]} />
                      <Bar dataKey="revenue" name="Job Value" fill="#C28A78" radius={[6, 6, 0, 0]} barSize={28} />
                      <Bar dataKey="fee" name="Fee Earned" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Fee Distribution</h2>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} formatter={(v: any) => [formatFullCurrency(v), "Fee"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {revenueBySource.slice(0, 5).map((r, i) => (
                      <div key={r.source} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                          <span className="text-[#475569]">{r.label}</span>
                        </div>
                        <span className="font-medium text-[#3A3F3A]">{formatCurrency(r.feeEarned)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Revenue by Source — Detailed</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Source</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Leads</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Jobs Won</th>
                      <th className="text-center px-5 py-3 text-xs font-medium text-[#687068]">Conversion</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-[#687068]">Job Value</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-[#687068]">Fee Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueBySource.map((r) => (
                      <tr key={r.source} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#F1F5F9] rounded-md flex items-center justify-center">
                              <i className={`${SOURCE_ICONS[r.source] || "ri-link"} text-[#687068] text-xs`}></i>
                            </div>
                            <span className="font-medium text-[#3A3F3A]">{r.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center text-[#3A3F3A] font-medium">{r.leadsGenerated}</td>
                        <td className="px-5 py-3.5 text-center text-[#3A3F3A] font-medium">{r.jobsWon}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            r.conversionRate >= 50 ? "bg-[#10B981]/10 text-[#10B981]" :
                            r.conversionRate >= 30 ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                            "bg-[#94A3B8]/10 text-[#687068]"
                          }`}>{r.conversionRate}%</span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-[#3A3F3A]">{r.revenueGenerated > 0 ? formatFullCurrency(r.revenueGenerated) : "—"}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-[#8B5CF6]">{r.feeEarned > 0 ? formatFullCurrency(r.feeEarned) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#687068] mr-2">Filter:</span>
              {[null, 1, 2, 3, 4].map((level) => (
                <button
                  key={level ?? "all"}
                  onClick={() => setPriorityFilter(level)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                    priorityFilter === level
                      ? level ? `${PRIORITY_BG[level]} border` : "bg-[#3A3F3A] text-white"
                      : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
                  }`}
                  style={priorityFilter === level && level ? { color: PRIORITY_COLORS[level], borderColor: PRIORITY_COLORS[level] } : {}}
                >
                  {level ? PRIORITY_LABELS[level] : "All"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className={`bg-white rounded-xl border p-5 transition-all ${
                  toggleStates[listing.id] ? "border-[#E2E8F0] hover:shadow-lg" : "border-[#E2E8F0] opacity-60"
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold ${
                        listing.priorityLevel === 1 ? "bg-[#8B5CF6]" :
                        listing.priorityLevel === 2 ? "bg-[#F59E0B]" :
                        listing.priorityLevel === 3 ? "bg-[#94A3B8]" : "bg-[#CBD5E1]"
                      }`}>
                        {listing.businessName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#3A3F3A]">{listing.businessName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_BG[listing.priorityLevel]}`} style={{ color: PRIORITY_COLORS[listing.priorityLevel] }}>
                            {PRIORITY_LABELS[listing.priorityLevel]}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">{listing.trade}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleListing(listing.id)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        toggleStates[listing.id] ? "bg-[#10B981]" : "bg-[#CBD5E1]"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                        toggleStates[listing.id] ? "left-[18px]" : "left-0.5"
                      }`}></div>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{listing.rating.toFixed(1)}</p>
                      <p className="text-[10px] text-[#94A3B8]">Rating</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{listing.completedJobs}</p>
                      <p className="text-[10px] text-[#94A3B8]">Jobs Done</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{listing.leadsGenerated}</p>
                      <p className="text-[10px] text-[#94A3B8]">Leads</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{formatCurrency(listing.revenueGenerated)}</p>
                      <p className="text-[10px] text-[#94A3B8]">Revenue</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-3 border-t border-[#E2E8F0]">
                    <span>Featured since {new Date(listing.featuredSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                    <span className={`font-medium ${
                      listing.status === "active" ? "text-[#10B981]" : listing.status === "paused" ? "text-[#F59E0B]" : "text-[#94A3B8]"
                    }`}>{listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#C28A78] to-[#143728] rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Boost Your Marketplace Revenue</h3>
                  <p className="text-sm text-white/70 mt-1">
                    Upgrade listings to higher priority tiers for more visibility, more leads, and more revenue. Platinum listings appear first in search results.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
                    <p className="text-lg font-bold">{filteredListings.length}</p>
                    <p className="text-[10px] text-white/60">Active Listings</p>
                  </div>
                  <div className="bg-white/10 rounded-lg px-4 py-3 text-center">
                    <p className="text-lg font-bold">{formatCurrency(filteredListings.reduce((s, f) => s + f.revenueGenerated, 0))}</p>
                    <p className="text-[10px] text-white/60">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Object.entries(PIPELINE_LABELS).map(([key, label]) => {
                const count = leadTracking.filter((l) => l.pipelineStage === key).length
                return (
                  <div key={key} className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: PIPELINE_COLORS[key] }}></div>
                    <p className="text-xl font-bold text-[#3A3F3A]">{count}</p>
                    <p className="text-[10px] text-[#94A3B8]">{label}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Lead Pipeline</h2>
                <span className="text-xs text-[#94A3B8]">{leadTracking.length} leads</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Lead</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Source</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Stage</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-[#687068]">Value</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-[#687068]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadTracking.map((lead) => (
                      <tr key={lead.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-[#3A3F3A]">{lead.name}</p>
                            {lead.company && <p className="text-xs text-[#94A3B8]">{lead.company}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-1 rounded-full bg-[#F1F5F9] text-[#687068] capitalize">{lead.source}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs capitalize text-[#475569]">{lead.leadType.replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: PIPELINE_COLORS[lead.pipelineStage] + "15", color: PIPELINE_COLORS[lead.pipelineStage] }}>
                            {PIPELINE_LABELS[lead.pipelineStage] || lead.pipelineStage}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-[#3A3F3A]">
                          {lead.estimatedValue > 0 ? formatCurrency(lead.estimatedValue) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#94A3B8] whitespace-nowrap">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {referralSummary.map((ref) => (
                <div key={ref.source} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center">
                      <i className={`${SOURCE_ICONS[ref.source] || "ri-share-line"} text-[#C28A78] text-lg`}></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#3A3F3A]">{ref.label}</h3>
                      <p className="text-xs text-[#94A3B8]">{ref.totalReferrals} referrals</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-[#3A3F3A]">{ref.jobsConverted}</p>
                      <p className="text-[10px] text-[#94A3B8]">Jobs Converted</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-[#8B5CF6]">{formatCurrency(ref.feeEarned)}</p>
                      <p className="text-[10px] text-[#94A3B8]">Fee Earned</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#94A3B8]">Conversion rate</span>
                      <span className={`font-semibold ${
                        ref.totalReferrals > 0 && ref.jobsConverted / ref.totalReferrals >= 0.5 ? "text-[#10B981]" :
                        ref.totalReferrals > 0 && ref.jobsConverted / ref.totalReferrals >= 0.3 ? "text-[#F59E0B]" :
                        "text-[#94A3B8]"
                      }`}>
                        {ref.totalReferrals > 0 ? Math.round((ref.jobsConverted / ref.totalReferrals) * 100) : 0}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C28A78] rounded-full transition-all"
                        style={{ width: `${ref.totalReferrals > 0 ? Math.round((ref.jobsConverted / ref.totalReferrals) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Referral Programme</h3>
                  <p className="text-sm text-white/70 mt-1">
                    Referrals from agents, landlords, and tenants are the highest-converting leads. Boost your referral programme to increase marketplace revenue.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-xl">{referralSummary.reduce((s, r) => s + r.totalReferrals, 0)}</p>
                    <p className="text-xs text-white/60">Total Referrals</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl">{formatCurrency(referralSummary.reduce((s, r) => s + r.feeEarned, 0))}</p>
                    <p className="text-xs text-white/60">Referral Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Marketplace", href: "/dashboard/marketplace", icon: "ri-store-2-line", color: "bg-[#C28A78]" },
            { label: "Contractors", href: "/dashboard/contractors", icon: "ri-briefcase-line", color: "bg-[#3B82F6]" },
            { label: "Compliance Mkt", href: "/dashboard/compliance-marketplace", icon: "ri-shield-check-line", color: "bg-[#10B981]" },
            { label: "Inventory Mkt", href: "/dashboard/inventory-marketplace", icon: "ri-clipboard-line", color: "bg-[#F97316]" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3"
            >
              <div className={`w-9 h-9 ${link.color} rounded-lg flex items-center justify-center`}>
                <i className={`${link.icon} text-white text-sm`}></i>
              </div>
              <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}