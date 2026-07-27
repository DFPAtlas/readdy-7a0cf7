export interface AccountingConnection {
  id: string;
  provider: "xero" | "quickbooks";
  account_id: string | null;
  account_name: string;
  sync_status: "connected" | "disconnected" | "pending" | "error";
  last_sync: string | null;
  sync_config: SyncConfig;
  api_connected: boolean;
  error_message: string | null;
}

export interface SyncConfig {
  rent_sync: boolean;
  maintenance_invoices: boolean;
  contractor_invoices: boolean;
  owner_statements: boolean;
  chart_of_accounts: string;
  vat_scheme: string;
  invoice_prefix: string;
  sync_frequency_minutes: number;
  last_sync_records?: number;
}

export interface SyncLogEntry {
  id: string;
  provider: string;
  sync_type: "rent" | "maintenance_invoice" | "contractor_invoice" | "owner_statement" | "full_sync";
  records_synced: number;
  status: "completed" | "failed" | "in_progress" | "partial";
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface SyncCategory {
  key: "rent" | "maintenance_invoice" | "contractor_invoice" | "owner_statement";
  label: string;
  description: string;
  icon: string;
  recordCount: number;
  lastSynced: string | null;
  color: string;
}

export const providerMeta: Record<string, { name: string; icon: string; color: string; description: string; features: string[] }> = {
  xero: {
    name: "Xero",
    icon: "ri-money-pound-box-line",
    color: "#13B5EA",
    description: "Xero accounting integration for automated rent reconciliation, contractor invoice syncing, and landlord statement generation.",
    features: ["Bank reconciliation", "VAT returns", "Multi-currency", "Unlimited users"],
  },
  quickbooks: {
    name: "QuickBooks",
    icon: "ri-file-chart-line",
    color: "#2CA01C",
    description: "QuickBooks Online connector for rental income tracking, expense categorisation, and owner payout management.",
    features: ["Receipt capture", "Mileage tracking", "Cash flow planner", "Project profitability"],
  },
};

export const syncCategories: SyncCategory[] = [
  {
    key: "rent",
    label: "Rent Payments",
    description: "Sync rent receipts, tenant payment records, and deposit collections to your accounting ledger.",
    icon: "ri-money-pound-circle-line",
    recordCount: 24,
    lastSynced: "27 Jun 2026, 08:14",
    color: "#10B981",
  },
  {
    key: "maintenance_invoice",
    label: "Maintenance Invoices",
    description: "Push contractor maintenance invoices, repair costs, and service charges directly to accounts payable.",
    icon: "ri-tools-line",
    recordCount: 8,
    lastSynced: "27 Jun 2026, 08:15",
    color: "#F59E0B",
  },
  {
    key: "contractor_invoice",
    label: "Contractor Invoices",
    description: "Sync approved contractor quotes, work orders, and contractor payment details for reconciliation.",
    icon: "ri-briefcase-line",
    recordCount: 12,
    lastSynced: "27 Jun 2026, 08:16",
    color: "#3B82F6",
  },
  {
    key: "owner_statement",
    label: "Owner Statements",
    description: "Generate and sync landlord owner statements, net payout calculations, and fee breakdowns.",
    icon: "ri-user-star-line",
    recordCount: 6,
    lastSynced: "27 Jun 2026, 08:17",
    color: "#8B5CF6",
  },
];

export const syncStats = {
  totalTransactions: 42,
  totalValue: "£16,800",
  lastFullSync: "27 Jun 2026, 08:14",
  syncHealth: "healthy" as const,
  rentRecords: 16,
  maintenanceRecords: 3,
  contractorRecords: 5,
  ownerStatementRecords: 6,
  failedSyncs: 0,
};

export const connectionSetupSteps = [
  { step: 1, label: "Authorise", description: "Connect your accounting provider via OAuth 2.0 secure authorisation." },
  { step: 2, label: "Configure", description: "Map your chart of accounts and select which data to sync." },
  { step: 3, label: "Test Sync", description: "Run a test sync with a single transaction to verify the connection." },
  { step: 4, label: "Go Live", description: "Enable automated sync on your chosen schedule. Monitor via the sync log." },
];

export const futureRevenueModels = [
  { name: "Referral Fees", description: "Earn commission on contractor invoices pushed through the accounting pipeline", projected: "£250-£500/mo" },
  { name: "Lead Generation", description: "Monetise contractor connections discovered through invoice reconciliation", projected: "£150-£350/mo" },
  { name: "Premium Listings", description: "Featured contractor placement driven by accounting-verified performance data", projected: "£100-£300/mo" },
  { name: "Premium Accounts", description: "Advanced sync frequency, multi-entity, and dedicated account manager", projected: "£200-£600/mo" },
];