<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm space-y-2 transition-colors">
      <div class="flex items-center space-x-2">
        <span class="text-2xl">🛒</span>
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white">ESTRATEGIA DE COMPRA</h2>
      </div>
      <p class="text-slate-500 dark:text-slate-400 text-xs">
        Selecciona el criterio comercial con el que se optimizarán las sugerencias de compra.
      </p>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="strategy in strategies"
        :key="strategy.id"
        @click="$emit('update:selectedStrategy', strategy.id)"
        class="relative bg-white dark:bg-[#18181b] p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 space-y-3 select-none"
        :class="[
          selectedStrategy === strategy.id
            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-4 ring-emerald-100 dark:ring-emerald-900/40 shadow-md'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 hover:shadow-sm'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">{{ strategy.icon }}</span>
            <div>
              <h3 class="font-extrabold text-slate-800 dark:text-white text-base">{{ strategy.name }}</h3>
              <span v-if="strategy.isDefault" class="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700/50">
                Predeterminada
              </span>
            </div>
          </div>
          <div
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="selectedStrategy === strategy.id ? 'border-emerald-600 bg-emerald-600 dark:bg-emerald-500 text-white' : 'border-slate-300 dark:border-white/20'"
          >
            <span v-if="selectedStrategy === strategy.id" class="text-xs font-bold">✓</span>
          </div>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          "{{ strategy.description }}"
        </p>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-between items-center bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      <button
        @click="$emit('back')"
        class="px-4 py-2 border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
      >
        ← Volver a Días
      </button>
      <button
        @click="$emit('generate')"
        class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
      >
        <span>⚡ Generar Lista de Compras</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseStrategy  } from '../../types/shoppingDiet';

defineProps<{
  selectedStrategy: PurchaseStrategy;
}>();

defineEmits<{
  (e: 'update:selectedStrategy', strategy: PurchaseStrategy): void;
  (e: 'back'): void;
  (e: 'generate'): void;
}>();

const strategies = [
  {
    id: 'value' as PurchaseStrategy,
    name: 'CALIDAD / PRECIO',
    icon: '⚖️',
    isDefault: true,
    description: 'Busca el mejor equilibrio entre precio, calidad y características del producto.',
  },
  {
    id: 'economic' as PurchaseStrategy,
    name: 'ECONÓMICA',
    icon: '🏷️',
    isDefault: false,
    description: 'Prioriza el menor precio posible cumpliendo los estándares mínimos.',
  },
  {
    id: 'premium' as PurchaseStrategy,
    name: 'PREMIUM',
    icon: '⭐',
    isDefault: false,
    description: 'Prioriza productos de gama alta y características premium.',
  },
  {
    id: 'neutral' as PurchaseStrategy,
    name: 'SIN PREFERENCIA',
    icon: '🔄',
    isDefault: false,
    description: 'No prioriza una categoría comercial.',
  },
];
</script>
