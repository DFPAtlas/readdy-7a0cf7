"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { tickets } from "../TenantData";

const statusConfig: Record<string, { color: string; bg: string; icon: string; step: number }> = {
  Reported: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line", step: 1 },
  "Under Review": { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-search-line", step: 2 },
  "Quote Requested": { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-money-pound-circle-line", step: 3 },
  "Awaiting Approval": { color: "text-[#EC4899]", bg: "bg-[#EC4899]/10", icon: "ri-hourglass-line", step: 4 },
  Scheduled: { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-calendar-check-line", step: 5 },
  "In Progress": { color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line", step: 6 },
  Completed: { color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", step: 7 },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  Low: { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  Medium: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  High: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  Emergency: { color: "text-white", bg: "bg-[#EF4444]" },
};

const allStatuses = ["Reported", "Under Review", "Quote Requested", "Awaiting Approval", "Scheduled", "In Progress", "Completed"];

const reportSteps = [
  { id: 1, label: "What's the problem?", icon: "ri-question-line" },
  { id: 2, label: "Where is it?", icon: "ri-map-pin-line" },
  { id: 3, label: "Add details", icon: "ri-file-text-line" },
  { id: 4, label: "Safety & urgency", icon: "ri-shield-check-line" },
  { id: 5, label: "Access availability", icon: "ri-key-line" },
  { id: 6, label: "Review & submit", icon: "ri-check-line" },
];

export default function TenantMaintenancePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [reportStep, setReportStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", category: "Plumbing", priority: "Medium", description: "", room: "Kitchen", accessNotes: "" });
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const filteredTickets = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddComment = (ticketId: string) => {
    const text = newComment[ticketId]?.trim();
    if (!text) return;
    setNewComment((prev) => ({ ...prev, [ticketId]: "" }));
  };

  const handleSubmitReport = () => {
    setSubmitted(true);
    setTimeout(() => {
      setShowNewTicket(false);
      setSubmitted(false);
      setReportStep(1);
      setNewTicket({ title: "", category: "Plumbing", priority: "Medium", description: "", room: "Kitchen", accessNotes: "" });
    }, 2000);
  };

  const categories = ["Plumbing", "Electrical", "Heating", "Appliance", "Structural", "Security", "Damp/Mould", "General"];
  const rooms = ["Kitchen", "Bathroom", "Living Room", "Bedroom", "Hallway", "Garden", "Loft", "External"];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Repairs</h1>
            <p className="text-sm text-[#687068] mt-1">Report and track maintenance issues</p>
          </div>
          <button
            onClick={() => { setShowNewTicket(true); setReportStep(1); setSubmitted(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Report New Issue
          </button>
        </div>

        {showNewTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {submitted ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-[#10B981] text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-[#3A3F3A] mb-1">Issue Reported</h3>
                  <p className="text-sm text-[#687068] mb-2">Your report has been submitted. We will review it shortly.</p>
                  <p className="text-xs text-[#94A3B8]">Reference: MAINT-{Date.now().toString(36).slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-[#C28A78] mt-3 font-medium">For emergencies, call your property manager immediately</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                    <h2 className="font-semibold text-[#3A3F3A]">Report New Issue</h2>
                    <button onClick={() => setShowNewTicket(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                      <i className="ri-close-line text-[#687068]"></i>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 px-5 py-3 border-b border-[#E2E8F0] overflow-x-auto">
                    {reportSteps.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          reportStep >= s.id ? "bg-[#C28A78]/10 text-[#C28A78]" : "bg-[#F1F5F9] text-[#94A3B8]"
                        }`}>
                          <i className={s.icon}></i>
                          {reportStep >= s.id ? s.label : String(s.id)}
                        </div>
                        {i < reportSteps.length - 1 && <div className="w-4 h-0.5 bg-[#E2E8F0]"></div>}
                      </div>
                    ))}
                  </div>

                  <div className="p-5 space-y-4">
                    {reportStep === 1 && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">What is the problem?</label>
                          <input type="text" value={newTicket.title} onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g. Leaking tap in kitchen" className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                              <button key={cat} onClick={() => setNewTicket((prev) => ({ ...prev, category: cat }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newTicket.category === cat ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"}`}>
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {reportStep === 2 && (
                      <div>
                        <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Which room?</label>
                        <div className="flex flex-wrap gap-2">
                          {rooms.map((room) => (
                            <button key={room} onClick={() => setNewTicket((prev) => ({ ...prev, room }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newTicket.room === room ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"}`}>
                              {room}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {reportStep === 3 && (
                      <div>
                        <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Describe the issue</label>
                        <textarea value={newTicket.description} onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))} placeholder="Provide as much detail as possible..." rows={4} maxLength={500} className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" />
                        <p className="text-xs text-[#94A3B8] mt-1 text-right">{newTicket.description.length}/500</p>
                      </div>
                    )}

                    {reportStep === 4 && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">How urgent is this?</label>
                          <div className="space-y-2">
                            {[
                              { value: "Low", desc: "Not urgent — fix when convenient", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
                              { value: "Medium", desc: "Needs attention soon", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                              { value: "High", desc: "Needs prompt attention", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
                            ].map((p) => (
                              <button key={p.value} onClick={() => setNewTicket((prev) => ({ ...prev, priority: p.value }))} className={`w-full text-left p-3 rounded-lg border transition-colors ${newTicket.priority === p.value ? "border-[#C28A78] bg-[#FBF9F4]" : "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"}`}>
                                <p className="text-sm font-medium text-[#3A3F3A]">{p.value}</p>
                                <p className="text-xs text-[#687068]">{p.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
                          <p className="text-xs text-[#DC2626] font-medium flex items-center gap-1">
                            <i className="ri-alarm-warning-line"></i>
                            For emergencies (gas leak, fire, flooding, structural danger):
                          </p>
                          <p className="text-xs text-[#687068] mt-1">Call your property manager immediately. Do not rely on this form for emergencies.</p>
                        </div>
                      </>
                    )}

                    {reportStep === 5 && (
                      <div>
                        <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Access availability</label>
                        <textarea value={newTicket.accessNotes} onChange={(e) => setNewTicket((prev) => ({ ...prev, accessNotes: e.target.value }))} placeholder="When are you available for a contractor visit? Any access instructions?" rows={3} maxLength={300} className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" />
                        <p className="text-xs text-[#687068] mt-1">e.g. &quot;Available weekday evenings after 6pm&quot; or &quot;Key safe at front door&quot;</p>
                      </div>
                    )}

                    {reportStep === 6 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#3A3F3A]">Review your report</h3>
                        <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#94A3B8]">Issue</span>
                            <span className="text-[#3A3F3A] font-medium">{newTicket.title || "—"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#94A3B8]">Category</span>
                            <span className="text-[#3A3F3A]">{newTicket.category}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#94A3B8]">Room</span>
                            <span className="text-[#3A3F3A]">{newTicket.room}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#94A3B8]">Urgency</span>
                            <span className={`font-medium ${priorityConfig[newTicket.priority]?.color || ""}`}>{newTicket.priority}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E2E8F0]">
                    {reportStep > 1 && (
                      <button onClick={() => setReportStep(reportStep - 1)} className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                        Back
                      </button>
                    )}
                    <button onClick={() => setShowNewTicket(false)} className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                      Cancel
                    </button>
                    {reportStep < 6 ? (
                      <button onClick={() => setReportStep(reportStep + 1)} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap">
                        Continue
                      </button>
                    ) : (
                      <button onClick={handleSubmitReport} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors whitespace-nowrap">
                        Submit Report
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[{ id: "all", label: "All Repairs" }, { id: "Reported", label: "Reported" }, { id: "Under Review", label: "Under Review" }, { id: "Quote Requested", label: "Quote Requested" }, { id: "Awaiting Approval", label: "Awaiting Approval" }, { id: "Scheduled", label: "Scheduled" }, { id: "In Progress", label: "In Progress" }, { id: "Completed", label: "Completed" }].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === s.id ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-check-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No repairs found</p>
              <button onClick={() => { setShowNewTicket(true); setReportStep(1); }} className="mt-3 text-sm text-[#C28A78] font-medium hover:underline">Report an issue</button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <button onClick={() => toggleExpand(ticket.id)} className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig[ticket.status].bg}`}>
                    <i className={`${statusConfig[ticket.status].icon} ${statusConfig[ticket.status].color} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#3A3F3A]">{ticket.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityConfig[ticket.priority].bg} ${priorityConfig[ticket.priority].color}`}>{ticket.priority}</span>
                        <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${expandedId === ticket.id ? "rotate-180" : ""}`}></i>
                      </div>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5 line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[ticket.status].bg} ${statusConfig[ticket.status].color}`}>{ticket.status}</span>
                      <span className="text-xs text-[#94A3B8]">{ticket.category}</span>
                      <span className="text-xs text-[#94A3B8]">Reported {ticket.reportedDate}</span>
                    </div>
                  </div>
                </button>

                {expandedId === ticket.id && (
                  <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                    <div className="py-4">
                      <div className="flex items-center justify-between mb-2">
                        {allStatuses.map((s, i) => (
                          <div key={s} className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${statusConfig[ticket.status].step >= i + 1 ? "bg-[#C28A78]" : "bg-[#E2E8F0]"}`}>
                              <i className={`${statusConfig[s].icon} text-white text-[10px]`}></i>
                            </div>
                            <span className={`text-[10px] text-center leading-tight hidden sm:block ${statusConfig[ticket.status].step >= i + 1 ? "text-[#C28A78] font-medium" : "text-[#94A3B8]"}`}>{s}</span>
                          </div>
                        ))}
                      </div>
                      <div className="w-full h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C28A78] rounded-full transition-all" style={{ width: `${((statusConfig[ticket.status].step - 1) / 6) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-building-4-line text-[#94A3B8] text-xs"></i></div>
                          <div><p className="text-xs text-[#94A3B8]">Property</p><p className="text-sm text-[#3A3F3A]">{ticket.property}</p><p className="text-xs text-[#687068]">{ticket.address}</p></div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-calendar-line text-[#94A3B8] text-xs"></i></div>
                          <div><p className="text-xs text-[#94A3B8]">Reported</p><p className="text-sm text-[#3A3F3A]">{ticket.reportedDate}</p></div>
                        </div>
                        {ticket.scheduledDate && (
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-calendar-check-line text-[#94A3B8] text-xs"></i></div>
                            <div><p className="text-xs text-[#94A3B8]">Scheduled</p><p className="text-sm text-[#3A3F3A]">{ticket.scheduledDate}</p></div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {ticket.contractor && (
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-user-3-line text-[#94A3B8] text-xs"></i></div>
                            <div><p className="text-xs text-[#94A3B8]">Contractor</p><p className="text-sm text-[#3A3F3A]">{ticket.contractor}</p><p className="text-xs text-[#687068]">{ticket.contractorTrade}</p></div>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-flag-line text-[#94A3B8] text-xs"></i></div>
                          <div><p className="text-xs text-[#94A3B8]">Priority</p><p className="text-sm text-[#3A3F3A]">{ticket.priority}</p></div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[#94A3B8] mb-1">Description</p>
                      <p className="text-sm text-[#3A3F3A] leading-relaxed">{ticket.description}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[#94A3B8] mb-2">Comments ({ticket.comments.length})</p>
                      <div className="space-y-3">
                        {ticket.comments.map((comment, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${comment.role === "Tenant" ? "bg-[#3B82F6]" : comment.role === "Property Manager" ? "bg-[#C28A78]" : "bg-[#F59E0B]"}`}>
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

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">Y</div>
                      <div className="flex-1">
                        <textarea value={newComment[ticket.id] || ""} onChange={(e) => setNewComment((prev) => ({ ...prev, [ticket.id]: e.target.value }))} placeholder="Add a comment..." rows={2} maxLength={500} className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#94A3B8]">{(newComment[ticket.id] || "").length}/500</span>
                          {ticket.status === "Completed" ? (
                            <button className="px-3 py-1.5 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors whitespace-nowrap">
                              Confirm Complete
                            </button>
                          ) : (
                            <button onClick={() => handleAddComment(ticket.id)} className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors whitespace-nowrap">
                              Post Comment
                            </button>
                          )}
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
    </DashboardShell>
  );
}