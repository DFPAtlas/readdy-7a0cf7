export interface SignatureParty {
  id: string;
  name: string;
  role: string;
  email: string;
  signed: boolean;
  signedAt: string | null;
  signatureImage: string | null;
  viewedAt: string | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  userRole: string;
  ipAddress: string;
  details: string;
}

export interface SignatureDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  propertyName: string;
  propertyId: string;
  parties: SignatureParty[];
  sentDate: string | null;
  signedDate: string | null;
  completedDate: string | null;
  expiryDate: string;
  fileSize: string;
  fileType: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  auditTrail: AuditEntry[];
  description: string;
}

export const signatureStatusConfig: Record<string, { color: string; bg: string; icon: string; dot: string }> = {
  Draft: { color: "text-[#64748B]", bg: "bg-[#F1F5F9]", icon: "ri-draft-line", dot: "bg-[#64748B]" },
  Sent: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", icon: "ri-send-plane-line", dot: "bg-[#3B82F6]" },
  Viewed: { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", icon: "ri-eye-line", dot: "bg-[#8B5CF6]" },
  Signed: { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", icon: "ri-pen-nib-line", dot: "bg-[#14B8A6]" },
  Completed: { color: "text-[#10B981]", bg: "bg-[#10B981]/10", icon: "ri-check-double-line", dot: "bg-[#10B981]" },
};

export const signatureTypeConfig: Record<string, { color: string; bg: string }> = {
  "Tenancy Agreement": { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  "Contractor Agreement": { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  "Compliance Document": { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  "Inspection Report": { color: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10" },
  "Inventory Checklist": { color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  "Deposit Certificate": { color: "text-[#EC4899]", bg: "bg-[#EC4899]/10" },
  "Notice": { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  "Addendum": { color: "text-[#64748B]", bg: "bg-[#F1F5F9]" },
};

export const allSignatureDocuments: SignatureDocument[] = [
  {
    id: "sig-001",
    title: "Tenancy Agreement - 12 Rose Avenue",
    type: "Tenancy Agreement",
    status: "Completed",
    propertyName: "12 Rose Avenue",
    propertyId: "p1",
    parties: [
      { id: "party-1", name: "John Miller", role: "Tenant", email: "john.miller@email.com", signed: true, signedAt: "2026-05-12 14:30", signatureImage: "sig-john", viewedAt: "2026-05-12 14:25" },
      { id: "party-2", name: "James Richardson", role: "Landlord", email: "j.richardson@email.com", signed: true, signedAt: "2026-05-12 16:45", signatureImage: "sig-james", viewedAt: "2026-05-12 16:40" },
      { id: "party-3", name: "LetHub Agency", role: "Agent", email: "docs@lethub.com", signed: true, signedAt: "2026-05-12 17:00", signatureImage: "sig-lethub", viewedAt: "2026-05-12 16:55" },
    ],
    sentDate: "2026-05-12 09:00",
    signedDate: "2026-05-12 17:00",
    completedDate: "2026-05-12 17:00",
    expiryDate: "2027-05-12",
    fileSize: "1.2 MB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-10",
    description: "Assured Shorthold Tenancy Agreement for 12 Rose Avenue, Flat 2A. 12-month fixed term commencing 15 September 2026.",
    auditTrail: [
      { id: "a1", action: "Document Created", timestamp: "2026-05-10 11:23", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Tenancy agreement drafted from template" },
      { id: "a2", action: "Document Sent", timestamp: "2026-05-12 09:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Sent to all parties for signature" },
      { id: "a3", action: "Document Viewed", timestamp: "2026-05-12 14:25", user: "John Miller", userRole: "Tenant", ipAddress: "86.24.112.55", details: "Tenant opened the document" },
      { id: "a4", action: "Signature Applied", timestamp: "2026-05-12 14:30", user: "John Miller", userRole: "Tenant", ipAddress: "86.24.112.55", details: "Electronic signature applied by tenant" },
      { id: "a5", action: "Document Viewed", timestamp: "2026-05-12 16:40", user: "James Richardson", userRole: "Landlord", ipAddress: "203.0.113.12", details: "Landlord opened the document" },
      { id: "a6", action: "Signature Applied", timestamp: "2026-05-12 16:45", user: "James Richardson", userRole: "Landlord", ipAddress: "203.0.113.12", details: "Electronic signature applied by landlord" },
      { id: "a7", action: "Document Viewed", timestamp: "2026-05-12 16:55", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Agent reviewed final document" },
      { id: "a8", action: "Signature Applied", timestamp: "2026-05-12 17:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Final counter-signature applied" },
      { id: "a9", action: "Document Completed", timestamp: "2026-05-12 17:00", user: "System", userRole: "System", ipAddress: "192.168.1.1", details: "All parties have signed. Document is complete." },
      { id: "a10", action: "Signed Copy Downloaded", timestamp: "2026-05-12 17:05", user: "John Miller", userRole: "Tenant", ipAddress: "86.24.112.55", details: "Tenant downloaded signed copy" },
    ],
  },
  {
    id: "sig-002",
    title: "Contractor Agreement - GreenPlumb Ltd",
    type: "Contractor Agreement",
    status: "Signed",
    propertyName: "12 Rose Avenue",
    propertyId: "p1",
    parties: [
      { id: "party-4", name: "GreenPlumb Ltd", role: "Contractor", email: "contracts@greenplumb.com", signed: true, signedAt: "2026-05-20 10:15", signatureImage: "sig-greenplumb", viewedAt: "2026-05-20 10:10" },
      { id: "party-5", name: "LetHub Agency", role: "Agent", email: "docs@lethub.com", signed: false, signedAt: null, signatureImage: null, viewedAt: "2026-05-20 11:00" },
    ],
    sentDate: "2026-05-18 14:00",
    signedDate: "2026-05-20 10:15",
    completedDate: null,
    expiryDate: "2027-05-18",
    fileSize: "856 KB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-18",
    description: "Approved contractor agreement for GreenPlumb Ltd. Covers plumbing and heating maintenance across managed portfolio.",
    auditTrail: [
      { id: "b1", action: "Document Created", timestamp: "2026-05-18 10:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Contractor agreement created from template" },
      { id: "b2", action: "Document Sent", timestamp: "2026-05-18 14:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Sent to contractor for review" },
      { id: "b3", action: "Document Viewed", timestamp: "2026-05-20 10:10", user: "GreenPlumb Ltd", userRole: "Contractor", ipAddress: "81.21.44.78", details: "Contractor opened the document" },
      { id: "b4", action: "Signature Applied", timestamp: "2026-05-20 10:15", user: "GreenPlumb Ltd", userRole: "Contractor", ipAddress: "81.21.44.78", details: "Electronic signature applied by contractor" },
      { id: "b5", action: "Document Viewed", timestamp: "2026-05-20 11:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Agent reviewed contractor signature" },
    ],
  },
  {
    id: "sig-003",
    title: "Gas Safety Certificate - 15 Oak Street",
    type: "Compliance Document",
    status: "Sent",
    propertyName: "15 Oak Street",
    propertyId: "p2",
    parties: [
      { id: "party-6", name: "GasSafe Experts", role: "Contractor", email: "certificates@gassafe.com", signed: false, signedAt: null, signatureImage: null, viewedAt: null },
      { id: "party-7", name: "LetHub Agency", role: "Agent", email: "docs@lethub.com", signed: true, signedAt: "2026-05-25 09:00", signatureImage: "sig-lethub", viewedAt: "2026-05-25 08:55" },
    ],
    sentDate: "2026-05-25 09:00",
    signedDate: null,
    completedDate: null,
    expiryDate: "2027-05-25",
    fileSize: "2.4 MB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-25",
    description: "Annual Gas Safety Certificate for 15 Oak Street. Inspection completed 24 May 2026. Requires contractor signature for certification.",
    auditTrail: [
      { id: "c1", action: "Document Created", timestamp: "2026-05-25 08:30", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Certificate uploaded and prepared for signing" },
      { id: "c2", action: "Document Sent", timestamp: "2026-05-25 09:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Sent to GasSafe Experts for certification signature" },
      { id: "c3", action: "Signature Applied", timestamp: "2026-05-25 09:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Agent pre-signed as property manager" },
    ],
  },
  {
    id: "sig-004",
    title: "Inventory Checklist - 22 Maple Drive",
    type: "Inventory Checklist",
    status: "Viewed",
    propertyName: "22 Maple Drive",
    propertyId: "p3",
    parties: [
      { id: "party-8", name: "Emma Wilson", role: "Tenant", email: "emma.wilson@email.com", signed: false, signedAt: null, signatureImage: null, viewedAt: "2026-05-28 19:15" },
      { id: "party-9", name: "James Richardson", role: "Landlord", email: "j.richardson@email.com", signed: false, signedAt: null, signatureImage: null, viewedAt: null },
      { id: "party-10", name: "LetHub Agency", role: "Agent", email: "docs@lethub.com", signed: true, signedAt: "2026-05-28 10:00", signatureImage: "sig-lethub", viewedAt: "2026-05-28 09:55" },
    ],
    sentDate: "2026-05-28 10:00",
    signedDate: null,
    completedDate: null,
    expiryDate: "2027-05-28",
    fileSize: "3.1 MB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-28",
    description: "Move-in inventory checklist for 22 Maple Drive. Includes room-by-room condition report with photographs.",
    auditTrail: [
      { id: "d1", action: "Document Created", timestamp: "2026-05-28 09:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Inventory checklist generated from inspection data" },
      { id: "d2", action: "Document Sent", timestamp: "2026-05-28 10:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Sent to tenant and landlord for review" },
      { id: "d3", action: "Signature Applied", timestamp: "2026-05-28 10:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Agent signed as witness" },
      { id: "d4", action: "Document Viewed", timestamp: "2026-05-28 19:15", user: "Emma Wilson", userRole: "Tenant", ipAddress: "86.24.115.22", details: "Tenant opened and reviewed inventory" },
    ],
  },
  {
    id: "sig-005",
    title: "Tenancy Agreement - 8 Elm Road",
    type: "Tenancy Agreement",
    status: "Draft",
    propertyName: "8 Elm Road",
    propertyId: "p4",
    parties: [
      { id: "party-11", name: "David Brown", role: "Tenant", email: "david.brown@email.com", signed: false, signedAt: null, signatureImage: null, viewedAt: null },
      { id: "party-12", name: "Patricia Green", role: "Landlord", email: "p.green@email.com", signed: false, signedAt: null, signatureImage: null, viewedAt: null },
      { id: "party-13", name: "LetHub Agency", role: "Agent", email: "docs@lethub.com", signed: false, signedAt: null, signatureImage: null, viewedAt: null },
    ],
    sentDate: null,
    signedDate: null,
    completedDate: null,
    expiryDate: "2027-06-01",
    fileSize: "1.1 MB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-29",
    description: "Draft assured shorthold tenancy agreement for 8 Elm Road. Awaiting final rent confirmation before sending to parties.",
    auditTrail: [
      { id: "e1", action: "Document Created", timestamp: "2026-05-29 14:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Draft tenancy agreement created from template" },
      { id: "e2", action: "Document Edited", timestamp: "2026-05-29 14:30", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Rent amount updated to £1,650 pcm" },
    ],
  },
  {
    id: "sig-006",
    title: "Section 21 Notice - 15 Oak Street",
    type: "Notice",
    status: "Completed",
    propertyName: "15 Oak Street",
    propertyId: "p2",
    parties: [
      { id: "party-14", name: "Michael Clark", role: "Tenant", email: "m.clark@email.com", signed: true, signedAt: "2026-04-15 11:20", signatureImage: "sig-michael", viewedAt: "2026-04-15 11:15" },
      { id: "party-15", name: "Patricia Green", role: "Landlord", email: "p.green@email.com", signed: true, signedAt: "2026-04-15 09:00", signatureImage: "sig-patricia", viewedAt: "2026-04-15 08:50" },
    ],
    sentDate: "2026-04-15 08:00",
    signedDate: "2026-04-15 11:20",
    completedDate: "2026-04-15 11:20",
    expiryDate: "2026-06-15",
    fileSize: "420 KB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-04-14",
    description: "Section 21 Notice of Possession served to tenant Michael Clark. Valid for two months from service date.",
    auditTrail: [
      { id: "f1", action: "Document Created", timestamp: "2026-04-14 16:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Section 21 notice prepared" },
      { id: "f2", action: "Document Sent", timestamp: "2026-04-15 08:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Served to tenant via email and post" },
      { id: "f3", action: "Document Viewed", timestamp: "2026-04-15 08:50", user: "Patricia Green", userRole: "Landlord", ipAddress: "203.0.113.20", details: "Landlord reviewed notice" },
      { id: "f4", action: "Signature Applied", timestamp: "2026-04-15 09:00", user: "Patricia Green", userRole: "Landlord", ipAddress: "203.0.113.20", details: "Landlord signed as server" },
      { id: "f5", action: "Document Viewed", timestamp: "2026-04-15 11:15", user: "Michael Clark", userRole: "Tenant", ipAddress: "86.24.118.33", details: "Tenant opened notice" },
      { id: "f6", action: "Signature Applied", timestamp: "2026-04-15 11:20", user: "Michael Clark", userRole: "Tenant", ipAddress: "86.24.118.33", details: "Tenant acknowledged receipt with signature" },
      { id: "f7", action: "Document Completed", timestamp: "2026-04-15 11:20", user: "System", userRole: "System", ipAddress: "192.168.1.1", details: "Notice served and acknowledged. Document complete." },
    ],
  },
  {
    id: "sig-007",
    title: "Deposit Protection Certificate",
    type: "Deposit Certificate",
    status: "Completed",
    propertyName: "12 Rose Avenue",
    propertyId: "p1",
    parties: [
      { id: "party-16", name: "John Miller", role: "Tenant", email: "john.miller@email.com", signed: true, signedAt: "2026-05-12 14:35", signatureImage: "sig-john", viewedAt: "2026-05-12 14:30" },
      { id: "party-17", name: "James Richardson", role: "Landlord", email: "j.richardson@email.com", signed: true, signedAt: "2026-05-12 16:50", signatureImage: "sig-james", viewedAt: "2026-05-12 16:45" },
    ],
    sentDate: "2026-05-12 09:00",
    signedDate: "2026-05-12 16:50",
    completedDate: "2026-05-12 16:50",
    expiryDate: "2027-05-12",
    fileSize: "180 KB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-10",
    description: "Deposit Protection Scheme certificate for deposit of £1,850. Registered with DPS Custodial scheme.",
    auditTrail: [
      { id: "g1", action: "Document Created", timestamp: "2026-05-10 11:30", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Certificate generated from DPS system" },
      { id: "g2", action: "Document Sent", timestamp: "2026-05-12 09:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Sent to tenant and landlord" },
      { id: "g3", action: "Signature Applied", timestamp: "2026-05-12 14:35", user: "John Miller", userRole: "Tenant", ipAddress: "86.24.112.55", details: "Tenant signed deposit certificate" },
      { id: "g4", action: "Signature Applied", timestamp: "2026-05-12 16:50", user: "James Richardson", userRole: "Landlord", ipAddress: "203.0.113.12", details: "Landlord signed deposit certificate" },
      { id: "g5", action: "Document Completed", timestamp: "2026-05-12 16:50", user: "System", userRole: "System", ipAddress: "192.168.1.1", details: "All parties signed. Certificate complete." },
    ],
  },
  {
    id: "sig-008",
    title: "Mid-Term Inspection Report - 22 Maple Drive",
    type: "Inspection Report",
    status: "Sent",
    propertyName: "22 Maple Drive",
    propertyId: "p3",
    parties: [
      { id: "party-18", name: "Emma Wilson", role: "Tenant", email: "emma.wilson@email.com", signed: false, signedAt: null, signatureImage: null, viewedAt: null },
      { id: "party-19", name: "James Richardson", role: "Landlord", email: "j.richardson@email.com", signed: true, signedAt: "2026-05-27 15:00", signatureImage: "sig-james", viewedAt: "2026-05-27 14:55" },
      { id: "party-20", name: "LetHub Agency", role: "Agent", email: "docs@lethub.com", signed: true, signedAt: "2026-05-27 10:00", signatureImage: "sig-lethub", viewedAt: "2026-05-27 09:55" },
    ],
    sentDate: "2026-05-27 15:00",
    signedDate: "2026-05-27 15:00",
    completedDate: null,
    expiryDate: "2026-06-27",
    fileSize: "4.5 MB",
    fileType: "PDF",
    createdBy: "Sarah Jones",
    createdByRole: "Agent",
    createdAt: "2026-05-27",
    description: "Mid-term inspection report for 22 Maple Drive. 2 minor observations noted. Awaiting tenant signature.",
    auditTrail: [
      { id: "h1", action: "Document Created", timestamp: "2026-05-27 09:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Report generated from inspection data" },
      { id: "h2", action: "Signature Applied", timestamp: "2026-05-27 10:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Agent signed as inspector" },
      { id: "h3", action: "Document Viewed", timestamp: "2026-05-27 14:55", user: "James Richardson", userRole: "Landlord", ipAddress: "203.0.113.12", details: "Landlord reviewed report" },
      { id: "h4", action: "Signature Applied", timestamp: "2026-05-27 15:00", user: "James Richardson", userRole: "Landlord", ipAddress: "203.0.113.12", details: "Landlord signed report" },
      { id: "h5", action: "Document Sent", timestamp: "2026-05-27 15:00", user: "Sarah Jones", userRole: "Agent", ipAddress: "192.168.1.45", details: "Sent to tenant for final signature" },
    ],
  },
];

export const documentTypes = ["All", "Tenancy Agreement", "Contractor Agreement", "Compliance Document", "Inspection Report", "Inventory Checklist", "Deposit Certificate", "Notice", "Addendum"];

export const propertiesForSignatures = [
  { id: "all", name: "All Properties" },
  { id: "p1", name: "12 Rose Avenue" },
  { id: "p2", name: "15 Oak Street" },
  { id: "p3", name: "22 Maple Drive" },
  { id: "p4", name: "8 Elm Road" },
];

export function getDocumentsByStatus(status: string): SignatureDocument[] {
  if (status === "All") return allSignatureDocuments;
  return allSignatureDocuments.filter((d) => d.status === status);
}

export function getDocumentsByRole(role: string, propertyId?: string): SignatureDocument[] {
  return allSignatureDocuments.filter((d) => {
    const hasParty = d.parties.some((p) => p.role.toLowerCase() === role.toLowerCase());
    if (propertyId && propertyId !== "all") {
      return hasParty && d.propertyId === propertyId;
    }
    return hasParty;
  });
}

export function getDocumentsForLandlord(landlordProperties: string[]): SignatureDocument[] {
  return allSignatureDocuments.filter((d) => landlordProperties.includes(d.propertyId));
}