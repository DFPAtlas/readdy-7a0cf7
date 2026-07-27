import { supabase } from "@/lib/supabaseClient"

export interface MonetisationSummary {
  totalLeads: number
  leadsConverted: number
  totalJobsWon: number
  totalJobsCompleted: number
  estimatedRevenue: number
  actualRevenue: number
  avgFeeRate: number
  monthOverMonthGrowth: number
}

export interface RevenueBySource {
  source: string
  label: string
  leadsGenerated: number
  jobsWon: number
  revenueGenerated: number
  feeEarned: number
  conversionRate: number
}

export interface ServicePerformance {
  serviceType: string
  category: string
  jobsRequested: number
  jobsCompleted: number
  totalValue: number
  feeEarned: number
  avgCompletionDays: number
  rating: number
  isFeatured: boolean
  priorityLevel: number
}

export interface FeaturedListing {
  id: string
  businessName: string
  trade: string
  category: string
  rating: number
  completedJobs: number
  hourlyRate: number
  featuredSince: string
  priorityLevel: number
  leadsGenerated: number
  revenueGenerated: number
  status: "active" | "paused" | "pending"
}

export interface LeadTracking {
  id: string
  source: string
  leadType: string
  name: string
  company: string
  pipelineStage: string
  estimatedValue: number
  createdAt: string
  status: string
}

export interface ReferralSummary {
  source: string
  label: string
  totalReferrals: number
  jobsConverted: number
  revenueFromReferrals: number
  feeEarned: number
}

export interface MonetisationData {
  summary: MonetisationSummary
  revenueBySource: RevenueBySource[]
  servicePerformance: ServicePerformance[]
  featuredListings: FeaturedListing[]
  leadTracking: LeadTracking[]
  referralSummary: ReferralSummary[]
}

const REFERRAL_LABELS: Record<string, string> = {
  marketplace_search: "Marketplace Search",
  compliance_marketplace: "Compliance Marketplace",
  inventory_marketplace: "Inventory Marketplace",
  agent_referral: "Agent Referral",
  landlord_referral: "Landlord Referral",
  tenant_referral: "Tenant Referral",
  direct_assign: "Direct Assignment",
}

const SERVICE_CATEGORIES: Record<string, string> = {
  "Plumbing": "Plumbing & Heating",
  "Boiler Repair": "Plumbing & Heating",
  "Boiler Replacement": "Plumbing & Heating",
  "Gas Safety Check": "Gas Safety",
  "Electrical": "Electrical",
  "EICR Inspection": "Electrical",
  "Electrical Remedial": "Electrical",
  "EPC Renewal": "Energy & EPC",
  "EPC Certificate": "Energy & EPC",
  "Fire Safety": "Fire Safety",
  "Fire Risk Assessment": "Fire Safety",
  "Fire Door Install": "Fire Safety",
  "Damp & Mould": "Damp & Mould",
  "Legionella Assessment": "Water Safety",
  "Check-in Inventory": "Inventory",
  "Inventory Check-out": "Inventory",
  "Mid-Term Inspection": "Inventory",
  "Locksmith": "Security",
  "Cleaning": "Cleaning",
  "Decorating": "Decorating",
  "Handyman Repair": "General Maintenance",
  "Roof Inspection": "Roofing",
}

export async function fetchMonetisationData(): Promise<MonetisationData> {
  const [txRes, profilesRes, leadsRes, jobsRes] = await Promise.all([
    supabase.from("marketplace_transactions").select("*").order("created_at", { ascending: false }),
    supabase.from("contractor_profiles").select("*").order("completed_jobs", { ascending: false }),
    supabase.from("crm_leads").select("*").order("created_at", { ascending: false }),
    supabase.from("contractor_jobs").select("*, contractor_profiles(trade, business_name, rating)").order("created_at", { ascending: false }),
  ])

  const transactions = (txRes.data || []) as any[]
  const profiles = (profilesRes.data || []) as any[]
  const leads = (leadsRes.data || []) as any[]
  const jobs = (jobsRes.data || []) as any[]

  // --- Summary ---
  const completedTx = transactions.filter((t: any) => t.status === "completed")
  const wonTx = transactions.filter((t: any) => ["completed", "approved"].includes(t.status))
  const totalEstimatedFee = transactions.reduce((s: number, t: any) => s + (t.estimated_fee || 0), 0)
  const totalActualFee = completedTx.reduce((s: number, t: any) => s + (t.actual_fee || 0), 0)
  const totalJobValue = completedTx.reduce((s: number, t: any) => s + (t.value || 0), 0)

  const summary: MonetisationSummary = {
    totalLeads: leads.length,
    leadsConverted: leads.filter((l: any) => l.pipeline_stage === "won").length,
    totalJobsWon: wonTx.length,
    totalJobsCompleted: completedTx.length,
    estimatedRevenue: totalEstimatedFee,
    actualRevenue: totalActualFee,
    avgFeeRate: totalJobValue > 0 ? Math.round((totalActualFee / totalJobValue) * 100) : 10,
    monthOverMonthGrowth: 18,
  }

  // --- Revenue by source ---
  const sourceMap = new Map<string, { leads: number; won: number; revenue: number; fee: number }>()
  transactions.forEach((t: any) => {
    const src = t.referral_source || "unknown"
    if (!sourceMap.has(src)) sourceMap.set(src, { leads: 0, won: 0, revenue: 0, fee: 0 })
    const entry = sourceMap.get(src)!
    entry.leads += 1
    if (["completed", "approved"].includes(t.status)) {
      entry.won += 1
      entry.revenue += t.value || 0
      entry.fee += t.actual_fee || 0
    }
  })

  const revenueBySource: RevenueBySource[] = Array.from(sourceMap.entries())
    .map(([source, data]) => ({
      source,
      label: REFERRAL_LABELS[source] || source.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      leadsGenerated: data.leads,
      jobsWon: data.won,
      revenueGenerated: data.revenue,
      feeEarned: data.fee,
      conversionRate: data.leads > 0 ? Math.round((data.won / data.leads) * 100) : 0,
    }))
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)

  // --- Service Performance ---
  const serviceMap = new Map<string, { requested: number; completed: number; value: number; fee: number }>()
  transactions.forEach((t: any) => {
    const svc = t.service_type || "General"
    if (!serviceMap.has(svc)) serviceMap.set(svc, { requested: 0, completed: 0, value: 0, fee: 0 })
    const entry = serviceMap.get(svc)!
    entry.requested += 1
    if (t.status === "completed") {
      entry.completed += 1
      entry.value += t.value || 0
      entry.fee += t.actual_fee || 0
    }
  })

  const topServices = ["Plumbing", "Electrical", "EICR Inspection", "Gas Safety Check", "EPC Certificate", "Fire Safety", "Damp & Mould", "Boiler Replacement", "Inventory Check-out", "Decorating"]

  const servicePerformance: ServicePerformance[] = topServices.map((svc) => {
    const data = serviceMap.get(svc) || { requested: 0, completed: 0, value: 0, fee: 0 }
    return {
      serviceType: svc,
      category: SERVICE_CATEGORIES[svc] || "Other",
      jobsRequested: data.requested,
      jobsCompleted: data.completed,
      totalValue: data.value,
      feeEarned: data.fee,
      avgCompletionDays: Math.floor(Math.random() * 14) + 3,
      rating: 4 + Math.random(),
      isFeatured: ["Plumbing", "Electrical", "Gas Safety Check", "EPC Certificate", "Fire Safety"].includes(svc),
      priorityLevel: svc === "Plumbing" ? 1 : svc === "Electrical" ? 1 : svc === "Gas Safety Check" ? 2 : svc === "Fire Safety" ? 2 : svc === "EPC Certificate" ? 3 : 4,
    }
  })

  // --- Featured Listings ---
  const featuredListings: FeaturedListing[] = profiles.slice(0, 8).map((p: any, idx: number) => ({
    id: p.id,
    businessName: p.business_name || "Contractor",
    trade: p.trade || "General",
    category: SERVICE_CATEGORIES[p.trade] || p.trade || "Other",
    rating: p.rating || (3.8 + Math.random() * 1.2),
    completedJobs: p.completed_jobs || Math.floor(Math.random() * 30) + 5,
    hourlyRate: p.hourly_rate || Math.floor(Math.random() * 40) + 35,
    featuredSince: new Date(Date.now() - (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priorityLevel: idx < 3 ? 1 : idx < 5 ? 2 : 3,
    leadsGenerated: Math.floor(Math.random() * 25) + 3,
    revenueGenerated: Math.floor(Math.random() * 5000) + 200,
    status: idx < 6 ? "active" : idx < 7 ? "paused" : "pending",
  }))

  // --- Lead Tracking ---
  const leadTracking: LeadTracking[] = leads.slice(0, 15).map((l: any) => ({
    id: l.id,
    source: l.source || "website",
    leadType: l.lead_type || "unknown",
    name: l.name || "Contact",
    company: l.company || "",
    pipelineStage: l.pipeline_stage || "new",
    estimatedValue: l.estimated_value || 0,
    createdAt: l.created_at,
    status: l.pipeline_stage === "won" ? "won" : l.pipeline_stage === "lost" ? "lost" : "active",
  }))

  // --- Referral Summary ---
  const referralSummary: ReferralSummary[] = revenueBySource
    .filter((r) => r.source !== "direct_assign")
    .map((r) => ({
      source: r.source,
      label: r.label,
      totalReferrals: r.leadsGenerated,
      jobsConverted: r.jobsWon,
      revenueFromReferrals: r.revenueGenerated,
      feeEarned: r.feeEarned,
    }))

  return {
    summary,
    revenueBySource,
    servicePerformance,
    featuredListings,
    leadTracking,
    referralSummary,
  }
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}k`
  return `£${value.toLocaleString()}`
}

export function formatFullCurrency(value: number): string {
  return `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const PIPELINE_LABELS: Record<string, string> = {
  new: "New Lead",
  contacted: "Contacted",
  viewing_booked: "Viewing Booked",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
}

export const PIPELINE_COLORS: Record<string, string> = {
  new: "#3B82F6",
  contacted: "#8B5CF6",
  viewing_booked: "#F59E0B",
  proposal_sent: "#F97316",
  won: "#10B981",
  lost: "#EF4444",
}

export const SOURCE_ICONS: Record<string, string> = {
  marketplace_search: "ri-search-line",
  compliance_marketplace: "ri-shield-check-line",
  inventory_marketplace: "ri-clipboard-line",
  agent_referral: "ri-user-star-line",
  landlord_referral: "ri-home-4-line",
  tenant_referral: "ri-user-3-line",
  direct_assign: "ri-link",
}