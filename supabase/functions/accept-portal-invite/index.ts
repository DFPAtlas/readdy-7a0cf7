import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MIN_PASSWORD_LENGTH = 8;

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("APP_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0
    ? configured
    : ["https://lethub.uk", "https://www.lethub.uk"];
}

function cors(req: Request): Record<string, string> {
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

function reply(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors(req) });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fail(req: Request, code: string, error: string, status = 400) {
  return reply(req, { error, code }, status);
}

async function readBody(req: Request): Promise<any> {
  let parsed: any = {};
  try {
    parsed = await req.json();
  } catch {
    parsed = {};
  }
  return parsed;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "method_not_allowed", "Method not allowed", 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!serviceKey) throw new Error("Service role key is not configured");
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const body = await readBody(req);
    const mode = String(body.mode || "verify");
    const token = String(body.token || "").trim();

    if (token.length < 16) {
      return fail(req, "not_found", "This invite code is not valid.");
    }

    const tokenHash = await sha256Hex(token);

    const { data: invite, error: inviteError } = await admin
      .from("portal_invites")
      .select("id, portal_access_id, expires_at, status, accepted_at, revoked_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();
    if (inviteError) throw inviteError;
    if (!invite) return fail(req, "not_found", "This invite code is not valid.");
    if (invite.revoked_at || invite.status === "revoked") {
      return fail(req, "revoked", "This invitation has been revoked.");
    }
    if (invite.accepted_at || invite.status === "accepted") {
      return fail(req, "already_used", "This invitation has already been used.");
    }
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return fail(req, "expired", "This invitation has expired.");
    }

    const { data: access, error: accessError } = await admin
      .from("portal_access")
      .select("id, property_id, user_type, email, status")
      .eq("id", invite.portal_access_id)
      .maybeSingle();
    if (accessError) throw accessError;
    if (!access) return fail(req, "not_found", "This invitation is no longer linked to a portal.");

    const portalType = String(access.user_type || "").toLowerCase();
    const role = portalType === "owner"
      ? "landlord"
      : portalType === "tenant"
        ? "tenant"
        : null;

    if (!role) {
      return fail(req, "invite_required",
        "Contractor access needs a trusted invitation that is not available yet. Please contact your agency.");
    }

    const trustedEmail = access.email ? String(access.email).trim().toLowerCase() : null;

    if (mode === "verify") {
      return reply(req, {
        verified: true,
        portal_type: portalType,
        email_hint: access.email || null,
      });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const fullName = String(body.full_name || "").trim().slice(0, 160);

    if (!email || !password) {
      return fail(req, "missing_fields", "Email and password are required.");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return fail(req, "weak_password", `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if (trustedEmail && trustedEmail !== email) {
      return fail(req, "email_mismatch", "This invitation was issued to a different email address.");
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || email },
    });
    if (createError || !created?.user) {
      const message = createError?.message || "Unable to create the account.";
      if (/already|exists|registered/i.test(message)) {
        return fail(req, "already_registered",
          "An account already exists for this email. Please sign in instead.");
      }
      return fail(req, "account_failed", message);
    }

    const userId = created.user.id;

    const accountType = role === "landlord" ? "owner" : "tenant";
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        email,
        full_name: fullName || email,
        role,
        account_type: accountType,
      }, { onConflict: "id" });
    if (profileError) throw profileError;

    if (role === "landlord") {
      const { data: property } = await admin
        .from("properties")
        .select("landlord_id")
        .eq("id", access.property_id)
        .maybeSingle();
      const landlordId = property?.landlord_id;
      if (landlordId) {
        const { data: existingGrant } = await admin
          .from("owner_portal_access")
          .select("id")
          .eq("landlord_id", landlordId)
          .maybeSingle();
        if (existingGrant) {
          await admin.from("owner_portal_access")
            .update({ profile_id: userId, is_active: true })
            .eq("id", existingGrant.id);
        } else {
          await admin.from("owner_portal_access")
            .insert({ landlord_id: landlordId, profile_id: userId, is_active: true });
        }
      }
    } else {
      const { data: tenant } = await admin
        .from("tenants")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      if (tenant?.id) {
        const { data: existingGrant } = await admin
          .from("tenant_portal_access")
          .select("id")
          .eq("tenant_id", tenant.id)
          .maybeSingle();
        if (existingGrant) {
          await admin.from("tenant_portal_access")
            .update({ profile_id: userId, is_active: true })
            .eq("id", existingGrant.id);
        } else {
          await admin.from("tenant_portal_access")
            .insert({ tenant_id: tenant.id, profile_id: userId, is_active: true });
        }
      }
    }

    const { data: marked, error: markError } = await admin
      .from("portal_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id)
      .is("accepted_at", null)
      .select("id");
    if (markError) throw markError;
    if (!marked || marked.length === 0) {
      return fail(req, "already_used", "This invitation has already been used.");
    }

    await admin.from("portal_access")
      .update({ status: "active", user_id: userId })
      .eq("id", access.id);

    return reply(req, { role, portal_type: portalType, profile_ready: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not accept this invitation.";
    return fail(req, "server_error", message, 500);
  }
});
