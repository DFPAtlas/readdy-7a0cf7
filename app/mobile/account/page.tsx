"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const accountSections = [
  {
    title: "Profile",
    items: [
      { icon: "ri-user-3-line", label: "Personal Details", value: "Alex Smith" },
      { icon: "ri-building-4-line", label: "Company", value: "LetHub Ltd" },
      { icon: "ri-phone-line", label: "Phone", value: "+44 7700 900123" },
      { icon: "ri-mail-line", label: "Email", value: "alex@lethub.com" },
    ],
  },
  {
    title: "Portals",
    items: [
      { icon: "ri-hammer-line", label: "Contractor Portal", value: "", href: "/mobile/contractor" },
      { icon: "ri-tools-line", label: "Maintenance Jobs", value: "", href: "/mobile/maintenance" },
    ],
  },
  {
    title: "Subscription",
    items: [
      { icon: "ri-vip-crown-line", label: "Current Plan", value: "Professional" },
      { icon: "ri-calendar-line", label: "Next Billing", value: "1 Jul 2026" },
      { icon: "ri-money-pound-circle-line", label: "Amount", value: "£79/month" },
    ],
  },
  {
    title: "Settings",
    items: [
      { icon: "ri-notification-3-line", label: "Push Notifications", value: "On" },
      { icon: "ri-moon-line", label: "Dark Mode", value: "Off" },
      { icon: "ri-fingerprint-line", label: "Biometric Login", value: "On" },
      { icon: "ri-wifi-off-line", label: "Offline Mode", value: "Auto" },
      { icon: "ri-global-line", label: "Language", value: "English (UK)" },
      { icon: "ri-qr-code-line", label: "QR Code Settings", value: "Enabled" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "ri-question-line", label: "Help Centre", value: "" },
      { icon: "ri-chat-3-line", label: "Contact Support", value: "" },
      { icon: "ri-file-list-3-line", label: "Terms of Service", value: "" },
      { icon: "ri-shield-check-line", label: "Privacy Policy", value: "" },
    ],
  },
];

export default function MobileAccountPage() {
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lethub_authenticated");
      localStorage.removeItem("lethub_role");
      localStorage.removeItem("lethub_mobile_role");
      const { deactivateDemoSession } = await import("@/lib/demoMode");
      deactivateDemoSession();
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold">Account</h1>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center text-2xl font-bold mb-3">
            A
          </div>
          <p className="font-semibold text-lg">Alex Smith</p>
          <p className="text-xs text-white/70">Estate Agent · LetHub Ltd</p>
          <span className="mt-2 text-xs text-[#10B981] bg-[#10B981]/20 px-3 py-1 rounded-full font-medium">
            Professional Plan
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 -mt-3 space-y-4 mb-6">
        {accountSections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E8F0]">
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {section.items.map((item, index) => (
                (item as { href?: string }).href ? (
                  <Link
                    key={index}
                    href={(item as { href: string }).href}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-[#C28A78] text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#3A3F3A]">{item.label}</p>
                      {item.value && (
                        <p className="text-xs text-[#94A3B8] mt-0.5">{item.value}</p>
                      )}
                    </div>
                    <i className="ri-arrow-right-s-line text-[#94A3B8] text-sm"></i>
                  </Link>
                ) : (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-[#C28A78] text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#3A3F3A]">{item.label}</p>
                      {item.value && (
                        <p className="text-xs text-[#94A3B8] mt-0.5">{item.value}</p>
                      )}
                    </div>
                    <i className="ri-arrow-right-s-line text-[#94A3B8] text-sm"></i>
                  </button>
                )
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left"
        >
          <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
            <i className="ri-logout-box-r-line text-[#EF4444] text-sm"></i>
          </div>
          <p className="text-sm font-medium text-[#EF4444]">Log Out</p>
        </button>

        <Link
          href="/mobile/role"
          className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left"
          onClick={() => {
            localStorage.removeItem("lethub_mobile_role");
          }}
        >
          <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
            <i className="ri-exchange-line text-[#3B82F6] text-sm"></i>
          </div>
          <p className="text-sm font-medium text-[#3B82F6]">Switch Role</p>
        </Link>

        <p className="text-center text-[10px] text-[#94A3B8] pt-2">
          LetHub Mobile v2.1.0
        </p>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-logout-box-r-line text-[#EF4444] text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#3A3F3A]">Log Out?</h3>
              <p className="text-sm text-[#687068] mt-1">You will need to sign in again to access your account.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-3 text-sm font-medium text-white bg-[#EF4444] rounded-xl whitespace-nowrap"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogout(false)}
                className="w-full py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}