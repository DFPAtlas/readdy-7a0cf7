export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
  sortOrder: number;
}

export const PROPERTY_STATUS: Record<string, StatusConfig> = {
  occupied: { label: "Occupied", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-home-4-line", sortOrder: 1 },
  vacant: { label: "Vacant", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-home-4-line", sortOrder: 2 },
  notice: { label: "Notice", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-alert-line", sortOrder: 3 },
  under_offer: { label: "Under Offer", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-file-text-line", sortOrder: 4 },
};

export const RENT_STATUS: Record<string, StatusConfig> = {
  paid: { label: "Paid", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", sortOrder: 1 },
  due: { label: "Due Soon", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-time-line", sortOrder: 2 },
  overdue: { label: "Overdue", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-error-warning-line", sortOrder: 3 },
  in_arrears: { label: "In Arrears", color: "#DC2626", bg: "bg-[#DC2626]/10", icon: "ri-alarm-warning-line", sortOrder: 4 },
  pending: { label: "Pending", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-hourglass-line", sortOrder: 5 },
};

export const MAINTENANCE_STATUS: Record<string, StatusConfig> = {
  reported: { label: "Reported", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line", sortOrder: 1 },
  triaged: { label: "Triaged", color: "#8B5CF6", bg: "bg-[#8B5CF6]/10", icon: "ri-search-eye-line", sortOrder: 2 },
  quoted: { label: "Quoted", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-file-list-3-line", sortOrder: 3 },
  in_progress: { label: "In Progress", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-tools-line", sortOrder: 4 },
  completed: { label: "Completed", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-check-line", sortOrder: 5 },
  cancelled: { label: "Cancelled", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-close-circle-line", sortOrder: 6 },
};

export const COMPLIANCE_STATUS: Record<string, StatusConfig> = {
  compliant: { label: "Compliant", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-shield-check-line", sortOrder: 1 },
  expiring: { label: "Expiring Soon", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-timer-line", sortOrder: 2 },
  expired: { label: "Expired", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-error-warning-line", sortOrder: 3 },
  missing: { label: "Missing", color: "#DC2626", bg: "bg-[#DC2626]/10", icon: "ri-close-circle-line", sortOrder: 4 },
  pending: { label: "Pending Review", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-hourglass-line", sortOrder: 5 },
};

export const INSPECTION_STATUS: Record<string, StatusConfig> = {
  scheduled: { label: "Scheduled", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-calendar-line", sortOrder: 1 },
  in_progress: { label: "In Progress", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-clipboard-line", sortOrder: 2 },
  completed: { label: "Completed", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", sortOrder: 3 },
  overdue: { label: "Overdue", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-error-warning-line", sortOrder: 4 },
  cancelled: { label: "Cancelled", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-close-circle-line", sortOrder: 5 },
};

export const DOCUMENT_STATUS: Record<string, StatusConfig> = {
  signed: { label: "Signed", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", sortOrder: 1 },
  pending: { label: "Awaiting Signature", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-pen-nib-line", sortOrder: 2 },
  expired: { label: "Expired", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-error-warning-line", sortOrder: 3 },
  draft: { label: "Draft", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-file-edit-line", sortOrder: 4 },
};

export const PORTAL_STATUS: Record<string, StatusConfig> = {
  active: { label: "Active", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-check-line", sortOrder: 1 },
  invited: { label: "Invited", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-mail-send-line", sortOrder: 2 },
  suspended: { label: "Suspended", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-pause-circle-line", sortOrder: 3 },
  expired: { label: "Expired", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-timer-line", sortOrder: 4 },
};

export const CONTRACTOR_STATUS: Record<string, StatusConfig> = {
  active: { label: "Active", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-check-line", sortOrder: 1 },
  pending: { label: "Pending Approval", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-hourglass-line", sortOrder: 2 },
  suspended: { label: "Suspended", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-pause-circle-line", sortOrder: 3 },
  archived: { label: "Archived", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-archive-line", sortOrder: 4 },
};

export const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#DC2626", bg: "bg-[#DC2626]/10", icon: "ri-alert-fill", sortOrder: 1 },
  high: { label: "High", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-arrow-up-circle-line", sortOrder: 2 },
  medium: { label: "Normal", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-subtract-line", sortOrder: 3 },
  low: { label: "Low", color: "#10B981", bg: "bg-[#10B981]/10", icon: "ri-arrow-down-circle-line", sortOrder: 4 },
};

export function getStatusConfig(statusMap: Record<string, StatusConfig>, key: string): StatusConfig {
  return statusMap[key] || { label: key, color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-question-line", sortOrder: 99 };
}

export function getPriorityConfig(key: string): StatusConfig {
  return PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
}