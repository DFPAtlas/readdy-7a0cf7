import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.1.2";

// Records a signed-in user's request to close their account and delete their
// data. Deletion itself is carried out by a platform admin from the admin
// console (admin_tasks), because agency data can include records the agency
// must keep for a period by law, and because closing an agency account
// affects its staff and portal users.
//
// Security model: requires a valid JWT; the request is always about the
// caller's own account. One open request per user.

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("APP_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : ["https://lethub.uk", "https://www.lethub.uk"];
}

function corsHeaders(req: Request): Record<string, string> {
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

function reply(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SOURCE = "account_deletion_request";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, { success: false, error: "Use POST." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return reply(req, { success: false, error: "Server is not configured." }, 500);

  const authorization = req.headers.get("authorization") || "";
  if (!/^bearer\s+\S+$/i.test(authorization)) return reply(req, { success: false, error: "Please sign in." }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return reply(req, { success: false, error: "Please sign in." }, 401);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const reason = String(body.reason ?? "").trim().slice(0, 1000);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: existing } = await admin
    .from("admin_tasks")
    .select("id, created_at")
    .eq("source", SOURCE)
    .eq("linked_id", user.id)
    .in("status", ["open", "in_progress"])
    .limit(1)
    .maybeSingle();
  if (existing) {
    return reply(req, { success: true, already_requested: true, requested_at: existing.created_at });
  }

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    admin.from("profiles").select("full_name, email, role").eq("id", user.id).maybeSingle(),
    admin.from("agency_members").select("agency_id, role, agencies(name)").eq("profile_id", user.id),
  ]);

  const role = String(profile?.role || "unknown");
  const agencies = (memberships || []).map((m: any) => {
    const agency = Array.isArray(m.agencies) ? m.agencies[0] : m.agencies;
    return `${agency?.name || m.agency_id} (${m.role || "member"})`;
  });
  const isAgencyOwner = role === "estate_agent_admin";

  const description = [
    `User: ${profile?.full_name || "—"} <${profile?.email || user.email || "—"}>`,
    `User ID: ${user.id}`,
    `Role: ${role}`,
    agencies.length ? `Agencies: ${agencies.join(", ")}` : "Agencies: none",
    isAgencyOwner
      ? "Scope: agency admin — confirm whether the whole agency account is closing or only this user."
      : "Scope: this user's account and personal data.",
    reason ? `Reason given: ${reason}` : "Reason given: none",
    "Respond within one month (UK GDPR Article 12).",
  ].join("\n");

  const { data: task, error: taskError } = await admin
    .from("admin_tasks")
    .insert({
      title: `Account deletion request: ${profile?.email || user.email || user.id}`,
      description,
      priority: "high",
      status: "open",
      created_by: user.id,
      source: SOURCE,
      linked_table: "profiles",
      linked_id: user.id,
    })
    .select("id, created_at")
    .single();
  if (taskError || !task) {
    console.error("request-account-deletion: insert failed", taskError);
    return reply(req, { success: false, error: "We couldn't record your request. Please email privacy@lethub.uk." }, 500);
  }

  await admin.from("user_security_events").insert({
    user_id: user.id,
    event_type: "account_deletion_requested",
    description: "Account deletion requested from Settings",
    device: req.headers.get("user-agent")?.slice(0, 200) ?? null,
  });

  const notifyTo = Deno.env.get("PRIVACY_NOTIFY_EMAIL") || Deno.env.get("LEAD_NOTIFY_EMAIL");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");
  if (notifyTo && resendApiKey && fromDomain) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: `LetHub <noreply@${fromDomain}>`,
        to: notifyTo.split(",").map((value) => value.trim()).filter(Boolean),
        subject: "Account deletion request",
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escapeHtml(description)}</div>`,
      });
    } catch (err) {
      console.error("request-account-deletion: notification failed", err);
    }
  }

  return reply(req, { success: true, already_requested: false, requested_at: task.created_at });
});
