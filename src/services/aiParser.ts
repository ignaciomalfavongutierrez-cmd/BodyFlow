import type { DayPlan } from '../stores/diet'

export function generatePrompt(text: string): string {
  return `Extract a weekly diet plan from this text and calculate the estimated nutritional macros for each meal.

Return ONLY valid JSON.

Format:
{
  "week": [
    {
      "dayName": "DIA 1",
      "date": "lunes", // Usa solo el nombre del día de la semana (ej. "lunes", "martes") o "dia 1"
      "meals": [
        {
          "id": "unique-meal-id-123",
          "name": "DESAYUNO",
          "items": [
            "3 claras + 1 huevo entero",
            "50 g avena",
            "1 fruta"
          ],
          "plannedMacros": {
            "calories": 350,
            "protein": 24,
            "carbs": 40,
            "fat": 10,
            "sugar": 15
          }
        }
      ]
    }
  ]
}

Rules:

Do NOT include explanations.

Do NOT include markdown blocks like \`\`\`json.

ONLY return the raw JSON object.

Extract the specific food items into the "items" array for each meal as individual strings.

Ensure you extract all 5 meals per day (DESAYUNO, ALMUERZO, COMIDA, COLACIÓN, CENA).

CRITICAL: Act as an expert nutritionist. Estimate and calculate the total calories (kcal), protein (g), carbs (g), fat (g), and sugar (g) for the combined ingredients in each meal, and populate the plannedMacros object with these calculated estimates.

Generate unique meal IDs.

Para la propiedad "date", NO uses formato YYYY-MM-DD. Usa únicamente el nombre del día que le corresponde en la dieta (ej. "lunes", "martes") o "dia 1", "dia 2", etc.

Text:
${text}`
}

export function parseManualJson(jsonStr: string): DayPlan[] {
  try {
    let cleanJsonStr = jsonStr.trim()
    if (cleanJsonStr.startsWith('\`\`\`json')) {
      cleanJsonStr = cleanJsonStr.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '')
    } else if (cleanJsonStr.startsWith('\`\`\`')) {
      cleanJsonStr = cleanJsonStr.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '')
    }

    const parsed = JSON.parse(cleanJsonStr)
    
    if (!parsed || !parsed.week || !Array.isArray(parsed.week)) {
      throw new Error('Invalid JSON structure returned')
    }

    return parsed.week as DayPlan[]
  } catch (error) {
    console.error('Error parsing diet plan manually:', error)
    throw new Error('Failed to parse diet plan. Make sure you pasted valid JSON.')
  }
}
