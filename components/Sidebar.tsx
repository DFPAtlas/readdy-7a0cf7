"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GettingStartedChecklist from "@/components/onboarding/GettingStartedChecklist";

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

const sidebarGroups: NavGroup[] = [
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
      { icon: "ri-line-chart-line", label: "Contractor Perf.", href: "/dashboard/contractor-performance" },
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
    id: "inspections",
    label: "Inspections",
    items: [
      { icon: "ri-clipboard-line", label: "Inspections", href: "/dashboard/inspections" },
      { icon: "ri-store-3-line", label: "Inventory", href: "/dashboard/inventory-marketplace" },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    items: [
      { icon: "ri-folder-line", label: "Documents", href: "/dashboard/documents" },
      { icon: "ri-pen-nib-line", label: "Signatures", href: "/dashboard/signatures" },
      { icon: "ri-file-edit-line", label: "Doc Builder", href: "/dashboard/document-builder" },
    ],
  },
  {
    id: "comms",
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
    id: "more",
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

const adminGroups: NavGroup[] = [
  {
    id: "admin",
    label: "Administration",
    items: [
      { icon: "ri-dashboard-line", label: "Dashboard", href: "/dashboard" },
      { icon: "ri-shield-flash-line", label: "Supa Admin", href: "/dashboard/supa-admin" },
      { icon: "ri-pie-chart-line", label: "Admin Dashboard", href: "/dashboard/admin" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  estate_agent_admin: "Estate Agent Admin",
  estate_agent_staff: "Estate Agent Staff",
  landlord: "Landlord",
  tenant: "Tenant",
  contractor: "Contractor",
};

const roleColors: Record<string, string> = {
  platform_admin: "bg-purple-500",
  estate_agent_admin: "bg-amber-500",
  estate_agent_staff: "bg-blue-500",
  landlord: "bg-emerald-500",
  tenant: "bg-sky-500",
  contractor: "bg-orange-500",
};

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  role,
  userName,
  accountType,
  completedSteps,
  collapsed,
  setCollapsed,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  role: string;
  userName: string;
  accountType: string | null;
  completedSteps: string[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["home", "portfolio"]));

  const isPlatformAdmin = role === "platform_admin";
  const groups = sidebarGroups;

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => isActive(item.href));
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lethub_authenticated");
      localStorage.removeItem("lethub_role");
      localStorage.removeItem("lethub_user");
      localStorage.removeItem("lethub_name");
      localStorage.removeItem("lethub_demo_mode");
      localStorage.removeItem("lethub_account_type");
      const { supabase } = await import("@/lib/supabaseClient");
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 bg-[#FBF9F4] text-[#3A3F3A] flex flex-col transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#EBE5DA]">
          <Link href="/dashboard" className={`${collapsed ? "hidden" : "block"}`}>
            <img
              src="https://public.readdy.ai/ai/img_res/7ce16202-554e-416f-9b5b-269607f415ce.png"
              alt="LetHub"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link href="/dashboard" className={`font-['Pacifico'] text-xl text-[#3A3F3A] ${collapsed ? "block" : "hidden"}`}>
            L
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA] transition-colors ${collapsed ? "mx-auto" : ""}`}
          >
            <i className={collapsed ? "ri-arrow-right-s-line text-sm" : "ri-arrow-left-s-line text-sm"}></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {groups.map((group) => {
            const groupActive = isGroupActive(group);
            const expanded = expandedGroups.has(group.id) || groupActive;

            return (
              <div key={group.id}>
                {!collapsed && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      groupActive ? "text-[#C28A78]" : "text-[#94A3B8]"
                    }`}
                  >
                    <span>{group.label}</span>
                    {expanded ? (
                      <i className="ri-arrow-up-s-line text-xs"></i>
                    ) : (
                      <i className="ri-arrow-down-s-line text-xs"></i>
                    )}
                  </button>
                )}
                {collapsed && (
                  <div className="px-0 py-1">
                    <div className="border-b border-[#EBE5DA] mx-3"></div>
                  </div>
                )}
                <div className={!collapsed && !expanded ? "hidden" : "space-y-0.5"}>
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          active
                            ? "bg-[#C28A78] text-white"
                            : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#EBE5DA]"
                        } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}>
                          <i className={`${item.icon} text-base`}></i>
                        </div>
                        <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
                        {item.badge && !collapsed && (
                          <span className="ml-auto bg-[#C46868] text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {accountType && completedSteps.length > 0 && (
          <div className="border-t border-[#EBE5DA]">
            <GettingStartedChecklist
              accountType={accountType}
              completedIds={completedSteps}
              collapsed={collapsed}
            />
          </div>
        )}

        {isPlatformAdmin && (
          <div className="border-t border-[#EBE5DA] py-2 px-3">
            {!collapsed && (
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-500">
                Platform Admin
              </p>
            )}
            {adminGroups[0].items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-purple-500 text-white"
                      : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#EBE5DA]"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}>
                    <i className={`${item.icon} text-base`}></i>
                  </div>
                  <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="p-3 border-t border-[#EBE5DA]">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#EBE5DA] transition-colors ${collapsed ? "justify-center" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${roleColors[role] || "bg-emerald-500"}`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={collapsed ? "hidden" : "block min-w-0 flex-1"}>
              <p className="text-sm font-medium text-[#3A3F3A] truncate">{userName}</p>
              <p className="text-xs text-[#687068] truncate">{roleLabels[role] || "User"}</p>
            </div>
            <button
              onClick={handleLogout}
              className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA] transition-colors ${collapsed ? "hidden" : "block"}`}
              title="Log out"
            >
              <i className="ri-logout-box-r-line text-[#687068] text-sm"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}