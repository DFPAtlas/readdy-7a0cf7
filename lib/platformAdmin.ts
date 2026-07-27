import { supabase } from "@/lib/supabaseClient";

export function getSupabaseAdminClient() {
  return supabase;
}

export async function isPlatformAdmin(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    return profile?.role === "platform_admin";
  } catch {
    return false;
  }
}

export async function requirePlatformAdmin(): Promise<{
  allowed: boolean;
  profile: { id: string; full_name: string; role: string; email: string } | null;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { allowed: false, profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, role, email")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== "platform_admin") {
      return { allowed: false, profile: profile as any };
    }

    return { allowed: true, profile: profile as any };
  } catch {
    return { allowed: false, profile: null };
  }
}

export async function fetchPlatformKpi(
  table: string,
  opts?: {
    column?: string;
    filter?: Record<string, unknown>;
    countOnly?: boolean;
  }
): Promise<{ count: number | null; error: string | null }> {
  try {
    let query = supabase.from(table).select(opts?.column || "*", { count: "exact", head: true });
    if (opts?.filter) {
      for (const [key, value] of Object.entries(opts.filter)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }
    const { count, error } = await query;
    if (error) return { count: null, error: error.message };
    return { count: count ?? 0, error: null };
  } catch (e: any) {
    return { count: null, error: e?.message || "Unknown error" };
  }
}

export async function fetchTableRows(
  table: string,
  opts?: {
    columns?: string;
    filters?: Record<string, unknown>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<{ data: any[] | null; error: string | null }> {
  try {
    let query = supabase.from(table).select(opts?.columns || "*");
    if (opts?.filters) {
      for (const [key, value] of Object.entries(opts.filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
    }
    if (opts?.order) {
      query = query.order(opts.order.column, { ascending: opts.order.ascending ?? false });
    }
    if (opts?.limit) {
      query = query.limit(opts.limit);
    }
    const { data, error } = await query;
    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || "Unknown error" };
  }
}