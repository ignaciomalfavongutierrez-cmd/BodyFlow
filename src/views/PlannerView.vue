<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDietStore, type DayPlan } from '../stores/diet'
import { useLogStore } from '../stores/log'
import MealCard from '../components/MealCard.vue'

const dietStore = useDietStore()
const logStore = useLogStore()

// We need a list of days to display in the header.
// If we have a diet loaded, we use its dates. If not, we just show today.
const weekDays = computed(() => {
  if (dietStore.week.length === 0) return []
  return dietStore.week.map(dayPlan => dayPlan.date)
})

const selectedDate = ref('')

// Initialize selected date to today, or the first available date
onMounted(() => {
  if (weekDays.value.length > 0) {
    // Try to match today's ISO date; if not found (e.g. plan uses "dia N"), fall back to first entry
    const today = new Date().toISOString().split('T')[0]
    selectedDate.value = weekDays.value.includes(today)
      ? today
      : weekDays.value[0]
  }
})

function selectDate(date: string) {
  selectedDate.value = date
}

// Format date for display
// Returns { name: string, num: string | number } always (even for "dia N" strings)
function formatDisplayDate(dateStr: string): { name: string; num: string | number } {
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return { name: days[d.getDay()], num: d.getDate() }
    }
  } catch (_) { /* fall through */ }

  // Non-ISO string like "dia 1", "lunes", etc.
  // Try to extract a number for the bottom slot
  const numMatch = dateStr.match(/\d+/)
  const topLabel = dateStr.replace(/\d+/, '').trim().toUpperCase().substring(0, 3) || dateStr.substring(0, 3).toUpperCase()
  return { name: topLabel, num: numMatch ? numMatch[0] : '' }
}

const currentDayPlan = computed(() => {
  if (!selectedDate.value) return null
  return dietStore.week.find(d => d.date === selectedDate.value) || null
})

function isMealCompleted(mealId: string) {
  if (!selectedDate.value) return false
  const dailyLogs = logStore.logs[selectedDate.value]
  if (!dailyLogs) return false
  const meal = dailyLogs.meals.find(m => m.id === mealId)
  return meal ? meal.completed : false
}

function toggleMeal(mealId: string) {
  if (!selectedDate.value) return
  logStore.toggleMeal(selectedDate.value, mealId)
}

function getMealCustomFoods(mealId: string) {
  if (!selectedDate.value) return []
  const dailyLogs = logStore.logs[selectedDate.value]
  if (!dailyLogs) return []
  const meal = dailyLogs.meals.find(m => m.id === mealId)
  return meal?.customFoods || []
}

const showAssignment = ref(false)

function toggleAssignment(dayPlan: DayPlan, dayIndex: number) {
  dietStore.toggleAssignedDay(dayPlan.date, dayIndex)
}
</script>

<template>
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full bg-gray-50 min-h-[calc(100vh-64px)]">
    <!-- Sticky Header & Day Selector -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div class="px-4 pt-6 pb-2">
        <h1 class="text-xl font-bold text-gray-900 mb-4">Weekly Planner</h1>
        
        <!-- Day Navigation -->
        <div v-if="weekDays.length > 0" class="flex overflow-x-auto pb-2 hide-scrollbar snap-x">
          <div class="flex gap-2 min-w-max px-1">
            <button
              v-for="dateStr in weekDays"
              :key="dateStr"
              @click="selectDate(dateStr)"
              class="snap-start flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all font-medium border"
              :class="selectedDate === dateStr 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' 
                : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'"
            >
              <span class="text-xs mb-1" :class="selectedDate === dateStr ? 'text-emerald-100' : 'text-gray-400'">
                {{ formatDisplayDate(dateStr).name }}
              </span>
              <span class="text-lg leading-none" :class="selectedDate === dateStr ? 'font-bold' : ''"
              >
                {{ formatDisplayDate(dateStr).num || dateStr.substring(0,3) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 p-4 pb-20 overflow-y-auto">
      
      <!-- Schedule Assignment Table -->
      <div v-if="dietStore.week.length > 0" class="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-gray-800 text-sm">Assign to Weekdays</h3>
          <button @click="showAssignment = !showAssignment" class="text-xs text-blue-600 font-medium">
            {{ showAssignment ? 'Hide' : 'Edit Schedule' }}
          </button>
        </div>
        
        <div v-if="showAssignment" class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="text-gray-500 border-b border-gray-100">
                <th class="py-2 font-medium w-1/4">Plan</th>
                <th class="py-2 text-center font-medium">M</th>
                <th class="py-2 text-center font-medium">T</th>
                <th class="py-2 text-center font-medium">W</th>
                <th class="py-2 text-center font-medium">T</th>
                <th class="py-2 text-center font-medium">F</th>
                <th class="py-2 text-center font-medium">S</th>
                <th class="py-2 text-center font-medium">S</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dayPlan, index) in dietStore.week" :key="index" class="border-b border-gray-50 last:border-0">
                <td class="py-2 font-semibold text-gray-700 truncate max-w-[80px]" :title="dayPlan.dayName || dayPlan.date">{{ dayPlan.dayName || dayPlan.date }}</td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(1)" @change="toggleAssignment(dayPlan, 1)" class="accent-emerald-500 w-4 h-4" /></td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(2)" @change="toggleAssignment(dayPlan, 2)" class="accent-emerald-500 w-4 h-4" /></td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(3)" @change="toggleAssignment(dayPlan, 3)" class="accent-emerald-500 w-4 h-4" /></td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(4)" @change="toggleAssignment(dayPlan, 4)" class="accent-emerald-500 w-4 h-4" /></td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(5)" @change="toggleAssignment(dayPlan, 5)" class="accent-emerald-500 w-4 h-4" /></td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(6)" @change="toggleAssignment(dayPlan, 6)" class="accent-emerald-500 w-4 h-4" /></td>
                <td class="py-2 text-center"><input type="checkbox" :checked="dayPlan.assignedDays?.includes(0)" @change="toggleAssignment(dayPlan, 0)" class="accent-emerald-500 w-4 h-4" /></td>
              </tr>
            </tbody>
          </table>
          <p class="text-[10px] text-gray-400 mt-2">Check the days of the week you want this plan to apply to.</p>
        </div>
      </div>
      
      <div v-if="weekDays.length === 0" class="bg-white border border-gray-100 rounded-3xl p-8 text-center mt-8 shadow-sm">
        <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="font-bold text-gray-800 text-lg mb-2">No diet plan found</h3>
        <p class="text-sm text-gray-500 mb-6">Upload your weekly diet to view and manage it here.</p>
        
        <router-link to="/upload" class="inline-block w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-colors">
          Upload Plan
        </router-link>
      </div>

      <div v-else-if="currentDayPlan">
        <div class="flex justify-between items-end mb-4 px-1">
          <h2 class="text-lg font-bold text-gray-800">
            Meals for {{ currentDayPlan.dayName || formatDisplayDate(selectedDate).name }}
          </h2>
          <span class="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-md">{{ currentDayPlan.meals.length }} total</span>
        </div>

        <div class="space-y-3">
          <MealCard 
            v-for="meal in currentDayPlan.meals" 
            :key="meal.id"
            :date="selectedDate"
            :meal="meal as any"
            :isCompleted="isMealCompleted(meal.id)"
            :customFoods="getMealCustomFoods(meal.id)"
            @toggle="toggleMeal(meal.id)"
          />
        </div>
      </div>
      
      <div v-else class="text-center text-gray-500 mt-10">
        Select a date to view meals
      </div>

    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
