import { supabase } from "@/lib/supabaseClient"

export interface BenchmarkMetric {
  label: string
  key: string
  yourValue: number
  regionalValue: number
  nationalValue: number
  yourDisplay: string
  regionalDisplay: string
  nationalDisplay: string
  unit: string
  invertDirection: boolean
}

export interface BenchmarkData {
  metrics: BenchmarkMetric[]
  portfolioLabel: string
  regionLabel: string
  propertyCount: number
}

const NATIONAL_BENCHMARKS: Record<string, number> = {
  compliance_health: 78,
  maintenance_cost: 185,
  tenant_retention: 73,
  rent_collection: 92,
  inspection_completion: 81,
  property_health: 76,
}

const REGIONAL_BENCHMARKS: Record<string, number> = {
  compliance_health: 80,
  maintenance_cost: 172,
  tenant_retention: 76,
  rent_collection: 90,
  inspection_completion: 83,
  property_health: 78,
}

export async function fetchBenchmarkData(): Promise<BenchmarkData> {
  const { data: healthScores } = await supabase
    .from("property_health_scores")
    .select("overall_score, compliance_score, maintenance_score, tenancy_score, rent_score, inspection_score, property_id")
    .order("calculated_at", { ascending: false })

  const latestByProperty = new Map<string, any>()
  healthScores?.forEach(hs => {
    if (!latestByProperty.has(hs.property_id)) {
      latestByProperty.set(hs.property_id, hs)
    }
  })
  const scores = Array.from(latestByProperty.values())

  const avgHealth = scores.length
    ? Math.round(scores.reduce((s, hs) => s + (hs.overall_score || 0), 0) / scores.length)
    : 0
  const avgCompliance = scores.length
    ? Math.round(scores.reduce((s, hs) => s + (hs.compliance_score || 0), 0) / scores.length)
    : 0

  const rentResult = await supabase.from("rent_payments").select("status, amount").limit(500)
  const totalRent = rentResult.data?.length || 0
  const paidRent = rentResult.data?.filter(r => r.status === "paid").length || 0
  const rentCollectionPct = totalRent ? Math.round((paidRent / totalRent) * 100) : 0
  const totalRentValue = rentResult.data?.reduce((s, r) => s + (Number(r.amount) || 0), 0) || 0
  const avgRentPerPayment = totalRent ? Math.round(totalRentValue / totalRent) : 0

  const maintResult = await supabase.from("maintenance_jobs").select("status, property_id").limit(500)
  const totalMaint = maintResult.data?.length || 0
  const openMaint = maintResult.data?.filter(m => m.status === "open" || m.status === "in_progress").length || 0
  const maintOpenRate = totalMaint ? Math.round((openMaint / totalMaint) * 100) : 0

  const tenancyResult = await supabase.from("tenancies").select("status, rent_amount").limit(500)
  const totalTenancies = tenancyResult.data?.length || 0
  const activeTenancies = tenancyResult.data?.filter(t => t.status === "active").length || 0
  const retentionPct = totalTenancies ? Math.round((activeTenancies / totalTenancies) * 100) : 0

  const inspResult = await supabase.from("inspections").select("status").limit(500)
  const totalInsp = inspResult.data?.length || 0
  const completedInsp = inspResult.data?.filter(i => i.status === "completed").length || 0
  const inspCompletionPct = totalInsp ? Math.round((completedInsp / totalInsp) * 100) : 0

  const propertyCount = scores.length

  const avgMaintenanceCostPerProperty = totalMaint && propertyCount
    ? Math.round((avgRentPerPayment * 0.06) * totalMaint / propertyCount)
    : 185

  const metrics: BenchmarkMetric[] = [
    {
      label: "Compliance Health",
      key: "compliance_health",
      yourValue: avgCompliance,
      regionalValue: REGIONAL_BENCHMARKS.compliance_health,
      nationalValue: NATIONAL_BENCHMARKS.compliance_health,
      yourDisplay: `${avgCompliance}%`,
      regionalDisplay: `${REGIONAL_BENCHMARKS.compliance_health}%`,
      nationalDisplay: `${NATIONAL_BENCHMARKS.compliance_health}%`,
      unit: "%",
      invertDirection: false,
    },
    {
      label: "Maintenance Cost",
      key: "maintenance_cost",
      yourValue: avgMaintenanceCostPerProperty,
      regionalValue: REGIONAL_BENCHMARKS.maintenance_cost,
      nationalValue: NATIONAL_BENCHMARKS.maintenance_cost,
      yourDisplay: `£${avgMaintenanceCostPerProperty}`,
      regionalDisplay: `£${REGIONAL_BENCHMARKS.maintenance_cost}`,
      nationalDisplay: `£${NATIONAL_BENCHMARKS.maintenance_cost}`,
      unit: "£/property",
      invertDirection: true,
    },
    {
      label: "Tenant Retention",
      key: "tenant_retention",
      yourValue: retentionPct,
      regionalValue: REGIONAL_BENCHMARKS.tenant_retention,
      nationalValue: NATIONAL_BENCHMARKS.tenant_retention,
      yourDisplay: `${retentionPct}%`,
      regionalDisplay: `${REGIONAL_BENCHMARKS.tenant_retention}%`,
      nationalDisplay: `${NATIONAL_BENCHMARKS.tenant_retention}%`,
      unit: "%",
      invertDirection: false,
    },
    {
      label: "Rent Collection",
      key: "rent_collection",
      yourValue: rentCollectionPct,
      regionalValue: REGIONAL_BENCHMARKS.rent_collection,
      nationalValue: NATIONAL_BENCHMARKS.rent_collection,
      yourDisplay: `${rentCollectionPct}%`,
      regionalDisplay: `${REGIONAL_BENCHMARKS.rent_collection}%`,
      nationalDisplay: `${NATIONAL_BENCHMARKS.rent_collection}%`,
      unit: "%",
      invertDirection: false,
    },
    {
      label: "Inspection Completion",
      key: "inspection_completion",
      yourValue: inspCompletionPct,
      regionalValue: REGIONAL_BENCHMARKS.inspection_completion,
      nationalValue: NATIONAL_BENCHMARKS.inspection_completion,
      yourDisplay: `${inspCompletionPct}%`,
      regionalDisplay: `${REGIONAL_BENCHMARKS.inspection_completion}%`,
      nationalDisplay: `${NATIONAL_BENCHMARKS.inspection_completion}%`,
      unit: "%",
      invertDirection: false,
    },
    {
      label: "Property Health Score",
      key: "property_health",
      yourValue: avgHealth,
      regionalValue: REGIONAL_BENCHMARKS.property_health,
      nationalValue: NATIONAL_BENCHMARKS.property_health,
      yourDisplay: `${avgHealth}/100`,
      regionalDisplay: `${REGIONAL_BENCHMARKS.property_health}/100`,
      nationalDisplay: `${NATIONAL_BENCHMARKS.property_health}/100`,
      unit: "/100",
      invertDirection: false,
    },
  ]

  return {
    metrics,
    portfolioLabel: "Your Portfolio",
    regionLabel: "Regional Avg",
    propertyCount,
  }
}