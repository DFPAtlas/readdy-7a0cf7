"use client";

import { PortalIssue, getPortalStatus, portalTypeConfig } from "@/lib/portalStatus";

interface Props {
  issues: PortalIssue[];
  onAction: (issue: PortalIssue) => void;
}

export default function PortalActionCentre({ issues, onAction }: Props) {
  if (issues.length === 0) {
    return (
      <div className="bg-[#F0F9F0] border border-[#A7F3D0]/50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#7A9A7E]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="ri-check-line text-[#7A9A7E] text-lg"></i>
        </div>
        <div>
          <p className="text-sm font-medium text-[#3A3F3A]">No portal issues</p>
          <p className="text-xs text-[#687068]">All portal access is working correctly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#D5D9D5] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D9D5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
            <i className="ri-alert-line text-[#F59E0B] text-sm"></i>
          </div>
          <h2 className="font-semibold text-[#3A3F3A]">Portal Issues</h2>
          <span className="text-xs font-medium text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">{issues.length}</span>
        </div>
        {issues.length > 5 && (
          <button onClick={() => onAction(issues[0])} className="text-xs font-medium text-[#C28A78] hover:underline whitespace-nowrap">
            View all issues
          </button>
        )}
      </div>
      <div className="divide-y divide-[#D5D9D5]">
        {issues.slice(0, 5).map((issue) => {
          const status = getPortalStatus(issue.accessKey);
          const portalType = portalTypeConfig[issue.portalType] || portalTypeConfig.owner;
          const priorityColor = issue.priority === "critical"
            ? "bg-[#EF4444]/10 text-[#EF4444]"
            : issue.priority === "high"
            ? "bg-[#F59E0B]/10 text-[#F59E0B]"
            : "bg-[#3B82F6]/10 text-[#3B82F6]";

          return (
            <div key={issue.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBF9F4] transition-colors">
              <div className={`w-10 h-10 ${status.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${status.icon} ${status.color} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityColor}`}>{issue.priority}</span>
                  <span className="text-xs text-[#687068]">{portalType.label}</span>
                </div>
                <p className="text-sm font-medium text-[#3A3F3A] mt-0.5">{issue.personName}</p>
                <p className="text-xs text-[#687068]">{issue.relatedRecord} · {issue.issue}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{issue.issueDate}</p>
              </div>
              <button
                onClick={() => onAction(issue)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#C28A78] rounded-lg hover:bg-[#143828] transition-colors whitespace-nowrap"
              >
                {issue.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}