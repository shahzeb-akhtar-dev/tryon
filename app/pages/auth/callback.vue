<script setup lang="ts">
import { getSupabaseClient } from '~/utils/supabase-client'

definePageMeta({
  layout: false,
})

const router = useRouter()
const errorMessage = ref('')

onMounted(async () => {
  try {
    const supabase = getSupabaseClient()

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      errorMessage.value = 'Authentication failed. Please try again.'
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    const accessToken = session.access_token
    const refreshToken = session.refresh_token

    const response = await $fetch<{ success: boolean; user: any; idToken: string; refreshToken?: string }>('/api/auth/google', {
      method: 'POST',
      body: { idToken: accessToken },
    })

    if (response.success && response.user) {
      const authStore = useAuthStore()
      authStore.setSession(response.user, accessToken, refreshToken)

      router.push('/')
    } else {
      errorMessage.value = 'Failed to complete sign-in.'
      setTimeout(() => router.push('/login'), 2000)
    }
  } catch (e: any) {
    console.error('OAuth callback error:', e)
    errorMessage.value = e?.data?.statusMessage || e?.message || 'Authentication failed.'
    setTimeout(() => router.push('/login'), 2000)
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-tertiary">
    <div class="text-center">
      <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
      <p v-if="!errorMessage" class="mt-4 text-md text-neutral font-primary">Completing sign-in...</p>
      <p v-else class="mt-4 text-md text-red-500 font-primary">{{ errorMessage }}</p>
    </div>
  </div>
</template>
