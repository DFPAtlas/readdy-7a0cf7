export interface PropertyHealthSnapshot {
  propertyId: string
  line1: string
  city: string
  postcode: string
  bedrooms: number
  epcRating: string
  isHmo: boolean
  landlordName: string
  landlordEmail: string
  tenantName: string
  tenantEmail: string
  rentAmount: number
  rentPeriod: string
  tenancyStatus: string
  complianceOverdue: number
  complianceDueSoon: number
  complianceCompliant: number
  openMaintenance: number
  inProgressMaintenance: number
  arrearsOwed: number
  arrearsStatus: string
  overdueInspection: boolean
  riskScore: number
  riskLevel: string
  annualRent: number
  rentCollectionRate: number
}

export interface LandlordContactNeed {
  landlordName: string
  landlordEmail: string
  propertyCount: number
  properties: { line1: string; city: string; postcode: string; reason: string }[]
  urgentReason: string
}

export interface TenantRiskProfile {
  tenantName: string
  tenantEmail: string
  propertyLine1: string
  propertyPostcode: string
  arrearsOwed: number
  arrearsStatus: string
  openMaintenance: number
  complianceIssues: number
  riskLevel: string
  riskReason: string
}

export interface BranchPerformance {
  name: string
  propertyCount: number
  tenancyCount: number
  occupancyRate: string
  totalRentRoll: number
  arrearsTotal: number
  maintenanceOpen: number
  complianceScore: string
  inspectionCompletion: string
  performanceLevel: string
}

export function calculateRiskLevel(score: number): string {
  if (score >= 60) return "critical"
  if (score >= 35) return "high"
  if (score >= 15) return "medium"
  return "low"
}

export function calculateRiskColor(level: string): string {
  switch (level) {
    case "critical": return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
    case "high": return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
    case "medium": return "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20"
    default: return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
  }
}