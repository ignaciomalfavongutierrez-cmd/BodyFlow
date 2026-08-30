<template>
  <TaliaOfficialLogo
    :watermark="watermark"
    :size="size"
    :customClass="customClass"
  />
</template>

<script setup lang="ts">
import TaliaOfficialLogo from '../common/TaliaOfficialLogo.vue';

withDefaults(
  defineProps<{
    watermark?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    customClass?: string;
  }>(),
  {
    watermark: false,
    size: 'md',
    customClass: ''
  }
);
</script>
