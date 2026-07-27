export interface OfficeData {
  id: string
  name: string
  city: string
  postcode: string
  address: string
  managerName: string
  managerEmail: string
  staffCount: number
  portfolioSize: number
  portfolioValue: number
  complianceRate: number
  maintenanceLoad: number
  revenueMonthly: number
  status: string
  lat: number
  lng: number
}

export interface StaffMember {
  id: string
  officeId: string
  officeName: string
  name: string
  email: string
  role: string
  portfolioSize: number
  revenueMonthly: number
  complianceRate: number
  tenantSatisfaction: number
  maintenanceCompleted: number
  performanceScore: number
  status: string
}

export interface MonthlyBranchMetric {
  month: string
  officeName: string
  properties: number
  revenue: number
  complianceRate: number
  maintenanceLoad: number
  occupancyRate: number
}

export interface CrossPortfolioInsight {
  label: string
  value: string
  bestOffice: string
  bestValue: string
  worstOffice: string
  worstValue: string
  icon: string
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "£" + (n / 1000).toFixed(0) + "k"
  return "£" + n.toFixed(0)
}

export const offices: OfficeData[] = [
  {
    id: "1", name: "LetHub London HQ", city: "London", postcode: "EC2A 4NE",
    address: "80 Finsbury Pavement, Moorgate", managerName: "Sarah Mitchell",
    managerEmail: "sarah.mitchell@lethub.co.uk", staffCount: 14, portfolioSize: 68,
    portfolioValue: 14200000, complianceRate: 97, maintenanceLoad: 8, revenueMonthly: 89200,
    status: "active", lat: 51.5204, lng: -0.0873,
  },
  {
    id: "2", name: "LetHub Manchester", city: "Manchester", postcode: "M1 1AE",
    address: "1 St Peters Square", managerName: "James Okonkwo",
    managerEmail: "james.okonkwo@lethub.co.uk", staffCount: 9, portfolioSize: 42,
    portfolioValue: 7800000, complianceRate: 93, maintenanceLoad: 4, revenueMonthly: 48600,
    status: "active", lat: 53.4780, lng: -2.2447,
  },
  {
    id: "3", name: "LetHub Birmingham", city: "Birmingham", postcode: "B2 5SN",
    address: "103 Colmore Row", managerName: "Priya Sharma",
    managerEmail: "priya.sharma@lethub.co.uk", staffCount: 7, portfolioSize: 38,
    portfolioValue: 6500000, complianceRate: 95, maintenanceLoad: 3, revenueMonthly: 41200,
    status: "active", lat: 52.4814, lng: -1.9006,
  },
  {
    id: "4", name: "LetHub Bristol", city: "Bristol", postcode: "BS1 6QS",
    address: "31 Queen Square", managerName: "Tom Fletcher",
    managerEmail: "tom.fletcher@lethub.co.uk", staffCount: 6, portfolioSize: 32,
    portfolioValue: 5400000, complianceRate: 98, maintenanceLoad: 2, revenueMonthly: 35800,
    status: "active", lat: 51.4538, lng: -2.5943,
  },
]

export const staff: StaffMember[] = [
  { id: "s1", officeId: "1", officeName: "LetHub London HQ", name: "Sarah Mitchell", email: "sarah.mitchell@lethub.co.uk", role: "Regional Director", portfolioSize: 68, revenueMonthly: 89200, complianceRate: 97, tenantSatisfaction: 94, maintenanceCompleted: 42, performanceScore: 96, status: "active" },
  { id: "s2", officeId: "1", officeName: "LetHub London HQ", name: "Oliver Bennett", email: "oliver.bennett@lethub.co.uk", role: "Senior Property Manager", portfolioSize: 22, revenueMonthly: 28400, complianceRate: 96, tenantSatisfaction: 91, maintenanceCompleted: 38, performanceScore: 92, status: "active" },
  { id: "s3", officeId: "1", officeName: "LetHub London HQ", name: "Charlotte Hayes", email: "charlotte.hayes@lethub.co.uk", role: "Property Manager", portfolioSize: 18, revenueMonthly: 24100, complianceRate: 95, tenantSatisfaction: 93, maintenanceCompleted: 31, performanceScore: 90, status: "active" },
  { id: "s4", officeId: "1", officeName: "LetHub London HQ", name: "Daniel Russo", email: "daniel.russo@lethub.co.uk", role: "Property Manager", portfolioSize: 16, revenueMonthly: 20800, complianceRate: 98, tenantSatisfaction: 89, maintenanceCompleted: 28, performanceScore: 88, status: "active" },
  { id: "s5", officeId: "1", officeName: "LetHub London HQ", name: "Emily Clarke", email: "emily.clarke@lethub.co.uk", role: "Compliance Officer", portfolioSize: 12, revenueMonthly: 15900, complianceRate: 99, tenantSatisfaction: 96, maintenanceCompleted: 15, performanceScore: 94, status: "active" },
  { id: "s6", officeId: "2", officeName: "LetHub Manchester", name: "James Okonkwo", email: "james.okonkwo@lethub.co.uk", role: "Regional Director", portfolioSize: 42, revenueMonthly: 48600, complianceRate: 93, tenantSatisfaction: 91, maintenanceCompleted: 28, performanceScore: 91, status: "active" },
  { id: "s7", officeId: "2", officeName: "LetHub Manchester", name: "Katie Morrison", email: "katie.morrison@lethub.co.uk", role: "Senior Property Manager", portfolioSize: 24, revenueMonthly: 27800, complianceRate: 92, tenantSatisfaction: 90, maintenanceCompleted: 26, performanceScore: 89, status: "active" },
  { id: "s8", officeId: "2", officeName: "LetHub Manchester", name: "Marcus Webb", email: "marcus.webb@lethub.co.uk", role: "Property Manager", portfolioSize: 18, revenueMonthly: 20800, complianceRate: 94, tenantSatisfaction: 88, maintenanceCompleted: 22, performanceScore: 87, status: "active" },
  { id: "s9", officeId: "3", officeName: "LetHub Birmingham", name: "Priya Sharma", email: "priya.sharma@lethub.co.uk", role: "Regional Director", portfolioSize: 38, revenueMonthly: 41200, complianceRate: 95, tenantSatisfaction: 93, maintenanceCompleted: 24, performanceScore: 93, status: "active" },
  { id: "s10", officeId: "3", officeName: "LetHub Birmingham", name: "Ali Hassan", email: "ali.hassan@lethub.co.uk", role: "Property Manager", portfolioSize: 20, revenueMonthly: 22800, complianceRate: 94, tenantSatisfaction: 90, maintenanceCompleted: 20, performanceScore: 86, status: "active" },
  { id: "s11", officeId: "3", officeName: "LetHub Birmingham", name: "Lily Thompson", email: "lily.thompson@lethub.co.uk", role: "Property Manager", portfolioSize: 18, revenueMonthly: 18400, complianceRate: 96, tenantSatisfaction: 92, maintenanceCompleted: 18, performanceScore: 90, status: "active" },
  { id: "s12", officeId: "4", officeName: "LetHub Bristol", name: "Tom Fletcher", email: "tom.fletcher@lethub.co.uk", role: "Regional Director", portfolioSize: 32, revenueMonthly: 35800, complianceRate: 98, tenantSatisfaction: 96, maintenanceCompleted: 18, performanceScore: 95, status: "active" },
  { id: "s13", officeId: "4", officeName: "LetHub Bristol", name: "Hannah Rees", email: "hannah.rees@lethub.co.uk", role: "Property Manager", portfolioSize: 16, revenueMonthly: 18800, complianceRate: 97, tenantSatisfaction: 94, maintenanceCompleted: 16, performanceScore: 91, status: "active" },
  { id: "s14", officeId: "4", officeName: "LetHub Bristol", name: "Raj Patel", email: "raj.patel@lethub.co.uk", role: "Property Manager", portfolioSize: 16, revenueMonthly: 17000, complianceRate: 99, tenantSatisfaction: 93, maintenanceCompleted: 14, performanceScore: 92, status: "active" },
]

export const branchMonthlyTrends: MonthlyBranchMetric[] = [
  { month: "Jan 2026", officeName: "London HQ", properties: 62, revenue: 81200, complianceRate: 94, maintenanceLoad: 11, occupancyRate: 95 },
  { month: "Feb 2026", officeName: "London HQ", properties: 63, revenue: 82300, complianceRate: 94, maintenanceLoad: 9, occupancyRate: 96 },
  { month: "Mar 2026", officeName: "London HQ", properties: 64, revenue: 83700, complianceRate: 95, maintenanceLoad: 10, occupancyRate: 96 },
  { month: "Apr 2026", officeName: "London HQ", properties: 65, revenue: 85100, complianceRate: 96, maintenanceLoad: 8, occupancyRate: 97 },
  { month: "May 2026", officeName: "London HQ", properties: 66, revenue: 86400, complianceRate: 96, maintenanceLoad: 9, occupancyRate: 96 },
  { month: "Jun 2026", officeName: "London HQ", properties: 68, revenue: 89200, complianceRate: 97, maintenanceLoad: 8, occupancyRate: 97 },
  { month: "Jan 2026", officeName: "Manchester", properties: 37, revenue: 43800, complianceRate: 89, maintenanceLoad: 7, occupancyRate: 92 },
  { month: "Feb 2026", officeName: "Manchester", properties: 38, revenue: 44200, complianceRate: 90, maintenanceLoad: 6, occupancyRate: 93 },
  { month: "Mar 2026", officeName: "Manchester", properties: 39, revenue: 45100, complianceRate: 91, maintenanceLoad: 5, occupancyRate: 93 },
  { month: "Apr 2026", officeName: "Manchester", properties: 40, revenue: 46600, complianceRate: 92, maintenanceLoad: 6, occupancyRate: 94 },
  { month: "May 2026", officeName: "Manchester", properties: 41, revenue: 47500, complianceRate: 92, maintenanceLoad: 5, occupancyRate: 94 },
  { month: "Jun 2026", officeName: "Manchester", properties: 42, revenue: 48600, complianceRate: 93, maintenanceLoad: 4, occupancyRate: 93 },
  { month: "Jan 2026", officeName: "Birmingham", properties: 34, revenue: 37100, complianceRate: 91, maintenanceLoad: 6, occupancyRate: 93 },
  { month: "Feb 2026", officeName: "Birmingham", properties: 35, revenue: 37900, complianceRate: 92, maintenanceLoad: 5, occupancyRate: 94 },
  { month: "Mar 2026", officeName: "Birmingham", properties: 36, revenue: 38600, complianceRate: 93, maintenanceLoad: 4, occupancyRate: 94 },
  { month: "Apr 2026", officeName: "Birmingham", properties: 37, revenue: 39400, complianceRate: 93, maintenanceLoad: 5, occupancyRate: 95 },
  { month: "May 2026", officeName: "Birmingham", properties: 37, revenue: 39900, complianceRate: 94, maintenanceLoad: 4, occupancyRate: 95 },
  { month: "Jun 2026", officeName: "Birmingham", properties: 38, revenue: 41200, complianceRate: 95, maintenanceLoad: 3, occupancyRate: 94 },
  { month: "Jan 2026", officeName: "Bristol", properties: 28, revenue: 31800, complianceRate: 96, maintenanceLoad: 5, occupancyRate: 96 },
  { month: "Feb 2026", officeName: "Bristol", properties: 29, revenue: 32400, complianceRate: 96, maintenanceLoad: 4, occupancyRate: 97 },
  { month: "Mar 2026", officeName: "Bristol", properties: 29, revenue: 32800, complianceRate: 97, maintenanceLoad: 3, occupancyRate: 96 },
  { month: "Apr 2026", officeName: "Bristol", properties: 30, revenue: 33600, complianceRate: 97, maintenanceLoad: 4, occupancyRate: 97 },
  { month: "May 2026", officeName: "Bristol", properties: 31, revenue: 34800, complianceRate: 98, maintenanceLoad: 2, occupancyRate: 97 },
  { month: "Jun 2026", officeName: "Bristol", properties: 32, revenue: 35800, complianceRate: 98, maintenanceLoad: 2, occupancyRate: 96 },
]

const totalPortfolio = offices.reduce((s, o) => s + o.portfolioSize, 0)
const totalRevenue = offices.reduce((s, o) => s + o.revenueMonthly, 0)
const totalStaff = offices.reduce((s, o) => s + o.staffCount, 0)
const totalValue = offices.reduce((s, o) => s + o.portfolioValue, 0)
const avgCompliance = Math.round(offices.reduce((s, o) => s + o.complianceRate, 0) / offices.length)
const totalMaintenance = offices.reduce((s, o) => s + o.maintenanceLoad, 0)

export const aggregateStats = {
  totalPortfolio,
  totalRevenue: formatCurrency(totalRevenue),
  totalStaff,
  totalValue: formatCurrency(totalValue),
  avgCompliance,
  totalMaintenance,
  officeCount: offices.length,
}

export function getOfficeSummary(office: OfficeData) {
  const officeStaff = staff.filter((s) => s.officeId === office.id)
  const avgPerf = officeStaff.length ? Math.round(officeStaff.reduce((s, st) => s + st.performanceScore, 0) / officeStaff.length) : 0
  const avgSat = officeStaff.length ? Math.round(officeStaff.reduce((s, st) => s + st.tenantSatisfaction, 0) / officeStaff.length) : 0
  const revenuePerProp = office.portfolioSize ? Math.round(office.revenueMonthly / office.portfolioSize) : 0
  return { avgPerf, avgSat, revenuePerProp, staff: officeStaff }
}

export const crossPortfolioInsights: CrossPortfolioInsight[] = [
  {
    label: "Portfolio Value",
    value: formatCurrency(totalValue),
    bestOffice: "London HQ",
    bestValue: formatCurrency(14200000),
    worstOffice: "Bristol",
    worstValue: formatCurrency(5400000),
    icon: "ri-building-4-line",
  },
  {
    label: "Compliance Rate",
    value: avgCompliance + "%",
    bestOffice: "Bristol",
    bestValue: "98%",
    worstOffice: "Manchester",
    worstValue: "93%",
    icon: "ri-shield-check-line",
  },
  {
    label: "Revenue Per Property",
    value: "£" + Math.round(totalRevenue / totalPortfolio),
    bestOffice: "London HQ",
    bestValue: "£" + Math.round(89200 / 68),
    worstOffice: "Bristol",
    worstValue: "£" + Math.round(35800 / 32),
    icon: "ri-coins-line",
  },
  {
    label: "Staff Efficiency",
    value: Math.round(totalPortfolio / totalStaff) + " props/head",
    bestOffice: "Bristol",
    bestValue: Math.round(32 / 6) + " props/head",
    worstOffice: "Manchester",
    worstValue: Math.round(42 / 9) + " props/head",
    icon: "ri-team-line",
  },
  {
    label: "Maintenance Load",
    value: totalMaintenance + " open jobs",
    bestOffice: "Bristol",
    bestValue: "2 jobs",
    worstOffice: "London HQ",
    worstValue: "8 jobs",
    icon: "ri-tools-line",
  },
  {
    label: "Staff Performance",
    value: Math.round(staff.reduce((s, st) => s + st.performanceScore, 0) / staff.length) + "/100",
    bestOffice: "London HQ",
    bestValue: "92/100",
    worstOffice: "Manchester",
    worstValue: "89/100",
    icon: "ri-star-line",
  },
]

export const officeRiskMatrix = offices.map((o) => ({
  name: o.name,
  city: o.city,
  portfolioSize: o.portfolioSize,
  revenue: o.revenueMonthly,
  complianceRate: o.complianceRate,
  maintenanceLoad: o.maintenanceLoad,
  riskScore: Math.round(((100 - o.complianceRate) * 0.6 + o.maintenanceLoad * 3 + (o.portfolioSize > 50 ? 5 : 0))),
}))

export function getTopPerformers(metric: "performanceScore" | "complianceRate" | "revenueMonthly" | "tenantSatisfaction", count: number = 3): StaffMember[] {
  return [...staff].sort((a, b) => b[metric] - a[metric]).slice(0, count)
}

export function getOfficeTrends(officeName: string): MonthlyBranchMetric[] {
  return branchMonthlyTrends.filter((t) => t.officeName === officeName)
}