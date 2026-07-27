"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { getDocumentsByRole, documentFolders, documentTypes, DocumentItem, propertiesForDocs } from "../../documents/DocumentData";
import { getTypeStyle } from "@/lib/documentSystem";
import { tenancyInfo } from "../TenantData";

const tenantPropertyId = "p1";

export default function TenantDocumentsPage() {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [docToShare, setDocToShare] = useState<DocumentItem | null>(null);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const tenantDocs = getDocumentsByRole("tenant", tenantPropertyId);

  const filtered = tenantDocs.filter((d) => {
    const matchesSearch = search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === "all" || d.folder === selectedFolder;
    const matchesType = typeFilter === "All" || d.type === typeFilter;
    return matchesSearch && matchesFolder && matchesType;
  });

  const folderCounts = documentFolders.reduce((acc, f) => {
    acc[f.id] = f.id === "all" ? tenantDocs.length : tenantDocs.filter((d) => d.folder === f.id).length;
    return acc;
  }, {} as Record<string, number>);

  const handleShare = () => {
    if (!shareEmail) return;
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareModal(false);
      setShareEmail("");
      setDocToShare(null);
    }, 1500);
  };

  const openShare = (doc: DocumentItem) => {
    setDocToShare(doc);
    setShowShareModal(true);
    setShareSuccess(false);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Documents</h1>
            <p className="text-sm text-[#687068] mt-1">{filtered.length} documents for your tenancy</p>
          </div>
        </div>

        {/* Tenancy Info Banner */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-building-4-line text-[#C28A78] text-sm"></i>
              </div>
            </div>
            <h2 className="font-semibold text-[#3A3F3A]">{tenancyInfo.property}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#94A3B8]">Tenancy Period</p>
              <p className="text-[#3A3F3A] font-medium">{tenancyInfo.startDate} - {tenancyInfo.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Landlord</p>
              <p className="text-[#3A3F3A] font-medium">{tenancyInfo.landlord}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Deposit</p>
              <p className="text-[#3A3F3A] font-medium">{tenancyInfo.deposit} ({tenancyInfo.depositScheme})</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Notice Required</p>
              <p className="text-[#3A3F3A] font-medium">{tenancyInfo.noticeRequired}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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
            <div className="relative">
              <button
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
              >
                <span>{selectedFolder === "all" ? "All Folders" : selectedFolder}</span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </div>
              </button>
              {showFolderDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-30 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {documentFolders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedFolder(f.id); setShowFolderDropdown(false); }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-[#F1F5F9] ${selectedFolder === f.id ? "text-[#C28A78] font-medium" : "text-[#3A3F3A]"}`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${f.icon} text-[#94A3B8] text-xs`}></i>
                      </div>
                      <span>{f.name}</span>
                      <span className="ml-auto text-xs text-[#94A3B8]">{folderCounts[f.id] || 0}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#3A3F3A] whitespace-nowrap"
              >
                <span>{typeFilter}</span>
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-down-s-line text-[#94A3B8] text-xs"></i>
                </div>
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-30 min-w-[180px] max-h-[300px] overflow-y-auto">
                  {documentTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTypeFilter(t); setShowTypeDropdown(false); }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-[#F1F5F9] ${typeFilter === t ? "text-[#C28A78] font-medium" : "text-[#3A3F3A]"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-medium text-[#687068] w-[320px]">Document</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068]">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068] hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-[#687068] hidden lg:table-cell">Size</th>
                  <th className="text-right px-4 py-3 font-medium text-[#687068]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 cursor-pointer" onClick={() => { setSelectedDoc(doc); setShowVersionDrawer(false); }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className={`${doc.icon} text-white text-sm`}></i>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#3A3F3A] text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-[#94A3B8] truncate">{doc.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeStyle(doc.type)}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#687068] hidden md:table-cell">{doc.date}</td>
                    <td className="px-4 py-3 text-[#687068] hidden lg:table-cell">{doc.size}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Download" onClick={(e) => e.stopPropagation()}>
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-download-line text-[#C28A78] text-sm"></i>
                          </div>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Share" onClick={(e) => { e.stopPropagation(); openShare(doc); }}>
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-share-line text-[#687068] text-sm"></i>
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <i className="ri-folder-line text-[#94A3B8] text-xl"></i>
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

      {/* Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${selectedDoc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${selectedDoc.icon} text-white text-lg`}></i>
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-[#3A3F3A] text-sm">{selectedDoc.name}</h2>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeStyle(selectedDoc.type)}`}>{selectedDoc.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors">
                  <div className="w-3 h-3 flex items-center justify-center">
                    <i className="ri-download-line text-xs"></i>
                  </div>
                  Download
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-close-line text-[#687068]"></i>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Property</p>
                  <p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.propertyName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Date</p>
                  <p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.date}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Size</p>
                  <p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.size}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Folder</p>
                  <p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.folder}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Uploaded By</p>
                  <p className="text-sm text-[#3A3F3A] font-medium">{selectedDoc.uploadedBy} <span className="text-[#94A3B8] font-normal">({selectedDoc.uploadedByRole})</span></p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">File Type</p>
                  <p className="text-sm text-[#3A3F3A] font-medium uppercase">{selectedDoc.fileType}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-1">Description</p>
                <p className="text-sm text-[#3A3F3A]">{selectedDoc.description}</p>
              </div>
              <div>
                <button
                  onClick={() => setShowVersionDrawer(!showVersionDrawer)}
                  className="flex items-center gap-2 text-sm font-medium text-[#3A3F3A] mb-3"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${showVersionDrawer ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"} text-[#94A3B8] text-sm`}></i>
                  </div>
                  Version History ({selectedDoc.versions.length})
                </button>
                {showVersionDrawer && (
                  <div className="space-y-2">
                    {selectedDoc.versions.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-[#F8FAFC] rounded-lg">
                        <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-file-line text-[#C28A78] text-xs"></i>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[#3A3F3A]">Version {v.version}</p>
                            {v.version === selectedDoc.versions.length && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">Current</span>
                            )}
                          </div>
                          <p className="text-xs text-[#687068]">{v.date} by {v.uploadedBy} ({v.uploadedByRole})</p>
                          {v.notes && <p className="text-xs text-[#94A3B8] mt-0.5">{v.notes}</p>}
                        </div>
                        <span className="text-xs text-[#94A3B8] flex-shrink-0">{v.size}</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors flex-shrink-0" title="Download this version">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-download-line text-[#C28A78] text-xs"></i>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && docToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#3A3F3A]">Share Document</h2>
              <button onClick={() => setShowShareModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line text-[#687068]"></i>
                </div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {shareSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-check-line text-[#10B981] text-xl"></i>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#10B981]">Document shared successfully!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                    <div className={`w-8 h-8 ${docToShare.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className={`${docToShare.icon} text-white text-xs`}></i>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#3A3F3A] truncate">{docToShare.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeStyle(docToShare.type)}`}>{docToShare.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => setShowShareModal(false)} className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleShare} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors">
                      Share
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}