import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.1.2";

// Sends an arrears reminder to the lead tenant of a tenancy.
//
// Security model:
//   * requires a signed-in user (JWT) who can manage the tenancy
//     (public.can_manage_tenancy, evaluated as that user);
//   * the recipient, amounts and property are looked up server-side; the
//     browser only supplies the tenancy, the arrears case and a message;
//   * the agent's message is HTML-escaped;
//   * one reminder per tenancy per 24 hours.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_HOURS_BETWEEN_REMINDERS = 24;
const MAX_MESSAGE_LENGTH = 2000;

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

function fail(req: Request, status: number, code: string, error: string) {
  return reply(req, { success: false, code, error }, status);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount || 0);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return fail(req, 405, "METHOD_NOT_ALLOWED", "Use POST.");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");
  if (!supabaseUrl || !anonKey || !serviceKey) return fail(req, 500, "NOT_CONFIGURED", "Server is not configured.");
  if (!resendApiKey || !fromDomain) return fail(req, 500, "EMAIL_NOT_CONFIGURED", "Email sending is not configured.");

  const authorization = req.headers.get("authorization") || "";
  if (!/^bearer\s+\S+$/i.test(authorization)) return fail(req, 401, "UNAUTHENTICATED", "Please sign in.");

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return fail(req, 401, "UNAUTHENTICATED", "Please sign in.");

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const tenancyId = String(body.tenancy_id ?? "").trim();
  const caseId = body.arrears_case_id ? String(body.arrears_case_id).trim() : null;
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!UUID_RE.test(tenancyId)) return fail(req, 400, "INVALID_TENANCY", "A valid tenancy is required.");
  if (caseId && !UUID_RE.test(caseId)) return fail(req, 400, "INVALID_CASE", "Invalid arrears case.");

  const { data: canManage, error: permissionError } = await userClient.rpc("can_manage_tenancy", { t_id: tenancyId });
  if (permissionError || canManage !== true) {
    return fail(req, 403, "FORBIDDEN", "You do not have permission to contact this tenant.");
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: tenancy } = await admin
    .from("tenancies")
    .select("id, property_id, rent_amount")
    .eq("id", tenancyId)
    .maybeSingle();
  if (!tenancy) return fail(req, 404, "TENANCY_NOT_FOUND", "Tenancy not found.");

  const [{ data: property }, { data: parties }, { data: overdue }] = await Promise.all([
    admin.from("properties").select("line1, city, postcode, managing_agency_id").eq("id", tenancy.property_id).maybeSingle(),
    admin.from("tenancy_parties").select("is_lead, tenants(full_name, email)").eq("tenancy_id", tenancyId),
    admin.from("rent_payments").select("amount").eq("tenancy_id", tenancyId).eq("status", "overdue"),
  ]);

  const lead = (parties || []).find((p: any) => p.is_lead) || (parties || [])[0];
  const tenant: any = lead ? (Array.isArray(lead.tenants) ? lead.tenants[0] : lead.tenants) : null;
  if (!tenant?.email) return fail(req, 400, "NO_TENANT_EMAIL", "This tenant has no email address on file.");

  let arrearsCase: { id: string; total_owed: number | null; last_reminder_sent: string | null } | null = null;
  if (caseId) {
    const { data } = await admin
      .from("arrears_cases")
      .select("id, tenancy_id, total_owed, last_reminder_sent")
      .eq("id", caseId)
      .maybeSingle();
    if (!data || data.tenancy_id !== tenancyId) return fail(req, 400, "INVALID_CASE", "Arrears case does not match this tenancy.");
    arrearsCase = data;
  }

  if (arrearsCase?.last_reminder_sent) {
    const hoursSince = (Date.now() - new Date(arrearsCase.last_reminder_sent).getTime()) / 3_600_000;
    if (hoursSince < MIN_HOURS_BETWEEN_REMINDERS) {
      return fail(req, 429, "TOO_SOON", "A reminder was already sent to this tenant in the last 24 hours.");
    }
  }

  const overdueTotal = (overdue || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  const amountOwed = Number(arrearsCase?.total_owed) || overdueTotal;
  if (amountOwed <= 0) return fail(req, 400, "NO_ARREARS", "No outstanding rent is recorded for this tenancy.");

  let agencyName = "LetHub";
  if (property?.managing_agency_id) {
    const { data: agency } = await admin.from("agencies").select("name").eq("id", property.managing_agency_id).maybeSingle();
    if (agency?.name) agencyName = agency.name;
  }

  const propertyLabel = [property?.line1, property?.city, property?.postcode].filter(Boolean).join(", ") || "your home";
  const portalUrl = `${allowedOrigins()[0]}/tenant/login`;
  const messageHtml = message
    ? escapeHtml(message).replace(/\r?\n/g, "<br>")
    : "Our records show that rent on your tenancy is overdue. Please arrange payment as soon as you can, or contact us if you would like to discuss it.";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <p style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #C28A78;">${escapeHtml(agencyName)}</p>
      <div style="background: #FEF3C7; border-radius: 10px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #F59E0B;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #92400E;">OUTSTANDING RENT</p>
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #92400E;">${gbp(amountOwed)}</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #B45309;">${escapeHtml(propertyLabel)}</p>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #3A3F3A;">Dear ${escapeHtml(tenant.full_name || "tenant")},</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #3A3F3A; line-height: 1.6;">${messageHtml}</p>
      <p style="margin: 0 0 24px 0; font-size: 13px; color: #687068; line-height: 1.6;">If you have already paid, please ignore this message. If you are having difficulty paying, please get in touch so we can discuss your options. Free, confidential debt advice is available from organisations such as Citizens Advice and Shelter.</p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${escapeHtml(portalUrl)}" style="display: inline-block; padding: 12px 28px; background: #C28A78; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View your tenancy</a>
      </div>
      <p style="margin: 0; font-size: 11px; color: #94A3B8; text-align: center;">Sent by ${escapeHtml(agencyName)} using LetHub. Please contact your letting agent directly with any questions.</p>
    </div>`;

  const resend = new Resend(resendApiKey);
  const { data: sent, error: sendError } = await resend.emails.send({
    from: `${agencyName.replace(/[<>"]/g, "")} <noreply@${fromDomain}>`,
    to: [tenant.email],
    subject: `Rent reminder: ${propertyLabel}`,
    html,
  });
  if (sendError) {
    console.error("send-rent-reminder: resend error", sendError);
    return fail(req, 502, "SEND_FAILED", "The email could not be sent. Please try again.");
  }

  if (arrearsCase) {
    const now = new Date().toISOString();
    await admin.from("arrears_cases").update({ last_reminder_sent: now, last_contact: now }).eq("id", arrearsCase.id);
  }

  return reply(req, { success: true, id: sent?.id ?? null });
});
