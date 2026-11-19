import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Accepts an agency team invitation from /join.
//
// mode "verify": checks the token and returns the agency name, role and the
//   invited email.
// mode "accept":
//   - new person: creates the account with the invited email and a password.
//   - existing account: the caller must be signed in as the invited email.
//     Only agency-staff, agency-admin or placeholder accounts can join, and
//     only if they don't already belong to another agency, so a tenant or
//     landlord login is never turned into an agency login by an invite.

const MIN_PASSWORD_LENGTH = 8;
const JOINABLE_ROLES = new Set(["", "client", "estate_agent_staff", "estate_agent_admin"]);

function allowedOrigins(): string[] {
  const configured = (Deno.env.get("APP_ORIGINS") || "").split(",").map((v) => v.trim()).filter(Boolean);
  return configured.length > 0 ? configured : ["https://lethub.uk", "https://www.lethub.uk"];
}

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const origins = allowedOrigins();
  return {
    "Access-Control-Allow-Origin": origin && origins.includes(origin) ? origin : origins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

const reply = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors(req) });
const fail = (req: Request, code: string, error: string, status = 400) => reply(req, { success: false, code, error }, status);

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const likeExact = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);
const memberRoleFor = (role: string) => (role === "estate_agent_admin" ? "admin" : "agent");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "method_not_allowed", "Use POST.", 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return fail(req, "not_configured", "Server is not configured.", 500);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "verify");
    const token = String(body.token || "").trim();
    if (token.length < 20 || token.length > 200) return fail(req, "not_found", "This invitation link isn't valid.", 404);

    const { data: invite, error: inviteError } = await admin
      .from("agency_invites")
      .select("id, agency_id, email, full_name, role, expires_at, accepted_at, revoked_at")
      .eq("token_hash", await sha256Hex(token))
      .maybeSingle();
    if (inviteError) throw inviteError;
    if (!invite) return fail(req, "not_found", "This invitation link isn't valid.", 404);
    if (invite.revoked_at) return fail(req, "revoked", "This invitation has been cancelled. Ask your agency to send a new one.");
    if (invite.accepted_at) return fail(req, "already_used", "This invitation has already been used. Sign in instead.");
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return fail(req, "expired", "This invitation has expired. Ask your agency to send a new one.");
    }

    const invitedEmail = String(invite.email).toLowerCase();
    const { data: agency } = await admin.from("agencies").select("name").eq("id", invite.agency_id).maybeSingle();
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role")
      .ilike("email", likeExact(invitedEmail))
      .maybeSingle();

    if (mode === "verify") {
      return reply(req, {
        success: true,
        agency_name: agency?.name || "your agency",
        email: invitedEmail,
        full_name: invite.full_name,
        role: invite.role,
        account_exists: Boolean(existingProfile),
      });
    }
    if (mode !== "accept") return fail(req, "bad_mode", "Unknown request.");

    let userId: string;
    let existingRoleUpdate: string | null = null;

    if (existingProfile) {
      // Existing account: must be signed in as the invited email.
      const authorization = req.headers.get("authorization") || "";
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return fail(req, "sign_in_required", "You already have a LetHub account. Sign in to accept this invitation.", 401);
      if (String(user.email || "").toLowerCase() !== invitedEmail || user.id !== existingProfile.id) {
        return fail(req, "email_mismatch", `This invitation is for ${invitedEmail}. Sign in with that email to accept it.`, 403);
      }
      const currentRole = String(existingProfile.role || "");
      if (!JOINABLE_ROLES.has(currentRole)) {
        return fail(req, "role_conflict",
          "This email is already used for a different kind of LetHub account. Ask your agency to invite a different email, or contact support@lethub.uk.", 409);
      }
      const { data: otherAgencies } = await admin.from("agency_members").select("agency_id").eq("profile_id", user.id);
      if ((otherAgencies || []).some((m: { agency_id: string }) => m.agency_id !== invite.agency_id)) {
        return fail(req, "other_agency", "This account already belongs to another agency. Contact support@lethub.uk to move it.", 409);
      }
      userId = user.id;
      // Keep an existing admin role; otherwise apply the invited role (after the invite is claimed).
      existingRoleUpdate = currentRole === "estate_agent_admin" ? currentRole : invite.role;
    } else {
      const password = String(body.password || "");
      const fullName = String(body.full_name || invite.full_name || "").trim().slice(0, 160);
      if (!fullName) return fail(req, "missing_name", "Please enter your name.");
      if (password.length < MIN_PASSWORD_LENGTH) {
        return fail(req, "weak_password", `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      }
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: invitedEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createError || !created?.user) {
        const message = createError?.message || "We couldn't create your account.";
        if (/already|exists|registered/i.test(message)) {
          return fail(req, "sign_in_required", "You already have a LetHub account. Sign in to accept this invitation.", 409);
        }
        if (/password/i.test(message)) return fail(req, "weak_password", message);
        return fail(req, "account_failed", "We couldn't create your account. Please try again.", 500);
      }
      userId = created.user.id;
      const { error: profileError } = await admin.from("profiles").upsert(
        { id: userId, email: invitedEmail, full_name: fullName, role: invite.role, account_type: "agency" },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;
    }

    // Claim the invite first so it can only be used once.
    const { data: claimed, error: claimError } = await admin
      .from("agency_invites")
      .update({ accepted_at: new Date().toISOString(), accepted_by: userId })
      .eq("id", invite.id)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .select("id");
    if (claimError) throw claimError;
    if (!claimed?.length) return fail(req, "already_used", "This invitation has already been used. Sign in instead.");

    if (existingRoleUpdate) {
      const { error: roleError } = await admin
        .from("profiles")
        .update({ role: existingRoleUpdate, account_type: "agency" })
        .eq("id", userId);
      if (roleError) throw roleError;
    }

    const { data: existingMembership } = await admin
      .from("agency_members")
      .select("profile_id")
      .eq("agency_id", invite.agency_id)
      .eq("profile_id", userId)
      .maybeSingle();
    if (!existingMembership) {
      const { error: memberError } = await admin
        .from("agency_members")
        .insert({ agency_id: invite.agency_id, profile_id: userId, role: memberRoleFor(invite.role) });
      if (memberError) throw memberError;
    }

    return reply(req, { success: true, email: invitedEmail, agency_name: agency?.name || null });
  } catch (err) {
    console.error("accept-agency-invite error", err);
    return fail(req, "server_error", "Something went wrong. Please try again.", 500);
  }
});
