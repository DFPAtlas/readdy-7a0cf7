"use client";

import Link from "next/link";
import { calculatePropertyHealthScore, getHealthBadge, getScoreColor, PropertyHealthData } from "@/lib/propertyHealthScore";

const breakdownLabels: { key: keyof PropertyHealthData["breakdown"]; label: string; max: number }[] = [
  { key: "complianceScore", label: "Compliance", max: 30 },
  { key: "maintenanceScore", label: "Maintenance", max: 20 },
  { key: "tenancyScore", label: "Tenancy", max: 15 },
  { key: "rentScore", label: "Rent", max: 15 },
  { key: "inspectionScore", label: "Inspection", max: 10 },
  { key: "portalDocumentScore", label: "Portal & Docs", max: 10 },
];

export default function PropertyHealthScoreCard({
  propertyId,
  propertyName,
  compact = false,
  showLink = true,
  showBreakdown = true,
  showReasons = true,
}: {
  propertyId: string;
  propertyName?: string;
  compact?: boolean;
  showLink?: boolean;
  showBreakdown?: boolean;
  showReasons?: boolean;
}) {
  const health = calculatePropertyHealthScore(propertyId);
  const badge = getHealthBadge(health.healthLevel);
  const scoreColor = getScoreColor(health.overallScore);

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (health.overallScore / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#D5D9D5" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="36" fill="none" stroke={scoreColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute text-sm font-bold" style={{ color: scoreColor }}>{health.overallScore}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#3A3F3A] truncate">{propertyName || `Property ${propertyId}`}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.textColor}`}>{badge.label}</span>
          {health.reasons.length > 0 && (
            <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{health.reasons[0]}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#D5D9D5" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="36" fill="none" stroke={scoreColor} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{health.overallScore}</span>
            <span className="text-[10px] text-[#94A3B8]">/100</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 flex items-center justify-center`}>
              <i className={`${badge.icon} ${badge.textColor} text-sm`}></i>
            </div>
            <span className={`text-sm font-semibold ${badge.textColor}`}>{badge.label}</span>
          </div>
          {propertyName && <p className="text-sm text-[#687068]">{propertyName}</p>}
          <p className="text-xs text-[#94A3B8] mt-0.5">Property Health Score™</p>
        </div>
      </div>

      {showBreakdown && (
        <div className="space-y-2">
          {breakdownLabels.map((item) => {
            const val = health.breakdown[item.key];
            const pct = (val / item.max) * 100;
            const barColor = pct >= 80 ? "#7A9A7E" : pct >= 50 ? "#D4A85C" : "#C46868";
            return (
              <div key={item.key} className="flex items-center gap-3">
                <span className="text-xs text-[#687068] w-24 flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-1.5 bg-[#EBE5DA] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <span className="text-xs font-medium text-[#3A3F3A] w-8 text-right">{val}/{item.max}</span>
              </div>
            );
          })}
        </div>
      )}

      {showReasons && health.reasons.length > 0 && (
        <div className="pt-3 border-t border-[#D5D9D5]">
          <p className="text-xs font-medium text-[#687068] mb-2">Top reasons</p>
          <ul className="space-y-1.5">
            {health.reasons.slice(0, 3).map((reason, i) => (
              <li key={i} className="text-xs text-[#475569] flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: scoreColor }}></span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLink && (
        <Link
          href={`/dashboard/property/${propertyId}`}
          className="block text-center text-xs font-medium text-[#C28A78] hover:text-[#B07A69] py-2 rounded-lg hover:bg-[#EBE5DA] transition-colors border-t border-[#D5D9D5] pt-3"
        >
          View Property Details
        </Link>
      )}
    </div>
  );
}