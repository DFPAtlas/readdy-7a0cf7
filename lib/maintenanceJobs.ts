import { supabase } from "@/lib/supabaseClient";
import { getStatusConfig, type MaintenanceStage } from "@/lib/maintenanceStatus";
import type { MaintenanceJobListItem } from "@/components/dashboard/MaintenanceJobCard";

interface MaintenanceJobRow {
  id: string;
  property_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  assigned_contractor_profile_id: string | null;
  target_date: string | null;
  estimated_cost: number | string | null;
  created_at: string | null;
}

interface PropertyRow {
  id: string;
  line1: string | null;
  city: string | null;
  postcode: string | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatCost(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `£${amount.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

function capitalise(value: string | null | undefined): string {
  if (!value) return "Normal";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function fetchMaintenanceJobs(): Promise<MaintenanceJobListItem[]> {
  const { data, error } = await supabase
    .from("maintenance_jobs")
    .select(
      "id, property_id, title, description, status, priority, assigned_contractor_profile_id, target_date, estimated_cost, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as MaintenanceJobRow[];
  if (rows.length === 0) return [];

  const propertyIds = Array.from(new Set(rows.map((r) => r.property_id).filter((v): v is string => !!v)));
  const contractorIds = Array.from(
    new Set(rows.map((r) => r.assigned_contractor_profile_id).filter((v): v is string => !!v))
  );

  const [propertiesResult, contractorsResult] = await Promise.all([
    propertyIds.length
      ? supabase.from("properties").select("id, line1, city, postcode").in("id", propertyIds)
      : Promise.resolve({ data: [] as PropertyRow[], error: null }),
    contractorIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", contractorIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[], error: null }),
  ]);

  if (propertiesResult.error) throw new Error(propertiesResult.error.message);
  if (contractorsResult.error) throw new Error(contractorsResult.error.message);

  const propertyMap = new Map<string, PropertyRow>();
  ((propertiesResult.data ?? []) as PropertyRow[]).forEach((p) => propertyMap.set(p.id, p));

  const contractorMap = new Map<string, string>();
  ((contractorsResult.data ?? []) as { id: string; full_name: string | null }[]).forEach((p) => {
    if (p.full_name) contractorMap.set(p.id, p.full_name);
  });

  return rows.map((row) => {
    const property = row.property_id ? propertyMap.get(row.property_id) : undefined;
    const line1 = property?.line1 ?? "";
    const city = property?.city ?? "";
    const postcode = property?.postcode ?? "";
    const propertyLabel = [line1, city].filter(Boolean).join(", ") || "—";
    const propertyAddress = [line1, city].filter(Boolean).join(", ");
    const statusConfig = getStatusConfig(row.status);

    return {
      id: row.id,
      reference: `MAINT-${row.id.slice(0, 6).toUpperCase()}`,
      title: row.title,
      property: propertyLabel,
      propertyAddress: [propertyAddress, postcode].filter(Boolean).join(" ") || "—",
      stage: row.status as MaintenanceStage,
      priority: capitalise(row.priority),
      contractor: row.assigned_contractor_profile_id
        ? contractorMap.get(row.assigned_contractor_profile_id) ?? "—"
        : "—",
      targetDate: formatDate(row.target_date),
      reportedDate: formatDate(row.created_at),
      estimatedCost: formatCost(row.estimated_cost),
      nextAction: statusConfig.description,
      responsibleRole: statusConfig.actorLabel,
    } satisfies MaintenanceJobListItem;
  });
}

export interface MaintenancePropertyOption {
  id: string;
  label: string;
}

export async function fetchMaintenanceProperties(): Promise<MaintenancePropertyOption[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("id, line1, city, postcode")
    .order("line1", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as PropertyRow[]).map((property) => {
    const street = property.line1 ?? "";
    const area = [property.city, property.postcode].filter(Boolean).join(" ");
    return {
      id: property.id,
      label: [street, area].filter(Boolean).join(", ") || "Untitled property",
    };
  });
}

export interface NewMaintenanceJobInput {
  propertyId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  reportedBy: string;
  targetDate: string;
  accessNotes: string;
}

export async function createMaintenanceJob(input: NewMaintenanceJobInput): Promise<void> {
  const { error } = await supabase.from("maintenance_jobs").insert({
    property_id: input.propertyId,
    title: input.title.trim(),
    description: input.description.trim() || null,
    category: input.category || null,
    priority: input.priority.toLowerCase(),
    reported_by: input.reportedBy || null,
    target_date: input.targetDate || null,
    access_notes: input.accessNotes.trim() || null,
    status: "reported",
  });

  if (error) throw new Error(error.message);
}