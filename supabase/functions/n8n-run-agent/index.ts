// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://lethub.uk",
  "https://www.lethub.uk",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function getTokenFromHeader(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization token" }), {
        status: 401,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role, account_type")
      .eq("id", user.id)
      .maybeSingle();

    const allowedRoles = ["agency", "landlord", "admin", "estate_agent_admin"];
    const userRole = profile?.role || profile?.account_type || "";

    if (!allowedRoles.includes(userRole)) {
      return new Response(JSON.stringify({ success: false, error: "You do not have permission to run agents. Required: agency, landlord, or admin role." }), {
        status: 403,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const { agent_key, account_id, triggered_by_user_id, source } = body;

    if (!agent_key) {
      return new Response(JSON.stringify({ success: false, error: "agent_key is required" }), {
        status: 400,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const { data: agent, error: agentError } = await supabase
      .from("n8n_agents")
      .select("*")
      .eq("agent_key", agent_key)
      .maybeSingle();

    if (agentError || !agent) {
      return new Response(JSON.stringify({ success: false, error: "Agent not found" }), {
        status: 404,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    if (!agent.enabled) {
      return new Response(JSON.stringify({ success: false, error: "Agent is disabled. Enable it before running." }), {
        status: 400,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const webhookUrl = agent.n8n_webhook_url;
    const n8nSecret = Deno.env.get("N8N_AGENT_WEBHOOK_SECRET");

    const payload = {
      agent_key: agent.agent_key,
      agent_name: agent.agent_name,
      agent_group: agent.agent_group,
      account_id: account_id || null,
      triggered_by_user_id: triggered_by_user_id || user.id,
      source: source || "lethub_agent_control",
      triggered_at: new Date().toISOString(),
      triggered_by_email: user.email,
      triggered_by_role: userRole,
    };

    let n8nResponse;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (n8nSecret) {
      headers["Authorization"] = `Bearer ${n8nSecret}`;
    }

    if (webhookUrl) {
      try {
        const resp = await fetch(webhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        n8nResponse = {
          status: resp.status,
          ok: resp.ok,
        };
      } catch (fetchErr: unknown) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        n8nResponse = { status: 0, ok: false, error: msg };
      }
    }

    await supabase.from("n8n_agents").update({
      status: "running",
      last_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", agent.id);

    const { data: runRecord } = await supabase.from("n8n_agent_runs").insert({
      agent_id: agent.id,
      agent_key: agent.agent_key,
      run_status: "started",
      started_at: new Date().toISOString(),
    }).select("id").single();

    await supabase.from("platform_audit_log").insert({
      event: "n8n_agent_run",
      actor_id: user.id,
      actor_email: user.email,
      actor_role: userRole,
      details: { agent_key, agent_name: agent.agent_name, run_id: runRecord?.id },
    });

    return new Response(JSON.stringify({
      success: true,
      agent_key: agent.agent_key,
      agent_name: agent.agent_name,
      status: "running",
      webhook_dispatched: !!webhookUrl,
      webhook_response: n8nResponse || null,
      message: agent.agent_name + " has been triggered.",
    }), {
      status: 200,
      headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});
