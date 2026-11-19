"use client";

import { supabase } from "@/lib/supabaseClient";

// Tables included in a data export. Every query runs as the signed-in user, so
// row-level security limits the export to exactly what that user can already
// see in LetHub: their own records, and for agency users, their agency's.
const EXPORT_TABLES = [
  "profiles",
  "agencies",
  "agency_members",
  "landlords",
  "properties",
  "property_compliance_items",
  "compliance_documents",
  "tenancies",
  "tenancy_parties",
  "tenants",
  "rent_payments",
  "rent_increases",
  "arrears_cases",
  "possession_cases",
  "possession_case_grounds",
  "maintenance_jobs",
  "contractor_profiles",
  "contractor_quotes",
  "quotes",
  "quote_items",
  "inspections",
  "inspection_rooms",
  "documents",
  "signatures",
  "pet_requests",
  "modification_requests",
  "messages",
  "notifications",
  "notification_preferences",
  "user_security_events",
  "account_subscriptions",
] as const;

const PAGE_SIZE = 1000;
const MAX_ROWS_PER_TABLE = 50000;

export interface ExportProgress {
  table: string;
  done: number;
  total: number;
}

export interface ExportResult {
  fileName: string;
  rowCount: number;
  skippedTables: string[];
}

async function fetchAllRows(table: string): Promise<{ rows: unknown[]; error: string | null }> {
  const rows: unknown[] = [];
  for (let from = 0; from < MAX_ROWS_PER_TABLE; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table as never)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return { rows, error: error.message };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { rows, error: null };
}

/**
 * Builds a JSON export of everything the signed-in user can access and
 * downloads it in the browser. File attachments (certificates, photos) are
 * listed by name and path but not included.
 */
export async function downloadMyData(onProgress?: (progress: ExportProgress) => void): Promise<ExportResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error("Please sign in again to export your data.");

  const tables: Record<string, unknown[]> = {};
  const skippedTables: string[] = [];
  let rowCount = 0;

  for (let index = 0; index < EXPORT_TABLES.length; index += 1) {
    const table = EXPORT_TABLES[index];
    onProgress?.({ table, done: index, total: EXPORT_TABLES.length });
    const { rows, error } = await fetchAllRows(table);
    if (error) {
      skippedTables.push(table);
      continue;
    }
    if (rows.length > 0) {
      tables[table] = rows;
      rowCount += rows.length;
    }
  }
  onProgress?.({ table: "", done: EXPORT_TABLES.length, total: EXPORT_TABLES.length });

  const exportedAt = new Date().toISOString();
  const payload = {
    format: "lethub-export",
    version: 1,
    exported_at: exportedAt,
    exported_by: { id: user.id, email: user.email },
    note: "Contains every LetHub record this account could access at the time of export. Uploaded files are referenced by storage path but not included.",
    tables,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const fileName = `lethub-export-${exportedAt.slice(0, 10)}.json`;
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return { fileName, rowCount, skippedTables };
}

export async function requestAccountDeletion(reason: string): Promise<{ ok: boolean; alreadyRequested?: boolean; requestedAt?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("request-account-deletion", { body: { reason } });
  if (error || !data?.success) {
    let message = data?.error as string | undefined;
    const context = (error as { context?: Response } | null)?.context;
    if (!message && context && typeof context.json === "function") {
      try {
        message = (await context.json())?.error;
      } catch {
        // ignore non-JSON bodies
      }
    }
    return { ok: false, error: message || "We couldn't record your request. Please email privacy@lethub.uk." };
  }
  return { ok: true, alreadyRequested: Boolean(data.already_requested), requestedAt: data.requested_at };
}
