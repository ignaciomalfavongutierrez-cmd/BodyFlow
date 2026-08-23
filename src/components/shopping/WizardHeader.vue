<template>
  <div class="w-full bg-white dark:bg-[#18181b] border-b border-slate-200 dark:border-white/10 py-4 px-6 shadow-sm no-print mb-8 rounded-2xl transition-colors">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
          🥗
        </div>
        <div>
          <h1 class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Generador de Lista de Compras</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Extracción inteligente de ingredientes y optimización de despensa</p>
        </div>
      </div>

      <!-- 5-Step Visual Progress Bar -->
      <div class="hidden md:flex items-center space-x-2">
        <template v-for="(step, index) in steps" :key="step.number">
          <button
            type="button"
            @click="$emit('stepClick', step.number)"
            class="flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold focus:outline-none"
            :class="[
              currentStep === step.number
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400'
                : currentStep > step.number
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/60'
                : canNavigateTo(step.number)
                ? 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 cursor-pointer'
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/5 opacity-60 cursor-not-allowed'
            ]"
            :title="canNavigateTo(step.number) ? `Ir a Paso ${step.number}: ${step.label}` : ''"
          >
            <span>{{ step.icon }}</span>
            <span>{{ step.label }}</span>
          </button>
          <span v-if="index < steps.length - 1" class="text-slate-300 dark:text-white/20 font-bold text-sm">→</span>
        </template>
      </div>

      <!-- Mobile current step indicator with navigation -->
      <div class="md:hidden flex items-center space-x-1">
        <button
          v-if="currentStep > 1"
          @click="$emit('stepClick', currentStep - 1)"
          class="text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg"
        >
          ←
        </button>
        <span class="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700/50">
          Paso {{ currentStep }} de 5
        </span>
        <button
          v-if="currentStep < 5 && canNavigateTo(currentStep + 1)"
          @click="$emit('stepClick', currentStep + 1)"
          class="text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentStep: number;
  hasDietData?: boolean;
}>();

defineEmits<{
  (e: 'stepClick', step: number): void;
}>();

function canNavigateTo(stepNumber: number): boolean {
  if (stepNumber === 1) return true;
  if (stepNumber === 2) return Boolean(props.hasDietData);
  if (stepNumber === 3) return Boolean(props.hasDietData);
  if (stepNumber === 4) return Boolean(props.hasDietData);
  if (stepNumber === 5) return Boolean(props.hasDietData);
  return false;
}

const steps = [
  { number: 1, label: 'Subir Dieta', icon: '📄' },
  { number: 2, label: 'Revisar', icon: '🔎' },
  { number: 3, label: 'Seleccionar Días', icon: '📅' },
  { number: 4, label: 'Estrategia', icon: '🛒' },
  { number: 5, label: 'Lista Final', icon: '🧾' },
];
</script>
