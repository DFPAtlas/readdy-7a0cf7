"use client";

import type { ImportFailedRow } from "@/app/dashboard/import/ImportData";

interface Props {
  importedCount: number;
  failedCount: number;
  duplicateCount: number;
  failedRows: ImportFailedRow[];
  dbAvailable: boolean;
  onStartNew: () => void;
  onReprocess: () => void;
  onViewHistory: () => void;
}

export default function ImportResults({
  importedCount,
  failedCount,
  duplicateCount,
  failedRows,
  dbAvailable,
  onStartNew,
  onReprocess,
  onViewHistory,
}: Props) {
  const hasIssues = failedCount > 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${hasIssues ? "bg-[#F59E0B]/10" : "bg-[#10B981]/10"}`}>
          <i className={`${hasIssues ? "ri-error-warning-line text-[#F59E0B]" : "ri-check-line text-[#10B981]"} text-2xl`}></i>
        </div>
        <h3 className="text-lg font-semibold text-[#3A3F3A] mb-2">
          {hasIssues ? "Import complete with issues" : "Import complete"}
        </h3>
        <p className="text-sm text-[#94A3B8] mb-6">
          {dbAvailable
            ? "Records have been written to the database. Review the summary below."
            : "Import processed. Connect your database to write records permanently."}
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          <div className="bg-[#F8FAFC] rounded-lg p-4">
            <p className="text-2xl font-bold text-[#10B981]">{importedCount}</p>
            <p className="text-xs text-[#687068]">Imported</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-4">
            <p className="text-2xl font-bold text-[#EF4444]">{failedCount}</p>
            <p className="text-xs text-[#687068]">Failed</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-lg p-4">
            <p className="text-2xl font-bold text-[#F59E0B]">{duplicateCount}</p>
            <p className="text-xs text-[#687068]">Duplicates</p>
          </div>
        </div>

        {failedRows.length > 0 && (
          <div className="max-w-lg mx-auto mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-error-warning-line text-[#EF4444] text-sm"></i>
              </div>
              <p className="text-sm font-medium text-[#3A3F3A]">Failed rows ({failedRows.length})</p>
            </div>
            <div className="bg-[#FEF2F2] rounded-lg border border-[#FECACA] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#FECACA]">
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#EF4444]">Row</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#EF4444]">Record</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-[#EF4444]">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FECACA]">
                  {failedRows.map((fr, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-xs text-[#991B1B]">{fr.row}</td>
                      <td className="px-4 py-2 text-xs text-[#991B1B]">{fr.address}</td>
                      <td className="px-4 py-2 text-xs text-[#B91C1C]">{fr.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onStartNew}
            className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#687068] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
          >
            Import another file
          </button>
          {failedCount > 0 && (
            <button
              onClick={onReprocess}
              className="px-5 py-2.5 bg-[#F59E0B] text-white rounded-lg text-sm font-medium hover:bg-[#D97706] transition-colors whitespace-nowrap"
            >
              Correct and re-import
            </button>
          )}
          <button
            onClick={onViewHistory}
            className="px-5 py-2.5 bg-[#C28A78] text-white rounded-lg text-sm font-medium hover:bg-[#143828] transition-colors whitespace-nowrap"
          >
            View history
          </button>
        </div>
      </div>

      {!dbAvailable && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 text-center">
          <p className="text-sm text-[#B91C1C]">
            Database connection not detected. Records were processed in preview mode and not saved.
          </p>
        </div>
      )}
    </div>
  );
}