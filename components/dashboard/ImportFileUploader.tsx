"use client";

import { useState } from "react";
import { MAX_FILE_SIZE } from "@/lib/importSystem";

interface Props {
  importTypeLabel: string;
  acceptFormats: string[];
  onFileProcessed: (file: File) => void;
  onBack: () => void;
}

type ValidationError = { field: string; message: string };

export default function ImportFileUploader({ importTypeLabel, acceptFormats, onFileProcessed, onBack }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);
  const fileInputId = "import-file-input";

  const validate = (file: File): ValidationError | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptFormats.includes(ext)) {
      return { field: "format", message: `Unsupported file format. Accepted: ${acceptFormats.join(", ")}` };
    }
    if (file.size === 0) {
      return { field: "size", message: "The file appears to be empty" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { field: "size", message: `File exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB maximum size` };
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileProcessed(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const acceptStr = acceptFormats.join(",");

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-[#C28A78] bg-[#C28A78]/5" : "border-[#E2E8F0]"
        }`}
      >
        <div className="w-16 h-16 bg-[#C28A78]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i className="ri-upload-cloud-line text-[#C28A78] text-2xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-[#3A3F3A] mb-1">
          Upload your {importTypeLabel} file
        </h3>
        <p className="text-sm text-[#94A3B8] mb-6">
          Drag and drop or click to browse. Up to 50MB.
        </p>
        <label
          htmlFor={fileInputId}
          className="inline-block bg-[#C28A78] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#143828] transition-colors cursor-pointer whitespace-nowrap"
        >
          Choose File
        </label>
        <input
          id={fileInputId}
          type="file"
          accept={acceptStr}
          onChange={handleChange}
          className="hidden"
        />
        <p className="text-xs text-[#94A3B8] mt-4">
          Accepted formats: {acceptFormats.join(", ")}
        </p>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-error-warning-line text-[#EF4444]"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-[#991B1B]">File validation failed</p>
            <p className="text-sm text-[#B91C1C] mt-0.5">{error.message}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
        >
          Back
        </button>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); }}
          className="text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap flex items-center gap-1"
        >
          <i className="ri-download-line"></i>
          Download template
        </a>
      </div>
    </div>
  );
}