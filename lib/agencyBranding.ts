"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface AgencyBranding {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColour: string;
  secondaryColour: string;
  customDomain: string | null;
  agencyName: string;
}

const DEFAULT_BRANDING: AgencyBranding = {
  logoUrl: null,
  faviconUrl: null,
  primaryColour: "#1B4332",
  secondaryColour: "#14B8A6",
  customDomain: null,
  agencyName: "LetHub",
};

export function useAgencyBranding(agencyId: string | null): {
  branding: AgencyBranding;
  loading: boolean;
  error: string | null;
} {
  const [branding, setBranding] = useState<AgencyBranding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) {
      setBranding(DEFAULT_BRANDING);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchBranding() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("agencies")
        .select("name, logo_url, favicon_url, primary_colour, secondary_colour, custom_domain")
        .eq("id", agencyId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setBranding(DEFAULT_BRANDING);
      } else if (data) {
        setBranding({
          logoUrl: data.logo_url || null,
          faviconUrl: data.favicon_url || null,
          primaryColour: data.primary_colour || DEFAULT_BRANDING.primaryColour,
          secondaryColour: data.secondary_colour || DEFAULT_BRANDING.secondaryColour,
          customDomain: data.custom_domain || null,
          agencyName: data.name || DEFAULT_BRANDING.agencyName,
        });
      } else {
        setBranding(DEFAULT_BRANDING);
      }

      setLoading(false);
    }

    fetchBranding();

    return () => {
      cancelled = true;
    };
  }, [agencyId]);

  return { branding, loading, error };
}

export function getPortalAgencyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("portal_agency_id");
}

export function getDefaultAgencyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("default_agency_id");
}

export async function fetchAgencyBranding(agencyId: string): Promise<AgencyBranding> {
  const { data, error } = await supabase
    .from("agencies")
    .select("name, logo_url, favicon_url, primary_colour, secondary_colour, custom_domain")
    .eq("id", agencyId)
    .maybeSingle();

  if (error || !data) return DEFAULT_BRANDING;

  return {
    logoUrl: data.logo_url || null,
    faviconUrl: data.favicon_url || null,
    primaryColour: data.primary_colour || DEFAULT_BRANDING.primaryColour,
    secondaryColour: data.secondary_colour || DEFAULT_BRANDING.secondaryColour,
    customDomain: data.custom_domain || null,
    agencyName: data.name || DEFAULT_BRANDING.agencyName,
  };
}

export async function updateAgencyBranding(
  agencyId: string,
  branding: Partial<Pick<AgencyBranding, "logoUrl" | "faviconUrl" | "primaryColour" | "secondaryColour" | "customDomain">>
): Promise<{ success: boolean; error?: string }> {
  const updates: Record<string, string | null> = {};

  if (branding.logoUrl !== undefined) updates.logo_url = branding.logoUrl;
  if (branding.faviconUrl !== undefined) updates.favicon_url = branding.faviconUrl;
  if (branding.primaryColour !== undefined) updates.primary_colour = branding.primaryColour;
  if (branding.secondaryColour !== undefined) updates.secondary_colour = branding.secondaryColour;
  if (branding.customDomain !== undefined) updates.custom_domain = branding.customDomain;

  const { error } = await supabase
    .from("agencies")
    .update(updates)
    .eq("id", agencyId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export function cssVarFromHex(hex: string): string {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return "26 67 50";
  return `${parseInt(match[1], 16)} ${parseInt(match[2], 16)} ${parseInt(match[3], 16)}`;
}