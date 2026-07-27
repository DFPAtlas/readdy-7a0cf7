"use client";

import { MessageActionItem, participantTypes, messageContexts, actionPriorityConfig } from "@/lib/communicationSystem";

interface Props {
  actions: MessageActionItem[];
}

export default function CommunicationActionCentre({ actions }: Props) {
  if (actions.length === 0) {
    return (
      <div className="bg-[#7A9A7E]/5 rounded-xl border border-[#7A9A7E]/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-[#7A9A7E]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="ri-check-line text-[#7A9A7E] text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-[#7A9A7E]">All caught up</p>
            <p className="text-xs text-[#687068] mt-0.5">No messages require immediate attention.</p>
          </div>
        </div>
      </div>
    );
  }

  const display = actions.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#D5D9D5] bg-[#FEF3C7]/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line text-[#F59E0B] text-sm"></i></div>
          <h3 className="text-sm font-semibold text-[#3A3F3A]">Requires Attention</h3>
        </div>
        <span className="text-xs text-[#687068]">{actions.length} item{actions.length > 1 ? "s" : ""}</span>
      </div>
      <div className="divide-y divide-[#D5D9D5]">
        {display.map((action) => {
          const pType = participantTypes[action.participantType];
          const priority = actionPriorityConfig[action.priority];
          const ctxConfig = messageContexts[action.context];
          return (
            <div key={action.id} className="flex items-start gap-3 px-5 py-3 hover:bg-[#FBF9F4] transition-colors">
              <div className={`w-8 h-8 rounded-full ${pType.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <i className={`${pType.icon} text-xs`} style={{ color: pType.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${priority.bg}`} style={{ color: priority.color }}>{priority.label}</span>
                  <span className="text-[11px] text-[#94A3B8]">{action.date}</span>
                </div>
                <p className="text-sm text-[#3A3F3A]">{action.participantName} · {action.propertyName}</p>
                <p className="text-xs text-[#687068] mt-0.5">{action.issue}</p>
              </div>
              <button className="text-xs font-medium text-[#C28A78] px-3 py-1.5 rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap flex-shrink-0">
                Reply
              </button>
            </div>
          );
        })}
      </div>
      {actions.length > 5 && (
        <div className="px-5 py-3 border-t border-[#D5D9D5] text-center">
          <span className="text-xs text-[#C28A78] font-medium cursor-pointer hover:underline">View all {actions.length} items</span>
        </div>
      )}
    </div>
  );
}