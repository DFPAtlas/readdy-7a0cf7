export interface RoomCheck {
  id: string;
  name: string;
  condition: string;
  notes: string;
  checklist: { item: string; status: "Pass" | "Fail" | "N/A"; notes?: string }[];
  photos: string[];
}

export interface Observation {
  id: string;
  room: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  description: string;
  photo?: string;
  action: string;
  status: "Open" | "Resolved";
}

export interface FollowUpAction {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
}

export interface Inspection {
  id: string;
  property: string;
  propertyId: string;
  address: string;
  type: "Move In" | "Routine Inspection" | "Mid-Term Inspection" | "Move Out";
  date: string;
  scheduledTime: string;
  inspector: string;
  inspectorId: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  tenant: string;
  tenantPhone: string;
  landlord: string;
  overallRating: "Excellent" | "Good" | "Fair" | "Poor" | "—";
  notes: string;
  rooms: RoomCheck[];
  observations: Observation[];
  followUpActions: FollowUpAction[];
  reportGenerated: boolean;
  reportDate?: string;
  photos: string[];
}

export const inspections: Inspection[] = [
  {
    id: "insp-001",
    property: "Rose Court Flat 2A",
    propertyId: "prop-001",
    address: "12 Rose Avenue, London E1 6AN",
    type: "Routine Inspection",
    date: "10 Feb 2026",
    scheduledTime: "14:00",
    inspector: "Sarah Collins",
    inspectorId: "staff-001",
    status: "Completed",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    landlord: "James Richardson",
    overallRating: "Good",
    notes: "Property in generally good condition. Tenant maintains cleanliness well. One minor scuff on hallway wall noted.",
    rooms: [
      {
        id: "r1",
        name: "Living Room",
        condition: "Good",
        notes: "Clean and tidy. Sofa slightly worn on left arm. Curtains in good condition.",
        checklist: [
          { item: "Walls & ceilings", status: "Pass" },
          { item: "Flooring", status: "Pass" },
          { item: "Windows & locks", status: "Pass" },
          { item: "Light fittings", status: "Pass" },
          { item: "Smoke alarm", status: "Pass" },
          { item: "Heating", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Modern living room interior with light grey sofa, wooden floors, large windows, clean tidy minimal decor, neutral colours, professional interior photography, natural daylight, UK apartment",
          "https://readdy.ai/api/search-image?query=Modern living room corner view showing window with curtains, clean walls, light wooden flooring, minimal furniture, professional interior photography, natural daylight",
        ],
      },
      {
        id: "r2",
        name: "Kitchen",
        condition: "Good",
        notes: "All appliances functional. Extractor fan working but slightly noisy. No leaks.",
        checklist: [
          { item: "Cupboards & worktops", status: "Pass" },
          { item: "Sink & taps", status: "Pass" },
          { item: "Oven & hob", status: "Pass" },
          { item: "Fridge/freezer", status: "Pass" },
          { item: "Extractor fan", status: "Pass", notes: "Slightly noisy but functional" },
          { item: "Flooring", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Modern kitchen interior with white cabinets, stainless steel appliances, clean countertops, professional interior photography, natural daylight, UK apartment",
        ],
      },
      {
        id: "r3",
        name: "Master Bedroom",
        condition: "Good",
        notes: "Bed frame intact. Wardrobe doors slide smoothly. No damp or mould.",
        checklist: [
          { item: "Walls & ceilings", status: "Pass" },
          { item: "Flooring", status: "Pass" },
          { item: "Windows & locks", status: "Pass" },
          { item: "Light fittings", status: "Pass" },
          { item: "Radiator", status: "Pass" },
          { item: "Furniture", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Modern bedroom interior with double bed, clean white walls, wooden floors, natural daylight, minimal decor, professional interior photography, UK apartment",
        ],
      },
      {
        id: "r4",
        name: "Bathroom",
        condition: "Fair",
        notes: "Shower screen seal showing wear. Mould around bath edge. Needs resealing.",
        checklist: [
          { item: "Walls & tiling", status: "Pass" },
          { item: "Bath/shower", status: "Pass", notes: "Seal worn" },
          { item: "Sink & taps", status: "Pass" },
          { item: "Toilet", status: "Pass" },
          { item: "Extractor fan", status: "Pass" },
          { item: "Flooring", status: "Pass", notes: "Mould around edges" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Modern bathroom interior with white tiles, clean bath with shower screen, slight mould visible on seal, professional interior photography, natural daylight, UK apartment",
        ],
      },
      {
        id: "r5",
        name: "Hallway",
        condition: "Fair",
        notes: "Scuff mark on left wall near entrance. Light switch plate loose.",
        checklist: [
          { item: "Walls & ceilings", status: "Fail", notes: "Scuff mark near entrance" },
          { item: "Flooring", status: "Pass" },
          { item: "Light fittings", status: "Fail", notes: "Switch plate loose" },
          { item: "Doors & locks", status: "Pass" },
          { item: "Smoke alarm", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Narrow apartment hallway interior with light walls, wooden floor, slight scuff mark on wall, entry door, professional interior photography, natural daylight, UK apartment",
        ],
      },
      {
        id: "r6",
        name: "Balcony",
        condition: "Good",
        notes: "Clean and clear. No debris. Railings secure.",
        checklist: [
          { item: "Flooring", status: "Pass" },
          { item: "Railings", status: "Pass" },
          { item: "Drainage", status: "Pass" },
          { item: "Storage", status: "N/A" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Small apartment balcony with grey flooring, metal railings, clean and tidy, potted plants, city view, professional exterior photography, natural daylight, UK apartment",
        ],
      },
    ],
    observations: [
      {
        id: "obs-001",
        room: "Hallway",
        category: "Decorative",
        severity: "Low",
        description: "Scuff mark on left wall near entrance door. Approximately 15cm mark.",
        photo: "https://readdy.ai/api/search-image?query=Close up of white wall with slight scuff mark, interior photography, natural daylight, minimal background",
        action: "Tenant to clean/mark touch-up before checkout",
        status: "Open",
      },
      {
        id: "obs-002",
        room: "Bathroom",
        category: "Damp & Mould",
        severity: "Medium",
        description: "Mould growth around bath edge and seal. Sealant showing signs of wear.",
        photo: "https://readdy.ai/api/search-image?query=Close up of bathroom bath edge with slight black mould on sealant, white tiles background, professional interior photography, natural daylight",
        action: "Reseal bath and treat mould. Schedule contractor visit.",
        status: "Open",
      },
      {
        id: "obs-003",
        room: "Kitchen",
        category: "Appliances",
        severity: "Low",
        description: "Extractor fan making humming noise. Still functional but may need attention.",
        action: "Monitor. Replace if noise increases.",
        status: "Open",
      },
    ],
    followUpActions: [
      {
        id: "fa-001",
        description: "Reseal bath and treat mould in bathroom",
        assignee: "GreenPlumb Ltd",
        dueDate: "20 Feb 2026",
        status: "Pending",
        priority: "Medium",
      },
      {
        id: "fa-002",
        description: "Touch up hallway scuff mark",
        assignee: "Tenant (John Miller)",
        dueDate: "28 Feb 2026",
        status: "Pending",
        priority: "Low",
      },
      {
        id: "fa-003",
        description: "Tighten hallway light switch plate",
        assignee: "Maintenance Team",
        dueDate: "15 Feb 2026",
        status: "Completed",
        priority: "Low",
      },
    ],
    reportGenerated: true,
    reportDate: "10 Feb 2026",
    photos: [
      "https://readdy.ai/api/search-image?query=Modern apartment building exterior London, brick and glass facade, residential street, professional real estate photography, clean simple background",
      "https://readdy.ai/api/search-image?query=Modern living room interior with grey sofa, wooden floors, large windows, clean tidy minimal decor, neutral colours, professional interior photography, natural daylight, UK apartment",
      "https://readdy.ai/api/search-image?query=Modern kitchen interior with white cabinets, stainless steel appliances, clean countertops, professional interior photography, natural daylight, UK apartment",
      "https://readdy.ai/api/search-image?query=Modern bedroom interior with double bed, clean white walls, wooden floors, natural daylight, minimal decor, professional interior photography, UK apartment",
      "https://readdy.ai/api/search-image?query=Modern bathroom interior with white tiles, clean bath with shower screen, professional interior photography, natural daylight, UK apartment",
      "https://readdy.ai/api/search-image?query=Small apartment balcony with grey flooring, metal railings, clean and tidy, potted plants, city view, professional exterior photography, natural daylight, UK apartment",
    ],
  },
  {
    id: "insp-002",
    property: "Riverside Court",
    propertyId: "prop-002",
    address: "Unit 3, Riverside Court, Bristol BS1 4ST",
    type: "Move In",
    date: "05 Aug 2024",
    scheduledTime: "10:00",
    inspector: "James Hart",
    inspectorId: "staff-002",
    status: "Completed",
    tenant: "Emma Wilson",
    tenantPhone: "+44 7700 900788",
    landlord: "James Richardson",
    overallRating: "Excellent",
    notes: "Full inventory and condition check completed. Property clean and all items accounted for. Tenant signed agreement.",
    rooms: [
      {
        id: "r1",
        name: "Living Room",
        condition: "Excellent",
        notes: "Spotless. New carpet. All furniture items present and undamaged.",
        checklist: [
          { item: "Walls & ceilings", status: "Pass" },
          { item: "Flooring", status: "Pass" },
          { item: "Windows & locks", status: "Pass" },
          { item: "Light fittings", status: "Pass" },
          { item: "Smoke alarm", status: "Pass" },
          { item: "Heating", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Bright modern living room with new grey carpet, clean white walls, large window, modern furniture, professional interior photography, natural daylight, UK apartment",
        ],
      },
      {
        id: "r2",
        name: "Kitchen",
        condition: "Excellent",
        notes: "All new appliances. Extractor fan working silently.",
        checklist: [
          { item: "Cupboards & worktops", status: "Pass" },
          { item: "Sink & taps", status: "Pass" },
          { item: "Oven & hob", status: "Pass" },
          { item: "Fridge/freezer", status: "Pass" },
          { item: "Extractor fan", status: "Pass" },
          { item: "Flooring", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Brand new modern kitchen with white cabinets, stainless steel appliances, clean countertops, professional interior photography, natural daylight, UK apartment",
        ],
      },
      {
        id: "r3",
        name: "Master Bedroom",
        condition: "Excellent",
        notes: "New bed, wardrobe, curtains. No issues.",
        checklist: [
          { item: "Walls & ceilings", status: "Pass" },
          { item: "Flooring", status: "Pass" },
          { item: "Windows & locks", status: "Pass" },
          { item: "Light fittings", status: "Pass" },
          { item: "Radiator", status: "Pass" },
          { item: "Furniture", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Bright modern bedroom with new furniture, clean white walls, new carpet, natural daylight, professional interior photography, UK apartment",
        ],
      },
      {
        id: "r4",
        name: "Bathroom",
        condition: "Excellent",
        notes: "Spotless. New suite installed.",
        checklist: [
          { item: "Walls & tiling", status: "Pass" },
          { item: "Bath/shower", status: "Pass" },
          { item: "Sink & taps", status: "Pass" },
          { item: "Toilet", status: "Pass" },
          { item: "Extractor fan", status: "Pass" },
          { item: "Flooring", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Brand new modern bathroom with white tiles, new bath, clean shower screen, professional interior photography, natural daylight, UK apartment",
        ],
      },
    ],
    observations: [
      {
        id: "obs-004",
        room: "Living Room",
        category: "Inventory",
        severity: "Low",
        description: "One set of keys provided (3 keys). Spare set retained by agent.",
        action: "No action required.",
        status: "Resolved",
      },
    ],
    followUpActions: [
      {
        id: "fa-004",
        description: "Provide tenant welcome pack and contact details",
        assignee: "LetHub Admin",
        dueDate: "06 Aug 2024",
        status: "Completed",
        priority: "Low",
      },
    ],
    reportGenerated: true,
    reportDate: "05 Aug 2024",
    photos: [
      "https://readdy.ai/api/search-image?query=Modern riverside apartment building exterior Bristol, contemporary waterfront residential complex with balconies, professional architectural photography, clean simple background",
      "https://readdy.ai/api/search-image?query=Bright modern living room with new grey carpet, clean white walls, large window, modern furniture, professional interior photography, natural daylight, UK apartment",
      "https://readdy.ai/api/search-image?query=Brand new modern kitchen with white cabinets, stainless steel appliances, clean countertops, professional interior photography, natural daylight, UK apartment",
      "https://readdy.ai/api/search-image?query=Bright modern bedroom with new furniture, clean white walls, new carpet, natural daylight, professional interior photography, UK apartment",
      "https://readdy.ai/api/search-image?query=Brand new modern bathroom with white tiles, new bath, clean shower screen, professional interior photography, natural daylight, UK apartment",
    ],
  },
  {
    id: "insp-003",
    property: "Maple Gardens House",
    propertyId: "prop-003",
    address: "34 Maple Gardens, Cardiff CF10 3BZ",
    type: "Routine Inspection",
    date: "18 Mar 2026",
    scheduledTime: "11:00",
    inspector: "Sarah Collins",
    inspectorId: "staff-001",
    status: "Completed",
    tenant: "Michael Brown",
    tenantPhone: "+44 7700 900321",
    landlord: "Sarah Walker",
    overallRating: "Good",
    notes: "Property in good order. Garden fence panels damaged in recent storm. Maintenance ticket raised. All other areas satisfactory.",
    rooms: [
      {
        id: "r1",
        name: "Living Room",
        condition: "Good",
        notes: "Well maintained. Furniture in good condition.",
        checklist: [
          { item: "Walls & ceilings", status: "Pass" },
          { item: "Flooring", status: "Pass" },
          { item: "Windows & locks", status: "Pass" },
          { item: "Light fittings", status: "Pass" },
          { item: "Smoke alarm", status: "Pass" },
          { item: "Heating", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Spacious living room in semi-detached house, neutral decor, comfortable furniture, clean and tidy, professional interior photography, natural daylight, UK home",
        ],
      },
      {
        id: "r2",
        name: "Kitchen",
        condition: "Good",
        notes: "All appliances working. Slight wear on worktop edge.",
        checklist: [
          { item: "Cupboards & worktops", status: "Pass", notes: "Slight wear on edge" },
          { item: "Sink & taps", status: "Pass" },
          { item: "Oven & hob", status: "Pass" },
          { item: "Fridge/freezer", status: "Pass" },
          { item: "Extractor fan", status: "Pass" },
          { item: "Flooring", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Modern kitchen in semi-detached house, white cabinets, clean countertops, professional interior photography, natural daylight, UK home",
        ],
      },
      {
        id: "r3",
        name: "Garden",
        condition: "Fair",
        notes: "Two fence panels blown down in storm. Lawn well maintained.",
        checklist: [
          { item: "Fencing", status: "Fail", notes: "2 panels down" },
          { item: "Lawn", status: "Pass" },
          { item: "Patio", status: "Pass" },
          { item: "Storage shed", status: "Pass" },
          { item: "Gate", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Back garden of semi-detached house with lawn, two fence panels blown down and lying on grass, professional exterior photography, overcast daylight, UK home",
        ],
      },
    ],
    observations: [
      {
        id: "obs-005",
        room: "Garden",
        category: "Exterior",
        severity: "Medium",
        description: "Two fence panels blown down in recent storm. Panels need replacement.",
        photo: "https://readdy.ai/api/search-image?query=Close up of broken wooden fence panels lying on grass in garden, storm damage, professional exterior photography, overcast daylight, UK home",
        action: "Replace fence panels. Job raised with contractor.",
        status: "Open",
      },
    ],
    followUpActions: [
      {
        id: "fa-005",
        description: "Replace two fence panels in garden",
        assignee: "BuildRight Construction",
        dueDate: "25 Mar 2026",
        status: "Completed",
        priority: "Medium",
      },
    ],
    reportGenerated: true,
    reportDate: "18 Mar 2026",
    photos: [
      "https://readdy.ai/api/search-image?query=Modern British semi-detached house exterior with brick and render facade, well-maintained front garden, professional real estate photography, clean simple background",
      "https://readdy.ai/api/search-image?query=Spacious living room in semi-detached house, neutral decor, comfortable furniture, clean and tidy, professional interior photography, natural daylight, UK home",
      "https://readdy.ai/api/search-image?query=Modern kitchen in semi-detached house, white cabinets, clean countertops, professional interior photography, natural daylight, UK home",
      "https://readdy.ai/api/search-image?query=Back garden of semi-detached house with lawn, two fence panels blown down and lying on grass, professional exterior photography, overcast daylight, UK home",
    ],
  },
  {
    id: "insp-004",
    property: "Rose Court Flat 2A",
    propertyId: "prop-001",
    address: "12 Rose Avenue, London E1 6AN",
    type: "Routine Inspection",
    date: "20 Jun 2026",
    scheduledTime: "15:00",
    inspector: "James Hart",
    inspectorId: "staff-002",
    status: "Scheduled",
    tenant: "John Miller",
    tenantPhone: "+44 7700 900456",
    landlord: "James Richardson",
    overallRating: "—",
    notes: "Upcoming quarterly inspection. Tenant confirmed availability.",
    rooms: [
      {
        id: "r1",
        name: "Living Room",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Walls & ceilings", status: "N/A" },
          { item: "Flooring", status: "N/A" },
          { item: "Windows & locks", status: "N/A" },
          { item: "Light fittings", status: "N/A" },
          { item: "Smoke alarm", status: "N/A" },
          { item: "Heating", status: "N/A" },
        ],
        photos: [],
      },
      {
        id: "r2",
        name: "Kitchen",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Cupboards & worktops", status: "N/A" },
          { item: "Sink & taps", status: "N/A" },
          { item: "Oven & hob", status: "N/A" },
          { item: "Fridge/freezer", status: "N/A" },
          { item: "Extractor fan", status: "N/A" },
          { item: "Flooring", status: "N/A" },
        ],
        photos: [],
      },
      {
        id: "r3",
        name: "Master Bedroom",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Walls & ceilings", status: "N/A" },
          { item: "Flooring", status: "N/A" },
          { item: "Windows & locks", status: "N/A" },
          { item: "Light fittings", status: "N/A" },
          { item: "Radiator", status: "N/A" },
          { item: "Furniture", status: "N/A" },
        ],
        photos: [],
      },
      {
        id: "r4",
        name: "Bathroom",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Walls & tiling", status: "N/A" },
          { item: "Bath/shower", status: "N/A" },
          { item: "Sink & taps", status: "N/A" },
          { item: "Toilet", status: "N/A" },
          { item: "Extractor fan", status: "N/A" },
          { item: "Flooring", status: "N/A" },
        ],
        photos: [],
      },
      {
        id: "r5",
        name: "Hallway",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Walls & ceilings", status: "N/A" },
          { item: "Flooring", status: "N/A" },
          { item: "Light fittings", status: "N/A" },
          { item: "Doors & locks", status: "N/A" },
          { item: "Smoke alarm", status: "N/A" },
        ],
        photos: [],
      },
      {
        id: "r6",
        name: "Balcony",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Flooring", status: "N/A" },
          { item: "Railings", status: "N/A" },
          { item: "Drainage", status: "N/A" },
          { item: "Storage", status: "N/A" },
        ],
        photos: [],
      },
    ],
    observations: [],
    followUpActions: [],
    reportGenerated: false,
    photos: [],
  },
  {
    id: "insp-005",
    property: "Maple Gardens House",
    propertyId: "prop-003",
    address: "34 Maple Gardens, Cardiff CF10 3BZ",
    type: "Move Out",
    date: "12 Mar 2026",
    scheduledTime: "09:00",
    inspector: "Sarah Collins",
    inspectorId: "staff-001",
    status: "Scheduled",
    tenant: "Michael Brown",
    tenantPhone: "+44 7700 900321",
    landlord: "Sarah Walker",
    overallRating: "—",
    notes: "Final move-out inspection before tenancy ends on 11 Mar 2026. Keys to be returned.",
    rooms: [
      {
        id: "r1",
        name: "Living Room",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Walls & ceilings", status: "N/A" },
          { item: "Flooring", status: "N/A" },
          { item: "Windows & locks", status: "N/A" },
          { item: "Light fittings", status: "N/A" },
          { item: "Smoke alarm", status: "N/A" },
          { item: "Heating", status: "N/A" },
        ],
        photos: [],
      },
      {
        id: "r2",
        name: "Kitchen",
        condition: "—",
        notes: "To be inspected",
        checklist: [
          { item: "Cupboards & worktops", status: "N/A" },
          { item: "Sink & taps", status: "N/A" },
          { item: "Oven & hob", status: "N/A" },
          { item: "Fridge/freezer", status: "N/A" },
          { item: "Extractor fan", status: "N/A" },
          { item: "Flooring", status: "N/A" },
        ],
        photos: [],
      },
    ],
    observations: [],
    followUpActions: [],
    reportGenerated: false,
    photos: [],
  },
  {
    id: "insp-006",
    property: "Riverside Court",
    propertyId: "prop-002",
    address: "Unit 3, Riverside Court, Bristol BS1 4ST",
    type: "Mid-Term Inspection",
    date: "15 Jan 2026",
    scheduledTime: "13:00",
    inspector: "James Hart",
    inspectorId: "staff-002",
    status: "Completed",
    tenant: "Emma Wilson",
    tenantPhone: "+44 7700 900788",
    landlord: "James Richardson",
    overallRating: "Excellent",
    notes: "Property maintained to an excellent standard. Tenant very cooperative.",
    rooms: [
      {
        id: "r1",
        name: "Living Room",
        condition: "Excellent",
        notes: "Immaculate condition.",
        checklist: [
          { item: "Walls & ceilings", status: "Pass" },
          { item: "Flooring", status: "Pass" },
          { item: "Windows & locks", status: "Pass" },
          { item: "Light fittings", status: "Pass" },
          { item: "Smoke alarm", status: "Pass" },
          { item: "Heating", status: "Pass" },
        ],
        photos: [
          "https://readdy.ai/api/search-image?query=Bright modern living room with grey carpet, clean white walls, large window, modern furniture, professional interior photography, natural daylight, UK apartment",
        ],
      },
    ],
    observations: [],
    followUpActions: [],
    reportGenerated: true,
    reportDate: "15 Jan 2026",
    photos: [
      "https://readdy.ai/api/search-image?query=Modern riverside apartment building exterior Bristol, contemporary waterfront residential complex with balconies, professional architectural photography, clean simple background",
    ],
  },
];

export const propertiesForInspection = [
  { id: "prop-001", name: "Rose Court Flat 2A", address: "12 Rose Avenue, London E1 6AN", tenant: "John Miller", tenantPhone: "+44 7700 900456", landlord: "James Richardson" },
  { id: "prop-002", name: "Riverside Court", address: "Unit 3, Riverside Court, Bristol BS1 4ST", tenant: "Emma Wilson", tenantPhone: "+44 7700 900788", landlord: "James Richardson" },
  { id: "prop-003", name: "Maple Gardens House", address: "34 Maple Gardens, Cardiff CF10 3BZ", tenant: "Michael Brown", tenantPhone: "+44 7700 900321", landlord: "Sarah Walker" },
  { id: "prop-004", name: "Flat 4B Oak Street", address: "Flat 4B Oak Street, Manchester M1 2AB", tenant: "Sarah Jenkins", tenantPhone: "+44 7700 900555", landlord: "David Thompson" },
  { id: "prop-005", name: "8 The Crescent", address: "8 The Crescent, Birmingham B2 3CD", tenant: "Lisa Chen", tenantPhone: "+44 7700 900777", landlord: "Margaret Hughes" },
];

export const inspectors = [
  { id: "staff-001", name: "Sarah Collins", phone: "+44 7700 900111", email: "sarah.collins@lethub.com", role: "Senior Property Inspector" },
  { id: "staff-002", name: "James Hart", phone: "+44 7700 900222", email: "james.hart@lethub.com", role: "Property Inspector" },
  { id: "staff-003", name: "Priya Patel", phone: "+44 7700 900333", email: "priya.patel@lethub.com", role: "Property Inspector" },
];

export const inspectionTypeLabels: Record<string, { icon: string; color: string; bg: string }> = {
  "Move In": { icon: "ri-login-box-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  "Routine Inspection": { icon: "ri-refresh-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  "Mid-Term Inspection": { icon: "ri-calendar-check-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  "Move Out": { icon: "ri-logout-box-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
};

export const statusConfig: Record<string, { badge: string; dot: string; icon: string }> = {
  Scheduled: { badge: "bg-[#3B82F6]/10 text-[#3B82F6]", dot: "bg-[#3B82F6]", icon: "ri-calendar-line" },
  "In Progress": { badge: "bg-[#F59E0B]/10 text-[#F59E0B]", dot: "bg-[#F59E0B]", icon: "ri-time-line" },
  Completed: { badge: "bg-[#10B981]/10 text-[#10B981]", dot: "bg-[#10B981]", icon: "ri-check-double-line" },
  Cancelled: { badge: "bg-[#EF4444]/10 text-[#EF4444]", dot: "bg-[#EF4444]", icon: "ri-close-line" },
};

export const ratingConfig: Record<string, { color: string; bg: string }> = {
  Excellent: { color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  Good: { color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  Fair: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  Poor: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  "—": { color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10" },
};

export const severityConfig: Record<string, { color: string; bg: string }> = {
  Low: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  Medium: { color: "text-[#F97316]", bg: "bg-[#F97316]/10" },
  High: { color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
};