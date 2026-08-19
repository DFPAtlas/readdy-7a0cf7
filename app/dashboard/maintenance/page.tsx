"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import DemoHelperTip from "@/components/dashboard/DemoHelperTip";
import MaintenanceJobCard from "@/components/dashboard/MaintenanceJobCard";
import { isDemoAccount } from "@/lib/demoMode";
import { useEntitlements } from "@/lib/useEntitlements";
import { getStatusConfig, getPriorityConfig, type MaintenanceStage } from "@/lib/maintenanceStatus";

interface ActionItem {
  id: string;
  priority: string;
  title: string;
  property: string;
  stage: string;
  waitingSince: string;
  responsibleRole: string;
}

const DEMO_ACTIONS: ActionItem[] = [
  { id: "a1", priority: "High", title: "Boiler pressure loss", property: "Rose Court Flat 2A", stage: "in_progress", waitingSince: "2 days ago", responsibleRole: "Contractor" },
  { id: "a2", priority: "High", title: "Tripped electrics in kitchen", property: "45 Baker Street", stage: "reported", waitingSince: "4 hours ago", responsibleRole: "Agency" },
  { id: "a3", priority: "Normal", title: "Garden fence panel replacement", property: "8 The Crescent", stage: "quote_received", waitingSince: "2 days ago", responsibleRole: "Agency" },
  { id: "a4", priority: "Low", title: "Extractor fan noisy", property: "12 Rose Avenue", stage: "awaiting_confirmation", waitingSince: "Yesterday", responsibleRole: "Tenant" },
];

const DEMO_JOBS = [
  { id: "1", reference: "MAINT-001", title: "Boiler pressure loss", property: "12 Rose Avenue, London", propertyAddress: "12 Rose Avenue, London E1 6AN", stage: "in_progress" as MaintenanceStage, priority: "High", contractor: "GreenPlumb Ltd", targetDate: "25 Jul 2026", reportedDate: "20 Jul 2026", estimatedCost: "£280", nextAction: "Complete boiler repair", responsibleRole: "Contractor" },
  { id: "2", reference: "MAINT-002", title: "Tripped electrics in kitchen", property: "45 Baker Street, Manchester", propertyAddress: "45 Baker Street, Manchester M1 2CD", stage: "reported" as MaintenanceStage, priority: "High", contractor: "—", targetDate: "24 Jul 2026", reportedDate: "22 Jul 2026", estimatedCost: "—", nextAction: "Triage and assess safety risk", responsibleRole: "Agency" },
  { id: "3", reference: "MAINT-003", title: "Garden fence panel replacement", property: "8 The Crescent, Leeds", propertyAddress: "8 The Crescent, Leeds LS1 3AB", stage: "quote_received" as MaintenanceStage, priority: "Normal", contractor: "BuildRight Construction", targetDate: "30 Jul 2026", reportedDate: "18 Jul 2026", estimatedCost: "£480", nextAction: "Review and approve quote", responsibleRole: "Landlord" },
  { id: "4", reference: "MAINT-004", title: "Extractor fan noisy", property: "12 Rose Avenue, London", propertyAddress: "12 Rose Avenue, London E1 6AN", stage: "awaiting_confirmation" as MaintenanceStage, priority: "Low", contractor: "SparkPro Electrics", targetDate: "22 Jul 2026", reportedDate: "16 Jul 2026", estimatedCost: "£145", nextAction: "Tenant to confirm repair complete", responsibleRole: "Tenant" },
  { id: "5", reference: "MAINT-005", title: "Roof gutter cleaning", property: "Riverside Court, Bristol", propertyAddress: "Unit 3, Riverside Court, Bristol BS1 4ST", stage: "finding_contractor" as MaintenanceStage, priority: "Low", contractor: "—", targetDate: "5 Aug 2026", reportedDate: "15 Jul 2026", estimatedCost: "—", nextAction: "Invite contractors to quote", responsibleRole: "Agency" },
  { id: "6", reference: "MAINT-006", title: "Front door lock sticking", property: "Flat 4B, Oak Street, Birmingham", propertyAddress: "Flat 4B, Oak Street, Birmingham B2 3CD", stage: "completed" as MaintenanceStage, priority: "Normal", contractor: "SecureFix Locksmiths", targetDate: "20 Jul 2026", reportedDate: "10 Jul 2026", estimatedCost: "£65", nextAction: "Close job", responsibleRole: "Agency" },
  { id: "7", reference: "MAINT-007", title: "Damp patch in bathroom", property: "Flat 2A, Park View, Cardiff", propertyAddress: "Flat 2A, Park View, Cardiff CF10 3BZ", stage: "triage" as MaintenanceStage, priority: "High", contractor: "—", targetDate: "23 Jul 2026", reportedDate: "21 Jul 2026", estimatedCost: "—", nextAction: "AI triage recommends damp specialist", responsibleRole: "Agency" },
  { id: "8", reference: "MAINT-008", title: "Smoke alarm beeping", property: "45 Baker Street, Manchester", propertyAddress: "45 Baker Street, Manchester M1 2CD", stage: "appointment_scheduled" as MaintenanceStage, priority: "Critical", contractor: "SafeWire Electrical", targetDate: "23 Jul 2026", reportedDate: "21 Jul 2026", estimatedCost: "£120", nextAction: "Contractor visit tomorrow", responsibleRole: "Contractor" },
];

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobSuccess, setNewJobSuccess] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    property: "12 Rose Avenue, London E1 6AN",
    category: "Plumbing",
    priority: "Normal",
    description: "",
    reportedBy: "Tenant",
    targetDate: "",
    accessNotes: "",
  });
  const { isReadOnly } = useEntitlements();

  useEffect(() => {
    setDemoMode(isDemoAccount());
    setLoading(false);
  }, []);

  const actions = DEMO_ACTIONS;
  const allJobs = DEMO_JOBS;

  const filtered = allJobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.property.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.stage === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const urgentCount = allJobs.filter((j) => j.priority === "Emergency" || j.priority === "Critical" || j.priority === "High").length;
  const awaitingActionCount = allJobs.filter((j) => ["reported", "triage", "awaiting_approval", "quote_received", "awaiting_confirmation"].includes(j.stage)).length;
  const scheduledCount = allJobs.filter((j) => j.stage === "appointment_scheduled" || j.stage === "in_progress").length;
  const inProgressCount = allJobs.filter((j) => j.stage === "in_progress").length;
  const overdueCount = allJobs.filter((j) => j.stage !== "completed" && j.stage !== "closed" && j.stage !== "cancelled").length;

  const hasUrgentActions = actions.length > 0;

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-[#687068]">Loading maintenance jobs...</span>
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#FEF2F2] rounded-full flex items-center justify-center">
            <i className="ri-error-warning-line text-[#C46868] text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-[#C46868]">Failed to load maintenance data</p>
          <p className="text-xs text-[#687068] mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-[#C28A78] font-medium hover:underline">
            Try again
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Maintenance</h1>
            <p className="text-sm text-[#687068] mt-1">Track and manage repair jobs across your portfolio</p>
          </div>
          {demoMode && (
            <DemoHelperTip id="maintenance-overview" title="Maintenance Tracking">
              Track jobs by stage and priority. The system links maintenance to properties and can generate quote requests.
            </DemoHelperTip>
          )}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/quotes"
              className="bg-white border border-[#D5D9D5] hover:bg-[#FBF9F4] text-[#C28A78] font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-file-list-3-line text-sm"></i>
              </div>
              View Quotes
            </Link>
            <Link
              href="/dashboard/ai-maintenance-triage"
              className="bg-white border border-[#D5D9D5] hover:bg-[#FBF9F4] text-[#3A3F3A] font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-brain-line text-sm"></i>
              </div>
              AI Triage
            </Link>
            {!isReadOnly && (
              <button
                onClick={() => setShowNewJobModal(true)}
                className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-add-line text-sm"></i>
                </div>
                New Job
              </button>
            )}
          </div>
        </div>

        {isReadOnly && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-4 py-2.5 text-sm text-[#DC2626]">
            <i className="ri-lock-line text-sm"></i>
            <span>Trial ended — upgrade to create jobs</span>
          </div>
        )}

        {hasUrgentActions && (
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#D5D9D5] bg-[#FEF9F7]">
              <div className="w-6 h-6 bg-[#C28A78]/10 rounded flex items-center justify-center">
                <i className="ri-alert-line text-[#C28A78] text-sm"></i>
              </div>
              <h2 className="text-sm font-semibold text-[#3A3F3A]">Action Required</h2>
              <span className="text-[10px] font-medium text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{actions.length}</span>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {actions.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityConfig(a.priority).bg}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#3A3F3A]">{a.title}</p>
                      <span className="text-[10px] text-[#94A3B8]">{a.property}</span>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5">
                      {getStatusConfig(a.stage).label} · Waiting {a.waitingSince} · <span className="font-medium text-[#C28A78]">{a.responsibleRole}</span>
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">
                    Take Action
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Urgent", value: urgentCount, stage: "reported" as MaintenanceStage, clickFilter: "reported" },
            { label: "Awaiting Action", value: awaitingActionCount, stage: "triage" as MaintenanceStage, clickFilter: "triage" },
            { label: "Scheduled", value: scheduledCount, stage: "appointment_scheduled" as MaintenanceStage, clickFilter: "appointment_scheduled" },
            { label: "In Progress", value: inProgressCount, stage: "in_progress" as MaintenanceStage, clickFilter: "in_progress" },
            { label: "Overdue", value: overdueCount, stage: "awaiting_approval" as MaintenanceStage, clickFilter: "reported" },
          ].map((s) => {
            const cfg = getStatusConfig(s.stage);
            return (
              <button
                key={s.label}
                onClick={() => { setStatusFilter(s.clickFilter); }}
                className={`bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:shadow-md transition-shadow ${statusFilter === s.clickFilter ? "ring-2 ring-[#C28A78]" : ""}`}
              >
                <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <i className={`${cfg.icon} ${cfg.color} text-sm`}></i>
                </div>
                <p className="text-xl font-bold text-[#3A3F3A]">{s.value}</p>
                <p className="text-xs text-[#687068]">{s.label}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 h-10 border border-[#D5D9D5] rounded-lg bg-white">
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs or properties..."
              className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-close-line text-[#94A3B8] text-xs"></i>
              </button>
            )}
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setStatusDropdown(!statusDropdown)}
              className="flex items-center gap-2 px-3 h-10 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-filter-3-line text-[#94A3B8] text-sm"></i>
              </div>
              <span>Stage: {statusFilter === "all" ? "All Jobs" : getStatusConfig(statusFilter).label}</span>
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
              </div>
            </button>
            {statusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#D5D9D5] rounded-lg shadow-lg z-20 min-w-[180px] max-h-[320px] overflow-y-auto">
                <button onClick={() => { setStatusFilter("all"); setStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap">All Jobs</button>
                {(["reported", "triage", "awaiting_approval", "finding_contractor", "quote_requested", "quote_received", "appointment_scheduled", "in_progress", "awaiting_confirmation", "completed"] as MaintenanceStage[]).map((s) => {
                  const cfg = getStatusConfig(s);
                  return (
                    <button key={s} onClick={() => { setStatusFilter(s); setStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#3A3F3A] hover:bg-[#F1F5F9] whitespace-nowrap flex items-center gap-2">
                      <i className={`${cfg.icon} ${cfg.color} text-xs`}></i>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D5D9D5] p-12 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-tools-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No maintenance jobs found</p>
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")} className="mt-2 text-sm text-[#C28A78] font-medium hover:underline">Clear filter</button>
              )}
            </div>
          ) : (
            filtered.map((job) => (
              <MaintenanceJobCard
                key={job.id}
                job={job}
                isExpanded={expandedId === job.id}
                onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                onView={() => {}}
              />
            ))
          )}
        </div>
      </div>

      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewJobModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#C28A78] to-[#B87A68] p-5 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 flex items-center justify-center"><i className="ri-tools-line text-white text-lg"></i></div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Log New Repair Job</h3>
                    <p className="text-xs text-white/70">Record an issue and assign priority</p>
                  </div>
                </div>
                <button onClick={() => setShowNewJobModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <i className="ri-close-line text-white text-base"></i>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {newJobSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 flex items-center justify-center"><i className="ri-check-double-line text-[#7A9A7E] text-3xl"></i></div>
                  </div>
                  <p className="text-base font-bold text-[#3A3F3A] mb-1">Job logged successfully</p>
                  <p className="text-sm text-[#687068]">The repair job has been created and is now in the queue</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Job Title</label>
                    <input
                      type="text"
                      value={newJobForm.title}
                      onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                      placeholder="e.g. Boiler not heating water"
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-[#FAFAF8] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Property</label>
                    <div className="relative">
                      <select
                        value={newJobForm.property}
                        onChange={(e) => setNewJobForm({ ...newJobForm, property: e.target.value })}
                        className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] pr-10 appearance-none bg-[#FAFAF8] transition-colors cursor-pointer"
                      >
                        <option>12 Rose Avenue, London E1 6AN</option>
                        <option>45 Baker Street, Manchester M1 2CD</option>
                        <option>8 The Crescent, Leeds LS1 3AB</option>
                        <option>Unit 3, Riverside Court, Bristol BS1 4ST</option>
                        <option>Flat 4B, Oak Street, Birmingham B2 3CD</option>
                        <option>Flat 2A, Park View, Cardiff CF10 3BZ</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none"><i className="ri-arrow-down-s-line text-[#94A3B8] text-sm"></i></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Category</label>
                      <div className="relative">
                        <select
                          value={newJobForm.category}
                          onChange={(e) => setNewJobForm({ ...newJobForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] pr-10 appearance-none bg-[#FAFAF8] transition-colors cursor-pointer"
                        >
                          <option>Plumbing</option>
                          <option>Electrical</option>
                          <option>Heating & Boiler</option>
                          <option>Structural</option>
                          <option>Damp & Mould</option>
                          <option>Pest Control</option>
                          <option>Doors & Windows</option>
                          <option>Garden & Exterior</option>
                          <option>Appliances</option>
                          <option>Other</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none"><i className="ri-arrow-down-s-line text-[#94A3B8] text-sm"></i></div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Reported By</label>
                      <div className="relative">
                        <select
                          value={newJobForm.reportedBy}
                          onChange={(e) => setNewJobForm({ ...newJobForm, reportedBy: e.target.value })}
                          className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] pr-10 appearance-none bg-[#FAFAF8] transition-colors cursor-pointer"
                        >
                          <option>Tenant</option>
                          <option>Landlord</option>
                          <option>Agent</option>
                          <option>Inspection</option>
                          <option>Contractor</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none"><i className="ri-arrow-down-s-line text-[#94A3B8] text-sm"></i></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-2 block uppercase tracking-wide">Priority</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: "Low", color: "bg-[#94A3B8]", ring: "ring-[#94A3B8]" },
                        { label: "Normal", color: "bg-[#7A9A7E]", ring: "ring-[#7A9A7E]" },
                        { label: "High", color: "bg-[#D4A85C]", ring: "ring-[#D4A85C]" },
                        { label: "Critical", color: "bg-[#C46868]", ring: "ring-[#C46868]" },
                        { label: "Emergency", color: "bg-[#991B1B]", ring: "ring-[#991B1B]" },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => setNewJobForm({ ...newJobForm, priority: p.label })}
                          className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all ${
                            newJobForm.priority === p.label
                              ? `${p.color} text-white border-transparent ring-2 ${p.ring} ring-offset-1`
                              : "bg-[#FAFAF8] text-[#687068] border-[#D5D9D5] hover:border-[#C28A78]/50"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Issue Description</label>
                    <textarea
                      value={newJobForm.description}
                      onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                      placeholder="Describe the issue in detail — what's broken, when it started, how serious it is..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-[#FAFAF8] resize-none transition-colors"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1 text-right">{newJobForm.description.length}/500</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Target Date</label>
                      <input
                        type="date"
                        value={newJobForm.targetDate}
                        onChange={(e) => setNewJobForm({ ...newJobForm, targetDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] outline-none focus:border-[#C28A78] bg-[#FAFAF8] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#687068] mb-1.5 block uppercase tracking-wide">Access Notes</label>
                      <input
                        type="text"
                        value={newJobForm.accessNotes}
                        onChange={(e) => setNewJobForm({ ...newJobForm, accessNotes: e.target.value })}
                        placeholder="e.g. Key in office, call ahead"
                        className="w-full px-3.5 py-2.5 border-2 border-[#D5D9D5] rounded-xl text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-[#FAFAF8] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-[#F8F6F2] rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-information-line text-[#8A9FB0] text-base"></i>
                    </div>
                    <p className="text-xs text-[#687068] leading-relaxed">
                      After logging, the job will enter the <span className="font-semibold text-[#3A3F3A]">Reported</span> stage. You can then triage it, request quotes, or assign a contractor from the job detail view.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => setShowNewJobModal(false)}
                      className="flex-1 border-2 border-[#D5D9D5] text-sm font-semibold py-3 rounded-xl hover:bg-[#EBE5DA] hover:border-[#C28A78] transition-colors text-[#3A3F3A]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newJobForm.title) return;
                        setNewJobSuccess(true);
                        setTimeout(() => {
                          setNewJobSuccess(false);
                          setShowNewJobModal(false);
                          setNewJobForm({ title: "", property: "12 Rose Avenue, London E1 6AN", category: "Plumbing", priority: "Normal", description: "", reportedBy: "Tenant", targetDate: "", accessNotes: "" });
                        }, 2000);
                      }}
                      disabled={!newJobForm.title}
                      className={`flex-1 text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                        newJobForm.title
                          ? "bg-[#C28A78] hover:bg-[#143828] text-white"
                          : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-circle-line text-sm"></i></div>
                      Log Job
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}