"use client";

import { useState, useEffect } from "react";

interface DemoHelperTipProps {
  id: string;
  title: string;
  children: React.ReactNode;
  position?: "top" | "bottom";
}

export default function DemoHelperTip({ id, title, children, position = "top" }: DemoHelperTipProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`demo_tip_${id}`);
    if (stored === "dismissed") {
      setDismissed(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(`demo_tip_${id}`, "dismissed");
  };

  if (dismissed) return null;

  return (
    <div className={`relative bg-gradient-to-r from-[#C28A78]/5 to-[#14B8A6]/5 border border-[#C28A78]/20 rounded-xl p-4 mb-5 ${position === "bottom" ? "mt-5" : ""}`}>
      <div className="absolute -top-2 left-4 flex items-center gap-1.5 bg-[#C28A78] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
        <div className="w-3 h-3 flex items-center justify-center">
          <i className="ri-lightbulb-line text-[10px]"></i>
        </div>
        Demo Guide
      </div>
      <div className="flex items-start justify-between gap-4 mt-1">
        <div>
          <p className="text-sm font-semibold text-[#C28A78] mb-1">{title}</p>
          <p className="text-sm text-[#475569] leading-relaxed">{children}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#C28A78]/10 transition-colors flex-shrink-0"
          title="Don't show again"
        >
          <i className="ri-close-line text-[#687068] text-sm"></i>
        </button>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#C28A78]/10">
        <span className="text-[10px] text-[#94A3B8]">
          <i className="ri-information-line mr-1"></i>
          This tip is only visible in demo mode
        </span>
        <button
          onClick={handleDismiss}
          className="text-[10px] text-[#C28A78] font-medium hover:underline ml-auto"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}