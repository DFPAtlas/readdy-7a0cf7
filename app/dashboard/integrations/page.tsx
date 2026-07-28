"use client";

import { useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  integrations,
  integrationCategories,
  activityLog,
  quickStats,
  statusStyles,
  IntegrationItem,
} from "./IntegrationsData";
import Link from "next/link";

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [integrationStates, setIntegrationStates] = useState<Record<string, string>>(() => {
    const states: Record<string, string> = {};
    integrations.forEach((i) => (states[i.id] = i.status));
    return states;
  });

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((i) => {
      if (activeCategory !== "all" && i.category !== activeCategory) return false;
      if (statusFilter !== "all" && integrationStates[i.id] !== statusFilter) return false;
      if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase()) && !i.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, statusFilter, searchQuery, integrationStates]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: integrations.length };
    integrationCategories.forEach((cat) => {
      counts[cat.key] = integrations.filter((i) => i.category === cat.key).length;
    });
    return counts;
  }, []);

  const handleToggleConnection = (id: string) => {
    setIntegrationStates((prev) => {
      const current = prev[id];
      const next = current === "connected" ? "disconnected" : current === "disconnected" ? "connected" : "connected";
      return { ...prev, [id]: next };
    });
    setConfiguringId(null);
  };

  const getModalIntegration = () => integrations.find((i) => i.id === configuringId);

  return (
    <DashboardShell>
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">Integrations Hub</h1>
          <p className="text-sm text-[#687068] mt-1">Connect your property management stack — finance, productivity, automation, comms, and documents</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/integrations/accounting"
            className="flex items-center gap-2 px-3 py-2 bg-[#C28A78] text-white text-xs font-medium rounded-lg hover:bg-[#2D6A4F] transition-colors whitespace-nowrap"
          >
            <i className="ri-bank-line text-sm w-4 h-4 flex items-center justify-center"></i>
            Xero & QuickBooks Setup
          </Link>
          <Link
            href="/dashboard/integrations/workspace"
            className="flex items-center gap-2 px-3 py-2 bg-[#2563EB] text-white text-xs font-medium rounded-lg hover:bg-[#3B82F6] transition-colors whitespace-nowrap"
          >
            <i className="ri-google-line text-sm w-4 h-4 flex items-center justify-center"></i>
            Google & Microsoft Setup
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#687068] bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-[#E2E8F0]">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            <span><strong>{quickStats.connected}</strong> of <strong>{quickStats.total}</strong> connected</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Integrations", value: quickStats.total, icon: "ri-puzzle-2-line", color: "#3B82F6" },
          { label: "Connected", value: quickStats.connected, icon: "ri-plug-line", color: "#10B981" },
          { label: "Available", value: quickStats.disconnected, icon: "ri-add-circle-line", color: "#F59E0B" },
          { label: "Last Sync", value: "10:05 today", icon: "ri-time-line", color: "#8B5CF6" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"></i>
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${activeCategory === "all" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
            >
              All ({categoryCounts.all})
            </button>
            {integrationCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${activeCategory === cat.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
              >
                <i className={`${cat.icon} text-[10px] w-3 h-3 flex items-center justify-center`}></i>
                {cat.label} ({categoryCounts[cat.key] || 0})
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 ml-auto">
            {[
              { key: "all", label: "All Status" },
              { key: "connected", label: "Connected" },
              { key: "disconnected", label: "Not Connected" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer ${statusFilter === f.key ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Cards + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cards Grid */}
        <div className="lg:col-span-3">
          {filteredIntegrations.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] text-center py-16">
              <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                <i className="ri-puzzle-2-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No integrations match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredIntegrations.map((integration) => {
                const st = statusStyles[integrationStates[integration.id]] || statusStyles.disconnected;
                return (
                  <div
                    key={integration.id}
                    className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${st.bg.includes("10B981") && integrationStates[integration.id] === "connected" ? "border-[#10B981]/30" : integrationStates[integration.id] === "disconnected" ? "border-[#E2E8F0]" : "border-[#F59E0B]/30"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${integration.color}15`,
                          }}
                        >
                          <i className={`${integration.icon} text-xl`} style={{ color: integration.color }}></i>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#3A3F3A]">{integration.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></div>
                            {st.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfiguringId(configuringId === integration.id ? null : integration.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${configuringId === integration.id ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"}`}
                      >
                        <i className="ri-settings-4-line text-sm"></i>
                      </button>
                    </div>

                    <p className="text-xs text-[#687068] leading-relaxed mb-3">{integration.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {integration.features.slice(0, 3).map((feat, j) => (
                        <span key={j} className="text-[10px] text-[#687068] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                          {feat}
                        </span>
                      ))}
                      {integration.features.length > 3 && (
                        <span className="text-[10px] text-[#94A3B8] px-1">+{integration.features.length - 3}</span>
                      )}
                    </div>

                    {/* Last Sync */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                        <i className="ri-time-line text-[10px] w-3 h-3 flex items-center justify-center"></i>
                        {integration.lastSync ? (
                          <span>Last sync: {integration.lastSync}</span>
                        ) : (
                          <span>Not yet synced</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleConnection(integration.id)}
                        className={`text-[10px] font-medium px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${integrationStates[integration.id] === "connected" ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]" : "bg-[#C28A78] text-white hover:bg-[#2D6A4F]"}`}
                      >
                        {integrationStates[integration.id] === "connected" ? "Disconnect" : "Connect"}
                      </button>
                    </div>

                    {/* Configure Panel */}
                    {configuringId === integration.id && (
                      <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-3">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-medium text-[#687068]">API Key</label>
                          <input
                            type="text"
                            placeholder="Enter API key..."
                            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#3A3F3A] placeholder-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-medium text-[#687068]">Webhook URL (for auto-sync)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`https://api.lethub.co/webhooks/${integration.id}`}
                              className="flex-1 px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#94A3B8]"
                            />
                            <button className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center cursor-pointer hover:bg-[#E2E8F0] transition-colors">
                              <i className="ri-file-copy-line text-[#687068] text-sm"></i>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[#94A3B8]">Status: {st.label}</span>
                          <button
                            onClick={() => handleToggleConnection(integration.id)}
                            className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${integrationStates[integration.id] === "connected" ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]" : "bg-[#C28A78] text-white hover:bg-[#2D6A4F]"}`}
                          >
                            {integrationStates[integration.id] === "connected" ? "Disconnect" : "Connect"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Log Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden sticky top-6">
            <div className="p-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-history-line text-[#3B82F6] text-sm"></i>
                </div>
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Recent Activity</h3>
              </div>
            </div>
            <div className="divide-y divide-[#F8FAFC] max-h-[600px] overflow-y-auto">
              {activityLog.map((entry) => (
                <div key={entry.id} className="p-3 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className={`${entry.icon} text-[#687068] text-xs`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-[#3A3F3A]">{entry.integration}</span>
                        <span className="text-[10px] text-[#94A3B8]">·</span>
                        <span className="text-[10px] text-[#687068]">{entry.action}</span>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{entry.detail}</p>
                      <p className="text-[10px] text-[#CBD5E1] mt-1">{entry.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#F1F5F9]">
              <button className="w-full text-center text-[10px] text-[#3B82F6] font-medium hover:underline cursor-pointer">
                View full activity log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardShell>
  );
}