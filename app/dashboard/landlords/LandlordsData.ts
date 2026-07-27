export interface Owner {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  companyName?: string
  notes?: string
  portalStatus: "not_invited" | "invited" | "active" | "disabled"
  portalToken?: string
  inviteDate?: string
  lastLogin?: string
  linkedProperties: { id: string; name: string; address: string }[]
  totalProperties: number
  dateAdded: string
}

export const owners: Owner[] = [
  {
    id: "own-001",
    fullName: "James Richardson",
    email: "james.richardson@email.com",
    phone: "+44 7700 900123",
    address: "45 Park Lane, London W1K 1PN",
    companyName: "Richardson Property Holdings Ltd",
    notes: "Prefers email communication. Has two properties with LetHub since 2024.",
    portalStatus: "active",
    portalToken: "own-rc2a-8f3a",
    inviteDate: "10 Jan 2026",
    lastLogin: "24 Jun 2026",
    linkedProperties: [
      { id: "prop-001", name: "Rose Court Flat 2A", address: "12 Rose Avenue, London E1 6AN" },
      { id: "prop-002", name: "Riverside Court", address: "Unit 3, Riverside Court, Bristol BS1 4ST" },
    ],
    totalProperties: 2,
    dateAdded: "15 Sep 2024",
  },
  {
    id: "own-002",
    fullName: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+44 7700 900456",
    address: "88 Kings Road, London SW3 4UT",
    companyName: "",
    notes: "Overseas landlord based in Singapore for 6 months of the year.",
    portalStatus: "active",
    portalToken: "own-oak-2b4d",
    inviteDate: "22 Nov 2025",
    lastLogin: "20 Jun 2026",
    linkedProperties: [
      { id: "prop-003", name: "Oak Court", address: "Oak Court, 5 Oak Lane, Manchester M20 1AB" },
    ],
    totalProperties: 1,
    dateAdded: "18 Aug 2025",
  },
  {
    id: "own-003",
    fullName: "David Olu",
    email: "david.olu@email.com",
    phone: "+44 7700 900789",
    address: "12 Canary Wharf, London E14 5AB",
    companyName: "Olu Investments Ltd",
    notes: "Portfolio landlord. Three properties, looking to expand to five by end of year.",
    portalStatus: "invited",
    portalToken: "own-pkv-6c8f",
    inviteDate: "15 Jun 2026",
    lastLogin: undefined,
    linkedProperties: [
      { id: "prop-004", name: "Park View House", address: "17 Park View, Birmingham B15 2TT" },
    ],
    totalProperties: 1,
    dateAdded: "02 Jan 2026",
  },
  {
    id: "own-004",
    fullName: "Fiona MacLeod",
    email: "fiona.macleod@email.com",
    phone: "+44 7700 900321",
    address: "3 Castle Terrace, Edinburgh EH1 2EL",
    companyName: "",
    notes: "First-time landlord. Inherited property in late 2025.",
    portalStatus: "not_invited",
    portalToken: undefined,
    inviteDate: undefined,
    lastLogin: undefined,
    linkedProperties: [
      { id: "prop-005", name: "The Willows", address: "22 The Willows, Edinburgh EH4 3BN" },
    ],
    totalProperties: 1,
    dateAdded: "08 Mar 2026",
  },
  {
    id: "own-005",
    fullName: "Michael Okonkwo",
    email: "michael.okonkwo@email.com",
    phone: "+44 7700 900654",
    address: "67 Victoria Street, Manchester M3 1ST",
    companyName: "Okonkwo & Sons Property",
    notes: "Experienced landlord with 15+ years in the market. Uses own contractors for major works.",
    portalStatus: "active",
    portalToken: "own-mcr-9g2h",
    inviteDate: "05 Feb 2026",
    lastLogin: "25 Jun 2026",
    linkedProperties: [
      { id: "prop-006", name: "12 Derby Road", address: "12 Derby Road, Manchester M14 5LL" },
      { id: "prop-007", name: "Flat 3 Ash House", address: "Ash House, 90 Oxford Road, Manchester M13 9PG" },
      { id: "prop-008", name: "34 Moss Lane", address: "34 Moss Lane, Manchester M16 7AE" },
    ],
    totalProperties: 3,
    dateAdded: "12 Oct 2024",
  },
  {
    id: "own-006",
    fullName: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+44 7700 900987",
    address: "22 The Broadway, Leicester LE1 1AA",
    companyName: "Patel Estates Ltd",
    notes: "Manages properties through family company. Responsive to maintenance approvals.",
    portalStatus: "disabled",
    portalToken: "own-lcs-1d5e",
    inviteDate: "30 Nov 2025",
    lastLogin: "15 Jan 2026",
    linkedProperties: [
      { id: "prop-009", name: "Flat 1A Belgrave Road", address: "1A Belgrave Road, Leicester LE4 5PH" },
    ],
    totalProperties: 1,
    dateAdded: "15 Jul 2025",
  },
  {
    id: "own-007",
    fullName: "Thomas Wright",
    email: "thomas.wright@email.com",
    phone: "+44 7700 900111",
    address: "14 Marine Parade, Brighton BN2 1TL",
    companyName: "Wright Coastal Lettings",
    notes: "Specialises in HMO properties. Three student lets in Brighton.",
    portalStatus: "active",
    portalToken: "own-btn-4a7c",
    inviteDate: "18 Mar 2026",
    lastLogin: "23 Jun 2026",
    linkedProperties: [
      { id: "prop-010", name: "27 Elm Grove", address: "27 Elm Grove, Brighton BN2 3ET" },
      { id: "prop-011", name: "19 Lewes Road", address: "19 Lewes Road, Brighton BN2 3HQ" },
    ],
    totalProperties: 2,
    dateAdded: "22 Feb 2026",
  },
]

export const portalStatusBadge: Record<string, string> = {
  not_invited: "bg-[#94A3B8]/10 text-[#94A3B8]",
  invited: "bg-[#3B82F6]/10 text-[#3B82F6]",
  active: "bg-[#10B981]/10 text-[#10B981]",
  disabled: "bg-[#EF4444]/10 text-[#EF4444]",
}

export const portalStatusLabel: Record<string, string> = {
  not_invited: "Not Invited",
  invited: "Invited",
  active: "Active",
  disabled: "Disabled",
}