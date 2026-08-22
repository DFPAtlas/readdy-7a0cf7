"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { getPlanEntitlements, PlanEntitlements, getPropertyLimit, getTeamLimit, getStorageLimit, SubscriptionPlan } from "@/lib/entitlements";
import { isDemoAccount } from "@/lib/demoMode";
import { getTotalStorageBytes, bytesToGB } from "@/lib/getStorageUsage";

type BillingCycle = "monthly" | "annual";

const planSlugs = ["starter", "professional", "business"] as const;

function generatePlanHighlights(plan: SubscriptionPlan): string[] {
  if (!plan) return [];
  const h: string[] = [];

  if (plan.max_properties) {
    h.push(`Up to ${plan.max_properties} properties`);
  } else {
    h.push("Unlimited properties");
  }
  if (plan.max_team_members) {
    h.push(`${plan.max_team_members} team member${plan.max_team_members > 1 ? "s" : ""}`);
  } else {
    h.push("Unlimited team members");
  }

  if (plan.has_basic_compliance && !plan.has_full_compliance) h.push("Basic compliance tracking");
  if (plan.has_full_compliance) h.push("Full compliance suite");
  if (plan.has_ai_assistant) h.push("AI maintenance assistant");
  if (plan.has_quote_workflow || plan.has_contractor_panel) h.push("Quote & contractor workflows");
  if (plan.has_financial_tracking) h.push("Financial tracking");

  if (plan.storage_gb) {
    h.push(`${plan.storage_gb} GB document storage`);
  } else {
    h.push("Unlimited document storage");
  }

  if (plan.has_white_label_portal) h.push("White-label tenant portals");
  if (plan.has_api_access) h.push("API & webhook access");
  if (plan.has_bulk_operations) h.push("Bulk operations");
  if (plan.has_advanced_analytics) h.push("Advanced analytics");

  if (plan.has_priority_support) {
    if (plan.slug === "business" || plan.is_enterprise) h.push("Priority phone & email support");
    else h.push("Priority email support");
  } else {
    h.push("Email support");
  }

  return h;
}

function generateFeatureLabels(plansMap: Record<string, SubscriptionPlan>): { key: string; label: string; plans: Record<string, boolean | string> }[] {
  const getVal = (slug: string, prop: keyof SubscriptionPlan): boolean | string => {
    const plan = plansMap[slug];
    if (!plan) return false;
    return Boolean(plan[prop]);
  };

  const resolvePlanValues = (prop: keyof SubscriptionPlan): Record<string, boolean> =>
    planSlugs.reduce((acc, slug) => {
      acc[slug] = Boolean(plansMap[slug]?.[prop]);
      return acc;
    }, {} as Record<string, boolean>);

  const resolveNumOrUnlimited = (prop: keyof SubscriptionPlan): Record<string, string> =>
    planSlugs.reduce((acc, slug) => {
      const val = plansMap[slug]?.[prop];
      acc[slug] = val != null ? String(val) : "Unlimited";
      return acc;
    }, {} as Record<string, string>);

  const resolveStorage = (): Record<string, string> =>
    planSlugs.reduce((acc, slug) => {
      const val = plansMap[slug]?.storage_gb;
      acc[slug] = val != null ? `${val} GB` : "Unlimited";
      return acc;
    }, {} as Record<string, string>);

  const resolveSupport = (): Record<string, string> =>
    planSlugs.reduce((acc, slug) => {
      const plan = plansMap[slug];
      if (!plan) { acc[slug] = "—"; return acc; }
      if (plan.has_priority_support) {
        acc[slug] = plan.slug === "business" || plan.is_enterprise ? "Phone & email" : "Email";
      } else {
        acc[slug] = "Email";
      }
      return acc;
    }, {} as Record<string, string>);

  return [
    { key: "properties", label: "Properties", plans: resolveNumOrUnlimited("max_properties") },
    { key: "team", label: "Team members", plans: resolveNumOrUnlimited("max_team_members") },
    { key: "storage", label: "Storage", plans: resolveStorage() },
    { key: "basic_compliance", label: "Basic compliance", plans: resolvePlanValues("has_basic_compliance") },
    { key: "full_compliance", label: "Full compliance suite", plans: resolvePlanValues("has_full_compliance") },
    { key: "ai_assistant", label: "AI assistant", plans: resolvePlanValues("has_ai_assistant") },
    { key: "quote_workflow", label: "Quote & contractor workflows", plans: resolvePlanValues("has_quote_workflow") },
    { key: "financial_tracking", label: "Financial tracking", plans: resolvePlanValues("has_financial_tracking") },
    { key: "white_label_portal", label: "White-label portals", plans: resolvePlanValues("has_white_label_portal") },
    { key: "api_access", label: "API & webhook access", plans: resolvePlanValues("has_api_access") },
    { key: "bulk_operations", label: "Bulk operations", plans: resolvePlanValues("has_bulk_operations") },
    { key: "advanced_analytics", label: "Advanced analytics", plans: resolvePlanValues("has_advanced_analytics") },
    { key: "priority_support", label: "Priority support", plans: resolveSupport() },
  ];
}

function BillingContent() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const checkoutState = searchParams.get("checkout");

  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [propertyCount, setPropertyCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [storageGB, setStorageGB] = useState<number>(0);
  const [storageLoading, setStorageLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setStorageLoading(true);
    try {
      const demo = isDemoAccount();

      const [allPlans] = await Promise.all([
        supabase.from("subscription_plans").select("*").eq("is_active", true).order("monthly_price", { ascending: true }),
      ]);

      if (allPlans.data && allPlans.data.length > 0) {
        setPlans(allPlans.data as unknown as SubscriptionPlan[]);
      }

      if (demo) {
        const demoEnt = await getPlanEntitlements("demo");
        setEntitlements(demoEnt);
        setPropertyCount(42);
        setTeamCount(3);
        setStorageGB(12.4);
        setStorageLoading(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be signed in to view billing.");

      const [nextEntitlements, properties, agencyMember] = await Promise.all([
        getPlanEntitlements(user.id),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("agency_members").select("agency_id").eq("profile_id", user.id).maybeSingle(),
      ]);
      setEntitlements(nextEntitlements);
      setPropertyCount(properties.count || 0);

      if (agencyMember.data?.agency_id) {
        const { count: memberCount } = await supabase
          .from("agency_members")
          .select("id", { count: "exact", head: true })
          .eq("agency_id", agencyMember.data.agency_id);
        setTeamCount(memberCount || 1);
      } else {
        setTeamCount(1);
      }

      getTotalStorageBytes().then((bytes) => {
        setStorageGB(bytesToGB(bytes));
        setStorageLoading(false);
      }).catch(() => {
        setStorageLoading(false);
      });

      if (nextEntitlements.subscription?.stripe_customer_id) {
        setInvoicesLoading(true);
        const { data: billingData } = await supabase
          .from("billing_events")
          .select("id, event_type, amount, stripe_invoice_id, metadata, created_at")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (billingData) setInvoices(billingData);
        setInvoicesLoading(false);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startCheckout = async (planSlug: string) => {
    if (isDemoAccount()) { showToast("Billing actions are disabled in the demo account."); return; }

    const plan = plans.find(p => p.slug === planSlug);
    if (!plan) { setError("Plan not found."); return; }
    const priceId = billingCycle === "annual" ? plan.stripe_annual_price_id : plan.stripe_monthly_price_id;
    if (!priceId) {
      showToast("Stripe pricing is being set up — please try again in a moment.");
      return;
    }

    setProcessing(planSlug);
    setError("");
    try {
      const { data, error: checkoutError } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { plan_slug: planSlug, billing_cycle: billingCycle, request_id: crypto.randomUUID() },
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
    if (isDemoAccount()) { showToast("Billing actions are disabled in the demo account."); return; }
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
      { label: "Storage", used: storageGB, limit: getStorageLimit(entitlements), suffix: " GB", loading: storageLoading },
    ];
  }, [entitlements, propertyCount, teamCount, storageGB, storageLoading]);

  const currentSlug = entitlements?.plan.slug || "";
  const isDemo = entitlements?.isDemo || false;

  const plansMap = useMemo(() => {
    const map: Record<string, SubscriptionPlan> = {};
    plans.forEach(p => { map[p.slug] = p; });
    return map;
  }, [plans]);

  const featureLabels = useMemo(() => generateFeatureLabels(plansMap), [plansMap]);

  const faqs = [
    { q: "When will I be billed?", a: "Monthly plans are billed on the same day each month. Annual plans are billed once per year on the anniversary of your subscription start date. Your first payment is taken immediately after your trial ends (if applicable)." },
    { q: "Can I switch plans later?", a: "Yes. You can upgrade or downgrade at any time through the Stripe billing portal. When upgrading, you'll be charged the prorated difference for the remainder of your billing period. Downgrades take effect at the end of your current billing period." },
    { q: "Is there a free trial?", a: "All plans come with a 14-day free trial. No credit card is charged until the trial ends. You can cancel anytime during the trial and you won't be charged." },
    { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards including Visa, Mastercard, and American Express. All payments are processed securely through Stripe." },
    { q: "Can I cancel my subscription?", a: "Yes — you can cancel anytime through the Stripe billing portal. Your access will continue until the end of your current billing period. We do not offer refunds for partial months." },
    { q: "Is my payment information secure?", a: "Absolutely. We never store your card details on our servers. All payment processing is handled by Stripe, a PCI DSS Level 1 certified payment processor." },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Billing &amp; Subscription</h1>
            <p className="mt-1 text-sm text-[#687068]">Manage your plan, payment methods, and view your billing history.</p>
          </div>
          <button onClick={load} disabled={loading} className="rounded-lg border border-[#D5D9D5] bg-white px-4 py-2 text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] disabled:opacity-50 transition-colors whitespace-nowrap">Refresh</button>
        </div>

        {checkoutState === "success" && (
          <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-check-line text-[#10B981]"></i></div>
              <p className="text-sm font-semibold text-[#065F46]">Checkout completed</p>
            </div>
            <p className="mt-1 text-xs text-[#047857]">Stripe is confirming your subscription. Refresh if the new status hasn&apos;t appeared yet.</p>
          </div>
        )}
        {checkoutState === "cancelled" && (
          <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-information-line text-[#F97316]"></i></div>
              <p className="text-sm font-semibold text-[#9A3412]">Checkout cancelled</p>
            </div>
            <p className="mt-1 text-xs text-[#C2410C]">No changes were made to your subscription.</p>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-error-warning-line text-[#EF4444]"></i></div>
              <p className="text-sm font-semibold text-[#991B1B]">Something went wrong</p>
            </div>
            <p className="mt-1 text-xs text-[#B91C1C]">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-sm text-[#687068]">Loading billing information…</p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-[#FBF9F4] to-white px-6 py-5 border-b border-[#E2E8F0]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Current plan</p>
                    <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold text-[#3A3F3A]">{entitlements?.plan.name || "Restricted"}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isDemo ? "bg-[#7C3AED]/10 text-[#7C3AED]" :
                        entitlements?.isReadOnly ? "bg-red-50 text-red-700" :
                        entitlements?.isTrial ? "bg-amber-50 text-amber-700" :
                        "bg-emerald-50 text-emerald-700"
                      }`}>
                        {isDemo ? (
                          <><i className="ri-eye-line text-xs"></i> Demo</>
                        ) : entitlements?.isReadOnly ? (
                          <><i className="ri-lock-line text-xs"></i> No active subscription</>
                        ) : entitlements?.isTrial ? (
                          <><i className="ri-timer-line text-xs"></i> Trial</>
                        ) : (
                          <><i className="ri-check-line text-xs"></i> Active</>
                        )}
                      </span>
                    </div>
                    {entitlements?.isTrial && entitlements.subscription?.trial_ends_at && (
                      <p className="mt-1.5 text-sm text-[#687068]">
                        Trial ends {new Date(entitlements.subscription.trial_ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.
                      </p>
                    )}
                    {!entitlements?.isTrial && entitlements?.subscription?.current_period_end && !isDemo && (
                      <p className="mt-1.5 text-sm text-[#687068]">
                        Current period ends {new Date(entitlements.subscription.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}.
                      </p>
                    )}
                  </div>
                  {entitlements?.subscription?.stripe_customer_id && !isDemo && (
                    <button onClick={openPortal} disabled={portalLoading} className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C28A78] px-5 py-2.5 text-sm font-semibold text-[#C28A78] hover:bg-[#C28A78] hover:text-white transition-all disabled:opacity-50 whitespace-nowrap">
                      {portalLoading ? (
                        <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Opening…</>
                      ) : (
                        <><i className="ri-settings-3-line"></i> Manage in Stripe</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {usage.length > 0 && (
                <div className="px-6 py-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {usage.map((item) => {
                      const unlimited = item.limit >= 9999;
                      const percent = unlimited || item.limit <= 0 ? 0 : Math.min(100, (item.used / item.limit) * 100);
                      const barColor = percent > 90 ? "bg-[#EF4444]" : percent > 70 ? "bg-[#F59E0B]" : "bg-[#7A9A7E]";
                      const isLoading = (item as any).loading;
                      return (
                        <div key={item.label} className="rounded-xl bg-[#F8FAFC] p-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#687068]">{item.label}</span>
                            <span className="font-semibold text-[#3A3F3A]">
                              {isLoading ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-3 h-3 border border-[#94A3B8] border-t-transparent rounded-full animate-spin"></span>
                                  <span className="text-[#94A3B8]">Measuring…</span>
                                </span>
                              ) : (
                                <>{item.used}{item.suffix || ""} / {unlimited ? "Unlimited" : `${item.limit}${item.suffix || ""}`}</>
                              )}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${isLoading ? "bg-[#D5D9D5] animate-pulse" : barColor}`} style={{ width: isLoading ? "100%" : `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#3A3F3A]">Choose your plan</h2>
                  <p className="mt-1 text-sm text-[#687068]">All plans include a 14-day free trial. Upgrade or downgrade anytime.</p>
                </div>
                <div className="flex rounded-xl bg-[#F1F5F9] p-1 w-fit">
                  {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                        billingCycle === cycle ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
                      }`}
                    >
                      {cycle}
                      {cycle === "annual" && <span className="ml-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">Save ~17%</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {planSlugs.map((slug) => {
                  const plan = plans.find(p => p.slug === slug);
                  const price = billingCycle === "annual"
                    ? (plan?.annual_price ?? 0)
                    : (plan?.monthly_price ?? 0);
                  const isCurrent = currentSlug === slug && !entitlements?.isReadOnly;
                  const highlights = plan ? generatePlanHighlights(plan) : [];
                  const stripePriceId = billingCycle === "annual" ? plan?.stripe_annual_price_id : plan?.stripe_monthly_price_id;

                  let ctaLabel = "Start free trial";
                  let ctaDisabled = false;
                  if (isDemo) { ctaLabel = "Demo mode"; ctaDisabled = true; }
                  else if (isCurrent) { ctaLabel = "Current plan"; ctaDisabled = true; }
                  else if (!stripePriceId) { ctaLabel = "Coming soon"; ctaDisabled = true; }
                  else if (processing === slug) { ctaLabel = "Opening Stripe…"; ctaDisabled = true; }

                  return (
                    <div
                      key={slug}
                      className={`relative rounded-2xl border-2 p-6 flex flex-col transition-all ${
                        isCurrent
                          ? "border-[#C28A78] bg-[#FDF8F6] ring-1 ring-[#C28A78]/50"
                          : "border-[#E2E8F0] bg-white hover:border-[#C28A78]/30 hover:shadow-md"
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C28A78] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          Current plan
                        </div>
                      )}
                      {slug === "business" && !isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          Most popular
                        </div>
                      )}

                      <div className="mb-5">
                        <h3 className="text-lg font-bold text-[#3A3F3A]">{plan?.name || slug}</h3>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-[#3A3F3A]">£{price.toLocaleString()}</span>
                          <span className="text-sm text-[#687068]">/month</span>
                        </div>
                        <p className="mt-1 text-xs text-[#94A3B8]">
                          {billingCycle === "annual" ? "Billed annually" : "Billed monthly"}
                        </p>
                      </div>

                      <ul className="space-y-3 flex-1 mb-6">
                        {highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                            </div>
                            <span className="text-[#3A3F3A]">{h}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => startCheckout(slug)}
                        disabled={ctaDisabled}
                        className={`w-full rounded-xl py-3 text-sm font-bold transition-all whitespace-nowrap ${
                          isCurrent
                            ? "bg-[#F1F5F9] text-[#94A3B8] cursor-default"
                            : isDemo
                            ? "bg-[#F1F5F9] text-[#94A3B8] cursor-default"
                            : !stripePriceId
                            ? "bg-[#F1F5F9] text-[#94A3B8] cursor-default"
                            : "bg-[#C28A78] text-white hover:bg-[#B07562] shadow-sm hover:shadow-md disabled:opacity-50"
                        }`}
                      >
                        {processing === slug ? (
                          <span className="inline-flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Opening Stripe…
                          </span>
                        ) : ctaLabel}
                      </button>
                    </div>
                  );
                })}
              </div>

              {isDemo && (
                <div className="mt-4 rounded-xl bg-[#7C3AED]/5 border border-[#7C3AED]/20 px-4 py-3 flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-information-line text-[#7C3AED]"></i>
                  </div>
                  <p className="text-sm text-[#6D28D9]">
                    You&apos;re viewing the demo account with full Business plan access. Sign up for a real account to start your 14-day free trial.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-bold text-[#3A3F3A]">Feature comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left px-6 py-3 text-sm font-semibold text-[#687068]">Feature</th>
                      {planSlugs.map((slug) => {
                        const plan = plans.find(p => p.slug === slug);
                        const isCur = currentSlug === slug && !entitlements?.isReadOnly;
                        return (
                          <th key={slug} className={`px-6 py-3 text-center text-sm font-bold whitespace-nowrap ${isCur ? "text-[#C28A78]" : "text-[#3A3F3A]"}`}>
                            {plan?.name || slug}
                            {isCur && <span className="ml-1.5 text-[10px] bg-[#C28A78]/10 text-[#C28A78] px-1.5 py-0.5 rounded-full">You</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {featureLabels.map((feature, idx) => (
                      <tr key={feature.key} className={`border-b border-[#F1F5F9] ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"}`}>
                        <td className="px-6 py-3 text-sm text-[#3A3F3A]">{feature.label}</td>
                        {planSlugs.map((slug) => {
                          const val = feature.plans[slug];
                          return (
                            <td key={slug} className="px-6 py-3 text-center">
                              {typeof val === "boolean" ? (
                                val ? (
                                  <div className="w-5 h-5 flex items-center justify-center mx-auto">
                                    <i className="ri-check-line text-[#7A9A7E] text-base"></i>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 flex items-center justify-center mx-auto">
                                    <i className="ri-close-line text-[#D5D9D5] text-base"></i>
                                  </div>
                                )
                              ) : (
                                <span className="text-sm font-medium text-[#3A3F3A]">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {invoices.length > 0 && (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E2E8F0]">
                  <h2 className="text-lg font-bold text-[#3A3F3A]">Billing history</h2>
                </div>
                <div className="divide-y divide-[#F1F5F9]">
                  {invoices.map((inv) => {
                    const date = inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
                    const amount = inv.amount ? `£${(Number(inv.amount) / 100).toFixed(2)}` : "—";
                    const eventLabel = inv.event_type === "invoice.paid" ? "Payment received" : inv.event_type?.replace(/\./g, " ") || "Billing event";
                    return (
                      <div key={inv.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#FBF9F4] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            inv.event_type === "invoice.paid" ? "bg-[#7A9A7E]/10" : "bg-[#F1F5F9]"
                          }`}>
                            <i className={`text-sm ${
                              inv.event_type === "invoice.paid" ? "ri-bank-card-line text-[#7A9A7E]" : "ri-file-text-line text-[#94A3B8]"
                            }`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A] capitalize">{eventLabel}</p>
                            <p className="text-xs text-[#94A3B8]">{date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#3A3F3A]">{amount}</p>
                          {inv.stripe_invoice_id && (
                            <p className="text-[10px] text-[#94A3B8]">#{inv.stripe_invoice_id.slice(-8)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {invoicesLoading && (
              <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
                <div className="w-6 h-6 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-sm text-[#94A3B8]">Loading billing history…</p>
              </section>
            )}

            <section className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-bold text-[#3A3F3A]">Frequently asked questions</h2>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {faqs.map((faq, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FBF9F4] transition-colors"
                    >
                      <span className="text-sm font-medium text-[#3A3F3A] pr-4">{faq.q}</span>
                      <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition-transform ${faqOpen === idx ? "rotate-180" : ""}`}>
                        <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                      </div>
                    </button>
                    {faqOpen === idx && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-[#687068] leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#3A3F3A] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-information-line text-sm"></i></div>
            {toast}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<DashboardShell><div className="py-20 text-center text-sm text-[#687068]">Loading billing…</div></DashboardShell>}>
      <BillingContent />
    </Suspense>
  );
}