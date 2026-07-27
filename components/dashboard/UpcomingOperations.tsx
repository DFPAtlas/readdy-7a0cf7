"use client";

import { useState } from "react";
import Link from "next/link";

export interface OperationItem {
  id: string;
  date: string;
  type: string;
  property: string;
  person: string;
  status: "upcoming" | "today" | "overdue";
  icon: string;
  iconColor: string;
  href: string;
}

interface UpcomingOperationsProps {
  items: OperationItem[];
  isLoading: boolean;
}

export default function UpcomingOperations({ items, isLoading }: UpcomingOperationsProps) {
  const [filter, setFilter] = useState<"today" | "upcoming">("today");

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="h-5 w-36 bg-[#EBE5DA] rounded"></div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-[#FBF9F4] rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    if (filter === "today") return item.status === "today" || item.status === "overdue";
    return true;
  });

  const displayedItems = filteredItems.slice(0, 6);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8A9FB0]/10 rounded-lg flex items-center justify-center">
              <i className="ri-calendar-line text-[#8A9FB0] text-lg"></i>
            </div>
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Today&apos;s Operations</h2>
              <p className="text-xs text-[#687068]">Nothing scheduled</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mb-3">
            <i className="ri-calendar-check-line text-[#7A9A7E] text-xl"></i>
          </div>
          <p className="text-sm font-medium text-[#3A3F3A]">No upcoming events</p>
          <p className="text-xs text-[#687068] mt-1">No inspections, visits or deadlines in the next 7 days.</p>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { text: string; bg: string; dot: string }> = {
    today: { text: "text-[#7A9A7E]", bg: "bg-[#7A9A7E]/10", dot: "bg-[#7A9A7E]" },
    upcoming: { text: "text-[#8A9FB0]", bg: "bg-[#8A9FB0]/10", dot: "bg-[#8A9FB0]" },
    overdue: { text: "text-[#C46868]", bg: "bg-[#C46868]/10", dot: "bg-[#C46868]" },
  };

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
            <i className="ri-calendar-todo-line text-[#C28A78] text-lg"></i>
          </div>
          <div>
            <h2 className="font-semibold text-[#3A3F3A]">Today&apos;s Operations</h2>
            <p className="text-xs text-[#687068]">{items.length} event{items.length !== 1 ? "s" : ""} this week</p>
          </div>
        </div>
        <div className="flex items-center bg-[#EBE5DA] rounded-full p-0.5">
          <button
            onClick={() => setFilter("today")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
              filter === "today" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
              filter === "upcoming" ? "bg-white text-[#3A3F3A] shadow-sm" : "text-[#687068] hover:text-[#3A3F3A]"
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="divide-y divide-[#F1F5F9]">
        {displayedItems.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-4 px-5 py-3 hover:bg-[#FBF9F4] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.iconColor}15` }}>
                <i className={`${item.icon} text-sm`} style={{ color: item.iconColor }}></i>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3A3F3A]">{item.type}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[#687068]">
                  <span>{item.property}</span>
                  {item.person && (
                    <>
                      <span className="text-[#D5D9D5]">|</span>
                      <span>{item.person}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} whitespace-nowrap`}>
                  {item.status === "overdue" ? "Overdue" : item.status === "today" ? "Today" : "Upcoming"}
                </span>
                <p className="text-[11px] text-[#687068] mt-0.5">{item.date}</p>
              </div>

              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-arrow-right-s-line text-[#687068] text-sm"></i>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredItems.length > 6 && (
        <div className="px-5 py-3 border-t border-[#D5D9D5] bg-[#FBF9F4]">
          <Link
            href="/dashboard/inspections"
            className="flex items-center justify-center gap-1.5 text-sm text-[#C28A78] font-medium hover:underline"
          >
            View all {filteredItems.length} events
            <i className="ri-arrow-right-line text-xs"></i>
          </Link>
        </div>
      )}
    </div>
  );
}