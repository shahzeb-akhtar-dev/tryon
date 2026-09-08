<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  visible: boolean
  title?: string
  description?: string
  accept?: string
  maxFileSize?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'upload', files: File[]): void
}>()

const fileUploadRef = ref()
const previewUrl = ref<string | null>(null)

const hasFile = computed(() => previewUrl.value !== null)

const onChoose = () => {
  fileUploadRef.value?.choose()
}

const onFileSelect = (event: { files: File[] }) => {
  if (event.files.length > 0) {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(event.files[0])
  }
}

const onUpload = () => {
  const files = fileUploadRef.value?.files || []
  if (files.length > 0) {
    emit('upload', [...files])
    emit('update:visible', false)
    onClear()
  }
}

const onClear = () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  fileUploadRef.value?.clear()
}

const onCancel = () => {
  onClear()
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    modal
    :closable="true"
    :draggable="false"
    :show-header="true"
    class="image-upload-dialog"
    :pt="{
      mask: { class: 'backdrop-blur-sm' },
      root: { class: 'max-w-md w-full' },
      header: { class: 'bg-primary text-tertiary rounded-t-xl px-6 py-4' },
      content: { class: 'p-0' }
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-secondary/20 rounded-lg flex items-center justify-center">
          <Icon icon="ic:baseline-cloud-upload" class="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 class="text-lg text-tertiary font-primary font-bold">
            {{ title || 'Upload Image' }}
          </h3>
          <p v-if="description" class="text-sm text-tertiary/60 font-primary mt-0.5">
            {{ description }}
          </p>
        </div>
      </div>
    </template>

    <div class="bg-tertiary rounded-b-xl">
      <div class="p-6">
        <FileUpload
          ref="fileUploadRef"
          name="demo[]"
          :url="'/api/upload'"
          :multiple="false"
          :accept="accept || 'image/*'"
          :maxFileSize="maxFileSize || 1000000"
          mode="advanced"
          custom-upload
          class="w-full"
          :pt="{
            root: { class: 'border! border-dashed! w-full' },
            header: { class: 'hidden!' },
            content: { class: 'p-8!' }
          }"
          @select="onFileSelect"
        >
          <template #content="{ messages }">
            <div v-if="messages?.length" class="flex flex-col gap-2 mb-4">
              <Message v-for="msg of messages" :key="msg" severity="error">{{ msg }}</Message>
            </div>
            <div v-if="hasFile" class="flex flex-col items-center gap-4">
              <div class="relative w-full max-h-64 rounded-xl overflow-hidden bg-white">
                <img :src="previewUrl" alt="Preview" class="w-full h-full object-contain" />
                <Button
                  type="button"
                  icon-only
                  variant="text"
                  severity="secondary"
                  size="small"
                  rounded
                  class="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  @click="onClear"
                >
                  <Icon icon="ic:baseline-close" class="w-4 h-4 text-neutral" />
                </Button>
              </div>
            </div>
          </template>
          <template #empty>
            <div class="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer" @click="onChoose">
              <Icon icon="ic:baseline-cloud-upload" class="w-12 h-12 text-neutral" />
              <div class="text-center">
                <p class="text-lg font-medium text-primary font-primary mt-0 mb-1">Drop files here</p>
                <p class="text-sm text-neutral font-primary m-0">or click to browse</p>
              </div>
            </div>
          </template>
        </FileUpload>
      </div>

      <div class="flex items-center justify-end gap-3 px-6 pb-6">
        <Button
          label="Cancel"
          severity="secondary"
          text
          class="font-primary text-md"
          @click="onCancel"
        />
        <Button
          label="Upload"
          icon="ic:baseline-cloud-upload"
          class="font-primary text-md bg-secondary text-primary border-none rounded-lg transition duration-normal hover:bg-secondary/90"
          @click="onUpload"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.p-dialog-mask) {
  background: rgba(0, 0, 0, 0.6);
}

:deep(.p-dialog) {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

:deep(.p-fileupload-content) {
  padding: 0;
  border: none;
}

:deep(.p-fileupload-header) {
  display: none;
}
</style>
