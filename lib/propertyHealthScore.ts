export type HealthLevel = "excellent" | "good" | "attention_needed" | "high_risk" | "critical";

export interface HealthBreakdown {
  complianceScore: number;
  maintenanceScore: number;
  tenancyScore: number;
  rentScore: number;
  inspectionScore: number;
  portalDocumentScore: number;
}

export interface PropertyHealthData {
  overallScore: number;
  healthLevel: HealthLevel;
  breakdown: HealthBreakdown;
  reasons: string[];
}

const propertyHealthMock: Record<string, PropertyHealthData> = {
  "1": {
    overallScore: 78,
    healthLevel: "good",
    breakdown: { complianceScore: 24, maintenanceScore: 15, tenancyScore: 12, rentScore: 13, inspectionScore: 8, portalDocumentScore: 6 },
    reasons: ["Gas Safety Certificate expires in 4 months — schedule renewal", "2 open maintenance jobs", "Owner portal not yet set up — one-click invite available"],
  },
  "2": {
    overallScore: 82,
    healthLevel: "good",
    breakdown: { complianceScore: 22, maintenanceScore: 18, tenancyScore: 14, rentScore: 13, inspectionScore: 8, portalDocumentScore: 7 },
    reasons: ["EPC rating B — above legal minimum", "Gas Safety Certificate expiring soon — renew within 90 days", "Tenant portal still pending — send invite"],
  },
  "3": {
    overallScore: 31,
    healthLevel: "high_risk",
    breakdown: { complianceScore: 5, maintenanceScore: 6, tenancyScore: 8, rentScore: 7, inspectionScore: 3, portalDocumentScore: 2 },
    reasons: ["Gas Safety Certificate expired — URGENT action required", "3 open maintenance jobs — risk of further damage", "Owner portal not set up — owner cannot view property data"],
  },
  "4": {
    overallScore: 55,
    healthLevel: "attention_needed",
    breakdown: { complianceScore: 18, maintenanceScore: 12, tenancyScore: 5, rentScore: 8, inspectionScore: 7, portalDocumentScore: 5 },
    reasons: ["Property currently vacant — no rental income", "No tenant assigned — tenancy score critically low", "Tenant portal not set up"],
  },
  "5": {
    overallScore: 86,
    healthLevel: "excellent",
    breakdown: { complianceScore: 28, maintenanceScore: 18, tenancyScore: 13, rentScore: 13, inspectionScore: 8, portalDocumentScore: 8 },
    reasons: ["All compliance certificates valid", "No open maintenance jobs", "Both owner and tenant portals active"],
  },
  "6": {
    overallScore: 19,
    healthLevel: "critical",
    breakdown: { complianceScore: 2, maintenanceScore: 3, tenancyScore: 2, rentScore: 5, inspectionScore: 2, portalDocumentScore: 5 },
    reasons: ["Gas Safety expired — CRITICAL compliance failure", "EICR certificate expired", "4 open maintenance jobs — multiple hazards", "EPC rating E — below legal minimum", "Tenancy has expired — no active agreement in place"],
  },
  "7": {
    overallScore: 42,
    healthLevel: "high_risk",
    breakdown: { complianceScore: 8, maintenanceScore: 14, tenancyScore: 5, rentScore: 6, inspectionScore: 4, portalDocumentScore: 5 },
    reasons: ["No compliance records — all certificates missing", "No owner assigned", "No tenant assigned", "Portals not configured"],
  },
  "8": {
    overallScore: 68,
    healthLevel: "attention_needed",
    breakdown: { complianceScore: 20, maintenanceScore: 14, tenancyScore: 12, rentScore: 10, inspectionScore: 6, portalDocumentScore: 6 },
    reasons: ["Tenant portal not set up yet", "Tenant name missing from records", "No recent inspection on file"],
  },
  "9": {
    overallScore: 50,
    healthLevel: "attention_needed",
    breakdown: { complianceScore: 16, maintenanceScore: 12, tenancyScore: 5, rentScore: 6, inspectionScore: 5, portalDocumentScore: 6 },
    reasons: ["Property vacant — no rental income", "No tenant assigned", "Owner portal invitation pending"],
  },
  "10": {
    overallScore: 62,
    healthLevel: "attention_needed",
    breakdown: { complianceScore: 20, maintenanceScore: 14, tenancyScore: 10, rentScore: 8, inspectionScore: 5, portalDocumentScore: 5 },
    reasons: ["No owner assigned to this property", "Owner portal not configured", "Rent data incomplete"],
  },
};

const defaultHealth: PropertyHealthData = {
  overallScore: 60,
  healthLevel: "attention_needed",
  breakdown: { complianceScore: 18, maintenanceScore: 14, tenancyScore: 10, rentScore: 8, inspectionScore: 5, portalDocumentScore: 5 },
  reasons: ["Health score data being calculated", "Check back shortly for full breakdown"],
};

export function calculatePropertyHealthScore(propertyId: string): PropertyHealthData {
  return propertyHealthMock[propertyId] || defaultHealth;
}

export function getHealthLevel(score: number): HealthLevel {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "attention_needed";
  if (score >= 30) return "high_risk";
  return "critical";
}

export function getHealthBadge(level: HealthLevel): { label: string; color: string; bg: string; textColor: string; icon: string } {
  switch (level) {
    case "excellent":
      return { label: "Excellent", color: "#10B981", bg: "bg-[#10B981]/10", textColor: "text-[#10B981]", icon: "ri-shield-star-line" };
    case "good":
      return { label: "Good", color: "#3B82F6", bg: "bg-[#3B82F6]/10", textColor: "text-[#3B82F6]", icon: "ri-shield-check-line" };
    case "attention_needed":
      return { label: "Needs Attention", color: "#F59E0B", bg: "bg-[#F59E0B]/10", textColor: "text-[#F59E0B]", icon: "ri-shield-flash-line" };
    case "high_risk":
      return { label: "High Risk", color: "#EF4444", bg: "bg-[#EF4444]/10", textColor: "text-[#EF4444]", icon: "ri-shield-cross-line" };
    case "critical":
      return { label: "Critical", color: "#991B1B", bg: "bg-[#991B1B]/10", textColor: "text-[#991B1B]", icon: "ri-alert-line" };
  }
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#3B82F6";
  if (score >= 50) return "#F59E0B";
  if (score >= 30) return "#EF4444";
  return "#991B1B";
}

export function getAllPropertiesHealthSummary(): { propertyId: string; name: string; address: string; data: PropertyHealthData }[] {
  const propertyNames: Record<string, { name: string; address: string }> = {
    "1": { name: "12 Rose Avenue", address: "Manchester, M20 3NB" },
    "2": { name: "45 Oak Court", address: "Birmingham, B15 2PL" },
    "3": { name: "78 Park View", address: "Leeds, LS6 1AH" },
    "4": { name: "3 The Willows", address: "Edinburgh, EH12 5PR" },
    "5": { name: "22 Riverside Court", address: "Cardiff, CF10 5BT" },
    "6": { name: "9 Hillcrest Road", address: "Bristol, BS6 5NL" },
    "7": { name: "15 Meadow Lane", address: "Nottingham, NG7 2RD" },
    "8": { name: "33 Harbour View", address: "Southampton, SO14 3BN" },
    "9": { name: "55 Green Lane", address: "Sheffield, S10 2TH" },
    "10": { name: "72 Castle Gate", address: "Newcastle, NE1 4SN" },
  };

  return Object.entries(propertyHealthMock).map(([propertyId, data]) => ({
    propertyId,
    name: propertyNames[propertyId]?.name || `Property ${propertyId}`,
    address: propertyNames[propertyId]?.address || "",
    data,
  }));
}