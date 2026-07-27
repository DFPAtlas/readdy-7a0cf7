export interface SetupChecklistItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  link: string;
  weight: number;
}

export const agencyChecklist: SetupChecklistItem[] = [
  { id: "profile", label: "Profile Complete", icon: "ri-user-settings-line", description: "Set up your agency profile details", link: "/dashboard/setup", weight: 10 },
  { id: "portfolio", label: "Portfolio Imported", icon: "ri-upload-cloud-line", description: "Import or add properties to your portfolio", link: "/dashboard/import", weight: 15 },
  { id: "properties", label: "Properties Added", icon: "ri-home-4-line", description: "Configure your property details", link: "/dashboard/portfolio", weight: 15 },
  { id: "owners", label: "Owners Added", icon: "ri-user-star-line", description: "Add landlords and property owners", link: "/dashboard/landlords", weight: 15 },
  { id: "tenants", label: "Tenants Added", icon: "ri-user-3-line", description: "Add tenant records to your properties", link: "/dashboard/tenants", weight: 15 },
  { id: "documents", label: "Documents Uploaded", icon: "ri-folder-line", description: "Upload compliance certificates and tenancy docs", link: "/dashboard/documents", weight: 10 },
  { id: "compliance", label: "Compliance Configured", icon: "ri-shield-check-line", description: "Set up compliance tracking for your properties", link: "/dashboard/compliance", weight: 10 },
  { id: "portals", label: "Portal Setup Complete", icon: "ri-macbook-line", description: "Set up owner and tenant access portals", link: "/dashboard/portal-setup", weight: 10 },
];

export const ownerChecklist: SetupChecklistItem[] = [
  { id: "profile", label: "Profile Complete", icon: "ri-user-settings-line", description: "Set up your owner profile", link: "/dashboard/setup", weight: 15 },
  { id: "properties", label: "Properties Added", icon: "ri-home-4-line", description: "Add your rental properties", link: "/dashboard/portfolio", weight: 25 },
  { id: "tenants", label: "Tenants Added", icon: "ri-user-3-line", description: "Add your tenants", link: "/dashboard/tenants", weight: 20 },
  { id: "documents", label: "Documents Uploaded", icon: "ri-folder-line", description: "Upload gas safety, EPC, and other certificates", link: "/dashboard/documents", weight: 15 },
  { id: "compliance", label: "Compliance Complete", icon: "ri-shield-check-line", description: "Ensure all certificates are valid", link: "/dashboard/compliance", weight: 15 },
  { id: "portals", label: "Tenant Portal Active", icon: "ri-macbook-line", description: "Give tenants access to their portal", link: "/dashboard/portal-setup", weight: 10 },
];

export function getChecklistForAccountType(accountType: string | null): SetupChecklistItem[] {
  if (accountType === "owner") return ownerChecklist;
  return agencyChecklist;
}

export function calculateProgress(checklist: SetupChecklistItem[], completedIds: string[]): number {
  const totalWeight = checklist.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = checklist
    .filter((item) => completedIds.includes(item.id))
    .reduce((sum, item) => sum + item.weight, 0);
  return Math.round((completedWeight / totalWeight) * 100);
}

export function getNextBestActions(
  checklist: SetupChecklistItem[],
  completedIds: string[],
  accountType: string | null
): { label: string; description: string; icon: string; link: string; priority: "high" | "medium" | "low" }[] {
  const incomplete = checklist.filter((item) => !completedIds.includes(item.id));

  const priorityMap: Record<string, "high" | "medium" | "low"> = {};
  if (accountType === "owner") {
    priorityMap.profile = "high";
    priorityMap.properties = "high";
    priorityMap.tenants = "high";
    priorityMap.documents = "medium";
    priorityMap.compliance = "medium";
    priorityMap.portals = "low";
  } else {
    priorityMap.profile = "high";
    priorityMap.portfolio = "high";
    priorityMap.properties = "high";
    priorityMap.owners = "high";
    priorityMap.tenants = "medium";
    priorityMap.documents = "medium";
    priorityMap.compliance = "medium";
    priorityMap.portals = "low";
  }

  return incomplete.slice(0, 3).map((item) => ({
    label: item.label,
    description: item.description,
    icon: item.icon,
    link: item.link,
    priority: priorityMap[item.id] || "medium",
  }));
}