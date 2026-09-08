<script setup lang="ts">
import { ref, computed } from 'vue'
import { Flame, Sparkles, AlertCircle, ArrowRightLeft } from 'lucide-vue-next'

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

// SVG Ring Dimensions (Optimized for 210x210 viewBox with expansive 119px inner diameter)
const R_PROTEIN = 92
const R_CARBS = 78
const R_FAT = 64
const STROKE_WIDTH = 9

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
      <div class="absolute -left-10 -top-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20" style="background: var(--primary);"></div>
      <div class="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-15" style="background: #f59e0b;"></div>

      <!-- Plan Override Badge (if applicable) -->
      <div v-if="isMealPlanOverride" class="mb-3 flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-[#87ff70] border border-emerald-500/25 shadow-2xs backdrop-blur-xs">
        <span class="flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-emerald-500 dark:text-[#87ff70]" /> Plan Nutricional Talia Tinoco
        </span>
        <span class="text-[9px] opacity-80 lowercase font-medium px-2 py-0.5 rounded-full bg-emerald-500/15">sincronizado</span>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        
        <!-- Left / Center: Concentric SVG Rings Dial -->
        <div class="flex flex-col items-center shrink-0">
          <div 
            class="relative flex items-center justify-center shrink-0 cursor-pointer select-none group transition-transform duration-200 active:scale-98" 
            @click="toggleDisplayMode" 
            title="Toca para alternar entre calorías restantes y consumidas"
          >
            <svg class="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90" viewBox="0 0 210 210">
              <defs>
                <!-- Protein Gradient (Emerald -> Neon Lime) -->
                <linearGradient id="proteinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="100%" stop-color="#34d399" />
                </linearGradient>

                <!-- Carbs Gradient (Golden Amber -> Warm Orange) -->
                <linearGradient id="carbsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#fb923c" />
                </linearGradient>

                <!-- Fat Gradient (Vibrant Rose -> Neon Coral) -->
                <linearGradient id="fatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f43f5e" />
                  <stop offset="100%" stop-color="#fb7185" />
                </linearGradient>
              </defs>

              <!-- Background Tracks -->
              <!-- Protein Track -->
              <circle
                cx="105"
                cy="105"
                :r="R_PROTEIN"
                fill="transparent"
                stroke="rgba(16, 185, 129, 0.12)"
                :stroke-width="STROKE_WIDTH"
              />
              <!-- Carbs Track -->
              <circle
                cx="105"
                cy="105"
                :r="R_CARBS"
                fill="transparent"
                stroke="rgba(245, 158, 11, 0.12)"
                :stroke-width="STROKE_WIDTH"
              />
              <!-- Fat Track -->
              <circle
                cx="105"
                cy="105"
                :r="R_FAT"
                fill="transparent"
                stroke="rgba(244, 63, 94, 0.12)"
                :stroke-width="STROKE_WIDTH"
              />

              <!-- Active Progress Rings with Vibrant Gradients & Glow Accents -->
              <!-- Protein Ring (Emerald / Primary) -->
              <circle
                cx="105"
                cy="105"
                :r="R_PROTEIN"
                fill="transparent"
                stroke="url(#proteinGrad)"
                :stroke-width="STROKE_WIDTH"
                stroke-linecap="round"
                :stroke-dasharray="C_PROTEIN"
                :stroke-dashoffset="offsetProtein"
                class="transition-all duration-700 ease-out"
                style="filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.45));"
              />

              <!-- Carbs Ring (Amber / Gold) -->
              <circle
                cx="105"
                cy="105"
                :r="R_CARBS"
                fill="transparent"
                stroke="url(#carbsGrad)"
                :stroke-width="STROKE_WIDTH"
                stroke-linecap="round"
                :stroke-dasharray="C_CARBS"
                :stroke-dashoffset="offsetCarbs"
                class="transition-all duration-700 ease-out"
                style="filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.45));"
              />

              <!-- Fat Ring (Rose / Coral) -->
              <circle
                cx="105"
                cy="105"
                :r="R_FAT"
                fill="transparent"
                stroke="url(#fatGrad)"
                :stroke-width="STROKE_WIDTH"
                stroke-linecap="round"
                :stroke-dasharray="C_FAT"
                :stroke-dashoffset="offsetFat"
                class="transition-all duration-700 ease-out"
                style="filter: drop-shadow(0 0 5px rgba(244, 63, 94, 0.45));"
              />
            </svg>

            <!-- Center Content: Generously Spaced, Elegant & Clear Calories Display -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none p-2">
              
              <!-- Flame Icon Pill -->
              <div 
                class="w-5 h-5 rounded-full flex items-center justify-center mb-0.5 transition-colors duration-300"
                :class="isCaloriesOver ? 'bg-rose-500/15 border border-rose-500/30' : 'bg-amber-500/15 border border-amber-500/30'"
              >
                <Flame 
                  class="w-3 h-3 transition-colors animate-pulse" 
                  :class="isCaloriesOver ? 'text-rose-400 fill-rose-400/40' : 'text-amber-400 fill-amber-400/40'" 
                />
              </div>
              
              <!-- Main Calorie Number -->
              <div 
                class="text-2xl sm:text-3xl font-black tracking-tight leading-none transition-colors tabular-nums my-0.5"
                :class="isCaloriesOver ? 'text-rose-400' : 'text-slate-900 dark:text-white'"
                style="font-family: var(--font-display);"
              >
                {{ displayMode === 'remaining' ? (isCaloriesOver ? `+${(current.calories - targets.calories).toLocaleString()}` : caloriesRemaining.toLocaleString()) : current.calories.toLocaleString() }}
              </div>
              
              <!-- Mode Label -->
              <span 
                class="text-[9px] font-extrabold uppercase tracking-wider transition-colors leading-tight"
                :class="isCaloriesOver ? 'text-rose-400/90' : 'text-emerald-600 dark:text-[#87ff70]'"
              >
                {{ displayMode === 'remaining' ? (isCaloriesOver ? 'kcal extra' : 'kcal faltan') : 'kcal comidas' }}
              </span>
              
              <!-- Target Pill (Spacious, Clean, No Ring Collision) -->
              <span class="text-[9px] font-semibold text-slate-500 dark:text-zinc-400 mt-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 leading-none">
                de {{ targets.calories.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Micro Toggle Hint -->
          <button 
            type="button"
            @click="toggleDisplayMode"
            class="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-[#87ff70] transition-colors cursor-pointer"
          >
            <ArrowRightLeft class="w-2.5 h-2.5" />
            <span>{{ displayMode === 'remaining' ? 'Ver consumidas' : 'Ver restantes' }}</span>
          </button>
        </div>

        <!-- Right / Bottom: Macro Cards Grid with Dynamic Progress Bars -->
        <div class="flex-1 w-full grid grid-cols-3 sm:grid-cols-1 gap-2 sm:gap-2.5">
          
          <!-- Protein Card -->
          <div class="p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.02]" style="background: rgba(16, 185, 129, 0.06); border-color: rgba(16, 185, 129, 0.25);">
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-2xs"></span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">Proteína</span>
              </div>
              <span class="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                {{ Math.round(proteinPct * 100) }}%
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm sm:text-base font-black text-slate-800 dark:text-white tabular-nums">{{ current.protein }}</span>
              <span class="text-[10px] text-slate-400 dark:text-zinc-400 font-medium">/ {{ targets.protein }}g</span>
            </div>
            <div class="w-full h-1 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden mt-1.5">
              <div 
                class="h-full rounded-full transition-all duration-700 ease-out" 
                :style="{ 
                  width: `${Math.min(proteinPct * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)'
                }"
              ></div>
            </div>
          </div>

          <!-- Carbs Card -->
          <div class="p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.02]" style="background: rgba(245, 158, 11, 0.06); border-color: rgba(245, 158, 11, 0.25);">
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-2xs"></span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">Carbs</span>
              </div>
              <span class="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                {{ Math.round(carbsPct * 100) }}%
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm sm:text-base font-black text-slate-800 dark:text-white tabular-nums">{{ current.carbs }}</span>
              <span class="text-[10px] text-slate-400 dark:text-zinc-400 font-medium">/ {{ targets.carbs }}g</span>
            </div>
            <div class="w-full h-1 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden mt-1.5">
              <div 
                class="h-full rounded-full transition-all duration-700 ease-out" 
                :style="{ 
                  width: `${Math.min(carbsPct * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                }"
              ></div>
            </div>
          </div>

          <!-- Fat Card -->
          <div class="p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.02]" style="background: rgba(244, 63, 94, 0.06); border-color: rgba(244, 63, 94, 0.25);">
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-2xs"></span>
                <span class="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">Grasas</span>
              </div>
              <span class="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
                {{ Math.round(fatPct * 100) }}%
              </span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm sm:text-base font-black text-slate-800 dark:text-white tabular-nums">{{ current.fat }}</span>
              <span class="text-[10px] text-slate-400 dark:text-zinc-400 font-medium">/ {{ targets.fat }}g</span>
            </div>
            <div class="w-full h-1 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden mt-1.5">
              <div 
                class="h-full rounded-full transition-all duration-700 ease-out" 
                :style="{ 
                  width: `${Math.min(fatPct * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #f43f5e, #fb7185)'
                }"
              ></div>
            </div>
          </div>

        </div>
      </div>

      <!-- Sugar Bottom Micro Bar (if targets.sugar > 0) -->
      <div v-if="targets.sugar > 0" class="mt-3.5 pt-2.5 border-t space-y-1.5" style="border-color: var(--glass-border);">
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-slate-400 dark:text-zinc-400 text-[11px]">
            <span class="font-bold">Azúcar:</span>
            <span class="font-bold text-slate-700 dark:text-zinc-200 tabular-nums">{{ current.sugar }}g / {{ targets.sugar }}g</span>
            <span v-if="current.sugar > targets.sugar" class="inline-flex items-center text-rose-500 text-[10px] font-bold gap-0.5">
              <AlertCircle class="w-3 h-3" /> Límite excedido
            </span>
          </div>
          <span 
            class="text-[10px] font-black px-1.5 py-0.2 rounded-md"
            :class="current.sugar > targets.sugar ? 'bg-rose-500/15 text-rose-500' : 'bg-white/5 text-slate-400 dark:text-zinc-400'"
          >
            {{ sugarPct }}%
          </span>
        </div>
        <div class="w-full h-1 rounded-full bg-black/20 dark:bg-white/10 overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-700 ease-out" 
            :class="current.sugar > targets.sugar ? 'bg-rose-500' : 'bg-cyan-500'"
            :style="{ width: `${Math.min(sugarPct, 100)}%` }"
          ></div>
        </div>
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
