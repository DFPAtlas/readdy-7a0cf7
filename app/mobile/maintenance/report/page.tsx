"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/MobileBottomNav";

const issueTypes = ["Plumbing", "Electrical", "Heating", "Appliance", "Structural", "Security", "Damp", "Other"];

const priorities = ["Low", "Medium", "High", "Emergency"];

const properties = [
  { id: 1, name: "45 Baker Street", tenant: "John Miller" },
  { id: 2, name: "12 Rose Avenue", tenant: "David Thompson" },
  { id: 3, name: "8 The Crescent", tenant: "Sarah Jenkins" },
  { id: 4, name: "Flat 4B Oak Street", tenant: "Emily Carter" },
  { id: 5, name: "Flat 2A Park View", tenant: "Michael Brown" },
];

export default function MobileMaintenanceReportPage() {
  const [showCamera, setShowCamera] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState("Plumbing");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [selectedProperty, setSelectedProperty] = useState(properties[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  const handleCapturePhoto = () => {
    setPhotos([...photos, `https://readdy.ai/api/search-image?query=captured%20maintenance%20issue%20photo%20with%20closeup%20detail%20of%20plumbing%20leak%20or%20electrical%20fault%20showing%20real%20damage%20for%20property%20inspection%20report&width=400&height=400&seq=${Date.now()}&orientation=squarish`]);
    setShowCamera(false);
  };

  const handleSubmit = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-[#C28A78] text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <a href="/mobile/maintenance" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <i className="ri-arrow-left-line text-white"></i>
          </a>
          <h1 className="text-xl font-bold">Report Issue</h1>
        </div>
        <p className="text-xs text-white/70">Complete the form to report a maintenance issue</p>
      </div>

      {/* Form */}
      <div className="px-4 -mt-3 space-y-4 mb-6">
        {/* Property */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="text-xs font-medium text-[#687068] mb-2 block">Property</label>
          <button
            onClick={() => setShowPropertyPicker(true)}
            className="w-full flex items-center justify-between px-3 py-3 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]"
          >
            <div className="text-left">
              <p className="text-sm text-[#3A3F3A]">{selectedProperty.name}</p>
              <p className="text-xs text-[#687068]">{selectedProperty.tenant}</p>
            </div>
            <i className="ri-arrow-down-s-line text-[#94A3B8]"></i>
          </button>
        </div>

        {/* Issue Type */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="text-xs font-medium text-[#687068] mb-2 block">Issue Type</label>
          <div className="flex flex-wrap gap-2">
            {issueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedIssueType(type)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedIssueType === type
                    ? "bg-[#C28A78] text-white"
                    : "bg-[#F8FAFC] text-[#687068] border border-[#E2E8F0]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="text-xs font-medium text-[#687068] mb-2 block">Priority</label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedPriority === p
                    ? p === "Emergency"
                      ? "bg-[#EF4444] text-white"
                      : p === "High"
                      ? "bg-[#F59E0B] text-white"
                      : p === "Medium"
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[#10B981] text-white"
                    : "bg-[#F8FAFC] text-[#687068] border border-[#E2E8F0]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="text-xs font-medium text-[#687068] mb-2 block">Issue Title</label>
          <input
            type="text"
            placeholder="e.g. Leaking tap in kitchen"
            className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78]"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="text-xs font-medium text-[#687068] mb-2 block">Description</label>
          <textarea
            placeholder="Describe the issue in detail..."
            rows={4}
            className="w-full px-3 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#3A3F3A] bg-[#F8FAFC] focus:outline-none focus:border-[#C28A78] resize-none"
          ></textarea>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="text-xs font-medium text-[#687068] mb-2 block">Photos ({photos.length}/5)</label>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden relative">
                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <i className="ri-close-line text-white text-xs"></i>
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={() => setShowCamera(true)}
                className="aspect-square bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-1"
              >
                <i className="ri-camera-line text-[#94A3B8] text-xl"></i>
                <span className="text-[10px] text-[#94A3B8]">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-4 text-sm font-medium text-white bg-[#C28A78] rounded-xl shadow-lg"
        >
          <i className="ri-send-plane-line mr-1"></i>
          Submit Report
        </button>
      </div>

      {/* Property Picker Modal */}
      {showPropertyPicker && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowPropertyPicker(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4"></div>
            <h3 className="font-bold text-[#3A3F3A] mb-4">Select Property</h3>
            <div className="space-y-2">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setSelectedProperty(prop);
                    setShowPropertyPicker(false);
                  }}
                  className="w-full text-left p-3 bg-[#F8FAFC] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#3A3F3A]">{prop.name}</p>
                    <p className="text-xs text-[#687068]">{prop.tenant}</p>
                  </div>
                  {selectedProperty.id === prop.id && (
                    <i className="ri-check-line text-[#C28A78]"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setShowCamera(false)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <i className="ri-close-line text-white text-lg"></i>
            </button>
            <p className="text-white font-medium">Take Photo</p>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center gap-3">
              <i className="ri-camera-line text-white/50 text-4xl"></i>
              <p className="text-sm text-white/70 text-center">Tap shutter to capture<br/>maintenance issue</p>
            </div>
          </div>
          <div className="p-6 flex justify-center gap-4">
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <i className="ri-image-line text-white text-xl"></i>
            </button>
            <button
              onClick={handleCapturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-white/30 flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-[#C28A78] rounded-full"></div>
            </button>
            <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <i className="ri-flashlight-line text-white text-xl"></i>
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#10B981] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <i className="ri-checkbox-circle-line text-lg"></i>
          <p className="text-sm font-medium">Issue reported successfully!</p>
        </div>
      )}
    </MobileLayout>
  );
}