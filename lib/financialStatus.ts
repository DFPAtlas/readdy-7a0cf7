export type PaymentStatus = "paid" | "due" | "overdue" | "partial" | "refunded" | "failed" | "waived"

export type ReconciliationStatus = "reconciled" | "unmatched" | "pending" | "matched" | "ignored"

export type ArrearsStage = "new" | "contact_required" | "payment_plan" | "broken_plan" | "escalated" | "awaiting_response" | "resolved" | "closed"

export type ArrearsRisk = "Low" | "Medium" | "High"

export interface PaymentStatusConfig {
  label: string
  color: string
  bg: string
  icon: string
  sortPriority: number
}

export interface ReconciliationStatusConfig {
  label: string
  color: string
  bg: string
  icon: string
}

export interface ArrearsStageConfig {
  label: string
  color: string
  bg: string
  icon: string
  sortPriority: number
  description: string
}

export const paymentStatusConfig: Record<PaymentStatus, PaymentStatusConfig> = {
  paid: { label: "Received", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10 text-[#7A9A7E]", icon: "ri-check-double-line", sortPriority: 1 },
  due: { label: "Expected", color: "#94A3B8", bg: "bg-[#94A3B8]/10 text-[#94A3B8]", icon: "ri-time-line", sortPriority: 4 },
  overdue: { label: "Overdue", color: "#C46868", bg: "bg-[#C46868]/10 text-[#C46868]", icon: "ri-alarm-warning-line", sortPriority: 2 },
  partial: { label: "Partial", color: "#F59E0B", bg: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-percent-line", sortPriority: 3 },
  refunded: { label: "Refunded", color: "#8B5CF6", bg: "bg-[#8B5CF6]/10 text-[#8B5CF6]", icon: "ri-arrow-go-back-line", sortPriority: 6 },
  failed: { label: "Failed", color: "#EF4444", bg: "bg-[#EF4444]/10 text-[#EF4444]", icon: "ri-close-circle-line", sortPriority: 5 },
  waived: { label: "Written Off", color: "#94A3B8", bg: "bg-[#94A3B8]/10 text-[#94A3B8]", icon: "ri-close-circle-line", sortPriority: 7 },
}

export const reconciliationStatusConfig: Record<ReconciliationStatus, ReconciliationStatusConfig> = {
  reconciled: { label: "Reconciled", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10 text-[#7A9A7E]", icon: "ri-check-double-line" },
  unmatched: { label: "Unmatched", color: "#C46868", bg: "bg-[#C46868]/10 text-[#C46868]", icon: "ri-error-warning-line" },
  pending: { label: "Pending", color: "#F59E0B", bg: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-time-line" },
  matched: { label: "Matched", color: "#3B82F6", bg: "bg-[#3B82F6]/10 text-[#3B82F6]", icon: "ri-link" },
  ignored: { label: "Ignored", color: "#94A3B8", bg: "bg-[#94A3B8]/10 text-[#94A3B8]", icon: "ri-eye-off-line" },
}

export const arrearsStageConfig: Record<ArrearsStage, ArrearsStageConfig> = {
  new: { label: "New", color: "#C46868", bg: "bg-[#C46868]/10 text-[#C46868]", icon: "ri-alarm-warning-line", sortPriority: 1, description: "Newly identified arrears case" },
  contact_required: { label: "Contact Required", color: "#F59E0B", bg: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-phone-line", sortPriority: 2, description: "Tenant needs to be contacted" },
  payment_plan: { label: "Payment Plan", color: "#3B82F6", bg: "bg-[#3B82F6]/10 text-[#3B82F6]", icon: "ri-calendar-schedule-line", sortPriority: 3, description: "Active payment arrangement" },
  broken_plan: { label: "Broken Plan", color: "#C46868", bg: "bg-[#C46868]/10 text-[#C46868]", icon: "ri-error-warning-line", sortPriority: 2, description: "Payment plan not being met" },
  escalated: { label: "Escalated", color: "#7C3AED", bg: "bg-[#7C3AED]/10 text-[#7C3AED]", icon: "ri-arrow-up-circle-line", sortPriority: 1, description: "Escalated for legal review" },
  awaiting_response: { label: "Awaiting Response", color: "#F59E0B", bg: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: "ri-chat-3-line", sortPriority: 3, description: "Waiting for tenant reply" },
  resolved: { label: "Resolved", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10 text-[#7A9A7E]", icon: "ri-check-line", sortPriority: 5, description: "Arrears cleared" },
  closed: { label: "Closed", color: "#94A3B8", bg: "bg-[#94A3B8]/10 text-[#94A3B8]", icon: "ri-archive-line", sortPriority: 6, description: "Case closed" },
}

export const arrearsRiskConfig: Record<ArrearsRisk, { label: string; color: string; bg: string; icon: string; border: string; badge: string; text: string }> = {
  Low: { label: "Low Risk", color: "#7A9A7E", bg: "bg-[#7A9A7E]/10", icon: "ri-shield-check-line", border: "border-[#7A9A7E]/20", badge: "bg-[#7A9A7E]/10 text-[#7A9A7E]", text: "text-[#7A9A7E]" },
  Medium: { label: "Medium Risk", color: "#F59E0B", bg: "bg-[#F59E0B]/10", icon: "ri-alert-line", border: "border-[#F59E0B]/20", badge: "bg-[#F59E0B]/10 text-[#F59E0B]", text: "text-[#F59E0B]" },
  High: { label: "High Risk", color: "#C46868", bg: "bg-[#C46868]/10", icon: "ri-alarm-warning-line", border: "border-[#C46868]/20", badge: "bg-[#C46868]/10 text-[#C46868]", text: "text-[#C46868]" },
}

export interface FinancialActionItem {
  id: string
  priority: "urgent" | "high" | "medium"
  tenant: string
  property: string
  amount: number
  issue: string
  ageLabel: string
  action: string
  actionLink?: string
}

export const FINANCIAL_ACCURACY_DISCLAIMER = "Payment information is based on confirmed bank and payment-provider data. Expected amounts are estimates until reconciled."