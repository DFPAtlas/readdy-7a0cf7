// Room checklists offered when adding a room to an inspection.

export type RoomTemplate = {
  id: string;
  name: string;
  icon: string;
  items: string[];
};

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "living-room",
    name: "Living Room",
    icon: "ri-sofa-line",
    items: [
      "Walls & ceilings", "Flooring & skirting", "Windows & locks",
      "Light fittings", "Smoke alarm", "Heating & radiators",
      "Curtains & blinds", "Electrical sockets", "Furniture condition",
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "ri-knife-line",
    items: [
      "Cupboards & drawers", "Worktops", "Sink & taps",
      "Oven & hob", "Extractor fan", "Fridge/freezer",
      "Dishwasher", "Washing machine", "Flooring",
      "Tiling & splashback", "Lighting", "Plumbing leaks",
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    icon: "ri-hotel-bed-line",
    items: [
      "Walls & ceilings", "Flooring & carpets", "Windows & locks",
      "Light fittings", "Radiator", "Wardrobe doors",
      "Electrical sockets", "Furniture condition", "Damp or mould",
    ],
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: "ri-drop-line",
    items: [
      "Bath & shower", "Shower screen seal", "Toilet flush & seat",
      "Sink & taps", "Sealant & grout", "Extractor fan",
      "Tiling condition", "Damp or mould", "Towel rail",
      "Mirror condition", "Flooring", "Water pressure",
    ],
  },
  {
    id: "hallway",
    name: "Hallway & Stairs",
    icon: "ri-door-open-line",
    items: [
      "Walls & ceilings", "Flooring", "Light fittings",
      "Doors & handles", "Smoke alarm", "Skirting boards",
      "Staircase & banister", "Electrical sockets",
    ],
  },
  {
    id: "garden",
    name: "Garden",
    icon: "ri-plant-line",
    items: [
      "Fencing & boundaries", "Lawn condition", "Patio & paving",
      "Shed condition", "Gates & locks", "Drainage",
      "Trees & shrubs", "Rubbish & debris", "External lighting",
    ],
  },
  {
    id: "exterior",
    name: "Exterior",
    icon: "ri-building-line",
    items: [
      "Roof condition", "Gutters & downpipes", "Walls & brickwork",
      "Windows & frames", "Front door & locks", "Driveway & paths",
      "External paintwork", "Drains", "Bins & bin store",
    ],
  },
  {
    id: "utility",
    name: "Utility Room",
    icon: "ri-t-shirt-line",
    items: [
      "Walls & flooring", "Washing machine", "Tumble dryer",
      "Sink & taps", "Cupboards", "Lighting",
      "Plumbing leaks", "Ventilation",
    ],
  },
  {
    id: "loft",
    name: "Loft / Attic",
    icon: "ri-home-up-line",
    items: [
      "Insulation condition", "Roof timbers", "Damp or leaks",
      "Ventilation", "Lighting", "Access hatch",
      "Pest evidence", "Storage condition",
    ],
  },
  {
    id: "boiler",
    name: "Boiler & Safety",
    icon: "ri-fire-line",
    items: [
      "Boiler condition", "Pressure gauge", "Thermostat working",
      "Timer/programmer", "Radiators heat up", "Carbon monoxide alarm",
      "Smoke alarms tested", "Flue & ventilation", "Consumer unit (fuse box)",
    ],
  },
];

export function templateFor(id: string | null | undefined): RoomTemplate | undefined {
  return ROOM_TEMPLATES.find((t) => t.id === id);
}
