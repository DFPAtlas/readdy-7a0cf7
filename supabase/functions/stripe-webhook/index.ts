// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function toIso(timestamp: number | null | undefined): string | undefined {
  return timestamp ? new Date(timestamp * 1000).toISOString() : undefined;
}

function normaliseStatus(status: string): string {
  const known = new Set([
    "trialing",
    "active",
    "past_due",
    "incomplete",
    "incomplete_expired",
    "unpaid",
    "paused",
  ]);
  if (status === "canceled") return "cancelled";
  return known.has(status) ? status : "incomplete";
}

async function claimEvent(admin: ReturnType<typeof createClient>, event: Stripe.Event) {
  const { data: existing } = await admin
    .from("processed_stripe_events")
    .select("id, status, attempt_count")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing?.status === "processed") return { process: false, reason: "duplicate" };
  if (existing?.status === "processing") return { process: false, reason: "in_progress" };

  if (existing) {
    const { error } = await admin
      .from("processed_stripe_events")
      .update({
        status: "processing",
        attempt_count: Number(existing.attempt_count || 0) + 1,
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
    return { process: true, id: existing.id };
  }

  const { data, error } = await admin
    .from("processed_stripe_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      status: "processing",
      attempt_count: 1,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { process: false, reason: "parallel_duplicate" };
    throw error;
  }
  return { process: true, id: data.id };
}

async function markEvent(
  admin: ReturnType<typeof createClient>,
  eventId: string,
  status: "processed" | "failed",
  errorMessage?: string,
) {
  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    last_error: errorMessage || null,
  };
  if (status === "processed") payload.processed_at = new Date().toISOString();
  await admin.from("processed_stripe_events").update(payload).eq("stripe_event_id", eventId);
}

async function resolvePlan(
  admin: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
) {
  const price = subscription.items.data[0]?.price;
  if (!price?.id) throw new Error("Subscription has no recurring Price");

  const { data: plans, error } = await admin
    .from("subscription_plans")
    .select("slug, stripe_monthly_price_id, stripe_annual_price_id")
    .eq("is_active", true);
  if (error) throw error;

  const plan = (plans || []).find((item) =>
    item.stripe_monthly_price_id === price.id || item.stripe_annual_price_id === price.id
  );
  if (!plan) throw new Error(`Stripe Price ${price.id} is not mapped to an active LetHub plan`);

  return {
    planSlug: plan.slug,
    billingCycle: price.recurring?.interval === "year" ? "annual" : "monthly",
  };
}

async function projectSubscription(
  admin: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
  fallbackUserId?: string,
) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
  const metadataUserId = subscription.metadata?.user_id || fallbackUserId;
  const { planSlug, billingCycle } = await resolvePlan(admin, subscription);

  const { data: bySubscription } = await admin
    .from("account_subscriptions")
    .select("id, user_id, trial_started_at")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const { data: byCustomer } = !bySubscription
    ? await admin
        .from("account_subscriptions")
        .select("id, user_id, trial_started_at")
        .eq("stripe_customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const existing = bySubscription || byCustomer;
  const userId = existing?.user_id || metadataUserId;
  if (!userId) throw new Error("Subscription cannot be linked to a LetHub user");
  if (existing?.user_id && metadataUserId && existing.user_id !== metadataUserId) {
    throw new Error("Stripe customer ownership does not match the LetHub user");
  }

  const payload: Record<string, unknown> = {
    user_id: userId,
    plan_slug: planSlug,
    billing_cycle: billingCycle,
    status: normaliseStatus(subscription.status),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString(),
  };

  const trialStart = toIso(subscription.trial_start);
  const trialEnd = toIso(subscription.trial_end);
  const periodStart = toIso(subscription.current_period_start);
  const periodEnd = toIso(subscription.current_period_end);
  if (trialStart) payload.trial_started_at = trialStart;
  else if (existing?.trial_started_at) payload.trial_started_at = existing.trial_started_at;
  if (trialEnd) payload.trial_ends_at = trialEnd;
  if (periodStart) payload.current_period_start = periodStart;
  if (periodEnd) payload.current_period_end = periodEnd;

  if (existing?.id) {
    const { error } = await admin.from("account_subscriptions").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await admin
      .from("account_subscriptions")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw error;
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return json({ error: "Webhook environment is incomplete" }, 500);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing stripe-signature header" }, 400);

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-16.basil" });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  let event: Stripe.Event | null = null;

  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe signature verification failed", error);
    return json({ error: "Invalid signature" }, 400);
  }

  try {
    const claim = await claimEvent(admin, event);
    if (!claim.process) return json({ received: true, deduplicated: true, reason: claim.reason });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (typeof session.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await projectSubscription(admin, subscription, session.client_reference_id || session.metadata?.user_id);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await projectSubscription(admin, event.data.object as Stripe.Subscription);
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (typeof invoice.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await projectSubscription(admin, subscription);
        }
        break;
      }

      default:
        console.log(`Ignoring Stripe event ${event.type}`);
    }

    await markEvent(admin, event.id, "processed");
    return json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    console.error("Stripe webhook processing failed", error);
    await markEvent(admin, event.id, "failed", message).catch(() => undefined);
    return json({ error: message }, 500);
  }
});
