"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";
import {
  inspections,
  propertiesForInspection,
  inspectors,
  inspectionTypeLabels,
  statusConfig,
  ratingConfig,
  severityConfig,
} from "../../dashboard/inspections/InspectionData";

const filterTabs = ["All", "Scheduled", "In Progress", "Completed"];
const inspectionTypes = ["Move In", "Routine Inspection", "Mid-Term Inspection", "Move Out"];

export default function MobileInspectionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filtered = inspections.filter((i) => {
    const matchesFilter = activeFilter === "All" || i.status === activeFilter;
    return matchesFilter;
  });

  const inspection = inspections.find((i) => i.id === selectedInspection);

  const handleStartInspection = () => {
    setShowCompleteForm(true);
    setToastMessage("Inspection started. Complete the form below.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSchedule = () => {
    setShowScheduleModal(false);
    setToastMessage("Inspection scheduled successfully.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSaveInspection = () => {
    setShowCompleteForm(false);
    setSelectedInspection(null);
    setToastMessage("Inspection saved. Report generated.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const openActions = inspections.reduce((sum, i) => sum + i.followUpActions.filter((a) => a.status !== "Completed").length, 0);

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Inspections</h1>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <i className="ri-add-line text-lg"></i>
          </button>
        </div>
        <p className="text-xs text-white/70">
          {inspections.filter((i) => i.status === "Scheduled").length} scheduled · {inspections.filter((i) => i.status === "Completed").length} completed
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F8FAFC]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] rounded-lg">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "upcoming" ? "bg-[#C28A78] text-white" : "text-[#687068]"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "completed" ? "bg-[#C28A78] text-white" : "text-[#687068]"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab("followups")}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "followups" ? "bg-[#C28A78] text-white" : "text-[#687068]"
            }`}
          >
            Actions
          </button>
        </div>
      </div>

      {/* Inspection Cards */}
      <div className="px-4 mt-4 space-y-3 mb-6">
        {activeTab !== "followups" &&
          filtered.map((item) => {
            const typeStyle = inspectionTypeLabels[item.type];
            const statusStyle = statusConfig[item.status];
            return (
              <button
                key={item.id}
                onClick={() => setSelectedInspection(item.id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeStyle.bg}`}>
                      <i className={`${typeStyle.icon} ${typeStyle.color} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{item.property}</p>
                      <p className="text-xs text-[#94A3B8]">{item.type}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#687068]">{item.date} · {item.scheduledTime}</span>
                  <span className="text-xs text-[#94A3B8]">{item.inspector}</span>
                </div>
                {item.status === "Completed" && item.overallRating !== "—" && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ratingConfig[item.overallRating].bg} ${ratingConfig[item.overallRating].color}`}>
                      {item.overallRating}
                    </span>
                    {item.observations.length > 0 && (
                      <span className="text-[10px] text-[#94A3B8]">
                        {item.observations.filter((o) => o.status === "Open").length} open observations
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

        {activeTab === "followups" && (
          <div className="space-y-3">
            {inspections
              .flatMap((i) => i.followUpActions.filter((a) => a.status !== "Completed").map((a) => ({ ...a, inspection: i })))
              .map((action) => (
                <div key={action.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${severityConfig[action.priority].bg}`}>
                        <i className="ri-file-list-line text-sm"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{action.description}</p>
                        <p className="text-xs text-[#687068]">{action.inspection.property}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityConfig[action.priority].bg} ${severityConfig[action.priority].color}`}>
                      {action.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">{action.assignee} · Due {action.dueDate}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[action.status].badge}`}>
                      {action.status}
                    </span>
                  </div>
                </div>
              ))}
            {openActions === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-checkbox-circle-line text-[#10B981] text-xl"></i>
                </div>
                <p className="text-sm font-medium text-[#10B981]">All actions completed!</p>
              </div>
            )}
          </div>
        )}

        {activeTab !== "followups" && filtered.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-clipboard-line text-[#94A3B8] text-xl"></i>
            </div>
            <p className="text-sm text-[#94A3B8]">No inspections found</p>
          </div>
        )}
      </div>

      {/* Inspection Detail Sheet */}
      {inspection && !showCompleteForm && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedInspection(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inspectionTypeLabels[inspection.type].bg}`}>
                  <i className={`${inspectionTypeLabels[inspection.type].icon} ${inspectionTypeLabels[inspection.type].color} text-sm`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-[#3A3F3A]">{inspection.property}</h3>
                  <p className="text-xs text-[#687068]">{inspection.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Date</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{inspection.date}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Time</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{inspection.scheduledTime}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Status</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{inspection.status}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Rating</p>
                  <p className={`text-sm font-medium ${ratingConfig[inspection.overallRating].color}`}>{inspection.overallRating}</p>
                </div>
              </div>

              {/* Tenant Info */}
              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Tenant</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{inspection.tenant}</p>
                <p className="text-xs text-[#687068]">{inspection.tenantPhone}</p>
              </div>

              {/* Inspector */}
              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Inspector</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{inspection.inspector}</p>
              </div>

              {/* Notes */}
              {inspection.notes && (
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Notes</p>
                  <p className="text-sm text-[#475569]">{inspection.notes}</p>
                </div>
              )}

              {/* Rooms */}
              {inspection.rooms.length > 0 && inspection.status !== "Scheduled" && (
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-2">Room Checklist</p>
                  <div className="space-y-2">
                    {inspection.rooms.map((room) => (
                      <div key={room.id} className="bg-[#F8FAFC] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#3A3F3A]">{room.name}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ratingConfig[room.condition].bg} ${ratingConfig[room.condition].color}`}>
                            {room.condition}
                          </span>
                        </div>
                        {room.notes && room.notes !== "To be inspected" && (
                          <p className="text-xs text-[#687068] mb-2">{room.notes}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {room.checklist.map((check, idx) => (
                            <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-full ${check.status === "Pass" ? "bg-[#10B981]/10 text-[#10B981]" : check.status === "Fail" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#94A3B8]/10 text-[#94A3B8]"}`}>
                              {check.status === "Pass" ? "✓" : check.status === "Fail" ? "✗" : "—"} {check.item}
                            </span>
                          ))}
                        </div>
                        {room.photos.length > 0 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto">
                            {room.photos.map((photo, idx) => (
                              <img key={idx} src={photo} alt={`${room.name} photo`} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" onClick={() => setShowPhotoModal(true)} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observations */}
              {inspection.observations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-2">Observations</p>
                  <div className="space-y-2">
                    {inspection.observations.map((obs) => (
                      <div key={obs.id} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${severityConfig[obs.severity].bg} ${severityConfig[obs.severity].color}`}>
                            {obs.severity}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">{obs.room}</span>
                        </div>
                        <p className="text-sm text-[#3A3F3A] mb-1">{obs.description}</p>
                        <p className="text-xs text-[#687068]">Action: {obs.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {inspection.followUpActions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-2">Follow-ups</p>
                  <div className="space-y-2">
                    {inspection.followUpActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl p-3">
                        <div>
                          <p className="text-sm text-[#3A3F3A]">{action.description}</p>
                          <p className="text-xs text-[#687068]">{action.assignee} · {action.dueDate}</p>
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[action.status].badge}`}>
                          {action.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {inspection.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-[#3A3F3A] mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {inspection.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-full h-20 rounded-lg object-cover" onClick={() => setShowPhotoModal(true)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex gap-3 pt-2">
                {inspection.status === "Scheduled" && (
                  <button
                    onClick={handleStartInspection}
                    className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap"
                  >
                    <i className="ri-play-line mr-1"></i>
                    Start Inspection
                  </button>
                )}
                {inspection.status === "Completed" && (
                  <button className="flex-1 py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl whitespace-nowrap">
                    <i className="ri-download-line mr-1"></i>
                    Download Report
                  </button>
                )}
                {inspection.status === "In Progress" && (
                  <button
                    onClick={() => setShowCompleteForm(true)}
                    className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap"
                  >
                    <i className="ri-edit-line mr-1"></i>
                    Continue Form
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Inspection Form (On-site) */}
      {showCompleteForm && inspection && (
        <div className="fixed inset-0 bg-[#F8FAFC] z-50 overflow-y-auto">
          <div className="px-4 pt-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowCompleteForm(false)} className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-arrow-left-line text-[#3A3F3A]"></i>
                </button>
                <h2 className="font-bold text-[#3A3F3A]">Inspection Form</h2>
              </div>
              <button onClick={handleSaveInspection} className="text-sm font-medium text-[#C28A78]">
                Save
              </button>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <p className="text-sm font-medium text-[#3A3F3A]">{inspection.property}</p>
              <p className="text-xs text-[#687068]">{inspection.type} · {inspection.date}</p>
              <p className="text-xs text-[#94A3B8] mt-1">Tenant: {inspection.tenant}</p>
            </div>

            {/* Overall Rating */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <p className="text-sm font-medium text-[#3A3F3A] mb-2">Overall Rating</p>
              <div className="flex gap-2">
                {["Excellent", "Good", "Fair", "Poor"].map((r) => (
                  <button key={r} className="flex-1 py-2 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78] transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Checklist */}
            <div className="space-y-4 mb-4">
              {inspection.rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-[#3A3F3A]">{room.name}</p>
                    <div className="flex gap-1">
                      {["Excellent", "Good", "Fair", "Poor"].map((r) => (
                        <button key={r} className="text-[10px] px-2 py-1 border border-[#E2E8F0] rounded-md text-[#687068]">
                          {r.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {room.checklist.map((check, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-[#475569]">{check.item}</span>
                        <div className="flex gap-1">
                          <button className="w-6 h-6 rounded bg-[#10B981]/10 flex items-center justify-center">
                            <i className="ri-check-line text-[#10B981] text-xs"></i>
                          </button>
                          <button className="w-6 h-6 rounded bg-[#EF4444]/10 flex items-center justify-center">
                            <i className="ri-close-line text-[#EF4444] text-xs"></i>
                          </button>
                          <button className="w-6 h-6 rounded bg-[#94A3B8]/10 flex items-center justify-center">
                            <i className="ri-subtract-line text-[#94A3B8] text-xs"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Room notes..."
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
                    />
                  </div>
                  <button className="mt-2 w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#94A3B8]">
                    <i className="ri-camera-line text-sm"></i>
                    Add Photo
                  </button>
                </div>
              ))}
            </div>

            {/* Add Observation */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <p className="text-sm font-medium text-[#3A3F3A] mb-3">Add Observation</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#687068] mb-1 block">Room</label>
                  <div className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                    <span className="text-xs text-[#3A3F3A]">Select room</span>
                    <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#687068] mb-1 block">Category</label>
                  <div className="flex gap-2 flex-wrap">
                    {["Decorative", "Damp & Mould", "Appliances", "Structural", "Safety", "Exterior"].map((cat) => (
                      <button key={cat} className="text-[10px] px-3 py-1.5 border border-[#E2E8F0] rounded-full text-[#687068]">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#687068] mb-1 block">Severity</label>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((s) => (
                      <button key={s} className="flex-1 py-2 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068]">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#687068] mb-1 block">Description</label>
                  <textarea
                    placeholder="Describe the observation..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="text-xs text-[#687068] mb-1 block">Action Required</label>
                  <input
                    type="text"
                    placeholder="e.g. Reseal bath, replace light switch"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
                  />
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#E2E8F0] rounded-xl text-xs text-[#94A3B8]">
                  <i className="ri-camera-line text-sm"></i>
                  Attach Photo
                </button>
                <button className="w-full py-3 text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-xl">
                  <i className="ri-add-line mr-1"></i>
                  Add Observation
                </button>
              </div>
            </div>

            {/* Follow-up Actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <p className="text-sm font-medium text-[#3A3F3A] mb-3">Follow-up Actions</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#687068] mb-1 block">Action Description</label>
                  <input
                    type="text"
                    placeholder="Describe the follow-up action..."
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#687068] mb-1 block">Assignee</label>
                    <div className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                      <span className="text-xs text-[#3A3F3A]">Select</span>
                      <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#687068] mb-1 block">Due Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
                    />
                  </div>
                </div>
                <button className="w-full py-3 text-xs font-medium text-[#C28A78] border border-[#C28A78] rounded-xl">
                  <i className="ri-add-line mr-1"></i>
                  Add Follow-up Action
                </button>
              </div>
            </div>

            {/* General Notes */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <p className="text-sm font-medium text-[#3A3F3A] mb-2">General Notes</p>
              <textarea
                placeholder="Any overall comments about the inspection..."
                rows={3}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
              ></textarea>
            </div>

            {/* Submit */}
            <button
              onClick={handleSaveInspection}
              className="w-full py-4 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap"
            >
              <i className="ri-check-double-line mr-1"></i>
              Complete & Generate Report
            </button>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowScheduleModal(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Schedule Inspection</h3>
              <button onClick={() => setShowScheduleModal(false)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Property</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {propertiesForInspection.map((p) => (
                    <label key={p.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl cursor-pointer">
                      <div className="w-5 h-5 rounded border border-[#E2E8F0] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-sm bg-[#C28A78]"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{p.name}</p>
                        <p className="text-xs text-[#687068]">{p.tenant}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {inspectionTypes.map((type) => (
                    <button key={type} className="py-2.5 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78] transition-colors">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Date</label>
                  <input type="date" defaultValue="2026-06-15" className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#687068] mb-1.5 block">Time</label>
                  <input type="time" defaultValue="14:00" className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Inspector</label>
                <div className="space-y-2">
                  {inspectors.map((i) => (
                    <label key={i.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl cursor-pointer">
                      <div className="w-5 h-5 rounded border border-[#E2E8F0] flex items-center justify-center">
                        <div className="w-3 h-3 rounded-sm bg-[#C28A78]"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#3A3F3A]">{i.name}</p>
                        <p className="text-xs text-[#687068]">{i.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSchedule}
                className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap"
              >
                <i className="ri-calendar-check-line mr-1"></i>
                Schedule Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPhotoModal(false)}>
          <div className="relative">
            <img src={inspection?.photos[0] || ""} alt="Full view" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-close-line text-white"></i>
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#C28A78] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <i className="ri-checkbox-circle-line text-lg"></i>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </MobileLayout>
  );
}