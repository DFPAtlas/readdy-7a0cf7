"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";

const mockJobs = [
  { id: 1, title: "Boiler not heating", property: "12 Rose Avenue", tenant: "David Thompson", priority: "High", status: "In Progress", trade: "Plumbing", date: "28 May 2026", contractor: "GreenPlumb Plumbing" },
  { id: 2, title: "Window lock broken", property: "Flat 4B Oak Street", tenant: "John Miller", priority: "Medium", status: "Quoted", trade: "Locksmith", date: "27 May 2026", contractor: "SecureFix" },
  { id: 3, title: "Gutter cleaning", property: "8 The Crescent", tenant: "Sarah Jenkins", priority: "Low", status: "Completed", trade: "Landscaping", date: "25 May 2026", contractor: "Oakwood Landscapes" },
  { id: 4, title: "Damp in bathroom", property: "Flat 2A Park View", tenant: "Emily Carter", priority: "High", status: "Reported", trade: "Damp Specialist", date: "28 May 2026", contractor: "Pending" },
  { id: 5, title: "Extractor fan noisy", property: "12 Rose Avenue", tenant: "David Thompson", priority: "Low", status: "In Progress", trade: "Electrical", date: "26 May 2026", contractor: "Breeze Electrical" },
];

const filterTabs = ["All", "Reported", "In Progress", "Quoted", "Completed"];

export default function MobileMaintenancePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showNewJob, setShowNewJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof mockJobs[0] | null>(null);

  const filteredJobs = activeFilter === "All" ? mockJobs : mockJobs.filter((j) => j.status === activeFilter);

  const priorityColor = (p: string) => {
    if (p === "High") return "bg-[#EF4444]";
    if (p === "Medium") return "bg-[#F59E0B]";
    return "bg-[#10B981]";
  };

  const statusBadge = (s: string) => {
    if (s === "Completed") return "bg-[#10B981]/10 text-[#10B981]";
    if (s === "In Progress") return "bg-[#3B82F6]/10 text-[#3B82F6]";
    if (s === "Quoted") return "bg-[#F59E0B]/10 text-[#F59E0B]";
    return "bg-[#EF4444]/10 text-[#EF4444]";
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Maintenance</h1>
          <button
            onClick={() => setShowNewJob(true)}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <i className="ri-add-line text-lg"></i>
          </button>
        </div>
        <p className="text-xs text-white/70">{mockJobs.length} jobs · {mockJobs.filter(j => j.status !== "Completed").length} open</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab
                  ? "bg-[#C28A78] text-white"
                  : "text-[#687068] hover:bg-[#F8FAFC]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <div className="px-4 mt-4 space-y-3 mb-6">
        {filteredJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => setSelectedJob(job)}
            className="w-full bg-white rounded-xl p-4 shadow-sm text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${priorityColor(job.priority)}`}></div>
                <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(job.status)}`}>
                {job.status}
              </span>
            </div>
            <p className="text-xs text-[#687068] mb-2">{job.property} · {job.tenant}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] bg-[#F8FAFC] px-2 py-1 rounded-md">{job.trade}</span>
              <span className="text-[10px] text-[#94A3B8]">{job.date}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Job Detail Sheet */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedJob(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Job Details</h3>
              <button onClick={() => setSelectedJob(null)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${priorityColor(selectedJob.priority)} rounded-xl flex items-center justify-center`}>
                  <i className="ri-tools-line text-white"></i>
                </div>
                <div>
                  <p className="font-semibold text-[#3A3F3A]">{selectedJob.title}</p>
                  <p className="text-xs text-[#687068]">{selectedJob.property}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Status</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedJob.status}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Priority</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedJob.priority}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Trade</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedJob.trade}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Contractor</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedJob.contractor}</p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Tenant</p>
                <p className="text-sm text-[#3A3F3A]">{selectedJob.tenant}</p>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Description</p>
                <p className="text-sm text-[#475569]">Tenant reported issue on {selectedJob.date}. Awaiting contractor assessment and quote submission.</p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                  Update Status
                </button>
                <button className="flex-1 py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl whitespace-nowrap">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJob && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowNewJob(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Report New Issue</h3>
              <button onClick={() => setShowNewJob(false)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Property</label>
                <div className="flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                  <span className="text-sm text-[#3A3F3A]">12 Rose Avenue</span>
                  <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Leaking tap in kitchen"
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Description</label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Priority</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((p) => (
                    <button key={p} className="flex-1 py-2.5 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068] hover:border-[#C28A78] hover:text-[#C28A78] transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Photo</label>
                <button className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#94A3B8]">
                  <i className="ri-camera-line text-lg"></i>
                  Tap to add photo
                </button>
              </div>

              <button className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                Submit Report
              </button>
              
              <a href="/mobile/maintenance/report" className="w-full block py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl text-center whitespace-nowrap">
                <i className="ri-file-list-3-line mr-1"></i> Detailed Report
              </a>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}