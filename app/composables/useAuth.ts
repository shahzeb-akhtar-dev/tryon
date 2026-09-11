import { ref, computed } from 'vue'
import { initializeApp, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

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

let googleAuthListener: (() => void) | null = null

export function useAuth() {
  const getStore = () => useAuthStore()

  const isAuthenticated = computed(() => getStore().isAuthenticated)

  function getFirebaseClientAuth() {
    const config = useRuntimeConfig()
    let app
    try {
      app = getApp()
    } catch {
      app = initializeApp({
        apiKey: config.public.firebaseApiKey as string,
        authDomain: config.public.firebaseAuthDomain as string,
        projectId: config.public.firebaseProjectId as string,
        storageBucket: config.public.firebaseStorageBucket as string,
        messagingSenderId: config.public.firebaseMessagingSenderId as string,
        appId: config.public.firebaseAppId as string,
      })
    }
    return getAuth(app)
  }

  async function initAuth() {
    const authStore = getStore()
    authStore.loadFromStorage()

    if (authStore.token) {
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
      } catch {
        authStore.clearAuth()
        user.value = null
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
      const firebaseAuth = getFirebaseClientAuth()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(firebaseAuth, provider)

      const idToken = await result.user.getIdToken()

      const response = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/google', {
        method: 'POST',
        body: { idToken },
      })

      if (response.success) {
        const authStore = getStore()
        authStore.setSession(response.user, idToken)
        user.value = response.user

        googleAuthListener = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
          if (firebaseUser && authStore.isAuthenticated) {
            try {
              const freshToken = await firebaseUser.getIdToken()
              authStore.setSession(
                {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                },
                freshToken,
              )
              user.value = authStore.currentUser
            } catch {
            }
          }
        })
      }
    } catch (e: any) {
      const msg = e?.code === 'auth/popup-closed-by-user'
        ? 'Sign-in popup was closed. Please try again.'
        : e?.code === 'auth/popup-blocked'
          ? 'Pop-up was blocked. Please allow pop-ups and try again.'
          : e?.message || 'Google sign-in failed.'
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
        const firebaseAuth = getFirebaseClientAuth()
        await signOut(firebaseAuth)
      } catch {
      }

      if (googleAuthListener) {
        googleAuthListener()
        googleAuthListener = null
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
