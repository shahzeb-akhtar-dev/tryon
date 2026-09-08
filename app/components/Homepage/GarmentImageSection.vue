<script setup lang="ts">
import { ref } from 'vue'
import ImagePreviewDialog from '~/components/ImagePreviewDialog.vue'
import ImageUploadDialog from '~/components/ImageUploadDialog.vue'

const activeTab = ref<'new' | 'saved'>('new')
const selectedGarment = ref<string | null>(null)
const previewVisible = ref(false)
const uploadDialogVisible = ref(false)

const handleUploadClick = () => {
  uploadDialogVisible.value = true
}

const handleFileUpload = (files: File[]) => {
  if (files.length > 0) {
    selectedGarment.value = URL.createObjectURL(files[0])
  }
}

const openPreview = () => {
  if (selectedGarment.value) {
    previewVisible.value = true
  }
}
</script>

<template>
  <section class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <span class="w-7 h-7 bg-primary text-tertiary font-primary text-md font-bold rounded-full flex items-center justify-center flex-shrink-0">
        2
      </span>
      <h2 class="text-xl text-primary font-primary font-bold">Garment Image</h2>
      <span class="ml-auto text-xs text-secondary font-primary font-semibold bg-secondary/10 px-2 py-0.5 rounded-xs">
        REQUIRED
      </span>
    </div>

    <div class="flex gap-2 mb-4">
      <button
        class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-primary text-md font-medium transition duration-normal"
        :class="activeTab === 'new' ? 'bg-primary text-tertiary' : 'bg-tertiary text-neutral hover:bg-neutral/10'"
        @click="activeTab = 'new'"
      >
        <Icon icon="ic:baseline-add" class="w-4 h-4" />
        New
      </button>
      <button
        class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-primary text-md font-medium transition duration-normal"
        :class="activeTab === 'saved' ? 'bg-primary text-tertiary' : 'bg-tertiary text-neutral hover:bg-neutral/10'"
        @click="activeTab = 'saved'"
      >
        <Icon icon="ic:baseline-folder" class="w-4 h-4" />
        Saved
      </button>
    </div>

    <div
      v-if="!selectedGarment"
      class="border-2 border-dashed border-neutral/30 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition duration-normal hover:border-secondary hover:bg-secondary/5"
      @click="handleUploadClick"
    >
      <div class="w-12 h-12 bg-tertiary rounded-lg flex items-center justify-center mb-3">
        <Icon icon="ic:baseline-upload" class="w-6 h-6 text-neutral" />
      </div>
      <span class="text-md text-neutral font-primary">Select garment image</span>
    </div>

    <div v-else class="relative group">
      <NuxtImg
        :src="selectedGarment"
        alt="Selected garment"
        class="w-full h-52 object-cover rounded-lg cursor-pointer transition duration-normal hover:brightness-90"
        @click="openPreview"
      />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-normal pointer-events-none">
        <div class="w-10 h-10 bg-primary/70 backdrop-blur-sm text-tertiary rounded-full flex items-center justify-center">
          <Icon icon="ic:baseline-zoom-in" class="w-5 h-5" />
        </div>
      </div>
      <button
        class="absolute top-2 right-2 w-7 h-7 bg-primary/80 text-tertiary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-normal"
        @click.stop="selectedGarment = null"
      >
        <Icon icon="ic:baseline-close" class="w-4 h-4" />
      </button>
    </div>

    <ImagePreviewDialog
      v-model:visible="previewVisible"
      :src="selectedGarment || ''"
      alt="Selected garment"
      caption="Garment image"
    />

    <ImageUploadDialog
      v-model:visible="uploadDialogVisible"
      title="Upload Garment Image"
      description="Upload a clear image of the garment"
      :multiple="false"
      @upload="handleFileUpload"
    />
  </section>
</template>
