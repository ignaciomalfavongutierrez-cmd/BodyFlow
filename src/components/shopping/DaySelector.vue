<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-4 transition-colors">
      <div class="flex items-center space-x-2">
        <span class="text-2xl">📅</span>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">SELECCIONAR DÍAS Y HORIZONTE DE COMPRA</h2>
      </div>
      <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
        Elige los días de tu plan nutricional que deseas incluir y el periodo total para el que harás tus compras. Si tu dieta es de 3, 5 o 7 días, puedes multiplicarla para 2 semanas (14 días), 3 semanas o 1 mes completo (28 días).
      </p>

      <!-- Multiplier / Horizon Selector -->
      <div class="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            ⏱️ ¿Para cuánto tiempo vas a comprar?
          </span>
          <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
            Multiplicador: ×{{ multiplier }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="opt in horizonOptions"
            :key="opt.multiplier"
            @click="setMultiplier(opt.multiplier)"
            type="button"
            class="p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between"
            :class="[
              multiplier === opt.multiplier
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-300 dark:ring-emerald-700'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black">{{ opt.label }}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300" :class="multiplier === opt.multiplier ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100' : ''">
                ×{{ opt.multiplier }}
              </span>
            </div>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{{ opt.description }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Day Shortcuts -->
      <div class="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/10">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Días del menú:</span>
        <button
          @click="selectAll"
          type="button"
          class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800/40"
        >
          ✓ Seleccionar Todos ({{ availableDays.length }} días)
        </button>
        <button
          @click="deselectAll"
          type="button"
          class="px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 rounded-lg text-xs font-semibold transition-colors border border-slate-200 dark:border-white/10"
        >
          ✕ Deseleccionar Todos
        </button>
      </div>
    </div>

    <!-- Days Selection Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
      <label
        v-for="day in availableDays"
        :key="day"
        class="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all select-none bg-white dark:bg-[#18181b]"
        :class="[
          selectedDays.includes(day)
            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-sm'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400 opacity-70'
        ]"
      >
        <input
          type="checkbox"
          :value="day"
          :checked="selectedDays.includes(day)"
          @change="toggleDay(day)"
          class="absolute top-2 right-2 w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-white/20 focus:ring-emerald-500"
        />
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Día</span>
        <span class="text-2xl font-black mt-1">{{ day }}</span>
      </label>
    </div>

    <!-- Summary Banner -->
    <div class="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="flex items-center space-x-3">
        <span class="text-2xl">🛒</span>
        <div>
          <h4 class="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">Resumen de Compras</h4>
          <p class="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
            Menú de <strong class="font-bold text-emerald-950 dark:text-white">{{ selectedDays.length }} días</strong> seleccionados × <strong class="font-bold text-emerald-950 dark:text-white">{{ multiplier }} {{ multiplier === 1 ? 'ciclo' : 'ciclos' }}</strong> = Comprando para <strong class="font-bold text-emerald-950 dark:text-white underline">{{ selectedDays.length * multiplier }} días</strong> de porciones.
          </p>
        </div>
      </div>
      <div v-if="multiplier > 1" class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-black/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-xl whitespace-nowrap">
        ⚡ Porciones calculadas ×{{ multiplier }}
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-between items-center bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      <div class="text-xs text-slate-600 dark:text-slate-400 font-semibold">
        Días base: <span class="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{{ selectedDays.length }}</span> de {{ availableDays.length }}
      </div>
      <div class="flex space-x-3">
        <button
          @click="$emit('back')"
          type="button"
          class="px-4 py-2 border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
        >
          ← Volver a Revisión
        </button>
        <button
          @click="$emit('continue')"
          type="button"
          :disabled="selectedDays.length === 0"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          Estrategia de Compra →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    availableDays: number[];
    selectedDays: number[];
    multiplier?: number;
  }>(),
  {
    multiplier: 1,
  }
);

const emit = defineEmits<{
  (e: 'update:selectedDays', days: number[]): void;
  (e: 'update:multiplier', multiplier: number): void;
  (e: 'back'): void;
  (e: 'continue'): void;
}>();

const horizonOptions = computed(() => {
  const baseCount = props.availableDays.length || 7;
  return [
    { multiplier: 1, label: `${baseCount} Días (1 Semana)`, description: '1 ciclo de menú' },
    { multiplier: 2, label: `${baseCount * 2} Días (2 Semanas)`, description: '2 ciclos (porciones ×2)' },
    { multiplier: 3, label: `${baseCount * 3} Días (3 Semanas)`, description: '3 ciclos (porciones ×3)' },
    { multiplier: 4, label: `${baseCount * 4} Días (1 Mes)`, description: '4 ciclos (porciones ×4)' },
  ];
});

function setMultiplier(val: number) {
  emit('update:multiplier', val);
  // Also ensure all available days are selected when setting horizon if none were selected
  if (props.selectedDays.length === 0) {
    selectAll();
  }
}

function toggleDay(day: number) {
  const current = [...props.selectedDays];
  const index = current.indexOf(day);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(day);
  }
  emit('update:selectedDays', current.sort((a, b) => a - b));
}

function selectAll() {
  emit('update:selectedDays', [...props.availableDays]);
}

function deselectAll() {
  emit('update:selectedDays', []);
}
</script>
