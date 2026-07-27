"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  monthlyIncomeData,
  propertyIncomeData,
  expenseBreakdown,
  rentalIncomeRows,
  maintenanceExpenditureRows,
  annualStatements,
  taxSummary,
  quarterlyBreakdown,
  profitLossRows,
} from "./AccountingData";

const TABS = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "rental", label: "Rental Income", icon: "ri-coins-line" },
  { id: "maintenance", label: "Maintenance", icon: "ri-tools-line" },
  { id: "annual", label: "Annual Statements", icon: "ri-calendar-check-line" },
  { id: "tax", label: "Tax Summary", icon: "ri-government-line" },
  { id: "pnl", label: "Profit & Loss", icon: "ri-line-chart-line" },
];

const COLORS = ["#C28A78", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#14B8A6", "#EC4899", "#D4A574", "#687068"];

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadStatement(stmt: typeof annualStatements[0]) {
  const rows = [
    ["LetHub Landlord Statement"],
    [`Tax Year: ${stmt.year}`],
    [`Period: ${stmt.period}`],
    [],
    ["Total Income", `£${stmt.totalIncome.toLocaleString()}`],
    ["Total Expenses", `£${stmt.totalExpenses.toLocaleString()}`],
    ["Net Profit", `£${stmt.netProfit.toLocaleString()}`],
    ["Tax Estimate", `£${stmt.taxEstimate.toLocaleString()}`],
    ["Profit After Tax", `£${(stmt.netProfit - stmt.taxEstimate).toLocaleString()}`],
  ];
  downloadCSV(`LetHub_Statement_${stmt.year}.csv`, rows);
}

export default function AccountingPage() {
  const [tab, setTab] = useState("overview");
  const [yearFilter, setYearFilter] = useState("2026");
  const [exportModal, setExportModal] = useState<string | null>(null);
  const [rentalSearch, setRentalSearch] = useState("");
  const [maintenanceSearch, setMaintenanceSearch] = useState("");
  const [maintenanceCategory, setMaintenanceCategory] = useState("All");
  const [rentalStatus, setRentalStatus] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const totalIncome = monthlyIncomeData.reduce((s, d) => s + d.income, 0);
  const totalExpenses = monthlyIncomeData.reduce((s, d) => s + d.expenses, 0);
  const totalNet = monthlyIncomeData.reduce((s, d) => s + d.net, 0);

  const filteredRental = rentalIncomeRows.filter((r) => {
    const matchesSearch = r.property.toLowerCase().includes(rentalSearch.toLowerCase()) || r.tenant.toLowerCase().includes(rentalSearch.toLowerCase());
    const matchesStatus = rentalStatus === "All" || r.status === rentalStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredMaintenance = maintenanceExpenditureRows.filter((m) => {
    const matchesSearch = m.property.toLowerCase().includes(maintenanceSearch.toLowerCase()) || m.description.toLowerCase().includes(maintenanceSearch.toLowerCase());
    const matchesCategory = maintenanceCategory === "All" || m.category === maintenanceCategory;
    return matchesSearch && matchesCategory;
  });

  const exportRentalCSV = () => {
    const rows = [["Property", "Tenant", "Rent", "Received", "Date", "Method", "Status"]];
    filteredRental.forEach((r) => rows.push([r.property, r.tenant, String(r.rent), String(r.received), r.date, r.method, r.status]));
    downloadCSV("rental_income.csv", rows);
  };

  const exportMaintenanceCSV = () => {
    const rows = [["Property", "Description", "Contractor", "Category", "Amount", "Date", "Status"]];
    filteredMaintenance.forEach((m) => rows.push([m.property, m.description, m.contractor, m.category, String(m.amount), m.date, m.status]));
    downloadCSV("maintenance_expenditure.csv", rows);
  };

  const exportProfitLossCSV = () => {
    const rows = [["Category", "Amount", "Type"]];
    profitLossRows.forEach((r) => rows.push([r.category, String(r.amount), r.type]));
    downloadCSV("profit_and_loss.csv", rows);
  };

  const exportTaxCSV = () => {
    const rows = [
      ["Tax Year", taxSummary.taxYear],
      ["Total Income", `£${taxSummary.totalIncome.toLocaleString()}`],
      ["Allowable Expenses", `£${taxSummary.allowableExpenses.toLocaleString()}`],
      ["Taxable Profit", `£${taxSummary.taxableProfit.toLocaleString()}`],
      ["Personal Allowance", `£${taxSummary.personalAllowance.toLocaleString()}`],
      ["Taxable Amount", `£${taxSummary.taxableAmount.toLocaleString()}`],
      ["Tax Liability", `£${taxSummary.taxLiability.toLocaleString()}`],
      ["Mortgage Tax Relief", `£${taxSummary.mortgageTaxRelief.toLocaleString()}`],
      ["Final Tax Due", `£${taxSummary.finalTaxDue.toLocaleString()}`],
      ["Due Date", taxSummary.dueDate],
    ];
    downloadCSV("tax_summary.csv", rows);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Landlord Accounting</h1>
            <p className="text-sm text-[#687068] mt-1">Financial overview, statements, and tax reporting</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#687068] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">
              <i className="ri-calendar-line mr-1"></i>
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === "year" ? null : "year")}
                className="text-xs text-[#3A3F3A] bg-white border border-[#D5D9D5] px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <i className="ri-calendar-2-line mr-1"></i>
                {yearFilter}
                <i className="ri-arrow-down-s-line text-[#94A3B8] ml-1"></i>
              </button>
              {dropdownOpen === "year" && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[100px]">
                  {["2026", "2025", "2024", "2023"].map((y) => (
                    <button
                      key={y}
                      onClick={() => { setYearFilter(y); setDropdownOpen(null); }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]"
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                <i className="ri-coins-line text-[#10B981] text-lg"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">+8.2% YoY</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">£{totalIncome.toLocaleString()}</p>
            <p className="text-sm text-[#687068]">Annual Income</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                <i className="ri-wallet-3-line text-[#EF4444] text-lg"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444]">+5.1% YoY</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">£{totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-[#687068]">Annual Expenses</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-line-chart-line text-[#3B82F6] text-lg"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">+10.5% YoY</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">£{totalNet.toLocaleString()}</p>
            <p className="text-sm text-[#687068]">Net Profit</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-percent-line text-[#8B5CF6] text-lg"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6]">Healthy</span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A]">{((totalNet / totalIncome) * 100).toFixed(1)}%</p>
            <p className="text-sm text-[#687068]">Net Profit Margin</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-1 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"
              }`}
            >
              <i className={`${t.icon} text-sm`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses Chart */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Income vs Expenses</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Monthly breakdown for {yearFilter}</p>
                </div>
                <div className="p-5 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyIncomeData}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D5D9D5" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#687068" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#687068" }} tickFormatter={(v) => `£${v}`} />
                      <Tooltip formatter={(value: any) => [`£${value.toLocaleString()}`, ""]} />
                      <Legend />
                      <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Expense Breakdown</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Where your money goes</p>
                </div>
                <div className="p-5 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="amount">
                        {expenseBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`£${value.toLocaleString()}`, ""]} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Property Performance */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Property Performance</h2>
                <p className="text-xs text-[#687068] mt-0.5">Income, expenses and net profit by property</p>
              </div>
              <div className="p-5 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyIncomeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D5D9D5" />
                    <XAxis dataKey="property" tick={{ fontSize: 11, fill: "#687068" }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12, fill: "#687068" }} tickFormatter={(v) => `£${v}`} />
                    <Tooltip formatter={(value: any) => [`£${value.toLocaleString()}`, ""]} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="net" name="Net Profit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Net Profit Trend */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Net Profit Trend</h2>
                <p className="text-xs text-[#687068] mt-0.5">Monthly net profit trajectory</p>
              </div>
              <div className="p-5 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyIncomeData}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D5D9D5" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#687068" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#687068" }} tickFormatter={(v) => `£${v}`} />
                    <Tooltip formatter={(value: any) => [`£${value.toLocaleString()}`, ""]} />
                    <Area type="monotone" dataKey="net" name="Net Profit" stroke="#3B82F6" fill="url(#netGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Rental Income Tab */}
        {tab === "rental" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white min-w-[260px]">
                  <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                  <input
                    type="text"
                    value={rentalSearch}
                    onChange={(e) => setRentalSearch(e.target.value)}
                    placeholder="Search property or tenant..."
                    className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === "rental-status" ? null : "rental-status")}
                    className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]"
                  >
                    <span>Status: {rentalStatus}</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                  </button>
                  {dropdownOpen === "rental-status" && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[140px]">
                      {["All", "Paid", "Partial", "Overdue"].map((s) => (
                        <button
                          key={s}
                          onClick={() => { setRentalStatus(s); setDropdownOpen(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#687068]">Total: £{filteredRental.reduce((s, r) => s + r.received, 0).toLocaleString()}</span>
                <button
                  onClick={exportRentalCSV}
                  className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-2"
                >
                  <i className="ri-download-line text-sm"></i>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Tenant</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Rent</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Received</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] hidden lg:table-cell">Method</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-[#687068]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredRental.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-[#3A3F3A] font-medium">{r.property}</td>
                        <td className="px-4 py-3 text-[#687068]">{r.tenant}</td>
                        <td className="px-4 py-3 text-[#3A3F3A]">£{r.rent.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#3A3F3A]">£{r.received.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#687068] hidden md:table-cell">{r.date}</td>
                        <td className="px-4 py-3 text-[#687068] hidden lg:table-cell">{r.method}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.status === "Paid" ? "bg-[#10B981]/10 text-[#10B981]" :
                            r.status === "Partial" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                            "bg-[#EF4444]/10 text-[#EF4444]"
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[#C28A78] hover:text-[#143828] font-medium text-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Expenditure Tab */}
        {tab === "maintenance" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white min-w-[260px]">
                  <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                  <input
                    type="text"
                    value={maintenanceSearch}
                    onChange={(e) => setMaintenanceSearch(e.target.value)}
                    placeholder="Search property or description..."
                    className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === "maint-cat" ? null : "maint-cat")}
                    className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A]"
                  >
                    <span>Category: {maintenanceCategory}</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                  </button>
                  {dropdownOpen === "maint-cat" && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[160px]">
                      {["All", "Plumbing", "Electrical", "Heating", "Roofing", "Security", "Appliance", "General"].map((c) => (
                        <button
                          key={c}
                          onClick={() => { setMaintenanceCategory(c); setDropdownOpen(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9]"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#687068]">Total: £{filteredMaintenance.reduce((s, m) => s + m.amount, 0).toLocaleString()}</span>
                <button
                  onClick={exportMaintenanceCSV}
                  className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-2"
                >
                  <i className="ri-download-line text-sm"></i>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Description</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Contractor</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-[#687068]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filteredMaintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-[#3A3F3A] font-medium">{m.property}</td>
                        <td className="px-4 py-3 text-[#687068]">{m.description}</td>
                        <td className="px-4 py-3 text-[#687068] hidden md:table-cell">{m.contractor}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">{m.category}</span>
                        </td>
                        <td className="px-4 py-3 text-[#3A3F3A] font-medium">£{m.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#687068] hidden md:table-cell">{m.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            m.status === "Paid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                          }`}>{m.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[#C28A78] hover:text-[#143828] font-medium text-sm">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Annual Statements Tab */}
        {tab === "annual" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5]">
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Year</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Period</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Total Income</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Total Expenses</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Net Profit</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Tax Estimate</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-[#687068]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {annualStatements.map((stmt) => (
                      <tr key={stmt.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-[#3A3F3A] font-medium">{stmt.year}</td>
                        <td className="px-4 py-3 text-[#687068]">{stmt.period}</td>
                        <td className="px-4 py-3 text-[#10B981] font-medium">£{stmt.totalIncome.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#EF4444] font-medium">£{stmt.totalExpenses.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#3B82F6] font-bold">£{stmt.netProfit.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#687068]">£{stmt.taxEstimate.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            stmt.status === "Finalised" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                          }`}>{stmt.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setExportModal(stmt.id)}
                              className="text-[#C28A78] hover:text-[#143828] font-medium text-sm"
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export format modal */}
            {exportModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#3A3F3A]">Download Statement</h3>
                    <button onClick={() => setExportModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                      <i className="ri-close-line text-[#687068]"></i>
                    </button>
                  </div>
                  <p className="text-sm text-[#687068] mb-4">Choose your preferred format for the {annualStatements.find((s) => s.id === exportModal)?.year} landlord statement.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        const stmt = annualStatements.find((s) => s.id === exportModal);
                        if (stmt) downloadStatement(stmt);
                        setExportModal(null);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-file-pdf-line text-[#EF4444] text-lg"></i>
                      </div>
                      <span className="text-sm font-medium text-[#3A3F3A]">PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        const stmt = annualStatements.find((s) => s.id === exportModal);
                        if (stmt) downloadStatement(stmt);
                        setExportModal(null);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-file-excel-line text-[#10B981] text-lg"></i>
                      </div>
                      <span className="text-sm font-medium text-[#3A3F3A]">Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        const stmt = annualStatements.find((s) => s.id === exportModal);
                        if (stmt) downloadStatement(stmt);
                        setExportModal(null);
                      }}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-file-text-line text-[#3B82F6] text-lg"></i>
                      </div>
                      <span className="text-sm font-medium text-[#3A3F3A]">CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tax Summary Tab */}
        {tab === "tax" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tax Summary Card */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Self Assessment Tax Summary</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Tax year {taxSummary.taxYear}</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Total Income</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">£{taxSummary.totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Allowable Expenses</p>
                      <p className="text-lg font-bold text-[#EF4444]">£{taxSummary.allowableExpenses.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Taxable Profit</p>
                      <p className="text-lg font-bold text-[#3B82F6]">£{taxSummary.taxableProfit.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Personal Allowance</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">£{taxSummary.personalAllowance.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Taxable Amount</p>
                      <p className="text-lg font-bold text-[#3A3F3A]">£{taxSummary.taxableAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Tax Liability</p>
                      <p className="text-lg font-bold text-[#EF4444]">£{taxSummary.taxLiability.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8FAFC]">
                      <p className="text-xs text-[#687068] mb-1">Mortgage Tax Relief</p>
                      <p className="text-lg font-bold text-[#10B981]">£{taxSummary.mortgageTaxRelief.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#C28A78]/5 border border-[#C28A78]/20">
                      <p className="text-xs text-[#C28A78] mb-1 font-medium">Final Tax Due</p>
                      <p className="text-xl font-bold text-[#C28A78]">£{taxSummary.finalTaxDue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">Payment Due</p>
                      <p className="text-xs text-[#687068]">Submit by {taxSummary.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#687068]">Amount Outstanding</p>
                      <p className="text-lg font-bold text-[#F59E0B]">£{taxSummary.amountOutstanding.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quarterly Breakdown */}
              <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#D5D9D5]">
                  <h2 className="font-semibold text-[#3A3F3A]">Quarterly Breakdown</h2>
                  <p className="text-xs text-[#687068] mt-0.5">Profit and tax by quarter</p>
                </div>
                <div className="p-5 space-y-4">
                  {quarterlyBreakdown.map((q) => (
                    <div key={q.quarter} className="p-3 rounded-lg border border-[#D5D9D5]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#3A3F3A]">{q.quarter}</span>
                        <span className="text-xs font-medium text-[#3B82F6]">£{q.profit.toLocaleString()} profit</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#687068]">Income</span>
                          <span className="text-[#10B981]">£{q.income.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${(q.income / 20000) * 100}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#687068]">Expenses</span>
                          <span className="text-[#EF4444]">£{q.expenses.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div className="h-full bg-[#EF4444] rounded-full" style={{ width: `${(q.expenses / 20000) * 100}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[#687068]">Tax Estimate</span>
                          <span className="text-[#F59E0B] font-medium">£{q.tax.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={exportTaxCSV}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <i className="ri-download-line text-sm"></i>
                Export Tax Summary
              </button>
            </div>
          </div>
        )}

        {/* Profit & Loss Tab */}
        {tab === "pnl" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Profit & Loss Statement</h2>
                <p className="text-xs text-[#687068] mt-0.5">Year ending 31 December {yearFilter}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {profitLossRows.map((row, i) => {
                      const isTotal = row.type.includes("total") || row.type === "net" || row.type === "final";
                      const isTax = row.type === "tax";
                      return (
                        <tr key={i} className={`${isTotal ? "bg-[#F8FAFC]" : ""} hover:bg-[#F1F5F9]/50 transition-colors`}>
                          <td className={`px-4 py-3 ${isTotal ? "font-bold text-[#3A3F3A]" : row.type === "income" ? "text-[#3A3F3A] pl-8" : row.type === "expense" ? "text-[#3A3F3A] pl-8" : isTax ? "text-[#F59E0B] font-medium" : "font-bold text-[#3A3F3A]"}`}>
                            {row.type === "income" || row.type === "expense" ? (
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
                                {row.category}
                              </span>
                            ) : (
                              row.category
                            )}
                          </td>
                          <td className={`px-4 py-3 text-right ${isTotal ? "font-bold text-[#3A3F3A]" : row.type === "income" || row.type === "income_total" ? "text-[#10B981]" : row.type === "expense" || row.type === "expense_total" ? "text-[#EF4444]" : isTax ? "text-[#F59E0B] font-medium" : row.type === "net" ? "text-[#3B82F6] font-bold" : "text-[#C28A78] font-bold"}`}>
                            £{row.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={exportProfitLossCSV}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <i className="ri-download-line text-sm"></i>
                Export P&L
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}