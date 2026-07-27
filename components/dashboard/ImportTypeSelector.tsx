"use client";

import { importTypes, type ImportType } from "@/lib/importSystem";

interface Props {
  onSelect: (type: ImportType) => void;
}

export default function ImportTypeSelector({ onSelect }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-[#3A3F3A] mb-1">What would you like to import?</h2>
        <p className="text-sm text-[#687068]">Select the type of data you want to bring into LetHub</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {importTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => type.available && onSelect(type)}
            disabled={!type.available}
            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
              type.available
                ? "border-[#E2E8F0] hover:border-[#C28A78]/30 hover:shadow-md cursor-pointer"
                : "border-[#E2E8F0] bg-[#F8FAFC] cursor-not-allowed opacity-60"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${type.available ? "bg-[#C28A78]/10" : "bg-[#E2E8F0]"}`}>
              <i className={`${type.icon} ${type.available ? "text-[#C28A78]" : "text-[#94A3B8]"} text-lg`}></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#3A3F3A]">{type.label}</p>
                {!type.available && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#94A3B8] whitespace-nowrap">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2">{type.description}</p>
              <div className="flex items-center gap-1 mt-2">
                {type.supportedFormats.map((fmt) => (
                  <span key={fmt} className="text-[10px] text-[#687068] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                    {fmt}
                  </span>
                ))}
                {type.requiresTemplate && (
                  <span className="text-[10px] text-[#C28A78] bg-[#C28A78]/10 px-1.5 py-0.5 rounded ml-auto">
                    Template available
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}