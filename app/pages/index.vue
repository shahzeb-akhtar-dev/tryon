<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import UserPhotoSection from '~/components/Homepage/UserPhotoSection.vue'
import GarmentPhotoSection from '~/components/Homepage/GarmentPhotoSection.vue'
import ImagePreviewDialog from '~/components/ImagePreviewDialog.vue'

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

const {
  generating,
  uploading,
  canGenerate,
  statusMessage,
  error,
  resultImageUrl,
  isReady,
  generateTryOn,
  resetTryOn,
} = useTryOn()

const resultPreviewVisible = ref(false)

const handleGenerate = async () => {
  await generateTryOn()
}

const openResultPreview = () => {
  if (resultImageUrl.value) {
    resultPreviewVisible.value = true
  }
}
</script>

<template>
  <main class="min-h-screen">
    <div class="max-w-[520px] mx-auto px-5 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl text-black font-primary font-bold mb-2">Create New Try-on</h1>
        <p class="text-md text-neutral font-primary">
          Upload reference images to generate a hyper-realistic AI try-on.
        </p>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600 font-primary flex items-center gap-2">
          <Icon icon="ic:baseline-error-outline" class="w-4 h-4 flex-shrink-0" />
          {{ error }}
        </p>
      </div>

      <UserPhotoSection />
      <GarmentPhotoSection />

      <Button
        label="Generate Try-on"
        icon="ic:baseline-auto-fix-high"
        :loading="generating || uploading"
        :disabled="!canGenerate"
        class="w-full py-4 bg-primary text-tertiary font-primary text-md font-semibold rounded-lg transition duration-normal hover:bg-primary/90 disabled:opacity-60"
        @click="handleGenerate"
      />

      <div v-if="statusMessage" class="mt-4 text-center">
        <p class="text-sm text-neutral font-primary flex items-center justify-center gap-2">
          <ProgressSpinner style="width: 20px; height: 20px" stroke-width="4" />
          {{ statusMessage }}
        </p>
      </div>

      <div v-if="isReady && resultImageUrl" class="mt-8 bg-white p-5 rounded-lg shadow-md">
        <div class="flex items-center gap-3 mb-4">
          <span class="w-7 h-7 bg-green-500 text-white font-primary text-md font-bold rounded-full flex items-center justify-center flex-shrink-0">
            <Icon icon="ic:baseline-check" class="w-4 h-4" />
          </span>
          <h2 class="text-xl text-black font-primary font-bold">Result</h2>
        </div>
        <div class="flex justify-center">
          <NuxtImg
            :src="resultImageUrl"
            alt="Try-on result"
            class="max-w-full max-h-[500px] object-contain rounded-lg cursor-pointer"
            @click="openResultPreview"
          />
        </div>
        <div class="mt-4 flex gap-3">
          <Button
            label="Try Again"
            icon="ic:baseline-refresh"
            class="flex-1 py-3 border border-primary text-primary font-primary text-md rounded-lg transition duration-normal hover:bg-primary/5"
            @click="resetTryOn"
          />
          <a
            :href="resultImageUrl"
            target="_blank"
            download
            class="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-primary text-tertiary font-primary text-md font-semibold rounded-lg transition duration-normal hover:bg-primary/90"
          >
            <Icon icon="ic:baseline-download" class="w-4 h-4" />
            Download
          </a>
        </div>
      </div>

      <ImagePreviewDialog
        v-model:visible="resultPreviewVisible"
        :src="resultImageUrl || ''"
        alt="Try-on result"
        caption="Your virtual try-on result"
      />
    </div>
  </main>
</template>
