import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ROLES = new Set([
  "platform_admin",
  "estate_agent_admin",
  "estate_agent_staff",
  "landlord",
]);

const CREATION_STATUSES = new Set(["active", "trialing", "demo"]);

const VALID_NATIONS = new Set([
  "england",
  "wales",
  "scotland",
  "northern_ireland",
]);

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

function getTokenFromHeader(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;
  return parts[1];
}

function clean(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizePostcode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || null;
  return req.headers.get("cf-connecting-ip") || null;
}

interface NormalizedBody {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  nation: string;
  isHmo: boolean;
  isFurnished: boolean;
  requestedLandlordId: string | null;
  requestedAccountId: string | null;
}

function parseBody(body: unknown): NormalizedBody {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const name = clean(input.name);
  const line1 = clean(input.address);
  const city = clean(input.city);
  const postcode = normalizePostcode(input.postcode);

  if (!name) {
    throw { status: 400, code: "INVALID_NAME", error: "Property name is required." };
  }
  if (!line1) {
    throw { status: 400, code: "INVALID_ADDRESS", error: "Property address is required." };
  }
  if (!city) {
    throw { status: 400, code: "INVALID_CITY", error: "City is required." };
  }
  if (!postcode) {
    throw { status: 400, code: "INVALID_POSTCODE", error: "Postcode is required." };
  }

  const rawNation = clean(input.nation).toLowerCase();
  const nation = rawNation || "england";
  if (!VALID_NATIONS.has(nation)) {
    throw { status: 400, code: "INVALID_NATION", error: "Nation must be one of england, wales, scotland, northern_ireland." };
  }

  const line2 = clean(input.line2) || null;

  const isHmo = input.is_hmo === undefined ? false : input.is_hmo === true;
  const isFurnished = input.is_furnished === undefined ? false : input.is_furnished === true;

  const requestedLandlordId =
    input.landlord_id && typeof input.landlord_id === "string" ? input.landlord_id : null;
  const requestedAccountId =
    (input.account_id && typeof input.account_id === "string" ? input.account_id : null) ||
    (input.agency_id && typeof input.agency_id === "string" ? input.agency_id : null);

  return {
    name,
    line1,
    line2,
    city,
    postcode,
    nation,
    isHmo,
    isFurnished,
    requestedLandlordId,
    requestedAccountId,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return reply(req, { success: false, code: "METHOD_NOT_ALLOWED", error: "Method not allowed" }, 405);
  }

  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return fail(req, 401, "MISSING_AUTH", "A valid Bearer token is required.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return fail(req, 500, "CONFIG_ERROR", "Edge function environment is incomplete.");
    }

    const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);

    if (authError || !user) {
      return fail(req, 401, "INVALID_TOKEN", "The supplied token is invalid or expired.");
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return fail(req, 500, "PROFILE_LOOKUP_FAILED", "Unable to resolve your profile.");
    }
    if (!profile) {
      return fail(req, 403, "PROFILE_NOT_FOUND", "No profile is associated with this account.");
    }

    const role: string = profile.role;
    if (!ALLOWED_ROLES.has(role)) {
      return fail(req, 403, "ROLE_NOT_ALLOWED", "This role is not permitted to create properties.");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail(req, 400, "INVALID_JSON", "Request body must be valid JSON.");
    }

    const input = parseBody(body);

    let landlordId: string;
    let accountId: string | null;

    if (role === "landlord") {
      const { data: owned, error: ownedError } = await admin
        .from("landlords")
        .select("id, managing_agency_id")
        .eq("owner_profile_id", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) {
        return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve your landlord record.");
      }
      if (!owned || owned.length === 0) {
        return fail(req, 403, "LANDLORD_NOT_FOUND", "No landlord record is linked to your account.");
      }

      if (input.requestedLandlordId) {
        const match = owned.find((l) => l.id === input.requestedLandlordId);
        if (!match) {
          return fail(req, 403, "INVALID_LANDLORD", "You cannot create a property for that landlord.");
        }
        landlordId = match.id;
        accountId = match.managing_agency_id || null;
      } else {
        landlordId = owned[0].id;
        accountId = owned[0].managing_agency_id || null;
      }
    } else if (role === "estate_agent_admin" || role === "estate_agent_staff") {
      const { data: memberships, error: memberError } = await admin
        .from("agency_members")
        .select("agency_id")
        .eq("profile_id", user.id);

      if (memberError) {
        return fail(req, 500, "ACCOUNT_LOOKUP_FAILED", "Unable to resolve your agency membership.");
      }
      const agencyIds = (memberships || []).map((m) => m.agency_id as string);
      if (agencyIds.length === 0) {
        return fail(req, 403, "ACCOUNT_NOT_FOUND", "No agency membership was found for your account.");
      }

      let agencyId: string;
      if (input.requestedAccountId) {
        if (!agencyIds.includes(input.requestedAccountId)) {
          return fail(req, 403, "ACCOUNT_FORBIDDEN", "You cannot create properties for that agency.");
        }
        agencyId = input.requestedAccountId;
      } else if (agencyIds.length === 1) {
        agencyId = agencyIds[0];
      } else {
        return fail(req, 400, "ACCOUNT_REQUIRED", "An account_id is required when you belong to multiple agencies.");
      }

      if (input.requestedLandlordId) {
        const { data: landlord, error: landlordError } = await admin
          .from("landlords")
          .select("id, managing_agency_id")
          .eq("id", input.requestedLandlordId)
          .maybeSingle();

        if (landlordError) {
          return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve the requested landlord.");
        }
        if (!landlord || landlord.managing_agency_id !== agencyId) {
          return fail(req, 403, "INVALID_LANDLORD", "That landlord is outside your permitted agency.");
        }
        landlordId = landlord.id;
      } else {
        const { data: landlords, error: listError } = await admin
          .from("landlords")
          .select("id")
          .eq("managing_agency_id", agencyId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (listError) {
          return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve a landlord for your agency.");
        }
        if (!landlords || landlords.length === 0) {
          return fail(req, 403, "LANDLORD_REQUIRED", "Your agency has no landlords to assign this property to.");
        }
        landlordId = landlords[0].id;
      }

      accountId = agencyId;
    } else {
      if (!input.requestedLandlordId) {
        return fail(req, 400, "LANDLORD_REQUIRED", "A landlord_id is required for cross-account creation.");
      }

      const { data: landlord, error: landlordError } = await admin
        .from("landlords")
        .select("id, managing_agency_id")
        .eq("id", input.requestedLandlordId)
        .maybeSingle();

      if (landlordError) {
        return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve the target landlord.");
      }
      if (!landlord) {
        return fail(req, 400, "INVALID_LANDLORD", "The supplied landlord_id does not exist.");
      }

      if (input.requestedAccountId) {
        const { data: account, error: accountError } = await admin
          .from("agencies")
          .select("id")
          .eq("id", input.requestedAccountId)
          .maybeSingle();

        if (accountError) {
          return fail(req, 500, "ACCOUNT_LOOKUP_FAILED", "Unable to resolve the supplied account.");
        }
        if (!account) {
          return fail(req, 400, "ACCOUNT_NOT_FOUND", "The supplied account_id does not exist.");
        }
        if (landlord.managing_agency_id !== input.requestedAccountId) {
          return fail(req, 403, "ACCOUNT_MISMATCH", "The account does not match the target landlord.");
        }
      }

      landlordId = landlord.id;
      accountId = landlord.managing_agency_id || null;
    }

    if (role !== "platform_admin") {
      const { data: subscription, error: subError } = await admin
        .from("account_subscriptions")
        .select("plan_slug, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        return fail(req, 500, "SUBSCRIPTION_LOOKUP_FAILED", "Unable to resolve your subscription.");
      }

      if (!subscription || !CREATION_STATUSES.has(subscription.status)) {
        return fail(req, 403, "SUBSCRIPTION_INACTIVE", "Your subscription does not allow creating properties.");
      }

      const { data: plan, error: planError } = await admin
        .from("subscription_plans")
        .select("slug, is_enterprise, max_properties")
        .eq("slug", subscription.plan_slug)
        .eq("is_active", true)
        .maybeSingle();

      if (planError) {
        return fail(req, 500, "PLAN_LOOKUP_FAILED", "Unable to resolve your plan.");
      }
      if (!plan) {
        return fail(req, 403, "PLAN_NOT_FOUND", "Your plan is no longer available.");
      }

      if (!plan.is_enterprise) {
        const maxProperties = plan.max_properties;
        if (
          typeof maxProperties !== "number" ||
          !Number.isFinite(maxProperties) ||
          maxProperties < 0
        ) {
          return fail(req, 500, "PLAN_LIMIT_INVALID", "Your plan's property limit is misconfigured.");
        }

        const countQuery = role === "landlord"
          ? admin.from("properties").select("id", { count: "exact", head: true }).eq("landlord_id", landlordId)
          : admin.from("properties").select("id", { count: "exact", head: true }).eq("managing_agency_id", accountId);

        const { count, error: countError } = await countQuery;

        if (countError) {
          return fail(req, 500, "PROPERTY_COUNT_FAILED", "Unable to count your existing properties.");
        }
        if ((count ?? 0) >= maxProperties) {
          return fail(req, 403, "PROPERTY_LIMIT_REACHED", "Your current plan has reached its property limit.");
        }
      }
    }

    const duplicateQuery = admin
      .from("properties")
      .select("id")
      .eq("landlord_id", landlordId)
      .ilike("line1", input.line1)
      .eq("postcode", input.postcode)
      .limit(1);

    const { data: existing, error: dupError } = await duplicateQuery.maybeSingle();

    if (dupError) {
      return fail(req, 500, "DUPLICATE_CHECK_FAILED", "Unable to check for duplicate properties.");
    }
    if (existing) {
      return fail(req, 409, "PROPERTY_ALREADY_EXISTS", "A property with this address already exists for this account.");
    }

    const insertPayload: Record<string, unknown> = {
      landlord_id: landlordId,
      line1: input.line1,
      city: input.city,
      postcode: input.postcode,
      nation: input.nation,
      is_hmo: input.isHmo,
      is_furnished: input.isFurnished,
    };
    if (input.line2) insertPayload.line2 = input.line2;
    if (accountId) insertPayload.managing_agency_id = accountId;

    const { data: created, error: insertError } = await admin
      .from("properties")
      .insert(insertPayload)
      .select("id, line1, city, postcode, nation, landlord_id, managing_agency_id")
      .single();

    if (insertError) {
      return fail(req, 500, "PROPERTY_CREATE_FAILED", "Unable to create the property.");
    }

    try {
      const auditResult = await admin.from("platform_audit_log").insert({
        action: "property_created",
        actor_profile_id: user.id,
        target_table: "properties",
        target_id: created.id,
        ip_address: clientIp(req),
        details: {
          event: "property_created",
          actor_id: user.id,
          actor_email: user.email || null,
          actor_role: role,
          account_id: accountId,
          property_id: created.id,
          landlord_id: landlordId,
          property_name: input.name,
          postcode: input.postcode,
          nation: input.nation,
        },
      });

      if (auditResult.error) {
        console.error("Audit logging failed for property creation", auditResult.error.message);
      }
    } catch (auditErr) {
      const message = auditErr instanceof Error ? auditErr.message : String(auditErr);
      console.error("Audit logging failed for property creation", message);
    }

    return reply(
      req,
      {
        success: true,
        property: {
          id: created.id,
          name: input.name,
          address: created.line1,
          city: created.city,
          postcode: created.postcode,
          nation: created.nation,
        },
      },
      201,
    );
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && "code" in err) {
      const e = err as { status: number; code: string; error: string };
      return fail(req, e.status, e.code, e.error);
    }
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error("Unexpected error in create-property", err);
    return fail(req, 500, "INTERNAL_ERROR", message);
  }
});
