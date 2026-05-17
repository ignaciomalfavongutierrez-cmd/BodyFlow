import type { NutritionGoals } from './models'

export function applyGoalMultiplier(tdee: number, goals: NutritionGoals): number {
  let adjustedTdee = tdee
  if (goals.goal === 'cut') adjustedTdee -= 500
  if (goals.goal === 'bulk') adjustedTdee += 500
  return adjustedTdee
}
