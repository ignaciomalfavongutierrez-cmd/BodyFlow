import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'

export interface LoggedMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export interface CustomFood {
  id: string
  name: string
  quantity: string
  macros: LoggedMacros
}

export interface LoggedMeal {
  id: string
  completed: boolean
  actualMacros: LoggedMacros | null
  customFoods?: CustomFood[]
  substitutedItems?: number[]
}

export interface DailyLog {
  date: string // YYYY-MM-DD
  meals: LoggedMeal[]
}

export const useLogStore = defineStore('log', () => {
  const logs = ref<Record<string, DailyLog>>({})
  const unsubscribes: Record<string, () => void> = {}

  function fetchDayLog(date: string) {
    const uid = auth.currentUser?.uid
    if (!uid) return Promise.resolve()

    if (unsubscribes[date]) {
      return Promise.resolve()
    }

    const docRef = doc(db, `users/${uid}/logs`, date)
    
    return new Promise<void>((resolve) => {
      let isFirstLoad = true
      unsubscribes[date] = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          logs.value[date] = docSnap.data() as DailyLog
        } else {
          logs.value[date] = { date, meals: [] }
        }
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      }, (error) => {
        console.error(`[FIREBASE ERROR] Path: users/${uid}/logs/${date}`, error)
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      })
    })
  }

  async function saveDayLog(date: string) {
    const uid = auth.currentUser?.uid
    if (!uid || !logs.value[date]) return
    
    const docRef = doc(db, `users/${uid}/logs`, date)
    await setDoc(docRef, logs.value[date])
  }

  function ensureLogExists(date: string) {
    if (!logs.value[date]) {
      logs.value[date] = { date, meals: [] }
    }
  }

  async function toggleMeal(date: string, mealId: string) {
    if (!logs.value[date]) await fetchDayLog(date)
    ensureLogExists(date)
    
    let meal = logs.value[date].meals.find(m => m.id === mealId)
    if (!meal) {
      meal = { id: mealId, completed: false, actualMacros: null }
      logs.value[date].meals.push(meal)
    }
    
    meal.completed = !meal.completed
    await saveDayLog(date)
  }

  async function setMealMacros(date: string, mealId: string, macros: LoggedMacros) {
    if (!logs.value[date]) await fetchDayLog(date)
    ensureLogExists(date)
    
    let meal = logs.value[date].meals.find(m => m.id === mealId)
    if (!meal) {
      meal = { id: mealId, completed: false, actualMacros: null }
      logs.value[date].meals.push(meal)
    }
    meal.actualMacros = macros
    await saveDayLog(date)
  }

  async function addCustomFood(date: string, mealId: string, food: CustomFood) {
    if (!logs.value[date]) await fetchDayLog(date)
    ensureLogExists(date)
    
    let meal = logs.value[date].meals.find(m => m.id === mealId)
    if (!meal) {
      meal = { id: mealId, completed: false, actualMacros: null, customFoods: [] }
      logs.value[date].meals.push(meal)
    }
    if (!meal.customFoods) meal.customFoods = []
    meal.customFoods.push(food)
    recalculateMacrosFromCustomFoods(meal)
    await saveDayLog(date)
  }

  function recalculateMacrosFromCustomFoods(meal: LoggedMeal) {
    if (!meal.customFoods || meal.customFoods.length === 0) return
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
    for (const food of meal.customFoods) {
      totals.calories += food.macros.calories
      totals.protein += food.macros.protein
      totals.carbs += food.macros.carbs
      totals.fat += food.macros.fat
      totals.sugar += food.macros.sugar
    }
    meal.actualMacros = totals
  }

  function reset() {
    Object.values(unsubscribes).forEach(unsub => unsub())
    for (const key in unsubscribes) delete unsubscribes[key]
    logs.value = {}
  }

  async function removeCustomFood(date: string, mealId: string, foodId: string) {
    ensureLogExists(date)
    const meal = logs.value[date].meals.find(m => m.id === mealId)
    if (!meal || !meal.customFoods) return
    
    meal.customFoods = meal.customFoods.filter(f => f.id !== foodId)
    if (meal.customFoods.length === 0) {
      meal.actualMacros = null
    } else {
      recalculateMacrosFromCustomFoods(meal)
    }
    await saveDayLog(date)
  }

  async function clearCustomFoods(date: string, mealId: string, macros: LoggedMacros) {
    ensureLogExists(date)
    const meal = logs.value[date].meals.find(m => m.id === mealId)
    if (!meal) return
    
    meal.customFoods = []
    meal.substitutedItems = []
    meal.actualMacros = macros
    await saveDayLog(date)
  }

  async function toggleSubstitutedItem(date: string, mealId: string, itemIndex: number) {
    if (!logs.value[date]) await fetchDayLog(date)
    ensureLogExists(date)
    
    let meal = logs.value[date].meals.find(m => m.id === mealId)
    if (!meal) {
      meal = { id: mealId, completed: false, actualMacros: null }
      logs.value[date].meals.push(meal)
    }
    
    if (!meal.substitutedItems) meal.substitutedItems = []
    
    const idx = meal.substitutedItems.indexOf(itemIndex)
    if (idx > -1) {
      meal.substitutedItems.splice(idx, 1)
    } else {
      meal.substitutedItems.push(itemIndex)
    }
    
    await saveDayLog(date)
  }

  return {
    logs,
    fetchDayLog,
    toggleMeal,
    setMealMacros,
    addCustomFood,
    removeCustomFood,
    clearCustomFoods,
    toggleSubstitutedItem,
    reset
  }
})
