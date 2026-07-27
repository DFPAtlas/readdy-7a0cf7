export interface FinancialKPI {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  color: string;
  detail: string;
}

export interface PropertyYield {
  id: string;
  property: string;
  address: string;
  annualRent: number;
  maintenanceCost: number;
  complianceCost: number;
  managementFees: number;
  insuranceCost: number;
  voidCost: number;
  totalExpenses: number;
  netIncome: number;
  propertyValue: number;
  yield: number;
  occupancyRate: number;
  healthScore: number;
}

export interface OwnerStatement {
  id: string;
  ownerId: string;
  ownerName: string;
  propertyName: string;
  statementMonth: string;
  statementYear: string;
  rentReceived: number;
  rentOutstanding: number;
  managementFees: number;
  maintenanceSpend: number;
  complianceCosts: number;
  insuranceCosts: number;
  otherFees: number;
  totalDeductions: number;
  netOwnerPayment: number;
  openingBalance: number;
  closingBalance: number;
  status: "draft" | "ready" | "sent" | "paid";
  generatedAt: string;
  sentAt: string | null;
  pdfUrl: string | null;
}

export interface OpenBankingProvider {
  id: string;
  name: string;
  logo: string;
  region: string;
  category: string;
  status: "connected" | "available" | "coming_soon";
  apiType: "open_banking" | "payment_initiation" | "data_enrichment";
  supportedBanks: number;
  description: string;
}

export const financialKPIs: FinancialKPI[] = [
  {
    label: "Rent Received (Jun)",
    value: "£16,800",
    change: "+3.2%",
    changeType: "up",
    icon: "ri-money-pound-circle-line",
    color: "bg-[#10B981]",
    detail: "8 of 8 properties",
  },
  {
    label: "Outstanding Rent",
    value: "£3,600",
    change: "-1.8%",
    changeType: "down",
    icon: "ri-alarm-warning-line",
    color: "bg-[#EF4444]",
    detail: "2 tenants",
  },
  {
    label: "Total Arrears",
    value: "£21,950",
    change: "+5.4%",
    changeType: "up",
    icon: "ri-error-warning-line",
    color: "bg-[#F59E0B]",
    detail: "8 cases",
  },
  {
    label: "Owner Payments",
    value: "£41,200",
    change: "+2.8%",
    changeType: "up",
    icon: "ri-user-star-line",
    color: "bg-[#3B82F6]",
    detail: "Paid to 6 landlords",
  },
  {
    label: "Maintenance Spend",
    value: "£3,850",
    change: "+12.5%",
    changeType: "up",
    icon: "ri-tools-line",
    color: "bg-[#EC4899]",
    detail: "14 jobs this month",
  },
  {
    label: "Agency Net Revenue",
    value: "£8,240",
    change: "+4.7%",
    changeType: "up",
    icon: "ri-bar-chart-2-line",
    color: "bg-[#C28A78]",
    detail: "Management fees",
  },
];

export const propertyYields: PropertyYield[] = [
  {
    id: "py1",
    property: "12 Rose Avenue",
    address: "12 Rose Avenue, Manchester M3",
    annualRent: 19800,
    maintenanceCost: 1850,
    complianceCost: 850,
    managementFees: 1980,
    insuranceCost: 420,
    voidCost: 0,
    totalExpenses: 5100,
    netIncome: 14700,
    propertyValue: 280000,
    yield: 5.25,
    occupancyRate: 100,
    healthScore: 78,
  },
  {
    id: "py2",
    property: "45 Baker Street",
    address: "45 Baker Street, Bristol BS1",
    annualRent: 25200,
    maintenanceCost: 2340,
    complianceCost: 950,
    managementFees: 2520,
    insuranceCost: 520,
    voidCost: 0,
    totalExpenses: 6330,
    netIncome: 18870,
    propertyValue: 420000,
    yield: 4.49,
    occupancyRate: 100,
    healthScore: 82,
  },
  {
    id: "py3",
    property: "Flat 4B Oak Street",
    address: "4B Oak Street, London NW1",
    annualRent: 11400,
    maintenanceCost: 980,
    complianceCost: 720,
    managementFees: 1140,
    insuranceCost: 380,
    voidCost: 0,
    totalExpenses: 3220,
    netIncome: 8180,
    propertyValue: 190000,
    yield: 4.31,
    occupancyRate: 100,
    healthScore: 86,
  },
  {
    id: "py4",
    property: "8 The Crescent",
    address: "8 The Crescent, Birmingham B2",
    annualRent: 19800,
    maintenanceCost: 2200,
    complianceCost: 900,
    managementFees: 1980,
    insuranceCost: 480,
    voidCost: 0,
    totalExpenses: 5560,
    netIncome: 14240,
    propertyValue: 310000,
    yield: 4.59,
    occupancyRate: 100,
    healthScore: 68,
  },
  {
    id: "py5",
    property: "34 Maple Gardens",
    address: "34 Maple Gardens, London E2",
    annualRent: 28800,
    maintenanceCost: 1800,
    complianceCost: 1100,
    managementFees: 2880,
    insuranceCost: 650,
    voidCost: 2400,
    totalExpenses: 8830,
    netIncome: 19970,
    propertyValue: 520000,
    yield: 3.84,
    occupancyRate: 92,
    healthScore: 55,
  },
  {
    id: "py6",
    property: "Flat 7 Park View",
    address: "7 Park View, Leeds LS1",
    annualRent: 14400,
    maintenanceCost: 1450,
    complianceCost: 780,
    managementFees: 1440,
    insuranceCost: 350,
    voidCost: 0,
    totalExpenses: 4020,
    netIncome: 10380,
    propertyValue: 175000,
    yield: 5.93,
    occupancyRate: 100,
    healthScore: 42,
  },
  {
    id: "py7",
    property: "21 High Street",
    address: "21 High Street, York YO1",
    annualRent: 9600,
    maintenanceCost: 680,
    complianceCost: 600,
    managementFees: 960,
    insuranceCost: 290,
    voidCost: 0,
    totalExpenses: 2530,
    netIncome: 7070,
    propertyValue: 140000,
    yield: 5.05,
    occupancyRate: 100,
    healthScore: 62,
  },
  {
    id: "py8",
    property: "Unit 3 Riverside Court",
    address: "3 Riverside Court, Bristol BS1",
    annualRent: 16800,
    maintenanceCost: 1200,
    complianceCost: 820,
    managementFees: 1680,
    insuranceCost: 440,
    voidCost: 0,
    totalExpenses: 4140,
    netIncome: 12660,
    propertyValue: 230000,
    yield: 5.50,
    occupancyRate: 100,
    healthScore: 72,
  },
];

export const ownerStatements: OwnerStatement[] = [
  {
    id: "os1",
    ownerId: "owner-1",
    ownerName: "James Richardson",
    propertyName: "12 Rose Avenue & Unit 3 Riverside Court",
    statementMonth: "June",
    statementYear: "2026",
    rentReceived: 3250,
    rentOutstanding: 0,
    managementFees: 325,
    maintenanceSpend: 0,
    complianceCosts: 65,
    insuranceCosts: 95,
    otherFees: 0,
    totalDeductions: 485,
    netOwnerPayment: 2765,
    openingBalance: 0,
    closingBalance: 2765,
    status: "sent",
    generatedAt: "2026-07-01",
    sentAt: "2026-07-01",
    pdfUrl: null,
  },
  {
    id: "os2",
    ownerId: "owner-2",
    ownerName: "David Thompson",
    propertyName: "Flat 4B Oak Street & Flat 7 Park View",
    statementMonth: "June",
    statementYear: "2026",
    rentReceived: 2150,
    rentOutstanding: 1200,
    managementFees: 215,
    maintenanceSpend: 180,
    complianceCosts: 55,
    insuranceCosts: 80,
    otherFees: 0,
    totalDeductions: 530,
    netOwnerPayment: 1620,
    openingBalance: 0,
    closingBalance: 1620,
    status: "ready",
    generatedAt: "2026-06-30",
    sentAt: null,
    pdfUrl: null,
  },
  {
    id: "os3",
    ownerId: "owner-3",
    ownerName: "Sarah Walker",
    propertyName: "45 Baker Street & 34 Maple Gardens",
    statementMonth: "June",
    statementYear: "2026",
    rentReceived: 4500,
    rentOutstanding: 2100,
    managementFees: 450,
    maintenanceSpend: 520,
    complianceCosts: 90,
    insuranceCosts: 120,
    otherFees: 0,
    totalDeductions: 1180,
    netOwnerPayment: 3320,
    openingBalance: 0,
    closingBalance: 3320,
    status: "draft",
    generatedAt: "2026-07-01",
    sentAt: null,
    pdfUrl: null,
  },
  {
    id: "os4",
    ownerId: "owner-4",
    ownerName: "Margaret Hughes",
    propertyName: "8 The Crescent",
    statementMonth: "June",
    statementYear: "2026",
    rentReceived: 1650,
    rentOutstanding: 1650,
    managementFees: 165,
    maintenanceSpend: 0,
    complianceCosts: 45,
    insuranceCosts: 55,
    otherFees: 0,
    totalDeductions: 265,
    netOwnerPayment: 1385,
    openingBalance: 0,
    closingBalance: 1385,
    status: "draft",
    generatedAt: "2026-06-28",
    sentAt: null,
    pdfUrl: null,
  },
  {
    id: "os5",
    ownerId: "owner-5",
    ownerName: "Robert Stewart",
    propertyName: "21 High Street",
    statementMonth: "June",
    statementYear: "2026",
    rentReceived: 800,
    rentOutstanding: 800,
    managementFees: 80,
    maintenanceSpend: 0,
    complianceCosts: 35,
    insuranceCosts: 40,
    otherFees: 0,
    totalDeductions: 155,
    netOwnerPayment: 645,
    openingBalance: 0,
    closingBalance: 645,
    status: "draft",
    generatedAt: "2026-07-01",
    sentAt: null,
    pdfUrl: null,
  },
  {
    id: "os6",
    ownerId: "owner-1",
    ownerName: "James Richardson",
    propertyName: "12 Rose Avenue & Unit 3 Riverside Court",
    statementMonth: "May",
    statementYear: "2026",
    rentReceived: 3250,
    rentOutstanding: 0,
    managementFees: 325,
    maintenanceSpend: 450,
    complianceCosts: 65,
    insuranceCosts: 95,
    otherFees: 0,
    totalDeductions: 935,
    netOwnerPayment: 2315,
    openingBalance: 0,
    closingBalance: 2315,
    status: "paid",
    generatedAt: "2026-06-01",
    sentAt: "2026-06-01",
    pdfUrl: null,
  },
];

export const openBankingProviders: OpenBankingProvider[] = [
  {
    id: "obp1",
    name: "Plaid",
    logo: "ri-bank-card-line",
    region: "UK, EU, US",
    category: "Account Information",
    status: "available",
    apiType: "open_banking",
    supportedBanks: 12000,
    description: "Connect bank accounts, verify balances, and pull transaction data automatically. The industry standard for open banking connectivity.",
  },
  {
    id: "obp2",
    name: "TrueLayer",
    logo: "ri-shield-line",
    region: "UK, EU, AU",
    category: "Payment Initiation",
    status: "available",
    apiType: "payment_initiation",
    supportedBanks: 2500,
    description: "FCA-regulated open banking provider. Specialises in payment initiation and account verification with strong UK bank coverage.",
  },
  {
    id: "obp3",
    name: "Yapily",
    logo: "ri-link",
    region: "UK, EU",
    category: "Data & Payments",
    status: "available",
    apiType: "open_banking",
    supportedBanks: 2000,
    description: "Pan-European open banking API. Strong coverage across UK and EU banks with both data and payment capabilities.",
  },
  {
    id: "obp4",
    name: "GoCardless (Open Banking)",
    logo: "ri-bank-line",
    region: "UK, EU",
    category: "Direct Debit & Open Banking",
    status: "available",
    apiType: "payment_initiation",
    supportedBanks: 3000,
    description: "Combine direct debit with open banking payments. Ideal for recurring rent collection with instant bank-to-bank payments.",
  },
  {
    id: "obp5",
    name: "Tink",
    logo: "ri-database-2-line",
    region: "EU, UK",
    category: "Data Enrichment",
    status: "coming_soon",
    apiType: "data_enrichment",
    supportedBanks: 3400,
    description: "European open banking platform with advanced transaction categorisation and financial insights. Expanding to UK market.",
  },
  {
    id: "obp6",
    name: "Token.io",
    logo: "ri-key-2-line",
    region: "UK, EU",
    category: "Payment Initiation",
    status: "coming_soon",
    apiType: "payment_initiation",
    supportedBanks: 2000,
    description: "Open banking payment and data platform. Strong A2A (account-to-account) payment capabilities for instant rent collection.",
  },
];

export const monthlyCashflowData = [
  { month: "Jan", rentReceived: 18200, ownerPayouts: 14800, maintenance: 3200, netRevenue: 1800 },
  { month: "Feb", rentReceived: 18500, ownerPayouts: 15100, maintenance: 2800, netRevenue: 2200 },
  { month: "Mar", rentReceived: 18100, ownerPayouts: 14700, maintenance: 3500, netRevenue: 1600 },
  { month: "Apr", rentReceived: 19200, ownerPayouts: 15600, maintenance: 3100, netRevenue: 2500 },
  { month: "May", rentReceived: 19500, ownerPayouts: 15800, maintenance: 3400, netRevenue: 2300 },
  { month: "Jun", rentReceived: 20100, ownerPayouts: 16300, maintenance: 3850, netRevenue: 2800 },
];

export const ownerPayoutBreakdown = [
  { owner: "James Richardson", properties: 2, totalRent: 3250, fees: 325, maintenance: 0, netPayout: 2765, status: "Paid" },
  { owner: "David Thompson", properties: 2, totalRent: 2150, fees: 215, maintenance: 180, netPayout: 1620, status: "Pending" },
  { owner: "Sarah Walker", properties: 2, totalRent: 4500, fees: 450, maintenance: 520, netPayout: 3320, status: "Processing" },
  { owner: "Margaret Hughes", properties: 1, totalRent: 1650, fees: 165, maintenance: 0, netPayout: 1385, status: "Due" },
  { owner: "Robert Stewart", properties: 1, totalRent: 800, fees: 80, maintenance: 0, netPayout: 645, status: "Due" },
  { owner: "Emma Wilson", properties: 2, totalRent: 3200, fees: 320, maintenance: 220, netPayout: 2660, status: "Paid" },
];