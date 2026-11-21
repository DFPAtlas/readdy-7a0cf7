import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.1.2";

// Agency admins invite, list and revoke team members.
//
// Security model: requires a signed-in caller whose profile role is
// estate_agent_admin (or platform_admin) and who is a member of the agency.
// The agency is always the caller's own (platform admins may pass agency_id).
// Seats = current members + open invites, capped by the plan's
// max_team_members. Tokens are random; only their SHA-256 hash is stored.

const INVITE_DAYS = 7;
const ACTIVE_STATUSES = ["active", "trialing"];

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

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Exact, case-insensitive match for ilike (escape its wildcards).
const likeExact = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

// Shared limiter (migration 020). Fails open: if the check itself errors we
// let the request through rather than lock real users out.
async function underRateLimit(
  admin: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error.message);
    return true;
  }
  return data !== false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return fail(req, "method_not_allowed", "Use POST.", 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return fail(req, "not_configured", "Server is not configured.", 500);

  const authorization = req.headers.get("authorization") || "";
  if (!/^bearer\s+\S+$/i.test(authorization)) return fail(req, "unauthorised", "Please sign in.", 401);
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return fail(req, "unauthorised", "Please sign in.", 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "list");

    const { data: profile } = await admin.from("profiles").select("role, full_name, email").eq("id", user.id).maybeSingle();
    const callerRole = String(profile?.role || "");
    const isPlatformAdmin = callerRole === "platform_admin";
    if (!isPlatformAdmin && callerRole !== "estate_agent_admin") {
      return fail(req, "forbidden", "Only agency administrators can manage the team.", 403);
    }

    const { data: memberships } = await admin.from("agency_members").select("agency_id").eq("profile_id", user.id);
    const myAgencyIds = (memberships || []).map((m: { agency_id: string }) => m.agency_id);
    const requestedAgency = typeof body.agency_id === "string" ? body.agency_id : null;
    const agencyId = isPlatformAdmin && requestedAgency ? requestedAgency : myAgencyIds[0];
    if (!agencyId) return fail(req, "no_agency", "Your account isn't linked to an agency yet.", 400);
    if (!isPlatformAdmin && !myAgencyIds.includes(agencyId)) return fail(req, "forbidden", "Not your agency.", 403);

    const nowIso = new Date().toISOString();

    const openInvites = async () => {
      const { data, error } = await admin
        .from("agency_invites")
        .select("id, email, full_name, role, created_at, expires_at")
        .eq("agency_id", agencyId)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    };

    const seatInfo = async () => {
      const { data: members } = await admin.from("agency_members").select("profile_id").eq("agency_id", agencyId);
      const memberIds = (members || []).map((m: { profile_id: string }) => m.profile_id);
      let limit: number | null = 0;
      if (memberIds.length > 0) {
        const { data: subs } = await admin
          .from("account_subscriptions")
          .select("plan_slug, status, created_at")
          .in("user_id", memberIds)
          .in("status", ACTIVE_STATUSES)
          .order("created_at", { ascending: false })
          .limit(1);
        const slug = subs?.[0]?.plan_slug;
        if (slug) {
          const { data: plan } = await admin.from("subscription_plans").select("max_team_members, is_enterprise").eq("slug", slug).maybeSingle();
          limit = plan?.is_enterprise || plan?.max_team_members == null ? null : Number(plan.max_team_members);
        }
      }
      return { members: memberIds.length, limit };
    };

    if (action === "list") {
      const [invites, seats] = await Promise.all([openInvites(), seatInfo()]);
      return reply(req, { success: true, invites, seats: { ...seats, pending: invites.length } });
    }

    if (action === "revoke") {
      const inviteId = String(body.invite_id || "");
      const { data: revoked, error } = await admin
        .from("agency_invites")
        .update({ revoked_at: nowIso })
        .eq("id", inviteId)
        .eq("agency_id", agencyId)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .select("id");
      if (error) throw error;
      if (!revoked?.length) return fail(req, "not_found", "That invite isn't open any more.", 404);
      return reply(req, { success: true });
    }

    if (action !== "create") return fail(req, "bad_action", "Unknown action.");

    // Each invite sends an email, so cap how many one account can send.
    if (!(await underRateLimit(admin, `agency-invite-send:user:${user.id}`, 30, 3600))) {
      return fail(req, "rate_limited", "You've sent a lot of invitations in the last hour. Please wait a little and try again.", 429);
    }

    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.full_name || "").trim().slice(0, 160) || null;
    const role = body.role === "estate_agent_admin" ? "estate_agent_admin" : "estate_agent_staff";
    if (!EMAIL_RE.test(email) || email.length > 254) return fail(req, "bad_email", "Enter a valid email address.");

    // Already in this agency?
    const { data: existingProfile } = await admin.from("profiles").select("id").ilike("email", likeExact(email)).maybeSingle();
    if (existingProfile?.id) {
      const { data: already } = await admin
        .from("agency_members")
        .select("profile_id")
        .eq("agency_id", agencyId)
        .eq("profile_id", existingProfile.id)
        .maybeSingle();
      if (already) return fail(req, "already_member", "That person is already in your team.");
    }

    const [invites, seats] = await Promise.all([openInvites(), seatInfo()]);
    if (!isPlatformAdmin) {
      if (seats.limit === 0) {
        return fail(req, "no_plan", "Your agency needs an active plan before you can invite team members.", 402);
      }
      if (seats.limit !== null && seats.members + invites.length >= seats.limit) {
        return fail(req, "seat_limit",
          `Your plan includes ${seats.limit} team member${seats.limit === 1 ? "" : "s"}, and they're all taken or invited. Upgrade your plan or revoke an invite.`, 402);
      }
    }

    // Replace any expired open invite for the same email so the unique index allows a new one.
    await admin
      .from("agency_invites")
      .update({ revoked_at: nowIso })
      .eq("agency_id", agencyId)
      .ilike("email", likeExact(email))
      .is("accepted_at", null)
      .is("revoked_at", null)
      .lte("expires_at", nowIso);

    const token = randomToken();
    const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: invite, error: insertError } = await admin
      .from("agency_invites")
      .insert({
        agency_id: agencyId,
        email,
        full_name: fullName,
        role,
        token_hash: await sha256Hex(token),
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select("id, email, full_name, role, created_at, expires_at")
      .single();
    if (insertError) {
      if (insertError.code === "23505") return fail(req, "already_invited", "That person already has an open invite.");
      throw insertError;
    }

    const { data: agency } = await admin.from("agencies").select("name").eq("id", agencyId).maybeSingle();
    const appUrl = (Deno.env.get("APP_URL") || "https://lethub.uk").replace(/\/$/, "");
    const link = `${appUrl}/join?token=${encodeURIComponent(token)}`;

    let emailed = false;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN");
    if (resendApiKey && fromDomain) {
      try {
        const resend = new Resend(resendApiKey);
        const agencyName = agency?.name || "your agency";
        const inviter = profile?.full_name || profile?.email || "A colleague";
        const { error: sendError } = await resend.emails.send({
          from: `LetHub <noreply@${fromDomain}>`,
          to: [email],
          subject: `${agencyName} has invited you to LetHub`,
          html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#3A3F3A;line-height:1.5">
<p>Hello${fullName ? ` ${escapeHtml(fullName)}` : ""},</p>
<p>${escapeHtml(inviter)} has invited you to join <strong>${escapeHtml(agencyName)}</strong> on LetHub as ${role === "estate_agent_admin" ? "an administrator" : "a team member"}.</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;background:#C28A78;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Accept invitation</a></p>
<p style="font-size:13px;color:#687068">This link works once and expires in ${INVITE_DAYS} days. If you weren't expecting it, you can ignore this email.</p>
</div>`,
        });
        emailed = !sendError;
        if (sendError) console.error("manage-agency-invites: email failed", sendError);
      } catch (err) {
        console.error("manage-agency-invites: email failed", err);
      }
    }

    // The link is returned only if the email couldn't be sent, so the admin can pass it on.
    return reply(req, { success: true, invite, emailed, ...(emailed ? {} : { invite_link: link }) });
  } catch (err) {
    console.error("manage-agency-invites error", err);
    return fail(req, "server_error", "Something went wrong. Please try again.", 500);
  }
});
