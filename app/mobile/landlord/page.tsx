"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/MobileBottomNav";

const portfolioSummary = [
  { label: "Properties", value: 12, change: "+2", positive: true },
  { label: "Monthly Rent", value: "£12,450", change: "+£350", positive: true },
  { label: "Occupancy", value: "92%", change: "+3%", positive: true },
  { label: "Arrears", value: "£1,200", change: "-£500", positive: true },
];

const properties = [
  { id: 1, name: "45 Baker Street", tenant: "John Miller", rent: "£1,200", status: "Occupied", daysToRent: 0 },
  { id: 2, name: "12 Rose Avenue", tenant: "David Thompson", rent: "£950", status: "Occupied", daysToRent: 0 },
  { id: 3, name: "8 The Crescent", tenant: "Vacant", rent: "£1,100", status: "Vacant", daysToRent: 12 },
  { id: 4, name: "Flat 4B Oak Street", tenant: "Emily Carter", rent: "£875", status: "Occupied", daysToRent: 0 },
  { id: 5, name: "7 Park View", tenant: "Vacant", rent: "£1,350", status: "Vacant", daysToRent: 45 },
];

const recentActivities = [
  { id: 1, title: "Rent received", desc: "£950 from David Thompson", time: "Today", icon: "ri-coins-line", color: "bg-[#10B981]" },
  { id: 2, title: "Quote approved", desc: "£340 roof repair at 45 Baker Street", time: "Yesterday", icon: "ri-check-line", color: "bg-[#3B82F6]" },
  { id: 3, title: "Inspection completed", desc: "Flat 4B Oak Street - Excellent", time: "2 days ago", icon: "ri-check-double-line", color: "bg-[#14B8A6]" },
  { id: 4, title: "Maintenance request", desc: "Boiler issue at 12 Rose Avenue", time: "3 days ago", icon: "ri-tools-line", color: "bg-[#F59E0B]" },
];

export default function MobileLandlordPage() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(2);

  const notifications = [
    { id: 1, title: "Rent received", desc: "£950 from David Thompson", type: "success", time: "2 hrs ago" },
    { id: 2, title: "Maintenance quote", desc: "£340 roof repair needs approval", type: "info", time: "1 day ago" },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#14B8A6] text-white px-4 pt-4 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/70">Portfolio</p>
            <h1 className="text-xl font-bold">James Wilson</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center relative"
            >
              <i className="ri-notification-3-line text-lg"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              JW
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {portfolioSummary.map((item) => (
            <div key={item.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/70">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
              <p className={`text-[10px] ${item.positive ? "text-white/90" : "text-white/70"}`}>{item.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-0 right-0 left-0 bg-white rounded-b-2xl p-4 shadow-lg max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#3A3F3A]">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                  <div className={`w-8 h-8 ${n.type === "success" ? "bg-[#10B981]" : "bg-[#3B82F6]"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${n.type === "success" ? "ri-check-line" : "ri-information-line"} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#3A3F3A]">{n.title}</p>
                    <p className="text-xs text-[#687068]">{n.desc}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-4 gap-3">
            <Link href="/mobile/maintenance" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#F59E0B] rounded-xl flex items-center justify-center">
                <i className="ri-tools-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Jobs</span>
            </Link>
            <Link href="/mobile/quotes" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center">
                <i className="ri-file-list-3-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Quotes</span>
            </Link>
            <Link href="/mobile/documents" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#14B8A6] rounded-xl flex items-center justify-center">
                <i className="ri-folder-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Docs</span>
            </Link>
            <Link href="/mobile/inspections" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#8B5CF6] rounded-xl flex items-center justify-center">
                <i className="ri-clipboard-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Inspect</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] rounded-lg">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === "portfolio" ? "bg-[#14B8A6] text-white" : "text-[#687068]"}`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab("rent")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === "rent" ? "bg-[#14B8A6] text-white" : "text-[#687068]"}`}
          >
            Rent
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === "activity" ? "bg-[#14B8A6] text-white" : "text-[#687068]"}`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 space-y-3 mb-6">
        {activeTab === "portfolio" && (
          <>
            {properties.map((prop) => (
              <div key={prop.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#3A3F3A]">{prop.name}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    prop.status === "Occupied" ? "bg-[#10B981]/10 text-[#10B981]" :
                    "bg-[#EF4444]/10 text-[#EF4444]"
                  }`}>{prop.status}</span>
                </div>
                <p className="text-xs text-[#687068]">{prop.tenant} · {prop.rent}/mo</p>
                {prop.status === "Vacant" && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-[#F8FAFC] rounded-lg h-2">
                      <div className="bg-[#F59E0B] h-2 rounded-lg" style={{ width: `${Math.min(100, prop.daysToRent)}%` }}></div>
                    </div>
                    <span className="text-[10px] text-[#F59E0B]">{prop.daysToRent} days to rent</span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {activeTab === "rent" && (
          <>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-[#94A3B8] mb-2">This Month</p>
              <p className="text-2xl font-bold text-[#3A3F3A]">£12,450</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-[#10B981] font-medium">92% collected</span>
                <span className="text-[10px] text-[#94A3B8]">· £1,200 outstanding</span>
              </div>
              <div className="mt-3 bg-[#F8FAFC] rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#687068]">45 Baker Street</span>
                  <span className="text-[#10B981] font-medium">Paid</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-[#687068]">12 Rose Avenue</span>
                  <span className="text-[#10B981] font-medium">Paid</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-[#687068]">8 The Crescent</span>
                  <span className="text-[#EF4444] font-medium">Vacant</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-[#687068]">Flat 4B Oak Street</span>
                  <span className="text-[#F59E0B] font-medium">Pending</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-[#687068]">7 Park View</span>
                  <span className="text-[#EF4444] font-medium">Vacant</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "activity" && (
          <>
            {recentActivities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 ${activity.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <i className={`${activity.icon} text-white text-sm`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#3A3F3A]">{activity.title}</p>
                  <p className="text-xs text-[#687068]">{activity.desc}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </MobileLayout>
  );
}