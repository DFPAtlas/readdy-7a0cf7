export interface ContractorPerformance {
  id: string;
  contractor_id: string | null;
  business_name: string;
  trade: string;
  jobs_completed: number;
  jobs_cancelled: number;
  total_jobs: number;
  average_completion_days: number;
  average_response_hours: number;
  rating: number;
  review_count: number;
  last_job_date: string | null;
  quality_score: number;
  speed_score: number;
  reliability_score: number;
  documentation_score: number;
  combined_score: number;
  invoice_accuracy_rate: number;
  on_time_rate: number;
  repeat_business_rate: number;
  emergency_response_time_hours: number | null;
}

export interface PerformanceSummary {
  totalContractors: number;
  activeContractors: number;
  avgCombinedScore: number;
  totalJobsCompleted: number;
  contractsFlagged: number;
  highestRated: string;
}

export const tradeIconMap: Record<string, string> = {
  "Electrician": "ri-flashlight-line",
  "Electrical": "ri-flashlight-line",
  "Plumber": "ri-drop-line",
  "Gas Engineer": "ri-fire-line",
  "Locksmith": "ri-key-2-line",
  "Roofer": "ri-home-3-line",
  "Builder": "ri-hammer-line",
  "Handyman": "ri-tools-line",
  "Decorator": "ri-paint-brush-line",
  "Cleaner": "ri-shining-line",
  "Inventory Clerk": "ri-clipboard-line",
  "EPC Assessor": "ri-file-chart-line",
  "EICR Contractor": "ri-shield-flash-line",
  "Fire Safety Contractor": "ri-alarm-warning-line",
  "Damp & Mould Specialist": "ri-contrast-drop-line",
};

export const tradeColorMap: Record<string, string> = {
  "Electrician": "#F59E0B",
  "Electrical": "#F59E0B",
  "Plumber": "#3B82F6",
  "Gas Engineer": "#EF4444",
  "Locksmith": "#6B7280",
  "Roofer": "#D97706",
  "Builder": "#F97316",
  "Handyman": "#14B8A6",
  "Decorator": "#8B5CF6",
  "Cleaner": "#22C55E",
  "Inventory Clerk": "#6366F1",
  "EPC Assessor": "#0EA5E9",
  "EICR Contractor": "#7C3AED",
  "Fire Safety Contractor": "#DC2626",
  "Damp & Mould Specialist": "#0891B2",
};

export const scoreLabelConfig: Record<string, { label: string; icon: string }> = {
  quality_score: { label: "Quality", icon: "ri-star-line" },
  speed_score: { label: "Speed", icon: "ri-speed-line" },
  reliability_score: { label: "Reliability", icon: "ri-shield-check-line" },
  documentation_score: { label: "Documentation", icon: "ri-file-text-line" },
};

export function getScoreColor(score: number): string {
  if (score >= 90) return "#10B981";
  if (score >= 80) return "#3B82F6";
  if (score >= 70) return "#F59E0B";
  if (score >= 60) return "#F97316";
  return "#EF4444";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-[#10B981]/10 text-[#10B981]";
  if (score >= 80) return "bg-[#3B82F6]/10 text-[#3B82F6]";
  if (score >= 70) return "bg-[#F59E0B]/10 text-[#F59E0B]";
  if (score >= 60) return "bg-[#F97316]/10 text-[#F97316]";
  return "bg-[#EF4444]/10 text-[#EF4444]";
}

export function getScoreRingColor(score: number): string {
  if (score >= 90) return "#10B981";
  if (score >= 80) return "#3B82F6";
  if (score >= 70) return "#F59E0B";
  if (score >= 60) return "#F97316";
  return "#EF4444";
}

export function getScoreTier(score: number): string {
  if (score >= 90) return "Elite";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  return "Needs Review";
}