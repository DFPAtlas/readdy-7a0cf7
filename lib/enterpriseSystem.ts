export interface EnterpriseKPI {
  label: string
  value: string
  icon: string
  color: string
  secondary: string
  href?: string
}

export interface LeadershipAction {
  id: string
  priority: "critical" | "high" | "medium"
  regionOrOffice: string
  issue: string
  impact: string
  owner: string
  dueDate: string
  actionLabel: string
  actionHref: string
  category: "compliance" | "rent" | "maintenance" | "risk" | "permission" | "data" | "integration" | "capacity"
}

export interface RegionalSummaryItem {
  regionId: string
  regionName: string
  regionCode: string
  propertyCount: number
  complianceRate: number
  rentCollectionRate: number
  avgHealthScore: number
  openMaintenance: number
  alertCount: number
  status: "critical" | "warning" | "healthy"
}

export const LEADERSHIP_ACTION_PRIORITY: Record<string, { color: string; bg: string; label: string; sortOrder: number }> = {
  critical: { color: "#EF4444", bg: "bg-[#EF4444]/10", label: "Critical", sortOrder: 0 },
  high: { color: "#F59E0B", bg: "bg-[#F59E0B]/10", label: "High", sortOrder: 1 },
  medium: { color: "#3B82F6", bg: "bg-[#3B82F6]/10", label: "Medium", sortOrder: 2 },
}

export const ACTION_CATEGORY_ICONS: Record<string, string> = {
  compliance: "ri-shield-check-line",
  rent: "ri-coins-line",
  maintenance: "ri-tools-line",
  risk: "ri-shield-flash-line",
  permission: "ri-key-2-line",
  data: "ri-database-2-line",
  integration: "ri-puzzle-2-line",
  capacity: "ri-user-add-line",
}

export const REGION_COLORS_EXTENDED: Record<string, string> = {
  "Greater London": "#C28A78",
  "North West": "#3B82F6",
  "West Midlands": "#F59E0B",
  "South West": "#8B5CF6",
  "Yorkshire": "#10B981",
  "LON": "#C28A78",
  "NW": "#3B82F6",
  "WM": "#F59E0B",
  "SW": "#8B5CF6",
  "YKS": "#10B981",
}

export const OFFICE_COLORS_EXTENDED: Record<string, string> = {
  "LON-HQ": "#C28A78",
  "MAN-01": "#3B82F6",
  "BIR-01": "#F59E0B",
  "BRS-01": "#8B5CF6",
  "LDS-01": "#10B981",
}

export const REGION_COLORS = REGION_COLORS_EXTENDED;

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

export function formatCurrency(n: number): string {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return "£" + (n / 1000).toFixed(0) + "k"
  return "£" + n.toFixed(0)
}

export const ENTERPRISE_DISCLAIMER = "Financial and performance metrics are based on available data and may not reflect real-time figures. Demo accounts display sample data."