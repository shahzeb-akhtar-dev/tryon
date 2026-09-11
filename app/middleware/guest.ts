export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  const token = sessionStorage.getItem("auth_token")
  
  if (token) {
    try {
      const response = await $fetch<{ success: boolean; user: any }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.success && response.user) {
        return navigateTo("/")
      }
    } catch (error) {
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_refresh_token")
    }
  }
})
