"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/MobileBottomNav";

const quickActions = [
  { icon: "ri-tools-line", label: "New Job", href: "/mobile/maintenance/report", color: "bg-[#F59E0B]" },
  { icon: "ri-clipboard-line", label: "Inspect", href: "/mobile/inspections", color: "bg-[#14B8A6]" },
  { icon: "ri-file-list-3-line", label: "Quotes", href: "/mobile/quotes", color: "bg-[#3B82F6]" },
  { icon: "ri-qr-scan-line", label: "Scan", href: "/mobile/qr", color: "bg-[#8B5CF6]" },
];

const recentJobs = [
  { id: 1, title: "Boiler not heating", property: "12 Rose Avenue", priority: "High", status: "In Progress", trade: "Plumbing" },
  { id: 2, title: "Window lock broken", property: "Flat 4B Oak Street", priority: "Medium", status: "Quoted", trade: "Locksmith" },
  { id: 3, title: "Gutter cleaning", property: "8 The Crescent", priority: "Low", status: "Completed", trade: "Landscaping" },
];

const inspections = [
  { id: 1, property: "45 Baker Street", type: "Routine", date: "Today 2:00 PM", status: "Scheduled" },
  { id: 2, property: "Flat 4B Oak Street", type: "Move Out", date: "Tomorrow 10:00 AM", status: "Scheduled" },
];

const priorityColor = (p: string) => {
  if (p === "High") return "bg-[#EF4444]";
  if (p === "Medium") return "bg-[#F59E0B]";
  return "bg-[#10B981]";
};

const statusBadge = (s: string) => {
  if (s === "Completed") return "bg-[#10B981]/10 text-[#10B981]";
  if (s === "In Progress") return "bg-[#3B82F6]/10 text-[#3B82F6]";
  if (s === "Quoted") return "bg-[#F59E0B]/10 text-[#F59E0B]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
};

export default function MobileAgentPage() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(4);

  const notifications = [
    { id: 1, title: "Quote approved", desc: "£340 roof repair - 45 Baker Street", type: "success", time: "5 min ago" },
    { id: 2, title: "Inspection overdue", desc: "Flat 4B - Routine inspection past due", type: "urgent", time: "1 hr ago" },
    { id: 3, title: "New tenant enquiry", desc: "Emily Carter - 2-bed flat", type: "info", time: "2 hrs ago" },
    { id: 4, title: "Contractor arrived", desc: "GreenPlumb at 12 Rose Avenue", type: "success", time: "3 hrs ago" },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/70">Welcome back</p>
            <h1 className="text-xl font-bold">Alex Smith</h1>
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
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center text-sm font-bold">
              AS
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">18</p>
            <p className="text-[10px] text-white/70">Properties</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">5</p>
            <p className="text-[10px] text-white/70">Open Jobs</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">2</p>
            <p className="text-[10px] text-white/70">Inspections</p>
          </div>
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
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === "urgent" ? "bg-[#EF4444]" : n.type === "success" ? "bg-[#10B981]" : "bg-[#3B82F6]"}`}>
                    <i className={`${n.type === "urgent" ? "ri-alert-line" : n.type === "success" ? "ri-check-line" : "ri-information-line"} text-white text-sm`}></i>
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
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <i className={`${action.icon} text-white text-lg`}></i>
                </div>
                <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] rounded-lg">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === "jobs" ? "bg-[#C28A78] text-white" : "text-[#687068]"}`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab("inspections")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === "inspections" ? "bg-[#C28A78] text-white" : "text-[#687068]"}`}
          >
            Inspections
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${activeTab === "properties" ? "bg-[#C28A78] text-white" : "text-[#687068]"}`}
          >
            Properties
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="px-4 mt-4 space-y-3 mb-6">
        {activeTab === "jobs" && (
          <>
            {recentJobs.map((job) => (
              <Link key={job.id} href="/mobile/maintenance" className="block bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priorityColor(job.priority)}`}></div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(job.status)}`}>{job.status}</span>
                </div>
                <p className="text-xs text-[#687068]">{job.property} · {job.trade}</p>
              </Link>
            ))}
          </>
        )}

        {activeTab === "inspections" && (
          <>
            {inspections.map((inspection) => (
              <Link key={inspection.id} href="/mobile/inspections" className="block bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-clipboard-line text-[#14B8A6] text-sm"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{inspection.property}</p>
                      <p className="text-xs text-[#94A3B8]">{inspection.type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">{inspection.status}</span>
                </div>
                <p className="text-xs text-[#687068]">{inspection.date}</p>
              </Link>
            ))}
          </>
        )}

        {activeTab === "properties" && (
          <>
            {[
              { id: 1, name: "45 Baker Street", tenant: "John Miller", rent: "£1,200", status: "Occupied" },
              { id: 2, name: "12 Rose Avenue", tenant: "David Thompson", rent: "£950", status: "Occupied" },
              { id: 3, name: "8 The Crescent", tenant: "Sarah Jenkins", rent: "£1,100", status: "Notice" },
              { id: 4, name: "Flat 4B Oak Street", tenant: "Emily Carter", rent: "£875", status: "Vacant" },
            ].map((prop) => (
              <div key={prop.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#3A3F3A]">{prop.name}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    prop.status === "Occupied" ? "bg-[#10B981]/10 text-[#10B981]" :
                    prop.status === "Vacant" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    "bg-[#F59E0B]/10 text-[#F59E0B]"
                  }`}>{prop.status}</span>
                </div>
                <p className="text-xs text-[#687068]">{prop.tenant} · {prop.rent}/mo</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Today Section */}
      <div className="px-4 mt-4 mb-6">
        <h2 className="font-semibold text-[#3A3F3A] mb-3">Today</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-check-double-line text-[#10B981] text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#3A3F3A]">Boiler service completed</p>
                <p className="text-xs text-[#94A3B8]">12 Rose Avenue · 10:30 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-message-3-line text-[#3B82F6] text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#3A3F3A]">Tenant message received</p>
                <p className="text-xs text-[#94A3B8]">Emily Carter · 9:15 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-calendar-check-line text-[#F59E0B] text-sm"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#3A3F3A]">Inspection scheduled</p>
                <p className="text-xs text-[#94A3B8]">Flat 7 Park View · 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}