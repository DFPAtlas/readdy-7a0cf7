import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Disabled. The previous version deleted rows by import_id across all agencies without checking the caller.
// Kept as a stub (rather than deleted) so a deploy from this repo can never
// bring the old, unauthenticated version back.

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(() => new Response(JSON.stringify({
  error: "Import undo through this endpoint is disabled.",
  code: "ENDPOINT_DISABLED",
}), { status: 503, headers }));
