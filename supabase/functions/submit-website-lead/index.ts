import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.1.2";

// Public endpoint for the marketing site's contact and demo-request forms.
// Stores the submission in public.website_leads (service role) and, when
// LEAD_NOTIFY_EMAIL is set, emails a notification via Resend.
//
// Abuse controls: origin allowlist, field length limits, a honeypot field and
// a per-email limit of 5 submissions per hour.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_EMAIL_PER_HOUR = 5;

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

function text(value: unknown, max: number): string | null {
  const cleaned = String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  return cleaned ? cleaned.slice(0, max) : null;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return reply(req, { success: false, error: "Use POST." }, 405);

  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins().includes(origin)) {
    return reply(req, { success: false, error: "Origin not allowed." }, 403);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return reply(req, { success: false, error: "Server is not configured." }, 500);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return reply(req, { success: false, error: "Invalid request." }, 400);
  }

  // Honeypot: bots fill hidden fields. Pretend success so they move on.
  if (text(body.website, 200)) return reply(req, { success: true });

  const formType = body.form_type === "demo" ? "demo" : body.form_type === "contact" ? "contact" : null;
  const fullName = text(body.full_name, 200);
  const email = text(body.email, 320)?.toLowerCase() ?? null;
  if (!formType) return reply(req, { success: false, error: "Unknown form." }, 400);
  if (!fullName) return reply(req, { success: false, error: "Please enter your name." }, 400);
  if (!email || !EMAIL_RE.test(email)) return reply(req, { success: false, error: "Please enter a valid email address." }, 400);

  const lead = {
    form_type: formType,
    full_name: fullName,
    email,
    phone: text(body.phone, 50),
    company: text(body.company, 200),
    reason: text(body.reason, 200),
    properties_count: text(body.properties_count, 50),
    message: text(body.message, 5000),
    source_page: text(body.source_page, 300),
  };

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await admin
    .from("website_leads")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_EMAIL_PER_HOUR) {
    return reply(req, { success: false, error: "We've already received your message. We'll be in touch soon." }, 429);
  }

  const { data: inserted, error: insertError } = await admin.from("website_leads").insert(lead).select("id").single();
  if (insertError) {
    console.error("submit-website-lead: insert failed", insertError);
    return reply(req, { success: false, error: "Something went wrong. Please try again or email support@lethub.uk." }, 500);
  }

  const notifyTo = Deno.env.get("LEAD_NOTIFY_EMAIL");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");
  if (notifyTo && resendApiKey && fromDomain) {
    const rows = Object.entries(lead)
      .filter(([, value]) => value)
      .map(([key, value]) => `<tr><td style="padding:6px 12px 6px 0;color:#687068;vertical-align:top">${escapeHtml(key)}</td><td style="padding:6px 0;color:#3A3F3A;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`)
      .join("");
    try {
      const resend = new Resend(resendApiKey);
      const { error } = await resend.emails.send({
        from: `LetHub website <noreply@${fromDomain}>`,
        to: notifyTo.split(",").map((value) => value.trim()).filter(Boolean),
        subject: `New ${formType === "demo" ? "demo request" : "contact form"}: ${fullName}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:14px"><table>${rows}</table></div>`,
      });
      if (!error) await admin.from("website_leads").update({ notified_at: new Date().toISOString() }).eq("id", inserted.id);
    } catch (err) {
      console.error("submit-website-lead: notification failed", err);
    }
  }

  return reply(req, { success: true });
});
