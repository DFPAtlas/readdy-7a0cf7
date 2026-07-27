"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { tickets, tenancyDocs, propertyManager, tenancyInfo } from "./TenantData";

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Reported: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line" },
  "Under Review": { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-search-line" },
  "Quote Requested": { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-money-pound-circle-line" },
  "Awaiting Approval": { color: "text-[#EC4899]", bg: "bg-[#EC4899]/10", icon: "ri-hourglass-line" },
  Scheduled: { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-calendar-check-line" },
  "In Progress": { color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line" },
  Completed: { color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line" },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  Low: { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  Medium: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  High: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  Emergency: { color: "text-white", bg: "bg-[#EF4444]" },
};

const tabs = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "tenancy", label: "Tenancy", icon: "ri-file-text-line" },
  { id: "rent", label: "Rent", icon: "ri-money-pound-circle-line" },
  { id: "maintenance", label: "Maintenance", icon: "ri-tools-line" },
  { id: "inspections", label: "Inspections", icon: "ri-clipboard-line" },
  { id: "documents", label: "Documents", icon: "ri-folder-line" },
  { id: "communications", label: "Communications", icon: "ri-message-3-line" },
];

export default function TenantDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [maintenanceFilter, setMaintenanceFilter] = useState("all");

  const activeTickets = tickets.filter((t) => t.status !== "Completed");
  const completedTickets = tickets.filter((t) => t.status === "Completed");

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tenants" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <i className="ri-arrow-left-line text-[#687068]"></i>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#3A3F3A]">Alex Johnson</h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">Active</span>
              </div>
              <p className="text-sm text-[#687068] mt-1">{tenancyInfo.property} · {tenancyInfo.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/tenant/contact" className="px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
              Contact
            </Link>
            <div className="relative">
              <button className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2">
                Actions
                <i className="ri-arrow-down-s-line text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tenant Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Current Property", value: tenancyInfo.property.split(" ").slice(0, 2).join(" "), icon: "ri-building-4-line", color: "bg-[#C28A78]", sub: tenancyInfo.address.split(",")[0] },
            { label: "Monthly Rent", value: `${tenancyInfo.rent}/mo`, icon: "ri-money-pound-circle-line", color: "bg-[#10B981]", sub: "Due 1st monthly" },
            { label: "Tenancy Ends", value: tenancyInfo.endDate, icon: "ri-calendar-close-line", color: "bg-[#EF4444]", sub: tenancyInfo.noticeRequired + " notice" },
            { label: "Open Repairs", value: activeTickets.length, icon: "ri-tools-line", color: "bg-[#F59E0B]", sub: `${completedTickets.length} completed` },
            { label: "Portal", value: "Active", icon: "ri-smartphone-line", color: "bg-[#3B82F6]", sub: "Last login 24 Jun" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className={`${stat.icon} text-white text-sm`}></i>
                </div>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
              <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white border border-[#D5D9D5] rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#F1F5F9]"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon}></i>
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Key Info Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D9D5] p-5">
                <h3 className="font-semibold text-[#3A3F3A] mb-4">Tenant &amp; Tenancy</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Email", value: "alex.johnson@email.com" },
                    { label: "Phone", value: "+44 7700 900001" },
                    { label: "Tenancy Start", value: tenancyInfo.startDate },
                    { label: "Tenancy End", value: tenancyInfo.endDate },
                    { label: "Rent", value: `${tenancyInfo.rent}/mo` },
                    { label: "Deposit", value: tenancyInfo.deposit },
                    { label: "Deposit Scheme", value: tenancyInfo.depositScheme },
                    { label: "Landlord", value: tenancyInfo.landlord },
                    { label: "Notice Period", value: tenancyInfo.noticeRequired },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#FBF9F4] rounded-lg p-3">
                      <p className="text-xs text-[#94A3B8]">{item.label}</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {/* Property Manager */}
                <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                  <h3 className="font-semibold text-[#3A3F3A] mb-3">Property Manager</h3>
                  <div className="flex items-center gap-3">
                    <img src={propertyManager.avatar} alt={propertyManager.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{propertyManager.name}</p>
                      <p className="text-xs text-[#687068]">{propertyManager.phone}</p>
                    </div>
                    <Link href="/dashboard/tenant/contact" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                      <i className="ri-message-3-line text-[#C28A78] text-sm"></i>
                    </Link>
                  </div>
                </div>

                {/* Upcoming */}
                <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
                  <h3 className="font-semibold text-[#3A3F3A] mb-3">Upcoming</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Next Inspection", value: tenancyInfo.nextInspection, icon: "ri-clipboard-line", color: "text-[#14B8A6]" },
                      { label: "Rent Due", value: "1 Jul 2026", icon: "ri-calendar-check-line", color: "text-[#10B981]" },
                      { label: "Tenancy Renewal", value: "14 Aug 2026", icon: "ri-loop-left-line", color: "text-[#F59E0B]" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${item.icon} ${item.color} text-sm`}></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#687068]">{item.label}</p>
                          <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Repairs Preview */}
            <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-tools-line text-[#F59E0B] text-sm"></i>
                  </div>
                  <h3 className="font-semibold text-[#3A3F3A]">Active Repairs</h3>
                  <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">{activeTickets.length}</span>
                </div>
                <button onClick={() => setActiveTab("maintenance")} className="text-sm text-[#C28A78] font-medium hover:underline">View all</button>
              </div>
              <div className="divide-y divide-[#D5D9D5]">
                {activeTickets.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="flex items-start gap-3 px-5 py-4 hover:bg-[#FBF9F4] transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig[ticket.status].bg}`}>
                      <i className={`${statusConfig[ticket.status].icon} ${statusConfig[ticket.status].color} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#3A3F3A] truncate">{ticket.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].color}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].color}`}>
                          {ticket.status}
                        </span>
                        <span className="text-xs text-[#94A3B8]">{ticket.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "tenancy" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h3 className="font-semibold text-[#3A3F3A] mb-4">Tenancy Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: "Start Date", value: tenancyInfo.startDate },
                { label: "End Date", value: tenancyInfo.endDate },
                { label: "Monthly Rent", value: tenancyInfo.rent },
                { label: "Deposit", value: tenancyInfo.deposit },
                { label: "Deposit Scheme", value: tenancyInfo.depositScheme },
                { label: "Rent Due", value: tenancyInfo.rentDueDay },
                { label: "Notice Period", value: tenancyInfo.noticeRequired },
                { label: "Landlord", value: tenancyInfo.landlord },
                { label: "Agent", value: tenancyInfo.agent },
                { label: "Next Inspection", value: tenancyInfo.nextInspection },
              ].map((item) => (
                <div key={item.label} className="bg-[#FBF9F4] rounded-lg p-4">
                  <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rent" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h3 className="font-semibold text-[#3A3F3A] mb-4">Rent Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D5D9D5]">
                    <th className="text-left px-4 py-2 font-medium text-[#687068]">Month</th>
                    <th className="text-left px-4 py-2 font-medium text-[#687068]">Amount</th>
                    <th className="text-left px-4 py-2 font-medium text-[#687068]">Date Paid</th>
                    <th className="text-left px-4 py-2 font-medium text-[#687068]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5D9D5]">
                  {[
                    { month: "Jun 2026", amount: "£1,850", date: "01 Jun 2026", status: "Paid" },
                    { month: "May 2026", amount: "£1,850", date: "01 May 2026", status: "Paid" },
                    { month: "Apr 2026", amount: "£1,850", date: "01 Apr 2026", status: "Paid" },
                    { month: "Mar 2026", amount: "£1,850", date: "01 Mar 2026", status: "Paid" },
                    { month: "Feb 2026", amount: "£1,850", date: "01 Feb 2026", status: "Paid" },
                    { month: "Jan 2026", amount: "£1,850", date: "01 Jan 2026", status: "Paid" },
                  ].map((p) => (
                    <tr key={p.month} className="hover:bg-[#FBF9F4]">
                      <td className="px-4 py-3 font-medium text-[#3A3F3A]">{p.month}</td>
                      <td className="px-4 py-3 text-[#3A3F3A]">{p.amount}</td>
                      <td className="px-4 py-3 text-[#687068]">{p.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/dashboard/tenant/rent" className="px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap">View Full Ledger</Link>
              <Link href="/dashboard/tenant/arrears" className="px-4 py-2 border border-[#D5D9D5] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">Arrears History</Link>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {["all", "Reported", "Under Review", "In Progress", "Scheduled", "Completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setMaintenanceFilter(s)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    maintenanceFilter === s ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {tickets.filter((t) => maintenanceFilter === "all" || t.status === maintenanceFilter).map((ticket) => (
                <Link key={ticket.id} href="/dashboard/tenant/maintenance" className="block bg-white rounded-xl border border-[#D5D9D5] p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig[ticket.status].bg}`}>
                      <i className={`${statusConfig[ticket.status].icon} ${statusConfig[ticket.status].color} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-[#3A3F3A]">{ticket.title}</h4>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].color}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-xs text-[#687068] mt-1 line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].color}`}>
                          {ticket.status}
                        </span>
                        <span className="text-xs text-[#94A3B8]">{ticket.category}</span>
                        <span className="text-xs text-[#94A3B8]">Updated {ticket.updatedDate}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === "inspections" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h3 className="font-semibold text-[#3A3F3A] mb-4">Inspections</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FBF9F4] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-calendar-line text-[#3B82F6] text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">Upcoming Routine Inspection</p>
                    <p className="text-xs text-[#687068]">{tenancyInfo.nextInspection} · {tenancyInfo.property}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">Scheduled</span>
              </div>
              <Link href="/dashboard/tenant/inspections" className="block text-sm text-[#C28A78] font-medium hover:underline">
                View all inspections
              </Link>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#D5D9D5]">
              <h3 className="font-semibold text-[#3A3F3A]">Tenancy Documents</h3>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {tenancyDocs.slice(0, 6).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                  <div className={`w-9 h-9 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${doc.icon} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p>
                    <p className="text-xs text-[#94A3B8]">{doc.type} · {doc.date} · {doc.size}</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors flex-shrink-0">
                    <i className="ri-download-line text-[#C28A78] text-sm"></i>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[#D5D9D5] bg-[#FBF9F4]">
              <Link href="/dashboard/tenant/documents" className="text-sm text-[#C28A78] font-medium hover:underline">View all documents</Link>
            </div>
          </div>
        )}

        {activeTab === "communications" && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
            <h3 className="font-semibold text-[#3A3F3A] mb-4">Recent Communications</h3>
            <div className="space-y-4">
              {[
                { type: "Email", subject: "Routine inspection confirmed", date: "22 Jun 2026", status: "Sent", icon: "ri-mail-line", color: "bg-[#3B82F6]" },
                { type: "Portal Message", subject: "Repair update: kitchen tap", date: "20 Jun 2026", status: "Read", icon: "ri-message-3-line", color: "bg-[#14B8A6]" },
                { type: "Email", subject: "Rent payment receipt - June 2026", date: "01 Jun 2026", status: "Sent", icon: "ri-mail-line", color: "bg-[#3B82F6]" },
              ].map((msg, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#FBF9F4] rounded-xl">
                  <div className={`w-9 h-9 ${msg.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${msg.icon} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3A3F3A]">{msg.subject}</p>
                    <p className="text-xs text-[#687068]">{msg.type} · {msg.date} · {msg.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}