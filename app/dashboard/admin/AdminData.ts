export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "landlord" | "tenant" | "contractor" | "estate_agent_admin" | "estate_agent_staff" | "platform_admin";
  status: "Active" | "Suspended" | "Pending" | "Deactivated";
  registeredDate: string;
  lastLogin: string;
  phone?: string;
  properties?: number;
  jobs?: number;
  subscription?: string;
  subscriptionStatus?: "Active" | "Cancelled" | "Past Due";
  revenue?: number;
  avatar?: string;
}

export interface PlatformTransaction {
  id: string;
  date: string;
  type: "Rent Payment" | "Subscription" | "Maintenance" | "Commission" | "Refund" | "Deposit";
  amount: number;
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  party: string;
  property?: string;
  description: string;
  gateway: "Stripe" | "Bank Transfer" | "GoCardless" | "Cash";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: "info" | "warning" | "critical";
  details?: string;
}

export interface PlatformProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  landlord: string;
  tenant: string;
  rent: number;
  agent: string;
  createdDate: string;
}

export const platformUsers: PlatformUser[] = [
  { id: "usr-001", name: "James Richardson", email: "james.r@email.com", role: "landlord", status: "Active", registeredDate: "2024-03-15", lastLogin: "2026-05-30", phone: "07912 345678", properties: 4, subscription: "Professional", subscriptionStatus: "Active", revenue: 7420 },
  { id: "usr-002", name: "Sarah Walker", email: "sarah.w@email.com", role: "landlord", status: "Active", registeredDate: "2024-05-22", lastLogin: "2026-05-29", phone: "07923 456789", properties: 2, subscription: "Standard", subscriptionStatus: "Active", revenue: 2400 },
  { id: "usr-003", name: "John Miller", email: "john.m@email.com", role: "tenant", status: "Active", registeredDate: "2025-01-10", lastLogin: "2026-05-31", phone: "07934 567890", properties: 1, subscription: "Free", subscriptionStatus: "Active" },
  { id: "usr-004", name: "Sarah Jenkins", email: "sarah.j@email.com", role: "tenant", status: "Active", registeredDate: "2025-06-18", lastLogin: "2026-05-28", phone: "07945 678901", properties: 1, subscription: "Free", subscriptionStatus: "Active" },
  { id: "usr-005", name: "GreenPlumb Ltd", email: "jobs@greenplumb.co.uk", role: "contractor", status: "Active", registeredDate: "2024-08-03", lastLogin: "2026-05-31", phone: "020 7946 0958", jobs: 48, subscription: "Trade Pro", subscriptionStatus: "Active", revenue: 8400 },
  { id: "usr-006", name: "SparkPro Electrics", email: "contact@sparkpro.co.uk", role: "contractor", status: "Active", registeredDate: "2024-09-12", lastLogin: "2026-05-30", phone: "0161 496 0358", jobs: 32, subscription: "Trade Pro", subscriptionStatus: "Active", revenue: 5600 },
  { id: "usr-007", name: "David Chen", email: "david.c@lethub.com", role: "estate_agent_admin", status: "Active", registeredDate: "2023-11-01", lastLogin: "2026-05-31", phone: "07956 789012", subscription: "Enterprise", subscriptionStatus: "Active", revenue: 15200 },
  { id: "usr-008", name: "Alex Smith", email: "alex.s@lethub.com", role: "estate_agent_staff", status: "Active", registeredDate: "2024-02-14", lastLogin: "2026-05-31", phone: "07967 890123", subscription: "Enterprise", subscriptionStatus: "Active" },
  { id: "usr-009", name: "Margaret Hughes", email: "margaret.h@email.com", role: "landlord", status: "Suspended", registeredDate: "2024-07-08", lastLogin: "2026-03-15", phone: "07978 901234", properties: 1, subscription: "Standard", subscriptionStatus: "Past Due", revenue: 0 },
  { id: "usr-010", name: "Robert Stewart", email: "robert.s@email.com", role: "landlord", status: "Pending", registeredDate: "2026-05-20", lastLogin: "—", phone: "07989 012345", properties: 0, subscription: "Standard", subscriptionStatus: "Active" },
  { id: "usr-011", name: "Emma Wilson", email: "emma.w@email.com", role: "tenant", status: "Active", registeredDate: "2025-03-22", lastLogin: "2026-05-27", phone: "07990 123456", properties: 1, subscription: "Free", subscriptionStatus: "Active" },
  { id: "usr-012", name: "SecureFix", email: "info@securefix.co.uk", role: "contractor", status: "Active", registeredDate: "2024-10-05", lastLogin: "2026-05-29", phone: "0121 496 0358", jobs: 21, subscription: "Trade Basic", subscriptionStatus: "Active", revenue: 3200 },
  { id: "usr-013", name: "BuildRight Construction", email: "hello@buildright.co.uk", role: "contractor", status: "Active", registeredDate: "2024-06-20", lastLogin: "2026-05-26", phone: "020 7946 0234", jobs: 67, subscription: "Trade Pro", subscriptionStatus: "Active", revenue: 12100 },
  { id: "usr-014", name: "GardenForce", email: "team@gardenforce.co.uk", role: "contractor", status: "Deactivated", registeredDate: "2024-11-11", lastLogin: "2026-01-05", phone: "0113 496 0358", jobs: 15, subscription: "Trade Basic", subscriptionStatus: "Cancelled", revenue: 0 },
  { id: "usr-015", name: "Lisa Patel", email: "lisa.p@lethub.com", role: "estate_agent_staff", status: "Active", registeredDate: "2024-04-30", lastLogin: "2026-05-31", phone: "07901 234567", subscription: "Enterprise", subscriptionStatus: "Active" },
  { id: "usr-016", name: "Michael Torres", email: "michael.t@email.com", role: "tenant", status: "Active", registeredDate: "2025-08-12", lastLogin: "2026-05-30", phone: "07912 345678", properties: 1, subscription: "Free", subscriptionStatus: "Active" },
  { id: "usr-017", name: "David Thompson", email: "david.t@email.com", role: "landlord", status: "Active", registeredDate: "2024-01-28", lastLogin: "2026-05-31", phone: "07923 456789", properties: 3, subscription: "Professional", subscriptionStatus: "Active", revenue: 5800 },
  { id: "usr-018", name: "FastFix Appliances", email: "repair@fastfix.co.uk", role: "contractor", status: "Active", registeredDate: "2025-02-18", lastLogin: "2026-05-31", phone: "020 7946 0456", jobs: 28, subscription: "Trade Basic", subscriptionStatus: "Active", revenue: 4100 },
  { id: "usr-019", name: "Rachel Green", email: "rachel.g@email.com", role: "landlord", status: "Pending", registeredDate: "2026-05-25", lastLogin: "—", phone: "07934 567890", properties: 0, subscription: "Standard", subscriptionStatus: "Active" },
  { id: "usr-020", name: "Admin User", email: "admin@lethub.com", role: "platform_admin", status: "Active", registeredDate: "2023-01-01", lastLogin: "2026-05-31", phone: "07900 000000", subscription: "Enterprise", subscriptionStatus: "Active" },
];

export const platformTransactions: PlatformTransaction[] = [
  { id: "txn-001", date: "2026-05-31", type: "Rent Payment", amount: 1850, status: "Completed", party: "John Miller", property: "Rose Court Flat 2A", description: "Monthly rent payment", gateway: "GoCardless" },
  { id: "txn-002", date: "2026-05-31", type: "Subscription", amount: 149, status: "Completed", party: "James Richardson", description: "Professional Plan - Monthly", gateway: "Stripe" },
  { id: "txn-003", date: "2026-05-30", type: "Maintenance", amount: 340, status: "Completed", party: "BuildRight Construction", property: "The Crescent Bungalow", description: "Roof leak repair", gateway: "Bank Transfer" },
  { id: "txn-004", date: "2026-05-30", type: "Commission", amount: 92.50, status: "Completed", party: "LetHub Platform", property: "Rose Court Flat 2A", description: "5% management commission", gateway: "Stripe" },
  { id: "txn-005", date: "2026-05-29", type: "Rent Payment", amount: 2100, status: "Completed", party: "Emma Wilson", property: "Riverside Court", description: "Monthly rent payment", gateway: "GoCardless" },
  { id: "txn-006", date: "2026-05-29", type: "Subscription", amount: 79, status: "Completed", party: "Sarah Walker", description: "Standard Plan - Monthly", gateway: "Stripe" },
  { id: "txn-007", date: "2026-05-28", type: "Maintenance", amount: 180, status: "Completed", party: "GreenPlumb Ltd", property: "Rose Court Flat 2A", description: "Boiler service", gateway: "Bank Transfer" },
  { id: "txn-008", date: "2026-05-28", type: "Rent Payment", amount: 950, status: "Pending", party: "Sarah Jenkins", property: "Oak Street Apartment", description: "Monthly rent payment", gateway: "GoCardless" },
  { id: "txn-009", date: "2026-05-27", type: "Subscription", amount: 299, status: "Completed", party: "David Chen", description: "Enterprise Plan - Monthly", gateway: "Stripe" },
  { id: "txn-010", date: "2026-05-27", type: "Refund", amount: 180, status: "Refunded", party: "John Miller", property: "Rose Court Flat 2A", description: "Maintenance deposit refund", gateway: "Stripe" },
  { id: "txn-011", date: "2026-05-26", type: "Rent Payment", amount: 1650, status: "Completed", party: "Michael Torres", property: "The Crescent Bungalow", description: "Monthly rent payment", gateway: "GoCardless" },
  { id: "txn-012", date: "2026-05-26", type: "Subscription", amount: 49, status: "Completed", party: "SparkPro Electrics", description: "Trade Pro - Monthly", gateway: "Stripe" },
  { id: "txn-013", date: "2026-05-25", type: "Deposit", amount: 2000, status: "Completed", party: "Rachel Green", property: "Maple Gardens", description: "Tenancy deposit", gateway: "Bank Transfer" },
  { id: "txn-014", date: "2026-05-25", type: "Commission", amount: 105, status: "Completed", party: "LetHub Platform", property: "Riverside Court", description: "5% management commission", gateway: "Stripe" },
  { id: "txn-015", date: "2026-05-24", type: "Rent Payment", amount: 1400, status: "Failed", party: "Emma Wilson", property: "Riverside Court", description: "Monthly rent payment - retry scheduled", gateway: "GoCardless" },
  { id: "txn-016", date: "2026-05-24", type: "Maintenance", amount: 95, status: "Completed", party: "FastFix Appliances", property: "Rose Court Flat 2A", description: "Oven repair", gateway: "Bank Transfer" },
  { id: "txn-017", date: "2026-05-23", type: "Subscription", amount: 149, status: "Completed", party: "David Thompson", description: "Professional Plan - Monthly", gateway: "Stripe" },
  { id: "txn-018", date: "2026-05-23", type: "Rent Payment", amount: 800, status: "Completed", party: "James Richardson", property: "High Street Studio", description: "Monthly rent payment", gateway: "GoCardless" },
  { id: "txn-019", date: "2026-05-22", type: "Subscription", amount: 29, status: "Completed", party: "SecureFix", description: "Trade Basic - Monthly", gateway: "Stripe" },
  { id: "txn-020", date: "2026-05-21", type: "Commission", amount: 82.50, status: "Completed", party: "LetHub Platform", property: "The Crescent Bungalow", description: "5% management commission", gateway: "Stripe" },
];

export const auditLog: AuditLogEntry[] = [
  { id: "aud-001", timestamp: "2026-05-31 09:23:14", user: "Alex Smith", role: "Estate Agent Staff", action: "Created Inspection", target: "Flat 7 Park View", ipAddress: "203.0.113.45", severity: "info", details: "Scheduled routine inspection for 15 Jun 2026" },
  { id: "aud-002", timestamp: "2026-05-31 08:45:32", user: "David Chen", role: "Estate Agent Admin", action: "Approved Tenant", target: "Sarah Jenkins", ipAddress: "203.0.113.12", severity: "info", details: "Tenancy application approved after references cleared" },
  { id: "aud-003", timestamp: "2026-05-30 17:12:08", user: "James Richardson", role: "Landlord", action: "Downloaded Report", target: "Financial Summary Q2", ipAddress: "198.51.100.22", severity: "info" },
  { id: "aud-004", timestamp: "2026-05-30 14:55:41", user: "Lisa Patel", role: "Estate Agent Staff", action: "Sent Warning Letter", target: "Margaret Hughes", ipAddress: "203.0.113.67", severity: "warning", details: "Formal rent arrears warning - 3 months overdue" },
  { id: "aud-005", timestamp: "2026-05-30 11:30:19", user: "GreenPlumb Ltd", role: "Contractor", action: "Uploaded Certificate", target: "Gas Safety Certificate", ipAddress: "198.51.100.88", severity: "info", details: "Certificate valid until 31 Dec 2026" },
  { id: "aud-006", timestamp: "2026-05-29 16:48:03", user: "Admin User", role: "Platform Admin", action: "Suspended Account", target: "Margaret Hughes", ipAddress: "192.0.2.10", severity: "critical", details: "Account suspended due to repeated policy violations and non-payment" },
  { id: "aud-007", timestamp: "2026-05-29 10:22:55", user: "Sarah Walker", role: "Landlord", action: "Updated Property", target: "Baker Street Residence", ipAddress: "198.51.100.55", severity: "info", details: "Updated rent amount from 2000 to 2100" },
  { id: "aud-008", timestamp: "2026-05-29 09:15:00", user: "John Miller", role: "Tenant", action: "Signed Document", target: "Tenancy Agreement 2026", ipAddress: "203.0.113.90", severity: "info", details: "Digital signature applied via DocuSign integration" },
  { id: "aud-009", timestamp: "2026-05-28 15:40:27", user: "Alex Smith", role: "Estate Agent Staff", action: "Created Maintenance", target: "Boiler repair - 12 Rose Avenue", ipAddress: "203.0.113.45", severity: "info" },
  { id: "aud-010", timestamp: "2026-05-28 11:05:18", user: "BuildRight Construction", role: "Contractor", action: "Completed Job", target: "Roof leak repair - 8 The Crescent", ipAddress: "198.51.100.77", severity: "info", details: "Job completed in 3 days. Invoice #BR-2026-044" },
  { id: "aud-011", timestamp: "2026-05-27 18:30:42", user: "Admin User", role: "Platform Admin", action: "System Config", target: "Payment Gateway", ipAddress: "192.0.2.10", severity: "warning", details: "Updated Stripe webhook endpoint configuration" },
  { id: "aud-012", timestamp: "2026-05-27 12:10:33", user: "David Chen", role: "Estate Agent Admin", action: "Added Contractor", target: "FastFix Appliances", ipAddress: "203.0.113.12", severity: "info" },
  { id: "aud-013", timestamp: "2026-05-26 09:45:11", user: "Rachel Green", role: "Landlord", action: "Registered Account", target: "New Landlord", ipAddress: "203.0.113.201", severity: "info", details: "Account pending verification" },
  { id: "aud-014", timestamp: "2026-05-26 08:20:00", user: "Admin User", role: "Platform Admin", action: "Database Backup", target: "Full Platform", ipAddress: "192.0.2.10", severity: "info", details: "Automated daily backup completed successfully" },
  { id: "aud-015", timestamp: "2026-05-25 14:33:07", user: "Lisa Patel", role: "Estate Agent Staff", action: "Generated Report", target: "Compliance Status", ipAddress: "203.0.113.67", severity: "info" },
  { id: "aud-016", timestamp: "2026-05-25 11:18:29", user: "SparkPro Electrics", role: "Contractor", action: "Updated Profile", target: "Insurance Certificate", ipAddress: "198.51.100.44", severity: "info", details: "New certificate uploaded, valid until 31 Dec 2026" },
  { id: "aud-017", timestamp: "2026-05-24 16:50:00", user: "Emma Wilson", role: "Tenant", action: "Submitted Ticket", target: "Maintenance Request", ipAddress: "203.0.113.155", severity: "info", details: "Reported leaking tap in kitchen" },
  { id: "aud-018", timestamp: "2026-05-24 10:05:44", user: "Admin User", role: "Platform Admin", action: "Failed Login Attempt", target: "Platform Admin", ipAddress: "185.220.101.22", severity: "critical", details: "3 consecutive failed login attempts from unknown IP" },
  { id: "aud-019", timestamp: "2026-05-23 13:40:00", user: "David Thompson", role: "Landlord", action: "Payment Failed", target: "Subscription Renewal", ipAddress: "198.51.100.33", severity: "warning", details: "Card declined. Retry scheduled in 3 days." },
  { id: "aud-020", timestamp: "2026-05-22 09:00:00", user: "Admin User", role: "Platform Admin", action: "System Update", target: "Platform v3.2.1", ipAddress: "192.0.2.10", severity: "info", details: "Deployed security patch and performance improvements" },
];

export const platformProperties: PlatformProperty[] = [
  { id: "prop-001", name: "Rose Court Flat 2A", address: "12 Rose Avenue", city: "London", status: "Occupied", landlord: "James Richardson", tenant: "John Miller", rent: 1850, agent: "David Chen", createdDate: "2024-03-15" },
  { id: "prop-002", name: "Baker Street Residence", address: "45 Baker Street", city: "Manchester", status: "Available", landlord: "Sarah Walker", tenant: "", rent: 2100, agent: "Lisa Patel", createdDate: "2024-05-22" },
  { id: "prop-003", name: "Oak Street Apartment", address: "Flat 4B, 78 Oak Street", city: "Birmingham", status: "Pending", landlord: "David Thompson", tenant: "Sarah Jenkins", rent: 950, agent: "Alex Smith", createdDate: "2025-01-10" },
  { id: "prop-004", name: "The Crescent Bungalow", address: "8 The Crescent", city: "Leeds", status: "Maintenance", landlord: "Margaret Hughes", tenant: "", rent: 1650, agent: "David Chen", createdDate: "2024-07-08" },
  { id: "prop-005", name: "Riverside Court", address: "Unit 3, Riverside Court", city: "Bristol", status: "Occupied", landlord: "James Richardson", tenant: "Emma Wilson", rent: 1400, agent: "Lisa Patel", createdDate: "2024-03-15" },
  { id: "prop-006", name: "High Street Studio", address: "21 High Street", city: "Edinburgh", status: "Available", landlord: "Robert Stewart", tenant: "", rent: 800, agent: "Alex Smith", createdDate: "2026-05-20" },
  { id: "prop-007", name: "Maple Gardens House", address: "3 Maple Gardens", city: "Cardiff", status: "Occupied", landlord: "David Thompson", tenant: "Michael Torres", rent: 1200, agent: "David Chen", createdDate: "2024-01-28" },
  { id: "prop-008", name: "Park View Flat", address: "Flat 7, Park View", city: "London", status: "Occupied", landlord: "James Richardson", tenant: "Lisa Chang", rent: 2100, agent: "Lisa Patel", createdDate: "2024-03-15" },
  { id: "prop-009", name: "Seaview Cottage", address: "22 Seaview Road", city: "Brighton", status: "Available", landlord: "Sarah Walker", tenant: "", rent: 1750, agent: "Alex Smith", createdDate: "2025-03-22" },
  { id: "prop-010", name: "Victoria Mansions", address: "Flat 12B, Victoria Mansions", city: "London", status: "Occupied", landlord: "David Thompson", tenant: "James O\'Connor", rent: 2300, agent: "David Chen", createdDate: "2024-01-28" },
  { id: "prop-011", name: "Willow House", address: "7 Willow Lane", city: "Oxford", status: "Maintenance", landlord: "James Richardson", tenant: "", rent: 1600, agent: "Lisa Patel", createdDate: "2024-03-15" },
  { id: "prop-012", name: "The Old Barn", address: "The Old Barn, Mill Road", city: "Cambridge", status: "Pending", landlord: "Robert Stewart", tenant: "Sophie Brown", rent: 1450, agent: "Alex Smith", createdDate: "2026-05-20" },
  { id: "prop-013", name: "Greenfield Terrace", address: "14 Greenfield Terrace", city: "Leeds", status: "Occupied", landlord: "Sarah Walker", tenant: "Daniel Lee", rent: 980, agent: "David Chen", createdDate: "2025-03-22" },
  { id: "prop-014", name: "Royal Apartments", address: "Flat 5A, Royal Apartments", city: "Manchester", status: "Occupied", landlord: "David Thompson", tenant: "Olivia Martinez", rent: 1900, agent: "Lisa Patel", createdDate: "2024-01-28" },
  { id: "prop-015", name: "Hilltop View", address: "9 Hilltop View", city: "Bristol", status: "Available", landlord: "Margaret Hughes", tenant: "", rent: 1350, agent: "Alex Smith", createdDate: "2024-07-08" },
];

export const monthlyRevenue = [
  { month: "Jan", mrr: 4200, transactions: 18200, commissions: 910 },
  { month: "Feb", mrr: 4300, transactions: 19400, commissions: 970 },
  { month: "Mar", mrr: 4500, transactions: 20100, commissions: 1005 },
  { month: "Apr", mrr: 4700, transactions: 21500, commissions: 1075 },
  { month: "May", mrr: 4900, transactions: 22800, commissions: 1140 },
  { month: "Jun", mrr: 5100, transactions: 23600, commissions: 1180 },
];

export const userGrowth = [
  { month: "Jan", landlords: 8, tenants: 24, contractors: 5 },
  { month: "Feb", landlords: 10, tenants: 28, contractors: 6 },
  { month: "Mar", landlords: 12, tenants: 32, contractors: 7 },
  { month: "Apr", landlords: 14, tenants: 36, contractors: 7 },
  { month: "May", landlords: 17, tenants: 42, contractors: 8 },
  { month: "Jun", landlords: 20, tenants: 48, contractors: 9 },
];

export const roleColors: Record<string, string> = {
  landlord: "bg-emerald-500",
  tenant: "bg-sky-500",
  contractor: "bg-orange-500",
  estate_agent_admin: "bg-amber-500",
  estate_agent_staff: "bg-blue-500",
  platform_admin: "bg-purple-500",
};

export const statusStyles: Record<string, string> = {
  Active: "bg-[#10B981]/10 text-[#10B981]",
  Suspended: "bg-[#EF4444]/10 text-[#EF4444]",
  Pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Deactivated: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

export const transactionStatusStyles: Record<string, string> = {
  Completed: "bg-[#10B981]/10 text-[#10B981]",
  Pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Failed: "bg-[#EF4444]/10 text-[#EF4444]",
  Refunded: "bg-[#94A3B8]/10 text-[#94A3B8]",
};

export const transactionTypeStyles: Record<string, string> = {
  "Rent Payment": "bg-[#C28A78]/10 text-[#C28A78]",
  Subscription: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  Maintenance: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Commission: "bg-[#14B8A6]/10 text-[#14B8A6]",
  Refund: "bg-[#94A3B8]/10 text-[#94A3B8]",
  Deposit: "bg-[#3B82F6]/10 text-[#3B82F6]",
};

export const subscriptionPlans = [
  { name: "Free", price: 0, users: 48, revenue: 0, color: "bg-[#94A3B8]" },
  { name: "Standard", price: 79, users: 4, revenue: 316, color: "bg-[#3B82F6]" },
  { name: "Professional", price: 149, users: 2, revenue: 298, color: "bg-[#8B5CF6]" },
  { name: "Enterprise", price: 299, users: 3, revenue: 897, color: "bg-[#C28A78]" },
  { name: "Trade Basic", price: 29, users: 3, revenue: 87, color: "bg-[#F59E0B]" },
  { name: "Trade Pro", price: 49, users: 3, revenue: 147, color: "bg-[#14B8A6]" },
];