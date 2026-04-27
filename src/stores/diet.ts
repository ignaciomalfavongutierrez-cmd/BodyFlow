import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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
  date: string // e.g. "dia 1", "lunes", or ISO date
  assignedDays?: number[] // 0=Sun, 1=Mon, ..., 6=Sat
  meals: MealPlan[]
}

const STORAGE_KEY = 'bodyflow_diet_week'

export const useDietStore = defineStore('diet', () => {
  // Hydrate from localStorage on first load
  const stored = localStorage.getItem(STORAGE_KEY)
  const week = ref<DayPlan[]>(stored ? JSON.parse(stored) : [])

  // Persist every change automatically
  watch(
    week,
    (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)),
    { deep: true }
  )

  function setDiet(newWeek: DayPlan[]) {
    week.value = newWeek
  }

  /** Toggle a single weekday assignment for a day plan (0=Sun … 6=Sat) */
  function toggleAssignedDay(dayDate: string, dayIndex: number) {
    const dayPlan = week.value.find(d => d.date === dayDate)
    if (!dayPlan) return
    if (!dayPlan.assignedDays) dayPlan.assignedDays = []
    const pos = dayPlan.assignedDays.indexOf(dayIndex)
    if (pos > -1) {
      dayPlan.assignedDays.splice(pos, 1)
    } else {
      dayPlan.assignedDays.push(dayIndex)
    }
  }

  return {
    week,
    setDiet,
    toggleAssignedDay
  }
})
