import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.1.2";

// Emails a rent receipt for a recorded payment to the tenancy's lead tenant.
//
// Security model: requires a signed-in user who can manage the payment's
// tenancy (public.can_manage_tenancy, evaluated as that user). The browser
// only sends the payment id; the amount, date, recipient and property are
// read from the database, and every interpolated value is HTML-escaped.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding: 10px 0; font-size: 14px; color: #94A3B8; border-bottom: 1px solid #F1F5F9;">${label}</td>
    <td style="padding: 10px 0; font-size: 14px; color: #3A3F3A; text-align: right; border-bottom: 1px solid #F1F5F9; font-weight: 500;">${value}</td>
  </tr>`;
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
  const paymentId = String(body.payment_id ?? "").trim();
  if (!UUID_RE.test(paymentId)) return fail(req, 400, "INVALID_PAYMENT", "A valid payment is required.");

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: payment } = await admin
    .from("rent_payments")
    .select("id, tenancy_id, amount, paid_date, due_date, method, status")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment || !payment.tenancy_id) return fail(req, 404, "PAYMENT_NOT_FOUND", "Payment not found.");
  if (payment.status !== "paid") return fail(req, 400, "NOT_PAID", "Receipts can only be sent for paid payments.");

  const { data: canManage, error: permissionError } = await userClient.rpc("can_manage_tenancy", { t_id: payment.tenancy_id });
  if (permissionError || canManage !== true) {
    return fail(req, 403, "FORBIDDEN", "You do not have permission to send this receipt.");
  }

  const { data: tenancy } = await admin.from("tenancies").select("property_id").eq("id", payment.tenancy_id).maybeSingle();
  const [{ data: property }, { data: parties }] = await Promise.all([
    admin.from("properties").select("line1, city, postcode, managing_agency_id").eq("id", tenancy?.property_id ?? "").maybeSingle(),
    admin.from("tenancy_parties").select("is_lead, tenants(full_name, email)").eq("tenancy_id", payment.tenancy_id),
  ]);
  const lead = (parties || []).find((p: any) => p.is_lead) || (parties || [])[0];
  const tenant: any = lead ? (Array.isArray(lead.tenants) ? lead.tenants[0] : lead.tenants) : null;
  if (!tenant?.email) return fail(req, 400, "NO_TENANT_EMAIL", "This tenant has no email address on file.");

  let agencyName = "LetHub";
  if (property?.managing_agency_id) {
    const { data: agency } = await admin.from("agencies").select("name").eq("id", property.managing_agency_id).maybeSingle();
    if (agency?.name) agencyName = agency.name;
  }

  const propertyLabel = [property?.line1, property?.city, property?.postcode].filter(Boolean).join(", ") || "—";
  const amount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(payment.amount) || 0);
  const paidOn = payment.paid_date
    ? new Date(payment.paid_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <p style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #C28A78;">${escapeHtml(agencyName)}</p>
      <div style="background: #FBF9F4; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #94A3B8;">PAYMENT RECEIVED</p>
        <p style="margin: 0; font-size: 28px; font-weight: 700; color: #7A9A7E;">${amount}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${row("Tenant", escapeHtml(tenant.full_name || "—"))}
        ${row("Property", escapeHtml(propertyLabel))}
        ${row("Payment date", escapeHtml(paidOn))}
        ${row("Method", escapeHtml(payment.method || "—"))}
        ${row("Reference", escapeHtml(payment.id.slice(0, 8).toUpperCase()))}
      </table>
      <p style="margin: 0; font-size: 13px; color: #687068; text-align: center;">Thank you for your payment. Please keep this receipt for your records.</p>
      <p style="margin-top: 24px; font-size: 11px; color: #94A3B8; text-align: center;">Sent by ${escapeHtml(agencyName)} using LetHub. Please contact your letting agent directly with any questions.</p>
    </div>`;

  const resend = new Resend(resendApiKey);
  const { data: sent, error: sendError } = await resend.emails.send({
    from: `${agencyName.replace(/[<>"]/g, "")} <noreply@${fromDomain}>`,
    to: [tenant.email],
    subject: `Rent receipt: ${propertyLabel}`,
    html,
  });
  if (sendError) {
    console.error("send-payment-receipt: resend error", sendError);
    return fail(req, 502, "SEND_FAILED", "The receipt could not be sent.");
  }

  return reply(req, { success: true, id: sent?.id ?? null });
});
