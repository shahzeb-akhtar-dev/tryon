<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest',
})

useSeoMeta({
  title: 'Log In | TryOn',
  description: 'Sign in to TryOn to curate your virtual wardrobe with AI-powered try-on technology.',
  ogTitle: 'Log In | TryOn',
  ogDescription: 'Sign in to TryOn to curate your virtual wardrobe.',
  ogImage: '/images/login-hero.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="relative w-full overflow-hidden">
    <AuthHeroImage />
    <AuthLoginPage />
  </div>
</template>
