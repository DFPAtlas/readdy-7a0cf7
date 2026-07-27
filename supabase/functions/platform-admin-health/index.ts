import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "No token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "platform_admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SB_SERVICE_ROLE_KEY")!
    );

    const checks: Record<string, any> = {};

    const { data: tables } = await serviceClient
      .from("profiles")
      .select("id", { count: "exact", head: true });
    checks.supabase_connection = !tables ? false : true;

    const { data: { users }, error: authErr } = await serviceClient.auth.admin.listUsers({ perPage: 1 });
    checks.auth_status = !authErr;

    const secrets = ["SB_SERVICE_ROLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];
    const secretResults: Record<string, boolean> = {};
    for (const s of secrets) {
      secretResults[s] = !!Deno.env.get(s);
    }
    checks.secrets = secretResults;

    try {
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/check-secrets`,
        { headers: { Authorization: `Bearer ${Deno.env.get("SB_SERVICE_ROLE_KEY")}` } }
      );
      checks.check_secrets_fn = resp.ok ? "available" : "unavailable";
    } catch {
      checks.check_secrets_fn = "unreachable";
    }

    try {
      const { count } = await serviceClient
        .from("n8n_agents")
        .select("*", { count: "exact", head: true });
      checks.n8n_agents_count = count;
    } catch {
      checks.n8n_agents_count = "unavailable";
    }

    try {
      const { count } = await serviceClient
        .from("platform_audit_log")
        .select("*", { count: "exact", head: true })
        .order("created_at", { ascending: false })
        .limit(5);
      checks.latest_audit_entries = count;
    } catch {
      checks.latest_audit_entries = "unavailable";
    }

    const overall = Object.values(checks).every((v) => v === true || typeof v === "object" || typeof v === "number");
    checks.overall_healthy = overall;

    return new Response(JSON.stringify(checks), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
