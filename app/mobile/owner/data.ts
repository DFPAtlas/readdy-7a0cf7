export interface OwnerProperty {
  id: string;
  name: string;
  address: string;
  healthScore: number;
  healthLevel: "excellent" | "good" | "attention_needed" | "high_risk" | "critical";
  monthlyRent: number;
  rentCollected: number;
  rentStatus: "paid" | "pending" | "overdue";
  tenantName: string;
  complianceTotal: number;
  complianceOk: number;
  openMaintenance: number;
  lastInspection: string;
}

export interface OwnerReport {
  id: string;
  title: string;
  property: string;
  date: string;
  type: "inspection" | "financial" | "compliance" | "maintenance";
}

export interface OwnerQuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  href: string;
  badge?: number;
}

export const ownerProperties: OwnerProperty[] = [
  {
    id: "1",
    name: "12 Rose Avenue",
    address: "Manchester, M20 3NB",
    healthScore: 85,
    healthLevel: "excellent",
    monthlyRent: 1200,
    rentCollected: 1200,
    rentStatus: "paid",
    tenantName: "Sarah Jenkins",
    complianceTotal: 6,
    complianceOk: 6,
    openMaintenance: 0,
    lastInspection: "12 Jun 2026",
  },
  {
    id: "2",
    name: "45 Oak Court",
    address: "Birmingham, B15 2PL",
    healthScore: 72,
    healthLevel: "good",
    monthlyRent: 950,
    rentCollected: 950,
    rentStatus: "paid",
    tenantName: "David Thompson",
    complianceTotal: 6,
    complianceOk: 5,
    openMaintenance: 1,
    lastInspection: "3 May 2026",
  },
  {
    id: "3",
    name: "78 Park View",
    address: "Leeds, LS6 1AH",
    healthScore: 48,
    healthLevel: "attention_needed",
    monthlyRent: 1100,
    rentCollected: 1100,
    rentStatus: "paid",
    tenantName: "Michael Davies",
    complianceTotal: 6,
    complianceOk: 4,
    openMaintenance: 2,
    lastInspection: "19 Apr 2026",
  },
  {
    id: "4",
    name: "3 The Willows",
    address: "Edinburgh, EH12 5PR",
    healthScore: 35,
    healthLevel: "high_risk",
    monthlyRent: 875,
    rentCollected: 0,
    rentStatus: "overdue",
    tenantName: "James Carter",
    complianceTotal: 6,
    complianceOk: 3,
    openMaintenance: 3,
    lastInspection: "8 Mar 2026",
  },
  {
    id: "5",
    name: "22 Riverside Court",
    address: "Cardiff, CF10 5BT",
    healthScore: 91,
    healthLevel: "excellent",
    monthlyRent: 1350,
    rentCollected: 1350,
    rentStatus: "paid",
    tenantName: "Emily Watson",
    complianceTotal: 6,
    complianceOk: 6,
    openMaintenance: 0,
    lastInspection: "28 May 2026",
  },
  {
    id: "6",
    name: "9 Hillcrest Road",
    address: "Bristol, BS6 5NL",
    healthScore: 22,
    healthLevel: "critical",
    monthlyRent: 750,
    rentCollected: 300,
    rentStatus: "overdue",
    tenantName: "Vacant",
    complianceTotal: 6,
    complianceOk: 1,
    openMaintenance: 4,
    lastInspection: "14 Feb 2026",
  },
];

export const ownerReports: OwnerReport[] = [
  {
    id: "r1",
    title: "Quarterly Inspection Report",
    property: "12 Rose Avenue",
    date: "12 Jun 2026",
    type: "inspection",
  },
  {
    id: "r2",
    title: "Annual Financial Summary",
    property: "All Properties",
    date: "5 Jun 2026",
    type: "financial",
  },
  {
    id: "r3",
    title: "Gas Safety Certificate",
    property: "45 Oak Court",
    date: "28 May 2026",
    type: "compliance",
  },
  {
    id: "r4",
    title: "Maintenance Completion Report",
    property: "78 Park View",
    date: "22 May 2026",
    type: "maintenance",
  },
  {
    id: "r5",
    title: "Move-in Inspection",
    property: "3 The Willows",
    date: "8 Mar 2026",
    type: "inspection",
  },
];

export const ownerQuickActions: OwnerQuickAction[] = [
  {
    id: "docs",
    label: "View Documents",
    icon: "ri-folder-line",
    color: "#3B82F6",
    href: "/mobile/documents",
  },
  {
    id: "reports",
    label: "View Reports",
    icon: "ri-file-chart-line",
    color: "#8B5CF6",
    href: "/mobile/owner/reports",
  },
  {
    id: "quote",
    label: "Approve Quote",
    icon: "ri-check-double-line",
    color: "#10B981",
    href: "/mobile/quotes",
    badge: 2,
  },
  {
    id: "contact",
    label: "Contact Agency",
    icon: "ri-customer-service-2-line",
    color: "#F59E0B",
    href: "/mobile/owner/contact",
  },
];

export const ownerSummary = {
  totalProperties: 6,
  totalMonthlyRent: 6225,
  rentCollected: 4900,
  rentOutstanding: 1325,
  occupancyRate: 83,
  averageHealthScore: 59,
  openMaintenanceJobs: 10,
  complianceIssues: 7,
  nextInspectionDate: "15 Jul 2026",
};

export const healthLevelConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  excellent: { label: "Excellent", color: "#10B981", bg: "#10B981", icon: "ri-shield-star-line" },
  good: { label: "Good", color: "#3B82F6", bg: "#3B82F6", icon: "ri-shield-check-line" },
  attention_needed: { label: "Needs Attention", color: "#F59E0B", bg: "#F59E0B", icon: "ri-shield-flash-line" },
  high_risk: { label: "High Risk", color: "#EF4444", bg: "#EF4444", icon: "ri-shield-cross-line" },
  critical: { label: "Critical", color: "#991B1B", bg: "#991B1B", icon: "ri-alert-line" },
};

export function getScoreColor(score: number): string {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#3B82F6";
  if (score >= 50) return "#F59E0B";
  if (score >= 30) return "#EF4444";
  return "#991B1B";
}