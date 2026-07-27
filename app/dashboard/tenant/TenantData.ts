export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  property: string;
  address: string;
  status: "Reported" | "Under Review" | "Quote Requested" | "Awaiting Approval" | "Scheduled" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High" | "Emergency";
  category: string;
  reportedDate: string;
  updatedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  contractor?: string;
  contractorTrade?: string;
  photos: string[];
  videos: string[];
  comments: { author: string; role: string; text: string; time: string; avatar?: string }[];
}

export interface TenancyDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  icon: string;
  color: string;
  description: string;
}

export interface PropertyManager {
  name: string;
  role: string;
  email: string;
  phone: string;
  office: string;
  officeHours: string;
  avatar: string;
}

export const tickets: MaintenanceTicket[] = [
  {
    id: "t1",
    title: "Leaking kitchen tap",
    description: "The cold water tap under the kitchen sink has been dripping for two days. It seems to be getting worse and there is a small pool of water collecting in the cupboard underneath.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "In Progress",
    priority: "Medium",
    category: "Plumbing",
    reportedDate: "18 May 2026",
    updatedDate: "20 May 2026",
    scheduledDate: "22 May 2026",
    contractor: "GreenPlumb Ltd",
    contractorTrade: "Plumbing",
    photos: [],
    videos: [],
    comments: [
      { author: "You", role: "Tenant", text: "The drip is now constant. I have placed a bowl underneath to catch the water.", time: "18 May 2026, 09:15" },
      { author: "Sarah Collins", role: "Property Manager", text: "Thanks for the update. I have assigned GreenPlumb Ltd and scheduled them for Thursday morning.", time: "19 May 2026, 14:30" },
      { author: "GreenPlumb Ltd", role: "Contractor", text: "We will attend between 9am and 12pm on Thursday. No need to be present.", time: "20 May 2026, 08:00" },
    ],
  },
  {
    id: "t2",
    title: "Living room radiator not heating",
    description: "The radiator in the living room is cold even when the heating is on. All other radiators in the flat are working fine.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Awaiting Approval",
    priority: "High",
    category: "Heating",
    reportedDate: "25 May 2026",
    updatedDate: "28 May 2026",
    contractor: "HeatFirst Services",
    contractorTrade: "Heating Engineer",
    photos: [],
    videos: [],
    comments: [
      { author: "You", role: "Tenant", text: "Heating is on max but the living room is freezing. I need this fixed urgently.", time: "25 May 2026, 17:45" },
      { author: "Sarah Collins", role: "Property Manager", text: "I have requested a quote from HeatFirst Services. Will update once the landlord approves.", time: "26 May 2026, 10:20" },
      { author: "HeatFirst Services", role: "Contractor", text: "Quote submitted: £185 + VAT for valve replacement and system bleed. Awaiting approval.", time: "28 May 2026, 11:00" },
    ],
  },
  {
    id: "t3",
    title: "Bedroom light switch broken",
    description: "The main light switch in the master bedroom feels loose and does not always turn the light on. I have to press it multiple times.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Scheduled",
    priority: "Low",
    category: "Electrical",
    reportedDate: "29 May 2026",
    updatedDate: "30 May 2026",
    scheduledDate: "2 Jun 2026",
    contractor: "BrightSpark Electrical",
    contractorTrade: "Electrician",
    photos: [],
    videos: [],
    comments: [
      { author: "You", role: "Tenant", text: "The switch is getting worse. Sometimes it takes 5 or 6 presses to work.", time: "29 May 2026, 20:10" },
      { author: "Sarah Collins", role: "Property Manager", text: "BrightSpark Electrical will attend on Tuesday 2nd June between 2pm and 5pm.", time: "30 May 2026, 09:00" },
    ],
  },
  {
    id: "t4",
    title: "Bathroom extractor fan noisy",
    description: "The extractor fan in the bathroom makes a loud grinding noise when switched on. It still works but sounds like it is about to break.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Under Review",
    priority: "Medium",
    category: "Electrical",
    reportedDate: "30 May 2026",
    updatedDate: "30 May 2026",
    photos: [],
    videos: [],
    comments: [
      { author: "You", role: "Tenant", text: "Fan noise is very loud. I am worried it will stop working completely.", time: "30 May 2026, 08:30" },
    ],
  },
  {
    id: "t5",
    title: "Front door lock sticking",
    description: "The front door lock is stiff and hard to turn. I have to wiggle the key to get it to unlock.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Completed",
    priority: "Medium",
    category: "Locksmith",
    reportedDate: "10 May 2026",
    updatedDate: "15 May 2026",
    completedDate: "15 May 2026",
    contractor: "SecureFix",
    contractorTrade: "Locksmith",
    photos: [],
    videos: [],
    comments: [
      { author: "You", role: "Tenant", text: "Lock is getting harder to turn. Sometimes it takes a minute to get in.", time: "10 May 2026, 18:00" },
      { author: "Sarah Collins", role: "Property Manager", text: "SecureFix will attend tomorrow.", time: "11 May 2026, 10:00" },
      { author: "SecureFix", role: "Contractor", text: "Lock mechanism lubricated and realigned. Working smoothly now.", time: "15 May 2026, 16:00" },
      { author: "You", role: "Tenant", text: "Much better, thank you!", time: "15 May 2026, 19:30" },
    ],
  },
  {
    id: "t6",
    title: "Mould on bathroom ceiling",
    description: "Black mould spots appearing on the bathroom ceiling above the shower. I wipe them but they keep coming back.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Quote Requested",
    priority: "High",
    category: "Damp & Mould",
    reportedDate: "22 May 2026",
    updatedDate: "25 May 2026",
    photos: [],
    videos: [],
    comments: [
      { author: "You", role: "Tenant", text: "Mould is spreading. I have photos if needed.", time: "22 May 2026, 10:00" },
      { author: "Sarah Collins", role: "Property Manager", text: "I have sent a damp specialist to assess. Awaiting their quote.", time: "25 May 2026, 14:00" },
    ],
  },
];

export const tenancyDocs: TenancyDocument[] = [
  { id: "td1", name: "Tenancy Agreement - Rose Court Flat 2A.pdf", type: "Tenancy", date: "15 Sep 2024", size: "1.2 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]", description: "Signed AST tenancy agreement for 24-month fixed term" },
  { id: "td2", name: "Inventory Check-in Report.pdf", type: "Inventory", date: "15 Sep 2024", size: "2.4 MB", icon: "ri-file-list-line", color: "bg-[#F59E0B]", description: "Full inventory and condition report at move-in" },
  { id: "td3", name: "Gas Safety Certificate 2026.pdf", type: "Compliance", date: "12 Mar 2026", size: "0.8 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]", description: "Annual gas safety certificate CP12" },
  { id: "td4", name: "EPC Certificate.pdf", type: "Compliance", date: "20 Oct 2023", size: "0.5 MB", icon: "ri-leaf-line", color: "bg-[#14B8A6]", description: "Energy Performance Certificate rating C" },
  { id: "td5", name: "How to Rent Guide.pdf", type: "Guide", date: "15 Sep 2024", size: "1.5 MB", icon: "ri-book-open-line", color: "bg-[#8B5CF6]", description: "Government how to rent guide" },
  { id: "td6", name: "Deposit Protection Certificate.pdf", type: "Financial", date: "15 Sep 2024", size: "0.3 MB", icon: "ri-bank-card-line", color: "bg-[#EF4444]", description: "MyDeposits scheme registration certificate" },
  { id: "td7", name: "Rent Payment Schedule.pdf", type: "Financial", date: "15 Sep 2024", size: "0.4 MB", icon: "ri-calendar-line", color: "bg-[#D4A574]", description: "Monthly rent payment schedule and standing order details" },
  { id: "td8", name: "Building Insurance Policy.pdf", type: "Insurance", date: "01 Jan 2026", size: "3.2 MB", icon: "ri-shield-line", color: "bg-[#EF4444]", description: "Landlord building insurance policy summary" },
];

export const propertyManager: PropertyManager = {
  name: "Sarah Collins",
  role: "Property Manager",
  email: "sarah.collins@lethub.uk",
  phone: "+44 20 7946 0958",
  office: "LetHub London Office",
  officeHours: "Mon-Fri 9am-5:30pm",
  avatar: "https://readdy.ai/api/search-image?query=Professional female property manager headshot portrait, business attire, warm smile, clean neutral studio background, corporate professional photography, soft lighting",
};

export const tenancyInfo = {
  property: "Rose Court Flat 2A",
  address: "12 Rose Avenue, London E1 6AN",
  landlord: "Oakfield Properties Ltd",
  agent: "LetHub Property Management",
  startDate: "15 Sep 2024",
  endDate: "14 Sep 2026",
  rent: "£1,850",
  deposit: "£1,850",
  depositScheme: "MyDeposits",
  rentDueDay: "1st of each month",
  nextInspection: "20 Jun 2026",
  noticeRequired: "2 months",
};