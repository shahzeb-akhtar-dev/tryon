<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface TabItem {
  key: string
  label: string
  icon?: string
}

interface Props {
  modelValue: string
  tabs: TabItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex w-full bg-tertiary rounded-lg p-1 mb-3 md:mb-6">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="flex-1 py-2.5 text-sm md:text-md font-primary rounded-md transition duration-normal flex items-center justify-center gap-1"
      :class="
        props.modelValue === tab.key
          ? 'bg-white text-primary shadow-sm border-b-2 border-primary'
          : 'text-neutral hover:text-primary'
      "
      @click="emit('update:modelValue', tab.key)"
    >
      <Icon v-if="tab.icon" :icon="tab.icon" class="size-[1.25rem]" />
      {{ tab.label }}
    </button>
  </div>
</template>
