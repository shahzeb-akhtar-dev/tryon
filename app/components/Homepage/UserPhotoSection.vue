<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import ImagePreviewDialog from "~/components/ImagePreviewDialog.vue";

const fu = ref();
const uploadedPhoto = ref<string | null>(null);
const previewVisible = ref(false);

const recentPhotos = [
  { id: 1, src: "/images/login-hero.jpg", alt: "Recent photo 1" },
  { id: 2, src: "/images/login-hero.jpg", alt: "Recent photo 2" },
];

const onChoose = () => {
  fu.value?.choose();
};


const onClear = () => {
  fu.value?.clear();
  uploadedPhoto.value = null;
};

const onFileUpload = (event: { files: File[] }) => {
  const file = event.files[0];
  if (file) {
    uploadedPhoto.value = URL.createObjectURL(file);
  }
};

const selectRecent = (src: string) => {
  uploadedPhoto.value = src;
};

const openPreview = () => {
  if (uploadedPhoto.value) {
    previewVisible.value = true;
  }
};

const formatSize = (bytes: number | undefined) => {
  if (bytes === 0 || bytes === undefined) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
</script>

<template>
  <section class="mb-8 ">
    <div class="flex items-center gap-3 mb-4">
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

    <div class="mt-6 ">
      <FileUpload
        ref="fu"
        name="user"
        :multiple="false"
        accept="image/*"
        :maxFileSize="1000000"
        mode="advanced"
        :pt="{
          root: { class: 'border border-dashed bg-gray-200' },
          input: { class: 'hidden' },
          header: { class: 'hidden' },
          content: { class: 'p-8' },
        }"
        @select="onFileUpload"
      >
        <!-- <template v-if="false" #header></template> -->
        <template #content="{ files, removeFileCallback, messages }">
          <div v-if="messages?.length" class="flex flex-col gap-2">
            <Message v-for="msg of messages" :key="msg" severity="error">
              {{ msg }}
            </Message>
          </div>
          <div v-if="files.length" class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <div
                class="flex items-center justify-between p-3 rounded-lg bg-tertiary"
                v-if="uploadedPhoto"
              >
                <div class="relative flex flex-col items-center gap-1">
                  <img
                    :src="uploadedPhoto"
                    alt="Preview"
                    class="size-[12rem] object-cover rounded-lg"
                  />
                  <span class="font-medium text-black font-primary">
                    {{ files[0]?.name }}
                  </span>
                  <span class="text-sm text-neutral font-primary">
                    size: {{ formatSize(files[0]?.size) }}
                  </span>
                  <Button
                    class="absolute top-2 right-2 bg-white rounded-full p-2 text-red-600 hover:bg-red-100 transition duration-normal"
                    type="button"
                    iconOnly
                    variant="text"
                    severity="secondary"
                    size="small"
                    rounded
                    @click="removeFileCallback(0)"
                  >
                    <Icon icon="f7:trash" class="size-[1.25rem]" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #empty>
          <div
            class="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer"
            @click="onChoose"
          >
            <Icon
              icon="ic:baseline-cloud-upload"
              class="w-12 h-12 text-neutral"
            />
            <div class="text-center">
              <p
                class="text-lg font-medium text-black font-primary mt-0 mb-1"
              >
                Drop files here
              </p>
              <p class="text-sm text-neutral font-primary m-0">
                or click to browse
              </p>
              <p class="text-sm text-neutral font-primary mt-3 leading-relaxed">
                Upload a clear, full-body photo with even lighting and
                form-fitting clothes.
              </p>
            </div>
          </div>
        </template>
      </FileUpload>
      <div class="mt-5">
        <p
          class="text-xs text-neutral font-primary font-semibold tracking-wider mb-2"
        >
          RECENT PHOTOS
        </p>
        <div class="flex gap-3">
          <button
            v-for="photo in recentPhotos"
            :key="photo.id"
            class="w-14 h-14 rounded-lg overflow-hidden border-2 border-transparent transition duration-normal hover:border-primary flex-shrink-0"
            :class="{ 'border-primary': uploadedPhoto === photo.src }"
            @click="selectRecent(photo.src)"
          >
            <NuxtImg
              :src="photo.src"
              :alt="photo.alt"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>

    <ImagePreviewDialog
      v-model:visible="previewVisible"
      :src="uploadedPhoto || ''"
      alt="Your uploaded photo"
    />
  </section>
</template>

<style scoped>
:deep(.p-fileupload-header) {
  display: none !important;
}
</style>
