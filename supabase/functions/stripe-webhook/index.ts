// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13";

const ALLOWED_ORIGINS = [
  "https://lethub.uk",
  "https://www.lethub.uk",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function toISO(ts: number): string {
  return new Date(ts * 1000).toISOString();
}

function maskSecret(val: string): string {
  if (val.length <= 8) return "***";
  return val.slice(0, 4) + "..." + val.slice(-4);
}

function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = [
    { name: "STRIPE_SECRET_KEY", value: Deno.env.get("STRIPE_SECRET_KEY") },
    { name: "STRIPE_WEBHOOK_SECRET", value: Deno.env.get("STRIPE_WEBHOOK_SECRET") },
    { name: "SUPABASE_URL", value: Deno.env.get("SUPABASE_URL") },
    { name: "SB_SERVICE_ROLE_KEY", value: Deno.env.get("SB_SERVICE_ROLE_KEY") },
  ];

  for (const { name, value } of required) {
    if (!value || value.trim() === "") {
      errors.push(`Missing required environment variable: ${name}`);
    }
  }

  if (errors.length > 0) {
    console.error("Webhook environment validation failed:", errors);
  } else {
    const sk = Deno.env.get("STRIPE_SECRET_KEY")!;
    const ws = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    console.log(`Webhook initialized — STRIPE_SECRET_KEY ${maskSecret(sk)}, STRIPE_WEBHOOK_SECRET ${maskSecret(ws)}`);
  }

  return { valid: errors.length === 0, errors };
}

async function upsertSubscription(
  supabaseAdmin: ReturnType<typeof createClient>,
  data: {
    stripe_customer_id: string;
    stripe_subscription_id: string;
    user_id?: string;
    plan_slug?: string;
    billing_cycle?: string;
    status: string;
    trial_started_at?: string | null;
    trial_ends_at?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
  }
) {
  const existing = data.stripe_subscription_id
    ? await supabaseAdmin
        .from("account_subscriptions")
        .select("id, user_id")
        .eq("stripe_subscription_id", data.stripe_subscription_id)
        .maybeSingle()
    : null;

  const existingByCustomer = !existing?.data
    ? await supabaseAdmin
        .from("account_subscriptions")
        .select("id, user_id")
        .eq("stripe_customer_id", data.stripe_customer_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : null;

  const payload: Record<string, unknown> = {
    stripe_customer_id: data.stripe_customer_id,
    status: data.status,
    current_period_start: data.current_period_start || null,
    current_period_end: data.current_period_end || null,
    trial_started_at: data.trial_started_at || null,
    trial_ends_at: data.trial_ends_at || null,
    billing_cycle: data.billing_cycle || "monthly",
    updated_at: new Date().toISOString(),
  };

  if (data.stripe_subscription_id) {
    payload.stripe_subscription_id = data.stripe_subscription_id;
  }
  if (data.plan_slug) {
    payload.plan_slug = data.plan_slug;
  }

  const target = existing?.data || existingByCustomer?.data;

  if (target?.id) {
    await supabaseAdmin
      .from("account_subscriptions")
      .update(payload)
      .eq("id", target.id);
  } else if (data.user_id) {
    payload.user_id = data.user_id;
    if (!data.plan_slug) payload.plan_slug = "starter";
    await supabaseAdmin.from("account_subscriptions").insert(payload);
  } else {
    console.warn("Cannot upsert subscription: no existing record and no user_id");
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  const envCheck = validateEnv();
  if (!envCheck.valid) {
    console.error("Webhook started with missing env vars:", envCheck.errors);
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!;

    if (!stripeKey || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe or webhook secret not configured" }),
        { status: 500, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-06-16.basil",
    });

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existing } = await supabaseAdmin
      .from("processed_stripe_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existing) {
      console.log(`Duplicate event ${event.id} — skipping`);
      return new Response(
        JSON.stringify({ received: true, deduplicated: true }),
        { status: 200, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin
      .from("processed_stripe_events")
      .insert({ stripe_event_id: event.id, event_type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planSlug = session.metadata?.plan_slug;
        const billingCycle = session.metadata?.billing_cycle;

        if (session.subscription && typeof session.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);

          await upsertSubscription(supabaseAdmin, {
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription,
            user_id: userId || undefined,
            plan_slug: planSlug || undefined,
            billing_cycle: billingCycle || undefined,
            status: subscription.status === "trialing" ? "trialing" : "active",
            trial_started_at: subscription.trial_start ? toISO(subscription.trial_start) : null,
            trial_ends_at: subscription.trial_end ? toISO(subscription.trial_end) : null,
            current_period_start: subscription.current_period_start ? toISO(subscription.current_period_start) : null,
            current_period_end: subscription.current_period_end ? toISO(subscription.current_period_end) : null,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        let status = subscription.status;
        if (status === "trialing") status = "trialing";
        else if (status === "active") status = "active";
        else if (status === "past_due") status = "past_due";
        else if (status === "canceled") status = "cancelled";
        else if (status === "unpaid") status = "past_due";
        else status = "active";

        await upsertSubscription(supabaseAdmin, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status,
          trial_started_at: subscription.trial_start ? toISO(subscription.trial_start) : null,
          trial_ends_at: subscription.trial_end ? toISO(subscription.trial_end) : null,
          current_period_start: subscription.current_period_start ? toISO(subscription.current_period_start) : null,
          current_period_end: subscription.current_period_end ? toISO(subscription.current_period_end) : null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await upsertSubscription(supabaseAdmin, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: "cancelled",
          current_period_start: subscription.current_period_start ? toISO(subscription.current_period_start) : null,
          current_period_end: subscription.current_period_end ? toISO(subscription.current_period_end) : null,
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

          await upsertSubscription(supabaseAdmin, {
            stripe_customer_id: invoice.customer as string,
            stripe_subscription_id: invoice.subscription,
            status: "active",
            current_period_start: subscription.current_period_start ? toISO(subscription.current_period_start) : null,
            current_period_end: subscription.current_period_end ? toISO(subscription.current_period_end) : null,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && typeof invoice.subscription === "string") {
          await upsertSubscription(supabaseAdmin, {
            stripe_customer_id: invoice.customer as string,
            stripe_subscription_id: invoice.subscription,
            status: "past_due",
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
    );
  }
});
