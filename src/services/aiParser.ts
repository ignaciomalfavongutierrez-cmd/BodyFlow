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
