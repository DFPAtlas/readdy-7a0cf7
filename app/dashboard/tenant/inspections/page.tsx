"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { inspections, inspectionTypeLabels, statusConfig, ratingConfig } from "../../inspections/InspectionData";

export default function TenantInspectionsPage() {
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showContactModal, setShowContactModal] = useState(false);

  const upcomingInspections = inspections.filter((i) => i.status === "Scheduled" && i.tenant === "John Miller");
  const completedInspections = inspections.filter((i) => i.status === "Completed" && i.tenant === "John Miller");

  const inspection = inspections.find((i) => i.id === selectedInspection);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/tenant" className="hover:text-[#C28A78] transition-colors">Tenant Portal</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">My Inspections</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">My Inspections</h1>
              <p className="text-sm text-[#687068] mt-1">View upcoming and past property inspections</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming", value: upcomingInspections.length, icon: "ri-calendar-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "Completed", value: completedInspections.length, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
            { label: "Open Actions", value: completedInspections.reduce((sum, i) => sum + i.followUpActions.filter((a) => a.status !== "Completed").length, 0), icon: "ri-alert-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <i className={`${stat.icon} ${stat.color} text-sm`}></i>
              </div>
              <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center border-b border-[#E2E8F0] overflow-x-auto">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "upcoming" ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className="ri-calendar-line text-sm"></i>
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "completed" ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className="ri-check-double-line text-sm"></i>
              Past Inspections
            </button>
            <button
              onClick={() => setActiveTab("actions")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "actions" ? "border-[#C28A78] text-[#C28A78]" : "border-transparent text-[#687068] hover:text-[#3A3F3A]"
              }`}
            >
              <i className="ri-file-list-line text-sm"></i>
              My Actions
            </button>
          </div>

          <div className="p-6">
            {activeTab === "upcoming" && (
              <div className="space-y-3">
                {upcomingInspections.map((item) => {
                  const typeStyle = inspectionTypeLabels[item.type];
                  return (
                    <div key={item.id} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${typeStyle.bg} rounded-lg flex items-center justify-center`}>
                            <i className={`${typeStyle.icon} ${typeStyle.color} text-lg`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{item.type}</p>
                            <p className="text-xs text-[#687068]">{item.property}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">Scheduled</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-[#94A3B8]">Date</p>
                          <p className="text-sm font-medium text-[#3A3F3A]">{item.date}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-[#94A3B8]">Time</p>
                          <p className="text-sm font-medium text-[#3A3F3A]">{item.scheduledTime}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center">
                          <p className="text-xs text-[#94A3B8]">Inspector</p>
                          <p className="text-sm font-medium text-[#3A3F3A]">{item.inspector}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#687068] mb-3">
                        Please ensure the property is accessible and you are available during the inspection window.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="flex-1 py-2 text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap"
                        >
                          <i className="ri-phone-line mr-1"></i>
                          Contact Agent
                        </button>
                        <button className="flex-1 py-2 text-xs font-medium text-[#687068] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
                          <i className="ri-calendar-check-line mr-1"></i>
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  );
                })}
                {upcomingInspections.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-calendar-check-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#94A3B8]">No upcoming inspections scheduled</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "completed" && (
              <div className="space-y-3">
                {completedInspections.map((item) => {
                  const typeStyle = inspectionTypeLabels[item.type];
                  const ratingStyle = ratingConfig[item.overallRating];
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                      <button
                        onClick={() => setSelectedInspection(selectedInspection === item.id ? null : item.id)}
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left"
                      >
                        <div className={`w-10 h-10 ${typeStyle.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <i className={`${typeStyle.icon} ${typeStyle.color} text-lg`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-[#3A3F3A]">{item.type}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ratingStyle.bg} ${ratingStyle.color}`}>
                              {item.overallRating}
                            </span>
                          </div>
                          <p className="text-xs text-[#687068] mt-0.5">{item.property} · {item.date} · {item.inspector}</p>
                        </div>
                        <i className={`ri-arrow-down-s-line text-[#94A3B8] text-sm ${selectedInspection === item.id ? "rotate-180" : ""}`}></i>
                      </button>
                      {selectedInspection === item.id && (
                        <div className="px-5 pb-4 border-t border-[#E2E8F0] pt-3">
                          <p className="text-sm text-[#687068] mb-3">{item.notes}</p>
                          <div className="space-y-2 mb-3">
                            {item.rooms.map((room) => (
                              <div key={room.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <i className="ri-door-open-line text-[#94A3B8] text-sm"></i>
                                  <span className="text-sm text-[#3A3F3A]">{room.name}</span>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ratingConfig[room.condition].bg} ${ratingConfig[room.condition].color}`}>
                                  {room.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                          {item.observations.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-[#687068] mb-2">Observations</p>
                              <div className="space-y-2">
                                {item.observations.map((obs) => (
                                  <div key={obs.id} className="bg-[#FEF2F2] rounded-lg p-3 border border-[#FECACA]">
                                    <p className="text-sm text-[#3A3F3A]">{obs.description}</p>
                                    <p className="text-xs text-[#687068] mt-1">Action: {obs.action}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <button className="text-sm font-medium text-[#C28A78] hover:underline flex items-center gap-1">
                              <i className="ri-file-line text-xs"></i>
                              View Full Report
                            </button>
                            <button className="text-sm font-medium text-[#687068] hover:text-[#3A3F3A] hover:underline flex items-center gap-1">
                              <i className="ri-download-line text-xs"></i>
                              Download PDF
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {completedInspections.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-clipboard-line text-[#94A3B8] text-xl"></i>
                    </div>
                    <p className="text-sm text-[#94A3B8]">No completed inspections</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "actions" && (
              <div className="space-y-3">
                {completedInspections
                  .flatMap((i) => i.followUpActions.filter((a) => a.status !== "Completed").map((a) => ({ ...a, inspection: i })))
                  .map((action) => (
                    <div key={action.id} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.status === "Completed" ? "bg-[#10B981]/10" : "bg-[#F59E0B]/10"}`}>
                            <i className={`${action.status === "Completed" ? "ri-check-line text-[#10B981]" : "ri-time-line text-[#F59E0B]"} text-lg`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#3A3F3A]">{action.description}</p>
                            <p className="text-xs text-[#687068]">{action.inspection.property} · Due {action.dueDate}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[action.status].badge}`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mb-2">Assigned by: {action.inspection.inspector}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap">
                          <i className="ri-check-line mr-1"></i>
                          Mark Complete
                        </button>
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="flex-1 py-2 text-xs font-medium text-[#687068] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
                        >
                          <i className="ri-question-line mr-1"></i>
                          Ask Question
                        </button>
                      </div>
                    </div>
                  ))}
                {completedInspections.flatMap((i) => i.followUpActions.filter((a) => a.status !== "Completed")).length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-checkbox-circle-line text-[#10B981] text-xl"></i>
                    </div>
                    <p className="text-sm font-medium text-[#10B981]">All actions completed! No pending items.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[#3A3F3A]">Contact Agent</h3>
              <button onClick={() => setShowContactModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#C28A78] rounded-full flex items-center justify-center text-white font-bold">
                    SC
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">Sarah Collins</p>
                    <p className="text-xs text-[#687068]">Property Inspector</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#687068]">
                    <i className="ri-phone-line text-[#94A3B8]"></i>
                    <span>+44 7700 900111</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#687068]">
                    <i className="ri-mail-line text-[#94A3B8]"></i>
                    <span>sarah.collins@lethub.com</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Your Message</label>
                <textarea
                  placeholder="Type your message to the agent..."
                  rows={3}
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl hover:bg-[#143828] transition-colors whitespace-nowrap"
                >
                  <i className="ri-send-plane-line mr-1"></i>
                  Send Message
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}