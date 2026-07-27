"use client";

import { Conversation, participantTypes, messageContexts, conversationStatuses } from "@/lib/communicationSystem";

interface Props {
  conversation: Conversation;
  onClose: () => void;
  onAssign: () => void;
}

export default function ConversationDetailsDrawer({ conversation, onClose, onAssign }: Props) {
  const pType = participantTypes[conversation.participantType];
  const ctxConfig = messageContexts[conversation.context];
  const convStatus = conversationStatuses[conversation.conversationStatus];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[320px] lg:w-[340px] bg-white border-l border-[#D5D9D5] shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5D9D5]">
          <h3 className="text-sm font-semibold text-[#3A3F3A]">Conversation Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
            <i className="ri-close-line text-[#94A3B8]"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="text-center">
            <div className={`w-14 h-14 rounded-full ${pType.bg} flex items-center justify-center mx-auto mb-2`}>
              <i className={`${pType.icon} text-xl`} style={{ color: pType.color }}></i>
            </div>
            <p className="text-sm font-semibold text-[#3A3F3A]">{conversation.participantName}</p>
            <p className="text-xs text-[#687068]">{pType.label}</p>
            {conversation.participantEmail && (
              <p className="text-xs text-[#94A3B8] mt-0.5">{conversation.participantEmail}</p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Status</p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${convStatus.bg} inline-block`} style={{ color: convStatus.color }}>
                {convStatus.label}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Context</p>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 flex items-center justify-center"><i className={`${ctxConfig.icon} text-[#687068] text-sm`}></i></div>
                <span className="text-sm text-[#3A3F3A]">{ctxConfig.label}</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Related Record</p>
              <p className="text-sm text-[#3A3F3A]">{conversation.relatedRecord}</p>
            </div>

            {conversation.propertyName && (
              <div>
                <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Property</p>
                <p className="text-sm text-[#3A3F3A]">{conversation.propertyName}</p>
              </div>
            )}

            <div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Assigned To</p>
              <p className="text-sm text-[#3A3F3A]">{conversation.assignedTo || "Unassigned"}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Status Indicators</p>
              <div className="flex items-center gap-3">
                {conversation.requiresReply && (
                  <span className="flex items-center gap-1 text-xs bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>Reply Required
                  </span>
                )}
                {conversation.deliveryProblem && (
                  <span className="flex items-center gap-1 text-xs bg-[#EF4444]/10 text-[#EF4444] px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>Delivery Issue
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide mb-1">Last Activity</p>
              <p className="text-sm text-[#3A3F3A]">{conversation.lastMessageAt}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D5D9D5] p-4 space-y-2">
          <button onClick={onAssign} className="w-full text-sm font-medium text-[#C28A78] py-2 rounded-lg hover:bg-[#C28A78]/5 transition-colors whitespace-nowrap">
            Assign Conversation
          </button>
          <button className="w-full text-sm font-medium text-[#687068] py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
            View Full Record
          </button>
        </div>
      </div>
    </>
  );
}