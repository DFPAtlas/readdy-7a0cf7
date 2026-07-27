"use client";

import { ComplianceActionItem, getPriorityConfig } from "@/lib/complianceStatus";

interface ComplianceActionCentreProps {
  actions: ComplianceActionItem[];
  onActionClick: (action: ComplianceActionItem) => void;
  onViewAll: () => void;
}

export default function ComplianceActionCentre({ actions, onActionClick, onViewAll }: ComplianceActionCentreProps) {
  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-5 text-center">
        <div className="w-10 h-10 flex items-center justify-center mx-auto mb-2 bg-[#EBE5DA] rounded-full">
          <i className="ri-check-line text-[#7A9A7E] text-lg"></i>
        </div>
        <p className="text-sm font-medium text-[#3A3F3A]">No immediate compliance actions</p>
        <p className="text-xs text-[#687068] mt-1">Review upcoming renewals below</p>
      </div>
    );
  }

  const displayActions = actions.slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-alert-line text-[#C46868] text-sm"></i>
          </div>
          <h2 className="text-sm font-semibold text-[#3A3F3A]">Action Required</h2>
        </div>
        {actions.length > 6 && (
          <button onClick={onViewAll} className="text-xs font-medium text-[#C28A78] hover:underline whitespace-nowrap">
            View all {actions.length} actions
          </button>
        )}
      </div>
      <div className="divide-y divide-[#D5D9D5]">
        {displayActions.map((action) => {
          const pConfig = getPriorityConfig(action.priority);
          return (
            <div key={action.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
              <div className={`w-8 h-8 flex items-center justify-center ${pConfig.bg} rounded-lg flex-shrink-0`}>
                <i className={`${pConfig.icon} text-white text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#3A3F3A] truncate">{action.title}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${pConfig.pill} whitespace-nowrap`}>
                    {action.priority === "critical" ? "Critical" : action.priority === "warning" ? "Warning" : "Info"}
                  </span>
                </div>
                <p className="text-xs text-[#687068] truncate">{action.property} · {action.requirementType}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#94A3B8]">Due: {action.deadline}</span>
                  <span className="text-xs text-[#94A3B8]">{action.responsiblePerson}</span>
                </div>
              </div>
              <button
                onClick={() => onActionClick(action)}
                className="bg-[#C28A78] hover:bg-[#143828] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
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