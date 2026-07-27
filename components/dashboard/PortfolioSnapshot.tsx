"use client";

import Link from "next/link";

export interface SnapshotCard {
  key: string;
  label: string;
  value: string;
  supporting: string;
  icon: string;
  color: string;
  statusColor: "success" | "warning" | "error" | "neutral";
  href: string;
}

const statusColorMap: Record<string, { text: string; bg: string }> = {
  success: { text: "text-[#7A9A7E]", bg: "bg-[#7A9A7E]/10" },
  warning: { text: "text-[#D4A85C]", bg: "bg-[#D4A85C]/10" },
  error: { text: "text-[#C46868]", bg: "bg-[#C46868]/10" },
  neutral: { text: "text-[#8A9FB0]", bg: "bg-[#8A9FB0]/10" },
};

interface PortfolioSnapshotProps {
  cards: SnapshotCard[];
  isLoading: boolean;
}

export default function PortfolioSnapshot({ cards, isLoading }: PortfolioSnapshotProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#D5D9D5] p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-[#EBE5DA] rounded-lg"></div>
              <div className="w-14 h-5 bg-[#EBE5DA] rounded-full"></div>
            </div>
            <div className="h-7 w-16 bg-[#EBE5DA] rounded mb-2"></div>
            <div className="h-4 w-24 bg-[#EBE5DA] rounded"></div>
            <div className="h-3 w-20 bg-[#EBE5DA] rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-8 text-center">
        <div className="w-12 h-12 mx-auto bg-[#8A9FB0]/10 rounded-full flex items-center justify-center mb-3">
          <i className="ri-bar-chart-line text-[#8A9FB0] text-xl"></i>
        </div>
        <p className="text-sm font-medium text-[#3A3F3A]">No portfolio data yet</p>
        <p className="text-xs text-[#687068] mt-1">Add your first property to see portfolio statistics.</p>
        <Link href="/dashboard/portfolio" className="inline-block mt-3 text-sm text-[#C28A78] font-medium hover:underline">
          Add Property
        </Link>
      </div>
    );
  }

  const displayCards = cards.slice(0, 5);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {displayCards.map((card) => {
        const sc = statusColorMap[card.statusColor];
        return (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-xl border border-[#D5D9D5] p-5 hover:shadow-md hover:border-[#C28A78]/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <i className={`${card.icon} text-white text-lg`}></i>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                {card.supporting}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#3A3F3A] group-hover:text-[#C28A78] transition-colors">{card.value}</p>
            <p className="text-sm text-[#687068]">{card.label}</p>
          </Link>
        );
      })}
    </div>
  );
}