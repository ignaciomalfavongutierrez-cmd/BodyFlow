<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
    <div 
      class="max-w-4xl w-full p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/15 shadow-2xl relative my-6 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white transition-all space-y-5"
    >
      <!-- Close Button -->
      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl cursor-pointer transition-colors"
        title="Cerrar modal"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- MODAL HEADER -->
      <div class="flex items-start gap-3 border-b border-slate-100 dark:border-white/10 pb-4 pr-10">
        <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
          <Sparkles class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Sugerencia de Platillo con IA
            </h3>
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Gemini 3.7 Flash
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Genera opciones gastronómicas reales calculadas con el SMAE, respetando restricciones clínicas y cuadrando los macros restantes.
          </p>
        </div>
      </div>

      <!-- SECTION 1: CLINICAL CONTEXT SENT TO GEMINI (TRANSPARENCY) -->
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3.5">
        
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldAlert class="w-3.5 h-3.5 text-emerald-500" />
            Datos Clínicos del Paciente que se enviarán a Gemini
          </span>
          <span class="text-[10px] font-bold text-slate-400">
            Día: <strong class="text-slate-700 dark:text-slate-200">{{ activeDayName }}</strong>
          </span>
        </div>

        <!-- Demographics and Clinical Badges -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <!-- Patient Summary -->
          <div class="p-3 rounded-xl bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/10 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-slate-800 dark:text-slate-100">
                👤 {{ patient.nombre }}
              </span>
              <span class="text-[10px] text-slate-500">
                {{ patient.edad ? `${patient.edad} años` : '' }} • {{ patient.sexo }}
              </span>
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              <strong>Objetivo:</strong> {{ patient.objetivoPrincipal || plan.objetivo || 'Alimentación saludable' }}
            </p>
          </div>

          <!-- Target Meal Time Selector -->
          <div class="p-3 rounded-xl bg-white dark:bg-[#201f22] border border-emerald-500/30 space-y-1.5 shadow-2xs">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                Tiempo de comida seleccionado:
              </label>
              <span class="text-xs">{{ currentSelectedMeal?.icon }}</span>
            </div>
            <select
              v-model="selectedMealKey"
              @change="handleMealTimeChange"
              class="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-black/30 border border-emerald-500/40 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option v-for="meal in availableMealTimes" :key="meal.key" :value="meal.key">
                {{ meal.icon }} {{ meal.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Clinical Restrictions Tags: Allergies, Dislikes, Favorites -->
        <div class="space-y-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
          <div class="flex items-center gap-2 flex-wrap text-[11px]">
            <span class="font-bold text-slate-500 shrink-0">Alergias / Intolerancias:</span>
            <div v-if="allAllergies.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="al in allAllergies"
                :key="al"
                class="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-extrabold flex items-center gap-1"
              >
                <AlertTriangle class="w-3 h-3 text-rose-500" />
                {{ al }}
              </span>
            </div>
            <span v-else class="text-slate-400 italic text-[10px]">Sin alergias reportadas (seguro)</span>
          </div>

          <div class="flex items-center gap-2 flex-wrap text-[11px]">
            <span class="font-bold text-slate-500 shrink-0">Alimentos que no le gustan:</span>
            <div v-if="dislikes.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="dis in dislikes"
                :key="dis"
                class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold"
              >
                ❌ {{ dis }}
              </span>
            </div>
            <span v-else class="text-slate-400 italic text-[10px]">Ninguno</span>
          </div>

          <div class="flex items-center gap-2 flex-wrap text-[11px]">
            <span class="font-bold text-slate-500 shrink-0">Alimentos favoritos:</span>
            <div v-if="favorites.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="fav in favorites"
                :key="fav"
                class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold"
              >
                ⭐ {{ fav }}
              </span>
            </div>
            <span v-else class="text-slate-400 italic text-[10px]">Abierto a sugerencias</span>
          </div>
        </div>

        <!-- Remaining Macro Target Cards -->
        <div class="pt-2 border-t border-slate-200/60 dark:border-white/5 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Macronutrientes objetivo que Gemini buscará cuadrar para este platillo:
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <!-- Calorías -->
            <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span class="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Calorías</span>
              <span class="text-sm font-black text-emerald-700 dark:text-emerald-300">
                ~{{ effectiveTargetKcal }} kcal
              </span>
            </div>
            <!-- Proteína -->
            <div class="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <span class="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Proteína</span>
              <span class="text-sm font-black text-blue-700 dark:text-blue-300">
                ~{{ effectiveTargetProtein }}g
              </span>
            </div>
            <!-- Carbohidratos -->
            <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span class="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Carbohidratos</span>
              <span class="text-sm font-black text-amber-700 dark:text-amber-300">
                ~{{ effectiveTargetCarbs }}g
              </span>
            </div>
            <!-- Grasas -->
            <div class="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span class="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Grasas</span>
              <span class="text-sm font-black text-rose-700 dark:text-rose-300">
                ~{{ effectiveTargetFat }}g
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- SECTION 2: CONFIGURATION CONTROLS (OPTIONS COUNT, CULINARY STYLE, NOTES) -->
      <div class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Number of Options Selector -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              ¿Cuántas opciones deseas generar?
            </label>
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="num in [1, 2, 3, 4]"
                :key="num"
                type="button"
                @click="optionsCount = num"
                class="py-2 rounded-xl text-xs font-black transition-all cursor-pointer border text-center flex flex-col items-center justify-center gap-0.5"
                :class="optionsCount === num 
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-500 shadow-sm ring-2 ring-emerald-500/30' 
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'"
              >
                <span>{{ num }} {{ num === 1 ? 'Opción' : 'Opciones' }}</span>
                <span v-if="num === 3" class="text-[8px] opacity-90 font-bold">Recomendado</span>
              </button>
            </div>
          </div>

          <!-- Culinary Focus Style -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Enfoque Culinario
            </label>
            <select
              v-model="culinaryStyle"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="mexicana_casera">🇲🇽 Mexicana Casera Tradicional (SMAE)</option>
              <option value="rapida">⚡ Rápida y Práctica (&lt; 15 min)</option>
              <option value="economica">💰 Económica y de Mercado</option>
              <option value="alta_proteina">💪 Alta en Proteína Magra</option>
              <option value="vegetariana">🌱 Vegetariana / Plant-based</option>
            </select>
          </div>

        </div>

        <!-- Custom Notes Textarea -->
        <div class="space-y-1">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Instrucciones o ingredientes específicos para Gemini (Opcional)
          </label>
          <input
            v-model="customNotes"
            type="text"
            placeholder="ej. Usar atún en lata y tostadas horneadas, o incluir huevo y salsa verde..."
            class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <!-- Collapsible Raw Prompt Audit -->
        <div class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
          <button
            type="button"
            @click="showPromptAudit = !showPromptAudit"
            class="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-white/[0.02] hover:bg-slate-200/60 dark:hover:bg-white/[0.05] flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <span class="flex items-center gap-2">
              <Eye class="w-3.5 h-3.5 text-emerald-500" />
              <span>Ver texto completo del prompt que se enviará a Gemini</span>
            </span>
            <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showPromptAudit }" />
          </button>
          
          <div v-if="showPromptAudit" class="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-56 scrollbar-thin">
            <pre class="whitespace-pre-wrap">{{ currentPreviewPrompt }}</pre>
          </div>
        </div>

      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- MAIN ACTION BUTTON / LOADING STATE -->
      <div>
        <button
          type="button"
          @click="handleGenerate"
          :disabled="isGenerating"
          class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isGenerating" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          <span>{{ isGenerating ? generatingStepText : `✨ Generar ${optionsCount} ${optionsCount === 1 ? 'Sugerencia' : 'Sugerencias'} con Gemini IA` }}</span>
        </button>
      </div>

      <!-- SECTION 3: GENERATED SUGGESTIONS RESULTS (WHEN READY) -->
      <div v-if="suggestions.length > 0" class="space-y-4 pt-4 border-t border-slate-100 dark:border-white/10">
        
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🍽️ Opciones generadas para {{ currentSelectedMeal?.label }}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                {{ suggestions.length }} {{ suggestions.length === 1 ? 'opción' : 'opciones' }}
              </span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Revisa los ingredientes y macros. Haz clic en "Añadir al Menú" en la opción deseada.
            </p>
          </div>

          <button
            type="button"
            @click="handleGenerate"
            :disabled="isGenerating"
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isGenerating }" />
            <span>Regenerar opciones</span>
          </button>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(dish, idx) in suggestions"
            :key="dish.id"
            class="p-4 rounded-2xl bg-white dark:bg-[#201f22] border-2 border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all space-y-3 relative group"
          >
            <!-- Card Header: Title & Badges -->
            <div class="space-y-1">
              <div class="flex items-start justify-between gap-2">
                <h5 class="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {{ dish.nombre }}
                </h5>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 shrink-0">
                  Opción {{ idx + 1 }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                {{ dish.descripcion }}
              </p>
              <div class="flex items-center gap-2 pt-1 flex-wrap">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  🍽️ {{ dish.porcion }}
                </span>
                <span v-if="dish.tiempoPreparacionMin" class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  ⏱️ {{ dish.tiempoPreparacionMin }} min
                </span>
              </div>
            </div>

            <!-- Macros Breakdown Bar -->
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 grid grid-cols-4 gap-1 text-center text-xs">
              <div>
                <span class="text-[9px] text-slate-500 uppercase font-bold block">Kcal</span>
                <span class="font-black text-slate-900 dark:text-white">{{ dish.macros.calories }}</span>
              </div>
              <div>
                <span class="text-[9px] text-blue-500 uppercase font-bold block">Proteína</span>
                <span class="font-black text-blue-600 dark:text-blue-400">{{ dish.macros.protein }}g</span>
              </div>
              <div>
                <span class="text-[9px] text-amber-500 uppercase font-bold block">Carbos</span>
                <span class="font-black text-amber-600 dark:text-amber-400">{{ dish.macros.carbs }}g</span>
              </div>
              <div>
                <span class="text-[9px] text-rose-500 uppercase font-bold block">Grasas</span>
                <span class="font-black text-rose-600 dark:text-rose-400">{{ dish.macros.fat }}g</span>
              </div>
            </div>

            <!-- Clinical Rationale -->
            <div v-if="dish.justificacionClinica" class="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-950 dark:text-emerald-200">
              <strong>💡 Justificación:</strong> {{ dish.justificacionClinica }}
            </div>

            <!-- Ingredients List (Clean Formatted SMAE) -->
            <div class="space-y-1">
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Ingredientes limpios (SMAE):
              </span>
              <ul class="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <li v-for="(ing, iIdx) in dish.ingredientes" :key="iIdx" class="flex items-start gap-1.5">
                  <span class="text-emerald-500 text-xs leading-tight">•</span>
                  <span>{{ ing }}</span>
                </li>
              </ul>
            </div>

            <!-- Add to Menu Action Button -->
            <div class="pt-2">
              <button
                type="button"
                @click="handleAddDish(dish)"
                class="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Plus class="w-4 h-4" />
                <span>Añadir a {{ currentSelectedMeal?.label || 'Comida' }}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  X,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Eye,
  ChevronDown,
  Loader2,
  Plus,
  RotateCw
} from 'lucide-vue-next';
import type { Patient, PatientDietPlan, ClinicalHistory } from '../../../types/patient';
import type { MealTimeCatalogItem, MealTimeKey, DishItem } from '../../../types/dietMenu';
import {
  GeminiMealSuggestionService,
  type MealSuggestionInput,
  type SuggestedDishOption
} from '../../../services/nutrition/GeminiMealSuggestionService';

const props = defineProps<{
  show: boolean;
  patient: Patient;
  plan: PatientDietPlan;
  clinicalHistory: ClinicalHistory | null;
  activeDayName: string;
  targetMealTime: {
    key: MealTimeKey;
    label: string;
    icon?: string;
  };
  remainingMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  availableMealTimes: MealTimeCatalogItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'addDish', payload: { dish: DishItem; targetMealKey: MealTimeKey }): void;
  (e: 'updateTargetMeal', key: MealTimeKey): void;
}>();

// Form State
const selectedMealKey = ref<MealTimeKey>(props.targetMealTime.key);
const optionsCount = ref<number>(3);
const culinaryStyle = ref<string>('mexicana_casera');
const customNotes = ref<string>('');
const showPromptAudit = ref<boolean>(false);

// Generation State
const isGenerating = ref<boolean>(false);
const generatingStepText = ref<string>('Analizando historial clínico...');
const errorMessage = ref<string | null>(null);
const suggestions = ref<SuggestedDishOption[]>([]);

// Synchronize target meal key with props
watch(() => props.targetMealTime.key, (newKey) => {
  selectedMealKey.value = newKey;
}, { immediate: true });

// Clear results when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    errorMessage.value = null;
  }
});

const currentSelectedMeal = computed(() => {
  return props.availableMealTimes.find(m => m.key === selectedMealKey.value) || props.targetMealTime;
});

function handleMealTimeChange() {
  emit('updateTargetMeal', selectedMealKey.value);
}

// Extract clinical alerts & preferences
const allAllergies = computed(() => {
  const patientAlerts = props.patient.alertasMedicas || [];
  const historyAllergies = props.clinicalHistory?.alergiasIntolerancias || [];
  return Array.from(new Set([...patientAlerts, ...historyAllergies])).filter(a => a && a.trim() !== '');
});

const dislikes = computed(() => {
  return props.clinicalHistory?.preferenciasAlimentarias?.aversionesDisgustos || [];
});

const favorites = computed(() => {
  return props.clinicalHistory?.preferenciasAlimentarias?.gustosFavoritos || [];
});

// Effective macro targets for prompt
const effectiveTargetKcal = computed(() => {
  return Math.max(150, Math.round(props.remainingMacros.calories > 0 ? props.remainingMacros.calories : props.plan.calorias * 0.25));
});

const effectiveTargetProtein = computed(() => {
  return Math.max(10, Math.round(props.remainingMacros.protein > 0 ? props.remainingMacros.protein : props.plan.macros.protein * 0.25));
});

const effectiveTargetCarbs = computed(() => {
  return Math.max(10, Math.round(props.remainingMacros.carbs > 0 ? props.remainingMacros.carbs : props.plan.macros.carbs * 0.25));
});

const effectiveTargetFat = computed(() => {
  return Math.max(5, Math.round(props.remainingMacros.fat > 0 ? props.remainingMacros.fat : props.plan.macros.fat * 0.25));
});

function buildCurrentInput(): MealSuggestionInput {
  return {
    patient: {
      id: props.patient.id,
      nombre: props.patient.nombre,
      edad: props.patient.edad,
      sexo: props.patient.sexo,
      objetivoPrincipal: props.patient.objetivoPrincipal || props.plan.objetivo,
      alertasMedicas: props.patient.alertasMedicas
    },
    clinicalHistory: props.clinicalHistory ? {
      alergiasIntolerancias: props.clinicalHistory.alergiasIntolerancias,
      preferenciasAlimentarias: props.clinicalHistory.preferenciasAlimentarias,
      antecedentesPatologicos: props.clinicalHistory.antecedentesPatologicos,
      sintomasDigestivos: props.clinicalHistory.sintomasDigestivos,
      observacionesGenerales: props.clinicalHistory.observacionesGenerales
    } : undefined,
    dayName: props.activeDayName,
    targetMealTime: {
      key: selectedMealKey.value,
      label: currentSelectedMeal.value.label,
      icon: currentSelectedMeal.value.icon
    },
    remainingMacros: {
      calories: effectiveTargetKcal.value,
      protein: effectiveTargetProtein.value,
      carbs: effectiveTargetCarbs.value,
      fat: effectiveTargetFat.value
    },
    dailyPlanMacros: {
      calories: props.plan.calorias,
      protein: props.plan.macros.protein,
      carbs: props.plan.macros.carbs,
      fat: props.plan.macros.fat
    },
    optionsCount: optionsCount.value,
    culinaryStyle: culinaryStyle.value,
    customNotes: customNotes.value
  };
}

const currentPreviewPrompt = computed(() => {
  return GeminiMealSuggestionService.buildPrompt(buildCurrentInput());
});

async function handleGenerate() {
  isGenerating.value = true;
  errorMessage.value = null;
  generatingStepText.value = 'Analizando restricciones e historial clínico...';

  const timer1 = setTimeout(() => {
    generatingStepText.value = 'Consultando Gemini 3.7 Flash con macronutrientes meta...';
  }, 1200);

  const timer2 = setTimeout(() => {
    generatingStepText.value = 'Calculando porciones exactas del catálogo SMAE...';
  }, 2500);

  try {
    const input = buildCurrentInput();
    const results = await GeminiMealSuggestionService.generateSuggestions(input);
    suggestions.value = results;
    if (results.length === 0) {
      errorMessage.value = 'No se recibieron sugerencias válidas. Intenta de nuevo.';
    }
  } catch (err: any) {
    console.error('Error generating suggestions with Gemini:', err);
    errorMessage.value = err?.message || 'Error comunicándose con Gemini. Verifica la conexión o API key.';
  } finally {
    clearTimeout(timer1);
    clearTimeout(timer2);
    isGenerating.value = false;
  }
}

function handleAddDish(dish: SuggestedDishOption) {
  emit('addDish', {
    dish,
    targetMealKey: selectedMealKey.value
  });
}
</script>
