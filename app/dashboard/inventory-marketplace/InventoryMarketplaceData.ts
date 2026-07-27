export type InventoryServiceKey = "check_in" | "mid_term" | "check_out" | "inventory_creation" | "inventory_verification";

export type InventoryRequestStatus = "draft" | "requested" | "accepted" | "in_progress" | "photos_uploaded" | "report_uploaded" | "completed";

export interface InventoryService {
  key: InventoryServiceKey;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  turnaroundDays: string;
  averageCost: string;
  includesPhotos: boolean;
  includesReport: boolean;
  typicalRooms: string;
  category: string;
}

export interface InventoryProvider {
  id: string;
  companyName: string;
  contactName: string;
  serviceKeys: InventoryServiceKey[];
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  responseTimeHours: number;
  onTimeRate: number;
  basePrice: number;
  serviceAreas: string[];
  certifications: { name: string; issuer: string; expiry: string; status: string }[];
  insurance: { type: string; provider: string; coverAmount: string }[];
  reviews: { reviewer: string; date: string; rating: number; text: string; jobType: string }[];
  avatar: string;
  available: boolean;
  verified: boolean;
  isAgencyApproved: boolean;
}

export interface InventoryProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  isFurnished: boolean;
  isHMO: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  epcRating: string | null;
  lastInspection: string | null;
  assignedTenant: string | null;
}

export interface InventoryRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  serviceKey: InventoryServiceKey;
  serviceName: string;
  status: InventoryRequestStatus;
  priority: "standard" | "urgent";
  requestedDate: string;
  scheduledDate: string;
  notes: string;
  providerIds: string[];
  providers: InventoryProvider[];
  selectedProviderId: string | null;
  quoteAmount: number | null;
  quoteAccepted: boolean;
  inspectionDate: string | null;
  inspectorName: string | null;
  photosUploaded: boolean;
  photoCount: number;
  reportUploaded: boolean;
  reportUrl: string | null;
  propertyUpdated: boolean;
  roomCount: number;
}

export const inventoryServices: InventoryService[] = [
  {
    key: "check_in",
    name: "Check In",
    description: "Full check-in inspection when a new tenant moves in. Documents the property condition, meter readings, and creates a baseline inventory for future reference.",
    icon: "ri-login-box-line",
    color: "#3B82F6",
    bg: "bg-[#3B82F6]",
    turnaroundDays: "Same day — 2 days",
    averageCost: "£80 — £150",
    includesPhotos: true,
    includesReport: true,
    typicalRooms: "Living room, kitchen, bedrooms, bathroom, hallway",
    category: "Move In & Out",
  },
  {
    key: "mid_term",
    name: "Mid-Term Inspection",
    description: "Routine mid-tenancy inspection to check property condition, identify maintenance issues, and ensure tenant compliance with tenancy agreement.",
    icon: "ri-calendar-check-line",
    color: "#F59E0B",
    bg: "bg-[#F59E0B]",
    turnaroundDays: "1 — 3 days",
    averageCost: "£60 — £110",
    includesPhotos: true,
    includesReport: true,
    typicalRooms: "All rooms including exterior & garden",
    category: "Routine",
  },
  {
    key: "check_out",
    name: "Check Out",
    description: "End-of-tenancy inspection comparing current condition against the check-in inventory. Identifies dilapidations, cleaning requirements, and deposit deductions.",
    icon: "ri-logout-box-line",
    color: "#8B5CF6",
    bg: "bg-[#8B5CF6]",
    turnaroundDays: "1 — 3 days",
    averageCost: "£90 — £180",
    includesPhotos: true,
    includesReport: true,
    typicalRooms: "All rooms, meter readings, key return",
    category: "Move In & Out",
  },
  {
    key: "inventory_creation",
    name: "Inventory Creation",
    description: "Comprehensive property inventory documenting every item, fixture, and fitting with detailed condition reports. Essential for new tenancies and HMO properties.",
    icon: "ri-file-list-3-line",
    color: "#10B981",
    bg: "bg-[#10B981]",
    turnaroundDays: "3 — 5 days",
    averageCost: "£100 — £200",
    includesPhotos: true,
    includesReport: true,
    typicalRooms: "All rooms, all fixtures, all fittings, all appliances",
    category: "Inventory",
  },
  {
    key: "inventory_verification",
    name: "Inventory Verification",
    description: "Verification of an existing inventory against the current property state. Updates condition reports, notes any changes or missing items, and refreshes photographic evidence.",
    icon: "ri-check-double-line",
    color: "#EC4899",
    bg: "bg-[#EC4899]",
    turnaroundDays: "1 — 3 days",
    averageCost: "£60 — £120",
    includesPhotos: true,
    includesReport: true,
    typicalRooms: "All rooms covered by existing inventory",
    category: "Inventory",
  },
];

export const inventoryProviders: InventoryProvider[] = [
  {
    id: "ip-1",
    companyName: "InventoryPro London",
    contactName: "Laura Bennett",
    serviceKeys: ["check_in", "check_out", "inventory_creation", "inventory_verification"],
    rating: 4.8,
    reviewCount: 87,
    jobsCompleted: 312,
    responseTimeHours: 2.5,
    onTimeRate: 95,
    basePrice: 120,
    serviceAreas: ["London", "Essex", "Kent", "Surrey"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "31 Dec 2027", status: "Valid" },
      { name: "IPI Member", issuer: "IPI", expiry: "30 Jun 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Hiscox", coverAmount: "£2,000,000" },
      { type: "Professional Indemnity", provider: "Hiscox", coverAmount: "£500,000" },
    ],
    reviews: [
      { reviewer: "James Richardson", date: "18 Jun 2026", rating: 5, text: "Outstanding check-in reports. Photos are crystal clear and reports are incredibly detailed.", jobType: "Check In" },
      { reviewer: "Sarah Walker", date: "05 Jun 2026", rating: 5, text: "Used for 15 properties. Never had a deposit dispute thanks to their thorough inventories.", jobType: "Inventory Creation" },
      { reviewer: "David Thompson", date: "22 May 2026", rating: 4, text: "Very professional. Slight delay on the report but quality was excellent.", jobType: "Check Out" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20inventory%20clerk%20headshot%20portrait%2C%20wearing%20smart%20navy%20blazer%20with%20white%20blouse%2C%20warm%20confident%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting%2C%20sharp%20detail%20on%20face&width=200&height=200&seq=54&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-2",
    companyName: "ClearView Inspections",
    contactName: "Tom Harding",
    serviceKeys: ["check_in", "mid_term", "check_out"],
    rating: 4.6,
    reviewCount: 54,
    jobsCompleted: 198,
    responseTimeHours: 3.2,
    onTimeRate: 91,
    basePrice: 95,
    serviceAreas: ["Birmingham", "Coventry", "Solihull", "Wolverhampton"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "28 Feb 2028", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Aviva", coverAmount: "£1,000,000" },
      { type: "Professional Indemnity", provider: "Aviva", coverAmount: "£250,000" },
    ],
    reviews: [
      { reviewer: "Margaret Hughes", date: "15 Jun 2026", rating: 5, text: "Fast turnaround on mid-term inspections. Photos uploaded within hours of visit.", jobType: "Mid-Term Inspection" },
      { reviewer: "James Richardson", date: "01 Jun 2026", rating: 4, text: "Good reliable service. Reports are clear and well-structured.", jobType: "Check Out" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20property%20inspector%20headshot%20portrait%2C%20wearing%20light%20blue%20collared%20shirt%2C%20friendly%20professional%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=55&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-3",
    companyName: "AssetCheck Inventories",
    contactName: "Rachel Okonkwo",
    serviceKeys: ["inventory_creation", "inventory_verification", "check_in"],
    rating: 4.9,
    reviewCount: 63,
    jobsCompleted: 245,
    responseTimeHours: 1.8,
    onTimeRate: 97,
    basePrice: 140,
    serviceAreas: ["London", "Essex", "Hertfordshire"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "30 Sep 2027", status: "Valid" },
      { name: "Propertymark Member", issuer: "Propertymark", expiry: "31 Mar 2028", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "AXA Insurance", coverAmount: "£5,000,000" },
      { type: "Professional Indemnity", provider: "AXA Insurance", coverAmount: "£1,000,000" },
    ],
    reviews: [
      { reviewer: "Sarah Walker", date: "20 Jun 2026", rating: 5, text: "The most detailed inventories we've ever received. Every single item photographed.", jobType: "Inventory Creation" },
      { reviewer: "David Thompson", date: "10 Jun 2026", rating: 5, text: "Exceptional service. Their digital inventory system is fantastic.", jobType: "Inventory Verification" },
      { reviewer: "James Richardson", date: "28 May 2026", rating: 5, text: "Best in the business for HMO inventories. Handles complex properties with ease.", jobType: "Inventory Creation" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20inventory%20specialist%20headshot%20portrait%2C%20wearing%20smart%20dark%20blazer%2C%20confident%20warm%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=56&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-4",
    companyName: "Midland Property Checks",
    contactName: "Dave Wilson",
    serviceKeys: ["mid_term", "check_in", "check_out"],
    rating: 4.4,
    reviewCount: 38,
    jobsCompleted: 167,
    responseTimeHours: 4.5,
    onTimeRate: 87,
    basePrice: 75,
    serviceAreas: ["Birmingham", "Nottingham", "Leicester", "Derby"],
    certifications: [
      { name: "IPI Member", issuer: "IPI", expiry: "14 Jan 2028", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Zurich", coverAmount: "£1,000,000" },
    ],
    reviews: [
      { reviewer: "James Richardson", date: "12 Jun 2026", rating: 4, text: "Good mid-term inspections. Covers all the essentials at a fair price.", jobType: "Mid-Term Inspection" },
      { reviewer: "Margaret Hughes", date: "03 Jun 2026", rating: 4, text: "Reliable and punctual. Reports are thorough enough for our needs.", jobType: "Check In" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20property%20inspector%20headshot%20portrait%2C%20wearing%20navy%20polo%20shirt%2C%20friendly%20approachable%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=57&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-5",
    companyName: "Northern Inventory Services",
    contactName: "Emma Taylor",
    serviceKeys: ["check_in", "check_out", "inventory_creation", "inventory_verification", "mid_term"],
    rating: 4.7,
    reviewCount: 42,
    jobsCompleted: 203,
    responseTimeHours: 3.0,
    onTimeRate: 93,
    basePrice: 110,
    serviceAreas: ["Manchester", "Liverpool", "Leeds", "Sheffield"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "31 Dec 2027", status: "Valid" },
      { name: "Propertymark Member", issuer: "Propertymark", expiry: "30 Jun 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Allianz", coverAmount: "£2,000,000" },
      { type: "Professional Indemnity", provider: "Allianz", coverAmount: "£500,000" },
    ],
    reviews: [
      { reviewer: "Sarah Walker", date: "16 Jun 2026", rating: 5, text: "Fantastic service across all inspection types. Our go-to for the North.", jobType: "Full Service" },
      { reviewer: "David Thompson", date: "08 Jun 2026", rating: 5, text: "Check-out reports are comprehensive with clear photo evidence.", jobType: "Check Out" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20inventory%20clerk%20headshot%20portrait%2C%20wearing%20smart%20white%20blouse%20with%20grey%20blazer%2C%20professional%20warm%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=58&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-6",
    companyName: "SnapCheck Inventories",
    contactName: "James Okonkwo",
    serviceKeys: ["inventory_creation", "inventory_verification"],
    rating: 4.3,
    reviewCount: 27,
    jobsCompleted: 89,
    responseTimeHours: 5.5,
    onTimeRate: 84,
    basePrice: 90,
    serviceAreas: ["Bristol", "Cardiff", "Bath", "Gloucester"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "28 Feb 2028", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "AXA Insurance", coverAmount: "£1,000,000" },
    ],
    reviews: [
      { reviewer: "James Richardson", date: "14 Jun 2026", rating: 4, text: "Good inventory creation. Some photos could be sharper but overall solid.", jobType: "Inventory Creation" },
      { reviewer: "Margaret Hughes", date: "01 Jun 2026", rating: 5, text: "Excellent verification checks. Spotted things previous clerks missed.", jobType: "Inventory Verification" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20inventory%20clerk%20headshot%20portrait%2C%20wearing%20smart%20casual%20grey%20shirt%2C%20friendly%20professional%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=59&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-7",
    companyName: "TenancyCheck South",
    contactName: "Priya Sharma",
    serviceKeys: ["check_in", "mid_term", "check_out", "inventory_creation"],
    rating: 4.5,
    reviewCount: 45,
    jobsCompleted: 178,
    responseTimeHours: 3.8,
    onTimeRate: 89,
    basePrice: 105,
    serviceAreas: ["London", "Surrey", "Kent", "Sussex"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "31 Mar 2028", status: "Valid" },
      { name: "IPI Member", issuer: "IPI", expiry: "30 Sep 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Hiscox", coverAmount: "£2,000,000" },
      { type: "Professional Indemnity", provider: "Hiscox", coverAmount: "£500,000" },
    ],
    reviews: [
      { reviewer: "David Thompson", date: "19 Jun 2026", rating: 5, text: "Very thorough check-ins. Photos uploaded same evening of inspection.", jobType: "Check In" },
      { reviewer: "Sarah Walker", date: "05 Jun 2026", rating: 4, text: "Good service. Report layout is clean and easy to navigate.", jobType: "Mid-Term Inspection" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20property%20inspector%20headshot%20portrait%2C%20wearing%20smart%20dark%20blouse%2C%20confident%20warm%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=60&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
  {
    id: "ip-8",
    companyName: "RapidReport Inventories",
    contactName: "Chris Matthews",
    serviceKeys: ["check_in", "check_out", "inventory_verification", "mid_term"],
    rating: 4.2,
    reviewCount: 31,
    jobsCompleted: 134,
    responseTimeHours: 2.2,
    onTimeRate: 90,
    basePrice: 85,
    serviceAreas: ["Manchester", "Liverpool", "Bolton", "Warrington"],
    certifications: [
      { name: "AIIC Certified", issuer: "AIIC", expiry: "31 Dec 2026", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Aviva", coverAmount: "£1,000,000" },
    ],
    reviews: [
      { reviewer: "Margaret Hughes", date: "17 Jun 2026", rating: 4, text: "Fastest turnaround we've seen. Reports back within 24 hours consistently.", jobType: "Check Out" },
      { reviewer: "James Richardson", date: "02 Jun 2026", rating: 4, text: "Good efficient service. Perfect for standard check-ins.", jobType: "Check In" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20inventory%20clerk%20headshot%20portrait%2C%20wearing%20navy%20polo%20shirt%2C%20friendly%20professional%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=61&orientation=squarish",
    available: true,
    verified: true,
    isAgencyApproved: true,
  },
];

export const inventoryProperties: InventoryProperty[] = [
  {
    id: "prop-inv-1",
    name: "Rose Court Flat 2A",
    address: "12 Rose Avenue",
    city: "London",
    postcode: "E1 6AN",
    bedrooms: 2,
    bathrooms: 1,
    isFurnished: true,
    isHMO: true,
    hasGarden: false,
    hasParking: false,
    epcRating: "C",
    lastInspection: "10 Feb 2026",
    assignedTenant: "John Miller",
  },
  {
    id: "prop-inv-2",
    name: "Riverside Court",
    address: "Unit 3, Riverside Court",
    city: "Bristol",
    postcode: "BS1 4ST",
    bedrooms: 2,
    bathrooms: 1,
    isFurnished: true,
    isHMO: false,
    hasGarden: false,
    hasParking: false,
    epcRating: "B",
    lastInspection: "05 Aug 2024",
    assignedTenant: "Emma Wilson",
  },
  {
    id: "prop-inv-3",
    name: "Maple Gardens House",
    address: "34 Maple Gardens",
    city: "Cardiff",
    postcode: "CF10 3BZ",
    bedrooms: 4,
    bathrooms: 2,
    isFurnished: true,
    isHMO: true,
    hasGarden: true,
    hasParking: true,
    epcRating: "D",
    lastInspection: "18 Mar 2026",
    assignedTenant: "Michael Brown",
  },
  {
    id: "prop-inv-4",
    name: "14 Oak Avenue",
    address: "14 Oak Avenue",
    city: "Manchester",
    postcode: "M20 3AF",
    bedrooms: 3,
    bathrooms: 1,
    isFurnished: true,
    isHMO: false,
    hasGarden: false,
    hasParking: false,
    epcRating: "B",
    lastInspection: null,
    assignedTenant: "Sarah Jenkins",
  },
  {
    id: "prop-inv-5",
    name: "42 River Street",
    address: "42 River Street",
    city: "Birmingham",
    postcode: "B1 2JP",
    bedrooms: 2,
    bathrooms: 1,
    isFurnished: false,
    isHMO: false,
    hasGarden: false,
    hasParking: false,
    epcRating: "C",
    lastInspection: null,
    assignedTenant: "Lisa Chen",
  },
  {
    id: "prop-inv-6",
    name: "7 Elm Road",
    address: "7 Elm Road",
    city: "London",
    postcode: "SW1A 1AA",
    bedrooms: 1,
    bathrooms: 1,
    isFurnished: true,
    isHMO: false,
    hasGarden: false,
    hasParking: false,
    epcRating: "B",
    lastInspection: null,
    assignedTenant: null,
  },
];

export const initialRequests: InventoryRequest[] = [
  {
    id: "inv-req-1",
    propertyId: "prop-inv-1",
    propertyName: "Rose Court Flat 2A",
    propertyAddress: "12 Rose Avenue, London E1 6AN",
    serviceKey: "check_in",
    serviceName: "Check In",
    status: "completed",
    priority: "standard",
    requestedDate: "15 Jun 2026",
    scheduledDate: "18 Jun 2026",
    notes: "New tenant moving in. Full check-in required with meter readings and inventory baseline.",
    providerIds: ["ip-1", "ip-7"],
    providers: [inventoryProviders[0], inventoryProviders[6]],
    selectedProviderId: "ip-1",
    quoteAmount: 130,
    quoteAccepted: true,
    inspectionDate: "18 Jun 2026",
    inspectorName: "Laura Bennett",
    photosUploaded: true,
    photoCount: 42,
    reportUploaded: true,
    reportUrl: null,
    propertyUpdated: true,
    roomCount: 6,
  },
  {
    id: "inv-req-2",
    propertyId: "prop-inv-2",
    propertyName: "Riverside Court",
    propertyAddress: "Unit 3, Riverside Court, Bristol BS1 4ST",
    serviceKey: "mid_term",
    serviceName: "Mid-Term Inspection",
    status: "report_uploaded",
    priority: "standard",
    requestedDate: "22 Jun 2026",
    scheduledDate: "25 Jun 2026",
    notes: "Routine 6-month mid-term inspection. Check overall condition, garden, and any maintenance issues.",
    providerIds: ["ip-4", "ip-6"],
    providers: [inventoryProviders[3], inventoryProviders[5]],
    selectedProviderId: "ip-4",
    quoteAmount: 75,
    quoteAccepted: true,
    inspectionDate: "25 Jun 2026",
    inspectorName: "Dave Wilson",
    photosUploaded: true,
    photoCount: 28,
    reportUploaded: true,
    reportUrl: null,
    propertyUpdated: false,
    roomCount: 4,
  },
  {
    id: "inv-req-3",
    propertyId: "prop-inv-3",
    propertyName: "Maple Gardens House",
    propertyAddress: "34 Maple Gardens, Cardiff CF10 3BZ",
    serviceKey: "check_out",
    serviceName: "Check Out",
    status: "photos_uploaded",
    priority: "urgent",
    requestedDate: "24 Jun 2026",
    scheduledDate: "27 Jun 2026",
    notes: "Tenant moving out. Full check-out against original inventory needed. Keys to be collected.",
    providerIds: ["ip-3", "ip-5"],
    providers: [inventoryProviders[2], inventoryProviders[4]],
    selectedProviderId: "ip-3",
    quoteAmount: 160,
    quoteAccepted: true,
    inspectionDate: "27 Jun 2026",
    inspectorName: "Rachel Okonkwo",
    photosUploaded: true,
    photoCount: 56,
    reportUploaded: false,
    reportUrl: null,
    propertyUpdated: false,
    roomCount: 8,
  },
  {
    id: "inv-req-4",
    propertyId: "prop-inv-4",
    propertyName: "14 Oak Avenue",
    propertyAddress: "14 Oak Avenue, Manchester M20 3AF",
    serviceKey: "inventory_creation",
    serviceName: "Inventory Creation",
    status: "accepted",
    priority: "standard",
    requestedDate: "25 Jun 2026",
    scheduledDate: "29 Jun 2026",
    notes: "New property added to portfolio. Full inventory creation needed for 3-bed semi. Furnished.",
    providerIds: ["ip-5", "ip-8"],
    providers: [inventoryProviders[4], inventoryProviders[7]],
    selectedProviderId: "ip-5",
    quoteAmount: 150,
    quoteAccepted: true,
    inspectionDate: "29 Jun 2026",
    inspectorName: "Emma Taylor",
    photosUploaded: false,
    photoCount: 0,
    reportUploaded: false,
    reportUrl: null,
    propertyUpdated: false,
    roomCount: 5,
  },
  {
    id: "inv-req-5",
    propertyId: "prop-inv-5",
    propertyName: "42 River Street",
    propertyAddress: "42 River Street, Birmingham B1 2JP",
    serviceKey: "inventory_verification",
    serviceName: "Inventory Verification",
    status: "requested",
    priority: "standard",
    requestedDate: "26 Jun 2026",
    scheduledDate: "02 Jul 2026",
    notes: "Annual inventory verification required. Check all items against original inventory, update condition reports.",
    providerIds: ["ip-2", "ip-6"],
    providers: [inventoryProviders[1], inventoryProviders[5]],
    selectedProviderId: null,
    quoteAmount: null,
    quoteAccepted: false,
    inspectionDate: null,
    inspectorName: null,
    photosUploaded: false,
    photoCount: 0,
    reportUploaded: false,
    reportUrl: null,
    propertyUpdated: false,
    roomCount: 4,
  },
  {
    id: "inv-req-6",
    propertyId: "prop-inv-6",
    propertyName: "7 Elm Road",
    propertyAddress: "7 Elm Road, London SW1A 1AA",
    serviceKey: "check_in",
    serviceName: "Check In",
    status: "in_progress",
    priority: "standard",
    requestedDate: "26 Jun 2026",
    scheduledDate: "27 Jun 2026",
    notes: "New tenant for 1-bed flat in SW1. Check-in inspection with inventory creation.",
    providerIds: ["ip-1", "ip-3"],
    providers: [inventoryProviders[0], inventoryProviders[2]],
    selectedProviderId: "ip-1",
    quoteAmount: 110,
    quoteAccepted: true,
    inspectionDate: "27 Jun 2026",
    inspectorName: "Laura Bennett",
    photosUploaded: false,
    photoCount: 0,
    reportUploaded: false,
    reportUrl: null,
    propertyUpdated: false,
    roomCount: 4,
  },
];

export const propertyImages: Record<string, string> = {
  "prop-inv-1": "https://readdy.ai/api/search-image?query=Modern%20London%20apartment%20building%20exterior%20with%20contemporary%20brick%20and%20glass%20facade%2C%20large%20windows%2C%20clean%20residential%20street%2C%20professional%20architectural%20photography%2C%20soft%20overcast%20daylight%2C%20UK%20property%2C%20clean%20simple%20background%20with%20muted%20tones&width=300&height=180&seq=62&orientation=landscape",
  "prop-inv-2": "https://readdy.ai/api/search-image?query=Contemporary%20riverside%20apartment%20building%20in%20Bristol%20UK%2C%20modern%20waterfront%20residential%20complex%20with%20balconies%2C%20glass%20and%20steel%20architecture%2C%20professional%20architectural%20photography%2C%20clean%20simple%20background&width=300&height=180&seq=63&orientation=landscape",
  "prop-inv-3": "https://readdy.ai/api/search-image?query=Modern%20British%20semi-detached%20house%20exterior%20with%20brick%20and%20render%20facade%2C%20well-maintained%20front%20garden%20with%20driveway%2C%20suburban%20UK%20residential%20area%2C%20professional%20real%20estate%20photography&width=300&height=180&seq=64&orientation=landscape",
  "prop-inv-4": "https://readdy.ai/api/search-image?query=Modern%20British%20semi-detached%20house%20with%20red%20brick%20facade%20and%20white%20window%20frames%2C%20well-maintained%20small%20front%20garden%20with%20hedge%2C%20suburban%20Manchester%20residential%20street%2C%20professional%20real%20estate%20photography&width=300&height=180&seq=65&orientation=landscape",
  "prop-inv-5": "https://readdy.ai/api/search-image?query=Mid-terrace%20brick%20house%20Birmingham%20UK%2C%20white%20rendered%20front%2C%20bay%20windows%2C%20street%20parking%2C%20urban%20residential%20area%2C%20professional%20property%20photography%2C%20clean%20simple%20background&width=300&height=180&seq=66&orientation=landscape",
  "prop-inv-6": "https://readdy.ai/api/search-image?query=Victorian%20terraced%20flat%20conversion%20London%20SW1%2C%20white%20stucco%20frontage%2C%20black%20iron%20railings%2C%20period%20architecture%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background&width=300&height=180&seq=67&orientation=landscape",
};

export const statusStyles: Record<string, string> = {
  draft: "bg-[#94A3B8]/10 text-[#94A3B8]",
  requested: "bg-[#3B82F6]/10 text-[#3B82F6]",
  accepted: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
  in_progress: "bg-[#F59E0B]/10 text-[#F59E0B]",
  photos_uploaded: "bg-[#0EA5E9]/10 text-[#0EA5E9]",
  report_uploaded: "bg-[#10B981]/10 text-[#10B981]",
  completed: "bg-[#10B981]/10 text-[#10B981]",
};

export const statusLabels: Record<string, string> = {
  draft: "Draft",
  requested: "Awaiting Provider",
  accepted: "Provider Accepted",
  in_progress: "Inspection In Progress",
  photos_uploaded: "Photos Uploaded",
  report_uploaded: "Report Uploaded",
  completed: "Completed",
};

export const statusIcons: Record<string, string> = {
  draft: "ri-draft-line",
  requested: "ri-file-list-3-line",
  accepted: "ri-check-line",
  in_progress: "ri-time-line",
  photos_uploaded: "ri-image-line",
  report_uploaded: "ri-file-text-line",
  completed: "ri-check-double-line",
};