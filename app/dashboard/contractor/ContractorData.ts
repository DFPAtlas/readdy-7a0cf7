export interface ContractorJob {
  id: string;
  title: string;
  description: string;
  property: string;
  address: string;
  status: "Assigned" | "Quoted" | "Approved" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Emergency";
  category: string;
  assignedDate: string;
  dueDate: string;
  scheduledDate?: string;
  completedDate?: string;
  quoteAmount?: number;
  quoteVat?: number;
  quoteTotal?: number;
  quoteSubmitted?: string;
  quoteValidUntil?: string;
  quoteBreakdown?: { item: string; cost: number }[];
  agent: string;
  agentEmail: string;
  agentPhone: string;
  tenantName: string;
  tenantPhone: string;
  accessNotes: string;
  completionPhotos: string[];
  invoiceUploaded?: string;
  invoiceAmount?: number;
  rating?: number;
  feedback?: string;
}

export interface ContractorDoc {
  id: string;
  name: string;
  type: "Insurance" | "Certification" | "Completion Photo" | "Invoice";
  date: string;
  expiry?: string;
  size: string;
  status: "Valid" | "Expiring Soon" | "Expired";
  icon: string;
  color: string;
}

export interface ContractorProfile {
  companyName: string;
  trade: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  vatNumber: string;
  companyNumber: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageResponse: string;
  memberSince: string;
  avatar: string;
  bio: string;
  certifications: { name: string; issuer: string; date: string; expiry: string; status: string }[];
  insurance: { type: string; provider: string; policyNumber: string; expiry: string; status: string; coverAmount: string }[];
  tradeTags: string[];
  serviceAreas: string[];
  paymentTerms: string;
  emergencyCallout: boolean;
  emergencyFee: string;
}

export const contractorJobs: ContractorJob[] = [
  {
    id: "cj1",
    title: "Boiler pressure loss",
    description: "Tenant reports boiler losing pressure overnight. Needs inspection and possible pressure valve replacement. Access via tenant at flat 2A.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Quoted",
    priority: "High",
    category: "Plumbing",
    assignedDate: "25 May 2026",
    dueDate: "28 May 2026",
    quoteAmount: 280,
    quoteVat: 56,
    quoteTotal: 336,
    quoteSubmitted: "26 May 2026",
    quoteValidUntil: "28 Jun 2026",
    quoteBreakdown: [
      { item: "Call-out fee", cost: 75 },
      { item: "Pressure valve (part)", cost: 85 },
      { item: "Labour (2 hrs @ £60/hr)", cost: 120 },
    ],
    agent: "Sarah Collins",
    agentEmail: "sarah.collins@lethub.uk",
    agentPhone: "+44 20 7946 0958",
    tenantName: "John Miller",
    tenantPhone: "+44 7700 900456",
    accessNotes: "Tenant is available weekdays 9am-5pm. Key safe code: 4721",
    completionPhotos: [],
  },
  {
    id: "cj2",
    title: "Leaking kitchen tap",
    description: "Cold water tap has a slow drip. Likely worn washer. 30-minute job. No need to be present.",
    property: "Riverside Court",
    address: "Unit 3, Riverside Court, Bristol BS1 4ST",
    status: "Approved",
    priority: "Medium",
    category: "Plumbing",
    assignedDate: "18 May 2026",
    dueDate: "22 May 2026",
    scheduledDate: "22 May 2026",
    quoteAmount: 95,
    quoteVat: 19,
    quoteTotal: 114,
    quoteSubmitted: "19 May 2026",
    quoteValidUntil: "25 Jun 2026",
    quoteBreakdown: [
      { item: "Call-out fee", cost: 50 },
      { item: "Parts", cost: 15 },
      { item: "Labour (30 min)", cost: 30 },
    ],
    agent: "Sarah Collins",
    agentEmail: "sarah.collins@lethub.uk",
    agentPhone: "+44 20 7946 0958",
    tenantName: "Emma Wilson",
    tenantPhone: "+44 7700 900788",
    accessNotes: "Tenant not required. LetHub holds keys. Access via management office.",
    completionPhotos: [],
  },
  {
    id: "cj3",
    title: "Garden gate hinge broken",
    description: "Front gate hinge is broken and gate won't close properly. Supply and fit heavy-duty hinge set.",
    property: "Maple Gardens House",
    address: "34 Maple Gardens, Cardiff CF10 3BZ",
    status: "Assigned",
    priority: "Low",
    category: "Locksmith",
    assignedDate: "27 May 2026",
    dueDate: "5 Jun 2026",
    agent: "James Hart",
    agentEmail: "james.hart@lethub.uk",
    agentPhone: "+44 20 7946 0959",
    tenantName: "Michael Brown",
    tenantPhone: "+44 7700 900321",
    accessNotes: "Tenant available weekends. Gate is external, no access needed.",
    completionPhotos: [],
  },
  {
    id: "cj4",
    title: "Living room radiator not heating",
    description: "Radiator in living room is cold even when heating is on. All other radiators in the flat are working fine. Likely valve issue.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "In Progress",
    priority: "High",
    category: "Heating",
    assignedDate: "20 May 2026",
    dueDate: "24 May 2026",
    scheduledDate: "22 May 2026",
    quoteAmount: 185,
    quoteVat: 37,
    quoteTotal: 222,
    quoteSubmitted: "21 May 2026",
    quoteValidUntil: "20 Jun 2026",
    quoteBreakdown: [
      { item: "Call-out fee", cost: 65 },
      { item: "Thermostatic valve", cost: 55 },
      { item: "Labour (1.5 hrs)", cost: 65 },
    ],
    agent: "Sarah Collins",
    agentEmail: "sarah.collins@lethub.uk",
    agentPhone: "+44 20 7946 0958",
    tenantName: "John Miller",
    tenantPhone: "+44 7700 900456",
    accessNotes: "Tenant works from home. Available most days. Call 30 mins before arrival.",
    completionPhotos: [
      "https://readdy.ai/api/search-image?query=Completed plumbing repair showing new radiator valve installed on a white radiator in a modern UK apartment living room, clean and professional work, natural lighting, realistic photo",
    ],
    invoiceUploaded: "22 May 2026",
    invoiceAmount: 222,
    rating: 5,
    feedback: "Excellent work, very tidy and professional. Tenant very happy.",
  },
  {
    id: "cj5",
    title: "Bathroom extractor fan noisy",
    description: "Extractor fan making loud grinding noise. Likely bearings need replacing. Fan is accessible from bathroom ceiling.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Completed",
    priority: "Medium",
    category: "Electrical",
    assignedDate: "15 May 2026",
    dueDate: "20 May 2026",
    completedDate: "18 May 2026",
    quoteAmount: 145,
    quoteVat: 29,
    quoteTotal: 174,
    quoteSubmitted: "16 May 2026",
    quoteValidUntil: "15 Jun 2026",
    quoteBreakdown: [
      { item: "Call-out fee", cost: 55 },
      { item: "Replacement fan unit", cost: 65 },
      { item: "Labour (1 hr)", cost: 25 },
    ],
    agent: "Sarah Collins",
    agentEmail: "sarah.collins@lethub.uk",
    agentPhone: "+44 20 7946 0958",
    tenantName: "John Miller",
    tenantPhone: "+44 7700 900456",
    accessNotes: "Tenant available mornings 8am-12pm.",
    completionPhotos: [
      "https://readdy.ai/api/search-image?query=New bathroom extractor fan installed in a clean modern UK apartment bathroom ceiling, white square extractor fan, clean professional installation, natural lighting, realistic photo",
    ],
    invoiceUploaded: "18 May 2026",
    invoiceAmount: 174,
    rating: 4,
    feedback: "Good work, slightly delayed but quality was high.",
  },
  {
    id: "cj6",
    title: "Front door lock sticking",
    description: "Front door lock is stiff and hard to turn. Key has to be wiggled to unlock. Lock mechanism needs lubrication and realignment.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    status: "Completed",
    priority: "Medium",
    category: "Locksmith",
    assignedDate: "10 May 2026",
    dueDate: "15 May 2026",
    completedDate: "15 May 2026",
    quoteAmount: 65,
    quoteVat: 13,
    quoteTotal: 78,
    quoteSubmitted: "11 May 2026",
    quoteValidUntil: "10 Jun 2026",
    quoteBreakdown: [
      { item: "Call-out fee", cost: 45 },
      { item: "Lubricant and materials", cost: 8 },
      { item: "Labour (30 min)", cost: 12 },
    ],
    agent: "Sarah Collins",
    agentEmail: "sarah.collins@lethub.uk",
    agentPhone: "+44 20 7946 0958",
    tenantName: "John Miller",
    tenantPhone: "+44 7700 900456",
    accessNotes: "Tenant present. Buzz flat 2A.",
    completionPhotos: [],
    invoiceUploaded: "15 May 2026",
    invoiceAmount: 78,
    rating: 5,
    feedback: "Quick fix, tenant very satisfied.",
  },
];

export const contractorDocs: ContractorDoc[] = [
  { id: "cd1", name: "Public Liability Insurance 2026.pdf", type: "Insurance", date: "01 Jan 2026", expiry: "31 Dec 2026", size: "2.1 MB", status: "Valid", icon: "ri-shield-line", color: "bg-[#10B981]" },
  { id: "cd2", name: "Employers Liability Insurance 2026.pdf", type: "Insurance", date: "01 Jan 2026", expiry: "31 Dec 2026", size: "1.8 MB", status: "Valid", icon: "ri-shield-check-line", color: "bg-[#10B981]" },
  { id: "cd3", name: "Gas Safe Certificate.pdf", type: "Certification", date: "15 Mar 2026", expiry: "14 Mar 2027", size: "0.5 MB", status: "Valid", icon: "ri-file-shield-line", color: "bg-[#3B82F6]" },
  { id: "cd4", name: "NICEIC Electrical Certificate.pdf", type: "Certification", date: "10 Feb 2026", expiry: "09 Feb 2027", size: "0.7 MB", status: "Valid", icon: "ri-file-shield-line", color: "bg-[#3B82F6]" },
  { id: "cd5", name: "Boiler Repair - Invoice INV-2026-045.pdf", type: "Invoice", date: "18 May 2026", size: "0.3 MB", status: "Valid", icon: "ri-file-chart-line", color: "bg-[#F59E0B]" },
  { id: "cd6", name: "Extractor Fan - Invoice INV-2026-041.pdf", type: "Invoice", date: "18 May 2026", size: "0.3 MB", status: "Valid", icon: "ri-file-chart-line", color: "bg-[#F59E0B]" },
  { id: "cd7", name: "Lock Repair - Invoice INV-2026-038.pdf", type: "Invoice", date: "15 May 2026", size: "0.2 MB", status: "Valid", icon: "ri-file-chart-line", color: "bg-[#F59E0B]" },
  { id: "cd8", name: "Completion Photo - Radiator Repair.jpg", type: "Completion Photo", date: "22 May 2026", size: "1.4 MB", status: "Valid", icon: "ri-image-line", color: "bg-[#8B5CF6]" },
  { id: "cd9", name: "Completion Photo - Extractor Fan.jpg", type: "Completion Photo", date: "18 May 2026", size: "1.1 MB", status: "Valid", icon: "ri-image-line", color: "bg-[#8B5CF6]" },
];

export const contractorProfile: ContractorProfile = {
  companyName: "GreenPlumb Ltd",
  trade: "Plumbing",
  email: "jobs@greenplumb.co.uk",
  phone: "+44 20 7946 0958",
  address: "Unit 4, Industrial Estate",
  city: "London",
  postcode: "E2 8AN",
  vatNumber: "GB123456789",
  companyNumber: "09876543",
  rating: 4.9,
  totalJobs: 48,
  completedJobs: 45,
  cancelledJobs: 1,
  averageResponse: "2.3 hours",
  memberSince: "Mar 2023",
  avatar: "https://readdy.ai/api/search-image?query=Professional male plumber contractor headshot portrait, work uniform with company logo, friendly confident expression, clean neutral studio background, professional corporate photography, soft lighting",
  bio: "GreenPlumb Ltd is a professional plumbing and heating company serving London and the South East. We specialise in emergency repairs, boiler installations, and full bathroom refurbishments. All our engineers are Gas Safe registered.",
  certifications: [
    { name: "Gas Safe Registered", issuer: "Gas Safe Register", date: "15 Mar 2026", expiry: "14 Mar 2027", status: "Valid" },
    { name: "NICEIC Approved Contractor", issuer: "NICEIC", date: "10 Feb 2026", expiry: "09 Feb 2027", status: "Valid" },
    { name: "WaterSafe Approved", issuer: "WaterSafe", date: "01 Jan 2026", expiry: "31 Dec 2026", status: "Valid" },
  ],
  insurance: [
    { type: "Public Liability", provider: "AXA Insurance", policyNumber: "PL-2026-GP-001", expiry: "31 Dec 2026", status: "Valid", coverAmount: "£5,000,000" },
    { type: "Employers Liability", provider: "AXA Insurance", policyNumber: "EL-2026-GP-001", expiry: "31 Dec 2026", status: "Valid", coverAmount: "£10,000,000" },
    { type: "Professional Indemnity", provider: "Hiscox", policyNumber: "PI-2026-GP-001", expiry: "30 Jun 2026", status: "Expiring Soon", coverAmount: "£1,000,000" },
  ],
  tradeTags: ["Plumbing", "Heating", "Boiler Repair", "Bathroom Installation", "Emergency Callout", "Gas Safe"],
  serviceAreas: ["London", "Bristol", "Cardiff", "Birmingham"],
  paymentTerms: "14 days from invoice date",
  emergencyCallout: true,
  emergencyFee: "£95 + VAT",
};

export const performanceStats = {
  thisMonthJobs: 8,
  thisMonthRevenue: 1842,
  avgQuoteTime: "4.2 hours",
  avgCompletionTime: "1.8 days",
  responseRate: 98,
  onTimeRate: 94,
  customerSatisfaction: 4.8,
  repeatBusinessRate: 87,
};

export const monthlyRevenue = [
  { month: "Jan", revenue: 1200, jobs: 5 },
  { month: "Feb", revenue: 1450, jobs: 6 },
  { month: "Mar", revenue: 2100, jobs: 9 },
  { month: "Apr", revenue: 1800, jobs: 7 },
  { month: "May", revenue: 1842, jobs: 8 },
  { month: "Jun", revenue: 0, jobs: 0 },
];