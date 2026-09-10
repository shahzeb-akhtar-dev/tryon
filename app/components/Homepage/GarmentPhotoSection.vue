<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import ImagePreviewDialog from "~/components/ImagePreviewDialog.vue";
import CustomTab from "~/components/Common/CustomTab.vue";

const activeTab = ref("new");
const selectedGarment = ref<string | null>(null);
const previewVisible = ref(false);
const fu = ref();

const tabs = [
  { key: "new", label: "New", icon: "ic:baseline-add" },
  { key: "saved", label: "Saved", icon: "ic:baseline-folder" },
];

const onFileUpload = (event: any) => {
  const files = event.files;
  if (files && files.length > 0) {
    selectedGarment.value = URL.createObjectURL(files[0]);
  }
};

const onChoose = () => {
  fu.value?.choose();
};

const formatSize = (bytes: number | undefined) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const openPreview = () => {
  if (selectedGarment.value) {
    previewVisible.value = true;
  }
};
</script>

<template>
  <section class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <span
        class="w-7 h-7 bg-primary text-tertiary font-primary text-md font-bold rounded-full flex items-center justify-center flex-shrink-0"
      >
        2
      </span>
      <h2 class="text-xl text-black font-primary font-bold">Garment Image</h2>
      <span
        class="ml-auto text-xs text-primary font-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-xs"
      >
        REQUIRED
      </span>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <CustomTab v-model="activeTab" :tabs="tabs" class="mb-4" />
      <div>
        <div v-show="activeTab === 'new'">
            <FileUpload
              ref="fu"
              name="garment"
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
                      v-if="selectedGarment"
                    >
                      <div class="relative flex flex-col items-center gap-1">
                        <img
                          :src="selectedGarment"
                          alt="Preview"
                          class="size-[12rem] object-cover rounded-lg cursor-pointer"
                          @click="openPreview"
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
                          @click="
                            removeFileCallback(0);
                            selectedGarment = null;
                          "
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
                      Drop garment image here
                    </p>
                    <p class="text-sm text-neutral font-primary m-0">
                      or click to browse
                    </p>
                    <p
                      class="text-sm text-neutral font-primary mt-3 leading-relaxed"
                    >
                      Upload a clear image of the garment you want to try on.
                    </p>
                  </div>
                </div>
              </template>
            </FileUpload>
        </div>
        <div v-show="activeTab === 'saved'">
          <p class="text-neutral font-primary text-center py-8">
            Saved garments will appear here.
          </p>
        </div>
      </div>
    </div>
    <ImagePreviewDialog
      v-model:visible="previewVisible"
      :src="selectedGarment || ''"
      alt="Selected garment"
      caption="Garment image"
    />
  </section>
</template>
