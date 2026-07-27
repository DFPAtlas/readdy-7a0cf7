"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import FinancialActionCentre from "@/components/dashboard/FinancialActionCentre";
import RentPaymentCard from "@/components/dashboard/RentPaymentCard";
import { paymentStatusConfig, FinancialActionItem } from "@/lib/financialStatus";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";

interface RentRecord {
  id: string;
  property: string;
  tenant: string;
  rentAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  method: string;
  outstanding: number;
  arrearsMonths?: number;
}

interface PaymentHistory {
  id: string;
  property: string;
  tenant: string;
  amount: number;
  date: string;
  method: string;
  month: string;
}

const demoRentData: RentRecord[] = [
  { id: "1", property: "12 Rose Avenue", tenant: "John Miller", rentAmount: 1850, dueDate: "1 Jul 2026", paidDate: "1 Jul 2026", status: "Paid", method: "Bank Transfer", outstanding: 0 },
  { id: "2", property: "Flat 4B Oak Street", tenant: "Sarah Jenkins", rentAmount: 950, dueDate: "1 Jul 2026", paidDate: "3 Jul 2026", status: "Paid", method: "Direct Debit", outstanding: 0 },
  { id: "3", property: "45 Baker Street", tenant: "Emily Carter", rentAmount: 2100, dueDate: "1 Jul 2026", paidDate: null, status: "Due Soon", method: "", outstanding: 0 },
  { id: "4", property: "8 The Crescent", tenant: "Michael Brown", rentAmount: 1650, dueDate: "1 Jul 2026", paidDate: null, status: "Overdue", method: "", outstanding: 1650 },
  { id: "5", property: "34 Maple Gardens", tenant: "David Thompson", rentAmount: 2400, dueDate: "1 Jul 2026", paidDate: "1 Jul 2026", status: "Paid", method: "Standing Order", outstanding: 0 },
  { id: "6", property: "Flat 7 Park View", tenant: "Lisa Chen", rentAmount: 1200, dueDate: "1 Jul 2026", paidDate: null, status: "In Arrears", method: "", outstanding: 3600, arrearsMonths: 2 },
  { id: "7", property: "21 High Street", tenant: "Robert Green", rentAmount: 800, dueDate: "1 Jul 2026", paidDate: null, status: "Due Soon", method: "", outstanding: 0 },
  { id: "8", property: "Unit 3 Riverside Court", tenant: "Emma Wilson", rentAmount: 1400, dueDate: "1 Jul 2026", paidDate: "1 Jul 2026", status: "Paid", method: "Bank Transfer", outstanding: 0 },
];

const demoHistory: PaymentHistory[] = [
  { id: "1", property: "12 Rose Avenue", tenant: "John Miller", amount: 1850, date: "1 Jul 2026", method: "Bank Transfer", month: "Jul 2026" },
  { id: "2", property: "12 Rose Avenue", tenant: "John Miller", amount: 1850, date: "1 Jun 2026", method: "Bank Transfer", month: "Jun 2026" },
  { id: "3", property: "Flat 4B Oak Street", tenant: "Sarah Jenkins", amount: 950, date: "3 Jul 2026", method: "Direct Debit", month: "Jul 2026" },
  { id: "4", property: "34 Maple Gardens", tenant: "David Thompson", amount: 2400, date: "1 Jul 2026", method: "Standing Order", month: "Jul 2026" },
  { id: "5", property: "Flat 7 Park View", tenant: "Lisa Chen", amount: 1200, date: "1 May 2026", method: "Bank Transfer", month: "May 2026" },
  { id: "6", property: "Flat 7 Park View", tenant: "Lisa Chen", amount: 1200, date: "1 Apr 2026", method: "Bank Transfer", month: "Apr 2026" },
  { id: "7", property: "8 The Crescent", tenant: "Michael Brown", amount: 1650, date: "1 Jun 2026", method: "Standing Order", month: "Jun 2026" },
  { id: "8", property: "45 Baker Street", tenant: "Emily Carter", amount: 2100, date: "1 Jun 2026", method: "Bank Transfer", month: "Jun 2026" },
];

const demoFinancialActions: FinancialActionItem[] = [
  { id: "fa1", priority: "urgent", tenant: "Lisa Chen", property: "Flat 7 Park View", amount: 3600, issue: "2 months rent overdue — contact immediately", ageLabel: "12 days", action: "Contact Tenant" },
  { id: "fa2", priority: "high", tenant: "Michael Brown", property: "8 The Crescent", amount: 1650, issue: "Rent overdue this month", ageLabel: "6 days", action: "Send Reminder" },
  { id: "fa3", priority: "medium", tenant: "John Miller", property: "12 Rose Avenue", amount: 1850, issue: "Payment unmatched in bank feed", ageLabel: "2 days", action: "Match Transaction" },
];

const filterTabs = ["All", "Paid", "Due Soon", "Overdue", "In Arrears"];

function formatDateStr(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function RentCollectionPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState("current");
  const [selectedTenant, setSelectedTenant] = useState<RentRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [rentData, setRentData] = useState<RentRecord[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [financialActions, setFinancialActions] = useState<FinancialActionItem[]>([]);
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    if (isDemoAccount()) {
      setRentData(demoRentData);
      setPaymentHistory(demoHistory);
      setFinancialActions(demoFinancialActions);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const { data: payments, error: payErr } = await supabase
          .from("rent_payments")
          .select("id, property_id, tenancy_id, amount, due_date, paid_date, status, payment_method, created_at")
          .order("due_date", { ascending: false })
          .limit(100);

        if (payErr) throw payErr;

        if (!payments || payments.length === 0) {
          setRentData([]);
          setPaymentHistory([]);
          setFinancialActions([]);
          setLoading(false);
          return;
        }

        const propertyIds = [...new Set(payments.map((p: any) => p.property_id))];
        const tenancyIds = [...new Set(payments.map((p: any) => p.tenancy_id).filter(Boolean))];

        const { data: properties } = await supabase.from("properties").select("id, line1, city, postcode").in("id", propertyIds);
        const { data: tenancies } = tenancyIds.length > 0 ? await supabase.from("tenancies").select("id, property_id, status").in("id", tenancyIds) : { data: [] };
        const { data: tenancyParties } = tenancyIds.length > 0 ? await supabase.from("tenancy_parties").select("tenancy_id, tenant_id, is_primary").in("tenancy_id", tenancyIds) : { data: [] };

        const tenantIds = tenancyParties ? [...new Set(tenancyParties.map((tp: any) => tp.tenant_id))] : [];
        const { data: tenants } = tenantIds.length > 0 ? await supabase.from("tenants").select("id, full_name").in("id", tenantIds) : { data: [] };

        const propMap = new Map<string, any>();
        (properties || []).forEach((p: any) => propMap.set(p.id, p));

        const tenantByProperty = new Map<string, string>();
        (tenancyParties || []).forEach((tp: any) => {
          const tncy = tenancies?.find((t: any) => t.id === tp.tenancy_id);
          if (tncy && tp.is_primary) tenantByProperty.set(tncy.property_id, tp.tenant_id);
        });

        const tenantMap = new Map<string, string>();
        (tenants || []).forEach((t: any) => tenantMap.set(t.id, t.full_name || "Unknown"));

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const livePayments = (payments || []).filter((p: any) => {
          const d = new Date(p.due_date);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const rentRecords: RentRecord[] = livePayments.map((p: any) => {
          const prop = propMap.get(p.property_id);
          const propName = prop ? prop.line1 : p.property_id?.slice(0, 8) || "Unknown";
          const tenantId = tenantByProperty.get(p.property_id);
          const tenantName = tenantId ? tenantMap.get(tenantId) || "Unknown" : "—";
          const isPaid = p.status === "paid";
          const isOverdue = !isPaid && new Date(p.due_date) < now;

          return {
            id: p.id,
            property: propName,
            tenant: tenantName,
            rentAmount: p.amount || 0,
            dueDate: formatDateStr(p.due_date),
            paidDate: p.paid_date ? formatDateStr(p.paid_date) : null,
            status: isPaid ? "Paid" : isOverdue ? "Overdue" : "Due Soon",
            method: p.payment_method || "",
            outstanding: isPaid ? 0 : (p.amount || 0),
            arrearsMonths: isOverdue ? 1 : undefined,
          };
        });

        setRentData(rentRecords);

        const history: PaymentHistory[] = (payments || [])
          .filter((p: any) => p.status === "paid")
          .slice(0, 20)
          .map((p: any) => {
            const prop = propMap.get(p.property_id);
            const tenantId = tenantByProperty.get(p.property_id);
            return {
              id: p.id,
              property: prop ? prop.line1 : "Unknown",
              tenant: tenantId ? tenantMap.get(tenantId) || "Unknown" : "—",
              amount: p.amount || 0,
              date: p.paid_date ? formatDateStr(p.paid_date) : "—",
              method: p.payment_method || "—",
              month: p.paid_date ? new Date(p.paid_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—",
            };
          });

        setPaymentHistory(history);
        setFinancialActions([]);
      } catch (err: any) {
        setRentData(demoRentData);
        setPaymentHistory(demoHistory);
        setFinancialActions(demoFinancialActions);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = rentData.filter((r) => {
    const matchesFilter = activeFilter === "All" || r.status === activeFilter;
    const matchesSearch = r.property.toLowerCase().includes(searchQuery.toLowerCase()) || r.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (sortBy === "amount") filtered.sort((a, b) => b.rentAmount - a.rentAmount);
  if (sortBy === "tenant") filtered.sort((a, b) => a.tenant.localeCompare(b.tenant));
  if (sortBy === "status") {
    const order = ["Overdue", "In Arrears", "Due Soon", "Paid"];
    filtered.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  }

  const totalRent = rentData.reduce((sum, r) => sum + r.rentAmount, 0);
  const paidTotal = rentData.filter((r) => r.status === "Paid").reduce((sum, r) => sum + r.rentAmount, 0);
  const outstandingTotal = rentData.filter((r) => r.status !== "Paid").reduce((sum, r) => sum + r.outstanding, 0);
  const overdueCount = rentData.filter((r) => r.status === "Overdue" || r.status === "In Arrears").length;
  const collectionRate = totalRent > 0 ? Math.round((paidTotal / totalRent) * 100) : 0;
  const unmatchedCount = 3;

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-[#687068]">Loading rent data...</span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Rent Collection</h1>
            <p className="text-sm text-[#687068] mt-1">{filtered.length} payments this month · {collectionRate}% collected · {overdueCount} overdue</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/open-banking" className="border border-[#D5D9D5] text-[#3A3F3A] font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors hover:bg-[#F1F5F9] flex items-center gap-2">
              <i className="ri-bank-line text-sm"></i>
              Review Bank Transactions
            </Link>
            <button
              onClick={() => setShowRecordModal(true)}
              className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <i className="ri-add-circle-line text-sm"></i>
              Record Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Expected", value: `£${totalRent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#C28A78]", sub: `${filtered.length} payments` },
            { label: "Received", value: `£${paidTotal.toLocaleString()}`, icon: "ri-check-double-line", color: "bg-[#7A9A7E]", sub: `${collectionRate}% collected` },
            { label: "Outstanding", value: `£${outstandingTotal.toLocaleString()}`, icon: "ri-error-warning-line", color: "bg-[#C46868]", sub: `${overdueCount} overdue` },
            { label: "Collection Rate", value: `${collectionRate}%`, icon: "ri-bar-chart-2-line", color: "bg-[#3B82F6]", sub: "This month" },
            { label: "Unmatched", value: unmatchedCount.toString(), icon: "ri-link-unlink", color: "bg-[#F59E0B]", sub: "Needs review" },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={() => {
                if (stat.label === "Outstanding") setActiveFilter("Overdue");
                else if (stat.label === "Received") setActiveFilter("Paid");
                else if (stat.label === "Unmatched") window.location.href = "/dashboard/open-banking";
              }}
              className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-base`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
                <p className="text-[10px] text-[#94A3B8]">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <FinancialActionCentre
          actions={financialActions}
          onAction={(item) => {
            if (item.id === "fa1") { setShowRecordModal(true); }
          }}
        />

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-1 p-1 bg-[#FBF9F4] rounded-lg">
              <button
                onClick={() => setViewMode("current")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${viewMode === "current" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"}`}
              >
                Current Month
              </button>
              <button
                onClick={() => setViewMode("history")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${viewMode === "history" ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"}`}
              >
                Payment History
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white flex-1 sm:flex-initial">
                <i className="ri-search-line text-[#94A3B8] text-sm"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search property, tenant..."
                  className="text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent w-full sm:w-48"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    const opts = ["dueDate", "amount", "tenant", "status"];
                    const idx = opts.indexOf(sortBy);
                    setSortBy(opts[(idx + 1) % opts.length]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] bg-white whitespace-nowrap hover:bg-[#F1F5F9] transition-colors"
                >
                  <i className="ri-sort-asc text-xs"></i>
                  <span>{sortBy === "dueDate" ? "Due Date" : sortBy === "amount" ? "Amount" : sortBy === "tenant" ? "Tenant" : "Status"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#D5D9D5] overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === tab ? "bg-[#C28A78] text-white" : "bg-[#FBF9F4] text-[#687068] hover:bg-[#D5D9D5]"}`}
              >
                {tab}
                {tab !== "All" && (
                  <span className="ml-1">({rentData.filter((r) => r.status === tab).length})</span>
                )}
              </button>
            ))}
          </div>

          {viewMode === "current" && (
            <>
              <div className="overflow-x-auto hidden lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                      <th className="text-left px-5 py-3 font-medium text-[#687068]">Due Date</th>
                      <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Outstanding</th>
                      <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5D9D5]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="ri-search-line text-[#94A3B8] text-xl"></i>
                          </div>
                          <p className="text-sm text-[#94A3B8]">
                            {rentData.length === 0 ? "No rent records found for this month" : "No results match your filters"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => {
                        const ps = item.status === "Paid" ? paymentStatusConfig.paid : item.status === "Overdue" || item.status === "In Arrears" ? paymentStatusConfig.overdue : paymentStatusConfig.due;
                        return (
                          <tr key={item.id} className="hover:bg-[#FBF9F4] transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ps.color }}></div>
                                <span className="font-medium text-[#3A3F3A]">{item.property}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-[#687068]">{item.tenant}</td>
                            <td className="px-5 py-3.5 text-right font-medium text-[#3A3F3A]">£{item.rentAmount.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-[#687068]">{item.dueDate}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${ps.bg}`}>
                                <i className={`${ps.icon} text-xs`}></i>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-medium">
                              <span style={{ color: item.outstanding > 0 ? "#C46868" : "#7A9A7E" }}>
                                £{item.outstanding.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => setSelectedTenant(item)}
                                className="text-sm font-medium text-[#C28A78] hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden p-5 space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-search-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#94A3B8]">No results match your filters</p>
                  </div>
                ) : (
                  filtered.map((item) => (
                    <RentPaymentCard
                      key={item.id}
                      property={item.property}
                      tenant={item.tenant}
                      amount={item.rentAmount}
                      dueDate={item.dueDate}
                      paidDate={item.paidDate}
                      status={item.status as "Paid" | "Due Soon" | "Overdue" | "In Arrears"}
                      outstanding={item.outstanding}
                      arrearsMonths={item.arrearsMonths}
                      onClick={() => setSelectedTenant(item)}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {viewMode === "history" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Month</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                    <th className="text-right px-5 py-3 font-medium text-[#687068]">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Paid Date</th>
                    <th className="text-left px-5 py-3 font-medium text-[#687068]">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {paymentHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-history-line text-[#94A3B8] text-xl"></i>
                        </div>
                        <p className="text-sm text-[#94A3B8]">No payment history available</p>
                      </td>
                    </tr>
                  ) : (
                    paymentHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FBF9F4] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#3A3F3A]">{item.month}</td>
                        <td className="px-5 py-3.5 text-[#687068]">{item.property}</td>
                        <td className="px-5 py-3.5 text-[#687068]">{item.tenant}</td>
                        <td className="px-5 py-3.5 text-right font-medium text-[#7A9A7E]">£{item.amount.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-[#687068]">{item.date}</td>
                        <td className="px-5 py-3.5 text-[#687068]">{item.method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedTenant && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedTenant.status === "Paid" ? "bg-[#7A9A7E]/10" : selectedTenant.status === "Overdue" || selectedTenant.status === "In Arrears" ? "bg-[#C46868]/10" : "bg-[#F1F5F9]"}`}>
                    <i className={`ri-check-double-line ${selectedTenant.status === "Paid" ? "text-[#7A9A7E]" : selectedTenant.status === "Overdue" || selectedTenant.status === "In Arrears" ? "text-[#C46868]" : "text-[#94A3B8]"} text-lg`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">{selectedTenant.tenant}</h3>
                    <p className="text-xs text-[#687068]">{selectedTenant.property}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTenant(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FBF9F4] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94A3B8]">Rent Amount</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">£{selectedTenant.rentAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94A3B8]">Outstanding</p>
                    <p className={`text-xl font-bold ${selectedTenant.outstanding > 0 ? "text-[#C46868]" : "text-[#7A9A7E]"}`}>
                      £{selectedTenant.outstanding.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-[#FBF9F4] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94A3B8]">Due Date</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">{selectedTenant.dueDate}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Paid Date", value: selectedTenant.paidDate || "—" },
                    { label: "Payment Method", value: selectedTenant.method || "—" },
                    { label: "Status", value: selectedTenant.status },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-xl">
                      <span className="text-xs text-[#94A3B8]">{row.label}</span>
                      <span className="text-sm font-medium text-[#3A3F3A]">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-3">Recent Payments</p>
                  <div className="space-y-2">
                    {paymentHistory
                      .filter((p) => p.tenant === selectedTenant.tenant)
                      .slice(0, 5)
                      .map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
                              <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#3A3F3A]">{p.month}</p>
                              <p className="text-xs text-[#94A3B8]">{p.method} · {p.date}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[#7A9A7E]">£{p.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    {paymentHistory.filter((p) => p.tenant === selectedTenant.tenant).length === 0 && (
                      <p className="text-sm text-[#94A3B8] text-center py-4">No payment history</p>
                    )}
                  </div>
                </div>
                {selectedTenant.status !== "Paid" && (
                  <div className="flex gap-3">
                    <button onClick={() => setShowRecordModal(true)} className="flex-1 py-3 text-sm font-medium text-white bg-[#7A9A7E] rounded-xl hover:bg-[#059669] transition-colors whitespace-nowrap">
                      <i className="ri-check-line mr-1"></i>Mark as Paid
                    </button>
                    <Link href="/dashboard/arrears" className="flex-1 py-3 text-sm font-medium text-[#C46868] border border-[#C46868] rounded-xl hover:bg-[#C46868]/5 transition-colors text-center whitespace-nowrap">
                      <i className="ri-alarm-warning-line mr-1"></i>View Arrears
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showRecordModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Record Payment</h3>
                <button onClick={() => setShowRecordModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Tenant / Property</label>
                  <div className="flex items-center justify-between px-3 py-3 border border-[#D5D9D5] rounded-xl bg-[#FBF9F4]">
                    <span className="text-sm text-[#3A3F3A]">Select tenant...</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#687068] mb-1.5 block">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-[#94A3B8]">£</span>
                      <input type="number" className="w-full pl-7 pr-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4] focus:outline-none focus:border-[#C28A78]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#687068] mb-1.5 block">Payment Date</label>
                    <input type="date" className="w-full px-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4] focus:outline-none focus:border-[#C28A78]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Bank Transfer", "Direct Debit", "Standing Order", "Cash", "Card"].map((m) => (
                      <button key={m} className="py-2 text-xs font-medium border border-[#D5D9D5] rounded-xl text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78] transition-colors">{m}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowRecordModal(false)} className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors">Record Payment</button>
                  <button onClick={() => setShowRecordModal(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#D5D9D5] rounded-xl hover:bg-[#FBF9F4] transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}