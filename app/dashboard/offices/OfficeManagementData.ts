import { supabase } from "@/lib/supabaseClient"

export interface OfficeRecord {
  id: string
  account_id: string
  office_name: string
  office_code: string
  address: string | null
  phone: string | null
  email: string | null
  manager_id: string | null
  created_at: string
}

export interface OfficeDashboardData {
  office: OfficeRecord
  propertyCount: number
  complianceRate: number
  maintenanceLoad: number
  maintenanceOpen: number
  rentCollected: number
  rentDue: number
  rentOverdue: number
  rentCollectionRate: number
  regionCount: number
  branchCount: number
  totalRentAmount: number
}

export interface OfficePropertySummary {
  propertyId: string
  line1: string
  city: string
  postcode: string
  region: string | null
  branch: string | null
  bedrooms: number
  status: string
  rentAmount: number
  latestPaymentStatus: string | null
}

export interface MonthlyOfficeMetric {
  month: string
  officeCode: string
  officeName: string
  propertyCount: number
  rentCollected: number
  rentDue: number
  complianceRate: number
  maintenanceLoad: number
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "£" + (n / 1000).toFixed(0) + "k"
  return "£" + n.toFixed(0)
}

async function getPropertyCountByOffice(officeId: string): Promise<number> {
  const { count } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("office_id", officeId)
  return count || 0
}

async function getMaintenanceLoadByOffice(officeId: string): Promise<{ open: number; total: number }> {
  const propertyIds = await getOfficePropertyIds(officeId)
  if (!propertyIds.length) return { open: 0, total: 0 }
  const { count: total } = await supabase.from("maintenance_jobs").select("*", { count: "exact", head: true }).in("property_id", propertyIds)
  const { count: open } = await supabase.from("maintenance_jobs").select("*", { count: "exact", head: true }).in("property_id", propertyIds).in("status", ["open", "in_progress"])
  return { open: open || 0, total: total || 0 }
}

async function getRentMetricsByOffice(officeId: string): Promise<{ collected: number; due: number; overdue: number; totalAmount: number }> {
  const propertyIds = await getOfficePropertyIds(officeId)
  if (!propertyIds.length) return { collected: 0, due: 0, overdue: 0, totalAmount: 0 }
  const { data: payments } = await supabase.from("rent_payments").select("amount, status").in("property_id", propertyIds)
  if (!payments) return { collected: 0, due: 0, overdue: 0, totalAmount: 0 }
  let collected = 0, due = 0, overdue = 0, totalAmount = 0
  payments.forEach((p: { amount: number; status: string }) => {
    totalAmount += p.amount
    if (p.status === "paid") collected += p.amount
    else if (p.status === "overdue") overdue += p.amount
    else due += p.amount
  })
  return { collected, due, overdue, totalAmount }
}

async function getComplianceRateByOffice(officeId: string): Promise<number> {
  const propertyIds = await getOfficePropertyIds(officeId)
  if (!propertyIds.length) return 0
  const { data: scores } = await supabase.from("property_health_scores").select("score").in("property_id", propertyIds)
  if (!scores || !scores.length) return 0
  const avg = (scores as { score: number }[]).reduce((s, r) => s + r.score, 0) / scores.length
  return Math.round(avg)
}

async function getOfficePropertyIds(officeId: string): Promise<string[]> {
  const { data } = await supabase.from("properties").select("id").eq("office_id", officeId)
  if (!data) return []
  return (data as { id: string }[]).map((p) => p.id)
}

async function getRegionsAndBranches(officeId: string): Promise<{ regions: string[]; branches: string[] }> {
  const { data } = await supabase.from("properties").select("region, branch").eq("office_id", officeId)
  if (!data) return { regions: [], branches: [] }
  const regions = [...new Set((data as { region: string | null }[]).map((p) => p.region).filter(Boolean) as string[])]
  const branches = [...new Set((data as { branch: string | null }[]).map((p) => p.branch).filter(Boolean) as string[])]
  return { regions, branches }
}

export async function fetchOffices(): Promise<OfficeRecord[]> {
  const { data } = await supabase.from("offices").select("*").order("office_name")
  return (data || []) as OfficeRecord[]
}

export async function fetchOfficeDashboardData(office: OfficeRecord): Promise<OfficeDashboardData> {
  const [propertyCount, maintenance, rent, complianceRate, regionsBranches] = await Promise.all([
    getPropertyCountByOffice(office.id),
    getMaintenanceLoadByOffice(office.id),
    getRentMetricsByOffice(office.id),
    getComplianceRateByOffice(office.id),
    getRegionsAndBranches(office.id),
  ])
  return {
    office,
    propertyCount,
    complianceRate,
    maintenanceLoad: maintenance.total,
    maintenanceOpen: maintenance.open,
    rentCollected: rent.collected,
    rentDue: rent.due,
    rentOverdue: rent.overdue,
    rentCollectionRate: rent.totalAmount > 0 ? Math.round((rent.collected / rent.totalAmount) * 100) : 0,
    regionCount: regionsBranches.regions.length,
    branchCount: regionsBranches.branches.length,
    totalRentAmount: rent.totalAmount,
  }
}

export async function fetchOfficeProperties(officeId: string): Promise<OfficePropertySummary[]> {
  const { data: properties } = await supabase.from("properties").select("id, line1, city, postcode, region, branch, bedrooms").eq("office_id", officeId)
  if (!properties) return []
  const propIds = (properties as { id: string; line1: string; city: string; postcode: string; region: string | null; branch: string | null; bedrooms: number }[]).map((p) => p.id)
  const { data: tenancies } = await supabase.from("tenancies").select("property_id, rent_amount, status").in("property_id", propIds)
  const { data: payments } = await supabase.from("rent_payments").select("property_id, status").in("property_id", propIds).order("due_date", { ascending: false })
  const tenancyMap = new Map<string, { rentAmount: number; status: string }>()
  ;(tenancies || []).forEach((t: { property_id: string; rent_amount: number; status: string }) => {
    if (!tenancyMap.has(t.property_id)) tenancyMap.set(t.property_id, { rentAmount: t.rent_amount, status: t.status })
  })
  const paymentMap = new Map<string, string>()
  ;(payments || []).forEach((p: { property_id: string; status: string }) => {
    if (!paymentMap.has(p.property_id)) paymentMap.set(p.property_id, p.status)
  })
  return (properties as { id: string; line1: string; city: string; postcode: string; region: string | null; branch: string | null; bedrooms: number }[]).map((p) => ({
    propertyId: p.id,
    line1: p.line1,
    city: p.city,
    postcode: p.postcode,
    region: p.region,
    branch: p.branch,
    bedrooms: p.bedrooms,
    status: tenancyMap.get(p.id)?.status || "unknown",
    rentAmount: tenancyMap.get(p.id)?.rentAmount || 0,
    latestPaymentStatus: paymentMap.get(p.id) || null,
  }))
}

export const OFFICE_COLORS: Record<string, string> = {
  "LON-HQ": "#C28A78",
  "MAN-01": "#3B82F6",
  "BIR-01": "#F59E0B",
  "BRS-01": "#8B5CF6",
  "LDS-01": "#10B981",
}

export const monthlyOfficeTrends: MonthlyOfficeMetric[] = [
  { month: "Jan 2026", officeCode: "LON-HQ", officeName: "London HQ", propertyCount: 62, rentCollected: 81200, rentDue: 9500, complianceRate: 94, maintenanceLoad: 11 },
  { month: "Feb 2026", officeCode: "LON-HQ", officeName: "London HQ", propertyCount: 63, rentCollected: 82300, rentDue: 8800, complianceRate: 94, maintenanceLoad: 9 },
  { month: "Mar 2026", officeCode: "LON-HQ", officeName: "London HQ", propertyCount: 64, rentCollected: 83700, rentDue: 7200, complianceRate: 95, maintenanceLoad: 10 },
  { month: "Apr 2026", officeCode: "LON-HQ", officeName: "London HQ", propertyCount: 65, rentCollected: 85100, rentDue: 6100, complianceRate: 96, maintenanceLoad: 8 },
  { month: "May 2026", officeCode: "LON-HQ", officeName: "London HQ", propertyCount: 66, rentCollected: 86400, rentDue: 5400, complianceRate: 96, maintenanceLoad: 9 },
  { month: "Jun 2026", officeCode: "LON-HQ", officeName: "London HQ", propertyCount: 68, rentCollected: 89200, rentDue: 4100, complianceRate: 97, maintenanceLoad: 8 },
  { month: "Jan 2026", officeCode: "MAN-01", officeName: "Manchester", propertyCount: 37, rentCollected: 43800, rentDue: 6200, complianceRate: 89, maintenanceLoad: 7 },
  { month: "Feb 2026", officeCode: "MAN-01", officeName: "Manchester", propertyCount: 38, rentCollected: 44200, rentDue: 5800, complianceRate: 90, maintenanceLoad: 6 },
  { month: "Mar 2026", officeCode: "MAN-01", officeName: "Manchester", propertyCount: 39, rentCollected: 45100, rentDue: 5100, complianceRate: 91, maintenanceLoad: 5 },
  { month: "Apr 2026", officeCode: "MAN-01", officeName: "Manchester", propertyCount: 40, rentCollected: 46600, rentDue: 4200, complianceRate: 92, maintenanceLoad: 6 },
  { month: "May 2026", officeCode: "MAN-01", officeName: "Manchester", propertyCount: 41, rentCollected: 47500, rentDue: 3800, complianceRate: 92, maintenanceLoad: 5 },
  { month: "Jun 2026", officeCode: "MAN-01", officeName: "Manchester", propertyCount: 42, rentCollected: 48600, rentDue: 3200, complianceRate: 93, maintenanceLoad: 4 },
  { month: "Jan 2026", officeCode: "BIR-01", officeName: "Birmingham", propertyCount: 34, rentCollected: 37100, rentDue: 5100, complianceRate: 91, maintenanceLoad: 6 },
  { month: "Feb 2026", officeCode: "BIR-01", officeName: "Birmingham", propertyCount: 35, rentCollected: 37900, rentDue: 4800, complianceRate: 92, maintenanceLoad: 5 },
  { month: "Mar 2026", officeCode: "BIR-01", officeName: "Birmingham", propertyCount: 36, rentCollected: 38600, rentDue: 4500, complianceRate: 93, maintenanceLoad: 4 },
  { month: "Apr 2026", officeCode: "BIR-01", officeName: "Birmingham", propertyCount: 37, rentCollected: 39400, rentDue: 4200, complianceRate: 93, maintenanceLoad: 5 },
  { month: "May 2026", officeCode: "BIR-01", officeName: "Birmingham", propertyCount: 37, rentCollected: 39900, rentDue: 3900, complianceRate: 94, maintenanceLoad: 4 },
  { month: "Jun 2026", officeCode: "BIR-01", officeName: "Birmingham", propertyCount: 38, rentCollected: 41200, rentDue: 3000, complianceRate: 95, maintenanceLoad: 3 },
  { month: "Jan 2026", officeCode: "BRS-01", officeName: "Bristol", propertyCount: 28, rentCollected: 31800, rentDue: 3800, complianceRate: 96, maintenanceLoad: 5 },
  { month: "Feb 2026", officeCode: "BRS-01", officeName: "Bristol", propertyCount: 29, rentCollected: 32400, rentDue: 3500, complianceRate: 96, maintenanceLoad: 4 },
  { month: "Mar 2026", officeCode: "BRS-01", officeName: "Bristol", propertyCount: 29, rentCollected: 32800, rentDue: 3200, complianceRate: 97, maintenanceLoad: 3 },
  { month: "Apr 2026", officeCode: "BRS-01", officeName: "Bristol", propertyCount: 30, rentCollected: 33600, rentDue: 2800, complianceRate: 97, maintenanceLoad: 4 },
  { month: "May 2026", officeCode: "BRS-01", officeName: "Bristol", propertyCount: 31, rentCollected: 34800, rentDue: 2100, complianceRate: 98, maintenanceLoad: 2 },
  { month: "Jun 2026", officeCode: "BRS-01", officeName: "Bristol", propertyCount: 32, rentCollected: 35800, rentDue: 1600, complianceRate: 98, maintenanceLoad: 2 },
  { month: "Jan 2026", officeCode: "LDS-01", officeName: "Leeds", propertyCount: 22, rentCollected: 24800, rentDue: 3800, complianceRate: 90, maintenanceLoad: 3 },
  { month: "Feb 2026", officeCode: "LDS-01", officeName: "Leeds", propertyCount: 23, rentCollected: 25400, rentDue: 3500, complianceRate: 91, maintenanceLoad: 4 },
  { month: "Mar 2026", officeCode: "LDS-01", officeName: "Leeds", propertyCount: 24, rentCollected: 26200, rentDue: 3100, complianceRate: 91, maintenanceLoad: 3 },
  { month: "Apr 2026", officeCode: "LDS-01", officeName: "Leeds", propertyCount: 25, rentCollected: 27100, rentDue: 2900, complianceRate: 92, maintenanceLoad: 2 },
  { month: "May 2026", officeCode: "LDS-01", officeName: "Leeds", propertyCount: 26, rentCollected: 27900, rentDue: 2500, complianceRate: 93, maintenanceLoad: 2 },
  { month: "Jun 2026", officeCode: "LDS-01", officeName: "Leeds", propertyCount: 27, rentCollected: 29400, rentDue: 2100, complianceRate: 94, maintenanceLoad: 2 },
]

export function getOfficeTrends(officeCode: string): MonthlyOfficeMetric[] {
  return monthlyOfficeTrends.filter((t) => t.officeCode === officeCode)
}

export function formatCurrencyStatic(n: number): string {
  return formatCurrency(n)
}