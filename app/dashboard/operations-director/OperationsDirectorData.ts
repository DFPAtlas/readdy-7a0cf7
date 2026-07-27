export interface DailyBriefingItem {
  id: string;
  category: "inspection" | "compliance" | "maintenance" | "quote" | "arrears" | "vacancy" | "risk";
  title: string;
  detail: string;
  urgency: "critical" | "high" | "medium" | "low";
  property: string;
  action: string;
  actionHref: string;
}

export interface Recommendation {
  rank: number;
  title: string;
  description: string;
  impact: "critical" | "high" | "medium" | "low";
  category: string;
  metric: string;
  action: string;
  actionHref: string;
  estimatedValue: string;
}

export interface OperationsKPI {
  label: string;
  value: number;
  max: number;
  trend: "up" | "down" | "stable";
  trendValue: string;
  subMetrics: { label: string; value: number; max: number }[];
  icon: string;
  color: string;
}

export const dailyBriefing: DailyBriefingItem[] = [
  {
    id: "insp-1",
    category: "inspection",
    title: "Gas Safety Inspection Due",
    detail: "CP12 certificate expires in 3 days at 45 Park Lane. No contractor assigned yet.",
    urgency: "critical",
    property: "45 Park Lane, Birmingham",
    action: "Assign Contractor",
    actionHref: "/dashboard/inspections",
  },
  {
    id: "insp-2",
    category: "inspection",
    title: "Quarterly HMO Inspection Due",
    detail: "Mandatory HMO inspection overdue by 5 days for 27 Edgbaston Road.",
    urgency: "critical",
    property: "27 Edgbaston Road, Birmingham",
    action: "Schedule Now",
    actionHref: "/dashboard/inspections",
  },
  {
    id: "insp-3",
    category: "inspection",
    title: "Move-Out Inspection Required",
    detail: "Tenant vacating 8 Chelsea Manor Street in 12 days. Pre-inspection needed.",
    urgency: "high",
    property: "8 Chelsea Manor Street, London",
    action: "Book Inspection",
    actionHref: "/dashboard/inspections",
  },
  {
    id: "insp-4",
    category: "inspection",
    title: "Routine Property Check Due",
    detail: "6-month check due at 14 Camden High Street. Last inspected 7 months ago.",
    urgency: "medium",
    property: "14 Camden High Street, London",
    action: "Schedule Check",
    actionHref: "/dashboard/inspections",
  },
  {
    id: "comp-1",
    category: "compliance",
    title: "EICR Certificate Expiring",
    detail: "Electrical safety certificate expired Dec 2025. Legal requirement unmet.",
    urgency: "critical",
    property: "45 Park Lane, Birmingham",
    action: "Book EICR",
    actionHref: "/dashboard/compliance",
  },
  {
    id: "comp-2",
    category: "compliance",
    title: "Gas Safety Certificate Expiring",
    detail: "CP12 expires 1st July 2026. 4 days remaining to comply.",
    urgency: "critical",
    property: "12 Rose Avenue, Manchester",
    action: "Book CP12",
    actionHref: "/dashboard/compliance",
  },
  {
    id: "maint-1",
    category: "maintenance",
    title: "Boiler Repair — 9 Days Open",
    detail: "Tenant reported no heating. Quote received £480, awaiting landlord approval.",
    urgency: "high",
    property: "91 Clifton Road, Bristol",
    action: "Chase Landlord",
    actionHref: "/dashboard/maintenance",
  },
  {
    id: "maint-2",
    category: "maintenance",
    title: "Roof Leak — 14 Days Open",
    detail: "Water ingress reported in top-floor flat. Contractor visit scheduled but not confirmed.",
    urgency: "high",
    property: "1A Buckingham Gate, London",
    action: "Confirm Contractor",
    actionHref: "/dashboard/maintenance",
  },
  {
    id: "maint-3",
    category: "maintenance",
    title: "Damp Issue — 6 Days Open",
    detail: "Rising damp in ground floor. Surveyor report pending.",
    urgency: "medium",
    property: "78 Chapel Street, Manchester",
    action: "Chase Surveyor",
    actionHref: "/dashboard/maintenance",
  },
  {
    id: "quote-1",
    category: "quote",
    title: "Landlord Awaiting Quote Approval",
    detail: "Boiler replacement quote £2,150 sent 4 days ago. No response from landlord.",
    urgency: "high",
    property: "91 Clifton Road, Bristol",
    action: "Send Reminder",
    actionHref: "/dashboard/quotes",
  },
  {
    id: "arrears-1",
    category: "arrears",
    title: "Tenant 32 Days in Arrears",
    detail: "£950 owed. Payment plan proposed but not signed. Section 8 grounds forming.",
    urgency: "high",
    property: "22 Bridge Street, Leeds",
    action: "Issue Notice",
    actionHref: "/dashboard/arrears",
  },
  {
    id: "arrears-2",
    category: "arrears",
    title: "Tenant 18 Days Late",
    detail: "£450 shortfall this month. Previous payment history good — possible one-off.",
    urgency: "medium",
    property: "56 Harehills Lane, Leeds",
    action: "Send Reminder",
    actionHref: "/dashboard/arrears",
  },
  {
    id: "risk-1",
    category: "risk",
    title: "Property Health Score Dropped",
    detail: "45 Park Lane fell from 62 to 58. Now classified High Risk. Compliance and maintenance failing.",
    urgency: "critical",
    property: "45 Park Lane, Birmingham",
    action: "View Report",
    actionHref: "/dashboard/risk-centre",
  },
  {
    id: "risk-2",
    category: "risk",
    title: "EPC Rating Below Legal Minimum",
    detail: "Rating D — below minimum C requirement for new tenancies. Upgrade needed before re-let.",
    urgency: "high",
    property: "8 Chelsea Manor Street, London",
    action: "Arrange EPC",
    actionHref: "/dashboard/compliance",
  },
];

export const top10Recommendations: Recommendation[] = [
  {
    rank: 1,
    title: "Fix 45 Park Lane Compliance Failures",
    description: "This property has an expired EICR, expiring gas cert, and a health score of 58. It is your highest legal risk. Two certificates could result in fines up to £30,000 each.",
    impact: "critical",
    category: "Compliance",
    metric: "Legal risk: £60,000+ potential fines",
    action: "Book Both Certificates",
    actionHref: "/dashboard/compliance",
    estimatedValue: "Avoids £60k fines",
  },
  {
    rank: 2,
    title: "Resolve Boiler Issue at 91 Clifton Road",
    description: "Tenant without heating for 9 days. Quote received, landlord unresponsive. This is a Section 11 landlord repair obligation. Escalate today.",
    impact: "critical",
    category: "Maintenance",
    metric: "Tenant satisfaction at risk. Possible compensation claim.",
    action: "Call Landlord Now",
    actionHref: "/dashboard/maintenance",
    estimatedValue: "Saves £1,500+ in potential compensation",
  },
  {
    rank: 3,
    title: "Process Section 8 for 22 Bridge Street",
    description: "Tenant 32 days in arrears with unsigned payment plan. Grounds exist for possession. Send formal notice before arrears exceed 2 months.",
    impact: "high",
    category: "Arrears",
    metric: "£950 owed, growing at £850/month",
    action: "Issue Section 8",
    actionHref: "/dashboard/arrears",
    estimatedValue: "Recovers £950 + prevents £850/month loss",
  },
  {
    rank: 4,
    title: "Book CP12 for 12 Rose Avenue",
    description: "Gas safety certificate expires in 4 days. No certificate means no legal right to rent the property. Book immediately to avoid compliance gap.",
    impact: "high",
    category: "Compliance",
    metric: "4 days until non-compliant",
    action: "Book CP12",
    actionHref: "/dashboard/compliance",
    estimatedValue: "Maintains legal rental status",
  },
  {
    rank: 5,
    title: "Complete HMO Inspection at 27 Edgbaston Road",
    description: "Mandatory HMO inspection 5 days overdue. Council can issue improvement notices or fines. This is your only HMO — protect the licence.",
    impact: "high",
    category: "Inspection",
    metric: "HMO licence at risk",
    action: "Schedule Inspection",
    actionHref: "/dashboard/inspections",
    estimatedValue: "Protects HMO licence",
  },
  {
    rank: 6,
    title: "Fill Vacancy at 8 Chelsea Manor Street",
    description: "Property vacant. £2,800/month lost. EPC rating needs upgrade before marketing. Combined cost of vacancy + compliance work building daily.",
    impact: "high",
    category: "Vacancy",
    metric: "£2,800/month revenue lost",
    action: "Arrange EPC + Market",
    actionHref: "/dashboard/property/d0000000-0000-0000-0000-000000000004",
    estimatedValue: "Recovers £2,800/month",
  },
  {
    rank: 7,
    title: "Confirm Roof Repair Contractor",
    description: "Leak at Buckingham Gate property open 14 days. Water damage worsens daily. Contractor identified but not confirmed. Confirm today before further damage.",
    impact: "high",
    category: "Maintenance",
    metric: "Escalating repair costs daily",
    action: "Confirm Contractor",
    actionHref: "/dashboard/maintenance",
    estimatedValue: "Limits repair cost to £3,200 (vs £6k+ if delayed)",
  },
  {
    rank: 8,
    title: "Chase Landlord on Boiler Replacement Quote",
    description: "£2,150 quote sent 4 days ago — unapproved. Without approval, job stalls. Tenant frustration growing. Send follow-up with deadline.",
    impact: "medium",
    category: "Quote Approval",
    metric: "4 days waiting on approval",
    action: "Send Reminder",
    actionHref: "/dashboard/quotes",
    estimatedValue: "Unblocks £2,150 job",
  },
  {
    rank: 9,
    title: "Send Rent Reminder to 56 Harehills Lane",
    description: "£450 shortfall — likely one-off given good history. A simple reminder may resolve without escalation. Avoid unnecessary arrears case creation.",
    impact: "medium",
    category: "Rent Collection",
    metric: "£450 to recover",
    action: "Send Reminder",
    actionHref: "/dashboard/rent-collection",
    estimatedValue: "Recovers £450 without legal costs",
  },
  {
    rank: 10,
    title: "Review Portfolio Health — 4 Properties Need Attention",
    description: "Four properties rated 'Needs Attention' and one 'High Risk.' Schedule a portfolio review to create remediation plans before conditions worsen.",
    impact: "medium",
    category: "Portfolio Management",
    metric: "5 of 12 properties below 'Good'",
    action: "Open Portfolio Consultant",
    actionHref: "/dashboard/portfolio-consultant",
    estimatedValue: "Protects £950k portfolio value",
  },
];

export const operationsKPIs: OperationsKPI[] = [
  {
    label: "Portfolio Health",
    value: 81,
    max: 100,
    trend: "up",
    trendValue: "+2 pts this quarter",
    subMetrics: [
      { label: "Excellent", value: 3, max: 12 },
      { label: "Good", value: 4, max: 12 },
      { label: "Needs Attention", value: 4, max: 12 },
      { label: "High Risk", value: 1, max: 12 },
    ],
    icon: "ri-heart-pulse-line",
    color: "#10B981",
  },
  {
    label: "Compliance Health",
    value: 85,
    max: 100,
    trend: "up",
    trendValue: "+3 pts this quarter",
    subMetrics: [
      { label: "Fully Compliant", value: 8, max: 12 },
      { label: "Expiring Soon", value: 2, max: 12 },
      { label: "Overdue", value: 2, max: 12 },
    ],
    icon: "ri-shield-check-line",
    color: "#3B82F6",
  },
  {
    label: "Rent Health",
    value: 76,
    max: 100,
    trend: "stable",
    trendValue: "No change",
    subMetrics: [
      { label: "Collection Rate", value: 98, max: 100 },
      { label: "On-Time Payment", value: 8, max: 10 },
      { label: "Active Arrears", value: 2, max: 10 },
    ],
    icon: "ri-coins-line",
    color: "#8B5CF6",
  },
  {
    label: "Maintenance Health",
    value: 78,
    max: 100,
    trend: "down",
    trendValue: "-2 pts this month",
    subMetrics: [
      { label: "Open Jobs", value: 8, max: 12 },
      { label: "Overdue", value: 3, max: 12 },
      { label: "Avg Response", value: 48, max: 100 },
    ],
    icon: "ri-tools-line",
    color: "#F59E0B",
  },
  {
    label: "Agency Growth",
    value: 72,
    max: 100,
    trend: "up",
    trendValue: "+5 pts this quarter",
    subMetrics: [
      { label: "Portfolio Value", value: 915, max: 1000 },
      { label: "Occupancy", value: 83, max: 100 },
      { label: "New Instructions", value: 2, max: 10 },
    ],
    icon: "ri-line-chart-line",
    color: "#10B981",
  },
];

export const todaySummary = {
  date: new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  totalActions: 14,
  criticalCount: dailyBriefing.filter((b) => b.urgency === "critical").length,
  highCount: dailyBriefing.filter((b) => b.urgency === "high").length,
  mediumCount: dailyBriefing.filter((b) => b.urgency === "medium").length,
  estimatedRevenueAtRisk: 69450,
  propertiesAffected: 8,
};

export const weeklyTrend = [
  { day: "Mon", actions: 12, completed: 8 },
  { day: "Tue", actions: 15, completed: 11 },
  { day: "Wed", actions: 14, completed: 9 },
  { day: "Thu", actions: 18, completed: 13 },
  { day: "Fri", actions: 14, completed: 0 },
  { day: "Sat", actions: 6, completed: 0 },
  { day: "Sun", actions: 3, completed: 0 },
];