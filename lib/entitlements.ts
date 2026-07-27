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
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface PlanEntitlements {
  plan: SubscriptionPlan;
  subscription: AccountSubscription | null;
  isTrial: boolean;
  isReadOnly: boolean;
  isDemo: boolean;
}

const DENY_PLAN: SubscriptionPlan = {
  id: "restricted",
  slug: "restricted",
  name: "Restricted",
  monthly_price: null,
  annual_price: null,
  trial_days: 0,
  max_properties: 0,
  max_team_members: 0,
  storage_gb: 0,
  has_basic_compliance: false,
  has_full_compliance: false,
  has_ai_assistant: false,
  has_quote_workflow: false,
  has_contractor_panel: false,
  has_white_label_portal: false,
  has_api_access: false,
  has_bulk_operations: false,
  has_financial_tracking: false,
  has_advanced_analytics: false,
  has_priority_support: false,
  is_enterprise: false,
};

const DEMO_PLAN: SubscriptionPlan = {
  ...DENY_PLAN,
  id: "demo",
  slug: "business",
  name: "Business (Demo)",
  monthly_price: 199,
  annual_price: 166,
  trial_days: 0,
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
};

const FEATURE_PLAN_MAP: Record<string, string[]> = {
  basic_compliance: ["starter", "professional", "business", "enterprise"],
  ai_assistant: ["professional", "business", "enterprise"],
  quote_workflow: ["professional", "business", "enterprise"],
  contractor_panel: ["professional", "business", "enterprise"],
  full_compliance: ["professional", "business", "enterprise"],
  financial_tracking: ["professional", "business", "enterprise"],
  priority_support: ["professional", "business", "enterprise"],
  owner_reports: ["professional", "business", "enterprise"],
  white_label_portal: ["business", "enterprise"],
  api_access: ["business", "enterprise"],
  bulk_operations: ["business", "enterprise"],
  advanced_analytics: ["business", "enterprise"],
  portfolio_health: ["business", "enterprise"],
  enterprise_ops: ["enterprise"],
  franchise_platform: ["enterprise"],
  unlimited_properties: ["enterprise"],
  unlimited_storage: ["enterprise"],
  unlimited_team: ["enterprise"],
};

function mapPlan(data: Record<string, unknown>): SubscriptionPlan {
  return {
    id: String(data.id),
    slug: String(data.slug),
    name: String(data.name),
    monthly_price: data.monthly_price == null ? null : Number(data.monthly_price),
    annual_price: data.annual_price == null ? null : Number(data.annual_price),
    trial_days: Number(data.trial_days || 0),
    max_properties: data.max_properties == null ? null : Number(data.max_properties),
    max_team_members: data.max_team_members == null ? null : Number(data.max_team_members),
    storage_gb: data.storage_gb == null ? null : Number(data.storage_gb),
    has_basic_compliance: Boolean(data.has_basic_compliance),
    has_full_compliance: Boolean(data.has_full_compliance),
    has_ai_assistant: Boolean(data.has_ai_assistant),
    has_quote_workflow: Boolean(data.has_quote_workflow),
    has_contractor_panel: Boolean(data.has_contractor_panel),
    has_white_label_portal: Boolean(data.has_white_label_portal),
    has_api_access: Boolean(data.has_api_access),
    has_bulk_operations: Boolean(data.has_bulk_operations),
    has_financial_tracking: Boolean(data.has_financial_tracking),
    has_advanced_analytics: Boolean(data.has_advanced_analytics),
    has_priority_support: Boolean(data.has_priority_support),
    is_enterprise: Boolean(data.is_enterprise),
  };
}

export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  if (isDemoAccount()) return DEMO_PLAN;
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return error || !data ? null : mapPlan(data);
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
      stripe_customer_id: null,
      stripe_subscription_id: null,
    };
  }

  const { data, error } = await supabase
    .from("account_subscriptions")
    .select("id, account_id, user_id, plan_slug, status, trial_started_at, trial_ends_at, current_period_start, current_period_end, billing_cycle, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
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
    stripe_customer_id: data.stripe_customer_id,
    stripe_subscription_id: data.stripe_subscription_id,
  };
}

export function isTrialActive(subscription: AccountSubscription | null): boolean {
  return Boolean(
    subscription?.stripe_subscription_id &&
    subscription.status === "trialing" &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at).getTime() > Date.now(),
  );
}

export async function getPlanEntitlements(userId: string): Promise<PlanEntitlements> {
  if (isDemoAccount()) {
    return { plan: DEMO_PLAN, subscription: await getCurrentSubscription(userId), isTrial: false, isReadOnly: false, isDemo: true };
  }

  const subscription = await getCurrentSubscription(userId);
  if (!subscription?.stripe_subscription_id) {
    return { plan: DENY_PLAN, subscription, isTrial: false, isReadOnly: true, isDemo: false };
  }

  const plan = await getPlanBySlug(subscription.plan_slug);
  if (!plan) return { plan: DENY_PLAN, subscription, isTrial: false, isReadOnly: true, isDemo: false };

  const isTrial = isTrialActive(subscription);
  const isActive = subscription.status === "active" || isTrial;
  return { plan, subscription, isTrial, isReadOnly: !isActive, isDemo: false };
}

export function canUseFeature(entitlements: PlanEntitlements, featureKey: string): boolean {
  if (entitlements.isDemo) return true;
  if (entitlements.isReadOnly) return false;
  const allowedPlans = FEATURE_PLAN_MAP[featureKey];
  return Boolean(allowedPlans?.includes(entitlements.plan.slug));
}

export function getPropertyLimit(entitlements: PlanEntitlements): number {
  return entitlements.isDemo || entitlements.plan.is_enterprise ? 9999 : entitlements.plan.max_properties ?? 0;
}

export function getTeamLimit(entitlements: PlanEntitlements): number {
  return entitlements.isDemo || entitlements.plan.is_enterprise ? 9999 : entitlements.plan.max_team_members ?? 0;
}

export function getStorageLimit(entitlements: PlanEntitlements): number {
  return entitlements.isDemo || entitlements.plan.is_enterprise ? 9999 : entitlements.plan.storage_gb ?? 0;
}

export function isReadOnlySubscription(entitlements: PlanEntitlements): boolean {
  return entitlements.isReadOnly;
}
