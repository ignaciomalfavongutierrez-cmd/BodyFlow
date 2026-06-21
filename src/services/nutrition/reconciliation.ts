import type { MacroTargets } from './models'

interface MealWithMacros {
  plannedMacros?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sugar?: number
  }
}

interface DayWithMeals {
  meals: MealWithMacros[]
}

/**
 * Calculates the daily average MacroTargets from a weekly meal plan.
 * Iterates all days, sums each day's meal macros, then averages across days.
 * Used to derive the nutritionist's intended daily targets from the imported plan.
 */
export function summarizePlanMacros(week: DayWithMeals[]): MacroTargets {
  if (!week || week.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let totalSugar = 0
  let daysWithMeals = 0

  for (const day of week) {
    if (!day.meals || day.meals.length === 0) continue

    let dayCalories = 0
    let dayProtein = 0
    let dayCarbs = 0
    let dayFat = 0
    let daySugar = 0

    for (const meal of day.meals) {
      const m = meal.plannedMacros
      if (!m) continue
      dayCalories += m.calories || 0
      dayProtein += m.protein || 0
      dayCarbs += m.carbs || 0
      dayFat += m.fat || 0
      daySugar += m.sugar || 0
    }

    totalCalories += dayCalories
    totalProtein += dayProtein
    totalCarbs += dayCarbs
    totalFat += dayFat
    totalSugar += daySugar
    daysWithMeals++
  }

  if (daysWithMeals === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  }

  return {
    calories: Math.round(totalCalories / daysWithMeals),
    protein: Math.round(totalProtein / daysWithMeals),
    carbs: Math.round(totalCarbs / daysWithMeals),
    fat: Math.round(totalFat / daysWithMeals),
    sugar: Math.round(totalSugar / daysWithMeals)
  }
}
