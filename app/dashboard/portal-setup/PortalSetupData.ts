export interface PortalProperty {
  id: string
  propertyName: string
  propertyAddress: string
  ownerName: string
  ownerEmail: string
  ownerPortalStatus: "not_invited" | "invited" | "active" | "disabled"
  ownerInviteDate?: string
  ownerPortalToken?: string
  tenantName: string
  tenantEmail: string
  tenantPortalStatus: "not_invited" | "invited" | "active" | "disabled"
  tenantInviteDate?: string
  tenantPortalToken?: string
  tenancyRef?: string
}

export interface OwnerDashboardData {
  ownerName: string
  ownerEmail: string
  properties: {
    id: string
    name: string
    address: string
    city: string
    postcode: string
    bedrooms: number
    status: string
    tenant: string
    rentAmount: string
    rentStatus: string
    nextInspection: string
    epcRating: string
    image: string
  }[]
  maintenanceSummary: { open: number; inProgress: number; completed: number }
  complianceSummary: { valid: number; expiring: number; expired: number }
  recentDocuments: { id: string; name: string; type: string; date: string; size: string; icon: string; color: string }[]
  recentInspections: { id: string; property: string; type: string; date: string; rating: string; status: string }[]
}

export interface TenantDashboardData {
  tenantName: string
  tenantEmail: string
  property: {
    name: string
    address: string
    city: string
    postcode: string
    image: string
  }
  tenancy: {
    ref: string
    startDate: string
    endDate: string
    rentAmount: string
    rentStatus: string
    nextPaymentDue: string
    depositAmount: string
    depositScheme: string
  }
  propertyManager: {
    name: string
    role: string
    email: string
    phone: string
    avatar: string
  }
  maintenanceTickets: { id: string; title: string; status: string; priority: string; date: string; description: string }[]
  sharedDocuments: { id: string; name: string; type: string; date: string; size: string; icon: string; color: string }[]
  inspectionNotices: { id: string; type: string; date: string; status: string }[]
}

export const portalProperties: PortalProperty[] = [
  {
    id: "pp1",
    propertyName: "Rose Court Flat 2A",
    propertyAddress: "12 Rose Avenue, London E1 6AN",
    ownerName: "James Richardson",
    ownerEmail: "james.richardson@email.com",
    ownerPortalStatus: "active",
    ownerInviteDate: "10 Jan 2026",
    ownerPortalToken: "own-rc2a-8f3a",
    tenantName: "John Miller",
    tenantEmail: "john.miller@email.com",
    tenantPortalStatus: "active",
    tenantInviteDate: "15 Sep 2024",
    tenantPortalToken: "tnt-rc2a-7b2c",
    tenancyRef: "TNCY-2024-001",
  },
  {
    id: "pp2",
    propertyName: "Riverside Court",
    propertyAddress: "Unit 3, Riverside Court, Bristol BS1 4ST",
    ownerName: "Emma Wilson",
    ownerEmail: "emma.wilson@email.com",
    ownerPortalStatus: "invited",
    ownerInviteDate: "15 Jun 2026",
    ownerPortalToken: "own-rsc-9d1b",
    tenantName: "Tom Harris",
    tenantEmail: "tom.harris@email.com",
    tenantPortalStatus: "active",
    tenantInviteDate: "05 Aug 2024",
    tenantPortalToken: "tnt-rsc-3e5a",
    tenancyRef: "TNCY-2025-004",
  },
  {
    id: "pp3",
    propertyName: "Maple Gardens House",
    propertyAddress: "34 Maple Gardens, Cardiff CF10 3BZ",
    ownerName: "Michael Brown",
    ownerEmail: "michael.brown@email.com",
    ownerPortalStatus: "active",
    ownerInviteDate: "05 Feb 2026",
    ownerPortalToken: "own-mgh-4c6d",
    tenantName: "Emma White",
    tenantEmail: "emma.white@email.com",
    tenantPortalStatus: "disabled",
    tenantInviteDate: "12 Mar 2024",
    tenantPortalToken: "tnt-mgh-1a9f",
    tenancyRef: "TNCY-2025-003",
  },
  {
    id: "pp4",
    propertyName: "Flat 4B Oak Street",
    propertyAddress: "Flat 4B Oak Street, Manchester M1 2AB",
    ownerName: "David Thompson",
    ownerEmail: "david.thompson@email.com",
    ownerPortalStatus: "not_invited",
    tenantName: "Sarah Jenkins",
    tenantEmail: "sarah.jenkins@email.com",
    tenantPortalStatus: "not_invited",
    tenancyRef: "TNCY-2026-006",
  },
  {
    id: "pp5",
    propertyName: "8 The Crescent",
    propertyAddress: "8 The Crescent, Birmingham B2 3CD",
    ownerName: "Margaret Hughes",
    ownerEmail: "margaret.hughes@email.com",
    ownerPortalStatus: "active",
    ownerInviteDate: "20 Mar 2026",
    ownerPortalToken: "own-crs-2e7h",
    tenantName: "Lisa Chen",
    tenantEmail: "lisa.chen@email.com",
    tenantPortalStatus: "invited",
    tenantInviteDate: "18 Jun 2026",
    tenantPortalToken: "tnt-crs-5k8m",
    tenancyRef: "TNCY-2026-007",
  },
  {
    id: "pp6",
    propertyName: "45 Baker Street",
    propertyAddress: "45 Baker Street, Manchester M1 2CD",
    ownerName: "Susan Wright",
    ownerEmail: "susan.wright@email.com",
    ownerPortalStatus: "disabled",
    ownerInviteDate: "12 Dec 2025",
    ownerPortalToken: "own-bks-3j9p",
    tenantName: "Mark Davies",
    tenantEmail: "mark.davies@email.com",
    tenantPortalStatus: "active",
    tenantInviteDate: "01 Nov 2025",
    tenantPortalToken: "tnt-bks-6r4q",
    tenancyRef: "TNCY-2025-008",
  },
]

export const ownerDashboard: OwnerDashboardData = {
  ownerName: "James Richardson",
  ownerEmail: "james.richardson@email.com",
  properties: [
    {
      id: "prop-001",
      name: "Rose Court Flat 2A",
      address: "12 Rose Avenue",
      city: "London",
      postcode: "E1 6AN",
      bedrooms: 2,
      status: "Occupied",
      tenant: "John Miller",
      rentAmount: "£1,850",
      rentStatus: "Paid",
      nextInspection: "20 Jun 2026",
      epcRating: "C",
      image: "https://readdy.ai/api/search-image?query=Modern%20London%20apartment%20building%20exterior%20with%20contemporary%20brick%20and%20glass%20facade%2C%20large%20windows%2C%20clean%20residential%20street%2C%20professional%20real%20estate%20photography%2C%20soft%20daylight%2C%20UK%20property%2C%20clean%20background&width=400&height=300&seq=owner-prop-001&orientation=landscape",
    },
    {
      id: "prop-002",
      name: "Riverside Court",
      address: "Unit 3, Riverside Court",
      city: "Bristol",
      postcode: "BS1 4ST",
      bedrooms: 2,
      status: "Occupied",
      tenant: "Emma Wilson",
      rentAmount: "£1,950",
      rentStatus: "Paid",
      nextInspection: "15 Aug 2026",
      epcRating: "B",
      image: "https://readdy.ai/api/search-image?query=Contemporary%20riverside%20apartment%20building%20in%20Bristol%20UK%2C%20modern%20waterfront%20residential%20complex%20with%20balconies%2C%20glass%20and%20steel%20architecture%2C%20professional%20photography%2C%20clean%20background&width=400&height=300&seq=owner-prop-002&orientation=landscape",
    },
  ],
  maintenanceSummary: { open: 1, inProgress: 2, completed: 5 },
  complianceSummary: { valid: 4, expiring: 2, expired: 0 },
  recentDocuments: [
    { id: "d1", name: "Gas Safety Certificate Mar 2026", type: "Gas Safety", date: "13 Mar 2026", size: "0.8 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]" },
    { id: "d2", name: "Routine Inspection Feb 2026", type: "Inspection Report", date: "10 Feb 2026", size: "1.8 MB", icon: "ri-clipboard-line", color: "bg-[#14B8A6]" },
    { id: "d3", name: "Boiler Service Invoice", type: "Invoice", date: "12 Mar 2026", size: "0.5 MB", icon: "ri-file-chart-line", color: "bg-[#8B5CF6]" },
    { id: "d4", name: "Building Insurance 2026", type: "Insurance", date: "02 Jul 2025", size: "3.2 MB", icon: "ri-shield-line", color: "bg-[#EF4444]" },
  ],
  recentInspections: [
    { id: "i1", property: "Rose Court Flat 2A", type: "Routine Inspection", date: "10 Feb 2026", rating: "Good", status: "Completed" },
    { id: "i2", property: "Riverside Court", type: "Mid-Term Inspection", date: "15 Jan 2026", rating: "Excellent", status: "Completed" },
  ],
}

export const tenantDashboard: TenantDashboardData = {
  tenantName: "John Miller",
  tenantEmail: "john.miller@email.com",
  property: {
    name: "Rose Court Flat 2A",
    address: "12 Rose Avenue",
    city: "London",
    postcode: "E1 6AN",
    image: "https://readdy.ai/api/search-image?query=Modern%20London%20apartment%20building%20exterior%20with%20contemporary%20brick%20and%20glass%20facade%2C%20large%20windows%2C%20clean%20residential%20street%2C%20professional%20real%20estate%20photography%2C%20soft%20daylight%2C%20UK%20property%2C%20clean%20background&width=400&height=300&seq=tenant-prop-001&orientation=landscape",
  },
  tenancy: {
    ref: "TNCY-2024-001",
    startDate: "15 Sep 2024",
    endDate: "14 Sep 2026",
    rentAmount: "£1,850",
    rentStatus: "Paid",
    nextPaymentDue: "01 Jul 2026",
    depositAmount: "£1,850",
    depositScheme: "MyDeposits",
  },
  propertyManager: {
    name: "Sarah Collins",
    role: "Senior Property Manager",
    email: "sarah.collins@lethub.com",
    phone: "020 7946 0123",
    avatar: "https://readdy.ai/api/search-image?query=Professional%20woman%20headshot%20portrait%2C%20business%20casual%2C%20friendly%20smile%2C%20clean%20studio%20background%2C%20soft%20lighting%2C%20corporate%20portrait%20photography&width=200&height=200&seq=tenant-pm-avatar&orientation=squarish",
  },
  maintenanceTickets: [
    { id: "mt1", title: "Bathroom mould around seal", status: "Under Review", priority: "Medium", date: "10 Feb 2026", description: "Mould growth around bath seal. Sealant needs replacement." },
    { id: "mt2", title: "Hallway light switch loose", status: "Completed", priority: "Low", date: "10 Feb 2026", description: "Light switch plate in hallway is loose and needs tightening." },
    { id: "mt3", title: "Kitchen extractor fan noisy", status: "Under Review", priority: "Low", date: "10 Feb 2026", description: "Extractor fan making humming noise. Still functional but noisy." },
  ],
  sharedDocuments: [
    { id: "sd1", name: "Tenancy Agreement", type: "Tenancy Agreement", date: "15 Sep 2024", size: "1.2 MB", icon: "ri-file-text-line", color: "bg-[#3B82F6]" },
    { id: "sd2", name: "Inventory Check-in", type: "Inventory", date: "15 Sep 2024", size: "2.4 MB", icon: "ri-file-list-line", color: "bg-[#F59E0B]" },
    { id: "sd3", name: "Gas Safety Certificate 2026", type: "Gas Safety", date: "13 Mar 2026", size: "0.8 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]" },
    { id: "sd4", name: "EPC Certificate", type: "EPC", date: "16 Aug 2018", size: "0.5 MB", icon: "ri-file-shield-line", color: "bg-[#10B981]" },
    { id: "sd5", name: "How to Rent Guide", type: "Guide", date: "15 Sep 2024", size: "1.5 MB", icon: "ri-book-open-line", color: "bg-[#8B5CF6]" },
    { id: "sd6", name: "Rent Payment Schedule", type: "Guide", date: "15 Sep 2024", size: "0.4 MB", icon: "ri-book-open-line", color: "bg-[#8B5CF6]" },
  ],
  inspectionNotices: [
    { id: "in1", type: "Routine Inspection", date: "20 Jun 2026", status: "Scheduled" },
    { id: "in2", type: "Routine Inspection", date: "10 Feb 2026", status: "Completed" },
  ],
}

export const statusBadge: Record<string, string> = {
  not_invited: "bg-[#94A3B8]/10 text-[#94A3B8]",
  invited: "bg-[#3B82F6]/10 text-[#3B82F6]",
  active: "bg-[#10B981]/10 text-[#10B981]",
  disabled: "bg-[#EF4444]/10 text-[#EF4444]",
}

export const statusLabel: Record<string, string> = {
  not_invited: "Not Invited",
  invited: "Invited",
  active: "Active",
  disabled: "Disabled",
}