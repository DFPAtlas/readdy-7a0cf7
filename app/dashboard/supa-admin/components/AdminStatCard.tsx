"use client";

import { ReactNode } from "react";

export default function AdminStatCard({
  label,
  value,
  icon,
  color,
  change,
  changeType,
  loading,
  error,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
  changeType?: "up" | "down";
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-white text-lg`}></i>
        </div>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              changeType === "up" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-12 bg-[#1E293B] rounded animate-pulse" />
      ) : error ? (
        <p className="text-sm font-medium text-[#EF4444]">—</p>
      ) : (
        <p className="text-2xl font-bold text-[#E2E8F0]">{value ?? "—"}</p>
      )}
      <p className="text-sm text-[#94A3B8] mt-0.5">{label}</p>
      {error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
    </div>
  );
}