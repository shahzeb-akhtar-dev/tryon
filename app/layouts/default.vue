<script setup lang="ts">
import { SITE_NAME, SITE_TRYON_PATH, SITE_GALLERY_PATH, SITE_ABOUT_PATH, SITE_LOGIN_PATH } from '~/utils/site'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-tertiary">
    <header class="bg-primary">
      <nav class="max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-10 2xl:px-12 flex items-center justify-between h-16">
        <NuxtLink to="/" class="text-2xl text-tertiary font-primary font-bold tracking-tight transition duration-normal hover:text-secondary">
          {{ SITE_NAME }}
        </NuxtLink>
        <div class="flex items-center gap-6">
          <NuxtLink :to="SITE_TRYON_PATH" class="text-md text-tertiary/80 font-primary transition duration-normal hover:text-secondary">
            Try On
          </NuxtLink>
          <NuxtLink :to="SITE_GALLERY_PATH" class="text-md text-tertiary/80 font-primary transition duration-normal hover:text-secondary">
            Gallery
          </NuxtLink>
          <NuxtLink :to="SITE_ABOUT_PATH" class="text-md text-tertiary/80 font-primary transition duration-normal hover:text-secondary">
            About
          </NuxtLink>
          <NuxtLink :to="SITE_LOGIN_PATH">
            <Button label="Sign In" outlined severity="secondary" size="small" class="rounded-xl font-primary text-md" />
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <NuxtPage />
    </main>

    <footer class="bg-primary py-8 mt-auto">
      <div class="max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-10 2xl:px-12">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span class="text-md text-tertiary/60 font-primary">
            &copy; {{ new Date().getFullYear() }} {{ SITE_NAME }}. All rights reserved.
          </span>
          <div class="flex items-center gap-6">
            <NuxtLink to="/privacy" class="text-md text-tertiary/60 font-primary transition duration-normal hover:text-secondary">
              Privacy
            </NuxtLink>
            <NuxtLink to="/terms" class="text-md text-tertiary/60 font-primary transition duration-normal hover:text-secondary">
              Terms
            </NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
