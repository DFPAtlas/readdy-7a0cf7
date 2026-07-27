export interface WorkspaceConnection {
  id: string;
  provider: "google" | "microsoft";
  account_email: string | null;
  account_name: string;
  sync_status: "connected" | "disconnected" | "pending" | "error";
  last_sync: string | null;
  sync_config: WorkspaceSyncConfig;
  api_connected: boolean;
  error_message: string | null;
}

export interface WorkspaceSyncConfig {
  calendar_sync: boolean;
  inspection_appointments: boolean;
  maintenance_appointments: boolean;
  document_export: boolean;
  email_templates: boolean;
  gmail_enabled?: boolean;
  gcal_enabled?: boolean;
  gdrive_enabled?: boolean;
  outlook_mail?: boolean;
  outlook_calendar?: boolean;
  sharepoint_enabled?: boolean;
  shared_calendars: string[];
  default_reminder_minutes: number;
  auto_attach_documents: boolean;
  email_signature: string;
}

export interface WorkspaceSyncLogEntry {
  id: string;
  provider: string;
  sync_type: "calendar" | "inspection_appointment" | "maintenance_appointment" | "document_export" | "email_template" | "full_sync";
  records_synced: number;
  status: "completed" | "failed" | "in_progress" | "partial";
  details: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface SyncCategory {
  key: string;
  label: string;
  description: string;
  icon: string;
  recordCount: number;
  lastSynced: string | null;
  color: string;
}

export const providerMeta: Record<string, { name: string; icon: string; color: string; description: string; features: string[] }> = {
  google: {
    name: "Google Workspace",
    icon: "ri-google-line",
    color: "#4285F4",
    description: "Connect Google Calendar, Gmail, and Drive. Sync property viewings, inspection appointments, maintenance visits, and export documents automatically.",
    features: ["Google Calendar sync", "Gmail templates", "Drive document storage", "Meet video calls"],
  },
  microsoft: {
    name: "Microsoft 365",
    icon: "ri-microsoft-line",
    color: "#0078D4",
    description: "Connect Outlook Calendar, Outlook Mail, SharePoint, and Teams. Full productivity suite integration for your letting agency.",
    features: ["Outlook Calendar sync", "Outlook Mail templates", "SharePoint storage", "Teams notifications"],
  },
};

export const syncCategories: SyncCategory[] = [
  {
    key: "calendar",
    label: "Calendar Sync",
    description: "Two-way sync of property viewings, key dates, tenancy expiries, and team schedules to your workspace calendar.",
    icon: "ri-calendar-line",
    recordCount: 12,
    lastSynced: "27 Jun 2026, 07:30",
    color: "#4285F4",
  },
  {
    key: "inspection_appointment",
    label: "Inspection Appointments",
    description: "Push property inspection bookings, EPC assessments, and gas safety checks to your calendar with automatic attendee invites.",
    icon: "ri-search-eye-line",
    recordCount: 3,
    lastSynced: "27 Jun 2026, 08:45",
    color: "#10B981",
  },
  {
    key: "maintenance_appointment",
    label: "Maintenance Appointments",
    description: "Sync maintenance visits, contractor bookings, and repair slots. Contractors get invites with property access details.",
    icon: "ri-tools-line",
    recordCount: 5,
    lastSynced: "27 Jun 2026, 09:10",
    color: "#F59E0B",
  },
  {
    key: "document_export",
    label: "Document Export",
    description: "Auto-export EPC certificates, gas safety records, tenancy agreements, and inspection reports to Drive or SharePoint.",
    icon: "ri-file-copy-line",
    recordCount: 14,
    lastSynced: "27 Jun 2026, 06:50",
    color: "#EC4899",
  },
  {
    key: "email_template",
    label: "Email Templates",
    description: "Sync branded email templates for rent reminders, maintenance updates, viewing confirmations, and compliance alerts.",
    icon: "ri-mail-send-line",
    recordCount: 8,
    lastSynced: "27 Jun 2026, 07:55",
    color: "#8B5CF6",
  },
];

export const workspaceStats = {
  totalConnections: 2,
  connected: 1,
  totalSyncedRecords: 39,
  lastFullSync: "27 Jun 2026, 07:00",
  syncHealth: "healthy" as const,
  calendarEvents: 28,
  inspectionBookings: 3,
  maintenanceSlots: 5,
  documentsExported: 14,
  emailTemplates: 8,
  failedSyncs: 0,
};

export const connectionSetupSteps = [
  { step: 1, label: "Authorise", description: "Sign in with your Google Workspace or Microsoft 365 admin account via OAuth 2.0." },
  { step: 2, label: "Select Services", description: "Choose which services to connect — Calendar, Mail, Drive / SharePoint." },
  { step: 3, label: "Configure Sync", description: "Set sync rules, shared calendars, reminder defaults, and document folders." },
  { step: 4, label: "Go Live", description: "Enable automated sync. Calendar events and document exports will flow automatically." },
];

export const futureFeatures = [
  { name: "Google Meet Auto-Generate", description: "Auto-create Meet links for virtual viewings and tenant video calls", icon: "ri-vidicon-line" },
  { name: "Teams Integration", description: "Push inspection alerts and maintenance updates to Teams channels", icon: "ri-microsoft-line" },
  { name: "Smart Scheduling", description: "AI suggests optimal viewing slots based on staff availability and travel time", icon: "ri-brain-line" },
  { name: "Bulk Export", description: "One-click export of all property documents for portfolio audits or landlord handovers", icon: "ri-stack-line" },
  { name: "Calendar Analytics", description: "Reports on viewing conversion rates, inspection completion, and staff utilisation", icon: "ri-bar-chart-line" },
  { name: "Signature Collection", description: "Integration with Google/Microsoft e-signature for tenancy agreements and contractor sign-offs", icon: "ri-pen-nib-line" },
];