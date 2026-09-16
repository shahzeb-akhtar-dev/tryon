export {}

declare module '#app' {
  interface NuxtApp {
    $supabase: import('@supabase/supabase-js').SupabaseClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: import('@supabase/supabase-js').SupabaseClient
  }
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    supabaseUrl: string
    supabaseAnonKey: string
  }
}
