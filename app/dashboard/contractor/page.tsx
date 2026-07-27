"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { contractorJobs as mockJobs, contractorDocs as mockDocs, contractorProfile as mockProfile, performanceStats as mockStats } from "./ContractorData";
import { JOB_ASSIGNMENT_STATUS, getStatusConfig } from "@/lib/contractorSystem";
import ContractorActionCentre from "@/components/dashboard/ContractorActionCentre";

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Assigned: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line" },
  Quoted: { color: "text-[#D4A85C]", bg: "bg-[#D4A85C]/10", icon: "ri-money-pound-circle-line" },
  Approved: { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-check-line" },
  Scheduled: { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-calendar-check-line" },
  "In Progress": { color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line" },
  Completed: { color: "text-[#7A9A7E]", bg: "bg-[#7A9A7E]/10", icon: "ri-check-double-line" },
  Cancelled: { color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-close-line" },
};

interface ContJob {
  id: string; title: string; description: string; property: string; address: string;
  status: string; priority: string; category: string; assignedDate: string; dueDate: string;
  quoteTotal?: number; completedDate?: string; rating?: number;
}

function mapJobStatus(dbStatus: string): string {
  const s = (dbStatus || "").toLowerCase();
  if (s === "reported" || s === "open") return "Assigned";
  if (s === "in_progress") return "In Progress";
  if (s === "completed" || s === "resolved") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return "Assigned";
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "\u2014";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

const TABS = [
  { id: "overview", label: "Overview", icon: "ri-dashboard-line" },
  { id: "quotes", label: "Quotes", icon: "ri-file-list-3-line" },
  { id: "jobs", label: "Jobs", icon: "ri-tools-line" },
  { id: "documents", label: "Documents", icon: "ri-folder-line" },
];

export default function ContractorPortalPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ContJob[]>([]);
  const [profile] = useState(mockProfile);
  const [docs] = useState(mockDocs);
  const [stats] = useState(mockStats);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isDemoAccount()) {
      setJobs(mockJobs as ContJob[]);
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const { data: mJobs, error: mErr } = await supabase
          .from("maintenance_jobs")
          .select("id, property_id, title, description, status, created_at, assigned_contractor_profile_id")
          .not("assigned_contractor_profile_id", "is", null)
          .order("created_at", { ascending: false });

        if (mErr) throw mErr;
        if (!mJobs || mJobs.length === 0) { setJobs([]); setLoading(false); return; }

        const propertyIds = [...new Set(mJobs.map((j: any) => j.property_id))];
        const contractorIds = [...new Set(mJobs.map((j: any) => j.assigned_contractor_profile_id).filter(Boolean))];

        const { data: properties } = await supabase.from("properties").select("id, line1, city, postcode").in("id", propertyIds);
        const propMap = new Map<string, any>();
        (properties || []).forEach((p: any) => propMap.set(p.id, p));

        const { data: cQuotes } = await supabase
          .from("contractor_quotes")
          .select("maintenance_job_id, total_amount, status, created_at")
          .in("maintenance_job_id", mJobs.map((j: any) => j.id));

        const quoteMap = new Map<string, any>();
        (cQuotes || []).forEach((q: any) => {
          if (q.maintenance_job_id && !quoteMap.has(q.maintenance_job_id)) quoteMap.set(q.maintenance_job_id, q);
        });

        const built: ContJob[] = mJobs.map((j: any) => {
          const prop = propMap.get(j.property_id);
          const quote = quoteMap.get(j.id);
          return {
            id: j.id, title: j.title || "Untitled Job", description: j.description || "",
            property: prop ? prop.line1 : "Unknown", address: prop ? `${prop.line1}, ${prop.city} ${prop.postcode}` : "",
            status: quote ? (quote.status === "approved" ? "Approved" : "Quoted") : mapJobStatus(j.status),
            priority: "Medium", category: "\u2014",
            assignedDate: timeAgo(j.created_at), dueDate: "\u2014",
            quoteTotal: quote?.total_amount || undefined,
            completedDate: j.status === "completed" ? timeAgo(j.created_at) : undefined,
          };
        });

        setJobs(built);
      } catch (err: any) {
        setError(err.message || "Failed to load contractor data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const activeJobs = jobs.filter((j) => j.status !== "Completed" && j.status !== "Cancelled");
  const pendingQuotes = jobs.filter((j) => j.status === "Assigned");
  const inProgress = jobs.filter((j) => j.status === "In Progress" || j.status === "Scheduled" || j.status === "Approved");
  const completedJobs = jobs.filter((j) => j.status === "Completed");

  const actionItems = [
    ...pendingQuotes.map((j) => ({
      id: `quote-${j.id}`,
      contractorId: j.id,
      contractorName: j.title,
      trade: j.category,
      issue: "Submit your quote",
      deadline: j.dueDate,
      priority: "high" as const,
      actionLabel: "Submit Quote",
    })),
    ...inProgress.map((j) => ({
      id: `complete-${j.id}`,
      contractorId: j.id,
      contractorName: j.title,
      trade: j.category,
      issue: "Submit completion evidence",
      deadline: j.dueDate,
      priority: "medium" as const,
      actionLabel: "Complete",
    })),
  ].slice(0, 5);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-[#687068]">Loading contractor data...</span>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#FEF2F2] rounded-full flex items-center justify-center">
            <i className="ri-error-warning-line text-[#EF4444] text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-[#EF4444]">Failed to load contractor data</p>
          <p className="text-xs text-[#687068] mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#C28A78] font-medium hover:underline">Try again</button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#C28A78]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#C28A78]">{profile.companyName.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Contractor Portal</h1>
              <p className="text-sm text-[#687068] mt-0.5">{profile.companyName} · {profile.trade}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#687068] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">
              <i className="ri-star-fill mr-1 text-amber-400"></i>
              {profile.rating} Rating
            </span>
            <span className="text-xs text-[#7A9A7E] bg-[#7A9A7E]/10 px-3 py-1.5 rounded-lg font-medium">
              <i className="ri-check-double-line mr-1"></i>
              {completedJobs.length} Done
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Active Jobs", value: activeJobs.length, icon: "ri-tools-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
            { label: "Quotes Needed", value: pendingQuotes.length, icon: "ri-money-pound-circle-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
            { label: "In Progress", value: inProgress.length, icon: "ri-loader-4-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "This Month", value: `£${stats.thisMonthRevenue.toLocaleString()}`, icon: "ri-funds-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
            { label: "On-Time Rate", value: `${stats.onTimeRate}%`, icon: "ri-timer-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} ${stat.color} text-lg`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <ContractorActionCentre actions={actionItems} />

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center gap-1 px-2 py-2 border-b border-[#D5D9D5] overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F1F5F9]"}`}
              >
                <i className={`${tab.icon} text-sm`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-flag-line text-[#EF4444] text-sm"></i>
                      </div>
                      <h3 className="font-semibold text-[#3A3F3A]">Quotes Needed</h3>
                    </div>
                    <span className="text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded-full">{pendingQuotes.length}</span>
                  </div>
                  <div className="divide-y divide-[#D5D9D5]">
                    {pendingQuotes.length === 0 ? (
                      <div className="px-5 py-6 text-center"><p className="text-sm text-[#94A3B8]">No quotes pending</p></div>
                    ) : (
                      pendingQuotes.map((job) => (
                        <Link key={job.id} href="/dashboard/contractor/jobs" className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                          <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-flag-line text-[#EF4444] text-sm"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                            <p className="text-xs text-[#687068] mt-0.5">{job.property} · Assigned {job.assignedDate}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                        <i className="ri-tools-line text-[#3B82F6] text-sm"></i>
                      </div>
                      <h3 className="font-semibold text-[#3A3F3A]">Active Jobs</h3>
                    </div>
                    <Link href="/dashboard/contractor/jobs" className="text-sm text-[#C28A78] font-medium hover:underline">View all</Link>
                  </div>
                  <div className="divide-y divide-[#D5D9D5]">
                    {activeJobs.length === 0 ? (
                      <div className="px-5 py-6 text-center"><p className="text-sm text-[#94A3B8]">No active jobs</p></div>
                    ) : (
                      activeJobs.slice(0, 4).map((job) => (
                        <Link key={job.id} href="/dashboard/contractor/jobs" className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${(statusConfig[job.status] || statusConfig.Assigned).bg}`}>
                            <i className={`${(statusConfig[job.status] || statusConfig.Assigned).icon} ${(statusConfig[job.status] || statusConfig.Assigned).color} text-sm`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-[#3A3F3A] truncate">{job.title}</p>
                              <span className="text-xs font-medium text-[#C28A78] flex-shrink-0">{job.quoteTotal ? `£${job.quoteTotal.toLocaleString()}` : "\u2014"}</span>
                            </div>
                            <p className="text-xs text-[#687068] mt-0.5">{job.property}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(statusConfig[job.status] || statusConfig.Assigned).bg} ${(statusConfig[job.status] || statusConfig.Assigned).color}`}>{job.status}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quotes Tab */}
            {activeTab === "quotes" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Quote Requests</h3>
                </div>
                {pendingQuotes.length === 0 && jobs.filter(j => j.quoteTotal).length === 0 ? (
                  <p className="text-sm text-[#94A3B8] py-4 text-center">No quotes to manage</p>
                ) : (
                  [...pendingQuotes, ...jobs.filter(j => j.quoteTotal)].slice(0, 6).map((job) => (
                    <Link key={job.id} href="/dashboard/contractor/jobs" className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                        <p className="text-xs text-[#687068]">{job.property} · {job.category}</p>
                      </div>
                      <div className="text-right">
                        {job.quoteTotal ? <p className="text-sm font-bold text-[#C28A78]">£{job.quoteTotal.toLocaleString()}</p> : <span className="text-xs text-[#EF4444] font-medium">Action needed</span>}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div className="space-y-3">
                {jobs.length === 0 ? (
                  <p className="text-sm text-[#94A3B8] py-4 text-center">No jobs assigned yet</p>
                ) : (
                  jobs.map((job) => (
                    <Link key={job.id} href="/dashboard/contractor/jobs" className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5] hover:border-[#C28A78] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${(statusConfig[job.status] || statusConfig.Assigned).bg}`}>
                          <i className={`${(statusConfig[job.status] || statusConfig.Assigned).icon} ${(statusConfig[job.status] || statusConfig.Assigned).color} text-sm`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                          <p className="text-xs text-[#687068]">{job.property}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(statusConfig[job.status] || statusConfig.Assigned).bg} ${(statusConfig[job.status] || statusConfig.Assigned).color}`}>{job.status}</span>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#3A3F3A]">Documents</h3>
                </div>
                {docs.length === 0 ? (
                  <p className="text-sm text-[#94A3B8] py-4 text-center">No documents</p>
                ) : (
                  docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#D5D9D5]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <i className={`${doc.icon} text-white text-sm`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#3A3F3A]">{doc.name}</p>
                          <p className="text-xs text-[#687068]">{doc.type} · {doc.date} · {doc.size}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${doc.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : doc.status === "Expiring Soon" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>{doc.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}