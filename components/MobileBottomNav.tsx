import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function useMobileRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lethub_mobile_role");
      setRole(stored || "agent");
    }
  }, []);

  return role;
}

const agentNavItems = [
  { icon: "ri-dashboard-line", label: "Home", href: "/mobile/agent" },
  { icon: "ri-clipboard-line", label: "Inspect", href: "/mobile/inspections" },
  { icon: "ri-tools-line", label: "Jobs", href: "/mobile/maintenance" },
  { icon: "ri-coins-line", label: "Rent", href: "/mobile/rent" },
  { icon: "ri-user-3-line", label: "Account", href: "/mobile/account" },
];

const landlordNavItems = [
  { icon: "ri-dashboard-line", label: "Home", href: "/mobile/landlord" },
  { icon: "ri-tools-line", label: "Jobs", href: "/mobile/maintenance" },
  { icon: "ri-coins-line", label: "Rent", href: "/mobile/rent" },
  { icon: "ri-file-list-3-line", label: "Docs", href: "/mobile/documents" },
  { icon: "ri-user-3-line", label: "Account", href: "/mobile/account" },
];

const tenantNavItems = [
  { icon: "ri-dashboard-line", label: "Home", href: "/mobile/tenant" },
  { icon: "ri-tools-line", label: "Report", href: "/mobile/maintenance/report" },
  { icon: "ri-coins-line", label: "Rent", href: "/mobile/rent" },
  { icon: "ri-file-list-3-line", label: "Docs", href: "/mobile/documents" },
  { icon: "ri-user-3-line", label: "Account", href: "/mobile/account" },
];

const contractorNavItems = [
  { icon: "ri-dashboard-line", label: "Home", href: "/mobile/contractor" },
  { icon: "ri-tools-line", label: "Jobs", href: "/mobile/maintenance" },
  { icon: "ri-file-list-3-line", label: "Quotes", href: "/mobile/quotes" },
  { icon: "ri-qr-scan-line", label: "Scan", href: "/mobile/qr" },
  { icon: "ri-user-3-line", label: "Account", href: "/mobile/account" },
];

const ownerNavItems = [
  { icon: "ri-dashboard-line", label: "Home", href: "/mobile/owner" },
  { icon: "ri-shield-star-line", label: "Health", href: "/mobile/owner" },
  { icon: "ri-coins-line", label: "Rent", href: "/mobile/rent" },
  { icon: "ri-file-list-3-line", label: "Docs", href: "/mobile/documents" },
  { icon: "ri-user-3-line", label: "Account", href: "/mobile/account" },
];

const navItemsByRole: Record<string, Array<{ icon: string; label: string; href: string }>> = {
  agent: agentNavItems,
  owner: ownerNavItems,
  landlord: landlordNavItems,
  tenant: tenantNavItems,
  contractor: contractorNavItems,
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const role = useMobileRole();
  const items = navItemsByRole[role || "agent"];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] px-2 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/mobile" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-colors ${active ? "text-[#C28A78]" : "text-[#94A3B8]"}`}
            >
              <div className={`w-6 h-6 flex items-center justify-center ${active ? "bg-[#C28A78]/10 rounded-lg" : ""}`}>
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
      if (!standalone && !localStorage.getItem("lethub_pwa_dismissed")) {
        setShowInstall(true);
      }

      const handleOnline = () => {
        setIsOnline(true);
        setShowOffline(false);
      };
      const handleOffline = () => {
        setIsOnline(false);
        setShowOffline(true);
      };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) setShowOffline(true);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }

      const biometricEnabled = localStorage.getItem("lethub_biometric_enabled") === "true";
      const biometricPrompted = localStorage.getItem("lethub_biometric_prompted");
      if (biometricEnabled && !biometricPrompted) {
        setShowBiometric(true);
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] max-w-lg mx-auto relative shadow-2xl">
      <div className="h-1 bg-[#C28A78]"></div>

      {showOffline && (
        <div className="bg-[#F59E0B] text-white px-4 py-2 flex items-center justify-center gap-2">
          <i className="ri-wifi-off-line text-sm"></i>
          <p className="text-xs font-medium">You are offline. Some features may be limited.</p>
        </div>
      )}

      {isOnline && !showOffline && typeof window !== "undefined" && !localStorage.getItem("lethub_offline_was") && (
        <div className="hidden"></div>
      )}

      {showBiometric && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
            <div className="w-16 h-16 bg-[#C28A78]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-fingerprint-line text-[#C28A78] text-2xl"></i>
            </div>
            <h3 className="font-semibold text-[#3A3F3A] mb-1">Biometric Login</h3>
            <p className="text-xs text-[#64748B] mb-4">Use Face ID or Touch ID to unlock LetHub</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBiometric(false);
                  localStorage.setItem("lethub_biometric_prompted", "true");
                }}
                className="flex-1 py-2.5 text-sm text-[#64748B] border border-[#E2E8F0] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBiometric(false);
                  localStorage.setItem("lethub_biometric_prompted", "true");
                }}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-[#C28A78] rounded-xl"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstall && !isStandalone && (
        <div className="bg-[#C28A78] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-home-smile-line text-white"></i>
            </div>
            <div>
              <p className="text-xs font-medium">Install LetHub App</p>
              <p className="text-[10px] text-white/70">Add to home screen for quick access</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowInstall(false);
                localStorage.setItem("lethub_pwa_dismissed", "true");
              }}
              className="text-[10px] text-white/70 px-2 py-1"
            >
              Dismiss
            </button>
            <button className="text-xs font-medium bg-white text-[#C28A78] px-3 py-1.5 rounded-lg whitespace-nowrap">
              Install
            </button>
          </div>
        </div>
      )}

      <div className="pb-20">
        {children}
      </div>

      <MobileBottomNav />
    </div>
  );
}