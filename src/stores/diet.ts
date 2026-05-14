import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'

export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar?: number
}

export interface MealPlan {
  id: string
  name: string
  items?: string[]
  plannedMacros?: MacroTargets
}

export interface DayPlan {
  dayName?: string
  date: string
  assignedDays?: number[]
  meals: MealPlan[]
}

export const useDietStore = defineStore('diet', () => {
  const week = ref<DayPlan[]>([])
  let unsubscribe: (() => void) | null = null

  function fetchDiet() {
    const uid = auth.currentUser?.uid
    if (!uid) return Promise.resolve()

    if (unsubscribe) unsubscribe()

    const docRef = doc(db, `users/${uid}/diet`, 'current')
    
    return new Promise<void>((resolve) => {
      let isFirstLoad = true
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          week.value = (docSnap.data() as { week: DayPlan[] }).week
        }
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      }, (error) => {
        console.error("Error listening to diet:", error)
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      })
    })
  }

  async function setDiet(newWeek: DayPlan[]) {
    // Optimistic UI handled by onSnapshot directly if we don't block
    // but for immediate response we can update it locally
    week.value = newWeek
    const uid = auth.currentUser?.uid
    if (uid) {
      await setDoc(doc(db, `users/${uid}/diet`, 'current'), { week: newWeek })
    }
  }

  function reset() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    week.value = []
  }

  async function toggleAssignedDay(date: string, dayIndex: number) {
    const day = week.value.find(d => d.date === date)
    if (!day) return
    
    if (!day.assignedDays) day.assignedDays = []
    
    const idx = day.assignedDays.indexOf(dayIndex)
    if (idx === -1) {
      day.assignedDays.push(dayIndex)
    } else {
      day.assignedDays.splice(idx, 1)
    }
    
    await setDiet([...week.value])
  }

  return {
    week,
    fetchDiet,
    setDiet,
    toggleAssignedDay,
    reset
  }
})
