<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  src: string
  alt?: string
  caption?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const previewVisible = ref(false)

watch(() => props.visible, (val) => {
  previewVisible.value = val
})

watch(previewVisible, (val) => {
  emit('update:visible', val)
})

const handleClose = () => {
  previewVisible.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="previewVisible"
    modal
    :closable="true"
    :draggable="false"
    :show-header="false"
    class="image-preview-dialog"
    :pt="{
      mask: { class: 'backdrop-blur-sm' },
      content: { class: 'p-0 bg-transparent border-none' },
      root: { class: 'max-w-4xl w-full' }
    }"
  >
    <div class="relative bg-primary rounded-xl overflow-hidden">
      <button
        class="absolute top-4 right-4 z-10 w-9 h-9 bg-primary/60 backdrop-blur-sm text-tertiary rounded-full flex items-center justify-center transition duration-normal hover:bg-primary/80"
        @click="handleClose"
      >
        <Icon icon="ic:baseline-close" class="w-5 h-5" />
      </button>

      <div class="flex items-center justify-center min-h-[300px] max-h-[80vh] p-6">
        <NuxtImg
          :src="src"
          :alt="alt || 'Image preview'"
          class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      <div
        v-if="caption"
        class="px-6 pb-5 pt-2 text-center"
      >
        <p class="text-md text-tertiary/80 font-primary">
          {{ caption }}
        </p>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.p-dialog-mask) {
  background: rgba(0, 0, 0, 0.7);
}

:deep(.p-dialog) {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>
