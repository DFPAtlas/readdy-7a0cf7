import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Disabled. The previous version created Stripe products/prices and rewrote subscription_plans without any authentication. Prices are managed in Stripe and recorded in subscription_plans by an administrator.
// Kept as a stub (rather than deleted) so a deploy from this repo can never
// bring the old, unauthenticated version back.

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(() => new Response(JSON.stringify({
  error: "Stripe product provisioning is disabled in production. Use approved deployment tooling.",
  code: "ENDPOINT_DISABLED",
}), { status: 503, headers }));
