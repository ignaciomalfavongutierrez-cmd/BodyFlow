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
  const tempAssignments = ref<Record<string, string>>({}) // ISO date -> dayPlan.date (one-time overrides)
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
          const data = docSnap.data() as { week?: DayPlan[], tempAssignments?: Record<string, string> }
          week.value = Array.isArray(data.week) ? data.week : []
          tempAssignments.value = data.tempAssignments || {}
        }
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      }, (error) => {
        console.error(`[FIREBASE ERROR] Path: users/${uid}/diet/current`, error)
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      })
    })
  }

  async function persistToFirebase() {
    const uid = auth.currentUser?.uid
    if (uid) {
      await setDoc(doc(db, `users/${uid}/diet`, 'current'), {
        week: week.value,
        tempAssignments: tempAssignments.value
      })
    }
  }

  async function setDiet(newWeek: DayPlan[]) {
    week.value = newWeek
    await persistToFirebase()
  }

  /** Find the DayPlan assigned to a specific real date (ISO string) */
  function getDayPlanForDate(isoDate: string): DayPlan | null {
    const w = week.value || []
    // 1. Check one-time temp assignment first
    if (tempAssignments.value[isoDate]) {
      const planDate = tempAssignments.value[isoDate]
      return w.find(dp => dp.date === planDate) || null
    }
    // 2. Check permanent assignment via weekday index
    const d = new Date(isoDate + 'T12:00:00')
    const dayIndex = d.getDay() // 0=Sun, 1=Mon, ...
    return w.find(dp => dp.assignedDays?.includes(dayIndex)) || null
  }

  /** Toggle a weekday assignment with mutex — a weekday can only belong to ONE plan */
  async function toggleAssignedDay(planDate: string, dayIndex: number) {
    const targetPlan = week.value.find(d => d.date === planDate)
    if (!targetPlan) return
    if (!targetPlan.assignedDays) targetPlan.assignedDays = []

    const existingIdx = targetPlan.assignedDays.indexOf(dayIndex)

    if (existingIdx === -1) {
      // Mutex: remove this dayIndex from all other plans
      for (const dp of week.value) {
        if (dp.date !== planDate && dp.assignedDays) {
          const idx = dp.assignedDays.indexOf(dayIndex)
          if (idx !== -1) dp.assignedDays.splice(idx, 1)
        }
      }
      targetPlan.assignedDays.push(dayIndex)
    } else {
      targetPlan.assignedDays.splice(existingIdx, 1)
    }

    await setDiet([...week.value])
  }

  /** Assign a plan to a specific date (one-time, not recurring) */
  async function setTempAssignment(isoDate: string, planDate: string) {
    tempAssignments.value[isoDate] = planDate
    await persistToFirebase()
  }

  /** Assign a plan to a weekday permanently (recurring every week) with mutex */
  async function assignDayRecurring(planDate: string, dayIndex: number) {
    // Remove this dayIndex from all plans (mutex)
    for (const dp of week.value) {
      if (dp.assignedDays) {
        const idx = dp.assignedDays.indexOf(dayIndex)
        if (idx !== -1) dp.assignedDays.splice(idx, 1)
      }
    }
    // Add to target
    const targetPlan = week.value.find(d => d.date === planDate)
    if (!targetPlan) return
    if (!targetPlan.assignedDays) targetPlan.assignedDays = []
    targetPlan.assignedDays.push(dayIndex)

    await setDiet([...week.value])
  }

  function reset() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    week.value = []
    tempAssignments.value = {}
  }

  return {
    week,
    tempAssignments,
    fetchDiet,
    setDiet,
    getDayPlanForDate,
    toggleAssignedDay,
    setTempAssignment,
    assignDayRecurring,
    reset,
  }
})
