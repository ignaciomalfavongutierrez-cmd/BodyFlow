import { GoogleGenerativeAI } from '@google/generative-ai';
import type { 
  RecommendationObjective, 
  RecommendationCard 
} from '../../types/recommendations';

export interface AdaptRecommendationsInput {
  objective: RecommendationObjective;
  specificIndications: string;
  patientName?: string;
}

export interface AdaptedRecommendationOutput {
  bannerSubtitle: string;
  summaryText: string;
  summaryTag: string;
  cards: RecommendationCard[];
  aiNote?: string;
}

export class GeminiRecommendationAdapterService {
  /**
   * Retrieves the Gemini API Key from Vite environment variables or local storage.
   */
  public static getApiKey(): string {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim() !== '') {
      return envKey.trim().replace(/^["']|["']$/g, '');
    }
    const storedKey = localStorage.getItem('bodyflow_gemini_api_key');
    if (storedKey && storedKey.trim() !== '') {
      return storedKey.trim();
    }
    return '';
  }

  /**
   * Adapts the 6 recommendation cards and summary text using Google Gemini AI
   * based on the specific clinical indications, diseases, or symptoms.
   */
  public static async adaptRecommendations(
    input: AdaptRecommendationsInput
  ): Promise<AdaptedRecommendationOutput> {
    const apiKey = this.getApiKey();

    const systemPrompt = `Eres un nutriólogo clínico experto de alto nivel asistiendo a la Lic. N. Talia Tinoco Fabián (Cédula Profesional 11290678).
Tu labor es personalizar y adaptar clínicamente la Hoja de Recomendaciones del paciente basándote en su objetivo nutricional y sus indicaciones médicas / padecimientos específicos (ej. gastritis, reflujo, hipertensión, diabetes, hipotiroidismo, estreñimiento, intolerancias, entrenamiento de alto rendimiento, etc.).

DATOS DEL PACIENTE:
- Nombre: ${input.patientName || 'Paciente'}
- Objetivo Nutricional: ${input.objective.name}
- Indicaciones Específicas / Padecimiento: "${input.specificIndications}"

RECOMENDACIONES BASE EN FORMATO JSON:
${JSON.stringify({
  bannerSubtitle: input.objective.bannerSubtitle,
  summaryText: input.objective.summaryText,
  summaryTag: input.objective.summaryTag,
  cards: input.objective.cards
}, null, 2)}

INSTRUCCIONES CLÍNICAS Y FORMATO:
1. Adapta con precisión científica y tono empático los lineamientos de las 6 tarjetas para prevenir, mitigar y tratar la condición clínica indicada.
   - Por ejemplo, si refiere reflujo/gastritis: ajustar tiempos entre comidas, recomendar cenar 2-3 hrs antes de acostarse, evitar irritantes y alimentos muy grasos, sugerir opciones digestivas.
   - Si refiere hipertensión: moderar sodio, enriquecer en potasio y magnesio, evitar embutidos altos en sales.
   - Si refiere estreñimiento: aumentar fibra soluble e insoluble, pautas de hidratación y movimiento.
2. REGLA ESTRICTA DE ESTRUCTURA:
   - Debe contener EXACTAMENTE 6 tarjetas (num 1 al 6) con sus respectivos 'id' ("c1" a "c6") y sus 'icon'.
   - Cada tarjeta DEBE CONTENER EXACTAMENTE 2 ítems en su array 'items', cada uno con:
     - "title": Título corto y directo en negrita que finalice con dos puntos (ej: "Evitar irritantes en ayunas:").
     - "description": Explicación concisa y accionable (máximo 2 a 3 líneas) para que quepa perfectamente en la impresión de 1 sola página.
3. Actualiza 'bannerSubtitle', 'summaryText' y 'summaryTag' para alinearlos con el padecimiento.
4. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni explicaciones adicionales.

ESTRUCTURA DE RESPUESTA ESPERADA (JSON):
{
  "bannerSubtitle": "Lineamientos Personalizados con Enfoque Clínico",
  "summaryText": "La constancia y el cuidado de tus hábitos digestivos transformarán tu bienestar diario.",
  "summaryTag": "Cuidado Clínico y Bienestar Integral",
  "aiNote": "Ajustado específicamente para gastritis matutina y reflujo",
  "cards": [
    {
      "id": "c1",
      "num": 1,
      "title": "Horarios y Hábitos en la Mesa",
      "icon": "fa-regular fa-clock",
      "highlight": true,
      "items": [
        {
          "title": "Respetar tiempos de comida sin ayunos prolongados:",
          "description": "Conserva horarios regulares para evitar que los ácidos gástricos irriten la mucosa estomacal."
        },
        {
          "title": "Cenar ligero y con anticipación:",
          "description": "Procura cenar al menos 2 a 3 horas antes de dormir para evitar episodios de reflujo nocturno."
        }
      ]
    },
    ... (6 tarjetas en total)
  ]
}`;

    const candidateModels = [
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let lastError: any = null;

    // 1. Direct GoogleGenerativeAI client call if API key exists
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
            },
          });

          const result = await model.generateContent(systemPrompt);
          const responseText = result.response.text();
          if (responseText && responseText.trim()) {
            return this.parseJsonResponse(responseText);
          }
        } catch (err: any) {
          console.warn(`[GeminiRecommendationAdapterService] Error con modelo ${modelName}:`, err);
          lastError = err;
        }
      }
    }

    // 2. Server Proxy Fallback (/api/chat)
    try {
      const serverUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = `${serverUrl}/api/chat`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: systemPrompt,
          isSystemPrompt: true,
          jsonMode: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.reply || data.text || data.response || data;
        return this.parseJsonResponse(typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent));
      }
    } catch (proxyErr) {
      console.warn('[GeminiRecommendationAdapterService] Falló proxy /api/chat:', proxyErr);
    }

    throw new Error(
      lastError?.message ||
      'No se pudo conectar con el servicio de Inteligencia Artificial de Gemini. Verifica tu conexión o clave de API.'
    );
  }

  /**
   * Safely parses JSON response from Gemini.
   */
  private static parseJsonResponse(text: string): AdaptedRecommendationOutput {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    const parsed = JSON.parse(clean);

    if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      throw new Error('La respuesta de Gemini no contiene un formato de tarjetas válido.');
    }

    return {
      bannerSubtitle: parsed.bannerSubtitle || 'Lineamientos Personalizados',
      summaryText: parsed.summaryText || 'Recomendaciones clínicas personalizadas.',
      summaryTag: parsed.summaryTag || 'Nutrición Clínica Personalizada',
      cards: parsed.cards,
      aiNote: parsed.aiNote || '',
    };
  }
}
