"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { quotes } from "../LandlordData";

export default function LandlordQuotesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [alternativeModal, setAlternativeModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [alternativeReason, setAlternativeReason] = useState("");
  const [quoteList, setQuoteList] = useState(quotes);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = activeTab === "all" ? quoteList : quoteList.filter((q) => q.status.toLowerCase() === activeTab);
  const pendingCount = quoteList.filter((q) => q.status === "Pending").length;
  const approvedCount = quoteList.filter((q) => q.status === "Approved").length;
  const rejectedCount = quoteList.filter((q) => q.status === "Rejected").length;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (quoteId: string) => {
    setQuoteList((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status: "Approved" } : q)));
    setConfirmModal(false);
    setSelectedQuote(null);
    showToast("Quote approved successfully");
  };

  const handleReject = (quoteId: string) => {
    setQuoteList((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status: "Rejected" } : q)));
    setRejectModal(false);
    setRejectionReason("");
    setSelectedQuote(null);
    showToast("Quote rejected");
  };

  const handleRequestAlternative = (quoteId: string) => {
    setQuoteList((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status: "Alternative Requested" } : q)));
    setAlternativeModal(false);
    setAlternativeReason("");
    setSelectedQuote(null);
    showToast("Alternative quote requested");
  };

  const selectedQuoteData = quoteList.find((q) => q.id === selectedQuote);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Portal</Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">Contractor Quotes</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Contractor Quotes</h1>
              <p className="text-sm text-[#687068] mt-1">Review and approve contractor quotes</p>
            </div>
            {pendingCount > 0 && (
              <span className="text-sm font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                {pendingCount} pending approval{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", value: pendingCount, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
            { label: "Approved", value: approvedCount, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
            { label: "Rejected", value: rejectedCount, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => setActiveTab(stat.label.toLowerCase())}
              className={`bg-white rounded-xl border p-4 text-center transition-colors ${activeTab === stat.label.toLowerCase() ? "border-[#C28A78]" : "border-[#E2E8F0] hover:border-[#C28A78]/30"}`}
            >
              <p className="text-2xl font-bold text-[#3A3F3A]">{stat.value}</p>
              <p className="text-xs text-[#687068] mt-1">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border border-[#E2E8F0] rounded-lg p-1 bg-white w-fit">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "alternative requested", label: "Alternative Requested" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-[#C28A78] text-white" : "text-[#687068] hover:text-[#3A3F3A]"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quotes List */}
        <div className="space-y-3">
          {filtered.map((quote) => (
            <div key={quote.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-[#3A3F3A]">{quote.jobTitle}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        quote.status === "Pending" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                        quote.status === "Approved" ? "bg-[#10B981]/10 text-[#10B981]" :
                        quote.status === "Rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                        "bg-[#3B82F6]/10 text-[#3B82F6]"
                      }`}>{quote.status}</span>
                    </div>
                    <p className="text-xs text-[#687068]">{quote.property} · {quote.contractor} · {quote.contractorTrade}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-[#C28A78]">£{quote.totalAmount}</p>
                    <p className="text-xs text-[#94A3B8]">inc. VAT</p>
                  </div>
                </div>
                <p className="text-sm text-[#687068] mb-3">{quote.description}</p>
                <div className="flex items-center gap-3 text-xs text-[#94A3B8] mb-3">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>
                    Submitted {quote.submittedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-time-line"></i>
                    Valid until {quote.validUntil}
                  </span>
                </div>
                {/* Breakdown */}
                <div className="bg-[#F8FAFC] rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-[#687068] mb-2">Quote Breakdown</p>
                  <div className="space-y-1">
                    {quote.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-[#687068]">{item.item}</span>
                        <span className="font-medium text-[#3A3F3A]">£{item.cost}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#E2E8F0] pt-1 mt-1 flex items-center justify-between text-sm font-medium">
                      <span className="text-[#3A3F3A]">Subtotal</span>
                      <span className="text-[#3A3F3A]">£{quote.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#687068]">VAT (20%)</span>
                      <span className="text-[#3A3F3A]">£{quote.vatAmount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-[#C28A78]">Total</span>
                      <span className="text-[#C28A78]">£{quote.totalAmount}</span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                {quote.status === "Pending" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => { setSelectedQuote(quote.id); setConfirmModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
                    >
                      <i className="ri-check-line text-sm"></i>
                      Approve
                    </button>
                    <button
                      onClick={() => { setSelectedQuote(quote.id); setRejectModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 border border-[#EF4444] text-[#EF4444] text-sm font-medium rounded-lg hover:bg-[#EF4444]/10 transition-colors whitespace-nowrap"
                    >
                      <i className="ri-close-line text-sm"></i>
                      Reject
                    </button>
                    <button
                      onClick={() => { setSelectedQuote(quote.id); setAlternativeModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 border border-[#3B82F6] text-[#3B82F6] text-sm font-medium rounded-lg hover:bg-[#3B82F6]/10 transition-colors whitespace-nowrap"
                    >
                      <i className="ri-refresh-line text-sm"></i>
                      Request Alternative
                    </button>
                  </div>
                )}
                {quote.status === "Approved" && (
                  <div className="flex items-center gap-2 text-sm text-[#10B981]">
                    <i className="ri-check-double-line"></i>
                    <span className="font-medium">Approved — Work authorised</span>
                  </div>
                )}
                {quote.status === "Rejected" && (
                  <div className="flex items-center gap-2 text-sm text-[#EF4444]">
                    <i className="ri-close-circle-line"></i>
                    <span className="font-medium">Rejected — Seeking alternative</span>
                  </div>
                )}
                {quote.status === "Alternative Requested" && (
                  <div className="flex items-center gap-2 text-sm text-[#3B82F6]">
                    <i className="ri-refresh-line"></i>
                    <span className="font-medium">Alternative quote requested from contractor</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E2E8F0]">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-money-pound-circle-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#687068]">No quotes in this category</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Approve Modal */}
      {confirmModal && selectedQuoteData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-[#10B981] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] text-center mb-2">Approve Quote</h3>
            <p className="text-sm text-[#687068] text-center mb-6">
              Are you sure you want to approve this quote for <strong className="text-[#3A3F3A]">£{selectedQuoteData.totalAmount}</strong> from {selectedQuoteData.contractor}?
              <br /><br />
              This will authorise the work to proceed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setConfirmModal(false); setSelectedQuote(null); }}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedQuoteData.id)}
                className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#143828] transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && selectedQuoteData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-close-line text-[#EF4444] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] text-center mb-2">Reject Quote</h3>
            <p className="text-sm text-[#687068] text-center mb-4">
              Reject the quote for <strong className="text-[#3A3F3A]">£{selectedQuoteData.totalAmount}</strong> from {selectedQuoteData.contractor}?
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium text-[#3A3F3A] block mb-2">Reason for rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Price too high, not available soon enough..."
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-[#94A3B8] mt-1">{rejectionReason.length}/500</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setRejectModal(false); setRejectionReason(""); setSelectedQuote(null); }}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedQuoteData.id)}
                className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Modal */}
      {alternativeModal && selectedQuoteData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-refresh-line text-[#3B82F6] text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-[#3A3F3A] text-center mb-2">Request Alternative Quote</h3>
            <p className="text-sm text-[#687068] text-center mb-4">
              Request an alternative quote for <strong className="text-[#3A3F3A]">{selectedQuoteData.jobTitle}</strong>.
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium text-[#3A3F3A] block mb-2">What would you like to change?</label>
              <textarea
                value={alternativeReason}
                onChange={(e) => setAlternativeReason(e.target.value)}
                placeholder="e.g. Can you use cheaper materials? Break the job into smaller parts?"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-[#94A3B8] mt-1">{alternativeReason.length}/500</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setAlternativeModal(false); setAlternativeReason(""); setSelectedQuote(null); }}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-sm font-medium text-[#687068] rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestAlternative(selectedQuoteData.id)}
                className="flex-1 px-4 py-2.5 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3A3F3A] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <i className="ri-check-line text-[#10B981]"></i>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </DashboardShell>
  );
}