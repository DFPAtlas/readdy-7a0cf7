"use client";

import Link from "next/link";

interface DashboardHeaderProps {
  userName: string;
  agencyName: string | null;
  isOwner: boolean;
  isDemo: boolean;
  accountType: string | null;
}

export default function DashboardHeader({ userName, agencyName, isOwner, isDemo, accountType }: DashboardHeaderProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const displayName = isOwner ? (agencyName || userName) : (agencyName || "LetHub");

  const getContextSentence = () => {
    if (isDemo) return "Sample data — explore the dashboard features freely.";
    if (isOwner) return "Your property portfolio status at a glance.";
    return "Here's what's happening across your portfolio today.";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-[#3A3F3A]">
            {greeting}, {userName.split(" ")[0]}
          </h1>
          {isDemo && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C28A78]/10 text-[#C28A78] border border-[#C28A78]/20 whitespace-nowrap">
              Demo Mode
            </span>
          )}
        </div>
        <p className="text-sm text-[#687068] mt-1 flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[#3A3F3A]">{displayName}</span>
          <span className="text-[#D5D9D5]">|</span>
          <span>{dateStr}</span>
        </p>
        <p className="text-xs text-[#687068] mt-1.5">{getContextSentence()}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {!isOwner && (
          <Link
            href="/dashboard/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Add Property
          </Link>
        )}
        {isOwner && (
          <Link
            href="/dashboard/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C28A78] text-white text-sm font-medium rounded-lg hover:bg-[#B07A69] transition-colors whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Add Property
          </Link>
        )}
      </div>
    </div>
  );
}