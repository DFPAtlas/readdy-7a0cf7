import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const jsonHeaders = { "Content-Type": "application/json" };
const allowedRoles = new Set(["platform_admin", "estate_agent_admin"]);
const allowedModules = new Set([
  "properties", "tenants", "owners", "tenancies", "compliance",
  "maintenance", "inspections", "documents", "reports",
]);
const allowedAccess = new Set(["read", "write", "read_write"]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "*";
  const configured = (Deno.env.get("APP_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin = configured.length === 0 || configured.includes(origin)
    ? origin
    : configured[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function response(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), ...jsonHeaders },
  });
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function cleanScopes(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input.map((scope) => {
    const module = String(scope?.module || "");
    const access = String(scope?.access || "");
    if (!allowedModules.has(module) || !allowedAccess.has(access)) {
      throw new Error("Invalid API scope");
    }
    return { module, access };
  });
}

function validWebhookUrl(input: unknown): string {
  const value = String(input || "").trim();
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("Webhook URLs must use HTTPS");
  }
  return url.toString();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return response(req, { error: "Method not allowed" }, 405);
  }

  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return response(req, { error: "Authentication required" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SB_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return response(req, { error: "Invalid session" }, 401);

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !allowedRoles.has(profile.role)) {
      return response(req, { error: "Only agency or platform administrators can manage API credentials" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const requestedAgencyId = typeof body.agency_id === "string" ? body.agency_id : null;

    let agencyId: string | null = null;
    if (profile.role === "platform_admin" && requestedAgencyId) {
      agencyId = requestedAgencyId;
    } else {
      const { data: membership } = await serviceClient
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", user.id)
        .limit(1)
        .maybeSingle();
      agencyId = membership?.agency_id || null;
    }

    if (!agencyId) {
      return response(req, { error: "No agency membership is available for this account" }, 403);
    }

    const action = String(body.action || "bootstrap");

    if (action === "bootstrap") {
      const [keysResult, webhooksResult] = await Promise.all([
        serviceClient
          .from("api_keys")
          .select("id, name, key_prefix, scopes, is_revoked, last_used_at, created_at, created_by")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false }),
        serviceClient
          .from("webhook_endpoints")
          .select("id, name, url, events, is_active, last_triggered_at, created_at")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false }),
      ]);

      if (keysResult.error) throw keysResult.error;
      if (webhooksResult.error) throw webhooksResult.error;

      const keyIds = (keysResult.data || []).map((key) => key.id);
      let audit: unknown[] = [];
      if (keyIds.length > 0) {
        const { data, error } = await serviceClient
          .from("api_audit_log")
          .select("id, api_key_id, module, action, endpoint, method, status_code, response_ms, ip_address, user_agent, created_at")
          .in("api_key_id", keyIds)
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        const prefixes = new Map((keysResult.data || []).map((key) => [key.id, key.key_prefix]));
        audit = (data || []).map((entry) => ({
          ...entry,
          key_prefix: entry.api_key_id ? prefixes.get(entry.api_key_id) || null : null,
        }));
      }

      return response(req, {
        api_keys: keysResult.data || [],
        webhooks: webhooksResult.data || [],
        audit,
      });
    }

    if (action === "generate_api_key") {
      const name = String(body.name || "").trim();
      if (!name || name.length > 100) throw new Error("A valid key name is required");
      const scopes = cleanScopes(body.scopes);
      const rawKey = `lh_live_${randomHex(32)}`;
      const keyPrefix = rawKey.slice(0, 16);
      const keyHash = await sha256(rawKey);

      const { data, error } = await serviceClient
        .from("api_keys")
        .insert({
          agency_id: agencyId,
          name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          scopes,
          is_revoked: false,
          created_by: user.id,
        })
        .select("id, name, key_prefix, scopes, is_revoked, last_used_at, created_at, created_by")
        .single();
      if (error) throw error;

      await serviceClient.from("platform_audit_log").insert({
        actor_profile_id: user.id,
        action: "generate_api_key",
        target_table: "api_keys",
        target_id: data.id,
        details: { agency_id: agencyId, key_prefix: keyPrefix },
      });

      return response(req, { api_key: data, secret: rawKey }, 201);
    }

    if (action === "revoke_api_key") {
      const id = String(body.id || "");
      const { data, error } = await serviceClient
        .from("api_keys")
        .update({ is_revoked: true })
        .eq("id", id)
        .eq("agency_id", agencyId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) return response(req, { error: "API key not found" }, 404);
      return response(req, { ok: true });
    }

    if (action === "create_webhook") {
      const name = String(body.name || "").trim();
      if (!name || name.length > 100) throw new Error("A valid webhook name is required");
      const url = validWebhookUrl(body.url);
      const events = Array.isArray(body.events)
        ? body.events.map((event: unknown) => String(event)).filter(Boolean).slice(0, 50)
        : [];
      const rawSecret = `whsec_${randomHex(32)}`;
      const secretHash = await sha256(rawSecret);

      const { data, error } = await serviceClient
        .from("webhook_endpoints")
        .insert({
          agency_id: agencyId,
          name,
          url,
          events,
          secret_hash: secretHash,
          is_active: true,
        })
        .select("id, name, url, events, is_active, last_triggered_at, created_at")
        .single();
      if (error) throw error;
      return response(req, { webhook: data, secret: rawSecret }, 201);
    }

    if (action === "toggle_webhook") {
      const id = String(body.id || "");
      const isActive = Boolean(body.is_active);
      const { data, error } = await serviceClient
        .from("webhook_endpoints")
        .update({ is_active: isActive })
        .eq("id", id)
        .eq("agency_id", agencyId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!data) return response(req, { error: "Webhook not found" }, 404);
      return response(req, { ok: true });
    }

    return response(req, { error: "Unknown action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return response(req, { error: message }, 400);
  }
});
