import { supabase } from "@/lib/supabaseClient"

export interface FranchiseRecord {
  id: string
  franchise_name: string
  franchise_code: string
  brand_color: string
  brand_secondary_color: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  founded_date: string | null
  is_active: boolean
  created_at: string
}

export interface FranchiseOfficeRecord {
  id: string
  franchise_id: string
  office_id: string
  assigned_at: string
  office_name: string
  office_code: string
  address: string
  phone: string
  email: string
  region_name: string
}

export interface FranchiseDashboardData {
  franchise: FranchiseRecord
  offices: FranchiseOfficeRecord[]
  officeCount: number
  propertyCount: number
  tenancyCount: number
  totalComplianceItems: number
  compliantItems: number
  overdueItems: number
  complianceRate: number
  totalMaintenanceJobs: number
  openMaintenanceJobs: number
  completedMaintenanceJobs: number
  totalRentAmount: number
  rentCollected: number
  rentOutstanding: number
  rentCollectionRate: number
  totalPayments: number
  paidPayments: number
  avgHealthScore: number
  scoredProperties: number
}

export interface OfficePerformanceData {
  officeName: string
  officeCode: string
  franchiseCode: string
  propertyCount: number
  tenancyCount: number
  complianceRate: number
  rentCollectionRate: number
  rentCollected: number
  rentOutstanding: number
  openMaintenance: number
  avgHealthScore: number
}

export const FRANCHISE_COLOR_MAP: Record<string, string> = {
  "LHP": "#C28A78",
  "LHH": "#F59E0B",
  "LHC": "#8B5CF6",
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

async function getPropertyIdsByOfficeIds(officeIds: string[]): Promise<string[]> {
  if (!officeIds.length) return []
  const { data } = await supabase.from("properties").select("id").in("office_id", officeIds)
  if (!data) return []
  return (data as { id: string }[]).map((p) => p.id)
}

export async function fetchFranchises(): Promise<FranchiseRecord[]> {
  const { data } = await supabase.from("franchises").select("*").eq("is_active", true).order("franchise_name")
  return (data || []) as FranchiseRecord[]
}

export async function fetchFranchiseOffices(franchiseId: string): Promise<FranchiseOfficeRecord[]> {
  const { data } = await supabase
    .from("franchise_offices")
    .select("id, franchise_id, office_id, assigned_at")
    .eq("franchise_id", franchiseId);

  if (!data) return [];

  const officeIds = [...new Set(data.map((row: { office_id: string }) => row.office_id))];
  const officeMap = new Map<string, { office_name: string; office_code: string; address: string; phone: string; email: string; region_id: string }>();
  const regionMap = new Map<string, string>();

  if (officeIds.length > 0) {
    const { data: offices } = await supabase
      .from("offices")
      .select("id, office_name, office_code, address, phone, email, region_id")
      .in("id", officeIds);

    if (offices) {
      const regionIds = [...new Set((offices as Array<{ id: string; region_id: string }>).map((o) => o.region_id).filter(Boolean))];
      if (regionIds.length > 0) {
        const { data: regions } = await supabase
          .from("regions")
          .select("id, region_name")
          .in("id", regionIds);
        (regions || []).forEach((r: { id: string; region_name: string }) => regionMap.set(r.id, r.region_name));
      }
      (offices as Array<{ id: string; office_name: string; office_code: string; address: string; phone: string; email: string; region_id: string }>).forEach((o) => officeMap.set(o.id, o));
    }
  }

  return (data as Array<{
    id: string
    franchise_id: string
    office_id: string
    assigned_at: string
  }>).map((row) => {
    const office = officeMap.get(row.office_id);
    return {
      id: row.id,
      franchise_id: row.franchise_id,
      office_id: row.office_id,
      assigned_at: row.assigned_at,
      office_name: office?.office_name || "",
      office_code: office?.office_code || "",
      address: office?.address || "",
      phone: office?.phone || "",
      email: office?.email || "",
      region_name: office?.region_id ? regionMap.get(office.region_id) || "" : "",
    };
  });
}

export async function fetchFranchiseDashboardData(franchise: FranchiseRecord): Promise<FranchiseDashboardData> {
  const offices = await fetchFranchiseOffices(franchise.id)
  const officeIds = offices.map((o) => o.office_id)
  const propertyIds = await getPropertyIdsByOfficeIds(officeIds)

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

  let rentData = { totalAmount: 0, collectedAmount: 0, totalPayments: 0, paidPayments: 0 }
  if (propertyIds.length) {
    const { data: payments } = await supabase.from("rent_payments").select("amount, status").in("property_id", propertyIds)
    if (payments) {
      payments.forEach((p: { amount: number; status: string }) => {
        rentData.totalAmount += p.amount
        rentData.totalPayments++
        if (p.status === "paid") {
          rentData.collectedAmount += p.amount
          rentData.paidPayments++
        }
      })
    }
  }

  let healthData = { avgOverall: 0, scored: 0 }
  if (propertyIds.length) {
    const { data: scores } = await supabase.from("property_health_scores").select("overall_score").in("property_id", propertyIds)
    if (scores && scores.length) {
      healthData.scored = scores.length
      healthData.avgOverall = Math.round((scores as { overall_score: number }[]).reduce((s, r) => s + r.overall_score, 0) / scores.length)
    }
  }

  let tenancyCount = 0
  if (propertyIds.length) {
    const { count } = await supabase.from("tenancies").select("*", { count: "exact", head: true }).in("property_id", propertyIds)
    tenancyCount = count || 0
  }

  return {
    franchise,
    offices,
    officeCount: offices.length,
    propertyCount: propertyIds.length,
    tenancyCount,
    totalComplianceItems: complianceData.total,
    compliantItems: complianceData.compliant,
    overdueItems: complianceData.overdue,
    complianceRate: complianceData.total > 0 ? Math.round((complianceData.compliant / complianceData.total) * 100) : 0,
    totalMaintenanceJobs: maintenanceData.total,
    openMaintenanceJobs: maintenanceData.open,
    completedMaintenanceJobs: maintenanceData.completed,
    totalRentAmount: rentData.totalAmount,
    rentCollected: rentData.collectedAmount,
    rentOutstanding: rentData.totalAmount - rentData.collectedAmount,
    rentCollectionRate: rentData.totalAmount > 0 ? Math.round((rentData.collectedAmount / rentData.totalAmount) * 100) : 0,
    totalPayments: rentData.totalPayments,
    paidPayments: rentData.paidPayments,
    avgHealthScore: healthData.avgOverall,
    scoredProperties: healthData.scored,
  }
}

export async function fetchAllOfficePerformance(): Promise<OfficePerformanceData[]> {
  const { data: links } = await supabase
    .from("franchise_offices")
    .select("id, franchise_id, office_id");

  if (!links) return [];

  const franchiseIds = [...new Set(links.map((l: { franchise_id: string }) => l.franchise_id))];
  const officeIds = [...new Set(links.map((l: { office_id: string }) => l.office_id))];

  const franchiseMap = new Map<string, string>();
  const officeMap = new Map<string, { office_name: string; office_code: string }>();

  if (franchiseIds.length > 0) {
    const { data: franchises } = await supabase
      .from("franchises")
      .select("id, franchise_code")
      .in("id", franchiseIds);
    (franchises || []).forEach((f: { id: string; franchise_code: string }) => franchiseMap.set(f.id, f.franchise_code));
  }

  if (officeIds.length > 0) {
    const { data: offices } = await supabase
      .from("offices")
      .select("id, office_name, office_code")
      .in("id", officeIds);
    (offices || []).forEach((o: { id: string; office_name: string; office_code: string }) => officeMap.set(o.id, o));
  }

  const results: OfficePerformanceData[] = [];
  for (const link of links as Array<{
    office_id: string
    franchise_id: string
  }>) {
    const franchiseCode = franchiseMap.get(link.franchise_id) || "";
    const office = officeMap.get(link.office_id);
    if (!office) continue;

    const propIds = await getPropertyIdsByOfficeIds([link.office_id]);

    let compRate = 0
    if (propIds.length) {
      const { data: items } = await supabase.from("property_compliance_items").select("status").in("property_id", propIds)
      if (items && items.length) {
        const compliant = items.filter((i: { status: string }) => i.status === "compliant").length
        compRate = Math.round((compliant / items.length) * 100)
      }
    }

    let collected = 0
    let outstanding = 0
    let paidCount = 0
    if (propIds.length) {
      const { data: payments } = await supabase.from("rent_payments").select("amount, status").in("property_id", propIds)
      if (payments) {
        payments.forEach((p: { amount: number; status: string }) => {
          if (p.status === "paid") {
            collected += p.amount
            paidCount++
          } else {
            outstanding += p.amount
          }
        })
      }
    }
    const collRate = (collected + outstanding) > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 0

    let openMaint = 0
    if (propIds.length) {
      const { data: jobs } = await supabase.from("maintenance_jobs").select("status").in("property_id", propIds)
      if (jobs) {
        openMaint = jobs.filter((j: { status: string }) => ["open", "in_progress"].includes(j.status)).length
      }
    }

    let avgHealth = 0
    if (propIds.length) {
      const { data: scores } = await supabase.from("property_health_scores").select("overall_score").in("property_id", propIds)
      if (scores && scores.length) {
        avgHealth = Math.round((scores as { overall_score: number }[]).reduce((s, r) => s + r.overall_score, 0) / scores.length)
      }
    }

    let tenancyCount = 0
    if (propIds.length) {
      const { count } = await supabase.from("tenancies").select("*", { count: "exact", head: true }).in("property_id", propIds)
      tenancyCount = count || 0
    }

    results.push({
      officeName: office.office_name,
      officeCode: office.office_code,
      franchiseCode: franchiseCode,
      propertyCount: propIds.length,
      tenancyCount,
      complianceRate: compRate,
      rentCollectionRate: collRate,
      rentCollected: collected,
      rentOutstanding: outstanding,
      openMaintenance: openMaint,
      avgHealthScore: avgHealth,
    })
  }
  return results
}

export const franchiseMonthlyRevenue = [
  { month: "Jan 2026", "LetHub Prime": 48500, "LetHub Heartlands": 22300, "LetHub Coastal": 31800 },
  { month: "Feb 2026", "LetHub Prime": 49100, "LetHub Heartlands": 22800, "LetHub Coastal": 32200 },
  { month: "Mar 2026", "LetHub Prime": 49800, "LetHub Heartlands": 23100, "LetHub Coastal": 32800 },
  { month: "Apr 2026", "LetHub Prime": 50400, "LetHub Heartlands": 23500, "LetHub Coastal": 33400 },
  { month: "May 2026", "LetHub Prime": 51200, "LetHub Heartlands": 23900, "LetHub Coastal": 34000 },
  { month: "Jun 2026", "LetHub Prime": 52000, "LetHub Heartlands": 24400, "LetHub Coastal": 34700 },
]

export const franchiseComplianceTrend = [
  { month: "Jan 2026", "LetHub Prime": 92, "LetHub Heartlands": 85, "LetHub Coastal": 89 },
  { month: "Feb 2026", "LetHub Prime": 93, "LetHub Heartlands": 87, "LetHub Coastal": 90 },
  { month: "Mar 2026", "LetHub Prime": 94, "LetHub Heartlands": 88, "LetHub Coastal": 91 },
  { month: "Apr 2026", "LetHub Prime": 94, "LetHub Heartlands": 89, "LetHub Coastal": 92 },
  { month: "May 2026", "LetHub Prime": 95, "LetHub Heartlands": 90, "LetHub Coastal": 93 },
  { month: "Jun 2026", "LetHub Prime": 96, "LetHub Heartlands": 92, "LetHub Coastal": 94 },
]