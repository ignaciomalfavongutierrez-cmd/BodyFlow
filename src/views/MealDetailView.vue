<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDietStore } from '../stores/diet'
import { useLogStore } from '../stores/log'
import { useFoodsStore, type SavedFood } from '../stores/foods'
import { searchFoods, type FoodSearchResult } from '../services/foodApi'
import BaseInput from '../components/BaseInput.vue'
import { AlertTriangle, CheckCircle, X, Search, ChevronLeft, BookmarkPlus, Plus, BookmarkMinus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const dietStore = useDietStore()
const logStore = useLogStore()
const foodsStore = useFoodsStore()

const date = computed(() => route.params.date as string)
const mealId = computed(() => route.params.mealId as string)

const plannedMeal = computed(() => {
  if (date.value) {
    const [y, m, d] = date.value.split('-').map(Number)
    const dow = new Date(y, m - 1, d).getDay()
    const byDay = dietStore.week.find(dp => dp.assignedDays?.includes(dow))
    if (byDay) {
      const meal = byDay.meals.find(m => m.id === mealId.value)
      if (meal) return meal
    }
  }
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
const substitutedItems = computed(() => loggedMeal.value?.substitutedItems || [])

const editCalories = ref(0)
const editProtein = ref(0)
const editCarbs = ref(0)
const editFat = ref(0)
const editSugar = ref(0)

const searchQuery = ref('')
const searchResults = ref<FoodSearchResult[]>([])
const isSearching = ref(false)
const showManualAdd = ref(false)
const activeTab = ref<'search' | 'my'>('search')

const showWakeUpMessage = ref(false)
const searchError = ref('')

const myFoodsResults = computed(() => foodsStore.searchMyFoods(searchQuery.value))

const manualName = ref('')
const manualQty = ref('')
const manualCals = ref(0)
const manualPro = ref(0)
const manualCarb = ref(0)
const manualFat = ref(0)
const manualSug = ref(0)
const saveToMyFoods = ref(false)

const isMacrosExceeded = computed(() => {
  if (!plannedMeal.value?.plannedMacros || !loggedMeal.value?.actualMacros) return false
  const p = plannedMeal.value.plannedMacros
  const a = loggedMeal.value.actualMacros
  return a.calories > p.calories * 1.05 || 
         a.protein > p.protein * 1.05 || 
         a.carbs > p.carbs * 1.05 || 
         a.fat > p.fat * 1.05
})

function initEditState() {
  if (customFoods.value.length > 0) {
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
    editSugar.value = plannedMeal.value.plannedMacros.sugar ?? 0
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

let searchTimeout: any = null
let wakeUpTimeout: any = null

watch(searchQuery, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (wakeUpTimeout) clearTimeout(wakeUpTimeout)
  
  if (!newVal.trim()) {
    searchResults.value = []
    isSearching.value = false
    showWakeUpMessage.value = false
    searchError.value = ''
    return
  }
  
  isSearching.value = true
  showWakeUpMessage.value = false
  searchError.value = ''
  
  // Set a timeout to display a "wake up" warning if the request takes more than 3 seconds
  wakeUpTimeout = setTimeout(() => {
    if (isSearching.value) {
      showWakeUpMessage.value = true
    }
  }, 3000)

  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await searchFoods(newVal)
    } catch (err: any) {
      console.error(err)
      searchError.value = 'Error al consultar la base de datos. Inténtalo de nuevo.'
    } finally {
      isSearching.value = false
      showWakeUpMessage.value = false
      if (wakeUpTimeout) clearTimeout(wakeUpTimeout)
    }
  }, 500)
})

function toggleCompletion() {
  const willBeCompleted = !isCompleted.value
  logStore.toggleMeal(date.value, mealId.value)
  
  if (willBeCompleted && !loggedMeal.value?.actualMacros && plannedMeal.value?.plannedMacros) {
    logStore.setMealMacros(date.value, mealId.value, {
      ...plannedMeal.value.plannedMacros,
      sugar: plannedMeal.value.plannedMacros.sugar ?? 0
    })
  }
}

function toggleIngredient(idx: number) {
  logStore.toggleSubstitutedItem(date.value, mealId.value, idx)
}
function isSubstituted(idx: number) {
  return substitutedItems.value.includes(idx)
}

function saveManualEdits() {
  if (customFoods.value.length > 0) return 
  logStore.setMealMacros(date.value, mealId.value, {
    calories: Number(editCalories.value),
    protein: Number(editProtein.value),
    carbs: Number(editCarbs.value),
    fat: Number(editFat.value),
    sugar: Number(editSugar.value)
  })
  router.back()
}

// Multiplying logic
const selectedFoodToAdd = ref<{ food: FoodSearchResult | SavedFood, quantity: number, unit: string } | null>(null)

function openQuantityModal(food: FoodSearchResult | SavedFood) {
  selectedFoodToAdd.value = {
    food,
    quantity: 1,
    unit: 'serving'
  }
}

function confirmAddFood() {
  if (!selectedFoodToAdd.value) return
  const { food, quantity, unit } = selectedFoodToAdd.value
  
  const mult = quantity
  const macros = {
    calories: Math.round(food.macros.calories * mult),
    protein: Math.round(food.macros.protein * mult),
    carbs: Math.round(food.macros.carbs * mult),
    fat: Math.round(food.macros.fat * mult),
    sugar: Math.round((food.macros.sugar || 0) * mult)
  }

  logStore.addCustomFood(date.value, mealId.value, {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: food.name,
    quantity: `${quantity} ${unit} (${food.description})`,
    macros
  })
  
  selectedFoodToAdd.value = null
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
  logStore.clearCustomFoods(date.value, mealId.value, {
    ...plannedMeal.value.plannedMacros,
    sugar: plannedMeal.value.plannedMacros.sugar ?? 0
  })
}

function isMacroExceeded(type: 'calories'|'protein'|'carbs'|'fat') {
  if (!plannedMeal.value?.plannedMacros || !loggedMeal.value?.actualMacros) return false;
  return loggedMeal.value.actualMacros[type] > plannedMeal.value.plannedMacros[type] * 1.05;
}

</script>

<template>
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full bg-gray-50 min-h-[calc(100vh-64px)] pb-16">
    <header class="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-gray-100 shadow-sm flex items-center px-4 py-4">
      <button @click="router.back()" class="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors">
        <ChevronLeft class="w-6 h-6" />
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
            
            <div v-if="plannedMeal.items && plannedMeal.items.length > 0" class="mt-4">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredients</h3>
              <p class="text-[10px] text-gray-400 mb-2">Tap an ingredient to mark it as substituted.</p>
              <ul class="text-sm text-gray-600 space-y-2">
                <li 
                  v-for="(item, idx) in plannedMeal.items" 
                  :key="idx" 
                  @click="toggleIngredient(idx)"
                  class="cursor-pointer transition-all flex items-start gap-2"
                  :class="{'opacity-50 line-through': isSubstituted(idx)}"
                >
                  <div class="w-4 h-4 rounded-full border border-gray-300 mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors"
                       :class="{'bg-emerald-500 border-emerald-500': isSubstituted(idx)}">
                    <CheckCircle v-if="isSubstituted(idx)" class="w-3 h-3 text-white" />
                  </div>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            @click="toggleCompletion"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-sm font-medium"
            :class="isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
          >
            <CheckCircle v-if="isCompleted" class="w-4 h-4" />
            <div v-else class="w-4 h-4 rounded-full border border-gray-400"></div>
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

      <!-- Warning Banner Glassmorphism -->
      <transition name="fade">
        <div v-if="isCompleted && isMacrosExceeded" class="bg-white/10 backdrop-blur-md border border-red-500/30 p-4 rounded-2xl shadow-[0_4px_30px_rgba(255,0,0,0.05)] mb-6 flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-red-800 font-medium leading-snug">
            Watch out! You have exceeded some of your planned macros for this meal.
          </div>
        </div>
      </transition>

      <!-- Actual Consumption Card -->
      <div v-if="isCompleted" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold text-gray-800 flex items-center">
            <CheckCircle class="w-4 h-4 text-emerald-500 mr-2" />
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

        <div class="space-y-3" :class="{'opacity-75 pointer-events-none': customFoods.length > 0}">
          <div class="flex flex-col">
            <label class="text-sm font-medium mb-1" :class="isMacroExceeded('calories') ? 'text-red-600' : 'text-gray-700'">Calories (kcal)</label>
            <input type="number" v-model="editCalories" class="px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full" :class="isMacroExceeded('calories') ? 'border-red-300 text-red-700 font-bold' : 'border-gray-200 text-gray-900'" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-sm font-medium mb-1" :class="isMacroExceeded('protein') ? 'text-red-600' : 'text-gray-700'">Protein (g)</label>
              <input type="number" v-model="editProtein" class="px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full" :class="isMacroExceeded('protein') ? 'border-red-300 text-red-700 font-bold' : 'border-gray-200 text-gray-900'" />
            </div>
            <div class="flex flex-col">
              <label class="text-sm font-medium mb-1" :class="isMacroExceeded('carbs') ? 'text-red-600' : 'text-gray-700'">Carbs (g)</label>
              <input type="number" v-model="editCarbs" class="px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full" :class="isMacroExceeded('carbs') ? 'border-red-300 text-red-700 font-bold' : 'border-gray-200 text-gray-900'" />
            </div>
            <div class="flex flex-col">
              <label class="text-sm font-medium mb-1" :class="isMacroExceeded('fat') ? 'text-red-600' : 'text-gray-700'">Fat (g)</label>
              <input type="number" v-model="editFat" class="px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full" :class="isMacroExceeded('fat') ? 'border-red-300 text-red-700 font-bold' : 'border-gray-200 text-gray-900'" />
            </div>
            <div class="flex flex-col">
              <label class="text-sm font-medium mb-1 text-gray-700">Sugar (g)</label>
              <input type="number" v-model="editSugar" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full text-gray-900" />
            </div>
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
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <div class="relative mb-3">
            <Search class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search foods or My Foods..." 
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            >
          </div>

          <div class="flex bg-gray-100 rounded-xl p-1 mb-3">
            <button @click="activeTab = 'search'" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors" :class="activeTab === 'search' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'">Database</button>
            <button @click="activeTab = 'my'" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors" :class="activeTab === 'my' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'">
              My Foods <span v-if="foodsStore.myFoods.length > 0" class="ml-1 bg-emerald-500 text-white rounded-full px-1.5 text-[10px]">{{ foodsStore.myFoods.length }}</span>
            </button>
          </div>

          <div v-if="selectedFoodToAdd" class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-4 shadow-sm animate-fade-in">
             <div class="flex justify-between items-start mb-3">
               <div>
                 <h4 class="font-bold text-sm text-emerald-900">{{ selectedFoodToAdd.food.name }}</h4>
                 <p class="text-[10px] text-emerald-700">{{ selectedFoodToAdd.food.description }}</p>
               </div>
               <button @click="selectedFoodToAdd = null" class="text-emerald-500 hover:text-emerald-700"><X class="w-4 h-4"/></button>
             </div>
             
             <div class="grid grid-cols-2 gap-3 mb-4">
               <div>
                 <label class="text-xs font-medium text-emerald-800 mb-1 block">Quantity</label>
                 <input type="number" v-model="selectedFoodToAdd.quantity" min="0.1" step="any" class="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
               </div>
               <div>
                 <label class="text-xs font-medium text-emerald-800 mb-1 block">Unit</label>
                 <select v-model="selectedFoodToAdd.unit" class="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                   <option value="serving">serving</option>
                   <option value="pza">pza</option>
                   <option value="g">g</option>
                   <option value="ml">ml</option>
                 </select>
               </div>
             </div>
             
             <!-- Totals preview -->
             <div class="flex gap-3 text-[10px] text-emerald-800 font-medium mb-3 justify-center">
               <span>Kcal: {{ Math.round(selectedFoodToAdd.food.macros.calories * selectedFoodToAdd.quantity) }}</span>
               <span>Pro: {{ Math.round(selectedFoodToAdd.food.macros.protein * selectedFoodToAdd.quantity) }}g</span>
               <span>Carb: {{ Math.round(selectedFoodToAdd.food.macros.carbs * selectedFoodToAdd.quantity) }}g</span>
               <span>Fat: {{ Math.round(selectedFoodToAdd.food.macros.fat * selectedFoodToAdd.quantity) }}g</span>
             </div>

             <button @click="confirmAddFood" class="w-full bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors">
               Add Item
             </button>
          </div>

          <div v-if="activeTab === 'search' && !selectedFoodToAdd" class="bg-white border border-gray-100 rounded-xl shadow-sm max-h-60 overflow-y-auto mb-4">
            <div v-if="isSearching" class="p-4 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
              <span class="animate-pulse">Buscando en la base de datos...</span>
              <span v-if="showWakeUpMessage" class="text-[10px] text-amber-600 font-medium max-w-[250px] leading-tight mt-1 bg-amber-50 p-2 rounded-lg border border-amber-100">
                ⏳ El servidor en la nube (Render) está despertando. Esto puede tardar hasta 50 segundos. Gracias por tu paciencia.
              </span>
            </div>
            <div v-else-if="searchError" class="p-4 text-center text-xs text-red-500">
              ⚠️ {{ searchError }}
            </div>
            <div v-else-if="searchQuery && searchResults.length === 0" class="p-4 text-center text-xs text-gray-500">No results found.</div>
            <div v-else-if="!searchQuery" class="p-4 text-center text-xs text-gray-400">Type to search food database...</div>
            <div v-else v-for="res in searchResults" :key="res.id" class="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div class="flex-1 min-w-0" @click="openQuantityModal(res)" role="button">
                <div class="font-medium text-sm text-gray-800">{{ res.name }}</div>
                <div class="text-[10px] text-gray-500 mt-0.5">{{ res.description }} • {{ res.macros.calories }} kcal, P: {{ res.macros.protein }}g</div>
              </div>
              <div class="flex items-center gap-1 ml-2">
                <button @click="saveApiResultToMyFoods(res)" class="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors" title="Save to My Foods">
                  <BookmarkPlus class="w-4 h-4" />
                </button>
                <button @click="openQuantityModal(res)" class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Add to meal">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'my' && !selectedFoodToAdd" class="bg-white border border-gray-100 rounded-xl shadow-sm max-h-60 overflow-y-auto mb-4">
            <div v-if="myFoodsResults.length === 0" class="p-4 text-center text-xs text-gray-400">
              {{ searchQuery ? 'No saved foods match your search.' : 'No foods saved yet.' }}
            </div>
            <div v-for="food in myFoodsResults" :key="food.id" class="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <div class="flex-1 min-w-0" @click="openQuantityModal(food)" role="button">
                <div class="font-medium text-sm text-gray-800">{{ food.name }}</div>
                <div class="text-[10px] text-gray-500 mt-0.5">{{ food.description }} • {{ food.macros.calories }} kcal, P: {{ food.macros.protein }}g</div>
              </div>
              <div class="flex items-center gap-1 ml-2">
                <button @click="foodsStore.removeFood(food.id)" class="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Remove from My Foods">
                  <BookmarkMinus class="w-4 h-4" />
                </button>
                <button @click="openQuantityModal(food)" class="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Add to meal">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button v-if="!selectedFoodToAdd" @click="showManualAdd = !showManualAdd" class="text-xs font-medium text-blue-600 hover:text-blue-800 mb-2">
            {{ showManualAdd ? '- Cancel manual entry' : '+ Add food manually' }}
          </button>

          <div v-if="showManualAdd && !selectedFoodToAdd" class="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-2 space-y-3">
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

      <div v-if="!isCompleted" class="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
        <div class="w-12 h-12 bg-white text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <CheckCircle class="w-6 h-6" />
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

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
