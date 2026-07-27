export interface N8nAgent {
  id: string;
  agent_key: string;
  agent_name: string;
  agent_group: string;
  description: string | null;
  n8n_workflow_id: string | null;
  n8n_webhook_url: string | null;
  status: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  records_processed: number;
  average_run_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface N8nAgentRun {
  id: string;
  agent_id: string;
  agent_key: string;
  run_status: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  records_found: number;
  records_processed: number;
  records_created: number;
  records_updated: number;
  error_message: string | null;
  output_summary: string | null;
  raw_output: any;
  created_at: string;
}

export interface AgentGroupMeta {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export const agentGroupMeta: Record<string, AgentGroupMeta> = {
  compliance: { label: "Compliance", icon: "ri-shield-check-line", color: "text-[#C28A78]", bg: "bg-[#C28A78]/5", border: "border-[#C28A78]/20" },
  maintenance: { label: "Maintenance", icon: "ri-tools-line", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/5", border: "border-[#3B82F6]/20" },
  inspections: { label: "Inspections", icon: "ri-clipboard-line", color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/5", border: "border-[#8B5CF6]/20" },
  communications: { label: "Communications", icon: "ri-message-3-line", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5", border: "border-[#F59E0B]/20" },
  portfolio: { label: "Portfolio", icon: "ri-building-4-line", color: "text-[#10B981]", bg: "bg-[#10B981]/5", border: "border-[#10B981]/20" },
  reporting: { label: "Reporting", icon: "ri-file-chart-line", color: "text-[#EC4899]", bg: "bg-[#EC4899]/5", border: "border-[#EC4899]/20" },
  administration: { label: "Administration", icon: "ri-admin-line", color: "text-[#64748B]", bg: "bg-[#64748B]/5", border: "border-[#64748B]/20" },
};

export const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  healthy: { label: "Healthy", color: "text-[#10B981]", bg: "bg-[#10B981]/10", dot: "bg-[#10B981]" },
  running: { label: "Running", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", dot: "bg-[#3B82F6]" },
  idle: { label: "Idle", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", dot: "bg-[#94A3B8]" },
  error: { label: "Error", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", dot: "bg-[#EF4444]" },
  disabled: { label: "Disabled", color: "text-[#78716C]", bg: "bg-[#78716C]/10", dot: "bg-[#78716C]" },
};

export function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const groupOrder = [
  "compliance", "maintenance", "inspections",
  "communications", "portfolio", "reporting", "administration",
];

export const EDGE_FUNCTION_URL = "https://gejxrnreuafnyzwrchvy.supabase.co/functions/v1/n8n-run-agent";