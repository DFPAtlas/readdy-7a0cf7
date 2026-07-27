"use client";

import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  monthly_price: number | null;
  annual_price: number | null;
  trial_days: number;
  max_properties: number | null;
  max_team_members: number | null;
  storage_gb: number | null;
  has_basic_compliance: boolean;
  has_full_compliance: boolean;
  has_ai_assistant: boolean;
  has_quote_workflow: boolean;
  has_contractor_panel: boolean;
  has_white_label_portal: boolean;
  has_api_access: boolean;
  has_bulk_operations: boolean;
  has_financial_tracking: boolean;
  has_advanced_analytics: boolean;
  has_priority_support: boolean;
  is_enterprise: boolean;
}

export interface AccountSubscription {
  id: string;
  account_id: string | null;
  user_id: string;
  plan_slug: string;
  status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  billing_cycle: string;
}

export interface PlanEntitlements {
  plan: SubscriptionPlan;
  subscription: AccountSubscription | null;
  isTrial: boolean;
  isReadOnly: boolean;
  isDemo: boolean;
}

const DEMO_PLAN: SubscriptionPlan = {
  id: "demo",
  slug: "business",
  name: "Business (Demo)",
  monthly_price: 199,
  annual_price: 166,
  trial_days: 999,
  max_properties: null,
  max_team_members: null,
  storage_gb: null,
  has_basic_compliance: true,
  has_full_compliance: true,
  has_ai_assistant: true,
  has_quote_workflow: true,
  has_contractor_panel: true,
  has_white_label_portal: true,
  has_api_access: true,
  has_bulk_operations: true,
  has_financial_tracking: true,
  has_advanced_analytics: true,
  has_priority_support: true,
  is_enterprise: true,
};

const FEATURE_PLAN_MAP: Record<string, string[]> = {
  ai_assistant: ["professional", "business", "enterprise"],
  quote_workflow: ["professional", "business", "enterprise"],
  contractor_panel: ["professional", "business", "enterprise"],
  full_compliance: ["professional", "business", "enterprise"],
  white_label_portal: ["business", "enterprise"],
  api_access: ["business", "enterprise"],
  bulk_operations: ["business", "enterprise"],
  financial_tracking: ["business", "enterprise"],
  advanced_analytics: ["business", "enterprise"],
  priority_support: ["professional", "business", "enterprise"],
  owner_reports: ["professional", "business", "enterprise"],
  enterprise_ops: ["enterprise"],
  franchise_platform: ["enterprise"],
  unlimited_properties: ["enterprise"],
  unlimited_storage: ["enterprise"],
  unlimited_team: ["enterprise"],
  portfolio_health: ["business", "enterprise"],
};

export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  if (isDemoAccount()) return DEMO_PLAN;

  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    monthly_price: data.monthly_price,
    annual_price: data.annual_price,
    trial_days: data.trial_days || 14,
    max_properties: data.max_properties,
    max_team_members: data.max_team_members,
    storage_gb: data.storage_gb,
    has_basic_compliance: data.has_basic_compliance || false,
    has_full_compliance: data.has_full_compliance || false,
    has_ai_assistant: data.has_ai_assistant || false,
    has_quote_workflow: data.has_quote_workflow || false,
    has_contractor_panel: data.has_contractor_panel || false,
    has_white_label_portal: data.has_white_label_portal || false,
    has_api_access: data.has_api_access || false,
    has_bulk_operations: data.has_bulk_operations || false,
    has_financial_tracking: data.has_financial_tracking || false,
    has_advanced_analytics: data.has_advanced_analytics || false,
    has_priority_support: data.has_priority_support || false,
    is_enterprise: data.is_enterprise || false,
  };
}

export async function getCurrentSubscription(userId: string): Promise<AccountSubscription | null> {
  if (isDemoAccount()) {
    return {
      id: "demo-sub",
      account_id: null,
      user_id: userId,
      plan_slug: "business",
      status: "demo",
      trial_started_at: null,
      trial_ends_at: null,
      current_period_start: null,
      current_period_end: null,
      billing_cycle: "monthly",
    };
  }

  const { data } = await supabase
    .from("account_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    account_id: data.account_id,
    user_id: data.user_id,
    plan_slug: data.plan_slug,
    status: data.status,
    trial_started_at: data.trial_started_at,
    trial_ends_at: data.trial_ends_at,
    current_period_start: data.current_period_start,
    current_period_end: data.current_period_end,
    billing_cycle: data.billing_cycle || "monthly",
  };
}

export async function getPlanEntitlements(userId: string): Promise<PlanEntitlements> {
  if (isDemoAccount()) {
    return {
      plan: DEMO_PLAN,
      subscription: {
        id: "demo-sub",
        account_id: null,
        user_id: userId,
        plan_slug: "business",
        status: "demo",
        trial_started_at: null,
        trial_ends_at: null,
        current_period_start: null,
        current_period_end: null,
        billing_cycle: "monthly",
      },
      isTrial: false,
      isReadOnly: false,
      isDemo: true,
    };
  }

  const sub = await getCurrentSubscription(userId);
  const plan = sub ? await getPlanBySlug(sub.plan_slug) : null;

  if (!plan) {
    const starterPlan = await getPlanBySlug("starter");
    return {
      plan: starterPlan || DEMO_PLAN,
      subscription: null,
      isTrial: false,
      isReadOnly: true,
      isDemo: false,
    };
  }

  const isTrial = sub ? isTrialActive(sub) : false;
  const isReadOnly = sub ? sub.status === "read_only" || sub.status === "expired" : true;

  return { plan, subscription: sub, isTrial, isReadOnly, isDemo: false };
}

export function canUseFeature(entitlements: PlanEntitlements, featureKey: string): boolean {
  if (entitlements.isDemo) return true;

  const allowedPlans = FEATURE_PLAN_MAP[featureKey];
  if (!allowedPlans) return true;

  return allowedPlans.includes(entitlements.plan.slug);
}

export function getPropertyLimit(entitlements: PlanEntitlements): number {
  if (entitlements.isDemo) return 9999;
  return entitlements.plan.max_properties ?? 9999;
}

export function getTeamLimit(entitlements: PlanEntitlements): number {
  if (entitlements.isDemo) return 9999;
  return entitlements.plan.max_team_members ?? 9999;
}

export function getStorageLimit(entitlements: PlanEntitlements): number {
  if (entitlements.isDemo) return 9999;
  return entitlements.plan.storage_gb ?? 9999;
}

export function isTrialActive(sub: AccountSubscription | null): boolean {
  if (!sub) return false;
  if (sub.status !== "trialing") return false;
  if (!sub.trial_ends_at) return true;

  const endDate = new Date(sub.trial_ends_at);
  return endDate > new Date();
}

export function isReadOnlySubscription(entitlements: PlanEntitlements): boolean {
  return entitlements.isReadOnly;
}

export function getUpgradeReason(featureKey: string): string {
  const reasons: Record<string, string> = {
    ai_assistant: "AI Property Assistant is available on Professional, Business and Enterprise plans.",
    quote_workflow: "Quote workflow is available on Professional, Business and Enterprise plans.",
    contractor_panel: "Contractor panel is available on Professional, Business and Enterprise plans.",
    full_compliance: "Full compliance tracking is available on Professional, Business and Enterprise plans.",
    white_label_portal: "White-label tenant portal is available on Business and Enterprise plans.",
    api_access: "API access is available on Business and Enterprise plans.",
    bulk_operations: "Bulk operations are available on Business and Enterprise plans.",
    financial_tracking: "Financial tracking is available on Business and Enterprise plans.",
    advanced_analytics: "Advanced analytics is available on Business and Enterprise plans.",
    priority_support: "Priority support is available on Professional, Business and Enterprise plans.",
    portfolio_health: "Property Health Score™ advanced breakdown is available on Business and Enterprise plans.",
    owner_reports: "Owner monthly reports are available on Professional, Business and Enterprise plans.",
  enterprise_ops: "Enterprise Operations Centre is exclusive to the Enterprise plan. Upgrade to manage multi-office operations.",
    add_property: "You have reached the property limit for your current plan. Upgrade to add more properties.",
    import_portfolio: "You have reached the property limit for your current plan. Upgrade to import more properties.",
    upload_document: "You have reached the storage limit for your current plan. Upgrade for more storage.",
    invite_portal: "Your 14-day trial has ended. Upgrade your plan to continue using this feature.",
    create_maintenance: "Your 14-day trial has ended. Upgrade your plan to continue using this feature.",
    run_inspection: "Your 14-day trial has ended. Upgrade your plan to continue using this feature.",
    invite_team: "You have reached the team member limit for your current plan. Upgrade to invite more team members.",
  };

  return reasons[featureKey] || "This feature requires a higher plan. Upgrade to access it.";
}