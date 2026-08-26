import { normaliseRole, type AppRole } from "./rbac";

const STORAGE_KEY = "letprop_impersonation";

export interface ImpersonationState {
  role: AppRole;
  targetUserId: string;
  targetName: string;
  realUserId: string;
  startedAt: string;
}

export function startImpersonation(state: ImpersonationState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — impersonation simply won't persist
  }
}

export function getImpersonation(): ImpersonationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const role = normaliseRole(parsed?.role);
    if (!role) return null;
    return {
      role,
      targetUserId: String(parsed?.targetUserId ?? ""),
      targetName: String(parsed?.targetName ?? ""),
      realUserId: String(parsed?.realUserId ?? ""),
      startedAt: String(parsed?.startedAt ?? ""),
    };
  } catch {
    return null;
  }
}

export function clearImpersonation(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}