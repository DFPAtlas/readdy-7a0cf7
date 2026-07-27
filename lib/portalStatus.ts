export interface PortalAccessStatus {
  key: string
  label: string
  meaning: string
  color: string
  bg: string
  icon: string
  sortPriority: number
  availableActions: string[]
}

export const portalAccessStatuses: Record<string, PortalAccessStatus> = {
  not_invited: {
    key: "not_invited",
    label: "Not Invited",
    meaning: "This person is eligible but no invitation has been sent",
    color: "text-[#94A3B8]",
    bg: "bg-[#94A3B8]/10",
    icon: "ri-user-add-line",
    sortPriority: 90,
    availableActions: ["Send invitation"],
  },
  invitation_sent: {
    key: "invitation_sent",
    label: "Invitation Sent",
    meaning: "Invitation email has been queued or sent but not yet delivered",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    icon: "ri-mail-send-line",
    sortPriority: 70,
    availableActions: ["Resend invitation", "Cancel invitation"],
  },
  invitation_delivered: {
    key: "invitation_delivered",
    label: "Invitation Delivered",
    meaning: "The invitation email was delivered to the recipient",
    color: "text-[#14B8A6]",
    bg: "bg-[#14B8A6]/10",
    icon: "ri-mail-check-line",
    sortPriority: 65,
    availableActions: ["Resend invitation", "Cancel invitation"],
  },
  invitation_opened: {
    key: "invitation_opened",
    label: "Invitation Opened",
    meaning: "The recipient has opened the invitation",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    icon: "ri-mail-open-line",
    sortPriority: 60,
    availableActions: ["Resend invitation"],
  },
  invitation_accepted: {
    key: "invitation_accepted",
    label: "Invitation Accepted",
    meaning: "The recipient accepted the invitation and created an account",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    icon: "ri-user-received-line",
    sortPriority: 55,
    availableActions: ["View access details"],
  },
  active: {
    key: "active",
    label: "Active",
    meaning: "Portal access is active and the user can sign in",
    color: "text-[#7A9A7E]",
    bg: "bg-[#7A9A7E]/10",
    icon: "ri-check-line",
    sortPriority: 10,
    availableActions: ["Suspend access", "Revoke access", "Resend welcome"],
  },
  expired: {
    key: "expired",
    label: "Expired",
    meaning: "The invitation has expired before being accepted",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    icon: "ri-timer-line",
    sortPriority: 30,
    availableActions: ["Resend invitation", "Revoke invitation"],
  },
  revoked: {
    key: "revoked",
    label: "Revoked",
    meaning: "Access has been permanently revoked by the agency",
    color: "text-[#687068]",
    bg: "bg-[#687068]/10",
    icon: "ri-forbid-line",
    sortPriority: 40,
    availableActions: ["Restore access"],
  },
  suspended: {
    key: "suspended",
    label: "Suspended",
    meaning: "Access has been temporarily suspended",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    icon: "ri-pause-circle-line",
    sortPriority: 20,
    availableActions: ["Restore access", "Revoke access"],
  },
  delivery_failed: {
    key: "delivery_failed",
    label: "Delivery Failed",
    meaning: "The invitation email could not be delivered",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    icon: "ri-mail-close-line",
    sortPriority: 5,
    availableActions: ["Resend invitation", "Verify email address"],
  },
  access_problem: {
    key: "access_problem",
    label: "Access Problem",
    meaning: "The user has reported a login or access issue",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    icon: "ri-alert-line",
    sortPriority: 15,
    availableActions: ["Investigate issue", "Reset access"],
  },
}

export function getPortalStatus(key: string): PortalAccessStatus {
  return portalAccessStatuses[key] || portalAccessStatuses.not_invited
}

export const portalTypeConfig: Record<string, { label: string; icon: string; color: string; bg: string; description: string }> = {
  owner: {
    label: "Landlord / Owner",
    icon: "ri-building-4-line",
    color: "text-[#C28A78]",
    bg: "bg-[#C28A78]/10",
    description: "Owners can view property summaries, rent statements, compliance, and approve maintenance quotes for their authorised properties.",
  },
  tenant: {
    label: "Tenant",
    icon: "ri-home-4-line",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    description: "Tenants can view rent payment history, report maintenance issues, access shared documents, and see upcoming inspection dates.",
  },
  contractor: {
    label: "Contractor",
    icon: "ri-tools-line",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    description: "Contractors can view assigned jobs, submit quotes, upload completion evidence, and manage their insurance and certification documents.",
  },
}

export interface PortalIssue {
  id: string
  portalType: string
  personName: string
  personEmail: string
  relatedRecord: string
  issue: string
  issueDate: string
  priority: "critical" | "high" | "medium"
  accessKey: string
  action: string
}

export const portalDisclaimer = "LetHub helps organise portal access information. Portal security relies on proper configuration and Supabase authentication. Review access settings regularly and contact your agency administrator for help."