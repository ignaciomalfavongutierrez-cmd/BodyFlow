<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[75] flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-md p-0 sm:p-4 select-none"
        @click.self="close"
      >
        <!-- Modal Dialog Sheet (Mobile-First Tracking App Dark / Glass UI) -->
        <div 
          class="w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-[28px] sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-white transition-all pb-safe"
          style="background: #0f1015; box-shadow: 0 0 50px rgba(0,0,0,0.8), 0 0 25px rgba(25, 232, 13, 0.08);"
        >
          <!-- Top Header Bar -->
          <div class="px-5 pt-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-black shadow-lg"
                style="background: var(--kinetic-glow, #19e80d);"
              >
                <Scale class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-black text-sm sm:text-base tracking-wide text-white" style="font-family: var(--font-display);">
                    Equivalencias SMAE
                  </h3>
                  <span class="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#87ff70] border border-emerald-500/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#19e80d] animate-pulse"></span>
                    100% Offline
                  </span>
                </div>
                <p class="text-[11px] text-gray-400">
                  Intercambio de alimentos y porciones oficiales
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Quick PDF Download Button -->
              <button
                @click="downloadPdfDirect"
                :disabled="isDownloadingPdf"
                class="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-black transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                style="background: var(--kinetic-glow, #19e80d);"
                title="Descargar Guía Oficial en PDF"
              >
                <Loader2 v-if="isDownloadingPdf" class="w-3.5 h-3.5 animate-spin" />
                <Download v-else class="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <!-- Close Button -->
              <button 
                @click="close"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Mode Tabs (Buscador vs Calculadora de Intercambio) -->
          <div class="px-5 pt-3 pb-1 border-b border-white/5 bg-white/[0.01] shrink-0">
            <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
              <button
                @click="activeMode = 'search'"
                class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                :class="[
                  activeMode === 'search'
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                    : 'text-gray-400 hover:text-white'
                ]"
              >
                <Search class="w-3.5 h-3.5" />
                <span>Explorador & Grupos</span>
              </button>

              <button
                @click="activeMode = 'calculator'"
                class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                :class="[
                  activeMode === 'calculator'
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                    : 'text-gray-400 hover:text-white'
                ]"
              >
                <ArrowLeftRight class="w-3.5 h-3.5 text-[#87ff70]" />
                <span>Calculadora de Cambio</span>
              </button>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- MODE 1: EXPLORADOR Y BUSCADOR INTERACTIVO                -->
          <!-- ======================================================== -->
          <div v-if="activeMode === 'search'" class="flex-1 flex flex-col min-h-0">
            
            <!-- Search Bar + Category Chips Container -->
            <div class="p-4 pb-2 space-y-3 shrink-0">
              <!-- Search Input -->
              <div class="relative">
                <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Escribe para buscar (ej: tortilla, pollo, manzana, avena...)"
                  class="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Horizontal Scrolling Category Chips -->
              <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  @click="selectedCategory = 'all'"
                  class="px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border"
                  :class="[
                    selectedCategory === 'all'
                      ? 'bg-emerald-500/20 text-[#87ff70] border-emerald-500/50 shadow-xs'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                  ]"
                >
                  Todos ({{ totalFoodsCount }})
                </button>

                <button
                  v-for="group in SMAE_EQUIVALENCE_GROUPS"
                  :key="group.key"
                  @click="selectedCategory = group.key"
                  class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border flex items-center gap-1.5"
                  :class="[
                    selectedCategory === group.key
                      ? 'bg-emerald-500/20 text-[#87ff70] border-emerald-500/50 shadow-xs'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                  ]"
                >
                  <span>{{ group.icon }}</span>
                  <span>{{ group.nombre.split(' ')[0] }}</span>
                </button>
              </div>
            </div>

            <!-- Foods Feed (Scrollable) -->
            <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              
              <!-- Search Results Mode -->
              <div v-if="searchQuery.trim()" class="space-y-2">
                <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  Resultados para "{{ searchQuery }}" ({{ searchResults.length }})
                </div>

                <div 
                  v-for="res in searchResults" 
                  :key="res.food.id"
                  class="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-sm">{{ res.group.icon }}</span>
                      <h4 class="text-xs font-bold text-white truncate">{{ res.food.nombre }}</h4>
                      <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-white/10 text-gray-300 shrink-0">
                        {{ res.group.nombre.split(' ')[0] }}
                      </span>
                    </div>
                    <div class="text-[11px] text-[#87ff70] font-semibold">
                      Porción: {{ res.food.porcion }}
                    </div>
                    <p v-if="res.food.nota" class="text-[10px] text-gray-400 italic mt-0.5">
                      {{ res.food.nota }}
                    </p>
                  </div>

                  <button
                    @click="launchCalculatorWithFood(res.food, res.group)"
                    class="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-bold text-white transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Ver alimentos equivalentes a este"
                  >
                    <ArrowLeftRight class="w-3 h-3 text-[#87ff70]" />
                    <span>Cambiar</span>
                  </button>
                </div>

                <div v-if="searchResults.length === 0" class="py-12 text-center text-gray-400 text-xs">
                  <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2 text-gray-500">
                    <Search class="w-6 h-6" />
                  </div>
                  No encontramos alimentos con ese nombre en el catálogo SMAE.
                </div>
              </div>

              <!-- Group Cards View Mode -->
              <div v-else class="space-y-3">
                <div 
                  v-for="group in displayedGroups" 
                  :key="group.key"
                  class="p-3.5 rounded-2xl border transition-all"
                  :style="{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.08)'
                  }"
                >
                  <!-- Group Header -->
                  <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">{{ group.icon }}</span>
                      <div>
                        <h4 class="text-xs font-bold text-white">{{ group.nombre }}</h4>
                        <p class="text-[10px] text-gray-400">{{ group.reglaIntercambio }}</p>
                      </div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/10 text-[#87ff70] shrink-0">
                      ~{{ group.macrosPromedio.calories }} kcal
                    </span>
                  </div>

                  <!-- Food Grid for Group -->
                  <div class="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2">
                    <div 
                      v-for="food in group.alimentos" 
                      :key="food.id"
                      class="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
                    >
                      <div class="flex items-start justify-between gap-1.5">
                        <div class="text-[11px] font-bold text-gray-200 group-hover:text-white leading-tight">
                          {{ food.nombre }}
                        </div>
                        <button
                          @click="launchCalculatorWithFood(food, group)"
                          class="p-1 text-gray-500 hover:text-[#87ff70] transition-colors shrink-0"
                          title="Calcular intercambio"
                        >
                          <ArrowLeftRight class="w-3 h-3" />
                        </button>
                      </div>
                      <div class="mt-1.5 flex items-center justify-between text-[10px]">
                        <span class="text-[#87ff70] font-bold">{{ food.porcion }}</span>
                        <span v-if="food.subcategoria" class="text-gray-400 text-[9px]">{{ food.subcategoria }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- ======================================================== -->
          <!-- MODE 2: CALCULADORA DE INTERCAMBIO DINÁMICO              -->
          <!-- ======================================================== -->
          <div v-else-if="activeMode === 'calculator'" class="flex-1 flex flex-col min-h-0 p-4 space-y-4 overflow-y-auto">
            
            <!-- Step 1: Selector de alimento base -->
            <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-[#87ff70]" />
                  <span>¿Qué alimento tienes en tu plan?</span>
                </label>
                <span class="text-[10px] text-gray-400">Selecciona o busca</span>
              </div>

              <!-- Quick Selector Dropdown -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-2">
                  <select
                    v-model="calculatorSelectedFoodId"
                    class="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <optgroup v-for="g in SMAE_EQUIVALENCE_GROUPS" :key="g.key" :label="`${g.icon} ${g.nombre}`">
                      <option v-for="f in g.alimentos" :key="f.id" :value="f.id">
                        {{ f.nombre }} ({{ f.porcion }})
                      </option>
                    </optgroup>
                  </select>
                </div>

                <!-- Multiplier Chips -->
                <div class="flex items-center gap-1">
                  <button
                    v-for="mult in [0.5, 1, 2, 3]"
                    :key="mult"
                    @click="calculatorMultiplier = mult"
                    class="flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center"
                    :class="[
                      calculatorMultiplier === mult
                        ? 'bg-emerald-500/20 text-[#87ff70] border-emerald-500/60 shadow-xs'
                        : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
                    ]"
                  >
                    {{ mult }}x
                  </button>
                </div>
              </div>

              <!-- Selected Item Summary Banner -->
              <div v-if="currentCalculatorFood && currentCalculatorGroup" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ currentCalculatorGroup.icon }}</span>
                  <div>
                    <div class="font-extrabold text-white">
                      {{ calculatorMultiplier }}x {{ currentCalculatorFood.nombre }}
                    </div>
                    <div class="text-[10px] text-emerald-300">
                      Grupo: {{ currentCalculatorGroup.nombre }} (~{{ Math.round(currentCalculatorGroup.macrosPromedio.calories * calculatorMultiplier) }} kcal)
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-[10px] uppercase font-bold text-gray-400">Aporte estimado</div>
                  <div class="text-[11px] font-bold text-emerald-400">
                    {{ Math.round(currentCalculatorGroup.macrosPromedio.protein * calculatorMultiplier) }}g P • {{ Math.round(currentCalculatorGroup.macrosPromedio.carbs * calculatorMultiplier) }}g C • {{ Math.round(currentCalculatorGroup.macrosPromedio.fat * calculatorMultiplier) }}g G
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Alimentos equivalentes por los que puedes cambiarlo -->
            <div class="space-y-2">
              <div class="flex items-center justify-between px-1">
                <div class="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight class="w-3.5 h-3.5 text-[#87ff70]" />
                  <span>Opciones de Intercambio Equivalente:</span>
                </div>
                <span class="text-[10px] text-emerald-400 font-bold">Mismo valor nutricional</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  v-for="alt in alternativeFoods"
                  :key="alt.id"
                  class="p-3 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="text-xs font-bold text-white">{{ alt.nombre }}</div>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-semibold shrink-0">
                      {{ alt.subcategoria || 'Equivalente' }}
                    </span>
                  </div>

                  <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                    <div class="text-xs font-black text-[#87ff70]">
                      {{ formatScaledPortion(alt.porcion, calculatorMultiplier) }}
                    </div>
                    <span v-if="alt.nota" class="text-[9px] text-gray-400 italic">
                      {{ alt.nota }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Bar with PDF Download & Offline Notice -->
          <div class="px-5 py-3 border-t border-white/10 bg-black/60 flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck class="w-4 h-4 text-emerald-400 shrink-0" />
              <span class="hidden sm:inline">Catálogo oficial SMAE integrado en el dispositivo.</span>
              <span class="sm:hidden">Catálogo SMAE oficial.</span>
            </div>

            <button
              @click="downloadPdfDirect"
              :disabled="isDownloadingPdf"
              class="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 shadow-lg"
              style="background: var(--kinetic-glow, #19e80d);"
            >
              <Loader2 v-if="isDownloadingPdf" class="w-3.5 h-3.5 animate-spin" />
              <Download v-else class="w-3.5 h-3.5" />
              <span>Descargar Hoja en PDF</span>
            </button>
          </div>

        </div>

        <!-- Hidden container for off-screen PDF export rendered on demand -->
        <div id="offline-pdf-render-container" class="hidden-pdf-host">
          <EquivalenceSheet
            v-if="renderPdfSheet"
            patientName="Paciente BodyFlow"
            :isPrinting="true"
          />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { 
  Scale, 
  X, 
  Search, 
  ArrowLeftRight, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Loader2 
} from 'lucide-vue-next';
import { 
  SMAE_EQUIVALENCE_GROUPS, 
  searchEquivalences 
} from '../../catalog/nutrition/equivalencesCatalog';
import type { EquivalenceFoodItem, EquivalenceGroup } from '../../types/equivalences';
import EquivalenceSheet from './EquivalenceSheet.vue';
import { EquivalenceExportService } from '../../services/nutrition/EquivalenceExportService';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
  }>(),
  {
    isOpen: false
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const activeMode = ref<'search' | 'calculator'>('search');
const searchQuery = ref('');
const selectedCategory = ref<string>('all');
const isDownloadingPdf = ref(false);
const renderPdfSheet = ref(false);

// Calculadora de Intercambio
const calculatorSelectedFoodId = ref<string>('c-tortilla-maiz');
const calculatorMultiplier = ref<number>(1);

const totalFoodsCount = computed(() => {
  return SMAE_EQUIVALENCE_GROUPS.reduce((acc, g) => acc + g.alimentos.length, 0);
});

const displayedGroups = computed(() => {
  if (selectedCategory.value === 'all') {
    return SMAE_EQUIVALENCE_GROUPS;
  }
  return SMAE_EQUIVALENCE_GROUPS.filter(g => g.key === selectedCategory.value);
});

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  return searchEquivalences(searchQuery.value);
});

// Resuelve el alimento y grupo activo en la calculadora
const currentCalculatorGroup = computed<EquivalenceGroup | undefined>(() => {
  return SMAE_EQUIVALENCE_GROUPS.find(g =>
    g.alimentos.some(f => f.id === calculatorSelectedFoodId.value)
  );
});

const currentCalculatorFood = computed<EquivalenceFoodItem | undefined>(() => {
  if (!currentCalculatorGroup.value) return undefined;
  return currentCalculatorGroup.value.alimentos.find(f => f.id === calculatorSelectedFoodId.value);
});

// Opciones alternativas dentro del mismo grupo
const alternativeFoods = computed(() => {
  if (!currentCalculatorGroup.value || !currentCalculatorFood.value) return [];
  return currentCalculatorGroup.value.alimentos.filter(f => f.id !== currentCalculatorFood.value?.id);
});

function launchCalculatorWithFood(food: EquivalenceFoodItem, _group: EquivalenceGroup) {
  calculatorSelectedFoodId.value = food.id;
  calculatorMultiplier.value = 1;
  activeMode.value = 'calculator';
}

function formatScaledPortion(basePortion: string, multiplier: number): string {
  if (multiplier === 1) return basePortion;

  // Intenta escalar números simples en la porción (ej. "1 pieza" -> "2 piezas", "1/2 taza" -> "1 taza")
  if (basePortion.startsWith('1/2 taza') && multiplier === 2) return '1 taza completa';
  if (basePortion.startsWith('1/3 taza') && multiplier === 2) return '2/3 taza';
  if (basePortion.startsWith('1/3 taza') && multiplier === 3) return '1 taza completa';
  if (basePortion.startsWith('1 pieza') && multiplier === 2) return '2 piezas';
  if (basePortion.startsWith('1 pieza') && multiplier === 3) return '3 piezas';
  if (basePortion.startsWith('2 piezas') && multiplier === 2) return '4 piezas';

  return `${multiplier}x (${basePortion})`;
}

function close() {
  emit('close');
}

async function downloadPdfDirect() {
  if (isDownloadingPdf.value) return;
  isDownloadingPdf.value = true;
  renderPdfSheet.value = true;

  try {
    await nextTick();
    // Breve pausa para asegurar renderizado del DOM de la hoja
    await new Promise(resolve => setTimeout(resolve, 150));

    const sheetEl = document.getElementById('printable-equivalence-sheet');
    if (!sheetEl) throw new Error('No se encontró el elemento imprimible de la hoja');

    await EquivalenceExportService.exportSheetToPdf(sheetEl, 'Tracking');
  } catch (err: any) {
    console.error('Error al generar PDF offline:', err);
    alert('Error al descargar el PDF: ' + (err.message || err));
  } finally {
    isDownloadingPdf.value = false;
    renderPdfSheet.value = false;
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hidden-pdf-host {
  position: fixed;
  left: -99999px;
  top: 0;
  width: 850px;
  pointer-events: none;
  background: #fafbf7;
}
</style>
