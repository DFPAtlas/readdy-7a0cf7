"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts"
import DashboardShell from "@/components/DashboardShell"
import {
  monthlyTrends,
  kpiCards,
  performanceKPIs,
  yoyComparison,
  trendSummary,
} from "./BIData"

const CHART_COLORS = {
  properties: "#C28A78",
  landlords: "#3B82F6",
  tenants: "#8B5CF6",
  revenue: "#10B981",
  compliance: "#10B981",
  maintenance: "#EF4444",
  arrears: "#F97316",
  occupancy: "#0EA5E9",
}

export default function BusinessIntelligencePage() {
  const [timeRange, setTimeRange] = useState<"6m" | "12m" | "all">("all")
  const [activeChart, setActiveChart] = useState("growth")

  const filteredTrends = (() => {
    if (timeRange === "6m") return monthlyTrends.slice(-6)
    if (timeRange === "12m") return monthlyTrends.slice(-12)
    return monthlyTrends
  })()

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const current = monthlyTrends[monthlyTrends.length - 1]
    const html = `<!DOCTYPE html><html><head><title>LetHub BI Report</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; padding: 60px 48px; max-width: 900px; margin: 0 auto; color: #3A3F3A; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .date { color: #687068; font-size: 14px; margin-bottom: 32px; }
  .kpis { display: flex; gap: 16px; margin-bottom: 40px; }
  .kpi-card { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
  .kpi-label { font-size: 12px; color: #687068; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .kpi-value { font-size: 28px; font-weight: 700; }
  .kpi-sub { font-size: 12px; color: #94A3B8; margin-top: 4px; }
  h2 { font-size: 18px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #C28A78; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th { text-align: left; padding: 10px 12px; background: #F8FAFC; font-size: 12px; color: #687068; text-transform: uppercase; border-bottom: 2px solid #E2E8F0; }
  td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
  .up { color: #10B981; }
  .down { color: #EF4444; }
  .summary-box { background: #F0F9F4; border: 1px solid #C28A78; border-radius: 12px; padding: 24px; margin-top: 32px; }
  .summary-box h2 { margin-top: 0; border: 0; }
  .summary-grid { display: flex; flex-wrap: wrap; gap: 16px; }
  .summary-item { flex: 1; min-width: 180px; }
  .summary-label { font-size: 11px; color: #687068; text-transform: uppercase; }
  .summary-value { font-size: 20px; font-weight: 700; color: #C28A78; }
  .footer { margin-top: 40px; font-size: 11px; color: #94A3B8; text-align: center; }
</style></head><body>
<h1>LetHub Business Intelligence Report</h1>
<p class="date">Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

<div class="kpis">
  <div class="kpi-card"><p class="kpi-label">Portfolio</p><p class="kpi-value">${current.properties}</p><p class="kpi-sub">Properties under management</p></div>
  <div class="kpi-card"><p class="kpi-label">Landlords</p><p class="kpi-value">${current.landlords}</p><p class="kpi-sub">Active landlord accounts</p></div>
  <div class="kpi-card"><p class="kpi-label">Tenants</p><p class="kpi-value">${current.tenants}</p><p class="kpi-sub">Tenants in active tenancies</p></div>
  <div class="kpi-card"><p class="kpi-label">Monthly Revenue</p><p class="kpi-value">&pound;${(current.revenue).toLocaleString()}</p><p class="kpi-sub">Recurring rent roll</p></div>
</div>

<h2>Performance Metrics</h2>
<table>
  <tr><th>Metric</th><th>Current</th><th>Previous Month</th><th>6 Months Ago</th><th>YoY</th></tr>
  <tr><td>Occupancy Rate</td><td>${current.occupancyRate}%</td><td>${monthlyTrends[monthlyTrends.length - 2].occupancyRate}%</td><td>${monthlyTrends[monthlyTrends.length - 7]?.occupancyRate || "-"}%</td><td class="up">+6pts</td></tr>
  <tr><td>Compliance Rate</td><td>${current.complianceRate}%</td><td>${monthlyTrends[monthlyTrends.length - 2].complianceRate}%</td><td>${monthlyTrends[monthlyTrends.length - 7]?.complianceRate || "-"}%</td><td class="up">+23pts</td></tr>
  <tr><td>Open Maintenance</td><td>${current.openMaintenance}</td><td>${monthlyTrends[monthlyTrends.length - 2].openMaintenance}</td><td>${monthlyTrends[monthlyTrends.length - 7]?.openMaintenance || "-"}</td><td class="down">-10</td></tr>
  <tr><td>Arrears Cases</td><td>${current.arrearsCount}</td><td>${monthlyTrends[monthlyTrends.length - 2].arrearsCount}</td><td>${monthlyTrends[monthlyTrends.length - 7]?.arrearsCount || "-"}</td><td class="down">-4</td></tr>
</table>

<div class="summary-box">
  <h2>Executive Summary</h2>
  <div class="summary-grid">
    <div class="summary-item"><p class="summary-label">Total Revenue (18 months)</p><p class="summary-value">${trendSummary.revenueTotal}</p></div>
    <div class="summary-item"><p class="summary-label">Portfolio Growth</p><p class="summary-value">${trendSummary.portfolioGrowth}</p></div>
    <div class="summary-item"><p class="summary-label">Landlord Growth</p><p class="summary-value">${trendSummary.landlordGrowth}</p></div>
    <div class="summary-item"><p class="summary-label">Tenant Growth</p><p class="summary-value">${trendSummary.tenantGrowth}</p></div>
    <div class="summary-item"><p class="summary-label">Revenue Growth</p><p class="summary-value">${trendSummary.revenueGrowth}</p></div>
    <div class="summary-item"><p class="summary-label">Compliance Improvement</p><p class="summary-value">${trendSummary.complianceImprovement}</p></div>
    <div class="summary-item"><p class="summary-label">Avg Occupancy</p><p class="summary-value">${trendSummary.occupancyAvg}</p></div>
    <div class="summary-item"><p class="summary-label">Average Churn</p><p class="summary-value">${trendSummary.churnAvg}</p></div>
  </div>
</div>

<p class="footer">Generated by LetHub &bull; Business Intelligence Centre</p>
</body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Business Intelligence Centre</h1>
            <p className="text-sm text-[#687068] mt-1">
              Agency-wide visibility — portfolio growth, revenue trends, compliance, and occupancy at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#F1F5F9] rounded-lg p-1">
              {(["6m", "12m", "all"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    timeRange === r
                      ? "bg-white text-[#3A3F3A] shadow-sm"
                      : "text-[#687068] hover:text-[#3A3F3A]"
                  }`}
                >
                  {r === "6m" ? "6 Months" : r === "12m" ? "12 Months" : "All Time"}
                </button>
              ))}
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#0F2B1F] transition-colors whitespace-nowrap cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-file-pdf-line text-sm"></i>
              </div>
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#C28A78]/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }}></i>
                </div>
                <div>
                  <p className="text-xs text-[#687068]">{kpi.label}</p>
                  <p className="text-xl font-bold text-[#3A3F3A]">{kpi.value}</p>
                </div>
              </div>
              <p className="text-xs text-[#94A3B8]">{kpi.subValue}</p>
              <div className="mt-3 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTrends.map((t) => ({ month: t.month, value: (t as any)[kpi.id === "revenue" ? "revenue" : (kpi.id === "landlords" ? "landlords" : kpi.id === "tenants" ? "tenants" : "properties")] }))}>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={kpi.color}
                      fill={kpi.color}
                      fillOpacity={0.1}
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-xs font-medium ${
                    kpi.trend === "up" ? "text-[#10B981]" : kpi.trend === "down" ? "text-[#EF4444]" : "text-[#94A3B8]"
                  }`}
                >
                  <i
                    className={`${
                      kpi.trend === "up"
                        ? "ri-arrow-up-line"
                        : kpi.trend === "down"
                        ? "ri-arrow-down-line"
                        : "ri-subtract-line"
                    } text-xs mr-0.5`}
                  ></i>
                  {kpi.trendPercent} vs last month
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {performanceKPIs.map((kpi) => {
            const isPositive =
              kpi.id === "occupancy" || kpi.id === "compliance"
                ? kpi.trend === "up"
                : kpi.id === "churn" || kpi.id === "maintenance" || kpi.id === "arrears"
                ? kpi.trend === "down"
                : kpi.trend === "up"
            return (
              <div
                key={kpi.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${kpi.color}15` }}
                  >
                    <i className={`${kpi.icon} text-xs`} style={{ color: kpi.color }}></i>
                  </div>
                  <span className="text-xs text-[#687068] truncate">{kpi.label}</span>
                </div>
                <p className="text-lg font-bold text-[#3A3F3A]">{kpi.value}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    isPositive ? "text-[#10B981]" : kpi.trend === "stable" ? "text-[#94A3B8]" : "text-[#EF4444]"
                  }`}
                >
                  <i
                    className={`${
                      kpi.trend === "up"
                        ? "ri-arrow-up-line"
                        : kpi.trend === "down"
                        ? "ri-arrow-down-line"
                        : "ri-subtract-line"
                    } text-xs mr-0.5`}
                  ></i>
                  {kpi.trendPercent} vs last month
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
          {[
            { key: "growth", label: "Portfolio Growth" },
            { key: "revenue", label: "Revenue" },
            { key: "compliance", label: "Compliance" },
            { key: "maintenance", label: "Maintenance" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeChart === tab.key
                  ? "bg-white text-[#3A3F3A] shadow-sm"
                  : "text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          {activeChart === "growth" && (
            <div>
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Portfolio, Landlord & Tenant Growth</h3>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={filteredTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend
                    iconType="rect"
                    wrapperStyle={{ fontSize: 12, color: "#687068" }}
                  />
                  <Bar dataKey="properties" fill={CHART_COLORS.properties} radius={[4, 4, 0, 0]} name="Properties" />
                  <Line type="monotone" dataKey="landlords" stroke={CHART_COLORS.landlords} strokeWidth={2} dot={false} name="Landlords" />
                  <Line type="monotone" dataKey="tenants" stroke={CHART_COLORS.tenants} strokeWidth={2} dot={false} name="Tenants" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === "revenue" && (
            <div>
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Monthly Revenue Trends</h3>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={filteredTrends}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => "£" + (v / 1000).toFixed(0) + "k"} />
                  <Tooltip
                    formatter={(value: any) => ["£" + value.toLocaleString(), "Revenue"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.revenue}
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === "compliance" && (
            <div>
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Compliance Rate & Arrears Trend</h3>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={filteredTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[60, 100]} tickFormatter={(v) => v + "%"} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: 12, color: "#687068" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="complianceRate"
                    stroke={CHART_COLORS.compliance}
                    strokeWidth={2}
                    dot={false}
                    name="Compliance Rate %"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="arrearsCount"
                    fill={CHART_COLORS.arrears}
                    radius={[4, 4, 0, 0]}
                    name="Arrears Cases"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === "maintenance" && (
            <div>
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Maintenance & Occupancy Trends</h3>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={filteredTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[85, 100]} tickFormatter={(v) => v + "%"} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: 12, color: "#687068" }} />
                  <Bar
                    yAxisId="left"
                    dataKey="openMaintenance"
                    fill={CHART_COLORS.maintenance}
                    radius={[4, 4, 0, 0]}
                    name="Open Jobs"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancyRate"
                    stroke={CHART_COLORS.occupancy}
                    strokeWidth={2}
                    dot={false}
                    name="Occupancy %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Year-over-Year Comparison</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">Jun 2026 vs Jan 2025</p>
            </div>
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left py-2 px-3 text-xs font-medium text-[#687068] uppercase">Metric</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-[#687068] uppercase">Current</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-[#687068] uppercase">Jan 2025</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-[#687068] uppercase">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(yoyComparison).map(([key, val]) => (
                    <tr key={key} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="py-3 px-3 text-sm text-[#3A3F3A] capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-medium text-[#3A3F3A]">{val.current}</td>
                      <td className="py-3 px-3 text-sm text-right text-[#687068]">{val.lastYear}</td>
                      <td className="py-3 px-3 text-sm text-right font-medium text-[#10B981]">{val.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0F172A] to-[#C28A78] rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">
                <i className="ri-lightbulb-flash-line text-lg"></i>
              </div>
              <h2 className="font-semibold">Executive Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "18-Month Revenue", value: trendSummary.revenueTotal, icon: "ri-coins-line" },
                { label: "Revenue Growth", value: trendSummary.revenueGrowth, icon: "ri-arrow-up-line" },
                { label: "Portfolio Growth", value: trendSummary.portfolioGrowth, icon: "ri-building-4-line" },
                { label: "Landlord Growth", value: trendSummary.landlordGrowth, icon: "ri-user-star-line" },
                { label: "Tenant Growth", value: trendSummary.tenantGrowth, icon: "ri-user-3-line" },
                { label: "Compliance Gain", value: trendSummary.complianceImprovement, icon: "ri-shield-check-line" },
                { label: "Maintenance Drop", value: trendSummary.maintenanceReduction, icon: "ri-tools-line" },
                { label: "Avg Occupancy", value: trendSummary.occupancyAvg, icon: "ri-home-4-line" },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-4 h-4 flex items-center justify-center opacity-70">
                      <i className={`${item.icon} text-xs`}></i>
                    </div>
                    <p className="text-xs text-white/60">{item.label}</p>
                  </div>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Executive Dashboard", href: "/dashboard/executive", icon: "ri-pie-chart-line", color: "bg-[#C28A78]" },
            { label: "Portfolio Heat Map", href: "/dashboard/portfolio-heatmap", icon: "ri-grid-line", color: "bg-[#3B82F6]" },
            { label: "Financial Hub", href: "/dashboard/financial-hub", icon: "ri-funds-box-line", color: "bg-[#8B5CF6]" },
            { label: "Reports", href: "/dashboard/reports", icon: "ri-bar-chart-2-line", color: "bg-[#F59E0B]" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/30 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}>
                <i className={`${link.icon} text-white text-lg`}></i>
              </div>
              <span className="text-sm font-medium text-[#3A3F3A]">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}