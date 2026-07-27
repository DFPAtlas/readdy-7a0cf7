"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  allSignatureDocuments,
  signatureStatusConfig,
  signatureTypeConfig,
  SignatureDocument,
} from "../../signatures/SignatureData";

const landlordProperties = ["p1", "p2", "p3"];

export default function LandlordSignaturesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<SignatureDocument | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  const landlordDocs = allSignatureDocuments.filter((d) => landlordProperties.includes(d.propertyId));

  const filtered = landlordDocs.filter((d) => {
    const matchesSearch = search === "" ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase()) ||
      d.propertyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: landlordDocs.length,
    Draft: landlordDocs.filter((d) => d.status === "Draft").length,
    Sent: landlordDocs.filter((d) => d.status === "Sent").length,
    Viewed: landlordDocs.filter((d) => d.status === "Viewed").length,
    Signed: landlordDocs.filter((d) => d.status === "Signed").length,
    Completed: landlordDocs.filter((d) => d.status === "Completed").length,
  };

  const pendingCount = landlordDocs.filter((d) => d.status === "Sent" || d.status === "Viewed").length;
  const completedCount = landlordDocs.filter((d) => d.status === "Completed").length;

  const handleSign = () => {
    setSignSuccess(true);
    setTimeout(() => {
      setSignSuccess(false);
      setShowSignModal(false);
      setSelectedDoc(null);
    }, 1500);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-sm text-[#687068] mb-3">
            <Link href="/dashboard/landlord" className="hover:text-[#C28A78] transition-colors">Landlord Portal</Link>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-right-s-line text-xs"></i>
            </div>
            <span className="text-[#3A3F3A] font-medium">Signatures</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#3A3F3A]">My Documents</h1>
              <p className="text-sm text-[#687068] mt-1">Documents requiring your signature across your portfolio</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Documents", value: landlordDocs.length, icon: "ri-file-list-3-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/10" },
            { label: "Pending My Signature", value: pendingCount, icon: "ri-time-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
            { label: "Completed", value: completedCount, icon: "ri-check-double-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
            { label: "Overdue", value: 0, icon: "ri-error-warning-line", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className={`${stat.icon} ${stat.color} text-lg`}></i>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-[#3A3F3A]">{stat.value}</p>
                <p className="text-xs text-[#687068]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white">
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
          <div className="flex items-center gap-2 overflow-x-auto">
            {Object.keys(statusCounts).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === s ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
                }`}
              >
                {s} ({statusCounts[s as keyof typeof statusCounts]})
              </button>
            ))}
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-medium text-[#687068]">Document</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068]">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068]">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Property</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068] hidden lg:table-cell">Sent</th>
                  <th className="text-right px-4 py-3 font-medium text-[#687068]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-file-text-line text-[#C28A78] text-sm"></i>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#3A3F3A] text-sm truncate">{doc.title}</p>
                          <p className="text-xs text-[#94A3B8]">{doc.fileSize} · {doc.fileType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${signatureTypeConfig[doc.type]?.bg || "bg-[#F1F5F9]"} ${signatureTypeConfig[doc.type]?.color || "text-[#687068]"}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${signatureStatusConfig[doc.status]?.bg || "bg-[#F1F5F9]"} ${signatureStatusConfig[doc.status]?.color || "text-[#687068]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${signatureStatusConfig[doc.status]?.dot || "bg-[#687068]"}`}></span>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#687068] hidden md:table-cell">{doc.propertyName}</td>
                    <td className="px-4 py-3 text-[#687068] hidden lg:table-cell">{doc.sentDate ? doc.sentDate.split(" ")[0] : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                          title="View"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-eye-line text-[#C28A78] text-sm"></i>
                          </div>
                        </button>
                        {doc.status !== "Completed" && doc.status !== "Draft" && (
                          <button
                            onClick={() => { setSelectedDoc(doc); setShowSignModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                            title="Sign"
                          >
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-pen-nib-line text-[#14B8A6] text-sm"></i>
                            </div>
                          </button>
                        )}
                        {doc.status === "Completed" && (
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Download">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <i className="ri-download-line text-[#10B981] text-sm"></i>
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-file-list-3-line text-[#94A3B8] text-xl"></i>
                        </div>
                      </div>
                      <p className="text-sm text-[#94A3B8]">No documents found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedDoc && !showSignModal && !showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-file-text-line text-[#C28A78] text-lg"></i>
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-[#3A3F3A] text-sm">{selectedDoc.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${signatureTypeConfig[selectedDoc.type]?.bg || "bg-[#F1F5F9]"} ${signatureTypeConfig[selectedDoc.type]?.color || "text-[#687068]"}`}>{selectedDoc.type}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${signatureStatusConfig[selectedDoc.status]?.bg || "bg-[#F1F5F9]"} ${signatureStatusConfig[selectedDoc.status]?.color || "text-[#687068]"}`}>
                      <span className={`w-1 h-1 rounded-full ${signatureStatusConfig[selectedDoc.status]?.dot || "bg-[#687068]"}`}></span>
                      {selectedDoc.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedDoc.status === "Completed" && (
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors">
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-download-line text-xs"></i>
                    </div>
                    Download
                  </button>
                )}
                <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line text-[#687068]"></i>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-8 text-center">
                <div className="w-16 h-16 bg-[#C28A78]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-file-text-line text-[#C28A78] text-2xl"></i>
                  </div>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A]">{selectedDoc.title}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{selectedDoc.fileSize} · {selectedDoc.fileType}</p>
                <p className="text-xs text-[#687068] mt-3 max-w-md mx-auto">{selectedDoc.description}</p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button className="flex items-center gap-1 px-4 py-2 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors">
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-eye-line text-xs"></i>
                    </div>
                    Preview
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                    <div className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-download-line text-xs"></i>
                    </div>
                    Download
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#3A3F3A] mb-3">Signing Parties</h3>
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
                          {party.signed ? (
                            <span className="text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">Signed</span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </div>
                        {party.signedAt && <p className="text-xs text-[#687068] mt-0.5">Signed at {party.signedAt}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowAuditModal(true)} className="flex items-center gap-2 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-shield-check-line text-sm"></i>
                  </div>
                  Audit Trail
                </button>
                {selectedDoc.status !== "Completed" && selectedDoc.status !== "Draft" && (
                  <button onClick={() => setShowSignModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-pen-nib-line text-sm"></i>
                    </div>
                    Sign Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Modal */}
      {showSignModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Sign Document</h2>
              <button onClick={() => setShowSignModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line text-[#687068]"></i>
                </div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {signSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-check-line text-[#10B981] text-xl"></i>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#10B981]">Document signed successfully!</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Timestamp: 2026-05-31 14:32:18 UTC</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                    <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-file-text-line text-[#C28A78] text-xs"></i>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{selectedDoc.title}</p>
                      <p className="text-xs text-[#94A3B8]">Sign as: James Richardson (Landlord)</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Your Signature</label>
                    <div className="border border-[#E2E8F0] rounded-lg bg-white p-4 text-center">
                      <div className="w-full h-32 border border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center">
                        <p className="text-sm text-[#94A3B8]">Click and drag to sign (or use typed signature)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button className="text-xs text-[#687068] hover:text-[#3A3F3A] transition-colors flex items-center gap-1">
                        <div className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-delete-bin-line text-xs"></i>
                        </div>
                        Clear
                      </button>
                      <p className="text-xs text-[#94A3B8]">Draw your signature above</p>
                    </div>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="w-5 h-5 rounded border border-[#E2E8F0] bg-[#C28A78] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-white text-xs"></i>
                    </div>
                    <span className="text-sm text-[#687068]">
                      I confirm that I have reviewed this document and agree to sign it electronically. I understand this electronic signature is legally binding.
                    </span>
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setShowSignModal(false)} className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSign} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors">
                      Sign Document
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-shield-check-line text-[#8B5CF6] text-lg"></i>
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-[#3A3F3A] text-sm">Audit Trail</h2>
                  <p className="text-xs text-[#94A3B8]">{selectedDoc.title}</p>
                </div>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line text-[#687068]"></i>
                </div>
              </button>
            </div>
            <div className="p-5">
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
                        <div className="w-0.5 h-full bg-[#E2E8F0] mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#3A3F3A]">{entry.action}</p>
                        <span className="text-xs text-[#94A3B8] flex-shrink-0">{entry.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#687068] mt-0.5">{entry.user} ({entry.userRole}) · IP: {entry.ipAddress}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}