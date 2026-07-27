// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13";

const billingRoles = new Set(["platform_admin", "estate_agent_admin", "landlord"]);

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
  const origins = allowedOrigins();
  const origin = req.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": origin && origins.includes(origin) ? origin : origins[0],
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

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !billingRoles.has(profile.role)) {
      return reply(req, { error: "This account cannot manage billing" }, 403);
    }

    const { data: subscription, error: subscriptionError } = await admin
      .from("account_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subscriptionError) throw subscriptionError;
    if (!subscription?.stripe_customer_id) {
      return reply(req, { error: "No Stripe customer is linked to this account" }, 404);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-06-16.basil" });
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`,
    });

    return reply(req, { url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to open billing portal";
    const status = message === "Origin is not allowed" ? 403 : 400;
    console.error("Billing portal error", error);
    return reply(req, { error: message }, status);
  }
});
