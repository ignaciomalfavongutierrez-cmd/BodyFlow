import type { MacroTargets } from './models'

export function calculateMacros(adjustedTdee: number, weight: number): MacroTargets {
  const calories = Math.round(adjustedTdee)
  const protein = Math.round(weight * 2.2) // ~2.2g per kg of bodyweight
  const fat = Math.round((adjustedTdee * 0.25) / 9) // 25% from fat
  const carbs = Math.round((adjustedTdee - (protein * 4) - (fat * 9)) / 4)
  const sugar = Math.round((adjustedTdee * 0.10) / 4) // WHO recommendation: < 10% of total daily energy intake (4 kcal/g)

  return { calories, protein, carbs, fat, sugar }
}
