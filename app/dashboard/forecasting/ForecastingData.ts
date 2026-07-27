import { supabase } from "@/lib/supabaseClient"

export type TimeHorizon = 30 | 90 | 180

export interface ComplianceForecast {
  totalItems: number
  expiringInWindow: number
  overdueNow: number
  riskLevel: "low" | "medium" | "high" | "critical"
  riskScore: number
  expiringItems: {
    obligationCode: string
    propertyAddress: string
    propertyCity: string
    dueDate: string
    daysUntilDue: number
    status: string
  }[]
}

export interface MaintenanceForecast {
  totalOpen: number
  predictedNewJobs: number
  predictedUrgent: number
  riskLevel: "low" | "medium" | "high" | "critical"
  riskScore: number
  monthlyTrend: { month: string; count: number }[]
  hotspotTrades: { trade: string; count: number; trend: string }[]
}

export interface ChurnForecast {
  totalTenancies: number
  atRiskCount: number
  expiringInWindow: number
  periodicAtRisk: number
  riskLevel: "low" | "medium" | "high" | "critical"
  riskScore: number
  atRiskTenancies: {
    propertyAddress: string
    tenantName: string
    endDate: string
    rentAmount: number
    termType: string
    riskReason: string
  }[]
}

export interface ArrearsForecast {
  totalTenancies: number
  currentlyOverdue: number
  predictedAtRisk: number
  totalArrearsAmount: number
  riskLevel: "low" | "medium" | "high" | "critical"
  riskScore: number
  atRiskTenancies: {
    propertyAddress: string
    overdueAmount: number
    monthsOverdue: number
    riskReason: string
  }[]
}

export interface PortfolioRiskForecast {
  overallRiskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  propertiesAtRisk: number
  totalProperties: number
  avgHealthScore: number
  healthTrend: string
  breakdown: { category: string; score: number; riskLevel: string }[]
}

export interface RecommendedAction {
  id: string
  category: string
  title: string
  description: string
  urgency: "critical" | "high" | "medium" | "low"
  targetWindow: TimeHorizon
  icon: string
}

export interface ForecastingData {
  compliance: ComplianceForecast
  maintenance: MaintenanceForecast
  churn: ChurnForecast
  arrears: ArrearsForecast
  portfolioRisk: PortfolioRiskForecast
  recommendedActions: RecommendedAction[]
}

function computeTimeWindowRisk(count: number, base: number, window: TimeHorizon): { riskScore: number; riskLevel: "low" | "medium" | "high" | "critical" } {
  if (base === 0) base = 1
  const ratio = count / base
  const multiplier = window === 30 ? 1.0 : window === 90 ? 0.85 : 0.7
  const rawScore = Math.min(100, Math.round(ratio * 60 * multiplier))

  let riskLevel: "low" | "medium" | "high" | "critical"
  if (rawScore >= 75) riskLevel = "critical"
  else if (rawScore >= 50) riskLevel = "high"
  else if (rawScore >= 25) riskLevel = "medium"
  else riskLevel = "low"

  return { riskScore: rawScore, riskLevel }
}

function daysFromNow(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export async function fetchForecastingData(window: TimeHorizon): Promise<ForecastingData> {
  const now = new Date()
  const cutoff = new Date(now.getTime() + window * 24 * 60 * 60 * 1000)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const [complianceRes, maintenanceRes, tenanciesRes, rentRes, healthRes, propertiesRes] = await Promise.all([
    supabase.from("property_compliance_items").select("id, property_id, obligation_code, status, next_due, properties(address, city, postcode)").not("next_due", "is", null).order("next_due", { ascending: true }),
    supabase.from("maintenance_jobs").select("id, property_id, title, status, created_at, properties(address, city)").order("created_at", { ascending: false }).limit(100),
    supabase.from("tenancies").select("id, property_id, status, term_type, end_date, rent_amount, properties(address, city)").eq("status", "active"),
    supabase.from("rent_payments").select("id, tenancy_id, property_id, amount, due_date, paid_date, status, properties(address, city)").order("due_date", { ascending: false }).limit(200),
    supabase.from("property_health_scores").select("property_id, overall_score, compliance_score, maintenance_score, tenancy_score, rent_score, health_level, calculated_at, properties(address, city)").order("calculated_at", { ascending: false }),
    supabase.from("properties").select("id, line1, city, postcode, bedrooms"),
  ])

  const complianceItems = (complianceRes.data || []) as any[]
  const maintenanceJobs = (maintenanceRes.data || []) as any[]
  const tenancies = (tenanciesRes.data || []) as any[]
  const rentPayments = (rentRes.data || []) as any[]
  const healthScores = (healthRes.data || []) as any[]
  const properties = (propertiesRes.data || []) as any[]

  // --- Compliance Forecast ---
  const overdueNow = complianceItems.filter((c: any) => c.status === "overdue")
  const expiringInWindow = complianceItems.filter((c: any) => {
    if (!c.next_due) return false
    const days = daysFromNow(c.next_due)
    return days >= 0 && days <= window
  })
  const { riskScore: compRiskScore, riskLevel: compRiskLevel } = computeTimeWindowRisk(
    overdueNow.length + expiringInWindow.length,
    complianceItems.length,
    window,
  )

  const complianceForecast: ComplianceForecast = {
    totalItems: complianceItems.length,
    expiringInWindow: expiringInWindow.length,
    overdueNow: overdueNow.length,
    riskLevel: compRiskLevel,
    riskScore: compRiskScore,
    expiringItems: [...overdueNow, ...expiringInWindow].slice(0, 15).map((c: any) => ({
      obligationCode: c.obligation_code || "Unknown",
      propertyAddress: c.properties?.address || "—",
      propertyCity: c.properties?.city || "—",
      dueDate: c.next_due,
      daysUntilDue: daysFromNow(c.next_due),
      status: c.status,
    })),
  }

  // --- Maintenance Forecast ---
  const openJobs = maintenanceJobs.filter((m: any) => ["open", "in_progress", "reported", "scheduled"].includes(m.status))
  const monthlyBins: Record<string, number> = {}
  maintenanceJobs.forEach((m: any) => {
    if (!m.created_at) return
    const monthKey = m.created_at.slice(0, 7)
    monthlyBins[monthKey] = (monthlyBins[monthKey] || 0) + 1
  })
  const monthlyTrend = Object.entries(monthlyBins)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }))

  const recentAvg = monthlyTrend.length > 0
    ? monthlyTrend.slice(-3).reduce((s, t) => s + t.count, 0) / Math.min(3, monthlyTrend.slice(-3).length)
    : 0
  const predictedNewJobs = Math.round(recentAvg * (window / 30))
  const predictedUrgent = Math.round(predictedNewJobs * 0.25)

  const tradeCounts: Record<string, number> = {}
  maintenanceJobs.forEach((m: any) => {
    const words = (m.title || "").toLowerCase().split(" ")
    const trade = words[0] || "general"
    tradeCounts[trade] = (tradeCounts[trade] || 0) + 1
  })
  const hotspotTrades = Object.entries(tradeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([trade, count]) => ({ trade: trade.charAt(0).toUpperCase() + trade.slice(1), count, trend: "stable" }))

  const { riskScore: maintRiskScore, riskLevel: maintRiskLevel } = computeTimeWindowRisk(
    openJobs.length + predictedNewJobs,
    maintenanceJobs.length || 1,
    window,
  )

  const maintenanceForecast: MaintenanceForecast = {
    totalOpen: openJobs.length,
    predictedNewJobs,
    predictedUrgent,
    riskLevel: maintRiskLevel,
    riskScore: maintRiskScore,
    monthlyTrend,
    hotspotTrades,
  }

  // --- Churn Forecast ---
  const activeTenancies = tenancies.filter((t: any) => t.status === "active")
  const expiringTenancies = activeTenancies.filter((t: any) => {
    if (!t.end_date) return false
    const days = daysFromNow(t.end_date)
    return days >= 0 && days <= window
  })
  const periodicTenancies = activeTenancies.filter((t: any) => t.term_type === "periodic")
  const churnAtRisk = [...expiringTenancies]

  periodicTenancies.forEach((t: any) => {
    if (!churnAtRisk.find((c: any) => c.id === t.id)) {
      if (window >= 90) churnAtRisk.push(t)
    }
  })

  const { riskScore: churnRiskScore, riskLevel: churnRiskLevel } = computeTimeWindowRisk(
    churnAtRisk.length,
    activeTenancies.length || 1,
    window,
  )

  const churnForecast: ChurnForecast = {
    totalTenancies: activeTenancies.length,
    atRiskCount: churnAtRisk.length,
    expiringInWindow: expiringTenancies.length,
    periodicAtRisk: periodicTenancies.length,
    riskLevel: churnRiskLevel,
    riskScore: churnRiskScore,
    atRiskTenancies: churnAtRisk.slice(0, 12).map((t: any) => ({
      propertyAddress: t.properties?.address || "—",
      tenantName: "Tenant", 
      endDate: t.end_date || "Periodic",
      rentAmount: t.rent_amount || 0,
      termType: t.term_type,
      riskReason: t.term_type === "periodic" ? "Periodic — no fixed commitment" : `Expiring in ${daysFromNow(t.end_date)} days`,
    })),
  }

  // --- Arrears Forecast ---
  const overduePayments = rentPayments.filter((p: any) => p.status === "overdue")
  const pendingPayments = rentPayments.filter((p: any) => p.status === "pending")

  const totalArrearsAmount = overduePayments.reduce((s: number, p: any) => s + (p.amount || 0), 0)

  const arrearsByProperty: Record<string, { count: number; amount: number; address: string }> = {}
  overduePayments.forEach((p: any) => {
    const propId = p.property_id || "unknown"
    if (!arrearsByProperty[propId]) {
      arrearsByProperty[propId] = { count: 0, amount: 0, address: p.properties?.address || "—" }
    }
    arrearsByProperty[propId].count += 1
    arrearsByProperty[propId].amount += p.amount || 0
  })

  const atRiskArrears = Object.entries(arrearsByProperty)
    .map(([, v]) => ({
      propertyAddress: v.address,
      overdueAmount: v.amount,
      monthsOverdue: v.count,
      riskReason: v.count >= 3 ? "Chronic late payer" : v.count >= 2 ? "Multiple missed payments" : "Single overdue payment",
    }))
    .sort((a, b) => b.overdueAmount - a.overdueAmount)
    .slice(0, 10)

  const { riskScore: arrearsRiskScore, riskLevel: arrearsRiskLevel } = computeTimeWindowRisk(
    overduePayments.length + pendingPayments.length,
    rentPayments.length || 1,
    window,
  )

  const arrearsForecast: ArrearsForecast = {
    totalTenancies: activeTenancies.length,
    currentlyOverdue: overduePayments.length,
    predictedAtRisk: atRiskArrears.length,
    totalArrearsAmount,
    riskLevel: arrearsRiskLevel,
    riskScore: arrearsRiskScore,
    atRiskTenancies: atRiskArrears,
  }

  // --- Portfolio Risk ---
  const latestScores = new Map<string, any>()
  healthScores.forEach((h: any) => {
    if (!latestScores.has(h.property_id) || new Date(h.calculated_at) > new Date(latestScores.get(h.property_id).calculated_at)) {
      latestScores.set(h.property_id, h)
    }
  })

  const healthScoreValues = Array.from(latestScores.values())
  const avgHealthScore = healthScoreValues.length > 0
    ? Math.round(healthScoreValues.reduce((s: number, h: any) => s + h.overall_score, 0) / healthScoreValues.length)
    : 0

  const atRiskHealth = healthScoreValues.filter((h: any) =>
    h.health_level === "high_risk" || h.health_level === "attention_needed"
  )

  const portfolioRiskScore = Math.round(
    (compRiskScore * 0.25) + (maintRiskScore * 0.20) + (churnRiskScore * 0.20) + (arrearsRiskScore * 0.20) + ((100 - avgHealthScore) * 0.15)
  )

  let portfolioRiskLevel: "low" | "medium" | "high" | "critical"
  if (portfolioRiskScore >= 75) portfolioRiskLevel = "critical"
  else if (portfolioRiskScore >= 50) portfolioRiskLevel = "high"
  else if (portfolioRiskScore >= 25) portfolioRiskLevel = "medium"
  else portfolioRiskLevel = "low"

  const portfolioRiskForecast: PortfolioRiskForecast = {
    overallRiskScore: portfolioRiskScore,
    riskLevel: portfolioRiskLevel,
    propertiesAtRisk: atRiskHealth.length,
    totalProperties: properties.length,
    avgHealthScore,
    healthTrend: portfolioRiskScore > 50 ? "declining" : portfolioRiskScore > 30 ? "stable" : "improving",
    breakdown: [
      { category: "Compliance Risk", score: compRiskScore, riskLevel: compRiskLevel },
      { category: "Maintenance Risk", score: maintRiskScore, riskLevel: maintRiskLevel },
      { category: "Churn Risk", score: churnRiskScore, riskLevel: churnRiskLevel },
      { category: "Arrears Risk", score: arrearsRiskScore, riskLevel: arrearsRiskLevel },
      { category: "Health Score Gap", score: 100 - avgHealthScore, riskLevel: avgHealthScore >= 80 ? "low" : avgHealthScore >= 60 ? "medium" : "high" },
    ],
  }

  // --- Recommended Actions ---
  const actions: RecommendedAction[] = []

  if (complianceForecast.overdueNow > 0) {
    actions.push({
      id: "comp-overdue",
      category: "Compliance",
      title: `${complianceForecast.overdueNow} overdue compliance item${complianceForecast.overdueNow > 1 ? "s" : ""}`,
      description: `Immediate action required — ${complianceForecast.overdueNow} compliance certificate${complianceForecast.overdueNow > 1 ? "s have" : " has"} expired. Book inspections now to avoid penalties.`,
      urgency: "critical",
      targetWindow: 30,
      icon: "ri-shield-flash-line",
    })
  }

  if (complianceForecast.expiringInWindow > 0) {
    actions.push({
      id: "comp-expiring",
      category: "Compliance",
      title: `${complianceForecast.expiringInWindow} compliance item${complianceForecast.expiringInWindow > 1 ? "s" : ""} expiring within ${window} days`,
      description: `Schedule renewal inspections now. ${complianceForecast.expiringInWindow} certificate${complianceForecast.expiringInWindow > 1 ? "s" : ""} need${complianceForecast.expiringInWindow === 1 ? "s" : ""} renewal.`,
      urgency: complianceForecast.expiringInWindow > 3 ? "critical" : complianceForecast.expiringInWindow > 1 ? "high" : "medium",
      targetWindow: window as TimeHorizon,
      icon: "ri-calendar-check-line",
    })
  }

  if (maintenanceForecast.totalOpen > 0) {
    actions.push({
      id: "maint-open",
      category: "Maintenance",
      title: `${maintenanceForecast.totalOpen} open maintenance job${maintenanceForecast.totalOpen > 1 ? "s" : ""}`,
      description: `${maintenanceForecast.totalOpen} job${maintenanceForecast.totalOpen > 1 ? "s are" : " is"} currently unresolved. ${maintenanceForecast.predictedUrgent} more predicted urgent in next ${window} days.`,
      urgency: maintenanceForecast.totalOpen > 5 ? "high" : "medium",
      targetWindow: window as TimeHorizon,
      icon: "ri-tools-line",
    })
  }

  if (churnForecast.atRiskCount > 0) {
    actions.push({
      id: "churn-risk",
      category: "Tenant Retention",
      title: `${churnForecast.atRiskCount} tenanc${churnForecast.atRiskCount > 1 ? "ies" : "y"} at risk of ending`,
      description: `${churnForecast.expiringInWindow} fixed-term ending within ${window} days. ${churnForecast.periodicAtRisk} periodic tenancies could leave with short notice. Proactively contact tenants to discuss renewal.`,
      urgency: churnForecast.atRiskCount > 3 ? "high" : "medium",
      targetWindow: window as TimeHorizon,
      icon: "ri-user-unfollow-line",
    })
  }

  if (arrearsForecast.currentlyOverdue > 0) {
    actions.push({
      id: "arrears-action",
      category: "Arrears",
      title: `£${arrearsForecast.totalArrearsAmount.toLocaleString()} in arrears across ${arrearsForecast.predictedAtRisk} propert${arrearsForecast.predictedAtRisk > 1 ? "ies" : "y"}`,
      description: `${arrearsForecast.currentlyOverdue} overdue payment${arrearsForecast.currentlyOverdue > 1 ? "s" : ""}. Initiate arrears recovery process for chronic cases to prevent further escalation.`,
      urgency: arrearsForecast.totalArrearsAmount > 2000 ? "critical" : arrearsForecast.totalArrearsAmount > 500 ? "high" : "medium",
      targetWindow: 30,
      icon: "ri-alarm-warning-line",
    })
  }

  if (atRiskHealth.length > 0) {
    actions.push({
      id: "health-drop",
      category: "Portfolio Health",
      title: `${atRiskHealth.length} propert${atRiskHealth.length > 1 ? "ies" : "y"} flagged as ${atRiskHealth[0]?.health_level === "high_risk" ? "high risk" : "needing attention"}`,
      description: `Review health score breakdowns and create action plans. Average portfolio health: ${avgHealthScore}/100.`,
      urgency: atRiskHealth.filter((h: any) => h.health_level === "high_risk").length > 0 ? "critical" : "high",
      targetWindow: 30,
      icon: "ri-heart-pulse-line",
    })
  }

  actions.push({
    id: "review-forecast",
    category: "Strategy",
    title: "Schedule portfolio risk review",
    description: `Portfolio risk score: ${portfolioRiskScore}/100 (${portfolioRiskLevel}). Review forecast projections and adjust mitigation plans for the next ${window} days.`,
    urgency: portfolioRiskLevel === "critical" ? "critical" : portfolioRiskLevel === "high" ? "high" : "medium",
    targetWindow: window as TimeHorizon,
    icon: "ri-bar-chart-line",
  })

  return {
    compliance: complianceForecast,
    maintenance: maintenanceForecast,
    churn: churnForecast,
    arrears: arrearsForecast,
    portfolioRisk: portfolioRiskForecast,
    recommendedActions: actions.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return order[a.urgency] - order[b.urgency]
    }),
  }
}

export const RISK_COLORS: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
}

export const RISK_BG_COLORS: Record<string, string> = {
  low: "bg-[#10B981]/10",
  medium: "bg-[#F59E0B]/10",
  high: "bg-[#F97316]/10",
  critical: "bg-[#EF4444]/10",
}

export const RISK_BORDER_COLORS: Record<string, string> = {
  low: "border-[#10B981]/30",
  medium: "border-[#F59E0B]/30",
  high: "border-[#F97316]/30",
  critical: "border-[#EF4444]/30",
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}k`
  return `£${value.toLocaleString()}`
}

export function formatFullCurrency(value: number): string {
  return `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}