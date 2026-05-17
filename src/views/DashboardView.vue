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
  // Ensure profile and diet are loaded if not already
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
  // Re-format back to YYYY-MM-DD
  selectedDateStr.value = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
}

const displayDateTitle = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  if (selectedDateStr.value === todayStr) return 'Today'
  
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return formatter.format(selectedDateObj.value)
})

// Find the plan for the selected real-world date
const todayPlan = computed(() => {
  const currentDayOfWeek = selectedDateObj.value.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  
  // Find by recurrences (assignedDays)
  const assignedPlan = dietStore.week.find(d => d.assignedDays && d.assignedDays.includes(currentDayOfWeek))
  if (assignedPlan) return assignedPlan
  
  // Fallback to strict string match (e.g. legacy or manual mapped dates)
  return dietStore.week.find(d => d.date === selectedDateStr.value) || null
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
      dayName: 'Demo Plan',
      assignedDays: [0, 1, 2, 3, 4, 5, 6], // all week
      meals: [
        { id: 'm1', name: 'Breakfast', plannedMacros: { calories: 400, protein: 30, carbs: 40, fat: 10, sugar: 5 } } as any,
        { id: 'm2', name: 'Lunch', plannedMacros: { calories: 600, protein: 45, carbs: 55, fat: 15, sugar: 8 } } as any,
        { id: 'm3', name: 'Dinner', plannedMacros: { calories: 500, protein: 40, carbs: 35, fat: 20, sugar: 5 } } as any,
      ]
    }
  ])
}
</script>

<template>
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full">
    <!-- Sticky Top Summary -->
    <div class="sticky top-0 z-10 bg-white px-4 pt-6 pb-4 shadow-sm rounded-b-3xl">
      <!-- Header with Navigation -->
      <div class="flex items-center justify-between mb-6">
        <button @click="changeDate(-1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <h1 class="text-xl font-bold text-gray-800 text-center flex-1">
          {{ displayDateTitle }}
        </h1>
        
        <button @click="changeDate(1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <!-- Calories Summary -->
      <div class="mb-6 flex justify-between items-end">
        <div>
          <div class="text-3xl font-bold text-gray-900">{{ currentTotals.calories }}</div>
          <div class="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">Eaten</div>
        </div>
        
        <div class="text-center">
          <!-- Circular or large progress could go here, keeping simple -->
          <div class="text-sm font-medium text-gray-500">
            <span class="text-emerald-600 font-bold">{{ targets.calories - currentTotals.calories > 0 ? targets.calories - currentTotals.calories : 0 }}</span> kcal left
          </div>
        </div>
        
        <div class="text-right">
          <div class="text-xl font-bold text-gray-400">{{ targets.calories }}</div>
          <div class="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">Goal</div>
        </div>
      </div>
      
      <!-- Macros Progress Bars -->
      <div class="grid grid-cols-4 gap-3">
        <!-- Protein -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium text-gray-700">Protein</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 rounded-full transition-all duration-500" :style="{ width: `${getProgress(currentTotals.protein, targets.protein)}%` }"></div>
          </div>
          <div class="text-[10px] text-gray-500 mt-1 text-center">{{ currentTotals.protein }} / {{ targets.protein }}g</div>
        </div>
        
        <!-- Carbs -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium text-gray-700">Carbs</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="{ width: `${getProgress(currentTotals.carbs, targets.carbs)}%` }"></div>
          </div>
          <div class="text-[10px] text-gray-500 mt-1 text-center">{{ currentTotals.carbs }} / {{ targets.carbs }}g</div>
        </div>
        
        <!-- Fat -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium text-gray-700">Fat</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-amber-500 rounded-full transition-all duration-500" :style="{ width: `${getProgress(currentTotals.fat, targets.fat)}%` }"></div>
          </div>
          <div class="text-[10px] text-gray-500 mt-1 text-center">{{ currentTotals.fat }} / {{ targets.fat }}g</div>
        </div>

        <!-- Sugar -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="font-medium text-gray-700">Sugar</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-red-400 rounded-full transition-all duration-500" :style="{ width: `${getProgress(currentTotals.sugar, targets.sugar)}%` }"></div>
          </div>
          <div class="text-[10px] text-gray-500 mt-1 text-center">{{ currentTotals.sugar }} / {{ targets.sugar }}g</div>
        </div>
      </div>
    </div>

    <!-- Main Content Area (Scrollable) -->
    <div class="flex-1 p-4 pb-20 overflow-y-auto">
      
      <!-- Empty State: No Profile -->
      <div v-if="!hasProfile" class="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center mb-6 mt-4">
        <div class="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="font-bold text-gray-800 mb-1">Complete your profile</h3>
        <p class="text-sm text-gray-600 mb-4">Set your goals and macro targets to start tracking.</p>
        <router-link to="/settings" class="inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-blue-700">
          Go to Account
        </router-link>
      </div>

      <!-- Meals List -->
      <div v-else>
        <div class="flex justify-between items-end mb-4">
          <h2 class="text-lg font-bold text-gray-800">Meals</h2>
          <span class="text-xs font-medium text-gray-500">{{ todayMeals.length }} planned</span>
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
        <div v-else class="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center mt-2">
          <div class="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="font-bold text-gray-800 mb-1">No diet loaded</h3>
          <p class="text-sm text-gray-500 mb-4">Upload your PDF diet plan to automatically generate your daily meals.</p>
          
          <router-link to="/upload" class="inline-block bg-emerald-600 border border-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm mb-3 w-full">
            Upload PDF Plan
          </router-link>
          
          <button @click="loadDemoDiet" class="inline-block bg-white border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
            Load Demo Data
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
