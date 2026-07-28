"use client";

import { useState } from "react";
import { Conversation, MessageItem, participantTypes, deliveryStates } from "@/lib/communicationSystem";

interface Props {
  conversation: Conversation;
  onClose: () => void;
  onSend: (body: string) => void;
}

function Bubble({ msg }: { msg: MessageItem }) {
  const isAgency = msg.senderType === "agency";
  if (msg.isInternalNote) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-[#FEF3C7]/50 border border-[#FCD34D]/30 rounded-lg px-4 py-2 max-w-[80%]">
          <p className="text-[11px] font-medium text-[#92400E] mb-1">Internal Note — {msg.senderName}</p>
          <p className="text-sm text-[#3A3F3A] whitespace-pre-wrap">{msg.body}</p>
        </div>
      </div>
    );
  }
  const dState = deliveryStates[msg.deliveryState];
  return (
    <div className={`flex ${isAgency ? "justify-end" : "justify-start"} my-1.5`}>
      <div className="max-w-[75%]">
        <div className={`rounded-2xl px-4 py-2.5 ${isAgency ? "bg-[#C28A78] text-white rounded-br-md" : "bg-[#F1F5F9] text-[#3A3F3A] rounded-bl-md"}`}>
          {!isAgency && (
            <p className="text-[11px] font-medium mb-0.5" style={{ color: participantTypes[msg.senderType].color }}>{msg.senderName}</p>
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

export default function ReplyModal({ conversation, onClose, onSend }: Props) {
  const [body, setBody] = useState("");
  const pType = participantTypes[conversation.participantType];

  const handleSend = () => {
    if (!body.trim()) return;
    onSend(body.trim());
    setBody("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5] bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${pType.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`${pType.icon} text-sm`} style={{ color: pType.color }}></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#3A3F3A] truncate">{conversation.participantName}</p>
              <p className="text-xs text-[#687068] truncate">{conversation.propertyName || conversation.relatedRecord}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] cursor-pointer">
            <i className="ri-close-line text-[#687068]"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#FBF9F4]/50 min-h-[200px]">
          {conversation.messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
        </div>

        <div className="border-t border-[#D5D9D5] bg-white px-5 py-4 flex-shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder="Type your reply... (Enter to send)"
                rows={2}
                maxLength={2000}
                className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white resize-none"
              />
              <p className="text-[11px] text-[#94A3B8] mt-0.5">{body.length}/2000</p>
            </div>
            <button
              onClick={handleSend}
              disabled={!body.trim()}
              className="h-10 px-4 bg-[#C28A78] hover:bg-[#143828] disabled:opacity-40 rounded-lg flex items-center justify-center gap-2 flex-shrink-0 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-send-plane-fill text-white text-sm"></i>
              <span className="text-white text-sm font-medium">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}