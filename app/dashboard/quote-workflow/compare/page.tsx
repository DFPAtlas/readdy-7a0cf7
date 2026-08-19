"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { workflowJobs, type QuoteWorkflowJob } from "../QuoteWorkflowData";

export default function QuoteComparisonPage() {
  const [selectedJob, setSelectedJob] = useState<string>("wf1");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [jobList, setJobList] = useState(workflowJobs);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const job = jobList.find((j) => j.id === selectedJob);
  const quotedContractors = job?.contractors.filter((c) => c.quoteTotal) || [];

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = () => {
    if (!selectedContractor || !job) return;
    setJobList((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? {
              ...j,
              currentStep: 6,
              selectedContractor,
              contractors: j.contractors.map((c) =>
                c.id === selectedContractor ? { ...c, status: "Instructed" as const } : c
              ),
            }
          : j
      )
    );
    setShowApproveModal(false);
    setSelectedContractor(null);
    showToast("Quote approved. Contractor instructed.");
  };

  const handleReject = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedContractor(null);
    showToast("Quote rejected. Requesting alternative.");
  };

  const getCheapest = () => {
    if (quotedContractors.length === 0) return null;
    return quotedContractors.reduce((min, c) => (c.quoteTotal! < min.quoteTotal! ? c : min));
  };

  const getFastest = () => {
    if (quotedContractors.length === 0) return null;
    return quotedContractors.reduce((fast, c) => {
      const fastDays = parseInt(fast.estimatedDays || "999");
      const cDays = parseInt(c.estimatedDays || "999");
      return cDays < fastDays ? c : fast;
    });
  };

  const getHighestRated = () => {
    if (quotedContractors.length === 0) return null;
    return quotedContractors.reduce((best, c) => (c.rating > best.rating ? c : best));
  };

  const cheapest = getCheapest();
  const fastest = getFastest();
  const highestRated = getHighestRated();

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/quote-workflow" className="hover:text-[#C28A78] transition-colors">
              Quote Workflow
            </Link>
            <i className="ri-arrow-right-s-line text-xs"></i>
            <span className="text-[#3A3F3A] font-medium">Compare Quotes</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">Quote Comparison</h1>
              <p className="text-sm text-[#687068] mt-1">Compare contractor quotes side by side</p>
            </div>
          </div>
        </div>

        {/* Job Selector */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <label className="text-sm font-medium text-[#3A3F3A] block mb-2">Select Job</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {jobList
              .filter((j) => j.contractors.some((c) => c.quoteTotal))
              .map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJob(j.id)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedJob === j.id
                      ? "bg-[#C28A78] text-white"
                      : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
                  }`}
                >
                  <span>{j.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedJob === j.id ? "bg-white/20 text-white" : "bg-[#E2E8F0] text-[#687068]"
                    }`}
                  >
                    {j.contractors.filter((c) => c.quoteTotal).length} quotes
                  </span>
                </button>
              ))}
          </div>
        </div>

        {job && quotedContractors.length > 0 ? (
          <>
            {/* Job Summary */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-[#3A3F3A]">{job.title}</p>
                  <p className="text-xs text-[#687068] mt-0.5">
                    {job.property} · {job.category} · {job.priority} priority
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1">{job.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#94A3B8]">Reported</p>
                  <p className="text-sm text-[#3A3F3A]">{job.reportedDate}</p>
                  <p className="text-xs text-[#687068]">by {job.tenant}</p>
                </div>
              </div>
            </div>

            {/* Quick Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cheapest && (
                <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-money-pound-circle-line text-[#10B981] text-sm"></i>
                    </div>
                    <span className="text-xs font-medium text-[#10B981]">Lowest Price</span>
                  </div>
                  <p className="text-xl font-bold text-[#3A3F3A]">£{cheapest.quoteTotal}</p>
                  <p className="text-sm text-[#687068]">{cheapest.name}</p>
                  <p className="text-xs text-[#94A3B8]">£{cheapest.quoteAmount} + £{cheapest.quoteVat} VAT</p>
                </div>
              )}
              {fastest && (
                <div className="bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-time-line text-[#3B82F6] text-sm"></i>
                    </div>
                    <span className="text-xs font-medium text-[#3B82F6]">Fastest</span>
                  </div>
                  <p className="text-xl font-bold text-[#3A3F3A]">{fastest.estimatedDays}</p>
                  <p className="text-sm text-[#687068]">{fastest.name}</p>
                  <p className="text-xs text-[#94A3B8]">£{fastest.quoteTotal} total</p>
                </div>
              )}
              {highestRated && (
                <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                      <i className="ri-star-fill text-[#F59E0B] text-sm"></i>
                    </div>
                    <span className="text-xs font-medium text-[#F59E0B]">Highest Rated</span>
                  </div>
                  <p className="text-xl font-bold text-[#3A3F3A]">{highestRated.rating} / 5</p>
                  <p className="text-sm text-[#687068]">{highestRated.name}</p>
                  <p className="text-xs text-[#94A3B8]">{highestRated.totalJobs} completed jobs</p>
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Quote Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[160px]">Contractor</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[100px]">Quote</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[100px]">VAT</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[100px]">Total</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[100px]">Est. Time</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[100px]">Rating</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[120px]">Jobs</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[200px]">Notes</th>
                      <th className="text-left px-4 py-3 font-medium text-[#687068] min-w-[120px]">Documents</th>
                      <th className="text-right px-4 py-3 font-medium text-[#687068] min-w-[140px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {quotedContractors.map((contractor) => (
                      <tr key={contractor.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[#3A3F3A]">{contractor.name}</p>
                            <p className="text-xs text-[#687068]">{contractor.trade}</p>
                            {contractor.insuranceValid ? (
                              <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 mt-1">
                                <i className="ri-shield-check-line"></i> Insured
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded mt-1">No insurance</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#3A3F3A] font-medium">£{contractor.quoteAmount}</td>
                        <td className="px-4 py-3 text-[#687068]">£{contractor.quoteVat}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${contractor.id === cheapest?.id ? "text-[#10B981]" : "text-[#C28A78]"}`}>
                            £{contractor.quoteTotal}
                          </span>
                          {contractor.id === cheapest?.id && (
                            <span className="ml-1 text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">Lowest</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#687068]">
                          <span className={contractor.id === fastest?.id ? "text-[#3B82F6] font-medium" : ""}>
                            {contractor.estimatedDays}
                          </span>
                          {contractor.id === fastest?.id && (
                            <span className="ml-1 text-[10px] text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.5 rounded">Fastest</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`${contractor.id === highestRated?.id ? "text-[#F59E0B] font-medium" : "text-[#687068]"} flex items-center gap-0.5`}>
                            <i className="ri-star-fill"></i> {contractor.rating}
                          </span>
                          {contractor.id === highestRated?.id && (
                            <span className="ml-1 text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded">Top</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#687068]">{contractor.totalJobs}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#687068] max-w-[200px]">{contractor.notes}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {contractor.documents.map((doc, idx) => (
                              <span key={idx} className="text-[10px] text-[#C28A78] bg-[#C28A78]/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <i className="ri-file-line"></i>
                                {doc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                setSelectedContractor(contractor.id);
                                setShowApproveModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors whitespace-nowrap"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedContractor(contractor.id);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1.5 border border-[#EF4444] text-[#EF4444] rounded-lg text-xs font-medium hover:bg-[#EF4444]/10 transition-colors whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Summary */}
              <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-[#687068]">
                    Comparing {quotedContractors.length} quotes · Price range: £{Math.min(...quotedContractors.map((c) => c.quoteTotal!))} - £
                    {Math.max(...quotedContractors.map((c) => c.quoteTotal!))}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Valid until: {quotedContractors[0]?.quoteValidUntil}
                  </p>
                </div>
              </div>
            </div>

            {/* Card View for Mobile */}
            <div className="grid grid-cols-1 sm:hidden gap-4">
              {quotedContractors.map((contractor) => (
                <div key={contractor.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-[#3A3F3A]">{contractor.name}</p>
                      <p className="text-xs text-[#687068]">{contractor.trade}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${contractor.id === cheapest?.id ? "text-[#10B981]" : "text-[#C28A78]"}`}>
                        £{contractor.quoteTotal}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">inc. VAT</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <p className="text-[10px] text-[#94A3B8]">Quote</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">£{contractor.quoteAmount}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <p className="text-[10px] text-[#94A3B8]">VAT</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">£{contractor.quoteVat}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <p className="text-[10px] text-[#94A3B8]">Est. Time</p>
                      <p className="text-sm font-medium text-[#3A3F3A]">{contractor.estimatedDays}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-2">
                      <p className="text-[10px] text-[#94A3B8]">Rating</p>
                      <p className="text-sm font-medium text-[#3A3F3A] flex items-center gap-0.5">
                        <i className="ri-star-fill text-amber-500 text-xs"></i> {contractor.rating}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#687068] mb-3">{contractor.notes}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedContractor(contractor.id);
                        setShowApproveModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143728] transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContractor(contractor.id);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 px-3 py-2 border border-[#EF4444] text-[#EF4444] rounded-lg text-xs font-medium hover:bg-[#EF4444]/10 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i>
            </div>
            <p className="text-sm text-[#94A3B8]">No quotes available for comparison</p>
            <p className="text-xs text-[#94A3B8] mt-1">Wait for contractors to submit quotes</p>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedContractor && job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Approve Quote</h2>
              <button onClick={() => setShowApproveModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <p className="text-sm font-medium text-[#3A3F3A] mb-1">Approve this quote?</p>
                <p className="text-xs text-[#687068]">
                  {job.contractors.find((c) => c.id === selectedContractor)?.name} — £
                  {job.contractors.find((c) => c.id === selectedContractor)?.quoteTotal} inc VAT
                </p>
                <p className="text-xs text-[#94A3B8] mt-2">
                  This will notify the contractor and landlord. Work can then be scheduled.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors"
              >
                Approve & Instruct
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Reject Quote</h2>
              <button onClick={() => setShowRejectModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line text-[#687068]"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Price too high, not available soon enough..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none"
                />
                <p className="text-xs text-[#94A3B8] mt-1 text-right">{rejectReason.length}/500</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2.5 bg-[#EF4444] text-white rounded-lg text-sm font-medium hover:bg-[#DC2626] transition-colors"
              >
                Reject
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