import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin() {
  if (!adminClient) {
    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl as string
    const supabaseServiceKey = config.supabaseServiceKey as string

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured')
    }

    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return adminClient
}

export async function verifySupabaseToken(accessToken: string) {
  const client = getSupabaseAdmin()
  const { data: { user }, error } = await client.auth.getUser(accessToken)

  if (error || !user) {
    throw new Error('Invalid or expired token')
  }

  return {
    uid: user.id,
    email: user.email || null,
  }
}
