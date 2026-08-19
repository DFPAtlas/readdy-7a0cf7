import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file."
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

let _supabase: ReturnType<typeof createClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = getSupabaseClient()
    }
    const value = _supabase[prop as keyof typeof _supabase]
    if (typeof value === "function") {
      return value.bind(_supabase)
    }
    return value
  },
  apply(_, __, args) {
    if (!_supabase) {
      _supabase = getSupabaseClient()
    }
    return (_supabase as any)(...args)
  },
})