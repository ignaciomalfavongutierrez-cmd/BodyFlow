<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string | number | null
  type?: 'text' | 'number'
  placeholder?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>

<template>
  <div class="flex flex-col mb-4">
    <label class="text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none w-full text-gray-900"
    />
  </div>
</template>
