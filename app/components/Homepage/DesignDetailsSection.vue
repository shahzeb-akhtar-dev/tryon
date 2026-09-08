<script setup lang="ts">
import { ref } from 'vue'

const options = [
  { id: 'texture', label: 'Texture', icon: 'ic:baseline-grid-on' },
  { id: 'pattern', label: 'Pattern', icon: 'ic:baseline-view-module' },
]

const selected = ref<string[]>([])

const toggleOption = (id: string) => {
  const index = selected.value.indexOf(id)
  if (index > -1) {
    selected.value.splice(index, 1)
  } else {
    selected.value.push(id)
  }
}
</script>

<template>
  <section class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <span class="w-7 h-7 bg-primary text-tertiary font-primary text-md font-bold rounded-full flex items-center justify-center flex-shrink-0">
        3
      </span>
      <h2 class="text-xl text-primary font-primary font-bold">Design Details</h2>
      <span class="ml-auto text-xs text-neutral font-primary font-semibold bg-neutral/10 px-2 py-0.5 rounded-xs">
        OPTIONAL
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="option in options"
        :key="option.id"
        class="flex items-center justify-center gap-2 py-3 rounded-lg font-primary text-md font-medium border-2 transition duration-normal"
        :class="selected.includes(option.id) ? 'border-secondary bg-secondary/10 text-primary' : 'border-neutral/20 bg-tertiary text-neutral hover:border-neutral/40'"
        @click="toggleOption(option.id)"
      >
        <Icon :icon="option.icon" class="w-5 h-5" />
        {{ option.label }}
      </button>
    </div>
  </section>
</template>
