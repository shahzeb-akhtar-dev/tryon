import { ref } from 'vue'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export function useAuth() {
  const { $firebaseAuth } = useNuxtApp()
  const auth = $firebaseAuth
  const googleProvider = new GoogleAuthProvider()
  const authStore = useAuthStore()
  
  const loading = ref(false)
  const user = ref<User | null>(null)
  const error = ref<string | null>(null)

  const initAuth = () => {
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
    })
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      user.value = result.user
      authStore.setUser(result.user)
      await authStore.setToken(result.user)
    } catch (e: any) {
      error.value = e?.message || 'Login failed. Please try again.'
      throw e
    } finally {
      loading.value = false
    }
  }

  const signup = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      user.value = result.user
      authStore.setUser(result.user)
      await authStore.setToken(result.user)
    } catch (e: any) {
      error.value = e?.message || 'Signup failed. Please try again.'
      throw e
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = async () => {
    loading.value = true
    error.value = null
    try {
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      authStore.setUser(result.user)
      await authStore.setToken(result.user)
    } catch (e: any) {
      error.value = e?.message || 'Google login failed.'
      throw e
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    loading.value = true
    error.value = null
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (e: any) {
      error.value = e?.message || 'Password reset failed.'
      throw e
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    error.value = null
    try {
      await signOut(auth)
      user.value = null
      authStore.clearAuth()
    } catch (e: any) {
      error.value = e?.message || 'Logout failed.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, user, error, initAuth, login, signup, loginWithGoogle, resetPassword, logout }
}
