export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export interface PhysicalData {
  weight: number | null
  height: number | null
  age: number | null
  gender: 'male' | 'female' | null
  activityFactor: number
}

export interface NutritionGoals {
  goal: string // 'cut' | 'maintain' | 'bulk'
}

export interface UserProfile extends PhysicalData, NutritionGoals {
  name?: string
  email?: string
  macroTargets: MacroTargets
  /** Backup of app-calculated (Mifflin-St Jeor) targets before meal plan override */
  tdeeTargets?: MacroTargets
  /** Daily average macros derived from the imported nutritionist plan */
  mealPlanTargets?: MacroTargets
  /** When true, macroTargets reflects the imported plan instead of TDEE calculations */
  useMealPlanOverride?: boolean
}
