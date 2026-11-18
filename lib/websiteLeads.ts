"use client";

import { supabase } from "@/lib/supabaseClient";

export interface WebsiteLeadInput {
  formType: "contact" | "demo";
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  reason?: string;
  propertiesCount?: string;
  message?: string;
  /** Hidden honeypot field; real visitors leave it empty. */
  website?: string;
}

/** Sends a marketing-site form submission to LetHub's own lead store. */
export async function submitWebsiteLead(input: WebsiteLeadInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("submit-website-lead", {
      body: {
        form_type: input.formType,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        reason: input.reason,
        properties_count: input.propertiesCount,
        message: input.message,
        website: input.website,
        source_page: typeof window !== "undefined" ? window.location.pathname : undefined,
      },
    });
    if (error || !data?.success) {
      let message = data?.error as string | undefined;
      const context = (error as { context?: Response } | null)?.context;
      if (!message && context && typeof context.json === "function") {
        try {
          message = (await context.json())?.error;
        } catch {
          // ignore non-JSON error bodies
        }
      }
      return { ok: false, error: message || "Something went wrong. Please try again or email support@lethub.uk." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again or email support@lethub.uk." };
  }
}
