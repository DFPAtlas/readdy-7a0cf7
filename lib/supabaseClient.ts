import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "./supabase/cookies";

// Browser Supabase client. Sessions live in cookies (split into chunks when
// large) so middleware can verify them server-side; see lib/supabase/middleware.ts.

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file."
    );
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
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

export const supabase: SupabaseClient<Database> = getSupabaseClient();
