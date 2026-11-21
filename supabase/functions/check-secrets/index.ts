import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Disabled. The previous version listed which secrets were configured to any caller.
// Kept as a stub (rather than deleted) so a deploy from this repo can never
// bring the old, unauthenticated version back.

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(() => new Response(JSON.stringify({
  error: "Secret diagnostics are disabled in production.",
  code: "ENDPOINT_DISABLED",
}), { status: 503, headers }));
