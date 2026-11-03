import type { SupabaseClient } from "@supabase/supabase-js";

export interface SelectableProperty {
  id: string;
  label: string;
  address: string;
  landlordId: string;
  landlordName: string;
}

export interface SelectableTenant {
  id: string;
  fullName: string;
  email: string;
}

export interface CreateTenancyInput {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  depositAmount: number;
  depositScheme?: string;
  termType: "periodic" | "fixed_term";
  regime: string;
  status: "draft" | "active";
}

export interface CreateTenantInput {
  fullName: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes?: string;
}

export interface FlowResult {
  ok: boolean;
  message: string;
  code?: string;
  id?: string;
  status?: string;
}

interface EdgeError {
  status: number;
  code: string;
  message: string;
}

async function invokeEdge(
  supabase: SupabaseClient<any>,
  name: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; data: any } | { ok: false; error: EdgeError }> {
  try {
    const { data, error } = await supabase.functions.invoke(name, { body });

    if (error) {
      let message = "Something went wrong. Please try again.";
      let code = "";
      let status = 0;
      const context: any = (error as any).context;
      if (context) {
        status = typeof context.status === "number" ? context.status : 0;
        if (typeof context.json === "function") {
          try {
            const parsed = await context.json();
            if (parsed?.error) message = parsed.error;
            if (parsed?.code) code = parsed.code;
          } catch {
            // Response body was not JSON; keep the generic message.
          }
        }
      }
      return { ok: false, error: { status, code, message } };
    }

    if (!data || data.success !== true) {
      return {
        ok: false,
        error: {
          status: 200,
          code: data?.code || "",
          message: data?.error || "Something went wrong. Please try again.",
        },
      };
    }

    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return { ok: false, error: { status: 0, code: "", message } };
  }
}

export async function fetchSelectableProperties(
  supabase: SupabaseClient<any>,
): Promise<SelectableProperty[]> {
  const { data: props, error } = await supabase
    .from("properties")
    .select("id, line1, city, postcode, landlord_id");
  if (error || !props) return [];

  const landlordIds = [...new Set(props.map((p: any) => p.landlord_id).filter(Boolean))];
  const landlordMap = new Map<string, string>();
  if (landlordIds.length > 0) {
    const { data: landlords } = await supabase
      .from("landlords")
      .select("id, display_name")
      .in("id", landlordIds);
    (landlords || []).forEach((l: any) => landlordMap.set(l.id, l.display_name || "Owner"));
  }

  return props.map((p: any) => {
    const address = [p.line1, p.city, p.postcode].filter(Boolean).join(", ");
    return {
      id: p.id,
      label: p.line1 || address || "Property",
      address,
      landlordId: p.landlord_id || "",
      landlordName: p.landlord_id ? landlordMap.get(p.landlord_id) || "" : "",
    };
  });
}

export async function fetchSelectableTenants(
  supabase: SupabaseClient<any>,
): Promise<SelectableTenant[]> {
  const { data, error } = await supabase
    .from("tenants")
    .select("id, full_name, email")
    .order("full_name", { ascending: true });
  if (error || !data) return [];
  return data.map((t: any) => ({
    id: t.id,
    fullName: t.full_name || "Unknown",
    email: t.email || "",
  }));
}

export async function createTenancy(
  supabase: SupabaseClient<any>,
  input: CreateTenancyInput,
): Promise<FlowResult> {
  const result = await invokeEdge(supabase, "create-tenancy", {
    property_id: input.propertyId,
    tenant_id: input.tenantId,
    start_date: input.startDate,
    end_date: input.endDate || null,
    rent_amount: input.rentAmount,
    deposit_amount: input.depositAmount,
    deposit_scheme: input.depositScheme || null,
    term_type: input.termType,
    regime: input.regime,
    status: input.status,
  });

  if (!result.ok) {
    return { ok: false, message: result.error.message, code: result.error.code };
  }
  return {
    ok: true,
    message: result.data.status === "active" ? "Tenancy created successfully" : "Tenancy created as draft",
    id: result.data.tenancy_id,
    status: result.data.status,
  };
}

export async function createTenant(
  supabase: SupabaseClient<any>,
  input: CreateTenantInput,
): Promise<FlowResult> {
  const result = await invokeEdge(supabase, "create-tenant", {
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    emergency_contact_name: input.emergencyContactName,
    emergency_contact_phone: input.emergencyContactPhone,
    notes: input.notes || null,
  });

  if (!result.ok) {
    return { ok: false, message: result.error.message, code: result.error.code };
  }
  return { ok: true, message: "Tenant added successfully", id: result.data.tenant?.id };
}