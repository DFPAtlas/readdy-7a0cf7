"use client";

import type { ImportFileState } from "@/lib/importSystem";

interface Props {
  file: ImportFileState;
  onContinue: () => void;
  onReplace: () => void;
  onCancel: () => void;
}

export default function ImportFilePreview({ file, onContinue, onReplace, onCancel }: Props) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
              <i className="ri-file-text-line text-[#10B981] text-lg"></i>
            </div>
            <div>
              <h3 className="font-semibold text-[#3A3F3A]">{file.name}</h3>
              <p className="text-xs text-[#94A3B8]">{formatSize(file.size)}</p>
            </div>
          </div>
          <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full font-medium">
            File ready
          </span>
        </div>
        {file.sheetName && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-[#687068]">Sheet:</span>
            <span className="font-medium text-[#3A3F3A]">{file.sheetName}</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-[#3A3F3A]">{file.rows}</p>
            <p className="text-xs text-[#687068]">Rows</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-[#3A3F3A]">{file.columns}</p>
            <p className="text-xs text-[#687068]">Columns</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-[#3A3F3A]">{file.headers.length}</p>
            <p className="text-xs text-[#687068]">Headers</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-[#687068] mb-2">Detected headers</p>
          <div className="flex flex-wrap gap-1.5">
            {file.headers.map((h) => (
              <span key={h} className="text-xs text-[#3A3F3A] bg-[#F1F5F9] px-2 py-1 rounded-lg">
                {h}
              </span>
            ))}
          </div>
        </div>
        {file.sampleRows.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-[#687068] mb-2">Sample rows (first {file.sampleRows.length})</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {file.headers.slice(0, 5).map((h) => (
                      <th key={h} className="text-left px-2 py-1.5 font-medium text-[#94A3B8] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {file.sampleRows.map((row, ri) => (
                    <tr key={ri}>
                      {row.slice(0, 5).map((cell, ci) => (
                        <td key={ci} className="px-2 py-1.5 text-[#687068] whitespace-nowrap">{cell || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={onReplace}
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
          >
            Replace file
          </button>
        </div>
        <button
          onClick={onContinue}
          className="px-5 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap"
        >
          Continue to mapping
        </button>
      </div>
    </div>
  );
}