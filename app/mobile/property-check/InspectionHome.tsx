"use client";

import { useState, useEffect } from "react";
import { getAllDrafts, previousReports, sampleProperties, inspectionTypes, generateInspectionId } from "./data";
import type { InspectionDraft, CompletedInspection } from "./data";

interface InspectionHomeProps {
  onStartInspection: (propertyId: string, typeId: string) => void;
  onContinueDraft: (draftId: string) => void;
  onViewReport: (report: CompletedInspection) => void;
}

export default function InspectionHome({ onStartInspection, onContinueDraft, onViewReport }: InspectionHomeProps) {
  const [drafts, setDrafts] = useState<InspectionDraft[]>([]);
  const [showNewInspection, setShowNewInspection] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("routine");
  const [step, setStep] = useState<"property" | "type">("property");

  useEffect(() => {
    setDrafts(getAllDrafts());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const propId = params.get("property");
    const typeId = params.get("type");
    if (propId && typeId) {
      const found = sampleProperties.find((p) => p.id === propId);
      if (found) {
        onStartInspection(propId, typeId);
      }
    }
  }, []);

  const handleStartNew = () => {
    setShowNewInspection(true);
    setStep("property");
    setSelectedProperty(null);
    setSelectedType("routine");
  };

  const handlePropertySelect = (id: string) => {
    setSelectedProperty(id);
    setStep("type");
  };

  const handleStart = () => {
    if (!selectedProperty) return;
    onStartInspection(selectedProperty, selectedType);
    setShowNewInspection(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })} ${d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const getDraftProgress = (draft: InspectionDraft) => {
    const p = draft.progress;
    return p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#C28A78] text-white px-5 pt-3 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Property Inspection</h1>
            <p className="text-xs text-white/70 mt-0.5">Field-worker toolkit</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/mobile/qr" className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <i className="ri-qr-scan-line text-lg"></i>
            </a>
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <i className="ri-clipboard-line text-lg"></i>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            Online
          </div>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <i className="ri-map-pin-line"></i>
            GPS Ready
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3 pb-28">
        <button
          onClick={handleStartNew}
          className="w-full bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="ri-add-line text-[#10B981] text-2xl"></i>
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-semibold text-[#3A3F3A]">Start Inspection</p>
            <p className="text-xs text-[#687068] mt-0.5">Begin a new property walkthrough</p>
          </div>
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-arrow-right-s-line text-[#94A3B8] text-xl"></i>
          </div>
        </button>

        {drafts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Continue Draft</p>
            <div className="space-y-2">
              {drafts.map((draft) => {
                const pct = getDraftProgress(draft);
                return (
                  <button
                    key={draft.id}
                    onClick={() => onContinueDraft(draft.id)}
                    className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
                  >
                    <div className="w-11 h-11 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="ri-time-line text-[#F59E0B] text-lg"></i>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-[#3A3F3A] truncate">{draft.propertyName}</p>
                      <p className="text-xs text-[#687068] truncate">{draft.type} · {draft.rooms.length} rooms</p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">Last saved {formatDate(draft.lastSavedAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="w-14 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F59E0B] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-medium text-[#F59E0B]">{pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider px-1 mb-2">Previous Reports</p>
          <div className="space-y-2">
            {previousReports.map((report) => (
              <button
                key={report.id}
                onClick={() => onViewReport(report)}
                className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  report.rating === "Excellent" ? "bg-[#10B981]/10" :
                  report.rating === "Good" ? "bg-[#3B82F6]/10" :
                  "bg-[#F59E0B]/10"
                }`}>
                  <i className={`${
                    report.rating === "Excellent" ? "ri-star-fill text-[#10B981]" :
                    report.rating === "Good" ? "ri-star-fill text-[#3B82F6]" :
                    "ri-star-half-line text-[#F59E0B]"
                  } text-lg`}></i>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-[#3A3F3A] truncate">{report.propertyName}</p>
                  <p className="text-xs text-[#687068]">{report.type} · {report.date}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{report.rooms} rooms · {report.issues} issues · {report.inspector}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${
                  report.rating === "Excellent" ? "bg-[#10B981]/10 text-[#10B981]" :
                  report.rating === "Good" ? "bg-[#3B82F6]/10 text-[#3B82F6]" :
                  "bg-[#F59E0B]/10 text-[#F59E0B]"
                }`}>{report.rating}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showNewInspection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-bold text-[#3A3F3A]">
                {step === "property" ? "Select Property" : "Inspection Type"}
              </h2>
              <button
                onClick={() => setShowNewInspection(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F5F9]"
              >
                <i className="ri-close-line text-[#687068] text-lg"></i>
              </button>
            </div>

            {step === "property" ? (
              <div className="px-5 pb-6 space-y-2">
                {sampleProperties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => handlePropertySelect(prop.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      selectedProperty === prop.id
                        ? "border-[#C28A78] bg-[#C28A78]/5"
                        : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#3A3F3A]">{prop.name}</p>
                    <p className="text-xs text-[#687068] mt-0.5">{prop.address}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-1">Tenant: {prop.tenant} · Landlord: {prop.landlord}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 pb-6 space-y-2">
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
                  onClick={handleStart}
                  disabled={!selectedProperty}
                  className={`w-full py-4 rounded-xl text-sm font-medium mt-4 transition-colors whitespace-nowrap ${
                    selectedProperty
                      ? "bg-[#C28A78] text-white active:bg-[#143329]"
                      : "bg-[#F1F5F9] text-[#94A3B8]"
                  }`}
                >
                  <i className="ri-play-line mr-1.5"></i>
                  Start Inspection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}