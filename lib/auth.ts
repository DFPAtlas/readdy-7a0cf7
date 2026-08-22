export const LOGIN_PATH = "/login";
export const UNAUTHORISED_PATH = "/unauthorised";
export const SUSPENDED_PATH = "/account/suspended";

export function safeInternalPath(value: string | null | undefined): string {
  if (!value) return "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  if (
    value.startsWith("/auth") ||
    value.startsWith("/login") ||
    value.startsWith("/register") ||
    value.startsWith("/unauthorised") ||
    value.startsWith("/account/suspended")
  ) {
    return "";
  }
  return value;
}