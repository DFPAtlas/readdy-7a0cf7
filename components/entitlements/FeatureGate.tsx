"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  getPlanEntitlements,
  canUseFeature,
  isReadOnlySubscription,
  PlanEntitlements,
} from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";

const writeFeatures = new Set([
  "add_property",
  "import_portfolio",
  "upload_document",
  "invite_portal",
  "create_maintenance",
  "run_inspection",
  "invite_team",
]);

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
  const [checkFailed, setCheckFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      setLoading(true);
      setCheckFailed(false);
      try {
        if (isDemoAccount()) {
          const demo = await getPlanEntitlements("demo-user");
          if (active) setEntitlements(demo);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user?.id) {
          if (active) {
            setEntitlements(null);
            setCheckFailed(true);
          }
          return;
        }

        const result = await getPlanEntitlements(session.user.id);
        if (active) setEntitlements(result);
      } catch {
        if (active) {
          setEntitlements(null);
          setCheckFailed(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    check();
    return () => {
      active = false;
    };
  }, [featureKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8" aria-label="Checking feature access">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C28A78] border-t-transparent" />
      </div>
    );
  }

  if (checkFailed || !entitlements) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
          <i className="ri-shield-keyhole-line text-red-600" />
        </div>
        <p className="text-sm font-semibold text-red-900">Access could not be verified</p>
        <p className="mt-1 text-xs text-red-700">For security, this feature remains locked until your account permissions can be confirmed.</p>
      </div>
    );
  }

  const allowed = canUseFeature(entitlements, featureKey);
  const readOnlyBlocked = isReadOnlySubscription(entitlements) && writeFeatures.has(featureKey);

  if (!allowed || readOnlyBlocked) {
    if (fallback) return <>{fallback}</>;
    if (!showUpgradePrompt) return null;

    return (
      <div className="relative">
        <div className="pointer-events-none opacity-30" aria-hidden="true">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-sm rounded-xl border border-amber-300 bg-white/95 p-5 text-center shadow-lg backdrop-blur-sm">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <i className="ri-lock-line text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-[#3A3F3A]">
              {readOnlyBlocked ? "Account is read-only" : "Upgrade required"}
            </p>
            <p className="mt-1 text-xs text-[#687068]">{readOnlyBlocked ? "Restore an active Stripe subscription to continue using write features." : "This feature is not included in your current plan."}</p>
            <Link href="/pricing" className="mt-4 inline-block rounded-lg bg-[#C28A78] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B07A69]">
              View plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
