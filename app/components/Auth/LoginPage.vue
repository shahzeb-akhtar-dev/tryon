<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { reactive, ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { SITE_LOGIN_PATH } from '~/utils/site'
import CustomTab from '../Common/CustomTab.vue'

const { loading, error, login, signup, loginWithGoogle, resetPassword } = useAuth()
const router = useRouter()

const activeTab = ref('login')
const showPassword = ref(false)
const forgotPasswordMode = ref(false)

const tabs = [
  { key: 'login', label: 'Log In' },
  { key: 'signup', label: 'Sign Up' },
]

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
    router.push('/')
  } catch (e: any) {
    formError.value = e?.message || 'Something went wrong. Please try again.'
  }
}

const handleGoogleLogin = async () => {
  formError.value = ''
  try {
    await loginWithGoogle()
    router.push('/')
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
  <div class="relative z-20 flex items-end md:items-center justify-center min-h-screen px-2 py-4 md:py-8 md:px-4">
    <div class="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-4 md:p-8">
      <div class="text-center mb-3 md:mb-6">
        <h1 class="text-2xl md:text-3xl text-black font-primary font-bold mb-1">Welcome Back</h1>
        <p class="text-sm md:text-md text-neutral font-primary">{{activeTab === 'login' ? 'Sign in' : 'Create your account'}} to define your style.</p>
      </div>

      <CustomTab v-if="!forgotPasswordMode" v-model="activeTab" :tabs="tabs" />

      <template v-if="forgotPasswordMode">
        <div class="flex flex-col gap-3 md:gap-6">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-neutral font-primary">Email Address</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral">
                <Icon icon="ic:baseline-email" class="w-5 h-5" />
              </span>
              <input
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
                class="w-full pl-10 pr-4 py-3 border border-neutral/10 rounded-lg bg-blue-50/60 text-black font-primary text-md outline-none transition duration-normal focus:border-primary"
              />
            </div>
          </div>

          <p v-if="formError" class="text-sm text-red-500 font-primary flex items-center gap-1">
            <Icon icon="ic:baseline-error-outline" class="w-4 h-4" />
            {{ formError }}
          </p>

          <button
            type="button"
            :disabled="loading"
            class="w-full py-3.5 bg-primary text-white font-primary text-md rounded-lg transition duration-normal hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
            @click="handleForgotPassword"
          >
            {{ loading ? 'Sending...' : 'Reset Password' }}
            <Icon icon="ic:baseline-arrow-forward" class="w-5 h-5" />
          </button>

          <button
            type="button"
            class="text-sm text-neutral font-primary hover:text-primary transition duration-normal text-center"
            @click="forgotPasswordMode = false"
          >
            Back to Sign In
          </button>
        </div>
      </template>

      <template v-else>
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
                placeholder="Enter your email"
                class="w-full pl-10 pr-4 py-3 border border-neutral/10 rounded-lg bg-blue-50/60 text-black font-primary text-md outline-none transition duration-normal focus:border-primary"
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
                class="w-full pl-10 pr-12 py-3 border border-neutral/10 rounded-lg bg-blue-50/60 text-black font-primary text-md outline-none transition duration-normal focus:border-primary"
                :class="formError ? 'border-red-400' : ''"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-black transition duration-normal"
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
              class="text-sm text-primary font-primary hover:underline transition duration-normal"
              @click="forgotPasswordMode = true"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 bg-primary text-white font-primary text-md rounded-lg transition duration-normal hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {{ loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up') }}
            <Icon icon="ic:baseline-arrow-forward" class="w-5 h-5" />
          </button>
        </form>

        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-neutral/20" />
          <span class="text-sm text-neutral font-primary">Or continue with</span>
          <div class="flex-1 h-px bg-neutral/20" />
        </div>

        <AuthSocialButtons @google="handleGoogleLogin" />
      </template>
    </div>
  </div>
</template>
