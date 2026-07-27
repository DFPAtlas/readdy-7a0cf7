export interface QuoteWorkflowJob {
  id: string;
  title: string;
  description: string;
  property: string;
  address: string;
  tenant: string;
  tenantPhone: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  category: string;
  reportedDate: string;
  reportedBy: string;
  currentStep: number;
  stepHistory: { step: number; label: string; date: string; actor: string; notes?: string }[];
  contractors: WorkflowContractor[];
  selectedContractor?: string;
  documents: WorkflowDocument[];
  comments: WorkflowComment[];
  estimatedCompletion: string;
  invoiceAmount?: number;
  invoiceDate?: string;
  invoiceStatus?: string;
}

export interface WorkflowContractor {
  id: string;
  name: string;
  trade: string;
  rating: number;
  totalJobs: number;
  quoteAmount?: number;
  quoteVat?: number;
  quoteTotal?: number;
  quoteSubmitted?: string;
  quoteValidUntil?: string;
  estimatedDays?: string;
  notes?: string;
  documents: string[];
  status: "Invited" | "Quoted" | "Shortlisted" | "Approved" | "Rejected" | "Instructed";
  insuranceValid: boolean;
}

export interface WorkflowDocument {
  id: string;
  name: string;
  type: "Report" | "Quote" | "Invoice" | "Photo" | "Insurance" | "Approval";
  date: string;
  size: string;
  uploadedBy: string;
}

export interface WorkflowComment {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
}

export const workflowSteps = [
  { step: 1, label: "Reported", icon: "ri-flag-line", description: "Tenant reports issue" },
  { step: 2, label: "Under Review", icon: "ri-search-line", description: "Agent reviews request" },
  { step: 3, label: "Contractor Invited", icon: "ri-user-add-line", description: "Contractor invited" },
  { step: 4, label: "Quote Submitted", icon: "ri-file-list-3-line", description: "Contractor submits quote" },
  { step: 5, label: "Landlord Approval", icon: "ri-shield-check-line", description: "Landlord approval required" },
  { step: 6, label: "Instructed", icon: "ri-tools-line", description: "Contractor instructed" },
  { step: 7, label: "Completed", icon: "ri-check-double-line", description: "Work completed" },
  { step: 8, label: "Invoiced", icon: "ri-bill-line", description: "Invoice uploaded" },
];

export const workflowJobs: QuoteWorkflowJob[] = [
  {
    id: "wf1",
    title: "Boiler pressure loss",
    description: "Tenant reports boiler losing pressure overnight. Needs inspection and possible pressure valve replacement. Access via tenant at flat 2A.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    priority: "High",
    category: "Plumbing",
    reportedDate: "25 May 2026",
    reportedBy: "John Miller (Tenant)",
    currentStep: 5,
    estimatedCompletion: "3 days",
    stepHistory: [
      { step: 1, label: "Reported", date: "25 May 2026, 08:15", actor: "John Miller", notes: "Boiler losing pressure overnight. Pressure drops from 1.5 to 0.5 bar." },
      { step: 2, label: "Under Review", date: "25 May 2026, 10:30", actor: "Sarah Collins (Agent)", notes: "Inspected tenant report. Likely pressure valve issue. Requires plumber." },
      { step: 3, label: "Contractor Invited", date: "25 May 2026, 11:00", actor: "Sarah Collins (Agent)", notes: "Invited GreenPlumb Ltd and FastFix Heating." },
      { step: 4, label: "Quote Submitted", date: "26 May 2026, 09:45", actor: "GreenPlumb Ltd", notes: "Quote submitted: £336 inc VAT. 2-day completion." },
      { step: 4, label: "Quote Submitted", date: "26 May 2026, 14:20", actor: "FastFix Heating", notes: "Quote submitted: £295 inc VAT. 3-day completion." },
    ],
    contractors: [
      {
        id: "c1",
        name: "GreenPlumb Ltd",
        trade: "Plumbing & Heating",
        rating: 4.9,
        totalJobs: 48,
        quoteAmount: 280,
        quoteVat: 56,
        quoteTotal: 336,
        quoteSubmitted: "26 May 2026",
        quoteValidUntil: "28 Jun 2026",
        estimatedDays: "2 days",
        notes: "Original manufacturer parts. 12-month warranty on valve. Emergency callout included.",
        documents: ["Quote-WF1-GreenPlumb.pdf", "Insurance-Cert.pdf"],
        status: "Quoted",
        insuranceValid: true,
      },
      {
        id: "c2",
        name: "FastFix Heating",
        trade: "Heating Engineer",
        rating: 4.7,
        totalJobs: 32,
        quoteAmount: 245,
        quoteVat: 49,
        quoteTotal: 295,
        quoteSubmitted: "26 May 2026",
        quoteValidUntil: "25 Jun 2026",
        estimatedDays: "3 days",
        notes: "Compatible parts. 6-month warranty. Slightly longer lead time.",
        documents: ["Quote-WF1-FastFix.pdf", "Insurance-Cert.pdf"],
        status: "Quoted",
        insuranceValid: true,
      },
    ],
    documents: [
      { id: "d1", name: "Tenant Report Photo 1.jpg", type: "Photo", date: "25 May 2026", size: "1.2 MB", uploadedBy: "John Miller" },
      { id: "d2", name: "Tenant Report Photo 2.jpg", type: "Photo", date: "25 May 2026", size: "0.9 MB", uploadedBy: "John Miller" },
      { id: "d3", name: "Quote-WF1-GreenPlumb.pdf", type: "Quote", date: "26 May 2026", size: "0.3 MB", uploadedBy: "GreenPlumb Ltd" },
      { id: "d4", name: "Quote-WF1-FastFix.pdf", type: "Quote", date: "26 May 2026", size: "0.2 MB", uploadedBy: "FastFix Heating" },
      { id: "d5", name: "Insurance-Cert-GreenPlumb.pdf", type: "Insurance", date: "26 May 2026", size: "1.5 MB", uploadedBy: "GreenPlumb Ltd" },
    ],
    comments: [
      { id: "cm1", author: "John Miller", role: "Tenant", text: "Boiler is getting worse. Now losing pressure within 2 hours of topping up.", time: "25 May 2026, 18:00" },
      { id: "cm2", author: "Sarah Collins", role: "Property Manager", text: "I have invited two contractors. GreenPlumb is our preferred supplier.", time: "25 May 2026, 11:15" },
      { id: "cm3", author: "GreenPlumb Ltd", role: "Contractor", text: "Quote submitted. We can attend within 48 hours of approval. Parts in stock.", time: "26 May 2026, 09:50" },
      { id: "cm4", author: "FastFix Heating", role: "Contractor", text: "Quote submitted. We have availability next week. Let us know if you need us sooner.", time: "26 May 2026, 14:25" },
    ],
  },
  {
    id: "wf2",
    title: "Garden fence panel replacement",
    description: "Two garden fence panels blown down in recent storm. Both need replacing. Access is external, tenant not required.",
    property: "Maple Gardens House",
    address: "34 Maple Gardens, Cardiff CF10 3BZ",
    tenant: "Michael Brown",
    tenantPhone: "+44 7700 900321",
    priority: "Low",
    category: "Fencing",
    reportedDate: "18 May 2026",
    reportedBy: "Michael Brown (Tenant)",
    currentStep: 8,
    estimatedCompletion: "1 day",
    invoiceAmount: 450,
    invoiceDate: "22 May 2026",
    invoiceStatus: "Paid",
    selectedContractor: "c3",
    stepHistory: [
      { step: 1, label: "Reported", date: "18 May 2026, 10:00", actor: "Michael Brown", notes: "Two fence panels down after storm." },
      { step: 2, label: "Under Review", date: "18 May 2026, 12:00", actor: "James Hart (Agent)", notes: "Confirmed storm damage. No urgency." },
      { step: 3, label: "Contractor Invited", date: "18 May 2026, 13:00", actor: "James Hart (Agent)", notes: "Invited BuildRight Construction only." },
      { step: 4, label: "Quote Submitted", date: "19 May 2026, 09:00", actor: "BuildRight Construction", notes: "Quote: £450 inc VAT. 1-day job." },
      { step: 5, label: "Landlord Approval", date: "19 May 2026, 16:00", actor: "Oakfield Properties Ltd", notes: "Approved via email." },
      { step: 6, label: "Instructed", date: "20 May 2026, 08:00", actor: "James Hart (Agent)", notes: "Contractor instructed. Scheduled for 21 May." },
      { step: 7, label: "Completed", date: "21 May 2026, 15:00", actor: "BuildRight Construction", notes: "Both panels replaced. Old panels removed." },
      { step: 8, label: "Invoiced", date: "22 May 2026, 10:00", actor: "BuildRight Construction", notes: "Invoice uploaded: £450. Marked as paid." },
    ],
    contractors: [
      {
        id: "c3",
        name: "BuildRight Construction",
        trade: "General Builder",
        rating: 4.6,
        totalJobs: 28,
        quoteAmount: 375,
        quoteVat: 75,
        quoteTotal: 450,
        quoteSubmitted: "19 May 2026",
        quoteValidUntil: "30 Jun 2026",
        estimatedDays: "1 day",
        notes: "Pressure-treated panels included. Disposal of old panels included.",
        documents: ["Quote-WF2-BuildRight.pdf", "Completion-Photos.zip"],
        status: "Instructed",
        insuranceValid: true,
      },
    ],
    documents: [
      { id: "d6", name: "Tenant Report Photo.jpg", type: "Photo", date: "18 May 2026", size: "1.5 MB", uploadedBy: "Michael Brown" },
      { id: "d7", name: "Quote-WF2-BuildRight.pdf", type: "Quote", date: "19 May 2026", size: "0.3 MB", uploadedBy: "BuildRight Construction" },
      { id: "d8", name: "Completion-Photos.zip", type: "Photo", date: "21 May 2026", size: "4.2 MB", uploadedBy: "BuildRight Construction" },
      { id: "d9", name: "Invoice-WF2-BuildRight.pdf", type: "Invoice", date: "22 May 2026", size: "0.2 MB", uploadedBy: "BuildRight Construction" },
    ],
    comments: [
      { id: "cm5", author: "Michael Brown", role: "Tenant", text: "Fence panels are down in the back garden. Not urgent but needs fixing.", time: "18 May 2026, 10:05" },
      { id: "cm6", author: "James Hart", role: "Property Manager", text: "BuildRight is our usual fencing contractor. Sending invitation now.", time: "18 May 2026, 12:10" },
      { id: "cm7", author: "BuildRight Construction", role: "Contractor", text: "Job completed. New panels look great. Photos uploaded.", time: "21 May 2026, 15:30" },
    ],
  },
  {
    id: "wf3",
    title: "Living room radiator not heating",
    description: "Radiator in living room is cold even when heating is on. All other radiators in the flat are working fine. Likely valve issue.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    priority: "High",
    category: "Heating",
    reportedDate: "20 May 2026",
    reportedBy: "John Miller (Tenant)",
    currentStep: 7,
    estimatedCompletion: "1 day",
    invoiceAmount: 222,
    invoiceDate: "22 May 2026",
    invoiceStatus: "Pending Payment",
    selectedContractor: "c1",
    stepHistory: [
      { step: 1, label: "Reported", date: "20 May 2026, 17:45", actor: "John Miller", notes: "Living room radiator cold. Rest of flat OK." },
      { step: 2, label: "Under Review", date: "21 May 2026, 09:00", actor: "Sarah Collins (Agent)", notes: "Likely thermostatic valve issue. Assigned to GreenPlumb." },
      { step: 3, label: "Contractor Invited", date: "21 May 2026, 09:30", actor: "Sarah Collins (Agent)", notes: "GreenPlumb invited directly." },
      { step: 4, label: "Quote Submitted", date: "21 May 2026, 11:00", actor: "GreenPlumb Ltd", notes: "Quote: £222 inc VAT. 1-day job." },
      { step: 5, label: "Landlord Approval", date: "21 May 2026, 14:00", actor: "Oakfield Properties Ltd", notes: "Approved immediately." },
      { step: 6, label: "Instructed", date: "21 May 2026, 15:00", actor: "Sarah Collins (Agent)", notes: "Scheduled for 22 May morning." },
      { step: 7, label: "Completed", date: "22 May 2026, 12:00", actor: "GreenPlumb Ltd", notes: "Valve replaced. System bled. All radiators working." },
      { step: 8, label: "Invoiced", date: "22 May 2026, 16:00", actor: "GreenPlumb Ltd", notes: "Invoice uploaded: £222. Awaiting payment." },
    ],
    contractors: [
      {
        id: "c1",
        name: "GreenPlumb Ltd",
        trade: "Plumbing & Heating",
        rating: 4.9,
        totalJobs: 48,
        quoteAmount: 185,
        quoteVat: 37,
        quoteTotal: 222,
        quoteSubmitted: "21 May 2026",
        quoteValidUntil: "20 Jun 2026",
        estimatedDays: "1 day",
        notes: "Thermostatic valve replacement. System bleed included.",
        documents: ["Quote-WF3-GreenPlumb.pdf", "Completion-Photo.jpg", "Invoice-WF3.pdf"],
        status: "Instructed",
        insuranceValid: true,
      },
    ],
    documents: [
      { id: "d10", name: "Quote-WF3-GreenPlumb.pdf", type: "Quote", date: "21 May 2026", size: "0.3 MB", uploadedBy: "GreenPlumb Ltd" },
      { id: "d11", name: "Completion-Photo.jpg", type: "Photo", date: "22 May 2026", size: "1.4 MB", uploadedBy: "GreenPlumb Ltd" },
      { id: "d12", name: "Invoice-WF3.pdf", type: "Invoice", date: "22 May 2026", size: "0.2 MB", uploadedBy: "GreenPlumb Ltd" },
    ],
    comments: [
      { id: "cm8", author: "John Miller", role: "Tenant", text: "Living room is freezing. Need this fixed ASAP.", time: "20 May 2026, 17:50" },
      { id: "cm9", author: "GreenPlumb Ltd", role: "Contractor", text: "Attended this morning. Valve replaced. All good now.", time: "22 May 2026, 12:30" },
      { id: "cm10", author: "John Miller", role: "Tenant", text: "Radiator is working perfectly now. Thank you!", time: "22 May 2026, 18:00" },
    ],
  },
  {
    id: "wf4",
    title: "Bathroom extractor fan noisy",
    description: "Extractor fan making loud grinding noise. Likely bearings need replacing. Fan is accessible from bathroom ceiling.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    priority: "Medium",
    category: "Electrical",
    reportedDate: "15 May 2026",
    reportedBy: "John Miller (Tenant)",
    currentStep: 3,
    estimatedCompletion: "2 days",
    stepHistory: [
      { step: 1, label: "Reported", date: "15 May 2026, 08:30", actor: "John Miller", notes: "Extractor fan making loud noise." },
      { step: 2, label: "Under Review", date: "15 May 2026, 10:00", actor: "Sarah Collins (Agent)", notes: "Likely bearing failure. Needs electrician." },
      { step: 3, label: "Contractor Invited", date: "15 May 2026, 11:00", actor: "Sarah Collins (Agent)", notes: "Invited BrightSpark Electrical and VoltTech Solutions." },
    ],
    contractors: [
      {
        id: "c4",
        name: "BrightSpark Electrical",
        trade: "Electrician",
        rating: 4.8,
        totalJobs: 35,
        status: "Invited",
        insuranceValid: true,
        documents: [],
      },
      {
        id: "c5",
        name: "VoltTech Solutions",
        trade: "Electrical Contractor",
        rating: 4.5,
        totalJobs: 22,
        status: "Invited",
        insuranceValid: true,
        documents: [],
      },
    ],
    documents: [
      { id: "d13", name: "Tenant Report Video.mp4", type: "Photo", date: "15 May 2026", size: "3.2 MB", uploadedBy: "John Miller" },
    ],
    comments: [
      { id: "cm11", author: "John Miller", role: "Tenant", text: "Fan noise is very loud. I am worried it will stop working completely.", time: "15 May 2026, 08:35" },
      { id: "cm12", author: "Sarah Collins", role: "Property Manager", text: "I have invited two electricians. Awaiting quotes.", time: "15 May 2026, 11:05" },
    ],
  },
  {
    id: "wf5",
    title: "Mould on bathroom ceiling",
    description: "Black mould spots appearing on the bathroom ceiling above the shower. Tenant wipes them but they keep returning.",
    property: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    priority: "High",
    category: "Damp & Mould",
    reportedDate: "22 May 2026",
    reportedBy: "John Miller (Tenant)",
    currentStep: 4,
    estimatedCompletion: "5 days",
    stepHistory: [
      { step: 1, label: "Reported", date: "22 May 2026, 10:00", actor: "John Miller", notes: "Black mould spreading on bathroom ceiling." },
      { step: 2, label: "Under Review", date: "22 May 2026, 12:00", actor: "Sarah Collins (Agent)", notes: "Potential ventilation issue. Needs damp specialist." },
      { step: 3, label: "Contractor Invited", date: "22 May 2026, 13:00", actor: "Sarah Collins (Agent)", notes: "Invited DampGuard Specialists and MouldFree UK." },
      { step: 4, label: "Quote Submitted", date: "24 May 2026, 14:00", actor: "DampGuard Specialists", notes: "Quote: £680 inc VAT. Includes ventilation upgrade." },
    ],
    contractors: [
      {
        id: "c6",
        name: "DampGuard Specialists",
        trade: "Damp Specialist",
        rating: 4.7,
        totalJobs: 19,
        quoteAmount: 565,
        quoteVat: 113,
        quoteTotal: 680,
        quoteSubmitted: "24 May 2026",
        quoteValidUntil: "24 Jun 2026",
        estimatedDays: "5 days",
        notes: "Mould treatment, re-painting, and extractor fan upgrade included.",
        documents: ["Quote-WF5-DampGuard.pdf", "Mould-Assessment.pdf"],
        status: "Quoted",
        insuranceValid: true,
      },
      {
        id: "c7",
        name: "MouldFree UK",
        trade: "Mould Remediation",
        rating: 4.4,
        totalJobs: 15,
        status: "Invited",
        insuranceValid: true,
        documents: [],
      },
    ],
    documents: [
      { id: "d14", name: "Tenant Report Photo.jpg", type: "Photo", date: "22 May 2026", size: "1.1 MB", uploadedBy: "John Miller" },
      { id: "d15", name: "Quote-WF5-DampGuard.pdf", type: "Quote", date: "24 May 2026", size: "0.4 MB", uploadedBy: "DampGuard Specialists" },
      { id: "d16", name: "Mould-Assessment.pdf", type: "Report", date: "24 May 2026", size: "1.8 MB", uploadedBy: "DampGuard Specialists" },
    ],
    comments: [
      { id: "cm13", author: "John Miller", role: "Tenant", text: "Mould is spreading. I have photos if needed.", time: "22 May 2026, 10:05" },
      { id: "cm14", author: "Sarah Collins", role: "Property Manager", text: "DampGuard has submitted a quote. MouldFree UK still pending.", time: "24 May 2026, 14:30" },
    ],
  },
];

export const notifications = [
  { id: "n1", type: "quote", message: "GreenPlumb Ltd submitted a quote for Boiler pressure loss", time: "26 May 2026, 09:45", read: false, jobId: "wf1" },
  { id: "n2", type: "quote", message: "FastFix Heating submitted a quote for Boiler pressure loss", time: "26 May 2026, 14:20", read: false, jobId: "wf1" },
  { id: "n3", type: "approval", message: "Landlord approved quote for Garden fence panel replacement", time: "19 May 2026, 16:00", read: true, jobId: "wf2" },
  { id: "n4", type: "invoice", message: "BuildRight Construction uploaded invoice for Garden fence panel replacement", time: "22 May 2026, 10:00", read: true, jobId: "wf2" },
  { id: "n5", type: "invoice", message: "GreenPlumb Ltd uploaded invoice for Living room radiator", time: "22 May 2026, 16:00", read: false, jobId: "wf3" },
  { id: "n6", type: "quote", message: "DampGuard Specialists submitted a quote for Mould on bathroom ceiling", time: "24 May 2026, 14:00", read: false, jobId: "wf5" },
  { id: "n7", type: "reminder", message: "MouldFree UK has not yet responded to quote invitation", time: "27 May 2026, 09:00", read: false, jobId: "wf5" },
  { id: "n8", type: "completion", message: "BuildRight Construction completed Garden fence panel replacement", time: "21 May 2026, 15:00", read: true, jobId: "wf2" },
];