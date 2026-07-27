"use client"

import { FinancialActionItem } from "@/lib/financialStatus"

interface FinancialActionCentreProps {
  actions: FinancialActionItem[]
  onAction?: (item: FinancialActionItem) => void
  onViewAll?: () => void
}

export default function FinancialActionCentre({ actions, onAction, onViewAll }: FinancialActionCentreProps) {
  const priorityConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    urgent: { color: "text-[#C46868]", bg: "bg-[#C46868]/10", icon: "ri-alarm-warning-line", label: "Urgent" },
    high: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", icon: "ri-alert-line", label: "High" },
    medium: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-information-line", label: "Medium" },
  }

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-8 text-center">
        <div className="w-12 h-12 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="ri-check-double-line text-[#7A9A7E] text-xl"></i>
        </div>
        <p className="text-sm font-medium text-[#3A3F3A] mb-1">No financial actions required</p>
        <p className="text-xs text-[#687068]">All payments are up to date and reconciled</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
            <i className="ri-tools-line text-[#C28A78] text-sm"></i>
          </div>
          <h2 className="font-semibold text-[#3A3F3A]">Action Required</h2>
          <span className="text-xs font-medium text-[#C28A78] bg-[#C28A78]/10 px-2 py-0.5 rounded-full">{actions.length}</span>
        </div>
        {onViewAll && actions.length > 6 && (
          <button onClick={onViewAll} className="text-sm text-[#C28A78] font-medium hover:underline whitespace-nowrap">
            View all actions
          </button>
        )}
      </div>
      <div className="divide-y divide-[#D5D9D5]">
        {actions.slice(0, 6).map((item) => {
          const p = priorityConfig[item.priority] || priorityConfig.medium
          return (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 ${p.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className={`${p.icon} ${p.color} text-sm`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#3A3F3A] truncate">{item.issue}</p>
                  <p className="text-xs text-[#687068] truncate">{item.tenant} · {item.property}{item.amount > 0 ? ` · £${item.amount.toLocaleString()}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full whitespace-nowrap">{item.ageLabel}</span>
                <button
                  onClick={() => onAction?.(item)}
                  className="text-xs font-medium text-white bg-[#C28A78] px-3 py-1.5 rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
                >
                  {item.action}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}