"use client";

import Link from "next/link";
import { getChecklistForAccountType, calculateProgress } from "@/lib/onboardingData";

interface SetupProgressTrackerProps {
  accountType: string | null;
  completedIds: string[];
}

export default function SetupProgressTracker({ accountType, completedIds }: SetupProgressTrackerProps) {
  const checklist = getChecklistForAccountType(accountType);
  const progress = calculateProgress(checklist, completedIds);

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "bg-[#7A9A7E]";
    if (pct >= 50) return "bg-[#F59E0B]";
    if (pct >= 25) return "bg-[#F97316]";
    return "bg-[#EF4444]";
  };

  const getProgressBg = (pct: number) => {
    if (pct >= 80) return "bg-[#7A9A7E]/10";
    if (pct >= 50) return "bg-[#F59E0B]/10";
    if (pct >= 25) return "bg-[#F97316]/10";
    return "bg-[#EF4444]/10";
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${getProgressBg(progress)} rounded-lg flex items-center justify-center`}>
            <i className={`ri-rocket-2-line text-lg ${progress >= 50 ? "text-[#7A9A7E]" : "text-[#F59E0B]"}`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-[#3A3F3A] text-sm">Setup Progress</h3>
            <p className="text-xs text-[#687068]">{progress}% complete</p>
          </div>
        </div>
        <Link
          href="/dashboard/setup"
          className="text-xs font-medium text-[#C28A78] hover:text-[#B07A69] flex items-center gap-1 whitespace-nowrap"
        >
          Continue Setup
          <i className="ri-arrow-right-line text-xs"></i>
        </Link>
      </div>

      <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${getProgressColor(progress)} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {checklist.map((item) => {
          const isDone = completedIds.includes(item.id);
          return (
            <Link
              key={item.id}
              href={item.link}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                isDone
                  ? "bg-[#7A9A7E]/5 border border-[#7A9A7E]/20 text-[#7A9A7E]"
                  : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#94A3B8] hover:border-[#C28A78]/30 hover:text-[#687068]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? "bg-[#7A9A7E] text-white" : "bg-[#E2E8F0] text-[#94A3B8]"
              }`}>
                {isDone ? <i className="ri-check-line text-[10px]"></i> : <i className={`${item.icon} text-[10px]`}></i>}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}