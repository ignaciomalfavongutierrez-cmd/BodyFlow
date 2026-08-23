<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-[#18181b] rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden transition-colors">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
        <div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">📊 Auditoría de Datos Detectados</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Comparativa exacta entre el texto del PDF e interpretación del sistema.</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl px-2">✕</button>
      </div>

      <!-- Table Body -->
      <div class="p-6 overflow-y-auto space-y-4">
        <div v-for="categoryGroup in result.categories" :key="categoryGroup.category.id" class="space-y-2">
          <h4 class="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            {{ categoryGroup.category.name }}
          </h4>

          <div class="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden text-xs">
            <table class="w-full text-left">
              <thead class="bg-slate-100 dark:bg-white/5 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th class="p-2.5">Ingrediente</th>
                  <th class="p-2.5">Origen (Día/Comida)</th>
                  <th class="p-2.5">Nombre Original PDF</th>
                  <th class="p-2.5 text-right">Cantidad Base</th>
                  <th class="p-2.5 text-right">Merma 10%</th>
                  <th class="p-2.5 text-right">Compra Sugerida</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                <tr v-for="item in categoryGroup.items" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td class="p-2.5 font-bold text-slate-900 dark:text-white">{{ item.normalized_name }}</td>
                  <td class="p-2.5 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <div v-for="(src, idx) in item.sources" :key="idx">
                      Día {{ src.day }} - {{ src.meal }}
                    </div>
                  </td>
                  <td class="p-2.5 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                    <div v-for="(src, idx) in item.sources" :key="idx">
                      "{{ src.original_name }}"
                    </div>
                  </td>
                  <td class="p-2.5 text-right font-mono">{{ item.calculated_quantity }} {{ item.unit }}</td>
                  <td class="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ item.quantity_with_waste }} {{ item.unit }}</td>
                  <td class="p-2.5 text-right font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5">{{ item.purchase_quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-right">
        <button @click="$emit('close')" class="px-4 py-2 bg-slate-800 dark:bg-white/15 hover:bg-slate-900 dark:hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-slate-700 dark:border-white/15">
          Cerrar Auditoría
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShoppingListCalculationResult  } from '../../types/shoppingDiet';

defineProps<{
  isOpen: boolean;
  result: ShoppingListCalculationResult;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>
