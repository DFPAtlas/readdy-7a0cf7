import { supabase } from "@/lib/supabaseClient";
import type { TimelineEvent } from "./ComplianceTimelineData";

interface ComplianceItemRow {
  id: string;
  property_id: string | null;
  obligation_code: string;
  status: string;
  next_due: string | null;
}

interface PropertyRow {
  id: string;
  line1: string | null;
  city: string | null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const INCLUDED_STATUSES = ["compliant", "due_soon", "overdue", "missing"] as const;

const OBLIGATION_LABELS: Record<string, string> = {
  gas_safety: "Gas Safety Certificate",
  eicr: "EICR",
  epc: "EPC",
  right_to_rent: "Right to Rent Check",
  deposit_prescribed_info: "Deposit Prescribed Information",
  legionella_risk_assessment: "Legionella Risk Assessment",
  hmo_licence: "HMO Licence",
};

const OBLIGATION_CATEGORIES: Record<string, string> = {
  gas_safety: "gas",
  eicr: "eicr",
  epc: "epc",
  right_to_rent: "inspections",
  deposit_prescribed_info: "inspections",
  legionella_risk_assessment: "inspections",
  hmo_licence: "inspections",
};

const STATUS_LOOK: Record<string, { status: TimelineEvent["status"]; icon: string; color: string }> = {
  compliant: { status: "valid", icon: "ri-check-line", color: "bg-[#10B981]" },
  due_soon: { status: "expiring", icon: "ri-time-line", color: "bg-[#F59E0B]" },
  overdue: { status: "expired", icon: "ri-close-circle-line", color: "bg-[#EF4444]" },
  missing: { status: "expired", icon: "ri-close-circle-line", color: "bg-[#EF4444]" },
};

function readableType(code: string): string {
  const known = OBLIGATION_LABELS[code];
  if (known) return known;
  return code
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTimelineDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map((part) => Number(part));
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]} ${year}`;
}

function daysUntil(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map((part) => Number(part));
  const due = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due - today) / 86400000);
}

export async function fetchTimelineEvents(): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from("property_compliance_items")
    .select("id, property_id, obligation_code, status, next_due")
    .in("status", INCLUDED_STATUSES)
    .not("next_due", "is", null)
    .order("next_due", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as ComplianceItemRow[]).filter(
    (row) => !!row.next_due && INCLUDED_STATUSES.some((status) => status === row.status)
  );
  if (rows.length === 0) return [];

  const propertyIds = Array.from(new Set(rows.map((row) => row.property_id).filter((id): id is string => !!id)));
  const propertyMap = new Map<string, PropertyRow>();

  if (propertyIds.length > 0) {
    const { data: propertyData, error: propertyError } = await supabase
      .from("properties")
      .select("id, line1, city")
      .in("id", propertyIds);

    if (propertyError) throw new Error(propertyError.message);
    ((propertyData ?? []) as PropertyRow[]).forEach((property) => propertyMap.set(property.id, property));
  }

  return rows.map((row) => {
    const property = row.property_id ? propertyMap.get(row.property_id) : undefined;
    const propertyName =
      [property?.line1, property?.city].filter(Boolean).join(", ") || "Property";
    const look = STATUS_LOOK[row.status] ?? STATUS_LOOK.compliant;
    const nextDue = row.next_due as string;

    return {
      id: row.id,
      propertyId: row.property_id ?? "",
      propertyName,
      type: readableType(row.obligation_code),
      category: OBLIGATION_CATEGORIES[row.obligation_code] ?? "inspections",
      date: formatTimelineDate(nextDue),
      daysFromNow: daysUntil(nextDue),
      status: look.status,
      icon: look.icon,
      color: look.color,
    } satisfies TimelineEvent;
  });
}
