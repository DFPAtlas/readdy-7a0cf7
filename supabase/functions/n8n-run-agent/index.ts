// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Runs an n8n agent on behalf of a signed-in user.
//
// Who may run what:
//  - lethub_core (the HAL autonomous manager) and any agent with no agency_id
//    are platform-wide: platform_admin only.
//  - An agent with an agency_id: agency staff who are members of that agency,
//    or platform_admin.
// Caller-supplied account_id / triggered_by_user_id / source are ignored; the
// agency and actor always come from server-side state.

const ALLOWED_ORIGINS = ["https://lethub.uk", "https://www.lethub.uk"];
const AGENCY_ROLES = ["estate_agent_admin", "estate_agent_staff"];
const DEFAULT_CORE_WEBHOOK = "https://atlas-hal.tail3b5523.ts.net:10000/webhook/lethub-autonomous-manager-01-v2";
const DISPATCH_TIMEOUT_MS = 15_000;

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function bearer(req: Request): string | null {
  const parts = (req.headers.get("authorization") || "").split(" ");
  return parts.length === 2 && parts[0].toLowerCase() === "bearer" ? parts[1] : null;
}

function parseHttpsUrl(value: unknown): URL | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const json = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json(405, { success: false, error: "Method not allowed" });

  try {
    const token = bearer(req);
    if (!token) return json(401, { success: false, error: "Missing authorization token" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) return json(500, { success: false, error: "Service role key is not configured" });

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return json(401, { success: false, error: "Invalid or expired token" });

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Read the role server-side (the anon client has no session, so RLS
    // would hide the row and every caller looked role-less).
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const userRole = String(profile?.role || "");
    const isPlatformAdmin = userRole === "platform_admin";
    if (!isPlatformAdmin && !AGENCY_ROLES.includes(userRole)) {
      return json(403, { success: false, error: "You do not have permission to run agents." });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json(400, { success: false, error: "Invalid JSON body" });
    }
    const agentKey = typeof body.agent_key === "string" ? body.agent_key.trim() : "";
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(agentKey)) return json(400, { success: false, error: "agent_key is required" });

    const { data: agent, error: agentError } = await admin.from("n8n_agents").select("*").eq("agent_key", agentKey).maybeSingle();
    if (agentError || !agent) return json(404, { success: false, error: "Agent not found" });
    if (!agent.enabled) return json(400, { success: false, error: "Agent is disabled. Enable it before running." });

    const isCore = agent.agent_key === "lethub_core";
    const isPlatformWide = isCore || !agent.agency_id;

    if (isPlatformWide && !isPlatformAdmin) {
      return json(403, { success: false, error: "Only platform administrators can run this agent." });
    }
    if (!isPlatformWide && !isPlatformAdmin) {
      const { data: membership, error: membershipError } = await admin
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", user.id)
        .eq("agency_id", agent.agency_id)
        .maybeSingle();
      if (membershipError || !membership) return json(403, { success: false, error: "Not permitted to run this agency's agent" });
    }

    // Work out where to send it, and how to authenticate.
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let webhook: URL | null;
    if (isCore) {
      webhook = parseHttpsUrl(Deno.env.get("LETHUB_CORE_WEBHOOK_URL") || DEFAULT_CORE_WEBHOOK);
      const ingressToken = Deno.env.get("LETHUB_N8N_WEBHOOK_TOKEN");
      if (!ingressToken) return json(503, { success: false, error: "LetHub manager authentication is unavailable" });
      headers["X-LetHub-Webhook-Token"] = ingressToken;
    } else {
      webhook = parseHttpsUrl(agent.n8n_webhook_url);
      const allowedHosts = (Deno.env.get("N8N_ALLOWED_WEBHOOK_HOSTS") || "")
        .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
      if (webhook && !allowedHosts.includes(webhook.hostname.toLowerCase())) webhook = null;
      const n8nSecret = Deno.env.get("N8N_AGENT_WEBHOOK_SECRET");
      if (n8nSecret) headers["Authorization"] = `Bearer ${n8nSecret}`;
    }
    if (!webhook) return json(503, { success: false, error: "This agent has no approved webhook configured" });

    const runPayload = {
      agent_key: agent.agent_key,
      agent_name: agent.agent_name,
      agent_group: agent.agent_group,
      account_id: agent.agency_id ?? null,
      triggered_by_user_id: user.id,
      source: "lethub_agent_control",
      triggered_at: new Date().toISOString(),
      triggered_by_email: user.email,
      triggered_by_role: userRole,
    };
    const requestBody = isCore
      ? { event_type: "analytics.requested", source: "lethub_agent_control", payload: runPayload }
      : runPayload;

    let dispatch: { status: number; ok: boolean; error?: string };
    try {
      const resp = await fetch(webhook.toString(), {
        method: "POST",
        headers,
        redirect: "error",
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(DISPATCH_TIMEOUT_MS),
      });
      dispatch = { status: resp.status, ok: resp.ok };
    } catch (err) {
      dispatch = { status: 0, ok: false, error: err instanceof Error ? err.name : "fetch_failed" };
    }

    if (!dispatch.ok) {
      await admin.from("platform_audit_log").insert({
        event: "n8n_agent_run_failed",
        actor_id: user.id,
        actor_email: user.email,
        actor_role: userRole,
        details: { agent_key: agent.agent_key, status: dispatch.status, error: dispatch.error ?? null },
      });
      return json(502, { success: false, error: "Agent webhook dispatch failed", webhook_response: dispatch });
    }

    const now = new Date().toISOString();
    await admin.from("n8n_agents").update({ status: "running", last_run_at: now, updated_at: now }).eq("id", agent.id);
    const { data: runRecord } = await admin
      .from("n8n_agent_runs")
      .insert({ agent_id: agent.id, agent_key: agent.agent_key, run_status: "started", started_at: now })
      .select("id")
      .single();
    await admin.from("platform_audit_log").insert({
      event: "n8n_agent_run",
      actor_id: user.id,
      actor_email: user.email,
      actor_role: userRole,
      details: { agent_key: agent.agent_key, agent_name: agent.agent_name, run_id: runRecord?.id },
    });

    return json(200, {
      success: true,
      agent_key: agent.agent_key,
      agent_name: agent.agent_name,
      status: "running",
      webhook_dispatched: true,
      webhook_response: dispatch,
      message: `${agent.agent_name} has been triggered.`,
    });
  } catch (err) {
    console.error("n8n-run-agent error", err);
    return json(500, { success: false, error: "Unexpected error running agent" });
  }
});
