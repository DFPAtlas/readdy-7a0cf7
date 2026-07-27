"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getPlanEntitlements, PlanEntitlements } from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [planName, setPlanName] = useState("Starter");

  useEffect(() => {
    const load = async () => {
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
        setPlanName("Business (Demo)");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      const ent = await getPlanEntitlements(session.user.id);
      setEntitlements(ent);
      setIsReadOnly(ent.isReadOnly);
      setIsTrial(ent.isTrial);
      setPlanName(ent.plan.name);
      setLoading(false);
    };
    load();
  }, []);

  return { entitlements, loading, isReadOnly, isTrial, planName };
}