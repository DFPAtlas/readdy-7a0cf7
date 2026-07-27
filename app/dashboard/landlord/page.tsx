"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { properties, maintenanceJobs, quotes, complianceCerts, documents, getPriorityActions, getUpcomingItems, getRecentActivity } from "./LandlordData";

const navSections = [
  { label: "Properties", icon: "ri-building-4-line", href: "/dashboard/landlord/properties", color: "bg-[#C28A78]" },
  { label: "Tenants", icon: "ri-user-3-line", href: "/dashboard/landlord/tenants", color: "bg-[#3B82F6]" },
  { label: "Rent", icon: "ri-coins-line", href: "/dashboard/landlord/rent", color: "bg-[#10B981]" },
  { label: "Maintenance", icon: "ri-tools-line", href: "/dashboard/landlord/maintenance", color: "bg-[#F59E0B]" },
  { label: "Quotes", icon: "ri-money-pound-circle-line", href: "/dashboard/landlord/quotes", color: "bg-[#8B5CF6]" },
  { label: "Compliance", icon: "ri-shield-check-line", href: "/dashboard/landlord/compliance", color: "bg-[#EF4444]" },
  { label: "Documents", icon: "ri-folder-line", href: "/dashboard/landlord/documents", color: "bg-[#14B8A6]" },
  { label: "Inspections", icon: "ri-clipboard-line", href: "/dashboard/landlord/inspections", color: "bg-[#EC4899]" },
];

export default function LandlordPortalPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  const openJobs = maintenanceJobs.filter((j) => j.status === "Open" || j.status === "Awaiting Approval" || j.status === "Awaiting Quote");
  const pendingApprovals = quotes.filter((q) => q.status === "Pending");
  const complianceAlerts = complianceCerts.filter((c) => c.status === "Expired" || c.status === "Expiring Soon");
  const priorityActions = getPriorityActions();
  const upcomingItems = getUpcomingItems();
  const recentActivity = getRecentActivity();

  const filteredJobs = selectedProperty === "all" ? openJobs : openJobs.filter((j) => j.property === properties.find((p) => p.id === selectedProperty)?.name);
  const filteredApprovals = selectedProperty === "all" ? pendingApprovals : pendingApprovals.filter((q) => q.property === properties.find((p) => p.id === selectedProperty)?.name);
  const filteredAlerts = selectedProperty === "all" ? complianceAlerts : complianceAlerts.filter((c) => c.property === properties.find((p) => p.id === selectedProperty)?.name);

  const totalRent = properties.reduce((sum, p) => sum + p.rent, 0);
  const occupied = properties.filter((p) => p.status === "Occupied").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* SECTION 1 — Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Landlord Overview</h1>
            <p className="text-sm text-[#687068] mt-1">{properties.length} properties · £{totalRent.toLocaleString()} monthly rent under management</p>
          </div>
          <div className="relative min-w-[200px]">
            <button className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] cursor-pointer">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-building-4-line text-[#94A3B8] text-sm"></i>
                </div>
                {selectedProperty === "all" ? "All Properties" : properties.find((p) => p.id === selectedProperty)?.name}
              </span>
              <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
            </button>
          </div>
        </div>

        {/* SECTION 2 — Priority Action Centre */}
        <div>
          {priorityActions.length > 0 ? (
            <div className="bg-[#FEF9F5] border border-[#F59E0B]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-alert-line text-[#F59E0B] text-sm"></i>
                </div>
                <h2 className="text-sm font-semibold text-[#3A3F3A]">Requires Attention</h2>
                <span className="text-[10px] font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">{priorityActions.length} items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {priorityActions.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-[#D5D9D5] p-3.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.priority === "Critical" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                        item.priority === "High" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                        "bg-[#3B82F6]/10 text-[#3B82F6]"
                      }`}>{item.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-[#3A3F3A] truncate">{item.title}</p>
                    <p className="text-xs text-[#687068] mt-0.5">{item.related} · {item.due}</p>
                    <Link
                      href={item.link}
                      className="mt-2 inline-block text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap"
                    >
                      {item.action} →
                    </Link>
                  </div>
                ))}
              </div>
              {priorityActions.length > 5 && (
                <Link href="/dashboard/landlord/compliance" className="mt-3 inline-block text-xs font-medium text-[#C28A78] hover:underline">
                  View all priority actions →
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-[#F0F9F0] border border-[#7A9A7E]/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-check-line text-[#7A9A7E]"></i>
              </div>
              <p className="text-sm text-[#3A3F3A]">No urgent actions — your portfolio is currently up to date.</p>
            </div>
          )}
        </div>

        {/* SECTION 3 — Portfolio Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Properties", value: properties.length, icon: "ri-building-4-line", sub: `${occupied}/${properties.length} occupied`, status: "neutral", link: "/dashboard/landlord/properties" },
            { label: "Monthly Rent", value: `£${totalRent.toLocaleString()}`, icon: "ri-money-pound-circle-line", sub: "total across portfolio", status: "good", link: "/dashboard/landlord/rent" },
            { label: "Compliance", value: `${complianceAlerts.length} alerts`, icon: "ri-shield-check-line", sub: `${complianceCerts.filter((c) => c.status === "Valid").length} valid`, status: complianceAlerts.length > 0 ? "warn" : "good", link: "/dashboard/landlord/compliance" },
            { label: "Open Jobs", value: openJobs.length, icon: "ri-tools-line", sub: `${pendingApprovals.length} awaiting approval`, status: openJobs.length > 0 ? "warn" : "good", link: "/dashboard/landlord/maintenance" },
            { label: "Active Tenants", value: occupied, icon: "ri-user-3-line", sub: "with tenancy agreements", status: "good", link: "/dashboard/landlord/tenants" },
          ].map((card) => {
            const statusColor =
              card.status === "good" ? "text-[#7A9A7E]" :
              card.status === "warn" ? "text-[#F59E0B]" : "text-[#687068]";
            const statusBg =
              card.status === "good" ? "bg-[#7A9A7E]/10" :
              card.status === "warn" ? "bg-[#F59E0B]/10" : "bg-[#F1F5F9]";

            return (
              <Link key={card.label} href={card.link} className="bg-white rounded-xl border border-[#D5D9D5] p-4 hover:border-[#C28A78] hover:shadow-sm transition-all cursor-pointer block">
                <div className={`w-9 h-9 ${statusBg} rounded-lg flex items-center justify-center mb-3`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${card.icon} ${statusColor} text-sm`}></i>
                  </div>
                </div>
                <p className={`text-lg font-bold ${card.status === "warn" ? "text-[#F59E0B]" : "text-[#3A3F3A]"}`}>{card.value}</p>
                <p className="text-xs text-[#687068]">{card.label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{card.sub}</p>
              </Link>
            );
          })}
        </div>

        {/* SECTION 4 — Navigation quick links */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {navSections.map((section) => (
            <Link key={section.label} href={section.href} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#D5D9D5] bg-white hover:shadow-md transition-shadow hover:border-[#C28A78]/20">
              <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${section.icon} text-white text-lg`}></i>
                </div>
              </div>
              <span className="text-xs font-medium text-[#3A3F3A] text-center whitespace-nowrap">{section.label}</span>
            </Link>
          ))}
        </div>

        {/* SECTION 5 — Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Jobs */}
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-[#F59E0B] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Open Maintenance</h2>
                <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">{filteredJobs.length}</span>
              </div>
              <Link href="/dashboard/landlord/maintenance" className="text-sm text-[#C28A78] font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {filteredJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${job.priority === "High" ? "bg-[#EF4444]" : job.priority === "Medium" ? "bg-[#F59E0B]" : "bg-[#10B981]"}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{job.title}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        job.status === "Awaiting Approval" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                        job.status === "Awaiting Quote" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                        "bg-[#F59E0B]/10 text-[#F59E0B]"
                      }`}>{job.status}</span>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5">{job.property} · {job.due}</p>
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-[#94A3B8]">No open maintenance jobs</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-money-pound-circle-line text-[#8B5CF6] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Pending Approvals</h2>
                <span className="text-xs font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">{filteredApprovals.length}</span>
              </div>
              <Link href="/dashboard/landlord/quotes" className="text-sm text-[#C28A78] font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {filteredApprovals.slice(0, 4).map((quote) => (
                <div key={quote.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                  <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-file-list-3-line text-[#687068] text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{quote.jobTitle}</p>
                      <span className="text-sm font-bold text-[#C28A78] flex-shrink-0">£{quote.totalAmount}</span>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5">{quote.contractor} · {quote.property}</p>
                  </div>
                </div>
              ))}
              {filteredApprovals.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-[#94A3B8]">No pending approvals</p>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Alerts */}
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-alert-line text-[#EF4444] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Compliance</h2>
                <span className="text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">{filteredAlerts.length}</span>
              </div>
              <Link href="/dashboard/landlord/compliance" className="text-sm text-[#C28A78] font-medium hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {filteredAlerts.slice(0, 4).map((cert) => (
                <div key={cert.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                  <div className={`w-8 h-8 ${cert.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${cert.icon} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{cert.type}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        cert.status === "Expired" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                      }`}>{cert.status}</span>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5">{cert.property} · {cert.daysLeft < 0 ? `${Math.abs(cert.daysLeft)} days overdue` : `${cert.daysLeft} days left`}</p>
                  </div>
                </div>
              ))}
              {filteredAlerts.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-[#94A3B8]">No compliance alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Activity */}
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-calendar-line text-[#3B82F6] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Upcoming</h2>
              </div>
              <Link href="/dashboard/landlord/inspections" className="text-sm text-[#C28A78] font-medium hover:underline">View timeline</Link>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {upcomingItems.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    item.type === "Rent" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                    item.type === "Compliance" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                    item.type === "Inspection" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                    "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                  }`}>{item.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#3A3F3A] truncate">{item.label}</p>
                    <p className="text-xs text-[#687068] mt-0.5">{item.date}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    item.status === "expiring" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#7A9A7E]/10 text-[#7A9A7E]"
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 6 — Recent Activity */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#3A3F3A]">Recent Activity</h2>
            <button className="text-xs font-medium text-[#C28A78] hover:text-[#143828] transition-colors whitespace-nowrap">View all activity</button>
          </div>
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#FBF9F4] transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <i className={`${item.icon} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#3A3F3A]">{item.desc}</p>
                  <p className="text-xs text-[#94A3B8]">{item.related}</p>
                </div>
                <span className="text-xs text-[#94A3B8] flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Property Table */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
            <h2 className="font-semibold text-[#3A3F3A]">Properties</h2>
            <Link href="/dashboard/landlord/properties" className="text-sm text-[#C28A78] font-medium hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D5] bg-[#FBF9F4]">
                  <th className="text-left px-5 py-3 font-medium text-[#687068]">Property</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden sm:table-cell">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden md:table-cell">Tenant</th>
                  <th className="text-left px-5 py-3 font-medium text-[#687068] hidden lg:table-cell">Rent</th>
                  <th className="text-right px-5 py-3 font-medium text-[#687068]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5D9D5]">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FBF9F4] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{p.name}</p>
                          <p className="text-xs text-[#94A3B8]">{p.city}, {p.postcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-[#687068] hidden md:table-cell">{p.tenant}</td>
                    <td className="px-5 py-3 text-[#3A3F3A] font-medium hidden lg:table-cell">£{p.rent.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/dashboard/landlord/properties`} className="text-sm text-[#C28A78] font-medium hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}