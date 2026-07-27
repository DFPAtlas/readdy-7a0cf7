export interface SetupStep {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const agencySteps: SetupStep[] = [
  { id: "profile", label: "Agency Profile", icon: "ri-building-4-line", description: "Set up your agency details" },
  { id: "portfolio", label: "Portfolio Import", icon: "ri-upload-cloud-line", description: "Import or add properties" },
  { id: "landlords", label: "Landlords", icon: "ri-user-star-line", description: "Add property owners" },
  { id: "properties", label: "Properties", icon: "ri-home-4-line", description: "Configure your properties" },
  { id: "tenants", label: "Tenants", icon: "ri-user-3-line", description: "Add tenant records" },
  { id: "tenancies", label: "Tenancies", icon: "ri-file-text-line", description: "Link tenants to properties" },
  { id: "owner-portals", label: "Owner Portals", icon: "ri-macbook-line", description: "Set up landlord access" },
  { id: "tenant-portals", label: "Tenant Portals", icon: "ri-smartphone-line", description: "Set up tenant access" },
  { id: "compliance", label: "Compliance Setup", icon: "ri-shield-check-line", description: "Configure compliance tracking" },
  { id: "review", label: "Review Dashboard", icon: "ri-dashboard-line", description: "Explore your dashboard" },
];

export const ownerSteps: SetupStep[] = [
  { id: "profile", label: "Owner Profile", icon: "ri-user-settings-line", description: "Set up your profile" },
  { id: "properties", label: "Add Properties", icon: "ri-home-4-line", description: "Add up to 5 properties" },
  { id: "tenants", label: "Add Tenants", icon: "ri-user-3-line", description: "Add your tenants" },
  { id: "portals", label: "Tenant Portals", icon: "ri-smartphone-line", description: "Set up tenant access" },
  { id: "documents", label: "Compliance Documents", icon: "ri-folder-line", description: "Upload certificates" },
  { id: "review", label: "Review Dashboard", icon: "ri-dashboard-line", description: "Explore your dashboard" },
];

export const agencyQuestions: Record<string, { label: string; fields: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[] }> = {
  profile: {
    label: "Agency Profile",
    fields: [
      { name: "companyName", label: "Agency Name", type: "text", placeholder: "e.g. Oakwood Lettings", required: true },
      { name: "displayName", label: "Contact Name", type: "text", placeholder: "e.g. Sarah Jenkins", required: true },
      { name: "email", label: "Agency Email", type: "email", placeholder: "e.g. info@oakwoodlettings.co.uk", required: true },
      { name: "phone", label: "Phone Number", type: "text", placeholder: "e.g. 020 7946 0000" },
      { name: "staffCount", label: "Number of Staff", type: "text", placeholder: "e.g. 5-10" },
      { name: "yearsTrading", label: "Years Trading", type: "text", placeholder: "e.g. 8" },
    ],
  },
  portfolio: {
    label: "Portfolio Setup",
    fields: [],
  },
  landlords: {
    label: "Add Landlords",
    fields: [],
  },
  properties: {
    label: "Add Properties",
    fields: [],
  },
  tenants: {
    label: "Add Tenants",
    fields: [],
  },
  tenancies: {
    label: "Create Tenancies",
    fields: [],
  },
  "owner-portals": {
    label: "Owner Portal Setup",
    fields: [],
  },
  "tenant-portals": {
    label: "Tenant Portal Setup",
    fields: [],
  },
  compliance: {
    label: "Compliance Configuration",
    fields: [],
  },
  review: {
    label: "Review Your Dashboard",
    fields: [],
  },
};

export const ownerQuestions: Record<string, { label: string; fields: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[] }> = {
  profile: {
    label: "Owner Profile",
    fields: [
      { name: "displayName", label: "Your Name", type: "text", placeholder: "e.g. David Mitchell", required: true },
      { name: "email", label: "Email Address", type: "email", placeholder: "e.g. david@example.com", required: true },
      { name: "phone", label: "Phone Number", type: "text", placeholder: "e.g. 07700 900000" },
      { name: "propertyCount", label: "How many properties do you own?", type: "text", placeholder: "e.g. 3" },
    ],
  },
  properties: {
    label: "Your Properties",
    fields: [],
  },
  tenants: {
    label: "Your Tenants",
    fields: [],
  },
  portals: {
    label: "Tenant Portal Setup",
    fields: [],
  },
  documents: {
    label: "Compliance Documents",
    fields: [],
  },
  review: {
    label: "Review Your Dashboard",
    fields: [],
  },
};