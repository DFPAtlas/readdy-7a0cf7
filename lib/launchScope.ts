// Launch scope: which product areas are switched on.
//
// LetHub contains many modules that are still prototypes rendering hard-coded
// sample data. For the January 2027 launch only the core ("wedge") modules
// below are reachable. Everything else is hidden from navigation and
// redirected away by middleware, unless the deployment sets
//   NEXT_PUBLIC_LAUNCH_SCOPE=full
// (for internal/staging builds) or the visitor is in demo mode.
//
// When a prototype module is wired to live data, add its prefix here.

export type LaunchScope = "launch" | "full";

export const LAUNCH_SCOPE: LaunchScope =
  process.env.NEXT_PUBLIC_LAUNCH_SCOPE === "full" ? "full" : "launch";

/** Dashboard routes available at launch. A prefix also enables its sub-routes. */
const DASHBOARD_LAUNCH_PREFIXES = [
  // Core agency workflow
  "/dashboard/setup",
  "/dashboard/portfolio",
  "/dashboard/property",
  "/dashboard/properties",
  "/dashboard/tenancies",
  "/dashboard/landlords",
  "/dashboard/tenants",
  "/dashboard/rent",
  "/dashboard/rent-collection",
  "/dashboard/arrears",
  "/dashboard/payments",
  "/dashboard/maintenance",
  "/dashboard/quotes",
  "/dashboard/compliance",
  "/dashboard/inspections",
  "/dashboard/documents",
  "/dashboard/signatures",
  "/dashboard/messages",
  "/dashboard/notifications",
  "/dashboard/portal-setup",
  "/dashboard/import",
  "/dashboard/settings",
  "/dashboard/billing",
  // Contractor portal (live-data pages only)
  "/dashboard/contractor/documents",
  // Platform administration
  "/dashboard/supa-admin",
];

/** Routes matched exactly (their sub-routes are not enabled by this entry). */
const DASHBOARD_LAUNCH_EXACT = [
  "/dashboard",
  "/dashboard/contractors",
  "/dashboard/contractor",
];

/** Non-dashboard app areas that are prototypes and switched off at launch. */
const OTHER_DISABLED_PREFIXES = ["/mobile", "/contractor/dashboard"];

/**
 * Prototype routes inside an otherwise-disabled area that do use live data.
 * (The old /mobile/property-check prototype is replaced by
 * /dashboard/inspections/[id]/conduct and redirects there.)
 */
const OTHER_ENABLED_EXCEPTIONS: string[] = [];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * True when the route is part of the launch product. Routes outside
 * /dashboard, /mobile and /contractor/dashboard are always in scope.
 */
export function isPathInLaunchScope(pathname: string, scope: LaunchScope = LAUNCH_SCOPE): boolean {
  if (scope === "full") return true;
  const path = pathname.replace(/\/+$/, "") || "/";

  if (OTHER_ENABLED_EXCEPTIONS.some((prefix) => matchesPrefix(path, prefix))) return true;
  if (OTHER_DISABLED_PREFIXES.some((prefix) => matchesPrefix(path, prefix))) return false;

  if (!matchesPrefix(path, "/dashboard")) return true;
  if (DASHBOARD_LAUNCH_EXACT.includes(path)) return true;
  return DASHBOARD_LAUNCH_PREFIXES.some((prefix) => matchesPrefix(path, prefix));
}

/** Where to send someone who requests an out-of-scope route. */
export function launchScopeFallback(pathname: string): string {
  if (matchesPrefix(pathname, "/contractor/dashboard")) return "/dashboard/contractor";
  // The old prototype inspection app; inspections now run from the dashboard.
  if (matchesPrefix(pathname, "/mobile/property-check")) return "/dashboard/inspections";
  if (matchesPrefix(pathname, "/mobile")) return "/login";
  return "/dashboard";
}
