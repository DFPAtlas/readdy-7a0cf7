export interface TimelineEvent {
  id: string;
  type: string;
  category: string;
  propertyName: string;
  propertyId: string;
  date: string;
  daysFromNow: number;
  status: "valid" | "expiring" | "expired" | "completed";
  icon: string;
  color: string;
}

export interface MonthColumn {
  month: string;
  label: string;
  events: TimelineEvent[];
}

const complianceTypeIcons: Record<string, string> = {
  "Gas Safety Certificate": "ri-fire-line",
  "EICR Report": "ri-flashlight-line",
  "EPC Certificate": "ri-leaf-line",
  "Legionella Assessment": "ri-drop-line",
  "Smoke Alarm Check": "ri-alarm-warning-line",
  "Carbon Monoxide Check": "ri-sensor-line",
  "Fire Risk Assessment": "ri-fire-line",
  "Building Insurance": "ri-shield-check-line",
  "HMO Compliance": "ri-building-line",
};

const complianceTypeColors: Record<string, string> = {
  "Gas Safety Certificate": "bg-[#EF4444]",
  "EICR Report": "bg-[#F59E0B]",
  "EPC Certificate": "bg-[#10B981]",
  "Legionella Assessment": "bg-[#3B82F6]",
  "Smoke Alarm Check": "bg-[#EF4444]",
  "Carbon Monoxide Check": "bg-[#EF4444]",
  "Fire Risk Assessment": "bg-[#EF4444]",
  "Building Insurance": "bg-[#8B5CF6]",
  "HMO Compliance": "bg-[#8B5CF6]",
};

export const timelinePropertyFilter = ["All Properties", "Rose Court Flat 2A", "Riverside Court", "Maple Gardens House"];

export const timelineCategories = [
  { key: "all", label: "All Types" },
  { key: "gas", label: "Gas Safety" },
  { key: "epc", label: "EPC" },
  { key: "eicr", label: "EICR" },
  { key: "smoke", label: "Smoke Alarms" },
  { key: "co", label: "CO Alarms" },
  { key: "inspections", label: "Inspections" },
];

export function generateTimelineMonths(): MonthColumn[] {
  const months: MonthColumn[] = [];
  const monthNames = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  for (let i = 0; i < 12; i++) {
    months.push({ month: `2026-${String(i + 7).padStart(2, "0")}`, label: monthNames[i], events: [] });
  }

  const rawEvents: TimelineEvent[] = [
    {
      id: "t1", type: "Gas Safety Certificate", category: "gas", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "12 Mar 2027", daysFromNow: 258, status: "valid", icon: complianceTypeIcons["Gas Safety Certificate"], color: complianceTypeColors["Gas Safety Certificate"],
    },
    {
      id: "t2", type: "EICR Report", category: "eicr", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "18 Jun 2027", daysFromNow: 356, status: "valid", icon: complianceTypeIcons["EICR Report"], color: complianceTypeColors["EICR Report"],
    },
    {
      id: "t3", type: "Smoke Alarm Check", category: "smoke", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "01 Jul 2026", daysFromNow: 4, status: "expiring", icon: complianceTypeIcons["Smoke Alarm Check"], color: complianceTypeColors["Smoke Alarm Check"],
    },
    {
      id: "t4", type: "Carbon Monoxide Check", category: "co", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "12 Mar 2027", daysFromNow: 258, status: "valid", icon: complianceTypeIcons["Carbon Monoxide Check"], color: complianceTypeColors["Carbon Monoxide Check"],
    },
    {
      id: "t5", type: "Building Insurance", category: "insurance", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "01 Jul 2026", daysFromNow: 4, status: "expiring", icon: complianceTypeIcons["Building Insurance"], color: complianceTypeColors["Building Insurance"],
    },
    {
      id: "t6", type: "Fire Risk Assessment", category: "fire", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "30 Sep 2026", daysFromNow: 95, status: "valid", icon: complianceTypeIcons["Fire Risk Assessment"], color: complianceTypeColors["Fire Risk Assessment"],
    },
    {
      id: "t7", type: "Routine Inspection", category: "inspections", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "20 Jun 2026", daysFromNow: -7, status: "completed", icon: "ri-clipboard-line", color: "bg-[#10B981]",
    },
    {
      id: "t8", type: "Gas Safety Certificate", category: "gas", propertyName: "Riverside Court", propertyId: "p2",
      date: "20 Nov 2026", daysFromNow: 146, status: "valid", icon: complianceTypeIcons["Gas Safety Certificate"], color: complianceTypeColors["Gas Safety Certificate"],
    },
    {
      id: "t9", type: "EICR Report", category: "eicr", propertyName: "Riverside Court", propertyId: "p2",
      date: "10 Apr 2026", daysFromNow: -78, status: "expired", icon: complianceTypeIcons["EICR Report"], color: complianceTypeColors["EICR Report"],
    },
    {
      id: "t10", type: "Smoke Alarm Check", category: "smoke", propertyName: "Riverside Court", propertyId: "p2",
      date: "05 May 2026", daysFromNow: -53, status: "expired", icon: complianceTypeIcons["Smoke Alarm Check"], color: complianceTypeColors["Smoke Alarm Check"],
    },
    {
      id: "t11", type: "Legionella Assessment", category: "water", propertyName: "Riverside Court", propertyId: "p2",
      date: "15 Jun 2026", daysFromNow: -12, status: "expiring", icon: complianceTypeIcons["Legionella Assessment"], color: complianceTypeColors["Legionella Assessment"],
    },
    {
      id: "t12", type: "Carbon Monoxide Check", category: "co", propertyName: "Riverside Court", propertyId: "p2",
      date: "20 Nov 2026", daysFromNow: 146, status: "valid", icon: complianceTypeIcons["Carbon Monoxide Check"], color: complianceTypeColors["Carbon Monoxide Check"],
    },
    {
      id: "t13", type: "Mid-Term Inspection", category: "inspections", propertyName: "Riverside Court", propertyId: "p2",
      date: "15 Jan 2027", daysFromNow: 202, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
    },
    {
      id: "t14", type: "Gas Safety Certificate", category: "gas", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "25 Dec 2025", daysFromNow: -184, status: "expired", icon: complianceTypeIcons["Gas Safety Certificate"], color: complianceTypeColors["Gas Safety Certificate"],
    },
    {
      id: "t15", type: "EPC Certificate", category: "epc", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "02 Jan 2026", daysFromNow: -176, status: "expired", icon: complianceTypeIcons["EPC Certificate"], color: complianceTypeColors["EPC Certificate"],
    },
    {
      id: "t16", type: "Carbon Monoxide Check", category: "co", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "25 Dec 2025", daysFromNow: -184, status: "expired", icon: complianceTypeIcons["Carbon Monoxide Check"], color: complianceTypeColors["Carbon Monoxide Check"],
    },
    {
      id: "t17", type: "EICR Report", category: "eicr", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "14 Feb 2028", daysFromNow: 597, status: "valid", icon: complianceTypeIcons["EICR Report"], color: complianceTypeColors["EICR Report"],
    },
    {
      id: "t18", type: "Smoke Alarm Check", category: "smoke", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "08 Apr 2027", daysFromNow: 285, status: "valid", icon: complianceTypeIcons["Smoke Alarm Check"], color: complianceTypeColors["Smoke Alarm Check"],
    },
    {
      id: "t19", type: "Move Out Inspection", category: "inspections", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "12 Mar 2026", daysFromNow: -107, status: "completed", icon: "ri-logout-box-line", color: "bg-[#8B5CF6]",
    },
    {
      id: "t20", type: "Routine Inspection", category: "inspections", propertyName: "Rose Court Flat 2A", propertyId: "p1",
      date: "20 Sep 2026", daysFromNow: 85, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
    },
    {
      id: "t21", type: "Routine Inspection", category: "inspections", propertyName: "Riverside Court", propertyId: "p2",
      date: "15 Oct 2026", daysFromNow: 110, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
    },
    {
      id: "t22", type: "Routine Inspection", category: "inspections", propertyName: "Maple Gardens House", propertyId: "p3",
      date: "18 Dec 2026", daysFromNow: 174, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
    },
  ];

  return months;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: "t1", type: "Gas Safety Certificate", category: "gas", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "12 Mar 2027", daysFromNow: 258, status: "valid", icon: "ri-fire-line", color: "bg-[#EF4444]",
  },
  {
    id: "t2", type: "EICR Report", category: "eicr", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "18 Jun 2027", daysFromNow: 356, status: "valid", icon: "ri-flashlight-line", color: "bg-[#F59E0B]",
  },
  {
    id: "t3", type: "Smoke Alarm Check", category: "smoke", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "01 Jul 2026", daysFromNow: 4, status: "expiring", icon: "ri-alarm-warning-line", color: "bg-[#EF4444]",
  },
  {
    id: "t4", type: "Carbon Monoxide Check", category: "co", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "12 Mar 2027", daysFromNow: 258, status: "valid", icon: "ri-sensor-line", color: "bg-[#EF4444]",
  },
  {
    id: "t5", type: "Building Insurance", category: "insurance", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "01 Jul 2026", daysFromNow: 4, status: "expiring", icon: "ri-shield-check-line", color: "bg-[#8B5CF6]",
  },
  {
    id: "t6", type: "Fire Risk Assessment", category: "fire", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "30 Sep 2026", daysFromNow: 95, status: "valid", icon: "ri-fire-line", color: "bg-[#EF4444]",
  },
  {
    id: "t7", type: "Routine Inspection", category: "inspections", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "20 Jun 2026", daysFromNow: -7, status: "completed", icon: "ri-clipboard-line", color: "bg-[#10B981]",
  },
  {
    id: "t8", type: "Gas Safety Certificate", category: "gas", propertyName: "Riverside Court", propertyId: "p2",
    date: "20 Nov 2026", daysFromNow: 146, status: "valid", icon: "ri-fire-line", color: "bg-[#EF4444]",
  },
  {
    id: "t9", type: "EICR Report", category: "eicr", propertyName: "Riverside Court", propertyId: "p2",
    date: "10 Apr 2026", daysFromNow: -78, status: "expired", icon: "ri-flashlight-line", color: "bg-[#F59E0B]",
  },
  {
    id: "t10", type: "Smoke Alarm Check", category: "smoke", propertyName: "Riverside Court", propertyId: "p2",
    date: "05 May 2026", daysFromNow: -53, status: "expired", icon: "ri-alarm-warning-line", color: "bg-[#EF4444]",
  },
  {
    id: "t11", type: "Legionella Assessment", category: "water", propertyName: "Riverside Court", propertyId: "p2",
    date: "15 Jun 2026", daysFromNow: -12, status: "expiring", icon: "ri-drop-line", color: "bg-[#3B82F6]",
  },
  {
    id: "t12", type: "Carbon Monoxide Check", category: "co", propertyName: "Riverside Court", propertyId: "p2",
    date: "20 Nov 2026", daysFromNow: 146, status: "valid", icon: "ri-sensor-line", color: "bg-[#EF4444]",
  },
  {
    id: "t13", type: "Mid-Term Inspection", category: "inspections", propertyName: "Riverside Court", propertyId: "p2",
    date: "15 Jan 2027", daysFromNow: 202, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
  },
  {
    id: "t14", type: "Gas Safety Certificate", category: "gas", propertyName: "Maple Gardens House", propertyId: "p3",
    date: "25 Dec 2025", daysFromNow: -184, status: "expired", icon: "ri-fire-line", color: "bg-[#EF4444]",
  },
  {
    id: "t15", type: "EPC Certificate", category: "epc", propertyName: "Maple Gardens House", propertyId: "p3",
    date: "02 Jan 2026", daysFromNow: -176, status: "expired", icon: "ri-leaf-line", color: "bg-[#10B981]",
  },
  {
    id: "t16", type: "Carbon Monoxide Check", category: "co", propertyName: "Maple Gardens House", propertyId: "p3",
    date: "25 Dec 2025", daysFromNow: -184, status: "expired", icon: "ri-sensor-line", color: "bg-[#EF4444]",
  },
  {
    id: "t17", type: "Smoke Alarm Check", category: "smoke", propertyName: "Maple Gardens House", propertyId: "p3",
    date: "08 Apr 2027", daysFromNow: 285, status: "valid", icon: "ri-alarm-warning-line", color: "bg-[#EF4444]",
  },
  {
    id: "t19", type: "Routine Inspection", category: "inspections", propertyName: "Rose Court Flat 2A", propertyId: "p1",
    date: "20 Sep 2026", daysFromNow: 85, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
  },
  {
    id: "t20", type: "Routine Inspection", category: "inspections", propertyName: "Riverside Court", propertyId: "p2",
    date: "15 Oct 2026", daysFromNow: 110, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
  },
  {
    id: "t21", type: "Routine Inspection", category: "inspections", propertyName: "Maple Gardens House", propertyId: "p3",
    date: "18 Dec 2026", daysFromNow: 174, status: "valid", icon: "ri-clipboard-line", color: "bg-[#3B82F6]",
  },
];

export const statusStyles: Record<string, string> = {
  valid: "bg-[#10B981]/10 text-[#10B981]",
  expiring: "bg-[#F59E0B]/10 text-[#F59E0B]",
  expired: "bg-[#EF4444]/10 text-[#EF4444]",
  completed: "bg-[#3B82F6]/10 text-[#3B82F6]",
};

export const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  gas: { bg: "bg-[#FEF2F2]", text: "text-[#EF4444]", dot: "bg-[#EF4444]" },
  epc: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]", dot: "bg-[#10B981]" },
  eicr: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  smoke: { bg: "bg-[#EFF6FF]", text: "text-[#3B82F6]", dot: "bg-[#3B82F6]" },
  co: { bg: "bg-[#FDF2F8]", text: "text-[#EC4899]", dot: "bg-[#EC4899]" },
  inspections: { bg: "bg-[#F0FDF4]", text: "text-[#10B981]", dot: "bg-[#10B981]" },
};