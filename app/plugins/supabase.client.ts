import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not configured')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  return {
    provide: { supabase },
  }
})
