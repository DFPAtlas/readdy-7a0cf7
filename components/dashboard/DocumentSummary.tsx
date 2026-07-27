'use client';

interface SummaryCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
  filterKey?: string;
}

interface DocumentSummaryProps {
  cards: SummaryCard[];
  onCardClick?: (key: string) => void;
  activeFilter?: string;
}

export default function DocumentSummary({ cards, onCardClick, activeFilter }: DocumentSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => card.filterKey && onCardClick?.(card.filterKey)}
          className={`bg-white rounded-xl border p-4 flex items-center gap-3 text-left transition-all cursor-pointer ${card.filterKey && activeFilter === card.filterKey ? 'border-[#C28A78] ring-1 ring-[#C28A78]/30' : 'border-[#D5D9D5] hover:border-[#C28A78]/40 hover:shadow-sm'} ${!card.filterKey && 'cursor-default'}`}
        >
          <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${card.icon} ${card.color} text-lg`}></i>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-[#3A3F3A]">{card.value}</p>
            <p className="text-xs text-[#687068] truncate">{card.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}