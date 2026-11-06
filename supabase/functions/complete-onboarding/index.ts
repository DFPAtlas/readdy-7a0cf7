import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

function fail(req: Request, status: number, code: string, error: string) {
  return reply(req, { success: false, code, error }, status);
}

function clean(value: unknown, maxLength = 160): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return fail(req, 405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  try {
    const authorization = req.headers.get("authorization");
    if (!authorization) return fail(req, 401, "MISSING_AUTH", "A valid session is required.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return fail(req, 500, "CONFIG_ERROR", "Server configuration is incomplete.");
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return fail(req, 401, "INVALID_TOKEN", "Your session is invalid or has expired.");

    const body = await req.json().catch(() => ({}));
    const accountType = clean(body.account_type, 20);
    const fullName = clean(body.full_name);
    const agencyName = clean(body.agency_name);
    const phone = clean(body.phone, 40);

    if (accountType !== "agency" && accountType !== "owner") {
      return fail(req, 400, "INVALID_ACCOUNT_TYPE", "Choose an agency or property owner account.");
    }
    if (!fullName) return fail(req, 400, "INVALID_NAME", "Your name is required.");
    if (accountType === "agency" && !agencyName) {
      return fail(req, 400, "INVALID_AGENCY_NAME", "Your agency name is required.");
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, role, email")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) return fail(req, 500, "PROFILE_LOOKUP_FAILED", "Unable to resolve your account.");
    if (!profile) return fail(req, 403, "PROFILE_NOT_FOUND", "Your LetHub profile is not ready.");

    const role = String(profile.role || "");
    if (accountType === "owner" && role !== "landlord") {
      return fail(req, 403, "ROLE_MISMATCH", "This account is not registered as a property owner.");
    }
    if (accountType === "agency" && role !== "estate_agent_admin" && role !== "estate_agent_staff") {
      return fail(req, 403, "ROLE_MISMATCH", "This account is not registered as an agency user.");
    }

    const { error: updateProfileError } = await admin
      .from("profiles")
      .update({ full_name: fullName, email: user.email || profile.email || null, account_type: accountType })
      .eq("id", user.id);
    if (updateProfileError) {
      return fail(req, 500, "PROFILE_SAVE_FAILED", "Unable to save your profile.");
    }

    if (accountType === "owner") {
      const { data: landlord, error: landlordLookupError } = await admin
        .from("landlords")
        .select("id")
        .eq("owner_profile_id", user.id)
        .maybeSingle();
      if (landlordLookupError) return fail(req, 500, "OWNER_LOOKUP_FAILED", "Unable to resolve your owner record.");

      const landlordValues = {
        display_name: fullName,
        email: user.email || null,
        phone: phone || null,
        is_company: false,
      };
      const { error: landlordSaveError } = landlord
        ? await admin.from("landlords").update(landlordValues).eq("id", landlord.id)
        : await admin.from("landlords").insert({ ...landlordValues, owner_profile_id: user.id });
      if (landlordSaveError) return fail(req, 500, "OWNER_SAVE_FAILED", "Unable to save your owner profile.");

      return reply(req, { success: true, account_type: accountType });
    }

    const { data: memberships, error: membershipError } = await admin
      .from("agency_members")
      .select("agency_id")
      .eq("profile_id", user.id);
    if (membershipError) return fail(req, 500, "MEMBERSHIP_LOOKUP_FAILED", "Unable to resolve your agency membership.");

    if ((memberships || []).length > 1) {
      return fail(req, 409, "MULTIPLE_AGENCIES", "Your account belongs to more than one agency. Contact support to finish setup.");
    }

    if (memberships && memberships.length === 1) {
      const agencyId = String(memberships[0].agency_id);
      if (role === "estate_agent_admin") {
        const { error: agencyUpdateError } = await admin
          .from("agencies")
          .update({ name: agencyName })
          .eq("id", agencyId);
        if (agencyUpdateError) return fail(req, 500, "AGENCY_SAVE_FAILED", "Unable to save your agency profile.");
      }
      return reply(req, { success: true, account_type: accountType, agency_id: agencyId });
    }

    if (role !== "estate_agent_admin") {
      return fail(req, 403, "MEMBERSHIP_REQUIRED", "An agency administrator must create this agency account.");
    }

    const { data: agency, error: agencyError } = await admin
      .from("agencies")
      .insert({ name: agencyName })
      .select("id")
      .single();
    if (agencyError || !agency) return fail(req, 500, "AGENCY_CREATE_FAILED", "Unable to create the agency.");

    const { error: insertMembershipError } = await admin
      .from("agency_members")
      .insert({ agency_id: agency.id, profile_id: user.id, role: "property_manager" });
    if (insertMembershipError) {
      await admin.from("agencies").delete().eq("id", agency.id);
      return fail(req, 500, "MEMBERSHIP_CREATE_FAILED", "Unable to finish creating your agency access.");
    }

    return reply(req, { success: true, account_type: accountType, agency_id: agency.id }, 201);
  } catch (error) {
    console.error("complete-onboarding failed", error);
    return fail(req, 500, "INTERNAL_ERROR", "Setup could not be saved. Please try again.");
  }
});
