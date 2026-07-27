export interface TenantCommunication {
  id: string;
  title: string;
  message: string;
  communication_type: "rent_reminder" | "maintenance_notice" | "inspection_notice" | "safety_notice" | "general";
  property_id: string;
  property_name: string;
  tenant_id: string;
  tenant_name: string;
  maintenance_action_id: string | null;
  hazard_id: string | null;
  status: "draft" | "ready" | "sent" | "archived";
  channel: "email" | "sms" | "letter" | "portal" | null;
  created_at: string;
  sent_at: string | null;
  created_by: string;
}

export const tenantCommunications: TenantCommunication[] = [
  {
    id: "tc-001",
    title: "Gas Safety Inspection — 12 Rose Avenue",
    message: "Dear John,\n\nWe are writing to inform you that the annual gas safety inspection for 12 Rose Avenue will take place on Monday 22 June 2026 between 9:00 AM and 1:00 PM.\n\nA Gas Safe registered engineer from SparkPro Electrics will attend. Access to the boiler and all gas appliances is required.\n\nPlease confirm your availability or suggest an alternative date if this is not convenient.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    communication_type: "safety_notice",
    property_id: "prop-001",
    property_name: "12 Rose Avenue",
    tenant_id: "tnt-001",
    tenant_name: "John Miller",
    maintenance_action_id: null,
    hazard_id: null,
    status: "ready",
    channel: null,
    created_at: "2026-06-12T09:30:00Z",
    sent_at: null,
    created_by: "Sarah Cooper",
  },
  {
    id: "tc-002",
    title: "Quarterly Inspection — Flat 4B Oak Street",
    message: "Dear Sarah,\n\nYour quarterly property inspection is scheduled for Wednesday 17 June 2026 at 11:00 AM. Our property manager will visit to check the general condition of the flat.\n\nYou do not need to be present, but please ensure all rooms are accessible.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    communication_type: "inspection_notice",
    property_id: "prop-002",
    property_name: "Flat 4B Oak Street",
    tenant_id: "tnt-002",
    tenant_name: "Sarah Jenkins",
    maintenance_action_id: null,
    hazard_id: null,
    status: "sent",
    channel: "email",
    created_at: "2026-06-10T14:15:00Z",
    sent_at: "2026-06-10T14:20:00Z",
    created_by: "Sarah Cooper",
  },
  {
    id: "tc-003",
    title: "Boiler Service Complete — 45 Baker Street",
    message: "Dear Emily,\n\nWe are pleased to confirm that the annual boiler service at 45 Baker Street has been completed today. The engineer reported no issues and the boiler is in good working order.\n\nThe next service will be due in June 2027.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    communication_type: "maintenance_notice",
    property_id: "prop-003",
    property_name: "45 Baker Street",
    tenant_id: "tnt-003",
    tenant_name: "Emily Carter",
    maintenance_action_id: "ma-001",
    hazard_id: null,
    status: "sent",
    channel: "email",
    created_at: "2026-06-08T16:00:00Z",
    sent_at: "2026-06-08T16:05:00Z",
    created_by: "Sarah Cooper",
  },
  {
    id: "tc-004",
    title: "June Rent Receipt — 8 The Crescent",
    message: "Dear Michael,\n\nThank you for your rent payment of £1,650 received on 4 June 2026. This confirms your June rent for 8 The Crescent has been settled.\n\nPlease keep this receipt for your records.\n\nKind regards,\nLetHub Property Management",
    communication_type: "general",
    property_id: "prop-004",
    property_name: "8 The Crescent",
    tenant_id: "tnt-004",
    tenant_name: "Michael Brown",
    maintenance_action_id: null,
    hazard_id: null,
    status: "draft",
    channel: null,
    created_at: "2026-06-13T10:00:00Z",
    sent_at: null,
    created_by: "Auto",
  },
  {
    id: "tc-005",
    title: "Damp Inspection — Flat 7 Park View",
    message: "Dear Lisa,\n\nFollowing your report of damp in the bathroom, a specialist contractor will visit Flat 7 Park View on Friday 19 June 2026 at 10:00 AM to carry out an inspection.\n\nPlease ensure the bathroom is clear and accessible. The inspection should take approximately 45 minutes.\n\nKind regards,\nTom Wilson\nLetHub Property Management",
    communication_type: "maintenance_notice",
    property_id: "prop-005",
    property_name: "Flat 7 Park View",
    tenant_id: "tnt-005",
    tenant_name: "Lisa Chen",
    maintenance_action_id: "ma-002",
    hazard_id: "hz-001",
    status: "ready",
    channel: null,
    created_at: "2026-06-13T08:45:00Z",
    sent_at: null,
    created_by: "Tom Wilson",
  },
  {
    id: "tc-006",
    title: "EPC Certificate Updated — Unit 3 Riverside Court",
    message: "Dear Emma,\n\nWe wanted to let you know that the Energy Performance Certificate for Unit 3 Riverside Court has been renewed. The property now holds an EPC rating of C (previously D).\n\nThis rating reflects improvements made to the insulation and heating system.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    communication_type: "safety_notice",
    property_id: "prop-006",
    property_name: "Unit 3 Riverside Court",
    tenant_id: "tnt-006",
    tenant_name: "Emma Wilson",
    maintenance_action_id: null,
    hazard_id: null,
    status: "archived",
    channel: "email",
    created_at: "2026-05-20T11:00:00Z",
    sent_at: "2026-05-20T11:05:00Z",
    created_by: "Sarah Cooper",
  },
  {
    id: "tc-007",
    title: "Fire Safety Notice — 34 Maple Gardens",
    message: "Dear David,\n\nAs part of our ongoing commitment to safety, we wish to remind you of the fire safety procedures at 34 Maple Gardens:\n\n- Smoke alarms are tested quarterly — next test: 1 July 2026\n- Please do not obstruct fire exits or communal hallways\n- The fire extinguisher is located in the ground floor hallway\n- Emergency lighting is checked every 6 months\n\nIf you have any concerns, please contact us immediately.\n\nKind regards,\nLetHub Property Management",
    communication_type: "safety_notice",
    property_id: "prop-007",
    property_name: "34 Maple Gardens",
    tenant_id: "tnt-007",
    tenant_name: "David Thompson",
    maintenance_action_id: null,
    hazard_id: null,
    status: "ready",
    channel: null,
    created_at: "2026-06-13T09:15:00Z",
    sent_at: null,
    created_by: "Sarah Cooper",
  },
  {
    id: "tc-008",
    title: "Rent Increase Notice — 21 High Street",
    message: "Dear Robert,\n\nIn accordance with your tenancy agreement, we are writing to give you the required two months' notice that your rent will increase from £800 to £825 per calendar month, effective from 1 September 2026.\n\nThis increase reflects current market conditions and is in line with similar properties in the area.\n\nIf you have any questions, please do not hesitate to contact us.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    communication_type: "general",
    property_id: "prop-008",
    property_name: "21 High Street",
    tenant_id: "tnt-008",
    tenant_name: "Robert Green",
    maintenance_action_id: null,
    hazard_id: null,
    status: "draft",
    channel: null,
    created_at: "2026-06-13T07:30:00Z",
    sent_at: null,
    created_by: "Sarah Cooper",
  },
];

export interface LandlordUpdate {
  id: string;
  title: string;
  message: string;
  update_type: "inspection_summary" | "compliance_report" | "maintenance_update" | "rent_summary" | "general";
  property_id: string;
  property_name: string;
  landlord_id: string;
  landlord_name: string;
  inspection_id: string | null;
  report_id: string | null;
  status: "draft" | "ready" | "sent" | "archived";
  channel: "email" | "sms" | "letter" | "portal" | null;
  created_at: string;
  sent_at: string | null;
  created_by: string;
}

export const landlordUpdates: LandlordUpdate[] = [
  {
    id: "lu-001",
    title: "Quarterly Inspection Report — Rose Court Flat 2A",
    message: "Dear James,\n\nPlease find attached the quarterly inspection report for Rose Court Flat 2A, completed on 5 June 2026.\n\nSummary:\n- Overall condition: Excellent\n- No maintenance issues identified\n- Garden well maintained\n- All appliances functioning correctly\n- Tenant compliance: Good\n\nThe full report with photos is available on your owner portal.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    update_type: "inspection_summary",
    property_id: "prop-101",
    property_name: "Rose Court Flat 2A",
    landlord_id: "own-001",
    landlord_name: "James Richardson",
    inspection_id: "insp-001",
    report_id: null,
    status: "ready",
    channel: null,
    created_at: "2026-06-11T15:00:00Z",
    sent_at: null,
    created_by: "Sarah Cooper",
  },
  {
    id: "lu-002",
    title: "Gas Safety Certificate Renewed — Riverside Court",
    message: "Dear James,\n\nThe Gas Safety Certificate for Riverside Court has been successfully renewed and is valid until 15 June 2027.\n\nThe inspection was completed by a Gas Safe registered engineer with no issues found.\n\nThe certificate has been uploaded to your owner portal and shared with the tenant.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    update_type: "compliance_report",
    property_id: "prop-102",
    property_name: "Riverside Court",
    landlord_id: "own-001",
    landlord_name: "James Richardson",
    inspection_id: null,
    report_id: "cr-001",
    status: "sent",
    channel: "email",
    created_at: "2026-06-09T10:30:00Z",
    sent_at: "2026-06-09T10:35:00Z",
    created_by: "Sarah Cooper",
  },
  {
    id: "lu-003",
    title: "May Rental Income Summary",
    message: "Dear James,\n\nHere is your rental income summary for May 2026:\n\nRose Court Flat 2A — £1,850 (Paid 1 May)\nRiverside Court — £1,950 (Paid 1 May)\n34 Maple Gardens — £2,400 (Paid 3 May)\n\nTotal: £6,200\nAll rents collected on time. Your statement has been uploaded to the portal.\n\nKind regards,\nLetHub Property Management",
    update_type: "rent_summary",
    property_id: "prop-101",
    property_name: "Multiple Properties",
    landlord_id: "own-001",
    landlord_name: "James Richardson",
    inspection_id: null,
    report_id: null,
    status: "sent",
    channel: "email",
    created_at: "2026-06-01T09:00:00Z",
    sent_at: "2026-06-01T09:10:00Z",
    created_by: "Auto",
  },
  {
    id: "lu-004",
    title: "Boiler Replacement Quote — 45 Baker Street",
    message: "Dear Sarah,\n\nFollowing the inspection of the boiler at 45 Baker Street, we have received a quote from GreenPlumb Ltd:\n\n- Full boiler replacement: £2,340 + VAT\n- Installation time: 2 days\n- Warranty: 10 years\n- Available from: 29 June 2026\n\nWe recommend proceeding as the current boiler is 14 years old and parts are becoming difficult to source.\n\nPlease review and let us know how you would like to proceed.\n\nKind regards,\nTom Wilson\nLetHub Property Management",
    update_type: "maintenance_update",
    property_id: "prop-003",
    property_name: "45 Baker Street",
    landlord_id: "own-002",
    landlord_name: "Sarah Walker",
    inspection_id: null,
    report_id: null,
    status: "ready",
    channel: null,
    created_at: "2026-06-12T14:00:00Z",
    sent_at: null,
    created_by: "Tom Wilson",
  },
  {
    id: "lu-005",
    title: "EICR Certificate Expiring — Flat 4B Oak Street",
    message: "Dear David,\n\nThe Electrical Installation Condition Report (EICR) for Flat 4B Oak Street expires on 30 June 2026. This is a legal requirement for rental properties.\n\nWe have scheduled an inspection with SparkPro Electrics for Monday 22 June at 2:00 PM. The tenant, Sarah Jenkins, has been notified.\n\nEstimated cost: £180 + VAT.\n\nKind regards,\nSarah Cooper\nLetHub Property Management",
    update_type: "compliance_report",
    property_id: "prop-002",
    property_name: "Flat 4B Oak Street",
    landlord_id: "own-003",
    landlord_name: "David Thompson",
    inspection_id: null,
    report_id: "cr-002",
    status: "draft",
    channel: null,
    created_at: "2026-06-13T08:00:00Z",
    sent_at: null,
    created_by: "Sarah Cooper",
  },
  {
    id: "lu-006",
    title: "Inspection Report — 12 Rose Avenue",
    message: "Dear James,\n\nPlease find attached the inspection report for 12 Rose Avenue completed on 2 June 2026.\n\nKey findings:\n- General condition: Good\n- Minor wear noted on hallway carpet — recommend monitoring\n- Kitchen tap washer needs replacing within 3 months\n- All safety devices functioning\n\nThe report with annotated photos is on your portal.\n\nKind regards,\nTom Wilson\nLetHub Property Management",
    update_type: "inspection_summary",
    property_id: "prop-001",
    property_name: "12 Rose Avenue",
    landlord_id: "own-001",
    landlord_name: "James Richardson",
    inspection_id: "insp-002",
    report_id: null,
    status: "archived",
    channel: "email",
    created_at: "2026-06-03T12:00:00Z",
    sent_at: "2026-06-03T12:15:00Z",
    created_by: "Tom Wilson",
  },
];

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  status: "unread" | "read" | "archived";
  source_table: string;
  source_id: string;
  created_at: string;
}

export const systemNotifications: SystemNotification[] = [
  {
    id: "ntf-001",
    title: "Gas Safety Certificate Expiring",
    message: "45 Baker Street — Gas Safety Certificate expires in 5 days. Automatic reminder sent to contractor.",
    severity: "critical",
    status: "unread",
    source_table: "compliance_alerts",
    source_id: "ca-001",
    created_at: "2026-06-13T06:00:00Z",
  },
  {
    id: "ntf-002",
    title: "EPC Rating Due",
    message: "8 The Crescent — Energy Performance Certificate expires 12 December 2026. Consider scheduling now.",
    severity: "warning",
    status: "unread",
    source_table: "compliance_alerts",
    source_id: "ca-002",
    created_at: "2026-06-12T18:00:00Z",
  },
  {
    id: "ntf-003",
    title: "Rent Overdue — Lisa Chen",
    message: "Flat 7 Park View — £3,600 outstanding for 3 months. Formal warning letter sent 3 Jun.",
    severity: "critical",
    status: "unread",
    source_table: "tenant_communications",
    source_id: "tc-005",
    created_at: "2026-06-12T10:00:00Z",
  },
  {
    id: "ntf-004",
    title: "Contractor Quote Received",
    message: "GreenPlumb Ltd submitted a boiler replacement quote for 45 Baker Street — £2,340 + VAT.",
    severity: "info",
    status: "read",
    source_table: "maintenance_actions",
    source_id: "ma-003",
    created_at: "2026-06-11T14:30:00Z",
  },
  {
    id: "ntf-005",
    title: "Inspection Completed — Rose Court",
    message: "Quarterly inspection at Rose Court Flat 2A completed. Rating: Excellent. No issues found.",
    severity: "success",
    status: "read",
    source_table: "inspections",
    source_id: "insp-001",
    created_at: "2026-06-11T11:00:00Z",
  },
  {
    id: "ntf-006",
    title: "EICR Certificate Expiring",
    message: "34 Maple Gardens — Electrical certificate expires 18 Dec 2026. Booking with SparkPro pending.",
    severity: "warning",
    status: "unread",
    source_table: "compliance_alerts",
    source_id: "ca-003",
    created_at: "2026-06-10T08:00:00Z",
  },
  {
    id: "ntf-007",
    title: "Damp Report Filed",
    message: "Lisa Chen reported damp in bathroom at Flat 7 Park View. Contractor visit scheduled 19 Jun.",
    severity: "warning",
    status: "read",
    source_table: "maintenance_actions",
    source_id: "ma-002",
    created_at: "2026-06-09T15:45:00Z",
  },
  {
    id: "ntf-008",
    title: "Tenancy Renewal Due",
    message: "John Miller's tenancy at 12 Rose Avenue expires 31 August 2026. Renewal discussion advised.",
    severity: "info",
    status: "unread",
    source_table: "tenancies",
    source_id: "tcy-001",
    created_at: "2026-06-08T09:00:00Z",
  },
];

export interface MaintenanceAction {
  id: string;
  title: string;
  description: string;
  property_id: string;
  property_name: string;
  tenant_id: string;
  tenant_name: string;
  contractor_id: string | null;
  contractor_name: string | null;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: "Open" | "In Progress" | "Completed" | "Cancelled";
  communication_status: "draft" | "ready" | "sent" | "archived";
  created_at: string;
  completed_at: string | null;
}

export const maintenanceActionsWithComm: MaintenanceAction[] = [
  {
    id: "ma-001",
    title: "Annual Boiler Service",
    description: "Routine annual boiler service — no issues reported. Certificate valid until June 2027.",
    property_id: "prop-003",
    property_name: "45 Baker Street",
    tenant_id: "tnt-003",
    tenant_name: "Emily Carter",
    contractor_id: "ctr-001",
    contractor_name: "GreenPlumb Ltd",
    priority: "Medium",
    status: "Completed",
    communication_status: "sent",
    created_at: "2026-06-05T09:00:00Z",
    completed_at: "2026-06-08T15:00:00Z",
  },
  {
    id: "ma-002",
    title: "Bathroom Damp Investigation",
    description: "Tenant reported damp patch on bathroom ceiling. Specialist damp surveyor to inspect. Possible roof leak.",
    property_id: "prop-005",
    property_name: "Flat 7 Park View",
    tenant_id: "tnt-005",
    tenant_name: "Lisa Chen",
    contractor_id: null,
    contractor_name: null,
    priority: "High",
    status: "Open",
    communication_status: "ready",
    created_at: "2026-06-09T15:30:00Z",
    completed_at: null,
  },
  {
    id: "ma-003",
    title: "Boiler Replacement",
    description: "14-year-old boiler at end of life. Quote from GreenPlumb: £2,340 + VAT. Awaiting landlord approval.",
    property_id: "prop-003",
    property_name: "45 Baker Street",
    tenant_id: "tnt-003",
    tenant_name: "Emily Carter",
    contractor_id: "ctr-001",
    contractor_name: "GreenPlumb Ltd",
    priority: "High",
    status: "In Progress",
    communication_status: "draft",
    created_at: "2026-06-10T11:00:00Z",
    completed_at: null,
  },
  {
    id: "ma-004",
    title: "Kitchen Tap Replacement",
    description: "Tap washer failing — dripping reported by tenant. Minor job, parts on order.",
    property_id: "prop-001",
    property_name: "12 Rose Avenue",
    tenant_id: "tnt-001",
    tenant_name: "John Miller",
    contractor_id: "ctr-002",
    contractor_name: "SparkPro Electrics",
    priority: "Low",
    status: "In Progress",
    communication_status: "draft",
    created_at: "2026-06-03T10:00:00Z",
    completed_at: null,
  },
];

export interface ComplianceAlert {
  id: string;
  title: string;
  message: string;
  certificate_type: string;
  property_id: string;
  property_name: string;
  landlord_id: string;
  landlord_name: string;
  expiry_date: string;
  status: "valid" | "expiring" | "expired" | "renewed";
  communication_status: "draft" | "ready" | "sent" | "archived";
  created_at: string;
}

export const complianceAlerts: ComplianceAlert[] = [
  {
    id: "ca-001",
    title: "Gas Safety Certificate Expiring",
    message: "The Gas Safety Certificate for 45 Baker Street expires 18 June 2026. Renewal must be completed before expiry to remain legally compliant. A Gas Safe registered engineer must carry out the inspection.",
    certificate_type: "Gas Safety Certificate",
    property_id: "prop-003",
    property_name: "45 Baker Street",
    landlord_id: "own-002",
    landlord_name: "Sarah Walker",
    expiry_date: "2026-06-18",
    status: "expiring",
    communication_status: "draft",
    created_at: "2026-06-13T06:00:00Z",
  },
  {
    id: "ca-002",
    title: "EPC Rating Expiring",
    message: "The Energy Performance Certificate for 8 The Crescent expires 12 December 2026. EPCs are valid for 10 years. Arrange an assessment early to avoid last-minute issues.",
    certificate_type: "EPC",
    property_id: "prop-004",
    property_name: "8 The Crescent",
    landlord_id: "own-004",
    landlord_name: "Margaret Hughes",
    expiry_date: "2026-12-12",
    status: "expiring",
    communication_status: "draft",
    created_at: "2026-06-12T18:00:00Z",
  },
  {
    id: "ca-003",
    title: "EICR Certificate Expiring",
    message: "The Electrical Installation Condition Report for 34 Maple Gardens expires 18 December 2026. EICRs are required every 5 years for rental properties.",
    certificate_type: "EICR",
    property_id: "prop-007",
    property_name: "34 Maple Gardens",
    landlord_id: "own-002",
    landlord_name: "Sarah Walker",
    expiry_date: "2026-12-18",
    status: "expiring",
    communication_status: "draft",
    created_at: "2026-06-10T08:00:00Z",
  },
];