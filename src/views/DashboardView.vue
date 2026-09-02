<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useDietStore } from '../stores/diet'
import { useLogStore } from '../stores/log'
import { useAuthStore } from '../stores/auth'
import { isAdminEmail } from '../router'
import { Wrench, Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import MealCard from '../components/MealCard.vue'

import DateBubbleSlider from '../components/dashboard/DateBubbleSlider.vue'
import WaterTracker from '../components/dashboard/WaterTracker.vue'
import MacroRings from '../components/dashboard/MacroRings.vue'

const userStore = useUserStore()
const dietStore = useDietStore()
const logStore = useLogStore()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const isAdmin = computed(() => isAdminEmail(authStore.user?.email))

// State for navigation
const selectedDateStr = ref(new Date().toISOString().split('T')[0])

// Fetch log on date change
watch(selectedDateStr, (newDate) => {
  logStore.fetchDayLog(newDate)
}, { immediate: true })

onMounted(async () => {
  if (userStore.profile.weight === null) {
    await userStore.fetchProfile()
  }
  if (dietStore.week.length === 0) {
    await dietStore.fetchDiet()
  }
})

// Find the plan for the selected real-world date
const todayPlan = computed(() => {
  return dietStore.getDayPlanForDate(selectedDateStr.value)
})

const todayMeals = computed(() => {
  return todayPlan.value ? todayPlan.value.meals : []
})

const hasProfile = computed(() => {
  return userStore.profile.weight !== null && userStore.profile.macroTargets.calories > 0
})

const targets = computed(() => userStore.profile.macroTargets)

// Calculate current totals
const currentTotals = computed(() => {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  
  const todayLogs = logStore.logs[selectedDateStr.value]
  if (!todayLogs) return totals

  for (const mealLog of todayLogs.meals) {
    if (mealLog.completed) {
      if (mealLog.actualMacros) {
        totals.calories += mealLog.actualMacros.calories
        totals.protein += mealLog.actualMacros.protein
        totals.carbs += mealLog.actualMacros.carbs
        totals.fat += mealLog.actualMacros.fat
        totals.sugar += mealLog.actualMacros.sugar
      } else {
        // Fallback to planned macros if actual are not set
        const plannedMeal = todayMeals.value.find(m => m.id === mealLog.id)
        const planned = (plannedMeal as any)?.plannedMacros
        if (planned) {
          totals.calories += planned.calories || 0
          totals.protein += planned.protein || 0
          totals.carbs += planned.carbs || 0
          totals.fat += planned.fat || 0
          totals.sugar += planned.sugar || 0
        }
      }
    }
  }
  
  return totals
})

function toggleMeal(mealId: string) {
  logStore.toggleMeal(selectedDateStr.value, mealId)
}

function isMealCompleted(mealId: string) {
  const todayLogs = logStore.logs[selectedDateStr.value]
  if (!todayLogs) return false
  const meal = todayLogs.meals.find(m => m.id === mealId)
  return meal ? meal.completed : false
}

function getMealCustomFoods(mealId: string) {
  const todayLogs = logStore.logs[selectedDateStr.value]
  if (!todayLogs) return []
  const meal = todayLogs.meals.find(m => m.id === mealId)
  return meal?.customFoods || []
}

// Demo data injector
function loadDemoDiet() {
  dietStore.setDiet([
    {
      date: 'demo',
      dayName: 'Plan Demo',
      assignedDays: [0, 1, 2, 3, 4, 5, 6],
      meals: [
        { id: 'm1', name: 'Desayuno', plannedMacros: { calories: 400, protein: 30, carbs: 40, fat: 10, sugar: 5 } } as any,
        { id: 'm2', name: 'Comida', plannedMacros: { calories: 600, protein: 45, carbs: 55, fat: 15, sugar: 8 } } as any,
        { id: 'm3', name: 'Cena', plannedMacros: { calories: 500, protein: 40, carbs: 35, fat: 20, sugar: 5 } } as any,
      ]
    }
  ])
}
</script>

<template>
  <div class="h-full flex flex-col relative max-w-md md:max-w-lg mx-auto w-full">
    <!-- Sticky Top Bar (Brand & Date Slider) -->
    <div class="sticky top-0 z-20 px-4 pt-4 pb-2 transition-colors backdrop-blur-md shadow-xs" style="background: var(--glass-bg); border-bottom: 1px solid var(--glass-border);">
      <!-- Header with App Brand/Greeting & Quick Theme Switcher -->
      <div class="flex items-center justify-between mb-3 px-1">
        <div>
          <h1 class="text-lg font-bold leading-tight" style="font-family: var(--font-display); color: var(--on-surface);">
            {{ userStore.profile.name ? `Hola, ${userStore.profile.name.split(' ')[0]}` : 'Mi Plan Diario' }}
          </h1>
          <p class="text-[11px] font-medium" style="color: var(--on-surface-muted);">
            Seguimiento nutricional Talia Tinoco
          </p>
        </div>
        
        <div class="flex items-center gap-1.5 shrink-0">
          <button 
            @click="toggleTheme" 
            class="w-8 h-8 flex items-center justify-center rounded-full transition-all border border-slate-200 dark:border-white/10 shadow-xs cursor-pointer active:scale-95" 
            :title="isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
            style="background: var(--surface-container-high); color: var(--on-surface-muted);"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400 hover:text-amber-300" />
            <Moon v-else class="w-4 h-4 text-indigo-600 hover:text-indigo-500" />
          </button>
        </div>
      </div>

      <!-- Date Bubble Slider (Weekly Calendar Strip) -->
      <DateBubbleSlider v-model="selectedDateStr" />
    </div>

    <!-- Main Content Area (Scrollable Feed) -->
    <div class="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
      
      <!-- Admin Nutrióloga Quick Action (Only for authorized admin emails) -->
      <section v-if="isAdmin" class="glass-card p-4 sm:p-5 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 dark:bg-[#19e80d]/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center justify-between gap-3 relative z-10">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 dark:bg-[#19e80d] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-[#19e80d]"></span>
              </span>
              <h2 class="text-sm font-bold text-emerald-700 dark:text-[#87ff70]">Panel de Nutrióloga</h2>
            </div>
            <p class="text-xs text-slate-500 dark:text-gray-400">Acceso clínico exclusivo y herramientas de pacientes.</p>
          </div>
          <router-link to="/utilities" class="px-4 py-2.5 btn-primary text-xs font-bold shadow flex items-center gap-1.5 rounded-xl shrink-0">
            <Wrench class="w-3.5 h-3.5" />
            <span>Utilities</span>
          </router-link>
        </div>
      </section>

      <!-- Empty State: No Profile -->
      <div v-if="!hasProfile" class="glass-card p-6 text-center mt-2">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style="background: rgba(25, 232, 13, 0.1); color: var(--primary);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="font-bold mb-1" style="color: var(--on-surface);">Completa tu perfil</h3>
        <p class="text-sm mb-4" style="color: var(--on-surface-muted);">Configura tus metas y macros objetivo para empezar a rastrear.</p>
        <router-link to="/settings" class="inline-block w-full py-3 btn-primary text-sm rounded-xl">
          Ir a Cuenta
        </router-link>
      </div>

      <!-- Logged User Content -->
      <template v-else>
        <!-- Interactive Circular Macro Rings Dial -->
        <MacroRings 
          :current="currentTotals" 
          :targets="targets" 
          :isMealPlanOverride="userStore.profile.useMealPlanOverride" 
        />

        <!-- Daily Water Tracker Widget -->
        <WaterTracker :date="selectedDateStr" />

        <!-- Meals Section -->
        <div>
          <div class="flex justify-between items-end mb-3 px-1">
            <h2 class="text-lg font-bold" style="font-family: var(--font-display); color: var(--on-surface);">Comidas</h2>
            <span class="text-xs font-medium" style="color: var(--on-surface-muted);">{{ todayMeals.length }} planificadas</span>
          </div>

          <div v-if="todayMeals.length > 0">
            <MealCard 
              v-for="meal in todayMeals" 
              :key="meal.id"
              :date="selectedDateStr"
              :meal="meal as any"
              :isCompleted="isMealCompleted(meal.id)"
              :customFoods="getMealCustomFoods(meal.id)"
              @toggle="toggleMeal(meal.id)"
            />
          </div>
          
          <!-- Empty State: No Diet -->
          <div v-else class="glass-card p-6 text-center mt-2">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style="background: var(--surface-container-high); color: var(--on-surface-muted);">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="font-bold mb-1" style="color: var(--on-surface);">Sin comidas planificadas</h3>
            <p class="text-sm mb-4" style="color: var(--on-surface-muted);">Sube tu plan de dieta en PDF para generar automáticamente tus comidas diarias.</p>
            
            <router-link to="/upload" class="inline-block w-full py-3 btn-primary text-sm font-bold rounded-xl mb-3">
              Subir Plan PDF
            </router-link>
            
            <button @click="loadDemoDiet" class="inline-block btn-secondary text-xs px-4 py-2 rounded-lg">
              Cargar Demo
            </button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
