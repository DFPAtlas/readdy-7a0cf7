"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  N8NAgent,
  N8NAgentRun,
  n8nConfig,
  groupMeta,
  statusConfig,
  runStatusConfig,
  webhookEndpoints,
} from "./N8NData";

export default function N8NIntegrationPage() {
  const [agents, setAgents] = useState<N8NAgent[]>([]);
  const [runs, setRuns] = useState<N8NAgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"workflows" | "runs" | "webhooks" | "config">("workflows");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [logModalAgent, setLogModalAgent] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [agentRes, runRes] = await Promise.all([
        supabase.from("n8n_agents").select("*").order("agent_group", { ascending: true }),
        supabase.from("n8n_agent_runs").select("*").order("started_at", { ascending: false }).limit(50),
      ]);

      if (agentRes.data) setAgents(agentRes.data as N8NAgent[]);
      if (runRes.data) setRuns(runRes.data as N8NAgentRun[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const running = agents.filter((a) => a.status === "running").length;
    const idle = agents.filter((a) => a.status === "idle").length;
    const error = agents.filter((a) => a.status === "error" || a.status === "paused").length;
    const enabled = agents.filter((a) => a.enabled).length;
    const totalRuns = runs.length > 50 ? 50 : runs.length;
    const failedRuns = runs.filter((r) => r.run_status === "failed").length;
    const totalRecords = agents.reduce((s, a) => s + a.records_processed, 0);
    return { running, idle, error, enabled, total: agents.length, totalRuns, failedRuns, totalRecords };
  }, [agents, runs]);

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (filterGroup !== "all" && a.agent_group !== filterGroup) return false;
      if (searchQuery && !a.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [agents, filterGroup, searchQuery]);

  const agentRuns = useMemo(() => {
    if (!logModalAgent) return [];
    return runs.filter((r) => r.agent_id === logModalAgent).slice(0, 8);
  }, [runs, logModalAgent]);

  const handleAgentAction = async (agent: N8NAgent, action: "run" | "pause" | "resume") => {
    let newStatus = agent.status;
    if (action === "run") newStatus = "running";
    else if (action === "pause") newStatus = "paused";
    else if (action === "resume") newStatus = "running";

    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, status: newStatus, last_run_at: action === "run" ? new Date().toISOString() : a.last_run_at } : a))
    );

    setActionFeedback(`${agent.agent_name} ${action === "run" ? "triggered" : action === "pause" ? "paused" : "resumed"} successfully`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const getAgentGroupMeta = (group: string) => groupMeta[group] || { label: group, icon: "ri-cpu-line", color: "#687068", bg: "bg-[#687068]/5" };

  return (
    <div className="space-y-6">
      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-[#C28A78] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-[slideIn_0.3s_ease-out] flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-check-line text-white text-sm"></i>
          </div>
          {actionFeedback}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/integrations" className="text-[#687068] hover:text-[#3A3F3A] transition-colors flex items-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-left-s-line text-sm"></i>
          </div>
          Integrations Hub
        </Link>
        <div className="w-3 h-3 flex items-center justify-center">
          <i className="ri-arrow-right-s-line text-[#94A3B8] text-xs"></i>
        </div>
        <span className="text-[#3A3F3A] font-medium">n8n</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#EA4B71]/10">
            <i className="ri-node-tree text-[#EA4B71] text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">n8n Integration</h1>
            <p className="text-sm text-[#687068] mt-1">First-class workflow automation — {stats.total} agents connected, {stats.enabled} active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full font-medium">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            Connected
          </span>
          <span className="text-xs text-[#94A3B8]">v3.2.1</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Workflows", value: stats.total, icon: "ri-node-tree", color: "#EA4B71" },
          { label: "Running", value: stats.running, icon: "ri-play-circle-line", color: "#10B981" },
          { label: "Idle", value: stats.idle, icon: "ri-pause-circle-line", color: "#94A3B8" },
          { label: "Errors", value: stats.error, icon: "ri-error-warning-line", color: "#EF4444" },
          { label: "Recent Runs", value: stats.totalRuns, icon: "ri-history-line", color: "#3B82F6" },
          { label: "Failed Runs", value: stats.failedRuns, icon: "ri-close-circle-line", color: "#F59E0B" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${kpi.color}15` }}>
              <i className={`${kpi.icon} text-base`} style={{ color: kpi.color }}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-[#3A3F3A]">{kpi.value}</p>
              <p className="text-[10px] text-[#687068]">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1 w-fit">
        {[
          { key: "workflows", label: "Workflows", icon: "ri-node-tree" },
          { key: "runs", label: "Run History", icon: "ri-history-line" },
          { key: "webhooks", label: "Webhooks", icon: "ri-link" },
          { key: "config", label: "Configuration", icon: "ri-settings-4-line" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={`${tab.icon} text-sm`}></i>
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* === WORKFLOWS TAB === */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <button
                onClick={() => setFilterGroup("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer ${filterGroup === "all" ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
              >
                All Groups
              </button>
              {Object.entries(groupMeta).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setFilterGroup(key)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer ${filterGroup === key ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
                >
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className={`${meta.icon} text-[10px]`}></i>
                  </div>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] text-center py-16">
              <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                <i className="ri-node-tree text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No workflows match your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAgents.map((agent) => {
                const meta = getAgentGroupMeta(agent.agent_group);
                const st = statusConfig[agent.status] || statusConfig.idle;
                const isExpanded = expandedAgent === agent.id;
                const lastRunDate = agent.last_run_at ? new Date(agent.last_run_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Never";
                const nextRunDate = agent.next_run_at ? new Date(agent.next_run_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "N/A";

                return (
                  <div key={agent.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden hover:shadow-sm transition-shadow">
                    {/* Row */}
                    <div className="flex items-center gap-4 p-4">
                      {/* Group Badge */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                        <i className={`${meta.icon} text-base`} style={{ color: meta.color }}></i>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[#3A3F3A]">{agent.agent_name}</h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">
                            <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></div>
                            {st.label}
                          </span>
                          {!agent.enabled && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#EF4444]">Disabled</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                          <span className="font-mono text-[10px]">{agent.n8n_workflow_id}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <i className="ri-time-line text-[10px]"></i>
                            </div>
                            {lastRunDate}
                          </span>
                          <span>·</span>
                          <span>{Number(agent.records_processed).toLocaleString()} records</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {agent.status === "running" ? (
                          <button
                            onClick={() => handleAgentAction(agent, "pause")}
                            className="w-8 h-8 rounded-lg bg-[#FEF2F2] flex items-center justify-center cursor-pointer hover:bg-[#FEE2E2] transition-colors"
                            title="Pause"
                          >
                            <i className="ri-pause-circle-line text-[#EF4444] text-sm"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAgentAction(agent, "run")}
                            className="w-8 h-8 rounded-lg bg-[#C28A78]/10 flex items-center justify-center cursor-pointer hover:bg-[#C28A78]/20 transition-colors"
                            title="Run Now"
                          >
                            <i className="ri-play-circle-line text-[#C28A78] text-sm"></i>
                          </button>
                        )}
                        <button
                          onClick={() => setLogModalAgent(logModalAgent === agent.id ? null : agent.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${logModalAgent === agent.id ? "bg-[#3B82F6] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"}`}
                          title="View Logs"
                        >
                          <i className="ri-file-list-3-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                          className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0] transition-colors"
                        >
                          <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-[#94A3B8] text-sm`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[#F1F5F9] pt-4">
                        <p className="text-sm text-[#687068] mb-4">{agent.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Workflow ID</p>
                            <p className="text-xs text-[#3A3F3A] font-mono">{agent.n8n_workflow_id}</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Last Run</p>
                            <p className="text-xs text-[#3A3F3A]">{lastRunDate}</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Next Run</p>
                            <p className="text-xs text-[#3A3F3A]">{nextRunDate}</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Avg Run Time</p>
                            <p className="text-xs text-[#3A3F3A]">{Number(agent.average_run_seconds).toFixed(1)}s</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Records Processed</p>
                            <p className="text-xs text-[#3A3F3A]">{Number(agent.records_processed).toLocaleString()}</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Webhook URL</p>
                            <p className="text-xs text-[#94A3B8] font-mono truncate">{agent.n8n_webhook_url || `https://n8n.lethub.co/webhook/${agent.agent_key}`}</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Group</p>
                            <p className="text-xs text-[#3A3F3A] capitalize">{agent.agent_group}</p>
                          </div>
                          <div className="bg-[#F8FAFC] rounded-lg p-3">
                            <p className="text-[10px] text-[#94A3B8] mb-0.5">Error</p>
                            <p className="text-xs text-[#EF4444]">{agent.last_error_message || "None"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Logs Panel (inline) */}
                    {logModalAgent === agent.id && (
                      <div className="border-t border-[#F1F5F9] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-semibold text-[#3A3F3A] flex items-center gap-2">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-history-line text-[#3B82F6] text-sm"></i>
                            </div>
                            Recent Runs — {agent.agent_name}
                          </h4>
                          <button
                            onClick={() => setLogModalAgent(null)}
                            className="w-6 h-6 rounded flex items-center justify-center cursor-pointer hover:bg-[#F1F5F9]"
                          >
                            <i className="ri-close-line text-[#94A3B8] text-sm"></i>
                          </button>
                        </div>
                        {agentRuns.length === 0 ? (
                          <p className="text-xs text-[#94A3B8] text-center py-4">No runs recorded yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-[280px] overflow-y-auto">
                            {agentRuns.map((run) => {
                              const rSt = runStatusConfig[run.run_status] || runStatusConfig.cancelled;
                              return (
                                <div key={run.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rSt.dot}`}></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-[11px] font-medium ${rSt.text}`}>{rSt.label}</span>
                                      <span className="text-[10px] text-[#94A3B8]">
                                        {new Date(run.started_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                      <span className="text-[10px] text-[#94A3B8]">{Number(run.duration_seconds).toFixed(1)}s</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#94A3B8]">
                                      <span>{run.records_processed} processed</span>
                                      <span>·</span>
                                      <span>{run.records_created} created</span>
                                      <span>·</span>
                                      <span>{run.records_updated} updated</span>
                                    </div>
                                    {run.error_message && (
                                      <p className="text-[10px] text-[#EF4444] mt-1">{run.error_message}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === RUN HISTORY TAB === */}
      {activeTab === "runs" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="divide-y divide-[#F1F5F9] max-h-[640px] overflow-y-auto">
                {runs.map((run) => {
                  const rSt = runStatusConfig[run.run_status] || runStatusConfig.cancelled;
                  const meta = getAgentGroupMeta(run.agent_group || "");
                  return (
                    <div key={run.id} className="p-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={meta.color ? { backgroundColor: `${meta.color}15` } : {}}>
                          <i className={`${meta.icon} text-sm`} style={{ color: meta.color || "#687068" }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#3A3F3A]">{run.agent_name}</span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${rSt.text === "text-[#10B981]" ? "bg-[#10B981]/10" : rSt.text === "text-[#EF4444]" ? "bg-[#EF4444]/10" : "bg-[#F1F5F9]"}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${rSt.dot}`}></div>
                              {rSt.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-[#94A3B8]">
                            <span>{new Date(run.started_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            <span>·</span>
                            <span>{Number(run.duration_seconds).toFixed(1)}s</span>
                            <span>·</span>
                            <span>{run.records_processed} processed ({run.records_created}c / {run.records_updated}u)</span>
                          </div>
                          {run.output_summary && run.run_status === "completed" && (
                            <p className="text-[10px] text-[#10B981] mt-1">{run.output_summary}</p>
                          )}
                          {run.error_message && (
                            <p className="text-[10px] text-[#EF4444] mt-1">{run.error_message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === WEBHOOKS TAB === */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-link text-[#8B5CF6] text-sm"></i>
              </div>
              Webhook Endpoints
            </h3>
            <p className="text-xs text-[#687068] mb-4">These endpoints receive data from n8n workflows. Use them in your n8n HTTP Request or Webhook nodes.</p>
            <div className="space-y-2">
              {webhookEndpoints.map((wh, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-bold text-[#687068] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">{wh.method}</span>
                    <span className="text-sm font-medium text-[#3A3F3A]">{wh.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <code className="text-xs text-[#687068] font-mono bg-white px-2 py-1 rounded border border-[#E2E8F0] max-w-[320px] truncate">
                      {n8nConfig.webhookBaseUrl}{wh.endpoint}
                    </code>
                    <button className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0] transition-colors">
                      <i className="ri-file-copy-line text-[#687068] text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === CONFIG TAB === */}
      {activeTab === "config" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-settings-4-line text-[#EA4B71] text-sm"></i>
              </div>
              n8n Connection Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-[#687068]">n8n Instance URL</label>
                <input
                  type="text"
                  defaultValue={n8nConfig.instanceUrl}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-[#687068]">API Key</label>
                <input
                  type="password"
                  defaultValue={n8nConfig.apiKey}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-[#687068]">Webhook Base URL</label>
                <input
                  type="text"
                  defaultValue={n8nConfig.webhookBaseUrl}
                  className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-[#687068]">Connection Status</label>
                <div className="w-full px-3 py-2 text-sm bg-[#F8FAFC] border border-[#10B981]/30 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span className="text-[#10B981] font-medium">Connected</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#F1F5F9]">
              <button className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#2D6A4F] transition-colors whitespace-nowrap">Test Connection</button>
              <button className="px-4 py-2 bg-[#F1F5F9] text-[#3A3F3A] text-sm font-medium rounded-lg cursor-pointer hover:bg-[#E2E8F0] transition-colors whitespace-nowrap">Save Configuration</button>
              <button className="px-4 py-2 bg-[#FEF2F2] text-[#EF4444] text-sm font-medium rounded-lg cursor-pointer hover:bg-[#FEE2E2] transition-colors whitespace-nowrap">Disconnect n8n</button>
            </div>
          </div>

          {/* Agent Mapping Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-git-branch-line text-[#3B82F6] text-sm"></i>
              </div>
              Agent → Workflow Mapping
            </h3>
            <p className="text-xs text-[#687068] mb-4">Each Lethub agent is mapped to an n8n workflow. Configure mappings below.</p>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {agents.map((agent) => {
                const meta = getAgentGroupMeta(agent.agent_group);
                return (
                  <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                    <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${meta.color}15` }}>
                      <i className={`${meta.icon} text-xs`} style={{ color: meta.color }}></i>
                    </div>
                    <span className="text-xs text-[#3A3F3A] min-w-[140px]">{agent.agent_name}</span>
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-arrow-right-line text-[#94A3B8] text-[10px]"></i>
                    </div>
                    <input
                      type="text"
                      defaultValue={agent.n8n_workflow_id}
                      className="flex-1 px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] font-mono focus:outline-none focus:border-[#C28A78]"
                    />
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConfig[agent.status]?.text === "text-[#10B981]" ? "bg-[#10B981]/10" : "bg-[#F1F5F9]"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[agent.status]?.dot || "bg-[#94A3B8]"}`}></div>
                      {statusConfig[agent.status]?.label || "Idle"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}