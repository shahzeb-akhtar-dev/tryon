<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useSeoMeta({
  title: 'Log In | TryOn',
  description: 'Sign in to TryOn to curate your virtual wardrobe with AI-powered try-on technology.',
  ogTitle: 'Log In | TryOn',
  ogDescription: 'Sign in to TryOn to curate your virtual wardrobe.',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="w-full max-w-[420px]">
    <AuthHeroImage />
    <AuthLoginPage class="mt-6" />
  </div>
</template>
