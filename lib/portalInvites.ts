import type { SupabaseClient } from "@supabase/supabase-js";

export interface InviteTarget {
  id: string;
  name: string;
  email: string;
  relatedRecord: string;
  recordLabel: string;
}

export interface InviteTargets {
  owners: InviteTarget[];
  tenants: InviteTarget[];
}

interface PropertyRow {
  id: string;
  line1: string | null;
  city: string | null;
  postcode: string | null;
  landlord_id: string | null;
}

export async function fetchInviteTargets(supabase: SupabaseClient<any>): Promise<InviteTargets> {
  const owners: InviteTarget[] = [];
  const tenants: InviteTarget[] = [];

  const { data: props } = await supabase
    .from("properties")
    .select("id, line1, city, postcode, landlord_id");
  const properties = (props || []) as PropertyRow[];
  if (properties.length === 0) return { owners, tenants };

  const propertyIds = properties.map((p) => p.id);
  const landlordIds = [...new Set(properties.map((p) => p.landlord_id).filter(Boolean))] as string[];

  const landlordMap = new Map<string, { display_name: string | null; email: string | null }>();
  if (landlordIds.length > 0) {
    const { data: landlords } = await supabase
      .from("landlords")
      .select("id, display_name, email")
      .in("id", landlordIds);
    (landlords || []).forEach((l: any) => landlordMap.set(l.id, l));
  }

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("id, property_id")
    .in("property_id", propertyIds);

  const propertyByTenancy = new Map<string, string>();
  (tenancies || []).forEach((t: any) => propertyByTenancy.set(t.id, t.property_id));
  const tenancyIds = (tenancies || []).map((t: any) => t.id);

  const tenantIdsByProperty = new Map<string, string[]>();
  if (tenancyIds.length > 0) {
    const { data: parties } = await supabase
      .from("tenancy_parties")
      .select("tenancy_id, tenant_id")
      .in("tenancy_id", tenancyIds);
    (parties || []).forEach((p: any) => {
      const propertyId = propertyByTenancy.get(p.tenancy_id);
      if (!propertyId) return;
      const list = tenantIdsByProperty.get(propertyId) || [];
      list.push(p.tenant_id);
      tenantIdsByProperty.set(propertyId, list);
    });
  }

  const allTenantIds = [...new Set([...tenantIdsByProperty.values()].flat())];
  const tenantMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (allTenantIds.length > 0) {
    const { data: tenantRows } = await supabase
      .from("tenants")
      .select("id, full_name, email")
      .in("id", allTenantIds);
    (tenantRows || []).forEach((t: any) => tenantMap.set(t.id, t));
  }

  properties.forEach((p) => {
    const address = [p.line1, p.city, p.postcode].filter(Boolean).join(", ");
    const landlord = p.landlord_id ? landlordMap.get(p.landlord_id) : null;
    if (landlord) {
      owners.push({
        id: p.id,
        name: landlord.display_name || "Owner",
        email: landlord.email || "",
        relatedRecord: address,
        recordLabel: "Property",
      });
    }
    const tenantIds = tenantIdsByProperty.get(p.id) || [];
    tenantIds.forEach((tenantId) => {
      const tenant = tenantMap.get(tenantId);
      if (!tenant) return;
      tenants.push({
        id: p.id,
        name: tenant.full_name || "Tenant",
        email: tenant.email || "",
        relatedRecord: address,
        recordLabel: "Property",
      });
    });
  });

  return { owners, tenants };
}

export interface SendInviteParams {
  portalType: string;
  propertyId: string;
  email: string;
  message: string;
}

export interface SendInviteResult {
  ok: boolean;
  message: string;
  link?: string;
  code?: string;
}

export async function sendPortalInvite(
  supabase: SupabaseClient<any>,
  params: SendInviteParams,
): Promise<SendInviteResult> {
  try {
    const { data, error } = await supabase.functions.invoke("create-portal-invite", {
      body: {
        portal_type: params.portalType,
        property_id: params.propertyId,
        email: params.email,
        message: params.message || "",
      },
    });

    if (error) {
      let message = "We could not send this invitation. Please try again.";
      let code = "";
      const context: any = (error as any).context;
      if (context && typeof context.json === "function") {
        try {
          const parsed = await context.json();
          if (parsed?.error) message = parsed.error;
          if (parsed?.code) code = parsed.code;
        } catch {
          // Response body was not JSON; keep the generic message.
        }
      }
      return { ok: false, message, code };
    }

    if (!data || data.success !== true) {
      return {
        ok: false,
        message: data?.error || "We could not send this invitation. Please try again.",
        code: data?.code || "",
      };
    }

    const link: string | undefined = data.invite_link || undefined;
    const deliveryNote = data.email_sent === false
      ? " Invitation created, but the email could not be delivered — copy the link to share it."
      : "";
    return {
      ok: true,
      message: `Invitation sent to ${data.email || params.email}.${deliveryNote}`,
      link,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "We could not send this invitation.";
    return { ok: false, message };
  }
}