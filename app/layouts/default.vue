<script setup lang="ts">
import { SITE_NAME } from '~/utils/site'
import { useAuth } from '~/composables/useAuth'
import { Icon } from '@iconify/vue'

const { logout, user } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-tertiary">
    <header class="bg-white border-b border-neutral/10">
      <nav class="max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-10 2xl:px-12 flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <NuxtImg
            v-if="user?.photoURL"
            :src="user.photoURL"
            alt="User avatar"
            class="w-9 h-9 rounded-full object-cover"
          />
          <div v-else class="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
            <Icon icon="ic:baseline-person" class="w-5 h-5 text-secondary" />
          </div>
        </div>

        <NuxtLink to="/" class="text-3xl text-primary font-primary font-bold tracking-tight">
          {{ SITE_NAME }}
        </NuxtLink>

        <div class="flex items-center">
          <button
            class="p-2 rounded-full transition duration-normal hover:bg-tertiary"
            aria-label="Logout"
            @click="handleLogout"
          >
            <Icon icon="ic:baseline-logout" class="w-5 h-5 text-primary" />
          </button>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <NuxtPage />
    </main>

    <footer class="bg-white py-8 mt-auto border-t border-neutral/10">
      <div class="max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-10 2xl:px-12">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span class="text-md text-neutral font-primary">
            &copy; {{ new Date().getFullYear() }} {{ SITE_NAME }}. All rights reserved.
          </span>
          <div class="flex items-center gap-6">
            <NuxtLink to="/privacy" class="text-md text-neutral font-primary transition duration-normal hover:text-secondary">
              Privacy
            </NuxtLink>
            <NuxtLink to="/terms" class="text-md text-neutral font-primary transition duration-normal hover:text-secondary">
              Terms
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
