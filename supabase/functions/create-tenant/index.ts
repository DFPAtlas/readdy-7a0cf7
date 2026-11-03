import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ROLES = new Set([
  "platform_admin",
  "estate_agent_admin",
  "estate_agent_staff",
  "landlord",
]);

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

function clean(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
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
      return fail(req, 403, "ROLE_NOT_ALLOWED", "Your role is not permitted to create tenants.");
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const fullName = clean(body.full_name);
    const email = normalizeEmail(body.email);
    const phone = clean(body.phone) || null;
    const emergencyName = clean(body.emergency_contact_name) || null;
    const emergencyPhone = clean(body.emergency_contact_phone) || null;
    const emergencyRelation = clean(body.emergency_contact_relation) || null;
    const notes = String(body.notes ?? "").trim() || null;
    const requestedLandlordId = clean(body.landlord_id);
    const requestedAgencyId = clean(body.agency_id);

    if (!fullName) return fail(req, 400, "INVALID_NAME", "Tenant name is required.");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return fail(req, 400, "INVALID_EMAIL", "A valid email address is required.");
    }

    let landlordId: string | null = null;
    let agencyId: string | null = null;

    if (role === "landlord") {
      const { data: owned, error: ownedError } = await admin
        .from("landlords")
        .select("id, managing_agency_id")
        .eq("owner_profile_id", user.id)
        .order("created_at", { ascending: false });
      if (ownedError) return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve your landlord record.");
      if (!owned || owned.length === 0) {
        return fail(req, 403, "LANDLORD_NOT_FOUND", "No landlord record is linked to your account.");
      }
      let chosen = owned[0];
      if (requestedLandlordId) {
        const match = owned.find((l) => l.id === requestedLandlordId);
        if (!match) return fail(req, 403, "INVALID_LANDLORD", "You cannot create tenants for that landlord.");
        chosen = match;
      }
      landlordId = chosen.id;
      agencyId = chosen.managing_agency_id || null;
    } else if (role === "estate_agent_admin" || role === "estate_agent_staff") {
      const { data: memberships, error: memberError } = await admin
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", user.id);
      if (memberError) return fail(req, 500, "ACCOUNT_LOOKUP_FAILED", "Unable to resolve your agency membership.");
      const agencyIds = (memberships || []).map((m) => String(m.agency_id));
      if (agencyIds.length === 0) {
        return fail(req, 403, "ACCOUNT_NOT_FOUND", "No agency membership was found for your account.");
      }
      if (requestedAgencyId) {
        if (!agencyIds.includes(requestedAgencyId)) {
          return fail(req, 403, "ACCOUNT_FORBIDDEN", "You cannot create tenants for that agency.");
        }
        agencyId = requestedAgencyId;
      } else {
        agencyId = agencyIds[0];
      }
    } else {
      if (requestedLandlordId && UUID_RE.test(requestedLandlordId)) {
        const { data: landlord } = await admin
          .from("landlords")
          .select("id, managing_agency_id")
          .eq("id", requestedLandlordId)
          .maybeSingle();
        if (!landlord) return fail(req, 400, "INVALID_LANDLORD", "The supplied landlord does not exist.");
        landlordId = landlord.id;
        agencyId = landlord.managing_agency_id || null;
      }
      if (!agencyId && requestedAgencyId && UUID_RE.test(requestedAgencyId)) {
        agencyId = requestedAgencyId;
      }
    }

    const insertPayload: Record<string, unknown> = {
      full_name: fullName,
      email,
      phone,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      emergency_contact_relation: emergencyRelation,
      notes,
      created_by_profile_id: user.id,
    };
    if (landlordId) insertPayload.landlord_id = landlordId;
    if (agencyId) insertPayload.managing_agency_id = agencyId;

    const { data: created, error: insertError } = await admin
      .from("tenants")
      .insert(insertPayload)
      .select("id, full_name, email")
      .single();
    if (insertError || !created) {
      return fail(req, 500, "TENANT_CREATE_FAILED", "Unable to create the tenant.");
    }

    try {
      await admin.from("platform_audit_log").insert({
        action: "tenant_created",
        actor_profile_id: profile.id,
        target_table: "tenants",
        target_id: created.id,
        details: {
          event: "tenant_created",
          actor_id: profile.id,
          actor_role: role,
          landlord_id: landlordId,
          agency_id: agencyId,
          tenant_id: created.id,
        },
      });
    } catch {
      // Audit logging must never block tenant creation.
    }

    return reply(req, {
      success: true,
      tenant: { id: created.id, full_name: created.full_name, email: created.email },
    }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("create-tenant error", message);
    return fail(req, 500, "INTERNAL_ERROR", "We could not create this tenant. Please try again.");
  }
});