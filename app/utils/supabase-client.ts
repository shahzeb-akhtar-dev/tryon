import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient() {
  if (!client) {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl as string
    const supabaseAnonKey = config.public.supabaseAnonKey as string

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase client credentials not configured')
    }

    client = createClient(supabaseUrl, supabaseAnonKey)
  }

  return client
}
