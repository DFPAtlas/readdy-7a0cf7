"use client"

import Link from "next/link"
import { LeadershipAction, LEADERSHIP_ACTION_PRIORITY, ACTION_CATEGORY_ICONS } from "@/lib/enterpriseSystem"

export default function LeadershipActionCentre({ actions, maxItems = 6 }: { actions: LeadershipAction[]; maxItems?: number }) {
  const sorted = [...actions].sort((a, b) =>
    (LEADERSHIP_ACTION_PRIORITY[a.priority]?.sortOrder ?? 99) - (LEADERSHIP_ACTION_PRIORITY[b.priority]?.sortOrder ?? 99)
  )
  const visible = sorted.slice(0, maxItems)
  const overflow = sorted.length - maxItems

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
        <h2 className="font-semibold text-[#3A3F3A]">Leadership Actions Required</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${sorted.length > 0 ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#10B981]/10 text-[#10B981]"}`}>
          {sorted.length} action{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="ri-check-line text-[#10B981] text-xl"></i>
          </div>
          <p className="text-sm text-[#94A3B8]">No actions require leadership attention</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {visible.map((action) => {
            const pri = LEADERSHIP_ACTION_PRIORITY[action.priority]
            return (
              <div key={action.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pri.bg}`}>
                  <i className={`${ACTION_CATEGORY_ICONS[action.category] || "ri-alert-line"} text-lg`} style={{ color: pri.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white`} style={{ backgroundColor: pri.color }}>
                      {pri.label}
                    </span>
                    <span className="text-xs text-[#687068]">{action.regionOrOffice}</span>
                  </div>
                  <p className="text-sm font-medium text-[#3A3F3A]">{action.issue}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{action.impact} &bull; {action.owner} &bull; Due {action.dueDate}</p>
                </div>
                <Link
                  href={action.actionHref}
                  className="flex-shrink-0 px-3 py-1.5 bg-[#C28A78] text-white text-xs font-medium rounded-lg hover:bg-[#143728] transition-colors whitespace-nowrap"
                >
                  {action.actionLabel}
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {overflow > 0 && (
        <div className="px-5 py-3 border-t border-[#E2E8F0] text-center">
          <span className="text-xs text-[#94A3B8]">+{overflow} more action{overflow !== 1 ? "s" : ""} — apply filters to refine</span>
        </div>
      )}
    </div>
  )
}