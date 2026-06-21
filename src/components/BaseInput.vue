<script setup lang="ts">
defineProps<{
  label: string
  modelValue: string | number | null
  type?: 'text' | 'number'
  placeholder?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>

<template>
  <div class="flex flex-col">
    <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" style="color: var(--on-surface-muted);">{{ label }}</label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field w-full text-sm disabled:opacity-50"
    />
  </div>
</template>
