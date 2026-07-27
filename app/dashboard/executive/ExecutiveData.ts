export interface HealthMetric {
  label: string;
  score: number;
  maxScore: number;
  color: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  icon: string;
  details: { label: string; value: string; status: "good" | "warning" | "critical" }[];
}

export interface PortfolioSummary {
  totalProperties: number;
  occupied: number;
  vacant: number;
  occupancyRate: number;
  totalRentMonthly: number;
  rentCollectedThisMonth: number;
  rentOutstanding: number;
  arrearsTotal: number;
  arrearsCount: number;
}

export const executiveHealthMetrics: HealthMetric[] = [
  {
    label: "Compliance Health",
    score: 72,
    maxScore: 100,
    color: "#F59E0B",
    trend: "down",
    trendValue: "-5% vs last month",
    icon: "ri-shield-check-line",
    details: [
      { label: "Valid Certificates", value: "18 of 24", status: "good" },
      { label: "Expiring Soon", value: "6 certificates", status: "warning" },
      { label: "Expired", value: "5 certificates", status: "critical" },
      { label: "Compliant Properties", value: "3 of 8", status: "warning" },
    ],
  },
  {
    label: "Maintenance Health",
    score: 68,
    maxScore: 100,
    color: "#F59E0B",
    trend: "up",
    trendValue: "+8% vs last month",
    icon: "ri-tools-line",
    details: [
      { label: "Open Jobs", value: "9", status: "warning" },
      { label: "Urgent Jobs", value: "2", status: "critical" },
      { label: "Avg Response Time", value: "3.2h", status: "good" },
      { label: "Completed This Month", value: "14", status: "good" },
    ],
  },
  {
    label: "Rent Health",
    score: 85,
    maxScore: 100,
    color: "#10B981",
    trend: "stable",
    trendValue: "No change",
    icon: "ri-coins-line",
    details: [
      { label: "Collected This Month", value: "£11,250", status: "good" },
      { label: "Outstanding", value: "£2,850", status: "warning" },
      { label: "Arrears Cases", value: "3", status: "warning" },
      { label: "On-Time Payments", value: "87%", status: "good" },
    ],
  },
  {
    label: "Portfolio Health",
    score: 75,
    maxScore: 100,
    color: "#10B981",
    trend: "up",
    trendValue: "+3% vs last month",
    icon: "ri-building-4-line",
    details: [
      { label: "Occupancy Rate", value: "96%", status: "good" },
      { label: "Green Properties", value: "4", status: "good" },
      { label: "Amber Properties", value: "4", status: "warning" },
      { label: "Red Properties", value: "2", status: "critical" },
    ],
  },
];

export const portfolioSummary: PortfolioSummary = {
  totalProperties: 8,
  occupied: 7,
  vacant: 1,
  occupancyRate: 87.5,
  totalRentMonthly: 14100,
  rentCollectedThisMonth: 11250,
  rentOutstanding: 2850,
  arrearsTotal: 4850,
  arrearsCount: 3,
};

export const recentAlerts = [
  { id: "a1", type: "critical", title: "3 expired certificates at Maple Gardens House", time: "2 hours ago", icon: "ri-error-warning-line" },
  { id: "a2", type: "critical", title: "2 certificates expired at Riverside Court", time: "5 hours ago", icon: "ri-error-warning-line" },
  { id: "a3", type: "warning", title: "Rose Court Flat 2A: 3 certificates expiring within 30 days", time: "1 day ago", icon: "ri-alert-line" },
  { id: "a4", type: "warning", title: "Arrears alert: £2,850 outstanding across 3 tenancies", time: "1 day ago", icon: "ri-alert-line" },
  { id: "a5", type: "warning", title: "2 urgent maintenance jobs remain open", time: "2 days ago", icon: "ri-tools-line" },
  { id: "a6", type: "info", title: "Park View Terrace: All health metrics in green", time: "3 days ago", icon: "ri-check-line" },
  { id: "a7", type: "info", title: "8 The Crescent: Maintenance health declined to 30%", time: "4 days ago", icon: "ri-information-line" },
];

export const executivePropertyBreakdown = [
  { id: "p1", name: "Rose Court Flat 2A", health: 68, level: "amber", compliance: 72, maintenance: 65, rent: 94, inspections: 70, rentAmount: 1850 },
  { id: "p2", name: "Riverside Court", health: 45, level: "amber", compliance: 40, maintenance: 55, rent: 88, inspections: 60, rentAmount: 1250 },
  { id: "p3", name: "Maple Gardens House", health: 22, level: "red", compliance: 15, maintenance: 50, rent: 70, inspections: 40, rentAmount: 1600 },
  { id: "p4", name: "Flat 4B Oak Street", health: 55, level: "amber", compliance: 60, maintenance: 80, rent: 45, inspections: 55, rentAmount: 950 },
  { id: "p5", name: "8 The Crescent", health: 48, level: "amber", compliance: 85, maintenance: 30, rent: 90, inspections: 50, rentAmount: 2200 },
  { id: "p6", name: "55 Green Lane", health: 82, level: "green", compliance: 90, maintenance: 85, rent: 95, inspections: 80, rentAmount: 800 },
  { id: "p7", name: "15 Meadow Lane", health: 85, level: "green", compliance: 88, maintenance: 90, rent: 92, inspections: 85, rentAmount: 3200 },
  { id: "p8", name: "Park View Terrace", health: 91, level: "green", compliance: 95, maintenance: 92, rent: 98, inspections: 90, rentAmount: 1400 },
];