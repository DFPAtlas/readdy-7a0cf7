"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { getPlanEntitlements, PlanEntitlements, getPropertyLimit, getStorageLimit, getTeamLimit } from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";

const planOptions = [
  { slug: "starter", name: "Starter", monthly: 29, annual: 24, description: "Essential property and compliance management." },
  { slug: "professional", name: "Professional", monthly: 79, annual: 66, description: "Full compliance, AI assistance and contractor workflows." },
  { slug: "business", name: "Business", monthly: 199, annual: 166, description: "White-label portals, API access and advanced analytics." },
] as const;

type BillingCycle = "monthly" | "annual";

function BillingContent() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const requestedCycle = searchParams.get("billing") === "annual" ? "annual" : "monthly";
  const checkoutState = searchParams.get("checkout");

  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(requestedCycle);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isDemoAccount()) {
        const demo = await getPlanEntitlements("demo");
        setEntitlements(demo);
        setPropertyCount(42);
        setTeamCount(3);
        setStorageUsed(12.4);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be signed in to view billing.");

      const [nextEntitlements, properties] = await Promise.all([
        getPlanEntitlements(user.id),
        supabase.from("properties").select("id", { count: "exact", head: true }),
      ]);
      setEntitlements(nextEntitlements);
      setPropertyCount(properties.count || 0);
      setTeamCount(1);
      setStorageUsed(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startCheckout = async (planSlug: string) => {
    if (isDemoAccount()) return setError("Billing actions are disabled in the demo account.");
    setProcessing(planSlug);
    setError("");
    try {
      const { data, error: checkoutError } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {
          plan_slug: planSlug,
          billing_cycle: billingCycle,
          request_id: crypto.randomUUID(),
        },
      });
      if (checkoutError) throw checkoutError;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("Stripe did not return a Checkout URL.");
      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start Stripe Checkout.");
      setProcessing(null);
    }
  };

  const openPortal = async () => {
    if (isDemoAccount()) return setError("Billing actions are disabled in the demo account.");
    setPortalLoading(true);
    setError("");
    try {
      const { data, error: portalError } = await supabase.functions.invoke("create-billing-portal-session", { body: {} });
      if (portalError) throw portalError;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("Stripe did not return a portal URL.");
      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open the billing portal.");
      setPortalLoading(false);
    }
  };

  const usage = useMemo(() => {
    if (!entitlements) return [];
    return [
      { label: "Properties", used: propertyCount, limit: getPropertyLimit(entitlements) },
      { label: "Team members", used: teamCount, limit: getTeamLimit(entitlements) },
      { label: "Storage", used: storageUsed, limit: getStorageLimit(entitlements), suffix: " GB" },
    ];
  }, [entitlements, propertyCount, teamCount, storageUsed]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Billing & Subscription</h1>
            <p className="mt-1 text-sm text-[#687068]">Stripe is the source of truth for your plan, trial and payment status.</p>
          </div>
          <button onClick={load} disabled={loading} className="rounded-lg border border-[#D5D9D5] px-4 py-2 text-sm font-medium text-[#687068] disabled:opacity-50">Refresh status</button>
        </div>

        {checkoutState === "success" && (
          <Notice tone="success" title="Checkout completed">
            Stripe is confirming the subscription through its signed webhook. Refresh this page if the new status has not appeared yet.
          </Notice>
        )}
        {checkoutState === "cancelled" && <Notice tone="warning" title="Checkout cancelled">No subscription change was made.</Notice>}
        {error && <Notice tone="error" title="Billing action failed">{error}</Notice>}

        {loading ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white py-20 text-center text-sm text-[#687068]">Loading Stripe-backed billing status…</div>
        ) : (
          <>
            <SubscriptionSummary entitlements={entitlements} onPortal={openPortal} portalLoading={portalLoading} />

            {entitlements && usage.length > 0 && (
              <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <h2 className="font-semibold text-[#3A3F3A]">Current usage</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {usage.map((item) => {
                    const unlimited = item.limit >= 9999;
                    const percent = unlimited || item.limit <= 0 ? 0 : Math.min(100, (item.used / item.limit) * 100);
                    return (
                      <div key={item.label} className="rounded-lg bg-[#F8FAFC] p-4">
                        <div className="flex justify-between text-sm"><span className="text-[#687068]">{item.label}</span><strong className="text-[#3A3F3A]">{item.used}{item.suffix || ""} / {unlimited ? "Unlimited" : `${item.limit}${item.suffix || ""}`}</strong></div>
                        <div className="mt-3 h-2 rounded-full bg-[#E2E8F0]"><div className="h-2 rounded-full bg-[#C28A78]" style={{ width: `${percent}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-semibold text-[#3A3F3A]">Choose a plan</h2><p className="mt-1 text-xs text-[#687068]">Checkout loads the approved recurring Price directly from Stripe.</p></div>
                <div className="flex rounded-lg bg-[#F1F5F9] p-1">
                  {(["monthly", "annual"] as BillingCycle[]).map((cycle) => <button key={cycle} onClick={() => setBillingCycle(cycle)} className={`rounded-md px-4 py-2 text-xs font-semibold capitalize ${billingCycle === cycle ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068]"}`}>{cycle}</button>)}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {planOptions.map((plan) => {
                  const price = billingCycle === "annual" ? plan.annual : plan.monthly;
                  const selected = requestedPlan === plan.slug;
                  return (
                    <div key={plan.slug} className={`rounded-xl border p-5 ${selected ? "border-[#C28A78] ring-1 ring-[#C28A78]" : "border-[#E2E8F0]"}`}>
                      <h3 className="font-semibold text-[#3A3F3A]">{plan.name}</h3>
                      <p className="mt-2 text-3xl font-bold text-[#3A3F3A]">£{price}<span className="text-sm font-normal text-[#687068]">/month</span></p>
                      <p className="mt-1 text-xs text-[#687068]">{billingCycle === "annual" ? "Billed annually" : "Billed monthly"}</p>
                      <p className="mt-4 min-h-10 text-sm text-[#687068]">{plan.description}</p>
                      <button onClick={() => startCheckout(plan.slug)} disabled={Boolean(processing) || entitlements?.isDemo} className="mt-5 w-full rounded-lg bg-[#C28A78] py-2.5 text-sm font-semibold text-white disabled:opacity-50">{processing === plan.slug ? "Opening Stripe…" : "Continue to Stripe"}</button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function SubscriptionSummary({ entitlements, onPortal, portalLoading }: { entitlements: PlanEntitlements | null; onPortal: () => void; portalLoading: boolean }) {
  const subscription = entitlements?.subscription;
  const status = entitlements?.isDemo ? "Demo" : subscription?.status || "No subscription";
  const periodEnd = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  const trialEnd = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Current subscription</p>
          <div className="mt-2 flex items-center gap-2"><h2 className="text-xl font-bold text-[#3A3F3A]">{entitlements?.plan.name || "Restricted"}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${entitlements?.isReadOnly ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{status}</span></div>
          {entitlements?.isTrial && trialEnd && <p className="mt-2 text-sm text-[#687068]">Stripe trial ends {trialEnd}.</p>}
          {!entitlements?.isTrial && periodEnd && <p className="mt-2 text-sm text-[#687068]">Current billing period ends {periodEnd}.</p>}
          {entitlements?.isReadOnly && <p className="mt-2 text-sm text-red-700">Paid features are read-only until Stripe reports an active subscription or valid trial.</p>}
        </div>
        {subscription?.stripe_customer_id && !entitlements?.isDemo && <button onClick={onPortal} disabled={portalLoading} className="rounded-lg border border-[#C28A78] px-4 py-2.5 text-sm font-semibold text-[#C28A78] disabled:opacity-50">{portalLoading ? "Opening…" : "Manage in Stripe"}</button>}
      </div>
    </section>
  );
}

function Notice({ tone, title, children }: { tone: "success" | "warning" | "error"; title: string; children: React.ReactNode }) {
  const styles = tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-800";
  return <div className={`rounded-xl border px-5 py-4 ${styles}`}><p className="text-sm font-semibold">{title}</p><div className="mt-1 text-xs leading-5">{children}</div></div>;
}

export default function BillingPage() {
  return <Suspense fallback={<DashboardShell><div className="py-20 text-center text-sm text-[#687068]">Loading billing…</div></DashboardShell>}><BillingContent /></Suspense>;
}
