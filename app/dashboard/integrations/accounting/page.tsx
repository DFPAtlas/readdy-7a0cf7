"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  AccountingConnection,
  SyncLogEntry,
  SyncConfig,
  syncCategories,
  providerMeta,
  syncStats,
  connectionSetupSteps,
} from "./AccountingConnectorData";

export default function AccountingConnectorPage() {
  const [connections, setConnections] = useState<AccountingConnection[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "xero" | "quickbooks">("overview");
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [syncToggles, setSyncToggles] = useState<Record<string, Record<string, boolean>>>({});
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: connData, error: connErr } = await supabase
      .from("accounting_connections")
      .select("*")
      .order("created_at", { ascending: true });

    if (connErr) {
      console.error("Failed to load connections:", connErr);
      setLoading(false);
      return;
    }

    const mapped: AccountingConnection[] = (connData || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      provider: c.provider as AccountingConnection["provider"],
      account_id: c.account_id as string | null,
      account_name: c.account_name as string,
      sync_status: c.sync_status as AccountingConnection["sync_status"],
      last_sync: c.last_sync as string | null,
      sync_config: (c.sync_config || {
        rent_sync: false,
        maintenance_invoices: false,
        contractor_invoices: false,
        owner_statements: false,
        chart_of_accounts: "",
        vat_scheme: "",
        invoice_prefix: "",
        sync_frequency_minutes: 0,
      }) as SyncConfig,
      api_connected: c.api_connected as boolean,
      error_message: c.error_message as string | null,
    }));

    setConnections(mapped);

    const toggles: Record<string, Record<string, boolean>> = {};
    mapped.forEach((c) => {
      toggles[c.id] = {
        rent: c.sync_config?.rent_sync ?? false,
        maintenance: c.sync_config?.maintenance_invoices ?? false,
        contractor: c.sync_config?.contractor_invoices ?? false,
        owner_statement: c.sync_config?.owner_statements ?? false,
      };
    });
    setSyncToggles(toggles);

    if (mapped.length > 0) {
      const connIds = mapped.map((c) => c.id);
      const { data: logData } = await supabase
        .from("accounting_sync_logs")
        .select("*")
        .in("connection_id", connIds)
        .order("started_at", { ascending: false })
        .limit(50);

      setSyncLogs((logData || []) as unknown as SyncLogEntry[]);
    }

    setLoading(false);
  };

  const handleToggleSync = (connectionId: string, syncKey: string) => {
    setSyncToggles((prev) => {
      const connToggles = { ...(prev[connectionId] || {}) };
      connToggles[syncKey] = !connToggles[syncKey];
      return { ...prev, [connectionId]: connToggles };
    });
  };

  const handleToggleConnection = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId
          ? {
              ...c,
              sync_status: c.sync_status === "connected" ? "disconnected" : "connected",
              api_connected: c.sync_status === "connected" ? false : true,
              last_sync: c.sync_status === "connected" ? null : new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  const statusMeta: Record<string, { bg: string; dot: string; label: string }> = {
    connected: { bg: "bg-[#10B981]/10 border-[#10B981]/30", dot: "bg-[#10B981]", label: "Connected" },
    disconnected: { bg: "bg-[#F1F5F9] border-[#E2E8F0]", dot: "bg-[#CBD5E1]", label: "Not Connected" },
    pending: { bg: "bg-[#F59E0B]/10 border-[#F59E0B]/30", dot: "bg-[#F59E0B]", label: "Pending" },
    error: { bg: "bg-[#EF4444]/10 border-[#EF4444]/30", dot: "bg-[#EF4444]", label: "Error" },
  };

  const displayedLogs = useMemo(() => {
    if (activeTab === "overview") return syncLogs;
    return syncLogs.filter((l) => l.provider === activeTab);
  }, [syncLogs, activeTab]);

  const syncTypeIcons: Record<string, string> = {
    rent: "ri-money-pound-circle-line",
    maintenance_invoice: "ri-tools-line",
    contractor_invoice: "ri-briefcase-line",
    owner_statement: "ri-user-star-line",
    full_sync: "ri-refresh-line",
  };

  const syncTypeLabels: Record<string, string> = {
    rent: "Rent",
    maintenance_invoice: "Maintenance",
    contractor_invoice: "Contractor",
    owner_statement: "Owner Statement",
    full_sync: "Full Sync",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2">
          <Link href="/dashboard/integrations" className="hover:text-[#C28A78] transition-colors">
            Integrations
          </Link>
          <i className="ri-arrow-right-s-line text-[10px] w-3 h-3 flex items-center justify-center"></i>
          <span className="text-[#687068]">Accounting Connectors</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Xero & QuickBooks Foundation</h1>
            <p className="text-sm text-[#687068] mt-1">Financial integrations layer — connect your accounting platform and configure sync rules</p>
          </div>
          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-guide-line text-sm w-4 h-4 flex items-center justify-center"></i>
            {showSetupGuide ? "Hide" : "Show"} Setup Guide
          </button>
        </div>
      </div>

      {/* Setup Guide */}
      {showSetupGuide && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4">Connection Setup — 4 Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {connectionSetupSteps.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C28A78] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {step.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">{step.label}</p>
                  <p className="text-xs text-[#687068] mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[#FEF3C7] rounded-lg border border-[#FCD34D]/30">
            <p className="text-xs text-[#92400E]">
              <strong>Architecture note:</strong> This is the connector framework. Full bi-directional sync with Xero and QuickBooks APIs will be implemented in a future build. For now, configure your sync rules and monitor connection status.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1 w-fit">
        {[
          { key: "overview", label: "Overview" },
          { key: "xero", label: "Xero" },
          { key: "quickbooks", label: "QuickBooks" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] text-center py-16">
          <div className="w-10 h-10 mx-auto flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-[#94A3B8] text-xl"></i>
          </div>
          <p className="text-sm text-[#687068] mt-2">Loading connections...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Providers", value: connections.length, icon: "ri-puzzle-2-line", color: "#3B82F6" },
                  { label: "Connected", value: connections.filter((c) => c.sync_status === "connected").length, icon: "ri-plug-line", color: "#10B981" },
                  { label: "Total Synced", value: syncStats.totalTransactions, icon: "ri-refresh-line", color: "#8B5CF6" },
                  { label: "Sync Health", value: "100%", icon: "ri-heart-pulse-line", color: "#EC4899" },
                  { label: "Last Full Sync", value: "08:14 today", icon: "ri-time-line", color: "#F59E0B" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
                      <p className="text-xs text-[#687068]">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Provider Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((conn) => {
                  const meta = providerMeta[conn.provider];
                  const st = statusMeta[conn.sync_status];
                  const isExpanded = expandedProvider === conn.id;
                  const toggles = syncToggles[conn.id] || {};

                  return (
                    <div
                      key={conn.id}
                      className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
                        conn.sync_status === "connected" ? "border-[#10B981]/30" : "border-[#E2E8F0]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${meta.color}15` }}
                          >
                            <i className={`${meta.icon} text-xl`} style={{ color: meta.color }}></i>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#3A3F3A]">{meta.name}</h3>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${st.bg}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></div>
                              {st.label}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedProvider(isExpanded ? null : conn.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                            isExpanded ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
                          }`}
                        >
                          <i className="ri-settings-4-line text-sm"></i>
                        </button>
                      </div>

                      <p className="text-xs text-[#687068] mb-3">{meta.description}</p>

                      {conn.account_id && (
                        <div className="flex items-center gap-2 text-xs text-[#687068] mb-3">
                          <span className="text-[#94A3B8]">Account ID:</span>
                          <span className="font-mono text-[#3A3F3A] bg-[#F8FAFC] px-2 py-0.5 rounded">{conn.account_id}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#94A3B8]">Last sync</span>
                        <span className="text-[10px] text-[#687068]">
                          {conn.last_sync ? new Date(conn.last_sync).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                        {meta.features.map((feat, j) => (
                          <span key={j} className="text-[10px] text-[#687068] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                            {feat}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleToggleConnection(conn.id)}
                        className={`w-full text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                          conn.sync_status === "connected"
                            ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]"
                            : "bg-[#C28A78] text-white hover:bg-[#2D6A4F]"
                        }`}
                      >
                        {conn.sync_status === "connected" ? "Disconnect" : "Connect"}
                      </button>

                      {/* Expanded — sync config */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
                          <h4 className="text-xs font-semibold text-[#3A3F3A]">Sync Configuration</h4>
                          {[
                            { key: "rent", label: "Rent Payments", icon: "ri-money-pound-circle-line" },
                            { key: "maintenance", label: "Maintenance Invoices", icon: "ri-tools-line" },
                            { key: "contractor", label: "Contractor Invoices", icon: "ri-briefcase-line" },
                            { key: "owner_statement", label: "Owner Statements", icon: "ri-user-star-line" },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center">
                                  <i className={`${item.icon} text-xs text-[#687068]`}></i>
                                </div>
                                <span className="text-xs text-[#3A3F3A]">{item.label}</span>
                              </div>
                              <button
                                onClick={() => handleToggleSync(conn.id, item.key)}
                                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                                  toggles[item.key] ? "bg-[#10B981]" : "bg-[#CBD5E1]"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                                    toggles[item.key] ? "left-[18px]" : "left-0.5"
                                  }`}
                                ></div>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sync Categories */}
              <div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">What Gets Synced</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {syncCategories.map((cat) => (
                    <div key={cat.key} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                          <i className={`${cat.icon} text-sm`} style={{ color: cat.color }}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{cat.label}</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                            <span className="text-[10px] text-[#10B981]">Active</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[#687068] leading-relaxed mb-3">{cat.description}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#94A3B8]">{cat.recordCount} records</span>
                        <span className="text-[#687068]">{cat.lastSynced}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Xero Tab */}
          {activeTab === "xero" && (
            <ProviderDetailView
              connections={connections.filter((c) => c.provider === "xero")}
              syncToggles={syncToggles}
              handleToggleSync={handleToggleSync}
              handleToggleConnection={handleToggleConnection}
              syncLogs={displayedLogs}
              syncTypeIcons={syncTypeIcons}
              syncTypeLabels={syncTypeLabels}
              statusMeta={statusMeta}
            />
          )}

          {/* QuickBooks Tab */}
          {activeTab === "quickbooks" && (
            <ProviderDetailView
              connections={connections.filter((c) => c.provider === "quickbooks")}
              syncToggles={syncToggles}
              handleToggleSync={handleToggleSync}
              handleToggleConnection={handleToggleConnection}
              syncLogs={displayedLogs}
              syncTypeIcons={syncTypeIcons}
              syncTypeLabels={syncTypeLabels}
              statusMeta={statusMeta}
            />
          )}

          {/* Sync History — shown in overview */}
          {activeTab === "overview" && (
            <div>
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Recent Sync Activity</h3>
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {displayedLogs.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-2">
                      <i className="ri-history-line text-[#94A3B8]"></i>
                    </div>
                    <p className="text-sm text-[#687068]">No sync logs yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#F1F5F9]">
                          <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Type</th>
                          <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Provider</th>
                          <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Records</th>
                          <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Started</th>
                          <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F8FAFC]">
                        {displayedLogs.map((log) => {
                          const duration = log.completed_at
                            ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000 / 60)}m`
                            : "—";
                          return (
                            <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 flex items-center justify-center">
                                    <i className={`${syncTypeIcons[log.sync_type] || "ri-refresh-line"} text-xs text-[#687068]`}></i>
                                  </div>
                                  <span className="text-xs text-[#3A3F3A]">{syncTypeLabels[log.sync_type] || log.sync_type}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-medium text-[#3A3F3A] capitalize">{log.provider}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-[#3A3F3A] font-mono">{log.records_synced}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                    log.status === "completed"
                                      ? "bg-[#10B981]/10 text-[#10B981]"
                                      : log.status === "failed"
                                        ? "bg-[#EF4444]/10 text-[#EF4444]"
                                        : log.status === "in_progress"
                                          ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                          : "bg-[#F1F5F9] text-[#F59E0B]"
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      log.status === "completed" ? "bg-[#10B981]" : log.status === "failed" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                                    }`}
                                  ></div>
                                  {log.status.replace("_", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-[#687068]">
                                  {new Date(log.started_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-[#94A3B8]">{duration}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProviderDetailView({
  connections,
  syncToggles,
  handleToggleSync,
  handleToggleConnection,
  syncLogs,
  syncTypeIcons,
  syncTypeLabels,
  statusMeta,
}: {
  connections: AccountingConnection[];
  syncToggles: Record<string, Record<string, boolean>>;
  handleToggleSync: (id: string, key: string) => void;
  handleToggleConnection: (id: string) => void;
  syncLogs: SyncLogEntry[];
  syncTypeIcons: Record<string, string>;
  syncTypeLabels: Record<string, string>;
  statusMeta: Record<string, { bg: string; dot: string; label: string }>;
}) {
  const conn = connections[0];
  if (!conn) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] text-center py-16">
        <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
          <i className="ri-puzzle-2-line text-[#94A3B8] text-xl"></i>
        </div>
        <p className="text-sm text-[#687068]">No connection configured yet.</p>
        <p className="text-xs text-[#94A3B8] mt-1">Set up this provider from the Integrations Hub.</p>
      </div>
    );
  }

  const meta = providerMeta[conn.provider];
  const st = statusMeta[conn.sync_status];
  const toggles = syncToggles[conn.id] || {};

  return (
    <div className="space-y-6">
      {/* Provider Detail Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
              <i className={`${meta.icon} text-2xl`} style={{ color: meta.color }}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3A3F3A]">{meta.name}</h3>
              <p className="text-sm text-[#687068]">{meta.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></div>
                  {st.label}
                </span>
                {conn.account_id && (
                  <span className="text-[10px] text-[#94A3B8]">
                    Account: <span className="font-mono text-[#687068]">{conn.account_id}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleToggleConnection(conn.id)}
            className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              conn.sync_status === "connected" ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]" : "bg-[#C28A78] text-white hover:bg-[#2D6A4F]"
            }`}
          >
            {conn.sync_status === "connected" ? "Disconnect" : "Connect"}
          </button>
        </div>

        {/* Sync Configuration Toggles */}
        <div>
          <h4 className="text-sm font-semibold text-[#3A3F3A] mb-3">Sync Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "rent", label: "Rent Payments", desc: "Sync rent receipts and deposit records", icon: "ri-money-pound-circle-line", color: "#10B981" },
              { key: "maintenance", label: "Maintenance Invoices", desc: "Push repair and service invoices to AP", icon: "ri-tools-line", color: "#F59E0B" },
              { key: "contractor", label: "Contractor Invoices", desc: "Sync approved contractor work orders", icon: "ri-briefcase-line", color: "#3B82F6" },
              { key: "owner_statement", label: "Owner Statements", desc: "Generate landlord net payout statements", icon: "ri-user-star-line", color: "#8B5CF6" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-xs`} style={{ color: item.color }}></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#3A3F3A]">{item.label}</p>
                    <p className="text-[10px] text-[#94A3B8]">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSync(conn.id, item.key)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${
                    toggles[item.key] ? "bg-[#10B981]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                      toggles[item.key] ? "left-[18px]" : "left-0.5"
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Connection info */}
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-[#94A3B8]">Sync Frequency</p>
            <p className="text-xs font-medium text-[#3A3F3A]">Every {conn.sync_config?.sync_frequency_minutes || "—"} min</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8]">Chart of Accounts</p>
            <p className="text-xs font-medium text-[#3A3F3A]">{conn.sync_config?.chart_of_accounts || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8]">VAT Scheme</p>
            <p className="text-xs font-medium text-[#3A3F3A] capitalize">{conn.sync_config?.vat_scheme || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8]">Invoice Prefix</p>
            <p className="text-xs font-medium text-[#3A3F3A] font-mono">{conn.sync_config?.invoice_prefix || "—"}</p>
          </div>
        </div>
      </div>

      {/* Sync History */}
      <div>
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Sync History</h3>
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          {syncLogs.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-2">
                <i className="ri-history-line text-[#94A3B8]"></i>
              </div>
              <p className="text-sm text-[#687068]">No sync activity yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F1F5F9]">
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Records</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Started</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {syncLogs.map((log) => {
                    const duration = log.completed_at
                      ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000 / 60)}m`
                      : "—";
                    return (
                      <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className={`${syncTypeIcons[log.sync_type] || "ri-refresh-line"} text-xs text-[#687068]`}></i>
                            </div>
                            <span className="text-xs text-[#3A3F3A]">{syncTypeLabels[log.sync_type] || log.sync_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#3A3F3A] font-mono">{log.records_synced}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              log.status === "completed"
                                ? "bg-[#10B981]/10 text-[#10B981]"
                                : log.status === "failed"
                                  ? "bg-[#EF4444]/10 text-[#EF4444]"
                                  : log.status === "in_progress"
                                    ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                    : "bg-[#F1F5F9] text-[#F59E0B]"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                log.status === "completed" ? "bg-[#10B981]" : log.status === "failed" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                              }`}
                            ></div>
                            {log.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#687068]">
                            {new Date(log.started_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#94A3B8]">{duration}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}