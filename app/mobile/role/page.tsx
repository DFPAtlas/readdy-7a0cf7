"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { triggerInstallPrompt, onInstallReady } from "@/components/PWAInstallPrompt";

const roles = [
  { id: "agent", label: "Agent", icon: "ri-briefcase-line", color: "bg-[#C28A78]", desc: "Manage properties & tenants" },
  { id: "owner", label: "Owner", icon: "ri-vip-crown-line", color: "bg-[#8B5CF6]", desc: "Track portfolio health & returns" },
  { id: "landlord", label: "Landlord", icon: "ri-home-4-line", color: "bg-[#14B8A6]", desc: "Track portfolio & income" },
  { id: "tenant", label: "Tenant", icon: "ri-user-line", color: "bg-[#3B82F6]", desc: "Report issues & pay rent" },
  { id: "contractor", label: "Contractor", icon: "ri-tools-line", color: "bg-[#F59E0B]", desc: "Complete jobs & upload quotes" },
];

export default function MobileRolePage() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [installReady, setInstallReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    }

    const unsub = onInstallReady((show) => {
      setInstallReady(show);
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#C28A78] flex flex-col items-center justify-center px-6 relative">
      <div className="h-8"></div>

      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <span className="text-2xl font-bold text-[#C28A78]" style={{ fontFamily: "Pacifico, serif" }}>
          logo
        </span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-1">LetHub</h1>
      <p className="text-sm text-white/70 mb-8 text-center">Mobile-first property management</p>

      <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl text-white text-sm font-medium mb-6 border border-white/20 active:bg-white/20">
        <i className="ri-fingerprint-line text-lg"></i>
        Unlock with Biometric
      </button>

      <div className="w-full space-y-3">
        {roles.map((role) => (
          <Link
            key={role.id}
            href={`/mobile/${role.id}`}
            className="flex items-center gap-4 bg-white rounded-xl p-4 active:scale-[0.98] transition-transform"
            onClick={() => {
              localStorage.setItem("lethub_mobile_role", role.id);
            }}
          >
            <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${role.icon} text-white text-xl`}></i>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-[#3A3F3A]">{role.label}</p>
              <p className="text-xs text-[#687068]">{role.desc}</p>
            </div>
            <i className="ri-arrow-right-s-line text-[#94A3B8] text-xl"></i>
          </Link>
        ))}
      </div>

      {!isStandalone && (
        <div className="mt-6 text-center">
          <p className="text-xs text-white/50 mb-2">Add LetHub to your home screen for the best experience</p>
          <button
            className="px-4 py-2 bg-white text-[#C28A78] rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            onClick={() => {
              if (installReady) {
                triggerInstallPrompt();
              }
            }}
          >
            <i className="ri-download-line"></i>
            Install App
          </button>
        </div>
      )}

      <p className="absolute bottom-4 text-[10px] text-white/40">v3.0.0 · PWA</p>
    </div>
  );
}