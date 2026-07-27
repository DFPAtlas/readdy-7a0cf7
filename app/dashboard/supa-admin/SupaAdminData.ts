import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchPlatformKpi, fetchTableRows } from "@/lib/platformAdmin";
import { logPlatformAdminAction } from "@/lib/adminAudit";

export const roleLabels: Record<string, string> = {
  platform_admin: "Platform Admin",
  estate_agent_admin: "Agent Admin",
  estate_agent_staff: "Agent Staff",
  landlord: "Landlord",
  tenant: "Tenant",
  contractor: "Contractor",
};

export const roleColors: Record<string, string> = {
  platform_admin: "bg-purple-500",
  estate_agent_admin: "bg-amber-500",
  estate_agent_staff: "bg-blue-500",
  landlord: "bg-emerald-500",
  tenant: "bg-sky-500",
  contractor: "bg-orange-500",
};

export const statusStyles: Record<string, string> = {
  active: "bg-[#10B981]/10 text-[#10B981]",
  inactive: "bg-[#EF4444]/10 text-[#EF4444]",
  pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  suspended: "bg-[#EF4444]/10 text-[#EF4444]",
  cancelled: "bg-[#94A3B8]/10 text-[#94A3B8]",
  trialing: "bg-[#3B82F6]/10 text-[#3B82F6]",
  past_due: "bg-[#EF4444]/10 text-[#EF4444]",
};

export interface OverviewKpi {
  totalUsers: { count: number | null; error: string | null };
  totalLandlords: { count: number | null; error: string | null };
  totalTenants: { count: number | null; error: string | null };
  totalContractors: { count: number | null; error: string | null };
  totalProperties: { count: number | null; error: string | null };
  activeTenancies: { count: number | null; error: string | null };
  openMaintenanceJobs: { count: number | null; error: string | null };
  overdueCompliance: { count: number | null; error: string | null };
  activeSubscriptions: { count: number | null; error: string | null };
  unreadNotifications: { count: number | null; error: string | null };
  n8nAgentsEnabled: { count: number | null; error: string | null };
}

export function useOverviewKpis(): { data: OverviewKpi | null; loading: boolean } {
  const [data, setData] = useState<OverviewKpi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.allSettled([
        fetchPlatformKpi("profiles"),
        fetchPlatformKpi("profiles", { filter: { role: "landlord" } }),
        fetchPlatformKpi("profiles", { filter: { role: "tenant" } }),
        fetchPlatformKpi("profiles", { filter: { role: "contractor" } }),
        fetchPlatformKpi("properties"),
        fetchPlatformKpi("tenancies", { filter: { status: "active" } }),
        fetchPlatformKpi("maintenance_jobs", { filter: { status: "open" } }),
        fetchPlatformKpi("property_compliance_items", { filter: { status: "overdue" } }),
        fetchPlatformKpi("account_subscriptions", { filter: { status: "active" } }),
        fetchPlatformKpi("notifications", { filter: { is_read: false } }),
        fetchPlatformKpi("n8n_agents", { filter: { enabled: true } }),
      ]);

      const get = (i: number) =>
        results[i].status === "fulfilled"
          ? results[i].value
          : { count: null, error: "Table not available" };

      if (!cancelled) {
        setData({
          totalUsers: get(0),
          totalLandlords: get(1),
          totalTenants: get(2),
          totalContractors: get(3),
          totalProperties: get(4),
          activeTenancies: get(5),
          openMaintenanceJobs: get(6),
          overdueCompliance: get(7),
          activeSubscriptions: get(8),
          unreadNotifications: get(9),
          n8nAgentsEnabled: get(10),
        });
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchTableRows("profiles", {
      columns: "id, full_name, role, email, account_type, created_at",
      order: { column: "created_at" },
    });
    setProfiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { profiles, loading, reload: load };
}

export function useLandlords() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("landlords", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useTenants() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("tenants", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useContractors() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("contractor_profiles", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useProperties() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("properties", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useTenancies() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("tenancies", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useMaintenanceJobs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("maintenance_jobs", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useComplianceItems() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("property_compliance_items", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useComplianceDocuments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("compliance_documents", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useDocuments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("documents", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useSignatures() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("signatures", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useSubscriptions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("account_subscriptions", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useRentPayments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("rent_payments", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useArrears() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("arrears_cases", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useN8nAgents() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const { data: agents } = await fetchTableRows("n8n_agents", {
      order: { column: "agent_name" },
    });
    setData(agents || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

export function useNotifications() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("notifications", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useMessages() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTableRows("messages", {
      order: { column: "created_at" },
      limit: 50,
    }).then((r) => {
      setData(r.data || []);
      setLoading(false);
    });
  }, []);
  return { data, loading };
}

export function useAuditLogs() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: logs } = await fetchTableRows("platform_audit_log", {
      order: { column: "created_at" },
      limit: 100,
    });
    setData(logs || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchTableRows("platform_settings");
    const map: Record<string, string> = {};
    if (data) {
      data.forEach((s: any) => { map[s.key] = s.value; });
    }
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { settings, loading, reload: load };
}

export function useAdminTasks() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: tasks } = await fetchTableRows("admin_tasks", {
      order: { column: "created_at" },
      limit: 100,
    });
    setData(tasks || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}

export async function createAdminTask(task: {
  title: string;
  description?: string;
  priority?: string;
  assigned_to?: string;
  source?: string;
  linked_table?: string;
  linked_id?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("admin_tasks").insert({
    ...task,
    priority: task.priority || "medium",
    status: "open",
    created_by: session.user.id,
  });

  if (error) return { ok: false, error: error.message };

  await logPlatformAdminAction({
    action: "create_admin_task",
    targetTable: "admin_tasks",
    metadata: { title: task.title },
  });

  return { ok: true };
}

export async function closeAdminTask(taskId: string) {
  const { error } = await supabase
    .from("admin_tasks")
    .update({ status: "closed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { ok: false, error: error.message };

  await logPlatformAdminAction({
    action: "close_admin_task",
    targetTable: "admin_tasks",
    targetId: taskId,
  });

  return { ok: true };
}

export async function updatePlatformSetting(key: string, value: string, userId: string) {
  const { data: existing } = await supabase
    .from("platform_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("platform_settings")
      .update({ value, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("platform_settings")
      .insert({ key, value, updated_by: userId });
  }

  await logPlatformAdminAction({
    action: `update_setting:${key}`,
    targetTable: "platform_settings",
    targetId: existing?.id,
    metadata: { key, value },
  });
}

export async function runEdgeFunction(functionName: string): Promise<{ ok: boolean; data: any }> {
  try {
    const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    const res = await fetch(funcUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return { ok: res.ok, data: json };
  } catch (e: any) {
    return { ok: false, data: { error: e?.message } };
  }
}

export function exportCsv(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const s = String(val).replace(/"/g, '""');
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}