"use client";

import { Conversation, MessageItem, participantTypes, deliveryStates, conversationStatuses } from "@/lib/communicationSystem";
import ConversationComposer from "./ConversationComposer";

interface Props {
  conversation: Conversation;
  onBack: () => void;
  onOpenDetails: () => void;
  onSendMessage: (body: string) => void;
  onAddInternalNote: (body: string) => void;
  onResolve: () => void;
  onReopen: () => void;
}

function MessageBubble({ msg }: { msg: MessageItem }) {
  const isAgency = msg.senderType === "agency";
  const isInternal = msg.isInternalNote;
  const dState = deliveryStates[msg.deliveryState];

  if (isInternal) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-[#FEF3C7]/50 border border-[#FCD34D]/30 rounded-lg px-4 py-2 max-w-[80%]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-lock-line text-[#D97706] text-[10px]"></i></div>
            <p className="text-[11px] font-medium text-[#92400E]">Internal Note — {msg.senderName}</p>
          </div>
          <p className="text-sm text-[#3A3F3A] whitespace-pre-wrap">{msg.body}</p>
          <p className="text-[11px] text-[#A16207] mt-1">{msg.createdAt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAgency ? "justify-end" : "justify-start"} my-1.5`}>
      <div className={`max-w-[70%] ${isAgency ? "order-1" : ""}`}>
        <div className={`rounded-2xl px-4 py-2.5 ${isAgency ? "bg-[#C28A78] text-white rounded-br-md" : "bg-[#F1F5F9] text-[#3A3F3A] rounded-bl-md"}`}>
          {!isAgency && (
            <p className="text-[11px] font-medium mb-0.5" style={{ color: participantTypes[msg.senderType].color }}>
              {msg.senderName}
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
          <div className={`flex items-center gap-1.5 mt-1 ${isAgency ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] ${isAgency ? "text-white/70" : "text-[#94A3B8]"}`}>{msg.createdAt}</span>
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={`${dState.icon} text-[10px]`} style={{ color: isAgency ? "rgba(255,255,255,0.7)" : dState.color }}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConversationView({ conversation, onBack, onOpenDetails, onSendMessage, onAddInternalNote, onResolve, onReopen }: Props) {
  const pType = participantTypes[conversation.participantType];
  const convStatus = conversationStatuses[conversation.conversationStatus];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#D5D9D5] bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] lg:hidden">
            <i className="ri-arrow-left-line text-[#687068]"></i>
          </button>
          <div className={`w-9 h-9 rounded-full ${pType.bg} flex items-center justify-center flex-shrink-0`}>
            <i className={`${pType.icon} text-sm`} style={{ color: pType.color }}></i>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#3A3F3A] truncate">{conversation.participantName}</p>
            <p className="text-xs text-[#687068]">
              {conversation.propertyName || conversation.relatedRecord}
              {conversation.participantEmail ? ` · ${conversation.participantEmail}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${convStatus.bg}`} style={{ color: convStatus.color }}>
            {convStatus.label}
          </span>
          {conversation.conversationStatus === "resolved" || conversation.conversationStatus === "closed" ? (
            <button
              onClick={onReopen}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
              title="Reopen"
            >
              <i className="ri-refresh-line text-[#687068] text-sm"></i>
            </button>
          ) : (
            <button
              onClick={onResolve}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
              title="Mark Resolved"
            >
              <i className="ri-check-line text-[#7A9A7E] text-sm"></i>
            </button>
          )}
          <button
            onClick={onOpenDetails}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors"
            title="Details"
          >
            <i className="ri-information-line text-[#687068] text-sm"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#FBF9F4]/50">
        {conversation.messages.map((msg, i) => {
          const prevDate = i > 0 ? conversation.messages[i - 1].createdAt.split(",")[0] : null;
          const thisDate = msg.createdAt.split(",")[0];
          const showDateSep = prevDate !== thisDate;
          return (
            <div key={msg.id}>
              {showDateSep && (
                <div className="flex items-center justify-center my-3">
                  <span className="text-[11px] text-[#94A3B8] bg-white px-3 py-0.5 rounded-full border border-[#D5D9D5]">
                    {thisDate}
                  </span>
                </div>
              )}
              <MessageBubble msg={msg} />
            </div>
          );
        })}
      </div>

      <ConversationComposer
        onSendMessage={onSendMessage}
        onAddInternalNote={onAddInternalNote}
        disabled={conversation.conversationStatus === "closed"}
      />
    </div>
  );
}