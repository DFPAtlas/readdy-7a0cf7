export interface IntegrationItem {
  id: string;
  name: string;
  icon: string;
  category: "finance" | "productivity" | "automation" | "communication" | "documents";
  status: "connected" | "disconnected" | "pending";
  description: string;
  lastSync: string | null;
  features: string[];
  color: string;
}

export interface IntegrationCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export const integrationCategories: IntegrationCategory[] = [
  { key: "finance", label: "Finance", icon: "ri-bank-line", color: "#10B981" },
  { key: "productivity", label: "Productivity", icon: "ri-briefcase-line", color: "#3B82F6" },
  { key: "automation", label: "Automation", icon: "ri-cpu-line", color: "#8B5CF6" },
  { key: "communication", label: "Communication", icon: "ri-message-3-line", color: "#F59E0B" },
  { key: "documents", label: "Documents", icon: "ri-folder-line", color: "#EC4899" },
];

export const integrations: IntegrationItem[] = [
  {
    id: "xero",
    name: "Xero",
    icon: "ri-money-pound-box-line",
    category: "finance",
    status: "connected",
    description: "Sync rent payments, contractor invoices, and property expenses directly with your Xero accounting ledger.",
    lastSync: "27 Jun 2026, 08:14",
    features: ["Invoice sync", "Payment reconciliation", "Chart of accounts mapping", "VAT reporting"],
    color: "#13B5EA",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    icon: "ri-file-chart-line",
    category: "finance",
    status: "disconnected",
    description: "Automated bookkeeping for rental income, contractor payments, and service charge tracking.",
    lastSync: null,
    features: ["Income categorisation", "Expense tracking", "Tax preparation", "Multi-entity support"],
    color: "#2CA01C",
  },
  {
    id: "openbanking",
    name: "Open Banking",
    icon: "ri-bank-card-line",
    category: "finance",
    status: "connected",
    description: "Real-time rent payment verification via bank feeds. No manual reconciliation needed.",
    lastSync: "27 Jun 2026, 09:42",
    features: ["Rent payment detection", "Arrears alerts", "Balance monitoring", "Bank-grade security"],
    color: "#6366F1",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "ri-secure-payment-line",
    category: "finance",
    status: "disconnected",
    description: "Accept online rent payments, contractor invoices, and marketplace fees via card or bank transfer.",
    lastSync: null,
    features: ["Card payments", "Direct Debit", "Automated billing", "Payment links"],
    color: "#635BFF",
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    icon: "ri-google-line",
    category: "productivity",
    status: "connected",
    description: "Sync calendars for property viewings, tenancy dates, and compliance reminders.",
    lastSync: "27 Jun 2026, 07:30",
    features: ["Calendar sync", "Email integration", "Drive document storage", "Meet scheduling"],
    color: "#4285F4",
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    icon: "ri-microsoft-line",
    category: "productivity",
    status: "disconnected",
    description: "Outlook calendar sync, SharePoint document storage, and Teams notifications.",
    lastSync: null,
    features: ["Outlook sync", "SharePoint storage", "Teams alerts", "Excel reporting"],
    color: "#0078D4",
  },
  {
    id: "n8n",
    name: "n8n",
    icon: "ri-node-tree",
    category: "automation",
    status: "connected",
    description: "Low-code workflow automation. Trigger maintenance jobs, send compliance reminders, and route tenant queries.",
    lastSync: "27 Jun 2026, 06:55",
    features: ["Visual workflow editor", "200+ integrations", "Scheduled triggers", "Webhook support"],
    color: "#EA4B71",
  },
  {
    id: "zapier",
    name: "Zapier",
    icon: "ri-flashlight-line",
    category: "automation",
    status: "disconnected",
    description: "Connect LetHub to 5,000+ apps. Automate repetitive letting tasks with zero code.",
    lastSync: null,
    features: ["5,000+ app connections", "Multi-step zaps", "Conditional logic", "Scheduled automation"],
    color: "#FF4A00",
  },
  {
    id: "make",
    name: "Make.com",
    icon: "ri-shapes-line",
    category: "automation",
    status: "disconnected",
    description: "Visual scenario builder for complex multi-step automation across your property tech stack.",
    lastSync: null,
    features: ["Visual scenario builder", "Error handling", "Data transformation", "Real-time triggers"],
    color: "#6D28D9",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "ri-whatsapp-line",
    category: "communication",
    status: "connected",
    description: "Send tenant messages, maintenance updates, and rent reminders via WhatsApp Business API.",
    lastSync: "27 Jun 2026, 10:05",
    features: ["Template messaging", "Two-way chat", "Media sharing", "Read receipts"],
    color: "#25D366",
  },
  {
    id: "email",
    name: "Email",
    icon: "ri-mail-send-line",
    category: "communication",
    status: "connected",
    description: "Transactional email for tenancy agreements, invoices, compliance certificates, and notifications.",
    lastSync: "27 Jun 2026, 09:58",
    features: ["Branded templates", "Attachment support", "Delivery tracking", "Bulk sending"],
    color: "#64748B",
  },
  {
    id: "sms",
    name: "SMS",
    icon: "ri-chat-1-line",
    category: "communication",
    status: "connected",
    description: "Urgent alerts for gas leaks, payment reminders, and viewing confirmations via SMS.",
    lastSync: "27 Jun 2026, 08:30",
    features: ["Instant delivery", "Two-way SMS", "Scheduled sending", "Delivery reports"],
    color: "#F97316",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "ri-hard-drive-2-line",
    category: "documents",
    status: "connected",
    description: "Auto-save tenancy agreements, EPC certificates, and inspection reports to Google Drive.",
    lastSync: "27 Jun 2026, 07:45",
    features: ["Auto-organised folders", "Permission sharing", "Version history", "OCR search"],
    color: "#0F9D58",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    icon: "ri-cloud-line",
    category: "documents",
    status: "disconnected",
    description: "Sync property documents to OneDrive with automatic folder structure per property.",
    lastSync: null,
    features: ["Auto-folder structure", "Co-authoring", "Ransomware detection", "Personal Vault"],
    color: "#0078D4",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "ri-archive-line",
    category: "documents",
    status: "disconnected",
    description: "Cloud backup for all property documentation with enterprise-grade security.",
    lastSync: null,
    features: ["Smart Sync", "File requests", "eSignatures", "Granular permissions"],
    color: "#0061FF",
  },
];

export const statusStyles: Record<string, { bg: string; dot: string; label: string }> = {
  connected: { bg: "bg-[#10B981]/10 border-[#10B981]/30", dot: "bg-[#10B981]", label: "Connected" },
  disconnected: { bg: "bg-[#F1F5F9] border-[#E2E8F0]", dot: "bg-[#CBD5E1]", label: "Not Connected" },
  pending: { bg: "bg-[#F59E0B]/10 border-[#F59E0B]/30", dot: "bg-[#F59E0B]", label: "Pending" },
};

export const activityLog = [
  { id: "a1", integration: "Xero", action: "Sync completed", detail: "42 transactions synced", time: "27 Jun 2026, 08:14", icon: "ri-refresh-line" },
  { id: "a2", integration: "Open Banking", action: "Rent payment detected", detail: "£1,250 from T. Wilson", time: "27 Jun 2026, 09:42", icon: "ri-bank-card-line" },
  { id: "a3", integration: "WhatsApp", action: "Template sent", detail: "Gas safety reminder to 14 tenants", time: "27 Jun 2026, 10:05", icon: "ri-whatsapp-line" },
  { id: "a4", integration: "n8n", action: "Workflow executed", detail: "Compliance expiry check — 3 due", time: "27 Jun 2026, 06:55", icon: "ri-node-tree" },
  { id: "a5", integration: "Google Drive", action: "Document archived", detail: "EPC certificate for 42 River St", time: "27 Jun 2026, 07:45", icon: "ri-hard-drive-2-line" },
  { id: "a6", integration: "Email", action: "Batch sent", detail: "Monthly statements to 8 landlords", time: "27 Jun 2026, 09:58", icon: "ri-mail-send-line" },
  { id: "a7", integration: "SMS", action: "Reminder sent", detail: "Viewing confirmation to 3 applicants", time: "27 Jun 2026, 08:30", icon: "ri-chat-1-line" },
  { id: "a8", integration: "Google Workspace", action: "Calendar synced", detail: "12 viewings added this week", time: "27 Jun 2026, 07:30", icon: "ri-google-line" },
];

export const quickStats = {
  total: 15,
  connected: 8,
  disconnected: 7,
  lastSyncAll: "27 Jun 2026, 10:05",
  categoriesWithConnections: 5,
};