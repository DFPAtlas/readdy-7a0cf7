// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_DEFAULTS: Record<string, { name: string; description: string; monthlyAmount: number; annualAmount: number }> = {
  starter: { name: "Starter", description: "Up to 5 properties, 2 team members, basic compliance, 5GB storage", monthlyAmount: 2900, annualAmount: 2400 },
  professional: { name: "Professional", description: "Up to 25 properties, 5 team members, full compliance, AI assistant, contractor panel, 50GB storage", monthlyAmount: 7900, annualAmount: 6600 },
  business: { name: "Business", description: "Up to 100 properties, 15 team members, white-label portal, API access, advanced analytics, 200GB storage", monthlyAmount: 19900, annualAmount: 16600 },
  enterprise: { name: "Enterprise", description: "Unlimited properties, unlimited team, custom integrations, SSO, 24/7 support", monthlyAmount: 49900, annualAmount: 49900 },
};

const PRICE_ENV_MAP: Record<string, Record<string, string>> = {
  starter: { monthly: "STRIPE_PRICE_STARTER_MONTHLY", annual: "STRIPE_PRICE_STARTER_ANNUAL" },
  professional: { monthly: "STRIPE_PRICE_PROFESSIONAL_MONTHLY", annual: "STRIPE_PRICE_PROFESSIONAL_ANNUAL" },
  business: { monthly: "STRIPE_PRICE_BUSINESS_MONTHLY", annual: "STRIPE_PRICE_BUSINESS_ANNUAL" },
};

function getEnvPriceId(planSlug: string, billingCycle: string): string | null {
  const envMap = PRICE_ENV_MAP[planSlug];
  if (!envMap) return null;
  const envVar = envMap[billingCycle];
  if (!envVar) return null;
  const val = Deno.env.get(envVar);
  return val && val.trim() !== "" ? val.trim() : null;
}

function getAllMissingPrices(): string[] {
  const missing: string[] = [];
  for (const [plan, cycles] of Object.entries(PRICE_ENV_MAP)) {
    for (const [cycle, envVar] of Object.entries(cycles)) {
      const val = Deno.env.get(envVar);
      if (!val || val.trim() === "") {
        missing.push(envVar);
      }
    }
  }
  return missing;
}

async function ensureStripePrice(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  planSlug: string,
  billingCycle: string
): Promise<string> {
  const priceColumn = billingCycle === "annual" ? "stripe_annual_price_id" : "stripe_monthly_price_id";
  const productColumn = "stripe_product_id";

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select(`id, ${productColumn}, ${priceColumn}`)
    .eq("slug", planSlug)
    .maybeSingle();

  if (!plan) throw new Error(`Plan ${planSlug} not found`);

  const existingPriceId = (plan as any)[priceColumn];
  if (existingPriceId) return existingPriceId;

  const defaults = PLAN_DEFAULTS[planSlug];
  if (!defaults) throw new Error(`No defaults configured for plan ${planSlug}`);

  let productId = (plan as any)[productColumn];

  if (!productId) {
    const product = await stripe.products.create({
      name: defaults.name,
      description: defaults.description,
      metadata: { plan_slug: planSlug },
    });
    productId = product.id;

    await supabaseAdmin
      .from("subscription_plans")
      .update({ stripe_product_id: productId })
      .eq("id", plan.id);
  }

  const amount = billingCycle === "annual" ? defaults.annualAmount : defaults.monthlyAmount;
  const interval = billingCycle === "annual" ? "year" : "month";

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: "gbp",
    recurring: { interval },
    metadata: { plan_slug: planSlug, billing_cycle: billingCycle },
  });

  await supabaseAdmin
    .from("subscription_plans")
    .update({ [priceColumn]: price.id })
    .eq("id", plan.id);

  return price.id;
}

function resolveStripePrice(
  planSlug: string,
  billingCycle: string,
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<string> {
  const envPriceId = getEnvPriceId(planSlug, billingCycle);
  if (envPriceId) {
    console.log(`Using env price for ${planSlug}/${billingCycle}: ${envPriceId}`);
    return Promise.resolve(envPriceId);
  }
  console.log(`No env price for ${planSlug}/${billingCycle}, falling back to dynamic creation`);
  return ensureStripePrice(stripe, supabaseAdmin, planSlug, billingCycle);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured. Please connect Stripe first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { plan_slug, billing_cycle } = body;

    if (!plan_slug) {
      return new Response(
        JSON.stringify({ error: "plan_slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!billing_cycle || !["monthly", "annual"].includes(billing_cycle)) {
      return new Response(
        JSON.stringify({ error: "billing_cycle must be monthly or annual" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const missingPrices = getAllMissingPrices();
    if (missingPrices.length > 0 && missingPrices.length < 6) {
      console.warn("Some Stripe price env vars are missing:", missingPrices.join(", "));
    }

    if (planSlug === "enterprise") {
      return new Response(
        JSON.stringify({ error: "Enterprise plan requires contacting sales. Please use /book-demo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-16.basil" });

    const stripePriceId = await resolveStripePrice(stripe, supabaseAdmin, planSlug, billingCycle);

    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("slug", plan_slug)
      .maybeSingle();

    if (!plan) {
      return new Response(
        JSON.stringify({ error: "Invalid plan slug" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingSub } = await supabaseAdmin
      .from("account_subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let stripeCustomerId = existingSub?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || undefined,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;
    }

    if (existingSub?.stripe_subscription_id) {
      try {
        const currentSub = await stripe.subscriptions.retrieve(existingSub.stripe_subscription_id);
        if (["active", "trialing", "past_due"].includes(currentSub.status)) {
          return new Response(
            JSON.stringify({ error: "You already have an active subscription. Use the billing portal to change plans." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch {
        // subscription not found, safe to create new
      }
    }

    const origin = req.headers.get("origin") || "https://lethub.uk";
    const successUrl = `${origin}/dashboard/billing?checkout=success`;
    const cancelUrl = `${origin}/pricing?checkout=cancelled`;

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: plan.trial_days || 14,
        metadata: {
          user_id: user.id,
          plan_slug,
          billing_cycle,
        },
      },
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan_slug,
        billing_cycle,
      },
    });

    await supabaseAdmin
      .from("account_subscriptions")
      .upsert({
        user_id: user.id,
        plan_slug,
        status: "pending",
        stripe_customer_id: stripeCustomerId,
        billing_cycle,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
