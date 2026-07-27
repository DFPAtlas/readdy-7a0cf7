"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { workflowJobs, workflowSteps, notifications, type QuoteWorkflowJob } from "./QuoteWorkflowData";

const priorityConfig: Record<string, { color: string; bg: string }> = {
  Low: { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  Medium: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  High: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  Emergency: { color: "text-white", bg: "bg-[#EF4444]" },
};

const typeColors: Record<string, string> = {
  Report: "bg-[#3B82F6]/10 text-[#3B82F6]",
  Quote: "bg-[#F59E0B]/10 text-[#F59E0B]",
  Invoice: "bg-[#10B981]/10 text-[#10B981]",
  Photo: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  Insurance: "bg-[#14B8A6]/10 text-[#14B8A6]",
  Approval: "bg-[#C28A78]/10 text-[#C28A78]",
};

export default function QuoteWorkflowPage() {
  const [filter, setFilter] = useState("all");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifList, setNotifList] = useState(notifications);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showInviteModal, setShowInviteModal] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [jobList, setJobList] = useState(workflowJobs);

  const unreadCount = notifList.filter((n) => !n.read).length;

  const filteredJobs =
    filter === "all"
      ? jobList
      : filter === "needs-action"
      ? jobList.filter((j) => j.currentStep === 4 || j.currentStep === 5)
      : jobList.filter((j) => j.currentStep === Number(filter));

  const toggleExpand = (id: string) => {
    setExpandedJob(expandedJob === id ? null : id);
  };

  const markNotifRead = (id: string) => {
    setNotifList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddComment = (jobId: string) => {
    const text = newComment[jobId]?.trim();
    if (!text) return;
    setNewComment((prev) => ({ ...prev, [jobId]: "" }));
  };

  const handleApprove = (jobId: string, contractorId: string) => {
    setJobList((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, currentStep: 6, selectedContractor: contractorId }
          : j
      )
    );
    setShowApproveModal(null);
    showToast("Quote approved. Contractor instructed.");
  };

  const handleInvite = (jobId: string) => {
    setShowInviteModal(null);
    showToast("Contractor invited successfully.");
  };

  const stepProgress = (currentStep: number) => {
    return ((currentStep - 1) / 7) * 100;
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Quote Workflow</h1>
            <p className="text-sm text-[#687068] mt-1">Manage maintenance quotes from report to invoice</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/quote-workflow/compare"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-bar-chart-grouped-line text-sm"></i>
              </div>
              Compare Quotes
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#D5D9D5] bg-white hover:bg-[#F8FAFC] transition-colors relative"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-notification-3-line text-[#687068] text-sm"></i>
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-[#D5D9D5] shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5D9D5]">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">Notifications</h3>
                    <button onClick={markAllRead} className="text-xs text-[#C28A78] font-medium hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifList.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotifRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-[#F8FAFC] transition-colors border-b border-[#D5D9D5] last:border-b-0 ${
                          !n.read ? "bg-[#F8FAFC]" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? "bg-[#3B82F6]" : "bg-[#D5D9D5]"}`}></div>
                          <div>
                            <p className={`text-sm ${!n.read ? "text-[#3A3F3A] font-medium" : "text-[#687068]"}`}>{n.message}</p>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Jobs", count: jobList.length },
            { id: "needs-action", label: "Needs Action", count: jobList.filter((j) => j.currentStep === 4 || j.currentStep === 5).length },
            { id: "1", label: "Reported", count: jobList.filter((j) => j.currentStep === 1).length },
            { id: "3", label: "Invited", count: jobList.filter((j) => j.currentStep === 3).length },
            { id: "4", label: "Quoted", count: jobList.filter((j) => j.currentStep === 4).length },
            { id: "5", label: "Awaiting Approval", count: jobList.filter((j) => j.currentStep === 5).length },
            { id: "7", label: "Completed", count: jobList.filter((j) => j.currentStep === 7).length },
            { id: "8", label: "Invoiced", count: jobList.filter((j) => j.currentStep === 8).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === tab.id ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab.id ? "bg-white/20 text-white" : "bg-[#D5D9D5] text-[#687068]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D5D9D5] p-8 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-check-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No jobs in this stage</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                {/* Job Header */}
                <button
                  onClick={() => toggleExpand(job.id)}
                  className="w-full flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#3A3F3A]">{job.title}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityConfig[job.priority].bg} ${priorityConfig[job.priority].color}`}>
                          {job.priority}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#687068]">{job.category}</span>
                      </div>
                      <span className="text-sm font-bold text-[#C28A78] flex-shrink-0">
                        {job.contractors.some((c) => c.quoteTotal) ? `£${Math.min(...job.contractors.filter((c) => c.quoteTotal).map((c) => c.quoteTotal!))}` : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-[#687068] mt-1">{job.property} · {job.tenant} · Reported {job.reportedDate}</p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#94A3B8]">
                          Step {job.currentStep} of 8 — {workflowSteps[job.currentStep - 1]?.label}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">{Math.round(stepProgress(job.currentStep))}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#D5D9D5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C28A78] rounded-full transition-all"
                          style={{ width: `${stepProgress(job.currentStep)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${expandedJob === job.id ? "rotate-180" : ""}`}></i>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedJob === job.id && (
                  <div className="px-5 pb-5 border-t border-[#D5D9D5]">
                    {/* Step Timeline */}
                    <div className="py-4">
                      <div className="flex items-start gap-0 overflow-x-auto pb-2">
                        {workflowSteps.map((s, i) => {
                          const isComplete = job.currentStep > s.step;
                          const isCurrent = job.currentStep === s.step;
                          const historyEntry = job.stepHistory.find((h) => h.step === s.step);
                          return (
                            <div key={s.step} className="flex flex-col items-center min-w-[100px] flex-1 relative">
                              <div className="flex flex-col items-center gap-1 z-10">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isComplete
                                      ? "bg-[#C28A78]"
                                      : isCurrent
                                      ? "bg-[#C28A78] ring-2 ring-[#C28A78]/20"
                                      : "bg-[#D5D9D5]"
                                  }`}
                                >
                                  <i className={`${s.icon} text-white text-xs`}></i>
                                </div>
                                <span className={`text-[10px] text-center leading-tight max-w-[80px] ${isComplete || isCurrent ? "text-[#C28A78] font-medium" : "text-[#94A3B8]"}`}>
                                  {s.label}
                                </span>
                              </div>
                              {historyEntry && (
                                <div className="mt-1 text-center px-1">
                                  <p className="text-[9px] text-[#94A3B8]">{historyEntry.date}</p>
                                  <p className="text-[9px] text-[#687068] truncate max-w-[90px]">{historyEntry.actor}</p>
                                </div>
                              )}
                              {i < workflowSteps.length - 1 && (
                                <div className={`absolute top-4 left-[calc(50%+16px)] w-[calc(100%-32px)] h-0.5 ${isComplete ? "bg-[#C28A78]" : "bg-[#D5D9D5]"}`}></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-building-4-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Property</p>
                            <p className="text-sm text-[#3A3F3A]">{job.property}</p>
                            <p className="text-xs text-[#687068]">{job.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-user-3-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Tenant</p>
                            <p className="text-sm text-[#3A3F3A]">{job.tenant}</p>
                            <p className="text-xs text-[#687068]">{job.tenantPhone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-calendar-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Reported</p>
                            <p className="text-sm text-[#3A3F3A]">{job.reportedDate}</p>
                            <p className="text-xs text-[#687068]">by {job.reportedBy}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-tools-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Category</p>
                            <p className="text-sm text-[#3A3F3A]">{job.category}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-time-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Est. Completion</p>
                            <p className="text-sm text-[#3A3F3A]">{job.estimatedCompletion}</p>
                          </div>
                        </div>
                        {job.invoiceAmount && (
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-bill-line text-[#94A3B8] text-xs"></i>
                            </div>
                            <div>
                              <p className="text-xs text-[#94A3B8]">Invoice</p>
                              <p className="text-sm text-[#3A3F3A]">£{job.invoiceAmount} · {job.invoiceStatus}</p>
                              <p className="text-xs text-[#687068]">{job.invoiceDate}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-xs text-[#94A3B8] mb-1">Description</p>
                      <p className="text-sm text-[#3A3F3A] leading-relaxed">{job.description}</p>
                    </div>

                    {/* Contractors & Quotes */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#94A3B8]">Contractors ({job.contractors.length})</p>
                        {job.currentStep === 3 && (
                          <button
                            onClick={() => setShowInviteModal(job.id)}
                            className="text-xs text-[#C28A78] font-medium hover:underline flex items-center gap-1"
                          >
                            <i className="ri-user-add-line"></i> Invite another
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {job.contractors.map((contractor) => (
                          <div key={contractor.id} className="bg-[#F8FAFC] rounded-lg p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-medium text-[#3A3F3A]">{contractor.name}</p>
                                  <span className="text-[10px] text-[#687068] bg-[#D5D9D5] px-1.5 py-0.5 rounded">{contractor.trade}</span>
                                  {contractor.insuranceValid ? (
                                    <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <i className="ri-shield-check-line"></i> Insured
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded">No insurance</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-[#687068]">
                                  <span className="flex items-center gap-0.5 text-amber-500">
                                    <i className="ri-star-fill"></i> {contractor.rating}
                                  </span>
                                  <span>{contractor.totalJobs} jobs</span>
                                  {contractor.estimatedDays && <span>Est. {contractor.estimatedDays}</span>}
                                </div>
                                {contractor.notes && <p className="text-xs text-[#687068] mt-1">{contractor.notes}</p>}
                                {contractor.documents.length > 0 && (
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {contractor.documents.map((doc, idx) => (
                                      <span key={idx} className="text-[10px] text-[#C28A78] bg-[#C28A78]/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <i className="ri-file-line"></i> {doc}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                {contractor.quoteTotal ? (
                                  <div>
                                    <p className="text-lg font-bold text-[#C28A78]">£{contractor.quoteTotal}</p>
                                    <p className="text-[10px] text-[#94A3B8]">inc. VAT</p>
                                    {contractor.quoteSubmitted && (
                                      <p className="text-[10px] text-[#94A3B8]">Submitted {contractor.quoteSubmitted}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#94A3B8]">Awaiting quote</span>
                                )}
                              </div>
                            </div>
                            {/* Contractor Actions */}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#D5D9D5]">
                              {contractor.status === "Quoted" && job.currentStep === 4 && (
                                <>
                                  <button
                                    onClick={() => setShowApproveModal(job.id)}
                                    className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors"
                                  >
                                    Approve & Instruct
                                  </button>
                                  <button className="px-3 py-1.5 border border-[#EF4444] text-[#EF4444] rounded-lg text-xs font-medium hover:bg-[#EF4444]/10 transition-colors">
                                    Reject
                                  </button>
                                  <button className="px-3 py-1.5 border border-[#3B82F6] text-[#3B82F6] rounded-lg text-xs font-medium hover:bg-[#3B82F6]/10 transition-colors">
                                    Request Alternative
                                  </button>
                                </>
                              )}
                              {contractor.status === "Instructed" && (
                                <span className="text-xs text-[#10B981] font-medium flex items-center gap-1">
                                  <i className="ri-check-double-line"></i> Instructed
                                </span>
                              )}
                              {contractor.status === "Invited" && (
                                <span className="text-xs text-[#3B82F6] font-medium flex items-center gap-1">
                                  <i className="ri-time-line"></i> Awaiting quote
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    {job.documents.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-[#94A3B8] mb-2">Documents ({job.documents.length})</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {job.documents.map((doc) => (
                            <div key={doc.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${typeColors[doc.type]}`}>
                              <i className="ri-file-line"></i>
                              <span className="font-medium">{doc.name}</span>
                              <span className="text-[10px] opacity-70">{doc.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    <div className="mb-4">
                      <p className="text-xs text-[#94A3B8] mb-2">Comments ({job.comments.length})</p>
                      <div className="space-y-3">
                        {job.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                comment.role === "Tenant"
                                  ? "bg-[#3B82F6]"
                                  : comment.role === "Property Manager"
                                  ? "bg-[#C28A78]"
                                  : "bg-[#F59E0B]"
                              }`}
                            >
                              {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#3A3F3A]">{comment.author}</span>
                                <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded">{comment.role}</span>
                              </div>
                              <p className="text-sm text-[#3A3F3A] mt-0.5">{comment.text}</p>
                              <p className="text-xs text-[#94A3B8] mt-1">{comment.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Comment */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C28A78] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        S
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment[job.id] || ""}
                          onChange={(e) => setNewComment((prev) => ({ ...prev, [job.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          rows={2}
                          maxLength={500}
                          className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#94A3B8]">{(newComment[job.id] || "").length}/500</span>
                          <button
                            onClick={() => handleAddComment(job.id)}
                            className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Invite Contractor</h2>
              <button onClick={() => setShowInviteModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Select Contractor</label>
                <div className="space-y-2">
                  {["GreenPlumb Ltd", "FastFix Heating", "BrightSpark Electrical", "BuildRight Construction", "DampGuard Specialists"].map((name) => (
                    <button key={name} className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] hover:bg-[#F8FAFC] transition-colors">
                      <span>{name}</span>
                      <i className="ri-arrow-right-s-line text-[#94A3B8]"></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Message (optional)</label>
                <textarea
                  placeholder="Add a note for the contractor..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
              <button onClick={() => setShowInviteModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleInvite(showInviteModal)}
                className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Approve Quote</h2>
              <button onClick={() => setShowApproveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-sm font-medium text-[#3A3F3A] mb-1">Approve selected contractor</p>
                <p className="text-xs text-[#687068]">This will notify the contractor and landlord. Work can then be scheduled.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Select contractor to approve</label>
                <div className="space-y-2">
                  {jobList
                    .find((j) => j.id === showApproveModal)
                    ?.contractors.filter((c) => c.quoteTotal)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleApprove(showApproveModal, c.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D5D9D5] rounded-lg bg-white text-sm text-[#3A3F3A] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-[#687068]">{c.trade}</span>
                        </div>
                        <span className="font-bold text-[#C28A78]">£{c.quoteTotal}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
              <button onClick={() => setShowApproveModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <i className="ri-check-line text-[#10B981]"></i>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </DashboardShell>
  );
}