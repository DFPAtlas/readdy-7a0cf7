import { supabase } from "@/lib/supabaseClient";

export interface AuditEntry {
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function logPlatformAdminAction(entry: AuditEntry): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase.from("platform_audit_log").insert({
      actor_profile_id: session.user.id,
      action: entry.action,
      target_table: entry.targetTable || null,
      target_id: entry.targetId || null,
      details: entry.metadata ? entry.metadata : null,
    });

    if (error) {
      console.error("Audit log failed:", error.message);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("Audit log error:", e?.message);
    return false;
  }
}

export async function fetchAuditLogs(opts?: {
  limit?: number;
  severity?: string;
  search?: string;
}): Promise<{ data: any[] | null; error: string | null }> {
  try {
    let query = supabase
      .from("platform_audit_log")
      .select("id, action, target_table, target_id, details, created_at, actor_profile_id")
      .order("created_at", { ascending: false });

    if (opts?.limit) query = query.limit(opts.limit);

    const { data, error } = await query;
    if (error) return { data: null, error: error.message };

    let results = data || [];

    if (opts?.search) {
      const s = opts.search.toLowerCase();
      results = results.filter(
        (r) =>
          (r.action && r.action.toLowerCase().includes(s)) ||
          (r.target_table && r.target_table.toLowerCase().includes(s)) ||
          (r.details && JSON.stringify(r.details).toLowerCase().includes(s))
      );
    }

    return { data: results, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || "Unknown error" };
  }
}