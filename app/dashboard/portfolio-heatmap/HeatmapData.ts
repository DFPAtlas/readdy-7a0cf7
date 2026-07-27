export interface HeatmapProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  healthScore: number;
  healthLevel: "green" | "amber" | "red";
  complianceHealth: number;
  maintenanceHealth: number;
  rentHealth: number;
  inspectionHealth: number;
  rentAmount: number;
  tenant: string;
  status: string;
}

export const healthLevelConfig: Record<string, { bg: string; text: string; dot: string; label: string; description: string }> = {
  green: { bg: "bg-[#ECFDF5]", text: "text-[#059669]", dot: "bg-[#10B981]", label: "Healthy", description: "All metrics within acceptable range" },
  amber: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", dot: "bg-[#F59E0B]", label: "Needs Attention", description: "One or more metrics require action" },
  red: { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#EF4444]", label: "Urgent", description: "Critical issues require immediate action" },
};

const propertyImages = [
  "https://readdy.ai/api/search-image?query=Modern%20UK%20residential%20apartment%20building%20exterior%2C%20brick%20and%20glass%20facade%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%20with%20muted%20colours%2C%20soft%20daylight&width=400&height=300&seq=heat-prop-1&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Contemporary%20riverside%20apartment%20building%20UK%2C%20waterfront%20residential%20complex%2C%20professional%20architectural%20photography%2C%20clean%20simple%20background&width=400&height=300&seq=heat-prop-2&orientation=landscape",
  "https://readdy.ai/api/search-image?query=British%20semi-detached%20house%20exterior%2C%20brick%20and%20render%20facade%2C%20suburban%20street%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%2C%20natural%20light&width=400&height=300&seq=heat-prop-3&orientation=landscape",
  "https://readdy.ai/api/search-image?query=Modern%20UK%20terraced%20house%20row%2C%20Victorian%20style%20with%20white%20windows%2C%20clean%20street%20view%2C%20professional%20real%20estate%20photography%2C%20afternoon%20light&width=400&height=300&seq=heat-prop-4&orientation=landscape",
  "https://readdy.ai/api/search-image?query=New%20build%20UK%20apartment%20block%2C%20contemporary%20architecture%2C%20balconies%2C%20professional%20real%20estate%20photography%2C%20clean%20simple%20background%2C%20blue%20sky&width=400&height=300&seq=heat-prop-5&orientation=landscape",
  "https://readdy.ai/api/search-image?query=UK%20suburban%20semi-detached%20house%2C%20red%20brick%2C%20bay%20windows%2C%20well%20maintained%20front%20garden%2C%20professional%20property%20photography%2C%20natural%20daylight&width=400&height=300&seq=heat-prop-6&orientation=landscape",
];

export const heatmapProperties: HeatmapProperty[] = [
  {
    id: "p1", name: "Rose Court Flat 2A", address: "12 Rose Avenue", city: "London", postcode: "E1 6AN",
    healthScore: 68, healthLevel: "amber", complianceHealth: 72, maintenanceHealth: 65, rentHealth: 94, inspectionHealth: 70,
    rentAmount: 1850, tenant: "John Miller", status: "Occupied",
  },
  {
    id: "p2", name: "Riverside Court", address: "Unit 3, Riverside Court", city: "Bristol", postcode: "BS1 4ST",
    healthScore: 45, healthLevel: "amber", complianceHealth: 40, maintenanceHealth: 55, rentHealth: 88, inspectionHealth: 60,
    rentAmount: 1250, tenant: "Emily Watson", status: "Occupied",
  },
  {
    id: "p3", name: "Maple Gardens House", address: "34 Maple Gardens", city: "Cardiff", postcode: "CF10 3BZ",
    healthScore: 22, healthLevel: "red", complianceHealth: 15, maintenanceHealth: 50, rentHealth: 70, inspectionHealth: 40,
    rentAmount: 1600, tenant: "Michael Brown", status: "Occupied",
  },
  {
    id: "p4", name: "Flat 4B Oak Street", address: "Flat 4B, Oak Street", city: "Manchester", postcode: "M1 2AB",
    healthScore: 55, healthLevel: "amber", complianceHealth: 60, maintenanceHealth: 80, rentHealth: 45, inspectionHealth: 55,
    rentAmount: 950, tenant: "Sarah Jenkins", status: "Occupied",
  },
  {
    id: "p5", name: "8 The Crescent", address: "8 The Crescent", city: "Birmingham", postcode: "B2 3CD",
    healthScore: 48, healthLevel: "amber", complianceHealth: 85, maintenanceHealth: 30, rentHealth: 90, inspectionHealth: 50,
    rentAmount: 2200, tenant: "Lisa Chen", status: "Occupied",
  },
  {
    id: "p6", name: "55 Green Lane", address: "55 Green Lane", city: "Leeds", postcode: "LS6 2NX",
    healthScore: 82, healthLevel: "green", complianceHealth: 90, maintenanceHealth: 85, rentHealth: 95, inspectionHealth: 80,
    rentAmount: 800, tenant: "Tom Hughes", status: "Occupied",
  },
  {
    id: "p7", name: "15 Meadow Lane", address: "15 Meadow Lane", city: "London", postcode: "SW1 4AB",
    healthScore: 85, healthLevel: "green", complianceHealth: 88, maintenanceHealth: 90, rentHealth: 92, inspectionHealth: 85,
    rentAmount: 3200, tenant: "Rachel Green", status: "Occupied",
  },
  {
    id: "p8", name: "Park View Terrace", address: "7 Park View Terrace", city: "Bristol", postcode: "BS1 5TR",
    healthScore: 91, healthLevel: "green", complianceHealth: 95, maintenanceHealth: 92, rentHealth: 98, inspectionHealth: 90,
    rentAmount: 1400, tenant: "David Jones", status: "Occupied",
  },
  {
    id: "p9", name: "The Willows", address: "4 The Willows, Green Lane", city: "Leeds", postcode: "LS6 2NX",
    healthScore: 38, healthLevel: "red", complianceHealth: 25, maintenanceHealth: 60, rentHealth: 30, inspectionHealth: 45,
    rentAmount: 750, tenant: "Vacant", status: "Vacant",
  },
  {
    id: "p10", name: "72 Castle Gate", address: "72 Castle Gate", city: "Nottingham", postcode: "NG1 2AB",
    healthScore: 78, healthLevel: "green", complianceHealth: 82, maintenanceHealth: 78, rentHealth: 88, inspectionHealth: 75,
    rentAmount: 1050, tenant: "Anna Walker", status: "Occupied",
  },
];

export const heatmapSummary = {
  total: 10,
  green: 4,
  amber: 4,
  red: 2,
  averageHealth: 61,
  worstProperty: "Maple Gardens House",
  bestProperty: "Park View Terrace",
};

export function getHeatmapProperties(): HeatmapProperty[] {
  return heatmapProperties;
}