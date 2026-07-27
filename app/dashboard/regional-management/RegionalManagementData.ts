import { supabase } from "@/lib/supabaseClient"

export interface RegionRecord {
  id: string
  region_name: string
  region_code: string
  description: string | null
  created_at: string
}

export interface RegionDashboardData {
  region: RegionRecord
  officeCount: number
  propertyCount: number
  totalComplianceItems: number
  compliantItems: number
  overdueItems: number
  complianceRate: number
  totalMaintenanceJobs: number
  openMaintenanceJobs: number
  completedMaintenanceJobs: number
  totalRentPayments: number
  rentCollected: number
  rentOutstanding: number
  rentCollectionRate: number
  avgHealthScore: number
  avgComplianceScore: number
  avgMaintenanceScore: number
  avgRentScore: number
  scoredProperties: number
  healthLevel: string
}

export interface RegionComplianceItem {
  region: string
  obligation_code: string
  status: string
  propertyCount: number
}

export interface RegionMaintenanceItem {
  region: string
  status: string
  jobCount: number
}

export interface RegionalManagerRecord {
  id: string
  role: string
  profile_name: string | null
  profile_email: string | null
  assigned_region: string | null
}

export interface AgencyRoleCount {
  role: string
  count: number
}

export const REGION_COLORS: Record<string, string> = {
  "LDN": "#C28A78",
  "NW": "#3B82F6",
  "WM": "#F59E0B",
  "SW": "#8B5CF6",
  "YKS": "#10B981",
}

export const ROLE_COLORS: Record<string, string> = {
  "admin": "#C28A78",
  "regional_manager": "#3B82F6",
  "office_manager": "#8B5CF6",
  "property_manager": "#10B981",
}

export function formatCurrency(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "£" + (n / 1000).toFixed(0) + "k"
  return "£" + n.toFixed(0)
}

export function healthColor(score: number): string {
  if (score >= 90) return "#10B981"
  if (score >= 75) return "#F59E0B"
  if (score >= 60) return "#F97316"
  return "#EF4444"
}

export function healthLabel(score: number): string {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 60) return "Needs Attention"
  return "High Risk"
}

export function healthBg(score: number): string {
  if (score >= 90) return "bg-[#10B981]/10"
  if (score >= 75) return "bg-[#F59E0B]/10"
  if (score >= 60) return "bg-[#F97316]/10"
  return "bg-[#EF4444]/10"
}

export function healthTextColor(score: number): string {
  if (score >= 90) return "text-[#10B981]"
  if (score >= 75) return "text-[#F59E0B]"
  if (score >= 60) return "text-[#F97316]"
  return "text-[#EF4444]"
}

async function getRegionPropertyIds(regionName: string): Promise<string[]> {
  const { data } = await supabase.from("properties").select("id").eq("region", regionName)
  if (!data) return []
  return (data as { id: string }[]).map((p) => p.id)
}

async function getOfficeCountByRegion(regionId: string): Promise<number> {
  const { count } = await supabase.from("offices").select("*", { count: "exact", head: true }).eq("region_id", regionId)
  return count || 0
}

async function getRegionProps(regionName: string): Promise<number> {
  const { count } = await supabase.from("properties").select("*", { count: "exact", head: true }).eq("region", regionName)
  return count || 0
}

export async function fetchRegions(): Promise<RegionRecord[]> {
  const { data } = await supabase.from("regions").select("*").order("region_name")
  return (data || []) as RegionRecord[]
}

export async function fetchRegionDashboardData(region: RegionRecord): Promise<RegionDashboardData> {
  const propertyIds = await getRegionPropertyIds(region.region_name)
  const officeCount = await getOfficeCountByRegion(region.id)

  let complianceData = { total: 0, compliant: 0, overdue: 0 }
  if (propertyIds.length) {
    const { data: items } = await supabase.from("property_compliance_items").select("status").in("property_id", propertyIds)
    if (items) {
      complianceData.total = items.length
      complianceData.compliant = items.filter((i: { status: string }) => i.status === "compliant").length
      complianceData.overdue = items.filter((i: { status: string }) => i.status === "overdue").length
    }
  }

  let maintenanceData = { total: 0, open: 0, completed: 0 }
  if (propertyIds.length) {
    const { data: jobs } = await supabase.from("maintenance_jobs").select("status").in("property_id", propertyIds)
    if (jobs) {
      maintenanceData.total = jobs.length
      maintenanceData.open = jobs.filter((j: { status: string }) => ["open", "in_progress"].includes(j.status)).length
      maintenanceData.completed = jobs.filter((j: { status: string }) => j.status === "completed").length
    }
  }

  let rentData = { totalPayments: 0, collected: 0, totalAmount: 0, collectedAmount: 0 }
  if (propertyIds.length) {
    const { data: payments } = await supabase.from("rent_payments").select("amount, status").in("property_id", propertyIds)
    if (payments) {
      rentData.totalPayments = payments.length
      payments.forEach((p: { amount: number; status: string }) => {
        rentData.totalAmount += p.amount
        if (p.status === "paid") rentData.collectedAmount += p.amount
      })
      rentData.collected = payments.filter((p: { status: string }) => p.status === "paid").length
    }
  }

  let healthData = { avgOverall: 0, avgCompliance: 0, avgMaintenance: 0, avgRent: 0, scored: 0, level: "good" }
  if (propertyIds.length) {
    const { data: scores } = await supabase.from("property_health_scores").select("overall_score, compliance_score, maintenance_score, rent_score, health_level").in("property_id", propertyIds)
    if (scores && scores.length) {
      const s = scores as { overall_score: number; compliance_score: number; maintenance_score: number; rent_score: number; health_level: string }[]
      healthData.scored = s.length
      healthData.avgOverall = Math.round(s.reduce((sum, r) => sum + r.overall_score, 0) / s.length)
      healthData.avgCompliance = Math.round(s.reduce((sum, r) => sum + r.compliance_score, 0) / s.length)
      healthData.avgMaintenance = Math.round(s.reduce((sum, r) => sum + r.maintenance_score, 0) / s.length)
      healthData.avgRent = Math.round(s.reduce((sum, r) => sum + r.rent_score, 0) / s.length)
      const levels = s.map(r => r.health_level)
      const levelOrder = ["critical", "high_risk", "attention_needed", "good", "excellent"]
      const worstLevel = levels.reduce((worst, l) => {
        const wi = levelOrder.indexOf(worst)
        const li = levelOrder.indexOf(l)
        return li < wi ? l : worst
      }, "excellent")
      healthData.level = worstLevel
    }
  }

  const propertyCount = await getRegionProps(region.region_name)

  return {
    region,
    officeCount,
    propertyCount,
    totalComplianceItems: complianceData.total,
    compliantItems: complianceData.compliant,
    overdueItems: complianceData.overdue,
    complianceRate: complianceData.total > 0 ? Math.round((complianceData.compliant / complianceData.total) * 100) : 0,
    totalMaintenanceJobs: maintenanceData.total,
    openMaintenanceJobs: maintenanceData.open,
    completedMaintenanceJobs: maintenanceData.completed,
    totalRentPayments: rentData.totalPayments,
    rentCollected: rentData.collectedAmount,
    rentOutstanding: rentData.totalAmount - rentData.collectedAmount,
    rentCollectionRate: rentData.totalAmount > 0 ? Math.round((rentData.collectedAmount / rentData.totalAmount) * 100) : 0,
    avgHealthScore: healthData.avgOverall,
    avgComplianceScore: healthData.avgCompliance,
    avgMaintenanceScore: healthData.avgMaintenance,
    avgRentScore: healthData.avgRent,
    scoredProperties: healthData.scored,
    healthLevel: healthData.level,
  }
}

export async function fetchAgencyRoles(): Promise<AgencyRoleCount[]> {
  const { data } = await supabase.from("agency_members").select("role")
  if (!data) return []
  const counts: Record<string, number> = {}
  ;(data as { role: string }[]).forEach((m) => {
    counts[m.role] = (counts[m.role] || 0) + 1
  })
  return Object.entries(counts).map(([role, count]) => ({ role, count }))
}

export async function fetchRegionalManagers(): Promise<RegionalManagerRecord[]> {
  const { data: members } = await supabase.from("agency_members").select("id, role, profile_id").eq("role", "regional_manager")
  if (!members) return []
  const profileIds = (members as { id: string; role: string; profile_id: string }[]).map(m => m.profile_id)
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", profileIds)
  const profileMap = new Map<string, { full_name: string | null; email: string | null }>()
  ;(profiles || []).forEach((p: { id: string; full_name: string | null; email: string | null }) => profileMap.set(p.id, p))
  return (members as { id: string; role: string; profile_id: string }[]).map((m) => ({
    id: m.id,
    role: m.role,
    profile_name: profileMap.get(m.profile_id)?.full_name || null,
    profile_email: profileMap.get(m.profile_id)?.email || null,
    assigned_region: null,
  }))
}

export const monthlyRegionTrends = [
  { month: "Jan 2026", region: "Greater London", compliance: 91, maintenanceLoad: 14, rentCollection: 89 },
  { month: "Feb 2026", region: "Greater London", compliance: 92, maintenanceLoad: 12, rentCollection: 91 },
  { month: "Mar 2026", region: "Greater London", compliance: 93, maintenanceLoad: 11, rentCollection: 92 },
  { month: "Apr 2026", region: "Greater London", compliance: 94, maintenanceLoad: 10, rentCollection: 94 },
  { month: "May 2026", region: "Greater London", compliance: 94, maintenanceLoad: 9, rentCollection: 95 },
  { month: "Jun 2026", region: "Greater London", compliance: 95, maintenanceLoad: 8, rentCollection: 96 },
  { month: "Jan 2026", region: "North West", compliance: 85, maintenanceLoad: 9, rentCollection: 82 },
  { month: "Feb 2026", region: "North West", compliance: 87, maintenanceLoad: 8, rentCollection: 84 },
  { month: "Mar 2026", region: "North West", compliance: 88, maintenanceLoad: 7, rentCollection: 86 },
  { month: "Apr 2026", region: "North West", compliance: 89, maintenanceLoad: 6, rentCollection: 88 },
  { month: "May 2026", region: "North West", compliance: 90, maintenanceLoad: 5, rentCollection: 89 },
  { month: "Jun 2026", region: "North West", compliance: 91, maintenanceLoad: 4, rentCollection: 91 },
  { month: "Jan 2026", region: "West Midlands", compliance: 78, maintenanceLoad: 8, rentCollection: 85 },
  { month: "Feb 2026", region: "West Midlands", compliance: 80, maintenanceLoad: 7, rentCollection: 87 },
  { month: "Mar 2026", region: "West Midlands", compliance: 82, maintenanceLoad: 6, rentCollection: 88 },
  { month: "Apr 2026", region: "West Midlands", compliance: 84, maintenanceLoad: 5, rentCollection: 90 },
  { month: "May 2026", region: "West Midlands", compliance: 86, maintenanceLoad: 4, rentCollection: 91 },
  { month: "Jun 2026", region: "West Midlands", compliance: 88, maintenanceLoad: 3, rentCollection: 93 },
  { month: "Jan 2026", region: "South West", compliance: 92, maintenanceLoad: 6, rentCollection: 90 },
  { month: "Feb 2026", region: "South West", compliance: 93, maintenanceLoad: 5, rentCollection: 91 },
  { month: "Mar 2026", region: "South West", compliance: 94, maintenanceLoad: 4, rentCollection: 92 },
  { month: "Apr 2026", region: "South West", compliance: 95, maintenanceLoad: 4, rentCollection: 94 },
  { month: "May 2026", region: "South West", compliance: 95, maintenanceLoad: 3, rentCollection: 95 },
  { month: "Jun 2026", region: "South West", compliance: 96, maintenanceLoad: 2, rentCollection: 96 },
  { month: "Jan 2026", region: "Yorkshire", compliance: 87, maintenanceLoad: 5, rentCollection: 88 },
  { month: "Feb 2026", region: "Yorkshire", compliance: 88, maintenanceLoad: 5, rentCollection: 89 },
  { month: "Mar 2026", region: "Yorkshire", compliance: 89, maintenanceLoad: 4, rentCollection: 90 },
  { month: "Apr 2026", region: "Yorkshire", compliance: 90, maintenanceLoad: 3, rentCollection: 91 },
  { month: "May 2026", region: "Yorkshire", compliance: 91, maintenanceLoad: 3, rentCollection: 92 },
  { month: "Jun 2026", region: "Yorkshire", compliance: 92, maintenanceLoad: 2, rentCollection: 94 },
]