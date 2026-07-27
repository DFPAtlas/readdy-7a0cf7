export type AgentStatus =
  | "draft"
  | "ready"
  | "active"
  | "paused"
  | "running"
  | "awaiting_review"
  | "completed"
  | "completed_with_warnings"
  | "failed"
  | "disabled"
  | "configuration_required";

export type AgentApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";

export interface AgentStatusConfig {
  label: string;
  color: string;
  bg: string;
  dot: string;
  icon: string;
  meaning: string;
  allowedActions: string[];
  sortOrder: number;
}

export const AGENT_STATUS: Record<string, AgentStatusConfig> = {
  running: {
    label: "Running",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    dot: "bg-[#10B981]",
    icon: "ri-play-circle-line",
    meaning: "Agent is currently executing its workflow",
    allowedActions: ["pause", "view_logs"],
    sortOrder: 1,
  },
  idle: {
    label: "Idle",
    color: "text-[#94A3B8]",
    bg: "bg-[#94A3B8]/10",
    dot: "bg-[#94A3B8]",
    icon: "ri-pause-circle-line",
    meaning: "Agent is enabled but not currently running",
    allowedActions: ["run_now", "pause", "view_logs"],
    sortOrder: 2,
  },
  paused: {
    label: "Paused",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    dot: "bg-[#F59E0B]",
    icon: "ri-stop-circle-line",
    meaning: "Agent has been manually paused by a user",
    allowedActions: ["resume", "view_logs"],
    sortOrder: 3,
  },
  error: {
    label: "Error",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    dot: "bg-[#EF4444]",
    icon: "ri-error-warning-line",
    meaning: "Agent encountered an error during its last run",
    allowedActions: ["restart", "view_logs", "investigate"],
    sortOrder: 4,
  },
  disabled: {
    label: "Disabled",
    color: "text-[#78716C]",
    bg: "bg-[#78716C]/10",
    dot: "bg-[#78716C]",
    icon: "ri-forbid-line",
    meaning: "Agent has been disabled and will not run",
    allowedActions: ["enable", "view_logs"],
    sortOrder: 5,
  },
  draft: {
    label: "Draft",
    color: "text-[#64748B]",
    bg: "bg-[#64748B]/10",
    dot: "bg-[#64748B]",
    icon: "ri-draft-line",
    meaning: "Agent configuration has been started but not finalised",
    allowedActions: ["configure", "delete"],
    sortOrder: 6,
  },
  awaiting_review: {
    label: "Awaiting Review",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    dot: "bg-[#8B5CF6]",
    icon: "ri-eye-line",
    meaning: "Agent output requires human review before proceeding",
    allowedActions: ["review", "approve", "reject"],
    sortOrder: 7,
  },
  completed_with_warnings: {
    label: "Completed (Warnings)",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    dot: "bg-[#F59E0B]",
    icon: "ri-alert-line",
    meaning: "Agent completed but with non-critical warnings",
    allowedActions: ["review_warnings", "dismiss"],
    sortOrder: 8,
  },
  completed: {
    label: "Completed",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    dot: "bg-[#10B981]",
    icon: "ri-check-double-line",
    meaning: "Agent completed successfully with no issues",
    allowedActions: ["view_results"],
    sortOrder: 9,
  },
  configuration_required: {
    label: "Config Required",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    dot: "bg-[#3B82F6]",
    icon: "ri-settings-4-line",
    meaning: "Agent needs configuration before it can run",
    allowedActions: ["configure"],
    sortOrder: 10,
  },
};

export const AGENT_GROUP_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  compliance: { label: "Compliance", icon: "ri-shield-check-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/5" },
  maintenance: { label: "Maintenance", icon: "ri-tools-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5" },
  inspections: { label: "Inspections", icon: "ri-clipboard-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/5" },
  communications: { label: "Communications", icon: "ri-message-3-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5" },
  portfolio: { label: "Portfolio", icon: "ri-building-4-line", color: "text-[#10B981]", bg: "bg-[#10B981]/5" },
  reporting: { label: "Reporting", icon: "ri-file-chart-line", color: "text-[#EC4899]", bg: "bg-[#EC4899]/5" },
  administration: { label: "Administration", icon: "ri-admin-line", color: "text-[#64748B]", bg: "bg-[#64748B]/5" },
  operations: { label: "Operations", icon: "ri-settings-3-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5" },
  risk: { label: "Risk", icon: "ri-shield-flash-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5" },
  communication: { label: "Communication", icon: "ri-message-3-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/5" },
  admin: { label: "Admin", icon: "ri-admin-line", color: "text-[#64748B]", bg: "bg-[#64748B]/5" },
};

export const GROUP_ORDER = ["compliance", "maintenance", "inspections", "communications", "portfolio", "reporting", "administration"];

export function getAgentStatusConfig(status: string): AgentStatusConfig {
  return AGENT_STATUS[status] || AGENT_STATUS.idle;
}

export interface AIActionItem {
  id: string;
  agentName: string;
  issue: string;
  relatedRecord: string;
  time: string;
  urgency: "critical" | "warning" | "info";
  actionLabel: string;
  actionHref?: string;
}

export const URGENCY_CONFIG = {
  critical: { bg: "bg-[#EF4444]/5", border: "border-[#EF4444]/20", iconColor: "text-[#EF4444]", label: "Action needed", badge: "bg-[#EF4444]/10 text-[#EF4444]" },
  warning: { bg: "bg-[#F59E0B]/5", border: "border-[#F59E0B]/20", iconColor: "text-[#F59E0B]", label: "Attention", badge: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  info: { bg: "bg-[#3B82F6]/5", border: "border-[#3B82F6]/20", iconColor: "text-[#3B82F6]", label: "Info", badge: "bg-[#3B82F6]/10 text-[#3B82F6]" },
};

export const AI_SAFETY_NOTICE = "AI suggestions are advisory only. Important decisions — including expenditure, contractor selection, legal notices, compliance determinations, and record deletion — require human review and approval.";