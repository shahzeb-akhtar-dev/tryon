export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();

  if (import.meta.client && !authStore.isInitialized) {
    let attempts = 0;
    while (!authStore.isInitialized && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  if (authStore.isInitialized && authStore.isAuthenticated) {
    return navigateTo("/");
  }
});
