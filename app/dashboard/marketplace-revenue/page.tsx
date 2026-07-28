"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import {
  MarketplaceTransaction,
  RevenueSummary,
  serviceTypeIconMap,
  serviceTypeColorMap,
  transactionTypeLabels,
  statusLabels,
  referralSourceLabels,
  revenueModels,
  monthlyRevenueData,
  propertyNames,
  contractorNames,
} from "./MarketplaceRevenueData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const statusStyles: Record<string, string> = {
  completed: "bg-[#10B981]/10 text-[#10B981]",
  approved: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  quoted: "bg-[#3B82F6]/10 text-[#3B82F6]",
  requested: "bg-[#F59E0B]/10 text-[#F59E0B]",
  referred: "bg-[#6366F1]/10 text-[#6366F1]",
};

const typeStyles: Record<string, string> = {
  completed_job: "bg-[#10B981]/10 text-[#10B981]",
  quote_request: "bg-[#3B82F6]/10 text-[#3B82F6]",
  service_request: "bg-[#F59E0B]/10 text-[#F59E0B]",
  referral: "bg-[#6366F1]/10 text-[#6366F1]",
};

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#6366F1", "#8B5CF6", "#EF4444"];

function formatCurrency(n: number): string {
  return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MarketplaceRevenuePage() {
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "models">("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from("marketplace_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setTransactions(data as MarketplaceTransaction[]);
      }
      setLoading(false);
    }
    fetchTransactions();
  }, []);

  const summary: RevenueSummary = useMemo(() => {
    const completed = transactions.filter((t) => t.status === "completed");
    const total = transactions.length;
    return {
      totalTransactions: total,
      jobsCompleted: transactions.filter((t) => t.transaction_type === "completed_job" && t.status === "completed").length,
      quoteRequests: transactions.filter((t) => t.transaction_type === "quote_request").length,
      serviceRequests: transactions.filter((t) => t.transaction_type === "service_request").length,
      referrals: transactions.filter((t) => t.transaction_type === "referral").length,
      completedValue: completed.reduce((s, t) => s + Number(t.value), 0),
      estimatedRevenue: completed.reduce((s, t) => s + Number(t.estimated_fee), 0),
      actualRevenueEarned: completed.reduce((s, t) => s + Number(t.actual_fee), 0),
      pipelineValue: transactions.filter((t) => t.status === "approved" || t.status === "quoted").reduce((s, t) => s + Number(t.estimated_fee), 0),
      avgTransactionValue: completed.length > 0 ? completed.reduce((s, t) => s + Number(t.value), 0) / completed.length : 0,
      conversionRate: transactions.filter((t) => t.transaction_type === "quote_request").length > 0
        ? Math.round((transactions.filter((t) => t.status === "completed" && t.transaction_type === "completed_job").length / transactions.filter((t) => t.transaction_type === "quote_request" || t.transaction_type === "completed_job").length) * 100)
        : 0,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.transaction_type !== typeFilter) return false;
      return true;
    });
  }, [transactions, statusFilter, typeFilter]);

  const serviceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      const key = t.service_type;
      map[key] = (map[key] || 0) + Number(t.value);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions]);

  const typeBreakdown = useMemo(() => {
    const completed = transactions.filter((t) => t.status === "completed" && t.transaction_type === "completed_job").length;
    const quoted = transactions.filter((t) => t.transaction_type === "quote_request").length;
    const requested = transactions.filter((t) => t.transaction_type === "service_request").length;
    const referred = transactions.filter((t) => t.transaction_type === "referral").length;
    return [
      { name: "Completed Jobs", value: completed },
      { name: "Quote Requests", value: quoted },
      { name: "Service Requests", value: requested },
      { name: "Referrals", value: referred },
    ];
  }, [transactions]);

  return (
    <DashboardShell>
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3A3F3A]">Marketplace Revenue Engine</h1>
          <p className="text-sm text-[#687068] mt-1">Track marketplace activity, contractor transactions, and future revenue potential</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            Tracking Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Transactions", value: summary.totalTransactions, icon: "ri-exchange-line", color: "#3B82F6" },
          { label: "Jobs Completed", value: summary.jobsCompleted, icon: "ri-check-double-line", color: "#10B981" },
          { label: "Quote Requests", value: summary.quoteRequests, icon: "ri-file-list-3-line", color: "#8B5CF6" },
          { label: "Completed Value", value: formatCurrency(summary.completedValue), icon: "ri-funds-line", color: "#F59E0B" },
          { label: "Pipeline Value", value: formatCurrency(summary.pipelineValue), icon: "ri-hourglass-line", color: "#6366F1" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${kpi.color}15` }}>
                <i className={`${kpi.icon} text-sm`} style={{ color: kpi.color }}></i>
              </div>
              <span className="text-xs text-[#687068]">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-[#3A3F3A]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sub KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Service Requests", value: summary.serviceRequests, icon: "ri-add-circle-line", color: "#F59E0B" },
          { label: "Referrals", value: summary.referrals, icon: "ri-user-shared-line", color: "#6366F1" },
          { label: "Avg Transaction Value", value: formatCurrency(summary.avgTransactionValue), icon: "ri-scales-line", color: "#14B8A6" },
          { label: "Conversion Rate", value: summary.conversionRate + "%", icon: "ri-line-chart-line", color: "#EC4899" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${kpi.color}15` }}>
              <i className={`${kpi.icon} text-base`} style={{ color: kpi.color }}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-[#3A3F3A]">{kpi.value}</p>
              <p className="text-xs text-[#687068]">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1 w-fit">
        {[
          { key: "overview", label: "Revenue Overview", icon: "ri-funds-line" },
          { key: "transactions", label: "Transactions", icon: "ri-file-list-3-line" },
          { key: "models", label: "Revenue Models", icon: "ri-lightbulb-line" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.key ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"}`}
          >
            <i className={`${tab.icon} text-sm w-4 h-4 flex items-center justify-center`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* === REVENUE OVERVIEW TAB === */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-line-chart-line text-[#3B82F6] text-sm"></i>
              </div>
              Monthly Transaction Volume
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => "£" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: "12px" }}
                    formatter={(value: any, name: any) => ["£" + value.toLocaleString(), name]}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} fill="url(#completedGrad)" name="Completed Jobs" />
                  <Area type="monotone" dataKey="pipeline" stroke="#3B82F6" strokeWidth={2} fill="url(#pipelineGrad)" name="Pipeline" />
                  <Area type="monotone" dataKey="estimatedFees" stroke="#8B5CF6" strokeWidth={1.5} fill="url(#feeGrad)" name="Est. Fees" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Service Type Breakdown */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-pie-chart-line text-[#8B5CF6] text-sm"></i>
                </div>
                Value by Service Type
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {serviceBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                      formatter={(value: any) => ["£" + value.toLocaleString(), "Value"]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      formatter={(value: any) => <span className="text-[#687068] text-[11px]">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction Type Distribution */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-bar-chart-line text-[#10B981] text-sm"></i>
                </div>
                Transaction Type Distribution
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {typeBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Revenue Summary Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-funds-box-line text-[#F59E0B] text-sm"></i>
              </div>
              Revenue Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#F8FAFC] rounded-xl">
                <p className="text-xs text-[#94A3B8] mb-1">Total Transaction Value</p>
                <p className="text-xl font-bold text-[#3A3F3A]">{formatCurrency(summary.completedValue)}</p>
                <p className="text-[10px] text-[#94A3B8] mt-1">Completed jobs only</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-xl">
                <p className="text-xs text-[#94A3B8] mb-1">Estimated Fee Revenue</p>
                <p className="text-xl font-bold text-[#10B981]">{formatCurrency(summary.estimatedRevenue)}</p>
                <p className="text-[10px] text-[#94A3B8] mt-1">~10% avg fee rate</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-xl">
                <p className="text-xs text-[#94A3B8] mb-1">Pipeline Value</p>
                <p className="text-xl font-bold text-[#3B82F6]">{formatCurrency(summary.pipelineValue)}</p>
                <p className="text-[10px] text-[#94A3B8] mt-1">Approved + quoted</p>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-xl">
                <p className="text-xs text-[#94A3B8] mb-1">Conversion Rate</p>
                <p className="text-xl font-bold text-[#8B5CF6]">{summary.conversionRate}%</p>
                <p className="text-[10px] text-[#94A3B8] mt-1">Quotes to completed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TRANSACTIONS TAB === */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#687068] font-medium">Filter by status:</span>
              {[
                { key: "all", label: "All" },
                { key: "completed", label: "Completed" },
                { key: "approved", label: "Approved" },
                { key: "quoted", label: "Quoted" },
                { key: "requested", label: "Requested" },
                { key: "referred", label: "Referred" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer ${statusFilter === f.key ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
                >
                  {f.label}
                </button>
              ))}
              <div className="w-px h-6 bg-[#E2E8F0] mx-1"></div>
              <span className="text-xs text-[#687068] font-medium">Type:</span>
              {[
                { key: "all", label: "All" },
                { key: "completed_job", label: "Jobs" },
                { key: "quote_request", label: "Quotes" },
                { key: "service_request", label: "Requests" },
                { key: "referral", label: "Referrals" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap cursor-pointer ${typeFilter === f.key ? "bg-[#C28A78] text-white border-[#C28A78]" : "bg-white text-[#687068] border-[#E2E8F0] hover:border-[#C28A78]"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto bg-[#F1F5F9] rounded-full flex items-center justify-center mb-3">
                  <i className="ri-file-search-line text-[#94A3B8] text-xl"></i>
                </div>
                <p className="text-sm text-[#687068]">No transactions match your filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {filteredTransactions.map((tx) => {
                  const propName = tx.property_id ? (propertyNames[tx.property_id] || "Unknown Property") : "N/A";
                  const contName = tx.contractor_id ? (contractorNames[tx.contractor_id] || "Unknown Contractor") : "Pending";
                  const svcIcon = serviceTypeIconMap[tx.service_type] || "ri-building-4-line";
                  const svcColor = serviceTypeColorMap[tx.service_type] || "#687068";
                  const isExpanded = expandedTransaction === tx.id;

                  return (
                    <div key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-center gap-4 p-4">
                        {/* Service icon */}
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${svcColor}15` }}>
                          <i className={`${svcIcon} text-base`} style={{ color: svcColor }}></i>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#3A3F3A]">{tx.service_type}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeStyles[tx.transaction_type] || "bg-[#F1F5F9] text-[#687068]"}`}>
                              {transactionTypeLabels[tx.transaction_type] || tx.transaction_type}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyles[tx.status] || "bg-[#F1F5F9] text-[#687068]"}`}>
                              {statusLabels[tx.status] || tx.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                            <span>{propName}</span>
                            <span>·</span>
                            <span>{contName}</span>
                            {tx.referral_source && (
                              <>
                                <span>·</span>
                                <span>{referralSourceLabels[tx.referral_source] || tx.referral_source}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#3A3F3A]">{tx.value > 0 ? "£" + Number(tx.value).toLocaleString() : "—"}</p>
                          {tx.estimated_fee > 0 && (
                            <p className="text-[10px] text-[#10B981]">Fee: £{Number(tx.estimated_fee).toFixed(2)}</p>
                          )}
                        </div>

                        <button
                          onClick={() => setExpandedTransaction(isExpanded ? null : tx.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                        >
                          <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-[#94A3B8] text-sm`}></i>
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pl-[72px]">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Transaction ID</p>
                              <p className="text-xs text-[#3A3F3A] font-mono">{tx.id.slice(0, 12)}...</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Created</p>
                              <p className="text-xs text-[#3A3F3A]">{new Date(tx.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Completed</p>
                              <p className="text-xs text-[#3A3F3A]">{tx.completed_at ? new Date(tx.completed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#94A3B8]">Actual Fee</p>
                              <p className="text-xs font-medium text-[#10B981]">{Number(tx.actual_fee) > 0 ? "£" + Number(tx.actual_fee).toFixed(2) : "—"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === REVENUE MODELS TAB === */}
      {activeTab === "models" && (
        <div className="space-y-6">
          {/* Future Revenue Banner */}
          <div className="bg-[#C28A78]/5 border border-[#C28A78]/20 rounded-xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 bg-[#C28A78] rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-flash-line text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#C28A78]">No payments enabled yet — tracking only</h3>
              <p className="text-sm text-[#687068] mt-1">The marketplace revenue engine is currently in tracking mode. All contractor transactions are being recorded to build the data foundation for future monetization. Below are the planned revenue models.</p>
            </div>
          </div>

          {/* Revenue Model Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueModels.map((model) => (
              <div key={model.key} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:border-[#C28A78]/30 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#F1F5F9]">
                    <i className={`${model.icon} text-xl text-[#C28A78]`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-[#3A3F3A]">{model.name}</h4>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">Future</span>
                    </div>
                    <p className="text-sm text-[#687068] leading-relaxed">{model.description}</p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-[#F8FAFC] rounded-lg p-3">
                        <p className="text-[10px] text-[#94A3B8] mb-0.5">Fee Structure</p>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{model.feeStructure}</p>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-3">
                        <p className="text-[10px] text-[#94A3B8] mb-0.5">Est. Monthly Revenue</p>
                        <p className="text-sm font-semibold text-[#10B981]">{model.estimatedMonthly}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projected Revenue Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h3 className="text-sm font-semibold text-[#3A3F3A] mb-4 flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-funds-box-line text-[#8B5CF6] text-sm"></i>
              </div>
              Projected Annual Revenue (Conservative Estimate)
            </h3>
            <div className="space-y-2">
              {[
                { model: "Referral Fees (10% avg)", monthly: "£200", annual: "£2,400" },
                { model: "Lead Generation Fees", monthly: "£350", annual: "£4,200" },
                { model: "Featured Listings (est. 5 contractors)", monthly: "£375", annual: "£4,500" },
                { model: "Premium Accounts (est. 8 contractors)", monthly: "£400", annual: "£4,800" },
                { model: "Total Projected Revenue", monthly: "£1,325", annual: "£15,900", isTotal: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${row.isTotal ? "bg-[#C28A78] text-white" : "bg-[#F8FAFC]"}`}
                >
                  <span className={`text-sm ${row.isTotal ? "font-semibold text-white" : "text-[#3A3F3A]"}`}>{row.model}</span>
                  <div className="flex items-center gap-6">
                    <span className={`text-sm ${row.isTotal ? "font-semibold text-white" : "text-[#687068]"}`}>{row.monthly}/mo</span>
                    <span className={`text-sm font-bold ${row.isTotal ? "text-white" : "text-[#3A3F3A]"}`}>{row.annual}/yr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardShell>
  );
}