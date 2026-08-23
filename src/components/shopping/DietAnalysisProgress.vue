<template>
  <div class="max-w-md mx-auto my-12 bg-white dark:bg-[#18181b] rounded-3xl p-10 border border-slate-200 dark:border-white/10 shadow-xl text-center space-y-6 transition-colors">
    <!-- Animated Spinner & Pulse -->
    <div class="relative w-20 h-20 mx-auto">
      <div class="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 animate-ping opacity-75"></div>
      <div class="relative w-20 h-20 rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 animate-spin flex items-center justify-center">
        <span class="text-2xl animate-pulse">🔎</span>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="text-xl font-bold text-slate-800 dark:text-white">Analizando dieta...</h3>
      <p class="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
        Estamos identificando días, comidas, ingredientes y cantidades con la Inteligencia Artificial de Google Gemini.
      </p>
    </div>

    <!-- Skeleton progress indicators -->
    <div class="space-y-2 pt-4">
      <div class="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-emerald-500 animate-pulse w-3/4 rounded-full"></div>
      </div>
      <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
        <span>Procesando PDF</span>
        <span>Estructurando JSON</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Loading screen component
</script>
