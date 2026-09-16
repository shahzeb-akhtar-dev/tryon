export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const authStore = useAuthStore()
    authStore.loadFromStorage()

    const { getSupabaseClient } = await import('~/utils/supabase-client')
    const supabase = getSupabaseClient()

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (!authStore.token) {
          try {
            const response = await $fetch<{ success: boolean; user: any; idToken: string }>('/api/auth/google', {
              method: 'POST',
              body: { idToken: session.access_token },
            })
            if (response.success && response.user) {
              authStore.setSession(response.user, session.access_token, session.refresh_token)
            }
          } catch {
          }
        }
      } else if (event === 'SIGNED_OUT') {
        authStore.clearAuth()
      }
    })
  }
})
