export interface AIAgent {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: "running" | "idle" | "error";
  lastRun: string;
  recordsProcessed: number;
  category: "compliance" | "operations" | "communication" | "risk" | "admin";
}

export interface TodaysWorkItem {
  message: string;
  icon: string;
  urgency: "critical" | "warning" | "info";
  count: number;
  linkLabel: string;
  linkHref: string;
}

export interface TodaysWorkSummary {
  title: string;
  items: TodaysWorkItem[];
  generatedAt: string;
}

export const agents: AIAgent[] = [
  {
    id: "compliance-monitor",
    name: "Compliance Monitor",
    icon: "ri-shield-check-line",
    description: "Monitors all compliance obligations across the portfolio. Tracks certificates, registrations, licences, and sends expiry alerts 60 days in advance.",
    status: "running",
    lastRun: "2 minutes ago",
    recordsProcessed: 1247,
    category: "compliance",
  },
  {
    id: "inspection-workflow",
    name: "Inspection Workflow",
    icon: "ri-clipboard-line",
    description: "Schedules inspections, assigns inspectors, tracks completion, and flags overdue visits. Manages check-in, check-out, and mid-term inspections.",
    status: "idle",
    lastRun: "45 minutes ago",
    recordsProcessed: 892,
    category: "operations",
  },
  {
    id: "photo-evidence",
    name: "Photo Evidence",
    icon: "ri-camera-line",
    description: "Analyses inspection photos for damage, cleanliness issues, and wear-and-tear. Auto-generates photo reports with timestamped evidence.",
    status: "running",
    lastRun: "8 minutes ago",
    recordsProcessed: 3412,
    category: "operations",
  },
  {
    id: "voice-note",
    name: "Voice Note",
    icon: "ri-mic-line",
    description: "Transcribes tenant and inspector voice notes into structured maintenance tickets and inspection reports. Supports 12 languages.",
    status: "idle",
    lastRun: "3 hours ago",
    recordsProcessed: 567,
    category: "operations",
  },
  {
    id: "hazard-detection",
    name: "Hazard Detection",
    icon: "ri-error-warning-line",
    description: "Scans inspection reports, photos, and tenant messages for safety hazards. Flags mould, trip hazards, exposed wiring, and structural concerns.",
    status: "running",
    lastRun: "15 minutes ago",
    recordsProcessed: 923,
    category: "risk",
  },
  {
    id: "maintenance-ticket",
    name: "Maintenance Ticket",
    icon: "ri-tools-line",
    description: "Auto-generates maintenance tickets from triaged issues. Assigns to contractors, tracks SLAs, and escalates overdue jobs.",
    status: "running",
    lastRun: "Just now",
    recordsProcessed: 2156,
    category: "operations",
  },
  {
    id: "compliance-score",
    name: "Compliance Score",
    icon: "ri-bar-chart-box-line",
    description: "Calculates real-time compliance scores per property and portfolio-wide. Factors in certificates, safety checks, and regulatory requirements.",
    status: "idle",
    lastRun: "1 hour ago",
    recordsProcessed: 3890,
    category: "compliance",
  },
  {
    id: "reminder-agent",
    name: "Reminder Agent",
    icon: "ri-notification-3-line",
    description: "Sends automated reminders for rent due, inspections, certificate renewals, and contract end dates. Multi-channel: email, push, SMS-ready.",
    status: "running",
    lastRun: "5 minutes ago",
    recordsProcessed: 4621,
    category: "operations",
  },
  {
    id: "report-builder",
    name: "Report Builder",
    icon: "ri-file-chart-line",
    description: "Auto-generates monthly owner reports, quarterly portfolio reviews, and annual compliance summaries. Pulls from live data across all modules.",
    status: "idle",
    lastRun: "12 hours ago",
    recordsProcessed: 234,
    category: "admin",
  },
  {
    id: "document-verification",
    name: "Document Verification",
    icon: "ri-file-check-line",
    description: "Verifies uploaded documents for completeness and validity. Checks expiry dates, signatures, and required fields on certificates and agreements.",
    status: "error",
    lastRun: "22 minutes ago",
    recordsProcessed: 1456,
    category: "compliance",
  },
  {
    id: "draft-recovery",
    name: "Draft Recovery",
    icon: "ri-file-reduce-line",
    description: "Recovers abandoned drafts of tenancy agreements, notices, and compliance documents. Prompts users to complete or discard.",
    status: "idle",
    lastRun: "6 hours ago",
    recordsProcessed: 178,
    category: "admin",
  },
  {
    id: "portfolio-risk",
    name: "Portfolio Risk",
    icon: "ri-shield-flash-line",
    description: "Analyses portfolio-wide risk exposure: arrears concentration, compliance gaps, single-point-of-failure properties, and geographic risk.",
    status: "running",
    lastRun: "12 minutes ago",
    recordsProcessed: 3102,
    category: "risk",
  },
  {
    id: "tenant-communication",
    name: "Tenant Communication",
    icon: "ri-message-3-line",
    description: "Drafts tenant messages for rent reminders, inspection notices, maintenance updates, and policy changes. Tracks read receipts.",
    status: "idle",
    lastRun: "30 minutes ago",
    recordsProcessed: 876,
    category: "communication",
  },
  {
    id: "landlord-update",
    name: "Landlord Update",
    icon: "ri-user-star-line",
    description: "Prepares landlord update summaries: rent collected, maintenance status, compliance standing, and upcoming events. Sent weekly or on-demand.",
    status: "idle",
    lastRun: "4 hours ago",
    recordsProcessed: 654,
    category: "communication",
  },
  {
    id: "admin-oversight",
    name: "Admin Oversight",
    icon: "ri-admin-line",
    description: "Monitors system health: user activity, data completeness, integration status, and audit trail. Flags anomalies and data gaps.",
    status: "running",
    lastRun: "1 minute ago",
    recordsProcessed: 5230,
    category: "admin",
  },
];

export const todaysWork: TodaysWorkSummary = {
  title: "Today's Work — 27 June 2026",
  generatedAt: "08:42",
  items: [
    {
      message: "Three inspections are overdue.",
      icon: "ri-clipboard-line",
      urgency: "critical",
      count: 3,
      linkLabel: "View inspections",
      linkHref: "/dashboard/inspections",
    },
    {
      message: "Two gas safety certificates expire this week.",
      icon: "ri-shield-check-line",
      urgency: "critical",
      count: 2,
      linkLabel: "View compliance",
      linkHref: "/dashboard/compliance",
    },
    {
      message: "Four maintenance jobs have been open over 14 days.",
      icon: "ri-tools-line",
      urgency: "warning",
      count: 4,
      linkLabel: "View maintenance",
      linkHref: "/dashboard/maintenance",
    },
    {
      message: "One landlord is awaiting quote approval for a roof repair.",
      icon: "ri-file-list-3-line",
      urgency: "warning",
      count: 1,
      linkLabel: "View quotes",
      linkHref: "/dashboard/quotes",
    },
    {
      message: "Two EPC certificates expire within 30 days.",
      icon: "ri-flashlight-line",
      urgency: "warning",
      count: 2,
      linkLabel: "View compliance timeline",
      linkHref: "/dashboard/compliance-timeline",
    },
    {
      message: "Five tenants have unread maintenance update messages.",
      icon: "ri-message-3-line",
      urgency: "info",
      count: 5,
      linkLabel: "View communications",
      linkHref: "/dashboard/messages",
    },
    {
      message: "One landlord has not been updated on their property in 3 weeks.",
      icon: "ri-user-star-line",
      urgency: "info",
      count: 1,
      linkLabel: "View landlords",
      linkHref: "/dashboard/landlords",
    },
    {
      message: "Three tenancy agreements are due for renewal next month.",
      icon: "ri-file-text-line",
      urgency: "info",
      count: 3,
      linkLabel: "View tenancies",
      linkHref: "/dashboard/tenancies",
    },
  ],
};

export function getAgentSummary() {
  const total = agents.length;
  const running = agents.filter(a => a.status === "running").length;
  const idle = agents.filter(a => a.status === "idle").length;
  const error = agents.filter(a => a.status === "error").length;
  const totalRecords = agents.reduce((sum, a) => sum + a.recordsProcessed, 0);
  return { total, running, idle, error, totalRecords };
}

export function getAgentsByCategory() {
  const categories: Record<string, AIAgent[]> = {};
  agents.forEach(a => {
    if (!categories[a.category]) categories[a.category] = [];
    categories[a.category].push(a);
  });
  return categories;
}

export const categoryMeta: Record<string, { label: string; icon: string; color: string }> = {
  compliance: { label: "Compliance", icon: "ri-shield-check-line", color: "bg-[#C28A78] text-white" },
  operations: { label: "Operations", icon: "ri-settings-3-line", color: "bg-[#3B82F6] text-white" },
  communication: { label: "Communication", icon: "ri-message-3-line", color: "bg-[#8B5CF6] text-white" },
  risk: { label: "Risk", icon: "ri-shield-flash-line", color: "bg-[#F59E0B] text-white" },
  admin: { label: "Admin", icon: "ri-admin-line", color: "bg-[#64748B] text-white" },
};

export const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  running: { label: "Running", color: "text-[#10B981]", bg: "bg-[#10B981]/10", dot: "bg-[#10B981]" },
  idle: { label: "Idle", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", dot: "bg-[#94A3B8]" },
  error: { label: "Error", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", dot: "bg-[#EF4444]" },
};