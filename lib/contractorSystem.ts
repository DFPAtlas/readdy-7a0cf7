export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
  meaning: string;
  sortOrder: number;
}

export const CONTRACTOR_STATUS: Record<string, StatusConfig> = {
  under_review: { label: "Under Review", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-search-line", meaning: "Application being reviewed", sortOrder: 1 },
  approved: { label: "Approved", color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-check-line", meaning: "Approved for work", sortOrder: 2 },
  active: { label: "Active", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", meaning: "Actively working", sortOrder: 3 },
  unavailable: { label: "Unavailable", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-time-line", meaning: "Temporarily unavailable", sortOrder: 4 },
  documents_required: { label: "Documents Required", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-file-warning-line", meaning: "Missing required documents", sortOrder: 5 },
  suspended: { label: "Suspended", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-forbid-line", meaning: "Suspended from new work", sortOrder: 6 },
  archived: { label: "Archived", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-archive-line", meaning: "No longer in use", sortOrder: 7 },
};

export const QUOTE_STATUS: Record<string, StatusConfig> = {
  draft: { label: "Draft", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-draft-line", meaning: "Being prepared", sortOrder: 1 },
  requested: { label: "Requested", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-mail-send-line", meaning: "Quote requested from contractor", sortOrder: 2 },
  awaiting_response: { label: "Awaiting Response", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-time-line", meaning: "Waiting for contractor", sortOrder: 3 },
  submitted: { label: "Submitted", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-file-list-3-line", meaning: "Quote received", sortOrder: 4 },
  under_review: { label: "Under Review", color: "text-[#6366F1]", bg: "bg-[#6366F1]/10", icon: "ri-search-eye-line", meaning: "Being reviewed by agency", sortOrder: 5 },
  awaiting_approval: { label: "Awaiting Approval", color: "text-[#D4A85C]", bg: "bg-[#D4A85C]/10", icon: "ri-shield-check-line", meaning: "Awaiting landlord approval", sortOrder: 6 },
  approved: { label: "Approved", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", meaning: "Quote approved", sortOrder: 7 },
  rejected: { label: "Rejected", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-close-circle-line", meaning: "Quote rejected", sortOrder: 8 },
  withdrawn: { label: "Withdrawn", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-arrow-go-back-line", meaning: "Withdrawn by contractor", sortOrder: 9 },
  expired: { label: "Expired", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-timer-line", meaning: "Quote validity expired", sortOrder: 10 },
};

export const JOB_ASSIGNMENT_STATUS: Record<string, StatusConfig> = {
  unassigned: { label: "Unassigned", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-user-unfollow-line", meaning: "No contractor assigned", sortOrder: 1 },
  finding_contractor: { label: "Finding Contractor", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-user-search-line", meaning: "Searching for suitable contractor", sortOrder: 2 },
  offered: { label: "Offered", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-mail-send-line", meaning: "Job offered to contractor", sortOrder: 3 },
  accepted: { label: "Accepted", color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-check-line", meaning: "Contractor accepted", sortOrder: 4 },
  declined: { label: "Declined", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", icon: "ri-close-line", meaning: "Contractor declined", sortOrder: 5 },
  scheduled: { label: "Scheduled", color: "text-[#6366F1]", bg: "bg-[#6366F1]/10", icon: "ri-calendar-check-line", meaning: "Appointment scheduled", sortOrder: 6 },
  in_progress: { label: "In Progress", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line", meaning: "Work in progress", sortOrder: 7 },
  completion_submitted: { label: "Completion Submitted", color: "text-[#D4A85C]", bg: "bg-[#D4A85C]/10", icon: "ri-file-upload-line", meaning: "Awaiting agency review", sortOrder: 8 },
  completed: { label: "Completed", color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", meaning: "Work completed", sortOrder: 9 },
  cancelled: { label: "Cancelled", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-close-circle-line", meaning: "Job cancelled", sortOrder: 10 },
};

export function getStatusConfig(statusKey: string, statusMap: Record<string, StatusConfig>): StatusConfig {
  return statusMap[statusKey] || { label: statusKey || "Unknown", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-question-line", meaning: "", sortOrder: 99 };
}

export interface ContractorAction {
  id: string;
  contractorId: string;
  contractorName: string;
  trade: string;
  issue: string;
  deadline: string;
  priority: "critical" | "high" | "medium";
  actionLabel: string;
}

export const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", label: "Critical" },
  high: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", label: "High" },
  medium: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", label: "Medium" },
};

export function formatCurrency(value: number): string {
  return `£${value.toLocaleString()}`;
}

export function isExpiringSoon(expiryDate: string): boolean {
  if (!expiryDate || expiryDate === "—") return false;
  const exp = new Date(expiryDate);
  const now = new Date();
  const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays < 60;
}

export function isExpired(expiryDate: string): boolean {
  if (!expiryDate || expiryDate === "—") return false;
  return new Date(expiryDate) < new Date();
}