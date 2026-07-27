"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import EnsureLandlordRecord from "@/components/EnsureLandlordRecord";
import RoleAccessDenied from "@/components/RoleAccessDenied";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import {
  AppRole,
  canAccessDashboardPath,
  getRoleHome,
  normaliseRole,
  ROLE_LABELS,
} from "@/lib/rbac";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [userName, setUserName] = useState("User");
  const [accountType, setAccountType] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [accessError, setAccessError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      setReady(false);
      setAccessError("");

      if (isDemoAccount()) {
        if (!active) return;
        // Demo access is deliberately fixed. Local storage must never grant another role.
        setRole("estate_agent_admin");
        setUserName("Sarah Cooper (Demo)");
        setAccountType("agency");
        setCompletedSteps(["profile", "portfolio", "properties", "owners"]);
        setReady(true);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role, account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError || !profile) {
        setAccessError("Your authenticated account does not have a configured LetHub profile. Please contact support.");
        setReady(true);
        return;
      }

      const trustedRole = normaliseRole(profile.role);
      if (!trustedRole || trustedRole === "suspended") {
        setRole(trustedRole || null);
        setAccessError(
          trustedRole === "suspended"
            ? "This account has been suspended. Please contact a platform administrator."
            : "Your account role is missing or invalid. Please contact a platform administrator.",
        );
        setReady(true);
        return;
      }

      setRole(trustedRole);
      setUserName(profile.full_name || user.email || "User");
      setAccountType(profile.account_type || null);
      setReady(true);
    };

    checkSession();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!ready || !role || accessError) return;
    const usesDedicatedPortalHome = role === "landlord" || role === "tenant" || role === "contractor";
    if (usesDedicatedPortalHome && pathname === "/dashboard") {
      router.replace(getRoleHome(role));
    }
  }, [accessError, pathname, ready, role, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#687068]">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (accessError || !role) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-[#FECACA] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
            <i className="ri-user-forbid-line text-2xl text-[#DC2626]"></i>
          </div>
          <h1 className="text-xl font-bold text-[#3A3F3A]">Account access unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#687068]">{accessError || "Your account could not be authorised."}</p>
          <button
            onClick={handleSignOut}
            className="mt-6 rounded-lg bg-[#C28A78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#B07A69]"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const usesDedicatedPortalHome = role === "landlord" || role === "tenant" || role === "contractor";
  const redirectingToRoleHome = usesDedicatedPortalHome && pathname === "/dashboard";
  if (redirectingToRoleHome) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <p className="text-sm text-[#687068]">Opening your dashboard...</p>
      </div>
    );
  }

  const routeAllowed = canAccessDashboardPath(role, pathname);

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      {role === "landlord" && <EnsureLandlordRecord />}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        role={role}
        userName={userName}
        accountType={accountType}
        completedSteps={completedSteps}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
        <header className="sticky top-0 z-30 bg-white border-b border-[#D5D9D5] h-16 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"
              aria-label="Open navigation"
            >
              <i className="ri-menu-line text-[#3A3F3A] text-lg"></i>
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-[#687068]">
              <i className="ri-home-4-line text-xs"></i>
              <span>LetHub</span>
              <i className="ri-arrow-right-s-line text-xs"></i>
              <span className="text-[#3A3F3A] font-medium">{ROLE_LABELS[role]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA] transition-colors" aria-label="Search">
              <i className="ri-search-line text-[#3A3F3A] text-lg"></i>
            </button>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#D5D9D5]">
              <div className="w-8 h-8 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[#3A3F3A]">{userName}</p>
                <p className="text-xs text-[#687068]">{ROLE_LABELS[role]}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {routeAllowed ? children : <RoleAccessDenied role={role} />}
        </main>
      </div>
    </div>
  );
}
