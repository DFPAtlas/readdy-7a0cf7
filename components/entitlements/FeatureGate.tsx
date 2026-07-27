"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getPlanEntitlements, canUseFeature, getUpgradeReason, isReadOnlySubscription, PlanEntitlements } from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";

export default function FeatureGate({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
}: {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}) {
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (isDemoAccount()) {
        setEntitlements({
          plan: {
            id: "demo", slug: "business", name: "Business (Demo)",
            monthly_price: 199, annual_price: 166, trial_days: 999,
            max_properties: null, max_team_members: null, storage_gb: null,
            has_basic_compliance: true, has_full_compliance: true,
            has_ai_assistant: true, has_quote_workflow: true,
            has_contractor_panel: true, has_white_label_portal: true,
            has_api_access: true, has_bulk_operations: true,
            has_financial_tracking: true, has_advanced_analytics: true,
            has_priority_support: true, is_enterprise: false,
          },
          subscription: null, isTrial: false, isReadOnly: false, isDemo: true,
        });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const ent = await getPlanEntitlements(session.user.id);
        setEntitlements(ent);
      }
      setLoading(false);
    };
    check();
  }, [featureKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-5 h-5 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!entitlements) return <>{children}</>;

  const allowed = canUseFeature(entitlements, featureKey);
  const readOnly = isReadOnlySubscription(entitlements);

  if (!allowed || (readOnly && ["add_property", "import_portfolio", "upload_document", "invite_portal", "create_maintenance", "run_inspection", "invite_team"].includes(featureKey))) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="relative group">
        <div className="opacity-40 pointer-events-none">
          {children}
        </div>
        {showUpgradePrompt && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#F59E0B]/40 shadow-lg p-4 max-w-sm text-center">
              <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-lock-line text-[#F59E0B] text-lg"></i>
              </div>
              <p className="text-sm font-medium text-[#3A3F3A] mb-1">
                {readOnly ? "Trial Ended" : "Upgrade Required"}
              </p>
              <p className="text-xs text-[#687068] mb-3">
                {getUpgradeReason(featureKey)}
              </p>
              <Link
                href="/pricing"
                className="inline-block text-xs font-semibold text-white bg-[#C28A78] px-4 py-2 rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap"
              >
                View Plans
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}