"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";

const myProperties = [
  { id: 1, name: "12 Rose Avenue", city: "London", tenant: "John Miller", rent: 1850, deposit: 1850, status: "Paid", paidDate: "1 Jun 2026", dueDate: "1 Jul 2026", outstanding: 0, tenancyStart: "15 Sep 2024", tenancyEnd: "14 Sep 2026" },
  { id: 2, name: "45 Baker Street", city: "Manchester", tenant: "Emily Carter", rent: 2100, deposit: 2100, status: "Due Soon", paidDate: null, dueDate: "1 Jul 2026", outstanding: 0, tenancyStart: "1 Mar 2025", tenancyEnd: "28 Feb 2026" },
  { id: 3, name: "34 Maple Gardens", city: "Cardiff", tenant: "Michael Brown", rent: 2400, deposit: 2400, status: "Paid", paidDate: "1 Jun 2026", dueDate: "1 Jul 2026", outstanding: 0, tenancyStart: "1 May 2024", tenancyEnd: "30 Apr 2026" },
  { id: 4, name: "8 The Crescent", city: "Leeds", tenant: "Michael Brown", rent: 1650, deposit: 1650, status: "Overdue", paidDate: null, dueDate: "1 Jun 2026", outstanding: 1650, tenancyStart: "1 Apr 2024", tenancyEnd: "31 Mar 2026" },
];

const paymentHistory = [
  { id: 1, property: "12 Rose Avenue", tenant: "John Miller", amount: 1850, date: "1 Jun 2026", month: "Jun 2026", status: "Paid" },
  { id: 2, property: "12 Rose Avenue", tenant: "John Miller", amount: 1850, date: "1 May 2026", month: "May 2026", status: "Paid" },
  { id: 3, property: "45 Baker Street", tenant: "Emily Carter", amount: 2100, date: "1 May 2026", month: "May 2026", status: "Paid" },
  { id: 4, property: "34 Maple Gardens", tenant: "Michael Brown", amount: 2400, date: "1 Jun 2026", month: "Jun 2026", status: "Paid" },
  { id: 5, property: "34 Maple Gardens", tenant: "Michael Brown", amount: 2400, date: "1 May 2026", month: "May 2026", status: "Paid" },
  { id: 6, property: "8 The Crescent", tenant: "Michael Brown", amount: 1650, date: "1 May 2026", month: "May 2026", status: "Paid" },
  { id: 7, property: "8 The Crescent", tenant: "Michael Brown", amount: 1650, date: "1 Apr 2026", month: "Apr 2026", status: "Paid" },
];

const statusConfig: Record<string, { badge: string; dot: string; icon: string }> = {
  Paid: { badge: "bg-[#10B981]/10 text-[#10B981]", dot: "bg-[#10B981]", icon: "ri-check-double-line" },
  "Due Soon": { badge: "bg-[#F59E0B]/10 text-[#F59E0B]", dot: "bg-[#F59E0B]", icon: "ri-time-line" },
  Overdue: { badge: "bg-[#EF4444]/10 text-[#EF4444]", dot: "bg-[#EF4444]", icon: "ri-alarm-warning-line" },
  "In Arrears": { badge: "bg-[#EF4444]/10 text-[#EF4444]", dot: "bg-[#EF4444]", icon: "ri-error-warning-line" },
};

export default function LandlordRentPage() {
  const [selectedProperty, setSelectedProperty] = useState<typeof myProperties[0] | null>(null);
  const [filter, setFilter] = useState("All");
  const [showRemind, setShowRemind] = useState(false);

  const filtered = filter === "All" ? myProperties : myProperties.filter((p) => p.status === filter);
  const totalRent = myProperties.reduce((sum, p) => sum + p.rent, 0);
  const paidTotal = myProperties.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.rent, 0);
  const outstandingTotal = myProperties.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + p.outstanding, 0);
  const overdueCount = myProperties.filter((p) => p.status === "Overdue" || p.status === "In Arrears").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Rent Income</h1>
            <p className="text-sm text-[#687068] mt-1">Track payments and outstanding rent across your portfolio</p>
          </div>
          <button
            onClick={() => setShowRemind(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <i className="ri-notification-3-line text-sm"></i>
            Send Reminders
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Monthly Income", value: `£${totalRent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#C28A78]", sub: "All properties" },
            { label: "Collected", value: `£${paidTotal.toLocaleString()}`, icon: "ri-check-double-line", color: "bg-[#10B981]", sub: `${Math.round((paidTotal / totalRent) * 100)}% rate` },
            { label: "Outstanding", value: `£${outstandingTotal.toLocaleString()}`, icon: "ri-error-warning-line", color: "bg-[#EF4444]", sub: `${overdueCount} overdue` },
            { label: "Total Deposits", value: "£7,800", icon: "ri-safe-2-line", color: "bg-[#3B82F6]", sub: "4 properties" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Properties Rent Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-[#E2E8F0] gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-building-4-line text-[#C28A78] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">My Properties</h2>
              <span className="text-xs font-medium text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{myProperties.length}</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {["All", "Paid", "Due Soon", "Overdue"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    filter === f ? "bg-[#C28A78] text-white" : "bg-[#F8FAFC] text-[#687068] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Rent</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Due Date</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Outstanding</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusConfig[p.status].dot}`}></div>
                        <span className="font-medium text-[#3A3F3A]">{p.name}</span>
                      </div>
                      <p className="text-xs text-[#94A3B8] ml-4">{p.city}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#687068]">{p.tenant}</td>
                    <td className="px-5 py-3.5 font-medium text-[#3A3F3A]">£{p.rent.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-[#687068]">{p.dueDate}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${statusConfig[p.status].badge}`}>
                        <i className={`${statusConfig[p.status].icon} text-xs`}></i>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium">
                      <span className={p.outstanding > 0 ? "text-[#EF4444]" : "text-[#10B981]"}>
                        {p.outstanding > 0 ? `£${p.outstanding.toLocaleString()}` : "£0"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedProperty(p)}
                        className="text-sm font-medium text-[#C28A78] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                <i className="ri-history-line text-[#10B981] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Recent Payment History</h2>
              <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">{paymentHistory.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Month</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Amount</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Paid Date</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paymentHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[#3A3F3A]">{p.month}</td>
                    <td className="px-5 py-3.5 text-[#687068]">{p.property}</td>
                    <td className="px-5 py-3.5 text-[#687068]">{p.tenant}</td>
                    <td className="px-5 py-3.5 font-medium text-[#3A3F3A]">£{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-[#687068]">{p.date}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Property Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center">
                    <i className="ri-building-4-line text-[#C28A78] text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3A3F3A]">{selectedProperty.name}</h3>
                    <p className="text-xs text-[#687068]">{selectedProperty.city}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProperty(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94A3B8]">Monthly Rent</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">£{selectedProperty.rent}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94A3B8]">Deposit</p>
                    <p className="text-xl font-bold text-[#3A3F3A]">£{selectedProperty.deposit}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94A3B8]">Outstanding</p>
                    <p className={`text-xl font-bold ${selectedProperty.outstanding > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                      £{selectedProperty.outstanding}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Tenant", value: selectedProperty.tenant },
                    { label: "Tenancy Period", value: `${selectedProperty.tenancyStart} — ${selectedProperty.tenancyEnd}` },
                    { label: "Due Date", value: selectedProperty.dueDate },
                    { label: "Paid Date", value: selectedProperty.paidDate || "—" },
                    { label: "Status", value: selectedProperty.status },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                      <span className="text-xs text-[#94A3B8]">{item.label}</span>
                      <span className="text-sm font-medium text-[#3A3F3A]">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap">
                    <i className="ri-notification-3-line mr-1"></i>
                    Send Reminder
                  </button>
                  <button className="flex-1 py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap">
                    <i className="ri-file-list-3-line mr-1"></i>
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Reminder Modal */}
        {showRemind && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Send Rent Reminders</h3>
                <button onClick={() => setShowRemind(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <p className="text-sm text-[#687068] mb-4">Select tenants to send reminders:</p>
              <div className="space-y-2 mb-4">
                {myProperties
                  .filter((p) => p.status !== "Paid")
                  .map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl cursor-pointer">
                      <div className="w-5 h-5 rounded border border-[#E2E8F0] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-sm bg-[#C28A78]"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#3A3F3A]">{p.tenant}</p>
                        <p className="text-xs text-[#687068]">{p.name} · £{p.rent} · {p.status}</p>
                      </div>
                    </label>
                  ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRemind(false)} className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap">
                  <i className="ri-send-plane-line mr-1"></i>
                  Send Reminders
                </button>
                <button onClick={() => setShowRemind(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}