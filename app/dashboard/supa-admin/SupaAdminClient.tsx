"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { logPlatformAdminAction, fetchAuditLogs } from "@/lib/adminAudit";
import { fetchPlatformKpi } from "@/lib/platformAdmin";
import AdminStatCard from "./components/AdminStatCard";
import AdminDataTable from "./components/AdminDataTable";
import AdminDetailDrawer from "./components/AdminDetailDrawer";
import AdminActionModal from "./components/AdminActionModal";
import AdminAccessDenied from "./components/AdminAccessDenied";
import SiteOwnerQuickStart from "./components/SiteOwnerQuickStart";
import {
  useOverviewKpis,
  useProfiles,
  useLandlords,
  useTenants,
  useContractors,
  useProperties,
  useTenancies,
  useMaintenanceJobs,
  useComplianceItems,
  useComplianceDocuments,
  useDocuments,
  useSignatures,
  useSubscriptions,
  useRentPayments,
  useArrears,
  useN8nAgents,
  useNotifications,
  useMessages,
  useAuditLogs,
  usePlatformSettings,
  useAdminTasks,
  createAdminTask,
  closeAdminTask,
  updatePlatformSetting,
  runEdgeFunction,
  exportCsv,
  roleLabels,
  roleColors,
  statusStyles,
  type OverviewKpi,
} from "./SupaAdminData";

export default function SupaAdminClient({
  activeTab,
  onNavigate,
}: {
  activeTab: string;
  onNavigate: (tab: string) => void;
}) {
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [drawerData, setDrawerData] = useState<any>(null);
  const [drawerMode, setDrawerMode] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmClass?: string;
    onConfirm: () => void;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [auditFilter, setAuditFilter] = useState({ search: "", severity: "" });

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const overview = useOverviewKpis();
  const profilesHook = useProfiles();
  const landlords = useLandlords();
  const tenants = useTenants();
  const contractors = useContractors();
  const properties = useProperties();
  const tenancies = useTenancies();
  const maintenanceJobs = useMaintenanceJobs();
  const complianceItems = useComplianceItems();
  const complianceDocs = useComplianceDocuments();
  const documents = useDocuments();
  const signatures = useSignatures();
  const subscriptions = useSubscriptions();
  const rentPayments = useRentPayments();
  const arrears = useArrears();
  const n8nAgents = useN8nAgents();
  const notifications = useNotifications();
  const messages = useMessages();
  const auditLogs = useAuditLogs();
  const platformSettings = usePlatformSettings();
  const adminTasks = useAdminTasks();

  const [healthData, setHealthData] = useState<Record<string, any>>({});
  const [healthLoading, setHealthLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      setAuthCheckDone(true);
      setIsAdmin(false);
      setCurrentRole("unknown");
    }, 10000);

    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (!session) {
          setIsAdmin(false);
          setCurrentRole("unknown");
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!active) return;

          if (!profile || profile.role !== "platform_admin") {
            setCurrentRole(profile?.role || "unknown");
            setIsAdmin(false);
          } else {
            setIsAdmin(true);
            setCurrentUserId(session.user.id);
          }
        }
      } catch {
        if (!active) return;
        setIsAdmin(false);
        setCurrentRole("unknown");
      }
      if (active) {
        clearTimeout(timer);
        setAuthCheckDone(true);
      }
    };
    check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSuspendUser = async (userId: string, userName: string) => {
    const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/platform-admin-action`;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    try {
      const res = await fetch(funcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "suspend_user", target_id: userId }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(`User ${userName} suspended`);
        profilesHook.reload();
      } else {
        showToast(`Failed: ${json.error || "Unknown error"}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e?.message}`);
    }
    setConfirmModal(null);
  };

  const handleChangeRole = async (userId: string, newRole: string, userName: string) => {
    const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/platform-admin-action`;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    try {
      const res = await fetch(funcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "change_role", target_id: userId, role: newRole }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(`Role changed for ${userName}`);
        profilesHook.reload();
      } else {
        showToast(`Failed: ${json.error || "Unknown error"}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e?.message}`);
    }
    setConfirmModal(null);
    setDrawerData(null);
  };

  const handleSaveSetting = async (key: string, value: string) => {
    await updatePlatformSetting(key, value, currentUserId);
    platformSettings.reload();
    showToast("Setting saved");
  };

  const handleRunEdgeFn = async (fnName: string) => {
    setHealthLoading(true);
    const result = await runEdgeFunction(fnName);
    setHealthData((prev) => ({ ...prev, [fnName]: result }));
    setHealthLoading(false);
    showToast(result.ok ? `${fnName} completed` : `${fnName} failed`);
  };

  const handleRunN8nAgent = async (agentKey: string) => {
    const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/n8n-run-agent`;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    try {
      const res = await fetch(funcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agent_key: agentKey }),
      });
      const json = await res.json();
      showToast(res.ok ? `Agent ${agentKey} triggered` : `Failed: ${json.error || "Unknown"}`);
      n8nAgents.reload();
    } catch (e: any) {
      showToast(`Error: ${e?.message}`);
    }
  };

  const handleExportCsv = (rows: any[], name: string) => {
    exportCsv(rows, name);
    showToast(`Exported ${name}.csv`);
  };

  if (!authCheckDone) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#818CF8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#94A3B8]">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminAccessDenied role={currentRole} />;
  }

  const overviewKpis = overview.data;
  const overviewLoading = overview.loading;

  const kpiCards = overviewKpis
    ? [
        { label: "Total Users", value: overviewKpis.totalUsers.count ?? "—", icon: "ri-group-line", color: "bg-[#6366F1]", change: undefined, changeType: "up" as const, error: overviewKpis.totalUsers.error },
        { label: "Landlords", value: overviewKpis.totalLandlords.count ?? "—", icon: "ri-user-star-line", color: "bg-emerald-500", change: undefined, changeType: "up" as const, error: overviewKpis.totalLandlords.error },
        { label: "Tenants", value: overviewKpis.totalTenants.count ?? "—", icon: "ri-user-3-line", color: "bg-sky-500", change: undefined, changeType: "up" as const, error: overviewKpis.totalTenants.error },
        { label: "Contractors", value: overviewKpis.totalContractors.count ?? "—", icon: "ri-briefcase-line", color: "bg-orange-500", change: undefined, changeType: "up" as const, error: overviewKpis.totalContractors.error },
        { label: "Properties", value: overviewKpis.totalProperties.count ?? "—", icon: "ri-home-4-line", color: "bg-[#3B82F6]", change: undefined, changeType: "up" as const, error: overviewKpis.totalProperties.error },
        { label: "Active Tenancies", value: overviewKpis.activeTenancies.count ?? "—", icon: "ri-file-text-line", color: "bg-[#8B5CF6]", change: undefined, changeType: "up" as const, error: overviewKpis.activeTenancies.error },
        { label: "Open Maintenance", value: overviewKpis.openMaintenanceJobs.count ?? "—", icon: "ri-tools-line", color: "bg-[#F59E0B]", change: undefined, changeType: "down" as const, error: overviewKpis.openMaintenanceJobs.error },
        { label: "Overdue Compliance", value: overviewKpis.overdueCompliance.count ?? "—", icon: "ri-shield-flash-line", color: "bg-[#EF4444]", change: undefined, changeType: "down" as const, error: overviewKpis.overdueCompliance.error },
        { label: "Active Subs", value: overviewKpis.activeSubscriptions.count ?? "—", icon: "ri-vip-crown-line", color: "bg-[#14B8A6]", change: undefined, changeType: "up" as const, error: overviewKpis.activeSubscriptions.error },
        { label: "Unread Notifications", value: overviewKpis.unreadNotifications.count ?? "—", icon: "ri-notification-4-line", color: "bg-purple-500", change: undefined, changeType: "down" as const, error: overviewKpis.unreadNotifications.error },
        { label: "n8n Agents Active", value: overviewKpis.n8nAgentsEnabled.count ?? "—", icon: "ri-cpu-line", color: "bg-[#6366F1]", change: undefined, changeType: "up" as const, error: overviewKpis.n8nAgentsEnabled.error },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">Platform Administration</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Manage users, monitor system health, and configure the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              profilesHook.reload();
              auditLogs.reload();
              platformSettings.reload();
              n8nAgents.reload();
              adminTasks.reload();
              showToast("Data refreshed");
            }}
            className="text-xs text-[#94A3B8] bg-[#1E293B] px-3 py-1.5 rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap"
          >
            <i className="ri-refresh-line mr-1"></i>Refresh
          </button>
          <span className="text-xs text-[#94A3B8] bg-[#1E293B] border border-[#1E293B] px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
            <i className="ri-admin-line mr-1"></i>Platform Admin
          </span>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <SiteOwnerQuickStart overview={overviewKpis} onNavigate={onNavigate} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kpiCards.map((card) => (
              <AdminStatCard key={card.label} {...card} loading={overviewLoading} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <h3 className="font-semibold text-[#E2E8F0] mb-3">Recent Audit Events</h3>
              {auditLogs.loading ? (
                <div className="h-20 bg-[#1E293B] rounded animate-pulse" />
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLogs.data.slice(0, 10).map((a: any) => (
                    <div key={a.id} className="flex items-start gap-2 text-sm border-b border-[#1E293B] pb-2">
                      <span className="text-xs text-[#64748B] whitespace-nowrap">
                        {a.created_at ? new Date(a.created_at).toLocaleString("en-GB") : "—"}
                      </span>
                      <span className="text-[#E2E8F0] font-medium">{a.action}</span>
                      {a.target_table && (
                        <span className="text-xs text-[#94A3B8]">on {a.target_table}</span>
                      )}
                    </div>
                  ))}
                  {!auditLogs.data.length && <p className="text-sm text-[#64748B]">No audit events yet</p>}
                </div>
              )}
            </div>
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
              <h3 className="font-semibold text-[#E2E8F0] mb-3">Administration Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Environment Config", fn: "check-secrets", icon: "ri-key-2-line" },
                  { label: "Stripe Sync", fn: "setup-stripe-products", icon: "ri-price-tag-3-line" },
                  { label: "User Directory", tab: "users", icon: "ri-group-line" },
                  { label: "Audit Trail", tab: "audit", icon: "ri-shield-keyhole-line" },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={() => {
                      if ("fn" in a) handleRunEdgeFn(a.fn as string);
                      else onNavigate(a.tab as string);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 border border-[#1E293B] rounded-lg text-sm text-[#E2E8F0] hover:bg-[#1E293B] transition-colors whitespace-nowrap"
                  >
                    <i className={`${a.icon} text-[#818CF8] text-sm`}></i>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <AdminDataTable
            columns={[
              { key: "full_name", label: "Name", render: (v: string, r: any) => (
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${roleColors[r.role] || "bg-gray-400"}`}>
                    {(v || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#E2E8F0]">{v || "—"}</p>
                    <p className="text-xs text-[#94A3B8]">{r.email}</p>
                  </div>
                </div>
              )},
              { key: "role", label: "Role", render: (v: string) => <span className="text-xs">{roleLabels[v] || v}</span> },
              { key: "account_type", label: "Type", render: (v: string) => <span className="text-xs text-[#94A3B8]">{v || "—"}</span> },
              { key: "created_at", label: "Registered", render: (v: string) => (
                <span className="text-xs text-[#94A3B8]">{v ? new Date(v).toLocaleDateString("en-GB") : "—"}</span>
              )},
              { key: "id", label: "Actions", render: (v: string, r: any) => (
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setDrawerData(r); setDrawerMode("user"); }}
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1E293B]" title="View">
                    <i className="ri-eye-line text-[#94A3B8] text-sm"></i>
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setConfirmModal({
                      title: "Suspend User",
                      message: `Are you sure you want to suspend ${r.full_name}?`,
                      confirmLabel: "Suspend",
                      confirmClass: "bg-[#EF4444] hover:bg-[#DC2626]",
                      onConfirm: () => handleSuspendUser(r.id, r.full_name),
                    });
                  }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1E293B]" title="Suspend">
                    <i className="ri-pause-circle-line text-[#EF4444] text-sm"></i>
                  </button>
                </div>
              )},
            ]}
            rows={profilesHook.profiles}
            searchPlaceholder="Search users by name, email, or role..."
            emptyMessage="No users found"
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("user"); }}
            onExport={() => handleExportCsv(profilesHook.profiles, "users")}
          />
        </div>
      )}

      {/* ENTITIES TAB */}
      {activeTab === "entities" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-[#E2E8F0] text-lg">Landlords ({landlords.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "display_name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "is_company", label: "Company", render: (v: boolean) => v ? "Yes" : "No" },
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={landlords.data}
            searchPlaceholder="Search landlords..."
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("landlord"); }}
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Tenants ({tenants.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "full_name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={tenants.data}
            searchPlaceholder="Search tenants..."
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("tenant"); }}
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Contractors ({contractors.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "business_name", label: "Business" },
              { key: "contact_name", label: "Contact" },
              { key: "trade", label: "Trade" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "rating", label: "Rating" },
            ]}
            rows={contractors.data}
            searchPlaceholder="Search contractors..."
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("contractor"); }}
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Tenancies ({tenancies.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "property_id", label: "Property" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "rent_amount", label: "Rent", render: (v: number) => `£${v?.toLocaleString() || "—"}` },
              { key: "start_date", label: "Start" },
              { key: "end_date", label: "End" },
            ]}
            rows={tenancies.data}
            searchPlaceholder="Search tenancies..."
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("tenancy"); }}
          />
        </div>
      )}

      {/* PROPERTIES TAB */}
      {activeTab === "properties" && (
        <div className="space-y-4">
          <AdminDataTable
            columns={[
              { key: "line1", label: "Address", render: (v: string, r: any) => (
                <div>
                  <p className="text-sm font-medium text-[#E2E8F0]">{v}{r.line2 ? `, ${r.line2}` : ""}</p>
                  <p className="text-xs text-[#94A3B8]">{r.city}, {r.postcode}</p>
                </div>
              )},
              { key: "bedrooms", label: "Beds" },
              { key: "is_hmo", label: "HMO", render: (v: boolean) => v ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Yes</span> : "No" },
              { key: "epc_rating", label: "EPC" },
              { key: "gas_safety_expiry", label: "Gas Safety" },
              { key: "eicr_expiry", label: "EICR" },
              { key: "created_at", label: "Added", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={properties.data}
            searchPlaceholder="Search properties by address..."
            emptyMessage="No properties found"
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("property"); }}
            onExport={() => handleExportCsv(properties.data, "properties")}
          />
        </div>
      )}

      {/* COMPLIANCE TAB */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-[#E2E8F0] text-lg">Compliance Items ({complianceItems.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "property_id", label: "Property" },
              { key: "obligation_type_id", label: "Type" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={complianceItems.data}
            searchPlaceholder="Search compliance items..."
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Compliance Documents ({complianceDocs.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "property_id", label: "Property" },
              { key: "type", label: "Type" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={complianceDocs.data}
            searchPlaceholder="Search compliance documents..."
          />
        </div>
      )}

      {/* MAINTENANCE TAB */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          <AdminDataTable
            columns={[
              { key: "title", label: "Title", render: (v: string) => <span className="text-sm font-medium text-[#E2E8F0]">{v}</span> },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "property_id", label: "Property" },
              { key: "assigned_contractor_profile_id", label: "Contractor" },
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={maintenanceJobs.data}
            searchPlaceholder="Search maintenance jobs..."
            emptyMessage="No maintenance jobs found"
            onRowClick={(r) => { setDrawerData(r); setDrawerMode("maintenance"); }}
            onExport={() => handleExportCsv(maintenanceJobs.data, "maintenance")}
          />
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-[#E2E8F0] text-lg">Documents ({documents.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "name", label: "Name", render: (v: string) => v || "—" },
              { key: "type", label: "Type", render: (v: string) => v || "—" },
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={documents.data}
            searchPlaceholder="Search documents..."
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Signatures ({signatures.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "document_id", label: "Document" },
              { key: "signer_type", label: "Signer Type" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={signatures.data}
            searchPlaceholder="Search signatures..."
          />
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => handleRunEdgeFn("check-secrets")} className="text-sm bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#4F46E5] transition-colors whitespace-nowrap">
              <i className="ri-key-2-line mr-1"></i>Verify Configuration
            </button>
            <button onClick={() => handleRunEdgeFn("setup-stripe-products")} className="text-sm border border-[#818CF8] text-[#818CF8] px-4 py-2 rounded-lg hover:bg-[#6366F1]/20 transition-colors whitespace-nowrap">
              <i className="ri-price-tag-3-line mr-1"></i>Synchronise Stripe Products
            </button>
            <Link href="/dashboard/billing" className="text-sm border border-[#1E293B] text-[#94A3B8] px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap">
              <i className="ri-external-link-line mr-1"></i>Billing Dashboard
            </Link>
          </div>
          {healthData["check-secrets"] && (
            <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
              <h4 className="text-sm font-semibold text-[#E2E8F0] mb-2">Configuration Status</h4>
              <pre className="text-xs text-[#94A3B8] max-h-40 overflow-y-auto bg-[#1E293B] p-3 rounded-lg">
                {JSON.stringify(healthData["check-secrets"].data, null, 2)}
              </pre>
            </div>
          )}
          <AdminDataTable
            columns={[
              { key: "user_id", label: "User" },
              { key: "plan_slug", label: "Plan" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "billing_cycle", label: "Cycle" },
              { key: "current_period_end", label: "Period Ends", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
              { key: "stripe_customer_id", label: "Stripe Customer" },
            ]}
            rows={subscriptions.data}
            searchPlaceholder="Search subscriptions..."
            onExport={() => handleExportCsv(subscriptions.data, "subscriptions")}
          />
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-[#E2E8F0] text-lg">Rent Payments ({rentPayments.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "tenancy_id", label: "Tenancy" },
              { key: "amount", label: "Amount", render: (v: number) => `£${v?.toLocaleString() || "—"}` },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "created_at", label: "Date", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={rentPayments.data}
            searchPlaceholder="Search payments..."
            onExport={() => handleExportCsv(rentPayments.data, "rent-payments")}
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Arrears Cases ({arrears.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "tenancy_id", label: "Tenancy" },
              { key: "status", label: "Status", render: (v: string) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[v] || "bg-gray-100 text-gray-600"}`}>{v}</span>
              )},
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleDateString("en-GB") : "—" },
            ]}
            rows={arrears.data}
            searchPlaceholder="Search arrears..."
          />
        </div>
      )}

      {/* N8N AGENTS TAB */}
      {activeTab === "n8n" && (
        <div className="space-y-4">
          <AdminDataTable
            columns={[
              { key: "agent_name", label: "Name", render: (v: string) => <span className="text-sm font-medium text-[#E2E8F0]">{v}</span> },
              { key: "agent_key", label: "Key" },
              { key: "agent_group", label: "Group" },
              { key: "enabled", label: "Enabled", render: (v: boolean) => v ? (
                <span className="text-xs bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-medium">Yes</span>
              ) : (
                <span className="text-xs bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded-full font-medium">No</span>
              )},
              { key: "last_run_at", label: "Last Run", render: (v: string) => v ? new Date(v).toLocaleString("en-GB") : "—" },
              { key: "status", label: "Status" },
              { key: "agent_key", label: "Actions", render: (v: string) => (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRunN8nAgent(v); }}
                  className="text-xs bg-[#6366F1] text-white px-2.5 py-1 rounded hover:bg-[#4F46E5] transition-colors whitespace-nowrap"
                >
                  <i className="ri-play-line mr-0.5"></i>Run
                </button>
              )},
            ]}
            rows={n8nAgents.data}
            searchPlaceholder="Search agents..."
            emptyMessage="No n8n agents configured"
          />
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-[#E2E8F0] text-lg">Notifications ({notifications.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "title", label: "Title", render: (v: string) => <span className="text-sm font-medium text-[#E2E8F0]">{v}</span> },
              { key: "type", label: "Type" },
              { key: "is_read", label: "Read", render: (v: boolean) => v ? (
                <span className="text-xs text-[#10B981]"><i className="ri-check-line mr-0.5"></i>Yes</span>
              ) : (
                <span className="text-xs text-[#F59E0B]"><i className="ri-time-line mr-0.5"></i>No</span>
              )},
              { key: "created_at", label: "Created", render: (v: string) => v ? new Date(v).toLocaleString("en-GB") : "—" },
            ]}
            rows={notifications.data}
            searchPlaceholder="Search notifications..."
          />
          <h3 className="font-semibold text-[#E2E8F0] text-lg mt-6">Messages ({messages.data.length})</h3>
          <AdminDataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "created_at", label: "Sent", render: (v: string) => v ? new Date(v).toLocaleString("en-GB") : "—" },
            ]}
            rows={messages.data}
            searchPlaceholder="Search messages..."
          />
        </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border border-[#1E293B] rounded-lg bg-[#111827] flex-1 max-w-sm">
              <i className="ri-search-line text-[#64748B] text-sm"></i>
              <input
                type="text"
                value={auditFilter.search}
                onChange={(e) => setAuditFilter((p) => ({ ...p, search: e.target.value }))}
                placeholder="Search audit log..."
                className="flex-1 text-sm text-[#E2E8F0] placeholder:text-[#64748B] outline-none bg-transparent"
              />
            </div>
            <button onClick={() => handleExportCsv(auditLogs.data, "audit-log")} className="text-xs text-[#94A3B8] font-medium px-3 py-2 border border-[#1E293B] rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap">
              <i className="ri-download-line mr-1"></i>Export CSV
            </button>
          </div>
          <AdminDataTable
            columns={[
              { key: "created_at", label: "Timestamp", render: (v: string) => (
                <span className="text-xs text-[#94A3B8] whitespace-nowrap">{v ? new Date(v).toLocaleString("en-GB") : "—"}</span>
              )},
              { key: "action", label: "Action", render: (v: string) => <span className="text-sm font-medium text-[#E2E8F0]">{v}</span> },
              { key: "target_table", label: "Target Table" },
              { key: "actor_profile_id", label: "Actor" },
              { key: "details", label: "Details", render: (v: any) => v ? (
                <span className="text-xs text-[#94A3B8] max-w-40 truncate block">{JSON.stringify(v)}</span>
              ) : "—" },
            ]}
            rows={auditLogs.data.filter((r: any) => {
              if (!auditFilter.search) return true;
              const s = auditFilter.search.toLowerCase();
              return (
                (r.action && r.action.toLowerCase().includes(s)) ||
                (r.target_table && r.target_table.toLowerCase().includes(s)) ||
                (r.details && JSON.stringify(r.details).toLowerCase().includes(s))
              );
            })}
            searchPlaceholder=""
            emptyMessage="No audit entries found"
          />
        </div>
      )}

      {/* SYSTEM HEALTH TAB */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Authentication", icon: "ri-shield-user-line", check: "supabase_auth" },
              { label: "Payment Provider", icon: "ri-bank-card-line", check: "check-secrets" },
              { label: "Automation Engine", icon: "ri-cpu-line", check: "n8n_check" },
              { label: "Edge Functions", icon: "ri-cloud-line", check: "edge_functions" },
            ].map((item) => (
              <div key={item.check} className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#6366F1]/15 rounded-lg flex items-center justify-center">
                    <i className={`${item.icon} text-[#818CF8] text-lg`}></i>
                  </div>
                  {healthData[item.check] ? (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${healthData[item.check].ok ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                      {healthData[item.check].ok ? "Healthy" : "Issue"}
                    </span>
                  ) : (
                    <span className="text-xs text-[#64748B]">Not checked</span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#E2E8F0]">{item.label}</p>
                <button
                  onClick={() => {
                    if (item.check === "supabase_auth") {
                      supabase.auth.getSession().then(({ data }) => {
                        setHealthData((prev) => ({ ...prev, supabase_auth: { ok: !!data.session, data: { has_session: !!data.session } } }));
                      });
                    } else if (item.check === "n8n_check") {
                      fetchPlatformKpi("n8n_agents").then((r) => {
                        setHealthData((prev) => ({ ...prev, n8n_check: { ok: !r.error, data: { count: r.count } } }));
                      });
                    } else if (item.check === "edge_functions") {
                      handleRunEdgeFn("check-secrets").then(() => {
                        setHealthData((prev) => ({ ...prev, edge_functions: { ok: true, data: { checked: true } } }));
                      });
                    } else {
                      handleRunEdgeFn(item.check);
                    }
                  }}
                  className="text-xs text-[#818CF8] font-medium mt-2 hover:underline"
                >
                  Check now
                </button>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
            <h3 className="font-semibold text-[#E2E8F0] mb-3">Diagnostics</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => handleRunEdgeFn("check-secrets")} className="text-sm bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#4F46E5] transition-colors whitespace-nowrap">
                <i className="ri-key-2-line mr-1"></i>Verify Configuration
              </button>
              <button onClick={() => handleRunEdgeFn("setup-stripe-products")} className="text-sm border border-[#818CF8] text-[#818CF8] px-4 py-2 rounded-lg hover:bg-[#6366F1]/20 transition-colors whitespace-nowrap">
                <i className="ri-price-tag-3-line mr-1"></i>Synchronise Stripe Products
              </button>
            </div>
            {Object.keys(healthData).filter((k) => healthData[k]?.data).length > 0 && (
              <pre className="text-xs text-[#94A3B8] max-h-60 overflow-y-auto bg-[#1E293B] p-3 rounded-lg mt-4">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(healthData).filter(([, v]: any) => v?.data).map(([k, v]: any) => [k, v])
                  ),
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* SITE SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
            <h3 className="font-semibold text-[#E2E8F0] mb-4">Platform Settings</h3>
            <div className="space-y-4 max-w-xl">
              {[
                { key: "platform_name", label: "Platform Name", type: "text" },
                { key: "support_email", label: "Support Email", type: "email" },
                { key: "default_currency", label: "Default Currency", type: "text" },
                { key: "timezone", label: "Timezone", type: "text" },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center gap-3">
                  <label className="text-sm text-[#94A3B8] w-36 flex-shrink-0">{setting.label}</label>
                  <input
                    type={setting.type}
                    defaultValue={platformSettings.settings[setting.key] || ""}
                    onBlur={(e) => {
                      if (e.target.value !== platformSettings.settings[setting.key]) {
                        handleSaveSetting(setting.key, e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-[#1E293B] rounded-lg text-sm text-[#E2E8F0] focus:outline-none focus:border-[#818CF8]"
                  />
                </div>
              ))}
              <div className="pt-2 text-xs text-[#64748B]">Changes save on blur. All edits are logged to audit trail.</div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
            <h3 className="font-semibold text-[#E2E8F0] mb-4">Feature Toggles</h3>
            <div className="space-y-3 max-w-xl">
              {[
                "maintenance_mode",
                "registration_enabled",
                "tenant_portal_enabled",
                "contractor_portal_enabled",
                "ai_agents_enabled",
                "stripe_enabled",
                "n8n_enabled",
              ].map((key) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#E2E8F0] capitalize">{key.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">
                      {platformSettings.settings[key] === "true" ? "On" : platformSettings.settings[key] === "false" ? "Off" : "Not set"}
                    </span>
                    <button
                      onClick={() => {
                        const current = platformSettings.settings[key];
                        const next = current === "true" ? "false" : "true";
                        setConfirmModal({
                          title: `Toggle ${key.replace(/_/g, " ")}`,
                          message: `Set "${key}" to ${next}?`,
                          confirmLabel: `Set to ${next}`,
                          confirmClass: "bg-[#6366F1] hover:bg-[#4F46E5]",
                          onConfirm: () => { handleSaveSetting(key, next); setConfirmModal(null); },
                        });
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative ${platformSettings.settings[key] === "true" ? "bg-[#6366F1]" : "bg-[#1E293B]"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${platformSettings.settings[key] === "true" ? "left-[22px]" : "left-0.5"}`}></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#94A3B8]">Open:</span>
                <span className="font-bold text-[#F59E0B]">{adminTasks.data.filter((t: any) => t.status === "open").length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#94A3B8]">Closed:</span>
                <span className="font-bold text-[#10B981]">{adminTasks.data.filter((t: any) => t.status === "closed").length}</span>
              </div>
            </div>
            <button
              onClick={() => {
                const title = prompt("Task title:");
                if (title) {
                  createAdminTask({ title, priority: "medium" }).then((r) => {
                    showToast(r.ok ? "Task created" : "Failed: " + (r as any).error);
                    adminTasks.reload();
                  });
                }
              }}
              className="text-sm bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#4F46E5] transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line mr-1"></i>New Task
            </button>
          </div>
          <div className="space-y-2">
            {adminTasks.data.map((task: any) => (
              <div key={task.id} className={`bg-[#111827] rounded-xl border p-4 flex items-start gap-3 ${task.status === "closed" ? "opacity-60" : ""}`}>
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                  task.priority === "high" ? "bg-[#EF4444]" : task.priority === "medium" ? "bg-[#F59E0B]" : "bg-[#94A3B8]"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === "closed" ? "text-[#64748B] line-through" : "text-[#E2E8F0]"}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      task.status === "open" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#10B981]/10 text-[#10B981]"
                    }`}>
                      {task.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high" ? "bg-[#EF4444]/10 text-[#EF4444]" : task.priority === "medium" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#94A3B8]/10 text-[#64748B]"
                    }`}>
                      {task.priority}
                    </span>
                    {task.source && <span className="text-xs text-[#64748B]">{task.source}</span>}
                    <span className="text-xs text-[#64748B]">{task.created_at ? new Date(task.created_at).toLocaleDateString("en-GB") : ""}</span>
                  </div>
                </div>
                {task.status === "open" && (
                  <button
                    onClick={async () => {
                      const r = await closeAdminTask(task.id);
                      showToast(r.ok ? "Task closed" : "Failed");
                      adminTasks.reload();
                    }}
                    className="text-xs bg-[#10B981] text-white px-2.5 py-1 rounded hover:bg-[#059669] transition-colors whitespace-nowrap"
                  >
                    <i className="ri-check-line mr-0.5"></i>Close
                  </button>
                )}
              </div>
            ))}
            {!adminTasks.loading && adminTasks.data.length === 0 && (
              <div className="text-center py-12 bg-[#111827] rounded-xl border border-[#1E293B]">
                <i className="ri-task-line text-[#64748B] text-2xl"></i>
                <p className="text-sm text-[#94A3B8] mt-2">No admin tasks yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAWERS */}
      <AdminDetailDrawer
        open={!!drawerData}
        onClose={() => setDrawerData(null)}
        title={drawerMode === "user" ? "User Details" : drawerMode === "property" ? "Property Details" : "Record Details"}
      >
        {drawerData && (
          <div className="space-y-3">
            {Object.entries(drawerData).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-1 border-b border-[#1E293B]">
                <span className="text-xs text-[#64748B] capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-sm text-[#E2E8F0] max-w-[60%] text-right break-all">
                  {value === null ? "—" : value === true ? "Yes" : value === false ? "No" : typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
            {drawerMode === "user" && (
              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => setConfirmModal({
                    title: "Change Role",
                    message: `Change ${drawerData.full_name}'s role? Select a new role:`,
                    confirmLabel: "Change to landlord",
                    confirmClass: "bg-emerald-500 hover:bg-emerald-600",
                    onConfirm: () => handleChangeRole(drawerData.id, "landlord", drawerData.full_name),
                  })}
                  className="text-xs bg-[#6366F1] text-white px-3 py-2 rounded-lg hover:bg-[#4F46E5] transition-colors whitespace-nowrap"
                >
                  Change Role
                </button>
                <button
                  onClick={() => setConfirmModal({
                    title: "Suspend User",
                    message: `Suspend ${drawerData.full_name}?`,
                    confirmLabel: "Suspend",
                    confirmClass: "bg-[#EF4444] hover:bg-[#DC2626]",
                    onConfirm: () => handleSuspendUser(drawerData.id, drawerData.full_name),
                  })}
                  className="text-xs border border-[#EF4444] text-[#EF4444] px-3 py-2 rounded-lg hover:bg-[#EF4444]/10 transition-colors whitespace-nowrap"
                >
                  Suspend
                </button>
              </div>
            )}
          </div>
        )}
      </AdminDetailDrawer>

      {/* CONFIRMATION MODAL */}
      <AdminActionModal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        confirmLabel={confirmModal?.confirmLabel || "Confirm"}
        confirmClass={confirmModal?.confirmClass}
        onConfirm={() => confirmModal?.onConfirm?.()}
      />

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#6366F1] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <i className="ri-check-line text-sm"></i>
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}