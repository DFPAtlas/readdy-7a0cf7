import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ROLES = new Set([
  "platform_admin",
  "estate_agent_admin",
  "estate_agent_staff",
  "landlord",
]);

const REGIMES = new Set([
  "ast_legacy",
  "assured_periodic_rra",
  "occupation_contract_wales",
  "prt_scotland",
  "ni_private_tenancy",
]);

const TERM_TYPES = new Set(["periodic", "fixed_term"]);
const STATUSES = new Set(["draft", "active"]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
  return String(value ?? "").trim();
}

function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
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
      return fail(req, 403, "ROLE_NOT_ALLOWED", "Your role is not permitted to create tenancies.");
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const propertyId = clean(body.property_id);
    const tenantId = clean(body.tenant_id);
    const startDate = clean(body.start_date);
    const rawEndDate = clean(body.end_date);
    const rentAmount = toAmount(body.rent_amount);
    const depositAmount = toAmount(body.deposit_amount);
    const depositScheme = clean(body.deposit_scheme) || null;
    const termType = clean(body.term_type) || "fixed_term";
    const regime = clean(body.regime) || "ast_legacy";
    const status = clean(body.status) || "draft";

    if (!UUID_RE.test(propertyId)) return fail(req, 400, "MISSING_PROPERTY", "A valid property is required.");
    if (!UUID_RE.test(tenantId)) return fail(req, 400, "MISSING_TENANT", "A valid tenant is required.");
    if (!DATE_RE.test(startDate)) return fail(req, 400, "MISSING_START_DATE", "A valid start date is required.");
    if (rentAmount === null || rentAmount <= 0) {
      return fail(req, 400, "INVALID_RENT", "Enter a valid monthly rent greater than zero.");
    }
    if (depositAmount === null || depositAmount < 0) {
      return fail(req, 400, "INVALID_DEPOSIT", "Enter a valid deposit amount.");
    }
    if (!TERM_TYPES.has(termType)) return fail(req, 400, "INVALID_TERM_TYPE", "Invalid tenancy term type.");
    if (!REGIMES.has(regime)) return fail(req, 400, "INVALID_REGIME", "Invalid tenancy regime.");
    if (!STATUSES.has(status)) return fail(req, 400, "INVALID_STATUS", "Invalid tenancy status.");

    const isPeriodic = termType === "periodic";
    let endDate: string | null = null;
    if (!isPeriodic && rawEndDate) {
      if (!DATE_RE.test(rawEndDate)) return fail(req, 400, "INVALID_END_DATE", "Invalid end date.");
      if (rawEndDate < startDate) return fail(req, 400, "INVALID_END_DATE", "End date cannot be before the start date.");
      endDate = rawEndDate;
    }
    if (regime === "assured_periodic_rra" && !isPeriodic) {
      return fail(req, 400, "INVALID_REGIME", "A Renters' Rights Act periodic tenancy must be periodic.");
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
      .select("id, owner_profile_id, managing_agency_id")
      .eq("id", property.landlord_id)
      .maybeSingle();

    let agencyIds: string[] = [];
    if (role === "estate_agent_admin" || role === "estate_agent_staff") {
      const { data: memberships, error: memberError } = await admin
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", user.id);
      if (memberError) return fail(req, 500, "ACCOUNT_LOOKUP_FAILED", "Unable to resolve your agency membership.");
      agencyIds = (memberships || []).map((m) => String(m.agency_id));
    }

    let propertyInScope = false;
    if (role === "platform_admin") {
      propertyInScope = true;
    } else if (role === "landlord") {
      propertyInScope = !!landlord && landlord.owner_profile_id === user.id;
    } else {
      const propAgency = property.managing_agency_id ? String(property.managing_agency_id) : null;
      const landAgency = landlord?.managing_agency_id ? String(landlord.managing_agency_id) : null;
      propertyInScope = !!(
        (propAgency && agencyIds.includes(propAgency)) ||
        (landAgency && agencyIds.includes(landAgency))
      );
    }
    if (!propertyInScope) {
      return fail(req, 403, "NOT_AUTHORISED", "You cannot create a tenancy for that property.");
    }

    const { data: tenant, error: tenantError } = await admin
      .from("tenants")
      .select("id, full_name, email, landlord_id, managing_agency_id, created_by_profile_id")
      .eq("id", tenantId)
      .maybeSingle();
    if (tenantError) return fail(req, 500, "TENANT_LOOKUP_FAILED", "Unable to resolve the tenant.");
    if (!tenant) return fail(req, 400, "INVALID_TENANT", "That tenant could not be found.");

    let tenantInScope = role === "platform_admin";
    if (!tenantInScope) {
      if (tenant.created_by_profile_id && tenant.created_by_profile_id === user.id) tenantInScope = true;
      if (!tenantInScope && tenant.landlord_id && tenant.landlord_id === property.landlord_id) tenantInScope = true;
      if (!tenantInScope) {
        const tenantAgency = tenant.managing_agency_id ? String(tenant.managing_agency_id) : null;
        if (role === "landlord") {
          tenantInScope = !!landlord && landlord.owner_profile_id === user.id && (!tenantAgency || tenantAgency === (landlord.managing_agency_id || null));
        } else if (tenantAgency && agencyIds.includes(tenantAgency)) {
          tenantInScope = true;
        }
      }
    }
    if (!tenantInScope) {
      return fail(req, 403, "INVALID_TENANT", "That tenant is not within your permitted scope.");
    }

    if (status === "active") {
      const { data: existingActive, error: duplicateError } = await admin
        .from("tenancies")
        .select("id")
        .eq("property_id", propertyId)
        .eq("status", "active")
        .limit(1);
      if (duplicateError) return fail(req, 500, "DUPLICATE_CHECK_FAILED", "Unable to check existing tenancies.");
      if (existingActive && existingActive.length > 0) {
        return fail(req, 409, "duplicate_active_tenancy", "This property already has an active tenancy.");
      }
    }

    const { data: created, error: insertError } = await admin
      .from("tenancies")
      .insert({
        property_id: propertyId,
        regime,
        term_type: termType,
        status,
        start_date: startDate,
        end_date: endDate,
        rent_amount: rentAmount,
        rent_period: "monthly",
        deposit_amount: depositAmount,
        deposit_scheme: depositScheme,
        is_periodic: isPeriodic,
      })
      .select("id")
      .single();
    if (insertError || !created) {
      return fail(req, 500, "TENANCY_CREATE_FAILED", "Unable to create the tenancy.");
    }

    const { error: partyError } = await admin
      .from("tenancy_parties")
      .insert({ tenancy_id: created.id, tenant_id: tenantId, is_lead: true });
    if (partyError) {
      await admin.from("tenancies").delete().eq("id", created.id);
      return fail(req, 500, "PARTY_CREATE_FAILED", "Unable to link the tenant to the tenancy. Nothing was saved.");
    }

    try {
      await admin.from("platform_audit_log").insert({
        action: "tenancy_created",
        actor_profile_id: profile.id,
        target_table: "tenancies",
        target_id: created.id,
        details: {
          event: "tenancy_created",
          actor_id: profile.id,
          actor_role: role,
          property_id: propertyId,
          tenant_id: tenantId,
          status,
          regime,
          term_type: termType,
        },
      });
    } catch {
      // Audit logging must never block tenancy creation.
    }

    return reply(req, {
      success: true,
      tenancy_id: created.id,
      status,
      property_id: propertyId,
      tenant_id: tenantId,
    }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("create-tenancy error", message);
    return fail(req, 500, "INTERNAL_ERROR", "We could not create this tenancy. Please try again.");
  }
});