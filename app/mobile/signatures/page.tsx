"use client";

import { useState } from "react";
import Link from "next/link";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  allSignatureDocuments,
  signatureStatusConfig,
  signatureTypeConfig,
  SignatureDocument,
} from "../../dashboard/signatures/SignatureData";

export default function MobileSignaturesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<SignatureDocument | null>(null);
  const [showSignSheet, setShowSignSheet] = useState(false);
  const [showAuditSheet, setShowAuditSheet] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filtered = allSignatureDocuments.filter((d) => {
    const matchesSearch = search === "" ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    const matchesTab = activeTab === "all" ||
      (activeTab === "pending" && (d.status === "Sent" || d.status === "Viewed")) ||
      (activeTab === "completed" && d.status === "Completed");
    return matchesSearch && matchesStatus && matchesTab;
  });

  const pendingCount = allSignatureDocuments.filter((d) => d.status === "Sent" || d.status === "Viewed").length;
  const completedCount = allSignatureDocuments.filter((d) => d.status === "Completed").length;

  const handleSign = () => {
    setSignSuccess(true);
    setTimeout(() => {
      setSignSuccess(false);
      setShowSignSheet(false);
      setSelectedDoc(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/mobile" className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-arrow-left-line text-sm"></i>
            </div>
            Back
          </Link>
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-more-2-line text-sm"></i>
          </div>
        </div>
        <h1 className="text-xl font-bold">Digital Signatures</h1>
        <p className="text-xs text-white/70 mt-1">{allSignatureDocuments.length} documents · {pendingCount} pending</p>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-[#94A3B8] text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="w-4 h-4 flex items-center justify-center">
              <i className="ri-close-line text-[#94A3B8] text-xs"></i>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "all", label: "All", count: allSignatureDocuments.length },
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "completed", label: "Completed", count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-[#C28A78] text-white" : "bg-white text-[#687068] border border-[#E2E8F0]"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Document Cards */}
      <div className="px-4 space-y-3">
        {filtered.map((doc) => {
          const signedCount = doc.parties.filter((p) => p.signed).length;
          const totalCount = doc.parties.length;
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="w-full text-left bg-white rounded-xl border border-[#E2E8F0] p-4 active:bg-[#F8FAFC] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-file-text-line text-[#C28A78] text-lg"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.title}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${signatureStatusConfig[doc.status]?.bg || "bg-[#F1F5F9]"} ${signatureStatusConfig[doc.status]?.color || "text-[#687068]"}`}>
                      <span className={`w-1 h-1 rounded-full ${signatureStatusConfig[doc.status]?.dot || "bg-[#687068]"}`}></span>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{doc.type} · {doc.propertyName}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${(signedCount / totalCount) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] text-[#687068]">{signedCount}/{totalCount}</span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8]">{doc.fileSize}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i>
              </div>
            </div>
            <p className="text-sm text-[#94A3B8]">No documents found</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet - Document Detail */}
      {selectedDoc && !showSignSheet && !showAuditSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-[#E2E8F0] rounded-full"></div>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-file-text-line text-[#C28A78] text-lg"></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{selectedDoc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${signatureTypeConfig[selectedDoc.type]?.bg || "bg-[#F1F5F9]"} ${signatureTypeConfig[selectedDoc.type]?.color || "text-[#687068]"}`}>{selectedDoc.type}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${signatureStatusConfig[selectedDoc.status]?.bg || "bg-[#F1F5F9]"} ${signatureStatusConfig[selectedDoc.status]?.color || "text-[#687068]"}`}>
                        <span className={`w-1 h-1 rounded-full ${signatureStatusConfig[selectedDoc.status]?.dot || "bg-[#687068]"}`}></span>
                        {selectedDoc.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line text-[#687068]"></i>
                  </div>
                </button>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#687068]">Signing Progress</span>
                  <span className="text-xs font-medium text-[#3A3F3A]">{selectedDoc.parties.filter(p => p.signed).length}/{selectedDoc.parties.length} signed</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${(selectedDoc.parties.filter(p => p.signed).length / selectedDoc.parties.length) * 100}%` }}></div>
                </div>
              </div>

              {/* Parties */}
              <div className="space-y-2">
                {selectedDoc.parties.map((party) => (
                  <div key={party.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#F8FAFC] rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${party.signed ? "bg-[#10B981]" : "bg-[#94A3B8]"}`}>
                      {party.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#3A3F3A]">{party.name}</p>
                        <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{party.role}</span>
                      </div>
                      {party.signedAt && <p className="text-xs text-[#687068]">Signed {party.signedAt}</p>}
                      {party.viewedAt && !party.signedAt && <p className="text-xs text-[#687068]">Viewed {party.viewedAt}</p>}
                    </div>
                    {party.signed ? (
                      <div className="w-6 h-6 bg-[#10B981]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-check-line text-[#10B981] text-xs"></i>
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-[#F59E0B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-time-line text-[#F59E0B] text-xs"></i>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-[#687068]">{selectedDoc.description}</p>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShowAuditSheet(true)} className="flex items-center justify-center gap-2 py-3 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#687068] bg-white">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-shield-check-line text-sm"></i>
                  </div>
                  Audit Trail
                </button>
                {selectedDoc.status !== "Completed" && selectedDoc.status !== "Draft" && (
                  <button onClick={() => setShowSignSheet(true)} className="flex items-center justify-center gap-2 py-3 bg-[#C28A78] text-white rounded-xl text-xs font-medium">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-pen-nib-line text-sm"></i>
                    </div>
                    Sign Now
                  </button>
                )}
                {selectedDoc.status === "Completed" && (
                  <button className="flex items-center justify-center gap-2 py-3 bg-[#10B981] text-white rounded-xl text-xs font-medium">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-download-line text-sm"></i>
                    </div>
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet - Sign */}
      {showSignSheet && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-[#E2E8F0] rounded-full"></div>
            </div>
            <div className="px-4 py-4 space-y-4">
              {signSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-check-line text-[#10B981] text-2xl"></i>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#10B981]">Signed successfully!</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Timestamp: 2026-05-31 14:32:18 UTC</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#3A3F3A]">Sign Document</h3>
                    <button onClick={() => setShowSignSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-close-line text-[#687068]"></i>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                    <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-file-text-line text-[#C28A78] text-xs"></i>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{selectedDoc.title}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Your Signature</label>
                    <div className="border border-[#E2E8F0] rounded-lg bg-white p-4 text-center">
                      <div className="w-full h-32 border border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center">
                        <p className="text-sm text-[#94A3B8]">Tap and draw to sign</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button className="text-xs text-[#687068] flex items-center gap-1">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-delete-bin-line text-xs"></i>
                        </div>
                        Clear
                      </button>
                      <p className="text-xs text-[#94A3B8]">Use finger to sign</p>
                    </div>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="w-5 h-5 rounded border border-[#E2E8F0] bg-[#C28A78] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-white text-xs"></i>
                    </div>
                    <span className="text-xs text-[#687068]">
                      I confirm that I have reviewed this document and agree to sign it electronically. I understand this electronic signature is legally binding.
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowSignSheet(false)} className="flex-1 py-3 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#687068] bg-white">
                      Cancel
                    </button>
                    <button onClick={handleSign} className="flex-1 py-3 bg-[#C28A78] text-white rounded-xl text-xs font-medium">
                      Sign Document
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet - Audit */}
      {showAuditSheet && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-8 h-1 bg-[#E2E8F0] rounded-full"></div>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#3A3F3A]">Audit Trail</h3>
                <button onClick={() => setShowAuditSheet(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line text-[#687068]"></i>
                  </div>
                </button>
              </div>
              <div className="space-y-3">
                {selectedDoc.auditTrail.map((entry, idx) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.action.includes("Signature") ? "bg-[#14B8A6]/10" :
                        entry.action.includes("Sent") ? "bg-[#3B82F6]/10" :
                        entry.action.includes("Completed") ? "bg-[#10B981]/10" :
                        entry.action.includes("Viewed") ? "bg-[#8B5CF6]/10" :
                        "bg-[#F1F5F9]"
                      }`}>
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${
                            entry.action.includes("Signature") ? "ri-pen-nib-line text-[#14B8A6]" :
                            entry.action.includes("Sent") ? "ri-send-plane-line text-[#3B82F6]" :
                            entry.action.includes("Completed") ? "ri-check-double-line text-[#10B981]" :
                            entry.action.includes("Viewed") ? "ri-eye-line text-[#8B5CF6]" :
                            "ri-file-text-line text-[#687068]"
                          } text-xs`}></i>
                        </div>
                      </div>
                      {idx < selectedDoc.auditTrail.length - 1 && (
                        <div className="w-0.5 h-6 bg-[#E2E8F0] mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[#3A3F3A]">{entry.action}</p>
                        <span className="text-[10px] text-[#94A3B8]">{entry.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-[#687068]">{entry.user} · IP: {entry.ipAddress}</p>
                      <p className="text-[10px] text-[#94A3B8]">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}