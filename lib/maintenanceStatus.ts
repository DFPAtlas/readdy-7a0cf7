export type MaintenanceStage =
  | "reported"
  | "triage"
  | "awaiting_approval"
  | "finding_contractor"
  | "quote_requested"
  | "quote_received"
  | "appointment_scheduled"
  | "in_progress"
  | "awaiting_confirmation"
  | "completed"
  | "closed"
  | "cancelled";

export interface MaintenanceStatusConfig {
  stage: MaintenanceStage;
  label: string;
  color: string;
  bg: string;
  icon: string;
  sortPriority: number;
  description: string;
  allowedNext: MaintenanceStage[];
  actorLabel: string;
}

export const MAINTENANCE_STATUSES: Record<MaintenanceStage, MaintenanceStatusConfig> = {
  reported: { stage: "reported", label: "Reported", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line", sortPriority: 1, description: "Issue reported, awaiting triage", allowedNext: ["triage"], actorLabel: "Agency" },
  triage: { stage: "triage", label: "Triage", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-search-line", sortPriority: 2, description: "Being assessed and classified", allowedNext: ["awaiting_approval", "finding_contractor", "quote_requested"], actorLabel: "Agency" },
  awaiting_approval: { stage: "awaiting_approval", label: "Awaiting Approval", color: "text-[#EC4899]", bg: "bg-[#EC4899]/10", icon: "ri-hourglass-line", sortPriority: 3, description: "Waiting for landlord/owner approval", allowedNext: ["finding_contractor", "quote_requested"], actorLabel: "Landlord" },
  finding_contractor: { stage: "finding_contractor", label: "Finding Contractor", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-user-search-line", sortPriority: 4, description: "Searching for suitable contractor", allowedNext: ["quote_requested"], actorLabel: "Agency" },
  quote_requested: { stage: "quote_requested", label: "Quote Requested", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-money-pound-circle-line", sortPriority: 5, description: "Quote requested from contractor", allowedNext: ["quote_received"], actorLabel: "Contractor" },
  quote_received: { stage: "quote_received", label: "Quote Received", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-file-list-3-line", sortPriority: 6, description: "Quote received, awaiting review", allowedNext: ["awaiting_approval", "appointment_scheduled", "finding_contractor"], actorLabel: "Agency" },
  appointment_scheduled: { stage: "appointment_scheduled", label: "Appointment Scheduled", color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-calendar-check-line", sortPriority: 7, description: "Contractor visit scheduled", allowedNext: ["in_progress"], actorLabel: "Contractor" },
  in_progress: { stage: "in_progress", label: "In Progress", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line", sortPriority: 8, description: "Work is being carried out", allowedNext: ["awaiting_confirmation", "completed"], actorLabel: "Contractor" },
  awaiting_confirmation: { stage: "awaiting_confirmation", label: "Awaiting Confirmation", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-question-answer-line", sortPriority: 9, description: "Waiting for tenant/landlord to confirm completion", allowedNext: ["completed", "in_progress"], actorLabel: "Tenant" },
  completed: { stage: "completed", label: "Completed", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", sortPriority: 10, description: "Work completed and confirmed", allowedNext: ["closed", "reported"], actorLabel: "Agency" },
  closed: { stage: "closed", label: "Closed", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-archive-line", sortPriority: 11, description: "Job archived", allowedNext: [], actorLabel: "Agency" },
  cancelled: { stage: "cancelled", label: "Cancelled", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-close-circle-line", sortPriority: 12, description: "Job cancelled", allowedNext: ["reported"], actorLabel: "Agency" },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; sortPriority: number }> = {
  Emergency: { label: "Emergency", color: "text-white", bg: "bg-[#EF4444]", sortPriority: 1 },
  Critical: { label: "Critical", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", sortPriority: 2 },
  High: { label: "High", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", sortPriority: 3 },
  Normal: { label: "Normal", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", sortPriority: 4 },
  Low: { label: "Low", color: "text-[#10B981]", bg: "bg-[#10B981]/10", sortPriority: 5 },
};

export function getStatusConfig(stage: string): MaintenanceStatusConfig {
  const found = MAINTENANCE_STATUSES[stage as MaintenanceStage];
  return found || MAINTENANCE_STATUSES.reported;
}

export function getPriorityConfig(priority: string) {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Normal;
}

export const VISIBLE_STAGES_FOR_TENANT: MaintenanceStage[] = [
  "reported", "triage", "quote_requested", "quote_received",
  "appointment_scheduled", "in_progress", "awaiting_confirmation", "completed",
];

export const VISIBLE_STAGES_FOR_LANDLORD: MaintenanceStage[] = [
  "awaiting_approval", "quote_requested", "quote_received",
  "appointment_scheduled", "in_progress", "awaiting_confirmation", "completed", "closed",
];

export const VISIBLE_STAGES_FOR_CONTRACTOR: MaintenanceStage[] = [
  "quote_requested", "quote_received", "appointment_scheduled",
  "in_progress", "awaiting_confirmation", "completed",
];

export const ATTENTION_STAGES: MaintenanceStage[] = [
  "reported", "triage", "awaiting_approval", "quote_received",
  "awaiting_confirmation",
];

export const URGENT_STAGES: MaintenanceStage[] = [
  "reported", "triage", "awaiting_approval",
];

export const NEXT_ACTION_LABELS: Partial<Record<MaintenanceStage, string>> = {
  reported: "Review and triage this report",
  triage: "Assign priority and category",
  awaiting_approval: "Landlord must approve before proceeding",
  finding_contractor: "Select and invite a contractor",
  quote_requested: "Waiting for contractor quote",
  quote_received: "Review quote and send for approval",
  appointment_scheduled: "Contractor visit confirmed",
  in_progress: "Work is underway",
  awaiting_confirmation: "Tenant must confirm job is complete",
  completed: "Job complete — close when ready",
};