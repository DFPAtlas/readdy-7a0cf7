export interface N8NConfig {
  instanceUrl: string;
  apiKey: string;
  webhookBaseUrl: string;
}

export interface N8NAgent {
  id: string;
  agent_key: string;
  agent_name: string;
  agent_group: string;
  description: string;
  n8n_workflow_id: string;
  n8n_webhook_url: string | null;
  status: string;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  records_processed: number;
  average_run_seconds: number;
}

export interface N8NAgentRun {
  id: string;
  agent_id: string;
  agent_key: string;
  agent_name: string;
  agent_group: string;
  run_status: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number;
  records_found: number;
  records_processed: number;
  records_created: number;
  records_updated: number;
  error_message: string | null;
  output_summary: string | null;
}

export const n8nConfig: N8NConfig = {
  instanceUrl: "https://n8n.lethub.co",
  apiKey: "n8n_api_••••••••••••••••••••••••",
  webhookBaseUrl: "https://n8n.lethub.co/webhook",
};

export const groupMeta: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  compliance: { label: "Compliance", icon: "ri-shield-check-line", color: "#C28A78", bg: "bg-[#C28A78]/5" },
  maintenance: { label: "Maintenance", icon: "ri-tools-line", color: "#3B82F6", bg: "bg-[#3B82F6]/5" },
  inspections: { label: "Inspections", icon: "ri-clipboard-line", color: "#8B5CF6", bg: "bg-[#8B5CF6]/5" },
  communications: { label: "Comms", icon: "ri-message-3-line", color: "#F59E0B", bg: "bg-[#F59E0B]/5" },
  portfolio: { label: "Portfolio", icon: "ri-building-4-line", color: "#10B981", bg: "bg-[#10B981]/5" },
  reporting: { label: "Reporting", icon: "ri-file-chart-line", color: "#EC4899", bg: "bg-[#EC4899]/5" },
  administration: { label: "Admin", icon: "ri-admin-line", color: "#64748B", bg: "bg-[#64748B]/5" },
};

export const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  running: { label: "Running", dot: "bg-[#10B981]", text: "text-[#10B981]" },
  idle: { label: "Idle", dot: "bg-[#94A3B8]", text: "text-[#94A3B8]" },
  paused: { label: "Paused", dot: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
  error: { label: "Error", dot: "bg-[#EF4444]", text: "text-[#EF4444]" },
};

export const runStatusConfig: Record<string, { label: string; dot: string; text: string }> = {
  completed: { label: "Completed", dot: "bg-[#10B981]", text: "text-[#10B981]" },
  failed: { label: "Failed", dot: "bg-[#EF4444]", text: "text-[#EF4444]" },
  running: { label: "Running", dot: "bg-[#3B82F6]", text: "text-[#3B82F6]" },
  cancelled: { label: "Cancelled", dot: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
};

export const webhookEndpoints = [
  { name: "Compliance Monitor", endpoint: "/webhook/compliance-monitor", method: "POST" },
  { name: "Inspection Workflow", endpoint: "/webhook/inspection-workflow", method: "POST" },
  { name: "Maintenance Ticket", endpoint: "/webhook/maintenance-ticket", method: "POST" },
  { name: "Portfolio Risk", endpoint: "/webhook/portfolio-risk", method: "POST" },
  { name: "Report Builder", endpoint: "/webhook/report-builder", method: "POST" },
  { name: "Reminder & Alert", endpoint: "/webhook/reminder-alert", method: "POST" },
];