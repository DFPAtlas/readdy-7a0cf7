import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ROLES = new Set([
  "platform_admin",
  "estate_agent_admin",
  "estate_agent_staff",
  "landlord",
]);

const PROPERTY_COLUMNS =
  "id, line1, line2, city, postcode, nation, landlord_id, managing_agency_id, created_at";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || null;
  return req.headers.get("cf-connecting-ip") || null;
}

function parsePagination(url: URL): { limit: number; offset: number } {
  const rawLimit = url.searchParams.get("limit");
  const rawOffset = url.searchParams.get("offset");

  let limit = DEFAULT_LIMIT;
  let offset = 0;

  if (rawLimit !== null && rawLimit !== "") {
    const parsed = Number(rawLimit);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw { status: 400, code: "INVALID_LIMIT", error: "limit must be a positive integer." };
    }
    limit = parsed;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  if (rawOffset !== null && rawOffset !== "") {
    const parsed = Number(rawOffset);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw { status: 400, code: "INVALID_OFFSET", error: "offset must be a non-negative integer." };
    }
    offset = parsed;
  }

  return { limit, offset };
}

function sanitizeSearch(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s'\-]/g, "")
    .slice(0, 80);
}

async function logDenied(
  admin: ReturnType<typeof createClient>,
  req: Request,
  actorId: string,
  actorEmail: string | null | undefined,
  actorRole: string,
  code: string,
  meta: Record<string, unknown>,
) {
  try {
    await admin.from("platform_audit_log").insert({
      action: "property_list_denied",
      actor_profile_id: actorId,
      target_table: "properties",
      ip_address: clientIp(req),
      details: {
        event: "property_list_denied",
        code,
        actor_id: actorId,
        actor_email: actorEmail || null,
        actor_role: actorRole,
        ...meta,
      },
    });
  } catch {
    // best-effort; never block the denial response
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (req.method !== "GET") {
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
      return fail(req, 403, "ROLE_NOT_ALLOWED", "This role is not permitted to list properties.");
    }

    const url = new URL(req.url);
    const { limit, offset } = parsePagination(url);
    const searchRaw = sanitizeSearch(url.searchParams.get("q") || "");
    const requestedLandlordId = url.searchParams.get("landlord_id") || null;
    const requestedAccountId = url.searchParams.get("account_id") || null;

    let query = admin.from("properties").select(PROPERTY_COLUMNS, { count: "exact" });

    if (role === "landlord") {
      const { data: owned, error: ownedError } = await admin
        .from("landlords")
        .select("id")
        .eq("owner_profile_id", user.id);

      if (ownedError) {
        return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve your landlord record.");
      }
      const ownedIds = (owned || []).map((l) => l.id as string);
      if (ownedIds.length === 0) {
        return fail(req, 403, "LANDLORD_NOT_FOUND", "No landlord record is linked to your account.");
      }

      if (requestedLandlordId) {
        if (!ownedIds.includes(requestedLandlordId)) {
          await logDenied(admin, req, user.id, user.email, role, "INVALID_LANDLORD", {
            requested_landlord_id: requestedLandlordId,
          });
          return fail(req, 403, "INVALID_LANDLORD", "You cannot access properties for that landlord.");
        }
        query = query.eq("landlord_id", requestedLandlordId);
      } else {
        query = query.in("landlord_id", ownedIds);
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

      if (requestedAccountId) {
        if (!agencyIds.includes(requestedAccountId)) {
          await logDenied(admin, req, user.id, user.email, role, "ACCOUNT_FORBIDDEN", {
            requested_account_id: requestedAccountId,
          });
          return fail(req, 403, "ACCOUNT_FORBIDDEN", "You cannot access properties for that agency.");
        }
        query = query.eq("managing_agency_id", requestedAccountId);
      } else {
        query = query.in("managing_agency_id", agencyIds);
      }
    } else {
      // platform_admin
      if (requestedLandlordId && requestedAccountId) {
        const { data: landlord, error: landlordError } = await admin
          .from("landlords")
          .select("id, managing_agency_id")
          .eq("id", requestedLandlordId)
          .maybeSingle();

        if (landlordError) {
          return fail(req, 500, "LANDLORD_LOOKUP_FAILED", "Unable to resolve the requested landlord.");
        }
        if (!landlord) {
          return fail(req, 400, "INVALID_LANDLORD", "The supplied landlord_id does not exist.");
        }
        if (landlord.managing_agency_id !== requestedAccountId) {
          await logDenied(admin, req, user.id, user.email, role, "ACCOUNT_MISMATCH", {
            requested_landlord_id: requestedLandlordId,
            requested_account_id: requestedAccountId,
          });
          return fail(req, 403, "ACCOUNT_MISMATCH", "The account does not match the target landlord.");
        }
        query = query.eq("landlord_id", requestedLandlordId).eq("managing_agency_id", requestedAccountId);
      } else if (requestedLandlordId) {
        query = query.eq("landlord_id", requestedLandlordId);
      } else if (requestedAccountId) {
        query = query.eq("managing_agency_id", requestedAccountId);
      }
    }

    if (searchRaw) {
      query = query.or(
        `line1.ilike.%${searchRaw}%,city.ilike.%${searchRaw}%,postcode.ilike.%${searchRaw}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return fail(req, 500, "PROPERTY_LIST_FAILED", "Unable to load properties.");
    }

    return reply(req, {
      success: true,
      properties: data || [],
      pagination: {
        limit,
        offset,
        count: count ?? 0,
      },
    });
  } catch (err) {
    if (err && typeof err === "object" && "status" in err && "code" in err) {
      const e = err as { status: number; code: string; error: string };
      return fail(req, e.status, e.code, e.error);
    }
    console.error("Unexpected error in list-properties", err);
    return fail(req, 500, "PROPERTY_LIST_FAILED", "An unexpected error occurred.");
  }
});
