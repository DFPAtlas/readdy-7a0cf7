"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GettingStartedChecklist from "@/components/onboarding/GettingStartedChecklist";
import AvatarUploader from "@/components/dashboard/AvatarUploader";
import {
  AppRole,
  canAccessDashboardPath,
  getRoleHome,
  isAgencyRole,
  ROLE_LABELS,
} from "@/lib/rbac";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const agencyGroups: NavGroup[] = [
  {
    id: "home",
    label: "Home",
    items: [
      { icon: "ri-dashboard-line", label: "Dashboard", href: "/dashboard" },
      { icon: "ri-rocket-2-line", label: "Setup", href: "/dashboard/setup" },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    items: [
      { icon: "ri-building-4-line", label: "Properties", href: "/dashboard/portfolio" },
      { icon: "ri-file-text-line", label: "Tenancies", href: "/dashboard/tenancies" },
      { icon: "ri-grid-line", label: "Heat Map", href: "/dashboard/portfolio-heatmap" },
      { icon: "ri-brain-line", label: "Portfolio Consultant", href: "/dashboard/portfolio-consultant" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { icon: "ri-user-star-line", label: "Landlords", href: "/dashboard/landlords" },
      { icon: "ri-user-3-line", label: "Tenants", href: "/dashboard/tenants" },
      { icon: "ri-briefcase-line", label: "Contractors", href: "/dashboard/contractors" },
      { icon: "ri-customer-service-2-line", label: "CRM", href: "/dashboard/crm" },
      { icon: "ri-building-2-line", label: "Acquisition", href: "/dashboard/acquisition" },
    ],
  },
  {
    id: "rent",
    label: "Rent & Financials",
    items: [
      { icon: "ri-calendar-schedule-line", label: "Rent Schedule", href: "/dashboard/rent" },
      { icon: "ri-bank-card-line", label: "Rent Collection", href: "/dashboard/rent-collection" },
      { icon: "ri-alarm-warning-line", label: "Arrears", href: "/dashboard/arrears" },
      { icon: "ri-coins-line", label: "Payments", href: "/dashboard/payments" },
      { icon: "ri-bank-line", label: "Open Banking", href: "/dashboard/open-banking" },
      { icon: "ri-funds-box-line", label: "Financial Hub", href: "/dashboard/financial-hub" },
    ],
  },
  {
    id: "maintenance",
    label: "Maintenance",
    items: [
      { icon: "ri-tools-line", label: "Maintenance", href: "/dashboard/maintenance" },
      { icon: "ri-flashlight-line", label: "AI Triage", href: "/dashboard/ai-maintenance-triage" },
      { icon: "ri-file-list-3-line", label: "Quotes", href: "/dashboard/quotes" },
      { icon: "ri-line-chart-line", label: "Contractor Performance", href: "/dashboard/contractor-performance" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    items: [
      { icon: "ri-shield-check-line", label: "Compliance", href: "/dashboard/compliance" },
      { icon: "ri-calendar-check-line", label: "Timeline", href: "/dashboard/compliance-timeline" },
      { icon: "ri-shield-flash-line", label: "Risk Centre", href: "/dashboard/risk-centre" },
      { icon: "ri-brain-line", label: "Compliance Advisor", href: "/dashboard/compliance-advisor" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { icon: "ri-clipboard-line", label: "Inspections", href: "/dashboard/inspections" },
      { icon: "ri-store-3-line", label: "Inventory", href: "/dashboard/inventory-marketplace" },
      { icon: "ri-folder-line", label: "Documents", href: "/dashboard/documents" },
      { icon: "ri-pen-nib-line", label: "Signatures", href: "/dashboard/signatures" },
      { icon: "ri-file-edit-line", label: "Document Builder", href: "/dashboard/document-builder" },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    items: [
      { icon: "ri-message-3-line", label: "Messages", href: "/dashboard/messages", badge: 3 },
      { icon: "ri-notification-3-line", label: "Notifications", href: "/dashboard/notifications" },
      { icon: "ri-macbook-line", label: "Portal Setup", href: "/dashboard/portal-setup" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    items: [
      { icon: "ri-pie-chart-line", label: "Executive", href: "/dashboard/executive" },
      { icon: "ri-bar-chart-grouped-line", label: "BI Dashboard", href: "/dashboard/business-intelligence" },
      { icon: "ri-line-chart-line", label: "Forecasting", href: "/dashboard/forecasting" },
      { icon: "ri-bar-chart-line", label: "Benchmarking", href: "/dashboard/benchmarking" },
      { icon: "ri-file-chart-line", label: "Reports", href: "/dashboard/reports" },
    ],
  },
  {
    id: "tools",
    label: "More Tools",
    items: [
      { icon: "ri-robot-2-line", label: "AI Assistant", href: "/dashboard/ai-assistant", badge: 1 },
      { icon: "ri-brain-line", label: "AI Operations", href: "/dashboard/ai-operations" },
      { icon: "ri-cpu-line", label: "Agent Control", href: "/dashboard/agent-control" },
      { icon: "ri-store-2-line", label: "Marketplace", href: "/dashboard/marketplace" },
      { icon: "ri-file-upload-line", label: "Import", href: "/dashboard/import" },
      { icon: "ri-puzzle-2-line", label: "Integrations", href: "/dashboard/integrations" },
      { icon: "ri-bar-chart-2-line", label: "Accounting", href: "/dashboard/accounting" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { icon: "ri-settings-4-line", label: "Settings", href: "/dashboard/settings" },
      { icon: "ri-bank-card-line", label: "Billing", href: "/dashboard/billing" },
      { icon: "ri-play-circle-line", label: "Help Centre", href: "/help-centre" },
    ],
  },
];

const platformGroups: NavGroup[] = [
  {
    id: "platform",
    label: "Platform Administration",
    items: [
      { icon: "ri-shield-flash-line", label: "Platform Admin", href: "/dashboard/supa-admin" },
      { icon: "ri-pie-chart-line", label: "Admin Dashboard", href: "/dashboard/admin" },
    ],
  },
];

const landlordGroups: NavGroup[] = [
  { id: "home", label: "Home", items: [{ icon: "ri-dashboard-line", label: "Overview", href: "/dashboard/landlord" }] },
  {
    id: "portfolio",
    label: "My Portfolio",
    items: [
      { icon: "ri-home-4-line", label: "Properties", href: "/dashboard/landlord/properties" },
      { icon: "ri-user-3-line", label: "Tenants", href: "/dashboard/landlord/tenants" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { icon: "ri-coins-line", label: "Rent", href: "/dashboard/landlord/rent" },
      { icon: "ri-alarm-warning-line", label: "Arrears", href: "/dashboard/landlord/arrears" },
      { icon: "ri-file-list-3-line", label: "Quotes", href: "/dashboard/landlord/quotes" },
    ],
  },
  {
    id: "property-care",
    label: "Property Care",
    items: [
      { icon: "ri-tools-line", label: "Maintenance", href: "/dashboard/landlord/maintenance" },
      { icon: "ri-clipboard-line", label: "Inspections", href: "/dashboard/landlord/inspections" },
      { icon: "ri-shield-check-line", label: "Compliance", href: "/dashboard/landlord/compliance" },
    ],
  },
  {
    id: "records",
    label: "Records",
    items: [
      { icon: "ri-folder-line", label: "Documents", href: "/dashboard/landlord/documents" },
      { icon: "ri-pen-nib-line", label: "Signatures", href: "/dashboard/landlord/signatures" },
    ],
  },
];

const tenantGroups: NavGroup[] = [
  { id: "home", label: "Home", items: [{ icon: "ri-dashboard-line", label: "Overview", href: "/dashboard/tenant" }] },
  {
    id: "tenancy",
    label: "My Tenancy",
    items: [
      { icon: "ri-coins-line", label: "Rent", href: "/dashboard/tenant/rent" },
      { icon: "ri-alarm-warning-line", label: "Arrears", href: "/dashboard/tenant/arrears" },
      { icon: "ri-tools-line", label: "Maintenance", href: "/dashboard/tenant/maintenance" },
      { icon: "ri-clipboard-line", label: "Inspections", href: "/dashboard/tenant/inspections" },
    ],
  },
  {
    id: "records",
    label: "Records & Support",
    items: [
      { icon: "ri-folder-line", label: "Documents", href: "/dashboard/tenant/documents" },
      { icon: "ri-pen-nib-line", label: "Signatures", href: "/dashboard/tenant/signatures" },
      { icon: "ri-customer-service-2-line", label: "Contact", href: "/dashboard/tenant/contact" },
    ],
  },
];

const contractorGroups: NavGroup[] = [
  { id: "home", label: "Home", items: [{ icon: "ri-dashboard-line", label: "Overview", href: "/dashboard/contractor" }] },
  {
    id: "work",
    label: "Work",
    items: [{ icon: "ri-tools-line", label: "Jobs", href: "/dashboard/contractor/jobs" }],
  },
  {
    id: "records",
    label: "Business Records",
    items: [
      { icon: "ri-folder-line", label: "Documents", href: "/dashboard/contractor/documents" },
      { icon: "ri-pen-nib-line", label: "Signatures", href: "/dashboard/contractor/signatures" },
      { icon: "ri-user-settings-line", label: "Profile", href: "/dashboard/contractor/profile" },
    ],
  },
];

const roleColours: Record<AppRole, string> = {
  platform_admin: "bg-purple-500",
  estate_agent_admin: "bg-amber-500",
  estate_agent_staff: "bg-blue-500",
  landlord: "bg-emerald-500",
  tenant: "bg-sky-500",
  contractor: "bg-orange-500",
  suspended: "bg-red-500",
};

function groupsForRole(role: AppRole): NavGroup[] {
  if (role === "landlord") return landlordGroups;
  if (role === "tenant") return tenantGroups;
  if (role === "contractor") return contractorGroups;

  const filteredAgencyGroups = agencyGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessDashboardPath(role, item.href)),
    }))
    .filter((group) => group.items.length > 0);

  return role === "platform_admin" ? [...platformGroups, ...filteredAgencyGroups] : filteredAgencyGroups;
}

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  role,
  userName,
  accountType,
  completedSteps,
  collapsed,
  setCollapsed,
  headerHidden,
  userId,
  avatarUrl,
  onAvatarUpdate,
}: {
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  role: AppRole;
  userName: string;
  accountType: string | null;
  completedSteps: string[];
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  headerHidden?: boolean;
  userId: string;
  avatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
}) {
  const pathname = usePathname();
  const groups = useMemo(() => groupsForRole(role), [role]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["home", "portfolio", "platform"]));
  const home = getRoleHome(role);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogout = async () => {
    const { deactivateDemoSession } = await import("@/lib/demoMode");
    deactivateDemoSession();
    const { supabase } = await import("@/lib/supabaseClient");
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {mobileOpen && <div className={`fixed inset-0 z-40 bg-black/50 ${headerHidden ? "" : "lg:hidden"}`} onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[#FBF9F4] text-[#3A3F3A] transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"} ${headerHidden ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : (mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}`}>
        <div className="flex h-16 items-center justify-between border-b border-[#EBE5DA] px-4">
          <Link href={home} className={collapsed ? "hidden" : "flex items-center gap-2.5"}>
            <img src="https://readdy.ai/api/search-image?query=A%20sleek%20modern%20minimalist%20logo%20icon%20for%20a%20property%20management%20SaaS%20platform%20featuring%20an%20abstract%20interlocking%20geometric%20building%20shape%20combined%20with%20a%20key%20silhouette%20in%20a%20sophisticated%20dark%20charcoal%20color%20on%20a%20clean%20warm%20off-white%20cream%20background%20professional%20corporate%20identity%20design%20flat%20vector%20style%20no%20text%20no%20letters%20just%20the%20symbol%20icon%20mark&width=96&height=36&seq=1&orientation=landscape" alt="logo" className="h-8 w-auto object-contain" />
            <span className="font-['Pacifico'] text-xl text-[#3A3F3A]">logo</span>
          </Link>
          <Link href={home} className={`flex h-8 w-8 items-center justify-center ${collapsed ? "block" : "hidden"}`}>
            <span className="font-['Pacifico'] text-xl text-[#3A3F3A]">logo</span>
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#EBE5DA] ${collapsed ? "mx-auto" : ""}`} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
            <i className={collapsed ? "ri-arrow-right-s-line" : "ri-arrow-left-s-line"}></i>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {groups.map((group) => {
            const groupActive = group.items.some((item) => isActive(item.href));
            const expanded = expandedGroups.has(group.id) || groupActive;
            return (
              <div key={group.id}>
                {!collapsed && (
                  <button onClick={() => toggleGroup(group.id)} className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider ${groupActive ? "text-[#C28A78]" : "text-[#94A3B8]"}`}>
                    <span>{group.label}</span>
                    <i className={expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}></i>
                  </button>
                )}
                {collapsed && <div className="mx-3 my-1 border-b border-[#EBE5DA]"></div>}
                <div className={!collapsed && !expanded ? "hidden" : "space-y-0.5"}>
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#EBE5DA] hover:text-[#3A3F3A]"} ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center"><i className={`${item.icon} text-base`}></i></span>
                        <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
                        {item.badge && !collapsed && <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#C46868] px-1 text-xs font-bold text-white">{item.badge}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {isAgencyRole(role) && accountType && completedSteps.length > 0 && (
          <div className="border-t border-[#EBE5DA]">
            <GettingStartedChecklist accountType={accountType} completedIds={completedSteps} collapsed={collapsed} />
          </div>
        )}

        <div className="border-t border-[#EBE5DA] p-3">
          <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-[#EBE5DA] ${collapsed ? "justify-center" : ""}`}>
            <AvatarUploader
              userId={userId}
              currentUrl={avatarUrl}
              userName={userName}
              role={role}
              onAvatarUpdate={onAvatarUpdate}
              collapsed={collapsed}
            />
            <div className={collapsed ? "hidden" : "min-w-0 flex-1"}>
              <p className="truncate text-sm font-medium text-[#3A3F3A]">{userName}</p>
              <p className="truncate text-xs text-[#687068]">{ROLE_LABELS[role]}</p>
            </div>
            {!collapsed && (
              <button onClick={handleLogout} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#EBE5DA]" title="Log out">
                <i className="ri-logout-box-r-line text-sm text-[#687068]"></i>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}