import type { PhysicalData } from './models'

export function calculateBMR(data: PhysicalData): number {
  if (!data.weight || !data.height || !data.age || !data.gender) {
    throw new Error('Please enter weight, height, age, and gender first.')
  }

  // Mifflin-St Jeor Equation
  let bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age)
  bmr += (data.gender === 'male' ? 5 : -161)
  
  return bmr
}

export function calculateTDEE(data: PhysicalData): number {
  const bmr = calculateBMR(data)
  return bmr * (data.activityFactor || 1.2)
}
