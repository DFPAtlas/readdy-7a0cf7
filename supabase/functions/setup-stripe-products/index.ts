// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    description: "Up to 5 properties, 2 team members, basic compliance, 5GB storage",
    monthly: { amount: 2900, currency: "gbp" },
    annual: { amount: 2400, currency: "gbp" },
  },
  {
    slug: "professional",
    name: "Professional",
    description: "Up to 25 properties, 5 team members, full compliance, AI assistant, contractor panel, 50GB storage",
    monthly: { amount: 7900, currency: "gbp" },
    annual: { amount: 6600, currency: "gbp" },
  },
  {
    slug: "business",
    name: "Business",
    description: "Up to 100 properties, 15 team members, white-label portal, API access, advanced analytics, 200GB storage",
    monthly: { amount: 19900, currency: "gbp" },
    annual: { amount: 16600, currency: "gbp" },
  },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!;

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "STRIPE_SECRET_KEY not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-16.basil" });
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: Record<string, any> = {};

    for (const plan of PLANS) {
      const { data: existing } = await supabase
        .from("subscription_plans")
        .select("id, stripe_price_id, stripe_product_id")
        .eq("slug", plan.slug)
        .maybeSingle();

      if (!existing) {
        results[plan.slug] = { error: "Plan not found in database" };
        continue;
      }

      const updates: Record<string, string> = {};
      let alreadySetup = true;

      let productId = existing.stripe_product_id;
      if (!productId) {
        alreadySetup = false;
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: { plan_slug: plan.slug },
        });
        productId = product.id;
        updates.stripe_product_id = product.id;
      }

      let monthlyPriceId = (existing as any)?.stripe_monthly_price_id;
      if (!monthlyPriceId) {
        alreadySetup = false;
        const price = await stripe.prices.create({
          product: productId!,
          unit_amount: plan.monthly.amount,
          currency: plan.monthly.currency,
          recurring: { interval: "month" },
          metadata: { plan_slug: plan.slug, billing_cycle: "monthly" },
        });
        monthlyPriceId = price.id;
        updates.stripe_monthly_price_id = price.id;
      }

      let annualPriceId = (existing as any)?.stripe_annual_price_id;
      if (!annualPriceId) {
        alreadySetup = false;
        const price = await stripe.prices.create({
          product: productId!,
          unit_amount: plan.annual.amount,
          currency: plan.annual.currency,
          recurring: { interval: "year" },
          metadata: { plan_slug: plan.slug, billing_cycle: "annual" },
        });
        annualPriceId = price.id;
        updates.stripe_annual_price_id = price.id;
      }

      if (!alreadySetup && Object.keys(updates).length > 0) {
        await supabase
          .from("subscription_plans")
          .update(updates)
          .eq("id", existing.id);
      }

      results[plan.slug] = {
        already_setup: alreadySetup,
        stripe_product_id: productId,
        monthly_price_id: monthlyPriceId,
        annual_price_id: annualPriceId,
      };
    }

    const enterpriseProduct = await stripe.products.create({
      name: "Enterprise",
      description: "Unlimited properties, unlimited team, custom integrations, SSO, dedicated account manager, 24/7 support",
      metadata: { plan_slug: "enterprise" },
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 49900,
      currency: "gbp",
      recurring: { interval: "month" },
      metadata: { plan_slug: "enterprise", billing_cycle: "monthly" },
    });

    const { data: enterprisePlan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", "enterprise")
      .maybeSingle();

    if (enterprisePlan) {
      await supabase
        .from("subscription_plans")
        .update({
          stripe_product_id: enterpriseProduct.id,
          stripe_monthly_price_id: enterprisePrice.id,
        })
        .eq("id", enterprisePlan.id);
    }

    results.enterprise = {
      stripe_product_id: enterpriseProduct.id,
      monthly_price_id: enterprisePrice.id,
    };

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Setup error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
