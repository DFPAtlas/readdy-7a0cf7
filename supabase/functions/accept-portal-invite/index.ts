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

    const trustedEmail = access.email ? String(access.email).trim().toLowerCase() : "";
    // Every invite is tied to one person's email. Without one, anyone holding
    // the link could claim the portal, so such invites are refused outright.
    if (!trustedEmail) {
      return fail(req, "email_required",
        "This invitation isn't linked to an email address. Please ask your agency to send a new invitation.");
    }

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

    // Someone who already has a LetHub login can accept while signed in.
    let signedInUser: { id: string; email: string } | null = null;
    const authorization = req.headers.get("authorization") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (anonKey && /^bearer\s+\S+$/i.test(authorization)) {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user?.email) signedInUser = { id: user.id, email: user.email.toLowerCase() };
    }

    const acceptingEmail = signedInUser ? signedInUser.email : email;
    if (!acceptingEmail) return fail(req, "missing_fields", "Email and password are required.");
    if (trustedEmail !== acceptingEmail) {
      return fail(req, "email_mismatch", "This invitation was issued to a different email address.");
    }
    if (!signedInUser) {
      if (!password) return fail(req, "missing_fields", "Email and password are required.");
      if (password.length < MIN_PASSWORD_LENGTH) {
        return fail(req, "weak_password", `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
    }

    // Claim the invite before creating anything, so one link can only ever
    // produce one account even if it is submitted twice at the same time.
    const { data: claimed, error: claimError } = await admin
      .from("portal_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id)
      .is("accepted_at", null)
      .select("id");
    if (claimError) throw claimError;
    if (!claimed || claimed.length === 0) {
      return fail(req, "already_used", "This invitation has already been used.");
    }
    const releaseClaim = () =>
      admin.from("portal_invites").update({ accepted_at: null }).eq("id", invite.id);

    let userId: string;
    if (signedInUser) {
      const { data: existingProfile, error: existingProfileError } = await admin
        .from("profiles")
        .select("role")
        .eq("id", signedInUser.id)
        .maybeSingle();
      if (existingProfileError) {
        await releaseClaim();
        throw existingProfileError;
      }
      const currentRole = String(existingProfile?.role || "");
      // Never turn an agency, contractor or admin login into a portal login.
      if (currentRole && currentRole !== role && currentRole !== "client") {
        await releaseClaim();
        return fail(req, "role_conflict",
          "This email is already used for a different kind of LetHub account. Ask your agency to invite a different email.", 409);
      }
      userId = signedInUser.id;
      if (!currentRole || currentRole === "client") {
        const { error: roleError } = await admin
          .from("profiles")
          .update({ role, account_type: role === "landlord" ? "owner" : "tenant" })
          .eq("id", userId);
        if (roleError) {
          await releaseClaim();
          throw roleError;
        }
      }
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: acceptingEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || acceptingEmail },
      });
      if (createError || !created?.user) {
        await releaseClaim();
        const message = createError?.message || "Unable to create the account.";
        if (/already|exists|registered/i.test(message)) {
          return fail(req, "already_registered",
            "An account already exists for this email. Sign in, then open this invitation link again to accept it.");
        }
        return fail(req, "account_failed", message);
      }
      userId = created.user.id;

      const { error: profileError } = await admin
        .from("profiles")
        .upsert({
          id: userId,
          email: acceptingEmail,
          full_name: fullName || acceptingEmail,
          role,
          account_type: role === "landlord" ? "owner" : "tenant",
        }, { onConflict: "id" });
      if (profileError) throw profileError;
    }

    if (role === "landlord") {
      const { data: property, error: propertyError } = await admin
        .from("properties")
        .select("landlord_id")
        .eq("id", access.property_id)
        .maybeSingle();
      if (propertyError) throw propertyError;
      const landlordId = property?.landlord_id;
      if (landlordId) {
        // Add access for this person; never move someone else's existing access.
        const { data: ownGrant, error: grantLookupError } = await admin
          .from("owner_portal_access")
          .select("id")
          .eq("landlord_id", landlordId)
          .eq("profile_id", userId)
          .limit(1)
          .maybeSingle();
        if (grantLookupError) throw grantLookupError;
        const { error: grantError } = ownGrant
          ? await admin.from("owner_portal_access").update({ is_active: true }).eq("id", ownGrant.id)
          : await admin.from("owner_portal_access").insert({ landlord_id: landlordId, profile_id: userId, is_active: true });
        if (grantError) throw grantError;
      }
    } else {
      // Find the tenant through this property's tenancies, not by email across
      // every agency.
      const { data: tenancies, error: tenancyError } = await admin
        .from("tenancies")
        .select("id, tenancy_parties(tenant_id, tenants(id, email))")
        .eq("property_id", access.property_id);
      if (tenancyError) throw tenancyError;
      const tenantIds = new Set<string>();
      for (const tenancy of tenancies || []) {
        for (const party of (tenancy as any).tenancy_parties || []) {
          const tenant = Array.isArray(party.tenants) ? party.tenants[0] : party.tenants;
          if (tenant?.id && String(tenant.email || "").trim().toLowerCase() === acceptingEmail) {
            tenantIds.add(tenant.id);
          }
        }
      }
      for (const tenantId of tenantIds) {
        const { data: ownGrant, error: grantLookupError } = await admin
          .from("tenant_portal_access")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("profile_id", userId)
          .limit(1)
          .maybeSingle();
        if (grantLookupError) throw grantLookupError;
        const { error: grantError } = ownGrant
          ? await admin.from("tenant_portal_access").update({ is_active: true }).eq("id", ownGrant.id)
          : await admin.from("tenant_portal_access").insert({ tenant_id: tenantId, profile_id: userId, is_active: true });
        if (grantError) throw grantError;
      }
      if (tenantIds.size === 0) {
        console.warn("accept-portal-invite: no tenant on this property matches the invited email", access.id);
      }
    }

    const { error: accessUpdateError } = await admin.from("portal_access")
      .update({ status: "active", user_id: userId })
      .eq("id", access.id);
    if (accessUpdateError) throw accessUpdateError;

    return reply(req, { role, portal_type: portalType, profile_ready: true, existing_account: Boolean(signedInUser) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We could not accept this invitation.";
    return fail(req, "server_error", message, 500);
  }
});
