export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  deposit: number;
  status: string;
  tenant: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantMoveIn: string;
  tenantEnd: string;
  epc: string;
  image: string;
}

export interface MaintenanceJob {
  id: string;
  property: string;
  title: string;
  priority: string;
  status: string;
  contractor: string;
  reported: string;
  due: string;
  description: string;
  quoteId?: string;
}

export interface Quote {
  id: string;
  jobId: string;
  property: string;
  jobTitle: string;
  contractor: string;
  contractorTrade: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  submittedDate: string;
  validUntil: string;
  status: string;
  description: string;
  breakdown: { item: string; cost: number }[];
}

export interface ComplianceCert {
  id: string;
  type: string;
  property: string;
  status: string;
  expiry: string;
  daysLeft: number;
  icon: string;
  color: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  property: string;
  date: string;
  size: string;
  icon: string;
  color: string;
}

export interface InspectionReport {
  id: string;
  type: string;
  property: string;
  status: string;
  rating: string;
  date: string;
  inspector: string;
  notes: string;
}

export const inspectionReports: InspectionReport[] = [
  {
    id: "ir1",
    type: "Routine Inspection",
    property: "Rose Court Flat 2A",
    status: "Completed",
    rating: "Good",
    date: "12 Jun 2026",
    inspector: "Sarah Jenkins",
    notes: "Property in good condition overall. Minor scuff marks on hallway wall. Kitchen appliances all functional. Bathroom sealant showing early signs of wear — recommend re-sealing within 3 months. Smoke alarms tested and working.",
  },
  {
    id: "ir2",
    type: "Routine Inspection",
    property: "Riverside Court",
    status: "Completed",
    rating: "Excellent",
    date: "05 May 2026",
    inspector: "Sarah Jenkins",
    notes: "Excellent condition throughout. Tenant maintaining property to a very high standard. Garden well-kept. No issues to report. All compliance certificates visible in communal areas.",
  },
  {
    id: "ir3",
    type: "Move-out Inspection",
    property: "Maple Gardens House",
    status: "Completed",
    rating: "Good",
    date: "20 Apr 2026",
    inspector: "David Chen",
    notes: "Property returned in good condition with expected wear and tear. Carpet in master bedroom has a stain that may require professional cleaning. Garden overgrown but structural elements intact. Meter readings recorded and shared.",
  },
  {
    id: "ir4",
    type: "Mid-term Inspection",
    property: "Rose Court Flat 2A",
    status: "Completed",
    rating: "Good",
    date: "08 Mar 2026",
    inspector: "Sarah Jenkins",
    notes: "Mid-term check completed. Boiler service due within 60 days — tenant informed. Window seals intact. No damp or mould detected. Tenant raised minor concern about kitchen tap pressure — referred to maintenance.",
  },
  {
    id: "ir5",
    type: "Routine Inspection",
    property: "Riverside Court",
    status: "Scheduled",
    rating: "—",
    date: "28 Jul 2026",
    inspector: "Sarah Jenkins",
    notes: "",
  },
  {
    id: "ir6",
    type: "Routine Inspection",
    property: "Maple Gardens House",
    status: "Scheduled",
    rating: "—",
    date: "01 Aug 2026",
    inspector: "David Chen",
    notes: "",
  },
];

export const properties: Property[] = [
  {
    id: "p1",
    name: "Rose Court Flat 2A",
    address: "12 Rose Avenue",
    city: "London",
    postcode: "E1 6AN",
    type: "Flat",
    bedrooms: 2,
    bathrooms: 1,
    rent: 1850,
    deposit: 1850,
    status: "Occupied",
    tenant: "John Miller",
    tenantEmail: "john.miller@email.com",
    tenantPhone: "+44 7700 900456",
    tenantMoveIn: "15 Sep 2024",
    tenantEnd: "14 Sep 2026",
    epc: "C",
    image: "https://readdy.ai/api/search-image?query=Modern%20London%20apartment%20building%20exterior%20with%20contemporary%20brick%20and%20glass%20facade%2C%20large%20windows%2C%20clean%20residential%20street%2C%20professional%20architectural%20photography%2C%20soft%20overcast%20daylight%2C%20UK%20property%2C%20clean%20simple%20background%20with%20muted%20tones%20and%20warm%20neutral%20colours&width=400&height=300&seq=ld-prop-1&orientation=landscape",
  },
  {
    id: "p2",
    name: "Riverside Court",
    address: "Unit 3, Riverside Court",
    city: "Bristol",
    postcode: "BS1 4ST",
    type: "Flat",
    bedrooms: 2,
    bathrooms: 1,
    rent: 1400,
    deposit: 1400,
    status: "Occupied",
    tenant: "Emma Wilson",
    tenantEmail: "emma.w@email.com",
    tenantPhone: "+44 7700 900788",
    tenantMoveIn: "05 Aug 2024",
    tenantEnd: "04 Aug 2026",
    epc: "B",
    image: "https://readdy.ai/api/search-image?query=Contemporary%20riverside%20apartment%20building%20in%20Bristol%20UK%2C%20modern%20waterfront%20residential%20complex%20with%20balconies%2C%20glass%20and%20steel%20architecture%2C%20professional%20architectural%20photography%2C%20clean%20simple%20background%20with%20muted%20tones%20and%20warm%20neutral%20colours&width=400&height=300&seq=ld-prop-2&orientation=landscape",
  },
  {
    id: "p3",
    name: "Maple Gardens House",
    address: "34 Maple Gardens",
    city: "Cardiff",
    postcode: "CF10 3BZ",
    type: "Semi-Detached",
    bedrooms: 4,
    bathrooms: 2,
    rent: 2400,
    deposit: 2400,
    status: "Occupied",
    tenant: "Michael Brown",
    tenantEmail: "michael.b@email.com",
    tenantPhone: "+44 7700 900321",
    tenantMoveIn: "12 Mar 2024",
    tenantEnd: "11 Mar 2026",
    epc: "D",
    image: "https://readdy.ai/api/search-image?query=Modern%20British%20semi-detached%20house%20exterior%20with%20brick%20and%20render%20facade%2C%20well-maintained%20front%20garden%20with%20driveway%2C%20suburban%20UK%20residential%20area%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20tones%20and%20warm%20neutral%20colours&width=400&height=300&seq=ld-prop-3&orientation=landscape",
  },
];

export const maintenanceJobs: MaintenanceJob[] = [
  {
    id: "j1",
    property: "Rose Court Flat 2A",
    title: "Boiler pressure loss",
    priority: "High",
    status: "Awaiting Approval",
    contractor: "GreenPlumb Ltd",
    reported: "2 days ago",
    due: "Tomorrow",
    description: "Tenant reports boiler losing pressure overnight. Needs inspection and possible pressure valve replacement.",
    quoteId: "q1",
  },
  {
    id: "j2",
    property: "Riverside Court",
    title: "Leaking kitchen tap",
    priority: "Medium",
    status: "In Progress",
    contractor: "GreenPlumb Ltd",
    reported: "4 days ago",
    due: "2 days",
    description: "Cold water tap has a slow drip. Likely worn washer.",
    quoteId: "q2",
  },
  {
    id: "j4",
    property: "Rose Court Flat 2A",
    title: "Bathroom extractor fan",
    priority: "Medium",
    status: "Open",
    contractor: "—",
    reported: "1 day ago",
    due: "1 week",
    description: "Extractor fan making loud noise. May need replacing.",
  },
  {
    id: "j5",
    property: "Maple Gardens House",
    title: "Garden gate hinge broken",
    priority: "Low",
    status: "Awaiting Quote",
    contractor: "SecureFix",
    reported: "3 days ago",
    due: "5 days",
    description: "Front gate hinge is broken and gate won't close properly.",
    quoteId: "q3",
  },
];

export const quotes: Quote[] = [
  {
    id: "q1",
    jobId: "j1",
    property: "Rose Court Flat 2A",
    jobTitle: "Boiler pressure loss",
    contractor: "GreenPlumb Ltd",
    contractorTrade: "Plumbing",
    amount: 280,
    vatAmount: 56,
    totalAmount: 336,
    submittedDate: "Today",
    validUntil: "28 Jun 2026",
    status: "Pending",
    description: "Full boiler inspection and pressure valve replacement including labour.",
    breakdown: [
      { item: "Call-out fee", cost: 75 },
      { item: "Pressure valve (part)", cost: 85 },
      { item: "Labour (2 hrs @ £60/hr)", cost: 120 },
    ],
  },
  {
    id: "q2",
    jobId: "j2",
    property: "Riverside Court",
    jobTitle: "Leaking kitchen tap",
    contractor: "GreenPlumb Ltd",
    contractorTrade: "Plumbing",
    amount: 95,
    vatAmount: 19,
    totalAmount: 114,
    submittedDate: "Yesterday",
    validUntil: "25 Jun 2026",
    status: "Approved",
    description: "Replace worn washer and inspect tap cartridge.",
    breakdown: [
      { item: "Call-out fee", cost: 50 },
      { item: "Parts", cost: 15 },
      { item: "Labour (30 min)", cost: 30 },
    ],
  },
  {
    id: "q3",
    jobId: "j5",
    property: "Maple Gardens House",
    jobTitle: "Garden gate hinge broken",
    contractor: "SecureFix",
    contractorTrade: "Locksmith",
    amount: 120,
    vatAmount: 24,
    totalAmount: 144,
    submittedDate: "2 days ago",
    validUntil: "30 Jun 2026",
    status: "Pending",
    description: "Supply and fit heavy-duty gate hinge set.",
    breakdown: [
      { item: "Call-out fee", cost: 40 },
      { item: "Hinge set (x2)", cost: 45 },
      { item: "Labour (1 hr)", cost: 35 },
    ],
  },
];

export const complianceCerts: ComplianceCert[] = [
  { id: "c1", type: "Gas Safety Certificate", property: "Rose Court Flat 2A", status: "Valid", expiry: "12 Mar 2027", daysLeft: 285, icon: "ri-fire-line", color: "bg-[#EF4444]" },
  { id: "c2", type: "EICR (Electrical)", property: "Rose Court Flat 2A", status: "Expiring Soon", expiry: "18 Jun 2026", daysLeft: 18, icon: "ri-flashlight-line", color: "bg-[#F59E0B]" },
  { id: "c3", type: "EPC Certificate", property: "Maple Gardens House", status: "Expired", expiry: "02 Jan 2026", daysLeft: -150, icon: "ri-leaf-line", color: "bg-[#10B981]" },
  { id: "c4", type: "Legionella Risk", property: "Riverside Court", status: "Expiring Soon", expiry: "15 Jun 2026", daysLeft: 15, icon: "ri-drop-line", color: "bg-[#3B82F6]" },
  { id: "c5", type: "Fire Risk Assessment", property: "Maple Gardens House", status: "Valid", expiry: "30 Sep 2026", daysLeft: 122, icon: "ri-fire-line", color: "bg-[#EF4444]" },
  { id: "c6", type: "Gas Safety Certificate", property: "Riverside Court", status: "Valid", expiry: "20 Nov 2026", daysLeft: 175, icon: "ri-fire-line", color: "bg-[#EF4444]" },
];

export const documents: Document[] = [
  { id: "d1", name: "Tenancy Agreement - John Miller.pdf", type: "Tenancy", property: "Rose Court Flat 2A", date: "15 Sep 2024", size: "1.2 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]" },
  { id: "d2", name: "Gas Safety Certificate 2026.pdf", type: "Compliance", property: "Rose Court Flat 2A", date: "12 Mar 2026", size: "0.8 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]" },
  { id: "d3", name: "Inventory Check-in Report.pdf", type: "Inventory", property: "Maple Gardens House", date: "12 Mar 2024", size: "2.4 MB", icon: "ri-file-list-line", color: "bg-[#F59E0B]" },
  { id: "d4", name: "Tenancy Agreement - Emma Wilson.pdf", type: "Tenancy", property: "Riverside Court", date: "05 Aug 2024", size: "1.1 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]" },
  { id: "d5", name: "Boiler Service Invoice - Mar 26.pdf", type: "Financial", property: "Rose Court Flat 2A", date: "12 Mar 2026", size: "0.5 MB", icon: "ri-file-chart-line", color: "bg-[#8B5CF6]" },
  { id: "d6", name: "Building Insurance Policy.pdf", type: "Insurance", property: "Maple Gardens House", date: "01 Jan 2026", size: "3.2 MB", icon: "ri-shield-line", color: "bg-[#EF4444]" },
];

export function getPriorityActions() {
  return [
    { priority: "High" as const, title: "EPC Certificate expired", related: "Maple Gardens House", due: "02 Jan 2026", action: "Renew certificate", link: "/dashboard/landlord/compliance" },
    { priority: "High" as const, title: "Boiler repair — quote pending", related: "Rose Court Flat 2A", due: "Awaiting approval", action: "Review quote", link: "/dashboard/landlord/quotes" },
    { priority: "Normal" as const, title: "EICR expiring within 90 days", related: "Rose Court Flat 2A", due: "18 Jun 2026", action: "Schedule renewal", link: "/dashboard/landlord/compliance" },
    { priority: "Normal" as const, title: "Legionella risk assessment due", related: "Riverside Court", due: "15 Jun 2026", action: "Schedule assessment", link: "/dashboard/landlord/compliance" },
    { priority: "Normal" as const, title: "Garden gate repair — quote pending", related: "Maple Gardens House", due: "Awaiting quote", action: "Review quote", link: "/dashboard/landlord/quotes" },
  ];
}

export function getUpcomingItems() {
  return [
    { date: "28 Jul 2026", type: "Inspection", label: "Compliance Check — Maple Gardens", status: "scheduled" },
    { date: "01 Aug 2026", type: "Rent", label: "Rent due — Rose Court Flat 2A (£1,850)", status: "upcoming" },
    { date: "14 Sep 2026", type: "Tenancy", label: "Tenancy ends — Rose Court Flat 2A", status: "upcoming" },
    { date: "18 Jun 2026", type: "Compliance", label: "EICR renewal — Rose Court Flat 2A", status: "expiring" },
    { date: "15 Jun 2026", type: "Compliance", label: "Legionella assessment — Riverside Court", status: "expiring" },
    { date: "30 Sep 2026", type: "Compliance", label: "Fire risk assessment — Maple Gardens", status: "upcoming" },
  ];
}

export function getRecentActivity() {
  return [
    { icon: "ri-money-pound-circle-line", desc: "Rent payment received — Rose Court", related: "£1,850", time: "01 Jul 2026", color: "bg-[#7A9A7E]/10 text-[#7A9A7E]" },
    { icon: "ri-tools-line", desc: "Boiler repair quote submitted", related: "GreenPlumb Ltd · £336", time: "Today", color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
    { icon: "ri-file-text-line", desc: "Owner statement generated", related: "June 2026", time: "05 Jul 2026", color: "bg-[#3B82F6]/10 text-[#3B82F6]" },
    { icon: "ri-message-3-line", desc: "Message from tenant — John Miller", related: "Rose Court Flat 2A", time: "3 days ago", color: "bg-[#8B5CF6]/10 text-[#8B5CF6]" },
    { icon: "ri-clipboard-line", desc: "Routine inspection completed", related: "Riverside Court", time: "12 Jun 2026", color: "bg-[#14B8A6]/10 text-[#14B8A6]" },
  ];
}