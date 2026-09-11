<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref, watch } from "vue";
import ImagePreviewDialog from "~/components/ImagePreviewDialog.vue";

const {
  personPreviewUrl,
  recentPhotos,
  setPersonFile,
  loadRecentPhotos,
  selectRecentPhoto,
  saveRecentPhoto,
} = useTryOn();

const fu = ref();
const previewVisible = ref(false);

const onChoose = () => {
  fu.value?.choose();
};

const onClear = () => {
  fu.value?.clear();
  setPersonFile(null);
};

const onFileUpload = (event: { files: File[] }) => {
  const file = event.files[0];
  if (file) {
    setPersonFile(file);
  }
};

const openPreview = () => {
  if (personPreviewUrl.value) {
    previewVisible.value = true;
  }
};

const handleSelectRecent = (photo: any) => {
  selectRecentPhoto(photo);
  fu.value?.clear();
};

const formatSize = (bytes: number | undefined) => {
  if (bytes === 0 || bytes === undefined) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

onMounted(() => {
  loadRecentPhotos();
});
</script>

<template>
  <section class="mb-8 bg-white p-5 rounded-lg shadow-md">
    <div class="flex items-center gap-3 mb-2">
      <span
        class="w-7 h-7 bg-primary text-tertiary font-primary text-md font-bold rounded-full flex items-center justify-center flex-shrink-0"
      >
        1
      </span>
      <h2 class="text-xl text-black font-primary font-bold">Your Photo</h2>
      <span
        class="ml-auto text-xs text-primary font-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-xs"
      >
        REQUIRED
      </span>
    </div>
    <p class="text-sm text-neutral font-primary mb-5">
      Upload a clear, full-body photo with even lighting and form-fitting
      clothes.
    </p>

    <div class="flex">
      <!-- Upload Area -->
      <div class="flex-1 flex gap-2 ">
        <FileUpload
          ref="fu"
          name="user"
          :multiple="false"
          accept="image/*"
          :maxFileSize="1000000"
          mode="advanced"
          class=""
          :pt="{
            root: { class: 'border border-dashed rounded-none border-primary w-[25rem]' },
            input: { class: 'hidden' },
            header: { class: 'hidden' },
            content: { class: 'p-2' },
          }"
          @select="onFileUpload"
        >
          <template #content="{ files, removeFileCallback, messages }">
            <div v-if="messages?.length" class="flex flex-col gap-2">
              <Message v-for="msg of messages" :key="msg" severity="error">
                {{ msg }}
              </Message>
            </div>
            <div
              v-if="files.length && personPreviewUrl"
              class="flex flex-col items-center gap-3 rounded-lg overflow-hidden"
            >
              <div class="relative">
                <NuxtImg
                  :src="personPreviewUrl"
                  alt="Uploaded photo preview"
                  class="w-48 h-64 object-cover  cursor-pointer"
                  @click="openPreview"
                />
                <Button
                  class="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-red-500 hover:bg-red-50 transition duration-normal"
                  type="button"
                  iconOnly
                  variant="text"
                  severity="secondary"
                  size="small"
                  rounded
                  @click="removeFileCallback(0)"
                >
                  <Icon icon="ic:baseline-close" class="w-4 h-4" />
                </Button>
              </div>
              <div class="text-center">
                <p class="text-sm font-medium text-black font-primary">
                  {{ files[0]?.name }}
                </p>
                <p class="text-xs text-neutral font-primary">
                  {{ formatSize(files[0]?.size) }}
                </p>
              </div>
            </div>
          </template>
          <template #empty>
            <div
              class="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer"
              @click="onChoose"
            >
              <div class="relative">
                <div
                  class="w-16 h-16 bg-neutral/10 rounded-full flex items-center justify-center"
                >
                  <Icon
                    icon="ic:baseline-person"
                    class="w-8 h-8 text-neutral"
                  />
                </div>
                <div
                  class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-white"
                >
                  <Icon icon="ic:baseline-add" class="w-4 h-4 text-white" />
                </div>
              </div>
              <div class="text-center">
                <p class="text-md font-medium text-black font-primary mb-0.5">
                  Drop files here
                </p>
                <p class="text-sm text-neutral font-primary">
                  or click to browse
                </p>
              </div>
              <Button
                type="button"
                label="Upload Photo"
                class=""
                @click.stop="onChoose"
              >
                <template #icon>
                  <Icon icon="ic:baseline-cloud-upload" class="w-4 h-4 mr-1" />
                </template>
              </Button>
            </div>
          </template>
        </FileUpload>
        <div class="flex-shrink max-w-[12rem]">
          <NuxtImg
            src="/images/user-upload.png"
            alt="Photo guide example "
            class=" object-cover"
          />
        </div>
      </div>

      <!-- Guide Image with Tips -->
      <div class="flex-shrink-0 flex items-center gap-3">
        <div class="relative"></div>
      </div>
    </div>

    <ImagePreviewDialog
      v-model:visible="previewVisible"
      :src="personPreviewUrl || ''"
      alt="Your uploaded photo"
    />
  </section>
</template>

<style scoped>
:deep(.p-fileupload-header) {
  display: none !important;
}
:deep(.p-fileupload-content) {
  border: none !important;
}
</style>
