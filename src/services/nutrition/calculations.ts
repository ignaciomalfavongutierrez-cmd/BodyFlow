import type { PhysicalData, NutritionGoals, MacroTargets } from './models'
import { calculateTDEE } from './tdee'
import { applyGoalMultiplier } from './goals'
import { calculateMacros } from './macroTargets'

export function generateNutritionPlan(data: PhysicalData & NutritionGoals): MacroTargets {
  const tdee = calculateTDEE(data)
  const adjustedTdee = applyGoalMultiplier(tdee, data)
  
  return calculateMacros(adjustedTdee, data.weight!)
}
