export type DeliveryState =
  | "draft"
  | "scheduled"
  | "queued"
  | "provider_accepted"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "bounced"
  | "cancelled";

export type ConversationStatus =
  | "unassigned"
  | "assigned"
  | "awaiting_agency"
  | "awaiting_external"
  | "resolved"
  | "closed";

export type ParticipantType = "tenant" | "landlord" | "contractor" | "agency" | "system";

export type MessageContext =
  | "general"
  | "rent"
  | "maintenance"
  | "inspection"
  | "compliance"
  | "document"
  | "quote"
  | "portal_invite"
  | "other";

export interface DeliveryStateConfig {
  label: string;
  meaning: string;
  color: string;
  bg: string;
  icon: string;
  sortPriority: number;
}

export const deliveryStates: Record<DeliveryState, DeliveryStateConfig> = {
  draft: { label: "Draft", meaning: "Message not yet sent", color: "#687068", bg: "bg-[#F1F5F9]", icon: "ri-draft-line", sortPriority: 0 },
  scheduled: { label: "Scheduled", meaning: "Will be sent at a future time", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-time-line", sortPriority: 1 },
  queued: { label: "Queued", meaning: "Awaiting delivery provider", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-hourglass-line", sortPriority: 2 },
  provider_accepted: { label: "Provider Accepted", meaning: "Email provider accepted the message for delivery", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-check-double-line", sortPriority: 3 },
  sent: { label: "Sent", meaning: "Message dispatched via chosen channel", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10", icon: "ri-send-plane-line", sortPriority: 4 },
  delivered: { label: "Delivered", meaning: "Confirmed receipt by recipient provider", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10", icon: "ri-check-double-line", sortPriority: 5 },
  read: { label: "Read", meaning: "Recipient has opened the message", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10", icon: "ri-eye-line", sortPriority: 6 },
  failed: { label: "Failed", meaning: "Delivery could not be completed", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-close-circle-line", sortPriority: 7 },
  bounced: { label: "Bounced", meaning: "Message was rejected by recipient server", color: "#EF4444", bg: "bg-[#EF4444]/10", icon: "ri-error-warning-line", sortPriority: 8 },
  cancelled: { label: "Cancelled", meaning: "Message was cancelled before sending", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-close-line", sortPriority: 9 },
};

export interface ConversationStatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: string;
}

export const conversationStatuses: Record<ConversationStatus, ConversationStatusConfig> = {
  unassigned: { label: "Unassigned", color: "#94A3B8", bg: "bg-[#94A3B8]/10", icon: "ri-user-unfollow-line" },
  assigned: { label: "Assigned", color: "#3B82F6", bg: "bg-[#3B82F6]/10", icon: "ri-user-received-line" },
  awaiting_agency: { label: "Awaiting Agency", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-user-voice-line" },
  awaiting_external: { label: "Awaiting External", color: "#8B5CF6", bg: "bg-[#8B5CF6]/10", icon: "ri-user-shared-line" },
  resolved: { label: "Resolved", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10", icon: "ri-check-line" },
  closed: { label: "Closed", color: "#687068", bg: "bg-[#F1F5F9]", icon: "ri-archive-line" },
};

export interface ParticipantTypeConfig {
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export const participantTypes: Record<ParticipantType, ParticipantTypeConfig> = {
  tenant: { label: "Tenant", icon: "ri-user-3-line", color: "#3B82F6", bg: "bg-[#3B82F6]/10" },
  landlord: { label: "Landlord", icon: "ri-user-star-line", color: "#C28A78", bg: "bg-[#C28A78]/10" },
  contractor: { label: "Contractor", icon: "ri-tools-line", color: "#F59E0B", bg: "bg-[#F59E0B]/10" },
  agency: { label: "Agency", icon: "ri-building-line", color: "#8B5CF6", bg: "bg-[#8B5CF6]/10" },
  system: { label: "System", icon: "ri-cpu-line", color: "#94A3B8", bg: "bg-[#94A3B8]/10" },
};

export interface MessageContextConfig {
  label: string;
  icon: string;
}

export const messageContexts: Record<MessageContext, MessageContextConfig> = {
  general: { label: "General", icon: "ri-message-3-line" },
  rent: { label: "Rent", icon: "ri-money-pound-circle-line" },
  maintenance: { label: "Maintenance", icon: "ri-tools-line" },
  inspection: { label: "Inspection", icon: "ri-calendar-check-line" },
  compliance: { label: "Compliance", icon: "ri-shield-check-line" },
  document: { label: "Document", icon: "ri-file-text-line" },
  quote: { label: "Quote", icon: "ri-file-list-3-line" },
  portal_invite: { label: "Portal Invite", icon: "ri-user-add-line" },
  other: { label: "Other", icon: "ri-chat-3-line" },
};

export interface MessageItem {
  id: string;
  senderName: string;
  senderType: ParticipantType;
  body: string;
  deliveryState: DeliveryState;
  createdAt: string;
  isInternalNote: boolean;
  attachments?: { name: string; size: string }[];
}

export interface Conversation {
  id: string;
  participantName: string;
  participantType: ParticipantType;
  participantEmail?: string;
  context: MessageContext;
  relatedRecord: string;
  propertyName?: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  requiresReply: boolean;
  deliveryProblem: boolean;
  conversationStatus: ConversationStatus;
  assignedTo?: string;
  messages: MessageItem[];
}

export interface MessageActionItem {
  id: string;
  conversationId: string;
  type: "reply_required" | "delivery_failed" | "expiring" | "unanswered";
  priority: "critical" | "high" | "medium";
  participantName: string;
  participantType: ParticipantType;
  propertyName: string;
  context: MessageContext;
  issue: string;
  date: string;
}

export const actionPriorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "#EF4444", bg: "bg-[#EF4444]/10", label: "Critical" },
  high: { color: "#F59E0B", bg: "bg-[#F59E0B]/10", label: "High" },
  medium: { color: "#3B82F6", bg: "bg-[#3B82F6]/10", label: "Medium" },
};

export const mailboxCategories = [
  { key: "inbox", label: "Inbox", icon: "ri-inbox-line" },
  { key: "requires_reply", label: "Requires Reply", icon: "ri-chat-check-line" },
  { key: "unread", label: "Unread", icon: "ri-mail-unread-line" },
  { key: "sent", label: "Sent", icon: "ri-send-plane-line" },
  { key: "drafts", label: "Drafts", icon: "ri-draft-line" },
  { key: "archived", label: "Archived", icon: "ri-archive-line" },
] as const;

export type MailboxKey = typeof mailboxCategories[number]["key"];

export interface CommunicationDisclaimer {
  text: string;
}

export const demoDisclaimer: CommunicationDisclaimer = {
  text: "This is a demonstration communication centre. In a live LetHub account, messages are delivered through Supabase-backed email queues and real-time message channels. Delivery states reflect actual provider responses. Internal notes are strictly separated from external messages at the data layer.",
};