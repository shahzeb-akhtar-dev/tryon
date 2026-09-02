<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { loading, error, login, signup, loginWithGoogle, resetPassword } = useAuth()

const activeTab = ref<'login' | 'signup'>('login')
const showPassword = ref(false)
const forgotPasswordMode = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const formError = ref('')

const isLogin = computed(() => activeTab.value === 'login')

const handleSubmit = async () => {
  formError.value = ''
  try {
    if (isLogin.value) {
      await login(form.email, form.password)
    } else {
      await signup(form.email, form.password)
    }
  } catch (e: any) {
    formError.value = e?.message || 'Something went wrong. Please try again.'
  }
}

const handleGoogleLogin = async () => {
  formError.value = ''
  try {
    await loginWithGoogle()
  } catch (e: any) {
    formError.value = e?.message || 'Google login failed.'
  }
}

const handleForgotPassword = async () => {
  formError.value = ''
  try {
    await resetPassword(form.email)
    formError.value = ''
    forgotPasswordMode.value = false
  } catch (e: any) {
    formError.value = e?.message || 'Password reset failed.'
  }
}
</script>

<template>
  <div class="w-full max-w-[420px] mx-auto px-5">
    <div class="text-center mb-6">
      <h1 class="text-4xl text-primary font-primary font-bold mb-2">Welcome Back</h1>
      <p class="text-md text-neutral font-primary">Sign in to curate your virtual wardrobe.</p>
    </div>

    <AuthTabToggle v-model="activeTab" class="mb-6" />

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-sm text-neutral font-primary">Email Address</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral">
            <Icon icon="ic:baseline-email" class="w-5 h-5" />
          </span>
          <input
            v-model="form.email"
            type="email"
            placeholder="user@vogueai.com"
            class="w-full pl-10 pr-4 py-3 border border-neutral/20 rounded-lg bg-white text-primary font-primary text-md outline-none transition duration-normal focus:border-secondary"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm text-neutral font-primary">Password</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral">
            <Icon icon="ic:baseline-lock" class="w-5 h-5" />
          </span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            class="w-full pl-10 pr-12 py-3 border rounded-lg bg-white text-primary font-primary text-md outline-none transition duration-normal"
            :class="formError ? 'border-red-500' : 'border-neutral/20 focus:border-secondary'"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-primary transition duration-normal"
            @click="showPassword = !showPassword"
          >
            <Icon :icon="showPassword ? 'ic:baseline-visibility-off' : 'ic:baseline-visibility'" class="w-5 h-5" />
          </button>
        </div>
        <p v-if="formError" class="text-sm text-red-500 font-primary flex items-center gap-1 mt-1">
          <Icon icon="ic:baseline-error-outline" class="w-4 h-4" />
          {{ formError }}
        </p>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="text-sm text-secondary font-primary hover:underline transition duration-normal"
          @click="forgotPasswordMode = true"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3.5 bg-primary text-white font-primary text-md rounded-lg transition duration-normal hover:bg-primary/90 disabled:opacity-60"
      >
        {{ loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up') }}
      </button>
    </form>

    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-neutral/20" />
      <span class="text-sm text-neutral font-primary">Or continue with</span>
      <div class="flex-1 h-px bg-neutral/20" />
    </div>

    <AuthSocialButtons @google="handleGoogleLogin" />

    <p class="text-center text-sm text-neutral font-primary mt-6">
      By continuing, you agree to our
      <NuxtLink to="/terms" class="text-secondary hover:underline transition duration-normal">Terms</NuxtLink>
      and
      <NuxtLink to="/privacy" class="text-secondary hover:underline transition duration-normal">Privacy Policy</NuxtLink>.
    </p>
  </div>
</template>
