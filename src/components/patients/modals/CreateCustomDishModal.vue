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

      <div class="border-b border-slate-100 dark:border-white/10 pb-3">
        <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>🍲 Crear Nuevo Platillo en mi Biblioteca</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Construye tu receta con ingredientes exactos y guárdala para reutilizarla en cualquier plan futuro.
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Nombre del Platillo *</label>
          <input
            v-model="dish.nombre"
            type="text"
            required
            placeholder="ej. Tacos de bistec con nopales y frijoles"
            class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Porción *</label>
            <input
              v-model="dish.porcion"
              type="text"
              required
              placeholder="ej. 1 plato fuerte (3 tacos)"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Categoría</label>
            <select
              v-model="dish.categoria"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold cursor-pointer"
            >
              <option value="desayuno" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Desayuno</option>
              <option value="comida" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Comida</option>
              <option value="cena" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Cena</option>
              <option value="colacion_1" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Colación Matutina</option>
              <option value="colacion_2" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Colación Vespertina</option>
              <option value="snack" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Snack Opcional</option>
            </select>
          </div>
        </div>

        <!-- Structured Ingredients Builder Section -->
        <div class="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Colección de Ingredientes ({{ ingredientsList.length }})
            </label>
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Suma exacta de macros
            </span>
          </div>

          <!-- Ingredients List -->
          <div v-if="ingredientsList.length > 0" class="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            <div
              v-for="(ing, idx) in ingredientsList"
              :key="ing.id || idx"
              class="p-2.5 rounded-xl bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2.5 text-xs shadow-2xs"
            >
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900 dark:text-white truncate">{{ ing.nombre }}</p>
                <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-0.5">
                  <span class="text-slate-800 dark:text-slate-200">{{ ing.macros.calories }} kcal</span>
                  <span class="text-blue-500">{{ ing.macros.protein }}g P</span>
                  <span class="text-amber-500">{{ ing.macros.carbs }}g C</span>
                  <span class="text-rose-500">{{ ing.macros.fat }}g G</span>
                </div>
              </div>

              <!-- Quantity & Unit Input -->
              <div class="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1000"
                  v-model.number="ing.cantidad"
                  @input="handleQuantityChange(ing)"
                  class="w-16 px-2 py-1 bg-slate-50 dark:bg-black/20 border-2 border-emerald-500 rounded-xl text-center font-black text-xs text-slate-900 dark:text-white outline-none"
                />
                <input
                  type="text"
                  v-model="ing.unidad"
                  placeholder="unidad"
                  class="w-20 px-2 py-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/15 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              <!-- Remove button -->
              <button
                type="button"
                @click="removeIngredient(idx)"
                class="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                title="Quitar ingrediente"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-else class="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
            Sin ingredientes añadidos aún. Busca un alimento abajo para agregarlo a la receta.
          </div>

          <!-- Search to add ingredient -->
          <div class="space-y-1.5 pt-2">
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                @input="handleSearchInput"
                type="text"
                placeholder="Buscar ingrediente en FatSecret / Catálogo SMAE (ej. bistec, nopales, tortillas)..."
                class="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-2xs"
              />
              <Loader2 v-if="isSearching" class="w-4 h-4 animate-spin text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <!-- Search Results Dropdown -->
            <div 
              v-if="searchResults.length > 0"
              class="max-h-44 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#201f22] shadow-xl p-1.5 space-y-1 scrollbar-thin"
            >
              <div
                v-for="item in searchResults"
                :key="item.id"
                @click="selectAndAddIngredient(item)"
                class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 dark:text-white truncate">{{ item.nombre }}</span>
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
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold">
                    + Añadir
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Macros Grid (Auto calculated from ingredients, but manually adjustable) -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Macros Totales Calculados
            </span>
            <span class="text-[10px] text-slate-400">Calculados automáticamente</span>
          </div>

          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <label class="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Calorías</label>
              <input
                v-model.number="dish.macros.calories"
                type="number"
                required
                class="w-full text-center py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-blue-500 mb-0.5">Proteína</label>
              <input
                v-model.number="dish.macros.protein"
                type="number"
                step="0.5"
                required
                class="w-full text-center py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-amber-500 mb-0.5">Carbos</label>
              <input
                v-model.number="dish.macros.carbs"
                type="number"
                step="0.5"
                required
                class="w-full text-center py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase text-rose-500 mb-0.5">Grasas</label>
              <input
                v-model.number="dish.macros.fat"
                type="number"
                step="0.5"
                required
                class="w-full text-center py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400"
              />
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-end gap-2.5">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer"
          >
            Guardar y Asignar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { X, Search, Trash2, Loader2 } from 'lucide-vue-next';
import type { DishItem, MealTimeKey, DishIngredient } from '../../../types/dietMenu';
import { useFoodsStore } from '../../../stores/foods';
import { IngredientSearchService, type IngredientSearchResult } from '../../../services/nutrition/IngredientSearchService';

const props = defineProps<{
  initialCategory?: MealTimeKey;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', dish: DishItem): void;
}>();

const foodsStore = useFoodsStore();

const dish = reactive<Omit<DishItem, 'id'>>({
  nombre: '',
  porcion: '',
  categoria: props.initialCategory || 'desayuno',
  ingredientes: [],
  ingredientesDetalle: [],
  macros: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  },
  esPersonalizado: true
});

const ingredientsList = ref<DishIngredient[]>([]);

const searchQuery = ref('');
const searchResults = ref<IngredientSearchResult[]>([]);
const isSearching = ref(false);
let searchDebounce: any = null;

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

  ingredientsList.value.push(newIng);
  searchQuery.value = '';
  searchResults.value = [];
  recalculateDishTotals();
}

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

  recalculateDishTotals();
}

function removeIngredient(index: number) {
  ingredientsList.value.splice(index, 1);
  recalculateDishTotals();
}

function recalculateDishTotals() {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  ingredientsList.value.forEach(ing => {
    calories += ing.macros.calories;
    protein += ing.macros.protein;
    carbs += ing.macros.carbs;
    fat += ing.macros.fat;
  });

  dish.macros.calories = Math.round(calories);
  dish.macros.protein = +(protein.toFixed(1));
  dish.macros.carbs = +(carbs.toFixed(1));
  dish.macros.fat = +(fat.toFixed(1));
}

async function handleSubmit() {
  if (!dish.nombre.trim()) return;

  const stringIngredients = ingredientsList.value.map(ing => 
    `${ing.cantidad} ${ing.unidad} ${ing.nombre}`.replace(/\s+/g, ' ').trim()
  );

  const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const createdDish: DishItem = {
    ...dish,
    id: newId,
    ingredientes: stringIngredients,
    ingredientesDetalle: JSON.parse(JSON.stringify(ingredientsList.value))
  };

  // Guardar en Firestore para reutilización futura en la biblioteca de la nutrióloga
  try {
    await foodsStore.saveFood({
      name: createdDish.nombre,
      description: `${createdDish.porcion} • ${stringIngredients.join(', ')}`,
      macros: {
        calories: createdDish.macros.calories,
        protein: createdDish.macros.protein,
        carbs: createdDish.macros.carbs,
        fat: createdDish.macros.fat,
        sugar: 0
      }
    });
  } catch (err) {
    console.warn('Could not save to Firestore foods library:', err);
  }

  emit('created', createdDish);
}
</script>
