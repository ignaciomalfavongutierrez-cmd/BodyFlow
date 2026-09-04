import type { DishIngredient, DishItem } from '../../types/dietMenu';
import { searchFoods } from '../foodApi';
import { useFoodsStore } from '../../stores/foods';

export interface IngredientSearchResult {
  id: string;
  nombre: string;
  porcion: string;
  fuente: 'local' | 'smae' | 'fatsecret';
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * Catálogo de alimentos básicos mexicanos con macros unitarios de referencia (SMAE)
 * Para búsqueda rápida sin latencia y soporte offline.
 */
export const BASE_MEXICAN_STAPLES: IngredientSearchResult[] = [
  {
    id: 'staple-huevo',
    nombre: 'Huevo entero',
    porcion: '1 pieza (50g)',
    fuente: 'smae',
    macros: { calories: 74, protein: 6.3, carbs: 0.4, fat: 5 }
  },
  {
    id: 'staple-clara',
    nombre: 'Clara de huevo',
    porcion: '1 pieza (33g)',
    fuente: 'smae',
    macros: { calories: 17, protein: 3.6, carbs: 0.2, fat: 0 }
  },
  {
    id: 'staple-pechuga',
    nombre: 'Pechuga de pollo a la plancha',
    porcion: '100g cocida',
    fuente: 'smae',
    macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }
  },
  {
    id: 'staple-bistec',
    nombre: 'Bistec de res magro',
    porcion: '100g cocido',
    fuente: 'smae',
    macros: { calories: 180, protein: 26, carbs: 0, fat: 8 }
  },
  {
    id: 'staple-atun',
    nombre: 'Atún en agua',
    porcion: '1 lata drenada (100g)',
    fuente: 'smae',
    macros: { calories: 110, protein: 25, carbs: 0, fat: 1 }
  },
  {
    id: 'staple-panela',
    nombre: 'Queso panela bajo en grasa',
    porcion: '40g (1 rebanada)',
    fuente: 'smae',
    macros: { calories: 85, protein: 7, carbs: 1, fat: 5.5 }
  },
  {
    id: 'staple-aguacate',
    nombre: 'Aguacate Hass',
    porcion: '1/3 pieza (35g)',
    fuente: 'smae',
    macros: { calories: 55, protein: 0.7, carbs: 3, fat: 5 }
  },
  {
    id: 'staple-tortilla',
    nombre: 'Tortilla de maíz',
    porcion: '1 pieza (30g)',
    fuente: 'smae',
    macros: { calories: 64, protein: 1.4, carbs: 13.6, fat: 0.7 }
  },
  {
    id: 'staple-tostada-horneada',
    nombre: 'Tostada de maíz horneada',
    porcion: '1 pieza (11g)',
    fuente: 'smae',
    macros: { calories: 25, protein: 0.7, carbs: 5.5, fat: 0.2 }
  },
  {
    id: 'staple-avena',
    nombre: 'Avena en hojuelas',
    porcion: '1/2 taza en seco (40g)',
    fuente: 'smae',
    macros: { calories: 150, protein: 5, carbs: 27, fat: 2.5 }
  },
  {
    id: 'staple-arroz',
    nombre: 'Arroz blanco o integral cocido',
    porcion: '1/2 taza (80g)',
    fuente: 'smae',
    macros: { calories: 105, protein: 2.2, carbs: 23, fat: 0.4 }
  },
  {
    id: 'staple-frijol',
    nombre: 'Frijoles negros/bayos cocidos',
    porcion: '1/2 taza (90g)',
    fuente: 'smae',
    macros: { calories: 115, protein: 7.5, carbs: 20, fat: 0.5 }
  },
  {
    id: 'staple-aceite-oliva',
    nombre: 'Aceite de oliva extra virgen',
    porcion: '1 cucharadita (5ml)',
    fuente: 'smae',
    macros: { calories: 45, protein: 0, carbs: 0, fat: 5 }
  },
  {
    id: 'staple-leche-deslactosada',
    nombre: 'Leche deslactosada light',
    porcion: '1 taza (240ml)',
    fuente: 'smae',
    macros: { calories: 95, protein: 8.5, carbs: 12, fat: 1.5 }
  },
  {
    id: 'staple-leche-almendras',
    nombre: 'Leche de almendras sin azúcar',
    porcion: '1 taza (240ml)',
    fuente: 'smae',
    macros: { calories: 35, protein: 1, carbs: 1.5, fat: 2.5 }
  },
  {
    id: 'staple-fresas',
    nombre: 'Fresas frescas',
    porcion: '1 taza entera (150g)',
    fuente: 'smae',
    macros: { calories: 48, protein: 1, carbs: 11.5, fat: 0.5 }
  },
  {
    id: 'staple-platano',
    nombre: 'Plátano / Banano',
    porcion: '1/2 pieza (60g)',
    fuente: 'smae',
    macros: { calories: 55, protein: 0.7, carbs: 14, fat: 0.2 }
  },
  {
    id: 'staple-manzana',
    nombre: 'Manzana verde o roja',
    porcion: '1 pieza mediana (140g)',
    fuente: 'smae',
    macros: { calories: 72, protein: 0.4, carbs: 19, fat: 0.2 }
  },
  {
    id: 'staple-espinaca',
    nombre: 'Espinacas frescas',
    porcion: '2 tazas crudas (60g)',
    fuente: 'smae',
    macros: { calories: 15, protein: 1.7, carbs: 2.2, fat: 0.2 }
  },
  {
    id: 'staple-jitomate',
    nombre: 'Jitomate / Tomate picado',
    porcion: '1 pieza (120g)',
    fuente: 'smae',
    macros: { calories: 22, protein: 1, carbs: 4.8, fat: 0.2 }
  },
  {
    id: 'staple-crema-cacahuate',
    nombre: 'Crema de cacahuate sin azúcar',
    porcion: '1 cucharada (16g)',
    fuente: 'smae',
    macros: { calories: 95, protein: 4, carbs: 3, fat: 8 }
  },
  {
    id: 'staple-proteina-whey',
    nombre: 'Proteína Whey Isolate en polvo',
    porcion: '1 scoop (30g)',
    fuente: 'smae',
    macros: { calories: 115, protein: 25, carbs: 1.5, fat: 0.8 }
  }
];

export class IngredientSearchService {
  /**
   * Búsqueda híbrida:
   * 1. Consulta en Firestore (alimentos guardados / caché local del nutriólogo).
   * 2. Consulta en el catálogo SMAE de alimentos básicos mexicanos.
   * 3. Consulta en FatSecret API a través del proxy `/api/foods/search`.
   */
  static async searchIngredients(query: string): Promise<IngredientSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return BASE_MEXICAN_STAPLES.slice(0, 10);

    const results: IngredientSearchResult[] = [];
    const seenIds = new Set<string>();

    // 1. Nivel 1: Alimentos guardados en Firestore
    const foodsStore = useFoodsStore();
    const localMatches = foodsStore.searchMyFoods(q);
    localMatches.forEach(f => {
      seenIds.add(f.id);
      results.push({
        id: f.id,
        nombre: f.name,
        porcion: f.description || '1 porción',
        fuente: 'local',
        macros: {
          calories: f.macros.calories || 0,
          protein: f.macros.protein || 0,
          carbs: f.macros.carbs || 0,
          fat: f.macros.fat || 0
        }
      });
    });

    // 2. Nivel 2: Catálogo Base Mexicano (SMAE)
    const stapleMatches = BASE_MEXICAN_STAPLES.filter(s =>
      s.nombre.toLowerCase().includes(q)
    );
    stapleMatches.forEach(s => {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        results.push(s);
      }
    });

    // 3. Nivel 3: FatSecret API Proxy
    try {
      const fatSecretResults = await searchFoods(q, 8);
      for (const fsItem of fatSecretResults) {
        const uniqueId = `fs_${fsItem.id}`;
        if (!seenIds.has(uniqueId) && !seenIds.has(fsItem.id)) {
          seenIds.add(uniqueId);
          results.push({
            id: uniqueId,
            nombre: fsItem.name,
            porcion: fsItem.description || '1 porción',
            fuente: 'fatsecret',
            macros: {
              calories: Math.round(fsItem.macros.calories || 0),
              protein: Math.round(fsItem.macros.protein || 0),
              carbs: Math.round(fsItem.macros.carbs || 0),
              fat: Math.round(fsItem.macros.fat || 0)
            }
          });
        }
      }
    } catch (err) {
      console.warn('[IngredientSearchService] Error consultando FatSecret proxy:', err);
    }

    return results;
  }

  /**
   * Al seleccionar un alimento de FatSecret, lo registra automáticamente
   * en la base de datos de Firestore del usuario (`users/{uid}/foods`).
   */
  static async autoCacheFatSecretFood(item: IngredientSearchResult): Promise<void> {
    if (item.fuente !== 'fatsecret') return;
    try {
      const foodsStore = useFoodsStore();
      await foodsStore.saveFood({
        name: item.nombre,
        description: item.porcion,
        macros: {
          calories: item.macros.calories,
          protein: item.macros.protein,
          carbs: item.macros.carbs,
          fat: item.macros.fat,
          sugar: 0
        }
      });
      // Marcar como local para esta sesión
      item.fuente = 'local';
    } catch (err) {
      console.error('[IngredientSearchService] Error auto-guardando en Firestore:', err);
    }
  }

  /**
   * Asegura que un platillo tenga un desglose estructurado de DishIngredient[]
   * Si no lo tiene, analiza sus strings de ingredientes o divide proporcionalmente.
   */
  static ensureDishIngredients(dish: DishItem): DishIngredient[] {
    if (dish.ingredientesDetalle && dish.ingredientesDetalle.length > 0) {
      return JSON.parse(JSON.stringify(dish.ingredientesDetalle));
    }

    // Si solo tiene string[] de ingredientes, construir desglose inicial
    const stringList = dish.ingredientes || [];
    if (stringList.length === 0) {
      return [{
        nombre: dish.nombre,
        cantidad: 1,
        unidad: dish.porcion || 'porción',
        macros: { ...dish.macros },
        baseMacros: { ...dish.macros }
      }];
    }

    const count = stringList.length;
    return stringList.map((ingStr, idx) => {
      const parsed = this.parseIngredientString(ingStr);
      
      const matched = BASE_MEXICAN_STAPLES.find(s =>
        parsed.nombre.toLowerCase().includes(s.nombre.toLowerCase()) ||
        s.nombre.toLowerCase().includes(parsed.nombre.toLowerCase())
      );

      let itemMacros = {
        calories: Math.round(dish.macros.calories / count),
        protein: Math.round(dish.macros.protein / count),
        carbs: Math.round(dish.macros.carbs / count),
        fat: Math.round(dish.macros.fat / count)
      };

      if (matched) {
        itemMacros = {
          calories: Math.round(matched.macros.calories * parsed.cantidad),
          protein: Math.round(matched.macros.protein * parsed.cantidad),
          carbs: Math.round(matched.macros.carbs * parsed.cantidad),
          fat: Math.round(matched.macros.fat * parsed.cantidad)
        };
      }

      return {
        id: `ing_${idx}_${Date.now()}`,
        nombre: parsed.nombre,
        cantidad: parsed.cantidad,
        unidad: parsed.unidad,
        macros: itemMacros,
        baseMacros: {
          calories: Math.round(itemMacros.calories / (parsed.cantidad || 1)),
          protein: Math.round(itemMacros.protein / (parsed.cantidad || 1)),
          carbs: Math.round(itemMacros.carbs / (parsed.cantidad || 1)),
          fat: Math.round(itemMacros.fat / (parsed.cantidad || 1))
        }
      };
    });
  }

  /**
   * Helper para extraer número, unidad y nombre de un texto (ej. "2 huevos enteros")
   */
  private static parseIngredientString(str: string): { cantidad: number; unidad: string; nombre: string } {
    const trimmed = str.trim();
    // Detectar fracciones como 1/2, 1/3, 1/4
    const fractionMatch = trimmed.match(/^(\d+)\/(\d+)\s+(.+)$/);
    if (fractionMatch) {
      const num = parseInt(fractionMatch[1], 10);
      const den = parseInt(fractionMatch[2], 10);
      const rest = fractionMatch[3];
      return {
        cantidad: +(num / den).toFixed(2),
        unidad: 'pieza',
        nombre: rest
      };
    }

    // Detectar números decimales o enteros al inicio (ej. "2 huevos", "100g pechuga")
    const match = trimmed.match(/^([\d.,]+)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?\s*(.*)$/);
    if (match) {
      const qty = parseFloat(match[1].replace(',', '.')) || 1;
      const possibleUnit = match[2] || 'porción';
      
      const units = ['g', 'gr', 'ml', 'taza', 'tazas', 'cda', 'cdta', 'pieza', 'piezas', 'rebanada', 'rebanadas', 'scoop'];
      if (units.includes(possibleUnit.toLowerCase())) {
        return {
          cantidad: qty,
          unidad: possibleUnit,
          nombre: match[3] || possibleUnit
        };
      }

      return {
        cantidad: qty,
        unidad: 'pieza',
        nombre: `${possibleUnit} ${match[3] || ''}`.trim()
      };
    }

    return {
      cantidad: 1,
      unidad: 'porción',
      nombre: trimmed
    };
  }
}
