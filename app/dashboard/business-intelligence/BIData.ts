export interface KPICard {
  id: string
  label: string
  value: string
  subValue: string
  trend: "up" | "down" | "stable"
  trendPercent: string
  icon: string
  color: string
  chartData: { month: string; value: number }[]
}

export interface MonthlyTrend {
  month: string
  properties: number
  landlords: number
  tenants: number
  activeTenancies: number
  revenue: number
  complianceRate: number
  openMaintenance: number
  arrearsCount: number
  churnedTenancies: number
  occupancyRate: number
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "£" + (n / 1000).toFixed(0) + "k"
  return "£" + n.toFixed(0)
}

function formatCompact(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return (n / 1000).toFixed(0) + "k"
  return n.toString()
}

export const monthlyTrends: MonthlyTrend[] = [
  { month: "Jan 2025", properties: 124, landlords: 86, tenants: 198, activeTenancies: 118, revenue: 156200, complianceRate: 72, openMaintenance: 28, arrearsCount: 6, churnedTenancies: 3, occupancyRate: 91 },
  { month: "Feb 2025", properties: 128, landlords: 88, tenants: 204, activeTenancies: 120, revenue: 159800, complianceRate: 74, openMaintenance: 25, arrearsCount: 5, churnedTenancies: 2, occupancyRate: 92 },
  { month: "Mar 2025", properties: 131, landlords: 90, tenants: 212, activeTenancies: 123, revenue: 164100, complianceRate: 76, openMaintenance: 30, arrearsCount: 7, churnedTenancies: 4, occupancyRate: 93 },
  { month: "Apr 2025", properties: 135, landlords: 93, tenants: 220, activeTenancies: 127, revenue: 169500, complianceRate: 78, openMaintenance: 22, arrearsCount: 4, churnedTenancies: 2, occupancyRate: 94 },
  { month: "May 2025", properties: 138, landlords: 95, tenants: 228, activeTenancies: 130, revenue: 173800, complianceRate: 81, openMaintenance: 24, arrearsCount: 5, churnedTenancies: 3, occupancyRate: 94 },
  { month: "Jun 2025", properties: 142, landlords: 98, tenants: 236, activeTenancies: 135, revenue: 178400, complianceRate: 83, openMaintenance: 26, arrearsCount: 4, churnedTenancies: 2, occupancyRate: 95 },
  { month: "Jul 2025", properties: 145, landlords: 101, tenants: 242, activeTenancies: 137, revenue: 182900, complianceRate: 84, openMaintenance: 29, arrearsCount: 5, churnedTenancies: 3, occupancyRate: 94 },
  { month: "Aug 2025", properties: 148, landlords: 103, tenants: 248, activeTenancies: 140, revenue: 187200, complianceRate: 85, openMaintenance: 20, arrearsCount: 3, churnedTenancies: 2, occupancyRate: 95 },
  { month: "Sep 2025", properties: 152, landlords: 106, tenants: 256, activeTenancies: 144, revenue: 191500, complianceRate: 86, openMaintenance: 23, arrearsCount: 4, churnedTenancies: 2, occupancyRate: 95 },
  { month: "Oct 2025", properties: 156, landlords: 109, tenants: 264, activeTenancies: 148, revenue: 196800, complianceRate: 88, openMaintenance: 21, arrearsCount: 3, churnedTenancies: 3, occupancyRate: 96 },
  { month: "Nov 2025", properties: 159, landlords: 112, tenants: 272, activeTenancies: 151, revenue: 201200, complianceRate: 89, openMaintenance: 19, arrearsCount: 2, churnedTenancies: 1, occupancyRate: 95 },
  { month: "Dec 2025", properties: 163, landlords: 115, tenants: 280, activeTenancies: 155, revenue: 206500, complianceRate: 90, openMaintenance: 18, arrearsCount: 3, churnedTenancies: 2, occupancyRate: 96 },
  { month: "Jan 2026", properties: 167, landlords: 118, tenants: 288, activeTenancies: 158, revenue: 211800, complianceRate: 91, openMaintenance: 22, arrearsCount: 4, churnedTenancies: 3, occupancyRate: 96 },
  { month: "Feb 2026", properties: 170, landlords: 120, tenants: 294, activeTenancies: 161, revenue: 215600, complianceRate: 92, openMaintenance: 17, arrearsCount: 2, churnedTenancies: 2, occupancyRate: 97 },
  { month: "Mar 2026", properties: 174, landlords: 123, tenants: 302, activeTenancies: 165, revenue: 220300, complianceRate: 93, openMaintenance: 20, arrearsCount: 3, churnedTenancies: 2, occupancyRate: 97 },
  { month: "Apr 2026", properties: 178, landlords: 126, tenants: 310, activeTenancies: 169, revenue: 225400, complianceRate: 93, openMaintenance: 19, arrearsCount: 2, churnedTenancies: 1, occupancyRate: 96 },
  { month: "May 2026", properties: 182, landlords: 128, tenants: 318, activeTenancies: 173, revenue: 230100, complianceRate: 94, openMaintenance: 21, arrearsCount: 3, churnedTenancies: 2, occupancyRate: 97 },
  { month: "Jun 2026", properties: 186, landlords: 132, tenants: 328, activeTenancies: 178, revenue: 236800, complianceRate: 95, openMaintenance: 18, arrearsCount: 2, churnedTenancies: 2, occupancyRate: 97 },
]

const current = monthlyTrends[monthlyTrends.length - 1]
const previous = monthlyTrends[monthlyTrends.length - 2]
const sixMonthsAgo = monthlyTrends[monthlyTrends.length - 7] || monthlyTrends[0]

function trendDelta(currentVal: number, previousVal: number): { trend: "up" | "down" | "stable"; trendPercent: string } {
  const diff = currentVal - previousVal
  const pct = previousVal !== 0 ? Math.round((diff / previousVal) * 100) : 0
  if (Math.abs(diff) < 1) return { trend: "stable", trendPercent: "0%" }
  return {
    trend: diff > 0 ? "up" : "down",
    trendPercent: (pct >= 0 ? "+" : "") + pct + "%"
  }
}

export const kpiCards: KPICard[] = [
  {
    id: "portfolio",
    label: "Portfolio Growth",
    value: current.properties.toLocaleString(),
    subValue: `+${current.properties - sixMonthsAgo.properties} properties in 6 months`,
    ...trendDelta(current.properties, previous.properties),
    icon: "ri-building-4-line",
    color: "#C28A78",
    chartData: monthlyTrends.map((t) => ({ month: t.month, value: t.properties })),
  },
  {
    id: "landlords",
    label: "Landlord Growth",
    value: current.landlords.toLocaleString(),
    subValue: `+${current.landlords - sixMonthsAgo.landlords} landlords in 6 months`,
    ...trendDelta(current.landlords, previous.landlords),
    icon: "ri-user-star-line",
    color: "#3B82F6",
    chartData: monthlyTrends.map((t) => ({ month: t.month, value: t.landlords })),
  },
  {
    id: "tenants",
    label: "Tenant Growth",
    value: current.tenants.toLocaleString(),
    subValue: `+${current.tenants - sixMonthsAgo.tenants} tenants in 6 months`,
    ...trendDelta(current.tenants, previous.tenants),
    icon: "ri-user-3-line",
    color: "#8B5CF6",
    chartData: monthlyTrends.map((t) => ({ month: t.month, value: t.tenants })),
  },
  {
    id: "revenue",
    label: "Revenue Trends",
    value: formatCurrency(current.revenue),
    subValue: `Monthly rent roll`,
    ...trendDelta(current.revenue, previous.revenue),
    icon: "ri-coins-line",
    color: "#10B981",
    chartData: monthlyTrends.map((t) => ({ month: t.month, value: t.revenue })),
  },
]

export const performanceKPIs = [
  {
    id: "occupancy",
    label: "Occupancy Rate",
    value: current.occupancyRate + "%",
    ...trendDelta(current.occupancyRate, previous.occupancyRate),
    icon: "ri-home-4-line",
    color: "#0EA5E9",
  },
  {
    id: "churn",
    label: "Churn Rate",
    value: ((monthlyTrends.reduce((sum, t) => sum + t.churnedTenancies, 0) / monthlyTrends.reduce((sum, t) => sum + t.activeTenancies, 0)) * 100).toFixed(1) + "%",
    ...trendDelta(current.churnedTenancies, previous.churnedTenancies),
    icon: "ri-user-unfollow-line",
    color: "#F59E0B",
  },
  {
    id: "compliance",
    label: "Compliance Rate",
    value: current.complianceRate + "%",
    ...trendDelta(current.complianceRate, previous.complianceRate),
    icon: "ri-shield-check-line",
    color: "#10B981",
  },
  {
    id: "maintenance",
    label: "Open Maintenance",
    value: current.openMaintenance.toString(),
    ...trendDelta(current.openMaintenance, previous.openMaintenance),
    icon: "ri-tools-line",
    color: "#EF4444",
  },
  {
    id: "arrears",
    label: "Arrears Cases",
    value: current.arrearsCount.toString(),
    ...trendDelta(current.arrearsCount, previous.arrearsCount),
    icon: "ri-alarm-warning-line",
    color: "#F97316",
  },
  {
    id: "avg_rent",
    label: "Avg Monthly Rent",
    value: "£" + Math.round(current.revenue / current.activeTenancies).toLocaleString(),
    ...trendDelta(
      Math.round(current.revenue / current.activeTenancies),
      Math.round(previous.revenue / previous.activeTenancies)
    ),
    icon: "ri-bank-card-line",
    color: "#6366F1",
  },
]

export const yoyComparison = {
  properties: { current: current.properties, lastYear: 124, change: "+50%" },
  landlords: { current: current.landlords, lastYear: 86, change: "+53%" },
  tenants: { current: current.tenants, lastYear: 198, change: "+66%" },
  revenue: { current: formatCurrency(current.revenue), lastYear: formatCurrency(156200), change: "+52%" },
  occupancy: { current: current.occupancyRate + "%", lastYear: "91%", change: "+6pts" },
  compliance: { current: current.complianceRate + "%", lastYear: "72%", change: "+23pts" },
}

export interface TrendSummary {
  revenueTotal: string
  revenueGrowth: string
  portfolioGrowth: string
  landlordGrowth: string
  tenantGrowth: string
  complianceImprovement: string
  maintenanceReduction: string
  occupancyAvg: string
  churnAvg: string
}

export const trendSummary: TrendSummary = {
  revenueTotal: formatCurrency(monthlyTrends.reduce((s, t) => s + t.revenue, 0)),
  revenueGrowth: "+" + Math.round(((current.revenue - monthlyTrends[0].revenue) / monthlyTrends[0].revenue) * 100) + "%",
  portfolioGrowth: "+" + (current.properties - monthlyTrends[0].properties),
  landlordGrowth: "+" + (current.landlords - monthlyTrends[0].landlords),
  tenantGrowth: "+" + (current.tenants - monthlyTrends[0].tenants),
  complianceImprovement: "+" + (current.complianceRate - monthlyTrends[0].complianceRate) + "pts",
  maintenanceReduction: "-" + (monthlyTrends[0].openMaintenance - current.openMaintenance),
  occupancyAvg: Math.round(monthlyTrends.reduce((s, t) => s + t.occupancyRate, 0) / monthlyTrends.length) + "%",
  churnAvg: ((monthlyTrends.reduce((sum, t) => sum + t.churnedTenancies, 0) / monthlyTrends.reduce((sum, t) => sum + t.activeTenancies, 0)) * 100).toFixed(1) + "%",
}