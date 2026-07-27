"use client";

import Link from "next/link";

export interface PriorityAction {
  id: string;
  priority: "critical" | "high" | "normal";
  title: string;
  property: string;
  person: string;
  dueDate: string;
  urgency: string;
  href: string;
  icon: string;
}

const priorityConfig: Record<string, { color: string; bg: string; border: string; label: string; dotColor: string }> = {
  critical: {
    color: "text-[#C46868]",
    bg: "bg-[#C46868]/5",
    border: "border-l-[#C46868]",
    label: "Critical",
    dotColor: "bg-[#C46868]",
  },
  high: {
    color: "text-[#D4A85C]",
    bg: "bg-[#D4A85C]/5",
    border: "border-l-[#D4A85C]",
    label: "High",
    dotColor: "bg-[#D4A85C]",
  },
  normal: {
    color: "text-[#8A9FB0]",
    bg: "bg-[#8A9FB0]/5",
    border: "border-l-[#8A9FB0]",
    label: "Normal",
    dotColor: "bg-[#8A9FB0]",
  },
};

interface PriorityActionCentreProps {
  actions: PriorityAction[];
  isLoading: boolean;
}

export default function PriorityActionCentre({ actions, isLoading }: PriorityActionCentreProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="h-5 w-40 bg-[#EBE5DA] rounded animate-pulse"></div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#FBF9F4] rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-[#7A9A7E] text-lg"></i>
            </div>
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Priority Action Centre</h2>
              <p className="text-xs text-[#687068]">Everything is under control</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mb-3">
            <i className="ri-emotion-happy-line text-[#7A9A7E] text-xl"></i>
          </div>
          <p className="text-sm font-medium text-[#3A3F3A]">No urgent actions</p>
          <p className="text-xs text-[#687068] mt-1">Your portfolio is currently up to date.</p>
        </div>
      </div>
    );
  }

  const displayedActions = actions.slice(0, 5);
  const hasMore = actions.length > 5;

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C46868]/10 rounded-lg flex items-center justify-center">
            <i className="ri-error-warning-line text-[#C46868] text-lg"></i>
          </div>
          <div>
            <h2 className="font-semibold text-[#3A3F3A]">Priority Action Centre</h2>
            <p className="text-xs text-[#687068]">{actions.length} action{actions.length !== 1 ? "s" : ""} requiring attention</p>
          </div>
        </div>
        {hasMore && (
          <Link href="/dashboard/compliance" className="text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap">
            View all priority actions
          </Link>
        )}
      </div>

      <div className="divide-y divide-[#F1F5F9]">
        {displayedActions.map((action) => {
          const config = priorityConfig[action.priority];
          return (
            <Link
              key={action.id}
              href={action.href}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors border-l-[3px] ${config.border}`}
            >
              <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${action.icon} ${config.color} text-sm`}></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} whitespace-nowrap`}>
                    {config.label}
                  </span>
                  <p className="text-sm font-medium text-[#3A3F3A] truncate">{action.title}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#687068]">
                  <span className="flex items-center gap-1">
                    <i className="ri-home-4-line text-[10px]"></i>
                    {action.property}
                  </span>
                  {action.person && (
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line text-[10px]"></i>
                      {action.person}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-medium ${config.color}`}>{action.urgency}</p>
                <p className="text-[11px] text-[#687068] mt-0.5">{action.dueDate}</p>
              </div>

              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-arrow-right-s-line text-[#687068] text-sm"></i>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className="px-5 py-3 border-t border-[#D5D9D5] bg-[#FBF9F4]">
          <Link
            href="/dashboard/compliance"
            className="flex items-center justify-center gap-1.5 text-sm text-[#C28A78] font-medium hover:underline"
          >
            View all {actions.length} priority actions
            <i className="ri-arrow-right-line text-xs"></i>
          </Link>
        </div>
      )}
    </div>
  );
}