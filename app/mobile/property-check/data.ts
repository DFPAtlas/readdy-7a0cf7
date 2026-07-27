export interface RoomTemplate {
  id: string;
  name: string;
  icon: string;
  defaultItems: string[];
}

export const roomTemplates: RoomTemplate[] = [
  {
    id: "living-room",
    name: "Living Room",
    icon: "ri-live-line",
    defaultItems: [
      "Walls & ceilings", "Flooring & skirting", "Windows & locks",
      "Light fittings", "Smoke alarm", "Heating & radiators",
      "Curtains & blinds", "Electrical sockets", "Furniture condition"
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "ri-knife-line",
    defaultItems: [
      "Cupboards & drawers", "Worktops", "Sink & taps",
      "Oven & hob", "Extractor fan", "Fridge/freezer",
      "Dishwasher", "Washing machine", "Flooring",
      "Tiling & splashback", "Lighting", "Plumbing leaks"
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    icon: "ri-hotel-bed-line",
    defaultItems: [
      "Walls & ceilings", "Flooring & carpets", "Windows & locks",
      "Light fittings", "Radiator", "Wardrobe doors",
      "Electrical sockets", "Furniture condition", "Damp or mould"
    ],
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: "ri-drop-line",
    defaultItems: [
      "Bath & shower", "Shower screen seal", "Toilet flush & seat",
      "Sink & taps", "Sealant & grout", "Extractor fan",
      "Tiling condition", "Damp or mould", "Towel rail",
      "Mirror condition", "Flooring", "Water pressure"
    ],
  },
  {
    id: "hallway",
    name: "Hallway",
    icon: "ri-door-open-line",
    defaultItems: [
      "Walls & ceilings", "Flooring", "Light fittings",
      "Doors & handles", "Smoke alarm", "Skirting boards",
      "Staircase & banister", "Electrical sockets"
    ],
  },
  {
    id: "garden",
    name: "Garden",
    icon: "ri-plant-line",
    defaultItems: [
      "Fencing & boundaries", "Lawn condition", "Patio & paving",
      "Shed condition", "Gates & locks", "Drainage",
      "Trees & shrubs", "Rubbish & debris", "External lighting"
    ],
  },
  {
    id: "exterior",
    name: "Exterior",
    icon: "ri-building-line",
    defaultItems: [
      "Roof condition", "Gutters & downpipes", "Walls & brickwork",
      "Windows & frames", "Front door & locks", "Driveway & paths",
      "External paintwork", "Drainpipes & drainage", "Satellite dish & aerials"
    ],
  },
  {
    id: "utility",
    name: "Utility Room",
    icon: "ri-fridge-line",
    defaultItems: [
      "Walls & flooring", "Washing machine", "Tumble dryer",
      "Sink & taps", "Cupboards", "Lighting",
      "Plumbing leaks", "Ventilation"
    ],
  },
  {
    id: "loft",
    name: "Loft / Attic",
    icon: "ri-arrow-up-line",
    defaultItems: [
      "Insulation condition", "Roof timbers", "Damp or leaks",
      "Ventilation", "Lighting", "Access hatch",
      "Pest evidence", "Storage condition"
    ],
  },
  {
    id: "boiler",
    name: "Boiler & Heating",
    icon: "ri-fire-line",
    defaultItems: [
      "Boiler condition", "Service history", "Pressure gauge",
      "Thermostat working", "Timer/programmer", "Radiators hot",
      "Carbon monoxide alarm", "Flue & ventilation", "Pipe insulation"
    ],
  },
];

export interface RoomCheckResult {
  templateId: string;
  roomName: string;
  customName?: string;
  items: { name: string; status: "pass" | "fail" | "na"; note?: string }[];
  photos: InspectionPhoto[];
  voiceNotes: VoiceNote[];
  generalNote: string;
}

export interface InspectionPhoto {
  id: string;
  dataUrl: string;
  timestamp: string;
  gpsLat?: number;
  gpsLng?: number;
  label?: string;
}

export interface VoiceNote {
  id: string;
  dataUrl: string;
  timestamp: string;
  duration: number;
  transcript?: string;
}

export interface InspectionDraft {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  tenantName: string;
  inspectorName: string;
  type: string;
  startedAt: string;
  lastSavedAt: string;
  rooms: RoomCheckResult[];
  generalNotes: string;
  signature?: string;
  signatureName?: string;
  gpsLocation?: { lat: number; lng: number };
  progress: { total: number; done: number };
}

export interface CompletedInspection {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  type: string;
  date: string;
  inspector: string;
  tenant: string;
  rooms: number;
  issues: number;
  rating: string;
  synced: boolean;
}

export function saveDraft(draft: InspectionDraft): void {
  if (typeof window === "undefined") return;
  try {
    const key = `lethub_inspection_draft_${draft.id}`;
    localStorage.setItem(key, JSON.stringify(draft));
    const index = getDraftIndex();
    if (!index.includes(draft.id)) {
      index.push(draft.id);
      localStorage.setItem("lethub_inspection_drafts_index", JSON.stringify(index));
    }
  } catch {
    // Storage full
  }
}

export function loadDraft(draftId: string): InspectionDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `lethub_inspection_draft_${draftId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deleteDraft(draftId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`lethub_inspection_draft_${draftId}`);
    const index = getDraftIndex().filter((id) => id !== draftId);
    localStorage.setItem("lethub_inspection_drafts_index", JSON.stringify(index));
  } catch {}
}

export function getDraftIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("lethub_inspection_drafts_index");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllDrafts(): InspectionDraft[] {
  const index = getDraftIndex();
  return index.map((id) => loadDraft(id)).filter(Boolean) as InspectionDraft[];
}

export function addToOfflineQueue(inspection: CompletedInspection): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("lethub_offline_inspections");
    const queue: CompletedInspection[] = raw ? JSON.parse(raw) : [];
    queue.push({ ...inspection, synced: false });
    localStorage.setItem("lethub_offline_inspections", JSON.stringify(queue));
  } catch {}
}

export function getOfflineQueue(): CompletedInspection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("lethub_offline_inspections");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("lethub_offline_inspections");
}

export function generateInspectionId(): string {
  return `insp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export const sampleProperties = [
  {
    id: "prop-001",
    name: "Rose Court Flat 2A",
    address: "12 Rose Avenue, London E1 6AN",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    landlord: "James Richardson",
    lastInspection: "5 Jun 2026",
  },
  {
    id: "prop-002",
    name: "Riverside Court",
    address: "Unit 3, Riverside Court, Bristol BS1 4ST",
    tenant: "Emma Wilson",
    tenantPhone: "+44 7700 900788",
    landlord: "James Richardson",
    lastInspection: "28 May 2026",
  },
  {
    id: "prop-003",
    name: "34 Maple Gardens",
    address: "34 Maple Gardens, Cardiff CF10 3BZ",
    tenant: "David Thompson",
    tenantPhone: "+44 7700 900321",
    landlord: "Sarah Walker",
    lastInspection: "15 Apr 2026",
  },
  {
    id: "prop-004",
    name: "Flat 4B Oak Street",
    address: "Flat 4B Oak Street, Manchester M1 2AB",
    tenant: "Sarah Jenkins",
    tenantPhone: "+44 7700 900555",
    landlord: "David Thompson",
    lastInspection: "2 Mar 2026",
  },
  {
    id: "prop-005",
    name: "8 The Crescent",
    address: "8 The Crescent, Birmingham B2 3CD",
    tenant: "Lisa Chen",
    tenantPhone: "+44 7700 900777",
    landlord: "Margaret Hughes",
    lastInspection: "20 Jan 2026",
  },
];

export const previousReports: CompletedInspection[] = [
  {
    id: "prev-001",
    propertyId: "prop-001",
    propertyName: "Rose Court Flat 2A",
    propertyAddress: "12 Rose Avenue, London E1 6AN",
    type: "Routine Inspection",
    date: "5 Jun 2026",
    inspector: "Sarah Collins",
    tenant: "John Miller",
    rooms: 6,
    issues: 3,
    rating: "Good",
    synced: true,
  },
  {
    id: "prev-002",
    propertyId: "prop-002",
    propertyName: "Riverside Court",
    propertyAddress: "Unit 3, Riverside Court, Bristol BS1 4ST",
    type: "Mid-Term Inspection",
    date: "15 Jan 2026",
    inspector: "James Hart",
    tenant: "Emma Wilson",
    rooms: 4,
    issues: 0,
    rating: "Excellent",
    synced: true,
  },
  {
    id: "prev-003",
    propertyId: "prop-003",
    propertyName: "34 Maple Gardens",
    propertyAddress: "34 Maple Gardens, Cardiff CF10 3BZ",
    type: "Routine Inspection",
    date: "15 Apr 2026",
    inspector: "Sarah Collins",
    tenant: "David Thompson",
    rooms: 3,
    issues: 2,
    rating: "Fair",
    synced: true,
  },
];

export const inspectionTypes = [
  { id: "routine", label: "Routine Inspection", icon: "ri-refresh-line" },
  { id: "move-in", label: "Move In", icon: "ri-login-box-line" },
  { id: "mid-term", label: "Mid-Term", icon: "ri-calendar-check-line" },
  { id: "move-out", label: "Move Out", icon: "ri-logout-box-line" },
  { id: "pre-works", label: "Pre-Works", icon: "ri-tools-line" },
  { id: "post-works", label: "Post-Works", icon: "ri-check-double-line" },
  { id: "ad-hoc", label: "Ad Hoc", icon: "ri-flashlight-line" },
];