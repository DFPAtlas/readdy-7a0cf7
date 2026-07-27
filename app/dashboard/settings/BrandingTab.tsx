"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getPlanEntitlements } from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";

interface BrandingData {
  logoUrl: string;
  faviconUrl: string;
  primaryColour: string;
  secondaryColour: string;
  customDomain: string;
  agencyName: string;
}

const DEMO_AGENCY_ID = "a0000000-0000-0000-0000-000000000001";

export default function BrandingTab() {
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [branding, setBranding] = useState<BrandingData>({
    logoUrl: "",
    faviconUrl: "",
    primaryColour: "#C28A78",
    secondaryColour: "#14B8A6",
    customDomain: "",
    agencyName: "LetHub",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [entitled, setEntitled] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);

      if (isDemoAccount()) {
        setAgencyId(DEMO_AGENCY_ID);
        const { data } = await supabase
          .from("agencies")
          .select("name, logo_url, favicon_url, primary_colour, secondary_colour, custom_domain")
          .eq("id", DEMO_AGENCY_ID)
          .maybeSingle();

        if (data) {
          setBranding({
            logoUrl: data.logo_url || "",
            faviconUrl: data.favicon_url || "",
            primaryColour: data.primary_colour || "#C28A78",
            secondaryColour: data.secondary_colour || "#14B8A6",
            customDomain: data.custom_domain || "",
            agencyName: data.name || "LetHub",
          });
        }
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: member } = await supabase
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (!member) {
        setEntitled(false);
        setLoading(false);
        return;
      }

      setAgencyId(member.agency_id);

      const plan = await getPlanEntitlements(session.user.id);
      if (!plan.plan.has_white_label_portal) {
        setEntitled(false);
        setLoading(false);
        return;
      }

      const { data: agency } = await supabase
        .from("agencies")
        .select("name, logo_url, favicon_url, primary_colour, secondary_colour, custom_domain")
        .eq("id", member.agency_id)
        .maybeSingle();

      if (agency) {
        setBranding({
          logoUrl: agency.logo_url || "",
          faviconUrl: agency.favicon_url || "",
          primaryColour: agency.primary_colour || "#C28A78",
          secondaryColour: agency.secondary_colour || "#14B8A6",
          customDomain: agency.custom_domain || "",
          agencyName: agency.name || "LetHub",
        });
      }

      setLoading(false);
    }

    init();
  }, []);

  const handleSave = async () => {
    if (!agencyId) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const { error } = await supabase
      .from("agencies")
      .update({
        logo_url: branding.logoUrl || null,
        favicon_url: branding.faviconUrl || null,
        primary_colour: branding.primaryColour,
        secondary_colour: branding.secondaryColour,
        custom_domain: branding.customDomain || null,
      })
      .eq("id", agencyId);

    if (error) {
      setSaveError(error.message);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!entitled) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-lock-line text-[#EF4444] text-lg"></i>
            </div>
          </div>
          <h3 className="font-semibold text-[#3A3F3A] mb-1">White Label Branding</h3>
          <p className="text-sm text-[#687068] mb-4 max-w-sm mx-auto">
            White-label portal branding is available on Business and Enterprise plans. Upgrade to customise the owner and tenant portals with your agency&apos;s branding.
          </p>
          <a href="/dashboard/billing" className="inline-block bg-[#C28A78] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
            Upgrade Plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-8">
      <div>
        <h2 className="font-semibold text-[#3A3F3A]">White Label Branding</h2>
        <p className="text-xs text-[#687068] mt-1">
          Customise how your owner and tenant portals look. Changes apply instantly.
        </p>
      </div>

      {/* Agency Name */}
      <div>
        <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Agency Name</label>
        <p className="text-sm text-[#3A3F3A] font-medium">{branding.agencyName}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">Agency name is set during account creation. Contact support to change it.</p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Logo URL</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="font-['Pacifico'] text-lg text-[#94A3B8]">L</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={branding.logoUrl}
              onChange={(e) => setBranding((b) => ({ ...b, logoUrl: e.target.value }))}
              placeholder="https://your-agency.com/logo.png"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">Enter a URL for your agency logo. Recommended: 200×60px PNG with transparent background.</p>
          </div>
        </div>
      </div>

      {/* Favicon */}
      <div>
        <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Favicon URL</label>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {branding.faviconUrl ? (
              <img src={branding.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
            ) : (
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-globe-line text-[#94A3B8] text-sm"></i>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={branding.faviconUrl}
              onChange={(e) => setBranding((b) => ({ ...b, faviconUrl: e.target.value }))}
              placeholder="https://your-agency.com/favicon.ico"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">Enter a URL for your favicon. Recommended: 32×32px ICO or PNG.</p>
          </div>
        </div>
      </div>

      {/* Colours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Primary Colour</label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={branding.primaryColour}
                onChange={(e) => setBranding((b) => ({ ...b, primaryColour: e.target.value }))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-10 h-10 rounded-lg border-2 border-[#E2E8F0] cursor-pointer flex-shrink-0"
                style={{ backgroundColor: branding.primaryColour }}
              />
            </div>
            <input
              type="text"
              value={branding.primaryColour}
              onChange={(e) => setBranding((b) => ({ ...b, primaryColour: e.target.value }))}
              className="flex-1 px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-mono text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1.5">Used for buttons, links, and header backgrounds on portals.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Secondary Colour</label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={branding.secondaryColour}
                onChange={(e) => setBranding((b) => ({ ...b, secondaryColour: e.target.value }))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-10 h-10 rounded-lg border-2 border-[#E2E8F0] cursor-pointer flex-shrink-0"
                style={{ backgroundColor: branding.secondaryColour }}
              />
            </div>
            <input
              type="text"
              value={branding.secondaryColour}
              onChange={(e) => setBranding((b) => ({ ...b, secondaryColour: e.target.value }))}
              className="flex-1 px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-mono text-[#3A3F3A] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1.5">Used for accents, badges, and highlights on portals.</p>
        </div>
      </div>

      {/* Custom Domain */}
      <div>
        <label className="block text-sm font-medium text-[#3A3F3A] mb-1.5">Custom Domain</label>
        <input
          type="text"
          value={branding.customDomain}
          onChange={(e) => setBranding((b) => ({ ...b, customDomain: e.target.value }))}
          placeholder="portal.your-agency.com"
          className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78] bg-white"
        />
        <p className="text-xs text-[#94A3B8] mt-1.5">Enter your custom domain for the owner and tenant portals. DNS setup instructions will be provided when this feature is enabled.</p>
      </div>

      {/* Portal Preview */}
      <div className="border-t border-[#E2E8F0] pt-6">
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Portal Preview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner Portal Preview */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div
              className="h-12 px-4 flex items-center justify-between"
              style={{ backgroundColor: branding.primaryColour }}
            >
              <div className="flex items-center gap-2">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="h-5 w-auto object-contain" />
                ) : (
                  <span className="font-['Pacifico'] text-sm text-white">{branding.agencyName}</span>
                )}
                <span className="text-[10px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded">Owner Portal</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-user-line text-white text-[10px]"></i>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-[#F8FAFC]">
              <div className="h-3 w-32 rounded" style={{ backgroundColor: branding.primaryColour, opacity: 0.7 }}></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                  <div className="h-2 w-16 bg-[#E2E8F0] rounded mb-2"></div>
                  <div className="h-4 w-12 rounded" style={{ backgroundColor: branding.primaryColour, opacity: 0.8 }}></div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                  <div className="h-2 w-16 bg-[#E2E8F0] rounded mb-2"></div>
                  <div className="h-4 w-12 rounded" style={{ backgroundColor: branding.primaryColour, opacity: 0.8 }}></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-14 bg-white rounded-lg border border-[#E2E8F0] p-2">
                  <div className="h-2 w-20 bg-[#E2E8F0] rounded mb-1.5"></div>
                  <div className="h-2 w-28 bg-[#E2E8F0] rounded opacity-50"></div>
                </div>
                <div className="flex-1 h-14 bg-white rounded-lg border border-[#E2E8F0] p-2" style={{ borderColor: branding.secondaryColour }}>
                  <div className="h-2 w-16 bg-[#E2E8F0] rounded mb-1.5"></div>
                  <div className="h-3 w-8 rounded" style={{ backgroundColor: branding.secondaryColour, opacity: 0.8 }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Portal Preview */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div
              className="h-12 px-4 flex items-center justify-between"
              style={{ backgroundColor: branding.primaryColour }}
            >
              <div className="flex items-center gap-2">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="h-5 w-auto object-contain" />
                ) : (
                  <span className="font-['Pacifico'] text-sm text-white">{branding.agencyName}</span>
                )}
                <span className="text-[10px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded">Tenant Portal</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-3 h-3 flex items-center justify-center">
                  <i className="ri-user-line text-white text-[10px]"></i>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-[#F8FAFC]">
              <div className="h-3 w-32 rounded" style={{ backgroundColor: branding.primaryColour, opacity: 0.7 }}></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                  <div className="h-2 w-16 bg-[#E2E8F0] rounded mb-2"></div>
                  <div className="h-4 w-12 rounded" style={{ backgroundColor: branding.primaryColour, opacity: 0.8 }}></div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-[#E2E8F0]">
                  <div className="h-2 w-16 bg-[#E2E8F0] rounded mb-2"></div>
                  <div className="h-4 w-12 rounded" style={{ backgroundColor: branding.primaryColour, opacity: 0.8 }}></div>
                </div>
              </div>
              <div className="h-16 bg-white rounded-lg border border-[#E2E8F0] p-2 flex gap-2">
                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: branding.secondaryColour, opacity: 0.15 }}></div>
                <div className="flex-1">
                  <div className="h-2 w-24 bg-[#E2E8F0] rounded mb-1.5"></div>
                  <div className="h-2 w-32 bg-[#E2E8F0] rounded opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
        {saveError && (
          <div className="flex items-center gap-2 text-sm text-[#EF4444]">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-error-warning-line text-sm"></i>
            </div>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-[#10B981]">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-check-double-line text-sm"></i>
            </div>
            Branding saved successfully. Portal changes are live.
          </div>
        )}
        {!saveError && !saveSuccess && <div></div>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Branding"}
        </button>
      </div>
    </div>
  );
}