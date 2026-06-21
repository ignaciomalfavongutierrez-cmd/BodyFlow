<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useDietStore } from '../stores/diet'
import { useLogStore } from '../stores/log'
import MealCard from '../components/MealCard.vue'

const userStore = useUserStore()
const dietStore = useDietStore()
const logStore = useLogStore()

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

// Computed JS Date
const selectedDateObj = computed(() => {
  const [y, m, d] = selectedDateStr.value.split('-').map(Number)
  return new Date(y, m - 1, d)
})

function changeDate(daysOffset: number) {
  const nextDate = new Date(selectedDateObj.value)
  nextDate.setDate(nextDate.getDate() + daysOffset)
  selectedDateStr.value = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
}

const displayDateTitle = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  if (selectedDateStr.value === todayStr) return 'Hoy'
  
  const formatter = new Intl.DateTimeFormat('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })
  return formatter.format(selectedDateObj.value)
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

// Progress percentage helpers
function getProgress(current: number, target: number) {
  if (!target) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

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
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full">
    <!-- Sticky Top Summary -->
    <div class="sticky top-0 z-10 px-4 pt-6 pb-4" style="background: var(--surface-container); border-bottom: 1px solid var(--glass-border); border-radius: 0 0 1.5rem 1.5rem;">
      <!-- Header with Navigation -->
      <div class="flex items-center justify-between mb-6">
        <button @click="changeDate(-1)" class="w-8 h-8 flex items-center justify-center rounded-full transition-colors" style="background: var(--surface-container-high); color: var(--on-surface-muted);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <h1 class="text-xl font-bold text-center flex-1" style="font-family: var(--font-display); color: var(--on-surface);">
          {{ displayDateTitle }}
        </h1>
        
        <button @click="changeDate(1)" class="w-8 h-8 flex items-center justify-center rounded-full transition-colors" style="background: var(--surface-container-high); color: var(--on-surface-muted);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Calories Summary -->
      <div class="mb-6 flex justify-between items-end">
        <div>
          <div class="text-3xl font-bold" style="font-family: var(--font-display); color: var(--primary);">{{ currentTotals.calories }}</div>
          <div class="text-xs font-bold uppercase tracking-wider mt-1" style="color: var(--on-surface-muted);">Consumido</div>
        </div>
        
        <div class="text-center">
          <div class="text-sm font-medium" style="color: var(--on-surface-muted);">
            <span class="font-bold" style="color: var(--primary-container);">{{ targets.calories - currentTotals.calories > 0 ? targets.calories - currentTotals.calories : 0 }}</span> kcal restantes
          </div>
        </div>
        
        <div class="text-right">
          <div class="text-xl font-bold" style="font-family: var(--font-display); color: var(--on-surface-muted);">{{ targets.calories }}</div>
          <div class="text-xs font-bold uppercase tracking-wider mt-1" style="color: var(--on-surface-muted);">Meta</div>
        </div>
      </div>
      
      <!-- Macros Progress Bars -->
      <div class="grid grid-cols-4 gap-3">
        <!-- Protein -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium" style="color: var(--on-surface-variant);">Proteína</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="background: #60a5fa;" :style="{ width: `${getProgress(currentTotals.protein, targets.protein)}%` }"></div>
          </div>
          <div class="text-[10px] mt-1 text-center" style="color: var(--on-surface-muted);">{{ currentTotals.protein }} / {{ targets.protein }}g</div>
        </div>
        
        <!-- Carbs -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium" style="color: var(--on-surface-variant);">Carbs</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="background: var(--primary-container);" :style="{ width: `${getProgress(currentTotals.carbs, targets.carbs)}%` }"></div>
          </div>
          <div class="text-[10px] mt-1 text-center" style="color: var(--on-surface-muted);">{{ currentTotals.carbs }} / {{ targets.carbs }}g</div>
        </div>
        
        <!-- Fat -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium" style="color: var(--on-surface-variant);">Grasa</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="background: #fbbf24;" :style="{ width: `${getProgress(currentTotals.fat, targets.fat)}%` }"></div>
          </div>
          <div class="text-[10px] mt-1 text-center" style="color: var(--on-surface-muted);">{{ currentTotals.fat }} / {{ targets.fat }}g</div>
        </div>

        <!-- Sugar -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium" style="color: var(--on-surface-variant);">Azúcar</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="background: var(--error);" :style="{ width: `${getProgress(currentTotals.sugar, targets.sugar)}%` }"></div>
          </div>
          <div class="text-[10px] mt-1 text-center" style="color: var(--on-surface-muted);">{{ currentTotals.sugar }} / {{ targets.sugar }}g</div>
        </div>
      </div>
    </div>

    <!-- Main Content Area (Scrollable) -->
    <div class="flex-1 p-4 pb-20 overflow-y-auto">
      
      <!-- Empty State: No Profile -->
      <div v-if="!hasProfile" class="glass-card p-6 text-center mb-6 mt-4">
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

      <!-- Meals List -->
      <div v-else>
        <div class="flex justify-between items-end mb-4">
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
          <h3 class="font-bold mb-1" style="color: var(--on-surface);">Sin dieta cargada</h3>
          <p class="text-sm mb-4" style="color: var(--on-surface-muted);">Sube tu plan de dieta en PDF para generar automáticamente tus comidas diarias.</p>
          
          <router-link to="/upload" class="inline-block w-full py-3 btn-primary text-sm font-bold rounded-xl mb-3">
            Subir Plan PDF
          </router-link>
          
          <button @click="loadDemoDiet" class="inline-block btn-secondary text-xs px-4 py-2 rounded-lg">
            Cargar Demo
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
