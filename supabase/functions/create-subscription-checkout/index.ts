// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13";

const billableRoles = new Set(["platform_admin", "estate_agent_admin", "landlord"]);
const validCycles = new Set(["monthly", "annual"]);

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("APP_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0
    ? configured
    : ["https://lethub.uk", "https://www.lethub.uk"];
}

function requestOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  const origins = allowedOrigins();
  if (origin && !origins.includes(origin)) throw new Error("Origin is not allowed");
  return origin || origins[0];
}

function headers(req: Request): Record<string, string> {
  let origin = allowedOrigins()[0];
  try {
    origin = requestOrigin(req);
  } catch {
    // The request will be rejected by the handler; return a non-reflective origin.
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function reply(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headers(req) });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: headers(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);

  try {
    const origin = requestOrigin(req);
    const authorization = req.headers.get("authorization");
    if (!authorization) return reply(req, { error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!serviceKey) throw new Error("Service role key is not configured");
    if (!stripeKey) throw new Error("Stripe is not configured");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return reply(req, { error: "Invalid session" }, 401);

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile || !billableRoles.has(profile.role)) {
      return reply(req, { error: "This account cannot manage billing" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const planSlug = String(body.plan_slug || "").trim().toLowerCase();
    const billingCycle = String(body.billing_cycle || "").trim().toLowerCase();
    const requestId = String(body.request_id || "").trim();

    if (!planSlug) return reply(req, { error: "plan_slug is required" }, 400);
    if (!validCycles.has(billingCycle)) {
      return reply(req, { error: "billing_cycle must be monthly or annual" }, 400);
    }
    if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
      return reply(req, { error: "A valid request_id is required" }, 400);
    }

    const priceColumn = billingCycle === "annual"
      ? "stripe_annual_price_id"
      : "stripe_monthly_price_id";

    const { data: plan, error: planError } = await admin
      .from("subscription_plans")
      .select(`slug, name, trial_days, is_active, is_enterprise, ${priceColumn}`)
      .eq("slug", planSlug)
      .eq("is_active", true)
      .maybeSingle();
    if (planError) throw planError;
    if (!plan) return reply(req, { error: "The selected plan is not available" }, 400);
    if (plan.is_enterprise || planSlug === "enterprise") {
      return reply(req, { error: "Enterprise subscriptions are arranged through LetHub sales" }, 400);
    }

    const stripePriceId = String(plan[priceColumn] || "");
    if (!stripePriceId.startsWith("price_")) {
      return reply(req, { error: `Stripe pricing is not configured for ${plan.name} ${billingCycle}` }, 503);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-16.basil" });

    const { data: existingSubscription, error: existingError } = await admin
      .from("account_subscriptions")
      .select("stripe_customer_id, stripe_subscription_id, trial_started_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;

    let customerId = existingSubscription?.stripe_customer_id || null;
    if (existingSubscription?.stripe_subscription_id) {
      try {
        const current = await stripe.subscriptions.retrieve(existingSubscription.stripe_subscription_id);
        if (["active", "trialing", "past_due", "unpaid", "paused", "incomplete"].includes(current.status)) {
          return reply(req, { error: "An existing subscription must be managed through the billing portal" }, 409);
        }
      } catch (error) {
        console.warn("Stored Stripe subscription could not be retrieved", error);
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: profile.full_name || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
    }

    let trialPreviouslyUsed = Boolean(existingSubscription?.trial_started_at);
    if (!trialPreviouslyUsed) {
      const history = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
      trialPreviouslyUsed = history.data.some((subscription) => Boolean(subscription.trial_start));
    }

    const metadata = {
      user_id: user.id,
      plan_slug: planSlug,
      billing_cycle: billingCycle,
    };

    const subscriptionData: Record<string, unknown> = { metadata };
    const trialDays = Number(plan.trial_days || 0);
    if (!trialPreviouslyUsed && trialDays > 0) {
      subscriptionData.trial_period_days = Math.min(trialDays, 30);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      subscription_data: subscriptionData,
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
      metadata,
    }, {
      idempotencyKey: `lethub-checkout-${user.id}-${requestId}`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return reply(req, { url: session.url, checkout_session_id: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout";
    const status = message === "Origin is not allowed" ? 403 : 400;
    console.error("Checkout error", error);
    return reply(req, { error: message }, status);
  }
});
