<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🔎</span>
          <h2 class="text-2xl font-extrabold text-slate-800 dark:text-white">REVISAR DIETA DETECTADA</h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verifica y corrige la información interpretada antes de calcular la lista de compras.
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <button
          @click="addNewItem"
          class="px-3.5 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200 dark:border-white/10"
        >
          <span>＋ Agregar Ingrediente</span>
        </button>
        <button
          @click="$emit('continue')"
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
        >
          <span>Continuar a Selección de Días →</span>
        </button>
      </div>
    </div>

    <!-- Warnings Banner -->
    <div v-if="diet.warnings && diet.warnings.length > 0" class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 p-4 rounded-2xl text-xs space-y-1">
      <div class="font-bold flex items-center space-x-1">
        <span>⚠️ Advertencias detectadas:</span>
      </div>
      <ul class="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-300/80">
        <li v-for="(warn, idx) in diet.warnings" :key="idx">{{ warn }}</li>
      </ul>
    </div>

    <!-- Diet Title Input -->
    <div class="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-white/10 flex items-center space-x-3 transition-colors">
      <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre de la Dieta:</label>
      <input
        v-model="diet.diet_name"
        type="text"
        class="flex-1 px-3 py-1.5 border border-slate-300 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
      />
    </div>

    <!-- Main Items Table -->
    <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
          <thead>
            <tr class="bg-slate-100/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              <th class="py-3 px-4 w-16">Día</th>
              <th class="py-3 px-4 w-32">Comida</th>
              <th class="py-3 px-4">Original</th>
              <th class="py-3 px-4">Interpretado como</th>
              <th class="py-3 px-4 w-36">Categoría</th>
              <th class="py-3 px-4 w-24 text-right">Cantidad</th>
              <th class="py-3 px-4 w-28">Unidad</th>
              <th class="py-3 px-4 w-28">Estado</th>
              <th class="py-3 px-4 w-12 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <template v-for="day in diet.days" :key="day.day_number">
              <template v-for="meal in day.meals" :key="meal.meal_name">
                <tr v-for="item in meal.items" :key="item.id" class="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                  <!-- Day -->
                  <td class="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                    Día {{ item.source_day }}
                  </td>
                  <!-- Meal -->
                  <td class="py-2.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                    {{ item.source_meal }}
                  </td>
                  <!-- Original -->
                  <td class="py-2.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {{ item.original_name }}
                  </td>
                  <!-- Normalized Name Input -->
                  <td class="py-2.5 px-4">
                    <input
                      v-model="item.normalized_name"
                      type="text"
                      class="w-full px-2 py-1 border border-slate-200 dark:border-white/15 dark:bg-white/5 dark:text-white rounded text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </td>
                  <!-- Category Select -->
                  <td class="py-2.5 px-4">
                    <select
                      v-model="item.category_id"
                      class="w-full px-2 py-1 border border-slate-200 dark:border-white/15 rounded text-xs bg-white dark:bg-[#201f22] dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                      :class="{
                        'text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40': item.category_id === 'cat-3',
                        'text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/40': item.category_id === 'cat-7',
                        'text-red-700 dark:text-red-300 bg-red-50/60 dark:bg-red-950/40': item.category_id === 'cat-1',
                        'text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40': item.category_id === 'cat-2',
                        'text-pink-700 dark:text-pink-300 bg-pink-50/60 dark:bg-pink-950/40': item.category_id === 'cat-4',
                        'text-yellow-700 dark:text-yellow-300 bg-yellow-50/60 dark:bg-yellow-950/40': item.category_id === 'cat-5',
                        'text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40': item.category_id === 'cat-6',
                        'text-slate-700 dark:text-slate-300': !item.category_id || item.category_id === 'cat-8',
                      }"
                    >
                      <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.id" class="dark:bg-[#18181b] dark:text-white">
                        {{ cat.name }}
                      </option>
                    </select>
                  </td>
                  <!-- Quantity Input -->
                  <td class="py-2.5 px-4 text-right">
                    <input
                      :value="item.quantity"
                      @input="item.quantity = ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value)"
                      type="number"
                      step="any"
                      placeholder="Al gusto"
                      class="w-full px-2 py-1 border border-slate-200 dark:border-white/15 dark:bg-white/5 dark:text-white rounded text-xs text-right font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </td>
                  <!-- Unit Input -->
                  <td class="py-2.5 px-4">
                    <select
                      v-model="item.unit"
                      class="w-full px-2 py-1 border border-slate-200 dark:border-white/15 rounded text-xs bg-white dark:bg-[#201f22] dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="g" class="dark:bg-[#18181b] dark:text-white">g</option>
                      <option value="kg" class="dark:bg-[#18181b] dark:text-white">kg</option>
                      <option value="ml" class="dark:bg-[#18181b] dark:text-white">ml</option>
                      <option value="L" class="dark:bg-[#18181b] dark:text-white">L</option>
                      <option value="pieza" class="dark:bg-[#18181b] dark:text-white">pieza / piezas</option>
                      <option value="rebanada" class="dark:bg-[#18181b] dark:text-white">rebanada / rebanadas</option>
                      <option value="tortilla" class="dark:bg-[#18181b] dark:text-white">tortilla / tortillas</option>
                      <option value="lata" class="dark:bg-[#18181b] dark:text-white">lata / latas</option>
                      <option value="taza" class="dark:bg-[#18181b] dark:text-white">taza</option>
                      <option value="cucharada" class="dark:bg-[#18181b] dark:text-white">cucharada</option>
                      <option value="cucharadita" class="dark:bg-[#18181b] dark:text-white">cucharadita</option>
                      <option value="porción" class="dark:bg-[#18181b] dark:text-white">porción</option>
                      <option value="al gusto" class="dark:bg-[#18181b] dark:text-white">al gusto</option>
                      <option value="unspecified" class="dark:bg-[#18181b] dark:text-white">no especificada</option>
                    </select>
                  </td>
                  <!-- State Select -->
                  <td class="py-2.5 px-4">
                    <select
                      v-model="item.state"
                      class="w-full px-2 py-1 border border-slate-200 dark:border-white/15 rounded text-xs bg-white dark:bg-[#201f22] dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                      :class="item.state === 'cooked' ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-700 dark:text-slate-300'"
                    >
                      <option value="raw" class="dark:bg-[#18181b] dark:text-white">Crudo</option>
                      <option value="cooked" class="dark:bg-[#18181b] dark:text-white">Cocido</option>
                      <option value="prepared" class="dark:bg-[#18181b] dark:text-white">Preparado</option>
                      <option value="liquid" class="dark:bg-[#18181b] dark:text-white">Líquido</option>
                      <option value="piece" class="dark:bg-[#18181b] dark:text-white">Pieza</option>
                      <option value="unspecified" class="dark:bg-[#18181b] dark:text-white">No especificado</option>
                    </select>
                  </td>
                  <!-- Delete Button -->
                  <td class="py-2.5 px-4 text-center">
                    <button
                      @click="deleteItem(day.day_number, meal.meal_name, item.id)"
                      class="text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Eliminar ingrediente"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DietStructure, DietItem  } from '../../types/shoppingDiet';
import { CATEGORIES } from '../../catalog/shopping/categories';

const props = defineProps<{
  diet: DietStructure;
}>();

defineEmits<{
  (e: 'continue'): void;
}>();

function deleteItem(dayNum: number, mealName: string, itemId: string) {
  const day = props.diet.days.find((d) => d.day_number === dayNum);
  if (!day) return;
  const meal = day.meals.find((m) => m.meal_name === mealName);
  if (!meal) return;
  meal.items = meal.items.filter((i) => i.id !== itemId);
}

function addNewItem() {
  if (props.diet.days.length === 0) return;
  const targetDay = props.diet.days[0];
  if (targetDay.meals.length === 0) {
    targetDay.meals.push({ meal_name: 'Desayuno', items: [] });
  }
  const targetMeal = targetDay.meals[0];

  const newItem: DietItem = {
    id: `item-manual-${Date.now()}`,
    original_name: 'Nuevo ingrediente',
    normalized_name: 'Nuevo ingrediente',
    category_id: 'cat-1',
    category_name: 'Proteínas',
    quantity: 100,
    unit: 'g',
    state: 'raw',
    notes: null,
    source_day: targetDay.day_number,
    source_meal: targetMeal.meal_name,
  };

  targetMeal.items.push(newItem);
}
</script>
