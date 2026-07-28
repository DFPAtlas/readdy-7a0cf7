"use client";

import { useState } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  label: string;
  icon: string;
  link: string;
}

interface GettingStartedChecklistProps {
  accountType: string | null;
  completedIds: string[];
  collapsed: boolean;
}

const agencyItems: ChecklistItem[] = [
  { id: "profile", label: "Create profile", icon: "ri-user-settings-line", link: "/dashboard/setup" },
  { id: "properties", label: "Add property", icon: "ri-home-4-line", link: "/dashboard/portfolio" },
  { id: "documents", label: "Upload document", icon: "ri-folder-line", link: "/dashboard/documents" },
  { id: "tenants", label: "Invite tenant", icon: "ri-user-3-line", link: "/dashboard/tenants" },
  { id: "compliance", label: "Complete compliance", icon: "ri-shield-check-line", link: "/dashboard/compliance" },
  { id: "portals", label: "Run first inspection", icon: "ri-clipboard-line", link: "/dashboard/inspections" },
];

const ownerItems: ChecklistItem[] = [
  { id: "profile", label: "Create profile", icon: "ri-user-settings-line", link: "/dashboard/setup" },
  { id: "properties", label: "Add property", icon: "ri-home-4-line", link: "/dashboard/portfolio" },
  { id: "documents", label: "Upload document", icon: "ri-folder-line", link: "/dashboard/documents" },
  { id: "tenants", label: "Invite tenant", icon: "ri-user-3-line", link: "/dashboard/tenants" },
  { id: "compliance", label: "Complete compliance", icon: "ri-shield-check-line", link: "/dashboard/compliance" },
  { id: "portals", label: "Run first inspection", icon: "ri-clipboard-line", link: "/dashboard/inspections" },
];

export default function GettingStartedChecklist({ accountType, completedIds, collapsed }: GettingStartedChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const items = accountType === "owner" ? ownerItems : agencyItems;
  const doneCount = items.filter((i) => completedIds.includes(i.id)).length;
  const totalCount = items.length;

  if (collapsed) return null;

  return (
    <div className="px-3 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-[#687068] hover:text-[#3A3F3A] hover:bg-[#EBE5DA] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-rocket-2-line text-xs"></i>
          </div>
          <span>Getting Started</span>
          <span className="text-[10px] bg-[#EBE5DA] px-1.5 py-0.5 rounded-full text-[#687068]">
            {doneCount}/{totalCount}
          </span>
        </div>
        <i className={`${isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-xs`}></i>
      </button>

      {isOpen && (
        <div className="mt-1 space-y-0.5">
          {items.map((item) => {
            const isDone = completedIds.includes(item.id);
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  isDone
                    ? "text-[#687068]/40 line-through"
                    : "text-[#687068] hover:text-[#3A3F3A] hover:bg-[#EBE5DA]"
                }`}
              >
                <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 ${
                  isDone ? "text-[#7A9A7E]" : ""
                }`}>
                  {isDone ? (
                    <i className="ri-checkbox-circle-fill text-xs"></i>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#D5D9D5]"></div>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}