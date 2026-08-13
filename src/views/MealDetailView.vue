<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDietStore } from '../stores/diet'
import { useLogStore } from '../stores/log'
import { useFoodsStore, type SavedFood } from '../stores/foods'
import { searchFoods, type FoodSearchResult } from '../services/foodApi'
import { 
  getSingleItemSubstitution, 
  getWholeMealAdjustment, 
  type SubstitutionResult 
} from '../services/aiParser'
import BaseInput from '../components/BaseInput.vue'
import { 
  AlertTriangle, CheckCircle, X, Search, ChevronLeft, BookmarkPlus, Plus, BookmarkMinus, 
  Sparkles, Wand2, Scale, AlertCircle, RefreshCw 
} from 'lucide-vue-next'

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

// AI Smart Substitution state
const showAiModal = ref(false)
const aiMode = ref<'single' | 'whole'>('single')
const selectedOriginalItem = ref<string>('')
const selectedOriginalIndex = ref<number>(-1)
const replacementInput = ref('')
const availableFoodsInput = ref('')

const isAiProcessing = ref(false)
const aiError = ref('')
const aiResult = ref<SubstitutionResult | null>(null)

function openSingleItemAiSubstitution(item: string, idx: number) {
  selectedOriginalItem.value = item
  selectedOriginalIndex.value = idx
  replacementInput.value = ''
  aiResult.value = null
  aiError.value = ''
  aiMode.value = 'single'
  showAiModal.value = true
}

function openWholeMealAiAdjustment() {
  availableFoodsInput.value = ''
  aiResult.value = null
  aiError.value = ''
  aiMode.value = 'whole'
  showAiModal.value = true
}

async function runAiSubstitution() {
  if (!plannedMeal.value) return
  isAiProcessing.value = true
  aiError.value = ''
  aiResult.value = null

  try {
    if (aiMode.value === 'single') {
      if (!selectedOriginalItem.value || !replacementInput.value.trim()) {
        throw new Error('Por favor indica el alimento que deseas utilizar como sustituto.')
      }
      aiResult.value = await getSingleItemSubstitution(
        selectedOriginalItem.value,
        replacementInput.value.trim(),
        plannedMeal.value.name,
        plannedMeal.value.plannedMacros
      )
    } else {
      if (!availableFoodsInput.value.trim()) {
        throw new Error('Por favor escribe los alimentos con los que cuentas.')
      }
      aiResult.value = await getWholeMealAdjustment(
        plannedMeal.value.name,
        plannedMeal.value.items || [],
        plannedMeal.value.plannedMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        availableFoodsInput.value.trim()
      )
    }
  } catch (err: any) {
    console.error('Error en Asistente IA de Sustituci+¶n:', err)
    aiError.value = err.message || 'Error al comunicarse con la IA.'
  } finally {
    isAiProcessing.value = false
  }
}

async function applyAiSubstitution() {
  if (!aiResult.value || !plannedMeal.value) return

  if (!isCompleted.value) {
    logStore.toggleMeal(date.value, mealId.value)
  }

  if (aiMode.value === 'single' && selectedOriginalIndex.value >= 0) {
    if (!isSubstituted(selectedOriginalIndex.value)) {
      logStore.toggleSubstitutedItem(date.value, mealId.value, selectedOriginalIndex.value)
    }
  } else if (aiMode.value === 'whole') {
    plannedMeal.value.items?.forEach((_, idx) => {
      if (!isSubstituted(idx)) {
        logStore.toggleSubstitutedItem(date.value, mealId.value, idx)
      }
    })
  }

  for (const item of aiResult.value.replacementFoods) {
    logStore.addCustomFood(date.value, mealId.value, {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: item.name,
      quantity: item.quantity,
      macros: {
        calories: Math.round(item.macros.calories),
        protein: Math.round(item.macros.protein),
        carbs: Math.round(item.macros.carbs),
        fat: Math.round(item.macros.fat),
        sugar: Math.round(item.macros.sugar || 0)
      }
    })
  }

  showAiModal.value = false
  aiResult.value = null
}

const macroProgress = computed(() => {
  if (!plannedMeal.value?.plannedMacros || !loggedMeal.value?.actualMacros) return null
  const p = plannedMeal.value.plannedMacros
  const a = loggedMeal.value.actualMacros

  const calcPct = (actual: number, target: number) => {
    if (!target || target <= 0) return 0
    return Math.min(Math.round((actual / target) * 100), 200)
  }

  return {
    calories: { actual: a.calories, target: p.calories, pct: calcPct(a.calories, p.calories) },
    protein:  { actual: a.protein,  target: p.protein,  pct: calcPct(a.protein, p.protein) },
    carbs:    { actual: a.carbs,    target: p.carbs,    pct: calcPct(a.carbs, p.carbs) },
    fat:      { actual: a.fat,      target: p.fat,      pct: calcPct(a.fat, p.fat) },
  }
})

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
      searchError.value = 'Error al consultar la base de datos. Int+Æntalo de nuevo.'
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

const selectedFoodToAdd = ref<{ food: FoodSearchResult | SavedFood, quantity: number, unit: string } | null>(null)

function openQuantityModal(food: FoodSearchResult | SavedFood) {
  selectedFoodToAdd.value = {
    food,
    quantity: 1,
    unit: 'porci+¶n'
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
    quantity: manualQty.value || '1 porci+¶n',
    macros
  })
  if (saveToMyFoods.value) {
    foodsStore.saveFood({
      name: manualName.value,
      description: manualQty.value || '1 porci+¶n',
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
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full min-h-[calc(100vh-64px)] pb-16" style="background: var(--surface-container-lowest);">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 px-4 py-4 flex items-center backdrop-blur-md" style="background: rgba(14, 14, 16, 0.8); border-bottom: 1px solid var(--glass-border);">
      <button @click="router.back()" class="p-2 -ml-2 transition-colors" style="color: var(--on-surface-muted); hover: color: var(--on-surface);">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <h1 class="text-xl font-bold ml-2" style="font-family: var(--font-display); color: var(--on-surface);">Detalle de Comida</h1>
    </header>

    <div v-if="plannedMeal" class="flex-1 p-4 overflow-y-auto">
      
      <!-- Meal Info Card -->
      <div class="glass-card p-5 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold truncate" style="font-family: var(--font-display); color: var(--on-surface);">{{ plannedMeal.name }}</h2>
            <p class="text-xs font-semibold mt-1" style="color: var(--on-surface-muted);">{{ date }}</p>
            
            <div v-if="plannedMeal.items && plannedMeal.items.length > 0" class="mt-5">
              <h3 class="text-[10px] font-bold uppercase tracking-wider mb-2" style="color: var(--on-surface-muted);">Ingredientes planificados</h3>
              <p class="text-[9px] mb-2.5" style="color: var(--on-surface-muted);">Presiona un ingrediente para omitirlo o usa la IA para sustituirlo.</p>
              <ul class="space-y-2 text-sm">
                <li 
                  v-for="(item, idx) in plannedMeal.items" 
                  :key="idx" 
                  class="transition-all flex items-center justify-between gap-2 p-2 rounded-xl"
                  style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);"
                  :style="{ opacity: isSubstituted(idx) ? 0.5 : 1 }"
                >
                  <div @click="toggleIngredient(idx)" class="cursor-pointer flex items-center gap-2 flex-1 min-w-0">
                    <div class="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors"
                         :style="{
                           borderColor: isSubstituted(idx) ? 'var(--primary-container)' : 'var(--outline)',
                           backgroundColor: isSubstituted(idx) ? 'var(--primary-container)' : 'transparent'
                         }">
                      <CheckCircle v-if="isSubstituted(idx)" class="w-3 h-3" style="color: var(--on-primary);" />
                    </div>
                    <span :class="{'line-through': isSubstituted(idx)}" class="truncate text-xs font-medium" :style="{ color: isSubstituted(idx) ? 'var(--on-surface-muted)' : 'var(--on-surface)' }">{{ item }}</span>
                  </div>

                  <button 
                    @click.stop="openSingleItemAiSubstitution(item, idx)"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 border transition-all hover:scale-105"
                    style="background: rgba(25, 232, 13, 0.12); color: var(--primary); border-color: rgba(25, 232, 13, 0.25);"
                    title="Sustituir este ingrediente con IA"
                  >
                    <Sparkles class="w-3 h-3" />
                    Sustituir
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            @click="toggleCompletion"
            class="flex items-center gap-2 px-3.5 py-2 rounded-full border transition-colors text-xs font-bold shrink-0 ml-3"
            :style="isCompleted ? {
              background: 'rgba(25, 232, 13, 0.15)',
              color: 'var(--primary)',
              borderColor: 'rgba(25, 232, 13, 0.3)'
            } : {
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--on-surface-muted)',
              borderColor: 'var(--glass-border)'
            }"
          >
            <CheckCircle v-if="isCompleted" class="w-4 h-4" />
            <div v-else class="w-4 h-4 rounded-full border" style="border-color: var(--outline);"></div>
            {{ isCompleted ? 'Completado' : 'Completar' }}
          </button>
        </div>

        <div v-if="plannedMeal.plannedMacros" class="pt-4 border-t" style="border-color: var(--glass-border);">
          <div class="flex justify-between items-center mb-3">
             <h3 class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--on-surface-muted);">Objetivos Planeados</h3>
             <span v-if="customFoods.length > 0" class="text-[10px] font-bold px-2 py-0.5 rounded" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24;">Sustituido</span>
          </div>
          <div class="grid grid-cols-4 gap-2" :class="{'opacity-40': customFoods.length > 0}">
            <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.2);">
              <div class="text-[9px] mb-0.5 font-bold uppercase tracking-wider" style="color: var(--on-surface-muted);">Kcal</div>
              <div class="font-bold text-sm" style="color: var(--on-surface);">{{ plannedMeal.plannedMacros.calories }}</div>
            </div>
            <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.2);">
              <div class="text-[9px] mb-0.5 font-bold uppercase tracking-wider" style="color: var(--on-surface-muted);">Prot</div>
              <div class="font-bold text-sm" style="color: var(--on-surface);">{{ plannedMeal.plannedMacros.protein }}g</div>
            </div>
            <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.2);">
              <div class="text-[9px] mb-0.5 font-bold uppercase tracking-wider" style="color: var(--on-surface-muted);">Carb</div>
              <div class="font-bold text-sm" style="color: var(--on-surface);">{{ plannedMeal.plannedMacros.carbs }}g</div>
            </div>
            <div class="rounded-lg p-2 text-center" style="background: rgba(0,0,0,0.2);">
              <div class="text-[9px] mb-0.5 font-bold uppercase tracking-wider" style="color: var(--on-surface-muted);">Grasa</div>
              <div class="font-bold text-sm" style="color: var(--on-surface);">{{ plannedMeal.plannedMacros.fat }}g</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning Banner -->
      <transition name="fade">
        <div v-if="isCompleted && isMacrosExceeded" class="border p-4 rounded-2xl mb-6 flex items-start gap-3" style="background: rgba(255, 180, 171, 0.1); border-color: rgba(255, 180, 171, 0.25);">
          <AlertTriangle class="w-5 h-5 mt-0.5 flex-shrink-0" style="color: var(--error);" />
          <div class="text-xs font-semibold leading-snug" style="color: var(--error);">
            -ÌCuidado! Has excedido los macros planeados para esta comida en m+Ìs del 5%.
          </div>
        </div>
      </transition>

      <!-- Actual Consumption Card -->
      <div v-if="isCompleted" class="glass-card p-5 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-sm font-bold flex items-center" style="color: var(--on-surface);">
            <CheckCircle class="w-4 h-4 mr-2" style="color: var(--primary-container);" />
            Macros Consumidos Reales
          </h3>
          <button v-if="customFoods.length > 0" @click="resetToPlanned" class="text-xs font-bold hover:underline" style="color: var(--error);">
            Restablecer Plan
          </button>
        </div>

        <div v-if="customFoods.length > 0" class="mb-4 p-3 rounded-xl border" style="background: rgba(25, 232, 13, 0.1); border-color: rgba(25, 232, 13, 0.2); color: var(--primary);">
          <p class="text-[11px] font-semibold">
            Los macros est+Ìn calculados din+Ìmicamente seg+¶n tus sustituciones de alimentos.
          </p>
        </div>
        <p v-else class="text-xs mb-4" style="color: var(--on-surface-muted);">
          -+Comiste exactamente lo planeado? Si no, edita los valores reales a continuaci+¶n.
        </p>

        <!-- Macro Progress Bars (Comparativa de metas) -->
        <div v-if="macroProgress" class="mb-5 p-3.5 rounded-xl border space-y-2.5" style="background: rgba(0,0,0,0.25); border-color: var(--glass-border);">
          <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1" style="color: var(--on-surface-muted);">
            <span>Balance Nutricional</span>
            <span>Real / Meta</span>
          </div>

          <!-- Calories Progress -->
          <div>
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span style="color: var(--on-surface);">Calor+°as</span>
              <span :style="{ color: macroProgress.calories.pct > 105 ? 'var(--error)' : 'var(--primary)' }">
                {{ macroProgress.calories.actual }} / {{ macroProgress.calories.target }} kcal ({{ macroProgress.calories.pct }}%)
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${Math.min(macroProgress.calories.pct, 100)}%`, backgroundColor: macroProgress.calories.pct > 105 ? 'var(--error)' : 'var(--primary)' }"></div>
            </div>
          </div>

          <!-- Protein Progress -->
          <div>
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span style="color: var(--on-surface);">Prote+°nas</span>
              <span :style="{ color: macroProgress.protein.pct > 105 ? 'var(--error)' : 'var(--primary)' }">
                {{ macroProgress.protein.actual }} / {{ macroProgress.protein.target }}g ({{ macroProgress.protein.pct }}%)
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${Math.min(macroProgress.protein.pct, 100)}%`, backgroundColor: macroProgress.protein.pct > 105 ? 'var(--error)' : 'var(--primary)' }"></div>
            </div>
          </div>

          <!-- Carbs Progress -->
          <div>
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span style="color: var(--on-surface);">Carbohidratos</span>
              <span :style="{ color: macroProgress.carbs.pct > 105 ? 'var(--error)' : 'var(--primary)' }">
                {{ macroProgress.carbs.actual }} / {{ macroProgress.carbs.target }}g ({{ macroProgress.carbs.pct }}%)
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${Math.min(macroProgress.carbs.pct, 100)}%`, backgroundColor: macroProgress.carbs.pct > 105 ? 'var(--error)' : 'var(--primary)' }"></div>
            </div>
          </div>

          <!-- Fat Progress -->
          <div>
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span style="color: var(--on-surface);">Grasas</span>
              <span :style="{ color: macroProgress.fat.pct > 105 ? 'var(--error)' : 'var(--primary)' }">
                {{ macroProgress.fat.actual }} / {{ macroProgress.fat.target }}g ({{ macroProgress.fat.pct }}%)
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08);">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${Math.min(macroProgress.fat.pct, 100)}%`, backgroundColor: macroProgress.fat.pct > 105 ? 'var(--error)' : 'var(--primary)' }"></div>
            </div>
          </div>
        </div>

        <div class="space-y-4" :class="{'opacity-50 pointer-events-none': customFoods.length > 0}">
          <div class="flex flex-col">
            <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" :style="{ color: isMacroExceeded('calories') ? 'var(--error)' : 'var(--on-surface-muted)' }">Calor+°as (kcal)</label>
            <input type="number" v-model="editCalories" class="w-full input-field" :style="isMacroExceeded('calories') ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" :style="{ color: isMacroExceeded('protein') ? 'var(--error)' : 'var(--on-surface-muted)' }">Prote+°nas (g)</label>
              <input type="number" v-model="editProtein" class="w-full input-field" :style="isMacroExceeded('protein') ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}" />
            </div>
            <div class="flex flex-col">
              <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" :style="{ color: isMacroExceeded('carbs') ? 'var(--error)' : 'var(--on-surface-muted)' }">Carbs (g)</label>
              <input type="number" v-model="editCarbs" class="w-full input-field" :style="isMacroExceeded('carbs') ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}" />
            </div>
            <div class="flex flex-col">
              <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" :style="{ color: isMacroExceeded('fat') ? 'var(--error)' : 'var(--on-surface-muted)' }">Grasas (g)</label>
              <input type="number" v-model="editFat" class="w-full input-field" :style="isMacroExceeded('fat') ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}" />
            </div>
            <div class="flex flex-col">
              <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" style="color: var(--on-surface-muted);">Az+¶car (g)</label>
              <input type="number" v-model="editSugar" class="w-full input-field" />
            </div>
          </div>
        </div>
        
        <button 
          v-if="customFoods.length === 0"
          @click="saveManualEdits"
          class="w-full mt-5 py-3.5 btn-primary text-sm shadow-md"
        >
          Guardar Cambios Manuales
        </button>
      </div>

      <!-- Substitution Section -->
      <div v-if="isCompleted" class="glass-card p-5 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-sm font-bold mb-0.5" style="color: var(--on-surface);">Sustituir Alimentos</h3>
            <p class="text-xs" style="color: var(--on-surface-muted);">Reemplaza los alimentos planificados por comida real.</p>
          </div>
          <button 
            @click="openWholeMealAiAdjustment" 
            class="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-sm transition-all hover:scale-105 shrink-0 ml-2"
            style="background: linear-gradient(135deg, rgba(25, 232, 13, 0.2), rgba(16, 185, 129, 0.1)); color: var(--primary); border-color: rgba(25, 232, 13, 0.35);"
          >
            <Sparkles class="w-4 h-4" />
            Asistente IA
          </button>
        </div>
        
        <!-- List of substitutions -->
        <div v-if="customFoods.length > 0" class="space-y-3 mb-6">
          <div v-for="food in customFoods" :key="food.id" class="flex justify-between items-center p-3 rounded-xl border" style="background: rgba(255,255,255,0.02); border-color: var(--glass-border);">
            <div>
              <div class="font-semibold text-sm" style="color: var(--on-surface);">{{ food.name }}</div>
              <div class="text-[10px] flex gap-2 mt-1" style="color: var(--on-surface-muted);">
                <span>{{ food.quantity }}</span>
                <span>‘«Û</span>
                <span class="font-semibold" style="color: var(--primary);">{{ food.macros.calories }} kcal</span>
                <span>P: {{ food.macros.protein }}g</span>
              </div>
            </div>
            <button @click="removeFood(food.id)" class="p-2 transition-colors" style="color: var(--error); hover: color: #ff3b30;">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <!-- Search Bar -->
          <div class="relative mb-4">
            <Search class="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2" style="color: var(--on-surface-muted);" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar alimentos..." 
              class="w-full pl-9 pr-4 py-3 input-field text-sm"
            >
          </div>

          <!-- Tabs -->
          <div class="flex rounded-xl p-1 mb-4" style="background: var(--surface-container-lowest); border: 1px solid var(--glass-border);">
            <button @click="activeTab = 'search'" class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors" :class="activeTab === 'search' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500'">Base de Datos</button>
            <button @click="activeTab = 'my'" class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex justify-center items-center" :class="activeTab === 'my' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500'">
              Mis Guardados <span v-if="foodsStore.myFoods.length > 0" class="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style="background: var(--primary-container); color: var(--on-primary);">{{ foodsStore.myFoods.length }}</span>
            </button>
          </div>

          <!-- Quantity popup form inside search block -->
          <div v-if="selectedFoodToAdd" class="p-4 rounded-xl mb-4 shadow-md animate-fade-in border" style="background: rgba(25, 232, 13, 0.05); border-color: rgba(25, 232, 13, 0.2);">
             <div class="flex justify-between items-start mb-3">
               <div>
                 <h4 class="font-bold text-sm" style="color: var(--primary);">{{ selectedFoodToAdd.food.name }}</h4>
                 <p class="text-[10px]" style="color: var(--on-surface-muted);">{{ selectedFoodToAdd.food.description }}</p>
               </div>
               <button @click="selectedFoodToAdd = null" style="color: var(--on-surface-muted);"><X class="w-4 h-4"/></button>
             </div>
             
             <div class="grid grid-cols-2 gap-3 mb-4">
               <div>
                 <label class="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style="color: var(--on-surface-muted);">Cantidad</label>
                 <input type="number" v-model="selectedFoodToAdd.quantity" min="0.1" step="any" class="w-full input-field text-sm bg-black/40">
               </div>
               <div>
                 <label class="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style="color: var(--on-surface-muted);">Unidad</label>
                 <select v-model="selectedFoodToAdd.unit" class="w-full input-field text-sm bg-black/40 appearance-none" style="background-image: url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.2em 1.2em; padding-right: 2rem;">
                   <option value="porci+¶n">porci+¶n</option>
                   <option value="pza">pza</option>
                   <option value="g">g</option>
                   <option value="ml">ml</option>
                 </select>
               </div>
             </div>
             
             <!-- Totals preview -->
             <div class="flex gap-4 text-[10px] font-bold justify-center mb-4" style="color: var(--primary);">
               <span>Kcal: {{ Math.round(selectedFoodToAdd.food.macros.calories * selectedFoodToAdd.quantity) }}</span>
               <span>Prot: {{ Math.round(selectedFoodToAdd.food.macros.protein * selectedFoodToAdd.quantity) }}g</span>
               <span>Carb: {{ Math.round(selectedFoodToAdd.food.macros.carbs * selectedFoodToAdd.quantity) }}g</span>
               <span>Grasa: {{ Math.round(selectedFoodToAdd.food.macros.fat * selectedFoodToAdd.quantity) }}g</span>
             </div>

             <button @click="confirmAddFood" class="w-full btn-primary py-2.5 text-sm shadow-md">
               A+¶adir a la Comida
             </button>
          </div>

          <!-- Database Results -->
          <div v-if="activeTab === 'search' && !selectedFoodToAdd" class="rounded-xl shadow-inner max-h-60 overflow-y-auto mb-4 border" style="background: rgba(0,0,0,0.15); border-color: var(--glass-border);">
            <div v-if="isSearching" class="p-5 text-center text-xs flex flex-col items-center gap-2" style="color: var(--on-surface-muted);">
              <span class="animate-pulse">Buscando en la base de datos de alimentos...</span>
              <span v-if="showWakeUpMessage" class="text-[10px] font-semibold max-w-[280px] leading-tight mt-1 p-2 rounded-lg border" style="background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.25); color: #fbbf24;">
                ‘≈¶ El servidor de Render se est+Ì despertando. Esto puede demorar hasta 50 segundos.
              </span>
            </div>
            <div v-else-if="searchError" class="p-4 text-center text-xs" style="color: var(--error);">
              ‘‹·¥©≈ {{ searchError }}
            </div>
            <div v-else-if="searchQuery && searchResults.length === 0" class="p-4 text-center text-xs" style="color: var(--on-surface-muted);">No se encontraron resultados.</div>
            <div v-else-if="!searchQuery" class="p-4 text-center text-xs" style="color: var(--on-surface-muted);">Escribe para buscar alimentos...</div>
            <div v-else v-for="res in searchResults" :key="res.id" class="flex items-center justify-between p-3 border-b last:border-0 hover:bg-white/5 transition-colors" style="border-color: var(--glass-border);">
              <div class="flex-1 min-w-0 pr-2 cursor-pointer" @click="openQuantityModal(res)" role="button">
                <div class="font-semibold text-sm truncate" style="color: var(--on-surface);">{{ res.name }}</div>
                <div class="text-[10px] mt-0.5 truncate" style="color: var(--on-surface-muted);">{{ res.description }} ‘«Û <span style="color: var(--primary);">{{ res.macros.calories }} kcal</span></div>
              </div>
              <div class="flex items-center gap-1.5 ml-2">
                <button @click="saveApiResultToMyFoods(res)" class="p-1.5 transition-colors" style="color: var(--on-surface-muted); hover: color: var(--primary);" title="Guardar en Mis Alimentos">
                  <BookmarkPlus class="w-4 h-4" />
                </button>
                <button @click="openQuantityModal(res)" class="p-1.5 transition-colors" style="color: var(--on-surface-muted); hover: color: var(--primary);" title="A+¶adir a comida">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- My Foods Results -->
          <div v-if="activeTab === 'my' && !selectedFoodToAdd" class="rounded-xl shadow-inner max-h-60 overflow-y-auto mb-4 border" style="background: rgba(0,0,0,0.15); border-color: var(--glass-border);">
            <div v-if="myFoodsResults.length === 0" class="p-4 text-center text-xs" style="color: var(--on-surface-muted);">
              {{ searchQuery ? 'No hay alimentos guardados que coincidan.' : 'A+¶n no tienes alimentos guardados.' }}
            </div>
            <div v-for="food in myFoodsResults" :key="food.id" class="flex items-center justify-between p-3 border-b last:border-0 hover:bg-white/5 transition-colors" style="border-color: var(--glass-border);">
              <div class="flex-1 min-w-0 pr-2 cursor-pointer" @click="openQuantityModal(food)" role="button">
                <div class="font-semibold text-sm truncate" style="color: var(--on-surface);">{{ food.name }}</div>
                <div class="text-[10px] mt-0.5 truncate" style="color: var(--on-surface-muted);">{{ food.description }} ‘«Û <span style="color: var(--primary);">{{ food.macros.calories }} kcal</span></div>
              </div>
              <div class="flex items-center gap-1.5 ml-2">
                <button @click="foodsStore.removeFood(food.id)" class="p-1.5 transition-colors" style="color: var(--outline); hover: color: var(--error);" title="Eliminar de Mis Alimentos">
                  <BookmarkMinus class="w-4 h-4" />
                </button>
                <button @click="openQuantityModal(food)" class="p-1.5 transition-colors" style="color: var(--on-surface-muted); hover: color: var(--primary);" title="A+¶adir a comida">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Add Manual Food Trigger -->
          <button v-if="!selectedFoodToAdd" @click="showManualAdd = !showManualAdd" class="text-xs font-semibold hover:underline" style="color: var(--primary);">
            {{ showManualAdd ? '- Cancelar ingreso manual' : '+ A+¶adir comida manualmente' }}
          </button>

          <!-- Manual Food form -->
          <div v-if="showManualAdd && !selectedFoodToAdd" class="p-4 rounded-xl mt-3 space-y-4 border" style="background: var(--glass-bg); border-color: var(--glass-border);">
            <div class="grid grid-cols-2 gap-3">
              <BaseInput label="Nombre" v-model="manualName" placeholder="Ej. Arroz cocido" />
              <BaseInput label="Porci+¶n/Detalle" v-model="manualQty" placeholder="Ej. 100g" />
            </div>
            <div class="grid grid-cols-5 gap-2">
              <BaseInput label="Kcal" v-model="manualCals" type="number" />
              <BaseInput label="Prot" v-model="manualPro" type="number" />
              <BaseInput label="Carb" v-model="manualCarb" type="number" />
              <BaseInput label="Grasa" v-model="manualFat" type="number" />
              <BaseInput label="Az+¶car" v-model="manualSug" type="number" />
            </div>
            
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <div class="relative">
                <input type="checkbox" v-model="saveToMyFoods" class="sr-only" />
                <div class="w-8 h-4 rounded-full transition-colors" :class="saveToMyFoods ? 'bg-emerald-500' : 'bg-zinc-700'"></div>
                <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform" :class="saveToMyFoods ? 'translate-x-4' : ''"></div>
              </div>
              <span class="text-xs" style="color: var(--on-surface-muted);">Guardar en Mis Alimentos para el futuro</span>
            </label>
            
            <button @click="addManualFood" class="w-full py-2.5 btn-primary text-xs shadow-sm">
              Agregar a la Comida
            </button>
          </div>
        </div>
      </div>

      <!-- Wait / Uncompleted State -->
      <div v-if="!isCompleted" class="glass-card p-6 text-center">
        <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm" style="background: rgba(255,255,255,0.02); color: var(--outline);">
          <CheckCircle class="w-6 h-6" />
        </div>
        <h3 class="font-bold mb-1" style="color: var(--on-surface);">Esperando comida</h3>
        <p class="text-xs mb-4" style="color: var(--on-surface-muted);">Marca esta comida como completada cuando la consumas para registrar tus macros reales.</p>
        <button 
          @click="toggleCompletion"
          class="w-full py-3.5 btn-primary text-sm shadow-md"
        >
          Marcar como Completada
        </button>
      </div>

    </div>

    <!-- AI Substitution Modal -->
    <transition name="fade">
      <div v-if="showAiModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-md" style="background: rgba(0,0,0,0.8);">
        <div class="glass-card w-full max-w-md p-5 rounded-3xl animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto border shadow-2xl" style="background: var(--surface-container-lowest); border-color: var(--glass-border);">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center pb-3 border-b" style="border-color: var(--glass-border);">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-xl" style="background: rgba(25, 232, 13, 0.15); color: var(--primary);">
                <Sparkles class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-base" style="font-family: var(--font-display); color: var(--on-surface);">Asistente de Sustituci+¶n IA</h3>
                <p class="text-[10px]" style="color: var(--on-surface-muted);">Calcula porciones y ajusta tu comida con Gemini</p>
              </div>
            </div>
            <button @click="showAiModal = false" class="p-1.5 rounded-full hover:bg-white/10" style="color: var(--on-surface-muted);">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Mode Selector Tabs -->
          <div class="flex rounded-xl p-1 border" style="background: rgba(0,0,0,0.2); border-color: var(--glass-border);">
            <button 
              @click="aiMode = 'single'; aiResult = null;" 
              class="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5" 
              :class="aiMode === 'single' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500'"
            >
              <Scale class="w-3.5 h-3.5" />
              1 Ingrediente
            </button>
            <button 
              @click="aiMode = 'whole'; aiResult = null;" 
              class="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5" 
              :class="aiMode === 'whole' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500'"
            >
              <Wand2 class="w-3.5 h-3.5" />
              Comida Completa ("Solo tengo...")
            </button>
          </div>

          <!-- Mode Single Form -->
          <div v-if="aiMode === 'single' && !aiResult" class="space-y-3">
            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider mb-1 block" style="color: var(--on-surface-muted);">Ingrediente Original a sustituir</label>
              <select v-model="selectedOriginalItem" class="w-full input-field text-xs bg-black/40">
                <option v-for="(item, idx) in plannedMeal?.items || []" :key="idx" :value="item">{{ item }}</option>
              </select>
            </div>

            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider mb-1 block" style="color: var(--on-surface-muted);">Alimento sustituto disponible</label>
              <input 
                v-model="replacementInput" 
                type="text" 
                placeholder="Ej. At+¶n en agua, Huevo entero, Pechuga de pavo" 
                class="w-full input-field text-xs"
              />
            </div>
          </div>

          <!-- Mode Whole Form -->
          <div v-if="aiMode === 'whole' && !aiResult" class="space-y-3">
            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider mb-1 block" style="color: var(--on-surface-muted);">Alimentos disponibles en tu cocina</label>
              <textarea 
                v-model="availableFoodsInput" 
                placeholder="Escribe lo que tienes disponible. Ej: 3 huevos, 1 lata de at+¶n, 100g de arroz cocido, aguacate, tortilla de ma+°z..." 
                class="w-full h-24 p-3 text-xs input-field resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="aiError" class="p-3 rounded-xl flex items-start gap-2 border text-xs" style="background: var(--error-container); border-color: rgba(255,180,171,0.2); color: var(--error);">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{{ aiError }}</span>
          </div>

          <!-- AI Action Button -->
          <button 
            v-if="!aiResult" 
            @click="runAiSubstitution" 
            :disabled="isAiProcessing"
            class="w-full py-3.5 btn-primary text-sm flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw v-if="isAiProcessing" class="w-4 h-4 animate-spin" />
            <Sparkles v-else class="w-4 h-4" />
            {{ isAiProcessing ? 'Calculando Porciones con IA...' : 'Calcular Porciones con IA' }}
          </button>

          <!-- AI Result View -->
          <div v-if="aiResult" class="space-y-4 animate-fade-in">
            <!-- Explanation Box -->
            <div class="p-3.5 rounded-xl border" style="background: rgba(25, 232, 13, 0.1); border-color: rgba(25, 232, 13, 0.25);">
              <p class="text-xs font-semibold leading-relaxed" style="color: var(--primary);">
                ≠É∆Ì {{ aiResult.explanation }}
              </p>
            </div>

            <!-- Warning Banner if macro difference exists or alertMessage exists -->
            <div v-if="aiResult.alertMessage" class="p-3.5 rounded-xl border flex items-start gap-2.5" style="background: rgba(251, 191, 36, 0.12); border-color: rgba(251, 191, 36, 0.3); color: #fbbf24;">
              <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
              <div class="text-xs font-semibold leading-snug">
                {{ aiResult.alertMessage }}
              </div>
            </div>

            <!-- Replacement Items List -->
            <div>
              <h4 class="text-[10px] font-bold uppercase tracking-wider mb-2" style="color: var(--on-surface-muted);">Porciones Sugeridas por IA</h4>
              <div class="space-y-2">
                <div v-for="(item, idx) in aiResult.replacementFoods" :key="idx" class="p-3 rounded-xl border flex justify-between items-center" style="background: rgba(255,255,255,0.02); border-color: var(--glass-border);">
                  <div>
                    <div class="font-semibold text-xs" style="color: var(--on-surface);">{{ item.name }}</div>
                    <div class="text-[10px] font-bold" style="color: var(--primary);">{{ item.quantity }}</div>
                  </div>
                  <div class="text-right text-[10px]" style="color: var(--on-surface-muted);">
                    <div class="font-bold" style="color: var(--on-surface);">{{ Math.round(item.macros.calories) }} kcal</div>
                    <div>P: {{ Math.round(item.macros.protein) }}g | C: {{ Math.round(item.macros.carbs) }}g | G: {{ Math.round(item.macros.fat) }}g</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2 pt-2">
              <button @click="aiResult = null" class="flex-1 py-3 btn-secondary text-xs">
                Recalcular
              </button>
              <button @click="applyAiSubstitution" class="flex-1 py-3 btn-primary text-xs shadow-md">
                Aplicar Sustituci+¶n
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
