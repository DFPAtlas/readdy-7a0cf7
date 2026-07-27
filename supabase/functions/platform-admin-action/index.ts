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
      await supabaseClient.from("platform_audit_log").insert({
        actor_profile_id: user.id,
        action: "unauthorized_admin_access_attempt",
        target_table: "platform-admin-action",
        details: { attempted_action: "admin_action", user_role: profile?.role },
      });
      return new Response(JSON.stringify({ error: "Forbidden: not platform_admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, target_id, role } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SB_SERVICE_ROLE_KEY")!
    );

    switch (action) {
      case "suspend_user": {
        if (!target_id) throw new Error("Missing target_id");
        const { error: updateErr } = await serviceClient
          .from("profiles")
          .update({ role: "suspended" })
          .eq("id", target_id);

        if (updateErr) throw new Error(updateErr.message);

        await serviceClient.from("platform_audit_log").insert({
          actor_profile_id: user.id,
          action: "suspend_user",
          target_table: "profiles",
          target_id,
          details: { suspended_by: user.id },
        });
        break;
      }

      case "reactivate_user": {
        if (!target_id) throw new Error("Missing target_id");
        const { error: updateErr } = await serviceClient
          .from("profiles")
          .update({ role: "tenant" })
          .eq("id", target_id);

        if (updateErr) throw new Error(updateErr.message);

        await serviceClient.from("platform_audit_log").insert({
          actor_profile_id: user.id,
          action: "reactivate_user",
          target_table: "profiles",
          target_id,
          details: { reactivated_by: user.id },
        });
        break;
      }

      case "change_role": {
        if (!target_id || !role) throw new Error("Missing target_id or role");
        const validRoles = [
          "platform_admin", "estate_agent_admin", "estate_agent_staff",
          "landlord", "tenant", "contractor"
        ];
        if (!validRoles.includes(role)) throw new Error(`Invalid role: ${role}`);

        const { error: updateErr } = await serviceClient
          .from("profiles")
          .update({ role })
          .eq("id", target_id);

        if (updateErr) throw new Error(updateErr.message);

        await serviceClient.from("platform_audit_log").insert({
          actor_profile_id: user.id,
          action: "change_role",
          target_table: "profiles",
          target_id,
          details: { new_role: role, changed_by: user.id },
        });
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ ok: true, action }), {
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
