"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { contractorDocs } from "./ContractorData";

export default function ContractorDocumentsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState("Insurance");
  const [uploadDocName, setUploadDocName] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const filteredDocs = contractorDocs.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleUpload = () => {
    if (!uploadDocName) return;
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setUploadDocName("");
      setUploadExpiry("");
    }, 1500);
  };

  const typeCounts = {
    All: contractorDocs.length,
    Insurance: contractorDocs.filter((d) => d.type === "Insurance").length,
    Certification: contractorDocs.filter((d) => d.type === "Certification").length,
    "Completion Photo": contractorDocs.filter((d) => d.type === "Completion Photo").length,
    Invoice: contractorDocs.filter((d) => d.type === "Invoice").length,
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3A3F3A]">My Documents</h1>
            <p className="text-sm text-[#687068] mt-1">Upload insurance, certificates, completion photos, and invoices</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#C28A78] hover:bg-[#143828] text-white font-medium px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-upload-line text-sm"></i>
            </div>
            Upload Document
          </button>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#3A3F3A]">Upload Document</h2>
                <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                  <i className="ri-close-line text-[#687068]"></i>
                </button>
              </div>
              <div className="p-5 space-y-4">
                {uploadSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="ri-check-line text-[#10B981] text-xl"></i>
                    </div>
                    <p className="text-sm font-medium text-[#10B981]">Document uploaded successfully!</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Document Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Insurance", "Certification", "Completion Photo", "Invoice"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setUploadType(type)}
                            className={`text-xs font-medium px-3 py-2 rounded-lg border text-center transition-colors ${
                              uploadType === type ? "bg-[#C28A78] text-white border-[#C28A78]" : "text-[#687068] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Document Name</label>
                      <input
                        type="text"
                        value={uploadDocName}
                        onChange={(e) => setUploadDocName(e.target.value)}
                        placeholder="e.g., Public Liability Insurance 2027"
                        className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                      />
                    </div>
                    {(uploadType === "Insurance" || uploadType === "Certification") && (
                      <div>
                        <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Expiry Date</label>
                        <input
                          type="date"
                          value={uploadExpiry}
                          onChange={(e) => setUploadExpiry(e.target.value)}
                          className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#3A3F3A] focus:outline-none focus:border-[#C28A78]"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-[#3A3F3A] block mb-1.5">Select File</label>
                      <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center hover:border-[#C28A78]/40 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="ri-file-upload-line text-[#94A3B8] text-lg"></i>
                        </div>
                        <p className="text-sm text-[#687068]">Click to upload or drag and drop</p>
                        <p className="text-xs text-[#94A3B8] mt-1">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#687068] hover:bg-[#F8FAFC] transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleUpload} className="flex-1 px-4 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143728] transition-colors">
                        Upload
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
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
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {["All", "Insurance", "Certification", "Completion Photo", "Invoice"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  typeFilter === type ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068] hover:bg-[#E2E8F0]"
                }`}
              >
                {type} ({typeCounts[type as keyof typeof typeCounts]})
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${doc.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className={`${doc.icon} text-white text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      doc.status === "Valid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}>{doc.status}</span>
                  </div>
                  <p className="text-xs text-[#687068] mt-0.5">{doc.type} · {doc.date} · {doc.size}</p>
                  {doc.expiry && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">Expires {doc.expiry}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button className="flex items-center gap-1 text-xs text-[#C28A78] font-medium hover:underline">
                      <i className="ri-eye-line"></i> View
                    </button>
                    <button className="flex items-center gap-1 text-xs text-[#687068] font-medium hover:underline">
                      <i className="ri-download-line"></i> Download
                    </button>
                    <button className="flex items-center gap-1 text-xs text-[#EF4444] font-medium hover:underline">
                      <i className="ri-delete-bin-line"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-folder-line text-[#94A3B8] text-xl"></i>
              </div>
              <p className="text-sm text-[#94A3B8]">No documents found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}