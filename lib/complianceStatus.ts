export type ComplianceStatusKey =
  | "critical"
  | "expired"
  | "missing"
  | "action_required"
  | "expiring_soon"
  | "scheduled"
  | "under_review"
  | "valid"
  | "not_applicable"
  | "unknown";

export interface ComplianceStatusConfig {
  key: ComplianceStatusKey;
  label: string;
  meaning: string;
  color: string;
  bg: string;
  icon: string;
  sortPriority: number;
  nextAction: string;
}

export const complianceStatuses: ComplianceStatusConfig[] = [
  {
    key: "critical",
    label: "Critical",
    meaning: "Immediate legal or safety risk",
    color: "text-[#C46868]",
    bg: "bg-[#C46868]",
    icon: "ri-error-warning-line",
    sortPriority: 0,
    nextAction: "Resolve immediately",
  },
  {
    key: "expired",
    label: "Expired",
    meaning: "Certificate has passed its expiry date",
    color: "text-[#C46868]",
    bg: "bg-[#C46868]",
    icon: "ri-close-circle-line",
    sortPriority: 1,
    nextAction: "Renew certificate",
  },
  {
    key: "missing",
    label: "Missing",
    meaning: "Required certificate not yet obtained",
    color: "text-[#C46868]",
    bg: "bg-[#C46868]",
    icon: "ri-file-unknow-line",
    sortPriority: 2,
    nextAction: "Upload or obtain certificate",
  },
  {
    key: "action_required",
    label: "Action Required",
    meaning: "Overdue check or observation needs attention",
    color: "text-[#C46868]",
    bg: "bg-[#C46868]",
    icon: "ri-alert-line",
    sortPriority: 3,
    nextAction: "Take action to resolve",
  },
  {
    key: "expiring_soon",
    label: "Expiring Soon",
    meaning: "Due within 30 days",
    color: "text-[#D4A85C]",
    bg: "bg-[#D4A85C]",
    icon: "ri-time-line",
    sortPriority: 4,
    nextAction: "Schedule renewal",
  },
  {
    key: "scheduled",
    label: "Scheduled",
    meaning: "Renewal or inspection is booked",
    color: "text-[#8A9FB0]",
    bg: "bg-[#8A9FB0]",
    icon: "ri-calendar-check-line",
    sortPriority: 5,
    nextAction: "Monitor progress",
  },
  {
    key: "under_review",
    label: "Under Review",
    meaning: "Awaiting verification or approval",
    color: "text-[#8A9FB0]",
    bg: "bg-[#8A9FB0]",
    icon: "ri-eye-line",
    sortPriority: 6,
    nextAction: "Await review completion",
  },
  {
    key: "valid",
    label: "Valid",
    meaning: "Current and compliant",
    color: "text-[#7A9A7E]",
    bg: "bg-[#7A9A7E]",
    icon: "ri-check-line",
    sortPriority: 7,
    nextAction: "No action needed",
  },
  {
    key: "not_applicable",
    label: "N/A",
    meaning: "Not required for this property",
    color: "text-[#94A3B8]",
    bg: "bg-[#94A3B8]",
    icon: "ri-subtract-line",
    sortPriority: 8,
    nextAction: "No action needed",
  },
  {
    key: "unknown",
    label: "Unknown",
    meaning: "Status cannot be determined",
    color: "text-[#94A3B8]",
    bg: "bg-[#94A3B8]",
    icon: "ri-question-line",
    sortPriority: 9,
    nextAction: "Investigate requirement",
  },
];

export function getComplianceStatus(key: ComplianceStatusKey): ComplianceStatusConfig {
  return complianceStatuses.find((s) => s.key === key) || complianceStatuses[9];
}

export const complianceStatusMap: Record<string, ComplianceStatusKey> = {
  "Valid": "valid",
  "Expiring Soon": "expiring_soon",
  "Expired": "expired",
  "Action Required": "action_required",
  "N/A": "not_applicable",
  "Critical": "critical",
  "Missing": "missing",
  "Scheduled": "scheduled",
  "Under Review": "under_review",
};

export function getStatusBadgeClasses(key: ComplianceStatusKey): string {
  const s = getComplianceStatus(key);
  return `${s.color} bg-[${s.bg.replace("bg-", "")}]/10`;
}

export type DocumentStatusKey =
  | "awaiting_upload"
  | "uploaded"
  | "under_review"
  | "accepted"
  | "rejected"
  | "superseded"
  | "expired";

export interface DocumentStatusConfig {
  key: DocumentStatusKey;
  label: string;
  meaning: string;
  color: string;
  bg: string;
  icon: string;
}

export const documentStatuses: DocumentStatusConfig[] = [
  {
    key: "awaiting_upload",
    label: "Awaiting Upload",
    meaning: "No document has been uploaded yet",
    color: "text-[#94A3B8]",
    bg: "bg-[#94A3B8]",
    icon: "ri-upload-cloud-line",
  },
  {
    key: "uploaded",
    label: "Uploaded",
    meaning: "Document uploaded, pending review",
    color: "text-[#8A9FB0]",
    bg: "bg-[#8A9FB0]",
    icon: "ri-file-text-line",
  },
  {
    key: "under_review",
    label: "Under Review",
    meaning: "Being verified by authorised staff",
    color: "text-[#D4A85C]",
    bg: "bg-[#D4A85C]",
    icon: "ri-eye-line",
  },
  {
    key: "accepted",
    label: "Accepted",
    meaning: "Verified and accepted as valid",
    color: "text-[#7A9A7E]",
    bg: "bg-[#7A9A7E]",
    icon: "ri-check-double-line",
  },
  {
    key: "rejected",
    label: "Rejected",
    meaning: "Reviewed and rejected — needs replacement",
    color: "text-[#C46868]",
    bg: "bg-[#C46868]",
    icon: "ri-close-circle-line",
  },
  {
    key: "superseded",
    label: "Superseded",
    meaning: "Replaced by a newer document",
    color: "text-[#94A3B8]",
    bg: "bg-[#94A3B8]",
    icon: "ri-arrow-go-back-line",
  },
  {
    key: "expired",
    label: "Expired",
    meaning: "Document validity period has passed",
    color: "text-[#C46868]",
    bg: "bg-[#C46868]",
    icon: "ri-time-line",
  },
];

export const LEGAL_DISCLAIMER = "LetHub helps organise compliance information and deadlines. Requirements can vary by property and circumstances. Confirm important decisions with a qualified professional or the relevant authority.";

export const DEFAULT_REMINDER_WINDOWS = [90, 60, 30, 14, 7];

export type ComplianceActionItem = {
  id: string;
  priority: "critical" | "warning" | "info";
  title: string;
  property: string;
  requirementType: string;
  status: ComplianceStatusKey;
  deadline: string;
  responsiblePerson: string;
  actionLabel: string;
  propertyId: string;
};

export function getPriorityConfig(priority: "critical" | "warning" | "info") {
  const map = {
    critical: { color: "text-[#C46868]", bg: "bg-[#C46868]", border: "border-[#C46868]/20", pill: "bg-[#C46868]/10 text-[#C46868]", icon: "ri-error-warning-line" },
    warning: { color: "text-[#D4A85C]", bg: "bg-[#D4A85C]", border: "border-[#D4A85C]/20", pill: "bg-[#D4A85C]/10 text-[#D4A85C]", icon: "ri-time-line" },
    info: { color: "text-[#8A9FB0]", bg: "bg-[#8A9FB0]", border: "border-[#8A9FB0]/20", pill: "bg-[#8A9FB0]/10 text-[#8A9FB0]", icon: "ri-information-line" },
  };
  return map[priority];
}

export const requirementTypeIcons: Record<string, string> = {
  "Gas Safety Certificate": "ri-fire-line",
  "EICR Report": "ri-flashlight-line",
  "EPC Certificate": "ri-leaf-line",
  "Legionella Assessment": "ri-drop-line",
  "Smoke Alarm Check": "ri-alarm-warning-line",
  "Carbon Monoxide Check": "ri-sensor-line",
  "HMO Compliance": "ri-building-line",
  "Building Insurance": "ri-shield-check-line",
  "Fire Risk Assessment": "ri-fire-line",
};

export const requirementTypeColors: Record<string, string> = {
  "Gas Safety Certificate": "bg-[#C46868]",
  "EICR Report": "bg-[#D4A85C]",
  "EPC Certificate": "bg-[#7A9A7E]",
  "Legionella Assessment": "bg-[#8A9FB0]",
  "Smoke Alarm Check": "bg-[#C46868]",
  "Carbon Monoxide Check": "bg-[#C46868]",
  "HMO Compliance": "bg-[#8B5CF6]",
  "Building Insurance": "bg-[#8B5CF6]",
  "Fire Risk Assessment": "bg-[#C46868]",
};