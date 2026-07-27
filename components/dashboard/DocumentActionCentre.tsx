'use client';

import { DocumentAction, PRIORITY_CONFIG } from '@/lib/documentSystem';

interface DocumentActionCentreProps {
  actions: DocumentAction[];
  onActionClick?: (action: DocumentAction) => void;
}

const MAX_VISIBLE = 6;

export default function DocumentActionCentre({ actions, onActionClick }: DocumentActionCentreProps) {
  if (actions.length === 0) {
    return (
      <div className="bg-[#F8FAFC] rounded-xl border border-[#D5D9D5] p-6 text-center">
        <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-check-line text-[#94A3B8] text-lg"></i>
          </div>
        </div>
        <p className="text-sm text-[#687068] font-medium">No documents require immediate attention</p>
        <p className="text-xs text-[#94A3B8] mt-1">All documents are up to date</p>
      </div>
    );
  }

  const sorted = [...actions].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = sorted.length - MAX_VISIBLE;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-[#3A3F3A]">Requires Attention</p>
        {remaining > 0 && (
          <span className="text-xs text-[#C28A78] font-medium">{remaining} more items</span>
        )}
      </div>
      <div className="space-y-1.5">
        {visible.map((action) => {
          const priority = PRIORITY_CONFIG[action.priority];
          return (
            <div key={action.id} className="bg-white rounded-lg border border-[#D5D9D5] p-3 flex items-center gap-3 hover:border-[#C28A78]/30 transition-colors">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${priority.bg} rounded-lg flex items-center justify-center`}>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`${priority.icon} ${priority.color} text-sm`}></i>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#3A3F3A] truncate">{action.documentName}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priority.bg} ${priority.color} flex-shrink-0`}>{priority.label}</span>
                </div>
                <p className="text-xs text-[#687068] truncate">{action.issue} · {action.relatedRecord}</p>
                {action.deadline && (
                  <p className="text-xs text-[#94A3B8] mt-0.5">{action.responsiblePerson} · Due {action.deadline}</p>
                )}
              </div>
              <button
                onClick={() => onActionClick?.(action)}
                className="px-3 py-1.5 bg-[#C28A78] text-white rounded-lg text-xs font-medium whitespace-nowrap hover:bg-[#143828] transition-colors flex-shrink-0 cursor-pointer"
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