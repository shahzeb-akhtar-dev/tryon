<script setup lang="ts">
import { ref } from 'vue'
import YourPhotoSection from '~/components/Homepage/YourPhotoSection.vue'
import GarmentImageSection from '~/components/Homepage/GarmentImageSection.vue'
import DesignDetailsSection from '~/components/Homepage/DesignDetailsSection.vue'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Create New Try-On | TryOn',
  description: 'Upload reference images to generate a hyper-realistic AI try-on.',
  ogTitle: 'Create New Try-On | TryOn',
  ogDescription: 'Upload reference images to generate a hyper-realistic AI try-on.',
  twitterCard: 'summary_large_image',
})

const generating = ref(false)

const handleGenerate = () => {
  generating.value = true
  setTimeout(() => {
    generating.value = false
  }, 2000)
}
</script>

<template>
  <main class="min-h-screen bg-tertiary">
    <div class="max-w-[520px] mx-auto px-5 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl text-primary font-primary font-bold mb-2">Create New Try-on</h1>
        <p class="text-md text-neutral font-primary">
          Upload reference images to generate a hyper-realistic AI try-on.
        </p>
      </div>

      <YourPhotoSection />
      <GarmentImageSection />
      <DesignDetailsSection />

      <Button
        label="Generate Try-on"
        icon="ic:baseline-auto-fix-high"
        :loading="generating"
        class="w-full py-4 bg-primary text-tertiary font-primary text-md font-semibold rounded-lg transition duration-normal hover:bg-primary/90 disabled:opacity-60"
        @click="handleGenerate"
      />
    </div>
  </main>
</template>
