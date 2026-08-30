<template>
  <div class="clinical-banner-wrapper w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 sm:p-3 bg-white/95 dark:bg-[#18181b]/95 rounded-2xl border border-[#d4dfc7] dark:border-white/10 shadow-xs">
    <!-- Contact Info Grid Card -->
    <div class="contact-card-box flex-1 w-full bg-[#f4f7ee] dark:bg-white/5 rounded-xl p-2.5 sm:p-3 border border-[#d4dfc7] dark:border-white/10 text-slate-700 dark:text-slate-300">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[9.5px] sm:text-[10px] text-[#43512b] dark:text-slate-300">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-xs">👤</span>
          <span class="truncate"><strong>Nutrióloga:</strong> Lic. N. Talia Tinoco Fabián</span>
        </div>
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-xs">🪪</span>
          <span><strong>Cédula Profesional:</strong> 11290678</span>
        </div>
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-xs">📍</span>
          <span class="truncate"><strong>Dirección:</strong> AND. Emiliano Zapata No. 2, col. Obrera, Santa Clara</span>
        </div>
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-xs">📞</span>
          <span><strong>Teléfono / Citas:</strong> 3541009737</span>
        </div>
        <div class="flex items-center gap-1.5 sm:col-span-2 min-w-0">
          <span class="text-xs">✉️</span>
          <span class="truncate"><strong>Correo Electrónico:</strong> lic.n.talia@gmail.com</span>
        </div>
      </div>
    </div>

    <!-- Official Logo Right -->
    <div class="shrink-0 flex items-center justify-center px-2">
      <TaliaOfficialLogo :size="logoSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TaliaOfficialLogo from './TaliaOfficialLogo.vue';

withDefaults(
  defineProps<{
    logoSize?: number;
  }>(),
  {
    logoSize: 95
  }
);
</script>

<style scoped>
.clinical-banner-wrapper {
  box-sizing: border-box;
}

.contact-card-box strong {
  color: #2c361c;
}

:root.dark .contact-card-box strong,
.dark .contact-card-box strong {
  color: #f1f5f9;
}
</style>
