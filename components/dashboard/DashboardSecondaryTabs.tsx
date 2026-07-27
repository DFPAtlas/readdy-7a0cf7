"use client";

import { useState } from "react";
import Link from "next/link";

interface TabSummary {
  label: string;
  icon: string;
  summary: string;
  value: string;
  href: string;
  linkLabel: string;
}

interface DashboardSecondaryTabsProps {
  tabs: TabSummary[];
}

export default function DashboardSecondaryTabs({ tabs }: DashboardSecondaryTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.label || "");

  if (tabs.length === 0) return null;

  const active = tabs.find((t) => t.label === activeTab) || tabs[0];

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="border-b border-[#D5D9D5] px-2 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.label
                  ? "bg-[#C28A78] text-white"
                  : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#EBE5DA]"
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={`${tab.icon} text-sm`}></i>
              </div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#687068]">{active.summary}</p>
            <p className="text-lg font-semibold text-[#3A3F3A] mt-0.5">{active.value}</p>
          </div>
          <Link
            href={active.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FBF9F4] rounded-lg text-sm font-medium text-[#C28A78] hover:bg-[#EBE5DA] transition-colors whitespace-nowrap"
          >
            {active.linkLabel}
            <i className="ri-arrow-right-line text-xs"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}