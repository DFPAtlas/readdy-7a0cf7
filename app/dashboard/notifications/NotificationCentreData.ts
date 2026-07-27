export type NotificationEventType =
  | "maintenance_update"
  | "inspection_scheduled"
  | "inspection_completed"
  | "compliance_expiry"
  | "rent_overdue"
  | "quote_awaiting"
  | "document_uploaded"
  | "portal_invite";

export type DeliveryChannel = "email" | "push" | "sms";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationEventType;
  isRead: boolean;
  actionUrl: string;
  channel: DeliveryChannel;
  sentAt: string;
  readAt: string | null;
  property?: string;
  tenant?: string;
}

export interface NotificationPreference {
  eventType: NotificationEventType;
  label: string;
  description: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

export const notificationEventLabels: Record<NotificationEventType, string> = {
  maintenance_update: "Maintenance Update",
  inspection_scheduled: "Inspection Scheduled",
  inspection_completed: "Inspection Completed",
  compliance_expiry: "Compliance Expiry",
  rent_overdue: "Rent Overdue",
  quote_awaiting: "Quote Awaiting Approval",
  document_uploaded: "Document Uploaded",
  portal_invite: "Portal Invite Accepted",
};

export const eventIcons: Record<NotificationEventType, string> = {
  maintenance_update: "ri-tools-line",
  inspection_scheduled: "ri-calendar-check-line",
  inspection_completed: "ri-clipboard-line",
  compliance_expiry: "ri-shield-flash-line",
  rent_overdue: "ri-alarm-warning-line",
  quote_awaiting: "ri-file-list-3-line",
  document_uploaded: "ri-folder-upload-line",
  portal_invite: "ri-user-add-line",
};

export const eventColors: Record<NotificationEventType, string> = {
  maintenance_update: "#F59E0B",
  inspection_scheduled: "#3B82F6",
  inspection_completed: "#10B981",
  compliance_expiry: "#EF4444",
  rent_overdue: "#EF4444",
  quote_awaiting: "#8B5CF6",
  document_uploaded: "#06B6D4",
  portal_invite: "#EC4899",
};

export const seedNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Boiler Repair — Status Update",
    body: "GreenPlumb Ltd has marked the boiler repair at 45 Baker Street as in progress. Estimated completion: 28 June 2026.",
    type: "maintenance_update",
    isRead: false,
    actionUrl: "/dashboard/maintenance",
    channel: "push",
    sentAt: "2 min ago",
    readAt: null,
    property: "45 Baker Street",
  },
  {
    id: "n2",
    title: "Gas Safety Certificate Expiring",
    body: "The Gas Safety Certificate for 12 Rose Avenue expires in 7 days on 4 July 2026. Book an inspection now to avoid compliance gaps.",
    type: "compliance_expiry",
    isRead: false,
    actionUrl: "/dashboard/compliance",
    channel: "push",
    sentAt: "15 min ago",
    readAt: null,
    property: "12 Rose Avenue",
  },
  {
    id: "n3",
    title: "Rent Overdue — Sarah Jenkins",
    body: "Sarah Jenkins at Flat 4B Oak Street is now 5 days overdue on rent of £1,850. Arrears total: £1,850.",
    type: "rent_overdue",
    isRead: false,
    actionUrl: "/dashboard/arrears",
    channel: "email",
    sentAt: "32 min ago",
    readAt: null,
    property: "Flat 4B Oak Street",
    tenant: "Sarah Jenkins",
  },
  {
    id: "n4",
    title: "Quarterly Inspection Scheduled",
    body: "A routine property inspection has been scheduled for 21 High Street on 3 July 2026 at 10:00 AM. Contractor: InspectEast Ltd.",
    type: "inspection_scheduled",
    isRead: false,
    actionUrl: "/dashboard/inspections",
    channel: "push",
    sentAt: "1 hour ago",
    readAt: null,
    property: "21 High Street",
  },
  {
    id: "n5",
    title: "Inspection Report Ready",
    body: "The inspection at 8 The Crescent, Leeds has been completed. All rooms passed. Full report available in documents.",
    type: "inspection_completed",
    isRead: true,
    actionUrl: "/dashboard/documents",
    channel: "email",
    sentAt: "3 hours ago",
    readAt: "2 hours ago",
    property: "8 The Crescent, Leeds",
  },
  {
    id: "n6",
    title: "Quote Awaiting Your Approval",
    body: "A quote of £340 from GreenPlumb Ltd for boiler repair at 45 Baker Street requires your approval. Review within 48 hours.",
    type: "quote_awaiting",
    isRead: false,
    actionUrl: "/dashboard/quotes",
    channel: "push",
    sentAt: "4 hours ago",
    readAt: null,
    property: "45 Baker Street",
  },
  {
    id: "n7",
    title: "Tenancy Agreement Uploaded",
    body: "The signed tenancy agreement for John Miller at 34 Maple Gardens has been uploaded to the document store.",
    type: "document_uploaded",
    isRead: true,
    actionUrl: "/dashboard/documents",
    channel: "email",
    sentAt: "5 hours ago",
    readAt: "5 hours ago",
    property: "34 Maple Gardens",
    tenant: "John Miller",
  },
  {
    id: "n8",
    title: "Portal Invite Accepted",
    body: "Emily Watson has accepted the tenant portal invite for 17 Park Lane. She now has access to documents, rent, and maintenance.",
    type: "portal_invite",
    isRead: true,
    actionUrl: "/dashboard/tenants",
    channel: "email",
    sentAt: "1 day ago",
    readAt: "1 day ago",
    property: "17 Park Lane",
    tenant: "Emily Watson",
  },
  {
    id: "n9",
    title: "EPC Rating Below C — Action Required",
    body: "The EPC for 3 Riverside Mews has been assessed at band D. By 2028 all rental properties must be C or above. Remedial works recommended.",
    type: "compliance_expiry",
    isRead: false,
    actionUrl: "/dashboard/compliance",
    channel: "push",
    sentAt: "1 day ago",
    readAt: null,
    property: "3 Riverside Mews",
  },
  {
    id: "n10",
    title: "Electrical Certificate Expiring",
    body: "The EICR for 9 Victoria Terrace expires on 14 July 2026. Schedule an electrical inspection now.",
    type: "compliance_expiry",
    isRead: false,
    actionUrl: "/dashboard/compliance",
    channel: "email",
    sentAt: "1 day ago",
    readAt: null,
    property: "9 Victoria Terrace",
  },
  {
    id: "n11",
    title: "Roof Repair — Contractor Assigned",
    body: "Summit Roofing Ltd has been assigned to the roof leak at 22 Church Lane. Job reference: MH-2026-0471.",
    type: "maintenance_update",
    isRead: true,
    actionUrl: "/dashboard/maintenance",
    channel: "push",
    sentAt: "2 days ago",
    readAt: "1 day ago",
    property: "22 Church Lane",
  },
  {
    id: "n12",
    title: "Rent Arrears Escalated",
    body: "James Carter at 5 The Broadway is now 14 days overdue. Total arrears: £2,600. Pre-action protocol triggered.",
    type: "rent_overdue",
    isRead: false,
    actionUrl: "/dashboard/arrears",
    channel: "push",
    sentAt: "2 days ago",
    readAt: null,
    property: "5 The Broadway",
    tenant: "James Carter",
  },
  {
    id: "n13",
    title: "Fire Risk Assessment Due",
    body: "The annual fire risk assessment for 18 Harbour View is due by 10 July 2026. This is a legal requirement under the Regulatory Reform Order.",
    type: "compliance_expiry",
    isRead: false,
    actionUrl: "/dashboard/compliance-timeline",
    channel: "email",
    sentAt: "2 days ago",
    readAt: null,
    property: "18 Harbour View",
  },
  {
    id: "n14",
    title: "New Quote Received",
    body: "BrightSpark Electrical has submitted a quote of £520 for the fuse board upgrade at 11 Elm Grove. Review and approve or decline.",
    type: "quote_awaiting",
    isRead: false,
    actionUrl: "/dashboard/quotes",
    channel: "push",
    sentAt: "3 days ago",
    readAt: null,
    property: "11 Elm Grove",
  },
  {
    id: "n15",
    title: "End of Tenancy Inspection Booked",
    body: "The move-out inspection for Flat 2A Kings Road is scheduled for 5 July 2026. Tenant: Michael Davies.",
    type: "inspection_scheduled",
    isRead: true,
    actionUrl: "/dashboard/inspections",
    channel: "email",
    sentAt: "3 days ago",
    readAt: "3 days ago",
    property: "Flat 2A Kings Road",
    tenant: "Michael Davies",
  },
  {
    id: "n16",
    title: "Deposit Certificate Uploaded",
    body: "The TDS deposit protection certificate for 7 Orchard Close has been uploaded to documents.",
    type: "document_uploaded",
    isRead: true,
    actionUrl: "/dashboard/documents",
    channel: "email",
    sentAt: "4 days ago",
    readAt: "3 days ago",
    property: "7 Orchard Close",
  },
  {
    id: "n17",
    title: "New Contractor Onboarded",
    body: "Summit Roofing Ltd has been added to your approved contractor network. They specialise in roofing, guttering, and loft insulation.",
    type: "portal_invite",
    isRead: true,
    actionUrl: "/dashboard/contractors",
    channel: "push",
    sentAt: "5 days ago",
    readAt: "5 days ago",
  },
  {
    id: "n18",
    title: "Damp Report Attached",
    body: "The damp survey report for 14 Willow Way has been uploaded by DampGuard Solutions. Remedial works recommended in living room and kitchen.",
    type: "document_uploaded",
    isRead: false,
    actionUrl: "/dashboard/documents",
    channel: "email",
    sentAt: "5 days ago",
    readAt: null,
    property: "14 Willow Way",
  },
];

export function getDefaultPreferences(): NotificationPreference[] {
  return [
    { eventType: "maintenance_update", label: "Maintenance Updates", description: "When a repair job status changes or a contractor is assigned", emailEnabled: true, pushEnabled: true, smsEnabled: false },
    { eventType: "inspection_scheduled", label: "Inspection Scheduled", description: "When a property inspection is booked", emailEnabled: true, pushEnabled: true, smsEnabled: false },
    { eventType: "inspection_completed", label: "Inspection Completed", description: "When an inspection report is finalised", emailEnabled: true, pushEnabled: false, smsEnabled: false },
    { eventType: "compliance_expiry", label: "Compliance Expiry Warnings", description: "Certificates approaching expiry or new regulatory deadlines", emailEnabled: true, pushEnabled: true, smsEnabled: true },
    { eventType: "rent_overdue", label: "Rent Overdue Alerts", description: "When a tenant falls behind on rent payments", emailEnabled: true, pushEnabled: true, smsEnabled: true },
    { eventType: "quote_awaiting", label: "Quotes Awaiting Approval", description: "When a contractor submits a quote for review", emailEnabled: true, pushEnabled: true, smsEnabled: false },
    { eventType: "document_uploaded", label: "Documents Uploaded", description: "When new documents are added to the system", emailEnabled: false, pushEnabled: false, smsEnabled: false },
    { eventType: "portal_invite", label: "Portal Invites", description: "When a tenant, landlord, or contractor accepts an invite", emailEnabled: true, pushEnabled: false, smsEnabled: false },
  ];
}

export function getChannelStats(notifications: NotificationItem[]) {
  const total = notifications.length;
  const push = notifications.filter((n) => n.channel === "push").length;
  const email = notifications.filter((n) => n.channel === "email").length;
  const pushDelivered = push;
  const emailDelivered = email;
  const pushOpened = notifications.filter((n) => n.channel === "push" && n.isRead).length;
  const emailOpened = notifications.filter((n) => n.channel === "email" && n.isRead).length;

  return {
    totalSent: total,
    pushSent: push,
    emailSent: email,
    pushDelivered,
    emailDelivered,
    pushOpenRate: push > 0 ? Math.round((pushOpened / push) * 100) : 0,
    emailOpenRate: email > 0 ? Math.round((emailOpened / email) * 100) : 0,
  };
}