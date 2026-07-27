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

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return new Response(JSON.stringify({ error: "Missing key or value" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SB_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await serviceClient
      .from("platform_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await serviceClient
        .from("platform_settings")
        .update({ value, updated_at: new Date().toISOString(), updated_by: user.id })
        .eq("id", existing.id);
    } else {
      await serviceClient
        .from("platform_settings")
        .insert({ key, value, updated_by: user.id });
    }

    await serviceClient.from("platform_audit_log").insert({
      actor_profile_id: user.id,
      action: `update_setting:${key}`,
      target_table: "platform_settings",
      target_id: existing?.id || null,
      details: { key, value },
    });

    return new Response(JSON.stringify({ ok: true, key, value }), {
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
