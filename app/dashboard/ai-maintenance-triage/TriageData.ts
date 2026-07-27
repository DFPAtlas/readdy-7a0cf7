export interface TriageIssue {
  id: string;
  tenantName: string;
  propertyAddress: string;
  description: string;
  submittedAt: string;
  category: TriageCategory;
  severity: TriageSeverity;
  confidence: number;
  trade: string;
  estimatedCost: string;
  estimatedTime: string;
  recommendedActions: string[];
  keyPhrases: string[];
  safetyFlag: boolean;
  complianceFlag: boolean;
  status: "new" | "triaged" | "assigned" | "in_progress" | "resolved" | "awaiting_approval";
  assignedTo?: string;
  agentNotes?: string;
  photoCount?: number;
  hasVoiceNote?: boolean;
}

export type TriageCategory =
  | "Leak"
  | "Electrical"
  | "Heating"
  | "Mould/Damp"
  | "Structural"
  | "Security"
  | "Appliance"
  | "General Maintenance";

export type TriageSeverity = "Emergency" | "Urgent" | "Standard" | "Planned";

export const severityConfig: Record<
  TriageSeverity,
  { color: string; bg: string; icon: string; score: number; responseTime: string }
> = {
  Emergency: {
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    icon: "ri-alarm-warning-line",
    score: 100,
    responseTime: "Within 1 hour",
  },
  Urgent: {
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    icon: "ri-time-line",
    score: 75,
    responseTime: "Within 4 hours",
  },
  Standard: {
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    icon: "ri-calendar-check-line",
    score: 50,
    responseTime: "Within 24 hours",
  },
  Planned: {
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    icon: "ri-arrow-down-line",
    score: 25,
    responseTime: "Within 72 hours",
  },
};

export const categoryConfig: Record<
  TriageCategory,
  { icon: string; color: string; bg: string; trades: string[]; predictionLabel: string }
> = {
  Leak: {
    icon: "ri-drop-line",
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
    trades: ["Plumber", "Drainage Specialist", "Gas Safe Engineer"],
    predictionLabel: "Leak",
  },
  Electrical: {
    icon: "ri-flashlight-line",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
    trades: ["Electrician", "NICEIC Contractor", "PAT Tester"],
    predictionLabel: "Electrical",
  },
  Heating: {
    icon: "ri-temp-hot-line",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    trades: ["Gas Safe Engineer", "Heating Engineer", "Boiler Technician"],
    predictionLabel: "Heating",
  },
  "Mould/Damp": {
    icon: "ri-virus-line",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    trades: ["Damp Specialist", "Builder", "Plasterer"],
    predictionLabel: "Mould",
  },
  Structural: {
    icon: "ri-building-line",
    color: "text-[#DC2626]",
    bg: "bg-[#DC2626]/10",
    trades: ["Structural Engineer", "Builder", "Surveyor"],
    predictionLabel: "Structural",
  },
  Security: {
    icon: "ri-shield-check-line",
    color: "text-[#6366F1]",
    bg: "bg-[#6366F1]/10",
    trades: ["Locksmith", "Security Installer", "CCTV Specialist"],
    predictionLabel: "Security",
  },
  Appliance: {
    icon: "ri-fridge-line",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10",
    trades: ["Appliance Engineer", "White Goods Technician", "Electrician"],
    predictionLabel: "Appliance",
  },
  "General Maintenance": {
    icon: "ri-hammer-line",
    color: "text-[#64748B]",
    bg: "bg-[#64748B]/10",
    trades: ["Handyman", "General Builder", "Painter/Decorator"],
    predictionLabel: "General Maintenance",
  },
};

export const triageHistory: TriageIssue[] = [
  {
    id: "tri-001",
    tenantName: "Sarah Jenkins",
    propertyAddress: "14 Rosebery Avenue, London N10 2XX",
    description:
      "Water is leaking from the ceiling in the bathroom. The ceiling is sagging and water is dripping onto the floor. There's a brown stain forming. I noticed this yesterday evening and it's gotten worse overnight.",
    submittedAt: "2026-05-31 09:15",
    category: "Leak",
    severity: "Emergency",
    confidence: 96,
    trade: "Plumber",
    estimatedCost: "£150 - £400",
    estimatedTime: "2 - 4 hours",
    recommendedActions: [
      "Dispatch emergency plumber immediately — risk of structural damage",
      "Advise tenant to turn off mains water stopcock if accessible",
      "Request tenant photos of affected area and ceiling damage",
      "Check if property is above another unit — notify downstairs tenant",
      "Book follow-up plasterer for ceiling repair after leak is fixed",
    ],
    keyPhrases: ["leaking ceiling", "water dripping", "sagging", "structural risk", "mains water"],
    safetyFlag: true,
    complianceFlag: false,
    status: "triaged",
    agentNotes: "Tenant reports worsening overnight. Likely pipe burst above bathroom.",
    photoCount: 4,
    hasVoiceNote: true,
  },
  {
    id: "tri-002",
    tenantName: "Mark Davies",
    propertyAddress: "12 Rose Avenue, Manchester M3 4JA",
    description:
      "The boiler isn't firing up. The pilot light keeps going out. We have no hot water and no heating. It's been like this since yesterday morning. The thermostat is set to 21 but the radiators are cold.",
    submittedAt: "2026-05-31 08:42",
    category: "Heating",
    severity: "Urgent",
    confidence: 94,
    trade: "Gas Safe Engineer",
    estimatedCost: "£120 - £280",
    estimatedTime: "1 - 3 hours",
    recommendedActions: [
      "Book Gas Safe registered engineer for same-day visit",
      "Check if property has electric heaters as temporary heating provision",
      "Verify boiler service history — if overdue, arrange full service",
      "If boiler is beyond repair, prepare landlord for replacement quote",
      "Follow up with tenant 24 hours after repair to confirm resolution",
    ],
    keyPhrases: ["boiler not firing", "no hot water", "no heating", "pilot light", "radiators cold"],
    safetyFlag: false,
    complianceFlag: true,
    status: "assigned",
    assignedTo: "Mike's Heating Ltd",
    agentNotes: "Boiler is 8 years old. May need replacement.",
    photoCount: 2,
    hasVoiceNote: false,
  },
  {
    id: "tri-003",
    tenantName: "Emma White",
    propertyAddress: "45 Oak Lane, Bristol BS1 3AA",
    description:
      "The kitchen tap is dripping constantly. It's been dripping for about a week now. It's driving me mad at night. The water pressure seems lower than usual too.",
    submittedAt: "2026-05-30 14:20",
    category: "Leak",
    severity: "Standard",
    confidence: 91,
    trade: "Plumber",
    estimatedCost: "£60 - £120",
    estimatedTime: "30 - 60 mins",
    recommendedActions: [
      "Schedule plumber visit within 48 hours",
      "Check if tap cartridge or washer replacement is sufficient",
      "If water pressure is low across property, inspect stopcock and mains",
      "Advise tenant to use drip tray temporarily to prevent waste",
      "Update landlord if full tap replacement is needed",
    ],
    keyPhrases: ["dripping tap", "water pressure low", "constant drip", "washer replacement"],
    safetyFlag: false,
    complianceFlag: false,
    status: "triaged",
    agentNotes: "Standard tap issue. Low pressure may be unrelated.",
    photoCount: 1,
    hasVoiceNote: false,
  },
  {
    id: "tri-004",
    tenantName: "John Miller",
    propertyAddress: "22 Baker Street, London NW1 6XE",
    description:
      "The front door lock is sticking. I have to jiggle the key for ages to get it to turn. Sometimes I worry I won't be able to get in. The handle feels loose too.",
    submittedAt: "2026-05-30 11:05",
    category: "Security",
    severity: "Urgent",
    confidence: 89,
    trade: "Locksmith",
    estimatedCost: "£90 - £180",
    estimatedTime: "1 - 2 hours",
    recommendedActions: [
      "Arrange locksmith for same-day or next-day visit",
      "Ask tenant to test back door as emergency exit in case lock fails completely",
      "Assess if lock needs lubrication, repair, or full replacement",
      "If handle is loose, check for wear on the mechanism",
      "Provide tenant with temporary contact number for out-of-hours lockout support",
    ],
    keyPhrases: ["lock sticking", "jiggle key", "handle loose", "security risk", "lockout"],
    safetyFlag: false,
    complianceFlag: false,
    status: "in_progress",
    assignedTo: "SecureLock Services",
    agentNotes: "Tenant concerned about access. Treat as priority.",
    photoCount: 0,
    hasVoiceNote: true,
  },
  {
    id: "tri-005",
    tenantName: "Lisa Green",
    propertyAddress: "3 The Crescent, Birmingham B2 4QA",
    description:
      "The light in the hallway keeps flickering. It's the ceiling light. I've changed the bulb twice but it still flickers. The other lights in the flat are fine.",
    submittedAt: "2026-05-29 16:30",
    category: "Electrical",
    severity: "Standard",
    confidence: 88,
    trade: "Electrician",
    estimatedCost: "£80 - £150",
    estimatedTime: "1 - 2 hours",
    recommendedActions: [
      "Schedule electrician to inspect wiring and light fitting",
      "Ask tenant if flickering is constant or intermittent for diagnosis",
      "Check if issue is isolated to one circuit on consumer unit",
      "If wiring fault suspected, flag for wider electrical inspection (EICR)",
      "Advise tenant to avoid using the light until inspected if arcing suspected",
    ],
    keyPhrases: ["flickering light", "changed bulb", "ceiling light", "wiring fault", "electrical"],
    safetyFlag: true,
    complianceFlag: false,
    status: "triaged",
    agentNotes: "Potential loose wiring. Could be a fire hazard.",
    photoCount: 0,
    hasVoiceNote: false,
  },
  {
    id: "tri-006",
    tenantName: "Tom Harris",
    propertyAddress: "99 High Street, Leeds LS1 4BR",
    description:
      "The washing machine is making a loud banging noise during the spin cycle. It's shaking violently. I had to stop the cycle halfway through. It's 2 years old.",
    submittedAt: "2026-05-29 10:12",
    category: "Appliance",
    severity: "Standard",
    confidence: 87,
    trade: "Appliance Engineer",
    estimatedCost: "£100 - £200",
    estimatedTime: "1 - 2 hours",
    recommendedActions: [
      "Book appliance engineer within 48 hours",
      "Ask tenant to check if machine is level and feet are adjusted",
      "If under warranty, contact manufacturer directly for free repair",
      "If drum bearing issue, prepare landlord for replacement vs repair decision",
      "Advise tenant not to use until inspected to prevent further damage",
    ],
    keyPhrases: ["washing machine", "banging noise", "spin cycle", "shaking", "drum bearing"],
    safetyFlag: false,
    complianceFlag: false,
    status: "assigned",
    assignedTo: "FixIt Appliances",
    agentNotes: "Machine is 2 years old. Check warranty.",
    photoCount: 2,
    hasVoiceNote: false,
  },
  {
    id: "tri-007",
    tenantName: "Sarah Jenkins",
    propertyAddress: "14 Rosebery Avenue, London N10 2XX",
    description:
      "There are some loose tiles on the roof above the bedroom. I can see them from the garden. One looks like it could slip off. It's been windy lately.",
    submittedAt: "2026-05-28 13:45",
    category: "Structural",
    severity: "Urgent",
    confidence: 85,
    trade: "Roofer",
    estimatedCost: "£200 - £500",
    estimatedTime: "2 - 4 hours",
    recommendedActions: [
      "Arrange roofer for urgent inspection — slip hazard below",
      "Ask tenant to avoid standing directly under the area if accessible",
      "If tiles are loose due to wind, check for further damage across roof",
      "If water ingress suspected, arrange interior inspection for damp",
      "Document with photos for insurance claim",
    ],
    keyPhrases: ["loose tiles", "roof", "slip hazard", "wind damage", "water ingress"],
    safetyFlag: true,
    complianceFlag: false,
    status: "triaged",
    agentNotes: "Wind exposure area. Needs quick attention.",
    photoCount: 3,
    hasVoiceNote: false,
  },
  {
    id: "tri-008",
    tenantName: "Rebecca Cole",
    propertyAddress: "56 Meadow Lane, Edinburgh EH1 2AB",
    description:
      "There's black mould growing on the bedroom wall behind the wardrobe. The wall feels damp to touch and there's a musty smell in the room. It's been getting worse over the last month.",
    submittedAt: "2026-05-28 09:30",
    category: "Mould/Damp",
    severity: "Urgent",
    confidence: 92,
    trade: "Damp Specialist",
    estimatedCost: "£300 - £800",
    estimatedTime: "1 - 3 days investigation",
    recommendedActions: [
      "Book damp specialist for full survey — health risk to tenant",
      "Check ventilation, extractor fans, and heating in affected room",
      "Assess if condensation or penetrating damp — determines treatment",
      "If rising damp, prepare landlord for full damp-proof course quote",
      "Advise tenant to keep room ventilated and avoid covering walls",
    ],
    keyPhrases: ["black mould", "damp wall", "musty smell", "health risk", "ventilation"],
    safetyFlag: true,
    complianceFlag: false,
    status: "triaged",
    agentNotes: "Health hazard. Priority treatment needed. Check for underlying leak.",
    photoCount: 5,
    hasVoiceNote: true,
  },
  {
    id: "tri-009",
    tenantName: "Emma White",
    propertyAddress: "45 Oak Lane, Bristol BS1 3AA",
    description:
      "The smoke alarm is beeping every few minutes. I think the battery might be low. It's the one in the hallway. I tried pressing the test button but it still beeps.",
    submittedAt: "2026-05-31 07:30",
    category: "Electrical",
    severity: "Urgent",
    confidence: 93,
    trade: "Electrician",
    estimatedCost: "£40 - £80",
    estimatedTime: "30 - 60 mins",
    recommendedActions: [
      "Dispatch electrician or competent person urgently — smoke alarm is safety-critical",
      "If hardwired, check backup battery and mains connection",
      "If battery-only, guide tenant to replace battery if spare available",
      "Verify all other smoke alarms in property are functional",
      "Log battery replacement date for next compliance check",
    ],
    keyPhrases: ["smoke alarm", "beeping", "low battery", "safety-critical", "compliance"],
    safetyFlag: true,
    complianceFlag: true,
    status: "assigned",
    assignedTo: "SafeWire Electrical",
    agentNotes: "Compliance issue. Must be resolved within 24 hours.",
    photoCount: 0,
    hasVoiceNote: false,
  },
  {
    id: "tri-010",
    tenantName: "John Miller",
    propertyAddress: "22 Baker Street, London NW1 6XE",
    description:
      "The fridge freezer isn't keeping things cold. The milk went off after 2 days. The freezer is frosting up badly. There's ice on the back wall.",
    submittedAt: "2026-05-31 10:00",
    category: "Appliance",
    severity: "Urgent",
    confidence: 90,
    trade: "Appliance Engineer",
    estimatedCost: "£120 - £250",
    estimatedTime: "1 - 2 hours",
    recommendedActions: [
      "Book appliance engineer for urgent repair — tenant food storage affected",
      "Ask tenant to check if door seal is intact and not obstructed",
      "If under warranty, escalate to manufacturer for rapid response",
      "If compressor fault, prepare landlord for replacement cost",
      "Advise tenant to move perishables to a cooler location temporarily",
    ],
    keyPhrases: ["fridge not cold", "freezer frosting", "ice buildup", "compressor", "food storage"],
    safetyFlag: false,
    complianceFlag: false,
    status: "new",
    agentNotes: "",
    photoCount: 1,
    hasVoiceNote: false,
  },
  {
    id: "tri-011",
    tenantName: "David Wong",
    propertyAddress: "7 Riverside Walk, London SE1 9GF",
    description:
      "There's a large crack running from the window frame down to the skirting board in the living room. It's about 3mm wide and wasn't there when we moved in 6 months ago. I'm worried about subsidence.",
    submittedAt: "2026-05-27 15:20",
    category: "Structural",
    severity: "Urgent",
    confidence: 90,
    trade: "Structural Engineer",
    estimatedCost: "£500 - £2,000",
    estimatedTime: "Survey within 5 days",
    recommendedActions: [
      "Commission structural engineer survey — potential subsidence risk",
      "Check neighbouring properties for similar cracking patterns",
      "Review building insurance policy for subsidence cover",
      "Ask tenant to monitor and photograph crack weekly for progression",
      "If movement confirmed, inform landlord of repair scope and timeline",
    ],
    keyPhrases: ["crack", "window frame", "subsidence", "structural movement", "3mm wide"],
    safetyFlag: true,
    complianceFlag: false,
    status: "awaiting_approval",
    agentNotes: "Potential subsidence. Requires structural engineer assessment. Landlord notified.",
    photoCount: 5,
    hasVoiceNote: true,
  },
  {
    id: "tri-012",
    tenantName: "Mark Davies",
    propertyAddress: "12 Rose Avenue, Manchester M3 4JA",
    description:
      "The bathroom ceiling has condensation dripping down after every shower. There's black spots appearing in the corners. The extractor fan doesn't seem to be working properly.",
    submittedAt: "2026-05-26 08:15",
    category: "Mould/Damp",
    severity: "Standard",
    confidence: 88,
    trade: "Damp Specialist",
    estimatedCost: "£200 - £500",
    estimatedTime: "1 - 2 days",
    recommendedActions: [
      "Inspect extractor fan and replace if faulty",
      "Treat existing mould with anti-fungal treatment",
      "Advise tenant on ventilation habits after showering",
      "If condensation persists, consider dehumidifier or PIV unit",
      "Repaint affected area with anti-mould paint after treatment",
    ],
    keyPhrases: ["condensation", "black spots", "extractor fan", "bathroom", "ventilation"],
    safetyFlag: false,
    complianceFlag: false,
    status: "triaged",
    agentNotes: "Extractor fan failure causing condensation. Standard treatment.",
    photoCount: 3,
    hasVoiceNote: false,
  },
];

export const demoIssues: { description: string; expected: TriageCategory; expectedSeverity: TriageSeverity }[] = [
  {
    description: "Water is pouring through the ceiling from the flat above. The light fixture is filling with water and the electrics have tripped.",
    expected: "Leak",
    expectedSeverity: "Emergency",
  },
  {
    description: "There's a strong smell of gas near the boiler. I can hear a hissing sound.",
    expected: "Heating",
    expectedSeverity: "Emergency",
  },
  {
    description: "The kitchen socket is sparking when I plug things in. There's a burning smell.",
    expected: "Electrical",
    expectedSeverity: "Emergency",
  },
  {
    description: "The toilet keeps running after flushing. The cistern doesn't seem to fill properly.",
    expected: "Leak",
    expectedSeverity: "Standard",
  },
  {
    description: "A roof tile has come off and I can see daylight in the loft.",
    expected: "Structural",
    expectedSeverity: "Urgent",
  },
  {
    description: "The oven isn't heating up. The fan works but it stays cold.",
    expected: "Appliance",
    expectedSeverity: "Standard",
  },
  {
    description: "The back gate lock is broken. Anyone can push it open.",
    expected: "Security",
    expectedSeverity: "Urgent",
  },
  {
    description: "There's a small crack in the bathroom wall tile. It's just cosmetic.",
    expected: "General Maintenance",
    expectedSeverity: "Planned",
  },
  {
    description: "The radiator in the living room is only hot at the bottom. The top is cold.",
    expected: "Heating",
    expectedSeverity: "Standard",
  },
  {
    description: "There's black mould spreading across the bedroom ceiling. The wallpaper is peeling and there's a damp smell throughout.",
    expected: "Mould/Damp",
    expectedSeverity: "Urgent",
  },
  {
    description: "A large crack has appeared in the external wall. It runs diagonally from the ground floor window to the damp proof course.",
    expected: "Structural",
    expectedSeverity: "Emergency",
  },
  {
    description: "The hallway walls feel cold and clammy. There's condensation on the windows every morning and dark patches forming near the skirting.",
    expected: "Mould/Damp",
    expectedSeverity: "Standard",
  },
];

export const tradeMatchScores: Record<string, number> = {
  "Plumber": 94,
  "Gas Safe Engineer": 91,
  "Electrician": 89,
  "Locksmith": 88,
  "Roofer": 86,
  "Appliance Engineer": 85,
  "Heating Engineer": 83,
  "Builder": 82,
  "Structural Engineer": 80,
  "Damp Specialist": 79,
  "Handyman": 72,
  "Painter/Decorator": 68,
  "General Builder": 65,
};

export const categoryBreakdown = {
  Leak: { count: 23, avgSeverity: 67, avgResponse: "4h" },
  Electrical: { count: 18, avgSeverity: 58, avgResponse: "6h" },
  Heating: { count: 15, avgSeverity: 72, avgResponse: "3h" },
  Structural: { count: 10, avgSeverity: 68, avgResponse: "8h" },
  "Mould/Damp": { count: 9, avgSeverity: 55, avgResponse: "12h" },
  Appliance: { count: 12, avgSeverity: 45, avgResponse: "12h" },
  Security: { count: 10, avgSeverity: 55, avgResponse: "6h" },
  "General Maintenance": { count: 14, avgSeverity: 28, avgResponse: "48h" },
};

export const recentActivity = [
  { time: "09:15", action: "Maintenance action created", detail: "Emergency — Ceiling leak at 14 Rosebery Ave — awaiting human approval", user: "AI Triage" },
  { time: "09:12", action: "Recommendation record", detail: "Plumber recommended for 14 Rosebery Ave with 96% confidence", user: "AI Triage" },
  { time: "08:45", action: "Issue triaged", detail: "Urgent — Boiler failure at 12 Rose Avenue", user: "AI Triage" },
  { time: "08:30", action: "Tenant submitted", detail: "Photos + voice note — Mould in bedroom at 56 Meadow Lane", user: "Rebecca Cole" },
  { time: "08:15", action: "Issue triaged", detail: "Standard — Dripping tap at 45 Oak Lane", user: "AI Triage" },
  { time: "07:50", action: "Human approved", detail: "Lock repair at 22 Baker Street — contractor dispatched", user: "Sarah Davies" },
  { time: "07:30", action: "Maintenance action created", detail: "Urgent — Smoke alarm at 45 Oak Lane — awaiting human approval", user: "AI Triage" },
  { time: "07:15", action: "Tenant submitted", detail: "Photos — Fridge not cooling at 22 Baker Street", user: "John Miller" },
  { time: "06:45", action: "Issue resolved", detail: "Washing machine repair at 99 High Street", user: "FixIt Appliances" },
  { time: "06:30", action: "Maintenance action created", detail: "Urgent — Roof tiles at 14 Rosebery Ave — awaiting human approval", user: "AI Triage" },
];