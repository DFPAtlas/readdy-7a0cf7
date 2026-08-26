export const APP_ROLES = [
  "platform_admin",
  "estate_agent_admin",
  "estate_agent_staff",
  "landlord",
  "tenant",
  "contractor",
  "suspended",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

const ROLE_SET = new Set<string>(APP_ROLES);

export const ROLE_LABELS: Record<AppRole, string> = {
  platform_admin: "Platform Admin",
  estate_agent_admin: "Estate Agent Admin",
  estate_agent_staff: "Estate Agent Staff",
  landlord: "Landlord",
  tenant: "Tenant",
  contractor: "Contractor",
  suspended: "Suspended",
};

export const ROLE_HOME: Record<AppRole, string> = {
  platform_admin: "/dashboard/supa-admin",
  estate_agent_admin: "/dashboard",
  estate_agent_staff: "/dashboard",
  landlord: "/dashboard/landlord",
  tenant: "/dashboard/tenant",
  contractor: "/dashboard/contractor",
  suspended: "/login",
};

const PLATFORM_ONLY_PREFIXES = [
  "/dashboard/supa-admin",
  "/dashboard/admin",
];

const AGENCY_ADMIN_ONLY_PREFIXES = [
  "/dashboard/api",
  "/dashboard/billing",
  "/dashboard/settings",
  "/dashboard/agent-control",
  "/dashboard/agent-control-centre",
  "/dashboard/integrations",
  "/dashboard/accounting",
  "/dashboard/open-banking",
  "/dashboard/enterprise-ops",
  "/dashboard/enterprise-permissions",
  "/dashboard/executive-centre",
  "/dashboard/operations-director",
  "/dashboard/regional-management",
  "/dashboard/offices",
  "/dashboard/franchise",
  "/dashboard/marketplace-monetisation",
  "/dashboard/marketplace-revenue",
];

const PORTAL_PREFIXES: Record<"landlord" | "tenant" | "contractor", string> = {
  landlord: "/dashboard/landlord",
  tenant: "/dashboard/tenant",
  contractor: "/dashboard/contractor",
};

export function normaliseRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  return ROLE_SET.has(value) ? (value as AppRole) : null;
}

export function isAgencyRole(role: AppRole | null): boolean {
  return role === "platform_admin" || role === "estate_agent_admin" || role === "estate_agent_staff";
}

export function getRoleHome(role: AppRole): string {
  return ROLE_HOME[role];
}

export function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessDashboardPath(role: AppRole, pathname: string): boolean {
  if (!pathname.startsWith("/dashboard")) return true;
  if (role === "suspended") return false;
  if (pathname === "/dashboard") return true;
  if (role === "platform_admin") return true;

  if (role === "landlord" || role === "tenant" || role === "contractor") {
    return pathMatchesPrefix(pathname, PORTAL_PREFIXES[role]);
  }

  if (PLATFORM_ONLY_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return false;
  }

  if (role === "estate_agent_admin") return true;

  if (role === "estate_agent_staff") {
    return !AGENCY_ADMIN_ONLY_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
  }

  return false;
}

export function isPrivilegedRole(role: AppRole): boolean {
  return role === "platform_admin" || role === "estate_agent_admin";
}
