"use client";

import { useEffect, useState, useRef } from "react";
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
  isAgencyRole,
  normaliseRole,
  ROLE_LABELS,
} from "@/lib/rbac";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [accessError, setAccessError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        if (isDemoAccount()) {
          if (!active) return;
          setRole("estate_agent_admin");
          setUserName("Sarah Cooper (Demo)");
          setAccountType("agency");
          setCompletedSteps(["profile", "portfolio", "properties", "owners"]);
          setReady(true);
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        const user = userData.user;

        if (!active) return;

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role, account_type, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        if (profileError || !profile) {
          setAccessError("Your authenticated account does not have a configured profile. Please contact support.");
          setReady(true);
          return;
        }

        const trustedRole = normaliseRole(profile.role);
        if (!active) return;
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

        if (!active) return;
        setRole(trustedRole);
        setUserName(profile.full_name || user.email || "User");
        setUserId(user.id);
        setAvatarUrl((profile as any).avatar_url || null);
        setAccountType(profile.account_type || null);
        setReady(true);
      } catch {
        if (!active) return;
        setAccessError("Something went wrong while verifying your account. Please refresh the page or sign in again.");
        setReady(true);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !role || accessError) return;
    const usesDedicatedPortalHome = role === "landlord" || role === "tenant" || role === "contractor";
    if (usesDedicatedPortalHome && pathname === "/dashboard") {
      router.replace(getRoleHome(role));
    }
  }, [accessError, pathname, ready, role]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > 80 && currentY > lastScrollY.current) {
        setHeaderHidden(true);
      } else if (currentY < 50) {
        setHeaderHidden(false);
        setMobileOpen(false);
      }
      lastScrollY.current = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  const showSidebar = isAgencyRole(role);

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      {role === "landlord" && <EnsureLandlordRecord />}
      {showSidebar && (
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          role={role}
          userName={userName}
          accountType={accountType}
          completedSteps={completedSteps}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          headerHidden={headerHidden}
          userId={userId}
          avatarUrl={avatarUrl}
          onAvatarUpdate={(url) => setAvatarUrl(url)}
        />
      )}

      <div className={`min-h-screen flex flex-col transition-all duration-300 ${showSidebar ? (headerHidden ? "" : (collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]")) : ""}`}>
        {showSidebar && headerHidden && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed left-4 top-4 z-40 w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-lg border border-[#D5D9D5] hover:bg-[#EBE5DA] transition-all duration-300"
            aria-label="Open navigation"
          >
            <i className="ri-menu-line text-[#3A3F3A] text-lg"></i>
          </button>
        )}
        <header className={`sticky top-0 z-30 h-16 px-4 lg:px-6 flex items-center justify-between transition-all duration-300 ${headerHidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'bg-white/95 shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-[#D5D9D5]' : 'bg-white border-transparent'} border-b`}>
          <div className="flex items-center gap-3">
            {showSidebar && (
              <button
                onClick={() => setMobileOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBE5DA]"
                aria-label="Open navigation"
              >
                <i className="ri-menu-line text-[#3A3F3A] text-lg"></i>
              </button>
            )}
            <div className="hidden md:flex items-center gap-2 text-sm text-[#687068]">
              <i className="ri-home-4-line text-xs"></i>
              <span>Dashboard</span>
              <i className="ri-arrow-right-s-line text-xs"></i>
              <span className="text-[#3A3F3A] font-medium">{ROLE_LABELS[role]}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => { setSearchOpen(v => !v); setSearchQuery(''); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${searchOpen ? 'bg-[#C28A78]/10 text-[#C28A78]' : 'hover:bg-[#EBE5DA] text-[#3A3F3A]'}`}
                aria-label="Search"
              >
                <i className="ri-search-line text-lg"></i>
              </button>

              {searchOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSearchOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-xl shadow-xl border border-[#D5D9D5] overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#D5D9D5]">
                      <i className="ri-search-line text-[#94A3B8] text-sm flex-shrink-0"></i>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search pages, features..."
                        className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="w-4 h-4 flex items-center justify-center cursor-pointer">
                          <i className="ri-close-line text-[#94A3B8] text-xs"></i>
                        </button>
                      )}
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto">
                      {([
                        { label: 'Dashboard', href: '/dashboard', icon: 'ri-dashboard-line', desc: 'Overview & KPIs' },
                        { label: 'Properties', href: '/dashboard/portfolio', icon: 'ri-building-line', desc: 'Portfolio management' },
                        { label: 'Tenancies', href: '/dashboard/tenancies', icon: 'ri-file-list-3-line', desc: 'Active & past tenancies' },
                        { label: 'Tenants', href: '/dashboard/tenants', icon: 'ri-user-line', desc: 'Tenant records' },
                        { label: 'Landlords', href: '/dashboard/landlords', icon: 'ri-home-2-line', desc: 'Landlord contacts' },
                        { label: 'Maintenance', href: '/dashboard/maintenance', icon: 'ri-tools-line', desc: 'Jobs & repairs' },
                        { label: 'Compliance', href: '/dashboard/compliance', icon: 'ri-shield-check-line', desc: 'Certificates & checks' },
                        { label: 'Documents', href: '/dashboard/documents', icon: 'ri-file-text-line', desc: 'All documents' },
                        { label: 'Rent', href: '/dashboard/rent', icon: 'ri-money-pound-circle-line', desc: 'Rent collection' },
                        { label: 'Arrears', href: '/dashboard/arrears', icon: 'ri-error-warning-line', desc: 'Outstanding payments' },
                        { label: 'CRM', href: '/dashboard/crm', icon: 'ri-user-star-line', desc: 'Leads & pipeline' },
                        { label: 'Inspections', href: '/dashboard/inspections', icon: 'ri-eye-line', desc: 'Property inspections' },
                        { label: 'Messages', href: '/dashboard/messages', icon: 'ri-message-3-line', desc: 'Communications' },
                        { label: 'Contractors', href: '/dashboard/contractors', icon: 'ri-hammer-line', desc: 'Contractor marketplace' },
                        { label: 'Reports', href: '/dashboard/reports', icon: 'ri-bar-chart-line', desc: 'Analytics & exports' },
                        { label: 'Settings', href: '/dashboard/settings', icon: 'ri-settings-3-line', desc: 'Account & preferences' },
                      ].filter(item =>
                        !searchQuery.trim() ||
                        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
                      )).map(item => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FBF9F4] transition-colors cursor-pointer"
                        >
                          <div className="w-7 h-7 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className={`${item.icon} text-[#C28A78] text-sm`}></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#3A3F3A]">{item.label}</p>
                            <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                          </div>
                        </a>
                      ))}
                      {searchQuery.trim() && ![
                        { label: 'Dashboard', desc: 'Overview & KPIs' },
                        { label: 'Properties', desc: 'Portfolio management' },
                        { label: 'Tenancies', desc: 'Active & past tenancies' },
                        { label: 'Tenants', desc: 'Tenant records' },
                        { label: 'Landlords', desc: 'Landlord contacts' },
                        { label: 'Maintenance', desc: 'Jobs & repairs' },
                        { label: 'Compliance', desc: 'Certificates & checks' },
                        { label: 'Documents', desc: 'All documents' },
                        { label: 'Rent', desc: 'Rent collection' },
                        { label: 'Arrears', desc: 'Outstanding payments' },
                        { label: 'CRM', desc: 'Leads & pipeline' },
                        { label: 'Inspections', desc: 'Property inspections' },
                        { label: 'Messages', desc: 'Communications' },
                        { label: 'Contractors', desc: 'Contractor marketplace' },
                        { label: 'Reports', desc: 'Analytics & exports' },
                        { label: 'Settings', desc: 'Account & preferences' },
                      ].some(i =>
                        i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        i.desc.toLowerCase().includes(searchQuery.toLowerCase())
                      ) && (
                        <p className="text-sm text-[#94A3B8] text-center py-6">No results for &quot;{searchQuery}&quot;</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#D5D9D5]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
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