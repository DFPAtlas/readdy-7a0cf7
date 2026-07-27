"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";

const myTenancy = {
  property: "12 Rose Avenue",
  landlord: "James Richardson",
  rentAmount: 1850,
  deposit: 1850,
  dueDate: "1st of each month",
  tenancyStart: "15 Sep 2024",
  tenancyEnd: "14 Sep 2026",
  paymentMethod: "Bank Transfer",
  bankAccount: "**** **** **** 4521",
  sortCode: "12-34-56",
  landlordBank: "Barclays Bank",
  reference: "LET-ROSE-001",
};

const myPayments = [
  { id: 1, month: "Jun 2026", amount: 1850, date: "1 Jun 2026", method: "Bank Transfer", status: "Paid", daysLate: 0 },
  { id: 2, month: "May 2026", amount: 1850, date: "1 May 2026", method: "Bank Transfer", status: "Paid", daysLate: 0 },
  { id: 3, month: "Apr 2026", amount: 1850, date: "3 Apr 2026", method: "Bank Transfer", status: "Paid", daysLate: 2 },
  { id: 4, month: "Mar 2026", amount: 1850, date: "1 Mar 2026", method: "Bank Transfer", status: "Paid", daysLate: 0 },
  { id: 5, month: "Feb 2026", amount: 1850, date: "1 Feb 2026", method: "Bank Transfer", status: "Paid", daysLate: 0 },
  { id: 6, month: "Jan 2026", amount: 1850, date: "1 Jan 2026", method: "Bank Transfer", status: "Paid", daysLate: 0 },
  { id: 7, month: "Dec 2025", amount: 1850, date: "1 Dec 2025", method: "Bank Transfer", status: "Paid", daysLate: 0 },
  { id: 8, month: "Nov 2025", amount: 1850, date: "1 Nov 2025", method: "Bank Transfer", status: "Paid", daysLate: 0 },
];

const upcomingDue = [
  { month: "Jul 2026", dueDate: "1 Jul 2026", amount: 1850, status: "Upcoming" },
  { month: "Aug 2026", dueDate: "1 Aug 2026", amount: 1850, status: "Upcoming" },
  { month: "Sep 2026", dueDate: "1 Sep 2026", amount: 1850, status: "Upcoming" },
];

const statusConfig: Record<string, { badge: string; icon: string }> = {
  Paid: { badge: "bg-[#10B981]/10 text-[#10B981]", icon: "ri-check-double-line" },
  Upcoming: { badge: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-calendar-line" },
  "Due Soon": { badge: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-time-line" },
  Overdue: { badge: "bg-[#EF4444]/10 text-[#EF4444]", icon: "ri-alarm-warning-line" },
};

export default function TenantRentPage() {
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState<typeof myPayments[0] | null>(null);

  const totalPaid = myPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = upcomingDue.reduce((sum, u) => sum + u.amount, 0);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Rent</h1>
            <p className="text-sm text-[#687068] mt-1">View payments, upcoming due dates, and your tenancy details</p>
          </div>
          <button
            onClick={() => setShowPayModal(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <i className="ri-bank-card-line text-sm"></i>
            Make Payment
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Monthly Rent", value: `£${myTenancy.rentAmount}`, icon: "ri-money-pound-circle-line", color: "bg-[#C28A78]", sub: "Due 1st monthly" },
            { label: "Deposit Held", value: `£${myTenancy.deposit}`, icon: "ri-safe-2-line", color: "bg-[#3B82F6]", sub: "Protected with DPS" },
            { label: "Total Paid", value: `£${totalPaid.toLocaleString()}`, icon: "ri-check-double-line", color: "bg-[#10B981]", sub: `${myPayments.length} payments` },
            { label: "Outstanding", value: `£${totalDue}`, icon: "ri-time-line", color: "bg-[#F59E0B]", sub: `${upcomingDue.length} months due` },
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

        {/* Next Payment */}
        <div className="bg-gradient-to-r from-[#C28A78] to-[#2D5F4E] rounded-xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-check-line text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-white/70">Next Payment Due</p>
                <p className="text-2xl font-bold text-white">1 Jul 2026</p>
                <p className="text-xs text-white/60">£1,850 · Monthly Rent</p>
              </div>
            </div>
            <button
              onClick={() => setShowPayModal(true)}
              className="bg-white text-[#C28A78] font-medium px-6 py-3 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <i className="ri-bank-card-line text-sm"></i>
              Pay Now
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/60">Reference</p>
              <p className="text-sm font-medium text-white">{myTenancy.reference}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Bank Account</p>
              <p className="text-sm font-medium text-white">{myTenancy.bankAccount}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Sort Code</p>
              <p className="text-sm font-medium text-white">{myTenancy.sortCode}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment History */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-history-line text-[#10B981] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Payment History</h2>
                <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">{myPayments.length}</span>
              </div>
            </div>
            <div className="divide-y divide-[#E2E8F0] max-h-[400px] overflow-y-auto">
              {myPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-check-line text-[#10B981] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{p.month}</p>
                      <p className="text-xs text-[#94A3B8]">{p.method} · {p.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#10B981]">£{p.amount.toLocaleString()}</p>
                    <button
                      onClick={() => setShowReceipt(p)}
                      className="text-xs text-[#C28A78] hover:underline"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Due Dates */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-calendar-event-line text-[#F59E0B] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Upcoming Due Dates</h2>
                <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">{upcomingDue.length}</span>
              </div>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {upcomingDue.map((u, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-calendar-line text-[#F59E0B] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{u.month}</p>
                      <p className="text-xs text-[#94A3B8]">Due {u.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#3A3F3A]">£{u.amount.toLocaleString()}</p>
                    <span className="text-xs text-[#F59E0B] font-medium">Pending</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#687068]">Total Outstanding</span>
                  <span className="font-medium text-[#3A3F3A]">£{totalDue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#687068]">Payment Method</span>
                  <span className="font-medium text-[#3A3F3A]">{myTenancy.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenancy Details */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-[#3B82F6] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Tenancy Details</h2>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Property", value: myTenancy.property },
              { label: "Landlord", value: myTenancy.landlord },
              { label: "Tenancy Start", value: myTenancy.tenancyStart },
              { label: "Tenancy End", value: myTenancy.tenancyEnd },
              { label: "Monthly Rent", value: `£${myTenancy.rentAmount}` },
              { label: "Deposit", value: `£${myTenancy.deposit}` },
              { label: "Payment Method", value: myTenancy.paymentMethod },
              { label: "Bank Account", value: myTenancy.bankAccount },
              { label: "Sort Code", value: myTenancy.sortCode },
              { label: "Landlord Bank", value: myTenancy.landlordBank },
              { label: "Payment Reference", value: myTenancy.reference },
              { label: "Due Date", value: myTenancy.dueDate },
            ].map((item) => (
              <div key={item.label} className="bg-[#F8FAFC] rounded-lg p-3">
                <p className="text-xs text-[#94A3B8] mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pay Now Modal */}
        {showPayModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Make Payment</h3>
                <button onClick={() => setShowPayModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#94A3B8] mb-1">Amount to Pay</p>
                  <p className="text-3xl font-bold text-[#3A3F3A]">£{myTenancy.rentAmount}</p>
                  <p className="text-xs text-[#687068] mt-1">{myTenancy.property} · July 2026</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Bank Transfer", "Card Payment", "Direct Debit", "Standing Order"].map((m) => (
                      <button key={m} className="py-3 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78] transition-colors flex items-center justify-center gap-1">
                        <i className={`${m === "Bank Transfer" ? "ri-bank-line" : m === "Card Payment" ? "ri-bank-card-line" : m === "Direct Debit" ? "ri-repeat-line" : "ri-calendar-check-line"} text-sm`}></i>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-[#687068] mb-2">Bank Transfer Details</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Account Name</span>
                    <span className="font-medium text-[#3A3F3A]">James Richardson</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Sort Code</span>
                    <span className="font-medium text-[#3A3F3A]">12-34-56</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Account Number</span>
                    <span className="font-medium text-[#3A3F3A]">**** 4521</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Reference</span>
                    <span className="font-medium text-[#3A3F3A]">LET-ROSE-001</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap"
                  >
                    <i className="ri-bank-card-line mr-1"></i>
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Payment Receipt</h3>
                <button onClick={() => setShowReceipt(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-check-double-line text-[#10B981] text-2xl"></i>
                </div>
                <p className="text-2xl font-bold text-[#3A3F3A]">£{showReceipt.amount.toLocaleString()}</p>
                <p className="text-sm text-[#687068]">Rent Payment · {showReceipt.month}</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Property", value: myTenancy.property },
                  { label: "Tenant", value: "John Miller" },
                  { label: "Landlord", value: myTenancy.landlord },
                  { label: "Payment Date", value: showReceipt.date },
                  { label: "Payment Method", value: showReceipt.method },
                  { label: "Reference", value: `RCP-${showReceipt.id.toString().padStart(5, "0")}` },
                  { label: "Status", value: showReceipt.status },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                    <span className="text-xs text-[#94A3B8]">{item.label}</span>
                    <span className="text-sm font-medium text-[#3A3F3A]">{item.value}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl hover:bg-[#C28A78]/5 transition-colors flex items-center justify-center gap-2">
                <i className="ri-download-line text-sm"></i>
                Download PDF Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}