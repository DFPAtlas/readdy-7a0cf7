"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { contractorJobs } from "../ContractorData";

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Assigned: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line" },
  Quoted: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-money-pound-circle-line" },
  Approved: { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-check-line" },
  Scheduled: { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-calendar-check-line" },
  "In Progress": { color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line" },
  Completed: { color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line" },
  Cancelled: { color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-close-line" },
};

export default function ContractorJobsPage() {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({ amount: "", vat: "", breakdown: [{ item: "", cost: "" }] });
  const [completionNote, setCompletionNote] = useState("");
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredJobs = filter === "all" ? contractorJobs : contractorJobs.filter((j) => j.status === filter);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const addBreakdownItem = () => {
    setQuoteForm((prev) => ({ ...prev, breakdown: [...prev.breakdown, { item: "", cost: "" }] }));
  };

  const removeBreakdownItem = (idx: number) => {
    setQuoteForm((prev) => ({ ...prev, breakdown: prev.breakdown.filter((_, i) => i !== idx) }));
  };

  const updateBreakdownItem = (idx: number, field: string, value: string) => {
    setQuoteForm((prev) => ({
      ...prev,
      breakdown: prev.breakdown.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const handlePhotoUpload = () => {
    setCompletionPhotos((prev) => [...prev, `photo-${prev.length + 1}`]);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Jobs</h1>
            <p className="text-sm text-[#687068] mt-1">View assigned jobs, submit quotes, and track progress</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Assigned", value: contractorJobs.filter((j) => j.status === "Assigned").length, color: "bg-[#3B82F6]" },
            { label: "Quoted", value: contractorJobs.filter((j) => j.status === "Quoted").length, color: "bg-[#F59E0B]" },
            { label: "In Progress", value: contractorJobs.filter((j) => j.status === "In Progress" || j.status === "Approved" || j.status === "Scheduled").length, color: "bg-[#C28A78]" },
            { label: "Completed", value: contractorJobs.filter((j) => j.status === "Completed").length, color: "bg-[#10B981]" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setFilter(stat.label === "In Progress" ? "In Progress" : stat.label)}
              className={`bg-white rounded-xl border border-[#D5D9D5] p-4 text-left hover:shadow-md transition-shadow ${filter === stat.label || (stat.label === "In Progress" && filter === "In Progress") ? "ring-2 ring-[#C28A78]" : ""}`}
            >
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-2`}></div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068]">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", "Assigned", "Quoted", "Approved", "Scheduled", "In Progress", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === s ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#D5D9D5]"
              }`}
            >
              {s === "all" ? "All Jobs" : s}
            </button>
          ))}
        </div>

        {/* Quote Modal */}
        {showQuoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Submit Quote</h2>
                <button onClick={() => setShowQuoteModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Labour Amount (£)</label>
                    <input
                      type="number"
                      value={quoteForm.amount}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">VAT (£)</label>
                    <input
                      type="number"
                      value={quoteForm.vat}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, vat: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Quote Breakdown</label>
                  <div className="space-y-2">
                    {quoteForm.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateBreakdownItem(idx, "item", e.target.value)}
                          placeholder="Item description"
                          className="flex-1 px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                        />
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => updateBreakdownItem(idx, "cost", e.target.value)}
                          placeholder="£"
                          className="w-24 px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                        />
                        {quoteForm.breakdown.length > 1 && (
                          <button onClick={() => removeBreakdownItem(idx)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                            <i className="ri-close-line text-[#EF4444] text-sm"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addBreakdownItem} className="mt-2 text-sm text-[#C28A78] font-medium hover:underline flex items-center gap-1">
                    <i className="ri-add-line"></i> Add line item
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                  <span className="text-sm text-[#687068]">Total (incl. VAT)</span>
                  <span className="text-lg font-bold text-[#3A3F3A]">
                    £{(Number(quoteForm.amount || 0) + Number(quoteForm.vat || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setShowQuoteModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => setShowQuoteModal(null)}
                  className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors"
                >
                  Submit Quote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Job Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
                <h2 className="font-semibold text-[#3A3F3A]">Mark Job Complete</h2>
                <button onClick={() => setShowCompleteModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Completion Notes</label>
                  <textarea
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="Describe what was done..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1 text-right">{completionNote.length}/500</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Upload Completion Photos</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#F8FAFC]">
                      <i className="ri-camera-line"></i>
                      Add Photos
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    {completionPhotos.length > 0 && (
                      <span className="text-xs text-[#687068]">{completionPhotos.length} photo(s) added</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Upload Invoice</label>
                  <button className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#F8FAFC]">
                    <i className="ri-file-upload-line"></i>
                    Upload Invoice
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
                <button onClick={() => setShowCompleteModal(null)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => setShowCompleteModal(null)}
                  className="flex-1 px-4 py-2.5 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D5D9D5] p-8 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-check-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No jobs found</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
                <button onClick={() => toggleExpand(job.id)} className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig[job.status].bg}`}>
                    <i className={`${statusConfig[job.status].icon} ${statusConfig[job.status].color} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-[#C28A78]">{job.quoteTotal ? `£${job.quoteTotal}` : "—"}</span>
                        <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${expandedId === job.id ? "rotate-180" : ""}`}></i>
                      </div>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5 line-clamp-1">{job.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[job.status].bg} ${statusConfig[job.status].color}`}>{job.status}</span>
                      <span className="text-xs text-[#94A3B8]">{job.property}</span>
                      <span className="text-xs text-[#94A3B8]">Due {job.dueDate}</span>
                    </div>
                  </div>
                </button>

                {expandedId === job.id && (
                  <div className="px-5 pb-5 border-t border-[#D5D9D5]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                      <div className="space-y-3">
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
                            <p className="text-sm text-[#3A3F3A]">{job.tenantName}</p>
                            <p className="text-xs text-[#687068]">{job.tenantPhone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-calendar-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Assigned</p>
                            <p className="text-sm text-[#3A3F3A]">{job.assignedDate}</p>
                          </div>
                        </div>
                        {job.scheduledDate && (
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-calendar-check-line text-[#94A3B8] text-xs"></i>
                            </div>
                            <div>
                              <p className="text-xs text-[#94A3B8]">Scheduled</p>
                              <p className="text-sm text-[#3A3F3A]">{job.scheduledDate}</p>
                            </div>
                          </div>
                        )}
                        {job.completedDate && (
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-check-line text-[#94A3B8] text-xs"></i>
                            </div>
                            <div>
                              <p className="text-xs text-[#94A3B8]">Completed</p>
                              <p className="text-sm text-[#3A3F3A]">{job.completedDate}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-user-settings-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Agent</p>
                            <p className="text-sm text-[#3A3F3A]">{job.agent}</p>
                            <p className="text-xs text-[#687068]">{job.agentPhone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-map-pin-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Access Notes</p>
                            <p className="text-sm text-[#3A3F3A]">{job.accessNotes}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-file-text-line text-[#94A3B8] text-xs"></i>
                          </div>
                          <div>
                            <p className="text-xs text-[#94A3B8]">Category</p>
                            <p className="text-sm text-[#3A3F3A]">{job.category}</p>
                          </div>
                        </div>
                        {job.rating && (
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="ri-star-line text-[#94A3B8] text-xs"></i>
                            </div>
                            <div>
                              <p className="text-xs text-[#94A3B8]">Rating</p>
                              <p className="text-sm text-[#3A3F3A]">
                                <span className="text-amber-500">
                                  <i className="ri-star-fill mr-0.5"></i>
                                  {job.rating}
                                </span>
                                {job.feedback && <span className="text-[#687068] ml-2">· {job.feedback}</span>}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quote Details */}
                    {job.quoteBreakdown && (
                      <div className="mb-4">
                        <p className="text-xs text-[#94A3B8] mb-2">Quote Breakdown</p>
                        <div className="bg-[#F8FAFC] rounded-lg p-3 space-y-2">
                          {job.quoteBreakdown.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-[#3A3F3A]">{item.item}</span>
                              <span className="text-[#687068] font-medium">£{item.cost}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-[#D5D9D5] flex items-center justify-between text-sm font-medium">
                            <span className="text-[#3A3F3A]">Total</span>
                            <span className="text-[#C28A78]">£{job.quoteTotal}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Full Description */}
                    <div className="mb-4">
                      <p className="text-xs text-[#94A3B8] mb-1">Description</p>
                      <p className="text-sm text-[#3A3F3A] leading-relaxed">{job.description}</p>
                    </div>

                    {/* Completion Photos */}
                    {job.completionPhotos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-[#94A3B8] mb-2">Completion Photos</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {job.completionPhotos.map((photo, idx) => (
                            <img key={idx} src={photo} alt={`Completion ${idx + 1}`} className="w-full h-24 rounded-lg object-cover" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#D5D9D5]">
                      {job.status === "Assigned" && (
                        <button
                          onClick={() => setShowQuoteModal(job.id)}
                          className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-medium hover:bg-[#D97706] transition-colors"
                        >
                          Submit Quote
                        </button>
                      )}
                      {job.status === "Approved" && (
                        <button className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg text-sm font-medium hover:bg-[#0D9488] transition-colors">
                          Schedule Job
                        </button>
                      )}
                      {job.status === "Scheduled" && (
                        <button className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors">
                          Start Job
                        </button>
                      )}
                      {job.status === "In Progress" && (
                        <button
                          onClick={() => setShowCompleteModal(job.id)}
                          className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      <a href={`mailto:${job.agentEmail}`} className="px-4 py-2 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                        Contact Agent
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}