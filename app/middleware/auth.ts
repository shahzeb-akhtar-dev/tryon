export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) {
    return
  }

  const token = sessionStorage.getItem("auth_token")
  const userStr = sessionStorage.getItem("auth_user")
  
  if (!token || !userStr) {
    return navigateTo("/login")
  }

  const authStore = useAuthStore()
  if (!authStore.user || !authStore.token) {
    authStore.loadFromStorage()
  }
})
