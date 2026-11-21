import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Disabled. The previous version used the service role without checking the caller, so anyone holding the public anon key could write to any agency's landlords and properties. Imports now go through the in-app importer, which runs under the user's own row-level security.
// Kept as a stub (rather than deleted) so a deploy from this repo can never
// bring the old, unauthenticated version back.

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(() => new Response(JSON.stringify({
  error: "Bulk import through this endpoint is disabled. Use Dashboard -> Import.",
  code: "ENDPOINT_DISABLED",
}), { status: 503, headers }));
