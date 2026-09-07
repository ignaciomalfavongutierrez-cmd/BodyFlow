import type { DishIngredient, DishItem } from '../../types/dietMenu';
import { searchFoods } from '../foodApi';
import { useFoodsStore } from '../../stores/foods';

export interface IngredientSearchResult {
  id: string;
  nombre: string;
  porcion: string;
  unidadBase?: string;
  gramosReferencia?: number;
  categoria?: string;
  brand?: string;
  fuente: 'local' | 'smae' | 'fatsecret';
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface SmaeStapleItem {
  id: string;
  nombre: string;
  categoria: 'aoa' | 'cereal' | 'leguminosa' | 'grasa' | 'verdura' | 'fruta' | 'lacteo' | 'suplemento';
  porcion: string;
  unidadBase: string; // 'g' | 'pieza' | 'taza' | 'cda' | 'cdta' | 'rebanada' | 'scoop' | 'lata' | 'ml' | 'porción'
  gramosReferencia: number; // Peso en gramos de 1 unidadBase
  densidades: Record<string, number>; // Gramos por cada unidad para este alimento
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * Catálogo Oficial de Alimentos Básicos Mexicanos (SMAE - Sistema Mexicano de Alimentos Equivalentes)
 * 80+ alimentos de consumo diario en México con porciones clínicas estandarizadas,
 * equivalencias exactas en gramos y densidades por unidad para conversión interactiva.
 */
export const BASE_MEXICAN_STAPLES: SmaeStapleItem[] = [
  // ==========================================
  // 1. ALIMENTOS DE ORIGEN ANIMAL (PROTEÍNAS)
  // ==========================================
  {
    id: 'staple-pechuga-pollo',
    nombre: 'Pechuga de pollo a la plancha / cocida',
    categoria: 'aoa',
    porcion: '100 g',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, pieza: 120, taza: 140, cda: 15 },
    macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }
  },
  {
    id: 'staple-pechuga-deshebrada',
    nombre: 'Pechuga de pollo deshebrada',
    categoria: 'aoa',
    porcion: '100 g',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, taza: 130, cda: 15, pieza: 100 },
    macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }
  },
  {
    id: 'staple-huevo-entero',
    nombre: 'Huevo entero',
    categoria: 'aoa',
    porcion: '1 pieza (50g)',
    unidadBase: 'pieza',
    gramosReferencia: 50,
    densidades: { pieza: 50, g: 1 },
    macros: { calories: 74, protein: 6.3, carbs: 0.4, fat: 5 }
  },
  {
    id: 'staple-clara-huevo',
    nombre: 'Clara de huevo',
    categoria: 'aoa',
    porcion: '1 pieza (33g)',
    unidadBase: 'pieza',
    gramosReferencia: 33,
    densidades: { pieza: 33, g: 1, ml: 33, taza: 240 },
    macros: { calories: 17, protein: 3.6, carbs: 0.2, fat: 0 }
  },
  {
    id: 'staple-atun-agua',
    nombre: 'Atún en agua drenado',
    categoria: 'aoa',
    porcion: '1 lata drenada (100g)',
    unidadBase: 'lata',
    gramosReferencia: 100,
    densidades: { lata: 100, g: 1, cda: 20 },
    macros: { calories: 110, protein: 25, carbs: 0, fat: 1 }
  },
  {
    id: 'staple-bistec-res',
    nombre: 'Bistec de res magro a la plancha',
    categoria: 'aoa',
    porcion: '100 g',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, pieza: 120, rebanada: 60 },
    macros: { calories: 180, protein: 26, carbs: 0, fat: 8 }
  },
  {
    id: 'staple-carne-molida-magra',
    nombre: 'Carne molida de res magra (90/10)',
    categoria: 'aoa',
    porcion: '100 g cocida',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, taza: 150, cda: 18 },
    macros: { calories: 176, protein: 26, carbs: 0, fat: 7.5 }
  },
  {
    id: 'staple-pescado-blanco',
    nombre: 'Filete de pescado blanco / Tilapia',
    categoria: 'aoa',
    porcion: '100 g cocido',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, pieza: 120 },
    macros: { calories: 110, protein: 24, carbs: 0, fat: 1.5 }
  },
  {
    id: 'staple-salmon',
    nombre: 'Salmón fresco a la plancha',
    categoria: 'aoa',
    porcion: '100 g cocido',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, pieza: 130 },
    macros: { calories: 206, protein: 22, carbs: 0, fat: 12 }
  },
  {
    id: 'staple-camaron',
    nombre: 'Camarones cocidos / al vapor',
    categoria: 'aoa',
    porcion: '100 g',
    unidadBase: 'g',
    gramosReferencia: 100,
    densidades: { g: 1, pieza: 12, taza: 140 },
    macros: { calories: 99, protein: 21, carbs: 0.9, fat: 1.1 }
  },
  {
    id: 'staple-queso-panela',
    nombre: 'Queso panela bajo en grasa',
    categoria: 'aoa',
    porcion: '1 rebanada (40g)',
    unidadBase: 'rebanada',
    gramosReferencia: 40,
    densidades: { rebanada: 40, pieza: 40, g: 1 },
    macros: { calories: 85, protein: 7, carbs: 1, fat: 5.5 }
  },
  {
    id: 'staple-queso-oaxaca',
    nombre: 'Queso Oaxaca light / en hebra',
    categoria: 'aoa',
    porcion: '30 g',
    unidadBase: 'g',
    gramosReferencia: 30,
    densidades: { g: 1, rebanada: 30, cda: 15 },
    macros: { calories: 84, protein: 7.5, carbs: 0.5, fat: 6 }
  },
  {
    id: 'staple-requeson',
    nombre: 'Requesón bajo en grasa',
    categoria: 'aoa',
    porcion: '3 cucharadas (45g)',
    unidadBase: 'cda',
    gramosReferencia: 15,
    densidades: { cda: 15, g: 1, taza: 220 },
    macros: { calories: 45, protein: 5.5, carbs: 1.5, fat: 1.8 }
  },
  {
    id: 'staple-cottage',
    nombre: 'Queso cottage bajo en grasa (light)',
    categoria: 'aoa',
    porcion: '1/2 taza (100g)',
    unidadBase: 'taza',
    gramosReferencia: 200,
    densidades: { taza: 200, cda: 20, g: 1 },
    macros: { calories: 144, protein: 22, carbs: 6.5, fat: 3 }
  },
  {
    id: 'staple-jamon-pavo',
    nombre: 'Jamón de pechuga de pavo bajo en sodio',
    categoria: 'aoa',
    porcion: '2 rebanadas (40g)',
    unidadBase: 'rebanada',
    gramosReferencia: 20,
    densidades: { rebanada: 20, pieza: 20, g: 1 },
    macros: { calories: 42, protein: 7.6, carbs: 0.8, fat: 0.8 }
  },
  {
    id: 'staple-proteina-whey',
    nombre: 'Proteína Whey Isolate en polvo',
    categoria: 'suplemento',
    porcion: '1 scoop (30g)',
    unidadBase: 'scoop',
    gramosReferencia: 30,
    densidades: { scoop: 30, cda: 10, g: 1 },
    macros: { calories: 115, protein: 25, carbs: 1.5, fat: 0.8 }
  },

  // ==========================================
  // 2. CEREALES Y TUBÉRCULOS MEXICANOS
  // ==========================================
  {
    id: 'staple-tortilla-maiz',
    nombre: 'Tortilla de maíz',
    categoria: 'cereal',
    porcion: '1 pieza (30g)',
    unidadBase: 'pieza',
    gramosReferencia: 30,
    densidades: { pieza: 30, g: 1 },
    macros: { calories: 64, protein: 1.4, carbs: 13.6, fat: 0.7 }
  },
  {
    id: 'staple-tortilla-nopal',
    nombre: 'Tortilla de nopal',
    categoria: 'cereal',
    porcion: '1 pieza (25g)',
    unidadBase: 'pieza',
    gramosReferencia: 25,
    densidades: { pieza: 25, g: 1 },
    macros: { calories: 23, protein: 0.7, carbs: 4.5, fat: 0.2 }
  },
  {
    id: 'staple-tostada-horneada',
    nombre: 'Tostada de maíz horneada (Saníssimo)',
    categoria: 'cereal',
    porcion: '1 pieza (11g)',
    unidadBase: 'pieza',
    gramosReferencia: 11,
    densidades: { pieza: 11, g: 1 },
    macros: { calories: 25, protein: 0.7, carbs: 5.5, fat: 0.2 }
  },
  {
    id: 'staple-pan-integral',
    nombre: 'Pan de caja 100% integral',
    categoria: 'cereal',
    porcion: '1 rebanada (28g)',
    unidadBase: 'rebanada',
    gramosReferencia: 28,
    densidades: { rebanada: 28, pieza: 28, g: 1 },
    macros: { calories: 68, protein: 3.2, carbs: 12.5, fat: 0.9 }
  },
  {
    id: 'staple-avena',
    nombre: 'Avena en hojuelas (en seco)',
    categoria: 'cereal',
    porcion: '1/2 taza en seco (40g)',
    unidadBase: 'taza',
    gramosReferencia: 80,
    densidades: { taza: 80, cda: 10, g: 1 },
    macros: { calories: 300, protein: 10, carbs: 54, fat: 5 }
  },
  {
    id: 'staple-arroz-cocido',
    nombre: 'Arroz blanco o integral cocido',
    categoria: 'cereal',
    porcion: '1/2 taza (80g)',
    unidadBase: 'taza',
    gramosReferencia: 160,
    densidades: { taza: 160, cda: 15, g: 1 },
    macros: { calories: 210, protein: 4.4, carbs: 46, fat: 0.8 }
  },
  {
    id: 'staple-quinoa-cocida',
    nombre: 'Quinoa cocida',
    categoria: 'cereal',
    porcion: '1/2 taza (90g)',
    unidadBase: 'taza',
    gramosReferencia: 180,
    densidades: { taza: 180, cda: 18, g: 1 },
    macros: { calories: 222, protein: 8, carbs: 39, fat: 3.6 }
  },
  {
    id: 'staple-pasta-cocida',
    nombre: 'Pasta integral o tradicional cocida',
    categoria: 'cereal',
    porcion: '1/2 taza (80g)',
    unidadBase: 'taza',
    gramosReferencia: 160,
    densidades: { taza: 160, cda: 15, g: 1 },
    macros: { calories: 215, protein: 7.5, carbs: 42, fat: 1.2 }
  },
  {
    id: 'staple-papa-cocida',
    nombre: 'Papa cocida o al vapor con cáscara',
    categoria: 'cereal',
    porcion: '1 pieza mediana (120g)',
    unidadBase: 'pieza',
    gramosReferencia: 120,
    densidades: { pieza: 120, g: 1, taza: 150 },
    macros: { calories: 104, protein: 2.5, carbs: 24, fat: 0.2 }
  },
  {
    id: 'staple-camote-cocido',
    nombre: 'Camote cocido al vapor',
    categoria: 'cereal',
    porcion: '1/2 pieza (100g)',
    unidadBase: 'pieza',
    gramosReferencia: 200,
    densidades: { pieza: 200, g: 1, taza: 160 },
    macros: { calories: 172, protein: 3.2, carbs: 40, fat: 0.3 }
  },
  {
    id: 'staple-elote-desgranado',
    nombre: 'Elote blanco desgranado cocido',
    categoria: 'cereal',
    porcion: '1/2 taza (80g)',
    unidadBase: 'taza',
    gramosReferencia: 160,
    densidades: { taza: 160, cda: 15, g: 1 },
    macros: { calories: 150, protein: 5, carbs: 32, fat: 1.8 }
  },
  {
    id: 'staple-galletas-habaneras',
    nombre: 'Galletas de salvado / habaneras integrales',
    categoria: 'cereal',
    porcion: '4 piezas (28g)',
    unidadBase: 'pieza',
    gramosReferencia: 7,
    densidades: { pieza: 7, g: 1 },
    macros: { calories: 28, protein: 0.7, carbs: 5.2, fat: 0.5 }
  },

  // ==========================================
  // 3. LEGUMINOSAS MEXICANAS
  // ==========================================
  {
    id: 'staple-frijoles-olla',
    nombre: 'Frijoles negros / bayos de la olla cocidos',
    categoria: 'leguminosa',
    porcion: '1/2 taza con caldo (100g)',
    unidadBase: 'taza',
    gramosReferencia: 180,
    densidades: { taza: 180, cda: 18, g: 1 },
    macros: { calories: 230, protein: 15, carbs: 40, fat: 1 }
  },
  {
    id: 'staple-frijoles-refritos',
    nombre: 'Frijoles refritos caseros con poco aceite',
    categoria: 'leguminosa',
    porcion: '1/3 taza (75g)',
    unidadBase: 'taza',
    gramosReferencia: 220,
    densidades: { taza: 220, cda: 20, g: 1 },
    macros: { calories: 260, protein: 14, carbs: 38, fat: 6 }
  },
  {
    id: 'staple-lentejas-cocidas',
    nombre: 'Lentejas cocidas de la olla',
    categoria: 'leguminosa',
    porcion: '1/2 taza con caldo (100g)',
    unidadBase: 'taza',
    gramosReferencia: 200,
    densidades: { taza: 200, cda: 20, g: 1 },
    macros: { calories: 230, protein: 18, carbs: 40, fat: 0.8 }
  },
  {
    id: 'staple-garbanzos-cocidos',
    nombre: 'Garbanzos cocidos',
    categoria: 'leguminosa',
    porcion: '1/2 taza (90g)',
    unidadBase: 'taza',
    gramosReferencia: 180,
    densidades: { taza: 180, cda: 18, g: 1 },
    macros: { calories: 269, protein: 14.5, carbs: 45, fat: 4.2 }
  },

  // ==========================================
  // 4. GRASAS SALUDABLES Y SEMILLAS
  // ==========================================
  {
    id: 'staple-aguacate-hass',
    nombre: 'Aguacate Hass',
    categoria: 'grasa',
    porcion: '1/4 pieza (30g)',
    unidadBase: 'pieza',
    gramosReferencia: 120, // 1 aguacate mediano limpio = 120g
    densidades: { pieza: 120, cda: 15, taza: 150, g: 1 },
    macros: { calories: 192, protein: 2.4, carbs: 10.2, fat: 18 }
  },
  {
    id: 'staple-aceite-oliva',
    nombre: 'Aceite de oliva extra virgen',
    categoria: 'grasa',
    porcion: '1 cucharadita (5ml)',
    unidadBase: 'cda',
    gramosReferencia: 14,
    densidades: { cda: 14, cdta: 4.5, ml: 15, g: 1 },
    macros: { calories: 120, protein: 0, carbs: 0, fat: 13.5 }
  },
  {
    id: 'staple-aceite-aguacate',
    nombre: 'Aceite de aguacate prensado en frío',
    categoria: 'grasa',
    porcion: '1 cucharadita (5ml)',
    unidadBase: 'cda',
    gramosReferencia: 14,
    densidades: { cda: 14, cdta: 4.5, ml: 15, g: 1 },
    macros: { calories: 120, protein: 0, carbs: 0, fat: 13.5 }
  },
  {
    id: 'staple-crema-cacahuate',
    nombre: 'Crema de cacahuate sin azúcar',
    categoria: 'grasa',
    porcion: '1 cucharada (16g)',
    unidadBase: 'cda',
    gramosReferencia: 16,
    densidades: { cda: 16, cdta: 5.5, g: 1 },
    macros: { calories: 95, protein: 4, carbs: 3, fat: 8 }
  },
  {
    id: 'staple-almendras',
    nombre: 'Almendras enteras naturales',
    categoria: 'grasa',
    porcion: '10 piezas (12g)',
    unidadBase: 'pieza',
    gramosReferencia: 1.2,
    densidades: { pieza: 1.2, cda: 12, taza: 140, g: 1 },
    macros: { calories: 7, protein: 0.25, carbs: 0.25, fat: 0.6 }
  },
  {
    id: 'staple-nueces',
    nombre: 'Nueces en mitades',
    categoria: 'grasa',
    porcion: '3 mitades (10g)',
    unidadBase: 'pieza',
    gramosReferencia: 3.3,
    densidades: { pieza: 3.3, cda: 10, taza: 120, g: 1 },
    macros: { calories: 22, protein: 0.5, carbs: 0.45, fat: 2.2 }
  },
  {
    id: 'staple-chia',
    nombre: 'Semillas de chía',
    categoria: 'grasa',
    porcion: '1 cucharada (12g)',
    unidadBase: 'cda',
    gramosReferencia: 12,
    densidades: { cda: 12, cdta: 4, g: 1 },
    macros: { calories: 58, protein: 2, carbs: 5, fat: 3.7 }
  },

  // ==========================================
  // 5. VERDURAS MEXICANAS Y CONDIMENTOS
  // ==========================================
  {
    id: 'staple-nopales-cocidos',
    nombre: 'Nopales picados cocidos o asados',
    categoria: 'verdura',
    porcion: '1 taza (150g)',
    unidadBase: 'taza',
    gramosReferencia: 150,
    densidades: { taza: 150, pieza: 60, cda: 15, g: 1 },
    macros: { calories: 22, protein: 1.8, carbs: 4.5, fat: 0.2 }
  },
  {
    id: 'staple-pico-de-gallo',
    nombre: 'Pico de gallo fresco (jitomate, cebolla, cilantro)',
    categoria: 'verdura',
    porcion: '1 porción (50g)',
    unidadBase: 'porción',
    gramosReferencia: 50,
    densidades: { porción: 50, cda: 20, taza: 180, g: 1 },
    macros: { calories: 15, protein: 0.6, carbs: 3.2, fat: 0.1 }
  },
  {
    id: 'staple-salsa-taquera',
    nombre: 'Salsa taquera roja / verde casera',
    categoria: 'verdura',
    porcion: '1 porción (30g)',
    unidadBase: 'porción',
    gramosReferencia: 30,
    densidades: { porción: 30, cda: 15, taza: 200, g: 1 },
    macros: { calories: 10, protein: 0.4, carbs: 2.1, fat: 0.1 }
  },
  {
    id: 'staple-jitomate',
    nombre: 'Jitomate / Tomate picado',
    categoria: 'verdura',
    porcion: '1 pieza (120g)',
    unidadBase: 'pieza',
    gramosReferencia: 120,
    densidades: { pieza: 120, taza: 150, cda: 15, g: 1 },
    macros: { calories: 22, protein: 1, carbs: 4.8, fat: 0.2 }
  },
  {
    id: 'staple-cebolla',
    nombre: 'Cebolla blanca picada',
    categoria: 'verdura',
    porcion: '1/4 pieza (30g)',
    unidadBase: 'pieza',
    gramosReferencia: 120,
    densidades: { pieza: 120, cda: 15, taza: 150, g: 1 },
    macros: { calories: 48, protein: 1.3, carbs: 11, fat: 0.1 }
  },
  {
    id: 'staple-lechuga',
    nombre: 'Hojas de lechuga orejona / romana',
    categoria: 'verdura',
    porcion: '3 hojas grandes (60g)',
    unidadBase: 'pieza',
    gramosReferencia: 20,
    densidades: { pieza: 20, taza: 45, g: 1 },
    macros: { calories: 3, protein: 0.3, carbs: 0.6, fat: 0.05 }
  },
  {
    id: 'staple-espinacas',
    nombre: 'Espinacas frescas',
    categoria: 'verdura',
    porcion: '2 tazas crudas (60g)',
    unidadBase: 'taza',
    gramosReferencia: 30,
    densidades: { taza: 30, g: 1 },
    macros: { calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1 }
  },
  {
    id: 'staple-calabacita',
    nombre: 'Calabacita italiana cocida o cruda',
    categoria: 'verdura',
    porcion: '1 pieza mediana (120g)',
    unidadBase: 'pieza',
    gramosReferencia: 120,
    densidades: { pieza: 120, taza: 140, g: 1 },
    macros: { calories: 20, protein: 1.4, carbs: 3.8, fat: 0.4 }
  },
  {
    id: 'staple-chayote',
    nombre: 'Chayote cocido en cubos',
    categoria: 'verdura',
    porcion: '1/2 pieza (100g)',
    unidadBase: 'pieza',
    gramosReferencia: 200,
    densidades: { pieza: 200, taza: 150, g: 1 },
    macros: { calories: 38, protein: 1.6, carbs: 9, fat: 0.2 }
  },
  {
    id: 'staple-pepino',
    nombre: 'Pepino rebanado con cáscara',
    categoria: 'verdura',
    porcion: '1 taza rebanada (120g)',
    unidadBase: 'taza',
    gramosReferencia: 120,
    densidades: { taza: 120, pieza: 200, g: 1 },
    macros: { calories: 18, protein: 0.8, carbs: 4.3, fat: 0.1 }
  },
  {
    id: 'staple-zanahoria',
    nombre: 'Zanahoria rallada o en rodajas',
    categoria: 'verdura',
    porcion: '1/2 taza (60g)',
    unidadBase: 'taza',
    gramosReferencia: 120,
    densidades: { taza: 120, pieza: 80, g: 1 },
    macros: { calories: 50, protein: 1.1, carbs: 11.5, fat: 0.3 }
  },
  {
    id: 'staple-brocoli',
    nombre: 'Brócoli al vapor',
    categoria: 'verdura',
    porcion: '1 taza cocida (150g)',
    unidadBase: 'taza',
    gramosReferencia: 150,
    densidades: { taza: 150, pieza: 250, g: 1 },
    macros: { calories: 52, protein: 3.8, carbs: 10.2, fat: 0.6 }
  },
  {
    id: 'staple-champinones',
    nombre: 'Champiñones rebanados cocidos o crudos',
    categoria: 'verdura',
    porcion: '1 taza (100g)',
    unidadBase: 'taza',
    gramosReferencia: 100,
    densidades: { taza: 100, cda: 15, g: 1 },
    macros: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 }
  },

  // ==========================================
  // 6. FRUTAS FRESCAS
  // ==========================================
  {
    id: 'staple-manzana',
    nombre: 'Manzana verde o roja',
    categoria: 'fruta',
    porcion: '1 pieza mediana (140g)',
    unidadBase: 'pieza',
    gramosReferencia: 140,
    densidades: { pieza: 140, taza: 125, g: 1 },
    macros: { calories: 72, protein: 0.4, carbs: 19, fat: 0.2 }
  },
  {
    id: 'staple-platano',
    nombre: 'Plátano / Banano',
    categoria: 'fruta',
    porcion: '1/2 pieza (60g)',
    unidadBase: 'pieza',
    gramosReferencia: 120,
    densidades: { pieza: 120, taza: 150, g: 1 },
    macros: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 }
  },
  {
    id: 'staple-fresas',
    nombre: 'Fresas frescas',
    categoria: 'fruta',
    porcion: '1 taza entera (150g)',
    unidadBase: 'taza',
    gramosReferencia: 150,
    densidades: { taza: 150, pieza: 15, g: 1 },
    macros: { calories: 48, protein: 1, carbs: 11.5, fat: 0.5 }
  },
  {
    id: 'staple-papaya',
    nombre: 'Papaya picada en cubos',
    categoria: 'fruta',
    porcion: '1 taza en cubos (140g)',
    unidadBase: 'taza',
    gramosReferencia: 140,
    densidades: { taza: 140, g: 1 },
    macros: { calories: 55, protein: 0.7, carbs: 13.8, fat: 0.2 }
  },
  {
    id: 'staple-pina',
    nombre: 'Piña picada en cubos',
    categoria: 'fruta',
    porcion: '3/4 taza (120g)',
    unidadBase: 'taza',
    gramosReferencia: 160,
    densidades: { taza: 160, rebanada: 80, g: 1 },
    macros: { calories: 80, protein: 0.9, carbs: 21, fat: 0.2 }
  },
  {
    id: 'staple-melon',
    nombre: 'Melón picado',
    categoria: 'fruta',
    porcion: '1 taza (160g)',
    unidadBase: 'taza',
    gramosReferencia: 160,
    densidades: { taza: 160, g: 1 },
    macros: { calories: 54, protein: 1.3, carbs: 13, fat: 0.3 }
  },
  {
    id: 'staple-sandia',
    nombre: 'Sandía en cubos',
    categoria: 'fruta',
    porcion: '1 taza (150g)',
    unidadBase: 'taza',
    gramosReferencia: 150,
    densidades: { taza: 150, rebanada: 120, g: 1 },
    macros: { calories: 45, protein: 0.9, carbs: 11.5, fat: 0.2 }
  },
  {
    id: 'staple-naranja',
    nombre: 'Naranja en gajos',
    categoria: 'fruta',
    porcion: '1 pieza mediana (150g)',
    unidadBase: 'pieza',
    gramosReferencia: 150,
    densidades: { pieza: 150, taza: 180, g: 1 },
    macros: { calories: 65, protein: 1.3, carbs: 16, fat: 0.2 }
  },
  {
    id: 'staple-frutos-rojos',
    nombre: 'Frutos rojos mixtos (arándanos, frambuesas, moras)',
    categoria: 'fruta',
    porcion: '3/4 taza (100g)',
    unidadBase: 'taza',
    gramosReferencia: 140,
    densidades: { taza: 140, cda: 15, g: 1 },
    macros: { calories: 57, protein: 1, carbs: 14, fat: 0.5 }
  },

  // ==========================================
  // 7. LÁCTEOS Y BEBIDAS VEGETALES
  // ==========================================
  {
    id: 'staple-leche-deslactosada',
    nombre: 'Leche deslactosada light',
    categoria: 'lacteo',
    porcion: '1 taza (240ml)',
    unidadBase: 'taza',
    gramosReferencia: 240,
    densidades: { taza: 240, ml: 1, cda: 15, g: 1 },
    macros: { calories: 95, protein: 8.5, carbs: 12, fat: 1.5 }
  },
  {
    id: 'staple-yogurt-griego',
    nombre: 'Yogurt griego natural sin azúcar (Chobani/Fage 0%)',
    categoria: 'lacteo',
    porcion: '3/4 taza (150g)',
    unidadBase: 'taza',
    gramosReferencia: 200,
    densidades: { taza: 200, cda: 20, g: 1 },
    macros: { calories: 118, protein: 20, carbs: 7.2, fat: 0.8 }
  },
  {
    id: 'staple-leche-almendras',
    nombre: 'Leche de almendras sin azúcar (Silk/Nature\'s Heart)',
    categoria: 'lacteo',
    porcion: '1 taza (240ml)',
    unidadBase: 'taza',
    gramosReferencia: 240,
    densidades: { taza: 240, ml: 1, cda: 15, g: 1 },
    macros: { calories: 35, protein: 1, carbs: 1.5, fat: 2.5 }
  },
  {
    id: 'staple-leche-soya',
    nombre: 'Leche de soya sin azúcar',
    categoria: 'lacteo',
    porcion: '1 taza (240ml)',
    unidadBase: 'taza',
    gramosReferencia: 240,
    densidades: { taza: 240, ml: 1, cda: 15, g: 1 },
    macros: { calories: 80, protein: 7, carbs: 4, fat: 4 }
  }
];

export class IngredientSearchService {
  /**
   * Normaliza un nombre de unidad a su clave estándar:
   * 'g' | 'pieza' | 'taza' | 'cda' | 'cdta' | 'rebanada' | 'scoop' | 'lata' | 'ml' | 'porción'
   */
  static normalizeUnitKey(rawUnit: string): string {
    if (!rawUnit) return 'porción';
    const u = rawUnit.toLowerCase().trim();

    if (u === 'g' || u === 'gr' || u === 'grs' || u === 'gramo' || u === 'gramos') return 'g';
    if (u === 'ml' || u === 'mililitro' || u === 'mililitros' || u === 'cc') return 'ml';
    if (u === 'pieza' || u === 'piezas' || u === 'pza' || u === 'pzas' || u === 'unidad' || u === 'unidades') return 'pieza';
    if (u === 'taza' || u === 'tazas' || u === 'tz' || u === 'cup' || u === 'cups') return 'taza';
    if (u === 'cda' || u === 'cdas' || u === 'cucharada' || u === 'cucharadas' || u === 'tbsp' || u === 'tablespoon') return 'cda';
    if (u === 'cdta' || u === 'cdtas' || u === 'cdita' || u === 'cditas' || u === 'cucharadita' || u === 'cucharaditas' || u === 'tsp' || u === 'teaspoon') return 'cdta';
    if (u === 'rebanada' || u === 'rebanadas' || u === 'slice' || u === 'slices') return 'rebanada';
    if (u === 'scoop' || u === 'scoops' || u === 'medida' || u === 'medidas') return 'scoop';
    if (u === 'lata' || u === 'latas' || u === 'can' || u === 'cans') return 'lata';
    if (u === 'porcion' || u === 'porción' || u === 'porciones' || u === 'serving' || u === 'servings') return 'porción';

    return u;
  }

  /**
   * Busca un alimento de referencia en el catálogo SMAE mexicano.
   */
  static findStapleMatch(foodName: string): SmaeStapleItem | undefined {
    if (!foodName) return undefined;
    const q = foodName.toLowerCase().trim();

    // Coincidencia exacta o contenida directa
    const exact = BASE_MEXICAN_STAPLES.find(s => 
      s.nombre.toLowerCase() === q ||
      s.id.toLowerCase() === q
    );
    if (exact) return exact;

    // Coincidencia parcial con palabras clave comunes
    return BASE_MEXICAN_STAPLES.find(s => {
      const sName = s.nombre.toLowerCase();
      // Casos específicos frecuentes
      if (q.includes('aguacate') && sName.includes('aguacate')) return true;
      if (q.includes('tortilla') && sName.includes('tortilla de maíz')) return true;
      if ((q.includes('pechuga') || q.includes('pollo')) && sName.includes('pechuga')) return true;
      if (q.includes('arroz') && sName.includes('arroz')) return true;
      if (q.includes('frijol') && sName.includes('frijol')) return true;
      if (q.includes('avena') && sName.includes('avena')) return true;
      if (q.includes('huevo') && !q.includes('clara') && sName.includes('huevo entero')) return true;
      if (q.includes('clara') && sName.includes('clara')) return true;
      if (q.includes('atún') || q.includes('atun')) return sName.includes('atún');
      if (q.includes('panela') && sName.includes('panela')) return true;
      if (q.includes('oliva') && sName.includes('oliva')) return true;
      if (q.includes('proteina') || q.includes('whey') || q.includes('proteína')) return sName.includes('proteína');
      if (q.includes('nopal') && sName.includes('nopal')) return true;
      if (q.includes('pico de gallo') && sName.includes('pico de gallo')) return true;
      if (q.includes('salsa') && sName.includes('salsa')) return true;
      return sName.includes(q) || q.includes(sName);
    });
  }

  /**
   * Obtiene los gramos correspondientes a 1 unidad dada para un alimento.
   * Si no se conoce el alimento, utiliza densidades culinarias estándar internacionales.
   */
  static getGramsPerUnit(unitKey: string, foodName?: string): number {
    const norm = this.normalizeUnitKey(unitKey);
    const staple = foodName ? this.findStapleMatch(foodName) : undefined;

    if (staple && staple.densidades && staple.densidades[norm]) {
      return staple.densidades[norm];
    }

    // Densidades culinarias estándar por defecto
    switch (norm) {
      case 'g': return 1;
      case 'ml': return 1;
      case 'taza': return 160;
      case 'cda': return 15;
      case 'cdta': return 5;
      case 'pieza': return 50;
      case 'rebanada': return 30;
      case 'scoop': return 30;
      case 'lata': return 100;
      case 'porción': return 50;
      default: return 50;
    }
  }

  /**
   * Convierte la cantidad entre dos unidades (ej. de 'pieza' a 'g', o de 'taza' a 'cda')
   * asegurando que la masa en gramos se preserve exactamente.
   */
  static convertIngredientUnit(
    cantidad: number,
    fromUnit: string,
    toUnit: string,
    foodName?: string
  ): { newCantidad: number; totalGrams: number } {
    const normFrom = this.normalizeUnitKey(fromUnit);
    const normTo = this.normalizeUnitKey(toUnit);

    const fromFactor = this.getGramsPerUnit(normFrom, foodName);
    const toFactor = this.getGramsPerUnit(normTo, foodName);

    const totalGrams = (cantidad || 1) * fromFactor;
    let newQty = totalGrams / toFactor;

    // Redondear inteligentemente
    if (normTo === 'g' || normTo === 'ml') {
      newQty = Math.round(newQty);
    } else if (normTo === 'pieza' || normTo === 'taza' || normTo === 'scoop') {
      newQty = +(newQty.toFixed(2));
      // Redondear a cuartos comunes si está muy cerca
      const frac = newQty - Math.floor(newQty);
      if (Math.abs(frac - 0.25) < 0.03) newQty = Math.floor(newQty) + 0.25;
      else if (Math.abs(frac - 0.33) < 0.03) newQty = Math.floor(newQty) + 0.33;
      else if (Math.abs(frac - 0.5) < 0.03) newQty = Math.floor(newQty) + 0.5;
      else if (Math.abs(frac - 0.75) < 0.03) newQty = Math.floor(newQty) + 0.75;
    } else {
      newQty = +(newQty.toFixed(1));
    }

    return {
      newCantidad: Math.max(0.05, newQty),
      totalGrams: Math.round(totalGrams)
    };
  }

  /**
   * Calcula el peso total estimado en gramos para un ingrediente dado.
   */
  static calculateIngredientGrams(cantidad: number, unidad: string, foodName?: string): number {
    const norm = this.normalizeUnitKey(unidad);
    const factor = this.getGramsPerUnit(norm, foodName);
    return Math.round((cantidad || 1) * factor);
  }

  /**
   * Formatea un número como fracción natural (1/4, 1/3, 1/2, 2/3, 3/4, 1 1/2)
   * o entero/decimal legible para nutriólogos y pacientes.
   */
  static formatQuantityHuman(qty: number): string {
    if (!qty || isNaN(qty) || qty <= 0) return '1';

    // Entero exacto o muy cercano
    if (Math.abs(qty - Math.round(qty)) < 0.04) {
      return String(Math.round(qty));
    }

    const intPart = Math.floor(qty);
    const frac = +(qty - intPart).toFixed(3);

    let fracStr = '';
    if (frac >= 0.18 && frac <= 0.28) fracStr = '1/4';
    else if (frac > 0.28 && frac <= 0.40) fracStr = '1/3';
    else if (frac > 0.40 && frac <= 0.60) fracStr = '1/2';
    else if (frac > 0.60 && frac <= 0.71) fracStr = '2/3';
    else if (frac > 0.71 && frac <= 0.85) fracStr = '3/4';

    if (fracStr) {
      return intPart > 0 ? `${intPart} ${fracStr}` : fracStr;
    }

    // Decimal legible con 1 o 2 dígitos
    return String(+(qty.toFixed(1)));
  }

  /**
   * Devuelve el texto pluralizado natural de la unidad según la cantidad.
   */
  static getPluralizedUnit(unitKey: string, qty: number): string {
    const norm = this.normalizeUnitKey(unitKey);
    const isPlural = qty > 1.05;

    switch (norm) {
      case 'g': return 'g';
      case 'ml': return 'ml';
      case 'pieza': return isPlural ? 'piezas' : 'pieza';
      case 'taza': return isPlural ? 'tazas' : 'taza';
      case 'cda': return isPlural ? 'cucharadas' : 'cucharada';
      case 'cdta': return isPlural ? 'cucharaditas' : 'cucharadita';
      case 'rebanada': return isPlural ? 'rebanadas' : 'rebanada';
      case 'scoop': return isPlural ? 'scoops' : 'scoop';
      case 'lata': return isPlural ? 'latas' : 'lata';
      case 'porción': return isPlural ? 'porciones' : 'porción';
      default: return norm;
    }
  }

  /**
   * Genera el string formateado limpio, profesional y legible del ingrediente.
   * NUNCA genera cadenas duplicadas como "0.5 1 scoop (30g)" o "4 1 pieza (30g)".
   * 
   * Ejemplos de salida:
   * - "4 piezas (120g) Tortilla de maíz"
   * - "1/4 pieza (30g) Aguacate Hass"
   * - "1/2 scoop (15g) Proteína Whey Isolate en polvo"
   * - "1 taza (160g) Arroz blanco o integral cocido"
   * - "130 g Pechuga de pollo cocida"
   * - "1 porción Pico de gallo"
   */
  static formatIngredientDisplay(ing: {
    nombre: string;
    cantidad: number;
    unidad: string;
    gramosEquivalentes?: number;
  }): string {
    const qty = ing.cantidad || 1;
    // Sanitizar unidad: remover cualquier número o paréntesis remanente en la unidad
    const cleanUnit = this.normalizeUnitKey(ing.unidad.replace(/[\d/.,()]+|\b(g|ml|gr|gramos)\b/gi, '').trim() || ing.unidad);
    const name = ing.nombre.trim();

    // Gramos totales
    const grams = ing.gramosEquivalentes || this.calculateIngredientGrams(qty, cleanUnit, name);

    // Caso 1: Unidades de peso y volumen directas (g, ml)
    if (cleanUnit === 'g') {
      return `${Math.round(qty)} g ${name}`;
    }
    if (cleanUnit === 'ml') {
      return `${Math.round(qty)} ml ${name}`;
    }

    // Caso 2: Porción genérica sin gramaje obligatorio (salsas, especias)
    if (cleanUnit === 'porción') {
      const pQty = this.formatQuantityHuman(qty);
      const uStr = this.getPluralizedUnit(cleanUnit, qty);
      return `${pQty} ${uStr} ${name}`;
    }

    // Caso 3: Medidas caseras (pieza, taza, cda, cdta, scoop, lata, rebanada)
    const qtyStr = this.formatQuantityHuman(qty);
    const unitStr = this.getPluralizedUnit(cleanUnit, qty);
    const gramTag = grams > 0 ? ` (${grams}g)` : '';

    return `${qtyStr} ${unitStr}${gramTag} ${name}`;
  }

  /**
   * Sanitiza y analiza cualquier texto de ingrediente, incluyendo cadenas ya corruptas
   * con prefijos dobles como:
   * - "0.5 1 scoop (30g) Proteína Whey Isolate en polvo" -> qty: 0.5, unit: 'scoop', name: 'Proteína Whey...'
   * - "4 1 pieza (30g) Tortilla de maíz" -> qty: 4, unit: 'pieza', name: 'Tortilla de maíz'
   * - "2 1/2 taza (80g) Arroz blanco..." -> qty: 1, unit: 'taza', name: 'Arroz blanco...'
   * - "0.2 pieza aguacate hass" -> qty: 0.25, unit: 'pieza', name: 'Aguacate Hass'
   * - "130 g pechuga de pollo cocida" -> qty: 130, unit: 'g', name: 'pechuga de pollo cocida'
   */
  static parseIngredientString(rawStr: string): { cantidad: number; unidad: string; nombre: string; gramosEquivalentes: number } {
    let str = rawStr.trim();
    if (!str) {
      return { cantidad: 1, unidad: 'porción', nombre: '', gramosEquivalentes: 50 };
    }

    // 1. Detectar y corregir el error clásico de doble número: ej. "0.5 1 scoop", "4 1 pieza", "2 1/2 taza"
    const doubleNumberMatch = str.match(/^([\d/.,]+)\s+([\d/.,]+)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?(?:\s*\([\d.,]+[a-zA-Z]*\))?\s*(?:de\s+)?(.*)$/i);
    if (doubleNumberMatch) {
      const outerNum = this.parseFractionOrDecimal(doubleNumberMatch[1]);
      const innerNum = this.parseFractionOrDecimal(doubleNumberMatch[2]);
      const rawUnit = doubleNumberMatch[3] || 'porción';
      const cleanName = doubleNumberMatch[4] || '';

      const unitKey = this.normalizeUnitKey(rawUnit);
      // Si la unidad interna era ej. 1 scoop, multiplicar outerNum * innerNum (ej 0.5 * 1 = 0.5)
      // Si era 2 1/2 taza -> 2 * 0.5 = 1 taza
      const finalQty = +(outerNum * innerNum).toFixed(2);
      const grams = this.calculateIngredientGrams(finalQty, unitKey, cleanName);

      return {
        cantidad: finalQty,
        unidad: unitKey,
        nombre: cleanName.replace(/^de\s+/i, '').trim(),
        gramosEquivalentes: grams
      };
    }

    // 2. Detectar fracciones iniciales: ej. "1/4 pieza", "1/2 taza (80g)", "1/3 aguacate"
    const fractionStartMatch = str.match(/^(\d+)\/(\d+)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?(?:\s*\([\d.,]+[a-zA-Z]*\))?\s*(?:de\s+)?(.*)$/i);
    if (fractionStartMatch) {
      const num = parseInt(fractionStartMatch[1], 10);
      const den = parseInt(fractionStartMatch[2], 10);
      const qty = +(num / den).toFixed(2);
      const possibleUnit = fractionStartMatch[3] ? this.normalizeUnitKey(fractionStartMatch[3]) : 'pieza';
      const cleanName = fractionStartMatch[4] || '';

      // Si el possibleUnit es en realidad parte del nombre (ej. "1/3 aguacate")
      const isKnownUnit = ['pieza', 'taza', 'cda', 'cdta', 'rebanada', 'scoop', 'lata', 'porción', 'g', 'ml'].includes(possibleUnit);
      const finalUnit = isKnownUnit ? possibleUnit : 'pieza';
      const finalName = isKnownUnit ? cleanName : `${fractionStartMatch[3] || ''} ${cleanName}`.trim();

      const grams = this.calculateIngredientGrams(qty, finalUnit, finalName);
      return {
        cantidad: qty,
        unidad: finalUnit,
        nombre: finalName.replace(/^de\s+/i, '').trim(),
        gramosEquivalentes: grams
      };
    }

    // 3. Detectar número decimal/entero con unidad: ej. "130 g pechuga", "4 piezas tortilla", "0.2 pieza aguacate"
    const standardMatch = str.match(/^([\d.,]+)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?(?:\s*\([\d.,]+[a-zA-Z]*\))?\s*(?:de\s+)?(.*)$/i);
    if (standardMatch) {
      let qty = parseFloat(standardMatch[1].replace(',', '.')) || 1;
      const rawUnit = standardMatch[2] || '';
      const unitKey = this.normalizeUnitKey(rawUnit);
      let rest = standardMatch[3] || '';

      // Tratamiento especial para 0.2 / 0.33 pieza de aguacate
      if ((rest.toLowerCase().includes('aguacate') || rawUnit.toLowerCase().includes('aguacate')) && unitKey === 'pieza' && qty < 0.35) {
        qty = 0.25; // Normalizar a 1/4 de pieza clínica
      }

      const isKnownUnit = ['pieza', 'taza', 'cda', 'cdta', 'rebanada', 'scoop', 'lata', 'porción', 'g', 'ml'].includes(unitKey);
      const finalUnit = isKnownUnit ? unitKey : 'porción';
      const finalName = isKnownUnit ? rest : `${rawUnit} ${rest}`.trim();

      const grams = this.calculateIngredientGrams(qty, finalUnit, finalName);
      return {
        cantidad: qty,
        unidad: finalUnit,
        nombre: finalName.replace(/^de\s+/i, '').trim(),
        gramosEquivalentes: grams
      };
    }

    // 4. Texto libre sin número (ej. "Pico de gallo", "Salsa taquera")
    const staple = this.findStapleMatch(str);
    const defaultUnit = staple ? staple.unidadBase : 'porción';
    const defaultGrams = staple ? staple.gramosReferencia : 50;

    return {
      cantidad: 1,
      unidad: defaultUnit,
      nombre: str,
      gramosEquivalentes: defaultGrams
    };
  }

  private static parseFractionOrDecimal(val: string): number {
    if (!val) return 1;
    if (val.includes('/')) {
      const parts = val.split('/');
      const n = parseFloat(parts[0]);
      const d = parseFloat(parts[1]);
      return d > 0 ? n / d : 1;
    }
    return parseFloat(val.replace(',', '.')) || 1;
  }

  /**
   * Traduce y normaliza textos en inglés y descripciones devueltas por FatSecret
   * a terminología culinaria y médica de México.
   */
  static normalizeFatSecretServing(description: string): string {
    if (!description) return '1 porción';

    let clean = description
      .replace(/^Per\s+/i, '')
      .replace(/^Por\s+/i, '')
      .replace(/\s*-\s*Calories:.*$/i, '')
      .replace(/\s*-\s*Calor[íi]as:.*$/i, '')
      .trim();

    // Traducciones directas de unidades en inglés
    clean = clean
      .replace(/\b1\s*cup\b/gi, '1 taza (240ml)')
      .replace(/\b1\/2\s*cup\b/gi, '1/2 taza (120ml)')
      .replace(/\b1\/4\s*cup\b/gi, '1/4 taza (60ml)')
      .replace(/\b1\s*tbsp\b|\b1\s*tablespoon\b/gi, '1 cucharada (15ml)')
      .replace(/\b1\s*tsp\b|\b1\s*teaspoon\b/gi, '1 cucharadita (5ml)')
      .replace(/\b1\s*slice\b/gi, '1 rebanada')
      .replace(/\b1\s*item\b|\b1\s*piece\b/gi, '1 pieza')
      .replace(/\b1\s*oz\b/gi, '28 g (1 oz)')
      .replace(/\b1\s*fl\s*oz\b/gi, '30 ml')
      .replace(/\b1\s*can\b/gi, '1 lata')
      .replace(/\b1\s*scoop\b/gi, '1 scoop (30g)')
      .replace(/\b1\s*serving\b/gi, '1 porción');

    return clean;
  }

  /**
   * Traduce nombres comunes de alimentos en inglés a español mexicano.
   */
  static translateFoodName(englishName: string): string {
    const n = englishName.toLowerCase().trim();
    const dictionary: Record<string, string> = {
      'chicken breast': 'Pechuga de pollo',
      'cooked chicken breast': 'Pechuga de pollo cocida',
      'egg': 'Huevo entero',
      'eggs': 'Huevos enteros',
      'egg white': 'Clara de huevo',
      'egg whites': 'Claras de huevo',
      'oats': 'Avena en hojuelas',
      'oatmeal': 'Avena cocida',
      'corn tortilla': 'Tortilla de maíz',
      'avocado': 'Aguacate Hass',
      'white rice': 'Arroz blanco',
      'brown rice': 'Arroz integral',
      'black beans': 'Frijoles negros',
      'banana': 'Plátano',
      'apple': 'Manzana',
      'strawberries': 'Fresas',
      'spinach': 'Espinacas',
      'lettuce': 'Lechuga',
      'tomato': 'Jitomate',
      'onion': 'Cebolla',
      'tuna': 'Atún en agua',
      'salmon': 'Salmón fresco',
      'olive oil': 'Aceite de oliva',
      'peanut butter': 'Crema de cacahuate',
      'cottage cheese': 'Queso cottage light',
      'whey protein': 'Proteína Whey en polvo'
    };

    return dictionary[n] || englishName;
  }

  /**
   * Búsqueda híbrida de 3 niveles:
   * 1. Alimentos guardados por la nutrióloga en su Firestore (`useFoodsStore`).
   * 2. Catálogo oficial SMAE México (80+ alimentos de consumo clínico diario).
   * 3. FatSecret API externa (con traducción y normalización a medidas de México).
   */
  static async searchIngredients(query: string): Promise<IngredientSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return BASE_MEXICAN_STAPLES.slice(0, 15).map(s => ({
        id: s.id,
        nombre: s.nombre,
        porcion: s.porcion,
        unidadBase: s.unidadBase,
        gramosReferencia: s.gramosReferencia,
        categoria: s.categoria,
        fuente: 'smae',
        macros: s.macros
      }));
    }

    const results: IngredientSearchResult[] = [];
    const seenNames = new Set<string>();

    // -------------------------------------------------------------
    // Nivel 1: Alimentos personalizados guardados en Firestore
    // -------------------------------------------------------------
    try {
      const foodsStore = useFoodsStore();
      const localMatches = foodsStore.searchMyFoods(q);
      localMatches.forEach(f => {
        const normKey = f.name.toLowerCase().trim();
        seenNames.add(normKey);
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
    } catch (e) {
      // Ignore store errors in tests or unmounted context
    }

    // -------------------------------------------------------------
    // Nivel 2: Catálogo Oficial Mexicano (SMAE)
    // -------------------------------------------------------------
    const stapleMatches = BASE_MEXICAN_STAPLES.filter(s => {
      const sName = s.nombre.toLowerCase();
      return sName.includes(q) || q.split(' ').every(word => sName.includes(word));
    });

    stapleMatches.forEach(s => {
      const normKey = s.nombre.toLowerCase().trim();
      if (!seenNames.has(normKey)) {
        seenNames.add(normKey);
        results.push({
          id: s.id,
          nombre: s.nombre,
          porcion: s.porcion,
          unidadBase: s.unidadBase,
          gramosReferencia: s.gramosReferencia,
          categoria: s.categoria,
          fuente: 'smae',
          macros: s.macros
        });
      }
    });

    // -------------------------------------------------------------
    // Nivel 3: FatSecret API Proxy (Normalizado y Traducido)
    // -------------------------------------------------------------
    try {
      this.lastFatSecretError = null;
      const fatSecretResults = await searchFoods(q, 15);
      for (const fsItem of fatSecretResults) {
        let displayName = fsItem.name;
        // Si no trae la marca en el nombre pero sí en el atributo brand, enriquecerlo
        if (fsItem.brand && !displayName.toLowerCase().includes(fsItem.brand.toLowerCase())) {
          displayName = `${displayName} (${fsItem.brand})`;
        }
        const translatedName = this.translateFoodName(displayName);
        const normKey = translatedName.toLowerCase().trim();

        if (!seenNames.has(normKey)) {
          seenNames.add(normKey);
          const cleanPortion = this.normalizeFatSecretServing(fsItem.description);
          results.push({
            id: fsItem.id.startsWith('fs') ? fsItem.id : `fs_${fsItem.id}`,
            nombre: translatedName,
            porcion: cleanPortion,
            brand: fsItem.brand,
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
    } catch (err: any) {
      console.warn('[IngredientSearchService] Error en FatSecret:', err?.message || err);
      this.lastFatSecretError = err?.message || 'Error consultando FatSecret';
    }

    return results;
  }

  static lastFatSecretError: string | null = null;

  /**
   * Guarda automáticamente alimentos seleccionados de FatSecret en la BD
   * de Firestore de la nutrióloga para acceso instantáneo y offline futuro.
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
      item.fuente = 'local';
    } catch (err) {
      console.error('[IngredientSearchService] Error guardando en Firestore:', err);
    }
  }

  /**
   * Asegura que un platillo tenga un desglose estructurado de DishIngredient[]
   * Si ya los tiene, los sanitiza y repara. Si solo tiene string[] de ingredientes,
   * los parsea limpiamente sin duplicaciones numéricas.
   */
  static ensureDishIngredients(dish: DishItem): DishIngredient[] {
    if (dish.ingredientesDetalle && dish.ingredientesDetalle.length > 0) {
      return dish.ingredientesDetalle.map(ing => {
        const cleanUnit = this.normalizeUnitKey(ing.unidad);
        const totalGrams = ing.gramosEquivalentes || this.calculateIngredientGrams(ing.cantidad, cleanUnit, ing.nombre);
        return {
          ...ing,
          unidad: cleanUnit,
          gramosEquivalentes: totalGrams,
          baseMacros: ing.baseMacros || {
            calories: Math.round(ing.macros.calories / (ing.cantidad || 1)),
            protein: +(ing.macros.protein / (ing.cantidad || 1)).toFixed(1),
            carbs: +(ing.macros.carbs / (ing.cantidad || 1)).toFixed(1),
            fat: +(ing.macros.fat / (ing.cantidad || 1)).toFixed(1)
          }
        };
      });
    }

    const stringList = dish.ingredientes || [];
    if (stringList.length === 0) {
      return [{
        id: `ing_${Date.now()}`,
        nombre: dish.nombre,
        cantidad: 1,
        unidad: 'porción',
        gramosEquivalentes: 100,
        macros: { ...dish.macros },
        baseMacros: { ...dish.macros }
      }];
    }

    const count = stringList.length;
    return stringList.map((ingStr, idx) => {
      const parsed = this.parseIngredientString(ingStr);
      const staple = this.findStapleMatch(parsed.nombre);

      let itemMacros = {
        calories: Math.round(dish.macros.calories / count),
        protein: Math.round(dish.macros.protein / count),
        carbs: Math.round(dish.macros.carbs / count),
        fat: Math.round(dish.macros.fat / count)
      };

      if (staple) {
        const factor = (parsed.gramosEquivalentes || 100) / (staple.gramosReferencia || 100);
        itemMacros = {
          calories: Math.round(staple.macros.calories * factor),
          protein: +(staple.macros.protein * factor).toFixed(1),
          carbs: +(staple.macros.carbs * factor).toFixed(1),
          fat: +(staple.macros.fat * factor).toFixed(1)
        };
      }

      return {
        id: `ing_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nombre: parsed.nombre,
        cantidad: parsed.cantidad,
        unidad: parsed.unidad,
        gramosEquivalentes: parsed.gramosEquivalentes,
        macros: itemMacros,
        baseMacros: {
          calories: Math.round(itemMacros.calories / (parsed.cantidad || 1)),
          protein: +(itemMacros.protein / (parsed.cantidad || 1)).toFixed(1),
          carbs: +(itemMacros.carbs / (parsed.cantidad || 1)).toFixed(1),
          fat: +(itemMacros.fat / (parsed.cantidad || 1)).toFixed(1)
        }
      };
    });
  }
}
