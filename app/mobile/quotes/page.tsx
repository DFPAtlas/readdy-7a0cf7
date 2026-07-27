"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";

const quotes = [
  { id: 1, job: "Roof repair - leaking tile", property: "45 Baker Street", contractor: "SkyFix Roofing", amount: 340, status: "Pending Approval", submitted: "25 May 2026", urgency: "High" },
  { id: 2, job: "Boiler replacement", property: "12 Rose Avenue", contractor: "HeatPro Ltd", amount: 1850, status: "Approved", submitted: "20 May 2026", urgency: "High" },
  { id: 3, job: "Window lock replacement", property: "Flat 4B Oak Street", contractor: "SecureFix", amount: 85, status: "Approved", submitted: "22 May 2026", urgency: "Medium" },
  { id: 4, job: "Gutter cleaning", property: "8 The Crescent", contractor: "Oakwood Landscapes", amount: 120, status: "Rejected", submitted: "18 May 2026", urgency: "Low" },
  { id: 5, job: "Damp treatment", property: "Flat 2A Park View", contractor: "DryHome Specialists", amount: 950, status: "Pending Approval", submitted: "27 May 2026", urgency: "High" },
];

export default function MobileQuotesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedQuote, setSelectedQuote] = useState<typeof quotes[0] | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredQuotes = activeFilter === "All" ? quotes : quotes.filter((q) => q.status === activeFilter);

  const handleApprove = () => {
    setShowApproveModal(false);
    setSelectedQuote(null);
    setToastMessage("Quote approved. Contractor notified.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleReject = () => {
    setShowRejectModal(false);
    setSelectedQuote(null);
    setToastMessage("Quote rejected. Contractor notified.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const statusColor = (s: string) => {
    if (s === "Approved") return "bg-[#10B981]/10 text-[#10B981]";
    if (s === "Rejected") return "bg-[#EF4444]/10 text-[#EF4444]";
    return "bg-[#F59E0B]/10 text-[#F59E0B]";
  };

  const urgencyColor = (u: string) => {
    if (u === "High") return "bg-[#EF4444]";
    if (u === "Medium") return "bg-[#F59E0B]";
    return "bg-[#10B981]";
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Quote Approvals</h1>
        </div>
        <p className="text-xs text-white/70">{quotes.filter((q) => q.status === "Pending Approval").length} pending · {quotes.filter((q) => q.status === "Approved").length} approved</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1 overflow-x-auto">
          {["All", "Pending Approval", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === tab ? "bg-[#C28A78] text-white" : "text-[#687068] hover:bg-[#F8FAFC]"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quote List */}
      <div className="px-4 mt-4 space-y-3 mb-6">
        {filteredQuotes.map((quote) => (
          <button
            key={quote.id}
            onClick={() => setSelectedQuote(quote)}
            className="w-full bg-white rounded-xl p-4 shadow-sm text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${urgencyColor(quote.urgency)}`}></div>
                <p className="text-sm font-medium text-[#3A3F3A]">{quote.job}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor(quote.status)}`}>{quote.status}</span>
            </div>
            <p className="text-xs text-[#687068] mb-2">{quote.property} · {quote.contractor}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#3A3F3A]">£{quote.amount}</p>
              <p className="text-[10px] text-[#94A3B8]">{quote.submitted}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quote Detail Sheet */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedQuote(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Quote Details</h3>
              <button onClick={() => setSelectedQuote(null)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C28A78] rounded-xl flex items-center justify-center">
                  <i className="ri-file-list-3-line text-white text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-[#3A3F3A]">{selectedQuote.job}</p>
                  <p className="text-xs text-[#687068]">{selectedQuote.property}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Amount</p>
                  <p className="text-lg font-bold text-[#3A3F3A]">£{selectedQuote.amount}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Status</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedQuote.status}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Urgency</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedQuote.urgency}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-3">
                  <p className="text-[10px] text-[#94A3B8] uppercase">Submitted</p>
                  <p className="text-sm font-medium text-[#3A3F3A]">{selectedQuote.submitted}</p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Contractor</p>
                <p className="text-sm font-medium text-[#3A3F3A]">{selectedQuote.contractor}</p>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase mb-1">Quote Breakdown</p>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#687068]">Labour</span>
                    <span className="text-[#3A3F3A]">£{Math.round(selectedQuote.amount * 0.6)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#687068]">Materials</span>
                    <span className="text-[#3A3F3A]">£{Math.round(selectedQuote.amount * 0.3)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#687068]">VAT</span>
                    <span className="text-[#3A3F3A]">£{Math.round(selectedQuote.amount * 0.1)}</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-1 mt-1 flex items-center justify-between text-sm font-medium">
                    <span className="text-[#3A3F3A]">Total</span>
                    <span className="text-[#3A3F3A]">£{selectedQuote.amount}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedQuote.status === "Pending Approval" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 py-3 text-sm font-medium text-white bg-[#10B981] rounded-xl"
                  >
                    <i className="ri-check-line mr-1"></i> Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 py-3 text-sm font-medium text-[#EF4444] border border-[#EF4444] rounded-xl"
                  >
                    <i className="ri-close-line mr-1"></i> Reject
                  </button>
                </div>
              )}
              {selectedQuote.status === "Approved" && (
                <button className="w-full py-3 text-sm font-medium text-[#10B981] border border-[#10B981] rounded-xl">
                  <i className="ri-download-line mr-1"></i> Download Quote
                </button>
              )}
              {selectedQuote.status === "Rejected" && (
                <button className="w-full py-3 text-sm font-medium text-[#687068] border border-[#E2E8F0] rounded-xl">
                  <i className="ri-refresh-line mr-1"></i> Request New Quote
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-[#10B981] text-2xl"></i>
            </div>
            <h3 className="font-semibold text-[#3A3F3A] mb-1">Approve Quote?</h3>
            <p className="text-xs text-[#687068] mb-4">£{selectedQuote?.amount} for {selectedQuote?.job}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2.5 text-sm text-[#687068] border border-[#E2E8F0] rounded-xl">Cancel</button>
              <button onClick={handleApprove} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#10B981] rounded-xl">Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
            <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-close-line text-[#EF4444] text-2xl"></i>
            </div>
            <h3 className="font-semibold text-[#3A3F3A] mb-1">Reject Quote?</h3>
            <p className="text-xs text-[#687068] mb-4">£{selectedQuote?.amount} for {selectedQuote?.job}</p>
            <div className="mb-4">
              <textarea placeholder="Reason for rejection (optional)..." rows={3} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none resize-none"></textarea>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 text-sm text-[#687068] border border-[#E2E8F0] rounded-xl">Cancel</button>
              <button onClick={handleReject} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#EF4444] rounded-xl">Reject</button>
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