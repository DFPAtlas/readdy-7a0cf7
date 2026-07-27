"use client";

import { ContractorAction, PRIORITY_CONFIG } from "@/lib/contractorSystem";

export default function ContractorActionCentre({ actions, onAction }: { actions: ContractorAction[]; onAction?: (action: ContractorAction) => void }) {
  const displayed = actions.slice(0, 5);

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
            <i className="ri-check-double-line text-[#10B981] text-sm"></i>
          </div>
          <h3 className="font-semibold text-[#3A3F3A]">Actions Required</h3>
        </div>
        <div className="text-center py-3">
          <p className="text-sm text-[#94A3B8]">No contractor actions require attention</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
            <i className="ri-alert-line text-[#EF4444] text-sm"></i>
          </div>
          <div>
            <h3 className="font-semibold text-[#3A3F3A]">Actions Required</h3>
          </div>
        </div>
        {actions.length > 5 && (
          <span className="text-xs text-[#94A3B8]">+{actions.length - 5} more</span>
        )}
      </div>
      <div className="divide-y divide-[#D5D9D5]">
        {displayed.map((action) => {
          const priorityCfg = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG.medium;
          return (
            <div key={action.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${priorityCfg.bg}`}>
                <i className={`ri-alert-line ${priorityCfg.color} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#3A3F3A]">{action.contractorName}</span>
                  <span className="text-xs text-[#94A3B8] bg-[#F1F5F9] px-1.5 py-0.5 rounded-full">{action.trade}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>{priorityCfg.label}</span>
                </div>
                <p className="text-xs text-[#687068] mt-0.5">{action.issue}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Deadline: {action.deadline}</p>
              </div>
              <button
                onClick={() => onAction?.(action)}
                className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium hover:bg-[#143828] transition-colors whitespace-nowrap cursor-pointer"
              >
                {action.actionLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}