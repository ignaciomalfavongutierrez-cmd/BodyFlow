<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
    <div class="max-w-2xl w-full p-6 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white transition-all space-y-4">
      
      <!-- Close Button -->
      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl cursor-pointer"
        title="Cerrar"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Header -->
      <div class="border-b border-slate-100 dark:border-white/10 pb-3">
        <div class="flex items-center gap-2">
          <SlidersHorizontal class="w-5 h-5 text-emerald-500" />
          <h3 class="text-base font-black text-slate-900 dark:text-white">
            Personalizar Porciones e Ingredientes
          </h3>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ajusta cantidades o sustituye ingredientes en <strong>{{ dish.nombre }}</strong> ({{ dayName }}). Los macros se recalculan automáticamente.
        </p>
      </div>

      <!-- Live Dynamic Macros Comparator Header -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Macros Totales del Platillo</span>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-slate-500">Original: {{ originalMacros.calories }} kcal</span>
            <span 
              class="text-[10px] font-black px-2 py-0.5 rounded-md"
              :class="totalKcalDiff === 0 ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300' : (totalKcalDiff < 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300')"
            >
              {{ totalKcalDiff > 0 ? `+${totalKcalDiff} kcal` : (totalKcalDiff < 0 ? `${totalKcalDiff} kcal` : 'Sin variación') }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="p-2 rounded-xl bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/10 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-slate-400">Calorías</span>
            <span class="text-sm font-black text-slate-900 dark:text-white">{{ recalculatedMacros.calories }} kcal</span>
          </div>
          <div class="p-2 rounded-xl bg-blue-500/5 border border-blue-500/20 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-blue-500">Proteína</span>
            <span class="text-sm font-black text-blue-600 dark:text-blue-400">{{ recalculatedMacros.protein }}g</span>
          </div>
          <div class="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-amber-500">Carbos</span>
            <span class="text-sm font-black text-amber-600 dark:text-amber-400">{{ recalculatedMacros.carbs }}g</span>
          </div>
          <div class="p-2 rounded-xl bg-rose-500/5 border border-rose-500/20 shadow-2xs">
            <span class="block text-[9px] uppercase font-bold text-rose-500">Grasas</span>
            <span class="text-sm font-black text-rose-600 dark:text-rose-400">{{ recalculatedMacros.fat }}g</span>
          </div>
        </div>
      </div>

      <!-- Ingredients List & Editor -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Ingredientes y Porciones ({{ editableIngredients.length }})
          </label>
          <span class="text-[10px] text-slate-400">Edita el número para escalar los macros</span>
        </div>

        <div class="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          <div
            v-for="(ing, idx) in editableIngredients"
            :key="ing.id || idx"
            class="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
          >
            <!-- Left: Ingredient Name & Mini Macros -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-900 dark:text-white truncate">{{ ing.nombre }}</p>
              <div class="flex items-center gap-2 pt-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span class="text-slate-800 dark:text-slate-200">{{ ing.macros.calories }} kcal</span>
                <span class="text-blue-500">{{ ing.macros.protein }}g P</span>
                <span class="text-amber-500">{{ ing.macros.carbs }}g C</span>
                <span class="text-rose-500">{{ ing.macros.fat }}g G</span>
              </div>
            </div>

            <!-- Middle: Editable Quantity & Unit -->
            <div class="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                v-model.number="ing.cantidad"
                @input="handleQuantityChange(ing)"
                class="w-16 px-2 py-1 bg-white dark:bg-[#201f22] border-2 border-emerald-500 rounded-xl text-center font-black text-xs text-slate-900 dark:text-white outline-none"
              />
              <input
                type="text"
                v-model="ing.unidad"
                placeholder="unidad"
                class="w-20 px-2 py-1 bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/15 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 outline-none"
              />
            </div>

            <!-- Right: Remove Ingredient -->
            <button
              type="button"
              @click="removeIngredient(idx)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
              title="Quitar este ingrediente"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div v-if="editableIngredients.length === 0" class="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
            No hay ingredientes asignados. Agrega uno con el buscador inferior.
          </div>
        </div>
      </div>

      <!-- Add / Substitute Ingredient Search Bar -->
      <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>+ Agregar / Sustituir con Otro Ingrediente</span>
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">FatSecret API & Catálogo SMAE</span>
        </label>

        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            type="text"
            placeholder="Buscar alimento (ej. clara de huevo, aguacate, pechuga, avena)..."
            class="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
          <Loader2 v-if="isSearching" class="w-4 h-4 animate-spin text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Search Results Dropdown -->
        <div 
          v-if="searchResults.length > 0"
          class="max-h-44 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#201f22] shadow-lg p-1.5 space-y-1 scrollbar-thin"
        >
          <div
            v-for="item in searchResults"
            :key="item.id"
            @click="selectAndAddIngredient(item)"
            class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between gap-2"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ item.nombre }}</span>
                <span 
                  class="text-[8px] font-black uppercase px-1.5 py-0.2 rounded"
                  :class="item.fuente === 'fatsecret' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : (item.fuente === 'local' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400')"
                >
                  {{ item.fuente === 'fatsecret' ? 'FatSecret' : (item.fuente === 'local' ? 'Caché BD' : 'SMAE') }}
                </span>
              </div>
              <p class="text-[10px] text-slate-400">{{ item.porcion }}</p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {{ item.macros.calories }} kcal
              </span>
              <span class="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500">
                + Añadir
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Options (Save as new in library) -->
      <div class="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer">
          <input
            type="checkbox"
            v-model="saveAsNewInLibrary"
            class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <div class="text-xs">
            <span class="font-bold text-slate-900 dark:text-white">⭐ Guardar además como nueva comida en mi Biblioteca</span>
            <p class="text-[10px] text-slate-400">Podrás reutilizar este platillo personalizado con estas porciones en cualquier plan futuro.</p>
          </div>
        </label>

        <div v-if="saveAsNewInLibrary" class="pt-1">
          <input
            v-model="customDishName"
            type="text"
            placeholder="Nombre para la nueva comida en biblioteca (ej. Omelette 1 huevo + 1 clara)"
            class="w-full px-3 py-1.5 bg-white dark:bg-[#201f22] border-2 border-emerald-500/40 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <!-- Footer Action Buttons -->
      <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleSave"
          class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <Check class="w-4 h-4 stroke-[3]" />
          <span>Aplicar Cambios</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, SlidersHorizontal, Trash2, Search, Loader2, Check } from 'lucide-vue-next';
import type { DishItem, DishIngredient } from '../../../types/dietMenu';
import { IngredientSearchService, type IngredientSearchResult } from '../../../services/nutrition/IngredientSearchService';

const props = defineProps<{
  dish: DishItem;
  mealCategory: string;
  dayName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { updatedDish: DishItem; saveAsNewInLibrary: boolean; customDishName?: string }): void;
}>();

// Clone ingredients to editable structure
const editableIngredients = ref<DishIngredient[]>(
  IngredientSearchService.ensureDishIngredients(props.dish)
);

const originalMacros = { ...props.dish.macros };

const saveAsNewInLibrary = ref(false);
const customDishName = ref(`${props.dish.nombre} (Personalizado)`);

const searchQuery = ref('');
const searchResults = ref<IngredientSearchResult[]>([]);
const isSearching = ref(false);
let searchDebounce: any = null;

// Real-time macro recalculation based on current ingredients and quantities
const recalculatedMacros = computed(() => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  editableIngredients.value.forEach(ing => {
    calories += ing.macros?.calories || 0;
    protein += ing.macros?.protein || 0;
    carbs += ing.macros?.carbs || 0;
    fat += ing.macros?.fat || 0;
  });

  return {
    calories: Math.round(calories),
    protein: +(protein.toFixed(1)),
    carbs: +(carbs.toFixed(1)),
    fat: +(fat.toFixed(1))
  };
});

const totalKcalDiff = computed(() => {
  return recalculatedMacros.value.calories - originalMacros.calories;
});

function handleQuantityChange(ing: DishIngredient) {
  if (!ing.baseMacros) {
    ing.baseMacros = {
      calories: ing.macros.calories / (ing.cantidad || 1),
      protein: ing.macros.protein / (ing.cantidad || 1),
      carbs: ing.macros.carbs / (ing.cantidad || 1),
      fat: ing.macros.fat / (ing.cantidad || 1)
    };
  }

  const qty = Math.max(0.05, ing.cantidad || 1);
  ing.macros.calories = Math.round(ing.baseMacros.calories * qty);
  ing.macros.protein = +(ing.baseMacros.protein * qty).toFixed(1);
  ing.macros.carbs = +(ing.baseMacros.carbs * qty).toFixed(1);
  ing.macros.fat = +(ing.baseMacros.fat * qty).toFixed(1);
}

function removeIngredient(index: number) {
  editableIngredients.value.splice(index, 1);
}

function handleSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  searchDebounce = setTimeout(async () => {
    try {
      searchResults.value = await IngredientSearchService.searchIngredients(searchQuery.value);
    } catch (err) {
      console.error('Error buscando ingredientes:', err);
    } finally {
      isSearching.value = false;
    }
  }, 400);
}

async function selectAndAddIngredient(item: IngredientSearchResult) {
  // Auto-cache to Firestore if coming from FatSecret
  if (item.fuente === 'fatsecret') {
    await IngredientSearchService.autoCacheFatSecretFood(item);
  }

  const newIng: DishIngredient = {
    id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    nombre: item.nombre,
    cantidad: 1,
    unidad: item.porcion || 'porción',
    macros: { ...item.macros },
    baseMacros: { ...item.macros }
  };

  editableIngredients.value.push(newIng);
  searchQuery.value = '';
  searchResults.value = [];
}

function handleSave() {
  // Generate description and string list from structured ingredients
  const stringIngredients = editableIngredients.value.map(ing => 
    `${ing.cantidad} ${ing.unidad} ${ing.nombre}`.replace(/\s+/g, ' ').trim()
  );

  const updatedDish: DishItem = {
    ...props.dish,
    ingredientes: stringIngredients,
    ingredientesDetalle: JSON.parse(JSON.stringify(editableIngredients.value)),
    macros: {
      calories: recalculatedMacros.value.calories,
      protein: recalculatedMacros.value.protein,
      carbs: recalculatedMacros.value.carbs,
      fat: recalculatedMacros.value.fat
    }
  };

  emit('save', {
    updatedDish,
    saveAsNewInLibrary: saveAsNewInLibrary.value,
    customDishName: customDishName.value.trim() || updatedDish.nombre
  });
}
</script>
