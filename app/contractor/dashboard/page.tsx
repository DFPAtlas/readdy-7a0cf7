"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isDemoAccount } from "@/lib/demoMode";
import { usePortalBranding, PortalBrandingHeader } from "@/components/PortalBranding";
import { contractorJobs, contractorDocs, contractorProfile, performanceStats } from "@/app/dashboard/contractor/ContractorData";

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Assigned: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-flag-line" },
  Quoted: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-money-pound-circle-line" },
  Approved: { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-check-line" },
  Scheduled: { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-calendar-check-line" },
  "In Progress": { color: "text-[#C28A78]", bg: "bg-[#C28A78]/10", icon: "ri-tools-line" },
  Completed: { color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line" },
  Cancelled: { color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", icon: "ri-close-line" },
};

const quoteRequests = [
  { id: "qr1", title: "Roof gutter cleaning and repair", property: "Riverside Court", address: "Unit 3, Riverside Court, Bristol BS1 4ST", category: "Roofing", requestedDate: "18 Jun 2026", dueDate: "25 Jun 2026", notes: "Clear all guttering, inspect for damage, replace broken brackets." },
  { id: "qr2", title: "EPC assessment", property: "45 Baker Street", address: "45 Baker Street, Manchester M1 2CD", category: "EPC", requestedDate: "19 Jun 2026", dueDate: "26 Jun 2026", notes: "Certificate expires end of month." },
  { id: "qr3", title: "Kitchen tap replacement", property: "Rose Court Flat 2A", address: "12 Rose Avenue, London E1 6AN", category: "Plumbing", requestedDate: "15 Jun 2026", dueDate: "22 Jun 2026", notes: "Cold water tap dripping." },
];

export default function ContractorDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ amount: "", vat: "", notes: "" });
  const [completionNote, setCompletionNote] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [contractorName, setContractorName] = useState(contractorProfile.companyName);
  const { branding, primary, primaryHover } = usePortalBranding();

  useEffect(() => {
    if (isDemoAccount()) {
      setDemoMode(true);
      setSessionReady(true);
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/contractor/login";
        return;
      }

      const { data: profile } = await supabase
        .from("contractor_profiles")
        .select("id, business_name, status")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        window.location.href = "/contractor/login";
        return;
      }

      const contractorStatus = (profile as any).status;
      if (contractorStatus !== "active" && contractorStatus !== "approved") {
        await supabase.auth.signOut();
        window.location.href = "/contractor/login";
        return;
      }

      setContractorName((profile as any).business_name || contractorProfile.companyName);
      setSessionReady(true);
      setLoading(false);
    };

    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/contractor/login";
  };

  const activeJobs = contractorJobs.filter((j) => j.status !== "Completed" && j.status !== "Cancelled");
  const pendingQuotes = contractorJobs.filter((j) => j.status === "Assigned");
  const inProgress = contractorJobs.filter((j) => j.status === "In Progress" || j.status === "Scheduled");
  const completed = contractorJobs.filter((j) => j.status === "Completed");

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C28A78] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4]">
      <PortalBrandingHeader
        portalLabel="Contractor Portal"
        onLogout={handleLogout}
        menuOpen={mobileOpen}
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        extra={
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full font-medium">
              <i className="ri-star-fill mr-1"></i>{contractorProfile.rating}
            </span>
            <span className="text-xs text-[#7A9A7E] bg-[#7A9A7E]/10 px-2.5 py-1 rounded-full font-medium">
              <i className="ri-check-double-line mr-1"></i>{performanceStats.onTimeRate}% On-Time
            </span>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">Welcome, {contractorName}</h1>
            <p className="text-sm text-[#687068] mt-1">{contractorProfile.trade} · {contractorProfile.completedJobs} jobs completed</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Jobs", value: activeJobs.length, icon: "ri-tools-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
            { label: "Quotes Needed", value: pendingQuotes.length, icon: "ri-money-pound-circle-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
            { label: "In Progress", value: inProgress.length, icon: "ri-loader-4-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
            { label: "Completed", value: completed.length, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${stat.icon} ${stat.color} text-lg`}></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-money-pound-circle-line text-[#EF4444] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Quotes Needed</h2>
                <span className="text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full">{pendingQuotes.length}</span>
              </div>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {pendingQuotes.length === 0 ? (
                <div className="px-5 py-6 text-center"><p className="text-sm text-[#94A3B8]">No quotes pending</p></div>
              ) : (
                pendingQuotes.map((job) => (
                  <div key={job.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                    <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-flag-line text-[#EF4444] text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                      <p className="text-xs text-[#687068] mt-0.5">{job.property} · {job.category}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">Assigned {job.assignedDate} · Due {job.dueDate}</p>
                    </div>
                    <button onClick={() => setShowQuoteModal(true)} className="px-3 py-1.5 bg-[#F59E0B] text-white rounded-lg text-xs font-medium hover:bg-[#D97706] transition-colors whitespace-nowrap">
                      Submit Quote
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-tools-line text-[#3B82F6] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Active & In Progress</h2>
                <span className="text-xs font-medium text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-full">{activeJobs.length}</span>
              </div>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {activeJobs.filter(j => j.status !== "Assigned").slice(0, 4).length === 0 ? (
                <div className="px-5 py-6 text-center"><p className="text-sm text-[#94A3B8]">No active jobs</p></div>
              ) : (
                activeJobs.filter(j => j.status !== "Assigned").slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig[job.status].bg}`}>
                      <i className={`${statusConfig[job.status].icon} ${statusConfig[job.status].color} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#3A3F3A] truncate">{job.title}</p>
                        <span className="text-xs font-medium text-[#C28A78] flex-shrink-0">{job.quoteTotal ? `£${job.quoteTotal}` : "—"}</span>
                      </div>
                      <p className="text-xs text-[#687068] mt-0.5">{job.property}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig[job.status].bg} ${statusConfig[job.status].color}`}>{job.status}</span>
                        {job.status === "In Progress" && (
                          <button onClick={() => setShowCompleteModal(true)} className="px-2 py-0.5 bg-[#10B981] text-white rounded text-[10px] font-medium whitespace-nowrap">
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                <i className="ri-mail-send-line text-[#8B5CF6] text-sm"></i>
              </div>
              <h2 className="font-semibold text-[#3A3F3A]">Quote Requests</h2>
              <span className="text-xs font-medium text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">{quoteRequests.length}</span>
            </div>
          </div>
          <div className="divide-y divide-[#D5D9D5]">
            {quoteRequests.map((qr) => (
              <div key={qr.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                <div className="w-8 h-8 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-money-pound-circle-line text-[#8B5CF6] text-sm"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3A3F3A]">{qr.title}</p>
                  <p className="text-xs text-[#687068] mt-0.5">{qr.property} · {qr.category}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">Requested {qr.requestedDate} · Due {qr.dueDate}</p>
                </div>
                <button onClick={() => setShowQuoteModal(true)} className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap">
                  Quote
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-check-double-line text-[#10B981] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Recently Completed</h2>
              </div>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {completed.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-[#10B981] text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#3A3F3A]">{job.title}</p>
                      <span className="text-xs font-medium text-[#C28A78]">{job.quoteTotal ? `£${job.quoteTotal}` : "—"}</span>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5">{job.property} · Completed {job.completedDate}</p>
                    {job.rating && <span className="text-xs text-amber-500"><i className="ri-star-fill mr-0.5 text-xs"></i>{job.rating}</span>}
                  </div>
                </div>
              ))}
              {completed.length === 0 && (
                <div className="px-5 py-6 text-center"><p className="text-sm text-[#94A3B8]">No completed jobs yet</p></div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-folder-line text-[#3B82F6] text-sm"></i>
                </div>
                <h2 className="font-semibold text-[#3A3F3A]">Recent Documents</h2>
              </div>
            </div>
            <div className="divide-y divide-[#D5D9D5]">
              {contractorDocs.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
                  <div className={`w-8 h-8 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${doc.icon} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${doc.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{doc.status}</span>
                    </div>
                    <p className="text-xs text-[#687068] mt-0.5">{doc.type} · {doc.date} · {doc.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D5D9D5]">
            <h2 className="font-semibold text-[#3A3F3A]">Your Performance</h2>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Satisfaction", value: `${performanceStats.customerSatisfaction}/5`, icon: "ri-emotion-happy-line", color: "text-[#10B981]" },
              { label: "Response Rate", value: `${performanceStats.responseRate}%`, icon: "ri-reply-line", color: "text-[#3B82F6]" },
              { label: "Avg Completion", value: performanceStats.avgCompletionTime, icon: "ri-time-line", color: "text-[#8B5CF6]" },
              { label: "Repeat Business", value: `${performanceStats.repeatBusinessRate}%`, icon: "ri-repeat-line", color: "text-[#14B8A6]" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${stat.icon} ${stat.color} text-lg`}></i>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#3A3F3A]">{stat.value}</p>
                  <p className="text-xs text-[#687068]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Submit Quote</h2>
              <button onClick={() => setShowQuoteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Labour (£)</label>
                  <input type="number" value={quoteForm.amount} onChange={(e) => setQuoteForm((prev) => ({ ...prev, amount: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">VAT (£)</label>
                  <input type="number" value={quoteForm.vat} onChange={(e) => setQuoteForm((prev) => ({ ...prev, vat: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Notes</label>
                <textarea value={quoteForm.notes} onChange={(e) => setQuoteForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Scope of work, materials..." rows={3} maxLength={500} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" />
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-lg">
                <span className="text-sm text-[#687068]">Total (incl. VAT)</span>
                <span className="text-lg font-bold text-[#3A3F3A]">£{(Number(quoteForm.amount || 0) + Number(quoteForm.vat || 0)).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
              <button onClick={() => setShowQuoteModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4]">Cancel</button>
              <button onClick={() => setShowQuoteModal(false)} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828]">Submit Quote</button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
              <h2 className="font-semibold text-[#3A3F3A]">Mark Job Complete</h2>
              <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Completion Notes</label>
                <textarea value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} placeholder="Describe what was done..." rows={3} maxLength={500} className="w-full px-3 py-2.5 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78] resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Upload Evidence</label>
                <button className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#687068] hover:bg-[#FBF9F4]">
                  <i className="ri-camera-line"></i> Add Photos
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 border-t border-[#D5D9D5]">
              <button onClick={() => setShowCompleteModal(false)} className="flex-1 px-4 py-2.5 border border-[#D5D9D5] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#FBF9F4]">Cancel</button>
              <button onClick={() => setShowCompleteModal(false)} className="flex-1 px-4 py-2.5 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669]">Mark Complete</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[#D5D9D5] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-[#94A3B8]">
          {branding.agencyName} Contractor Portal · {contractorName}
        </div>
      </footer>
    </div>
  );
}