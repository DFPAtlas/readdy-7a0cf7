"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";
import { sampleProperties, inspectionTypes } from "../property-check/data";

const scanHistory = [
  { id: 1, type: "Property", data: "45 Baker Street", action: "View Details" },
  { id: 2, type: "Job", data: "Boiler repair - 12 Rose Avenue", action: "Open Job" },
  { id: 3, type: "Inspection", data: "Routine inspection - Flat 4B", action: "Start Inspection" },
];

export default function MobileQRPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<typeof scanHistory[0] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [urlPropertyId, setUrlPropertyId] = useState<string | null>(null);
  const [urlProperty, setUrlProperty] = useState<typeof sampleProperties[0] | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [selectedType, setSelectedType] = useState("routine");
  const [deepLinked, setDeepLinked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const propId = params.get("property");
    if (propId) {
      let found = sampleProperties.find((p) => p.id === propId);
      if (!found) {
        const dashboardToMobile: Record<string, string> = {
          "1": "prop-001",
          "2": "prop-002",
          "3": "prop-003",
          "4": "prop-004",
          "5": "prop-005",
          "6": "prop-004",
          "7": "prop-003",
          "8": "prop-002",
          "9": "prop-001",
          "10": "prop-005",
        };
        const mappedId = dashboardToMobile[propId];
        if (mappedId) {
          found = sampleProperties.find((p) => p.id === mappedId);
        }
      }
      if (found) {
        setUrlPropertyId(propId);
        setUrlProperty(found);
        setIsScanning(false);
        setDeepLinked(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isScanning && !deepLinked) {
      const timer = setTimeout(() => {
        setScanResult(scanHistory[0]);
        setIsScanning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isScanning, deepLinked]);

  const handleStartInspection = () => {
    setShowTypePicker(true);
  };

  const handleConfirmType = () => {
    setShowTypePicker(false);
    if (urlPropertyId) {
      window.location.href = `/mobile/property-check?property=${urlPropertyId}&type=${selectedType}`;
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setUrlPropertyId(null);
    setUrlProperty(null);
    setDeepLinked(false);
    setIsScanning(true);
  };

  return (
    <MobileLayout>
      <div className="fixed inset-0 bg-black z-40 flex flex-col">
        <div className="flex items-center justify-between p-4">
          <a href="/mobile" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <i className="ri-arrow-left-line text-white text-lg"></i>
          </a>
          <p className="text-white font-medium">QR Scanner</p>
          <button onClick={() => setShowHistory(true)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <i className="ri-history-line text-white text-lg"></i>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm aspect-square relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#C28A78] rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#C28A78] rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#C28A78] rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#C28A78] rounded-br-lg"></div>

            {isScanning && !deepLinked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#10B981] animate-bounce"></div>
              </div>
            )}

            {urlProperty && !isScanning && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-6 w-full">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-home-4-line text-[#10B981] text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#3A3F3A] text-center mb-1">{urlProperty.name}</h3>
                  <p className="text-sm text-[#687068] text-center mb-1">{urlProperty.address}</p>
                  <p className="text-xs text-[#94A3B8] text-center mb-4">Tenant: {urlProperty.tenant} · Landlord: {urlProperty.landlord}</p>

                  <div className="space-y-2">
                    <button
                      onClick={handleStartInspection}
                      className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap"
                    >
                      <i className="ri-clipboard-line mr-1"></i>
                      Start Inspection
                    </button>
                    <button
                      onClick={handleRescan}
                      className="w-full py-3 text-sm font-medium text-[#687068] whitespace-nowrap"
                    >
                      Scan Another Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scanResult && !isScanning && !urlProperty && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-6 w-full text-center">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-[#10B981] text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#3A3F3A] mb-1">{scanResult.type} Found</h3>
                  <p className="text-sm text-[#687068] mb-4">{scanResult.data}</p>
                  <button className="w-full py-3 text-sm font-medium text-white bg-[#C28A78] rounded-xl whitespace-nowrap">
                    {scanResult.action}
                  </button>
                  <button
                    onClick={handleRescan}
                    className="w-full py-3 mt-2 text-sm font-medium text-[#687068] whitespace-nowrap"
                  >
                    Scan Again
                  </button>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-sm text-white/70">Align QR code within frame</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 flex justify-center gap-4">
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${flashOn ? "bg-[#F59E0B]" : "bg-white/10"}`}
          >
            <i className="ri-flashlight-line text-white text-xl"></i>
          </button>
          <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            <i className="ri-image-line text-white text-xl"></i>
          </button>
          <button className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
            <i className="ri-qr-code-line text-white text-xl"></i>
          </button>
        </div>
      </div>

      {showTypePicker && urlProperty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-bold text-[#3A3F3A]">Select Inspection Type</h2>
              <button
                onClick={() => setShowTypePicker(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F5F9]"
              >
                <i className="ri-close-line text-[#687068] text-lg"></i>
              </button>
            </div>
            <div className="px-5 pb-6 space-y-2">
              <p className="text-xs text-[#687068] mb-2">Property: {urlProperty.name}</p>
              {inspectionTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                    selectedType === t.id
                      ? "border-[#C28A78] bg-[#C28A78]/5"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedType === t.id ? "bg-[#C28A78] text-white" : "bg-[#F1F5F9] text-[#687068]"
                  }`}>
                    <i className={`${t.icon} text-lg`}></i>
                  </div>
                  <span className="text-sm font-medium text-[#3A3F3A]">{t.label}</span>
                </button>
              ))}
              <button
                onClick={handleConfirmType}
                className="w-full py-4 rounded-xl text-sm font-medium mt-4 transition-colors bg-[#C28A78] text-white whitespace-nowrap"
              >
                <i className="ri-play-line mr-1.5"></i>
                Start Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowHistory(false)}>
          <div className="bg-white rounded-t-2xl p-4 w-full max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#3A3F3A]">Scan History</h3>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 flex items-center justify-center">
                <i className="ri-close-line text-[#94A3B8]"></i>
              </button>
            </div>
            <div className="space-y-2">
              {scanHistory.map((result) => (
                <div key={result.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl">
                  <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-qr-code-line text-[#C28A78]"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#3A3F3A]">{result.type}</p>
                    <p className="text-xs text-[#687068]">{result.data}</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-[#94A3B8]"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}