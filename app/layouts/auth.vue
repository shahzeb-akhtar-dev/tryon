<script setup lang="ts">
import { SITE_NAME } from '~/utils/site'
</script>

<template>
  <div class="min-h-screen max-w-lg mx-auto bg-tertiary flex flex-col">
    <header class="py-4 px-5 sm:px-8">
      <NuxtLink to="/" class="text-2xl text-black font-primary font-bold tracking-tight transition duration-normal hover:text-primary">
        {{ SITE_NAME }}
      </NuxtLink>
    </header>

    <main class="flex-1 flex items-center justify-center py-8">
      <NuxtPage />
    </main>
  </div>
</template>
