"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { usePortalBranding } from "@/components/PortalBranding";
import EmailOtpLogin from "@/components/auth/EmailOtpLogin";

export default function OwnerLoginPage() {
  const router = useRouter();
  const { branding, primary, primaryHover } = usePortalBranding();

  const handleOtpVerified = async (userId: string): Promise<string | null> => {
    const { data: portalAccess, error: portalError } = await supabase
      .from("owner_portal_access")
      .select("id, landlord_id, is_active")
      .eq("profile_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (portalError || !portalAccess) {
      await supabase.auth.signOut();
      return "No owner portal access was found for this account. Please contact your letting agent.";
    }

    router.push("/owner/dashboard");
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.agencyName} className="h-8 mx-auto object-contain" />
              ) : (
                <span className="font-['Pacifico'] text-3xl" style={{ color: primary }}>{branding.agencyName}</span>
              )}
            </Link>
            <h1 className="text-2xl font-bold text-[#3A3F3A] mt-4">Owner Portal</h1>
            <p className="text-sm text-[#687068] mt-1">Sign in to view your properties and reports</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <EmailOtpLogin
              onVerified={handleOtpVerified}
              primary={primary}
              primaryHover={primaryHover}
              emailPlaceholder="owner@email.com"
              submitLabel="Send login code"
            />

            <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
              <p className="text-xs text-[#94A3B8] mb-2">Received an invite link?</p>
              <Link href="/portal/accept-invite" className="text-sm font-medium hover:underline" style={{ color: primary }}>
                Accept your invite
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href="/login" className="text-xs text-[#687068] hover:text-[#3A3F3A] transition-colors">
              Are you an agent? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}