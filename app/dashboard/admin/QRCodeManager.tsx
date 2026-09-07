"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { platformProperties, type PlatformProperty } from "./AdminData";

interface SupabaseProperty {
  id: string;
  line1: string;
  city: string;
  postcode: string;
  created_at: string;
}

interface QRProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode?: string;
  status: string;
}

interface NewPropertyForm {
  name: string;
  address: string;
  city: string;
  postcode: string;
}

const SUPABASE_URL = "https://gejxrnreuafnyzwrchvy.supabase.co";

function platformToQR(p: PlatformProperty): QRProperty {
  return { id: p.id, name: p.name, address: p.address, city: p.city, status: p.status };
}

function supabaseToQR(p: SupabaseProperty): QRProperty {
  return {
    id: p.id,
    name: p.line1,
    address: p.line1,
    city: p.city || "",
    postcode: p.postcode,
    status: "Active",
  };
}

export default function QRCodeManager() {
  const [mockProps] = useState<PlatformProperty[]>(platformProperties);
  const [supaProps, setSupaProps] = useState<QRProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [printModal, setPrintModal] = useState<QRProperty | null>(null);
  const [bulkPrintMode, setBulkPrintMode] = useState(false);
  const [newProperty, setNewProperty] = useState<NewPropertyForm>({ name: "", address: "", city: "", postcode: "" });
  const [generatedQR, setGeneratedQR] = useState<QRProperty | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/list-properties`);
        if (res.ok) {
          const data: SupabaseProperty[] = await res.json();
          setSupaProps(data.map(supabaseToQR));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const allProperties: QRProperty[] = [...mockProps.map(platformToQR), ...supaProps];

  const filteredProperties = allProperties.filter((p) => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.address.toLowerCase().includes(s) || p.city.toLowerCase().includes(s);
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProperties.map((p) => p.id)));
    }
  };

  const handleDownload = (propertyId: string, propertyName: string) => {
    const qrUrl = `${baseUrl}/mobile/qr?property=${propertyId}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `qr-${propertyId.slice(0, 8)}-${propertyName.replace(/\s/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateNew = async () => {
    if (!newProperty.name || !newProperty.address || !newProperty.city || !newProperty.postcode) return;
    setErrorMsg("");
    setSaving(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session?.access_token || ""}`,
        },
        body: JSON.stringify({
          name: newProperty.name,
          address: newProperty.address,
          city: newProperty.city,
          postcode: newProperty.postcode,
          nation: "england",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to create property");
        setSaving(false);
        return;
      }

      const data = await res.json();
      const newQR: QRProperty = {
        id: data.property?.id,
        name: data.property?.name,
        address: data.property?.address,
        city: newProperty.city,
        postcode: newProperty.postcode,
        status: "Active",
      };

      setSupaProps((prev) => [newQR, ...prev]);
      setGeneratedQR(newQR);
      setNewProperty({ name: "", address: "", city: "", postcode: "" });
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
    setSaving(false);
  };

  const handlePrintBulk = () => {
    setBulkPrintMode(true);
    setTimeout(() => {
      window.print();
      setBulkPrintMode(false);
    }, 300);
  };

  const selectedProperties = allProperties.filter((p) => selectedIds.has(p.id));

  const getQRImageUrl = (propertyId: string) => {
    const qrUrl = `${baseUrl}/mobile/qr?property=${propertyId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
  };

  const getPropertyLabel = (p: QRProperty) => {
    if (p.postcode && p.city) return `${p.address}, ${p.city}, ${p.postcode}`;
    if (p.city) return `${p.address}, ${p.city}`;
    return p.address;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-qr-code-line text-[#C28A78] text-lg"></i>
          </div>
          <div>
            <p className="text-xl font-bold text-[#3A3F3A]">{allProperties.length}</p>
            <p className="text-xs text-[#687068]">Total Properties</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-checkbox-circle-line text-[#10B981] text-lg"></i>
          </div>
          <div>
            <p className="text-xl font-bold text-[#3A3F3A]">{selectedIds.size}</p>
            <p className="text-xs text-[#687068]">Selected for Print</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#D5D9D5] p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-printer-line text-[#3B82F6] text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-[#3A3F3A]">Bulk Actions</p>
            <button
              onClick={handlePrintBulk}
              disabled={selectedIds.size === 0}
              className={`text-xs font-medium mt-1 px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedIds.size > 0
                  ? "bg-[#C28A78] text-white hover:bg-[#B07068] cursor-pointer"
                  : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              Print {selectedIds.size} Selected
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D5D9D5] flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Generate QR for New Property</h2>
              <p className="text-xs text-[#687068] mt-0.5">Enter property details to create and save a QR code</p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-sm font-medium text-[#3A3F3A] block mb-1">Property Name</label>
              <input
                value={newProperty.name}
                onChange={(e) => setNewProperty((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Rose Court Flat 2A"
                className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#3A3F3A] block mb-1">Address</label>
              <input
                value={newProperty.address}
                onChange={(e) => setNewProperty((p) => ({ ...p, address: e.target.value }))}
                placeholder="e.g. 12 Rose Avenue"
                className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1">City</label>
                <input
                  value={newProperty.city}
                  onChange={(e) => setNewProperty((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g. London"
                  className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A3F3A] block mb-1">Postcode</label>
                <input
                  value={newProperty.postcode}
                  onChange={(e) => setNewProperty((p) => ({ ...p, postcode: e.target.value }))}
                  placeholder="e.g. SW1A 1AA"
                  className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#C28A78]"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-[#EF4444]/10 text-[#EF4444] text-sm px-3 py-2 rounded-lg flex items-center gap-2">
                <i className="ri-error-warning-line text-sm"></i>
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerateNew}
              disabled={!newProperty.name || !newProperty.address || !newProperty.city || !newProperty.postcode || saving}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                newProperty.name && newProperty.address && newProperty.city && newProperty.postcode && !saving
                  ? "bg-[#C28A78] text-white hover:bg-[#B07068] cursor-pointer"
                  : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-qr-code-line"></i>
                  Generate & Save QR Code
                </>
              )}
            </button>
          </div>

          {generatedQR && (
            <div className="px-5 pb-5">
              <div className="bg-[#FBF9F4] rounded-xl p-5 text-center border border-[#D5D9D5]">
                <p className="text-xs font-medium text-[#10B981] mb-3">
                  <i className="ri-check-line mr-1"></i>
                  Property saved & QR code ready
                </p>
                <div className="bg-white inline-block p-3 rounded-xl border border-[#D5D9D5] mb-3">
                  <img
                    src={getQRImageUrl(generatedQR.id)}
                    alt={`QR for ${generatedQR.name}`}
                    className="w-40 h-40"
                    width={160}
                    height={160}
                  />
                </div>
                <p className="text-sm font-semibold text-[#3A3F3A]">{generatedQR.name}</p>
                <p className="text-xs text-[#687068] mb-3">{getPropertyLabel(generatedQR)}</p>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => handleDownload(generatedQR.id, generatedQR.name)}
                    className="px-4 py-2 text-xs font-medium border border-[#D5D9D5] rounded-lg text-[#3A3F3A] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap flex items-center gap-1.5"
                  >
                    <i className="ri-download-line text-sm"></i>
                    Download
                  </button>
                  <button
                    onClick={() => setPrintModal(generatedQR)}
                    className="px-4 py-2 text-xs font-medium bg-[#C28A78] text-white rounded-lg hover:bg-[#B07068] transition-colors whitespace-nowrap flex items-center gap-1.5"
                  >
                    <i className="ri-printer-line text-sm"></i>
                    Print
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#D5D9D5]">
            <h2 className="font-semibold text-[#3A3F3A]">All Property QR Codes</h2>
            <p className="text-xs text-[#687068] mt-0.5">Select properties to bulk print QR codes</p>
          </div>

          <div className="px-5 py-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-[#D5D9D5] rounded-lg bg-white">
              <i className="ri-search-line text-[#94A3B8] text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties..."
                className="flex-1 text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="px-5 pb-3 flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-xs text-[#C28A78] font-medium hover:underline whitespace-nowrap"
            >
              {selectedIds.size === filteredProperties.length && filteredProperties.length > 0 ? "Deselect All" : "Select All"}
            </button>
            <span className="text-xs text-[#94A3B8]">
              {filteredProperties.length} propert{filteredProperties.length !== 1 ? "ies" : "y"}
              {loading && " (loading...)"}
            </span>
          </div>

          <div className="divide-y divide-[#D5D9D5] max-h-[520px] overflow-y-auto">
            {filteredProperties.map((p) => (
              <div
                key={p.id}
                className={`px-5 py-3 flex items-center gap-3 transition-colors ${
                  selectedIds.has(p.id) ? "bg-[#C28A78]/5" : "hover:bg-[#FBF9F4]"
                }`}
              >
                <button
                  onClick={() => toggleSelect(p.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedIds.has(p.id) ? "bg-[#C28A78] border-[#C28A78]" : "border-[#D5D9D5]"
                  }`}
                >
                  {selectedIds.has(p.id) && <i className="ri-check-line text-white text-xs"></i>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3A3F3A] truncate">{p.name}</p>
                  <p className="text-xs text-[#687068] truncate">{getPropertyLabel(p)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  p.status === "Occupied" || p.status === "Active" ? "bg-[#10B981]/10 text-[#10B981]" :
                  p.status === "Available" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                  p.status === "Pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                  "bg-[#EF4444]/10 text-[#EF4444]"
                }`}>
                  {p.status}
                </span>
                <button
                  onClick={() => handleDownload(p.id, p.name)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                  title="Download QR"
                >
                  <i className="ri-download-line text-[#687068] text-sm"></i>
                </button>
                <button
                  onClick={() => setPrintModal(p)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
                  title="Print QR"
                >
                  <i className="ri-printer-line text-[#C28A78] text-sm"></i>
                </button>
              </div>
            ))}
          </div>
          {filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <i className="ri-search-line text-[#94A3B8] text-2xl"></i>
              <p className="text-sm text-[#687068] mt-2">No properties found</p>
            </div>
          )}
        </div>
      </div>

      {printModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPrintModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Print QR Code</h3>
            <p className="text-sm text-[#687068] mb-4">Place this QR code at the property for field workers to scan</p>
            <div className="bg-white inline-block p-4 rounded-xl border border-[#D5D9D5] mb-4">
              <img src={getQRImageUrl(printModal.id)} alt="QR Code" className="w-56 h-56" width={224} height={224} />
            </div>
            <p className="text-sm font-semibold text-[#3A3F3A] mb-1">{printModal.name}</p>
            <p className="text-xs text-[#687068] mb-1">{getPropertyLabel(printModal)}</p>
            <p className="text-[10px] text-[#94A3B8] mb-4">Scan with LetHub mobile app to start inspection</p>
            <div className="flex gap-2">
              <button
                onClick={() => { window.print(); setPrintModal(null); }}
                className="flex-1 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#B07068] transition-colors whitespace-nowrap"
              >
                Print Now
              </button>
              <button
                onClick={() => setPrintModal(null)}
                className="flex-1 py-2.5 border border-[#D5D9D5] text-sm font-medium rounded-lg text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkPrintMode && selectedProperties.length > 0 && (
        <div className="fixed inset-0 bg-white z-[60] overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 no-print">
              <h2 className="text-xl font-bold text-[#3A3F3A]">Bulk Print - {selectedProperties.length} QR Codes</h2>
              <button
                onClick={() => setBulkPrintMode(false)}
                className="px-4 py-2 text-sm font-medium border border-[#D5D9D5] rounded-lg text-[#687068] hover:bg-[#F1F5F9] whitespace-nowrap"
              >
                Back
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 print:grid-cols-2">
              {selectedProperties.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-[#D5D9D5] p-6 text-center break-inside-avoid">
                  <img src={getQRImageUrl(p.id)} alt={`QR for ${p.name}`} className="w-48 h-48 mx-auto mb-4" width={192} height={192} />
                  <p className="text-base font-semibold text-[#3A3F3A]">{p.name}</p>
                  <p className="text-sm text-[#687068]">{getPropertyLabel(p)}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-2">Scan with LetHub mobile app</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8 no-print">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#B07068] transition-colors whitespace-nowrap"
              >
                <i className="ri-printer-line mr-1.5"></i>
                Print All QR Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}