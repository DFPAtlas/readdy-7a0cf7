"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SupaAdminClient from "./SupaAdminClient";

type NavEntry = { id: string; label: string; icon: string };
type NavSection = { label: string; items: NavEntry[] };

const navSections: (NavEntry | NavSection)[] = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  {
    label: "Users & Access",
    items: [
      { id: "users", label: "Users & Roles", icon: "ri-group-line" },
      { id: "entities", label: "Entities", icon: "ri-building-4-line" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "properties", label: "Properties", icon: "ri-home-4-line" },
      { id: "compliance", label: "Compliance", icon: "ri-shield-check-line" },
      { id: "maintenance", label: "Maintenance", icon: "ri-tools-line" },
      { id: "documents", label: "Documents", icon: "ri-folder-line" },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "billing", label: "Billing & Stripe", icon: "ri-bank-card-line" },
      { id: "payments", label: "Payments & Rent", icon: "ri-money-pound-circle-line" },
    ],
  },
  {
    label: "Platform",
    items: [
      { id: "n8n", label: "n8n Agents", icon: "ri-cpu-line" },
      { id: "notifications", label: "Notifications", icon: "ri-notification-3-line" },
      { id: "audit", label: "Audit Trail", icon: "ri-shield-keyhole-line" },
      { id: "health", label: "System Health", icon: "ri-heart-pulse-line" },
      { id: "settings", label: "Site Settings", icon: "ri-settings-4-line" },
      { id: "tasks", label: "Admin Tasks", icon: "ri-task-line" },
    ],
  },
];

export default function SupaAdminShell() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (!active) return;
          setUserName((profile as any)?.full_name || data.user.email || "Admin");
          setAvatarUrl((profile as any)?.avatar_url || null);
        });
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const renderNavButton = (item: NavEntry) => (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
        activeTab === item.id
          ? "bg-[#6366F1]/15 text-[#818CF8]"
          : "text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]"
      }`}
    >
      <i className={`${item.icon} text-base`}></i>
      {item.label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0B1220] flex">
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-[264px] bg-[#0D1526] border-r border-[#1E293B] flex flex-col">
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-[#1E293B]">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center flex-shrink-0">
            <i className="ri-terminal-box-line text-white text-lg"></i>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#E2E8F0] tracking-wide whitespace-nowrap">Platform Console</p>
            <p className="text-[10px] text-[#64748B] uppercase tracking-widest">Internal Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) =>
            "items" in section ? (
              <div key={section.label}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => renderNavButton(item))}
                </div>
              </div>
            ) : (
              renderNavButton(section)
            )
          )}
        </nav>

        <div className="border-t border-[#1E293B] p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-base"></i>
            Back to dashboard
          </Link>
        </div>
      </aside>

      <div className="flex-1 ml-[264px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-[#0D1526]/95 backdrop-blur border-b border-[#1E293B] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
              <i className="ri-shield-flash-line text-sm"></i>
              Platform Admin
            </span>
            <span className="text-xs text-[#64748B] hidden md:inline whitespace-nowrap">
              All actions are logged to the audit trail
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap"
            >
              <i className="ri-external-link-line text-base"></i>
              View site
            </Link>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#1E293B]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[#E2E8F0]">{userName}</p>
                <p className="text-xs text-[#64748B]">Site Owner</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#1E293B]"
              title="Sign out"
            >
              <i className="ri-logout-box-r-line text-base text-[#94A3B8]"></i>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <SupaAdminClient activeTab={activeTab} onNavigate={setActiveTab} />
        </main>
      </div>
    </div>
  );
}