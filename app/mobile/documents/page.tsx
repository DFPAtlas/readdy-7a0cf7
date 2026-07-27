"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";

const documentCategories = ["All", "Agreements", "Certificates", "Invoices", "Photos"];

const mockDocuments = [
  { id: 1, name: "Tenancy Agreement - Flat 4B", type: "Agreement", property: "Flat 4B Oak Street", date: "15 Mar 2026", size: "2.4 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]" },
  { id: 2, name: "Gas Safety Certificate", type: "Certificate", property: "45 Baker Street", date: "12 Aug 2025", size: "1.1 MB", icon: "ri-shield-check-line", color: "bg-[#10B981]" },
  { id: 3, name: "EPC Certificate", type: "Certificate", property: "12 Rose Avenue", date: "15 Oct 2024", size: "856 KB", icon: "ri-file-chart-line", color: "bg-[#F59E0B]" },
  { id: 4, name: "Invoice - Boiler Repair", type: "Invoice", property: "12 Rose Avenue", date: "22 Mar 2026", size: "320 KB", icon: "ri-bill-line", color: "bg-[#8B5CF6]" },
  { id: 5, name: "Property Photos", type: "Photos", property: "8 The Crescent", date: "20 Mar 2026", size: "15.2 MB", icon: "ri-image-line", color: "bg-[#EC4899]" },
  { id: 6, name: "Inventory Report", type: "Agreement", property: "Flat 4B Oak Street", date: "15 Mar 2026", size: "4.5 MB", icon: "ri-clipboard-line", color: "bg-[#3B82F6]" },
];

export default function MobileDocumentsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<typeof mockDocuments[0] | null>(null);

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesCategory = activeCategory === "All" || doc.type === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.property.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Documents</h1>
          <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <i className="ri-upload-cloud-line text-lg"></i>
          </button>
        </div>
        <p className="text-xs text-white/70">{mockDocuments.length} files · 24.3 MB total</p>
      </div>

      {/* Search */}
      <div className="px-4 -mt-3">
        <div className="bg-white rounded-xl shadow-sm flex items-center gap-2 px-3 py-3">
          <i className="ri-search-line text-[#94A3B8]"></i>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm text-[#3A3F3A] bg-transparent focus:outline-none placeholder:text-[#94A3B8]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="w-6 h-6 flex items-center justify-center">
              <i className="ri-close-line text-[#94A3B8] text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mt-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {documentCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-[#C28A78] text-white"
                  : "bg-white text-[#687068] border border-[#E2E8F0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="px-4 mt-3 space-y-3 mb-6">
        {filteredDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 text-left"
          >
            <div className={`w-12 h-12 ${doc.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${doc.icon} text-white text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3A3F3A] truncate">{doc.name}</p>
              <p className="text-xs text-[#687068] mt-0.5">{doc.property} · {doc.date}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-[#94A3B8]">{doc.size}</p>
              <i className="ri-more-2-line text-[#94A3B8] mt-1"></i>
            </div>
          </button>
        ))}
      </div>

      {/* Document Detail Sheet */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedDoc(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Document Details</h3>
              <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 ${selectedDoc.color} rounded-xl flex items-center justify-center`}>
                <i className={`${selectedDoc.icon} text-white text-2xl`}></i>
              </div>
              <div>
                <p className="font-semibold text-[#3A3F3A]">{selectedDoc.name}</p>
                <p className="text-xs text-[#687068]">{selectedDoc.type} · {selectedDoc.size}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-[#F8FAFC] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Property</span>
                <span className="text-sm text-[#3A3F3A]">{selectedDoc.property}</span>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Uploaded</span>
                <span className="text-sm text-[#3A3F3A]">{selectedDoc.date}</span>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Version</span>
                <span className="text-sm text-[#3A3F3A]">v1.0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                <i className="ri-download-line mr-1"></i>
                Download
              </button>
              <button className="py-3 text-sm font-medium text-[#C28A78] border border-[#C28A78] rounded-xl whitespace-nowrap">
                <i className="ri-share-line mr-1"></i>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}