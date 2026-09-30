import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Browser Supabase client. Uses ONLY the publishable (anon) key; all privileged
 * access is enforced by Row Level Security in the database. Returns null when the
 * app is not configured so placeholder routes still render locally.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = supabase !== null
