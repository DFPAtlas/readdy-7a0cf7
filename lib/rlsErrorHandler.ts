"use client";

import { PostgrestError } from "@supabase/supabase-js";

export interface RlsErrorResult {
  blocked: boolean;
  message: string;
  originalError: PostgrestError | null;
}

const RLS_ERROR_PATTERNS = [
  "new row violates row-level security",
  "violates row-level security policy",
  "permission denied",
  "policy",
  "security",
];

const USER_FRIENDLY_MESSAGES: Record<string, string> = {
  properties: "Your current plan does not allow adding more properties. Please upgrade or contact support.",
  documents: "Your trial has ended or your plan does not allow uploading documents. Please upgrade your plan.",
  portal_access: "Your trial has ended. Upgrade your plan to invite portal users.",
  portal_invites: "Your trial has ended. Upgrade your plan to send portal invitations.",
  inspections: "Your trial has ended. Upgrade your plan to schedule inspections.",
  maintenance_jobs: "Your trial has ended. Upgrade your plan to create maintenance jobs.",
  landlords: "Your trial has ended. Upgrade your plan to add landlords.",
  tenants: "Your trial has ended. Upgrade your plan to add tenants.",
  tenancies: "Your trial has ended. Upgrade your plan to create tenancies.",
  property_compliance_items: "Your trial has ended. Upgrade your plan to manage compliance records.",
  rent_payments: "Your trial has ended. Upgrade your plan to record payments.",
  arrears_cases: "Your trial has ended. Upgrade your plan to manage arrears cases.",
  quotes: "Your trial has ended. Upgrade your plan to manage quotes.",
  contractor_jobs: "Your trial has ended. Upgrade your plan to assign contractors.",
  signatures: "Your trial has ended. Upgrade your plan to manage signatures.",
  tenancy_parties: "Your trial has ended. Upgrade your plan to manage tenancy records.",
  property_financials: "Your trial has ended. Upgrade your plan to manage financial records.",
  quote_items: "Your trial has ended. Upgrade your plan to manage quote items.",
  inspection_rooms: "Your trial has ended. Upgrade your plan to record inspection details.",
  inspection_photos: "Your trial has ended. Upgrade your plan to upload inspection photos.",
  account_subscriptions: "You cannot modify subscription details directly. Please use the billing page to change your plan.",
  messages: "Your trial has ended. Upgrade your plan to send messages.",
  notifications: "Your trial has ended. Upgrade your plan.",
  profiles: "You cannot perform this action on your profile.",
  feature_usage: "You cannot modify feature usage data directly.",
  compliance_documents: "Your trial has ended. Upgrade your plan to upload compliance documents.",
};

const DEFAULT_BLOCKED_MESSAGE = "Your current plan does not allow this action. Please upgrade or contact support.";

export function isRlsError(error: PostgrestError): boolean {
  const msg = error.message.toLowerCase();
  const details = (error.details || "").toLowerCase();
  const combined = msg + " " + details;

  return RLS_ERROR_PATTERNS.some((pattern) => combined.includes(pattern));
}

export function handleRlsError(error: any, tableName?: string): RlsErrorResult {
  const pgError = error as PostgrestError;

  if (pgError && pgError.code && isRlsError(pgError)) {
    const message = tableName && USER_FRIENDLY_MESSAGES[tableName]
      ? USER_FRIENDLY_MESSAGES[tableName]
      : DEFAULT_BLOCKED_MESSAGE;

    return {
      blocked: true,
      message,
      originalError: pgError,
    };
  }

  return {
    blocked: false,
    message: "",
    originalError: null,
  };
}

export function showRlsError(error: any, tableName?: string): boolean {
  const result = handleRlsError(error, tableName);

  if (result.blocked) {
    alert(result.message);
    return true;
  }

  return false;
}