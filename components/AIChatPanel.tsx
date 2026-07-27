"use client";

import { useState, useRef, useEffect } from "react";
import { AIMessage, suggestedPrompts, getAIResponse, saveRecentSearch } from "@/app/dashboard/ai-assistant/AIAssistantData";

interface AIChatPanelProps {
  onRecentSearchesChange?: () => void;
  refreshRecentTrigger?: number;
}

export default function AIChatPanel({ onRecentSearchesChange, refreshRecentTrigger }: AIChatPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI Property Manager. I can query your live portfolio data to answer questions about properties, compliance, maintenance, arrears, inspections, and more.\n\nTry asking me one of the suggested questions, or type your own.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const categories = ["All", "Daily Overview", "Compliance", "Maintenance", "Financial", "Inspections", "Communications"];
  const filteredPrompts = selectedCategory === "All" ? suggestedPrompts : suggestedPrompts.filter(p => p.category === selectedCategory);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    saveRecentSearch(text);
    if (onRecentSearchesChange) onRecentSearchesChange();

    try {
      const response = await getAIResponse(text);

      const assistantMsg: AIMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
        dataLoaded: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: AIMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: "I couldn't load the latest data. Please check your connection and try again.",
        timestamp: new Date().toISOString(),
        dataLoaded: false,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }

    setIsTyping(false);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-bold text-[#3A3F3A] mt-3 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("• ")) {
        return (
          <p key={i} className="text-[#475569] ml-4 my-0.5">
            <span className="text-[#C28A78] mr-2">-</span>
            {line.replace(/^• /, "")}
          </p>
        );
      }
      if (/^\d\. /.test(line)) {
        return (
          <p key={i} className="text-[#475569] ml-4 my-0.5">
            {line}
          </p>
        );
      }
      if (line.startsWith("---")) {
        return <hr key={i} className="my-3 border-[#D5D9D5]" />;
      }
      if (line.trim() === "") {
        return <div key={i} className="h-2" />;
      }
      return (
        <p key={i} className="text-[#475569] my-0.5">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col bg-white border border-[#D5D9D5] rounded-xl overflow-hidden h-[calc(100vh-180px)] min-h-[650px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D5D9D5] bg-gradient-to-r from-[#C28A78] to-[#2D5A3D]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="ri-robot-2-line text-white text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Your AI Property Manager</p>
            <p className="text-xs text-white/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#7A9A7E] rounded-full"></span>
              Connected to live data
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([{
              id: "welcome",
              role: "assistant",
              content: "Hello! I'm your AI Property Manager. I can query your live portfolio data to answer questions about properties, compliance, maintenance, arrears, inspections, and more.\n\nTry asking me one of the suggested questions, or type your own.",
              timestamp: new Date().toISOString(),
            }]);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          title="New chat"
        >
          <i className="ri-add-line text-white text-sm"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FBFCFD]">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] ${msg.role === "user" ? "bg-[#C28A78] text-white" : "bg-white text-[#3A3F3A] border border-[#D5D9D5] shadow-sm"} rounded-2xl px-4 py-3.5`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                    <i className="ri-robot-2-line text-[#C28A78] text-xs"></i>
                  </div>
                  <span className="text-xs font-medium text-[#687068]">AI Property Manager</span>
                  <span className="text-xs text-[#94A3B8]">
                    {new Date(msg.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {msg.dataLoaded && (
                    <span className="text-[10px] text-[#7A9A7E] bg-[#7A9A7E]/10 px-1.5 py-0.5 rounded font-medium">Live Data</span>
                  )}
                </div>
              )}

              <div className="text-sm leading-relaxed">
                {formatContent(msg.content)}
              </div>

              {msg.role === "assistant" && msg.id !== "welcome" && (
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#D5D9D5]/50">
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="flex items-center gap-1 text-xs text-[#687068] hover:text-[#C28A78] transition-colors"
                  >
                    <i className={`${copiedId === msg.id ? "ri-check-line" : "ri-file-copy-line"} text-sm`}></i>
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#D5D9D5] shadow-sm rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-robot-2-line text-[#C28A78] text-xs"></i>
                </div>
                <span className="text-xs font-medium text-[#687068]">Analysing data...</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#C28A78] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-[#C28A78] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-[#C28A78] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts strip */}
      {messages.length <= 1 && (
        <div className="px-5 py-3 border-t border-[#D5D9D5] bg-white">
          <div className="flex items-center gap-2 mb-2.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#C28A78] text-white"
                    : "bg-[#EBE5DA] text-[#687068] hover:bg-[#D5D9D5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {filteredPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handleSend(prompt.prompt)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-[#F8FAFC] border border-transparent hover:border-[#D5D9D5] transition-all group"
              >
                <div className="w-7 h-7 bg-[#C28A78]/8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C28A78]/15 transition-colors">
                  <i className={`${prompt.icon} text-[#C28A78] text-sm`}></i>
                </div>
                <span className="text-xs text-[#475569] group-hover:text-[#3A3F3A] transition-colors leading-tight">{prompt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up prompts after response */}
      {messages.length > 1 && messages[messages.length - 1].role === "assistant" && !isTyping && (
        <div className="px-5 py-2.5 border-t border-[#D5D9D5] bg-white">
          <p className="text-[11px] text-[#94A3B8] mb-2">Follow up:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Which properties need attention today?",
              "Which certificates expire this month?",
              "Show all urgent maintenance jobs.",
              "Which inspections are overdue?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 text-xs text-[#C28A78] bg-[#C28A78]/8 rounded-full hover:bg-[#C28A78]/15 transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-5 py-3.5 border-t border-[#D5D9D5] bg-white">
        <div className="flex items-end gap-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your properties..."
            className="flex-1 min-h-[46px] max-h-[120px] px-3.5 py-2.5 text-sm text-[#3A3F3A] bg-[#F8FAFC] border border-[#D5D9D5] rounded-xl resize-none focus:outline-none focus:border-[#C28A78] focus:ring-1 focus:ring-[#C28A78]/20 placeholder:text-[#94A3B8] transition-all"
            rows={1}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
              input.trim() && !isTyping
                ? "bg-[#C28A78] text-white hover:bg-[#B07A69] shadow-sm"
                : "bg-[#D5D9D5] text-[#94A3B8]"
            }`}
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </div>
        <p className="text-[10px] text-[#94A3B8] mt-1.5 text-center">
          Press Enter to send, Shift+Enter for new line. Data is queried live from your portfolio.
        </p>
      </div>
    </div>
  );
}