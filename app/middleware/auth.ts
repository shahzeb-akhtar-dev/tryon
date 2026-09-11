export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    return
  }

  const token = sessionStorage.getItem("auth_token")
  
  if (!token) {
    return navigateTo("/login")
  }

  try {
    const response = await $fetch<{ success: boolean; user: any }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    if (!response.success || !response.user) {
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_refresh_token")
      return navigateTo("/login")
    }
  } catch (error) {
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("auth_refresh_token")
    return navigateTo("/login")
  }
})
