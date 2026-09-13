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

export type UserRole = 'nutritionist' | 'patient';

export interface UserProfile extends PhysicalData, NutritionGoals {
  name?: string
  email?: string
  /** Account authorization role: 'nutritionist' grants clinician tools; 'patient' or undefined defaults to consumer */
  role?: UserRole
  macroTargets: MacroTargets
  /** Backup of app-calculated (Mifflin-St Jeor) targets before meal plan override */
  tdeeTargets?: MacroTargets
  /** Daily average macros derived from the imported nutritionist plan */
  mealPlanTargets?: MacroTargets
  /** When true, macroTargets reflects the imported plan instead of TDEE calculations */
  useMealPlanOverride?: boolean
  /** Daily water intake target in milliliters (default: 2000 ml) */
  waterTarget?: number
  /** ID of the clinical patient record in 'pacientes' collection if linked with nutritionist */
  linkedPatientId?: string
  /** Active diet source: 'nutritionist' (Talia Tinoco plan) or 'custom_upload' (PDF/custom upload) */
  activeDietSource?: 'nutritionist' | 'custom_upload'
  /** Metadata of the active clinical diet plan */
  nutritionistPlanMeta?: {
    id: string
    nombre: string
    calorias: number
    macros: { protein: number; carbs: number; fat: number }
    objetivo?: string
    updatedAt?: string
  }
  /** Backup of the custom uploaded week from PDF/manual so user can toggle back anytime */
  customUploadedWeek?: any[]
  customUploadedTargets?: MacroTargets
}
