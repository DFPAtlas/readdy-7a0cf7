"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import FinancialActionCentre from "@/components/dashboard/FinancialActionCentre";
import { reconciliationStatusConfig, FinancialActionItem, FINANCIAL_ACCURACY_DISCLAIMER } from "@/lib/financialStatus";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  bankAccounts,
  transactions,
  propertyProfitability,
  rentReconciliations,
  financialReports,
  landlordSummaries,
  incomeExpenseData,
} from "./OpenBankingData";

const demoFinancialActions: FinancialActionItem[] = [
  { id: "ob1", priority: "high", tenant: "Lisa Chen", property: "Flat 7 Park View", amount: 1200, issue: "Unmatched bank transaction — needs review", ageLabel: "3 days", action: "Match Now" },
  { id: "ob2", priority: "medium", tenant: "John Miller", property: "12 Rose Avenue", amount: 1850, issue: "Amount mismatch — expected £1,850, received £1,800", ageLabel: "2 days", action: "Review" },
  { id: "ob3", priority: "medium", tenant: "—", property: "Unknown", amount: 450, issue: "Unidentified bank credit", ageLabel: "5 days", action: "Investigate" },
];

const pieData = [
  { name: "Rent", value: 16800, color: "#C28A78" },
  { name: "Maintenance", value: 1850, color: "#EF4444" },
  { name: "Insurance", value: 650, color: "#F59E0B" },
  { name: "Council Tax", value: 1200, color: "#3B82F6" },
  { name: "Management", value: 520, color: "#8B5CF6" },
];

export default function OpenBankingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBank, setSelectedBank] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("this_month");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("csv");
  const [matchFilter, setMatchFilter] = useState("all");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [financialActions] = useState<FinancialActionItem[]>(demoFinancialActions);

  const totalIncome = transactions.filter((t) => t.type === "income" && t.matched).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense" && t.matched).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const outstandingRent = rentReconciliations.filter((r) => r.status === "overdue" || r.status === "partial").reduce((sum, r) => sum + (r.amountShort || r.amount), 0);
  const maintenanceCosts = transactions.filter((t) => t.category === "Maintenance" && t.matched).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;
  const reconciliationRate = Math.round((transactions.filter((t) => t.matchStatus === "reconciled").length / transactions.length) * 100);
  const unmatchedCount = transactions.filter((t) => t.matchStatus === "unmatched" || t.matchStatus === "pending").length;

  const filteredTransactions = transactions.filter((t) => {
    if (selectedBank !== "all" && t.bank !== selectedBank) return false;
    if (matchFilter !== "all" && t.matchStatus !== matchFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.description.toLowerCase().includes(q) || t.property?.toLowerCase().includes(q) || t.tenant?.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExport = (reportId: string, format: string) => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      setExportSuccess(true);
      setTimeout(() => { setExportSuccess(false); setShowExportModal(false); }, 2500);
    }, 1500);
  };

  const handleConfirmMatch = () => {
    setShowMatchModal(false);
    setSelectedTransaction(null);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Open Banking</h1>
            <p className="text-sm text-[#687068] mt-1">
              {unmatchedCount} unmatched · {reconciliationRate}% reconciled · {bankAccounts.filter((b) => b.status === "connected").length} accounts connected
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">
              <i className="ri-download-line text-sm"></i>
              Export Reports
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-xl p-1 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: "ri-dashboard-line" },
            { id: "transactions", label: "Transactions", icon: "ri-bank-card-line" },
            { id: "reconciliation", label: "Reconciliation", icon: "ri-check-double-line" },
            { id: "profitability", label: "Profitability", icon: "ri-bar-chart-2-line" },
            { id: "reports", label: "Reports", icon: "ri-file-list-3-line" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"
              }`}
            >
              <i className={`${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
          <Link href="/dashboard/open-banking/foundation" className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap text-[#6366F1] hover:text-[#4F46E5] hover:bg-[#6366F1]/5 border border-[#6366F1]/20">
            <i className="ri-database-2-line"></i>
            Setup
          </Link>
        </div>

        {exportSuccess && (
          <div className="fixed top-20 right-6 z-50 bg-[#7A9A7E] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <i className="ri-check-line text-lg"></i>
            <span className="text-sm font-medium">Report exported</span>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <FinancialActionCentre actions={financialActions} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bankAccounts.map((bank) => (
                <div key={bank.id} className="bg-white rounded-xl border border-[#D5D9D5] p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-card-line text-[#C28A78] text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{bank.bank}</p>
                        <p className="text-xs text-[#94A3B8]">{bank.accountNumber}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${bank.status === "connected" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                      {bank.status === "connected" ? "Connected" : "Syncing"}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#3A3F3A] mb-1">£{bank.balance.toLocaleString()}</p>
                  <p className="text-[10px] text-[#94A3B8]">{bank.transactions} transactions · {bank.lastSync}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Income", value: `£${totalIncome.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#7A9A7E]", sub: "Reconciled" },
                { label: "Outstanding Rent", value: `£${outstandingRent.toLocaleString()}`, icon: "ri-alarm-warning-line", color: "bg-[#C46868]", sub: "Overdue" },
                { label: "Maintenance", value: `£${maintenanceCosts.toLocaleString()}`, icon: "ri-tools-line", color: "bg-[#F59E0B]", sub: "This month" },
                { label: "Net Profit", value: `£${netProfit.toLocaleString()}`, icon: "ri-bar-chart-2-line", color: "bg-[#C28A78]", sub: "After expenses" },
                { label: "Reconciled", value: `${reconciliationRate}%`, icon: "ri-check-double-line", color: "bg-[#3B82F6]", sub: `${unmatchedCount} unmatched` },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`${card.icon} text-white text-base`}></i>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#3A3F3A]">{card.value}</p>
                      <p className="text-xs text-[#687068]">{card.label}</p>
                      <p className="text-[10px] text-[#94A3B8]">{card.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5] flex items-center justify-between">
                  <h2 className="font-semibold text-[#3A3F3A]">Income vs Expenses</h2>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-[#687068]"><span className="w-2 h-2 rounded-full bg-[#7A9A7E]"></span> Income</span>
                    <span className="flex items-center gap-1 text-[#687068]"><span className="w-2 h-2 rounded-full bg-[#C46868]"></span> Expenses</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={incomeExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7A9A7E" stopOpacity={0.2} /><stop offset="95%" stopColor="#7A9A7E" stopOpacity={0} /></linearGradient>
                          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C46868" stopOpacity={0.2} /><stop offset="95%" stopColor="#C46868" stopOpacity={0} /></linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#3A3F3A", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                        <Area type="monotone" dataKey="income" stroke="#7A9A7E" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
                        <Area type="monotone" dataKey="expenses" stroke="#C46868" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Expense Breakdown</h2>
                </div>
                <div className="p-5">
                  <div className="h-56 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#3A3F3A", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
                        <Legend iconType="circle" iconSize={8} formatter={(value: any) => (<span style={{ fontSize: "11px", color: "#687068" }}>{value}</span>)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-check-double-line text-[#7A9A7E] text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">Reconciliation Status</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-[#687068]">Reconciled</span><span className="font-bold text-[#7A9A7E]">{reconciliationRate}%</span></div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#7A9A7E] rounded-full" style={{ width: `${reconciliationRate}%` }}></div></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-[#687068]">Unmatched</span><span className="font-bold text-[#C46868]">{unmatchedCount} items</span></div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#C46868] rounded-full" style={{ width: `${(unmatchedCount / transactions.length) * 100}%` }}></div></div>
                </div>
                <button onClick={() => setActiveTab("transactions")} className="w-full mt-4 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#C28A78] font-medium hover:bg-[#F1F5F9] transition-colors">
                  Review Unmatched Transactions
                </button>
              </div>

              <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                <h3 className="font-semibold text-[#3A3F3A] mb-3">Outstanding Rent</h3>
                <div className="space-y-3">
                  {rentReconciliations.filter((r) => r.status === "overdue" || r.status === "partial").slice(0, 4).map((r) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{r.tenant}</p>
                        <p className="text-xs text-[#94A3B8]">{r.property}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#C46868]">£{r.status === "partial" ? (r.amountShort || r.amount).toLocaleString() : r.amount.toLocaleString()}</p>
                        <p className="text-xs text-[#F59E0B]">{r.status === "partial" ? "Partial" : `${r.daysLate} days`}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab("reconciliation")} className="w-full mt-4 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#C28A78] font-medium hover:bg-[#F1F5F9] transition-colors">
                  View Reconciliation
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Recent Transactions</h2>
                <button onClick={() => setActiveTab("transactions")} className="text-sm text-[#C28A78] font-medium hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Description</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Category</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {transactions.slice(0, 6).map((t) => {
                      const rs = reconciliationStatusConfig[t.matchStatus as keyof typeof reconciliationStatusConfig] || reconciliationStatusConfig.unmatched;
                      return (
                        <tr key={t.id} className="hover:bg-[#FBF9F4] transition-colors">
                          <td className="px-5 py-3 text-[#687068]">{t.date}</td>
                          <td className="px-5 py-3">
                            <p className="font-medium text-[#3A3F3A]">{t.description}</p>
                            {t.property && <p className="text-xs text-[#94A3B8]">{t.property}</p>}
                          </td>
                          <td className="px-5 py-3"><span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{t.category}</span></td>
                          <td className="px-5 py-3 text-right font-medium" style={{ color: t.type === "income" ? "#7A9A7E" : "#C46868" }}>
                            {t.type === "income" ? "+" : "-"}£{Math.abs(t.amount).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rs.bg}`}>{rs.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[10px] text-[#94A3B8] text-center">{FINANCIAL_ACCURACY_DISCLAIMER}</p>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl border border-[#D5D9D5] p-4">
              <div className="flex items-center gap-2 flex-1 bg-[#FBF9F4] rounded-lg px-3 py-2">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent" />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                <button onClick={() => setSelectedBank("all")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedBank === "all" ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068]"}`}>All</button>
                {["Barclays", "Monzo", "NatWest"].map((b) => (
                  <button key={b} onClick={() => setSelectedBank(b)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedBank === b ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068]"}`}>{b}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All" },
                { key: "unmatched", label: "Unmatched" },
                { key: "pending", label: "Pending" },
                { key: "reconciled", label: "Reconciled" },
              ].map((f) => (
                <button key={f.key} onClick={() => setMatchFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${matchFilter === f.key ? "bg-[#C28A78] text-white" : "bg-[#FBF9F4] text-[#687068] hover:bg-[#D5D9D5]"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Date</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Description</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Bank</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Category</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredTransactions.map((t) => {
                      const rs = reconciliationStatusConfig[t.matchStatus as keyof typeof reconciliationStatusConfig] || reconciliationStatusConfig.unmatched;
                      return (
                        <tr key={t.id} className="hover:bg-[#FBF9F4] transition-colors">
                          <td className="px-5 py-3 text-[#687068]">{t.date}</td>
                          <td className="px-5 py-3"><p className="font-medium text-[#3A3F3A]">{t.description}</p></td>
                          <td className="px-5 py-3"><span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{t.bank}</span></td>
                          <td className="px-5 py-3"><span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{t.category}</span></td>
                          <td className="px-5 py-3 text-right font-medium" style={{ color: t.type === "income" ? "#7A9A7E" : "#C46868" }}>
                            {t.type === "income" ? "+" : "-"}£{Math.abs(t.amount).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rs.bg}`}>{rs.label}</span></td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { setSelectedTransaction(t.id); setShowMatchModal(true); }} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${t.matchStatus === "reconciled" ? "bg-[#F1F5F9] text-[#687068]" : "bg-[#C28A78] text-white hover:bg-[#143828]"}`}>
                              {t.matchStatus === "reconciled" ? "View" : "Match"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredTransactions.length === 0 && (
                <div className="px-5 py-8 text-center"><p className="text-sm text-[#94A3B8]">No transactions found</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reconciliation" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Expected", value: `£${rentReconciliations.reduce((s, r) => s + r.amount, 0).toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#C28A78]" },
                { label: "Received", value: `£${rentReconciliations.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0).toLocaleString()}`, icon: "ri-check-double-line", color: "bg-[#7A9A7E]" },
                { label: "Outstanding", value: `£${outstandingRent.toLocaleString()}`, icon: "ri-alarm-warning-line", color: "bg-[#C46868]" },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                  <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                    <i className={`${card.icon} text-white text-lg`}></i>
                  </div>
                  <p className="text-2xl font-bold text-[#3A3F3A]">{card.value}</p>
                  <p className="text-sm text-[#687068] mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Rent Reconciliation</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {rentReconciliations.map((r) => (
                      <tr key={r.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3 font-medium text-[#3A3F3A]">{r.tenant}</td>
                        <td className="px-5 py-3 text-[#687068]">{r.property}</td>
                        <td className="px-5 py-3 text-right font-medium text-[#3A3F3A]">£{r.amount.toLocaleString()}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${r.status === "paid" ? "bg-[#7A9A7E]/10 text-[#7A9A7E]" : r.status === "partial" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#C46868]/10 text-[#C46868]"}`}>
                            {r.status === "paid" ? "Paid" : r.status === "partial" ? "Partial" : "Overdue"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-xs text-[#C28A78] font-medium px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
                            {r.status === "overdue" ? "Chase" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profitability" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Property Profitability</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Income</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Expenses</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Net Profit</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Margin</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {propertyProfitability.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-3 font-medium text-[#3A3F3A]">{p.property}</td>
                      <td className="px-5 py-3 text-right text-[#7A9A7E]">£{p.monthlyIncome.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#C46868]">£{p.monthlyExpenses.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-bold text-[#3A3F3A]">£{p.netProfit.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#7A9A7E]">{p.profitMargin}%</td>
                      <td className="px-5 py-3 text-right text-[#3A3F3A]">{p.roi}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Generated Reports</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Report</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Period</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Generated</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {financialReports.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FBF9F4] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                            <i className="ri-file-list-3-line text-[#C28A78] text-sm"></i>
                          </div>
                          <p className="font-medium text-[#3A3F3A]">{r.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#687068]">{r.period}</td>
                      <td className="px-5 py-3 text-[#687068]">{r.generatedAt}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleExport(r.id, "csv")} className="text-xs text-[#687068] hover:text-[#C28A78] px-2 py-1 rounded hover:bg-[#F1F5F9]">CSV</button>
                          <button onClick={() => handleExport(r.id, "pdf")} className="text-xs text-[#687068] hover:text-[#C28A78] px-2 py-1 rounded hover:bg-[#F1F5F9]">PDF</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Export Reports</h3>
              <button onClick={() => setShowExportModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { format: "csv", label: "CSV", icon: "ri-file-text-line", desc: "Best for data analysis" },
                { format: "excel", label: "Excel", icon: "ri-file-excel-line", desc: "Formatted with formulas" },
                { format: "pdf", label: "PDF", icon: "ri-file-pdf-line", desc: "Print-ready reports" },
              ].map((option) => (
                <button key={option.format} onClick={() => setExportType(option.format)} className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${exportType === option.format ? "border-[#C28A78] bg-[#C28A78]/5" : "border-[#D5D9D5] hover:border-[#C28A78]/30"}`}>
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0"><i className={`${option.icon} text-[#C28A78] text-lg`}></i></div>
                  <div><p className="text-sm font-medium text-[#3A3F3A]">{option.label}</p><p className="text-xs text-[#94A3B8]">{option.desc}</p></div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)} className="flex-1 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9]">Cancel</button>
              <button onClick={() => handleExport("fr1", exportType)} disabled={generatingReport} className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors flex items-center justify-center gap-2">
                {generatingReport ? <><i className="ri-loader-4-line animate-spin"></i>Generating...</> : <><i className="ri-download-line"></i>Export All</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMatchModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMatchModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#3A3F3A]">Match Transaction</h3>
              <button onClick={() => setShowMatchModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="bg-[#FBF9F4] rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-[#3A3F3A]">{transactions.find((t) => t.id === selectedTransaction)?.description}</p>
              <p className="text-lg font-bold text-[#3A3F3A] mt-2">£{Math.abs(transactions.find((t) => t.id === selectedTransaction)?.amount || 0).toLocaleString()}</p>
            </div>
            <p className="text-sm text-[#687068] mb-3">Select a match source:</p>
            <div className="space-y-2 mb-6">
              {[
                { label: "Match to tenant rent", value: "rent" },
                { label: "Match to maintenance job", value: "maintenance" },
                { label: "Match to property expense", value: "expense" },
                { label: "Mark as unallocated", value: "unallocated" },
              ].map((option) => (
                <button key={option.value} onClick={() => handleConfirmMatch()} className="w-full text-left p-3 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] hover:bg-[#C28A78]/5 transition-colors text-sm font-medium text-[#3A3F3A]">
                  {option.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowMatchModal(false)} className="w-full py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9]">Cancel</button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}