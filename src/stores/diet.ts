import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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

  async function fetchDiet() {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const docRef = doc(db, `users/${uid}/diet`, 'current')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      week.value = (docSnap.data() as { week: DayPlan[] }).week
    }
  }

  async function setDiet(newWeek: DayPlan[]) {
    week.value = newWeek
    const uid = auth.currentUser?.uid
    if (uid) {
      await setDoc(doc(db, `users/${uid}/diet`, 'current'), { week: newWeek })
    }
  }

  function reset() {
    week.value = []
  }

  return {
    week,
    fetchDiet,
    setDiet,
    reset
  }
})
