<template>
  <div class="max-w-lg mx-auto my-10 bg-white dark:bg-[#18181b] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-2xl space-y-6 transition-all">
    
    <!-- Top Animated Icon & Title -->
    <div class="text-center space-y-3">
      <div class="relative w-20 h-20 mx-auto">
        <div class="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40 animate-ping opacity-60"></div>
        <div class="relative w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner">
          <span class="animate-bounce">{{ currentPhase.icon }}</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/40">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{{ Math.round(progressPercent) }}% Completado</span>
        </div>
        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          {{ currentPhase.title }}
        </h3>
        <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
          {{ currentPhase.description }}
        </p>
      </div>
    </div>

    <!-- Dynamic Animated Progress Bar -->
    <div class="space-y-2">
      <div class="h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-white/5">
        <div
          class="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full transition-all duration-300 ease-out shadow-xs"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
      <div class="flex justify-between items-center text-[10.5px] text-slate-400 dark:text-slate-500 font-mono font-medium px-1">
        <span>Extracción de archivo</span>
        <span class="text-emerald-600 dark:text-emerald-400 font-bold font-sans">IA Google Gemini</span>
        <span>Estructuración final</span>
      </div>
    </div>

    <!-- Multi-Stage Checklist -->
    <div class="space-y-2 bg-slate-50/70 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/70 dark:border-white/5">
      <div
        v-for="(step, idx) in analysisSteps"
        :key="step.id"
        class="flex items-center justify-between text-xs py-1 transition-all"
        :class="[
          progressPercent >= step.targetPercent
            ? 'text-slate-800 dark:text-slate-200 font-medium'
            : currentStepIndex === idx
            ? 'text-emerald-700 dark:text-emerald-300 font-bold'
            : 'text-slate-400 dark:text-slate-600 opacity-60'
        ]"
      >
        <div class="flex items-center space-x-2.5">
          <span class="text-sm">{{ step.icon }}</span>
          <span>{{ step.label }}</span>
        </div>

        <div class="flex items-center">
          <span v-if="progressPercent >= step.targetPercent" class="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            ✓ Listo
          </span>
          <span v-else-if="currentStepIndex === idx" class="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] animate-pulse flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Procesando...
          </span>
          <span v-else class="text-slate-300 dark:text-slate-700 text-[11px]">
            Pendiente
          </span>
        </div>
      </div>
    </div>

    <!-- Rotating Nutritionist Shopping Tips Banner -->
    <div class="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl text-center">
      <p class="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium transition-opacity duration-300">
        {{ currentTip }}
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const progressPercent = ref(12);
let timer: ReturnType<typeof setInterval> | null = null;
let tipTimer: ReturnType<typeof setInterval> | null = null;

const analysisSteps = [
  { id: 1, label: 'Lectura y extracción de datos del archivo', icon: '📄', targetPercent: 25 },
  { id: 2, label: 'Conexión con Gemini IA & análisis del menú', icon: '🤖', targetPercent: 50 },
  { id: 3, label: 'Identificación de días, comidas e ingredientes', icon: '🥗', targetPercent: 75 },
  { id: 4, label: 'Normalización de gramajes y porciones', icon: '⚖️', targetPercent: 90 },
  { id: 5, label: 'Generación y optimización de despensa', icon: '🛒', targetPercent: 100 },
];

const shoppingTips = [
  '💡 Tip: Las compras en pollería y carnicería local rinden más y tienen mejor precio por kilo que el súper.',
  '💡 Tip: El atún Dolores en agua y el huevo son las fuentes de proteína con mejor costo-beneficio.',
  '💡 Tip: Las marcas propias de Bodega Aurrera (Aurrera y Great Value) optimizan al máximo tu presupuesto.',
  '💡 Tip: Si tu plan tiene verduras genéricas o mixtas, la IA las desglosará en porciones individuales.',
  '💡 Tip: Las frutas y verduras de temporada en tianguis o mercado local garantizan frescura y ahorro.',
];

const currentTipIndex = ref(0);
const currentTip = computed(() => shoppingTips[currentTipIndex.value]);

const currentStepIndex = computed(() => {
  if (progressPercent.value < 25) return 0;
  if (progressPercent.value < 50) return 1;
  if (progressPercent.value < 75) return 2;
  if (progressPercent.value < 90) return 3;
  return 4;
});

const currentPhase = computed(() => {
  const p = progressPercent.value;
  if (p < 25) {
    return {
      title: 'Extrayendo contenido...',
      description: 'Decodificando tablas, textos y elementos del documento proporcionado.',
      icon: '📑',
    };
  } else if (p < 50) {
    return {
      title: 'Procesando con Gemini IA...',
      description: 'Analizando estructura clínica, equivalentes y tiempos de comida.',
      icon: '🧠',
    };
  } else if (p < 75) {
    return {
      title: 'Detectando ingredientes...',
      description: 'Desglosando porciones, separando mezclas de verduras y clasificando categorías.',
      icon: '🥗',
    };
  } else if (p < 92) {
    return {
      title: 'Normalizando cantidades...',
      description: 'Estandarizando gramos, piezas y unidades para la lista de compras.',
      icon: '⚖️',
    };
  } else {
    return {
      title: 'Generando tabla de revisión...',
      description: 'Estructurando los datos finales para tu validación nutricional.',
      icon: '✨',
    };
  }
});

onMounted(() => {
  // Smoothly increment progress using natural asymptotic progression
  timer = setInterval(() => {
    if (progressPercent.value < 94) {
      // Fast at beginning, gradual as it approaches completion
      const remaining = 95 - progressPercent.value;
      const step = Math.max(0.4, remaining * 0.08);
      progressPercent.value = Math.min(94.5, progressPercent.value + step);
    }
  }, 180);

  // Rotate tips every 3.5s
  tipTimer = setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % shoppingTips.length;
  }, 3500);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  if (tipTimer) clearInterval(tipTimer);
});
</script>
