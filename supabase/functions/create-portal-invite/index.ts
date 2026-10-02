import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.1.2";

const INVITE_TTL_DAYS = 7;

const ALLOWED_ROLES = new Set([
  "platform_admin",
  "estate_agent_admin",
  "estate_agent_staff",
  "landlord",
]);

const PORTAL_TYPES = new Set(["owner", "tenant"]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("APP_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0
    ? configured
    : ["https://lethub.uk", "https://www.lethub.uk"];
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

function getToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface InviteEmailParams {
  recipientName: string;
  portalLabel: string;
  propertyAddress: string;
  message: string;
  inviteLink: string;
}

function buildInviteEmail(params: InviteEmailParams): string {
  const safeName = escapeHtml(params.recipientName || "there");
  const safeLabel = escapeHtml(params.portalLabel);
  const safeAddress = escapeHtml(params.propertyAddress || "");
  const safeMessage = params.message ? escapeHtml(params.message) : "";
  const safeLink = escapeHtml(params.inviteLink);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="font-family: 'Pacifico', cursive; font-size: 28px; color: #C28A78; margin: 0;">logo</h1>
      </div>
      <h2 style="font-size: 20px; color: #3A3F3A; margin: 0 0 12px 0;">You have been invited to your ${safeLabel} portal</h2>
      <p style="font-size: 14px; color: #687068; line-height: 1.6; margin: 0 0 16px 0;">Hi ${safeName}, your agency has created a secure portal account for you.</p>
      ${safeMessage ? `<div style="background:#FBF9F4;border-radius:10px;padding:16px;margin-bottom:20px;font-size:14px;color:#3A3F3A;line-height:1.6;">${safeMessage}</div>` : ""}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:10px 0;font-size:14px;color:#94A3B8;border-bottom:1px solid #F1F5F9;">Portal</td><td style="padding:10px 0;font-size:14px;color:#3A3F3A;text-align:right;border-bottom:1px solid #F1F5F9;font-weight:500;">${safeLabel}</td></tr>
        ${safeAddress ? `<tr><td style="padding:10px 0;font-size:14px;color:#94A3B8;">Property</td><td style="padding:10px 0;font-size:14px;color:#3A3F3A;text-align:right;font-weight:500;">${safeAddress}</td></tr>` : ""}
      </table>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${safeLink}" style="display:inline-block;padding:12px 28px;background:#C28A78;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Accept Invitation</a>
      </div>
      <p style="font-size:12px;color:#94A3B8;line-height:1.6;margin:0 0 8px 0;">This invitation link expires in ${INVITE_TTL_DAYS} days and can only be used once. If you were not expecting this invitation you can safely ignore this email.</p>
      <p style="font-size:11px;color:#94A3B8;text-align:center;margin:0;">If the button does not work, copy this link into your browser:<br/>${safeLink}</p>
    </div>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return fail(req, 405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  try {
    const token = getToken(req);
    if (!token) return fail(req, 401, "MISSING_AUTH", "A valid session is required.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return fail(req, 500, "CONFIG_ERROR", "Server configuration is incomplete.");
    }

    const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return fail(req, 401, "INVALID_TOKEN", "Your session is invalid or has expired.");
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) return fail(req, 500, "PROFILE_LOOKUP_FAILED", "Unable to resolve your profile.");
    if (!profile) return fail(req, 403, "PROFILE_NOT_FOUND", "No profile is linked to this account.");

    const role = String(profile.role || "");
    if (!ALLOWED_ROLES.has(role)) {
      return fail(req, 403, "ROLE_NOT_ALLOWED", "Your role is not permitted to issue portal invitations.");
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const portalType = String(body.portal_type || "").trim().toLowerCase();
    const propertyId = String(body.property_id || "").trim();
    const message = String(body.message || "").trim().slice(0, 500);
    const requestedEmail = normalizeEmail(body.email);
    const requestedTenantId = String(body.tenant_id || "").trim();

    if (portalType === "contractor") {
      return fail(
        req,
        400,
        "invite_required",
        "Contractor access cannot be issued from here yet. A trusted contractor invitation flow is required first.",
      );
    }
    if (!PORTAL_TYPES.has(portalType)) {
      return fail(req, 400, "INVALID_PORTAL_TYPE", "Invalid portal type.");
    }
    if (!UUID_RE.test(propertyId)) {
      return fail(req, 400, "INVALID_PROPERTY", "A valid property is required.");
    }

    const { data: property, error: propertyError } = await admin
      .from("properties")
      .select("id, line1, city, postcode, landlord_id, managing_agency_id")
      .eq("id", propertyId)
      .maybeSingle();
    if (propertyError) return fail(req, 500, "PROPERTY_LOOKUP_FAILED", "Unable to resolve the property.");
    if (!property) return fail(req, 404, "PROPERTY_NOT_FOUND", "That property could not be found.");

    const { data: landlord } = await admin
      .from("landlords")
      .select("id, display_name, email, owner_profile_id, managing_agency_id")
      .eq("id", property.landlord_id)
      .maybeSingle();

    let inScope = false;
    if (role === "platform_admin") {
      inScope = true;
    } else if (role === "landlord") {
      inScope = !!landlord && landlord.owner_profile_id === user.id;
    } else {
      const { data: memberships } = await admin
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", user.id);
      const agencyIds = new Set((memberships || []).map((m) => String(m.agency_id)));
      const propAgency = property.managing_agency_id ? String(property.managing_agency_id) : null;
      const landAgency = landlord?.managing_agency_id ? String(landlord.managing_agency_id) : null;
      inScope = !!((propAgency && agencyIds.has(propAgency)) || (landAgency && agencyIds.has(landAgency)));
    }
    if (!inScope) {
      return fail(req, 403, "NOT_AUTHORISED", "You cannot issue invitations for that property.");
    }

    const propertyAddress = [property.line1, property.city, property.postcode]
      .filter(Boolean)
      .join(", ");

    let userType: string;
    let finalEmail: string;
    let recipientName: string;
    let portalLabel: string;

    if (portalType === "owner") {
      const trusted = landlord?.email ? normalizeEmail(landlord.email) : "";
      if (trusted && requestedEmail && trusted !== requestedEmail) {
        return fail(req, 403, "email_mismatch", "This landlord's records use a different email address.");
      }
      finalEmail = trusted || requestedEmail;
      if (!finalEmail) {
        return fail(req, 400, "email_required", "This landlord has no email on record. Add an email address first.");
      }
      userType = "owner";
      recipientName = landlord?.display_name || "";
      portalLabel = "Landlord";
    } else {
      const { data: tenancies } = await admin
        .from("tenancies")
        .select("id")
        .eq("property_id", property.id);
      const tenancyIds = (tenancies || []).map((t) => String(t.id));

      let candidateIds: string[] = [];
      if (tenancyIds.length) {
        const { data: parties } = await admin
          .from("tenancy_parties")
          .select("tenant_id")
          .in("tenancy_id", tenancyIds);
        candidateIds = [...new Set((parties || []).map((p) => String(p.tenant_id)))];
      }

      let candidates: Array<{ id: string; full_name: string | null; email: string | null }> = [];
      if (candidateIds.length) {
        const { data: rows } = await admin
          .from("tenants")
          .select("id, full_name, email")
          .in("id", candidateIds);
        candidates = (rows || []) as Array<{ id: string; full_name: string | null; email: string | null }>;
      }

      let tenant: { id: string; full_name: string | null; email: string | null } | null = null;
      if (requestedTenantId && UUID_RE.test(requestedTenantId)) {
        tenant = candidates.find((c) => c.id === requestedTenantId) || null;
        if (!tenant) {
          return fail(req, 403, "INVALID_TENANT", "That tenant is not linked to this property.");
        }
      } else if (requestedEmail) {
        tenant = candidates.find((c) => normalizeEmail(c.email) === requestedEmail) || null;
      } else if (candidates.length === 1) {
        tenant = candidates[0];
      }
      if (!tenant) {
        return fail(req, 404, "TENANT_NOT_FOUND", "No tenant linked to this property matches the invitation.");
      }

      const trusted = tenant.email ? normalizeEmail(tenant.email) : "";
      if (trusted && requestedEmail && trusted !== requestedEmail) {
        return fail(req, 403, "email_mismatch", "This tenant's records use a different email address.");
      }
      finalEmail = trusted || requestedEmail;
      if (!finalEmail) {
        return fail(req, 400, "email_required", "This tenant has no email on record. Add an email address first.");
      }
      userType = "tenant";
      recipientName = tenant.full_name || "";
      portalLabel = "Tenant";
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = new Date(now.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
    const expiresIso = expiresAt.toISOString();

    const rawToken = randomToken();
    const tokenHash = await sha256Hex(rawToken);

    const { data: accessRows } = await admin
      .from("portal_access")
      .select("id, email")
      .eq("property_id", property.id)
      .eq("user_type", userType);
    const existingAccess =
      (accessRows || []).find((r) => normalizeEmail(r.email) === finalEmail) || null;

    let accessId: string;
    if (existingAccess) {
      accessId = String(existingAccess.id);
      const { error: updateError } = await admin
        .from("portal_access")
        .update({
          email: finalEmail,
          status: "pending",
          created_by: profile.id,
          invite_token_hash: tokenHash,
          invite_expires_at: expiresIso,
          last_invite_sent_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", accessId);
      if (updateError) {
        return fail(req, 500, "ACCESS_WRITE_FAILED", "Unable to prepare the portal access record.");
      }
    } else {
      const { data: created, error: insertError } = await admin
        .from("portal_access")
        .insert({
          property_id: property.id,
          user_type: userType,
          email: finalEmail,
          status: "pending",
          created_by: profile.id,
          invite_token_hash: tokenHash,
          invite_expires_at: expiresIso,
          last_invite_sent_at: nowIso,
        })
        .select("id")
        .single();
      if (insertError || !created) {
        return fail(req, 500, "ACCESS_WRITE_FAILED", "Unable to create the portal access record.");
      }
      accessId = String(created.id);
    }

    await admin
      .from("portal_invites")
      .update({ revoked_at: nowIso })
      .eq("portal_access_id", accessId)
      .is("accepted_at", null)
      .is("revoked_at", null);

    const { data: inviteRow, error: inviteError } = await admin
      .from("portal_invites")
      .insert({
        portal_access_id: accessId,
        token_hash: tokenHash,
        expires_at: expiresIso,
        status: "sent",
        sent_at: nowIso,
        attempt_count: 1,
      })
      .select("id")
      .single();
    if (inviteError || !inviteRow) {
      return fail(req, 500, "INVITE_WRITE_FAILED", "Unable to create the invitation.");
    }

    const baseOrigin = allowedOrigins()[0].replace(/\/$/, "");
    const inviteLink = `${baseOrigin}/portal/accept-invite?token=${rawToken}`;

    let emailSent = false;
    let emailError: string | null = null;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");

    if (resendApiKey && fromDomain) {
      try {
        const resend = new Resend(resendApiKey);
        const { error: sendError } = await resend.emails.send({
          from: `LetHub <noreply@${fromDomain}>`,
          to: [finalEmail],
          subject: "You have been invited to your LetHub portal",
          html: buildInviteEmail({
            recipientName,
            portalLabel,
            propertyAddress,
            message,
            inviteLink,
          }),
        });
        if (sendError) {
          emailError = sendError.message;
        } else {
          emailSent = true;
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : "Email delivery failed.";
      }
    } else {
      emailError = "Email service is not configured.";
    }

    try {
      await admin.from("platform_audit_log").insert({
        action: "portal_invite_created",
        actor_profile_id: profile.id,
        target_table: "portal_invites",
        target_id: inviteRow.id,
        details: {
          event: "portal_invite_created",
          actor_id: profile.id,
          actor_role: role,
          portal_type: userType,
          property_id: property.id,
          email: finalEmail,
          email_sent: emailSent,
        },
      });
    } catch {
      // Audit logging must never block invitation creation.
    }

    return reply(req, {
      success: true,
      portal_type: userType,
      email: finalEmail,
      invite_link: inviteLink,
      expires_at: expiresIso,
      email_sent: emailSent,
      email_error: emailError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("create-portal-invite error", message);
    return fail(req, 500, "INTERNAL_ERROR", "We could not create this invitation. Please try again.");
  }
});
