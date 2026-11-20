import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "./supabase/cookies";

// Browser Supabase client. Sessions live in cookies (split into chunks when
// large) so middleware can verify them server-side; see lib/supabase/middleware.ts.

let client: SupabaseClient<Database> | null = null;
let warned = false;

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "public-anon-key-placeholder";

function resolveConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) return { url, key };
  if (!warned && typeof window !== "undefined") {
    warned = true;
    console.warn(
      "Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
    );
  }
  return { url: FALLBACK_URL, key: FALLBACK_KEY };
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  const { url, key } = resolveConfig();

  client = createBrowserClient<Database>(url, key, {
    cookieOptions: {
      name: AUTH_COOKIE_NAME,
      path: "/",
      sameSite: "lax",
      secure: typeof window !== "undefined" ? window.location.protocol === "https:" : true,
      maxAge: AUTH_COOKIE_MAX_AGE,
    },
  }) as unknown as SupabaseClient<Database>;
  return client;
}

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const instance = getSupabaseClient() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    if (typeof value === "function") return value.bind(instance);
    return value ?? Reflect.get(instance, prop, receiver);
  },
  has(_target, prop) {
    return prop in (getSupabaseClient() as unknown as object);
  },
});