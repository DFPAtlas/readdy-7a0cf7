"use client";

import { useState } from "react";

interface Props {
  onSendMessage: (body: string) => void;
  onAddInternalNote: (body: string) => void;
  disabled?: boolean;
}

export default function ConversationComposer({ onSendMessage, onAddInternalNote, disabled }: Props) {
  const [body, setBody] = useState("");
  const [showInternalNote, setShowInternalNote] = useState(false);

  const handleSend = () => {
    if (!body.trim() || disabled) return;
    if (showInternalNote) {
      onAddInternalNote(body.trim());
    } else {
      onSendMessage(body.trim());
    }
    setBody("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[#D5D9D5] bg-white px-4 py-3 flex-shrink-0">
      {showInternalNote && (
        <div className="flex items-center gap-2 mb-2 bg-[#FEF3C7]/50 rounded-lg px-3 py-1.5 border border-[#FCD34D]/30">
          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-lock-line text-[#D97706] text-[10px]"></i></div>
          <span className="text-[11px] font-medium text-[#92400E]">Internal Note — Not visible to recipient</span>
          <button onClick={() => setShowInternalNote(false)} className="ml-auto w-5 h-5 flex items-center justify-center"><i className="ri-close-line text-[#D97706] text-xs"></i></button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowInternalNote(!showInternalNote)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${showInternalNote ? "bg-[#FEF3C7] text-[#D97706]" : "hover:bg-[#F1F5F9] text-[#94A3B8]"}`}
          title="Add internal note"
        >
          <i className={showInternalNote ? "ri-lock-fill text-sm" : "ri-lock-line text-sm"}></i>
        </button>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Conversation is closed" : showInternalNote ? "Write an internal note..." : "Type a message... (Enter to send, Shift+Enter for new line)"}
            rows={2}
            maxLength={2000}
            disabled={disabled}
            className="w-full px-3 py-2 border border-[#D5D9D5] rounded-lg text-sm text-[#3A3F3A] placeholder:text-[#94A3B8] outline-none focus:border-[#C28A78] bg-white resize-none disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
          />
          <p className="text-[11px] text-[#94A3B8] mt-0.5">{body.length}/2000</p>
        </div>
        <button
          onClick={handleSend}
          disabled={!body.trim() || disabled}
          className="w-10 h-10 bg-[#C28A78] hover:bg-[#143828] disabled:opacity-40 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-send-plane-fill text-white text-sm"></i></div>
        </button>
      </div>
    </div>
  );
}