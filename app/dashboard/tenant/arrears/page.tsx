"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";

const myArrears = {
  property: "12 Rose Avenue",
  landlord: "James Richardson",
  rentAmount: 1850,
  dueDate: "1 Jun 2026",
  totalArrears: 1850,
  arrearsMonths: 1,
  riskRating: "Low",
  lastContact: "5 Jun 2026",
  contactMethod: "Email Reminder",
  agentPhone: "+44 20 7946 0958",
  agentEmail: "arrears@lethub.co.uk",
  paymentHistory: [
    { month: "Jun 2026", amount: 1850, date: null, status: "Unpaid", daysLate: 5 },
    { month: "May 2026", amount: 1850, date: "1 May 2026", status: "Paid", daysLate: 0 },
    { month: "Apr 2026", amount: 1850, date: "1 Apr 2026", status: "Paid", daysLate: 0 },
    { month: "Mar 2026", amount: 1850, date: "1 Mar 2026", status: "Paid", daysLate: 0 },
  ],
  communications: [
    { date: "5 Jun 2026", type: "Email", subject: "Rent Reminder — June 2026", status: "Sent", agent: "Sarah Cooper" },
  ],
};

export default function TenantArrearsPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Rent Account</h1>
            <p className="text-sm text-[#687068] mt-1">View your rent status and payment history</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <i className="ri-bank-card-line text-sm"></i>
              Make Payment
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="border border-[#E2E8F0] text-[#3A3F3A] font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors hover:bg-[#F1F5F9] flex items-center gap-2"
            >
              <i className="ri-phone-line text-sm"></i>
              Contact Agent
            </button>
          </div>
        </div>

        {/* Arrears Alert Card */}
        <div className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#EF4444] rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-white text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-[#EF4444] font-medium">Rent Overdue</p>
                <p className="text-2xl font-bold text-[#3A3F3A]">£{myArrears.totalArrears.toLocaleString()}</p>
                <p className="text-xs text-[#687068] mt-0.5">{myArrears.property} · {myArrears.arrearsMonths} month overdue</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:text-right">
              <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit sm:ml-auto">
                <i className="ri-alert-line text-xs"></i>
                {myArrears.riskRating} Risk
              </span>
              <p className="text-xs text-[#94A3B8]">Last contact: {myArrears.lastContact}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#FECACA] grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#94A3B8]">Due Date</p>
              <p className="text-sm font-medium text-[#3A3F3A]">{myArrears.dueDate}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Monthly Rent</p>
              <p className="text-sm font-medium text-[#3A3F3A]">£{myArrears.rentAmount}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Landlord</p>
              <p className="text-sm font-medium text-[#3A3F3A]">{myArrears.landlord}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setShowPaymentModal(true)} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#EF4444] rounded-xl hover:bg-[#DC2626] transition-colors whitespace-nowrap">
              <i className="ri-bank-card-line mr-1"></i>Pay Now
            </button>
            <button onClick={() => setShowPlanModal(true)} className="flex-1 py-2.5 text-sm font-medium text-[#3B82F6] border border-[#3B82F6] rounded-xl hover:bg-[#3B82F6]/5 transition-colors whitespace-nowrap">
              <i className="ri-calendar-schedule-line mr-1"></i>Request Payment Plan
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                <i className="ri-history-line text-[#10B981] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Payment History</h2>
            </div>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {myArrears.paymentHistory.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.status === "Paid" ? "bg-[#10B981]/10" : "bg-[#EF4444]/10"}`}>
                    <i className={`${p.status === "Paid" ? "ri-check-line text-[#10B981]" : "ri-close-line text-[#EF4444]"} text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{p.month}</p>
                    <p className="text-xs text-[#94A3B8]">{p.date ? `Paid ${p.date}` : "Unpaid"} {p.daysLate > 0 ? `· ${p.daysLate} days late` : ""}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${p.status === "Paid" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  £{p.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Communications */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                <i className="ri-message-3-line text-[#C28A78] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Agent Communications</h2>
            </div>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {myArrears.communications.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-mail-line text-[#C28A78] text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{c.subject}</p>
                    <p className="text-xs text-[#94A3B8]">{c.type} · {c.date} · {c.agent}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Make Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="bg-[#FEF2F2] rounded-xl p-4 border border-[#FECACA] mb-4">
                <p className="text-xs text-[#94A3B8] mb-1">Amount Due</p>
                <p className="text-3xl font-bold text-[#EF4444]">£{myArrears.totalArrears.toLocaleString()}</p>
                <p className="text-xs text-[#687068] mt-1">{myArrears.property} · Rent {myArrears.paymentHistory[0].month}</p>
              </div>
              <div className="space-y-3 mb-4">
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
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap">
                  <i className="ri-bank-card-line mr-1"></i>Confirm Payment
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Contact Your Agent</h3>
                <button onClick={() => setShowContactModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-xl flex items-center justify-center">
                    <i className="ri-phone-line text-[#C28A78] text-lg"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">Phone</p>
                    <p className="text-sm text-[#687068]">{myArrears.agentPhone}</p>
                  </div>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
                    <i className="ri-mail-line text-[#3B82F6] text-lg"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">Email</p>
                    <p className="text-sm text-[#687068]">{myArrears.agentEmail}</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Send a Message</label>
                <textarea
                  rows={3}
                  placeholder="Describe your situation or request..."
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowContactModal(false)} className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap">
                  <i className="ri-send-plane-line mr-1"></i>Send Message
                </button>
                <button onClick={() => setShowContactModal(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Plan Request Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Request Payment Plan</h3>
                <button onClick={() => setShowPlanModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="mb-4">
                <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4">
                  <p className="text-xs text-[#94A3B8] mb-1">Current Arrears</p>
                  <p className="text-2xl font-bold text-[#EF4444]">£{myArrears.totalArrears.toLocaleString()}</p>
                  <p className="text-xs text-[#687068] mt-1">Monthly rent: £{myArrears.rentAmount}</p>
                </div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Proposed Monthly Instalment</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-[#94A3B8]">£</span>
                  <input
                    type="number"
                    defaultValue={Math.round(myArrears.totalArrears / 6)}
                    className="w-full pl-7 pr-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">This would clear arrears in approximately 6 months</p>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Reason for Request</label>
                <textarea
                  rows={3}
                  placeholder="Please explain your circumstances..."
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPlanModal(false)} className="flex-1 py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl hover:bg-[#2563EB] transition-colors whitespace-nowrap">
                  <i className="ri-calendar-check-line mr-1"></i>Submit Request
                </button>
                <button onClick={() => setShowPlanModal(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
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