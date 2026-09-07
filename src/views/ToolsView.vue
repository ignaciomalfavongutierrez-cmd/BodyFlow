<template>
  <div class="min-h-full pb-24 px-4 pt-4 max-w-2xl mx-auto space-y-6">
    
    <!-- Top Header -->
    <header class="glass-card p-5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
          🛠️
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Herramientas & Calculadoras
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de hidratación, buscador de equivalencias SMAE y calculadoras de apoyo.
          </p>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <div class="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold gap-1">
      <button
        @click="activeTab = 'water'"
        class="flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        :class="activeTab === 'water' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <span>💧</span>
        <span>Hidratación</span>
      </button>

      <button
        @click="activeTab = 'smae'"
        class="flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        :class="activeTab === 'smae' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <span>⚖️</span>
        <span>Equivalencias</span>
      </button>

      <button
        @click="activeTab = 'calculators'"
        class="flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        :class="activeTab === 'calculators' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
      >
        <span>🧮</span>
        <span>Calculadoras</span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: HIDRATACIÓN                                                        -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'water'" class="space-y-6">
      <!-- Full Water Tracker Component for Today -->
      <WaterTracker :date="todayStr" />

      <!-- Water Requirement Calculator -->
      <div class="glass-card p-5 border border-cyan-500/25 relative overflow-hidden space-y-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🚰</span>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
              Calculadora de Requerimiento Diario de Agua
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Estima tu meta óptima de hidratación según tu peso corporal y actividad física.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-400 mb-1">Tu peso actual (kg)</label>
            <input
              v-model.number="waterCalcWeight"
              type="number"
              step="0.5"
              min="30"
              max="250"
              class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-400 mb-1">Actividad física diaria</label>
            <select
              v-model="waterCalcActivity"
              class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="sedentary">Sedentario (Poco o nada de ejercicio)</option>
              <option value="moderate">Moderado (30 - 45 min ejercicio / día)</option>
              <option value="intense">Intenso (60+ min entrenamiento / día)</option>
            </select>
          </div>
        </div>

        <!-- Result Box -->
        <div class="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span class="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">Meta Hídrica Recomendada:</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-cyan-400" style="font-family: var(--font-display);">
                {{ (recommendedWaterMl / 1000).toFixed(2) }} L
              </span>
              <span class="text-xs font-bold text-slate-400">({{ recommendedWaterMl }} ml / día)</span>
            </div>
          </div>

          <button
            @click="applyRecommendedWaterTarget"
            class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all shrink-0"
          >
            Establecer como mi meta diaria
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: EQUIVALENCIAS SMAE                                                 -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'smae'" class="space-y-6">
      <EquivalenceQuickCard />

      <!-- Educational SMAE Reference Card -->
      <div class="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-3.5">
        <div class="flex items-center gap-2">
          <span class="text-base">💡</span>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            ¿Cómo funcionan los equivalentes del SMAE?
          </h3>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Un <strong>equivalente</strong> es aquella porción de alimento cuyo aporte nutrimental es similar a los de su mismo grupo en calorías y macronutrientes. Esto te permite intercambiar alimentos dentro de una misma categoría sin alterar tu plan:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span class="font-bold text-emerald-400 flex items-center gap-1">🥦 Verduras</span>
            <p class="text-slate-400 text-[11px]">Aporte promedio: <strong>25 kcal</strong>, 2g proteína, 4g carbohidratos. Ejemplo: 1 taza de espinacas crudas = 1/2 taza de calabacitas.</p>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span class="font-bold text-rose-400 flex items-center gap-1">🍎 Frutas</span>
            <p class="text-slate-400 text-[11px]">Aporte promedio: <strong>60 kcal</strong>, 15g carbohidratos. Ejemplo: 1 manzana chica = 1 taza de fresas rebanadas.</p>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span class="font-bold text-amber-400 flex items-center gap-1">🌽 Cereales sin grasa</span>
            <p class="text-slate-400 text-[11px]">Aporte promedio: <strong>70 kcal</strong>, 2g proteína, 15g carbohidratos. Ejemplo: 1 tortilla de maíz = 1/2 taza de arroz al vapor.</p>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span class="font-bold text-indigo-400 flex items-center gap-1">🥩 Alimentos de Origen Animal</span>
            <p class="text-slate-400 text-[11px]">Aporte promedio: <strong>40-75 kcal</strong>, 7g proteína. Ejemplo: 30g de pechuga de pollo = 30g de atún en agua = 2 claras de huevo.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 3: MINI-CALCULADORAS                                                  -->
    <!-- ========================================================================= -->
    <div v-show="activeTab === 'calculators'" class="space-y-6">
      
      <!-- 1. Calculadora de Rango de Peso Saludable & IMC -->
      <div class="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">⚖️</span>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
              Calculadora de Rango de Peso Saludable (OMS)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Conoce tu índice de masa corporal y el rango de peso ideal según tu estatura.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-bold text-slate-400 mb-1">Estatura (cm)</label>
            <input
              v-model.number="calcHeight"
              type="number"
              min="100"
              max="230"
              class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-400 mb-1">Peso actual (kg)</label>
            <input
              v-model.number="calcWeight"
              type="number"
              step="0.5"
              min="30"
              max="250"
              class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div v-if="calcHeight > 0 && calcWeight > 0" class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400">Tu IMC Calculado:</span>
            <div class="flex items-center gap-2">
              <span class="text-lg font-black text-white font-mono">{{ calcImc }}</span>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border" :class="calcImcBadgeClass">
                {{ calcImcCategory }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-white/5 pt-2">
            <span class="text-xs text-slate-400">Rango de Peso Normal (IMC 18.5 - 24.9):</span>
            <span class="text-xs font-bold text-emerald-400 font-mono">
              {{ healthyWeightMin }} kg - {{ healthyWeightMax }} kg
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Calculadora de Déficit / Superávit Orientativo -->
      <div class="glass-card p-5 border border-slate-200 dark:border-white/10 space-y-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🔥</span>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
              Estimador de Calorías según Objetivo
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Ajuste calórico sugerido para pérdida de grasa, mantenimiento o ganancia muscular.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-bold text-slate-400 mb-1">Calorías de Mantenimiento (TDEE)</label>
            <input
              v-model.number="calcMaintenanceKcal"
              type="number"
              step="50"
              min="1000"
              max="5000"
              class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-400 mb-1">Objetivo Nutricional</label>
            <select
              v-model="calcGoal"
              class="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="deficit_moderate">Déficit Moderado (-300 kcal)</option>
              <option value="deficit_aggressive">Déficit Acentuado (-500 kcal)</option>
              <option value="maintain">Mantenimiento (0 kcal)</option>
              <option value="surplus">Superávit Muscular (+300 kcal)</option>
            </select>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Calorías Meta Sugeridas:</span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-amber-400 font-mono" style="font-family: var(--font-display);">
                {{ adjustedCalories }}
              </span>
              <span class="text-xs font-bold text-slate-400">kcal / día</span>
            </div>
          </div>
          <span class="text-xs font-bold text-slate-300">
            {{ calcGoalLabel }}
          </span>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user';
import WaterTracker from '../components/dashboard/WaterTracker.vue';
import EquivalenceQuickCard from '../components/tracking/EquivalenceQuickCard.vue';

const userStore = useUserStore();

const activeTab = ref<'water' | 'smae' | 'calculators'>('water');
const todayStr = ref(new Date().toISOString().split('T')[0]);

// Water Calculator State
const waterCalcWeight = ref(userStore.profile.weight || 70);
const waterCalcActivity = ref<'sedentary' | 'moderate' | 'intense'>('moderate');

const recommendedWaterMl = computed(() => {
  const baseMl = (Number(waterCalcWeight.value) || 70) * 35;
  let activityBonus = 0;
  if (waterCalcActivity.value === 'moderate') activityBonus = 500;
  if (waterCalcActivity.value === 'intense') activityBonus = 1000;
  return Math.round(baseMl + activityBonus);
});

async function applyRecommendedWaterTarget() {
  await userStore.updateProfile({ waterTarget: recommendedWaterMl.value });
  alert(`¡Meta actualizada a ${recommendedWaterMl.value} ml al día!`);
}

// IMC & Healthy Weight Calculator State
const calcHeight = ref(userStore.profile.height || 170);
const calcWeight = ref(userStore.profile.weight || 70);

const calcImc = computed(() => {
  const hM = (Number(calcHeight.value) || 170) / 100;
  const w = Number(calcWeight.value) || 70;
  if (hM <= 0 || w <= 0) return '0.0';
  return (w / (hM * hM)).toFixed(1);
});

const calcImcCategory = computed(() => {
  const val = parseFloat(calcImc.value);
  if (val < 18.5) return 'Bajo Peso';
  if (val < 25) return 'Saludable';
  if (val < 30) return 'Sobrepeso';
  return 'Obesidad';
});

const calcImcBadgeClass = computed(() => {
  const val = parseFloat(calcImc.value);
  if (val < 18.5) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (val < 25) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (val < 30) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
});

const healthyWeightMin = computed(() => {
  const hM = (Number(calcHeight.value) || 170) / 100;
  return (18.5 * hM * hM).toFixed(1);
});

const healthyWeightMax = computed(() => {
  const hM = (Number(calcHeight.value) || 170) / 100;
  return (24.9 * hM * hM).toFixed(1);
});

// Caloric Goal Calculator State
const calcMaintenanceKcal = ref(userStore.profile.macroTargets?.calories || 2000);
const calcGoal = ref<'deficit_moderate' | 'deficit_aggressive' | 'maintain' | 'surplus'>('deficit_moderate');

const adjustedCalories = computed(() => {
  const base = Number(calcMaintenanceKcal.value) || 2000;
  switch (calcGoal.value) {
    case 'deficit_moderate': return Math.max(1200, base - 300);
    case 'deficit_aggressive': return Math.max(1200, base - 500);
    case 'surplus': return base + 300;
    default: return base;
  }
});

const calcGoalLabel = computed(() => {
  switch (calcGoal.value) {
    case 'deficit_moderate': return 'Pérdida de grasa gradual';
    case 'deficit_aggressive': return 'Pérdida de grasa rápida';
    case 'surplus': return 'Ganancia de masa muscular';
    default: return 'Mantenimiento del peso';
  }
});
</script>
