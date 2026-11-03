"use client";

import { useAccountProfile } from "@/lib/accountProfile";

const WORKSPACE_ROLE_LABELS: Record<string, string> = {
  agency_admin: "Agency administrator",
  admin: "Agency administrator",
  manager: "Manager",
  agent: "Agent",
  staff: "Team member",
  viewer: "Viewer",
};

export default function AgencyProfileCard() {
  const { profile, loading, error } = useAccountProfile();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-3">
        <div className="h-5 w-32 rounded bg-[#F1F5F9] animate-pulse" />
        <div className="h-10 rounded bg-[#F1F5F9] animate-pulse" />
        <div className="h-10 rounded bg-[#F1F5F9] animate-pulse" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-xl border border-[#FECACA] p-6">
        <p className="text-sm font-medium text-[#3A3F3A]">Agency details unavailable</p>
        <p className="text-xs text-[#687068] mt-1">{error || "Please refresh the page and try again."}</p>
      </div>
    );
  }

  const rows = [
    { label: "Agency name", value: profile.agencyName || "Not linked to an agency" },
    {
      label: "Your workspace role",
      value: profile.workspaceRole
        ? WORKSPACE_ROLE_LABELS[profile.workspaceRole.toLowerCase()] || profile.workspaceRole
        : "Not assigned",
    },
    { label: "Account email", value: profile.email },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#D5D9D5] p-6 space-y-4">
        <h2 className="font-semibold text-[#3A3F3A]">Agency Information</h2>
        <div className="divide-y divide-[#D5D9D5]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-[#687068]">{row.label}</span>
              <span className="text-sm font-medium text-[#3A3F3A] text-right break-words">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#D5D9D5] bg-[#FBF9F4] p-4">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#D5D9D5] flex-shrink-0">
          <i className="ri-information-line text-[#C28A78] text-sm"></i>
        </div>
        <p className="text-xs leading-5 text-[#687068]">
          Agency name and registration details are controlled by your platform administrator. Ask them to make changes,
          or open Team &amp; Permissions to manage who has access.
        </p>
      </div>
    </div>
  );
}