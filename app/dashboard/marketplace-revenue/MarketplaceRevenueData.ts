export interface MarketplaceTransaction {
  id: string;
  property_id: string | null;
  contractor_id: string | null;
  service_type: string;
  value: number;
  status: string;
  transaction_type: string;
  referral_source: string | null;
  estimated_fee: number;
  actual_fee: number;
  completed_at: string | null;
  created_at: string;
}

export interface RevenueSummary {
  totalTransactions: number;
  jobsCompleted: number;
  quoteRequests: number;
  serviceRequests: number;
  referrals: number;
  completedValue: number;
  estimatedRevenue: number;
  actualRevenueEarned: number;
  pipelineValue: number;
  avgTransactionValue: number;
  conversionRate: number;
}

export const serviceTypeIconMap: Record<string, string> = {
  "Electrical": "ri-flashlight-line",
  "Plumbing": "ri-drop-line",
  "Gas Safety Check": "ri-fire-line",
  "Boiler Replacement": "ri-fire-line",
  "Boiler Repair": "ri-fire-line",
  "EICR Inspection": "ri-shield-flash-line",
  "Electrical Remedial": "ri-shield-flash-line",
  "Fire Safety": "ri-alarm-warning-line",
  "Fire Risk Assessment": "ri-alarm-warning-line",
  "Fire Door Install": "ri-alarm-warning-line",
  "Damp & Mould": "ri-contrast-drop-line",
  "EPC Certificate": "ri-file-chart-line",
  "EPC Renewal": "ri-file-chart-line",
  "Locksmith": "ri-key-2-line",
  "Cleaning": "ri-shining-line",
  "Decorating": "ri-paint-brush-line",
  "Inventory Check-out": "ri-clipboard-line",
  "Check-in Inventory": "ri-clipboard-line",
  "Mid-Term Inspection": "ri-calendar-check-line",
  "Roof Inspection": "ri-home-3-line",
  "Handyman Repair": "ri-tools-line",
  "Legionella Assessment": "ri-drop-line",
};

export const serviceTypeColorMap: Record<string, string> = {
  "Electrical": "#F59E0B",
  "Plumbing": "#3B82F6",
  "Gas Safety Check": "#EF4444",
  "Boiler Replacement": "#EF4444",
  "Boiler Repair": "#EF4444",
  "EICR Inspection": "#7C3AED",
  "Electrical Remedial": "#7C3AED",
  "Fire Safety": "#DC2626",
  "Fire Risk Assessment": "#DC2626",
  "Fire Door Install": "#DC2626",
  "Damp & Mould": "#0891B2",
  "EPC Certificate": "#0EA5E9",
  "EPC Renewal": "#0EA5E9",
  "Locksmith": "#6B7280",
  "Cleaning": "#22C55E",
  "Decorating": "#8B5CF6",
  "Inventory Check-out": "#6366F1",
  "Check-in Inventory": "#6366F1",
  "Mid-Term Inspection": "#6366F1",
  "Roof Inspection": "#D97706",
  "Handyman Repair": "#14B8A6",
  "Legionella Assessment": "#0891B2",
};

export const transactionTypeLabels: Record<string, string> = {
  "completed_job": "Completed Job",
  "quote_request": "Quote Request",
  "service_request": "Service Request",
  "referral": "Referral",
};

export const statusLabels: Record<string, string> = {
  "completed": "Completed",
  "approved": "Approved",
  "quoted": "Quoted",
  "requested": "Requested",
  "referred": "Referred",
};

export const referralSourceLabels: Record<string, string> = {
  "marketplace_search": "Marketplace Search",
  "direct_assign": "Direct Assign",
  "compliance_marketplace": "Compliance Marketplace",
  "inventory_marketplace": "Inventory Marketplace",
  "landlord_referral": "Landlord Referral",
  "tenant_referral": "Tenant Referral",
  "agent_referral": "Agent Referral",
};

export const revenueModels = [
  {
    key: "referral_fee",
    name: "Referral Fees",
    description: "Fee per successful contractor referral. Charged when a referred contractor completes their first job.",
    icon: "ri-user-shared-line",
    feeStructure: "5-10% of first job value",
    estimatedMonthly: "£120 - £350",
    status: "future" as const,
  },
  {
    key: "lead_fee",
    name: "Lead Generation Fees",
    description: "Fee charged to contractors for each qualified lead or service request they receive through the marketplace.",
    icon: "ri-user-search-line",
    feeStructure: "£5-15 per lead",
    estimatedMonthly: "£200 - £600",
    status: "future" as const,
  },
  {
    key: "featured_listing",
    name: "Featured Contractor Listings",
    description: "Premium placement in marketplace search results. Contractors pay monthly for top visibility.",
    icon: "ri-star-line",
    feeStructure: "£49-199/month per contractor",
    estimatedMonthly: "£500 - £1,500",
    status: "future" as const,
  },
  {
    key: "premium_account",
    name: "Premium Contractor Accounts",
    description: "Enhanced contractor profiles with priority support, analytics, and advanced booking features.",
    icon: "ri-vip-crown-line",
    feeStructure: "£29-99/month per contractor",
    estimatedMonthly: "£300 - £900",
    status: "future" as const,
  },
];

export const monthlyRevenueData = [
  { month: "Jan", completed: 4200, pipeline: 1100, estimatedFees: 420 },
  { month: "Feb", completed: 3800, pipeline: 950, estimatedFees: 380 },
  { month: "Mar", completed: 5100, pipeline: 1400, estimatedFees: 510 },
  { month: "Apr", completed: 4600, pipeline: 1200, estimatedFees: 460 },
  { month: "May", completed: 5800, pipeline: 1800, estimatedFees: 580 },
  { month: "Jun", completed: 7349, pipeline: 2410, estimatedFees: 735 },
];

export const propertyNames: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "14 Oak Avenue",
  "d0000000-0000-0000-0000-000000000002": "42 River Street",
  "d0000000-0000-0000-0000-000000000003": "7 Elm Road",
};

export const contractorNames: Record<string, string> = {
  "c0000000-0000-0000-0000-000000000002": "Bright Spark Electrical",
  "f0000000-0000-0000-0000-000000000001": "FastFix Property Services",
};