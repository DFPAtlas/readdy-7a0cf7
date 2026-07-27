"use client";

import { useState } from "react";
import MobileBottomNav from "@/components/MobileBottomNav";
import InspectionHome from "./InspectionHome";
import InspectionFlow from "./InspectionFlow";
import type { CompletedInspection } from "./data";

type Screen =
  | { name: "home" }
  | { name: "inspection"; draftId?: string; propertyId?: string; typeId?: string }
  | { name: "report"; report: CompletedInspection };

export default function PropertyCheckPage() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {screen.name === "home" && (
        <InspectionHome
          onStartInspection={(propId, typeId) =>
            setScreen({ name: "inspection", propertyId: propId, typeId })
          }
          onContinueDraft={(draftId) =>
            setScreen({ name: "inspection", draftId })
          }
          onViewReport={(report) =>
            setScreen({ name: "report", report })
          }
        />
      )}

      {screen.name === "inspection" && (
        <InspectionFlow
          draftId={"draftId" in screen ? screen.draftId : null}
          propertyId={"propertyId" in screen ? screen.propertyId : undefined}
          typeId={"typeId" in screen ? screen.typeId : undefined}
          onBack={() => setScreen({ name: "home" })}
          onComplete={() => setScreen({ name: "home" })}
        />
      )}

      {screen.name === "report" && "report" in screen && (
        <ReportViewer report={screen.report} onBack={() => setScreen({ name: "home" })} />
      )}

      <MobileBottomNav />
    </div>
  );
}

function ReportViewer({ report, onBack }: { report: CompletedInspection; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#C28A78] text-white px-4 pt-3 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
            <i className="ri-arrow-left-line text-white text-lg"></i>
          </button>
          <h1 className="text-lg font-bold">Report Details</h1>
        </div>

        <div className="mt-3 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
            report.rating === "Excellent" ? "bg-[#10B981]/20" :
            report.rating === "Good" ? "bg-[#3B82F6]/20" :
            "bg-[#F59E0B]/20"
          }`}>
            <i className={`${
              report.rating === "Excellent" ? "ri-star-fill text-[#10B981]" :
              report.rating === "Good" ? "ri-star-fill text-[#3B82F6]" :
              "ri-star-half-line text-[#F59E0B]"
            } text-2xl`}></i>
          </div>
          <span className={`text-lg font-bold ${
            report.rating === "Excellent" ? "text-[#10B981]" :
            report.rating === "Good" ? "text-[#3B82F6]" :
            "text-[#F59E0B]"
          }`}>{report.rating}</span>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-base font-bold text-[#3A3F3A] mb-4">{report.propertyName}</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#687068]">Address</span>
              <span className="text-xs font-medium text-[#3A3F3A] text-right max-w-[60%]">{report.propertyAddress}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#687068]">Type</span>
              <span className="text-xs font-medium text-[#3A3F3A]">{report.type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#687068]">Date</span>
              <span className="text-xs font-medium text-[#3A3F3A]">{report.date}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#687068]">Inspector</span>
              <span className="text-xs font-medium text-[#3A3F3A]">{report.inspector}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#687068]">Tenant</span>
              <span className="text-xs font-medium text-[#3A3F3A]">{report.tenant}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
              <span className="text-xs text-[#687068]">Rooms Inspected</span>
              <span className="text-xs font-medium text-[#3A3F3A]">{report.rooms}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-[#687068]">Issues Found</span>
              <span className={`text-xs font-medium ${report.issues > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                {report.issues === 0 ? "None" : report.issues}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-xs text-[#94A3B8] mb-3">Full report with photos and voice notes available in the dashboard</p>
          <button
            className="px-6 py-3 bg-[#C28A78] text-white rounded-xl text-sm font-medium whitespace-nowrap"
          >
            <i className="ri-download-line mr-1.5"></i>
            Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}