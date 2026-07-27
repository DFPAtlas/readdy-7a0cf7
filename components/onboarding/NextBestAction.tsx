"use client";

import Link from "next/link";
import { getNextBestActions } from "@/lib/onboardingData";

interface NextBestActionProps {
  accountType: string | null;
  completedIds: string[];
  demoMode?: boolean;
}

export default function NextBestAction({ accountType, completedIds, demoMode }: NextBestActionProps) {
  const checklist = (accountType === "owner"
    ? [{ id: "profile", label: "Profile Complete", icon: "ri-user-settings-line", description: "Set up your owner profile", link: "/dashboard/setup", weight: 15 },
       { id: "properties", label: "Properties Added", icon: "ri-home-4-line", description: "Add your rental properties", link: "/dashboard/portfolio", weight: 25 },
       { id: "tenants", label: "Tenants Added", icon: "ri-user-3-line", description: "Add your tenants", link: "/dashboard/tenants", weight: 20 },
       { id: "documents", label: "Documents Uploaded", icon: "ri-folder-line", description: "Upload gas safety, EPC, and other certificates", link: "/dashboard/documents", weight: 15 },
       { id: "compliance", label: "Compliance Complete", icon: "ri-shield-check-line", description: "Ensure all certificates are valid", link: "/dashboard/compliance", weight: 15 },
       { id: "portals", label: "Tenant Portal Active", icon: "ri-macbook-line", description: "Give tenants access to their portal", link: "/dashboard/portal-setup", weight: 10 }]
    : [{ id: "profile", label: "Profile Complete", icon: "ri-user-settings-line", description: "Set up your agency profile details", link: "/dashboard/setup", weight: 10 },
       { id: "portfolio", label: "Portfolio Imported", icon: "ri-upload-cloud-line", description: "Import or add properties to your portfolio", link: "/dashboard/import", weight: 15 },
       { id: "properties", label: "Properties Added", icon: "ri-home-4-line", description: "Configure your property details", link: "/dashboard/portfolio", weight: 15 },
       { id: "owners", label: "Owners Added", icon: "ri-user-star-line", description: "Add landlords and property owners", link: "/dashboard/landlords", weight: 15 },
       { id: "tenants", label: "Tenants Added", icon: "ri-user-3-line", description: "Add tenant records to your properties", link: "/dashboard/tenants", weight: 15 },
       { id: "documents", label: "Documents Uploaded", icon: "ri-folder-line", description: "Upload compliance certificates and tenancy docs", link: "/dashboard/documents", weight: 10 },
       { id: "compliance", label: "Compliance Configured", icon: "ri-shield-check-line", description: "Set up compliance tracking for your properties", link: "/dashboard/compliance", weight: 10 },
       { id: "portals", label: "Portal Setup Complete", icon: "ri-macbook-line", description: "Set up owner and tenant access portals", link: "/dashboard/portal-setup", weight: 10 }]);

  const actions = getNextBestActions(checklist, completedIds, accountType);

  if (actions.length === 0) return null;

  const priorityColors: Record<string, string> = {
    high: "border-l-[#EF4444]",
    medium: "border-l-[#F59E0B]",
    low: "border-l-[#3B82F6]",
  };

  const priorityLabels: Record<string, string> = {
    high: "Do first",
    medium: "Next up",
    low: "Nice to have",
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#C28A78]/10 rounded-lg flex items-center justify-center">
          <i className="ri-lightbulb-line text-[#C28A78] text-lg"></i>
        </div>
        <div>
          <h3 className="font-semibold text-[#3A3F3A] text-sm">Your Next Best Action</h3>
          <p className="text-xs text-[#687068]">
            {completedIds.length === 0
              ? "Let's get your account set up!"
              : `${actions.length} suggested next step${actions.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.link}
            className={`flex items-center gap-3 p-3 rounded-lg border border-l-[3px] ${priorityColors[action.priority]} bg-[#F8FAFC] hover:bg-white hover:shadow-sm transition-all group`}
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 group-hover:border-[#C28A78]/30 transition-colors">
              <i className={`${action.icon} text-[#C28A78] text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#3A3F3A] truncate">{action.label}</p>
              <p className="text-xs text-[#687068] truncate">{action.description}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
              action.priority === "high"
                ? "bg-[#EF4444]/10 text-[#EF4444]"
                : action.priority === "medium"
                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                : "bg-[#3B82F6]/10 text-[#3B82F6]"
            }`}>
              {priorityLabels[action.priority]}
            </span>
          </Link>
        ))}
      </div>

      {demoMode && (
        <p className="text-[10px] text-[#94A3B8] mt-3 text-center">
          Demo tip: Complete these steps to see how the setup tracker works.
        </p>
      )}
    </div>
  );
}