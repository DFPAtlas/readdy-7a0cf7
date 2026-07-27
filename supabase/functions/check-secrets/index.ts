// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const secrets = [
    "SB_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_STARTER_MONTHLY",
    "STRIPE_PRICE_STARTER_ANNUAL",
    "STRIPE_PRICE_PROFESSIONAL_MONTHLY",
    "STRIPE_PRICE_PROFESSIONAL_ANNUAL",
    "STRIPE_PRICE_BUSINESS_MONTHLY",
    "STRIPE_PRICE_BUSINESS_ANNUAL",
  ];

  const results: Record<string, boolean> = {};
  const missing: string[] = [];

  for (const s of secrets) {
    const val = Deno.env.get(s);
    results[s] = !!val;
    if (!val) missing.push(s);
  }

  return new Response(
    JSON.stringify({ results, all_present: missing.length === 0, missing }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
