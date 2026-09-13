import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DietPlanMenu } from '../../types/dietMenu';

export class MenuCompactService {
  private static readonly CANDIDATE_MODELS = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];

  /**
   * Acorta y limpia heurísticamente el título de un platillo para impresión en 1 hoja horizontal.
   * Elimina redundancias de ingredientes, métodos de cocción excesivos y conectores largos.
   */
  public static cleanDishTitle(name: string, hasIngredients = false): string {
    if (!name) return '';
    let clean = name.trim();

    // 1. Quitar dos puntos y puntuación final
    clean = clean.replace(/[:.]+$/, '').trim();

    // 2. Quitar prefijos de cantidades o presentaciones verbales
    clean = clean.replace(/^(porci[oó]n de|plato de|taz[oó]n de|vaso de|copa de|orden de|preparaci[oó]n de)\s+/i, '');

    // 3. Quitar cantidades iniciales si es un título (ej: "1 taza de yogur..." -> "Yogur...")
    clean = clean.replace(/^(\d+(?:[.,/]\d+)?\s*(?:tazas?|tz\.?|pzas?\.?|piezas?|vasos?|cucharadas?|cdas?\.?|g|gr|ml|rebanadas?|reb\.?)\s*(?:de\s+)?)/i, '');

    // 4. Si el nombre tiene frases de cocción o aditivos que alargan el texto
    if (clean.length > 25) {
      clean = clean.replace(/\s+(cocidas?|asadas?|a la plancha|al vapor|al horno|fritas?|hervidas?|desinfectadas?)\b/gi, '');
      clean = clean.replace(/\s+(baja en sodio|bajo en sodio|sin az[uú]car|descremada|baja en grasa|deslactosada|light)\b/gi, '');
      clean = clean.replace(/\s+(frescas?|naturales?|org[aá]nic[ao]s?)\b/gi, '');
    }

    // 5. Si el platillo ya tiene lista de ingredientes o el nombre es muy largo y enumera ingredientes unidos por "con... y..."
    if (hasIngredients || clean.length > 30) {
      // Remover acompañamientos secundarios largos
      clean = clean.replace(/\s+acompa[ñn]ad[ao]\s+de\s+.+$/i, '');
      clean = clean.replace(/\s+servid[ao]\s+con\s+.+$/i, '');
      clean = clean.replace(/\s+aderezad[ao]\s+con\s+.+$/i, '');
      clean = clean.replace(/\s+con\s+guarnici[oó]n\s+de\s+.+$/i, '');

      // Si aún supera los 28 caracteres y tiene "con X, Y y Z", conservar platillo base + ingrediente principal
      if ((hasIngredients && clean.length > 26) || clean.length > 32) {
        const conMatch = clean.match(/^(.+?)\s+con\s+([^,]+)(?:,\s*|\s+y\s+)(.+)$/i);
        if (conMatch) {
          const base = conMatch[1].trim();
          let firstIng = conMatch[2].trim().replace(/^(queso\s+|pechuga de\s+|rebanadas de\s+)/i, '');
          clean = `${base} con ${firstIng}`;
        }
      }
    }

    // 6. Recorte de seguridad si sigue siendo excesivamente largo (> 34 caracteres)
    if (clean.length > 34) {
      const parts = clean.split(/\s+/);
      if (parts.length > 4) {
        clean = parts.slice(0, 4).join(' ');
      }
    }

    // 7. Capitalizar primera letra
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
  }

  /**
   * Abrevia y compacta el texto de un ingrediente para ocupar el mínimo espacio vertical en celdas.
   */
  public static abbreviateIngredient(ing: string): string {
    if (!ing) return '';
    let s = ing.trim();

    // Abreviar unidades de medida
    s = s.replace(/\bpiezas?\b/gi, 'pza.')
      .replace(/\brebanadas?\b/gi, 'reb.')
      .replace(/\bcucharaditas?\b/gi, 'cdita.')
      .replace(/\bcucharadas?\b/gi, 'cda.')
      .replace(/\btazas?\b/gi, 'tz.')
      .replace(/\bgramos?\b/gi, 'g')
      .replace(/\bgr\b/gi, 'g')
      .replace(/\bmililitros?\b/gi, 'ml')
      .replace(/\blat[ao]s?\b/gi, 'lata')
      .replace(/\bpuñados?\b/gi, 'puñado');

    // Remover rellenos innecesarios para impresión
    s = s.replace(/\b(al gusto|frescas?|cocidas?|desinfectadas?|baja en sodio|bajo en sodio|sin az[uú]car|pasteurizad[ao]|entero|entera|rebanad[ao]s?)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Limpiar puntuaciones intermedias y finales
    s = s.replace(/[,;.]+$/, '').trim();
    return s;
  }

  /**
   * Compacta y optimiza localmente todos los platillos e ingredientes del menú
   */
  public static compactMenuLocally(menu: DietPlanMenu): { menu: DietPlanMenu; modifiedCount: number } {
    const cloned: DietPlanMenu = JSON.parse(JSON.stringify(menu));
    let modifiedCount = 0;

    cloned.dias.forEach(day => {
      Object.entries(day.comidas).forEach(([_, dishes]) => {
        dishes.forEach(dish => {
          const originalName = dish.nombre;
          const hasIngs = Array.isArray(dish.ingredientes) && dish.ingredientes.length > 0;
          const cleanedName = this.cleanDishTitle(originalName, hasIngs);

          if (cleanedName && cleanedName !== originalName) {
            dish.nombre = cleanedName;
            modifiedCount++;
          }

          // Abreviar ingredientes
          if (hasIngs) {
            dish.ingredientes = dish.ingredientes.map(i => this.abbreviateIngredient(i));
          }
        });
      });
    });

    return { menu: cloned, modifiedCount };
  }

  /**
   * Utiliza Gemini API para acortar de forma inteligente y culinaria todos los nombres
   * del menú en una sola llamada en lote, adaptándolos para que quepan en 1 hoja horizontal.
   */
  public static async compactMenuWithAI(menu: DietPlanMenu): Promise<{ menu: DietPlanMenu; modifiedCount: number; aiUsed: boolean }> {
    // 1. Recolectar nombres únicos de platillos que tengan más de 20 caracteres o que enumeren ingredientes
    const uniqueDishesMap = new Map<string, { original: string; ingredients: string[] }>();

    menu.dias.forEach(day => {
      Object.values(day.comidas).forEach(dishes => {
        dishes.forEach(d => {
          if (d.nombre && !uniqueDishesMap.has(d.nombre)) {
            uniqueDishesMap.set(d.nombre, {
              original: d.nombre,
              ingredients: d.ingredientes || []
            });
          }
        });
      });
    });

    if (uniqueDishesMap.size === 0) {
      return { menu, modifiedCount: 0, aiUsed: false };
    }

    const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY)
      || (typeof localStorage !== 'undefined' && localStorage.getItem('bodyflow_gemini_api_key'))
      || '';

    // Si no hay API key de Gemini, usar optimizador local
    if (!apiKey) {
      console.info('[MenuCompactService] No hay VITE_GEMINI_API_KEY, ejecutando compactación heurística local.');
      const localRes = this.compactMenuLocally(menu);
      return { ...localRes, aiUsed: false };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const dishesPayload = Array.from(uniqueDishesMap.entries()).map(([name, data], idx) => ({
        id: `d_${idx}`,
        original: name,
        ingredients: (data.ingredients || []).slice(0, 4)
      }));

      const prompt = `Eres un nutriólogo y editor clínico experto en diseño editorial de menús para pacientes.
Tu misión es compactar y acortar los nombres de los siguientes platillos para que el menú semanal de 7 días y 5 comidas quepa perfectamente impreso en UNA SOLA HOJA HORIZONTAL (Landscape).

REGLAS ESTRICTAS:
1. Acorta cada nombre a un título conciso, apetitoso y profesional de MÁXIMO 2 a 4 palabras (máximo 26 caracteres).
2. NO repitas en el nombre la lista completa de ingredientes (ej. si el platillo dice "Sándwich de pavo con queso panela, aguacate, jitomate y lechuga", cámbialo a "Sándwich de Pavo y Panela").
3. Elimina palabras innecesarias como "acompañado de", "porción de", "preparado con", "al vapor", "baja en sodio", "sin azúcar", cantidades (ej. "2 huevos", "1 taza").
4. Mantén la identidad apetitosa del platillo (ej: "Huevos con Espinacas", "Pechuga Asada con Arroz", "Yogur Griego con Fresas", "Licuado de Avena", "Tacos de Pollo").

Devuelve ÚNICAMENTE un array JSON con esta estructura exacta:
[
  { "id": "d_0", "shortName": "Nombre Corto" }
]

Lista de platillos a compactar:
${JSON.stringify(dishesPayload, null, 2)}`;

      let jsonResponseText = '';
      for (const modelName of this.CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          });

          const result = await model.generateContent(prompt);
          const text = result.response.text();
          if (text && text.trim().length > 10) {
            jsonResponseText = text;
            break;
          }
        } catch (err: any) {
          console.warn(`[MenuCompactService] Modelo ${modelName} falló:`, err?.message || err);
        }
      }

      if (jsonResponseText) {
        // Parsear respuesta de Gemini
        const parsed = JSON.parse(jsonResponseText);
        const nameMap = new Map<string, string>();

        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            const match = dishesPayload.find(p => p.id === item.id);
            if (match && item.shortName) {
              nameMap.set(match.original, item.shortName.trim());
            }
          });
        }

        const cloned: DietPlanMenu = JSON.parse(JSON.stringify(menu));
        let modifiedCount = 0;

        cloned.dias.forEach(day => {
          Object.values(day.comidas).forEach(dishes => {
            dishes.forEach(dish => {
              const aiShortName = nameMap.get(dish.nombre);
              if (aiShortName && aiShortName !== dish.nombre) {
                dish.nombre = aiShortName;
                modifiedCount++;
              } else {
                // Fallback heurístico si no fue modificado por IA
                const clean = this.cleanDishTitle(dish.nombre, (dish.ingredientes || []).length > 0);
                if (clean !== dish.nombre) {
                  dish.nombre = clean;
                  modifiedCount++;
                }
              }

              // Abreviar ingredientes
              if (dish.ingredientes && dish.ingredientes.length > 0) {
                dish.ingredientes = dish.ingredientes.map(i => this.abbreviateIngredient(i));
              }
            });
          });
        });

        return { menu: cloned, modifiedCount, aiUsed: true };
      }
    } catch (aiErr) {
      console.warn('[MenuCompactService] Error llamando a Gemini AI, recurriendo a compactación local:', aiErr);
    }

    // Fallback heurístico en caso de cualquier fallo
    const localRes = this.compactMenuLocally(menu);
    return { ...localRes, aiUsed: false };
  }
}
