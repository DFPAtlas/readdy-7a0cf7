"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import AgentLogModal from "./AgentLogModal";
import AgentOutputModal from "./AgentOutputModal";
import {
  agents,
  agentGroups,
  dashboardStats,
  statusConfig,
  getAgentsByGroup,
  getGroupSummary,
} from "./AgentControlData";
import type { ControlAgent, AgentGroupMeta } from "./AgentControlData";

export default function AgentControlCentrePage() {
  const [agentList, setAgentList] = useState<ControlAgent[]>(agents);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["compliance", "maintenance", "inspections", "communications", "portfolio", "reporting", "administration"])
  );
  const [showLogModal, setShowLogModal] = useState<ControlAgent | null>(null);
  const [showOutputModal, setShowOutputModal] = useState<ControlAgent | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const groupedAgents = getAgentsByGroup();

  const toggleGroup = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) next.delete(group);
    else next.add(group);
    setExpandedGroups(next);
  };

  const handleAction = (agentId: string, action: string) => {
    setAgentList(prev =>
      prev.map(a => {
        if (a.id !== agentId) return a;

        const agent = agents.find(orig => orig.id === agentId);
        if (!agent) return a;

        if (action === "Run Now") {
          setToast(`${a.name} started — running now`);
          return { ...agent, status: "running", lastRun: "Just now", errors: a.errors };
        }
        if (action === "Pause") {
          setToast(`${a.name} paused`);
          return { ...a, status: "paused" as const };
        }
        if (action === "Resume") {
          setToast(`${a.name} resumed`);
          return { ...agent, status: "running", lastRun: "Just now", errors: a.errors };
        }
        if (action === "Restart") {
          setToast(`${a.name} restarted — running now`);
          return { ...agent, status: "running", lastRun: "Just now", errors: 0 };
        }
        return a;
      })
    );

    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadLog = (agent: ControlAgent) => {
    const lines = generateMockLog(agent);
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agent.name.replace(/\s+/g, "-").toLowerCase()}-log-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast(`${agent.name} log downloaded`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyOutput = (agent: ControlAgent) => {
    const content = generateMockOutput(agent);
    navigator.clipboard.writeText(content).then(() => {
      setToast(`${agent.name} output copied to clipboard`);
      setTimeout(() => setToast(null), 3000);
    });
  };

  const groupOrder = [
    "compliance", "maintenance", "inspections",
    "communications", "portfolio", "reporting", "administration",
  ];

  const generateMockLog = (agent: ControlAgent): string[] => {
    return [
      `[${new Date().toISOString().split("T")[0]} ${agent.lastRun.replace(/[^0-9]/g, "").padStart(2, "0") || "08"}:42:01] Agent initialised — ${agent.name} v4.2.1`,
      `[${new Date().toISOString().split("T")[0]} ${agent.lastRun.replace(/[^0-9]/g, "").padStart(2, "0") || "08"}:42:03] Connecting to data sources...`,
      `[${new Date().toISOString().split("T")[0]} ${agent.lastRun.replace(/[^0-9]/g, "").padStart(2, "0") || "08"}:42:05] Querying compliance database — ${agent.recordsProcessed.toLocaleString()} records`,
      `[${new Date().toISOString().split("T")[0]} ${agent.lastRun.replace(/[^0-9]/g, "").padStart(2, "0") || "08"}:42:07] Processing records...`,
      agent.status === "error"
        ? `[${new Date().toISOString().split("T")[0]} ${agent.lastRun.replace(/[^0-9]/g, "").padStart(2, "0") || "08"}:42:09] ERROR: Connection timeout — retry limit exceeded`
        : `[${new Date().toISOString().split("T")[0]} ${agent.lastRun.replace(/[^0-9]/g, "").padStart(2, "0") || "08"}:42:09] Run complete — ${agent.successRate}% success rate — ${agent.avgRunTime}`,
    ];
  };

  const generateMockOutput = (agent: ControlAgent): string => {
    return JSON.stringify({
      agentId: agent.id,
      agentName: agent.name,
      executionTime: agent.lastRun,
      summary: {
        recordsProcessed: agent.recordsProcessed,
        successRate: agent.successRate,
        errors: agent.errors,
        avgRunTime: agent.avgRunTime,
      },
      findings: agent.errors > 0
        ? [`Warning: ${agent.errors} error(s) detected`, "Review error logs for details"]
        : ["All checks passed", "No anomalies detected"],
      nextScheduledRun: agent.nextRun,
    }, null, 2);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Agent Control Centre</h1>
            <p className="text-sm text-[#687068] mt-1">
              Full visibility and control over your AI workforce — manage, monitor, and direct every agent across all departments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">
              Last refreshed: Just now
            </span>
            <button
              onClick={() => {
                setAgentList(agents.map(a => ({ ...a })));
                setToast("All agents refreshed");
                setTimeout(() => setToast(null), 3000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#3A3F3A] hover:bg-[#FBF9F4] transition-colors whitespace-nowrap cursor-pointer"
            >
              <i className="ri-refresh-line text-sm"></i>
              Refresh All
            </button>
          </div>
        </div>

        {/* Demo Data Warning */}
        <div className="bg-[#FEF3C7]/40 border border-[#F59E0B]/30 rounded-xl p-3 flex items-start gap-3">
          <div className="w-6 h-6 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-information-line text-[#F59E0B] text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-[#92400E]">Demo Data</p>
            <p className="text-xs text-[#A16207] mt-0.5">
              Agent data shown here is for demonstration. Live agent control and reporting is managed on the{" "}
              <a href="/dashboard/agent-control" className="underline font-medium">Agent Control</a> page which connects to n8n and Supabase. This page shows the planned agent architecture.
            </p>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-robot-2-line text-[#C28A78] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Total Agents</p>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{dashboardStats.totalAgents}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#3B82F6]/20 p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-flashlight-line text-[#3B82F6] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Actions Today</p>
            </div>
            <p className="text-2xl font-bold text-[#3B82F6]">{dashboardStats.totalActionsToday.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#10B981]/20 p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                <i className="ri-shield-check-line text-[#10B981] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Issues Prevented</p>
            </div>
            <p className="text-2xl font-bold text-[#10B981]">{dashboardStats.issuesPrevented}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#8B5CF6]/20 p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-[#8B5CF6] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Compliance Detected</p>
            </div>
            <p className="text-2xl font-bold text-[#8B5CF6]">{dashboardStats.complianceEventsDetected}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#EC4899]/20 p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#EC4899]/10 rounded-lg flex items-center justify-center">
                <i className="ri-file-chart-line text-[#EC4899] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Reports Generated</p>
            </div>
            <p className="text-2xl font-bold text-[#EC4899]">{dashboardStats.reportsGenerated}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#F59E0B]/20 p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                <i className="ri-message-3-line text-[#F59E0B] text-sm"></i>
              </div>
              <p className="text-xs text-[#94A3B8]">Comms Drafted</p>
            </div>
            <p className="text-2xl font-bold text-[#F59E0B]">{dashboardStats.communicationsDrafted.toLocaleString()}</p>
          </div>
        </div>

        {/* Agent Groups */}
        <div className="space-y-4">
          {groupOrder.map(group => {
            const groupAgents = (groupedAgents[group] || []).map(ga => {
              const current = agentList.find(a => a.id === ga.id);
              return current || ga;
            });
            const meta: AgentGroupMeta = agentGroups[group];
            const summary = getGroupSummary(group);
            const expanded = expandedGroups.has(group);

            if (groupAgents.length === 0) return null;

            return (
              <div key={group} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                {/* Group Header */}
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
                        {summary.count} agent{summary.count !== 1 ? "s" : ""}
                        {" · "}
                        {summary.running} running
                        {summary.errors > 0 && ` · ${summary.errors} error${summary.errors !== 1 ? "s" : ""}`}
                        {" · "}
                        {summary.totalRecords.toLocaleString()} records
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                    <i className={expanded ? "ri-arrow-up-s-line text-[#94A3B8] text-sm" : "ri-arrow-down-s-line text-[#94A3B8] text-sm"}></i>
                  </div>
                </button>

                {/* Group Agents */}
                {expanded && (
                  <div className="border-t border-[#D5D9D5]">
                    <div className="p-4 space-y-3">
                      {groupAgents.map(agent => {
                        const st = statusConfig[agent.status];
                        return (
                          <div
                            key={agent.id}
                            className="border border-[#D5D9D5] rounded-xl p-4 hover:border-[#C28A78]/20 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center flex-shrink-0">
                                  <i className={`${agent.icon} text-[#3A3F3A] text-lg`}></i>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-[#3A3F3A]">{agent.name}</h3>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color} flex-shrink-0`}>
                                      {st.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-1">{agent.description}</p>
                                </div>
                              </div>
                            </div>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Last Run</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">{agent.lastRun}</p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Next Run</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">{agent.nextRun}</p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Errors</p>
                                <p className={`text-xs font-medium ${agent.errors > 0 ? "text-[#EF4444]" : "text-[#3A3F3A]"}`}>
                                  {agent.errors}
                                </p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Records</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">{agent.recordsProcessed.toLocaleString()}</p>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Success Rate</p>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-12 h-1.5 bg-[#D5D9D5] rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                      className={`h-full rounded-full ${agent.successRate >= 99 ? "bg-[#10B981]" : agent.successRate >= 95 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`}
                                      style={{ width: `${agent.successRate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium text-[#3A3F3A]">{agent.successRate}%</span>
                                </div>
                              </div>
                              <div className="bg-[#FBF9F4] rounded-lg p-2.5">
                                <p className="text-[10px] text-[#94A3B8] mb-0.5">Avg Run Time</p>
                                <p className="text-xs font-medium text-[#3A3F3A]">{agent.avgRunTime}</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleAction(agent.id, st.actionLabel)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                                  agent.status === "running"
                                    ? "bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20"
                                    : agent.status === "paused"
                                    ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                                    : agent.status === "error"
                                    ? "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                                    : "bg-[#C28A78]/10 text-[#C28A78] hover:bg-[#C28A78]/20"
                                }`}
                              >
                                <i className={`${
                                  agent.status === "running" ? "ri-pause-line" :
                                  agent.status === "paused" ? "ri-play-line" :
                                  agent.status === "error" ? "ri-restart-line" :
                                  "ri-play-line"
                                } text-xs mr-1`}></i>
                                {st.actionLabel}
                              </button>
                              <button
                                onClick={() => setShowLogModal(agent)}
                                className="px-3 py-1.5 bg-[#F1F5F9] text-[#687068] rounded-lg text-xs font-medium hover:bg-[#D5D9D5] transition-colors whitespace-nowrap cursor-pointer"
                              >
                                <i className="ri-file-list-3-line text-xs mr-1"></i>
                                View Logs
                              </button>
                              <button
                                onClick={() => setShowOutputModal(agent)}
                                className="px-3 py-1.5 bg-[#F1F5F9] text-[#687068] rounded-lg text-xs font-medium hover:bg-[#D5D9D5] transition-colors whitespace-nowrap cursor-pointer"
                              >
                                <i className="ri-terminal-box-line text-xs mr-1"></i>
                                View Output
                              </button>
                              {agent.status === "running" && (
                                <span className="flex items-center gap-1 text-[10px] text-[#10B981] font-medium ml-auto">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                  Live
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
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-bounce">
          <div className="flex items-center gap-2">
            <i className="ri-check-line text-[#10B981]"></i>
            {toast}
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogModal && (
        <AgentLogModal
          agent={showLogModal}
          onClose={() => setShowLogModal(null)}
          onDownload={handleDownloadLog}
          generateMockLog={generateMockLog}
        />
      )}

      {/* Output Modal */}
      {showOutputModal && (
        <AgentOutputModal
          agent={showOutputModal}
          onClose={() => setShowOutputModal(null)}
          onCopy={handleCopyOutput}
          generateMockOutput={generateMockOutput}
        />
      )}
    </DashboardShell>
  );
}