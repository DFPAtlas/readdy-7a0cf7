"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/MobileBottomNav";
import RentPaymentCard from "@/components/dashboard/RentPaymentCard";
import ArrearsCaseCard from "@/components/dashboard/ArrearsCaseCard";

const rentData = [
  { id: 1, property: "12 Rose Avenue", tenant: "John Miller", rent: 1850, dueDate: "1 Jul", paidDate: "1 Jul", status: "Paid" as const, outstanding: 0, deposit: 1850 },
  { id: 2, property: "45 Baker Street", tenant: "Emily Carter", rent: 2100, dueDate: "1 Jul", paidDate: null, status: "Due Soon" as const, outstanding: 0, deposit: 2100 },
  { id: 3, property: "34 Maple Gardens", tenant: "Michael Brown", rent: 2400, dueDate: "1 Jul", paidDate: "1 Jul", status: "Paid" as const, outstanding: 0, deposit: 2400 },
  { id: 4, property: "8 The Crescent", tenant: "Michael Brown", rent: 1650, dueDate: "1 Jul", paidDate: null, status: "Overdue" as const, outstanding: 1650, deposit: 1650 },
  { id: 5, property: "Flat 7 Park View", tenant: "Lisa Chen", rent: 1200, dueDate: "1 Jul", paidDate: null, status: "In Arrears" as const, outstanding: 3600, deposit: 1200 },
  { id: 6, property: "Flat 4B Oak Street", tenant: "Sarah Jenkins", rent: 950, dueDate: "1 Jul", paidDate: "3 Jul", status: "Paid" as const, outstanding: 0, deposit: 950 },
];

export default function MobileRentPage() {
  const [activeTab, setActiveTab] = useState("current");
  const [selectedItem, setSelectedItem] = useState<typeof rentData[0] | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [showRecord, setShowRecord] = useState(false);

  const totalRent = rentData.reduce((sum, r) => sum + r.rent, 0);
  const paidTotal = rentData.filter((r) => r.status === "Paid").reduce((sum, r) => sum + r.rent, 0);
  const outstandingTotal = rentData.filter((r) => r.status !== "Paid").reduce((sum, r) => sum + r.outstanding, 0);
  const overdueCount = rentData.filter((r) => r.status === "Overdue" || r.status === "In Arrears").length;

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#3A3F3A]">Rent Collection</h1>
            <p className="text-xs text-[#687068] mt-0.5">{Math.round((paidTotal / totalRent) * 100)}% collected · {overdueCount} overdue</p>
          </div>
          <Link href="/dashboard/rent-collection" className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C28A78] text-white">
            <i className="ri-external-link-line text-sm"></i>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Expected", value: `£${totalRent.toLocaleString()}`, icon: "ri-money-pound-circle-line", color: "bg-[#C28A78]" },
            { label: "Received", value: `£${paidTotal.toLocaleString()}`, icon: "ri-check-double-line", color: "bg-[#7A9A7E]" },
            { label: "Outstanding", value: `£${outstandingTotal}`, icon: "ri-error-warning-line", color: "bg-[#C46868]" },
            { label: "Collection", value: `${Math.round((paidTotal / totalRent) * 100)}%`, icon: "ri-bar-chart-2-line", color: "bg-[#3B82F6]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 ${stat.color}/10 rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} text-sm`} style={{ color: stat.color === "bg-[#C28A78]" ? "#C28A78" : stat.color === "bg-[#7A9A7E]" ? "#7A9A7E" : stat.color === "bg-[#C46868]" ? "#C46868" : "#3B82F6" }}></i>
                </div>
                <span className="text-xs text-[#687068]">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#D5D9D5]">
          <button onClick={() => setActiveTab("current")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === "current" ? "bg-[#C28A78] text-white" : "text-[#687068]"}`}>Current</button>
          <button onClick={() => setActiveTab("history")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === "history" ? "bg-[#C28A78] text-white" : "text-[#687068]"}`}>History</button>
        </div>

        {overdueCount > 0 && (
          <div className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#C46868]/10 rounded-lg flex items-center justify-center">
                <i className="ri-alarm-warning-line text-[#C46868] text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">Action Needed</p>
                <p className="text-xs text-[#687068]">{overdueCount} overdue</p>
              </div>
            </div>
            <button onClick={() => setShowReminder(true)} className="w-full py-2 text-xs font-medium text-white bg-[#C46868] rounded-lg hover:bg-[#DC2626] transition-colors">
              Send Reminders
            </button>
          </div>
        )}

        {activeTab === "current" && (
          <div className="space-y-3">
            {rentData.map((item) => (
              <RentPaymentCard
                key={item.id}
                property={item.property}
                tenant={item.tenant}
                amount={item.rent}
                dueDate={item.dueDate}
                paidDate={item.paidDate}
                status={item.status}
                outstanding={item.outstanding}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            {rentData.filter((r) => r.paidDate).map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-[#D5D9D5] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.property}</p>
                      <p className="text-xs text-[#687068]">{item.tenant}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#7A9A7E]">£{item.rent}</span>
                </div>
                <p className="text-xs text-[#94A3B8]">Paid {item.paidDate} · Deposit £{item.deposit}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowRecord(true)} className="flex items-center justify-center gap-2 py-3 bg-[#C28A78] text-white rounded-xl text-sm font-medium">
            <i className="ri-add-circle-line text-sm"></i>Record
          </button>
          <button onClick={() => setShowReminder(true)} className="flex items-center justify-center gap-2 py-3 border border-[#D5D9D5] text-[#3A3F3A] rounded-xl text-sm font-medium">
            <i className="ri-notification-3-line text-sm"></i>Remind
          </button>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#3A3F3A]">{selectedItem.tenant}</h3>
                <p className="text-xs text-[#687068]">{selectedItem.property}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#94A3B8]">Rent</p>
                <p className="text-lg font-bold text-[#3A3F3A]">£{selectedItem.rent}</p>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#94A3B8]">Deposit</p>
                <p className="text-lg font-bold text-[#3A3F3A]">£{selectedItem.deposit}</p>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#94A3B8]">Outstanding</p>
                <p className={`text-lg font-bold ${selectedItem.outstanding > 0 ? "text-[#C46868]" : "text-[#7A9A7E]"}`}>£{selectedItem.outstanding}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl">Record Payment</button>
              <button className="flex-1 py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl">Remind</button>
            </div>
          </div>
        </div>
      )}

      {showReminder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#3A3F3A]">Send Reminders</h3>
              <button onClick={() => setShowReminder(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="space-y-2 mb-4">
              {rentData.filter((r) => r.status !== "Paid").map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 bg-[#FBF9F4] rounded-xl cursor-pointer">
                  <div className="w-5 h-5 rounded border border-[#D5D9D5] flex items-center justify-center"><div className="w-3 h-3 rounded-sm bg-[#C28A78]"></div></div>
                  <div className="flex-1"><p className="text-sm font-medium text-[#3A3F3A]">{item.tenant}</p><p className="text-xs text-[#687068]">{item.property} · £{item.rent}</p></div>
                </label>
              ))}
            </div>
            <button onClick={() => setShowReminder(false)} className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl">Send</button>
          </div>
        </div>
      )}

      {showRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#3A3F3A]">Record Payment</h3>
              <button onClick={() => setShowRecord(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#94A3B8] mb-1 block">Amount</label>
                <div className="relative"><span className="absolute left-3 top-3 text-sm text-[#94A3B8]">£</span><input type="number" defaultValue="1850" className="w-full pl-7 pr-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4]" /></div>
              </div>
              <div>
                <label className="text-xs text-[#94A3B8] mb-1 block">Payment Date</label>
                <input type="date" defaultValue="2026-07-22" className="w-full px-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4]" />
              </div>
              <button onClick={() => setShowRecord(false)} className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl">Record Payment</button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}