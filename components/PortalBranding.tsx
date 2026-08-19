"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AgencyBranding } from "@/lib/agencyBranding";

const DEMO_AGENCY_ID = "a0000000-0000-0000-0000-000000000001";

const DEFAULT: AgencyBranding = {
  logoUrl: null,
  faviconUrl: null,
  primaryColour: "#C28A78",
  secondaryColour: "#14B8A6",
  customDomain: null,
  agencyName: "LetHub",
};

function darkerHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lighterHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function usePortalBranding(): {
  branding: AgencyBranding;
  loading: boolean;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryBg: string;
  secondary: string;
  secondaryLight: string;
} {
  const [branding, setBranding] = useState<AgencyBranding>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const agencyId =
        (typeof window !== "undefined" ? localStorage.getItem("portal_agency_id") : null) ||
        DEMO_AGENCY_ID;

      const { data } = await supabase
        .from("agencies")
        .select("name, logo_url, favicon_url, primary_colour, secondary_colour, custom_domain")
        .eq("id", agencyId)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setBranding({
          logoUrl: data.logo_url || null,
          faviconUrl: data.favicon_url || null,
          primaryColour: data.primary_colour || DEFAULT.primaryColour,
          secondaryColour: data.secondary_colour || DEFAULT.secondaryColour,
          customDomain: data.custom_domain || null,
          agencyName: data.name || DEFAULT.agencyName,
        });
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const primary = branding.primaryColour;
  const primaryHover = darkerHex(primary, 30);
  const primaryLight = lighterHex(primary, 180);
  const primaryBg = lighterHex(primary, 230);
  const secondary = branding.secondaryColour;
  const secondaryLight = lighterHex(secondary, 200);

  return { branding, loading, primary, primaryHover, primaryLight, primaryBg, secondary, secondaryLight };
}

export function PortalBrandingHeader({
  portalLabel,
  onLogout,
  extra,
  menuOpen,
  onMenuToggle,
}: {
  portalLabel: string;
  onLogout: () => void;
  extra?: React.ReactNode;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}) {
  const { branding, loading, primary } = usePortalBranding();
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > 80 && !menuOpen) {
        setHeaderHidden(currentY > lastScrollY.current);
      } else {
        setHeaderHidden(false);
      }
      lastScrollY.current = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  return (
    <>
      {headerHidden && onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="fixed left-4 top-4 z-40 w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-lg border border-[#D5D9D5] hover:bg-[#F1F5F9] transition-all duration-300"
          aria-label="Open navigation"
        >
          <i className="ri-menu-line text-[#3A3F3A] text-lg"></i>
        </button>
      )}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${headerHidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'bg-white/95 shadow-[0_1px_20px_rgba(0,0,0,0.06)]' : 'bg-white'} border-b ${scrolled ? 'border-[#D5D9D5]' : 'border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {portalLabel.includes("Owner") ? (
              <Link href="/owner/dashboard" className="flex items-center gap-2">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt={branding.agencyName} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="font-['Pacifico'] text-xl" style={{ color: primary }}>{branding.agencyName}</span>
                )}
              </Link>
            ) : (
              <Link href="/tenant/dashboard" className="flex items-center gap-2">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt={branding.agencyName} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="font-['Pacifico'] text-xl" style={{ color: primary }}>{branding.agencyName}</span>
                )}
              </Link>
            )}
            <span className="hidden sm:inline text-xs font-medium text-[#687068] bg-[#F1F5F9] px-2.5 py-1 rounded-full">{portalLabel}</span>
          </div>

          {onMenuToggle && (
            <button onClick={onMenuToggle} className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
              <i className={`${menuOpen ? "ri-close-line" : "ri-menu-line"} text-[#3A3F3A]`}></i>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-3">
            {extra}
            <button
              onClick={onLogout}
              className="text-sm text-[#687068] hover:text-[#EF4444] transition-colors flex items-center gap-1"
            >
              <i className="ri-logout-box-r-line text-xs"></i>
              Sign Out
            </button>
          </div>
        </div>

        {menuOpen && onMenuToggle && (
          <div className="sm:hidden px-4 pb-4 border-t border-[#D5D9D5] bg-white">
            <div className="flex items-center justify-between py-3">
              {extra}
              <button onClick={onLogout} className="text-sm text-[#EF4444] flex items-center gap-1">
                <i className="ri-logout-box-r-line text-xs"></i>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export function getPortalStyles(primary: string, primaryHover: string, primaryLight: string, primaryBg: string) {
  return {
    primaryBtn: {
      backgroundColor: primary,
      color: "#FFFFFF",
    } as React.CSSProperties,
    primaryBtnHover: {
      backgroundColor: primaryHover,
    } as React.CSSProperties,
    primaryText: {
      color: primary,
    } as React.CSSProperties,
    primaryBorder: {
      borderColor: primary,
      outlineColor: primary,
    } as React.CSSProperties,
    primaryBg: {
      backgroundColor: primaryBg,
    } as React.CSSProperties,
    primaryLightBg: {
      backgroundColor: primaryLight,
    } as React.CSSProperties,
  };
}