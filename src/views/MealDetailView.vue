<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDietStore } from '../stores/diet'
import { useLogStore } from '../stores/log'
import { useFoodsStore, type SavedFood } from '../stores/foods'
import { searchFoods, type FoodSearchResult } from '../services/foodApi'
import BaseInput from '../components/BaseInput.vue'

const route = useRoute()
const router = useRouter()
const dietStore = useDietStore()
const logStore = useLogStore()
const foodsStore = useFoodsStore()

const date = computed(() => route.params.date as string)
const mealId = computed(() => route.params.mealId as string)

const plannedMeal = computed(() => {
  // First try to resolve by assignedDays (recurring plans)
  if (date.value) {
    const [y, m, d] = date.value.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    const byDay = dietStore.week.find(dp => dp.assignedDays?.includes(dow))
    if (byDay) {
      const meal = byDay.meals.find(m => m.id === mealId.value)
      if (meal) return meal
    }
  }
  // Fallback: strict date match
  const dayPlan = dietStore.week.find(d => d.date === date.value)
  if (!dayPlan) return null
  return dayPlan.meals.find(m => m.id === mealId.value) || null
})

const loggedMeal = computed(() => {
  const dailyLogs = logStore.logs[date.value]
  if (!dailyLogs) return null
  return dailyLogs.meals.find(m => m.id === mealId.value) || null
})

const isCompleted = computed(() => loggedMeal.value?.completed || false)
const customFoods = computed(() => loggedMeal.value?.customFoods || [])

// Editable macro fields (if no custom foods)
const editCalories = ref(0)
const editProtein = ref(0)
const editCarbs = ref(0)
const editFat = ref(0)
const editSugar = ref(0)

// Search & Add UI state
const searchQuery = ref('')
const searchResults = ref<FoodSearchResult[]>([])
const isSearching = ref(false)
const showManualAdd = ref(false)
const activeTab = ref<'search' | 'my'>('search')

// My Foods
const myFoodsResults = computed(() => foodsStore.searchMyFoods(searchQuery.value))

// Manual add state
const manualName = ref('')
const manualQty = ref('')
const manualCals = ref(0)
const manualPro = ref(0)
const manualCarb = ref(0)
const manualFat = ref(0)
const manualSug = ref(0)
const saveToMyFoods = ref(false)

function initEditState() {
  if (customFoods.value.length > 0) {
    // If we have custom foods, the actualMacros are calculated from them.
    // We shouldn't strictly edit them manually, but we can display the totals in the edit fields for UI consistency.
    if (loggedMeal.value?.actualMacros) {
      editCalories.value = loggedMeal.value.actualMacros.calories
      editProtein.value = loggedMeal.value.actualMacros.protein
      editCarbs.value = loggedMeal.value.actualMacros.carbs
      editFat.value = loggedMeal.value.actualMacros.fat
      editSugar.value = loggedMeal.value.actualMacros.sugar
    }
  } else if (loggedMeal.value?.actualMacros) {
    editCalories.value = loggedMeal.value.actualMacros.calories
    editProtein.value = loggedMeal.value.actualMacros.protein
    editCarbs.value = loggedMeal.value.actualMacros.carbs
    editFat.value = loggedMeal.value.actualMacros.fat
    editSugar.value = loggedMeal.value.actualMacros.sugar
  } else if (plannedMeal.value?.plannedMacros) {
    editCalories.value = plannedMeal.value.plannedMacros.calories
    editProtein.value = plannedMeal.value.plannedMacros.protein
    editCarbs.value = plannedMeal.value.plannedMacros.carbs
    editFat.value = plannedMeal.value.plannedMacros.fat
    editSugar.value = plannedMeal.value.plannedMacros.sugar
  }
}

onMounted(() => {
  if (!plannedMeal.value) {
    router.back()
    return
  }
  initEditState()
})

watch([loggedMeal, plannedMeal], () => {
  initEditState()
}, { deep: true })

// Search logic
let searchTimeout: any = null
watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!newVal.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    searchResults.value = await searchFoods(newVal)
    isSearching.value = false
  }, 500)
})

function toggleCompletion() {
  const willBeCompleted = !isCompleted.value
  logStore.toggleMeal(date.value, mealId.value)
  
  if (willBeCompleted && !loggedMeal.value?.actualMacros && plannedMeal.value?.plannedMacros) {
    logStore.setMealMacros(date.value, mealId.value, {
      ...plannedMeal.value.plannedMacros
    })
  }
}

function saveManualEdits() {
  if (customFoods.value.length > 0) return // Edits are disabled if custom foods exist
  
  logStore.setMealMacros(date.value, mealId.value, {
    calories: Number(editCalories.value),
    protein: Number(editProtein.value),
    carbs: Number(editCarbs.value),
    fat: Number(editFat.value),
    sugar: Number(editSugar.value)
  })
  
  router.back()
}

function addFoodFromSearch(food: FoodSearchResult | SavedFood) {
  logStore.addCustomFood(date.value, mealId.value, {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: food.name,
    quantity: food.description,
    macros: { ...food.macros }
  })
  searchQuery.value = ''
  searchResults.value = []
}

function saveApiResultToMyFoods(food: FoodSearchResult) {
  foodsStore.saveFood({
    name: food.name,
    description: food.description,
    macros: { ...food.macros }
  })
}

function addManualFood() {
  if (!manualName.value.trim()) return
  const macros = {
    calories: Number(manualCals.value),
    protein: Number(manualPro.value),
    carbs: Number(manualCarb.value),
    fat: Number(manualFat.value),
    sugar: Number(manualSug.value)
  }
  logStore.addCustomFood(date.value, mealId.value, {
    id: `manual_${Date.now()}`,
    name: manualName.value,
    quantity: manualQty.value || '1 serving',
    macros
  })
  if (saveToMyFoods.value) {
    foodsStore.saveFood({
      name: manualName.value,
      description: manualQty.value || '1 serving',
      macros
    })
  }
  // reset
  manualName.value = ''
  manualQty.value = ''
  manualCals.value = 0; manualPro.value = 0; manualCarb.value = 0; manualFat.value = 0; manualSug.value = 0;
  saveToMyFoods.value = false
  showManualAdd.value = false
}

function removeFood(foodId: string) {
  logStore.removeCustomFood(date.value, mealId.value, foodId)
}

function resetToPlanned() {
  if (!plannedMeal.value?.plannedMacros) return
  logStore.clearCustomFoods(date.value, mealId.value, plannedMeal.value.plannedMacros)
}
</script>

<template>
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full bg-gray-50 min-h-[calc(100vh-64px)] pb-16">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm flex items-center px-4 py-4">
      <button @click="router.back()" class="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-gray-900 ml-2">Meal Details</h1>
    </header>

    <div v-if="plannedMeal" class="flex-1 p-4 overflow-y-auto">
      
      <!-- Meal Info Card -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ plannedMeal.name }}</h2>
            <p class="text-sm font-medium text-gray-500 mt-1">{{ date }}</p>
            
            <!-- Ingredients -->
            <div v-if="plannedMeal.items && plannedMeal.items.length > 0" class="mt-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredients</h3>
              <ul class="list-disc pl-4 text-sm text-gray-600 space-y-1">
                <li v-for="(item, idx) in plannedMeal.items" :key="idx">{{ item }}</li>
              </ul>
            </div>
          </div>
          
          <!-- Completion Toggle -->
          <button 
            @click="toggleCompletion"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-sm font-medium"
            :class="isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
          >
            <div 
              class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
              :class="isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-400 bg-white'"
            >
              <svg v-if="isCompleted" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            {{ isCompleted ? 'Completed' : 'Mark Complete' }}
          </button>
        </div>

        <div v-if="plannedMeal.plannedMacros" class="pt-4 border-t border-gray-100">
          <div class="flex justify-between items-center mb-3">
             <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Planned Targets</h3>
             <span v-if="customFoods.length > 0" class="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Replaced</span>
          </div>
          <div class="grid grid-cols-4 gap-2" :class="{'opacity-50': customFoods.length > 0}">
            <div class="bg-gray-50 rounded-lg p-2 text-center">
              <div class="text-[10px] text-gray-500 mb-0.5">Kcal</div>
              <div class="font-bold text-gray-800">{{ plannedMeal.plannedMacros.calories }}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2 text-center">
              <div class="text-[10px] text-gray-500 mb-0.5">Pro</div>
              <div class="font-bold text-gray-800">{{ plannedMeal.plannedMacros.protein }}g</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2 text-center">
              <div class="text-[10px] text-gray-500 mb-0.5">Carb</div>
              <div class="font-bold text-gray-800">{{ plannedMeal.plannedMacros.carbs }}g</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2 text-center">
              <div class="text-[10px] text-gray-500 mb-0.5">Fat</div>
              <div class="font-bold text-gray-800">{{ plannedMeal.plannedMacros.fat }}g</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actual Consumption Card (Only if completed) -->
      <div v-if="isCompleted" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Actual Macros
          </h3>
          <button v-if="customFoods.length > 0" @click="resetToPlanned" class="text-xs text-red-500 font-medium hover:text-red-700">
            Reset to Planned
          </button>
        </div>

        <div v-if="customFoods.length > 0" class="mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <p class="text-xs text-emerald-700 font-medium">
            Macros are dynamically locked and calculated from your custom substitutions.
          </p>
        </div>
        <p v-else class="text-xs text-gray-500 mb-4">
          Did you eat exactly what was planned? If not, adjust below or use substitutions.
        </p>

        <!-- Current Total Actual Macros -->
        <div class="space-y-1" :class="{'opacity-75 pointer-events-none': customFoods.length > 0}">
          <BaseInput label="Calories (kcal)" v-model="editCalories" type="number" />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput label="Protein (g)" v-model="editProtein" type="number" />
            <BaseInput label="Carbs (g)" v-model="editCarbs" type="number" />
            <BaseInput label="Fat (g)" v-model="editFat" type="number" />
            <BaseInput label="Sugar (g)" v-model="editSugar" type="number" />
          </div>
        </div>
        
        <button 
          v-if="customFoods.length === 0"
          @click="saveManualEdits"
          class="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-sm"
        >
          Save Manual Changes
        </button>
      </div>

      <!-- Substitution Section -->
      <div v-if="isCompleted" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 class="text-sm font-bold text-gray-800 mb-1">Substitutions</h3>
        <p class="text-xs text-gray-500 mb-4">Replace your planned meal with real foods.</p>
        
        <!-- List of Custom Foods already added -->
        <div v-if="customFoods.length > 0" class="space-y-3 mb-6">
          <div v-for="food in customFoods" :key="food.id" class="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div class="font-semibold text-sm text-gray-800">{{ food.name }}</div>
              <div class="text-[10px] text-gray-500 flex gap-2 mt-1">
                <span>{{ food.quantity }}</span>
                <span>•</span>
                <span>{{ food.macros.calories }} kcal</span>
                <span>P: {{ food.macros.protein }}g</span>
              </div>
            </div>
            <button @click="removeFood(food.id)" class="p-2 text-red-400 hover:text-red-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Add Food Controls -->
        <div>
          <!-- Search Bar -->
          <div class="relative mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search foods or My Foods..." 
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            >
          </div>

          <!-- Tabs: Database vs My Foods -->
          <div class="flex bg-gray-100 rounded-xl p-1 mb-3">
            <button @click="activeTab = 'search'" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors" :class="activeTab === 'search' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'">Database</button>
            <button @click="activeTab = 'my'" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors" :class="activeTab === 'my' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'">
              My Foods <span v-if="foodsStore.myFoods.length > 0" class="ml-1 bg-emerald-500 text-white rounded-full px-1.5 text-[10px]">{{ foodsStore.myFoods.length }}</span>
            </button>
          </div>

          <!-- Database Search Results -->
          <div v-if="activeTab === 'search'" class="bg-white border border-gray-100 rounded-xl shadow-sm max-h-60 overflow-y-auto mb-4">
            <div v-if="isSearching" class="p-4 text-center text-xs text-gray-500">Searching...</div>
            <div v-else-if="searchQuery && searchResults.length === 0" class="p-4 text-center text-xs text-gray-500">No results found.</div>
            <div v-else-if="!searchQuery" class="p-4 text-center text-xs text-gray-400">Type to search food database...</div>
            <div v-else v-for="res in searchResults" :key="res.id" class="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div class="flex-1 min-w-0" @click="addFoodFromSearch(res)" role="button">
                <div class="font-medium text-sm text-gray-800">{{ res.name }}</div>
                <div class="text-[10px] text-gray-500 mt-0.5">{{ res.description }} • {{ res.macros.calories }} kcal, P: {{ res.macros.protein }}g</div>
              </div>
              <div class="flex items-center gap-1 ml-2">
                <button @click="saveApiResultToMyFoods(res)" class="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors" title="Save to My Foods">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
                <button @click="addFoodFromSearch(res)" class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Add to meal">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- My Foods Results -->
          <div v-if="activeTab === 'my'" class="bg-white border border-gray-100 rounded-xl shadow-sm max-h-60 overflow-y-auto mb-4">
            <div v-if="myFoodsResults.length === 0" class="p-4 text-center text-xs text-gray-400">
              {{ searchQuery ? 'No saved foods match your search.' : 'No foods saved yet. Use the bookmark icon in search results to save.' }}
            </div>
            <div v-for="food in myFoodsResults" :key="food.id" class="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm text-gray-800">{{ food.name }}</div>
                <div class="text-[10px] text-gray-500 mt-0.5">{{ food.description }} • {{ food.macros.calories }} kcal, P: {{ food.macros.protein }}g</div>
              </div>
              <div class="flex items-center gap-1 ml-2">
                <button @click="foodsStore.removeFood(food.id)" class="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Remove from My Foods">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button @click="addFoodFromSearch(food)" class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Add to meal">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Toggle Manual Entry -->
          <button @click="showManualAdd = !showManualAdd" class="text-xs font-medium text-blue-600 hover:text-blue-800 mb-2">
            {{ showManualAdd ? '- Cancel manual entry' : '+ Add food manually' }}
          </button>

          <!-- Manual Entry Form -->
          <div v-if="showManualAdd" class="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-2 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <BaseInput label="Name" v-model="manualName" placeholder="e.g. Rice" />
              <BaseInput label="Quantity" v-model="manualQty" placeholder="e.g. 100g" />
            </div>
            <div class="grid grid-cols-5 gap-2">
              <BaseInput label="Kcal" v-model="manualCals" type="number" />
              <BaseInput label="Pro" v-model="manualPro" type="number" />
              <BaseInput label="Carb" v-model="manualCarb" type="number" />
              <BaseInput label="Fat" v-model="manualFat" type="number" />
              <BaseInput label="Sug" v-model="manualSug" type="number" />
            </div>
            <!-- Save to My Foods toggle -->
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <div class="relative">
                <input type="checkbox" v-model="saveToMyFoods" class="sr-only" />
                <div class="w-8 h-4 rounded-full transition-colors" :class="saveToMyFoods ? 'bg-emerald-500' : 'bg-gray-300'"></div>
                <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform" :class="saveToMyFoods ? 'translate-x-4' : ''"></div>
              </div>
              <span class="text-xs text-gray-600">Save to My Foods for later</span>
            </label>
            <button @click="addManualFood" class="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
              Add to Meal
            </button>
          </div>
        </div>
      </div>

      <!-- Call to Action if not completed -->
      <div v-if="!isCompleted" class="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
        <div class="w-12 h-12 bg-white text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-bold text-gray-800 mb-1">Waiting for meal</h3>
        <p class="text-sm text-gray-600 mb-4">Mark this meal as complete when you eat it to log the macros.</p>
        <button 
          @click="toggleCompletion"
          class="inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm"
        >
          Mark as Completed
        </button>
      </div>

    </div>
  </div>
</template>
