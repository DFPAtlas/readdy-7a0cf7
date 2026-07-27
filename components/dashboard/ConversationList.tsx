"use client";

import { Conversation, participantTypes, deliveryStates } from "@/lib/communicationSystem";

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  mailboxFilter: string;
}

export default function ConversationList({ conversations, selectedId, onSelect, mailboxFilter }: Props) {
  const filtered = (() => {
    switch (mailboxFilter) {
      case "requires_reply": return conversations.filter((c) => c.requiresReply);
      case "unread": return conversations.filter((c) => c.unreadCount > 0);
      case "sent":
      case "drafts":
      case "archived":
        return conversations;
      default: return conversations;
    }
  })();

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-2">
            <i className="ri-chat-3-line text-[#94A3B8] text-lg"></i>
          </div>
          <p className="text-xs text-[#94A3B8]">No conversations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[#D5D9D5]">
      {filtered.map((conv) => {
        const pType = participantTypes[conv.participantType];
        const isSelected = selectedId === conv.id;
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left px-4 py-3.5 hover:bg-[#FBF9F4] transition-colors ${isSelected ? "bg-[#C28A78]/5 border-l-2 border-l-[#C28A78]" : "border-l-2 border-l-transparent"} ${conv.requiresReply ? "bg-[#F59E0B]/[0.03]" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full ${pType.bg} flex items-center justify-center flex-shrink-0`}>
                <i className={`${pType.icon} text-sm`} style={{ color: pType.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-[#3A3F3A]" : "font-medium text-[#3A3F3A]"}`}>
                    {conv.participantName}
                  </p>
                  <span className="text-[11px] text-[#94A3B8] flex-shrink-0 whitespace-nowrap">
                    {conv.lastMessageAt}
                  </span>
                </div>
                <p className="text-xs text-[#687068] truncate mt-0.5">{conv.lastMessagePreview}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-[#94A3B8] truncate">{conv.relatedRecord}{conv.propertyName ? ` · ${conv.propertyName}` : ""}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {conv.requiresReply && (
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" title="Requires reply"></span>
                )}
                {conv.deliveryProblem && (
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" title="Delivery problem"></span>
                )}
                {conv.unreadCount > 0 && (
                  <span className="bg-[#C28A78] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}