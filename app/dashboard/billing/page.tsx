"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { getPlanEntitlements, PlanEntitlements, getPropertyLimit, getTeamLimit, getStorageLimit } from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";
import { invoices, usageData } from "@/app/pricing/PricingData";

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : "";

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutSuccess = searchParams.get("checkout") === "success";

  const [showChangePlan, setShowChangePlan] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [propertyCount, setPropertyCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
        setPropertyCount(42);
        setTeamCount(3);
        setStorageUsed(12.4);
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

      const { count: propCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });

      setPropertyCount(propCount || 0);
      setTeamCount(1);
      setStorageUsed(0);

      setLoading(false);
    };
    loadData();
  }, []);

  const handleUpgrade = async (planSlug: string, billingCycle: string) => {
    if (isDemoAccount()) {
      alert("This is a demo account. This action is disabled to protect live data.");
      return;
    }

    setProcessingPayment(true);
    setCheckoutError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setCheckoutError("You must be logged in to upgrade.");
        setProcessingPayment(false);
        return;
      }

      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/create-subscription-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan_slug: planSlug, billing_cycle: billingCycle }),
      });

      const result = await res.json();

      if (!res.ok) {
        setCheckoutError(result.error || "Failed to start checkout. Please try again.");
        setProcessingPayment(false);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        setCheckoutError("No checkout URL returned. Please try again.");
        setProcessingPayment(false);
      }
    } catch (err) {
      setCheckoutError("Network error. Please check your connection and try again.");
      setProcessingPayment(false);
    }
  };

  const handleBillingPortal = async () => {
    if (isDemoAccount()) {
      alert("This is a demo account. This action is disabled.");
      return;
    }
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/create-billing-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });
      const result = await res.json();
      if (result.url) {
        window.open(result.url, "_blank");
      } else {
        setCheckoutError(result.error || "Failed to open billing portal");
      }
    } catch {
      setCheckoutError("Network error. Please try again.");
    }
    setPortalLoading(false);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!entitlements) {
    return (
      <DashboardShell>
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-[#EF4444] text-2xl"></i>
          </div>
          <h2 className="text-lg font-semibold text-[#3A3F3A] mb-2">No subscription found</h2>
          <p className="text-sm text-[#687068] mb-4">Please set up your subscription to access billing.</p>
          <Link href="/pricing" className="inline-block text-sm font-semibold text-white bg-[#C28A78] px-5 py-2.5 rounded-lg hover:bg-[#143828] whitespace-nowrap">
            View Plans
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const { plan, subscription, isTrial, isReadOnly, isDemo } = entitlements;
  const propertyLimit = getPropertyLimit(entitlements);
  const teamLimit = getTeamLimit(entitlements);
  const storageLimit = getStorageLimit(entitlements);
  const propertyPercent = propertyLimit > 0 ? (propertyCount / propertyLimit) * 100 : 0;
  const teamPercent = teamLimit > 0 ? (teamCount / teamLimit) * 100 : 0;
  const storagePercent = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;
  const trialEndDate = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  const nextBillingDate = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  const billingCycle = subscription?.billing_cycle || "monthly";
  const status = subscription?.status || "N/A";
  const subscriptionAmount = billingCycle === "annual" ? (plan.annual_price || plan.monthly_price || 0) : (plan.monthly_price || 0);
  const hasStripeSub = !!(subscription as any)?.stripe_subscription_id;
  const stripeCustomerId = (subscription as any)?.stripe_customer_id;

  const statusBadge = isTrial ? { text: "Trial", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" }
    : isReadOnly ? { text: "Read Only", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" }
    : isDemo ? { text: "Demo", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" }
    : status === "active" ? { text: "Active", color: "text-[#10B981]", bg: "bg-[#10B981]/10" }
    : { text: status, color: "text-[#687068]", bg: "bg-[#687068]/10" };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {checkoutSuccess && (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-checkbox-circle-line text-[#059669] text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#065F46]">
                Checkout completed! Your subscription is being set up.
              </p>
              <p className="text-xs text-[#047857] mt-1">
                It may take a few moments for your subscription to activate. Refresh the page if needed.
              </p>
            </div>
            <button
              onClick={() => router.replace("/dashboard/billing")}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <i className="ri-close-line text-[#059669]"></i>
            </button>
          </div>
        )}

        {checkoutError && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-error-warning-line text-[#DC2626] text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#991B1B]">{checkoutError}</p>
            </div>
            <button
              onClick={() => setCheckoutError("")}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <i className="ri-close-line text-[#DC2626]"></i>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Billing & Subscription</h1>
            <p className="text-sm text-[#687068] mt-1">Manage your plan, payments, and usage</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${statusBadge.color} ${statusBadge.bg} px-3 py-1.5 rounded-lg font-medium`}>
              <i className={`${isTrial ? "ri-timer-line" : "ri-shield-check-line"} mr-1`}></i>
              {isTrial ? "Trial Active" : statusBadge.text}
            </span>
          </div>
        </div>

        {isTrial && trialEndDate && (
          <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-timer-line text-[#D97706] text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#92400E]">
                Your 14-day free trial ends on {trialEndDate}
              </p>
              <p className="text-xs text-[#A16207] mt-1">
                After the trial, your account will become read-only. Subscribe to keep full access.
              </p>
            </div>
            <Link href="/pricing" className="text-xs font-semibold text-[#D97706] border border-[#D97706] px-3 py-1.5 rounded-lg hover:bg-[#FEF3C7] whitespace-nowrap">
              Subscribe Now
            </Link>
          </div>
        )}

        {isReadOnly && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-error-warning-line text-[#DC2626] text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#991B1B]">
                Your trial has ended. Account is now read-only.
              </p>
              <p className="text-xs text-[#B91C1C] mt-1">
                Upgrade your plan to continue creating properties, uploading documents, and managing portals.
              </p>
            </div>
            <Link href="/pricing" className="text-xs font-semibold text-[#DC2626] border border-[#DC2626] px-3 py-1.5 rounded-lg hover:bg-[#FEF2F2] whitespace-nowrap">
              Upgrade Plan
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C28A78] rounded-lg flex items-center justify-center">
                  <i className="ri-vip-crown-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="font-semibold text-[#3A3F3A]">
                    {plan.name} Plan
                  </h2>
                  <p className="text-xs text-[#687068]">
                    {billingCycle === "annual" ? "Annual" : "Monthly"} billing
                    {nextBillingDate ? ` · Next charge ${nextBillingDate}` : ""}
                    {isTrial ? " · Trial period" : ""}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-semibold ${statusBadge.color} ${statusBadge.bg} px-3 py-1 rounded-full`}>
                {statusBadge.text}
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-[#FBF9F4] rounded-xl">
                <p className="text-2xl font-bold text-[#3A3F3A]">
                  {isTrial ? "Free" : `£${subscriptionAmount}`}
                </p>
                <p className="text-xs text-[#687068] mt-1">
                  {isTrial ? "Trial period" : "per month"}
                </p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {isTrial ? `Ends ${trialEndDate}` : `Billed ${billingCycle}`}
                </p>
              </div>
              <div className="text-center p-4 bg-[#FBF9F4] rounded-xl">
                <p className="text-2xl font-bold text-[#3A3F3A]">{propertyCount}</p>
                <p className="text-xs text-[#687068] mt-1">of {propertyLimit === 9999 ? "Unlimited" : propertyLimit} properties</p>
                {propertyLimit < 9999 && (
                  <div className="w-full h-1.5 bg-[#D5D9D5] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#C28A78] rounded-full" style={{ width: `${Math.min(propertyPercent, 100)}%` }}></div>
                  </div>
                )}
              </div>
              <div className="text-center p-4 bg-[#FBF9F4] rounded-xl">
                <p className="text-2xl font-bold text-[#3A3F3A]">{teamCount}</p>
                <p className="text-xs text-[#687068] mt-1">of {teamLimit === 9999 ? "Unlimited" : teamLimit} team members</p>
                {teamLimit < 9999 && (
                  <div className="w-full h-1.5 bg-[#D5D9D5] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${Math.min(teamPercent, 100)}%` }}></div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-center justify-between p-4 bg-[#FBF9F4] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-hard-drive-3-line text-[#8B5CF6] text-lg"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">Storage</p>
                    <p className="text-xs text-[#687068]">{storageUsed} GB of {storageLimit === 9999 ? "Unlimited" : `${storageLimit} GB`} used</p>
                  </div>
                </div>
                {storageLimit < 9999 && (
                  <div className="w-32">
                    <div className="w-full h-2 bg-[#D5D9D5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${Math.min(storagePercent, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-[#94A3B8] text-right mt-1">{Math.round(storagePercent)}%</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowChangePlan(true)}
                className="px-4 py-2.5 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-up-down-line mr-1"></i>
                Change Plan
              </button>
              {hasStripeSub && stripeCustomerId && (
                <button
                  onClick={handleBillingPortal}
                  disabled={portalLoading}
                  className="px-4 py-2.5 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-lg hover:bg-[#FBF9F4] transition-colors whitespace-nowrap"
                >
                  <i className="ri-bank-card-line mr-1"></i>
                  Update Payment Method
                </button>
              )}
              {!isTrial && hasStripeSub && (
                <button
                  onClick={handleBillingPortal}
                  disabled={portalLoading}
                  className="px-4 py-2.5 text-sm font-medium text-[#EF4444] border border-[#EF4444]/30 rounded-lg hover:bg-[#EF4444]/5 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  <i className="ri-close-circle-line mr-1"></i>
                  Cancel Subscription
                </button>
              )}
              {hasStripeSub && (
                <button
                  onClick={handleBillingPortal}
                  disabled={portalLoading}
                  className="px-4 py-2.5 text-sm font-medium text-[#3B82F6] border border-[#3B82F6]/30 rounded-lg hover:bg-[#3B82F6]/5 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  <i className="ri-external-link-line mr-1"></i>
                  {portalLoading ? "Opening..." : "Manage Billing"}
                </button>
              )}
              {(isTrial || isReadOnly) && (
                <button
                  onClick={() => window.location.href = "/pricing"}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-[#C28A78] rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
                >
                  <i className="ri-arrow-up-circle-line mr-1"></i>
                  Upgrade Plan
                </button>
              )}

            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h3 className="font-semibold text-[#3A3F3A] mb-4">Payment Method</h3>
            <div className="flex items-center gap-3 p-4 bg-[#FBF9F4] rounded-xl mb-4">
              <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                <i className="ri-bank-card-line text-[#F59E0B] text-lg"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3A3F3A]">Visa ending in 4242</p>
                <p className="text-xs text-[#687068]">Expires 09/27</p>
              </div>
              <span className="text-xs text-[#10B981] font-medium">Default</span>
            </div>
            <button className="w-full text-sm font-medium text-[#C28A78] border border-[#D5D9D5] rounded-lg py-2.5 hover:bg-[#FBF9F4] transition-colors whitespace-nowrap">
              <i className="ri-add-line mr-1"></i>
              Add Payment Method
            </button>

            <div className="mt-6 pt-4 border-t border-[#D5D9D5]">
              <h4 className="text-xs font-semibold text-[#687068] uppercase tracking-wider mb-3">Plan Features</h4>
              <ul className="space-y-2">
                {[
                  { key: "ai_assistant", label: "AI Assistant", check: plan.has_ai_assistant },
                  { key: "quote_workflow", label: "Quote Workflow", check: plan.has_quote_workflow },
                  { key: "contractor_panel", label: "Contractor Panel", check: plan.has_contractor_panel },
                  { key: "full_compliance", label: "Full Compliance", check: plan.has_full_compliance },
                  { key: "white_label_portal", label: "White-label Portal", check: plan.has_white_label_portal },
                  { key: "api_access", label: "API Access", check: plan.has_api_access },
                  { key: "bulk_operations", label: "Bulk Operations", check: plan.has_bulk_operations },
                  { key: "financial_tracking", label: "Financial Tracking", check: plan.has_financial_tracking },
                  { key: "advanced_analytics", label: "Advanced Analytics", check: plan.has_advanced_analytics },
                ].map((feat) => (
                  <li key={feat.key} className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 flex items-center justify-center">
                      {feat.check ? (
                        <i className="ri-check-line text-[#10B981] text-xs"></i>
                      ) : (
                        <i className="ri-close-line text-[#94A3B8] text-xs"></i>
                      )}
                    </div>
                    <span className={feat.check ? "text-[#475569]" : "text-[#94A3B8]"}>{feat.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
            <h2 className="font-semibold text-[#3A3F3A]">Usage Overview</h2>
            <span className="text-xs text-[#687068]">Last 6 months</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Properties Added", value: "+8", icon: "ri-building-4-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
                { label: "Documents Uploaded", value: "102", icon: "ri-file-upload-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
                { label: "Maintenance Jobs", value: "65", icon: "ri-tools-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                { label: "Total Invoices", value: "£474", icon: "ri-money-pound-circle-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#FBF9F4] rounded-xl p-4 text-center">
                  <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                  </div>
                  <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                  <p className="text-xs text-[#687068] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {usageData.map((item) => (
                <div key={item.month} className="text-center p-3 bg-[#FBF9F4] rounded-lg">
                  <p className="text-xs font-medium text-[#687068] mb-2">{item.month}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C28A78]"></div>
                      <span className="text-xs text-[#475569]">{item.properties} prop</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></div>
                      <span className="text-xs text-[#475569]">{item.documents} docs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                      <span className="text-xs text-[#475569]">{item.maintenance} jobs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-[#3A3F3A]">Invoice History</h2>
              {!isDemo && !hasStripeSub && (
                <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full font-medium">Sample</span>
              )}
            </div>
            <button className="text-sm text-[#C28A78] font-medium hover:underline">
              <i className="ri-download-line mr-1"></i>
              Download All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-6 py-3 font-medium text-[#687068]">Invoice</th>
                  <th className="text-left px-6 py-3 font-medium text-[#687068]">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-[#687068]">Period</th>
                  <th className="text-left px-6 py-3 font-medium text-[#687068]">Plan</th>
                  <th className="text-right px-6 py-3 font-medium text-[#687068]">Amount</th>
                  <th className="text-right px-6 py-3 font-medium text-[#687068]">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-[#687068]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-[#3A3F3A]">{invoice.id}</span>
                    </td>
                    <td className="px-6 py-3.5 text-[#687068]">{invoice.date}</td>
                    <td className="px-6 py-3.5 text-[#687068]">{invoice.period}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">
                        {invoice.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-[#3A3F3A]">£{invoice.amount}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(invoice.id)}
                        className="text-sm text-[#C28A78] font-medium hover:underline"
                      >
                        <i className="ri-download-line mr-1"></i>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



        {showChangePlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#3A3F3A]">Change Your Plan</h3>
                <button onClick={() => { setShowChangePlan(false); setSelectedPlanSlug(""); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FBF9F4]">
                  <i className="ri-close-line text-[#94A3B8]"></i>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Starter", slug: "starter", price: 29, annualPrice: 24, props: 5, team: 2 },
                  { name: "Professional", slug: "professional", price: 79, annualPrice: 66, props: 25, team: 5 },
                  { name: "Business", slug: "business", price: 199, annualPrice: 166, props: 100, team: 15 },
                  { name: "Enterprise", slug: "enterprise", price: null, annualPrice: null, props: null, team: null },
                ].map((p) => {
                  const isCurrent = plan.slug === p.slug;
                  const isSelected = selectedPlanSlug === p.slug;
                  return (
                    <button
                      key={p.name}
                      onClick={() => p.slug !== plan.slug && p.slug !== "enterprise" && setSelectedPlanSlug(p.slug)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
                        isCurrent
                          ? "border-[#C28A78] bg-[#C28A78]/5"
                          : isSelected
                          ? "border-[#C28A78] bg-[#C28A78]/5 ring-1 ring-[#C28A78]"
                          : p.slug === "enterprise"
                          ? "border-[#D5D9D5] opacity-60 cursor-not-allowed"
                          : "border-[#D5D9D5] hover:border-[#C28A78]/30 cursor-pointer"
                      }`}
                      disabled={p.slug === "enterprise"}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isCurrent || isSelected ? "border-[#C28A78]" : "border-[#D5D9D5]"
                        }`}>
                          {(isCurrent || isSelected) && <div className="w-2.5 h-2.5 bg-[#C28A78] rounded-full"></div>}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">
                            {p.name}
                            {isCurrent && <span className="text-xs text-[#C28A78] ml-2">(Current)</span>}
                          </p>
                          <p className="text-xs text-[#687068]">
                            {p.props ? `${p.props} properties · ${p.team} members` : "Unlimited everything"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {p.price ? (
                          <div>
                            <p className="text-sm font-bold text-[#3A3F3A]">£{p.price}<span className="text-xs font-normal text-[#94A3B8]">/mo</span></p>
                            <p className="text-xs text-[#94A3B8]">£{p.annualPrice}/mo annual</p>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-[#3A3F3A]">Custom</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedPlanSlug && selectedPlanSlug !== plan.slug && (
                <div className="mt-4 p-3 bg-[#FBF9F4] rounded-xl">
                  <p className="text-xs text-[#687068] mb-2">Choose billing cycle for {selectedPlanSlug.charAt(0).toUpperCase() + selectedPlanSlug.slice(1)}:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpgrade(selectedPlanSlug, "monthly")}
                      disabled={processingPayment}
                      className="flex-1 py-2 text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {processingPayment ? "Processing..." : "Monthly"}
                    </button>
                    <button
                      onClick={() => handleUpgrade(selectedPlanSlug, "annual")}
                      disabled={processingPayment}
                      className="flex-1 py-2 text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {processingPayment ? "Processing..." : "Annual (Save 17%)"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {!selectedPlanSlug && (
                  <p className="flex-1 text-xs text-[#94A3B8] text-center py-3">Select a plan above to switch</p>
                )}
                <button
                  onClick={() => { setShowChangePlan(false); setSelectedPlanSlug(""); }}
                  className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-xl hover:bg-[#FBF9F4] transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    }>
      <BillingContent />
    </Suspense>
  );
}