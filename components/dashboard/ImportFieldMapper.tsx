"use client";

import type { FieldMapping } from "@/app/dashboard/import/ImportData";
import { availableFields } from "@/app/dashboard/import/ImportData";

interface Props {
  mappings: FieldMapping[];
  onMappingChange: (sourceField: string, targetField: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ImportFieldMapper({ mappings, onMappingChange, onConfirm, onBack }: Props) {
  const autoCount = mappings.filter((f) => f.autoMapped && f.confidence > 85).length;
  const reviewCount = mappings.filter((f) => f.autoMapped && f.confidence <= 85).length;
  const unmappedCount = mappings.filter((f) => !f.autoMapped).length;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Field Mapping</h2>
              <p className="text-xs text-[#687068] mt-0.5">
                Auto-mapped {autoCount} of {mappings.length} fields
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full font-medium">
                {autoCount} auto
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full font-medium">
                  {reviewCount} to review
                </span>
              )}
              {unmappedCount > 0 && (
                <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium">
                  {unmappedCount} unmapped
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="text-left px-5 py-3 font-medium text-[#687068]">Source Field</th>
                <th className="text-left px-5 py-3 font-medium text-[#687068]">Sample Value</th>
                <th className="text-left px-5 py-3 font-medium text-[#687068]">Maps To</th>
                <th className="text-center px-5 py-3 font-medium text-[#687068]">Confidence</th>
                <th className="text-center px-5 py-3 font-medium text-[#687068]">Required</th>
                <th className="text-center px-5 py-3 font-medium text-[#687068]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {mappings.map((field) => (
                <tr key={field.sourceField} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#3A3F3A]">{field.sourceField}</td>
                  <td className="px-5 py-3 text-[#94A3B8] text-xs">e.g. sample_value</td>
                  <td className="px-5 py-3">
                    <select
                      value={field.targetField}
                      onChange={(e) => onMappingChange(field.sourceField, e.target.value)}
                      className="text-sm text-[#3A3F3A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 outline-none pr-8"
                    >
                      <option value={field.targetField}>{field.targetField}</option>
                      {availableFields.filter((f) => f !== field.targetField).map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                      <option value="">— Ignore —</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-14 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${field.confidence}%`,
                            backgroundColor: field.confidence > 85 ? "#10B981" : "#F59E0B",
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-[#687068]">{field.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        field.required ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F1F5F9] text-[#94A3B8]"
                      }`}
                    >
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        field.autoMapped && field.confidence > 85
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : field.autoMapped
                          ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                          : "bg-[#94A3B8]/10 text-[#94A3B8]"
                      }`}
                    >
                      {field.autoMapped && field.confidence > 85 ? "Auto" : field.autoMapped ? "Review" : "Unmapped"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#687068]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
              {autoCount} auto-mapped
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#F59E0B] rounded-full"></span>
              {reviewCount} needs review
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#94A3B8] rounded-full"></span>
              {unmappedCount} unmapped
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
            >
              Back
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap"
            >
              Confirm Mapping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}