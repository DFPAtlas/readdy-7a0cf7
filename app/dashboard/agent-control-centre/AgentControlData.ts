export interface ControlAgent {
  id: string;
  name: string;
  icon: string;
  description: string;
  group: "compliance" | "maintenance" | "inspections" | "communications" | "portfolio" | "reporting" | "administration";
  status: "running" | "idle" | "paused" | "error";
  lastRun: string;
  nextRun: string;
  errors: number;
  recordsProcessed: number;
  successRate: number;
  avgRunTime: string;
}

export interface AgentGroupMeta {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export interface DashboardStats {
  totalAgents: number;
  totalActionsToday: number;
  issuesPrevented: number;
  complianceEventsDetected: number;
  reportsGenerated: number;
  communicationsDrafted: number;
}

export const agentGroups: Record<string, AgentGroupMeta> = {
  compliance: { label: "Compliance", icon: "ri-shield-check-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/5", border: "border-[#C28A78]/20" },
  maintenance: { label: "Maintenance", icon: "ri-tools-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5", border: "border-[#3B82F6]/20" },
  inspections: { label: "Inspections", icon: "ri-clipboard-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/5", border: "border-[#8B5CF6]/20" },
  communications: { label: "Communications", icon: "ri-message-3-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5", border: "border-[#F59E0B]/20" },
  portfolio: { label: "Portfolio", icon: "ri-building-4-line", color: "text-[#10B981]", bg: "bg-[#10B981]/5", border: "border-[#10B981]/20" },
  reporting: { label: "Reporting", icon: "ri-file-chart-line", color: "text-[#EC4899]", bg: "bg-[#EC4899]/5", border: "border-[#EC4899]/20" },
  administration: { label: "Administration", icon: "ri-admin-line", color: "text-[#64748B]", bg: "bg-[#64748B]/5", border: "border-[#64748B]/20" },
};

export const agents: ControlAgent[] = [
  {
    id: "certificate-monitor",
    name: "Certificate Monitor",
    icon: "ri-shield-check-line",
    description: "Tracks all property certificates — gas safety, EICR, EPC, fire risk assessments, HMO licences. Flags expiring certificates 90, 60, and 30 days before expiry. Cross-references with local authority requirements.",
    group: "compliance",
    status: "running",
    lastRun: "3 minutes ago",
    nextRun: "In 57 minutes",
    errors: 0,
    recordsProcessed: 1247,
    successRate: 99.8,
    avgRunTime: "4.2s",
  },
  {
    id: "regulation-checker",
    name: "Regulation Checker",
    icon: "ri-scales-3-line",
    description: "Monitors regulatory changes across 374 UK local authorities. Updates obligation requirements when legislation changes. Flags properties that need new certificates due to regulatory updates.",
    group: "compliance",
    status: "idle",
    lastRun: "2 hours ago",
    nextRun: "In 10 hours",
    errors: 0,
    recordsProcessed: 8934,
    successRate: 100,
    avgRunTime: "12.8s",
  },
  {
    id: "compliance-scorer",
    name: "Compliance Scorer",
    icon: "ri-bar-chart-box-line",
    description: "Calculates real-time compliance scores per property and portfolio-wide. Weights obligations by severity and proximity to deadline. Generates risk heat maps for compliance gaps.",
    group: "compliance",
    status: "running",
    lastRun: "12 minutes ago",
    nextRun: "In 48 minutes",
    errors: 2,
    recordsProcessed: 3890,
    successRate: 97.5,
    avgRunTime: "6.1s",
  },
  {
    id: "maintenance-triage",
    name: "Maintenance Triage",
    icon: "ri-flashlight-line",
    description: "Analyses incoming maintenance reports using AI — photos, descriptions, voice notes. Predicts issue category, assigns priority, and recommends contractor type. Routes to appropriate workflow.",
    group: "maintenance",
    status: "running",
    lastRun: "Just now",
    nextRun: "Continuous",
    errors: 1,
    recordsProcessed: 2156,
    successRate: 98.2,
    avgRunTime: "2.3s",
  },
  {
    id: "contractor-matcher",
    name: "Contractor Matcher",
    icon: "ri-briefcase-line",
    description: "Matches maintenance jobs to available contractors by trade, location, rating, and response time. Considers contractor workload, SLA history, and property proximity.",
    group: "maintenance",
    status: "idle",
    lastRun: "45 minutes ago",
    nextRun: "In 15 minutes",
    errors: 0,
    recordsProcessed: 3421,
    successRate: 96.8,
    avgRunTime: "3.7s",
  },
  {
    id: "sla-enforcer",
    name: "SLA Enforcer",
    icon: "ri-timer-line",
    description: "Monitors maintenance job SLAs in real-time. Escalates overdue jobs through manager chain. Sends automated chaser messages to contractors at 24h, 48h, and 72h thresholds.",
    group: "maintenance",
    status: "running",
    lastRun: "1 minute ago",
    nextRun: "Continuous",
    errors: 0,
    recordsProcessed: 5678,
    successRate: 99.1,
    avgRunTime: "1.8s",
  },
  {
    id: "inspection-scheduler",
    name: "Inspection Scheduler",
    icon: "ri-calendar-schedule-line",
    description: "Auto-schedules inspections based on tenancy dates, compliance requirements, and property risk scores. Balances inspector workloads across geographic zones.",
    group: "inspections",
    status: "running",
    lastRun: "8 minutes ago",
    nextRun: "In 52 minutes",
    errors: 0,
    recordsProcessed: 1892,
    successRate: 99.4,
    avgRunTime: "5.3s",
  },
  {
    id: "photo-analyser",
    name: "Photo Analyser",
    icon: "ri-camera-line",
    description: "Analyses inspection photos for damage, cleanliness, damp, mould, and wear-and-tear. Compares against move-in baseline photos. Auto-generates timestamped evidence reports with severity ratings.",
    group: "inspections",
    status: "idle",
    lastRun: "3 hours ago",
    nextRun: "On-demand",
    errors: 3,
    recordsProcessed: 9412,
    successRate: 95.6,
    avgRunTime: "8.4s",
  },
  {
    id: "checkout-assistant",
    name: "Checkout Assistant",
    icon: "ri-logout-box-line",
    description: "Guides inspectors through digital check-out reports. Pre-populates rooms and inventory from move-in data. Highlights discrepancies and calculates deposit deduction recommendations.",
    group: "inspections",
    status: "paused",
    lastRun: "2 days ago",
    nextRun: "Paused",
    errors: 0,
    recordsProcessed: 723,
    successRate: 97.9,
    avgRunTime: "6.7s",
  },
  {
    id: "tenant-messenger",
    name: "Tenant Messenger",
    icon: "ri-message-3-line",
    description: "Drafts and sends automated tenant communications — rent reminders, inspection notices, maintenance updates, policy changes, and renewal offers. Tracks delivery, read status, and responses.",
    group: "communications",
    status: "running",
    lastRun: "5 minutes ago",
    nextRun: "In 25 minutes",
    errors: 0,
    recordsProcessed: 14876,
    successRate: 99.9,
    avgRunTime: "1.2s",
  },
  {
    id: "landlord-digest",
    name: "Landlord Digest",
    icon: "ri-user-star-line",
    description: "Prepares personalised landlord update summaries — rent collected, maintenance completed, compliance standing, upcoming events, and portfolio KPIs. Delivered weekly or triggered by significant events.",
    group: "communications",
    status: "idle",
    lastRun: "4 hours ago",
    nextRun: "In 20 hours",
    errors: 0,
    recordsProcessed: 654,
    successRate: 100,
    avgRunTime: "9.1s",
  },
  {
    id: "contractor-alerts",
    name: "Contractor Alerts",
    icon: "ri-notification-3-line",
    description: "Sends real-time job alerts to contractors via push, email, and SMS. Manages quote requests, job acceptances, and schedule confirmations. Tracks response times.",
    group: "communications",
    status: "running",
    lastRun: "2 minutes ago",
    nextRun: "Continuous",
    errors: 4,
    recordsProcessed: 8762,
    successRate: 97.3,
    avgRunTime: "0.9s",
  },
  {
    id: "portfolio-risk-analyser",
    name: "Portfolio Risk Analyser",
    icon: "ri-shield-flash-line",
    description: "Analyses portfolio-wide risk exposure — arrears concentration, compliance gaps, geographic clustering, single-point-of-failure properties, and tenant churn risk. Generates mitigation recommendations.",
    group: "portfolio",
    status: "running",
    lastRun: "15 minutes ago",
    nextRun: "In 45 minutes",
    errors: 0,
    recordsProcessed: 3102,
    successRate: 98.7,
    avgRunTime: "11.4s",
  },
  {
    id: "profitability-analyser",
    name: "Profitability Analyser",
    icon: "ri-coins-line",
    description: "Calculates property-level and portfolio-level profitability — gross yield, net yield, ROI, cash-on-cash return. Factors in rent, mortgage, maintenance, voids, and management costs.",
    group: "portfolio",
    status: "idle",
    lastRun: "6 hours ago",
    nextRun: "In 18 hours",
    errors: 1,
    recordsProcessed: 2340,
    successRate: 96.2,
    avgRunTime: "7.6s",
  },
  {
    id: "market-benchmarker",
    name: "Market Benchmarker",
    icon: "ri-line-chart-line",
    description: "Compares portfolio performance against local market benchmarks — rent levels, void periods, yield averages, arrears rates. Sources data from ONS, Rightmove, and Zoopla rental indices.",
    group: "portfolio",
    status: "idle",
    lastRun: "8 hours ago",
    nextRun: "In 16 hours",
    errors: 0,
    recordsProcessed: 450,
    successRate: 99.3,
    avgRunTime: "18.2s",
  },
  {
    id: "owner-report-generator",
    name: "Owner Report Generator",
    icon: "ri-file-chart-line",
    description: "Auto-generates monthly owner reports with financial summaries, maintenance logs, inspection outcomes, and compliance status. Customisable templates per owner preference.",
    group: "reporting",
    status: "idle",
    lastRun: "12 hours ago",
    nextRun: "In 12 hours",
    errors: 0,
    recordsProcessed: 234,
    successRate: 100,
    avgRunTime: "22.5s",
  },
  {
    id: "compliance-report-builder",
    name: "Compliance Report Builder",
    icon: "ri-file-check-line",
    description: "Generates quarterly compliance summaries for regulatory bodies and portfolio reviews. Includes certificate schedules, risk assessments, and remediation tracking.",
    group: "reporting",
    status: "paused",
    lastRun: "3 days ago",
    nextRun: "Paused",
    errors: 1,
    recordsProcessed: 156,
    successRate: 94.2,
    avgRunTime: "15.8s",
  },
  {
    id: "tax-document-prep",
    name: "Tax Document Prep",
    icon: "ri-bill-line",
    description: "Prepares end-of-year tax document packs for landlords — rent statements, expense breakdowns, mortgage interest certificates, and capital allowance schedules.",
    group: "reporting",
    status: "idle",
    lastRun: "1 week ago",
    nextRun: "In 3 days",
    errors: 0,
    recordsProcessed: 89,
    successRate: 100,
    avgRunTime: "28.3s",
  },
  {
    id: "data-integrity",
    name: "Data Integrity Agent",
    icon: "ri-database-2-line",
    description: "Scans all database tables for completeness, consistency, and anomalies. Flags missing data, duplicate records, expired documents, and orphaned references.",
    group: "administration",
    status: "running",
    lastRun: "10 minutes ago",
    nextRun: "In 50 minutes",
    errors: 0,
    recordsProcessed: 15230,
    successRate: 99.6,
    avgRunTime: "14.1s",
  },
  {
    id: "audit-trail-monitor",
    name: "Audit Trail Monitor",
    icon: "ri-file-search-line",
    description: "Monitors all platform activity for audit compliance. Tracks user actions, data changes, and access patterns. Generates weekly audit summaries and flags suspicious activity.",
    group: "administration",
    status: "running",
    lastRun: "1 minute ago",
    nextRun: "Continuous",
    errors: 0,
    recordsProcessed: 28934,
    successRate: 100,
    avgRunTime: "3.2s",
  },
  {
    id: "user-permission-auditor",
    name: "User Permission Auditor",
    icon: "ri-user-settings-line",
    description: "Reviews user permission assignments across the platform. Detects over-privileged accounts, unused access grants, and dormant users. Recommends permission tightening.",
    group: "administration",
    status: "idle",
    lastRun: "1 day ago",
    nextRun: "In 23 hours",
    errors: 0,
    recordsProcessed: 456,
    successRate: 100,
    avgRunTime: "5.7s",
  },
  {
    id: "backup-verifier",
    name: "Backup Verifier",
    icon: "ri-cloud-line",
    description: "Verifies database backup integrity daily. Confirms backup completeness, tests restoration capability, and monitors backup storage quotas. Alerts on backup failures.",
    group: "administration",
    status: "error",
    lastRun: "22 minutes ago",
    nextRun: "In 38 minutes",
    errors: 5,
    recordsProcessed: 780,
    successRate: 87.2,
    avgRunTime: "19.4s",
  },
];

export const dashboardStats: DashboardStats = {
  totalAgents: agents.length,
  totalActionsToday: 3847,
  issuesPrevented: 34,
  complianceEventsDetected: 12,
  reportsGenerated: 28,
  communicationsDrafted: 2156,
};

export const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string; actionLabel: string }> = {
  running: { label: "Running", color: "text-[#10B981]", bg: "bg-[#10B981]/10", dot: "bg-[#10B981]", actionLabel: "Pause" },
  idle: { label: "Idle", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", dot: "bg-[#94A3B8]", actionLabel: "Run Now" },
  paused: { label: "Paused", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", dot: "bg-[#F59E0B]", actionLabel: "Resume" },
  error: { label: "Error", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", dot: "bg-[#EF4444]", actionLabel: "Restart" },
};

export function getAgentsByGroup() {
  const groups: Record<string, ControlAgent[]> = {};
  agents.forEach(a => {
    if (!groups[a.group]) groups[a.group] = [];
    groups[a.group].push(a);
  });
  return groups;
}

export function getGroupSummary(group: string) {
  const groupAgents = agents.filter(a => a.group === group);
  const running = groupAgents.filter(a => a.status === "running").length;
  const errors = groupAgents.filter(a => a.status === "error").length;
  const totalRecords = groupAgents.reduce((sum, a) => sum + a.recordsProcessed, 0);
  return { count: groupAgents.length, running, errors, totalRecords };
}