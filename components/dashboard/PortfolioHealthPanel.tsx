"use client";

import Link from "next/link";

export interface HealthMetric {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: string;
  detail: string;
}

interface PortfolioHealthPanelProps {
  overallScore: number;
  metrics: HealthMetric[];
  isLoading: boolean;
  isOwner: boolean;
}

export default function PortfolioHealthPanel({ overallScore, metrics, isLoading, isOwner }: PortfolioHealthPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="h-5 w-36 bg-[#EBE5DA] rounded"></div>
        </div>
        <div className="p-5 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#EBE5DA] rounded-lg"></div>
              <div className="flex-1">
                <div className="h-3 w-full bg-[#EBE5DA] rounded-full"></div>
              </div>
              <div className="w-10 h-5 bg-[#EBE5DA] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5D9D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8A9FB0]/10 rounded-lg flex items-center justify-center">
              <i className="ri-heart-pulse-line text-[#8A9FB0] text-lg"></i>
            </div>
            <div>
              <h2 className="font-semibold text-[#3A3F3A]">Portfolio Health</h2>
              <p className="text-xs text-[#687068]">No data available yet</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-[#687068]">Add properties to see portfolio health metrics.</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#7A9A7E]";
    if (score >= 60) return "text-[#D4A85C]";
    return "text-[#C46868]";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-[#7A9A7E]";
    if (score >= 60) return "bg-[#D4A85C]";
    return "bg-[#C46868]";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Healthy";
    if (score >= 60) return "Needs Attention";
    return "At Risk";
  };

  const scoreColor = getScoreColor(overallScore);
  const scoreBg = getScoreBg(overallScore);

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
            <i className="ri-heart-pulse-line text-[#C28A78] text-lg"></i>
          </div>
          <div>
            <h2 className="font-semibold text-[#3A3F3A]">Portfolio Health</h2>
            <p className="text-xs text-[#687068]">{getScoreLabel(overallScore)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-2xl font-bold ${scoreColor}`}>{overallScore}</p>
            <p className="text-[10px] text-[#687068]">out of 100</p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-[#EBE5DA] flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-[#EBE5DA]" />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                className={scoreColor}
                strokeDasharray={`${(overallScore / 100) * 151} 151`}
              />
            </svg>
            <span className={`text-xs font-bold ${scoreColor} z-10`}>{overallScore}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {metrics.map((metric) => {
          const pct = metric.maxValue > 0 ? Math.round((metric.value / metric.maxValue) * 100) : 0;
          return (
            <div key={metric.label} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${metric.color}15` }}>
                <i className={`${metric.icon} text-sm`} style={{ color: metric.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#3A3F3A]">{metric.label}</span>
                  <span className="text-xs text-[#687068]">{metric.detail}</span>
                </div>
                <div className="w-full h-2 bg-[#EBE5DA] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: metric.color }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-semibold w-9 text-right" style={{ color: metric.color }}>{pct}%</span>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-[#D5D9D5] bg-[#FBF9F4]">
        <Link
          href={isOwner ? "/dashboard/portfolio" : "/dashboard/business-intelligence"}
          className="flex items-center justify-center gap-1.5 text-sm text-[#C28A78] font-medium hover:underline"
        >
          View full portfolio analysis
          <i className="ri-arrow-right-line text-xs"></i>
        </Link>
      </div>
    </div>
  );
}