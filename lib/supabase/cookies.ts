export const DEMO_COOKIE = "lethub_demo";

export function authCookieName(key: string): string {
  if (key.endsWith("-auth-token")) return "lethub-sb-auth-token";
  if (key.endsWith("-code-verifier")) return "lethub-sb-auth-token-code-verifier";
  return `lethub-${key.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function parseCookieHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep raw value */
    }
    if (key) result[key] = value;
  }
  return result;
}