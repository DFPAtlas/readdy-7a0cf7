"use client";

import { useState } from "react";
import type { PreviewProperty } from "@/app/dashboard/import/ImportData";
import type { ValidationFilter } from "@/lib/importSystem";
import ImportCorrectionDrawer from "./ImportCorrectionDrawer";

interface Props {
  previews: PreviewProperty[];
  onBack: () => void;
  onContinue: () => void;
}

export default function ImportValidationTable({ previews, onBack, onContinue }: Props) {
  const [filter, setFilter] = useState<ValidationFilter>("all");
  const [selectedRow, setSelectedRow] = useState<PreviewProperty | null>(null);

  const errorCount = previews.filter((p) => p.validationErrors.length > 0).length;
  const warningCount = previews.filter((p) => p.validationWarnings.length > 0 && p.validationErrors.length === 0).length;
  const duplicateCount = previews.filter((p) => p.isDuplicate).length;
  const validCount = previews.filter((p) => p.validationErrors.length === 0 && !p.isDuplicate).length;

  const filtered = previews.filter((p) => {
    if (filter === "errors") return p.validationErrors.length > 0;
    if (filter === "warnings") return p.validationWarnings.length > 0 && p.validationErrors.length === 0;
    if (filter === "duplicates") return p.isDuplicate;
    if (filter === "ready") return p.validationErrors.length === 0 && !p.isDuplicate;
    return true;
  });

  const filters: { id: ValidationFilter; label: string; count: number; color: string }[] = [
    { id: "all", label: "All", count: previews.length, color: "bg-[#C28A78]" },
    { id: "ready", label: "Ready", count: validCount, color: "bg-[#10B981]" },
    { id: "warnings", label: "Warnings", count: warningCount, color: "bg-[#F59E0B]" },
    { id: "errors", label: "Errors", count: errorCount, color: "bg-[#EF4444]" },
    { id: "duplicates", label: "Duplicates", count: duplicateCount, color: "bg-[#F59E0B]" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`bg-white rounded-xl border p-4 text-left transition-colors ${
              filter === f.id ? "border-[#C28A78] shadow-md" : "border-[#E2E8F0] hover:shadow-sm"
            }`}
          >
            <div className={`w-2 h-2 ${f.color} rounded-full mb-2`}></div>
            <p className="text-xl font-bold text-[#3A3F3A]">{f.count}</p>
            <p className="text-xs text-[#687068]">{f.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left px-4 py-3 font-medium text-[#687068]">#</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Address</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">City</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Postcode</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Type</th>
                <th className="text-left px-4 py-3 font-medium text-[#687068]">Landlord</th>
                <th className="text-center px-4 py-3 font-medium text-[#687068]">Status</th>
                <th className="text-center px-4 py-3 font-medium text-[#687068]">Issues</th>
                <th className="text-right px-4 py-3 font-medium text-[#687068]">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((p, index) => (
                <tr
                  key={p.id}
                  className={`hover:bg-[#F8FAFC] transition-colors ${
                    p.isDuplicate ? "bg-[#F59E0B]/5" : p.validationErrors.length > 0 ? "bg-[#EF4444]/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-[#94A3B8] text-xs">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#3A3F3A]">{p.address || "—"}</p>
                    {p.isDuplicate && (
                      <p className="text-xs text-[#F59E0B] mt-0.5">
                        <i className="ri-file-copy-line mr-1"></i>{p.duplicateOf}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#687068]">{p.city || "—"}</td>
                  <td className="px-4 py-3 text-[#687068]">{p.postcode || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#687068] bg-[#F1F5F9] px-2 py-0.5 rounded-full">{p.propertyType || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-[#3A3F3A]">{p.landlord || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        p.status === "Occupied"
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : p.status === "Available"
                          ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                          : "bg-[#94A3B8]/10 text-[#94A3B8]"
                      }`}
                    >
                      {p.status || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.validationErrors.length > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444]">
                        {p.validationErrors.length} error{p.validationErrors.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {p.validationWarnings.length > 0 && p.validationErrors.length === 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">
                        {p.validationWarnings.length} warning{p.validationWarnings.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {p.validationErrors.length === 0 && p.validationWarnings.length === 0 && !p.isDuplicate && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                        <i className="ri-check-line mr-1"></i>OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedRow(p)}
                      className="text-xs text-[#C28A78] font-medium px-2 py-1 rounded hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-line text-[#94A3B8] text-xl"></i>
            </div>
            <p className="text-sm text-[#94A3B8]">No records match this filter</p>
          </div>
        )}
        <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-[#687068]">
            Showing {filtered.length} of {previews.length} records
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
            >
              Back
            </button>
            <button
              onClick={onContinue}
              disabled={validCount === 0}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                validCount > 0
                  ? "bg-[#C28A78] text-white hover:bg-[#143828]"
                  : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              Review changes ({validCount} ready)
            </button>
          </div>
        </div>
      </div>

      {selectedRow && (
        <ImportCorrectionDrawer
          property={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
}