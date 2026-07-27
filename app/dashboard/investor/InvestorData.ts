import { supabase } from "@/lib/supabaseClient";

export interface InvestorKPI {
  portfolioValue: number;
  monthlyRentIncome: number;
  annualYield: number;
  complianceHealth: number;
  maintenanceSpend: number;
  riskExposure: number;
  propertyHealthScore: number;
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalMortgage: number;
  equityValue: number;
  ltv: number;
  arrearsTotal: number;
}

export interface PortfolioSegment {
  label: string;
  range: string;
  propertyCount: number;
  totalValue: number;
  avgYield: number;
  avgHealth: number;
}

export interface PropertyBreakdown {
  id: string;
  address: string;
  city: string;
  postcode: string;
  bedrooms: number;
  currentValue: number;
  purchasePrice: number;
  monthlyRent: number;
  yieldPercent: number;
  mortgageAmount: number;
  equityValue: number;
  healthScore: number;
  complianceScore: number;
  maintenanceScore: number;
  rentScore: number;
  inspectionScore: number;
  healthLevel: string;
  status: string;
}

export interface ReportMetric {
  period: string;
  rentCollected: number;
  rentDue: number;
  collectionRate: number;
  maintenanceSpend: number;
  newArrears: number;
  arrearsResolved: number;
  complianceScore: number;
  healthScore: number;
}

export const investorKPIs: InvestorKPI = {
  portfolioValue: 915000,
  monthlyRentIncome: 12350,
  annualYield: 5.8,
  complianceHealth: 79,
  maintenanceSpend: 4850,
  riskExposure: 34,
  propertyHealthScore: 81,
  totalProperties: 12,
  occupiedProperties: 10,
  vacantProperties: 2,
  totalMortgage: 610000,
  equityValue: 305000,
  ltv: 66.7,
  arrearsTotal: 1850,
};

export const portfolioSegments: PortfolioSegment[] = [
  { label: "Starter", range: "1-9 properties", propertyCount: 0, totalValue: 0, avgYield: 0, avgHealth: 0 },
  { label: "Growing", range: "10-24 properties", propertyCount: 8, totalValue: 915000, avgYield: 5.8, avgHealth: 81 },
  { label: "Established", range: "25-49 properties", propertyCount: 0, totalValue: 0, avgYield: 0, avgHealth: 0 },
  { label: "Portfolio", range: "50-99 properties", propertyCount: 0, totalValue: 0, avgYield: 0, avgHealth: 0 },
  { label: "Institutional", range: "100+ properties", propertyCount: 0, totalValue: 0, avgYield: 0, avgHealth: 0 },
];

export const propertyBreakdownData: PropertyBreakdown[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    address: "12 Rose Avenue",
    city: "Manchester",
    postcode: "M20 3AF",
    bedrooms: 3,
    currentValue: 220000,
    purchasePrice: 185000,
    monthlyRent: 1200,
    yieldPercent: 6.5,
    mortgageAmount: 140000,
    equityValue: 80000,
    healthScore: 79,
    complianceScore: 82,
    maintenanceScore: 75,
    rentScore: 72,
    inspectionScore: 78,
    healthLevel: "attention_needed",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    address: "45 Park Lane",
    city: "Birmingham",
    postcode: "B1 2JP",
    bedrooms: 2,
    currentValue: 175000,
    purchasePrice: 155000,
    monthlyRent: 950,
    yieldPercent: 6.5,
    mortgageAmount: 120000,
    equityValue: 55000,
    healthScore: 58,
    complianceScore: 62,
    maintenanceScore: 55,
    rentScore: 52,
    inspectionScore: 56,
    healthLevel: "high_risk",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    address: "1A Buckingham Gate",
    city: "London",
    postcode: "SW1A 1AA",
    bedrooms: 1,
    currentValue: 520000,
    purchasePrice: 450000,
    monthlyRent: 2200,
    yieldPercent: 5.1,
    mortgageAmount: 350000,
    equityValue: 170000,
    healthScore: 88,
    complianceScore: 92,
    maintenanceScore: 85,
    rentScore: 82,
    inspectionScore: 88,
    healthLevel: "good",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000006",
    address: "78 Chapel Street",
    city: "Manchester",
    postcode: "M3 3WB",
    bedrooms: 2,
    currentValue: 190000,
    purchasePrice: 165000,
    monthlyRent: 1050,
    yieldPercent: 6.6,
    mortgageAmount: 130000,
    equityValue: 60000,
    healthScore: 91,
    complianceScore: 94,
    maintenanceScore: 88,
    rentScore: 86,
    inspectionScore: 90,
    healthLevel: "excellent",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000010",
    address: "22 Bridge Street",
    city: "Leeds",
    postcode: "LS1 8EQ",
    bedrooms: 2,
    currentValue: 155000,
    purchasePrice: 135000,
    monthlyRent: 850,
    yieldPercent: 6.6,
    mortgageAmount: 105000,
    equityValue: 50000,
    healthScore: 83,
    complianceScore: 86,
    maintenanceScore: 80,
    rentScore: 78,
    inspectionScore: 82,
    healthLevel: "good",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000011",
    address: "56 Harehills Lane",
    city: "Leeds",
    postcode: "LS8 2HU",
    bedrooms: 3,
    currentValue: 140000,
    purchasePrice: 120000,
    monthlyRent: 800,
    yieldPercent: 6.9,
    mortgageAmount: 95000,
    equityValue: 45000,
    healthScore: 90,
    complianceScore: 93,
    maintenanceScore: 87,
    rentScore: 85,
    inspectionScore: 89,
    healthLevel: "excellent",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000009",
    address: "3 Harbourside Walk",
    city: "Bristol",
    postcode: "BS1 5TY",
    bedrooms: 1,
    currentValue: 210000,
    purchasePrice: 185000,
    monthlyRent: 1100,
    yieldPercent: 6.3,
    mortgageAmount: 145000,
    equityValue: 65000,
    healthScore: 85,
    complianceScore: 88,
    maintenanceScore: 82,
    rentScore: 80,
    inspectionScore: 84,
    healthLevel: "good",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000008",
    address: "91 Clifton Road",
    city: "Bristol",
    postcode: "BS8 3BJ",
    bedrooms: 3,
    currentValue: 280000,
    purchasePrice: 240000,
    monthlyRent: 1400,
    yieldPercent: 6.0,
    mortgageAmount: 190000,
    equityValue: 90000,
    healthScore: 72,
    complianceScore: 75,
    maintenanceScore: 68,
    rentScore: 66,
    inspectionScore: 70,
    healthLevel: "attention_needed",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000007",
    address: "27 Edgbaston Road",
    city: "Birmingham",
    postcode: "B15 3DH",
    bedrooms: 4,
    currentValue: 320000,
    purchasePrice: 275000,
    monthlyRent: 1600,
    yieldPercent: 6.0,
    mortgageAmount: 210000,
    equityValue: 110000,
    healthScore: 78,
    complianceScore: 82,
    maintenanceScore: 75,
    rentScore: 74,
    inspectionScore: 76,
    healthLevel: "attention_needed",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000005",
    address: "14 Camden High Street",
    city: "London",
    postcode: "NW1 7JE",
    bedrooms: 2,
    currentValue: 480000,
    purchasePrice: 410000,
    monthlyRent: 2100,
    yieldPercent: 5.3,
    mortgageAmount: 310000,
    equityValue: 170000,
    healthScore: 94,
    complianceScore: 98,
    maintenanceScore: 90,
    rentScore: 91,
    inspectionScore: 93,
    healthLevel: "excellent",
    status: "Occupied",
  },
  {
    id: "d0000000-0000-0000-0000-000000000004",
    address: "8 Chelsea Manor Street",
    city: "London",
    postcode: "SW3 4AA",
    bedrooms: 3,
    currentValue: 650000,
    purchasePrice: 550000,
    monthlyRent: 2800,
    yieldPercent: 5.2,
    mortgageAmount: 420000,
    equityValue: 230000,
    healthScore: 76,
    complianceScore: 80,
    maintenanceScore: 72,
    rentScore: 70,
    inspectionScore: 75,
    healthLevel: "attention_needed",
    status: "Vacant",
  },
  {
    id: "d0000000-0000-0000-0000-000000000012",
    address: "32 Canary Wharf Tower",
    city: "London",
    postcode: "E14 4QS",
    bedrooms: 2,
    currentValue: 550000,
    purchasePrice: 470000,
    monthlyRent: 2400,
    yieldPercent: 5.2,
    mortgageAmount: 370000,
    equityValue: 180000,
    healthScore: 82,
    complianceScore: 85,
    maintenanceScore: 80,
    rentScore: 78,
    inspectionScore: 80,
    healthLevel: "good",
    status: "Occupied",
  },
];

export const monthlyReports: ReportMetric[] = [
  { period: "Jan 2026", rentCollected: 11850, rentDue: 12350, collectionRate: 96.0, maintenanceSpend: 320, newArrears: 450, arrearsResolved: 380, complianceScore: 76, healthScore: 79 },
  { period: "Feb 2026", rentCollected: 12000, rentDue: 12350, collectionRate: 97.2, maintenanceSpend: 580, newArrears: 300, arrearsResolved: 450, complianceScore: 77, healthScore: 80 },
  { period: "Mar 2026", rentCollected: 12100, rentDue: 12350, collectionRate: 98.0, maintenanceSpend: 210, newArrears: 250, arrearsResolved: 300, complianceScore: 78, healthScore: 80 },
  { period: "Apr 2026", rentCollected: 12350, rentDue: 12350, collectionRate: 100.0, maintenanceSpend: 450, newArrears: 0, arrearsResolved: 250, complianceScore: 78, healthScore: 81 },
  { period: "May 2026", rentCollected: 11900, rentDue: 12350, collectionRate: 96.4, maintenanceSpend: 920, newArrears: 450, arrearsResolved: 0, complianceScore: 79, healthScore: 81 },
  { period: "Jun 2026", rentCollected: 12200, rentDue: 12350, collectionRate: 98.8, maintenanceSpend: 350, newArrears: 150, arrearsResolved: 450, complianceScore: 79, healthScore: 81 },
];

export const quarterlyReports: ReportMetric[] = [
  { period: "Q1 2025", rentCollected: 34800, rentDue: 36000, collectionRate: 96.7, maintenanceSpend: 1420, newArrears: 1200, arrearsResolved: 950, complianceScore: 74, healthScore: 77 },
  { period: "Q2 2025", rentCollected: 35600, rentDue: 36600, collectionRate: 97.3, maintenanceSpend: 1680, newArrears: 900, arrearsResolved: 1100, complianceScore: 75, healthScore: 78 },
  { period: "Q3 2025", rentCollected: 36000, rentDue: 36900, collectionRate: 97.6, maintenanceSpend: 1350, newArrears: 850, arrearsResolved: 900, complianceScore: 76, healthScore: 79 },
  { period: "Q4 2025", rentCollected: 35800, rentDue: 36900, collectionRate: 97.0, maintenanceSpend: 1580, newArrears: 1000, arrearsResolved: 850, complianceScore: 77, healthScore: 80 },
  { period: "Q1 2026", rentCollected: 35950, rentDue: 37050, collectionRate: 97.0, maintenanceSpend: 1110, newArrears: 1000, arrearsResolved: 1130, complianceScore: 78, healthScore: 80 },
  { period: "Q2 2026", rentCollected: 36450, rentDue: 37050, collectionRate: 98.4, maintenanceSpend: 1720, newArrears: 600, arrearsResolved: 700, complianceScore: 79, healthScore: 81 },
];

export const annualReports: ReportMetric[] = [
  { period: "2023", rentCollected: 128400, rentDue: 135000, collectionRate: 95.1, maintenanceSpend: 8200, newArrears: 5200, arrearsResolved: 4800, complianceScore: 70, healthScore: 73 },
  { period: "2024", rentCollected: 136800, rentDue: 142000, collectionRate: 96.3, maintenanceSpend: 6900, newArrears: 4200, arrearsResolved: 4500, complianceScore: 74, healthScore: 77 },
  { period: "2025", rentCollected: 142200, rentDue: 146400, collectionRate: 97.1, maintenanceSpend: 6030, newArrears: 3950, arrearsResolved: 3800, complianceScore: 76, healthScore: 79 },
  { period: "2026 (YTD)", rentCollected: 72400, rentDue: 74100, collectionRate: 97.7, maintenanceSpend: 2830, newArrears: 1600, arrearsResolved: 1830, complianceScore: 79, healthScore: 81 },
];

export const riskIndicators = [
  { label: "High-Risk Properties", value: 1, total: 12, icon: "ri-error-warning-line", color: "#EF4444" },
  { label: "Active Arrears", value: 1, total: 10, icon: "ri-money-pound-circle-line", color: "#F59E0B" },
  { label: "EPC Below C", value: 0, total: 12, icon: "ri-lightbulb-line", color: "#F59E0B" },
  { label: "Expiring Compliance", value: 2, total: 12, icon: "ri-calendar-close-line", color: "#F59E0B" },
  { label: "Vacant Units", value: 2, total: 12, icon: "ri-home-4-line", color: "#F59E0B" },
  { label: "Maintenance Overdue", value: 3, total: 12, icon: "ri-tools-line", color: "#EF4444" },
];

export const healthDistribution = {
  excellent: 3,
  good: 4,
  attention_needed: 4,
  high_risk: 1,
};

export async function fetchInvestorData() {
  try {
    const { data: properties } = await supabase.from("properties").select("id, city, postcode, bedrooms, epc_rating, is_hmo");
    const { data: financials } = await supabase.from("property_financials").select("property_id, current_value, purchase_price, mortgage_amount, mortgage_rate");
    const { data: healthScores } = await supabase.from("property_health_scores").select("property_id, overall_score, compliance_score, maintenance_score, tenancy_score, rent_score, inspection_score, health_level");
    const { data: arrears } = await supabase.from("arrears_cases").select("total_owed, status");
    const { data: rents } = await supabase.from("rent_payments").select("amount, status");

    let totalValue = 0;
    let totalMortgage = 0;
    let totalRent = 0;
    let avgHealth = 0;
    let avgCompliance = 0;
    let arrearsTotal = 0;

    if (financials) {
      totalValue = financials.reduce((s, f) => s + Number(f.current_value || 0), 0);
      totalMortgage = financials.reduce((s, f) => s + Number(f.mortgage_amount || 0), 0);
    }

    if (healthScores && healthScores.length > 0) {
      avgHealth = Math.round(healthScores.reduce((s, h) => s + (h.overall_score || 0), 0) / healthScores.length);
      avgCompliance = Math.round(healthScores.reduce((s, h) => s + (h.compliance_score || 0), 0) / healthScores.length);
    }

    if (arrears) {
      arrearsTotal = arrears.filter((a) => a.status === "active").reduce((s, a) => s + Number(a.total_owed || 0), 0);
    }

    if (rents) {
      totalRent = rents.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.amount || 0), 0);
    }

    return {
      totalValue,
      totalMortgage,
      totalRent,
      avgHealth,
      avgCompliance,
      arrearsTotal,
      propertyCount: properties?.length || 0,
    };
  } catch {
    return null;
  }
}