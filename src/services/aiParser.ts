import { GoogleGenerativeAI } from '@google/generative-ai'
import type { DayPlan } from '../stores/diet'

export function generatePrompt(text: string): string {
  return `Eres un nutriólogo experto y analista de planes de alimentación. Extrae el plan de dieta semanal del siguiente documento/texto y estructura la información en un formato JSON preciso.

Devuelve ÚNICAMENTE un JSON válido, sin explicaciones adicionales ni bloques de código markdown.

INSTRUCCIONES CRÍTICAS PARA EXTRAER DÍAS, COMIDAS Y ALIMENTOS:

1. DÍAS Y SECCIONES:
   - Extrae los días tal como aparezcan: numerados ("DIA 1", "DIA 2"...), por nombre de día ("LUNES", "MARTES"...), o combinados.
   - Propiedad "date": identificador normalizado (ej: "dia_1", "lunes").
   - Propiedad "dayName": nombre exacto tal cual está impreso (ej: "DIA 1", "LUNES").

2. COMIDAS Y ALIMENTOS ESPECÍFICOS:
   - Extrae TODAS las comidas presentadas para cada día (ej: DESAYUNO, ALMUERZO / MEDIA MAÑANA, COMIDA, COLACIÓN, CENA).
   - En el array "items", incluye los alimentos con sus CANTIDADES EXACTAS y ESPECÍFICAS impresas en el documento (ej: ["150 g de pechuga de pollo", "180 g de arroz cocido", "Ensalada grande", "1 cucharada de aceite de oliva"]).

3. MANEJO DE MACRONUTRIENTES Y CALORÍAS (REGLA FUNDAMENTAL):
   - REGLA A (Si el PDF/imagen ya incluye recuadro o información explícita de macros):
     Si el plan contiene un recuadro o tabla con los totales diarios (ej: "1,900 kcal", "155 g de proteína", "180 g de carbohidratos", "55 g de grasa") o especifica macros explícitos por comida, USA ESOS VALORES IMPRESOS. Distribuye o asigna esos valores entre las comidas del día de modo que la suma de plannedMacros de las comidas coincida exactamente con los totales dados en el recuadro de la dieta.
   - REGLA B (Si el PDF/imagen NO incluye macros explícitos):
     Si la dieta solo enumera los alimentos y porciones sin indicar los gramos de macros ni calorías totales, actúa como nutriólogo experto y ESTIMA/CALCULA nutricionalmente las calorías (calories), proteína (protein), carbohidratos (carbs), grasa (fat) y azúcar (sugar) de cada comida sumando sus ingredientes.

4. FORMATO DEL JSON:
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
            "150 g de pechuga de pollo",
            "180 g de arroz cocido",
            "Ensalada grande",
            "1 cucharada de aceite de oliva"
          ],
          "plannedMacros": {
            "calories": 450,
            "protein": 42,
            "carbs": 45,
            "fat": 12,
            "sugar": 2
          }
        }
      ]
    }
  ]
}

Reglas estrictas:
- NO incluyas explicaciones ni texto fuera del JSON.
- NO uses bloques markdown como \`\`\`json.
- SOLO devuelve el objeto JSON crudo.
- Genera IDs únicos para cada comida (ej: "meal-dia1-desayuno", "meal-dia1-comida").

Contenido del plan de dieta:
${text}`
}

export function parseManualJson(jsonStr: string): DayPlan[] {
  try {
    let cleanJsonStr = jsonStr.trim()
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\n/, '').replace(/\n```$/, '')
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```\n/, '').replace(/\n```$/, '')
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
  try {
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
  } catch (error: any) {
    console.warn('[aiParser] El backend falló o no está disponible, intentando fallback directo del cliente:', error)
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || localStorage.getItem('bodyflow_gemini_api_key') || undefined
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
        const result = await model.generateContent(prompt)
        return result.response.text()
      } catch (err: any) {
        throw new Error(err?.message || 'Error al comunicarse con Gemini (directo).')
      }
    }
    throw error
  }
}

export async function sendContentsToGemini(contents: any): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
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
  } catch (error: any) {
    console.warn('[aiParser] El backend falló o no está disponible, intentando fallback directo del cliente para contenidos:', error)
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || localStorage.getItem('bodyflow_gemini_api_key') || undefined
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      const parts = contents.map((c: any) => {
        if (c.inlineData) {
          return {
            inlineData: {
              data: c.inlineData.data,
              mimeType: c.inlineData.mimeType
            }
          }
        }
        if (c.text) {
          return c.text
        }
        return c
      })
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })
        const result = await model.generateContent(parts)
        return result.response.text()
      } catch (err: any) {
        throw new Error(err?.message || 'Error al comunicarse con Gemini (directo).')
      }
    }
    throw error
  }
}

export async function parsePdfWithGemini(pdfText: string): Promise<DayPlan[]> {
  const prompt = generatePrompt(pdfText)
  const rawResponse = await sendPromptToGemini(prompt)
  return parseManualJson(rawResponse)
}

export async function parsePdfDirectWithGemini(base64Data: string, mimeType: string = 'application/pdf'): Promise<DayPlan[]> {
  const promptText = generatePrompt('Procesa el archivo PDF o imagen adjunta de la dieta. Analiza cuidadosamente la tabla, comidas, cantidades y cualquier recuadro de macros totales impreso para extraer la estructura semanal exacta.')
  const contents = [
    {
      inlineData: {
        mimeType: mimeType || 'application/pdf',
        data: base64Data
      }
    },
    {
      text: promptText
    }
  ]
  const rawResponse = await sendContentsToGemini(contents)
  return parseManualJson(rawResponse)
}

export async function parseDirectImagesWithGemini(images: { mimeType: string; data: string }[]): Promise<DayPlan[]> {
  const promptText = generatePrompt('Procesa las imágenes de la dieta adjuntas. Analiza cuidadosamente la tabla, comidas, cantidades de alimentos y cualquier recuadro de macros totales impreso para extraer la estructura semanal exacta en JSON.')
  const contents = [
    ...images.map(img => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data
      }
    })),
    {
      text: promptText
    }
  ]
  const rawResponse = await sendContentsToGemini(contents)
  return parseManualJson(rawResponse)
}

export interface SubstitutionFood {
  name: string
  quantity: string
  macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
}

export interface SubstitutionOption {
  id: string
  title: string
  explanation: string
  replacementFoods: SubstitutionFood[]
  totalMacros: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugar: number
  }
  macroDifference?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  alertMessage?: string
}

export interface MultiOptionSubstitutionResult {
  options: SubstitutionOption[]
}

export type SubstitutionResult = SubstitutionOption

export async function getSingleItemSubstitution(
  originalItem: string,
  mealName: string,
  userPreference?: string,
  plannedMacros?: any
): Promise<SubstitutionResult> {
  const res = await getSingleItemSubstitutionOptions(originalItem, mealName, userPreference, plannedMacros)
  return res.options[0]
}

export async function getWholeMealAdjustment(
  mealName: string,
  plannedItems: string[],
  plannedMacros: any,
  userMessage?: string
): Promise<SubstitutionResult> {
  const res = await getWholeMealAdjustmentOptions(mealName, plannedItems, plannedMacros, userMessage)
  return res.options[0]
}

export async function getSingleItemSubstitutionOptions(
  originalItem: string,
  mealName: string,
  userPreference?: string,
  plannedMacros?: any
): Promise<MultiOptionSubstitutionResult> {
  const prompt = `Eres un nutriólogo experto. El usuario desea sustituir el ingrediente de la comida "${mealName}":
Ingrediente original (alimento y porción): "${originalItem}".
${plannedMacros ? `Macros objetivo de la comida: ${plannedMacros.calories} kcal, ${plannedMacros.protein}g proteína, ${plannedMacros.carbs}g carbohidratos, ${plannedMacros.fat}g grasa.` : ''}
${userPreference && userPreference.trim() ? `Preferencia/Instrucción del usuario: "${userPreference.trim()}".` : 'Genera 3 opciones de alimentos saludables equivalentes nutricionales.'}

Calcula EXACTAMENTE 3 OPCIONES DISTINTAS DE SUSTITUCIÓN EQUIVALENTE.
Para cada opción, calcula la porción exacta requerida para igualar el valor nutricional del ingrediente original.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin formato markdown ni texto adicional):
{
  "options": [
    {
      "id": "opt_1",
      "title": "Opción 1: [Nombre de alimento/porción]",
      "explanation": "Breve explicación nutricional de por qué es equivalente.",
      "replacementFoods": [
        {
          "name": "Nombre del alimento sustituto",
          "quantity": "Porción exacta calculada (ej. 120 g o 2 piezas)",
          "macros": { "calories": 150, "protein": 28, "carbs": 0, "fat": 3, "sugar": 0 }
        }
      ],
      "totalMacros": { "calories": 150, "protein": 28, "carbs": 0, "fat": 3, "sugar": 0 },
      "macroDifference": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "alertMessage": null
    },
    {
      "id": "opt_2",
      "title": "Opción 2: [Nombre de alimento/porción]",
      "explanation": "Breve explicación nutricional.",
      "replacementFoods": [ ... ],
      "totalMacros": { ... }
    },
    {
      "id": "opt_3",
      "title": "Opción 3: [Nombre de alimento/porción]",
      "explanation": "Breve explicación nutricional.",
      "replacementFoods": [ ... ],
      "totalMacros": { ... }
    }
  ]
}`

  const rawJson = await sendPromptToGemini(prompt)
  return parseMultiOptionResponse(rawJson)
}

export async function getWholeMealAdjustmentOptions(
  mealName: string,
  plannedItems: string[],
  plannedMacros: any,
  userMessage?: string
): Promise<MultiOptionSubstitutionResult> {
  const prompt = `Eres un nutriólogo experto. El usuario no puede realizar su comida planificada "${mealName}" y requiere sustituir la comida completa.
Ingredientes planificados originales: ${plannedItems.join(', ')}.
Macros objetivo de la comida: ${plannedMacros.calories} kcal, ${plannedMacros.protein}g proteína, ${plannedMacros.carbs}g carbohidratos, ${plannedMacros.fat}g grasa.

${userMessage && userMessage.trim() 
  ? `El usuario indica sus alimentos o situación: "${userMessage.trim()}". Diseña las opciones adaptándote a los alimentos disponibles que menciona.` 
  : `Proporciona 3 opciones de menús completos distintos, sabrosos y balanceados que cumplan de forma óptima con los macros objetivo de la comida.`
}

Genera EXACTAMENTE 3 OPCIONES DISTINTAS DE MENÚ COMPLETO. Cada opción debe ser una comida completa con la lista de alimentos y sus porciones exactas calculadas.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin formato markdown ni texto adicional):
{
  "options": [
    {
      "id": "opt_1",
      "title": "Opción 1: [Nombre atractivo del platillo/menú]",
      "explanation": "Explicación concisa del menú y su balance nutricional.",
      "replacementFoods": [
        {
          "name": "Alimento 1",
          "quantity": "Porción calculada (ej. 150 g)",
          "macros": { "calories": 200, "protein": 30, "carbs": 0, "fat": 4, "sugar": 0 }
        },
        {
          "name": "Alimento 2",
          "quantity": "Porción calculada (ej. 1 taza)",
          "macros": { "calories": 150, "protein": 3, "carbs": 30, "fat": 1, "sugar": 0 }
        }
      ],
      "totalMacros": { "calories": 350, "protein": 33, "carbs": 30, "fat": 5, "sugar": 0 },
      "macroDifference": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "alertMessage": null
    },
    {
      "id": "opt_2",
      "title": "Opción 2: [Nombre del platillo]",
      "explanation": "...",
      "replacementFoods": [ ... ],
      "totalMacros": { ... }
    },
    {
      "id": "opt_3",
      "title": "Opción 3: [Nombre del platillo]",
      "explanation": "...",
      "replacementFoods": [ ... ],
      "totalMacros": { ... }
    }
  ]
}`

  const rawJson = await sendPromptToGemini(prompt)
  return parseMultiOptionResponse(rawJson)
}

function parseMultiOptionResponse(rawJson: string): MultiOptionSubstitutionResult {
  let cleanStr = rawJson.trim()
  if (cleanStr.startsWith('```json')) {
    cleanStr = cleanStr.replace(/^```json\n/, '').replace(/\n```$/, '')
  } else if (cleanStr.startsWith('```')) {
    cleanStr = cleanStr.replace(/^```\n/, '').replace(/\n```$/, '')
  }

  try {
    const parsed = JSON.parse(cleanStr)
    const rawOptions = Array.isArray(parsed.options) ? parsed.options : (parsed.replacementFoods ? [parsed] : [])
    
    const options: SubstitutionOption[] = rawOptions.map((opt: any, idx: number) => ({
      id: opt.id || `opt_${idx + 1}`,
      title: opt.title || `Opción ${idx + 1}`,
      explanation: opt.explanation || 'Opción equilibrada de reemplazo.',
      replacementFoods: (opt.replacementFoods || []).map((f: any) => ({
        name: f.name || 'Alimento',
        quantity: f.quantity || '1 porción',
        macros: {
          calories: Number(f.macros?.calories || 0),
          protein: Number(f.macros?.protein || 0),
          carbs: Number(f.macros?.carbs || 0),
          fat: Number(f.macros?.fat || 0),
          sugar: Number(f.macros?.sugar || 0),
        }
      })),
      totalMacros: opt.totalMacros || { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
      macroDifference: opt.macroDifference || undefined,
      alertMessage: opt.alertMessage || undefined
    }))

    if (options.length === 0) {
      throw new Error('Formato de opciones inválido.')
    }

    return { options }
  } catch (err) {
    console.error('Error al parsear respuesta de opciones de Gemini:', err, rawJson)
    throw new Error('No se pudieron procesar las opciones de la IA. Por favor intenta de nuevo.')
  }
}
