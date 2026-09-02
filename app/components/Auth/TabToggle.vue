<script setup lang="ts">
interface Props {
  modelValue: 'login' | 'signup'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: 'login' | 'signup']
}>()

const tabs = [
  { key: 'login' as const, label: 'Log In' },
  { key: 'signup' as const, label: 'Sign Up' },
]
</script>

<template>
  <div class="flex w-full bg-tertiary rounded-lg p-1">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="flex-1 py-2.5 text-md font-primary rounded-md transition duration-normal"
      :class="
        props.modelValue === tab.key
          ? 'bg-white text-primary shadow-sm'
          : 'text-neutral hover:text-primary'
      "
      @click="emit('update:modelValue', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
