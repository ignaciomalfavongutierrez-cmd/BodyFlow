import type { DayPlan } from '../stores/diet'

export function generatePrompt(text: string): string {
  return `Eres un nutriólogo experto. Extrae el plan de dieta semanal del siguiente texto y calcula los macronutrientes estimados para cada comida.

Devuelve ÚNICAMENTE un JSON válido, sin explicaciones ni bloques de código markdown.

INSTRUCCIONES CRÍTICAS PARA EXTRAER LOS DÍAS:

1. Los días en el PDF pueden venir en CUALQUIERA de estos formatos:
   - Numerados: "DIA 1", "DIA 2", "DIA 3", etc.
   - Por nombre de día: "LUNES", "MARTES", "MIÉRCOLES", etc.
   - Mixto: "DIA 1 (LUNES)", etc.

2. Para cada día, extrae TODAS las comidas que aparecen debajo de esa columna/sección.

3. Los nombres de comidas comunes son: DESAYUNO, ALMUERZO/MEDIA MAÑANA, COMIDA, COLACIÓN/SNACK, CENA. Pero pueden variar; extrae lo que encuentres.

4. Para la propiedad "date", genera un identificador normalizado:
   - Si el PDF dice "DIA 1", "DIA 2"... → usa "dia_1", "dia_2", etc.
   - Si el PDF dice "LUNES", "MARTES"... → usa "lunes", "martes", etc.
   
5. Para "dayName", usa el nombre EXACTO como aparece en el PDF (ej: "DIA 1", "LUNES").

Formato del JSON:
{
  "week": [
    {
      "dayName": "DIA 1",
      "date": "dia_1",
      "meals": [
        {
          "id": "meal-dia1-desayuno",
          "name": "DESAYUNO",
          "items": [
            "Avena 40g",
            "Fruta 1 pieza",
            "Leche proteina 250ml"
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

Reglas:
- NO incluyas explicaciones ni texto adicional.
- NO uses bloques markdown como \\\`\\\`\\\`json.
- SOLO devuelve el objeto JSON crudo.
- Extrae los items de comida específicos como strings individuales en el array "items".
- Extrae TODAS las comidas de cada día (pueden ser 3, 4, 5 o más por día).
- CRÍTICO: Actúa como nutriólogo experto. Estima y calcula las calorías totales (kcal), proteína (g), carbohidratos (g), grasa (g), y azúcar (g) para los ingredientes combinados de cada comida.
- Genera IDs únicos para cada comida (formato: "meal-dia1-desayuno", "meal-dia2-comida", etc.).

Texto extraído del PDF:
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

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export async function sendPromptToGemini(prompt: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    let errorMsg = `Error HTTP ${res.status}`
    try {
      const data = await res.json()
      if (data.error) errorMsg = data.error
    } catch { /* ignore */ }
    throw new Error(errorMsg)
  }

  const data = await res.json()
  return data.text || ''
}

export async function parsePdfWithGemini(pdfText: string): Promise<DayPlan[]> {
  const prompt = generatePrompt(pdfText)
  const rawResponse = await sendPromptToGemini(prompt)
  return parseManualJson(rawResponse)
}

export interface SubstitutionResult {
  replacementFoods: Array<{
    name: string
    quantity: string
    macros: {
      calories: number
      protein: number
      carbs: number
      fat: number
      sugar: number
    }
  }>
  totalMacros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  macroDifference: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  alertMessage?: string
  explanation: string
}

export async function getSingleItemSubstitution(
  originalItem: string,
  replacementItem: string,
  mealName: string,
  plannedMacros?: any
): Promise<SubstitutionResult> {
  const prompt = `Eres un nutriólogo experto. El usuario desea sustituir el siguiente ingrediente de su comida "${mealName}":
Ingrediente original: "${originalItem}"
Alimento sustituto disponible: "${replacementItem}"
${plannedMacros ? `Macros objetivo de la comida: ${plannedMacros.calories} kcal, ${plannedMacros.protein}g proteína, ${plannedMacros.carbs}g carbs, ${plannedMacros.fat}g grasa.` : ''}

Calcula la porción exacta de "${replacementItem}" necesaria para sustituir nutricionalmente el ingrediente original de forma adecuada.
Si la sustitución genera un déficit o exceso importante en algún macronutriente, indícalo claramente en alertMessage y macroDifference.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin formato markdown ni explicaciones fuera del JSON):
{
  "replacementFoods": [
    {
      "name": "${replacementItem}",
      "quantity": "Porción calculada (ej. 150g o 2 piezas)",
      "macros": { "calories": 200, "protein": 25, "carbs": 0, "fat": 3, "sugar": 0 }
    }
  ],
  "totalMacros": { "calories": 200, "protein": 25, "carbs": 0, "fat": 3, "sugar": 0 },
  "macroDifference": { "calories": 0, "protein": -2, "carbs": 0, "fat": 1 },
  "alertMessage": "Nota si faltó o sobró algo relevante, o null si todo cuadra bien",
  "explanation": "Explicación concisa (1-2 oraciones) de por qué se eligió esa porción."
}`

  const rawJson = await sendPromptToGemini(prompt)
  return parseSubstitutionResponse(rawJson)
}

export async function getWholeMealAdjustment(
  mealName: string,
  plannedItems: string[],
  plannedMacros: any,
  availableFoods: string
): Promise<SubstitutionResult> {
  const prompt = `Eres un nutriólogo experto. El usuario tiene planeada la comida "${mealName}" con estos ingredientes originales: ${plannedItems.join(', ')}.
Sus macros objetivo para esta comida son: ${plannedMacros.calories} kcal, ${plannedMacros.protein}g proteína, ${plannedMacros.carbs}g carbohidratos, ${plannedMacros.fat}g grasa.

El usuario indica: "Solo cuento con estos alimentos: '${availableFoods}'".

Por favor ajusta y calcula las porciones exactas utilizando ÚNICAMENTE los alimentos disponibles proporcionados para aproximarse lo más posible a las metas nutricionales de la comida.
Si los alimentos disponibles no son suficientes para alcanzar algún macronutriente (por ejemplo falta proteína) o si se exceden, indícalo en macroDifference y genera un mensaje claro de advertencia/alerta en "alertMessage".

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura (sin formato markdown ni texto adicional):
{
  "replacementFoods": [
    {
      "name": "Nombre de alimento disponible",
      "quantity": "Porción calculada (ej. 180g o 2 latas)",
      "macros": { "calories": 180, "protein": 24, "carbs": 0, "fat": 2, "sugar": 0 }
    }
  ],
  "totalMacros": { "calories": 320, "protein": 30, "carbs": 15, "fat": 5, "sugar": 0 },
  "macroDifference": { "calories": -40, "protein": -8, "carbs": 0, "fat": -2 },
  "alertMessage": "⚠️ Alerta: Faltaron 8g de proteína y 40 kcal para alcanzar la meta con los alimentos proporcionados.",
  "explanation": "Ajustamos las porciones de los ingredientes disponibles para acercarnos lo máximo posible a tus objetivos."
}`

  const rawJson = await sendPromptToGemini(prompt)
  return parseSubstitutionResponse(rawJson)
}

function parseSubstitutionResponse(rawJson: string): SubstitutionResult {
  let cleanStr = rawJson.trim()
  if (cleanStr.startsWith('```json')) {
    cleanStr = cleanStr.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (cleanStr.startsWith('```')) {
    cleanStr = cleanStr.replace(/^```\n/, '').replace(/\n```$/, '')
  }

  try {
    const parsed = JSON.parse(cleanStr)
    return {
      replacementFoods: parsed.replacementFoods || [],
      totalMacros: parsed.totalMacros || { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
      macroDifference: parsed.macroDifference || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      alertMessage: parsed.alertMessage || undefined,
      explanation: parsed.explanation || 'Porciones calculadas según disponibilidad.'
    }
  } catch (err) {
    console.error('Error al parsear respuesta de sustitución de Gemini:', err)
    throw new Error('No se pudo procesar la respuesta de la IA. Por favor intenta de nuevo.')
  }
}
