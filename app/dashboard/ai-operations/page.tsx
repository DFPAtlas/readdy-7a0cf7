"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { AI_SAFETY_NOTICE, URGENCY_CONFIG } from "@/lib/aiSystem";
import {
  agents,
  todaysWork,
  getAgentSummary,
  categoryMeta,
  statusConfig,
} from "./AIOperationsData";
import type { AIAgent } from "./AIOperationsData";

export default function AIOperationsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "approvals" | "history">("overview");

  const summary = getAgentSummary();
  const errorCount = agents.filter(a => a.status === "error").length;
  const runningCount = agents.filter(a => a.status === "running").length;

  const filteredAgents = agents.filter((a) => {
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const attentionItems = [
    ...agents.filter(a => a.status === "error").map(a => ({
      id: a.id, agentName: a.name, issue: "Agent encountered errors during last run", relatedRecord: `${a.recordsProcessed.toLocaleString()} records`, time: a.lastRun, urgency: "critical" as const, actionLabel: "Investigate"
    })),
    ...todaysWork.items.filter(i => i.urgency === "critical").map((item, idx) => ({
      id: `work-${idx}`, agentName: "Operations", issue: item.message, relatedRecord: "", time: "Today", urgency: item.urgency, actionLabel: item.linkLabel, actionHref: item.linkHref
    })),
  ].slice(0, 5);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">AI Operations Manager</h1>
          <p className="text-sm text-[#687068] mt-1">Coordinating all agents across compliance, maintenance, risk, and communications</p>
        </div>

        <div className="bg-[#FEF3C7]/30 border border-[#F59E0B]/20 rounded-xl p-3 flex items-start gap-3">
          <div className="w-6 h-6 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-information-line text-[#F59E0B] text-sm"></i>
          </div>
          <p className="text-xs text-[#92400E]">{AI_SAFETY_NOTICE}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Active Automations", value: runningCount, icon: "ri-play-circle-line", color: "bg-[#10B981]", sub: "Currently running" },
            { label: "Runs Review", value: agents.filter(a => a.status === "idle" && a.recordsProcessed > 500).length, icon: "ri-eye-line", color: "bg-[#3B82F6]", sub: "Needs review" },
            { label: "Failed Runs", value: errorCount, icon: "ri-error-warning-line", color: "bg-[#EF4444]", sub: "Requires attention" },
            { label: "Awaiting Approval", value: 2, icon: "ri-shield-user-line", color: "bg-[#F59E0B]", sub: "Actions pending" },
            { label: "Service Health", value: errorCount === 0 ? "Healthy" : "Degraded", icon: "ri-heart-pulse-line", color: errorCount === 0 ? "bg-[#10B981]" : "bg-[#F59E0B]", sub: `${summary.total} agents total` },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-sm transition-shadow">
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center mb-2`}>
                <i className={`${card.icon} text-white text-sm`}></i>
              </div>
              <p className="text-xl font-bold text-[#3A3F3A]">{card.value}</p>
              <p className="text-xs text-[#687068]">{card.label}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Attention Panel */}
        {attentionItems.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 className="text-sm font-semibold text-[#3A3F3A] mb-3 flex items-center gap-2">
              <i className="ri-alert-line text-[#C28A78] text-sm"></i>
              Items Requiring Attention
            </h2>
            <div className="space-y-2">
              {attentionItems.map((item) => {
                const uc = URGENCY_CONFIG[item.urgency];
                return (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${uc.bg} ${uc.border}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.urgency === "critical" ? "bg-[#EF4444]/10" : "bg-[#F59E0B]/10"}`}>
                      <i className={`${item.urgency === "critical" ? "ri-error-warning-line text-[#EF4444]" : "ri-time-line text-[#F59E0B]"} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.issue}</p>
                      <p className="text-xs text-[#94A3B8]">{item.agentName}{item.relatedRecord ? ` · ${item.relatedRecord}` : ""} · {item.time}</p>
                    </div>
                    {item.actionHref ? (
                      <Link href={item.actionHref} className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">{item.actionLabel}</Link>
                    ) : (
                      <button onClick={() => setActiveTab("agents")} className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">{item.actionLabel}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1 w-fit">
          {[
            { key: "overview" as const, label: "Overview", icon: "ri-dashboard-line" },
            { key: "agents" as const, label: "Agents & Workflows", icon: "ri-robot-2-line" },
            { key: "approvals" as const, label: "Approvals", icon: "ri-shield-check-line" },
            { key: "history" as const, label: "Run History", icon: "ri-history-line" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"}`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#FBFCFD]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#C28A78] rounded-lg flex items-center justify-center"><i className="ri-sun-line text-white text-sm"></i></div>
                    <div><h2 className="font-semibold text-[#3A3F3A] text-sm">Today&apos;s Work</h2></div>
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {todaysWork.items.map((item, i) => {
                    const uc = URGENCY_CONFIG[item.urgency];
                    return (
                      <Link key={i} href={item.linkHref} className={`block p-3 rounded-xl border ${uc.border} ${uc.bg} hover:shadow-sm transition-all`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${uc.bg}`}><i className={`${item.icon} ${uc.iconColor} text-sm`}></i></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#3A3F3A] font-medium leading-snug">{item.message}</p>
                            <span className={`text-xs font-medium ${uc.iconColor}`}>{uc.label} · {item.linkLabel} →</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${uc.bg} ${uc.iconColor} flex-shrink-0`}>{item.count}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <h2 className="font-semibold text-[#3A3F3A] mb-4">Agent Status Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAgents.slice(0, 8).map((agent) => {
                    const st = statusConfig[agent.status];
                    return (
                      <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setSelectedAgent(agent); setShowAgentModal(true); }}>
                        <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center flex-shrink-0"><i className={`${agent.icon} text-[#C28A78] text-lg`}></i></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[#3A3F3A]">{agent.name}</p>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                          </div>
                          <p className="text-xs text-[#94A3B8]">{agent.lastRun} · {agent.recordsProcessed.toLocaleString()} records</p>
                        </div>
                        {agent.status === "error" && <i className="ri-error-warning-line text-[#EF4444] text-sm flex-shrink-0"></i>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1">
                {[{ id: "all", label: "All" }, ...Object.entries(categoryMeta).map(([key, meta]) => ({ id: key, label: meta.label }))].map((tab) => (
                  <button key={tab.id} onClick={() => setFilterCategory(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"}`}>{tab.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1">
                {[{ id: "all", label: "All Status" }, { id: "running", label: "Running" }, { id: "idle", label: "Idle" }, { id: "error", label: "Error" }].map((tab) => (
                  <button key={tab.id} onClick={() => setFilterStatus(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"}`}>{tab.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => {
                const st = statusConfig[agent.status];
                return (
                  <button key={agent.id} onClick={() => { setSelectedAgent(agent); setShowAgentModal(true); }} className="text-left bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md hover:border-[#C28A78]/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center"><i className={`${agent.icon} text-[#C28A78] text-lg`}></i></div>
                        <div><h3 className="text-sm font-semibold text-[#3A3F3A]">{agent.name}</h3><p className="text-xs text-[#94A3B8] line-clamp-1">{agent.description.slice(0, 50)}...</p></div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color} flex-shrink-0`}>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1"><i className="ri-time-line text-[#94A3B8] text-xs"></i><span className="text-[#687068]">{agent.lastRun}</span></span>
                      <span className="flex items-center gap-1"><i className="ri-database-2-line text-[#94A3B8] text-xs"></i><span className="text-[#687068]">{agent.recordsProcessed.toLocaleString()}</span></span>
                    </div>
                    {agent.status === "running" && <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F1F5F9]"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span><span className="text-[10px] text-[#10B981] font-medium">Live</span></div>}
                    {agent.status === "error" && <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F1F5F9]"><i className="ri-error-warning-line text-[#EF4444] text-xs"></i><span className="text-[10px] text-[#EF4444] font-medium">Investigation needed</span></div>}
                  </button>
                );
              })}
            </div>
            {filteredAgents.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-[#E2E8F0]">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3"><i className="ri-search-line text-[#94A3B8] text-lg"></i></div>
                <p className="text-sm text-[#687068]">No agents match your filters</p>
              </div>
            )}
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h2 className="font-semibold text-[#3A3F3A] mb-1">Pending Approvals</h2>
              <p className="text-sm text-[#687068] mb-4">Actions proposed by AI that require human review before execution.</p>
              <div className="space-y-3">
                {[
                  { agent: "Maintenance Triage", action: "Dispatch plumber", record: "14 Rosebery Avenue", reason: "Emergency ceiling leak detected — 96% confidence", info: "Photos + voice note from tenant", impact: "Estimated £150-400", time: "2 hours ago" },
                  { agent: "Compliance Monitor", action: "Renewal reminder", record: "3 properties", reason: "2 gas certificates + 1 EPC expiring within 30 days", info: "Automated from compliance dashboard", impact: "Regulatory requirement", time: "4 hours ago" },
                  { agent: "Portfolio Risk", action: "Landlord notification", record: "22 Baker Street", reason: "Risk score elevated — overdue compliance + arrears", info: "Landlord hasn't been updated in 3 weeks", impact: "Relationship management", time: "6 hours ago" },
                ].map((approval, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#3A3F3A]">{approval.agent}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">Awaiting Approval</span>
                        </div>
                        <p className="text-sm text-[#687068]">{approval.reason}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-[#F8FAFC] rounded-lg p-2"><p className="text-[10px] text-[#94A3B8]">Proposed Action</p><p className="text-xs font-medium text-[#3A3F3A]">{approval.action}</p></div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2"><p className="text-[10px] text-[#94A3B8]">Related Record</p><p className="text-xs font-medium text-[#3A3F3A]">{approval.record}</p></div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2"><p className="text-[10px] text-[#94A3B8]">Business Impact</p><p className="text-xs font-medium text-[#3A3F3A]">{approval.impact}</p></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8]">{approval.time} · {approval.info}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {}} className="px-3 py-1.5 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors whitespace-nowrap">Approve</button>
                        <button onClick={() => {}} className="px-3 py-1.5 border border-[#EF4444]/20 text-[#EF4444] rounded-lg text-xs font-medium hover:bg-[#EF4444]/5 transition-colors whitespace-nowrap">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h2 className="font-semibold text-[#3A3F3A] mb-4">Recent Agent Runs</h2>
              <div className="space-y-2">
                {agents.slice(0, 10).map((agent, i) => {
                  const st = statusConfig[agent.status];
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors border border-[#E2E8F0]">
                      <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0"><i className={`${agent.icon} text-[#C28A78] text-sm`}></i></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="text-sm font-medium text-[#3A3F3A]">{agent.name}</span><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span></div>
                        <p className="text-xs text-[#94A3B8]">{agent.description.slice(0, 80)}...</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#687068]">{agent.lastRun}</p>
                        <p className="text-[10px] text-[#94A3B8]">{agent.recordsProcessed.toLocaleString()} records</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Agent Detail Modal */}
        {showAgentModal && selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAgentModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center"><i className={`${selectedAgent.icon} text-[#C28A78] text-xl`}></i></div>
                    <div><h3 className="text-lg font-semibold text-[#3A3F3A]">{selectedAgent.name}</h3><p className="text-xs text-[#94A3B8]">{categoryMeta[selectedAgent.category]?.label || selectedAgent.category}</p></div>
                  </div>
                  <button onClick={() => setShowAgentModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"><i className="ri-close-line text-[#687068]"></i></button>
                </div>
                <div className={`rounded-xl border p-4 mb-4 ${statusConfig[selectedAgent.status].bg}`}>
                  <div className="flex items-center gap-2 mb-3"><span className={`w-2 h-2 rounded-full ${statusConfig[selectedAgent.status].dot}`}></span><span className={`text-sm font-medium ${statusConfig[selectedAgent.status].color}`}>{statusConfig[selectedAgent.status].label}</span></div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-[#94A3B8] mb-0.5">Last Run</p><p className="font-medium text-[#3A3F3A]">{selectedAgent.lastRun}</p></div>
                    <div><p className="text-xs text-[#94A3B8] mb-0.5">Records Processed</p><p className="font-medium text-[#3A3F3A]">{selectedAgent.recordsProcessed.toLocaleString()}</p></div>
                  </div>
                </div>
                <p className="text-sm text-[#687068] leading-relaxed mb-6">{selectedAgent.description}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowAgentModal(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors">Close</button>
                  {selectedAgent.status === "error" && (
                    <button className="flex-1 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors flex items-center justify-center gap-2"><i className="ri-restart-line"></i>Restart Agent</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}