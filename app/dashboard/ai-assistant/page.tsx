"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import FeatureGate from "@/components/entitlements/FeatureGate";
import AIChatPanel from "@/components/AIChatPanel";
import { getRecentSearches, clearRecentSearches } from "./AIAssistantData";

export default function AIAssistantPage() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshRecent = useCallback(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent]);

  const handleRecentSearchesChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    refreshRecent();
  }, [refreshTrigger, refreshRecent]);

  return (
    <DashboardShell>
      <FeatureGate featureKey="ai_assistant">
        <div className="flex gap-5 h-[calc(100vh-120px)] min-h-[700px]">
          {/* Chat area */}
          <div className="flex-1 min-w-0">
            <AIChatPanel onRecentSearchesChange={handleRecentSearchesChange} refreshRecentTrigger={refreshTrigger} />
          </div>

          {/* Right sidebar */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-4">
            {/* Data Scope Indicator */}
            <div className="bg-white border border-[#3B82F6]/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-radar-line text-[#3B82F6] text-sm"></i>
                </div>
                <p className="text-xs font-semibold text-[#3A3F3A]">Data Scope</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#687068]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Your authorised properties, tenancies, compliance records, and maintenance jobs.
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-white border border-[#D5D9D5] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#687068] uppercase tracking-wider mb-3">Your AI Property Manager</h3>
              <div className="space-y-2.5">
                {[
                  { icon: "ri-database-2-line", label: "Live portfolio data", desc: "Properties, tenants, compliance" },
                  { icon: "ri-shield-check-line", label: "Compliance tracking", desc: "Certificates, renewals, expiries" },
                  { icon: "ri-funds-line", label: "Financial insights", desc: "Arrears, rent, payments" },
                  { icon: "ri-tools-line", label: "Maintenance overview", desc: "Open jobs, urgent issues" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-[#C28A78] text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#3A3F3A]">{item.label}</p>
                      <p className="text-[11px] text-[#94A3B8]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white border border-[#D5D9D5] rounded-xl p-4 flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[#687068] uppercase tracking-wider">Recent Searches</h3>
                  <button
                    onClick={() => {
                      clearRecentSearches();
                      refreshRecent();
                    }}
                    className="text-[10px] text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1 overflow-y-auto flex-1">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#FBF9F4] transition-colors flex items-center gap-2 group"
                    >
                      <i className="ri-history-line text-[#94A3B8] text-xs group-hover:text-[#C28A78] transition-colors"></i>
                      <span className="text-xs text-[#475569] group-hover:text-[#3A3F3A] truncate transition-colors">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick tips */}
            <div className="bg-[#FBFCFD] border border-[#D5D9D5] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#687068] uppercase tracking-wider mb-2">Tips</h3>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <i className="ri-lightbulb-line text-[#F59E0B] text-xs mt-0.5"></i>
                  <p className="text-[11px] text-[#687068] leading-relaxed">Be specific — mention dates, properties, or tenants for better results</p>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-lightbulb-line text-[#F59E0B] text-xs mt-0.5"></i>
                  <p className="text-[11px] text-[#687068] leading-relaxed">All responses use live data from your Supabase portfolio</p>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-lightbulb-line text-[#F59E0B] text-xs mt-0.5"></i>
                  <p className="text-[11px] text-[#687068] leading-relaxed">Copy responses to share with landlords or team members</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardShell>
  );
}