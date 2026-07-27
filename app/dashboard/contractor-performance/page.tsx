"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import ContractorActionCentre from "@/components/dashboard/ContractorActionCentre";
import { supabase } from "@/lib/supabaseClient";
import {
  ContractorPerformance,
  tradeIconMap,
  tradeColorMap,
  scoreLabelConfig,
  getScoreColor,
  getScoreBg,
  getScoreRingColor,
  getScoreTier,
} from "./ContractorPerformanceData";

export default function ContractorPerformancePage() {
  const [contractors, setContractors] = useState<ContractorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractor, setSelectedContractor] = useState<ContractorPerformance | null>(null);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "all">("leaderboard");
  const [sortBy, setSortBy] = useState<"combined_score" | "rating" | "average_response_hours" | "jobs_completed">("combined_score");
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("contractor_performance")
        .select("*")
        .order("combined_score", { ascending: false });

      if (data) setContractors(data as ContractorPerformance[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const active = contractors.filter(c => c.total_jobs > 0);
    const avgScore = active.length > 0 ? active.reduce((sum, c) => sum + c.combined_score, 0) / active.length : 0;
    const totalJobs = contractors.reduce((sum, c) => sum + c.jobs_completed, 0);
    const flagged = contractors.filter(c => c.total_jobs > 0 && c.combined_score < 70).length;
    const topRated = active.length > 0 ? active.reduce((best, c) => (c.rating > best.rating ? c : best), active[0]) : null;
    return {
      totalContractors: contractors.length,
      activeContractors: active.length,
      avgCombinedScore: Math.round(avgScore * 10) / 10,
      totalJobsCompleted: totalJobs,
      contractsFlagged: flagged,
      highestRated: topRated?.business_name || "N/A",
    };
  }, [contractors]);

  const uniqueTrades = useMemo(() => {
    const trades = new Set(contractors.map(c => c.trade));
    return ["All", ...Array.from(trades).sort()];
  }, [contractors]);

  const filtered = useMemo(() => {
    return contractors
      .filter(c => {
        const matchesSearch = c.business_name.toLowerCase().includes(search.toLowerCase()) || c.trade.toLowerCase().includes(search.toLowerCase());
        const matchesTrade = tradeFilter === "All" || c.trade === tradeFilter;
        return matchesSearch && matchesTrade;
      })
      .sort((a, b) => {
        if (sortBy === "combined_score") return b.combined_score - a.combined_score;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "average_response_hours") return a.average_response_hours - b.average_response_hours;
        if (sortBy === "jobs_completed") return b.jobs_completed - a.jobs_completed;
        return 0;
      });
  }, [contractors, search, tradeFilter, sortBy]);

  const flaggedContractors = useMemo(() => contractors.filter(c => c.total_jobs > 0 && c.combined_score < 70), [contractors]);

  const topByCombined = useMemo(() => [...contractors].filter(c => c.total_jobs > 0).sort((a, b) => b.combined_score - a.combined_score).slice(0, 5), [contractors]);
  const topByRating = useMemo(() => [...contractors].filter(c => c.total_jobs > 0).sort((a, b) => b.rating - a.rating).slice(0, 5), [contractors]);
  const topByResponse = useMemo(() => [...contractors].filter(c => c.total_jobs > 0 && c.average_response_hours > 0).sort((a, b) => a.average_response_hours - b.average_response_hours).slice(0, 5), [contractors]);
  const topByActivity = useMemo(() => [...contractors].filter(c => c.total_jobs > 0).sort((a, b) => b.jobs_completed - a.jobs_completed).slice(0, 5), [contractors]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#687068]">Loading contractor performance data...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Contractor Performance Engine</h1>
            <p className="text-sm text-[#687068] mt-1">Track contractor quality, speed, and reliability across your network</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-white p-1">
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "leaderboard" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "all" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"
                }`}
              >
                All Contractors
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Contractors", value: stats.totalContractors, icon: "ri-building-4-line", color: "bg-[#3B82F6]" },
            { label: "Active", value: stats.activeContractors, icon: "ri-check-double-line", color: "bg-[#10B981]" },
            { label: "Avg Score", value: stats.avgCombinedScore, icon: "ri-bar-chart-2-line", color: "bg-[#8B5CF6]" },
            { label: "Jobs Completed", value: stats.totalJobsCompleted, icon: "ri-briefcase-line", color: "bg-[#14B8A6]" },
            { label: "Flagged", value: stats.contractsFlagged, icon: "ri-alert-line", color: "bg-[#EF4444]" },
            { label: "Top Rated", value: stats.highestRated.length > 20 ? stats.highestRated.slice(0, 18) + "..." : stats.highestRated, icon: "ri-star-line", color: "bg-[#F59E0B]", isText: true },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 flex items-center justify-center ${s.color} rounded-md`}>
                  <i className={`${s.icon} text-white text-xs`}></i>
                </div>
                <span className="text-xs text-[#687068]">{s.label}</span>
              </div>
              <p className={`font-bold text-[#3A3F3A] ${(s as any).isText ? "text-sm" : "text-2xl"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {activeTab === "leaderboard" && (
          <>
            <ContractorActionCentre actions={flaggedContractors.slice(0, 5).map((c) => ({
              id: `flag-${c.id}`,
              contractorId: c.id || "",
              contractorName: c.business_name,
              trade: c.trade,
              issue: `Score below 70 — ${c.combined_score}/100 combined`,
              deadline: "Review needed",
              priority: "high" as const,
              actionLabel: "Review",
            }))} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A] flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-trophy-line text-[#F59E0B]"></i>
                  </div>
                  Top 5 — Overall Score
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {topByCombined.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C28A78] cursor-pointer transition-colors"
                    onClick={() => setSelectedContractor(c)}
                  >
                    <div className="w-8 text-center">
                      <span className={`text-lg font-bold ${i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#94A3B8]" : i === 2 ? "text-[#D97706]" : "text-[#CBD5E1]"}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: tradeColorMap[c.trade] || "#687068" }}>
                      {c.business_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3A3F3A] truncate">{c.business_name}</p>
                      <p className="text-xs text-[#687068]">{c.trade}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${getScoreRingColor(c.combined_score)} ${c.combined_score}%, #E2E8F0 0)` }}>
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <span className="text-xs font-bold" style={{ color: getScoreColor(c.combined_score) }}>{c.combined_score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {topByCombined.length === 0 && (
                  <p className="text-center text-sm text-[#94A3B8] py-4">No active contractors</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A] flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-star-line text-[#F59E0B]"></i>
                  </div>
                  Top 5 — Highest Rated
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {topByRating.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C28A78] cursor-pointer transition-colors"
                    onClick={() => setSelectedContractor(c)}
                  >
                    <div className="w-8 text-center">
                      <span className={`text-lg font-bold ${i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#94A3B8]" : i === 2 ? "text-[#D97706]" : "text-[#CBD5E1]"}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: tradeColorMap[c.trade] || "#687068" }}>
                      {c.business_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3A3F3A] truncate">{c.business_name}</p>
                      <p className="text-xs text-[#687068]">{c.trade}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-star-fill text-[#F59E0B] text-sm"></i>
                      </div>
                      <span className="text-sm font-bold text-[#3A3F3A]">{c.rating.toFixed(1)}</span>
                      <span className="text-xs text-[#94A3B8]">({c.review_count})</span>
                    </div>
                  </div>
                ))}
                {topByRating.length === 0 && (
                  <p className="text-center text-sm text-[#94A3B8] py-4">No rated contractors</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A] flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-speed-line text-[#3B82F6]"></i>
                  </div>
                  Top 5 — Fastest Response
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {topByResponse.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C28A78] cursor-pointer transition-colors"
                    onClick={() => setSelectedContractor(c)}
                  >
                    <div className="w-8 text-center">
                      <span className={`text-lg font-bold ${i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#94A3B8]" : i === 2 ? "text-[#D97706]" : "text-[#CBD5E1]"}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: tradeColorMap[c.trade] || "#687068" }}>
                      {c.business_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3A3F3A] truncate">{c.business_name}</p>
                      <p className="text-xs text-[#687068]">{c.trade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#3B82F6]">{c.average_response_hours}h</p>
                      <p className="text-[10px] text-[#94A3B8]">avg response</p>
                    </div>
                  </div>
                ))}
                {topByResponse.length === 0 && (
                  <p className="text-center text-sm text-[#94A3B8] py-4">No response data</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A] flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-briefcase-line text-[#14B8A6]"></i>
                  </div>
                  Top 5 — Most Active
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {topByActivity.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#C28A78] cursor-pointer transition-colors"
                    onClick={() => setSelectedContractor(c)}
                  >
                    <div className="w-8 text-center">
                      <span className={`text-lg font-bold ${i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#94A3B8]" : i === 2 ? "text-[#D97706]" : "text-[#CBD5E1]"}`}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: tradeColorMap[c.trade] || "#687068" }}>
                      {c.business_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#3A3F3A] truncate">{c.business_name}</p>
                      <p className="text-xs text-[#687068]">{c.trade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#14B8A6]">{c.jobs_completed}</p>
                      <p className="text-[10px] text-[#94A3B8]">jobs done</p>
                    </div>
                  </div>
                ))}
                {topByActivity.length === 0 && (
                  <p className="text-center text-sm text-[#94A3B8] py-4">No active contractors</p>
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {activeTab === "all" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contractors or trades..."
                  className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#94A3B8]">Trade:</span>
                {uniqueTrades.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTradeFilter(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      tradeFilter === t ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:text-[#3A3F3A]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] whitespace-nowrap">Sort by:</span>
                <div className="relative">
                  <button
                    onClick={() => {
                      const options = [
                        { value: "combined_score", label: "Score" },
                        { value: "rating", label: "Rating" },
                        { value: "average_response_hours", label: "Response" },
                        { value: "jobs_completed", label: "Jobs" },
                      ];
                      const idx = options.findIndex(o => o.value === sortBy);
                      setSortBy(options[(idx + 1) % options.length].value as any);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] rounded-lg bg-white text-xs font-medium text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap"
                  >
                    {sortBy === "combined_score" ? "Score" : sortBy === "rating" ? "Rating" : sortBy === "average_response_hours" ? "Response" : "Jobs"}
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-arrow-up-down-line text-[#94A3B8] text-xs"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left text-xs font-medium text-[#687068] px-5 py-3">Contractor</th>
                      <th className="text-left text-xs font-medium text-[#687068] px-5 py-3">Trade</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Score</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Quality</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Speed</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Reliability</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Docs</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Rating</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Jobs</th>
                      <th className="text-center text-xs font-medium text-[#687068] px-5 py-3">Response</th>
                      <th className="text-right text-xs font-medium text-[#687068] px-5 py-3">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const tier = getScoreTier(c.combined_score);
                      const tierColor = getScoreBg(c.combined_score);
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                          onClick={() => setSelectedContractor(c)}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: tradeColorMap[c.trade] || "#687068" }}>
                                {c.business_name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-[#3A3F3A]">{c.business_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className={`${tradeIconMap[c.trade] || "ri-building-4-line"} text-xs`} style={{ color: tradeColorMap[c.trade] || "#687068" }}></i>
                              </div>
                              <span className="text-sm text-[#475569]">{c.trade}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold" style={{ background: `conic-gradient(${getScoreRingColor(c.combined_score)} ${c.combined_score}%, #E2E8F0 0)`, color: getScoreColor(c.combined_score) }}>
                              {c.combined_score}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium" style={{ color: getScoreColor(c.quality_score) }}>{c.quality_score}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium" style={{ color: getScoreColor(c.speed_score) }}>{c.speed_score}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium" style={{ color: getScoreColor(c.reliability_score) }}>{c.reliability_score}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium" style={{ color: getScoreColor(c.documentation_score) }}>{c.documentation_score}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium text-[#3A3F3A]">{c.rating > 0 ? c.rating.toFixed(1) : "—"}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium text-[#3A3F3A]">{c.jobs_completed}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="text-sm font-medium text-[#3A3F3A]">{c.average_response_hours > 0 ? `${c.average_response_hours}h` : "—"}</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierColor}`}>{tier}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-[#F1F5F9] rounded-full">
                    <i className="ri-file-search-line text-[#94A3B8] text-xl"></i>
                  </div>
                  <p className="text-sm text-[#687068]">No contractors match your filters</p>
                </div>
              )}
            </div>
          </>
        )}

        {selectedContractor && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedContractor(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: tradeColorMap[selectedContractor.trade] || "#687068" }}>
                    {selectedContractor.business_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">{selectedContractor.business_name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${tradeIconMap[selectedContractor.trade] || "ri-building-4-line"} text-xs`} style={{ color: tradeColorMap[selectedContractor.trade] || "#687068" }}></i>
                      </div>
                      <span className="text-xs text-[#687068]">{selectedContractor.trade}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedContractor(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke={getScoreRingColor(selectedContractor.combined_score)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(selectedContractor.combined_score / 100) * 326.7} 326.7`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold" style={{ color: getScoreColor(selectedContractor.combined_score) }}>{selectedContractor.combined_score}</span>
                      <span className="text-[10px] text-[#94A3B8]">/ 100</span>
                    </div>
                  </div>
                </div>
                <p className="text-center">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getScoreBg(selectedContractor.combined_score)}`}>
                    {getScoreTier(selectedContractor.combined_score)}
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {(["quality_score", "speed_score", "reliability_score", "documentation_score"] as const).map((key) => {
                    const score = selectedContractor[key];
                    const config = scoreLabelConfig[key];
                    return (
                      <div key={key} className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <i className={`${config.icon} text-sm`} style={{ color: getScoreColor(score) }}></i>
                          </div>
                          <span className="text-xs text-[#687068]">{config.label}</span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-xl font-bold text-[#3A3F3A]">{score}</span>
                          <span className="text-xs text-[#94A3B8] mb-0.5">/ 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mt-2 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#E2E8F0] pt-4">
                  <h4 className="text-sm font-semibold text-[#3A3F3A] mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Jobs Completed</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.jobs_completed}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Jobs Cancelled</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.jobs_cancelled}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Avg Completion</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.average_completion_days > 0 ? `${selectedContractor.average_completion_days}d` : "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Avg Response</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">{selectedContractor.average_response_hours > 0 ? `${selectedContractor.average_response_hours}h` : "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">On-Time Rate</p>
                      <p className="text-lg font-bold text-[#10B981]">{selectedContractor.on_time_rate > 0 ? `${selectedContractor.on_time_rate}%` : "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Invoice Accuracy</p>
                      <p className="text-lg font-bold text-[#3B82F6]">{selectedContractor.invoice_accuracy_rate > 0 ? `${selectedContractor.invoice_accuracy_rate}%` : "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Repeat Business</p>
                      <p className="text-lg font-bold text-[#8B5CF6]">{selectedContractor.repeat_business_rate > 0 ? `${selectedContractor.repeat_business_rate}%` : "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0]">
                      <p className="text-xs text-[#94A3B8] mb-0.5">Rating</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">
                        {selectedContractor.rating > 0 ? (
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-star-fill text-[#F59E0B] text-sm"></i>
                            </div>
                            {selectedContractor.rating.toFixed(1)}
                          </span>
                        ) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedContractor.last_job_date && (
                  <div className="border-t border-[#E2E8F0] pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#687068]">Last Job</span>
                      <span className="font-medium text-[#3A3F3A]">{new Date(selectedContractor.last_job_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}