"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";
import ArrearsCaseCard from "@/components/dashboard/ArrearsCaseCard";
import { arrearsRiskConfig, ArrearsRisk } from "@/lib/financialStatus";
import { arrearsData } from "../../dashboard/arrears/ArrearsData";

export default function MobileArrearsPage() {
  const [selectedItem, setSelectedItem] = useState<typeof arrearsData[0] | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showSms, setShowSms] = useState(false);

  const totalArrears = arrearsData.reduce((sum, a) => sum + a.totalArrears, 0);
  const highRisk = arrearsData.filter((a) => a.riskRating === "High").length;

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#3A3F3A]">Arrears</h1>
            <p className="text-xs text-[#687068] mt-0.5">£{totalArrears.toLocaleString()} outstanding · {highRisk} urgent</p>
          </div>
          <button onClick={() => setShowActionSheet(true)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C46868] text-white">
            <i className="ri-notification-3-line text-sm"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Arrears", value: `£${totalArrears.toLocaleString()}`, color: "text-[#C46868]", icon: "ri-money-pound-circle-line" },
            { label: "In Arrears", value: arrearsData.length.toString(), color: "text-[#3A3F3A]", icon: "ri-user-3-line" },
            { label: "High Risk", value: highRisk.toString(), color: "text-[#C46868]", icon: "ri-alarm-warning-line" },
            { label: "Collection", value: "72%", color: "text-[#7A9A7E]", icon: "ri-progress-7-line" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                  <i className={`${stat.icon} ${stat.color} text-sm`}></i>
                </div>
                <span className="text-xs text-[#687068]">{stat.label}</span>
              </div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {highRisk > 0 && (
          <div className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#C46868]/10 rounded-lg flex items-center justify-center">
                <i className="ri-alarm-warning-line text-[#C46868] text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-[#3A3F3A]">Escalation Alert</p>
                <p className="text-xs text-[#687068]">{highRisk} cases need immediate attention</p>
              </div>
            </div>
            <button onClick={() => setShowActionSheet(true)} className="w-full py-2 text-xs font-medium text-white bg-[#C46868] rounded-lg hover:bg-[#DC2626] transition-colors">
              View Escalations
            </button>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-xs font-medium text-[#687068]">All Cases</p>
          {arrearsData.map((item) => (
            <ArrearsCaseCard
              key={item.id}
              property={item.property}
              tenant={item.tenant}
              rentAmount={item.rentAmount}
              totalArrears={item.totalArrears}
              arrearsMonths={item.arrearsMonths}
              riskRating={item.riskRating as ArrearsRisk}
              lastContact={item.lastContact}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowReminder(true)} className="flex items-center justify-center gap-2 py-3 bg-[#C28A78] text-white rounded-xl text-sm font-medium">
            <i className="ri-notification-3-line text-sm"></i>Reminders
          </button>
          <button onClick={() => setShowSms(true)} className="flex items-center justify-center gap-2 py-3 border border-[#3B82F6] text-[#3B82F6] rounded-xl text-sm font-medium">
            <i className="ri-message-3-line text-sm"></i>SMS
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
                <p className="text-lg font-bold text-[#3A3F3A]">£{selectedItem.rentAmount}</p>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#94A3B8]">Arrears</p>
                <p className="text-lg font-bold text-[#C46868]">£{selectedItem.totalArrears}</p>
              </div>
              <div className="bg-[#FBF9F4] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#94A3B8]">Months</p>
                <p className="text-lg font-bold text-[#3A3F3A]">{selectedItem.arrearsMonths}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setSelectedItem(null); setShowReminder(true); }} className="py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl">Reminder</button>
              <button onClick={() => { setSelectedItem(null); setShowSms(true); }} className="py-3 text-sm font-medium text-[#3B82F6] border border-[#3B82F6] rounded-xl">SMS</button>
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
              {arrearsData.map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 bg-[#FBF9F4] rounded-xl cursor-pointer">
                  <div className="w-5 h-5 rounded border border-[#D5D9D5] flex items-center justify-center"><div className="w-3 h-3 rounded-sm bg-[#C28A78]"></div></div>
                  <div className="flex-1"><p className="text-sm font-medium text-[#3A3F3A]">{item.tenant}</p><p className="text-xs text-[#687068]">{item.property} · £{item.totalArrears}</p></div>
                </label>
              ))}
            </div>
            <button onClick={() => setShowReminder(false)} className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl">Send</button>
          </div>
        </div>
      )}

      {showSms && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#3A3F3A]">Send SMS</h3>
              <button onClick={() => setShowSms(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="mb-4">
              <textarea rows={2} maxLength={160} defaultValue="Your rent is overdue. Please arrange payment today or contact us to discuss options." className="w-full px-3 py-3 border border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] bg-[#FBF9F4] resize-none"></textarea>
            </div>
            <button onClick={() => setShowSms(false)} className="w-full py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl">Send SMS</button>
          </div>
        </div>
      )}

      {showActionSheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#3A3F3A]">Escalation Cases</h3>
              <button onClick={() => setShowActionSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]"><i className="ri-close-line text-[#687068]"></i></button>
            </div>
            <div className="space-y-3">
              {arrearsData.filter((a) => a.riskRating === "High").map((item) => (
                <div key={item.id} className="bg-[#FEF2F2] rounded-xl border border-[#FECACA] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#C46868]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-alarm-warning-line text-[#C46868] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.tenant}</p>
                      <p className="text-xs text-[#687068]">{item.property} · £{item.totalArrears} · {item.arrearsMonths} months</p>
                    </div>
                  </div>
                  <button className="w-full py-2 text-xs font-medium text-white bg-[#C46868] rounded-lg hover:bg-[#DC2626] transition-colors">Escalate Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}