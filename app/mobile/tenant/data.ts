export interface TenantProfile {
  name: string;
  initials: string;
  propertyName: string;
  propertyAddress: string;
  tenancyRef: string;
  moveInDate: string;
  tenancyEndDate: string;
  monthlyRent: number;
  depositAmount: number;
  depositScheme: string;
}

export interface RentPayment {
  month: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: "Open" | "In Progress" | "Under Review" | "Completed";
  date: string;
  lastUpdate: string;
  photos?: number;
}

export interface TenantDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  color: string;
  icon: string;
}

export interface TenantNotice {
  id: string;
  title: string;
  type: "inspection" | "safety" | "rent" | "general" | "compliance";
  message: string;
  date: string;
  isNew: boolean;
}

export interface TenantMessage {
  id: string;
  from: string;
  fromRole: string;
  subject: string;
  message: string;
  date: string;
  isNew: boolean;
}

export interface TenantQuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: string;
  badge?: number;
}

export const tenantProfile: TenantProfile = {
  name: "Emily Carter",
  initials: "EC",
  propertyName: "Flat 4B, Oak Street",
  propertyAddress: "Manchester, M20 3NB",
  tenancyRef: "TNC-2026-0042",
  moveInDate: "15 Mar 2026",
  tenancyEndDate: "14 Mar 2027",
  monthlyRent: 950,
  depositAmount: 1096,
  depositScheme: "TDS Insured",
};

export const rentHistory: RentPayment[] = [
  { month: "June 2026", amount: 950, status: "paid", date: "1 Jun 2026" },
  { month: "May 2026", amount: 950, status: "paid", date: "1 May 2026" },
  { month: "April 2026", amount: 950, status: "paid", date: "1 Apr 2026" },
  { month: "March 2026", amount: 950, status: "paid", date: "15 Mar 2026" },
  { month: "February 2026", amount: 950, status: "paid", date: "1 Feb 2026" },
  { month: "January 2026", amount: 950, status: "paid", date: "3 Jan 2026" },
];

export const maintenanceRequests: MaintenanceRequest[] = [
  {
    id: "MR-0042",
    title: "Leaking bathroom tap",
    category: "Plumbing",
    description: "The cold water tap in the bathroom sink won't stop dripping. Started last night and getting worse.",
    priority: "Medium",
    status: "In Progress",
    date: "10 Jun 2026",
    lastUpdate: "12 Jun 2026",
    photos: 2,
  },
  {
    id: "MR-0038",
    title: "Kitchen light not working",
    category: "Electrical",
    description: "The main ceiling light in the kitchen has stopped working entirely. Tried replacing the bulb but still no power.",
    priority: "Medium",
    status: "Under Review",
    date: "28 May 2026",
    lastUpdate: "30 May 2026",
    photos: 1,
  },
  {
    id: "MR-0031",
    title: "Radiator not heating",
    category: "Heating",
    description: "The bedroom radiator stays cold even when heating is on full. Bled it twice but no improvement.",
    priority: "High",
    status: "Completed",
    date: "12 Apr 2026",
    lastUpdate: "14 Apr 2026",
    photos: 3,
  },
  {
    id: "MR-0025",
    title: "Window handle broken",
    category: "Structural",
    description: "The handle on the living room window has snapped off. Window is currently stuck closed.",
    priority: "Low",
    status: "Completed",
    date: "22 Mar 2026",
    lastUpdate: "25 Mar 2026",
    photos: 2,
  },
];

export const tenantDocuments: TenantDocument[] = [
  { id: "d1", name: "Tenancy Agreement", type: "Agreement", date: "15 Mar 2026", size: "2.4 MB", color: "bg-[#3B82F6]", icon: "ri-file-text-line" },
  { id: "d2", name: "Inventory Checklist", type: "Inventory", date: "15 Mar 2026", size: "1.8 MB", color: "bg-[#14B8A6]", icon: "ri-clipboard-line" },
  { id: "d3", name: "EPC Certificate", type: "Certificate", date: "10 Mar 2026", size: "890 KB", color: "bg-[#10B981]", icon: "ri-flashlight-line" },
  { id: "d4", name: "Gas Safety Certificate", type: "Certificate", date: "8 Mar 2026", size: "1.2 MB", color: "bg-[#F59E0B]", icon: "ri-fire-line" },
  { id: "d5", name: "Electrical Safety Report", type: "Report", date: "5 Mar 2026", size: "3.1 MB", color: "bg-[#8B5CF6]", icon: "ri-plug-line" },
  { id: "d6", name: "How to Rent Guide", type: "Guide", date: "15 Mar 2026", size: "4.5 MB", color: "bg-[#687068]", icon: "ri-book-open-line" },
  { id: "d7", name: "Deposit Certificate", type: "Certificate", date: "15 Mar 2026", size: "560 KB", color: "bg-[#EC4899]", icon: "ri-secure-payment-line" },
];

export const tenantNotices: TenantNotice[] = [
  {
    id: "n1",
    title: "Routine Property Inspection",
    type: "inspection",
    message: "Your letting agent will visit on Thursday 15 July 2026 between 9am-11am for a routine inspection. Please ensure access is available. You do not need to be present.",
    date: "1 Jul 2026",
    isNew: true,
  },
  {
    id: "n2",
    title: "Annual Gas Safety Check",
    type: "safety",
    message: "The annual gas safety inspection is scheduled for Monday 20 June 2026. A Gas Safe registered engineer will need access to the boiler and all gas appliances. The inspection takes approximately 30 minutes.",
    date: "10 Jun 2026",
    isNew: false,
  },
  {
    id: "n3",
    title: "Rent Payment Confirmation",
    type: "rent",
    message: "Your rent payment of £950.00 for June 2026 has been received. Thank you. Your next payment of £950.00 is due on 1 July 2026.",
    date: "1 Jun 2026",
    isNew: false,
  },
  {
    id: "n4",
    title: "Fire Safety Reminder",
    type: "safety",
    message: "Please test your smoke alarms weekly. The smoke alarm in the hallway was tested during your move-in inspection. Replacement batteries are your responsibility as per your tenancy agreement.",
    date: "20 May 2026",
    isNew: false,
  },
  {
    id: "n5",
    title: "Tenancy Renewal Reminder",
    type: "general",
    message: "Your tenancy at Flat 4B, Oak Street is due to end on 14 March 2027. If you wish to renew, please let us know at least 2 months before the end date.",
    date: "1 May 2026",
    isNew: false,
  },
];

export const tenantMessages: TenantMessage[] = [
  {
    id: "m1",
    from: "Alex Smith",
    fromRole: "Property Manager",
    subject: "Re: Bathroom tap repair",
    message: "Hi Emily, thanks for reporting the leaking tap. I've booked a plumber for this Thursday between 2pm-4pm. They'll call 30 minutes before arrival. Let me know if that works for you.",
    date: "12 Jun 2026",
    isNew: true,
  },
  {
    id: "m2",
    from: "Alex Smith",
    fromRole: "Property Manager",
    subject: "Upcoming inspection",
    message: "Hi Emily, just a heads-up that we'll be conducting the quarterly inspection on 15th July. It's a routine check - nothing to worry about. The inspection takes about 20 minutes.",
    date: "5 Jun 2026",
    isNew: false,
  },
  {
    id: "m3",
    from: "LetHub Support",
    fromRole: "Accounts Team",
    subject: "Rent payment received - June 2026",
    message: "We can confirm receipt of your rent payment of £950.00 for June 2026. Your rent account is fully up to date. Thank you for your prompt payment.",
    date: "1 Jun 2026",
    isNew: false,
  },
  {
    id: "m4",
    from: "Alex Smith",
    fromRole: "Property Manager",
    subject: "Kitchen light issue update",
    message: "Hi Emily, the electrician has reviewed your report about the kitchen light. They suspect a wiring fault and will need to do a full inspection. I'll confirm the appointment time once scheduled.",
    date: "30 May 2026",
    isNew: false,
  },
  {
    id: "m5",
    from: "Alex Smith",
    fromRole: "Property Manager",
    subject: "Welcome to LetHub!",
    message: "Welcome Emily! I'm Alex, your property manager at Cooper & Co. If you ever need anything - whether it's a repair, a question about your tenancy, or just some advice - feel free to reach out anytime. You can message me here or call the office.",
    date: "15 Mar 2026",
    isNew: false,
  },
];

export const tenantQuickActions: TenantQuickAction[] = [
  { id: "report", label: "Report Issue", icon: "ri-tools-line", color: "#EF4444", action: "report" },
  { id: "photo", label: "Upload Photo", icon: "ri-camera-line", color: "#3B82F6", action: "photo" },
  { id: "docs", label: "Tenancy Docs", icon: "ri-file-list-3-line", color: "#14B8A6", action: "docs" },
  { id: "contact", label: "Contact Manager", icon: "ri-customer-service-2-line", color: "#8B5CF6", action: "contact" },
];

export const agentInfo = {
  name: "Alex Smith",
  role: "Property Manager",
  agency: "Cooper & Co Estates",
  phone: "0161 329 0456",
  email: "alex.smith@cooperco.co.uk",
  hours: "Mon-Fri, 9am-5pm",
};

export function getStatusColor(status: string): string {
  switch (status) {
    case "Open": return "#F59E0B";
    case "In Progress": return "#3B82F6";
    case "Under Review": return "#8B5CF6";
    case "Completed": return "#10B981";
    default: return "#94A3B8";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "Emergency": return "#EF4444";
    case "High": return "#F59E0B";
    case "Medium": return "#3B82F6";
    case "Low": return "#10B981";
    default: return "#94A3B8";
  }
}

export function getNoticeIcon(type: string): { icon: string; color: string; bg: string } {
  switch (type) {
    case "inspection": return { icon: "ri-clipboard-line", color: "#14B8A6", bg: "#14B8A6" };
    case "safety": return { icon: "ri-shield-check-line", color: "#EF4444", bg: "#EF4444" };
    case "rent": return { icon: "ri-coins-line", color: "#10B981", bg: "#10B981" };
    case "compliance": return { icon: "ri-file-shield-line", color: "#8B5CF6", bg: "#8B5CF6" };
    default: return { icon: "ri-message-3-line", color: "#3B82F6", bg: "#3B82F6" };
  }
}