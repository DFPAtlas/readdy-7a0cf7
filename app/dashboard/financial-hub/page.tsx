"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  financialKPIs,
  propertyYields,
  ownerStatements,
  openBankingProviders,
  monthlyCashflowData,
  ownerPayoutBreakdown,
} from "./FinancialHubData";

const TABS = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "profitability", label: "Property Yield", icon: "ri-percent-line" },
  { id: "statements", label: "Owner Statements", icon: "ri-file-chart-line" },
  { id: "providers", label: "Open Banking", icon: "ri-bank-card-line" },
];

export default function FinancialHubPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statementFilter, setStatementFilter] = useState("all");
  const [selectedStatement, setSelectedStatement] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingOwner, setGeneratingOwner] = useState("");
  const [generatingMonth, setGeneratingMonth] = useState("June 2026");
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const handleGenerateStatement = () => {
    setTimeout(() => {
      setGenerateSuccess(true);
      setShowGenerateModal(false);
      setTimeout(() => setGenerateSuccess(false), 3000);
    }, 1500);
  };

  const filteredStatements = ownerStatements.filter((s) => {
    if (statementFilter === "all") return true;
    return s.status === statementFilter;
  });

  const selectedStatementData = ownerStatements.find((s) => s.id === selectedStatement);

  const totalYield = propertyYields.reduce((sum, p) => sum + p.annualRent, 0);
  const avgYield = (propertyYields.reduce((sum, p) => sum + p.yield, 0) / propertyYields.length).toFixed(1);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Financial Hub</h1>
            <p className="text-sm text-[#687068] mt-1">
              Rent tracking, owner statements, property profitability, and open banking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
            >
              <i className="ri-file-chart-line text-sm"></i>
              Generate Statement
            </button>
            <Link
              href="/dashboard/open-banking"
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] text-[#3A3F3A] text-sm font-medium rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
            >
              <i className="ri-bank-card-line text-sm"></i>
              Open Banking
            </Link>
          </div>
        </div>

        {/* Success Toast */}
        {generateSuccess && (
          <div className="fixed top-20 right-6 z-50 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
            <i className="ri-check-line text-lg"></i>
            <span className="text-sm font-medium">Owner statement generated!</span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialKPIs.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${kpi.icon} text-white text-lg`}></i>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  kpi.changeType === "up" ? "bg-[#10B981]/10 text-[#10B981]" : 
                  kpi.changeType === "down" ? "bg-[#EF4444]/10 text-[#EF4444]" : 
                  "bg-[#F1F5F9] text-[#687068]"
                }`}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{kpi.value}</p>
              <p className="text-sm text-[#687068] mt-1">{kpi.label}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{kpi.detail}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white border border-[#E2E8F0] rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#C28A78] text-white"
                  : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"
              }`}
            >
              <i className={`${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Cashflow Chart */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#3A3F3A]">Monthly Cashflow</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Rent received, owner payouts, and maintenance costs</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-[#687068]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Rent
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#687068]">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                    Payouts
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#687068]">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                    Maintenance
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyCashflowData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="maintGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#3A3F3A", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                        formatter={(value: any) => [`£${value.toLocaleString()}`, ""]}
                      />
                      <Area type="monotone" dataKey="rentReceived" stroke="#10B981" strokeWidth={2} fill="url(#rentGrad)" dot={false} />
                      <Area type="monotone" dataKey="ownerPayouts" stroke="#3B82F6" strokeWidth={2} fill="url(#payoutGrad)" dot={false} />
                      <Area type="monotone" dataKey="maintenance" stroke="#EF4444" strokeWidth={2} fill="url(#maintGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Owner Payout Breakdown */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#3A3F3A]">Owner Payout Breakdown (June 2026)</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Net payments to landlords after fees and deductions</p>
                </div>
                <span className="text-xs text-[#94A3B8]">
                  Total: £{ownerPayoutBreakdown.reduce((s, o) => s + o.netPayout, 0).toLocaleString()}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Owner</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Properties</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Total Rent</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Fees</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Maintenance</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Net Payout</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {ownerPayoutBreakdown.map((o) => (
                      <tr key={o.owner} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3 font-medium text-[#3A3F3A]">{o.owner}</td>
                        <td className="px-5 py-3 text-right text-[#687068]">{o.properties}</td>
                        <td className="px-5 py-3 text-right font-medium text-[#10B981]">£{o.totalRent.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[#EF4444]">£{o.fees.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[#F59E0B]">£{o.maintenance.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-bold text-[#3A3F3A]">£{o.netPayout.toLocaleString()}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            o.status === "Paid" ? "bg-[#10B981]/10 text-[#10B981]" :
                            o.status === "Processing" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                            o.status === "Pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                            "bg-[#F1F5F9] text-[#687068]"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#F8FAFC] font-semibold">
                      <td className="px-5 py-3 text-[#3A3F3A]">Total</td>
                      <td className="px-5 py-3 text-right">{ownerPayoutBreakdown.reduce((s, o) => s + o.properties, 0)}</td>
                      <td className="px-5 py-3 text-right text-[#10B981]">£{ownerPayoutBreakdown.reduce((s, o) => s + o.totalRent, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#EF4444]">£{ownerPayoutBreakdown.reduce((s, o) => s + o.fees, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#F59E0B]">£{ownerPayoutBreakdown.reduce((s, o) => s + o.maintenance, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#3A3F3A]">£{ownerPayoutBreakdown.reduce((s, o) => s + o.netPayout, 0).toLocaleString()}</td>
                      <td className="px-5 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/dashboard/rent-collection" className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-coins-line text-[#10B981] text-lg"></i>
                  </div>
                  <span className="text-sm font-medium text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors">Rent Collection</span>
                </div>
                <p className="text-xs text-[#687068]">Track who has paid and who hasn't</p>
              </Link>
              <Link href="/dashboard/arrears" className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-alarm-warning-line text-[#EF4444] text-lg"></i>
                  </div>
                  <span className="text-sm font-medium text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors">Arrears Management</span>
                </div>
                <p className="text-xs text-[#687068]">Manage late payments and recovery</p>
              </Link>
              <Link href="/dashboard/accounting" className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-line-chart-line text-[#3B82F6] text-lg"></i>
                  </div>
                  <span className="text-sm font-medium text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors">Accounting</span>
                </div>
                <p className="text-xs text-[#687068]">Tax summaries, P&L, annual statements</p>
              </Link>
            </div>
          </div>
        )}

        {/* PROPERTY YIELD TAB */}
        {activeTab === "profitability" && (
          <div className="space-y-6">
            {/* Yield Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center mb-3">
                  <i className="ri-home-4-line text-[#C28A78] text-lg"></i>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{propertyYields.length}</p>
                <p className="text-sm text-[#687068]">Properties Tracked</p>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center mb-3">
                  <i className="ri-money-pound-circle-line text-[#10B981] text-lg"></i>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">£{totalYield.toLocaleString()}</p>
                <p className="text-sm text-[#687068]">Annual Rental Income</p>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center mb-3">
                  <i className="ri-percent-line text-[#3B82F6] text-lg"></i>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{avgYield}%</p>
                <p className="text-sm text-[#687068]">Average Yield</p>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-3">
                  <i className="ri-bar-chart-2-line text-[#F59E0B] text-lg"></i>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">
                  £{propertyYields.reduce((s, p) => s + p.netIncome, 0).toLocaleString()}
                </p>
                <p className="text-sm text-[#687068]">Total Net Income</p>
              </div>
            </div>

            {/* Yield Chart */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Property Yield Comparison</h2>
                <p className="text-xs text-[#687068] mt-0.5">Annual rent vs net income with yield percentage</p>
              </div>
              <div className="p-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyYields} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="property" tick={{ fontSize: 10, fill: "#687068" }} interval={0} angle={-30} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#3A3F3A", border: "none", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                      formatter={(value: any) => [`£${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="annualRent" name="Annual Rent" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netIncome" name="Net Income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalExpenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yield Table */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Annual Rent</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Maintenance</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Compliance</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Net Income</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Property Value</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Yield</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {propertyYields.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-[#3A3F3A]">{p.property}</p>
                          <p className="text-xs text-[#94A3B8]">{p.address}</p>
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-[#10B981]">£{p.annualRent.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[#F59E0B]">£{p.maintenanceCost.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[#687068]">£{p.complianceCost.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-bold text-[#3A3F3A]">£{p.netIncome.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[#687068]">£{p.propertyValue.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-sm font-bold ${p.yield >= 5 ? "text-[#10B981]" : p.yield >= 4 ? "text-[#F59E0B]" : "text-[#EF4444]"}`}>
                            {p.yield}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`text-xs font-medium ${p.occupancyRate >= 95 ? "text-[#10B981]" : "text-[#F59E0B]"}`}>
                            {p.occupancyRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#F8FAFC] font-semibold">
                      <td className="px-5 py-3 text-[#3A3F3A]">Total / Average</td>
                      <td className="px-5 py-3 text-right text-[#10B981]">£{propertyYields.reduce((s, p) => s + p.annualRent, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#F59E0B]">£{propertyYields.reduce((s, p) => s + p.maintenanceCost, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#687068]">£{propertyYields.reduce((s, p) => s + p.complianceCost, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#3A3F3A]">£{propertyYields.reduce((s, p) => s + p.netIncome, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-[#687068]">£{propertyYields.reduce((s, p) => s + p.propertyValue, 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">{avgYield}%</td>
                      <td className="px-5 py-3 text-right">
                        {Math.round(propertyYields.reduce((s, p) => s + p.occupancyRate, 0) / propertyYields.length)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* OWNER STATEMENTS TAB */}
        {activeTab === "statements" && (
          <div className="space-y-6">
            {/* Statement Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "draft", label: "Drafts" },
                  { id: "ready", label: "Ready" },
                  { id: "sent", label: "Sent" },
                  { id: "paid", label: "Paid" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatementFilter(f.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      statementFilter === f.id ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
              >
                <i className="ri-add-line text-sm"></i>
                Generate New
              </button>
            </div>

            {/* Statements List */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Owner</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Period</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Rent Received</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Deductions</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Net Payment</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredStatements.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#C28A78] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {s.ownerName.charAt(0)}
                            </div>
                            <p className="font-medium text-[#3A3F3A]">{s.ownerName}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#687068]">{s.propertyName}</td>
                        <td className="px-5 py-3 text-[#687068]">{s.statementMonth} {s.statementYear}</td>
                        <td className="px-5 py-3 text-right font-medium text-[#10B981]">£{s.rentReceived.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right text-[#EF4444]">£{s.totalDeductions.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right font-bold text-[#3A3F3A]">£{s.netOwnerPayment.toLocaleString()}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            s.status === "sent" ? "bg-[#10B981]/10 text-[#10B981]" :
                            s.status === "ready" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                            s.status === "paid" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                            "bg-[#F1F5F9] text-[#687068]"
                          }`}>
                            {s.status === "sent" ? "Sent" : s.status === "ready" ? "Ready" : s.status === "paid" ? "Paid" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedStatement(s.id)}
                              className="text-xs text-[#C28A78] font-medium px-2 py-1 rounded hover:bg-[#F1F5F9] transition-colors"
                            >
                              View
                            </button>
                            {s.status === "draft" && (
                              <button className="text-xs text-[#F59E0B] font-medium px-2 py-1 rounded hover:bg-[#FEF3C7] transition-colors">
                                Finalise
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStatements.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i>
                  </div>
                  <p className="text-sm text-[#94A3B8]">No statements found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OPEN BANKING TAB */}
        {activeTab === "providers" && (
          <div className="space-y-6">
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-lightbulb-line text-[#10B981] text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A]">Provider-Agnostic Architecture</p>
                  <p className="text-xs text-[#687068] mt-0.5">
                    Lethub supports multiple open banking providers through a unified integration layer. 
                    Switch providers without changing your workflow. All bank feeds, payment initiation, and 
                    data enrichment flow through the same reconciliation engine.
                  </p>
                </div>
              </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openBankingProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                    provider.status === "coming_soon" ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        provider.status === "available" ? "bg-[#C28A78]/10" : "bg-[#F1F5F9]"
                      }`}>
                        <i className={`${provider.logo} text-lg ${provider.status === "available" ? "text-[#C28A78]" : "text-[#94A3B8]"}`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#3A3F3A]">{provider.name}</p>
                        <p className="text-[10px] text-[#94A3B8]">{provider.region}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      provider.status === "available" ? "bg-[#10B981]/10 text-[#10B981]" :
                      "bg-[#F1F5F9] text-[#94A3B8]"
                    }`}>
                      {provider.status === "available" ? "Available" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="text-xs text-[#687068] mb-3 leading-relaxed">{provider.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                        {provider.apiType === "open_banking" ? "Account Data" : provider.apiType === "payment_initiation" ? "Payments" : "Enrichment"}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">{provider.supportedBanks.toLocaleString()} banks</span>
                  </div>
                  {provider.status === "available" && (
                    <button className="w-full mt-3 py-2 border border-[#C28A78] text-[#C28A78] text-xs font-medium rounded-lg hover:bg-[#C28A78]/5 transition-colors">
                      Connect {provider.name}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Integration Note */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-git-branch-line text-[#8B5CF6] text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">How It Works</h3>
                  <p className="text-xs text-[#94A3B8]">Unified open banking integration layer</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center mb-2">
                    <i className="ri-plug-line text-[#3B82F6]"></i>
                  </div>
                  <p className="text-sm font-medium text-[#3A3F3A]">Connect</p>
                  <p className="text-xs text-[#687068] mt-1">Choose any supported provider. Lethub normalises all bank data into a standard format.</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center mb-2">
                    <i className="ri-git-merge-line text-[#10B981]"></i>
                  </div>
                  <p className="text-sm font-medium text-[#3A3F3A]">Reconcile</p>
                  <p className="text-xs text-[#687068] mt-1">Auto-match transactions to rents, invoices, and maintenance jobs. Manual override always available.</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center mb-2">
                    <i className="ri-bar-chart-2-line text-[#F59E0B]"></i>
                  </div>
                  <p className="text-sm font-medium text-[#3A3F3A]">Report</p>
                  <p className="text-xs text-[#687068] mt-1">Generate owner statements, tax reports, and cashflow forecasts automatically.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Statement Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowGenerateModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#3A3F3A]">Generate Owner Statement</h3>
                <button onClick={() => setShowGenerateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Owner</label>
                  <div className="relative">
                    <button
                      onClick={() => setGeneratingOwner(generatingOwner === "James Richardson" ? "" : "James Richardson")}
                      className="w-full flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-sm text-[#3A3F3A]"
                    >
                      <span>{generatingOwner || "Select owner..."}</span>
                      <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                    </button>
                    {generatingOwner === "James Richardson" && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-20">
                        {["James Richardson", "David Thompson", "Sarah Walker", "Margaret Hughes", "Robert Stewart"].map((o) => (
                          <button
                            key={o}
                            onClick={() => setGeneratingOwner(o)}
                            className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]"
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Statement Period</label>
                  <div className="relative">
                    <button className="w-full flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-sm text-[#3A3F3A]">
                      <span>{generatingMonth}</span>
                      <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                    </button>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-lg p-3">
                  <p className="text-xs text-[#687068]">Statement will include:</p>
                  <ul className="mt-2 space-y-1">
                    {["Rent received", "Management fees", "Maintenance costs", "Compliance & insurance costs", "Net owner payment calculation"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-[#3A3F3A]">
                        <i className="ri-check-line text-[#10B981] text-xs"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#EFF6FF] rounded-lg p-3 border border-[#BFDBFE]">
                  <p className="text-xs text-[#3B82F6] flex items-center gap-2">
                    <i className="ri-information-line"></i>
                    PDF generation ready for n8n automation. Statement data stored as JSON.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowGenerateModal(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleGenerateStatement}
                  className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-file-chart-line"></i>
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statement Detail Modal */}
        {selectedStatement && selectedStatementData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedStatement(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white">
                <div>
                  <h3 className="font-semibold text-[#3A3F3A]">{selectedStatementData.ownerName}</h3>
                  <p className="text-xs text-[#687068]">{selectedStatementData.statementMonth} {selectedStatementData.statementYear} Statement</p>
                </div>
                <button onClick={() => setSelectedStatement(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedStatementData.status === "sent" ? "bg-[#10B981]/10 text-[#10B981]" :
                    selectedStatementData.status === "ready" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                    selectedStatementData.status === "paid" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                    "bg-[#F1F5F9] text-[#687068]"
                  }`}>
                    {selectedStatementData.status === "sent" ? "Sent" : selectedStatementData.status === "ready" ? "Ready" : selectedStatementData.status === "paid" ? "Paid" : "Draft"}
                  </span>
                  <span className="text-xs text-[#94A3B8]">Generated {selectedStatementData.generatedAt}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F0FDF4] rounded-lg p-3 border border-[#BBF7D0]">
                    <p className="text-xs text-[#687068]">Rent Received</p>
                    <p className="text-lg font-bold text-[#10B981]">£{selectedStatementData.rentReceived.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#FFF7ED] rounded-lg p-3 border border-[#FED7AA]">
                    <p className="text-xs text-[#687068]">Outstanding</p>
                    <p className="text-lg font-bold text-[#F59E0B]">£{selectedStatementData.rentOutstanding.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#94A3B8]">Deductions</p>
                  <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm text-[#687068]">Management Fees</span>
                    <span className="text-sm font-medium text-[#EF4444]">£{selectedStatementData.managementFees.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm text-[#687068]">Maintenance</span>
                    <span className="text-sm font-medium text-[#EF4444]">£{selectedStatementData.maintenanceSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm text-[#687068]">Compliance</span>
                    <span className="text-sm font-medium text-[#EF4444]">£{selectedStatementData.complianceCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm text-[#687068]">Insurance</span>
                    <span className="text-sm font-medium text-[#EF4444]">£{selectedStatementData.insuranceCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
                    <span className="text-sm font-medium text-[#3A3F3A]">Total Deductions</span>
                    <span className="text-sm font-bold text-[#EF4444]">£{selectedStatementData.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-[#C28A78]/5 rounded-lg p-4 border border-[#C28A78]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#C28A78]">Net Owner Payment</span>
                    <span className="text-xl font-bold text-[#C28A78]">£{selectedStatementData.netOwnerPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E2E8F0]">
                <button onClick={() => setSelectedStatement(null)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors">
                  Close
                </button>
                <button className="flex-1 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors flex items-center justify-center gap-2">
                  <i className="ri-download-line text-sm"></i>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}