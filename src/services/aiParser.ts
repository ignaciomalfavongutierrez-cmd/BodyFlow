import { GoogleGenerativeAI } from '@google/generative-ai'
import type { DayPlan } from '../stores/diet'

export function generatePrompt(text: string): string {
  return `Eres un nutriólogo experto y analista de planes de alimentación clínica. Extrae el plan de dieta semanal del siguiente documento/texto y estructura la información en un formato JSON estricto y preciso.

Devuelve ÚNICAMENTE un JSON válido, sin explicaciones adicionales ni bloques de código markdown.

INSTRUCCIONES CRÍTICAS PARA EXTRAER DÍAS, COMIDAS Y PLATILLOS:

1. DÍAS Y SECCIONES:
   - Extrae los días tal como aparezcan: por nombre de día ("LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO") o numerados ("DIA 1", "DIA 2"...).
   - Propiedad "date": identificador normalizado en minúsculas (ej: "lunes", "martes", "dia_1").
   - Propiedad "dayName": nombre formal tal cual está impreso (ej: "Lunes", "Martes", "Día 1").

2. DISTINCIÓN FUNDAMENTAL: TAG/TIEMPO DE COMIDA ("mealType") VS NOMBRE DEL PLATILLO ("name"):
   En formatos profesionales de nutrición (como tablas semanales de nutrióloga):
   - "mealType" (TAG O TIEMPO DE COMIDA):
     Es la categoría general u horario de la fila/sección.
     Valores comunes: "Desayuno", "Colación", "Comida", "Colación Vespertina", "Cena", "Snack", "Pre-entreno", "Post-entreno".
     ⚠️ NUNCA USES ESTE TAG COMO EL VALOR DE "name" si el platillo tiene su propio título.

   - "name" (NOMBRE REAL DEL PLATILLO O RECETA):
     Es el título principal, descriptivo y en negrita del platillo específico asignado en esa celda.
     Ejemplos reales impresos en las celdas:
     • "Huevos a la Mexicana con Claras, Tortillas y Aguacate"
     • "Licuado Proteico de Fresas con Leche de Almendras"
     • "Pechuga a la Plancha con Arroz Jazmín, Aguacate y Ensalada Verde"
     • "Manzana en Rebanadas con Crema de Cacahuate Natural"
     • "Quesadillas en Comal de Queso Panela y Nopales Asados"
     (Elimina dos puntos ":" finales si aparecen al final del título).
     *Únicamente si la celda no tiene ningún nombre de receta o platillo y solo lista alimentos sueltos sin título, usa el tiempo de comida como fallback para "name".*

   - "items" (LISTA DE INGREDIENTES Y PORCIONES ESPECÍFICAS):
     Es el array con cada uno de los ingredientes o alimentos con su porción y gramaje exacto (las viñetas con viñeta "•" que vienen debajo del nombre del platillo).
     Ejemplo para los Huevos a la Mexicana:
     [
       "1 pieza (50g) Huevo entero",
       "3 piezas (99g) Clara de huevo",
       "3 piezas (90g) Tortilla de maíz",
       "1/4 pieza (30g) Aguacate Hass",
       "1/2 taza (90g) Jitomate picado",
       "1/4 pieza (13g) Cebolla blanca picada"
     ]
     ⚠️ NO repitas el título del platillo dentro del array "items". El título del platillo va en "name", y los ingredientes individuales van en "items".

3. MANEJO DE MACRONUTRIENTES Y CALORÍAS:
   - REGLA A (Si el PDF/imagen ya incluye recuadro o información explícita de macros):
     Usa los valores impresos y distribúyelos entre las comidas para que la suma diaria coincida.
   - REGLA B (Si el PDF/imagen NO incluye macros explícitos):
     Estima nutricionalmente las calorías (calories), proteína (protein), carbohidratos (carbs), grasa (fat) y azúcar (sugar) de cada platillo sumando el aporte de sus ingredientes (estándar SMAE).

4. FORMATO DEL JSON REQUERIDO:
{
  "week": [
    {
      "dayName": "Lunes",
      "date": "lunes",
      "meals": [
        {
          "id": "meal-lunes-desayuno",
          "mealType": "Desayuno",
          "name": "Huevos a la Mexicana con Claras, Tortillas y Aguacate",
          "items": [
            "1 pieza (50g) Huevo entero",
            "3 piezas (99g) Clara de huevo",
            "3 piezas (90g) Tortilla de maíz",
            "1/4 pieza (30g) Aguacate Hass",
            "1/2 taza (90g) Jitomate picado",
            "1/4 pieza (13g) Cebolla blanca picada"
          ],
          "plannedMacros": {
            "calories": 480,
            "protein": 34,
            "carbs": 48,
            "fat": 16,
            "sugar": 3
          }
        },
        {
          "id": "meal-lunes-colacion-1",
          "mealType": "Colación",
          "name": "Licuado Proteico de Fresas con Leche de Almendras",
          "items": [
            "1 scoop (30g) proteína (25g)",
            "1 taza (240g) Leche deslactosada light",
            "1 taza (150g) Fresas frescas",
            "5 g Almendras enteras naturales",
            "2 cucharadas (20g) Avena en hojuelas"
          ],
          "plannedMacros": {
            "calories": 385,
            "protein": 39,
            "carbs": 44,
            "fat": 8,
            "sugar": 12
          }
        }
      ]
    }
  ]
}

Reglas estrictas:
- NO incluyas texto antes o después del JSON.
- NO uses bloques markdown como \`\`\`json.
- SOLO devuelve el objeto JSON crudo.
- Asegura que "name" contenga el nombre del platillo y "mealType" el tiempo de comida (tag).

Contenido del plan de dieta:
${text}`
}

export function parseManualJson(jsonStr: string): DayPlan[] {
  try {
    let cleanJsonStr = jsonStr.trim()
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanJsonStr)
    
    if (!parsed || !parsed.week || !Array.isArray(parsed.week)) {
      throw new Error('Invalid JSON structure returned')
    }

    // Normalización inteligente: separar mealType (tag) del nombre real del platillo (name)
    const GENERIC_MEAL_TYPES = [
      'desayuno', 'almuerzo', 'comida', 'cena', 'colacion', 'colación',
      'colacion matutina', 'colación matutina', 'colacion vespertina', 'colación vespertina',
      'snack', 'merienda', 'pre-entreno', 'post-entreno'
    ]

    parsed.week.forEach((day: DayPlan, dayIdx: number) => {
      if (Array.isArray(day.meals)) {
        day.meals.forEach((meal: any, mealIdx: number) => {
          if (!meal.id) {
            meal.id = `meal-${day.date || dayIdx}-${mealIdx}`
          }

          let rawName = (meal.name || '').trim()
          let rawMealType = (meal.mealType || '').trim()

          // Limpiar dos puntos finales de títulos (ej: "Huevos a la Mexicana...:")
          if (rawName.endsWith(':')) {
            rawName = rawName.slice(0, -1).trim()
          }

          const nameLower = rawName.toLowerCase()
          const isGeneric = GENERIC_MEAL_TYPES.some(t => nameLower === t || nameLower.startsWith(t + ' ') || nameLower.endsWith(' ' + t))

          // Si el nombre asignado era genérico (ej: "DESAYUNO") y no tenía mealType
          if (isGeneric && !rawMealType) {
            rawMealType = rawName
          }

          // Si el nombre era genérico y el primer item del array parece ser el nombre del platillo
          if (isGeneric && Array.isArray(meal.items) && meal.items.length > 0) {
            const firstItem = meal.items[0].trim()
            const endsWithColon = firstItem.endsWith(':')
            const hasDishKeywords = firstItem.includes(' con ') || firstItem.includes(' a la ') || firstItem.includes(' en ') || firstItem.includes(' de ')
            const startsWithQty = /^(\d+|un|una|media|1\/2|1\/4|1\/3|\d+\/\d+)\s*(pieza|pz|taza|tz|g|gr|gramo|scoop|cda|cdita|cucharad)/i.test(firstItem)

            if (endsWithColon || (hasDishKeywords && !startsWithQty)) {
              rawName = firstItem.replace(/:$/, '').trim()
              meal.items.shift() // Quitar de los ingredientes para no duplicarlo
            }
          }

          // Si aún no hay mealType, deducirlo del nombre o del id
          if (!rawMealType) {
            if (nameLower.includes('desayun')) rawMealType = 'Desayuno'
            else if (nameLower.includes('comida') || nameLower.includes('almuerz')) rawMealType = 'Comida'
            else if (nameLower.includes('cena')) rawMealType = 'Cena'
            else if (nameLower.includes('colaci') || nameLower.includes('snack') || nameLower.includes('merienda')) rawMealType = 'Colación'
          }

          // Normalizar mayúsculas de mealType (ej: "DESAYUNO" -> "Desayuno", "COLACIÓN VESPERTINA" -> "Colación Vespertina")
          if (rawMealType) {
            rawMealType = rawMealType
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
          }

          meal.name = rawName || rawMealType || 'Comida'
          if (rawMealType) {
            meal.mealType = rawMealType
          }
        })
      }
    })

    return parsed.week as DayPlan[]
  } catch (error) {
    console.error('Error parsing diet plan manually:', error)
    throw new Error('Failed to parse diet plan. Make sure you pasted valid JSON.')
  }
}

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ? (import.meta.env.VITE_API_URL as string) : ''

export const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.7-flash',        // Primary (as per CONTEXT.md)
  'gemini-3.6-flash',        // First fallback (as per CONTEXT.md)
  'gemini-3.8-flash',        // High-availability Gemini 3 series
  'gemini-3.5-flash',        // High-stability Gemini 3 series
  'gemini-flash-latest',     // Google's dynamically routed latest stable flash
  'gemini-3.1-flash-lite',   // Ultra-fast lite fallback
  'gemini-flash-lite-latest' // Google's latest lite
]

function waitDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function resolveApiKey(): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY as string
  }
  const nodeProcess = (globalThis as any)?.process
  if (typeof nodeProcess !== 'undefined' && nodeProcess?.env?.VITE_GEMINI_API_KEY) {
    return nodeProcess.env.VITE_GEMINI_API_KEY
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('bodyflow_gemini_api_key') || undefined
  }
  return undefined
}

async function executeGeminiDirectCall(promptOrParts: any): Promise<string> {
  const apiKey = resolveApiKey()
  if (!apiKey) {
    throw new Error('No se encontró la clave de API de Gemini (VITE_GEMINI_API_KEY).')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  let lastErr: any = null

  for (const modelName of GEMINI_CANDIDATE_MODELS) {
    // Retry up to 2 times on transient 503 / 429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(promptOrParts)
        const text = result.response.text()
        if (text && text.trim()) {
          return text
        }
      } catch (err: any) {
        lastErr = err
        const msg = err?.message || String(err)
        const isTransient = msg.includes('503') || msg.includes('high demand') || msg.includes('429') || msg.includes('ResourceExhausted')
        console.warn(`[aiParser] Falló intento ${attempt} con modelo ${modelName}:`, msg)

        if (isTransient && attempt < 2) {
          await waitDelay(850)
          continue
        }
        break
      }
    }
  }

  const finalMsg = lastErr?.message || ''
  if (finalMsg.includes('503') || finalMsg.includes('high demand')) {
    throw new Error('El servicio de IA de Google está experimentando alta demanda temporal (Error 503). Por favor reintenta en unos momentos.')
  }
  throw new Error(finalMsg || 'Error al comunicarse con Gemini (directo).')
}

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
    console.warn('[aiParser] El backend falló o no está disponible, intentando fallback directo del cliente con cascada:', error?.message || error)
    return executeGeminiDirectCall(prompt)
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
    console.warn('[aiParser] El backend falló o no está disponible, intentando fallback directo del cliente con cascada:', error?.message || error)
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
    return executeGeminiDirectCall(parts)
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
