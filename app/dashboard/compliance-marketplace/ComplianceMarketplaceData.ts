export type ComplianceServiceKey = "epc" | "gas_safety" | "eicr" | "fire_safety" | "legionella";

export type RequestStatus = "draft" | "requested" | "quoting" | "quoted" | "approved" | "completed";

export type QuoteStatus = "pending" | "submitted" | "accepted" | "rejected";

export interface ComplianceService {
  key: ComplianceServiceKey;
  name: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  renewalPeriod: string;
  requiredByLaw: boolean;
  averageCost: string;
  turnaroundDays: string;
  regulation: string;
  obligationCode: string;
}

export interface ComplianceProvider {
  id: string;
  companyName: string;
  trade: string;
  serviceKey: ComplianceServiceKey;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  responseTimeHours: number;
  onTimeRate: number;
  basePrice: number;
  serviceAreas: string[];
  certifications: { name: string; issuer: string; expiry: string; status: string }[];
  insurance: { type: string; provider: string; expiry: string; coverAmount: string }[];
  reviews: { reviewer: string; date: string; rating: number; text: string; jobType: string }[];
  avatar: string;
  available: boolean;
  verified: boolean;
  accreditation: string;
}

export interface ComplianceRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  serviceKey: ComplianceServiceKey;
  serviceName: string;
  status: RequestStatus;
  priority: "standard" | "urgent";
  requestedDate: string;
  requiredBy: string;
  notes: string;
  providerIds: string[];
  providers: ComplianceProvider[];
  selectedProviderId: string | null;
  quotes: ComplianceQuote[];
  approvedQuoteId: string | null;
  certificateUploaded: boolean;
  complianceUpdated: boolean;
}

export interface ComplianceQuote {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  estimatedDays: number;
  includesVat: boolean;
  includesRemedial: boolean;
  submittedDate: string;
  validUntil: string;
  notes: string;
  status: QuoteStatus;
}

export interface ComplianceProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  epcRating: string | null;
  epcExpiry: string | null;
  gasSafetyExpiry: string | null;
  eicrExpiry: string | null;
  hasSmokeAlarms: boolean;
  hasCOAlarm: boolean;
  isHMO: boolean;
  bedCount: number;
  complianceHealth: "good" | "warning" | "critical";
  expiringCount: number;
  expiredCount: number;
}

export const complianceServices: ComplianceService[] = [
  {
    key: "epc",
    name: "EPC Certificate",
    description: "Energy Performance Certificate — rates your property's energy efficiency from A to G. Legally required to market or let a property.",
    icon: "ri-file-chart-line",
    color: "#0EA5E9",
    bg: "bg-[#0EA5E9]",
    renewalPeriod: "10 years",
    requiredByLaw: true,
    averageCost: "£60 — £120",
    turnaroundDays: "3 — 5 days",
    regulation: "Energy Performance of Buildings Regulations 2012",
    obligationCode: "EPC",
  },
  {
    key: "gas_safety",
    name: "Gas Safety Certificate (CP12)",
    description: "Annual gas safety check of all gas appliances, pipework and flues. Landlords must provide a copy to tenants within 28 days.",
    icon: "ri-fire-line",
    color: "#EF4444",
    bg: "bg-[#EF4444]",
    renewalPeriod: "Annually",
    requiredByLaw: true,
    averageCost: "£60 — £100",
    turnaroundDays: "Same day — 2 days",
    regulation: "Gas Safety (Installation and Use) Regulations 1998",
    obligationCode: "GAS_SAFETY",
  },
  {
    key: "eicr",
    name: "EICR Inspection",
    description: "Electrical Installation Condition Report — mandatory 5-yearly check of fixed electrical installations. Identifies C1, C2 and C3 observations.",
    icon: "ri-shield-flash-line",
    color: "#7C3AED",
    bg: "bg-[#7C3AED]",
    renewalPeriod: "Every 5 years",
    requiredByLaw: true,
    averageCost: "£120 — £250",
    turnaroundDays: "1 — 3 days",
    regulation: "Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020",
    obligationCode: "EICR",
  },
  {
    key: "fire_safety",
    name: "Fire Safety Inspection",
    description: "Comprehensive fire risk assessment including smoke alarms, CO detectors, escape routes, fire doors and emergency lighting.",
    icon: "ri-alarm-warning-line",
    color: "#DC2626",
    bg: "bg-[#DC2626]",
    renewalPeriod: "Annually",
    requiredByLaw: true,
    averageCost: "£150 — £400",
    turnaroundDays: "2 — 5 days",
    regulation: "Regulatory Reform (Fire Safety) Order 2005 & Smoke and Carbon Monoxide Alarm Regulations 2015",
    obligationCode: "FIRE_SAFETY",
  },
  {
    key: "legionella",
    name: "Legionella Risk Assessment",
    description: "Water safety assessment to identify and control risks from legionella bacteria. Required for all rental properties with water systems.",
    icon: "ri-drop-line",
    color: "#3B82F6",
    bg: "bg-[#3B82F6]",
    renewalPeriod: "Annually (or on change)",
    requiredByLaw: true,
    averageCost: "£50 — £150",
    turnaroundDays: "1 — 3 days",
    regulation: "Health and Safety at Work Act 1974 & COSHH Regulations",
    obligationCode: "LEGIONELLA",
  },
];

export const complianceProviders: ComplianceProvider[] = [
  {
    id: "cp-1",
    companyName: "EcoEPC Assessments",
    trade: "EPC Assessor",
    serviceKey: "epc",
    rating: 4.3,
    reviewCount: 24,
    jobsCompleted: 98,
    responseTimeHours: 6.5,
    onTimeRate: 88,
    basePrice: 85,
    serviceAreas: ["Birmingham", "Coventry", "Solihull", "Worcester"],
    certifications: [
      { name: "Accredited Energy Assessor", issuer: "Elmhurst Energy", expiry: "31 Dec 2026", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Zurich", expiry: "28 Feb 2027", coverAmount: "£1,000,000" },
      { type: "Professional Indemnity", provider: "Zurich", expiry: "28 Feb 2027", coverAmount: "£250,000" },
    ],
    reviews: [
      { reviewer: "James Hart", date: "15 Jun 2026", rating: 4, text: "Good service. Certificate delivered same day.", jobType: "EPC Certificate" },
      { reviewer: "Sarah Collins", date: "01 Jun 2026", rating: 4, text: "Reliable. Had the EPC done within a week.", jobType: "EPC Renewal" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20energy%20assessor%20headshot%20portrait%2C%20wearing%20smart%20casual%20shirt%2C%20warm%20professional%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting%2C%20sharp%20detail%20on%20face&width=200&height=200&seq=38&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "Elmhurst Energy",
  },
  {
    id: "cp-2",
    companyName: "EPC Direct London",
    trade: "EPC Assessor",
    serviceKey: "epc",
    rating: 4.6,
    reviewCount: 42,
    jobsCompleted: 156,
    responseTimeHours: 4.2,
    onTimeRate: 92,
    basePrice: 95,
    serviceAreas: ["London", "Essex", "Kent", "Surrey"],
    certifications: [
      { name: "Accredited Energy Assessor", issuer: "Stroma Certification", expiry: "31 Dec 2026", status: "Valid" },
      { name: "Domestic Energy Assessor", issuer: "ABBE", expiry: "30 Sep 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "AXA Insurance", expiry: "31 Dec 2026", coverAmount: "£2,000,000" },
      { type: "Professional Indemnity", provider: "AXA Insurance", expiry: "31 Dec 2026", coverAmount: "£500,000" },
    ],
    reviews: [
      { reviewer: "Sarah Collins", date: "20 Jun 2026", rating: 5, text: "Best EPC service we use. Fast turnaround and always available.", jobType: "EPC Renewal" },
      { reviewer: "James Hart", date: "05 Jun 2026", rating: 5, text: "Brilliant service. Digital certificate delivered within 24 hours.", jobType: "EPC Certificate" },
      { reviewer: "Sarah Collins", date: "18 May 2026", rating: 4, text: "Thorough assessment. Rating improved after recommended works.", jobType: "EPC Assessment" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20EPC%20energy%20assessor%20headshot%20portrait%2C%20wearing%20navy%20blazer%2C%20confident%20friendly%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting%2C%20sharp%20focus%20on%20face&width=200&height=200&seq=39&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "Stroma Certification",
  },
  {
    id: "cp-3",
    companyName: "GasSafe Pro Solutions",
    trade: "Gas Engineer",
    serviceKey: "gas_safety",
    rating: 4.8,
    reviewCount: 56,
    jobsCompleted: 52,
    responseTimeHours: 1.8,
    onTimeRate: 96,
    basePrice: 85,
    serviceAreas: ["Birmingham", "Coventry", "Wolverhampton", "Solihull"],
    certifications: [
      { name: "Gas Safe Registered", issuer: "Gas Safe Register", expiry: "31 Mar 2027", status: "Valid" },
      { name: "OFTEC Registered", issuer: "OFTEC", expiry: "14 Jan 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Zurich", expiry: "30 Jun 2027", coverAmount: "£5,000,000" },
      { type: "Employers Liability", provider: "Zurich", expiry: "30 Jun 2027", coverAmount: "£10,000,000" },
    ],
    reviews: [
      { reviewer: "James Hart", date: "10 Jun 2026", rating: 5, text: "Incredibly fast response. Fixed boiler same day and issued certificate.", jobType: "Gas Safety Check" },
      { reviewer: "Sarah Collins", date: "02 Jun 2026", rating: 5, text: "Annual gas check completed. Digital certificate issued instantly.", jobType: "CP12 Certificate" },
      { reviewer: "James Hart", date: "20 May 2026", rating: 4, text: "Good work. Slight delay with paperwork but gas check was thorough.", jobType: "Boiler Service" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20gas%20engineer%20headshot%20portrait%2C%20wearing%20navy%20blue%20uniform%20with%20gas%20safe%20badge%20visible%2C%20friendly%20confident%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=40&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "Gas Safe Register",
  },
  {
    id: "cp-4",
    companyName: "SafeGas Engineers Ltd",
    trade: "Gas Engineer",
    serviceKey: "gas_safety",
    rating: 4.7,
    reviewCount: 38,
    jobsCompleted: 143,
    responseTimeHours: 3.5,
    onTimeRate: 91,
    basePrice: 75,
    serviceAreas: ["London", "Essex", "Hertfordshire"],
    certifications: [
      { name: "Gas Safe Registered", issuer: "Gas Safe Register", expiry: "15 Aug 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Aviva", expiry: "31 Dec 2026", coverAmount: "£5,000,000" },
      { type: "Employers Liability", provider: "Aviva", expiry: "31 Dec 2026", coverAmount: "£10,000,000" },
    ],
    reviews: [
      { reviewer: "Sarah Collins", date: "13 Mar 2026", rating: 5, text: "Our regular gas engineer. Always reliable and certificates are always on time.", jobType: "Annual Gas Check" },
      { reviewer: "James Hart", date: "28 Feb 2026", rating: 4, text: "Good thorough check. Report was detailed and clear.", jobType: "CP12 Certificate" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20gas%20safe%20engineer%20headshot%20portrait%2C%20wearing%20branded%20work%20polo%20shirt%20with%20gas%20safe%20logo%2C%20warm%20friendly%20smile%2C%20clean%20white%20studio%20background%2C%20professional%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=41&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "Gas Safe Register",
  },
  {
    id: "cp-5",
    companyName: "Certify Electrical Ltd",
    trade: "EICR Contractor",
    serviceKey: "eicr",
    rating: 4.5,
    reviewCount: 31,
    jobsCompleted: 64,
    responseTimeHours: 5.2,
    onTimeRate: 85,
    basePrice: 195,
    serviceAreas: ["Leeds", "Sheffield", "Doncaster", "Wakefield"],
    certifications: [
      { name: "NICEIC Approved Contractor", issuer: "NICEIC", expiry: "14 Jan 2027", status: "Valid" },
      { name: "NAPIT Registered", issuer: "NAPIT", expiry: "28 Feb 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "AXA Insurance", expiry: "30 Sep 2026", coverAmount: "£5,000,000" },
      { type: "Professional Indemnity", provider: "AXA Insurance", expiry: "30 Sep 2026", coverAmount: "£1,000,000" },
    ],
    reviews: [
      { reviewer: "James Hart", date: "12 Jun 2026", rating: 5, text: "Thorough EICR inspection. Clear report with all issues prioritised.", jobType: "EICR Inspection" },
      { reviewer: "Sarah Collins", date: "28 May 2026", rating: 4, text: "Good work. All remedial works completed within quote.", jobType: "Remedial Works" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20electrical%20contractor%20headshot%20portrait%2C%20wearing%20navy%20work%20polo%20shirt%2C%20friendly%20professional%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=42&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "NICEIC",
  },
  {
    id: "cp-6",
    companyName: "London Electrical Services",
    trade: "EICR Contractor",
    serviceKey: "eicr",
    rating: 4.6,
    reviewCount: 28,
    jobsCompleted: 89,
    responseTimeHours: 4.8,
    onTimeRate: 89,
    basePrice: 220,
    serviceAreas: ["London", "Surrey", "Kent", "Essex"],
    certifications: [
      { name: "NICEIC Approved Contractor", issuer: "NICEIC", expiry: "30 Jun 2027", status: "Valid" },
      { name: "ECA Registered", issuer: "ECA", expiry: "31 Dec 2026", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Allianz", expiry: "31 Dec 2026", coverAmount: "£5,000,000" },
      { type: "Professional Indemnity", provider: "Allianz", expiry: "31 Dec 2026", coverAmount: "£2,000,000" },
    ],
    reviews: [
      { reviewer: "Sarah Collins", date: "19 Jun 2021", rating: 4, text: "Professional EICR completed. Some observations but all well explained.", jobType: "EICR Inspection" },
      { reviewer: "James Hart", date: "05 Feb 2023", rating: 5, text: "Excellent service. Report was comprehensive and easy to understand.", jobType: "EICR Renewal" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20electrician%20headshot%20portrait%2C%20wearing%20grey%20work%20polo%20shirt%20with%20NICEIC%20badge%2C%20friendly%20confident%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=43&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "NICEIC",
  },
  {
    id: "cp-7",
    companyName: "Guardian Fire Safety",
    trade: "Fire Safety Contractor",
    serviceKey: "fire_safety",
    rating: 4.8,
    reviewCount: 45,
    jobsCompleted: 72,
    responseTimeHours: 3.5,
    onTimeRate: 92,
    basePrice: 350,
    serviceAreas: ["Manchester", "Liverpool", "Bolton", "Warrington"],
    certifications: [
      { name: "BAFE Registered", issuer: "BAFE", expiry: "31 Dec 2026", status: "Valid" },
      { name: "Fire Industry Association", issuer: "FIA", expiry: "28 Feb 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Allianz", expiry: "31 Dec 2026", coverAmount: "£5,000,000" },
      { type: "Employers Liability", provider: "Allianz", expiry: "31 Dec 2026", coverAmount: "£10,000,000" },
    ],
    reviews: [
      { reviewer: "Sarah Collins", date: "18 Jun 2026", rating: 5, text: "Comprehensive fire risk assessment. Very thorough. Report was excellent.", jobType: "Fire Risk Assessment" },
      { reviewer: "James Hart", date: "05 Jun 2026", rating: 5, text: "Installed fire doors across three properties. Clean work, on time.", jobType: "Fire Door Installation" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20fire%20safety%20contractor%20headshot%20portrait%2C%20wearing%20branded%20navy%20polo%20shirt%20with%20fire%20safety%20accreditation%20badge%2C%20confident%20friendly%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=44&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "BAFE",
  },
  {
    id: "cp-8",
    companyName: "FireSafe London",
    trade: "Fire Safety Contractor",
    serviceKey: "fire_safety",
    rating: 4.5,
    reviewCount: 33,
    jobsCompleted: 118,
    responseTimeHours: 4.2,
    onTimeRate: 86,
    basePrice: 280,
    serviceAreas: ["London", "Essex", "Kent", "Surrey"],
    certifications: [
      { name: "BAFE Registered", issuer: "BAFE", expiry: "30 Jun 2027", status: "Valid" },
      { name: "IFE Registered", issuer: "IFE", expiry: "31 Dec 2026", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "AXA Insurance", expiry: "31 Dec 2026", coverAmount: "£5,000,000" },
      { type: "Employers Liability", provider: "AXA Insurance", expiry: "31 Dec 2026", coverAmount: "£10,000,000" },
    ],
    reviews: [
      { reviewer: "James Hart", date: "10 Jun 2026", rating: 4, text: "Good fire risk assessment. All recommendations were sensible.", jobType: "Fire Risk Assessment" },
      { reviewer: "Sarah Collins", date: "20 May 2026", rating: 5, text: "Alarm testing done efficiently across portfolio. All certified.", jobType: "Alarm Testing" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20fire%20safety%20officer%20headshot%20portrait%2C%20wearing%20white%20shirt%20with%20fire%20safety%20logo%2C%20friendly%20professional%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=45&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "BAFE",
  },
  {
    id: "cp-9",
    companyName: "WaterSafe Compliance",
    trade: "Damp & Mould Specialist",
    serviceKey: "legionella",
    rating: 4.4,
    reviewCount: 19,
    jobsCompleted: 47,
    responseTimeHours: 5.5,
    onTimeRate: 84,
    basePrice: 95,
    serviceAreas: ["Bristol", "Bath", "Gloucester", "Cardiff"],
    certifications: [
      { name: "WaterSafe Approved", issuer: "WaterSafe", expiry: "31 Dec 2026", status: "Valid" },
      { name: "Legionella Control Association", issuer: "LCA", expiry: "30 Sep 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "AXA Insurance", expiry: "31 Dec 2026", coverAmount: "£2,000,000" },
      { type: "Professional Indemnity", provider: "AXA Insurance", expiry: "31 Dec 2026", coverAmount: "£500,000" },
    ],
    reviews: [
      { reviewer: "Sarah Collins", date: "16 Jun 2026", rating: 4, text: "Good legionella assessment. Clear report with simple actions.", jobType: "Legionella Assessment" },
      { reviewer: "James Hart", date: "02 May 2026", rating: 4, text: "Thorough water safety check. All documentation provided.", jobType: "Water Safety Check" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20female%20water%20safety%20specialist%20headshot%20portrait%2C%20wearing%20smart%20professional%20blouse%2C%20warm%20confident%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=46&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "LCA",
  },
  {
    id: "cp-10",
    companyName: "AquaSafe Assessments",
    trade: "Damp & Mould Specialist",
    serviceKey: "legionella",
    rating: 4.6,
    reviewCount: 22,
    jobsCompleted: 63,
    responseTimeHours: 3.8,
    onTimeRate: 90,
    basePrice: 110,
    serviceAreas: ["London", "Essex", "Hertfordshire", "Surrey"],
    certifications: [
      { name: "WaterSafe Approved", issuer: "WaterSafe", expiry: "30 Jun 2027", status: "Valid" },
      { name: "Legionella Control Association", issuer: "LCA", expiry: "31 Dec 2026", status: "Valid" },
      { name: "City & Guilds Water Systems", issuer: "City & Guilds", expiry: "31 Mar 2027", status: "Valid" },
    ],
    insurance: [
      { type: "Public Liability", provider: "Hiscox", expiry: "31 Dec 2026", coverAmount: "£2,000,000" },
      { type: "Professional Indemnity", provider: "Hiscox", expiry: "31 Dec 2026", coverAmount: "£1,000,000" },
    ],
    reviews: [
      { reviewer: "James Hart", date: "22 Jun 2026", rating: 5, text: "Excellent legionella risk assessment. Very detailed report.", jobType: "Legionella Assessment" },
      { reviewer: "Sarah Collins", date: "10 Jun 2026", rating: 5, text: "Professional service. Rapid turnaround on the certificate.", jobType: "Water Safety" },
    ],
    avatar: "https://readdy.ai/api/search-image?query=Professional%20male%20water%20safety%20assessor%20headshot%20portrait%2C%20wearing%20navy%20polo%20shirt%2C%20friendly%20confident%20smile%2C%20clean%20white%20studio%20background%2C%20corporate%20photography%2C%20soft%20diffused%20lighting&width=200&height=200&seq=47&orientation=squarish",
    available: true,
    verified: true,
    accreditation: "LCA",
  },
];

export const complianceProperties: ComplianceProperty[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    name: "14 Oak Avenue",
    address: "14 Oak Avenue",
    city: "Manchester",
    postcode: "M20 3AF",
    epcRating: "B",
    epcExpiry: "2030-05-15",
    gasSafetyExpiry: "2027-06-01",
    eicrExpiry: "2026-08-15",
    hasSmokeAlarms: true,
    hasCOAlarm: true,
    isHMO: false,
    bedCount: 3,
    complianceHealth: "good",
    expiringCount: 0,
    expiredCount: 0,
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    name: "42 River Street",
    address: "42 River Street",
    city: "Birmingham",
    postcode: "B1 2JP",
    epcRating: "C",
    epcExpiry: "2027-11-01",
    gasSafetyExpiry: "2026-01-15",
    eicrExpiry: "2025-12-01",
    hasSmokeAlarms: false,
    hasCOAlarm: false,
    isHMO: false,
    bedCount: 2,
    complianceHealth: "critical",
    expiringCount: 1,
    expiredCount: 2,
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    name: "7 Elm Road",
    address: "7 Elm Road",
    city: "London",
    postcode: "SW1A 1AA",
    epcRating: "B",
    epcExpiry: "2029-03-20",
    gasSafetyExpiry: "2027-09-01",
    eicrExpiry: "2027-05-20",
    hasSmokeAlarms: true,
    hasCOAlarm: false,
    isHMO: false,
    bedCount: 1,
    complianceHealth: "warning",
    expiringCount: 0,
    expiredCount: 0,
  },
  {
    id: "prop-mock-4",
    name: "Rose Court Flat 2A",
    address: "12 Rose Avenue",
    city: "London",
    postcode: "E1 6AN",
    epcRating: "C",
    epcExpiry: "2028-08-15",
    gasSafetyExpiry: "2027-03-12",
    eicrExpiry: "2026-06-18",
    hasSmokeAlarms: true,
    hasCOAlarm: true,
    isHMO: true,
    bedCount: 2,
    complianceHealth: "warning",
    expiringCount: 1,
    expiredCount: 0,
  },
  {
    id: "prop-mock-5",
    name: "Riverside Court",
    address: "Unit 3, Riverside Court",
    city: "Bristol",
    postcode: "BS1 4ST",
    epcRating: "B",
    epcExpiry: "2028-11-30",
    gasSafetyExpiry: "2026-11-20",
    eicrExpiry: "2026-04-10",
    hasSmokeAlarms: false,
    hasCOAlarm: true,
    isHMO: false,
    bedCount: 2,
    complianceHealth: "critical",
    expiringCount: 1,
    expiredCount: 2,
  },
  {
    id: "prop-mock-6",
    name: "Maple Gardens House",
    address: "34 Maple Gardens",
    city: "Cardiff",
    postcode: "CF10 3BZ",
    epcRating: "D",
    epcExpiry: "2026-01-02",
    gasSafetyExpiry: "2025-12-25",
    eicrExpiry: "2028-02-14",
    hasSmokeAlarms: true,
    hasCOAlarm: false,
    isHMO: true,
    bedCount: 4,
    complianceHealth: "critical",
    expiringCount: 0,
    expiredCount: 3,
  },
];

export const initialRequests: ComplianceRequest[] = [
  {
    id: "req-1",
    propertyId: "prop-mock-6",
    propertyName: "Maple Gardens House",
    propertyAddress: "34 Maple Gardens, Cardiff",
    serviceKey: "gas_safety",
    serviceName: "Gas Safety Certificate",
    status: "approved",
    priority: "urgent",
    requestedDate: "22 Jun 2026",
    requiredBy: "01 Jul 2026",
    notes: "Gas safety expired 158 days ago. Urgent renewal required. HMO property — 4 bedrooms.",
    providerIds: ["cp-3", "cp-4"],
    providers: [complianceProviders[2], complianceProviders[3]],
    selectedProviderId: "cp-3",
    quotes: [
      { id: "q-1", providerId: "cp-3", providerName: "GasSafe Pro Solutions", amount: 95, estimatedDays: 1, includesVat: true, includesRemedial: false, submittedDate: "23 Jun 2026", validUntil: "07 Jul 2026", notes: "Includes full CP12 certificate. Same-day service available. £85 + VAT.", status: "accepted" },
      { id: "q-2", providerId: "cp-4", providerName: "SafeGas Engineers Ltd", amount: 75, estimatedDays: 3, includesVat: true, includesRemedial: false, submittedDate: "24 Jun 2026", validUntil: "08 Jul 2026", notes: "Standard gas safety check. Certificate issued within 48 hours of inspection.", status: "submitted" },
    ],
    approvedQuoteId: "q-1",
    certificateUploaded: false,
    complianceUpdated: false,
  },
  {
    id: "req-2",
    propertyId: "d0000000-0000-0000-0000-000000000002",
    propertyName: "42 River Street",
    propertyAddress: "42 River Street, Birmingham",
    serviceKey: "eicr",
    serviceName: "EICR Inspection",
    status: "quoting",
    priority: "urgent",
    requestedDate: "25 Jun 2026",
    requiredBy: "05 Jul 2026",
    notes: "EICR expired December 2025. Urgent inspection needed. 2-bed flat in Birmingham.",
    providerIds: ["cp-5", "cp-6"],
    providers: [complianceProviders[4], complianceProviders[5]],
    selectedProviderId: null,
    quotes: [],
    approvedQuoteId: null,
    certificateUploaded: false,
    complianceUpdated: false,
  },
  {
    id: "req-3",
    propertyId: "prop-mock-4",
    propertyName: "Rose Court Flat 2A",
    propertyAddress: "12 Rose Avenue, London",
    serviceKey: "fire_safety",
    serviceName: "Fire Safety Inspection",
    status: "quoted",
    priority: "standard",
    requestedDate: "20 Jun 2026",
    requiredBy: "15 Jul 2026",
    notes: "HMO property with 2 bedrooms. Fire risk assessment expired. Smoke alarms due for check.",
    providerIds: ["cp-7", "cp-8"],
    providers: [complianceProviders[6], complianceProviders[7]],
    selectedProviderId: null,
    quotes: [
      { id: "q-3", providerId: "cp-7", providerName: "Guardian Fire Safety", amount: 380, estimatedDays: 3, includesVat: true, includesRemedial: false, submittedDate: "22 Jun 2026", validUntil: "06 Jul 2026", notes: "Full fire risk assessment + smoke/CO alarm testing. HMO compliant report.", status: "submitted" },
      { id: "q-4", providerId: "cp-8", providerName: "FireSafe London", amount: 420, estimatedDays: 5, includesVat: true, includesRemedial: true, submittedDate: "24 Jun 2026", validUntil: "08 Jul 2026", notes: "Assessment + alarm testing + basic remedial works included. Emergency lighting check.", status: "submitted" },
    ],
    approvedQuoteId: null,
    certificateUploaded: false,
    complianceUpdated: false,
  },
  {
    id: "req-4",
    propertyId: "prop-mock-5",
    propertyName: "Riverside Court",
    propertyAddress: "Unit 3, Riverside Court, Bristol",
    serviceKey: "legionella",
    serviceName: "Legionella Assessment",
    status: "requested",
    priority: "standard",
    requestedDate: "26 Jun 2026",
    requiredBy: "10 Jul 2026",
    notes: "Current legionella assessment expires in 15 days. 2-bed flat with combi boiler and hot water cylinder.",
    providerIds: ["cp-9", "cp-10"],
    providers: [complianceProviders[8], complianceProviders[9]],
    selectedProviderId: null,
    quotes: [],
    approvedQuoteId: null,
    certificateUploaded: false,
    complianceUpdated: false,
  },
];

export const compliancePropertyImages: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "https://readdy.ai/api/search-image?query=Modern%20British%20semi-detached%20house%20with%20red%20brick%20facade%20and%20white%20window%20frames%2C%20well-maintained%20small%20front%20garden%20with%20hedge%2C%20suburban%20Manchester%20residential%20street%2C%20professional%20real%20estate%20photography%2C%20neutral%20overcast%20sky%2C%20clean%20simple%20background&width=300&height=180&seq=48&orientation=landscape",
  "d0000000-0000-0000-0000-000000000002": "https://readdy.ai/api/search-image?query=Mid-terrace%20brick%20house%20Birmingham%20UK%2C%20white%20rendered%20front%2C%20bay%20windows%2C%20street%20parking%2C%20urban%20residential%20area%2C%20professional%20property%20photography%2C%20clean%20simple%20background%20with%20muted%20tones&width=300&height=180&seq=49&orientation=landscape",
  "d0000000-0000-0000-0000-000000000003": "https://readdy.ai/api/search-image?query=Victorian%20terraced%20flat%20conversion%20London%20SW1%2C%20white%20stucco%20frontage%2C%20black%20iron%20railings%2C%20period%20architecture%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20soft%20daylight&width=300&height=180&seq=50&orientation=landscape",
  "prop-mock-4": "https://readdy.ai/api/search-image?query=Modern%20London%20apartment%20building%20exterior%20with%20contemporary%20brick%20and%20glass%20facade%2C%20large%20windows%2C%20clean%20residential%20street%2C%20professional%20architectural%20photography%2C%20soft%20overcast%20daylight%2C%20UK%20property%2C%20clean%20simple%20background%20with%20muted%20tones&width=300&height=180&seq=51&orientation=landscape",
  "prop-mock-5": "https://readdy.ai/api/search-image?query=Contemporary%20riverside%20apartment%20building%20in%20Bristol%20UK%2C%20modern%20waterfront%20residential%20complex%20with%20balconies%2C%20glass%20and%20steel%20architecture%2C%20professional%20architectural%20photography%2C%20clean%20simple%20background%20with%20muted%20tones&width=300&height=180&seq=52&orientation=landscape",
  "prop-mock-6": "https://readdy.ai/api/search-image?query=Modern%20British%20semi-detached%20house%20exterior%20with%20brick%20and%20render%20facade%2C%20well-maintained%20front%20garden%20with%20driveway%2C%20suburban%20UK%20residential%20area%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20tones&width=300&height=180&seq=53&orientation=landscape",
};