import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { authCookieName, parseCookieHeader } from "./supabase/cookies";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function createCookieStorage() {
  return {
    getItem(key: string): string | null {
      if (typeof document === "undefined") return null;
      const cookies = parseCookieHeader(document.cookie);
      return cookies[authCookieName(key)] ?? null;
    },
    setItem(key: string, value: string): void {
      if (typeof document === "undefined") return;
      const name = authCookieName(key);
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    },
    removeItem(key: string): void {
      if (typeof document === "undefined") return;
      const name = authCookieName(key);
      document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
    },
  };
}

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file."
    );
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: createCookieStorage(),
    },
  });
  return client;
}

export const supabase: SupabaseClient<Database> = getSupabaseClient();