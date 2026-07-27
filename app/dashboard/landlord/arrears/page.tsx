"use client";

import { useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { arrearsData, riskConfig } from "../../arrears/ArrearsData";

const myArrears = arrearsData.filter((a) => a.landlord === "James Richardson" || a.landlord === "Sarah Walker");

export default function LandlordArrearsPage() {
  const [selectedTenant, setSelectedTenant] = useState<typeof myArrears[0] | null>(null);
  const [filter, setFilter] = useState("All");
  const [showReminder, setShowReminder] = useState(false);

  const filtered = filter === "All" ? myArrears : myArrears.filter((a) => a.riskRating === filter);
  const totalArrears = myArrears.reduce((sum, a) => sum + a.totalArrears, 0);
  const highRisk = myArrears.filter((a) => a.riskRating === "High").length;
  const mediumRisk = myArrears.filter((a) => a.riskRating === "Medium").length;
  const lowRisk = myArrears.filter((a) => a.riskRating === "Low").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Arrears</h1>
            <p className="text-sm text-[#687068] mt-1">Track outstanding rent across your portfolio</p>
          </div>
          <button
            onClick={() => setShowReminder(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <i className="ri-notification-3-line text-sm"></i>
            Request Reminder
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Arrears", value: `£${totalArrears.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#EF4444]", sub: `${myArrears.length} properties` },
            { label: "High Risk", value: highRisk.toString(), icon: "ri-alarm-warning-line", color: "bg-[#EF4444]", sub: "Immediate action" },
            { label: "Medium Risk", value: mediumRisk.toString(), icon: "ri-alert-line", color: "bg-[#F59E0B]", sub: "Monitor closely" },
            { label: "Low Risk", value: lowRisk.toString(), icon: "ri-shield-check-line", color: "bg-[#10B981]", sub: "Standard follow-up" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-[#E2E8F0] gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                <i className="ri-error-warning-line text-[#EF4444] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Properties in Arrears</h2>
              <span className="text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">{myArrears.length}</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {["All", "Low", "Medium", "High"].map((f) => (
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
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Arrears</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Months</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Risk</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${riskConfig[item.riskRating].text.replace("text-", "bg-")}`}></div>
                        <span className="font-medium text-[#3A3F3A]">{item.property}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#687068]">{item.tenant}</td>
                    <td className="px-5 py-3.5 font-medium text-[#3A3F3A]">£{item.rentAmount}</td>
                    <td className="px-5 py-3.5 font-medium text-[#EF4444]">£{item.totalArrears.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-[#687068]">{item.arrearsMonths}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${riskConfig[item.riskRating].badge}`}>
                        {item.riskRating}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenant Detail Modal */}
        {selectedTenant && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${riskConfig[selectedTenant.riskRating].bg} rounded-xl flex items-center justify-center`}>
                    <i className={`${riskConfig[selectedTenant.riskRating].icon} ${riskConfig[selectedTenant.riskRating].text} text-lg`}></i>
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
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#94A3B8]">Monthly Rent</p>
                    <p className="text-lg font-bold text-[#3A3F3A]">£{selectedTenant.rentAmount}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#94A3B8]">Total Arrears</p>
                    <p className="text-lg font-bold text-[#EF4444]">£{selectedTenant.totalArrears.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#94A3B8]">Months</p>
                    <p className="text-lg font-bold text-[#3A3F3A]">{selectedTenant.arrearsMonths}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#94A3B8]">Last Contact</p>
                    <p className="text-lg font-bold text-[#3A3F3A]">{selectedTenant.lastContact}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-3">Payment History</p>
                  <div className="space-y-2">
                    {selectedTenant.paymentHistory.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.status === "Paid" ? "bg-[#10B981]/10" : "bg-[#EF4444]/10"}`}>
                            <i className={`${p.status === "Paid" ? "ri-check-line text-[#10B981]" : "ri-close-line text-[#EF4444]"} text-sm`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{p.month}</p>
                            <p className="text-xs text-[#94A3B8]">{p.date ? `Paid ${p.date}` : "Unpaid"} {p.daysLate > 0 ? `· ${p.daysLate} days late` : ""}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${p.status === "Paid" ? "text-[#10B981]" : "text-[#EF4444]"}`}>£{p.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-3">Agent Communications</p>
                  <div className="space-y-2">
                    {selectedTenant.communications.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                            <i className={`${c.type === "Email" ? "ri-mail-line" : c.type === "SMS" ? "ri-message-3-line" : c.type === "Phone" ? "ri-phone-line" : "ri-error-warning-line"} text-[#C28A78] text-sm`}></i>
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

                <div className="flex gap-3">
                  <button onClick={() => setShowReminder(true)} className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap">
                    <i className="ri-notification-3-line mr-1"></i>Request Agent Action
                  </button>
                  <button onClick={() => setSelectedTenant(null)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reminder Modal */}
        {showReminder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#3A3F3A]">Request Agent Action</h3>
                <button onClick={() => setShowReminder(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Send Reminder", "Issue Warning", "Phone Call", "Payment Plan", "Escalate"].map((a) => (
                    <button key={a} className="py-2 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78] transition-colors">
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Message for Agent</label>
                <textarea
                  rows={3}
                  placeholder="Please provide any additional context..."
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowReminder(false)} className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap">
                  <i className="ri-send-plane-line mr-1"></i>Submit Request
                </button>
                <button onClick={() => setShowReminder(false)} className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
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