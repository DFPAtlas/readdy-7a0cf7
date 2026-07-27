import { supabase } from "@/lib/supabaseClient"

export interface ExecutiveReportData {
  portfolioValue: number
  totalProperties: number
  activeTenancies: number
  complianceRate: number
  compliantItems: number
  overdueCompliance: number
  totalCompliance: number
  maintenanceOpen: number
  maintenanceInProgress: number
  maintenanceCompleted: number
  rentCollected: number
  rentOutstanding: number
  totalRentAmount: number
  rentCollectionRate: number
  totalPayments: number
  paidPayments: number
  avgHealthScore: number
}

export interface HighRiskProperty {
  id: string
  address: string
  city: string
  postcode: string
  overallScore: number
  healthLevel: string
  complianceScore: number
  maintenanceScore: number
  rentScore: number
  propertyValue: number
  openJobs: number
  overdueItems: number
}

export interface OpenIssue {
  category: string
  issueId: string
  issueTitle: string
  status: string
  issueDate: string
  propertyAddress: string
  propertyCity: string
}

export interface RegionalBreakdown {
  region: string
  propertyCount: number
  portfolioValue: number
  complianceRate: number
  rentCollectionRate: number
  avgHealthScore: number
}

export const HEALTH_LEVEL_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  attention_needed: "Needs Attention",
  high_risk: "High Risk",
  critical: "Critical",
}

export const HEALTH_LEVEL_COLORS: Record<string, string> = {
  excellent: "#10B981",
  good: "#3B82F6",
  attention_needed: "#F59E0B",
  high_risk: "#F97316",
  critical: "#EF4444",
}

export function formatCurrency(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "£" + (n / 1000).toFixed(0) + "k"
  return "£" + n.toFixed(0)
}

export function formatFullCurrency(n: number): string {
  return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export async function fetchExecutiveReport(): Promise<ExecutiveReportData> {
  const { data: agg } = await supabase.from("properties").select(`
    id,
    property_financials(current_value),
    property_health_scores(overall_score)
  `)

  const properties = (agg || []) as Array<{
    id: string
    property_financials: { current_value: number }[] | null
    property_health_scores: { overall_score: number }[] | null
  }>

  const propertyIds = properties.map((p) => p.id)
  const portfolioValue = properties.reduce((sum, p) => sum + ((p.property_financials?.[0]?.current_value) || 0), 0)
  const healthScores = properties.filter((p) => p.property_health_scores?.[0]?.overall_score).map((p) => p.property_health_scores![0].overall_score)
  const avgHealthScore = healthScores.length > 0 ? Math.round(healthScores.reduce((s, v) => s + v, 0) / healthScores.length) : 0

  let tenancyCount = 0
  if (propertyIds.length) {
    const { count } = await supabase.from("tenancies").select("*", { count: "exact", head: true }).in("property_id", propertyIds).eq("status", "active")
    tenancyCount = count || 0
  }

  let compData = { total: 0, compliant: 0, overdue: 0 }
  if (propertyIds.length) {
    const { data: items } = await supabase.from("property_compliance_items").select("status").in("property_id", propertyIds)
    if (items) {
      compData.total = items.length
      compData.compliant = items.filter((i: { status: string }) => i.status === "compliant").length
      compData.overdue = items.filter((i: { status: string }) => i.status === "overdue").length
    }
  }

  let maintData = { open: 0, inProgress: 0, completed: 0 }
  if (propertyIds.length) {
    const { data: jobs } = await supabase.from("maintenance_jobs").select("status").in("property_id", propertyIds)
    if (jobs) {
      maintData.open = jobs.filter((j: { status: string }) => j.status === "open").length
      maintData.inProgress = jobs.filter((j: { status: string }) => j.status === "in_progress").length
      maintData.completed = jobs.filter((j: { status: string }) => j.status === "completed").length
    }
  }

  let rentData = { totalAmount: 0, collected: 0, totalPayments: 0, paid: 0 }
  if (propertyIds.length) {
    const { data: payments } = await supabase.from("rent_payments").select("amount, status").in("property_id", propertyIds)
    if (payments) {
      payments.forEach((p: { amount: number; status: string }) => {
        rentData.totalAmount += p.amount
        rentData.totalPayments++
        if (p.status === "paid") {
          rentData.collected += p.amount
          rentData.paid++
        }
      })
    }
  }

  return {
    portfolioValue,
    totalProperties: properties.length,
    activeTenancies: tenancyCount,
    complianceRate: compData.total > 0 ? Math.round((compData.compliant / compData.total) * 100) : 0,
    compliantItems: compData.compliant,
    overdueCompliance: compData.overdue,
    totalCompliance: compData.total,
    maintenanceOpen: maintData.open,
    maintenanceInProgress: maintData.inProgress,
    maintenanceCompleted: maintData.completed,
    rentCollected: rentData.collected,
    rentOutstanding: rentData.totalAmount - rentData.collected,
    totalRentAmount: rentData.totalAmount,
    rentCollectionRate: rentData.totalAmount > 0 ? Math.round((rentData.collected / rentData.totalAmount) * 100) : 0,
    totalPayments: rentData.totalPayments,
    paidPayments: rentData.paid,
    avgHealthScore,
  }
}

export async function fetchHighRiskProperties(): Promise<HighRiskProperty[]> {
  const { data } = await supabase
    .from("property_health_scores")
    .select("property_id, overall_score, health_level, compliance_score, maintenance_score, rent_score")
    .in("health_level", ["high_risk", "critical", "attention_needed"])
    .order("overall_score", { ascending: true })
    .limit(12)

  if (!data || !data.length) return []

  const scores = data as Array<{
    property_id: string
    overall_score: number
    health_level: string
    compliance_score: number
    maintenance_score: number
    rent_score: number
  }>

  const propIds = scores.map((s) => s.property_id)
  const { data: properties } = await supabase.from("properties").select("id, line1, city, postcode").in("id", propIds)
  const { data: financials } = await supabase.from("property_financials").select("property_id, current_value").in("property_id", propIds)

  const propMap = new Map<string, { line1: string; city: string; postcode: string }>()
  ;(properties || []).forEach((p: { id: string; line1: string; city: string; postcode: string }) => propMap.set(p.id, p))

  const finMap = new Map<string, number>()
  ;(financials || []).forEach((f: { property_id: string; current_value: number }) => finMap.set(f.property_id, f.current_value))

  return scores.map((s) => ({
    id: s.property_id,
    address: propMap.get(s.property_id)?.line1 || "",
    city: propMap.get(s.property_id)?.city || "",
    postcode: propMap.get(s.property_id)?.postcode || "",
    overallScore: s.overall_score,
    healthLevel: s.health_level,
    complianceScore: s.compliance_score,
    maintenanceScore: s.maintenance_score,
    rentScore: s.rent_score,
    propertyValue: finMap.get(s.property_id) || 0,
    openJobs: 0,
    overdueItems: 0,
  }))
}

export async function fetchOpenIssues(): Promise<OpenIssue[]> {
  const { data: maintJobs } = await supabase
    .from("maintenance_jobs")
    .select("id, title, status, created_at, property_id")
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(15);

  const { data: complianceItems } = await supabase
    .from("property_compliance_items")
    .select("id, obligation_code, status, next_due, property_id")
    .eq("status", "overdue")
    .order("next_due", { ascending: true, nullsFirst: false })
    .limit(15);

  const allPropertyIds = [
    ...(maintJobs || []).map((j: { property_id: string }) => j.property_id),
    ...(complianceItems || []).map((c: { property_id: string }) => c.property_id),
  ].filter(Boolean);

  const propMap = new Map<string, { line1: string; city: string }>();
  if (allPropertyIds.length > 0) {
    const { data: properties } = await supabase
      .from("properties")
      .select("id, line1, city")
      .in("id", [...new Set(allPropertyIds)]);
    (properties || []).forEach((p: { id: string; line1: string; city: string }) => propMap.set(p.id, p));
  }

  const issues: OpenIssue[] = [];

  (maintJobs || []).forEach((j: {
    id: string; title: string; status: string; created_at: string; property_id: string
  }) => {
    const prop = propMap.get(j.property_id);
    issues.push({
      category: "maintenance",
      issueId: j.id,
      issueTitle: j.title,
      status: j.status,
      issueDate: j.created_at,
      propertyAddress: prop?.line1 || "",
      propertyCity: prop?.city || "",
    });
  });

  (complianceItems || []).forEach((c: {
    id: string; obligation_code: string; status: string; next_due: string | null; property_id: string
  }) => {
    const prop = propMap.get(c.property_id);
    issues.push({
      category: "compliance",
      issueId: c.id,
      issueTitle: c.obligation_code,
      status: c.status,
      issueDate: c.next_due || "",
      propertyAddress: prop?.line1 || "",
      propertyCity: prop?.city || "",
    });
  });

  return issues.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 25);
}

export async function fetchRegionalBreakdown(): Promise<RegionalBreakdown[]> {
  const { data: regions } = await supabase.from("regions").select("id, region_name")

  if (!regions || !regions.length) return []

  const breakdowns: RegionalBreakdown[] = []

  for (const region of (regions as { id: string; region_name: string }[])) {
    const { data: offices } = await supabase.from("offices").select("id").eq("region_id", region.id)
    const officeIds = (offices || []).map((o: { id: string }) => o.id)
    const { data: props } = await supabase.from("properties").select("id").in("office_id", officeIds)
    const propertyIds = (props || []).map((p: { id: string }) => p.id)

    if (!propertyIds.length) {
      breakdowns.push({
        region: region.region_name,
        propertyCount: 0,
        portfolioValue: 0,
        complianceRate: 0,
        rentCollectionRate: 0,
        avgHealthScore: 0,
      })
      continue
    }

    let portVal = 0
    if (propertyIds.length) {
      const { data: fin } = await supabase.from("property_financials").select("current_value").in("property_id", propertyIds)
      portVal = (fin || []).reduce((s: number, f: { current_value: number }) => s + (f.current_value || 0), 0)
    }

    let compRate = 0
    if (propertyIds.length) {
      const { data: items } = await supabase.from("property_compliance_items").select("status").in("property_id", propertyIds)
      if (items && items.length) {
        const compliant = items.filter((i: { status: string }) => i.status === "compliant").length
        compRate = Math.round((compliant / items.length) * 100)
      }
    }

    let collRate = 0
    if (propertyIds.length) {
      const { data: payments } = await supabase.from("rent_payments").select("amount, status").in("property_id", propertyIds)
      if (payments && payments.length) {
        const total = payments.reduce((s: number, p: { amount: number }) => s + p.amount, 0)
        const collected = payments.filter((p: { status: string }) => p.status === "paid").reduce((s: number, p: { amount: number }) => s + p.amount, 0)
        collRate = total > 0 ? Math.round((collected / total) * 100) : 0
      }
    }

    let avgHealth = 0
    if (propertyIds.length) {
      const { data: scores } = await supabase.from("property_health_scores").select("overall_score").in("property_id", propertyIds)
      if (scores && scores.length) {
        avgHealth = Math.round((scores as { overall_score: number }[]).reduce((s, v) => s + v.overall_score, 0) / scores.length)
      }
    }

    breakdowns.push({
      region: region.region_name,
      propertyCount: propertyIds.length,
      portfolioValue: portVal,
      complianceRate: compRate,
      rentCollectionRate: collRate,
      avgHealthScore: avgHealth,
    })
  }

  return breakdowns
}

export const monthlyReportTrends = [
  { month: "Jan 2026", compliance: 91, maintenance: 22, rentCollection: 89, healthScore: 83, portfolioValue: 22100000 },
  { month: "Feb 2026", compliance: 92, maintenance: 20, rentCollection: 91, healthScore: 84, portfolioValue: 22500000 },
  { month: "Mar 2026", compliance: 93, maintenance: 19, rentCollection: 92, healthScore: 85, portfolioValue: 22800000 },
  { month: "Apr 2026", compliance: 93, maintenance: 18, rentCollection: 93, healthScore: 86, portfolioValue: 23200000 },
  { month: "May 2026", compliance: 94, maintenance: 16, rentCollection: 94, healthScore: 87, portfolioValue: 23700000 },
  { month: "Jun 2026", compliance: 95, maintenance: 14, rentCollection: 96, healthScore: 88, portfolioValue: 24210000 },
]