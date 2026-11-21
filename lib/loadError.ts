/**
 * Report that a page failed to load some of its data.
 *
 * Pages used to destructure only `data` from Supabase queries, so a failed
 * query (network drop, expired session, RLS denial) looked exactly like an
 * empty account. Calling this shows the shared LoadErrorBanner instead.
 * It is a plain function, not a hook, so it can be called from any effect or
 * callback without becoming a dependency.
 */
export const LOAD_ERROR_EVENT = "lethub:load-error";

export interface LoadErrorDetail {
  source: string;
  message: string;
}

export function reportLoadError(source: string, error: { message?: string } | null | undefined): void {
  if (!error) return;
  const message = error.message || "Unknown error";
  console.error(`[load-error] ${source}: ${message}`);
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LoadErrorDetail>(LOAD_ERROR_EVENT, { detail: { source, message } }));
}
