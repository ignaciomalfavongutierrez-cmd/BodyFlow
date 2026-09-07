import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DishItem, DishIngredient, MealTimeKey } from '../../types/dietMenu';
import { IngredientSearchService } from './IngredientSearchService';

export interface PatientSuggestionContext {
  id: string;
  nombre: string;
  edad?: number | string;
  sexo?: string;
  peso?: number | string;
  estatura?: number | string;
  objetivoPrincipal?: string;
  alertasMedicas?: string[];
}

export interface ClinicalHistoryContext {
  alergiasIntolerancias?: string[];
  preferenciasAlimentarias?: {
    gustosFavoritos?: string[];
    aversionesDisgustos?: string[];
    restriccionesEspeciales?: string;
  };
  antecedentesPatologicos?: string[];
  sintomasDigestivos?: string[];
  observacionesGenerales?: string;
}

export interface MealSuggestionInput {
  patient: PatientSuggestionContext;
  clinicalHistory?: ClinicalHistoryContext;
  dayName: string;
  targetMealTime: {
    key: MealTimeKey;
    label: string;
    icon?: string;
  };
  remainingMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dailyPlanMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  optionsCount: number; // 1 to 4
  culinaryStyle?: string; // 'mexicana_casera' | 'rapida' | 'economica' | 'alta_proteina' | 'vegetariana'
  customNotes?: string;
}

export interface SuggestedDishOption extends DishItem {
  justificacionClinica: string;
  tiempoPreparacionMin?: number;
  diferenciaMacros?: {
    caloriasDiff: number;
    proteinaDiff: number;
  };
}

export class GeminiMealSuggestionService {
  private static readonly CANDIDATE_MODELS = [
    'gemini-3.7-flash',        // Primary (as per CONTEXT.md)
    'gemini-3.6-flash',        // First fallback (as per CONTEXT.md)
    'gemini-3.8-flash',        // High-availability Gemini 3 series
    'gemini-3.5-flash',        // High-stability Gemini 3 series
    'gemini-flash-latest',     // Google's dynamically routed latest stable flash
    'gemini-3.1-flash-lite',   // Ultra-fast lite fallback
    'gemini-flash-lite-latest' // Google's latest lite
  ];

  /**
   * Construye el prompt clínico estructurado y legible para Gemini.
   * Este mismo texto es el que se le muestra a la nutrióloga en el modal de auditoría.
   */
  static buildPrompt(input: MealSuggestionInput): string {
    const {
      patient,
      clinicalHistory,
      dayName,
      targetMealTime,
      remainingMacros,
      dailyPlanMacros,
      optionsCount,
      culinaryStyle,
      customNotes
    } = input;

    // Sanitize macro targets: ensure minimum feasible values for a single meal
    const targetKcal = Math.max(120, Math.round(remainingMacros.calories > 0 ? remainingMacros.calories : dailyPlanMacros.calories * 0.25));
    const targetProtein = Math.max(10, Math.round(remainingMacros.protein > 0 ? remainingMacros.protein : dailyPlanMacros.protein * 0.25));
    const targetCarbs = Math.max(10, Math.round(remainingMacros.carbs > 0 ? remainingMacros.carbs : dailyPlanMacros.carbs * 0.25));
    const targetFat = Math.max(5, Math.round(remainingMacros.fat > 0 ? remainingMacros.fat : dailyPlanMacros.fat * 0.25));

    // Estilo culinario
    const stylesDict: Record<string, string> = {
      mexicana_casera: 'Comida mexicana casera tradicional (usando ingredientes SMAE comunes: pollo, huevo, frijoles de la olla, tortillas de maíz, aguacate, jitomate, nopales, queso panela)',
      rapida: 'Preparación exprés y práctica (lista en menos de 15 minutos, pocos pasos y fácil ensamble)',
      economica: 'Ingredientes de bajo costo, alta disponibilidad en mercados de México y muy rendidores',
      alta_proteina: 'Enfoque hiperproteico para saciedad o ganancia muscular (proteína magra prioritaria)',
      vegetariana: 'Opción vegetariana / plant-based nutritiva y completa'
    };
    const styleDescription = stylesDict[culinaryStyle || 'mexicana_casera'] || stylesDict.mexicana_casera;

    // Alergias y restricciones
    const allergies = [
      ...(patient.alertasMedicas || []),
      ...(clinicalHistory?.alergiasIntolerancias || [])
    ].filter((v, i, a) => a.indexOf(v) === i && v.trim() !== '');

    const dislikes = clinicalHistory?.preferenciasAlimentarias?.aversionesDisgustos || [];
    const favorites = clinicalHistory?.preferenciasAlimentarias?.gustosFavoritos || [];
    const pathologies = clinicalHistory?.antecedentesPatologicos || [];
    const digestiveSymptoms = clinicalHistory?.sintomasDigestivos || [];
    const specialDiet = clinicalHistory?.preferenciasAlimentarias?.restriccionesEspeciales || '';

    return `Eres un Asistente Clínico de Nutrición de BodyFlow, experto en nutrición mexicana y en el Sistema Mexicano de Alimentos Equivalentes (SMAE).
Tu objetivo es sugerir exactamente ${optionsCount} opciones diferentes de platillos para un paciente real, respetando estrictamente sus restricciones clínicas y ajustándose con alta precisión a los macronutrientes solicitados.

---
### 1. PERFIL DEL PACIENTE
- Nombre: ${patient.nombre || 'Paciente'}
- Sexo: ${patient.sexo || 'No especificado'} | Edad: ${patient.edad || 'No especificada'} años
- Peso: ${patient.peso || 'N/D'} kg | Estatura: ${patient.estatura || 'N/D'} cm
- Objetivo Principal: ${patient.objetivoPrincipal || 'Plan de alimentación saludable'}

### 2. RESTRICCIONES CLÍNICAS Y GUSTOS (¡MÁXIMA PRIORIDAD!)
- ⚠️ ALERGIAS E INTOLERANCIAS: ${allergies.length > 0 ? allergies.join(', ') : 'Ninguna reportada'}
  *(CRÍTICO: JAMÁS incluyas ingredientes asociados a estas alergias)*
- ❌ ALIMENTOS QUE DESAGRADAN / EVITAR: ${dislikes.length > 0 ? dislikes.join(', ') : 'Ninguno reportado'}
- ⭐ ALIMENTOS FAVORITOS: ${favorites.length > 0 ? favorites.join(', ') : 'No especificados'}
- 🩺 PATOLOGÍAS Y ANTECEDENTES: ${pathologies.length > 0 ? pathologies.join(', ') : 'Ninguna relevante'}
- 🩺 SÍNTOMAS DIGESTIVOS: ${digestiveSymptoms.length > 0 ? digestiveSymptoms.join(', ') : 'Ninguno'}
- 🥗 DIETA ESPECIAL: ${specialDiet || 'Estándar'}

### 3. CONTEXTO DEL MENÚ Y TIEMPO DE COMIDA
- Día del Menú: ${dayName}
- Tiempo de comida destino: ${targetMealTime.label} (${targetMealTime.key})
- Enfoque culinario solicitado: ${styleDescription}
${customNotes && customNotes.trim() ? `- 📝 NOTAS PARTICULARES DE LA NUTRIÓLOGA: ${customNotes.trim()}` : ''}

### 4. METAS DE MACRONUTRIENTES A CUADRAR PARA ESTE PLATILLO
- Calorías Objetivo: ~${targetKcal} kcal (Tolerancia ±10%)
- Proteínas: ~${targetProtein}g
- Carbohidratos: ~${targetCarbs}g
- Grasas: ~${targetFat}g
*(Plan diario total del paciente: ${dailyPlanMacros.calories} kcal, ${dailyPlanMacros.protein}g P, ${dailyPlanMacros.carbs}g C, ${dailyPlanMacros.fat}g G)*

---
### REGLAS OBLIGATORIAS DE FORMATO Y SALIDA:
1. Genera exactamente ${optionsCount} platillos distintos en un arreglo JSON.
2. Cada platillo debe tener ingredientes con porciones limpias y en unidades mexicanas estándar del SMAE:
   - Gramos (g) para carnes, pescados, leguminosas o queso (ej: "120 g Pechuga de pollo cocida").
   - Piezas con gramaje (ej: "2 piezas (60g) Tortilla de maíz", "1/4 pieza (30g) Aguacate Hass").
   - Medidas caseras: taza, cucharada (cda), cucharadita (cdta) (ej: "1/2 taza (80g) Frijoles de la olla", "1 cucharada (15ml) Aceite de oliva").
   - NUNCA pongas números duplicados como "4 1 pieza" o "0.2 pieza".
3. El campo "ingredientesDetalle" es **OBLIGATORIO** y debe contener **TODOS** los ingredientes del platillo (no solo un ejemplo). Cada ingrediente debe incluir su nombre, cantidad, unidad, gramosEquivalentes y macros individuales. La suma de los macros de todos los ingredientes debe coincidir con los macros totales del platillo.
4. Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:

[
  {
    "nombre": "Nombre del platillo mexicano apetitoso",
    "descripcion": "Descripción concisa culinaria y de preparación",
    "porcion": "1 plato (350g)",
    "tiempoPreparacionMin": 15,
    "ingredientes": [
      "120 g Pechuga de pollo a la plancha",
      "2 piezas (60g) Tortilla de maíz",
      "1/4 pieza (30g) Aguacate Hass",
      "1/2 taza (100g) Frijoles negros de la olla",
      "1 porción Pico de gallo"
    ],
    "ingredientesDetalle": [
      {
        "nombre": "Pechuga de pollo a la plancha",
        "cantidad": 120,
        "unidad": "g",
        "gramosEquivalentes": 120,
        "macros": { "calories": 198, "protein": 37, "carbs": 0, "fat": 4.3 }
      },
      {
        "nombre": "Tortilla de maíz",
        "cantidad": 2,
        "unidad": "pieza",
        "gramosEquivalentes": 60,
        "macros": { "calories": 104, "protein": 2.6, "carbs": 21.8, "fat": 1.2 }
      },
      {
        "nombre": "Aguacate Hass",
        "cantidad": 0.25,
        "unidad": "pieza",
        "gramosEquivalentes": 30,
        "macros": { "calories": 48, "protein": 0.6, "carbs": 2.6, "fat": 4.4 }
      },
      {
        "nombre": "Frijoles negros de la olla",
        "cantidad": 0.5,
        "unidad": "taza",
        "gramosEquivalentes": 100,
        "macros": { "calories": 114, "protein": 7.6, "carbs": 20, "fat": 0.5 }
      },
      {
        "nombre": "Pico de gallo",
        "cantidad": 1,
        "unidad": "porción",
        "gramosEquivalentes": 40,
        "macros": { "calories": 10, "protein": 0.4, "carbs": 2.2, "fat": 0.1 }
      }
    ],
    "macros": {
      "calories": ${targetKcal},
      "protein": ${targetProtein},
      "carbs": ${targetCarbs},
      "fat": ${targetFat}
    },
    "justificacionClinica": "Explicación breve de por qué este platillo cuadra los macros y respeta la salud del paciente."
  }
]`;
  }

  /**
   * Ejecuta la llamada a Gemini (gemini-3.7-flash / fallback gemini-3.6-flash / fallback server proxy)
   * y devuelve las sugerencias validadas y parseadas.
   */
  static async generateSuggestions(input: MealSuggestionInput): Promise<SuggestedDishOption[]> {
    const prompt = this.buildPrompt(input);
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || '';

    let jsonResponseText = '';
    let lastError: any = null;

    // 1. Intento directo con Google Generative AI en el cliente
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        for (const modelName of this.CANDIDATE_MODELS) {
          let modelSucceeded = false;
          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.4
                }
              });

              const result = await model.generateContent(prompt);
              const text = result.response.text();
              if (text && text.trim().length > 10) {
                jsonResponseText = text;
                modelSucceeded = true;
                break;
              }
            } catch (modelErr: any) {
              lastError = modelErr;
              const msg = modelErr?.message || String(modelErr);
              console.warn(`[GeminiMealSuggestion] Intento ${attempt} con modelo ${modelName} falló:`, msg);
              const isTransient = msg.includes('503') || msg.includes('high demand') || msg.includes('429');
              if (isTransient && attempt < 2) {
                await new Promise(r => setTimeout(r, 850));
                continue;
              }
              break;
            }
          }
          if (modelSucceeded) {
            break;
          }
        }
      } catch (clientErr) {
        console.warn('[GeminiMealSuggestion] Error en cliente Gemini:', clientErr);
        lastError = clientErr;
      }
    }

    // 2. Fallback a Backend Proxy local /api/chat si no hay key directa o si falló
    if (!jsonResponseText) {
      try {
        const apiBase = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            model: 'gemini-3.7-flash',
            jsonMode: true
          })
        });

        if (response.ok) {
          const resData = await response.json();
          jsonResponseText = resData.reply || resData.text || resData.content || JSON.stringify(resData);
        }
      } catch (proxyErr) {
        console.warn('[GeminiMealSuggestion] Error en proxy backend:', proxyErr);
      }
    }

    if (!jsonResponseText) {
      throw new Error(lastError?.message || 'No se pudo obtener respuesta del servicio de IA. Verifica tu conexión o clave de API.');
    }

    // 3. Limpiar y parsear el JSON
    return this.parseAndSanitizeDishes(jsonResponseText, input);
  }

  /**
   * Sanitiza el JSON devuelto por Gemini, asegura formato SMAE limpio
   * y convierte a `SuggestedDishOption[]`.
   */
  private static parseAndSanitizeDishes(rawText: string, input: MealSuggestionInput): SuggestedDishOption[] {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    }

    let parsedArray: any[] = [];
    try {
      const parsed = JSON.parse(clean);
      parsedArray = Array.isArray(parsed) ? parsed : (parsed.platillos || parsed.opciones || [parsed]);
    } catch (parseErr) {
      console.error('[GeminiMealSuggestion] Error parseando JSON de Gemini:', parseErr, rawText);
      throw new Error('La respuesta de Gemini no tuvo el formato JSON esperado.');
    }

    const results: SuggestedDishOption[] = [];

    parsedArray.forEach((item, index) => {
      if (!item || typeof item !== 'object') return;

      const nombre = String(item.nombre || `Opción ${index + 1}`).trim();
      const descripcion = String(item.descripcion || '').trim();
      const porcion = String(item.porcion || '1 porción').trim();
      const tiempoPreparacionMin = typeof item.tiempoPreparacionMin === 'number' ? item.tiempoPreparacionMin : 15;
      const justificacionClinica = String(item.justificacionClinica || 'Ajustado a los requerimientos y restricciones del paciente.').trim();

      const rawMacros = item.macros || {};
      const calories = Math.round(Number(rawMacros.calories || rawMacros.calorias || 0));
      const protein = +(Number(rawMacros.protein || rawMacros.proteina || 0)).toFixed(1);
      const carbs = +(Number(rawMacros.carbs || rawMacros.carbohidratos || 0)).toFixed(1);
      const fat = +(Number(rawMacros.fat || rawMacros.grasas || 0)).toFixed(1);

      // Ingredientes
      const rawIngredientes: string[] = Array.isArray(item.ingredientes)
        ? item.ingredientes.map((i: any) => String(i))
        : [];

      // Si vienen ingredientes detallados, usarlos y sanitizarlos
      let ingredientesDetalle: DishIngredient[] = [];
      if (Array.isArray(item.ingredientesDetalle) && item.ingredientesDetalle.length > 0) {
        ingredientesDetalle = item.ingredientesDetalle.map((ing: any, iIdx: number) => {
          const qty = Number(ing.cantidad) || 1;
          const unit = String(ing.unidad || 'porción');
          const ingName = String(ing.nombre || `Ingrediente ${iIdx + 1}`);
          const ingGrams = Number(ing.gramosEquivalentes) || IngredientSearchService.calculateIngredientGrams(qty, unit, ingName);
          const ingMacros = ing.macros || {};
          const macros = {
            calories: Math.round(Number(ingMacros.calories || 0)),
            protein: +(Number(ingMacros.protein || 0)).toFixed(1),
            carbs: +(Number(ingMacros.carbs || 0)).toFixed(1),
            fat: +(Number(ingMacros.fat || 0)).toFixed(1)
          };
          // baseMacros = per-gram values for correct scaling in EditDishPortionsModal
          const safeGrams = Math.max(1, ingGrams);
          return {
            id: `ing_ai_${Date.now()}_${iIdx}`,
            nombre: ingName,
            cantidad: qty,
            unidad: unit,
            gramosEquivalentes: ingGrams,
            macros,
            baseMacros: {
              calories: macros.calories / safeGrams,
              protein: macros.protein / safeGrams,
              carbs: macros.carbs / safeGrams,
              fat: macros.fat / safeGrams
            }
          };
        });
      }

      // Crear dish base
      const dish: DishItem = {
        id: `dish_ai_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        nombre,
        descripcion,
        porcion,
        categoria: input.targetMealTime.key,
        ingredientes: rawIngredientes,
        ingredientesDetalle: ingredientesDetalle.length > 0 ? ingredientesDetalle : undefined,
        macros: {
          calories: calories || 300,
          protein: protein || 20,
          carbs: carbs || 30,
          fat: fat || 10
        },
        esPersonalizado: false
      };

      // Pasar por ensureDishIngredients para garantizar que las cadenas y gramos queden impecables
      const finalIngDetail = IngredientSearchService.ensureDishIngredients(dish);
      const cleanIngStrings = finalIngDetail.map(ing => IngredientSearchService.formatIngredientDisplay(ing));

      // Calcular diferencia respecto a lo solicitado
      const caloriasDiff = calories - input.remainingMacros.calories;
      const proteinaDiff = +(protein - input.remainingMacros.protein).toFixed(1);

      results.push({
        ...dish,
        ingredientes: cleanIngStrings,
        ingredientesDetalle: finalIngDetail,
        justificacionClinica,
        tiempoPreparacionMin,
        diferenciaMacros: {
          caloriasDiff,
          proteinaDiff
        }
      });
    });

    return results;
  }
}
