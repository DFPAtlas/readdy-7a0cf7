"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { maintenanceJobs } from "../LandlordData";
import { getStatusConfig, getPriorityConfig, type MaintenanceStage } from "@/lib/maintenanceStatus";

function mapDbStage(stage: string): MaintenanceStage {
  if (!stage) return "reported";
  return stage as MaintenanceStage;
}

export default function LandlordMaintenancePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const filtered = maintenanceJobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.property.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const awaitingApprovalCount = maintenanceJobs.filter((j) => j.status === "Awaiting Approval").length;
  const openCount = maintenanceJobs.filter((j) => j.status === "Open" || j.status === "Awaiting Quote").length;
  const inProgressCount = maintenanceJobs.filter((j) => j.status === "In Progress" || j.status === "Scheduled").length;
  const completedCount = maintenanceJobs.filter((j) => j.status === "Completed").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Portal</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">Maintenance</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Maintenance &amp; Jobs</h1>
              <p className="text-sm text-[#687068] mt-1">Review quotes, approve work, and track jobs across your properties</p>
            </div>
          </div>
        </div>

        {awaitingApprovalCount > 0 && (
          <div className="bg-[#FEF9F7] border border-[#FCD9D0] rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EC4899]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-hourglass-line text-[#EC4899] text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#3A3F3A]">{awaitingApprovalCount} job{awaitingApprovalCount > 1 ? "s" : ""} awaiting your approval</p>
              <p className="text-xs text-[#687068]">Review quotes and approve work to keep maintenance moving</p>
            </div>
            <button onClick={() => setStatusFilter("Awaiting Approval")} className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">
              Review Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Awaiting Approval", value: awaitingApprovalCount, color: "text-[#EC4899]", bg: "bg-[#EC4899]/10", icon: "ri-hourglass-line" },
            { label: "Open Jobs", value: openCount, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-file-list-3-line" },
            { label: "In Progress", value: inProgressCount, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-tools-line" },
            { label: "Completed", value: completedCount, color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => {
                if (stat.label === "Awaiting Approval") setStatusFilter("Awaiting Approval");
                else if (stat.label === "Open Jobs") setStatusFilter("all");
                else if (stat.label === "In Progress") setStatusFilter("In Progress");
                else if (stat.label === "Completed") setStatusFilter("Completed");
              }}
              className={`bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:shadow-md transition-shadow ${statusFilter === stat.label ? "ring-2 ring-[#C28A78]" : ""}`}
            >
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                <i className={`${stat.icon} ${stat.color} text-sm`}></i>
              </div>
              <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068]">{stat.label}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs or properties..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
            >
              <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
              <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-20 min-w-[160px]">
                {["all", "Open", "Awaiting Quote", "Awaiting Approval", "In Progress", "Scheduled", "Completed"].map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap">{s === "all" ? "All Jobs" : s}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-tools-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No maintenance jobs found</p>
            </div>
          ) : (
            filtered.map((job) => {
              const isExpanded = expandedJob === job.id;
              const priorityCfg = getPriorityConfig(job.priority);
              return (
                <div key={job.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                  <button
                    onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${priorityCfg.bg}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>{job.priority}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${job.status === "Awaiting Approval" ? "bg-[#EC4899]/10 text-[#EC4899]" : job.status === "In Progress" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : job.status === "Completed" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{job.status}</span>
                      </div>
                      <p className="text-xs text-[#687068] mt-0.5">{job.property} · {job.contractor !== "—" ? job.contractor : "No contractor"} · Due: {job.due}</p>
                    </div>
                    <i className={`ri-arrow-down-s-line text-[#94A3B8] text-sm ${isExpanded ? "rotate-180" : ""}`}></i>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-[#E2E8F0] pt-3">
                      <p className="text-sm text-[#687068] mb-3">{job.description}</p>
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8] mb-3">
                        <span className="flex items-center gap-1"><i className="ri-time-line"></i>Reported {job.reported}</span>
                        <span className="flex items-center gap-1"><i className="ri-user-line"></i>{job.contractor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.quoteId && (
                          <Link href="/dashboard/landlord/quotes" className="text-sm font-medium text-[#C28A78] hover:text-[#143828] hover:underline">
                            View Quote
                          </Link>
                        )}
                        {job.status === "Awaiting Approval" && (
                          <button className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">
                            Approve Quote
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}