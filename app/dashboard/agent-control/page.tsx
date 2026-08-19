"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeSubscription } from "@/lib/realtime/useRealtimeSubscription";
import {
  agentGroupMeta,
  statusConfig,
  formatTimeAgo,
  groupOrder,
  EDGE_FUNCTION_URL,
} from "./AgentControlData";
import type { N8nAgent, N8nAgentRun } from "./AgentControlData";

export default function AgentControlPage() {
  const [agents, setAgents] = useState<N8nAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groupOrder)
  );
  const [showLogsFor, setShowLogsFor] = useState<N8nAgent | null>(null);
  const [agentRuns, setAgentRuns] = useState<N8nAgentRun[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const fetchAgents = useCallback(async () => {
    const { data, error } = await supabase
      .from("n8n_agents")
      .select("*")
      .order("agent_group", { ascending: true })
      .order("agent_name", { ascending: true });

    if (!error && data) setAgents(data as N8nAgent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useRealtimeSubscription({
    table: "n8n_agents",
    event: "*",
    onChange: fetchAgents,
    channelName: "rt-n8n-agents",
    debounceMs: 500,
  });

  useRealtimeSubscription({
    table: "n8n_agent_runs",
    event: "INSERT",
    onChange: fetchAgents,
    channelName: "rt-n8n-runs",
    debounceMs: 500,
  });

  const groupedAgents: Record<string, N8nAgent[]> = {};
  agents.forEach(a => {
    if (!groupedAgents[a.agent_group]) groupedAgents[a.agent_group] = [];
    groupedAgents[a.agent_group].push(a);
  });

  const totalAgents = agents.length;
  const runningCount = agents.filter(a => a.status === "running").length;
  const healthyCount = agents.filter(a => a.status === "healthy" || (a.status === "idle" && a.enabled)).length;
  const errorCount = agents.filter(a => a.status === "error").length;
  const disabledCount = agents.filter(a => !a.enabled).length;
  const totalRecordsToday = agents.reduce((sum, a) => sum + a.records_processed, 0);
  const actionsToday = agents.filter(a => {
    if (!a.last_run_at) return false;
    const runDate = new Date(a.last_run_at);
    const today = new Date();
    return runDate.toDateString() === today.toDateString();
  }).length;

  const toggleGroup = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setExpandedGroups(next);
  };

  const handleRunNow = async (agent: N8nAgent) => {
    setActionLoading(agent.agent_key);

    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || null;

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token || ""}`,
        },
        body: JSON.stringify({
          agent_key: agent.agent_key,
          account_id: null,
          triggered_by_user_id: userId,
          source: "lethub_agent_control",
        }),
      });

      const result = await res.json();

      if (result.success) {
        setToast(`${agent.agent_name} triggered successfully`);
        fetchAgents();
      } else {
        setToast(`Error: ${result.error || "Unknown error"}`);
      }
    } catch {
      setToast("Failed to reach agent runner");
    }

    setActionLoading(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleToggleEnabled = async (agent: N8nAgent) => {
    setActionLoading(agent.agent_key);

    const newEnabled = !agent.enabled;
    const newStatus = newEnabled ? (agent.status === "disabled" ? "idle" : agent.status) : "disabled";

    const { error } = await supabase
      .from("n8n_agents")
      .update({
        enabled: newEnabled,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agent.id);

    if (!error) {
      setToast(newEnabled ? `${agent.agent_name} resumed` : `${agent.agent_name} paused`);
      fetchAgents();
    } else {
      setToast("Failed to update agent status");
    }

    setActionLoading(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleViewLogs = async (agent: N8nAgent) => {
    setShowLogsFor(agent);
    setLogsLoading(true);

    const { data, error } = await supabase
      .from("n8n_agent_runs")
      .select("*")
      .eq("agent_key", agent.agent_key)
      .order("started_at", { ascending: false })
      .limit(50);

    if (!error && data) setAgentRuns(data as N8nAgentRun[]);
    else setAgentRuns([]);

    setLogsLoading(false);
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Agent Control</h1>
            <p className="text-sm text-[#687068] mt-1">
              Monitor and control your n8n agent workforce — all agents run in n8n, this is the control and reporting layer
            </p>
          </div>
          <button
            onClick={fetchAgents}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#3A3F3A] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-refresh-line text-sm"></i>
            Refresh
          </button>
        </div>

        {/* Dashboard KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-robot-2-line text-[#C28A78] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Total Agents</p>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{totalAgents}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#3B82F6]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-play-circle-line text-[#3B82F6] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Running</p>
            </div>
            <p className="text-2xl font-bold text-[#3B82F6]">{runningCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#7A9A7E]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
                <i className="ri-heart-pulse-line text-[#7A9A7E] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Healthy</p>
            </div>
            <p className="text-2xl font-bold text-[#7A9A7E]">{healthyCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#C46868]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#C46868]/10 rounded-lg flex items-center justify-center">
                <i className="ri-error-warning-line text-[#C46868] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Error</p>
            </div>
            <p className="text-2xl font-bold text-[#C46868]">{errorCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#78716C]/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#78716C]/10 rounded-lg flex items-center justify-center">
                <i className="ri-pause-circle-line text-[#78716C] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Disabled</p>
            </div>
            <p className="text-2xl font-bold text-[#78716C]">{disabledCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                <i className="ri-flashlight-line text-[#687068] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Actions Today</p>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{actionsToday}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                <i className="ri-database-2-line text-[#687068] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Records Today</p>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{totalRecordsToday.toLocaleString()}</p>
          </div>
        </div>

        {/* n8n Integration Note */}
        <div className="bg-[#FEF3C7]/30 border border-[#F59E0B]/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-information-line text-[#F59E0B] text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-[#92400E]">n8n Integration</p>
            <p className="text-xs text-[#A16207] mt-0.5">
              All agents run in n8n. This dashboard is the control and reporting layer. n8n workflows must check the <code className="bg-[#F59E0B]/10 px-1.5 py-0.5 rounded text-[#92400E] text-[11px]">enabled</code> flag before executing. Agent business logic lives in n8n — nothing is duplicated here.
            </p>
          </div>
        </div>

        {/* Agent Groups */}
        <div className="space-y-4">
          {groupOrder.map(group => {
            const groupAgents = groupedAgents[group];
            if (!groupAgents || groupAgents.length === 0) return null;

            const meta = agentGroupMeta[group];
            const expanded = expandedGroups.has(group);
            const groupRunning = groupAgents.filter(a => a.status === "running").length;
            const groupErrors = groupAgents.filter(a => a.status === "error").length;
            const groupTotal = groupAgents.length;

            return (
              <div key={group} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FBFCFD] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg}`}>
                      <i className={`${meta.icon} ${meta.color} text-lg`}></i>
                    </div>
                    <div className="text-left">
                      <h2 className="text-sm font-semibold text-[#3A3F3A]">{meta.label}</h2>
                      <p className="text-xs text-[#94A3B8]">
                        {groupTotal} agent{groupTotal !== 1 ? "s" : ""}
                        {" · "}
                        {groupRunning} running
                        {groupErrors > 0 && ` · ${groupErrors} error${groupErrors !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                    <i className={expanded ? "ri-arrow-up-s-line text-[#94A3B8] text-sm" : "ri-arrow-down-s-line text-[#94A3B8] text-sm"}></i>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-[#D5D9D5]">
                    <div className="p-4 space-y-3">
                      {groupAgents.map(agent => {
                        const st = statusConfig[agent.status] || statusConfig.idle;
                        const effectiveStatus = !agent.enabled ? "disabled" : agent.status;
                        const effSt = statusConfig[effectiveStatus] || statusConfig.idle;

                        return (
                          <div
                            key={agent.id}
                            className={`border rounded-xl p-4 hover:shadow-sm transition-all ${
                              !agent.enabled ? "border-[#D5D9D5] bg-[#FBF9F4] opacity-70" :
                              agent.status === "error" ? "border-[#C46868]/20" :
                              "border-[#D5D9D5] hover:border-[#C28A78]/20"
                            }`}
                          >
                            {/* Top row: name + status + enabled */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!agent.enabled ? "bg-[#F1F5F9]" : "bg-[#F1F5F9]"}`}>
                                  <i className={`${agentGroupMeta[agent.agent_group]?.icon || "ri-robot-2-line"} text-[#3A3F3A] text-lg`}></i>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{agent.agent_name}</h3>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${effSt.bg} ${effSt.color}`}>
                                      {effSt.label}
                                    </span>
                                    {!agent.enabled && (
                                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#78716C]/10 text-[#78716C] flex-shrink-0">
                                        Disabled
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">{agent.description}</p>
                                </div>
                              </div>
                            </div>

                            {/* Metrics row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Last Run</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">{formatTimeAgo(agent.last_run_at)}</p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Next Run</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">
                                  {!agent.enabled ? "Paused" : agent.next_run_at ? formatTimeAgo(agent.next_run_at) : "On-demand"}
                                </p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Records</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">{agent.records_processed.toLocaleString()}</p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Avg Runtime</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">
                                  {agent.average_run_seconds ? `${agent.average_run_seconds}s` : "N/A"}
                                </p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Last Error</p>
                                <p className={`text-xs font-medium ${agent.last_error_message ? "text-[#C46868]" : "text-[#94A3B8]"}`}>
                                  {agent.last_error_message ? agent.last_error_message.slice(0, 40) + "..." : "None"}
                                </p>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleRunNow(agent)}
                                disabled={actionLoading === agent.agent_key || !agent.enabled}
                                className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === agent.agent_key ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></span>
                                    Running...
                                  </span>
                                ) : (
                                  <>
                                    <i className="ri-play-line text-xs mr-1"></i>
                                    Run Now
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleViewLogs(agent)}
                                className="px-3 py-1.5 bg-[#F1F5F9] text-[#687068] rounded-lg text-xs font-medium hover:bg-[#D5D9D5] transition-colors whitespace-nowrap cursor-pointer"
                              >
                                <i className="ri-file-list-3-line text-xs mr-1"></i>
                                View Logs
                              </button>
                              <button
                                onClick={() => handleToggleEnabled(agent)}
                                disabled={actionLoading === agent.agent_key}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  agent.enabled
                                    ? "bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20"
                                    : "bg-[#7A9A7E]/10 text-[#7A9A7E] hover:bg-[#7A9A7E]/20"
                                }`}
                              >
                                <i className={`${agent.enabled ? "ri-pause-line" : "ri-play-line"} text-xs mr-1`}></i>
                                {agent.enabled ? "Pause" : "Resume"}
                              </button>
                              {agent.status === "running" && agent.enabled && (
                                <span className="flex items-center gap-1 text-[10px] text-[#3B82F6] font-medium ml-auto">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse"></span>
                                  Live
                                </span>
                              )}
                              {agent.status === "error" && agent.enabled && (
                                <span className="flex items-center gap-1 text-[10px] text-[#C46868] font-medium ml-auto">
                                  <i className="ri-error-warning-line text-xs"></i>
                                  Needs attention
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* n8n Note Footer */}
        <div className="bg-[#FBF9F4] border border-[#D5D9D5] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#D5D9D5] rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-git-branch-line text-[#687068] text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3A3F3A]">For n8n Workflow Developers</p>
              <p className="text-xs text-[#687068] mt-0.5 leading-relaxed">
                Every n8n workflow must: (1) Check <code className="bg-[#D5D9D5] px-1 py-0.5 rounded text-[#3A3F3A] text-[11px]">n8n_agents.enabled</code> before executing,
                (2) Insert a run row into <code className="bg-[#D5D9D5] px-1 py-0.5 rounded text-[#3A3F3A] text-[11px]">n8n_agent_runs</code>,
                (3) Update <code className="bg-[#D5D9D5] px-1 py-0.5 rounded text-[#3A3F3A] text-[11px]">n8n_agents.last_run_at</code>,
                (4) Update success/error status with <code className="bg-[#D5D9D5] px-1 py-0.5 rounded text-[#3A3F3A] text-[11px]">output_summary</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-bounce">
          <div className="flex items-center gap-2">
            <i className={`${toast.startsWith("Error") || toast.startsWith("Failed") ? "ri-close-circle-line text-[#C46868]" : "ri-check-line text-[#7A9A7E]"}`}></i>
            {toast}
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLogsFor(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                  <i className={`${agentGroupMeta[showLogsFor.agent_group]?.icon || "ri-robot-2-line"} text-[#3A3F3A] text-base`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">{showLogsFor.agent_name} — Run History</h3>
                  <p className="text-xs text-[#94A3B8]">Last 50 runs from n8n_agent_runs</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogsFor(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : agentRuns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-file-list-3-line text-[#94A3B8] text-lg"></i>
                  </div>
                  <p className="text-sm text-[#94A3B8]">No run history yet</p>
                  <p className="text-xs text-[#CBD5E1] mt-1">Run the agent to see logs here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentRuns.map(run => (
                    <div
                      key={run.id}
                      className={`border rounded-xl p-4 ${
                        run.run_status === "failed" ? "border-[#C46868]/20 bg-[#FEF2F2]" :
                        run.run_status === "completed" ? "border-[#D5D9D5]" :
                        "border-[#F59E0B]/20 bg-[#FFFBEB]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            run.run_status === "completed" ? "bg-[#7A9A7E]" :
                            run.run_status === "failed" ? "bg-[#C46868]" :
                            "bg-[#F59E0B]"
                          }`}></span>
                          <span className={`text-xs font-medium ${
                            run.run_status === "completed" ? "text-[#7A9A7E]" :
                            run.run_status === "failed" ? "text-[#C46868]" :
                            "text-[#F59E0B]"
                          }`}>
                            {run.run_status === "completed" ? "Completed" :
                             run.run_status === "failed" ? "Failed" :
                             run.run_status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(run.started_at).toLocaleString("en-GB", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mb-2">
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Duration</p>
                          <p className="text-xs font-medium text-[#3A3F3A]">
                            {run.duration_seconds ? `${run.duration_seconds}s` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Processed</p>
                          <p className="text-xs font-medium text-[#3A3F3A]">{run.records_processed}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Created</p>
                          <p className="text-xs font-medium text-[#7A9A7E]">{run.records_created}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Updated</p>
                          <p className="text-xs font-medium text-[#3B82F6]">{run.records_updated}</p>
                        </div>
                      </div>

                      {run.error_message && (
                        <div className="bg-[#FEF2F2] border border-[#C46868]/20 rounded-lg p-2.5 mb-2">
                          <p className="text-[10px] text-[#C46868] font-medium mb-0.5">Error</p>
                          <p className="text-xs text-[#991B1B]">{run.error_message}</p>
                        </div>
                      )}

                      {run.output_summary && (
                        <div className="bg-[#F0FDF4] border border-[#7A9A7E]/20 rounded-lg p-2.5">
                          <p className="text-[10px] text-[#7A9A7E] font-medium mb-0.5">Output</p>
                          <p className="text-xs text-[#065F46]">{run.output_summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#D5D9D5]">
              <button
                onClick={() => setShowLogsFor(null)}
                className="w-full py-2.5 border border-[#D5D9D5] text-[#687068] rounded-lg text-sm font-medium hover:bg-[#FBF9F4] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}