"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/lib/supabaseClient";
import EnsureLandlordRecord from "@/components/EnsureLandlordRecord";
import { isDemoAccount } from "@/lib/demoMode";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("tenant");
  const [userName, setUserName] = useState("Alex Smith");
  const [accountType, setAccountType] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (isDemoAccount()) {
        if (typeof window !== "undefined") {
          setRole(localStorage.getItem("lethub_role") || "estate_agent_admin");
          setUserName(localStorage.getItem("lethub_name") || "Sarah Cooper (Demo)");
          setAccountType(localStorage.getItem("lethub_account_type") || "agency");
          setCompletedSteps(["profile", "portfolio", "properties", "owners"]);
        }
        setReady(true);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, account_type")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setRole(profile.role);
        setUserName(profile.full_name || session.user.email || "User");
        setAccountType((profile as any).account_type || null);
      } else {
        const meta = session.user.user_metadata;
        setRole((meta as any)?.role || "tenant");
        setUserName((meta as any)?.full_name || session.user.email || "User");
      }

      setReady(true);
    };

    checkSession();
  }, [router]);

  const roleLabels: Record<string, string> = {
    platform_admin: "Platform Admin",
    estate_agent_admin: "Estate Agent Admin",
    estate_agent_staff: "Estate Agent Staff",
    landlord: "Landlord",
    tenant: "Tenant",
    contractor: "Contractor",
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#687068]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      <EnsureLandlordRecord />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} role={role} userName={userName} accountType={accountType} completedSteps={completedSteps} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#D5D9D5] h-16 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"
            >
              <i className="ri-menu-line text-[#3A3F3A] text-lg"></i>
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-[#687068]">
              <i className="ri-home-4-line text-xs"></i>
              <span>LetHub</span>
              <i className="ri-arrow-right-s-line text-xs"></i>
              <span className="text-[#3A3F3A] font-medium">{roleLabels[role] || "Dashboard"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA] transition-colors">
              <i className="ri-search-line text-[#3A3F3A] text-lg"></i>
            </button>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#D5D9D5]">
              <div className="w-8 h-8 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[#3A3F3A]">{userName}</p>
                <p className="text-xs text-[#687068]">{roleLabels[role]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}