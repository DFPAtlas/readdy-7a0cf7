import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const selfRegistrationRoles = new Set([
  "estate_agent_admin",
  "landlord",
]);

const placeholderRoles = new Set(["client"]);

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("APP_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0
    ? configured
    : ["https://lethub.uk", "https://www.lethub.uk"];
}

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const origins = allowedOrigins();
  return {
    "Access-Control-Allow-Origin": origin && origins.includes(origin) ? origin : origins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Vary": "Origin",
  };
}

function reply(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors(req) });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return reply(req, { error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) return reply(req, { error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!serviceKey) throw new Error("Service role key is not configured");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return reply(req, { error: "Invalid session" }, 401);

    const body = await req.json().catch(() => ({}));
    const metadata = user.user_metadata || {};
    const requestedRole = String(body.role || "").trim();
    const fullName = String(body.full_name || metadata.full_name || "").trim().slice(0, 160);

    const { data: existing, error: existingError } = await admin
      .from("profiles")
      .select("id, role, account_type")
      .eq("id", user.id)
      .maybeSingle();
    if (existingError) throw existingError;

    if (!selfRegistrationRoles.has(requestedRole)) {
      return reply(req, {
        error: "This account type is not available for public self-registration. Tenant and contractor accounts are created through a secure invitation.",
        code: "role_not_permitted",
      }, 400);
    }

    const existingRole = existing?.role ? String(existing.role) : "";

    // A profile that already holds a real (non-placeholder) role must never be
    // changed here. This blocks escalation of an invited tenant, contractor,
    // agency member or platform admin through public self-registration.
    if (existing && !placeholderRoles.has(existingRole)) {
      const updatePayload: Record<string, unknown> = { email: user.email || null };
      if (fullName) updatePayload.full_name = fullName;
      const { error } = await admin.from("profiles").update(updatePayload).eq("id", user.id);
      if (error) throw error;
      return reply(req, {
        profile_ready: true,
        role: existingRole,
        created: false,
        role_applied: false,
      });
    }

    const accountType = requestedRole === "estate_agent_admin" ? "agency" : "owner";

    const { data: profile, error: upsertError } = await admin
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email || null,
        full_name: fullName || user.email || "New user",
        role: requestedRole,
        account_type: accountType,
      }, { onConflict: "id" })
      .select("id, role, account_type")
      .single();
    if (upsertError) throw upsertError;

    return reply(req, {
      profile_ready: true,
      role: profile.role,
      created: !existing,
      role_applied: true,
    }, existing ? 200 : 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration setup failed";
    return reply(req, { error: message }, 400);
  }
});
