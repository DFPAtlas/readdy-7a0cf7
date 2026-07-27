export interface MarketplaceContractor {
  id: string;
  name: string;
  trade: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  onTimeRate: number;
  responseTimeHours: number;
  avgQuoteAmount: number;
  costPerformance: number;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Pending Approval";
  image: string;
  avatar: string;
  categories: string[];
  certifications: { name: string; issuer: string; date: string; expiry: string; status: string }[];
  insurance: { type: string; provider: string; policyNumber: string; expiry: string; status: string; coverAmount: string }[];
  lastActive: string;
  vatNumber: string;
  companyNumber: string;
  serviceAreas: string[];
  paymentTerms: string;
  emergencyCallout: boolean;
  emergencyFee: string;
  bio: string;
  memberSince: string;
  reviews: { name: string; date: string; rating: number; text: string; property: string; jobType: string }[];
  recentQuotes: { jobTitle: string; property: string; amount: number; vat: number; total: number; date: string; status: string }[];
  monthlyRevenue: { month: string; revenue: number; jobs: number }[];
  performanceScore: number;
  costRank: string;
  qualityRank: string;
  speedRank: string;
}

export const marketplaceContractors: MarketplaceContractor[] = [
  {
    id: "1",
    name: "GreenPlumb Ltd",
    trade: "Plumbing",
    rating: 4.9,
    totalJobs: 48,
    completedJobs: 45,
    cancelledJobs: 1,
    onTimeRate: 94,
    responseTimeHours: 2.3,
    avgQuoteAmount: 185,
    costPerformance: 92,
    phone: "020 7946 0958",
    email: "jobs@greenplumb.co.uk",
    status: "Active",
    image: "https://readdy.ai/api/search-image?query=Professional plumbing company branding image, modern plumbing tools, clean pipes, and wrenches arranged on a light neutral background, professional service photography, soft lighting, high quality, minimal style",
    avatar: "https://readdy.ai/api/search-image?query=Professional male plumber contractor headshot portrait, wearing a navy blue work polo shirt, friendly confident smile, clean neutral studio background, professional corporate photography, soft lighting",
    categories: ["Plumbing", "Heating", "Boiler Repair", "Emergency"],
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
    lastActive: "Today",
    vatNumber: "GB123456789",
    companyNumber: "09876543",
    serviceAreas: ["London", "Bristol", "Cardiff", "Birmingham"],
    paymentTerms: "14 days",
    emergencyCallout: true,
    emergencyFee: "£95 + VAT",
    bio: "GreenPlumb Ltd is a professional plumbing and heating company serving London and the South East. We specialise in emergency repairs, boiler installations, and full bathroom refurbishments. All our engineers are Gas Safe registered.",
    memberSince: "Mar 2023",
    reviews: [
      { name: "Sarah Collins", date: "22 May 2026", rating: 5, text: "Excellent work, very tidy and professional. Tenant very happy. Will use again for future jobs.", property: "Rose Court Flat 2A", jobType: "Radiator Repair" },
      { name: "James Hart", date: "18 May 2026", rating: 4, text: "Good work, slightly delayed but quality was high. Communication could be improved on timing updates.", property: "Riverside Court", jobType: "Extractor Fan" },
      { name: "Sarah Collins", date: "15 May 2026", rating: 5, text: "Quick fix, tenant very satisfied. Arrived on time and solved the problem in minutes.", property: "Rose Court Flat 2A", jobType: "Lock Repair" },
      { name: "James Hart", date: "10 May 2026", rating: 5, text: "Brilliant service. The boiler was fixed same day and the tenant was very impressed.", property: "Maple Gardens House", jobType: "Boiler Repair" },
      { name: "Sarah Collins", date: "02 May 2026", rating: 5, text: "Very professional. Quote was clear and fair. Would definitely recommend.", property: "Rose Court Flat 2A", jobType: "Leaking Tap" },
    ],
    recentQuotes: [
      { jobTitle: "Boiler pressure loss", property: "Rose Court Flat 2A", amount: 280, vat: 56, total: 336, date: "26 May 2026", status: "Quoted" },
      { jobTitle: "Leaking kitchen tap", property: "Riverside Court", amount: 95, vat: 19, total: 114, date: "19 May 2026", status: "Approved" },
      { jobTitle: "Radiator not heating", property: "Rose Court Flat 2A", amount: 185, vat: 37, total: 222, date: "21 May 2026", status: "Completed" },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 1200, jobs: 5 },
      { month: "Feb", revenue: 1450, jobs: 6 },
      { month: "Mar", revenue: 2100, jobs: 9 },
      { month: "Apr", revenue: 1800, jobs: 7 },
      { month: "May", revenue: 1842, jobs: 8 },
      { month: "Jun", revenue: 0, jobs: 0 },
    ],
    performanceScore: 96,
    costRank: "Fair",
    qualityRank: "Excellent",
    speedRank: "Excellent",
  },
  {
    id: "2",
    name: "SparkPro Electrics",
    trade: "Electrical",
    rating: 4.7,
    totalJobs: 32,
    completedJobs: 30,
    cancelledJobs: 0,
    onTimeRate: 89,
    responseTimeHours: 4.1,
    avgQuoteAmount: 245,
    costPerformance: 85,
    phone: "0161 496 0358",
    email: "contact@sparkpro.co.uk",
    status: "Active",
    image: "https://readdy.ai/api/search-image?query=Professional electrical services company branding image, modern electrical tools, wire cutters, and multimeter on a light neutral background, professional service photography, soft lighting, high quality, minimal style",
    avatar: "https://readdy.ai/api/search-image?query=Professional male electrician contractor headshot portrait, wearing a grey work shirt, friendly confident expression, clean neutral studio background, professional corporate photography, soft lighting",
    categories: ["Electrical", "Emergency", "Rewiring", "Inspection"],
    certifications: [
      { name: "NICEIC Approved Contractor", issuer: "NICEIC", date: "10 Feb 2026", expiry: "09 Feb 2027", status: "Valid" },
      { name: "Part P Registered", issuer: "NICEIC", date: "01 Mar 2026", expiry: "28 Feb 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Aviva", policyNumber: "PL-2026-SP-001", expiry: "31 Dec 2026", status: "Valid", coverAmount: "£5,000,000" },
      { type: "Employers Liability", provider: "Aviva", policyNumber: "EL-2026-SP-001", expiry: "31 Dec 2026", status: "Valid", coverAmount: "£10,000,000" },
    ],
    lastActive: "Yesterday",
    vatNumber: "GB987654321",
    companyNumber: "12345678",
    serviceAreas: ["Manchester", "Liverpool", "Leeds"],
    paymentTerms: "30 days",
    emergencyCallout: true,
    emergencyFee: "£120 + VAT",
    bio: "Fully qualified electrical contractors for domestic and commercial properties. We handle everything from emergency repairs to full rewiring and EICR certificates.",
    memberSince: "Jun 2024",
    reviews: [
      { name: "Sarah Collins", date: "15 May 2026", rating: 5, text: "Quick fix, tenant very satisfied. Arrived on time and solved the problem in minutes.", property: "Rose Court Flat 2A", jobType: "Extractor Fan" },
      { name: "James Hart", date: "28 Apr 2026", rating: 4, text: "Good work but quote was a bit higher than expected. Quality was excellent though.", property: "Riverside Court", jobType: "Rewiring" },
      { name: "Sarah Collins", date: "12 Apr 2026", rating: 5, text: "Professional EICR report completed on time. Very thorough.", property: "Maple Gardens House", jobType: "EICR" },
    ],
    recentQuotes: [
      { jobTitle: "Bathroom extractor fan", property: "Rose Court Flat 2A", amount: 145, vat: 29, total: 174, date: "16 May 2026", status: "Completed" },
      { jobTitle: "Full rewiring", property: "Riverside Court", amount: 3200, vat: 640, total: 3840, date: "20 Apr 2026", status: "Quoted" },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 800, jobs: 3 },
      { month: "Feb", revenue: 1100, jobs: 4 },
      { month: "Mar", revenue: 950, jobs: 3 },
      { month: "Apr", revenue: 3200, jobs: 2 },
      { month: "May", revenue: 174, jobs: 1 },
      { month: "Jun", revenue: 0, jobs: 0 },
    ],
    performanceScore: 88,
    costRank: "Premium",
    qualityRank: "Very Good",
    speedRank: "Good",
  },
  {
    id: "3",
    name: "SecureFix",
    trade: "Locksmith",
    rating: 4.8,
    totalJobs: 21,
    completedJobs: 19,
    cancelledJobs: 0,
    onTimeRate: 96,
    responseTimeHours: 1.5,
    avgQuoteAmount: 95,
    costPerformance: 97,
    phone: "0121 496 0358",
    email: "info@securefix.co.uk",
    status: "Active",
    image: "https://readdy.ai/api/search-image?query=Professional locksmith service company branding image, modern lock picks, key cutting tools, and high security locks on a light neutral background, professional service photography, soft lighting, high quality, minimal style",
    avatar: "https://readdy.ai/api/search-image?query=Professional male locksmith contractor headshot portrait, wearing a dark uniform, friendly confident expression, clean neutral studio background, professional corporate photography, soft lighting",
    categories: ["Locksmith", "Security", "Emergency"],
    certifications: [
      { name: "Master Locksmith Association", issuer: "MLA", date: "20 Jan 2026", expiry: "19 Jan 2027", status: "Valid" },
      { name: "Security Industry Authority", issuer: "SIA", date: "05 Feb 2026", expiry: "04 Feb 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Zurich", policyNumber: "PL-2026-SF-001", expiry: "28 Feb 2027", status: "Valid", coverAmount: "£5,000,000" },
    ],
    lastActive: "2 days ago",
    vatNumber: "GB456789123",
    companyNumber: "87654321",
    serviceAreas: ["Birmingham", "Coventry", "Wolverhampton"],
    paymentTerms: "14 days",
    emergencyCallout: true,
    emergencyFee: "£75 + VAT",
    bio: "24/7 locksmith and security services. All work guaranteed. We specialise in emergency entry, lock changes, and security upgrades for rental properties.",
    memberSince: "Sep 2024",
    reviews: [
      { name: "James Hart", date: "10 May 2026", rating: 5, text: "Arrived within 20 minutes. Brilliant service. Tenant was locked out and needed urgent access.", property: "Maple Gardens House", jobType: "Emergency Entry" },
      { name: "Sarah Collins", date: "05 May 2026", rating: 5, text: "Fast, efficient, and fair pricing. Changed all locks after a tenant changeover.", property: "Rose Court Flat 2A", jobType: "Lock Change" },
      { name: "James Hart", date: "22 Apr 2026", rating: 4, text: "Good service but had to call twice to confirm the appointment time.", property: "Riverside Court", jobType: "Security Upgrade" },
    ],
    recentQuotes: [
      { jobTitle: "Front door lock sticking", property: "Rose Court Flat 2A", amount: 65, vat: 13, total: 78, date: "11 May 2026", status: "Completed" },
      { jobTitle: "Garden gate hinge", property: "Maple Gardens House", amount: 45, vat: 9, total: 54, date: "27 May 2026", status: "Assigned" },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 450, jobs: 4 },
      { month: "Feb", revenue: 380, jobs: 3 },
      { month: "Mar", revenue: 520, jobs: 5 },
      { month: "Apr", revenue: 290, jobs: 3 },
      { month: "May", revenue: 78, jobs: 1 },
      { month: "Jun", revenue: 0, jobs: 0 },
    ],
    performanceScore: 94,
    costRank: "Fair",
    qualityRank: "Excellent",
    speedRank: "Excellent",
  },
  {
    id: "4",
    name: "BuildRight Construction",
    trade: "General Building",
    rating: 4.5,
    totalJobs: 67,
    completedJobs: 61,
    cancelledJobs: 3,
    onTimeRate: 82,
    responseTimeHours: 8.5,
    avgQuoteAmount: 1850,
    costPerformance: 78,
    phone: "020 7946 0234",
    email: "hello@buildright.co.uk",
    status: "Active",
    image: "https://readdy.ai/api/search-image?query=Professional construction company branding image, modern building tools, hard hat, and spirit level on a light neutral background, professional service photography, soft lighting, high quality, minimal style",
    avatar: "https://readdy.ai/api/search-image?query=Professional male builder contractor headshot portrait, wearing an orange hi-vis vest, friendly confident expression, clean neutral studio background, professional corporate photography, soft lighting",
    categories: ["Building", "Renovation", "Maintenance"],
    certifications: [
      { name: "CSCS Gold", issuer: "CSCS", date: "15 Mar 2026", expiry: "14 Mar 2027", status: "Valid" },
      { name: "CHAS Accredited", issuer: "CHAS", date: "01 Jan 2026", expiry: "31 Dec 2026", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Allianz", policyNumber: "PL-2026-BR-001", expiry: "30 Jun 2027", status: "Valid", coverAmount: "£10,000,000" },
      { type: "Employers Liability", provider: "Allianz", policyNumber: "EL-2026-BR-001", expiry: "30 Jun 2027", status: "Valid", coverAmount: "£10,000,000" },
    ],
    lastActive: "3 days ago",
    vatNumber: "GB789123456",
    companyNumber: "65432109",
    serviceAreas: ["London", "Essex", "Kent"],
    paymentTerms: "30 days",
    emergencyCallout: false,
    emergencyFee: "",
    bio: "Full-service building company specialising in renovations, extensions, and maintenance. We have 15 years of experience working with letting agents and landlords.",
    memberSince: "Jan 2022",
    reviews: [
      { name: "Sarah Collins", date: "01 May 2026", rating: 4, text: "Good builders but project took a bit longer than quoted. Final result was excellent.", property: "Maple Gardens House", jobType: "Kitchen Renovation" },
      { name: "James Hart", date: "15 Apr 2026", rating: 4, text: "Solid work. Quote was competitive and the team was professional throughout.", property: "Riverside Court", jobType: "Bathroom Refurb" },
      { name: "Sarah Collins", date: "28 Mar 2026", rating: 5, text: "Excellent renovation. The property value increased significantly.", property: "Rose Court Flat 2A", jobType: "Full Flat Renovation" },
    ],
    recentQuotes: [
      { jobTitle: "Kitchen renovation", property: "Maple Gardens House", amount: 4200, vat: 840, total: 5040, date: "01 May 2026", status: "In Progress" },
      { jobTitle: "Bathroom refurb", property: "Riverside Court", amount: 2800, vat: 560, total: 3360, date: "15 Apr 2026", status: "Completed" },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 2800, jobs: 2 },
      { month: "Feb", revenue: 4200, jobs: 1 },
      { month: "Mar", revenue: 3500, jobs: 2 },
      { month: "Apr", revenue: 3360, jobs: 1 },
      { month: "May", revenue: 5040, jobs: 1 },
      { month: "Jun", revenue: 0, jobs: 0 },
    ],
    performanceScore: 82,
    costRank: "Competitive",
    qualityRank: "Very Good",
    speedRank: "Average",
  },
  {
    id: "5",
    name: "GardenForce",
    trade: "Landscaping",
    rating: 4.6,
    totalJobs: 15,
    completedJobs: 14,
    cancelledJobs: 0,
    onTimeRate: 91,
    responseTimeHours: 6.2,
    avgQuoteAmount: 680,
    costPerformance: 88,
    phone: "0113 496 0358",
    email: "team@gardenforce.co.uk",
    status: "Inactive",
    image: "https://readdy.ai/api/search-image?query=Professional landscaping company branding image, modern gardening tools, plants, and grass on a light neutral background, professional service photography, soft lighting, high quality, minimal style",
    avatar: "https://readdy.ai/api/search-image?query=Professional male gardener contractor headshot portrait, wearing a green work shirt, friendly confident expression, clean neutral studio background, professional corporate photography, soft lighting",
    categories: ["Landscaping", "Gardening", "Maintenance"],
    certifications: [
      { name: "BALI Registered", issuer: "BALI", date: "01 Feb 2026", expiry: "31 Jan 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "NFU Mutual", policyNumber: "PL-2026-GF-001", expiry: "01 Jan 2027", status: "Valid", coverAmount: "£5,000,000" },
    ],
    lastActive: "1 week ago",
    vatNumber: "GB321654987",
    companyNumber: "54321098",
    serviceAreas: ["Leeds", "Sheffield", "York"],
    paymentTerms: "14 days",
    emergencyCallout: false,
    emergencyFee: "",
    bio: "Landscape design, maintenance, and garden care services. We create beautiful outdoor spaces for rental properties.",
    memberSince: "Nov 2024",
    reviews: [
      { name: "James Hart", date: "20 Apr 2026", rating: 5, text: "Beautiful garden transformation. Highly recommended. The tenant absolutely loves the new space.", property: "Maple Gardens House", jobType: "Garden Design" },
      { name: "Sarah Collins", date: "15 Mar 2026", rating: 4, text: "Good maintenance service. Regular lawn care and hedge trimming.", property: "Rose Court Flat 2A", jobType: "Garden Maintenance" },
    ],
    recentQuotes: [
      { jobTitle: "Garden redesign", property: "Maple Gardens House", amount: 850, vat: 170, total: 1020, date: "20 Apr 2026", status: "Completed" },
      { jobTitle: "Lawn maintenance", property: "Rose Court Flat 2A", amount: 120, vat: 24, total: 144, date: "15 Mar 2026", status: "Completed" },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 0, jobs: 0 },
      { month: "Feb", revenue: 144, jobs: 1 },
      { month: "Mar", revenue: 144, jobs: 1 },
      { month: "Apr", revenue: 1020, jobs: 1 },
      { month: "May", revenue: 0, jobs: 0 },
      { month: "Jun", revenue: 0, jobs: 0 },
    ],
    performanceScore: 85,
    costRank: "Fair",
    qualityRank: "Very Good",
    speedRank: "Good",
  },
  {
    id: "6",
    name: "FastFix Appliances",
    trade: "Appliance Repair",
    rating: 4.4,
    totalJobs: 28,
    completedJobs: 25,
    cancelledJobs: 1,
    onTimeRate: 87,
    responseTimeHours: 5.8,
    avgQuoteAmount: 165,
    costPerformance: 80,
    phone: "020 7946 0456",
    email: "repair@fastfix.co.uk",
    status: "Active",
    image: "https://readdy.ai/api/search-image?query=Professional appliance repair company branding image, modern kitchen appliance tools, screwdriver, and multimeter on a light neutral background, professional service photography, soft lighting, high quality, minimal style",
    avatar: "https://readdy.ai/api/search-image?query=Professional male appliance repair technician headshot portrait, wearing a blue work shirt, friendly confident expression, clean neutral studio background, professional corporate photography, soft lighting",
    categories: ["Appliance Repair", "Kitchen", "Emergency"],
    certifications: [
      { name: "Manufacturer Certified", issuer: "Bosch", date: "01 Mar 2026", expiry: "28 Feb 2027", status: "Valid" },
      { name: "Manufacturer Certified", issuer: "Samsung", date: "01 Mar 2026", expiry: "28 Feb 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Direct Line", policyNumber: "PL-2026-FF-001", expiry: "15 Mar 2027", status: "Valid", coverAmount: "£5,000,000" },
    ],
    lastActive: "Today",
    vatNumber: "GB654987321",
    companyNumber: "43210987",
    serviceAreas: ["London", "Surrey"],
    paymentTerms: "7 days",
    emergencyCallout: true,
    emergencyFee: "£85 + VAT",
    bio: "Same-day appliance repair for all major brands. We carry common parts in stock and aim to fix on the first visit.",
    memberSince: "Aug 2024",
    reviews: [
      { name: "Sarah Collins", date: "25 May 2026", rating: 4, text: "Fixed the oven quickly. Parts were a bit pricey though. Overall happy with the service.", property: "Rose Court Flat 2A", jobType: "Oven Repair" },
      { name: "James Hart", date: "12 May 2026", rating: 4, text: "Good service. Washing machine fixed same day.", property: "Riverside Court", jobType: "Washing Machine" },
      { name: "Sarah Collins", date: "01 May 2026", rating: 5, text: "Amazing. The fridge was fixed in under an hour. Highly recommend.", property: "Maple Gardens House", jobType: "Fridge Repair" },
    ],
    recentQuotes: [
      { jobTitle: "Oven repair", property: "Rose Court Flat 2A", amount: 195, vat: 39, total: 234, date: "25 May 2026", status: "Completed" },
      { jobTitle: "Washing machine", property: "Riverside Court", amount: 145, vat: 29, total: 174, date: "12 May 2026", status: "Completed" },
    ],
    monthlyRevenue: [
      { month: "Jan", revenue: 340, jobs: 2 },
      { month: "Feb", revenue: 520, jobs: 3 },
      { month: "Mar", revenue: 290, jobs: 2 },
      { month: "Apr", revenue: 174, jobs: 1 },
      { month: "May", revenue: 234, jobs: 1 },
      { month: "Jun", revenue: 0, jobs: 0 },
    ],
    performanceScore: 84,
    costRank: "Premium",
    qualityRank: "Very Good",
    speedRank: "Good",
  },
];

export const categoryColors: Record<string, string> = {
  Plumbing: "bg-blue-500",
  Electrical: "bg-amber-500",
  Locksmith: "bg-gray-500",
  "General Building": "bg-orange-500",
  Landscaping: "bg-emerald-500",
  "Appliance Repair": "bg-sky-500",
  Heating: "bg-red-500",
  Emergency: "bg-[#EF4444]",
  Renovation: "bg-purple-500",
  Maintenance: "bg-[#14B8A6]",
  Security: "bg-[#C28A78]",
  Gardening: "bg-[#10B981]",
  Kitchen: "bg-[#8B5CF6]",
  Building: "bg-[#F59E0B]",
  "Boiler Repair": "bg-[#DC2626]",
  Rewiring: "bg-[#6366F1]",
  Inspection: "bg-[#0EA5E9]",
  "Garden Design": "bg-[#22C55E]",
  "Full Flat Renovation": "bg-[#A855F7]",
  "Bathroom Refurb": "bg-[#EC4899]",
  "Kitchen Renovation": "bg-[#F97316]",
};

export const statusStyles: Record<string, string> = {
  Active: "bg-[#10B981]/10 text-[#10B981]",
  Inactive: "bg-[#94A3B8]/10 text-[#94A3B8]",
  "Pending Approval": "bg-[#F59E0B]/10 text-[#F59E0B]",
};

export const rankStyles: Record<string, { color: string; bg: string }> = {
  Excellent: { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  "Very Good": { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10" },
  Good: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  Average: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  Fair: { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  Competitive: { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  Premium: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
};