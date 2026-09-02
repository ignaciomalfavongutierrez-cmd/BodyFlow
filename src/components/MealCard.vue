<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Utensils, 
  Check, 
  ChevronRight, 
  ArrowRightLeft
} from 'lucide-vue-next'

const props = defineProps<{
  date: string
  meal: {
    id: string
    name: string
    items?: string[]
    plannedMacros?: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }
  isCompleted: boolean
  customFoods?: { id: string; name: string; quantity: string }[]
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const router = useRouter()

function goToDetail() {
  router.push({ name: 'mealDetail', params: { date: props.date, mealId: props.meal.id } })
}

// Compute theme styling and icon based on meal name
const mealTheme = computed(() => {
  const name = props.meal.name.toLowerCase()
  
  if (name.includes('desayun') || name.includes('morning') || name.includes('breakfast')) {
    return {
      type: 'desayuno',
      label: 'Desayuno',
      icon: Sunrise,
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeBorder: 'rgba(245, 158, 11, 0.3)',
      badgeText: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.08)'
    }
  }
  if (name.includes('comida') || name.includes('almuerzo') || name.includes('lunch')) {
    return {
      type: 'comida',
      label: 'Comida',
      icon: Sun,
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      badgeText: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.08)'
    }
  }
  if (name.includes('colaci') || name.includes('snack') || name.includes('merienda')) {
    return {
      type: 'colacion',
      label: 'Colación',
      icon: Sunset,
      badgeBg: 'rgba(249, 115, 22, 0.12)',
      badgeBorder: 'rgba(249, 115, 22, 0.3)',
      badgeText: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.08)'
    }
  }
  if (name.includes('cena') || name.includes('dinner') || name.includes('noche')) {
    return {
      type: 'cena',
      label: 'Cena',
      icon: Moon,
      badgeBg: 'rgba(99, 102, 241, 0.12)',
      badgeBorder: 'rgba(99, 102, 241, 0.3)',
      badgeText: '#818cf8',
      accentGlow: 'rgba(99, 102, 241, 0.08)'
    }
  }
  
  return {
    type: 'otra',
    label: 'Comida',
    icon: Utensils,
    badgeBg: 'rgba(20, 184, 166, 0.12)',
    badgeBorder: 'rgba(20, 184, 166, 0.3)',
    badgeText: '#14b8a6',
    accentGlow: 'rgba(20, 184, 166, 0.08)'
  }
})
</script>

<template>
  <div 
    class="glass-card p-4 sm:p-4.5 rounded-3xl border flex items-center gap-3.5 mb-3 cursor-pointer select-none transition-all duration-200 group active:scale-[0.99] relative overflow-hidden"
    :style="{
      background: isCompleted ? 'rgba(255, 255, 255, 0.015)' : 'var(--surface-container)',
      borderColor: isCompleted ? 'var(--glass-border)' : mealTheme.badgeBorder,
      boxShadow: isCompleted ? 'none' : `0 4px 16px ${mealTheme.accentGlow}`
    }"
    :class="isCompleted ? 'opacity-65' : 'hover:border-opacity-60'"
    @click="goToDetail"
  >
    <!-- Left Icon Badge -->
    <div 
      class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105"
      :style="{
        background: mealTheme.badgeBg,
        borderColor: mealTheme.badgeBorder,
        color: mealTheme.badgeText
      }"
    >
      <component :is="mealTheme.icon" class="w-5 h-5" />
    </div>

    <!-- Center Information -->
    <div class="flex-1 min-w-0 pr-1">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 
          class="font-bold text-sm sm:text-base truncate transition-colors"
          :class="isCompleted ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-100'"
        >
          {{ meal.name }}
        </h3>

        <!-- Substituted Badge -->
        <span 
          v-if="customFoods && customFoods.length > 0" 
          class="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style="background: rgba(244, 63, 94, 0.12); color: #fb7185; border-color: rgba(244, 63, 94, 0.3);"
        >
          <ArrowRightLeft class="w-2.5 h-2.5" />
          Sustituido
        </span>
      </div>

      <!-- Food Items preview -->
      <p 
        v-if="customFoods && customFoods.length > 0" 
        class="text-xs mt-0.5 truncate font-medium text-rose-400 dark:text-rose-300"
      >
        {{ customFoods.map(f => f.name).join(', ') }}
      </p>
      <p 
        v-else-if="meal.items && meal.items.length > 0" 
        class="text-xs mt-0.5 truncate text-slate-400 dark:text-zinc-400 font-medium"
      >
        {{ meal.items.join(', ') }}
      </p>

      <!-- Macros Row Pills -->
      <div v-if="meal.plannedMacros" class="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap text-[11px] font-semibold">
        <!-- Calories -->
        <span class="px-2 py-0.5 rounded-lg text-slate-800 dark:text-white font-extrabold bg-slate-200/60 dark:bg-white/10 border border-slate-300/40 dark:border-white/10">
          {{ meal.plannedMacros.calories || 0 }} kcal
        </span>

        <!-- P / C / F -->
        <div class="flex items-center gap-2 text-slate-400 dark:text-zinc-400">
          <span class="text-emerald-500 font-bold">P: {{ meal.plannedMacros.protein || 0 }}g</span>
          <span class="text-amber-500 font-bold">C: {{ meal.plannedMacros.carbs || 0 }}g</span>
          <span class="text-rose-500 font-bold">F: {{ meal.plannedMacros.fat || 0 }}g</span>
        </div>
      </div>
    </div>

    <!-- Right Actions: Chevron & Checkbox -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Checkbox Button -->
      <button 
        @click.stop="emit('toggle')"
        type="button"
        class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs border"
        :style="isCompleted ? {
          background: 'var(--primary)',
          borderColor: 'var(--primary)',
          transform: 'scale(1.05)'
        } : {
          background: 'rgba(255, 255, 255, 0.03)',
          borderColor: 'var(--outline)'
        }"
        :title="isCompleted ? 'Desmarcar comida' : 'Marcar como comida completada'"
      >
        <Check v-if="isCompleted" class="w-5 h-5 text-black stroke-[3]" />
      </button>

      <!-- Detail Chevron Indicator -->
      <div class="text-slate-500 dark:text-zinc-500 group-hover:text-slate-300 dark:group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5">
        <ChevronRight class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
