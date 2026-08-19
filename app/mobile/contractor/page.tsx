"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/MobileBottomNav";

const jobs = [
  { id: 1, title: "Boiler repair", property: "12 Rose Avenue", status: "In Progress", priority: "High", trade: "Plumbing", quote: 340, deadline: "2 days" },
  { id: 2, title: "Window lock", property: "Flat 4B Oak Street", status: "Quoted", priority: "Medium", trade: "Locksmith", quote: 85, deadline: "5 days" },
  { id: 3, title: "Gutter clean", property: "8 The Crescent", status: "Completed", priority: "Low", trade: "Landscaping", quote: 120, deadline: "Done" },
  { id: 4, title: "Damp treatment", property: "Flat 2A Park View", status: "Quoted", priority: "High", trade: "Damp Specialist", quote: 950, deadline: "3 days" },
  { id: 5, title: "Extractor fan", property: "12 Rose Avenue", status: "In Progress", priority: "Low", trade: "Electrical", quote: 150, deadline: "1 week" },
];

export default function MobileContractorPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);
  const [toastMessage, setToastMessage] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const filteredJobs = activeFilter === "All" ? jobs : jobs.filter((j) => j.status === activeFilter);

  const handleSubmitQuote = () => {
    setShowQuoteModal(false);
    setSelectedJob(null);
    setToastMessage("Quote submitted successfully.");
    setShowSuccessToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handlePhotoUpload = () => {
    setShowPhotoUpload(false);
    setToastMessage("Photos uploaded successfully.");
    setShowSuccessToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const statusColor = (s: string) => {
    if (s === "Completed") return "bg-[#10B981]/10 text-[#10B981]";
    if (s === "In Progress") return "bg-[#3B82F6]/10 text-[#3B82F6]";
    if (s === "Quoted") return "bg-[#F59E0B]/10 text-[#F59E0B]";
    return "bg-[#EF4444]/10 text-[#EF4444]";
  };

  const priorityColor = (p: string) => {
    if (p === "High") return "bg-[#EF4444]";
    if (p === "Medium") return "bg-[#F59E0B]";
    return "bg-[#10B981]";
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#F59E0B] text-white px-4 pt-4 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/70">Contractor</p>
            <h1 className="text-xl font-bold">Mike Johnson</h1>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
            MJ
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">5</p>
            <p className="text-[10px] text-white/70">Active Jobs</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">3</p>
            <p className="text-[10px] text-white/70">Quotes Pending</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold">£1.5k</p>
            <p className="text-[10px] text-white/70">This Month</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-4 gap-3">
            <Link href="/mobile/qr" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#C28A78] rounded-xl flex items-center justify-center">
                <i className="ri-qr-scan-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Scan QR</span>
            </Link>
            <button onClick={() => setShowPhotoUpload(true)} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center">
                <i className="ri-camera-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Photo</span>
            </button>
            <Link href="/mobile/quotes" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#14B8A6] rounded-xl flex items-center justify-center">
                <i className="ri-file-list-3-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Quotes</span>
            </Link>
            <Link href="/mobile/maintenance" className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 bg-[#8B5CF6] rounded-xl flex items-center justify-center">
                <i className="ri-tools-line text-white text-lg"></i>
              </div>
              <span className="text-[10px] font-medium text-[#3A3F3A] whitespace-nowrap">Jobs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
          {["All", "In Progress", "Quoted", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === tab ? "bg-[#F59E0B] text-white" : "text-[#687068] hover:bg-[#F8FAFC]"}`}
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
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(job.status)}`}>{job.status}</span>
            </div>
            <p className="text-xs text-[#687068] mb-2">{job.property} · {job.trade}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#94A3B8] bg-[#F8FAFC] px-2 py-1 rounded-md">Quote: £{job.quote}</span>
              <span className="text-[10px] text-[#94A3B8]">Due: {job.deadline}</span>
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
                <div className={`w-12 h-12 ${priorityColor(selectedJob.priority)} rounded-xl flex items-center justify-center`}>
                  <i className="ri-tools-line text-white text-xl"></i>
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
                  <p className="text-[10px] text-[#94A3B8] uppercase">Deadline</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedJob.deadline}</p>
                </div>
              </div>

              {selectedJob.status === "Quoted" && (
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full py-3 text-sm font-medium text-white bg-[#F59E0B] rounded-xl"
                >
                  <i className="ri-file-list-3-line mr-1"></i> Submit Quote
                </button>
              )}
              {selectedJob.status === "In Progress" && (
                <div className="flex gap-3">
                  <button className="flex-1 py-3 text-sm font-medium text-white bg-[#10B981] rounded-xl">
                    <i className="ri-check-line mr-1"></i> Mark Complete
                  </button>
                  <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="flex-1 py-3 text-sm font-medium text-[#F59E0B] border border-[#F59E0B] rounded-xl"
                  >
                    <i className="ri-camera-line mr-1"></i> Add Photo
                  </button>
                </div>
              )}
              {selectedJob.status === "Completed" && (
                <button className="w-full py-3 text-sm font-medium text-[#10B981] border border-[#10B981] rounded-xl">
                  <i className="ri-download-line mr-1"></i> Download Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowQuoteModal(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-[#3A3F3A] mb-4">Submit Quote</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Labour Cost</label>
                <input type="number" placeholder="£0.00" className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Materials Cost</label>
                <input type="number" placeholder="£0.00" className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">VAT</label>
                <input type="number" placeholder="£0.00" className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Total</label>
                <div className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#3A3F3A] bg-[#F8FAFC]">
                  £0.00
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Completion Estimate</label>
                <div className="flex gap-2">
                  {["Same day", "1-2 days", "3-5 days", "1 week+"].map((d) => (
                    <button key={d} className="flex-1 py-2 text-xs font-medium border border-[#E2E8F0] rounded-xl text-[#687068] hover:border-[#F59E0B] hover:text-[#F59E0B]">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Notes</label>
                <textarea placeholder="Additional notes..." rows={3} className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#F59E0B] resize-none"></textarea>
              </div>
              <button onClick={handleSubmitQuote} className="w-full py-3 text-sm font-medium text-white bg-[#F59E0B] rounded-xl">
                <i className="ri-send-plane-line mr-1"></i> Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowPhotoUpload(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-[#3A3F3A] mb-4">Upload Photos</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-1">
                  <i className="ri-camera-line text-[#94A3B8] text-xl"></i>
                  <span className="text-[10px] text-[#94A3B8]">Before</span>
                </div>
                <div className="aspect-square bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-1">
                  <i className="ri-camera-line text-[#94A3B8] text-xl"></i>
                  <span className="text-[10px] text-[#94A3B8]">During</span>
                </div>
                <div className="aspect-square bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-1">
                  <i className="ri-camera-line text-[#94A3B8] text-xl"></i>
                  <span className="text-[10px] text-[#94A3B8]">After</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#687068] mb-1.5 block">Description</label>
                <textarea placeholder="Describe the work..." rows={3} className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none resize-none"></textarea>
              </div>
              <button onClick={handlePhotoUpload} className="w-full py-3 text-sm font-medium text-white bg-[#3B82F6] rounded-xl">
                <i className="ri-upload-cloud-line mr-1"></i> Upload Photos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setShowQRScanner(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <i className="ri-close-line text-white text-lg"></i>
              </button>
              <p className="text-white font-medium">Scan QR Code</p>
              <div className="w-10"></div>
            </div>
            <div className="aspect-square bg-white/10 rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-3">
              <i className="ri-qr-scan-line text-white/50 text-6xl"></i>
              <p className="text-sm text-white/70 text-center">Align QR code within frame<br/>to scan property or job details</p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                <i className="ri-flashlight-line text-white text-xl"></i>
              </button>
              <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                <i className="ri-image-line text-white text-xl"></i>
              </button>
            </div>
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