import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/** O modo ao vivo só existe com URL e service role configurados no servidor. */
export function isLiveConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

let client: SupabaseClient | null = null

/** Cliente com service_role. Só no servidor; nunca exponha a chave. */
export function admin(): SupabaseClient {
  if (!isLiveConfigured()) throw new Error("Supabase não configurado")
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
