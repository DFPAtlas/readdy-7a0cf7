export interface PropertyRisk {
  id: string;
  propertyName: string;
  address: string;
  city: string;
  postcode: string;
  riskScore: number;
  riskLevel: "critical" | "high" | "medium" | "low";
  riskFactors: RiskFactor[];
  expiringCertificates: number;
  expiredCertificates: number;
  overdueInspections: number;
  openMaintenanceJobs: number;
  maintenanceUrgent: number;
  lastAudit: string;
  image: string;
}

export interface RiskFactor {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  daysOverdue: number;
}

export interface MaintenanceHotspot {
  trade: string;
  count: number;
  properties: string[];
  trend: "up" | "stable" | "down";
  avgDaysOpen: number;
}

export const riskLevelConfig: Record<string, { bg: string; text: string; badge: string; icon: string }> = {
  critical: { bg: "bg-[#FEF2F2] border-[#FECACA]", text: "text-[#DC2626]", badge: "bg-[#EF4444]/10 text-[#EF4444]", icon: "ri-error-warning-line text-[#EF4444]" },
  high: { bg: "bg-[#FFF7ED] border-[#FED7AA]", text: "text-[#EA580C]", badge: "bg-[#F97316]/10 text-[#F97316]", icon: "ri-alert-line text-[#F97316]" },
  medium: { bg: "bg-[#FFFBEB] border-[#FDE68A]", text: "text-[#D97706]", badge: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-information-line text-[#F59E0B]" },
  low: { bg: "bg-[#F0FDF4] border-[#BBF7D0]", text: "text-[#16A34A]", badge: "bg-[#10B981]/10 text-[#10B981]", icon: "ri-check-line text-[#10B981]" },
};

const propertyImages = [
  "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20apartment%20building%20exterior%2C%20brick%20and%20glass%20facade%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20colours%2C%20soft%20daylight&width=400&height=300&seq=risk-prop-1&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Contemporary%20riverside%20apartment%20building%20UK%2C%20waterfront%20residential%20complex%2C%20professional%20architectural%20photography%2C%20clean%20simple%20background%2C%20overcast%20sky&width=400&height=300&seq=risk-prop-2&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20semi-detached%20house%20exterior%2C%20brick%20and%20render%20facade%2C%20suburban%20street%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%2C%20natural%20light&width=400&height=300&seq=risk-prop-3&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Modern%20UK%20terraced%20house%20row%2C%20Victorian%20style%20with%20white%20windows%2C%20clean%20street%20view%2C%20professional%20real%20estate%20photography%2C%20afternoon%20light&width=400&height=300&seq=risk-prop-4&orientation=landscape",
  "https://readdy.ai/api/search-image?query=New%20build%20UK%20apartment%20block%2C%20contemporary%20architecture%2C%20balconies%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%2C%20blue%20sky&width=400&height=300&seq=risk-prop-5&orientation=landscape",
  "https://readdy.ai/api/search-image?query=UK%20suburban%20semi-detached%20house%2C%20red%20brick%2C%20bay%20windows%2C%20well%20maintained%20front%20garden%2C%20professional%20property%20photography%2C%20natural%20daylight&width=400&height=300&seq=risk-prop-6&orientation=landscape",
];

export const propertyRisks: PropertyRisk[] = [
  {
    id: "p3", propertyName: "Maple Gardens House", address: "34 Maple Gardens", city: "Cardiff", postcode: "CF10 3BZ",
    riskScore: 12, riskLevel: "critical",
    riskFactors: [
      { type: "Gas Safety Certificate", severity: "critical", description: "Expired 184 days ago — no valid CP12 on file", daysOverdue: 184 },
      { type: "EPC Certificate", severity: "critical", description: "Expired 176 days ago — illegal to let without valid EPC", daysOverdue: 176 },
      { type: "Carbon Monoxide Alarm", severity: "critical", description: "CO alarm check expired with gas safety — urgent renewal", daysOverdue: 184 },
    ],
    expiringCertificates: 0, expiredCertificates: 3, overdueInspections: 0, openMaintenanceJobs: 1, maintenanceUrgent: 0,
    lastAudit: "09 Apr 2026", image: propertyImages[2],
  },
  {
    id: "p2", propertyName: "Riverside Court", address: "Unit 3, Riverside Court", city: "Bristol", postcode: "BS1 4ST",
    riskScore: 28, riskLevel: "high",
    riskFactors: [
      { type: "EICR Report", severity: "high", description: "Expired 78 days ago — electrical inspection overdue", daysOverdue: 78 },
      { type: "Smoke Alarm Check", severity: "high", description: "Overdue by 53 days — tenant notified but unconfirmed", daysOverdue: 53 },
      { type: "Legionella Assessment", severity: "medium", description: "Expires in 12 days — schedule renewal now", daysOverdue: 0 },
    ],
    expiringCertificates: 1, expiredCertificates: 2, overdueInspections: 0, openMaintenanceJobs: 2, maintenanceUrgent: 1,
    lastAudit: "21 Nov 2025", image: propertyImages[1],
  },
  {
    id: "p1", propertyName: "Rose Court Flat 2A", address: "12 Rose Avenue", city: "London", postcode: "E1 6AN",
    riskScore: 42, riskLevel: "medium",
    riskFactors: [
      { type: "EICR Report", severity: "medium", description: "C2 observation on bathroom lighting — remedial work due", daysOverdue: 0 },
      { type: "Smoke Alarm Check", severity: "medium", description: "Expires in 4 days — renewal needed immediately", daysOverdue: 0 },
      { type: "Building Insurance", severity: "low", description: "Expires in 4 days — auto-renewal enabled", daysOverdue: 0 },
    ],
    expiringCertificates: 3, expiredCertificates: 0, overdueInspections: 0, openMaintenanceJobs: 2, maintenanceUrgent: 0,
    lastAudit: "13 Mar 2026", image: propertyImages[0],
  },
  {
    id: "p4", propertyName: "Flat 4B Oak Street", address: "Flat 4B, Oak Street", city: "Manchester", postcode: "M1 2AB",
    riskScore: 58, riskLevel: "medium",
    riskFactors: [
      { type: "Gas Safety Certificate", severity: "medium", description: "Expires in 45 days — book engineer", daysOverdue: 0 },
    ],
    expiringCertificates: 1, expiredCertificates: 0, overdueInspections: 1, openMaintenanceJobs: 0, maintenanceUrgent: 0,
    lastAudit: "22 May 2026", image: propertyImages[3],
  },
  {
    id: "p5", propertyName: "8 The Crescent", address: "8 The Crescent", city: "Birmingham", postcode: "B2 3CD",
    riskScore: 65, riskLevel: "medium",
    riskFactors: [],
    expiringCertificates: 0, expiredCertificates: 0, overdueInspections: 0, openMaintenanceJobs: 3, maintenanceUrgent: 1,
    lastAudit: "01 Jun 2026", image: propertyImages[4],
  },
  {
    id: "p6", propertyName: "55 Green Lane", address: "55 Green Lane", city: "Leeds", postcode: "LS6 2NX",
    riskScore: 78, riskLevel: "low",
    riskFactors: [],
    expiringCertificates: 0, expiredCertificates: 0, overdueInspections: 0, openMaintenanceJobs: 0, maintenanceUrgent: 0,
    lastAudit: "15 Jun 2026", image: propertyImages[5],
  },
  {
    id: "p7", propertyName: "15 Meadow Lane", address: "15 Meadow Lane", city: "London", postcode: "SW1 4AB",
    riskScore: 82, riskLevel: "low",
    riskFactors: [],
    expiringCertificates: 1, expiredCertificates: 0, overdueInspections: 0, openMaintenanceJobs: 0, maintenanceUrgent: 0,
    lastAudit: "10 Jun 2026", image: propertyImages[0],
  },
  {
    id: "p8", propertyName: "Park View Terrace", address: "7 Park View Terrace", city: "Bristol", postcode: "BS1 5TR",
    riskScore: 90, riskLevel: "low",
    riskFactors: [],
    expiringCertificates: 0, expiredCertificates: 0, overdueInspections: 0, openMaintenanceJobs: 0, maintenanceUrgent: 0,
    lastAudit: "05 Jun 2026", image: propertyImages[1],
  },
];

export const maintenanceHotspots: MaintenanceHotspot[] = [
  { trade: "Plumbing", count: 8, properties: ["Rose Court Flat 2A", "Riverside Court", "8 The Crescent", "15 Meadow Lane"], trend: "up", avgDaysOpen: 4 },
  { trade: "Electrical", count: 5, properties: ["Maple Gardens House", "Rose Court Flat 2A", "8 The Crescent"], trend: "stable", avgDaysOpen: 3 },
  { trade: "Heating & Boilers", count: 4, properties: ["Riverside Court", "Flat 4B Oak Street", "55 Green Lane"], trend: "down", avgDaysOpen: 2 },
  { trade: "Damp & Mould", count: 3, properties: ["Rose Court Flat 2A", "Maple Gardens House"], trend: "stable", avgDaysOpen: 7 },
  { trade: "Carpentry & Joinery", count: 3, properties: ["8 The Crescent", "Park View Terrace"], trend: "down", avgDaysOpen: 5 },
  { trade: "Roofing", count: 2, properties: ["Maple Gardens House"], trend: "up", avgDaysOpen: 12 },
];

export const highRiskSummary = {
  totalProperties: 8,
  criticalCount: 1,
  highCount: 1,
  mediumCount: 3,
  lowCount: 3,
  totalExpiredCerts: 5,
  totalExpiringCerts: 6,
  overdueInspections: 1,
  totalOpenMaintenance: 9,
  urgentMaintenance: 2,
  averageRiskScore: 57,
};