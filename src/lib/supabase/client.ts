import { createBrowserClient } from '@supabase/ssr'

// Browser client — RLS applies to every query automatically.
// Returns null until Supabase envs are configured so UI can render
// in preview mode without a backend.
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createBrowserClient(url, anonKey)
}
