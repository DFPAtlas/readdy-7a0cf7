import type { SupabaseClient } from "@supabase/supabase-js";

export interface PropertySummary {
  status: string;
  landlord: string;
  tenant: string;
  rentAmount: number;
  depositAmount: number;
  complianceStatus: string;
  maintenanceOpen: number;
  ownerPortal: string;
  tenantPortal: string;
}

const CLOSED_MAINTENANCE = new Set(["completed", "resolved", "cancelled", "closed"]);

function portalState(status: string | null | undefined): string {
  if (status === "active") return "active";
  if (status === "invited" || status === "pending") return "invited";
  return "not-invited";
}

/**
 * Live occupancy, rent, compliance, maintenance and portal status for a set of
 * properties, keyed by property id. Everything is read through RLS as the
 * signed-in user.
 */
export async function fetchPropertySummaries(
  supabase: SupabaseClient<any>,
  properties: Array<{ id: string; landlord_id?: string | null; rent_pcm?: number | string | null; deposit_amount?: number | string | null; status?: string | null }>,
): Promise<Map<string, PropertySummary>> {
  const summaries = new Map<string, PropertySummary>();
  if (properties.length === 0) return summaries;

  const propertyIds = properties.map((p) => p.id);
  const landlordIds = [...new Set(properties.map((p) => p.landlord_id).filter((v): v is string => Boolean(v)))];

  const [tenanciesRes, landlordsRes, complianceRes, maintenanceRes, portalRes] = await Promise.all([
    supabase
      .from("tenancies")
      .select("id, property_id, status, rent_amount, deposit_amount, start_date")
      .in("property_id", propertyIds)
      .in("status", ["active", "in_possession_process"]),
    landlordIds.length
      ? supabase.from("landlords").select("id, display_name").in("id", landlordIds)
      : Promise.resolve({ data: [] as Array<{ id: string; display_name: string | null }> }),
    supabase.from("property_compliance_items").select("property_id, status").in("property_id", propertyIds),
    supabase.from("maintenance_jobs").select("property_id, status").in("property_id", propertyIds),
    supabase.from("portal_access").select("property_id, user_type, status").in("property_id", propertyIds),
  ]);

  const tenancies = (tenanciesRes.data || []) as Array<{ id: string; property_id: string; status: string; rent_amount: number | null; deposit_amount: number | null; start_date: string | null }>;
  const tenancyIds = tenancies.map((t) => t.id);
  const partiesRes = tenancyIds.length
    ? await supabase.from("tenancy_parties").select("tenancy_id, is_lead, tenants(full_name)").in("tenancy_id", tenancyIds)
    : { data: [] as any[] };

  const landlordName = new Map<string, string>();
  ((landlordsRes.data || []) as Array<{ id: string; display_name: string | null }>).forEach((l) => landlordName.set(l.id, l.display_name || "—"));

  const leadTenantByTenancy = new Map<string, string>();
  ((partiesRes.data || []) as any[]).forEach((party) => {
    const tenant = Array.isArray(party.tenants) ? party.tenants[0] : party.tenants;
    if (!tenant?.full_name) return;
    if (party.is_lead || !leadTenantByTenancy.has(party.tenancy_id)) leadTenantByTenancy.set(party.tenancy_id, tenant.full_name);
  });

  const tenancyByProperty = new Map<string, (typeof tenancies)[number]>();
  tenancies
    .sort((a, b) => ((a.start_date || "") < (b.start_date || "") ? 1 : -1))
    .forEach((t) => {
      if (!tenancyByProperty.has(t.property_id)) tenancyByProperty.set(t.property_id, t);
    });

  const complianceByProperty = new Map<string, string[]>();
  ((complianceRes.data || []) as Array<{ property_id: string; status: string }>).forEach((c) => {
    complianceByProperty.set(c.property_id, [...(complianceByProperty.get(c.property_id) || []), c.status]);
  });

  const openMaintenance = new Map<string, number>();
  ((maintenanceRes.data || []) as Array<{ property_id: string; status: string | null }>).forEach((m) => {
    if (CLOSED_MAINTENANCE.has((m.status || "").toLowerCase())) return;
    openMaintenance.set(m.property_id, (openMaintenance.get(m.property_id) || 0) + 1);
  });

  const portals = (portalRes.data || []) as Array<{ property_id: string; user_type: string | null; status: string | null }>;

  for (const property of properties) {
    const tenancy = tenancyByProperty.get(property.id);
    const statuses = complianceByProperty.get(property.id) || [];
    const complianceStatus =
      statuses.length === 0 ? "Missing" :
      statuses.some((s) => s === "overdue" || s === "missing") ? "Overdue" :
      statuses.some((s) => s === "due_soon") ? "Expiring Soon" :
      "Valid";

    summaries.set(property.id, {
      status: tenancy ? "Occupied" : property.status || "Vacant",
      landlord: (property.landlord_id && landlordName.get(property.landlord_id)) || "—",
      tenant: (tenancy && leadTenantByTenancy.get(tenancy.id)) || "—",
      rentAmount: Number(tenancy?.rent_amount ?? property.rent_pcm ?? 0) || 0,
      depositAmount: Number(tenancy?.deposit_amount ?? property.deposit_amount ?? 0) || 0,
      complianceStatus,
      maintenanceOpen: openMaintenance.get(property.id) || 0,
      ownerPortal: portalState(portals.find((p) => p.property_id === property.id && p.user_type === "owner")?.status),
      tenantPortal: portalState(portals.find((p) => p.property_id === property.id && p.user_type === "tenant")?.status),
    });
  }

  return summaries;
}
