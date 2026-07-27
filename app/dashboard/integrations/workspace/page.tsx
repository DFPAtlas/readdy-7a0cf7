"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  WorkspaceConnection,
  WorkspaceSyncLogEntry,
  WorkspaceSyncConfig,
  syncCategories,
  providerMeta,
  workspaceStats,
  connectionSetupSteps,
  futureFeatures,
} from "./WorkspaceConnectorData";

export default function WorkspaceConnectorPage() {
  const [connections, setConnections] = useState<WorkspaceConnection[]>([]);
  const [syncLogs, setSyncLogs] = useState<WorkspaceSyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "google" | "microsoft">("overview");
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [syncToggles, setSyncToggles] = useState<Record<string, Record<string, boolean>>>({});
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: connData, error: connErr } = await supabase
      .from("workspace_connections")
      .select("*")
      .order("created_at", { ascending: true });

    if (connErr) {
      console.error("Failed to load connections:", connErr);
      setLoading(false);
      return;
    }

    const mapped: WorkspaceConnection[] = (connData || []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      provider: c.provider as WorkspaceConnection["provider"],
      account_email: c.account_email as string | null,
      account_name: c.account_name as string,
      sync_status: c.sync_status as WorkspaceConnection["sync_status"],
      last_sync: c.last_sync as string | null,
      sync_config: (c.sync_config || {
        calendar_sync: false,
        inspection_appointments: false,
        maintenance_appointments: false,
        document_export: false,
        email_templates: false,
        shared_calendars: [],
        default_reminder_minutes: 30,
        auto_attach_documents: false,
        email_signature: "",
      }) as WorkspaceSyncConfig,
      api_connected: c.api_connected as boolean,
      error_message: c.error_message as string | null,
    }));

    setConnections(mapped);

    const toggles: Record<string, Record<string, boolean>> = {};
    mapped.forEach((c) => {
      toggles[c.id] = {
        calendar: c.sync_config?.calendar_sync ?? false,
        inspection: c.sync_config?.inspection_appointments ?? false,
        maintenance: c.sync_config?.maintenance_appointments ?? false,
        document: c.sync_config?.document_export ?? false,
        email: c.sync_config?.email_templates ?? false,
      };
    });
    setSyncToggles(toggles);

    if (mapped.length > 0) {
      const connIds = mapped.map((c) => c.id);
      const { data: logData } = await supabase
        .from("workspace_sync_logs")
        .select("*")
        .in("connection_id", connIds)
        .order("started_at", { ascending: false })
        .limit(50);

      setSyncLogs((logData || []) as unknown as WorkspaceSyncLogEntry[]);
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
    calendar: "ri-calendar-line",
    inspection_appointment: "ri-search-eye-line",
    maintenance_appointment: "ri-tools-line",
    document_export: "ri-file-copy-line",
    email_template: "ri-mail-send-line",
    full_sync: "ri-refresh-line",
  };

  const syncTypeLabels: Record<string, string> = {
    calendar: "Calendar",
    inspection_appointment: "Inspection",
    maintenance_appointment: "Maintenance",
    document_export: "Documents",
    email_template: "Email Template",
    full_sync: "Full Sync",
  };

  const syncTypeColors: Record<string, string> = {
    calendar: "#4285F4",
    inspection_appointment: "#10B981",
    maintenance_appointment: "#F59E0B",
    document_export: "#EC4899",
    email_template: "#8B5CF6",
    full_sync: "#687068",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2">
          <Link href="/dashboard/integrations" className="hover:text-[#C28A78] transition-colors">
            Integrations
          </Link>
          <div className="w-3 h-3 flex items-center justify-center">
            <i className="ri-arrow-right-s-line text-[10px]"></i>
          </div>
          <span className="text-[#687068]">Workspace Connectors</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Google & Microsoft Workspace Foundation</h1>
            <p className="text-sm text-[#687068] mt-1">Productivity integrations layer — connect your workspace platform and sync calendars, appointments, documents, and email templates</p>
          </div>
          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors whitespace-nowrap cursor-pointer"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-guide-line text-sm"></i>
            </div>
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
          <div className="mt-4 p-3 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE]/30">
            <p className="text-xs text-[#1E40AF]">
              <strong>Architecture note:</strong> This is the connector framework. Full bi-directional sync with Google Workspace and Microsoft 365 APIs will be implemented in a future build. For now, configure your sync rules and monitor connection status.
            </p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1 w-fit">
        {[
          { key: "overview", label: "Overview" },
          { key: "google", label: "Google Workspace" },
          { key: "microsoft", label: "Microsoft 365" },
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
          <p className="text-sm text-[#687068] mt-2">Loading workspace connections...</p>
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
                  { label: "Total Synced", value: workspaceStats.totalSyncedRecords, icon: "ri-refresh-line", color: "#8B5CF6" },
                  { label: "Calendar Events", value: workspaceStats.calendarEvents, icon: "ri-calendar-line", color: "#4285F4" },
                  { label: "Last Full Sync", value: "07:00 today", icon: "ri-time-line", color: "#F59E0B" },
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

                      {conn.account_email && (
                        <div className="flex items-center gap-2 text-xs text-[#687068] mb-3">
                          <span className="text-[#94A3B8]">Account:</span>
                          <span className="font-mono text-[#3A3F3A] bg-[#F8FAFC] px-2 py-0.5 rounded">{conn.account_email}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#94A3B8]">Last sync</span>
                        <span className="text-[10px] text-[#687068]">
                          {conn.last_sync
                            ? new Date(conn.last_sync).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "Never"}
                        </span>
                      </div>

                      {/* Shared Calendars */}
                      {conn.sync_config?.shared_calendars && conn.sync_config.shared_calendars.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                          {conn.sync_config.shared_calendars.map((cal, j) => (
                            <span key={j} className="text-[10px] text-[#687068] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                              {cal}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Features */}
                      {!conn.sync_config?.shared_calendars?.length && (
                        <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                          {meta.features.map((feat, j) => (
                            <span key={j} className="text-[10px] text-[#687068] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}

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
                            { key: "calendar", label: "Calendar Sync", icon: "ri-calendar-line" },
                            { key: "inspection", label: "Inspection Appointments", icon: "ri-search-eye-line" },
                            { key: "maintenance", label: "Maintenance Appointments", icon: "ri-tools-line" },
                            { key: "document", label: "Document Export", icon: "ri-file-copy-line" },
                            { key: "email", label: "Email Templates", icon: "ri-mail-send-line" },
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
                          {conn.sync_config?.default_reminder_minutes && (
                            <div className="flex items-center justify-between py-2 px-3 bg-[#F8FAFC] rounded-lg">
                              <span className="text-xs text-[#687068]">Default reminder</span>
                              <span className="text-xs font-medium text-[#3A3F3A]">{conn.sync_config.default_reminder_minutes} min before</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sync Categories */}
              <div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">What Gets Synced</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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

              {/* Future Features */}
              <div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Future-Ready Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {futureFeatures.map((feat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-dashed border-[#CBD5E1] p-4 text-center hover:border-[#4285F4]/50 transition-colors">
                      <div className="w-9 h-9 mx-auto rounded-lg bg-[#F1F5F9] flex items-center justify-center mb-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${feat.icon} text-sm text-[#94A3B8]`}></i>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-[#3A3F3A]">{feat.name}</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1 leading-relaxed">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync History */}
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
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Details</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Started</th>
                            <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8FAFC]">
                          {displayedLogs.map((log) => {
                            const duration = log.completed_at
                              ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000 / 60)}m`
                              : "—";
                            const sc = syncTypeColors[log.sync_type] || "#687068";
                            return (
                              <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <i className={`${syncTypeIcons[log.sync_type] || "ri-refresh-line"} text-xs`} style={{ color: sc }}></i>
                                    </div>
                                    <span className="text-xs text-[#3A3F3A]">{syncTypeLabels[log.sync_type] || log.sync_type}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs font-medium text-[#3A3F3A] capitalize">{log.provider === "google" ? "Google" : "Microsoft"}</span>
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
                                <td className="px-4 py-3 max-w-xs">
                                  <span className="text-xs text-[#687068] truncate block">{log.details || "—"}</span>
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
            </>
          )}

          {/* Google Tab */}
          {activeTab === "google" && (
            <WorkspaceProviderDetail
              connections={connections.filter((c) => c.provider === "google")}
              syncToggles={syncToggles}
              handleToggleSync={handleToggleSync}
              handleToggleConnection={handleToggleConnection}
              syncLogs={displayedLogs}
              syncTypeIcons={syncTypeIcons}
              syncTypeLabels={syncTypeLabels}
              syncTypeColors={syncTypeColors}
              statusMeta={statusMeta}
            />
          )}

          {/* Microsoft Tab */}
          {activeTab === "microsoft" && (
            <WorkspaceProviderDetail
              connections={connections.filter((c) => c.provider === "microsoft")}
              syncToggles={syncToggles}
              handleToggleSync={handleToggleSync}
              handleToggleConnection={handleToggleConnection}
              syncLogs={displayedLogs}
              syncTypeIcons={syncTypeIcons}
              syncTypeLabels={syncTypeLabels}
              syncTypeColors={syncTypeColors}
              statusMeta={statusMeta}
            />
          )}
        </>
      )}
    </div>
  );
}

function WorkspaceProviderDetail({
  connections,
  syncToggles,
  handleToggleSync,
  handleToggleConnection,
  syncLogs,
  syncTypeIcons,
  syncTypeLabels,
  syncTypeColors,
  statusMeta,
}: {
  connections: WorkspaceConnection[];
  syncToggles: Record<string, Record<string, boolean>>;
  handleToggleSync: (id: string, key: string) => void;
  handleToggleConnection: (id: string) => void;
  syncLogs: WorkspaceSyncLogEntry[];
  syncTypeIcons: Record<string, string>;
  syncTypeLabels: Record<string, string>;
  syncTypeColors: Record<string, string>;
  statusMeta: Record<string, { bg: string; dot: string; label: string }>;
}) {
  const conn = connections[0];
  if (!conn) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] text-center py-16">
        <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
          <i className="ri-puzzle-2-line text-[#94A3B8] text-xl"></i>
        </div>
        <p className="text-sm text-[#687068]">No workspace connection configured yet.</p>
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
                {conn.account_email && (
                  <span className="text-[10px] text-[#94A3B8]">
                    Account: <span className="font-mono text-[#687068]">{conn.account_email}</span>
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
              { key: "calendar", label: "Calendar Sync", desc: "Sync property viewings, key dates and team schedules", icon: "ri-calendar-line", color: "#4285F4" },
              { key: "inspection", label: "Inspection Appointments", desc: "Push inspection and compliance bookings to calendar", icon: "ri-search-eye-line", color: "#10B981" },
              { key: "maintenance", label: "Maintenance Appointments", desc: "Sync maintenance visits and contractor slots", icon: "ri-tools-line", color: "#F59E0B" },
              { key: "document", label: "Document Export", desc: "Auto-export certificates and reports to Drive/SharePoint", icon: "ri-file-copy-line", color: "#EC4899" },
              { key: "email", label: "Email Templates", desc: "Sync branded templates for tenant communications", icon: "ri-mail-send-line", color: "#8B5CF6" },
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

        {/* Services enabled + shared calendars */}
        <div className="mt-4 pt-4 border-t border-[#F1F5F9] grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-[#94A3B8]">Default Reminder</p>
            <p className="text-xs font-medium text-[#3A3F3A]">{conn.sync_config?.default_reminder_minutes || "—"} min before</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8]">Auto-Attach Docs</p>
            <p className="text-xs font-medium text-[#3A3F3A]">{conn.sync_config?.auto_attach_documents ? "Enabled" : "Disabled"}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8]">Email Signature</p>
            <p className="text-xs font-medium text-[#3A3F3A] truncate max-w-[180px]">{conn.sync_config?.email_signature || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8]">Shared Calendars</p>
            <p className="text-xs font-medium text-[#3A3F3A]">{conn.sync_config?.shared_calendars?.length || 0} calendars</p>
          </div>
        </div>

        {/* Shared Calendars list */}
        {conn.sync_config?.shared_calendars && conn.sync_config.shared_calendars.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
            <p className="text-[10px] text-[#94A3B8] mb-2">Connected Calendars</p>
            <div className="flex flex-wrap gap-2">
              {conn.sync_config.shared_calendars.map((cal, i) => (
                <span key={i} className="text-[10px] text-[#3A3F3A] bg-[#F0F7FF] px-3 py-1 rounded-full border border-[#BFDBFE]/50 font-medium">
                  {cal}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connected Services */}
      <div>
        <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Connected Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {conn.provider === "google" ? (
            <>
              {[
                { name: "Google Calendar", enabled: conn.sync_config?.gcal_enabled ?? false, icon: "ri-calendar-line", color: "#4285F4" },
                { name: "Gmail", enabled: conn.sync_config?.gmail_enabled ?? false, icon: "ri-mail-line", color: "#EA4335" },
                { name: "Google Drive", enabled: conn.sync_config?.gdrive_enabled ?? false, icon: "ri-hard-drive-2-line", color: "#0F9D58" },
                { name: "Google Meet", enabled: true, icon: "ri-vidicon-line", color: "#00AC47" },
              ].map((svc, i) => (
                <div key={i} className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${svc.enabled ? "border-[#10B981]/30" : "border-[#E2E8F0]"}`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${svc.color}15` }}>
                    <i className={`${svc.icon} text-sm`} style={{ color: svc.color }}></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#3A3F3A]">{svc.name}</p>
                    <span className={`text-[10px] ${svc.enabled ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                      {svc.enabled ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { name: "Outlook Calendar", enabled: conn.sync_config?.outlook_calendar ?? false, icon: "ri-calendar-line", color: "#0078D4" },
                { name: "Outlook Mail", enabled: conn.sync_config?.outlook_mail ?? false, icon: "ri-mail-line", color: "#0078D4" },
                { name: "SharePoint", enabled: conn.sync_config?.sharepoint_enabled ?? false, icon: "ri-folder-line", color: "#0078D4" },
                { name: "Teams", enabled: false, icon: "ri-microsoft-line", color: "#6264A7" },
              ].map((svc, i) => (
                <div key={i} className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${svc.enabled ? "border-[#10B981]/30" : "border-[#E2E8F0]"}`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${svc.color}15` }}>
                    <i className={`${svc.icon} text-sm`} style={{ color: svc.color }}></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#3A3F3A]">{svc.name}</p>
                    <span className={`text-[10px] ${svc.enabled ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                      {svc.enabled ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
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
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Details</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Started</th>
                    <th className="text-left px-4 py-3 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {syncLogs.map((log) => {
                    const duration = log.completed_at
                      ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000 / 60)}m`
                      : "—";
                    const sc = syncTypeColors[log.sync_type] || "#687068";
                    return (
                      <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <i className={`${syncTypeIcons[log.sync_type] || "ri-refresh-line"} text-xs`} style={{ color: sc }}></i>
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
                        <td className="px-4 py-3 max-w-xs">
                          <span className="text-xs text-[#687068] truncate block">{log.details || "—"}</span>
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