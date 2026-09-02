<script setup lang="ts">
import { ref, computed } from 'vue'
import { Flame, Sparkles, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  current: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  targets: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  isMealPlanOverride?: boolean
}>()

// Mode toggle: 'remaining' vs 'consumed'
const displayMode = ref<'remaining' | 'consumed'>('remaining')

// SVG Ring Dimensions
const R_PROTEIN = 68
const R_CARBS = 53
const R_FAT = 38
const STROKE_WIDTH = 8

const C_PROTEIN = 2 * Math.PI * R_PROTEIN
const C_CARBS = 2 * Math.PI * R_CARBS
const C_FAT = 2 * Math.PI * R_FAT

// Percentage computations (clamped 0 to 1 for ring stroke, but raw % displayed in text)
const proteinPct = computed(() => {
  if (!props.targets.protein) return 0
  return props.current.protein / props.targets.protein
})

const carbsPct = computed(() => {
  if (!props.targets.carbs) return 0
  return props.current.carbs / props.targets.carbs
})

const fatPct = computed(() => {
  if (!props.targets.fat) return 0
  return props.current.fat / props.targets.fat
})

const sugarPct = computed(() => {
  if (!props.targets.sugar) return 0
  return Math.round((props.current.sugar / props.targets.sugar) * 100)
})

// Calorie calculations
const caloriesRemaining = computed(() => {
  const rem = props.targets.calories - props.current.calories
  return rem > 0 ? rem : 0
})

const isCaloriesOver = computed(() => {
  return props.current.calories > props.targets.calories && props.targets.calories > 0
})

// Ring offsets (clamped between 0 and Circumference)
const offsetProtein = computed(() => {
  const clamped = Math.min(Math.max(proteinPct.value, 0), 1)
  return C_PROTEIN * (1 - clamped)
})

const offsetCarbs = computed(() => {
  const clamped = Math.min(Math.max(carbsPct.value, 0), 1)
  return C_CARBS * (1 - clamped)
})

const offsetFat = computed(() => {
  const clamped = Math.min(Math.max(fatPct.value, 0), 1)
  return C_FAT * (1 - clamped)
})

function toggleDisplayMode() {
  displayMode.value = displayMode.value === 'remaining' ? 'consumed' : 'remaining'
}
</script>

<template>
  <div class="w-full">
    <!-- Main Macro Card -->
    <div class="glass-card p-4 sm:p-5 rounded-3xl border relative overflow-hidden transition-all duration-300" style="background: var(--surface-container-high); border-color: var(--glass-border);">
      
      <!-- Subtle ambient glow matching primary brand -->
      <div class="absolute -left-10 -top-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-15" style="background: var(--primary);"></div>
      <div class="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-15" style="background: #f59e0b;"></div>

      <!-- Plan Override Badge (if applicable) -->
      <div v-if="isMealPlanOverride" class="mb-3 flex items-center justify-between gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-[var(--primary)] border border-emerald-200 dark:border-emerald-800/40">
        <span class="flex items-center gap-1">
          <Sparkles class="w-3 h-3" /> Plan Nutricional Talia Tinoco
        </span>
        <span class="text-[9px] opacity-75 lowercase font-normal">sincronizado</span>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <!-- Left / Center: Concentric SVG Rings Dial -->
        <div class="relative flex items-center justify-center shrink-0 cursor-pointer select-none group" @click="toggleDisplayMode" title="Toca para alternar entre restantes y consumidas">
          <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
            <!-- Background Tracks -->
            <!-- Protein Track -->
            <circle
              cx="80"
              cy="80"
              :r="R_PROTEIN"
              fill="transparent"
              stroke="currentColor"
              :stroke-width="STROKE_WIDTH"
              class="text-emerald-950/30 dark:text-emerald-950/50"
            />
            <!-- Carbs Track -->
            <circle
              cx="80"
              cy="80"
              :r="R_CARBS"
              fill="transparent"
              stroke="currentColor"
              :stroke-width="STROKE_WIDTH"
              class="text-amber-950/30 dark:text-amber-950/50"
            />
            <!-- Fat Track -->
            <circle
              cx="80"
              cy="80"
              :r="R_FAT"
              fill="transparent"
              stroke="currentColor"
              :stroke-width="STROKE_WIDTH"
              class="text-rose-950/30 dark:text-rose-950/50"
            />

            <!-- Active Progress Rings with Gradients / Neon Accents -->
            <!-- Protein Ring (Emerald / Primary) -->
            <circle
              cx="80"
              cy="80"
              :r="R_PROTEIN"
              fill="transparent"
              stroke="#10b981"
              :stroke-width="STROKE_WIDTH"
              stroke-linecap="round"
              :stroke-dasharray="C_PROTEIN"
              :stroke-dashoffset="offsetProtein"
              class="transition-all duration-700 ease-out"
              style="filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4));"
            />

            <!-- Carbs Ring (Amber / Gold) -->
            <circle
              cx="80"
              cy="80"
              :r="R_CARBS"
              fill="transparent"
              stroke="#f59e0b"
              :stroke-width="STROKE_WIDTH"
              stroke-linecap="round"
              :stroke-dasharray="C_CARBS"
              :stroke-dashoffset="offsetCarbs"
              class="transition-all duration-700 ease-out"
              style="filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));"
            />

            <!-- Fat Ring (Rose / Coral) -->
            <circle
              cx="80"
              cy="80"
              :r="R_FAT"
              fill="transparent"
              stroke="#f43f5e"
              :stroke-width="STROKE_WIDTH"
              stroke-linecap="round"
              :stroke-dasharray="C_FAT"
              :stroke-dashoffset="offsetFat"
              class="transition-all duration-700 ease-out"
              style="filter: drop-shadow(0 0 4px rgba(244, 63, 94, 0.4));"
            />
          </svg>

          <!-- Center Content: Calories -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <Flame class="w-4 h-4 mb-0.5 animate-pulse" :class="isCaloriesOver ? 'text-rose-500' : 'text-amber-500'" />
            
            <div 
              class="text-2xl font-black tracking-tight leading-none transition-colors"
              :class="isCaloriesOver ? 'text-rose-500' : 'text-slate-800 dark:text-white'"
              style="font-family: var(--font-display);"
            >
              {{ displayMode === 'remaining' ? (isCaloriesOver ? `+${current.calories - targets.calories}` : caloriesRemaining) : current.calories }}
            </div>
            
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 mt-0.5">
              {{ displayMode === 'remaining' ? (isCaloriesOver ? 'kcal extra' : 'kcal faltan') : 'kcal comidas' }}
            </span>
            
            <span class="text-[8px] text-slate-500 dark:text-zinc-500 font-medium">
              de {{ targets.calories }}
            </span>
          </div>
        </div>

        <!-- Right: Macro Cards Grid -->
        <div class="flex-1 w-full grid grid-cols-3 sm:grid-cols-1 gap-2">
          
          <!-- Protein Card -->
          <div class="p-2.5 rounded-2xl border transition-all duration-200" style="background: rgba(16, 185, 129, 0.06); border-color: rgba(16, 185, 129, 0.2);">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"></span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-zinc-200">Proteína</span>
              </div>
              <span class="text-[10px] font-bold text-emerald-500">
                {{ Math.round(proteinPct * 100) }}%
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-extrabold text-slate-800 dark:text-white">{{ current.protein }}</span>
              <span class="text-[10px] text-slate-400 dark:text-zinc-400">/ {{ targets.protein }}g</span>
            </div>
          </div>

          <!-- Carbs Card -->
          <div class="p-2.5 rounded-2xl border transition-all duration-200" style="background: rgba(245, 158, 11, 0.06); border-color: rgba(245, 158, 11, 0.2);">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500 shadow-xs"></span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-zinc-200">Carbs</span>
              </div>
              <span class="text-[10px] font-bold text-amber-500">
                {{ Math.round(carbsPct * 100) }}%
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-extrabold text-slate-800 dark:text-white">{{ current.carbs }}</span>
              <span class="text-[10px] text-slate-400 dark:text-zinc-400">/ {{ targets.carbs }}g</span>
            </div>
          </div>

          <!-- Fat Card -->
          <div class="p-2.5 rounded-2xl border transition-all duration-200" style="background: rgba(244, 63, 94, 0.06); border-color: rgba(244, 63, 94, 0.2);">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500 shadow-xs"></span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-zinc-200">Grasas</span>
              </div>
              <span class="text-[10px] font-bold text-rose-500">
                {{ Math.round(fatPct * 100) }}%
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-extrabold text-slate-800 dark:text-white">{{ current.fat }}</span>
              <span class="text-[10px] text-slate-400 dark:text-zinc-400">/ {{ targets.fat }}g</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Sugar Bottom Micro Bar (if targets.sugar > 0) -->
      <div v-if="targets.sugar > 0" class="mt-3 pt-2.5 border-t flex items-center justify-between text-xs" style="border-color: var(--glass-border);">
        <div class="flex items-center gap-1.5 text-slate-400 dark:text-zinc-400 text-[11px]">
          <span>Azúcar:</span>
          <span class="font-bold text-slate-700 dark:text-zinc-200">{{ current.sugar }}g / {{ targets.sugar }}g</span>
          <span v-if="current.sugar > targets.sugar" class="inline-flex items-center text-rose-500 text-[10px] font-bold gap-0.5">
            <AlertCircle class="w-3 h-3" /> Límite excedido
          </span>
        </div>
        <span class="text-[10px] font-bold text-slate-400 dark:text-zinc-400">
          {{ sugarPct }}%
        </span>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Smooth circular ring transitions */
circle {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
