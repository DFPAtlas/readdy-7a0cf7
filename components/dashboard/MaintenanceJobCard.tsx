"use client";

import { getStatusConfig, getPriorityConfig, type MaintenanceStage } from "@/lib/maintenanceStatus";

export interface MaintenanceJobListItem {
  id: string;
  reference: string;
  title: string;
  property: string;
  propertyAddress: string;
  stage: MaintenanceStage;
  priority: string;
  contractor: string;
  targetDate: string;
  reportedDate: string;
  estimatedCost?: string;
  nextAction?: string;
  responsibleRole?: string;
}

interface Props {
  job: MaintenanceJobListItem;
  isExpanded: boolean;
  onToggle: () => void;
  onView?: () => void;
}

export default function MaintenanceJobCard({ job, isExpanded, onToggle, onView }: Props) {
  const statusCfg = getStatusConfig(job.stage);
  const priorityCfg = getPriorityConfig(job.priority);

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[#FBF9F4] transition-colors text-left"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statusCfg.bg}`}>
          <i className={`${statusCfg.icon} ${statusCfg.color} text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[#94A3B8] font-mono">{job.reference}</span>
              <p className="text-sm font-semibold text-[#3A3F3A]">{job.title}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityCfg.bg} ${priorityCfg.color}`}>
                {job.priority}
              </span>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color} flex-shrink-0`}>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#687068] flex-wrap">
            <span className="flex items-center gap-1">
              <i className="ri-building-4-line text-[#94A3B8] text-[10px]"></i>
              {job.property}
            </span>
            {job.contractor !== "—" && (
              <>
                <span className="text-[#CBD5E1]">·</span>
                <span className="flex items-center gap-1">
                  <i className="ri-user-3-line text-[#94A3B8] text-[10px]"></i>
                  {job.contractor}
                </span>
              </>
            )}
            <span className="text-[#CBD5E1]">·</span>
            <span>Target: {job.targetDate}</span>
          </div>
          {job.responsibleRole && (
            <p className="text-xs text-[#94A3B8] mt-1">
              Next: {job.responsibleRole} — {job.nextAction || statusCfg.description}
            </p>
          )}
        </div>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <i className={`ri-arrow-down-s-line text-[#94A3B8] transition-transform ${isExpanded ? "rotate-180" : ""}`}></i>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[#D5D9D5] pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#FBF9F4] rounded-lg p-3">
              <p className="text-[10px] text-[#94A3B8] uppercase">Status</p>
              <p className={`text-sm font-medium ${statusCfg.color}`}>{statusCfg.label}</p>
            </div>
            <div className="bg-[#FBF9F4] rounded-lg p-3">
              <p className="text-[10px] text-[#94A3B8] uppercase">Priority</p>
              <p className={`text-sm font-medium ${priorityCfg.color}`}>{job.priority}</p>
            </div>
            <div className="bg-[#FBF9F4] rounded-lg p-3">
              <p className="text-[10px] text-[#94A3B8] uppercase">Reported</p>
              <p className="text-sm font-medium text-[#3A3F3A]">{job.reportedDate}</p>
            </div>
            <div className="bg-[#FBF9F4] rounded-lg p-3">
              <p className="text-[10px] text-[#94A3B8] uppercase">Target</p>
              <p className="text-sm font-medium text-[#3A3F3A]">{job.targetDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#D5D9D5]">
            {job.responsibleRole && (
              <span className="text-xs text-[#687068] flex items-center gap-1">
                <i className="ri-user-star-line text-[#C28A78]"></i>
                <span className="font-medium">{job.responsibleRole}</span> — {statusCfg.description}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onView?.(); }}
              className="ml-auto text-sm text-[#C28A78] font-medium hover:text-[#143828] transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}