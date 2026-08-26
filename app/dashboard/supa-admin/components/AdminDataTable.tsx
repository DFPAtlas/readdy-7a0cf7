"use client";

import { useState } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export default function AdminDataTable({
  columns,
  rows,
  searchPlaceholder,
  emptyMessage,
  onRowClick,
  onExport,
}: {
  columns: Column[];
  rows: any[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  onExport?: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? rows.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows;

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-2 border border-[#1E293B] rounded-lg bg-[#111827] flex-1 max-w-sm">
          <i className="ri-search-line text-[#64748B] text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder || "Search..."}
            className="flex-1 text-sm text-[#E2E8F0] placeholder:text-[#64748B] outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="text-xs text-[#94A3B8] font-medium px-3 py-2 border border-[#1E293B] rounded-lg hover:bg-[#1E293B] transition-colors whitespace-nowrap"
            >
              <i className="ri-download-line mr-1"></i>CSV
            </button>
          )}
          <span className="text-xs text-[#64748B]">{filtered.length} records</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1E293B]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-xs font-medium text-[#94A3B8] uppercase whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {filtered.map((row, i) => (
              <tr
                key={row.id || i}
                className={`hover:bg-[#1E293B] transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-search-line text-[#64748B] text-2xl"></i>
          <p className="text-sm text-[#94A3B8] mt-2">{emptyMessage || "No records found"}</p>
        </div>
      )}
    </div>
  );
}