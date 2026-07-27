"use client";

import { useState } from "react";

interface PropertyQRCodeProps {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
}

export default function PropertyQRCode({ propertyId, propertyName, propertyAddress }: PropertyQRCodeProps) {
  const [showPrint, setShowPrint] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${baseUrl}/mobile/qr?property=${propertyId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `qr-${propertyId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setShowPrint(true);
  };

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] p-5 text-center">
      <h3 className="text-sm font-semibold text-[#3A3F3A] mb-1">Property QR Code</h3>
      <p className="text-xs text-[#687068] mb-4">Scan to start a property inspection on mobile</p>

      <div className="bg-white inline-block p-3 rounded-xl border border-[#D5D9D5] mb-3">
        <img
          src={qrImageUrl}
          alt={`QR Code for ${propertyName}`}
          className="w-48 h-48"
          width={192}
          height={192}
        />
      </div>

      <p className="text-xs font-medium text-[#3A3F3A] mb-1">{propertyName}</p>
      <p className="text-xs text-[#687068] mb-4">{propertyAddress}</p>

      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-xs font-medium border border-[#D5D9D5] rounded-lg text-[#3A3F3A] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <i className="ri-download-line text-sm"></i>
          Download
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-medium bg-[#C28A78] text-white rounded-lg hover:bg-[#B07068] transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <i className="ri-printer-line text-sm"></i>
          Print
        </button>
      </div>

      <p className="text-[10px] text-[#94A3B8] mt-3">
        QR links to mobile inspection for this property
      </p>

      {showPrint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPrint(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">Print QR Code</h3>
            <p className="text-sm text-[#687068] mb-4">Place this QR code at the property for field workers to scan</p>
            <div className="bg-white inline-block p-4 rounded-xl border border-[#D5D9D5] mb-4">
              <img src={qrImageUrl} alt="QR Code" className="w-56 h-56" width={224} height={224} />
            </div>
            <p className="text-sm font-semibold text-[#3A3F3A] mb-1">{propertyName}</p>
            <p className="text-xs text-[#687068] mb-1">{propertyAddress}</p>
            <p className="text-[10px] text-[#94A3B8] mb-4">Scan with LetHub mobile app</p>
            <div className="flex gap-2">
              <button
                onClick={() => { window.print(); setShowPrint(false); }}
                className="flex-1 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#B07068] transition-colors whitespace-nowrap"
              >
                Print Now
              </button>
              <button
                onClick={() => setShowPrint(false)}
                className="flex-1 py-2.5 border border-[#D5D9D5] text-sm font-medium rounded-lg text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}