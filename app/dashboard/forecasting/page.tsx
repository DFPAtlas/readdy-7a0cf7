"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import DashboardShell from "@/components/DashboardShell"
import {
  fetchForecastingData,
  RISK_COLORS,
  RISK_BG_COLORS,
  RISK_BORDER_COLORS,
  formatCurrency,
  formatFullCurrency,
  type TimeHorizon,
  type ForecastingData,
  type RecommendedAction,
} from "./ForecastingData"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, Cell } from "recharts"

const HORIZON_LABELS: Record<TimeHorizon, { label: string; desc: string }> = {
  30: { label: "30 Days", desc: "Short-term outlook" },
  90: { label: "90 Days", desc: "Quarterly projection" },
  180: { label: "180 Days", desc: "Six-month forecast" },
}

const URGENCY_ICONS: Record<string, string> = {
  critical: "ri-error-warning-fill",
  high: "ri-alert-fill",
  medium: "ri-information-fill",
  low: "ri-checkbox-circle-fill",
}

const URGENCY_COLORS: Record<string, string> = {
  critical: "text-[#EF4444]",
  high: "text-[#F97316]",
  medium: "text-[#F59E0B]",
  low: "text-[#10B981]",
}

const URGENCY_BG: Record<string, string> = {
  critical: "bg-[#EF4444]/10",
  high: "bg-[#F97316]/10",
  medium: "bg-[#F59E0B]/10",
  low: "bg-[#10B981]/10",
}

export default function ForecastingPage() {
  const [horizon, setHorizon] = useState<TimeHorizon>(90)
  const [data, setData] = useState<ForecastingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastRefresh, setLastRefresh] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchForecastingData(horizon)
      setData(result)
      setLastRefresh(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))
    } catch {
      setError("Could not load forecasting data")
    } finally {
      setLoading(false)
    }
  }, [horizon])

  useEffect(() => {
    load()
  }, [load])

  const riskMeterColor = (score: number) => {
    if (score >= 75) return "#EF4444"
    if (score >= 50) return "#F97316"
    if (score >= 25) return "#F59E0B"
    return "#10B981"
  }

  if (loading && !data) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-[#687068]">Crunching forecast data...</span>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-24 text-[#94A3B8]">
          <div className="text-center">
            <i className="ri-error-warning-line text-4xl block mb-3"></i>
            <p>{error}</p>
            <button onClick={load} className="mt-4 text-sm text-[#C28A78] hover:underline font-medium">Try again</button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!data) return null

  const { compliance, maintenance, churn, arrears, portfolioRisk, recommendedActions } = data

  const complianceChartData = compliance.expiringItems.map((item) => ({
    name: item.obligationCode,
    days: Math.max(item.daysUntilDue, -90),
    property: item.propertyAddress,
    status: item.status,
  }))

  const breakdownChartData = portfolioRisk.breakdown.map((b) => ({
    name: b.category,
    score: b.score,
    fill: RISK_COLORS[b.riskLevel] || "#94A3B8",
  }))

  const arrearsChartData = arrears.atRiskTenancies.slice(0, 6).map((t) => ({
    name: t.propertyAddress.length > 20 ? t.propertyAddress.slice(0, 20) + "..." : t.propertyAddress,
    amount: t.overdueAmount,
  }))

  const timelineData = [
    { label: "Now", complianceRisk: compliance.riskScore, maintenanceRisk: maintenance.riskScore, churnRisk: churn.riskScore, arrearsRisk: arrears.riskScore },
    { label: `+${Math.round(horizon / 3)}d`, complianceRisk: Math.round(compliance.riskScore * 0.85), maintenanceRisk: Math.round(maintenance.riskScore * 0.9), churnRisk: Math.round(churn.riskScore * 0.8), arrearsRisk: Math.round(arrears.riskScore * 0.75) },
    { label: `+${Math.round(horizon * 0.66)}d`, complianceRisk: Math.round(compliance.riskScore * 0.6), maintenanceRisk: Math.round(maintenance.riskScore * 0.7), churnRisk: Math.round(churn.riskScore * 0.55), arrearsRisk: Math.round(arrears.riskScore * 0.5) },
    { label: `+${horizon}d`, complianceRisk: Math.round(compliance.riskScore * 0.3), maintenanceRisk: Math.round(maintenance.riskScore * 0.4), churnRisk: Math.round(churn.riskScore * 0.25), arrearsRisk: Math.round(arrears.riskScore * 0.2) },
  ]

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">AI Portfolio Forecasting</h1>
            <p className="text-sm text-[#687068] mt-1">
              Predict compliance expiries, maintenance spikes, tenant churn, arrears risk and portfolio health before they happen
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8]">Updated {lastRefresh || "--:--"}</span>
            <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors" title="Refresh forecast">
              <i className="ri-refresh-line text-[#687068]"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-2xl p-1 w-fit">
          {(Object.keys(HORIZON_LABELS) as unknown as TimeHorizon[]).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                horizon === h
                  ? "bg-white text-[#3A3F3A] shadow-sm border border-[#E2E8F0]"
                  : "text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <span>{HORIZON_LABELS[h].label}</span>
              <span className="hidden sm:inline text-xs text-[#94A3B8] ml-1.5">{HORIZON_LABELS[h].desc}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col items-center justify-center">
            <p className="text-xs text-[#687068] mb-2 font-medium uppercase tracking-wide">Portfolio Risk Score</p>
            <div className="relative w-32 h-32 mb-3">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle cx="64" cy="64" r="54" fill="none" stroke={riskMeterColor(portfolioRisk.overallRiskScore)} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${(portfolioRisk.overallRiskScore / 100) * 339.29} 339.29`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: riskMeterColor(portfolioRisk.overallRiskScore) }}>{portfolioRisk.overallRiskScore}</span>
              </span>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${RISK_BG_COLORS[portfolioRisk.riskLevel]} ${RISK_BORDER_COLORS[portfolioRisk.riskLevel]} border`} style={{ color: RISK_COLORS[portfolioRisk.riskLevel] }}>
              {portfolioRisk.riskLevel.charAt(0).toUpperCase() + portfolioRisk.riskLevel.slice(1)} Risk
            </span>
            <p className="text-xs text-[#94A3B8] mt-3 text-center">
              {portfolioRisk.propertiesAtRisk} of {portfolioRisk.totalProperties} properties at risk
            </p>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Compliance Expiry", value: compliance.expiringInWindow + compliance.overdueNow, sub: `${compliance.overdueNow} overdue`, icon: "ri-shield-check-line", risk: compliance.riskLevel, score: compliance.riskScore },
              { label: "Maintenance Spike", value: maintenance.totalOpen + maintenance.predictedNewJobs, sub: `${maintenance.predictedUrgent} urgent predicted`, icon: "ri-tools-line", risk: maintenance.riskLevel, score: maintenance.riskScore },
              { label: "Tenant Churn", value: churn.atRiskCount, sub: `${churn.expiringInWindow} ending in window`, icon: "ri-user-unfollow-line", risk: churn.riskLevel, score: churn.riskScore },
              { label: "Arrears Risk", value: formatCurrency(arrears.totalArrearsAmount), sub: `${arrears.predictedAtRisk} properties`, icon: "ri-alarm-warning-line", risk: arrears.riskLevel, score: arrears.riskScore },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${RISK_BG_COLORS[card.risk]}`} style={{ color: RISK_COLORS[card.risk] }}>
                    <i className={`${card.icon} text-sm`}></i>
                  </div>
                  <span className="text-xs text-[#687068]">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{card.value}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{card.sub}</p>
                <div className="mt-3 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${card.score}%`, backgroundColor: RISK_COLORS[card.risk] }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Risk Projection Timeline</h2>
                <span className="text-xs text-[#94A3B8]">{horizon}-day forecast decay</span>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#687068" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 12 }} />
                    <Area type="monotone" dataKey="complianceRisk" stroke="#EF4444" fill="#EF4444" fillOpacity={0.08} strokeWidth={2} name="Compliance Risk" />
                    <Area type="monotone" dataKey="maintenanceRisk" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.08} strokeWidth={2} name="Maintenance Risk" />
                    <Area type="monotone" dataKey="churnRisk" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.08} strokeWidth={2} name="Churn Risk" />
                    <Area type="monotone" dataKey="arrearsRisk" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.08} strokeWidth={2} name="Arrears Risk" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 pb-4 text-xs text-[#687068]">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>Compliance</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>Maintenance</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>Churn</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>Arrears</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Compliance Expiry Forecast</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BG_COLORS[compliance.riskLevel]}`} style={{ color: RISK_COLORS[compliance.riskLevel] }}>
                    {compliance.expiringInWindow + compliance.overdueNow} items
                  </span>
                </div>
                <div className="p-5">
                  {compliance.expiringItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <i className="ri-check-line text-[#10B981] text-2xl block mb-2"></i>
                      <p className="text-sm text-[#94A3B8]">No compliance items expiring in this window</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto">
                      {compliance.expiringItems.map((item, i) => (
                        <div key={i} className={`rounded-lg p-3 border ${item.daysUntilDue < 0 ? "bg-[#FEF2F2] border-[#FECACA]" : item.daysUntilDue <= 30 ? "bg-[#FFF7ED] border-[#FED7AA]" : "bg-[#FFFBEB] border-[#FDE68A]"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#3A3F3A]">{item.obligationCode}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.status === "overdue" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                            }`}>
                              {item.status === "overdue" ? `${Math.abs(item.daysUntilDue)}d overdue` : `${item.daysUntilDue}d until due`}
                            </span>
                          </div>
                          <p className="text-xs text-[#687068]">{item.propertyAddress}, {item.propertyCity}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Maintenance Forecast</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BG_COLORS[maintenance.riskLevel]}`} style={{ color: RISK_COLORS[maintenance.riskLevel] }}>
                    {maintenance.totalOpen} open
                  </span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-[#F8FAFC] rounded-lg p-3">
                      <p className="text-xl font-bold text-[#3A3F3A]">{maintenance.totalOpen}</p>
                      <p className="text-[10px] text-[#94A3B8]">Open Now</p>
                    </div>
                    <div className="text-center bg-[#F8FAFC] rounded-lg p-3">
                      <p className="text-xl font-bold text-[#F59E0B]">~{maintenance.predictedNewJobs}</p>
                      <p className="text-[10px] text-[#94A3B8]">Predicted New</p>
                    </div>
                    <div className="text-center bg-[#F8FAFC] rounded-lg p-3">
                      <p className="text-xl font-bold text-[#EF4444]">~{maintenance.predictedUrgent}</p>
                      <p className="text-[10px] text-[#94A3B8]">Urgent</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#687068] mb-2">Hotspot Trades</p>
                    <div className="space-y-2">
                      {maintenance.hotspotTrades.slice(0, 5).map((t, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-[#475569]">{t.trade}</span>
                          <span className="text-xs text-[#94A3B8]">{t.count} jobs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Tenant Churn Risk</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BG_COLORS[churn.riskLevel]}`} style={{ color: RISK_COLORS[churn.riskLevel] }}>
                    {churn.atRiskCount} at risk
                  </span>
                </div>
                <div className="p-5">
                  {churn.atRiskTenancies.length === 0 ? (
                    <div className="py-12 text-center">
                      <i className="ri-check-line text-[#10B981] text-2xl block mb-2"></i>
                      <p className="text-sm text-[#94A3B8]">No tenancies at risk of ending</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto">
                      {churn.atRiskTenancies.map((t, i) => (
                        <div key={i} className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#3A3F3A] truncate max-w-[160px]">{t.propertyAddress}</span>
                            <span className="text-xs font-semibold text-[#3A3F3A]">{formatCurrency(t.rentAmount)}/mo</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              t.termType === "periodic" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" : "bg-[#3B82F6]/10 text-[#3B82F6]"
                            }`}>{t.termType === "periodic" ? "Periodic" : "Fixed Term"}</span>
                            <span className="text-[10px] text-[#94A3B8]">{t.riskReason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <h2 className="font-semibold text-[#3A3F3A]">Arrears Forecast</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BG_COLORS[arrears.riskLevel]}`} style={{ color: RISK_COLORS[arrears.riskLevel] }}>
                    {formatCurrency(arrears.totalArrearsAmount)}
                  </span>
                </div>
                <div className="p-5">
                  {arrears.atRiskTenancies.length === 0 ? (
                    <div className="py-12 text-center">
                      <i className="ri-check-line text-[#10B981] text-2xl block mb-2"></i>
                      <p className="text-sm text-[#94A3B8]">No arrears detected</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto">
                      {arrears.atRiskTenancies.map((t, i) => (
                        <div key={i} className={`rounded-lg p-3 border ${
                          t.monthsOverdue >= 3 ? "bg-[#FEF2F2] border-[#FECACA]" : "bg-[#FFF7ED] border-[#FED7AA]"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#3A3F3A] truncate max-w-[140px]">{t.propertyAddress}</span>
                            <span className="text-xs font-bold text-[#EF4444]">{formatFullCurrency(t.overdueAmount)}</span>
                          </div>
                          <p className="text-[10px] text-[#94A3B8]">{t.riskReason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Risk Breakdown by Category</h2>
                <span className="text-xs text-[#94A3B8]">{portfolioRisk.avgHealthScore}/100 avg health</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={breakdownChartData} layout="vertical" margin={{ left: 100, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }} axisLine={false} tickLine={false} width={130} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 12 }} />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={22}>
                          {breakdownChartData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {portfolioRisk.breakdown.map((b) => (
                      <div key={b.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[b.riskLevel] }}></div>
                          <span className="text-sm text-[#475569]">{b.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${b.score}%`, backgroundColor: RISK_COLORS[b.riskLevel] }}></div>
                          </div>
                          <span className="text-sm font-semibold text-[#3A3F3A] w-8 text-right">{b.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Recommended Actions</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">Prioritised by urgency</p>
              </div>
              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {recommendedActions.map((action) => (
                  <div key={action.id} className={`rounded-xl border p-4 ${URGENCY_BG[action.urgency]} hover:shadow-md transition-shadow`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${URGENCY_BG[action.urgency]}`} style={{ color: RISK_COLORS[action.urgency === "critical" ? "critical" : action.urgency === "high" ? "high" : action.urgency === "medium" ? "medium" : "low"] }}>
                        <i className={`${action.icon} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium text-[#687068]">{action.category}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${URGENCY_BG[action.urgency]}`} style={{ color: RISK_COLORS[action.urgency === "critical" ? "critical" : action.urgency === "high" ? "high" : action.urgency === "medium" ? "medium" : "low"] }}>
                            {action.urgency.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#3A3F3A] mb-1">{action.title}</p>
                        <p className="text-xs text-[#687068] leading-relaxed">{action.description}</p>
                        <p className="text-[10px] text-[#94A3B8] mt-2">Target: {HORIZON_LABELS[action.targetWindow].label}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {recommendedActions.length === 0 && (
                  <div className="py-8 text-center">
                    <i className="ri-check-line text-[#10B981] text-2xl block mb-2"></i>
                    <p className="text-sm text-[#94A3B8]">No actions needed — portfolio looks healthy</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#C28A78] to-[#143728] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <i className="ri-brain-line text-white text-sm"></i>
                </div>
                <h3 className="font-semibold">AI Forecast Engine</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Forecasts are computed from your live portfolio data — compliance schedules, maintenance history, rent payment patterns, tenancy end dates, and property health scores.
              </p>
              <div className="space-y-2 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <i className="ri-database-2-line"></i>
                  <span>Real-time Supabase data</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-refresh-line"></i>
                  <span>Updated on every refresh</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-shield-check-line"></i>
                  <span>Your data, your insights</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Risk Centre", href: "/dashboard/risk-centre", icon: "ri-shield-flash-line", color: "bg-[#EF4444]" },
                { label: "Benchmarking", href: "/dashboard/benchmarking", icon: "ri-bar-chart-line", color: "bg-[#3B82F6]" },
                { label: "Compliance", href: "/dashboard/compliance", icon: "ri-shield-check-line", color: "bg-[#10B981]" },
                { label: "Arrears", href: "/dashboard/arrears", icon: "ri-alarm-warning-line", color: "bg-[#F97316]" },
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
        </div>
      </div>
    </DashboardShell>
  )
}