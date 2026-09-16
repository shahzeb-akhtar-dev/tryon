import { ref, computed } from 'vue'
import { getSupabaseClient } from '~/utils/supabase-client'
import type { SupabaseClient } from '@supabase/supabase-js'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

interface AuthResponse {
  success: boolean
  idToken: string
  refreshToken?: string
  user: AuthUser
}

interface ServerResponse<T> {
  success: boolean
  message?: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const user = ref<AuthUser | null>(null)
const isInitialized = ref(false)

export function useAuth() {
  const getStore = () => useAuthStore()

  const isAuthenticated = computed(() => getStore().isAuthenticated)

  function getSupabase() {
    return getSupabaseClient()
  }

  async function initAuth() {
    const authStore = getStore()
    authStore.loadFromStorage()

    if (authStore.token && authStore.user) {
      try {
        const response = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/me', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        if (response.success && response.user) {
          user.value = response.user
          authStore.setUser(response.user)
        } else {
          authStore.clearAuth()
          user.value = null
        }
      } catch (e: any) {
        if (e?.data?.statusCode === 401) {
          authStore.clearAuth()
          user.value = null
        }
      }
    }

    isInitialized.value = true
    authStore.setInitialized()
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      if (response.success) {
        const authStore = getStore()
        authStore.setSession(response.user, response.idToken, response.refreshToken)
        user.value = response.user
      }
    } catch (e: any) {
      const msg = e?.data?.statusMessage || e?.message || 'Login failed. Please try again.'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  async function signup(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: { email, password },
      })

      if (response.success) {
        const authStore = getStore()
        authStore.setSession(response.user, response.idToken, response.refreshToken)
        user.value = response.user
      }
    } catch (e: any) {
      const msg = e?.data?.statusMessage || e?.message || 'Sign-up failed. Please try again.'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const supabase = getSupabase()
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (e: any) {
      const msg = e?.message || 'Google sign-in failed.'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ServerResponse<void>>('/api/auth/reset-password', {
        method: 'POST',
        body: { email },
      })
      return response.message || 'Password reset email sent.'
    } catch (e: any) {
      const msg = e?.data?.statusMessage || e?.message || 'Password reset failed.'
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch {
      }

      try {
        const supabase = getSupabase()
        await supabase.auth.signOut()
      } catch {
      }

      const authStore = getStore()
      authStore.clearAuth()
      user.value = null
    } catch (e: any) {
      const authStore = getStore()
      authStore.clearAuth()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    user,
    isInitialized,
    isAuthenticated,
    initAuth,
    login,
    signup,
    loginWithGoogle,
    resetPassword,
    logout,
  }
}
