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
 * 190+ alimentos de consumo diario en México con porciones clínicas estandarizadas,
 * equivalencias exactas en gramos y densidades por unidad para conversión interactiva.
 */
export const BASE_MEXICAN_STAPLES: SmaeStapleItem[] = [
  {
    "id": "staple-pechuga-pollo",
    "nombre": "Pechuga de pollo a la plancha / cocida",
    "categoria": "aoa",
    "porcion": "1 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "g": 1,
      "taza": 140,
      "cda": 15,
      "porción": 100
    },
    "macros": {
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  },
  {
    "id": "staple-pechuga-deshebrada",
    "nombre": "Pechuga de pollo deshebrada",
    "categoria": "aoa",
    "porcion": "1 porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "taza": 130,
      "cda": 15,
      "g": 1,
      "pieza": 100
    },
    "macros": {
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  },
  {
    "id": "staple-muslo-pollo",
    "nombre": "Muslo de pollo cocido sin piel ni hueso",
    "categoria": "aoa",
    "porcion": "1 pieza (90g)",
    "unidadBase": "pieza",
    "gramosReferencia": 90,
    "densidades": {
      "pieza": 90,
      "porción": 100,
      "g": 1
    },
    "macros": {
      "calories": 140,
      "protein": 22,
      "carbs": 0,
      "fat": 5.5
    }
  },
  {
    "id": "staple-milanesa-pollo",
    "nombre": "Milanesa de pechuga de pollo a la plancha",
    "categoria": "aoa",
    "porcion": "1 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "porción": 100,
      "g": 1
    },
    "macros": {
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  },
  {
    "id": "staple-pechuga-pavo-horneada",
    "nombre": "Pechuga de pavo horneada natural",
    "categoria": "aoa",
    "porcion": "1 porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "rebanada": 30,
      "g": 1
    },
    "macros": {
      "calories": 135,
      "protein": 30,
      "carbs": 0,
      "fat": 1.5
    }
  },
  {
    "id": "staple-huevo-entero",
    "nombre": "Huevo entero",
    "categoria": "aoa",
    "porcion": "1 pieza (50g)",
    "unidadBase": "pieza",
    "gramosReferencia": 50,
    "densidades": {
      "pieza": 50,
      "g": 1
    },
    "macros": {
      "calories": 74,
      "protein": 6.3,
      "carbs": 0.4,
      "fat": 5
    }
  },
  {
    "id": "staple-clara-huevo",
    "nombre": "Clara de huevo",
    "categoria": "aoa",
    "porcion": "1 pieza (33g)",
    "unidadBase": "pieza",
    "gramosReferencia": 33,
    "densidades": {
      "pieza": 33,
      "g": 1,
      "ml": 33,
      "taza": 240
    },
    "macros": {
      "calories": 17,
      "protein": 3.6,
      "carbs": 0.2,
      "fat": 0
    }
  },
  {
    "id": "staple-clara-liquida",
    "nombre": "Clara de huevo líquida pasteurizada",
    "categoria": "aoa",
    "porcion": "1/2 taza (120ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "g": 1
    },
    "macros": {
      "calories": 120,
      "protein": 26,
      "carbs": 1.5,
      "fat": 0.4
    }
  },
  {
    "id": "staple-huevo-estrellado",
    "nombre": "Huevo revuelto o estrellado (con poco aceite)",
    "categoria": "aoa",
    "porcion": "1 pieza (50g)",
    "unidadBase": "pieza",
    "gramosReferencia": 50,
    "densidades": {
      "pieza": 50,
      "g": 1
    },
    "macros": {
      "calories": 90,
      "protein": 6.3,
      "carbs": 0.4,
      "fat": 7
    }
  },
  {
    "id": "staple-atun-agua",
    "nombre": "Atún en agua drenado",
    "categoria": "aoa",
    "porcion": "1 lata drenada (100g)",
    "unidadBase": "lata",
    "gramosReferencia": 100,
    "densidades": {
      "lata": 100,
      "g": 1,
      "cda": 20,
      "porción": 100
    },
    "macros": {
      "calories": 110,
      "protein": 25,
      "carbs": 0,
      "fat": 1
    }
  },
  {
    "id": "staple-medallon-atun",
    "nombre": "Medallón de atún fresco a la plancha",
    "categoria": "aoa",
    "porcion": "1 pieza (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "porción": 100,
      "g": 1
    },
    "macros": {
      "calories": 156,
      "protein": 35,
      "carbs": 0,
      "fat": 1.2
    }
  },
  {
    "id": "staple-bistec-res",
    "nombre": "Bistec de res magro a la plancha",
    "categoria": "aoa",
    "porcion": "1 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "g": 1,
      "rebanada": 50,
      "porción": 100
    },
    "macros": {
      "calories": 180,
      "protein": 26,
      "carbs": 0,
      "fat": 8
    }
  },
  {
    "id": "staple-carne-molida-magra",
    "nombre": "Carne molida de res magra (90/10)",
    "categoria": "aoa",
    "porcion": "1 porción (100g cocida)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "taza": 150,
      "cda": 18,
      "g": 1
    },
    "macros": {
      "calories": 176,
      "protein": 26,
      "carbs": 0,
      "fat": 7.5
    }
  },
  {
    "id": "staple-falda-res",
    "nombre": "Carne de res deshebrada magra (falda)",
    "categoria": "aoa",
    "porcion": "1 porción (100g cocida)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "taza": 130,
      "g": 1
    },
    "macros": {
      "calories": 185,
      "protein": 28,
      "carbs": 0,
      "fat": 7.5
    }
  },
  {
    "id": "staple-milanesa-res",
    "nombre": "Milanesa de pulpa de res a la plancha",
    "categoria": "aoa",
    "porcion": "1 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "porción": 100,
      "g": 1
    },
    "macros": {
      "calories": 175,
      "protein": 27,
      "carbs": 0,
      "fat": 7
    }
  },
  {
    "id": "staple-cecina-res",
    "nombre": "Cecina de res asada magra",
    "categoria": "aoa",
    "porcion": "1 porción (80g)",
    "unidadBase": "porción",
    "gramosReferencia": 80,
    "densidades": {
      "porción": 80,
      "pieza": 80,
      "g": 1
    },
    "macros": {
      "calories": 160,
      "protein": 24,
      "carbs": 0,
      "fat": 7
    }
  },
  {
    "id": "staple-pescado-blanco",
    "nombre": "Filete de pescado blanco / Tilapia",
    "categoria": "aoa",
    "porcion": "1 pieza / filete (100g cocido)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "g": 1,
      "porción": 100
    },
    "macros": {
      "calories": 110,
      "protein": 24,
      "carbs": 0,
      "fat": 1.5
    }
  },
  {
    "id": "staple-robalo-huachinango",
    "nombre": "Filete de róbalo o huachinango a la plancha",
    "categoria": "aoa",
    "porcion": "1 pieza / filete (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "porción": 100,
      "g": 1
    },
    "macros": {
      "calories": 105,
      "protein": 23,
      "carbs": 0,
      "fat": 1.2
    }
  },
  {
    "id": "staple-salmon",
    "nombre": "Salmón fresco a la plancha",
    "categoria": "aoa",
    "porcion": "1 pieza / filete (100g cocido)",
    "unidadBase": "pieza",
    "gramosReferencia": 100,
    "densidades": {
      "pieza": 100,
      "g": 1,
      "porción": 100
    },
    "macros": {
      "calories": 206,
      "protein": 22,
      "carbs": 0,
      "fat": 12
    }
  },
  {
    "id": "staple-salmon-ahumado",
    "nombre": "Salmón ahumado en rebanadas",
    "categoria": "aoa",
    "porcion": "2 rebanadas (50g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 25,
    "densidades": {
      "rebanada": 25,
      "porción": 50,
      "g": 1
    },
    "macros": {
      "calories": 29,
      "protein": 4.6,
      "carbs": 0,
      "fat": 1.1
    }
  },
  {
    "id": "staple-camaron",
    "nombre": "Camarones cocidos / al vapor",
    "categoria": "aoa",
    "porcion": "1 porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "pieza": 12,
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 99,
      "protein": 21,
      "carbs": 0.9,
      "fat": 1.1
    }
  },
  {
    "id": "staple-pulpo",
    "nombre": "Pulpo cocido al vapor",
    "categoria": "aoa",
    "porcion": "1 porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 82,
      "protein": 18,
      "carbs": 2.2,
      "fat": 1
    }
  },
  {
    "id": "staple-sardinas-tomate",
    "nombre": "Sardinas en salsa de tomate drenadas",
    "categoria": "aoa",
    "porcion": "1 lata drenada (100g)",
    "unidadBase": "lata",
    "gramosReferencia": 100,
    "densidades": {
      "lata": 100,
      "pieza": 35,
      "g": 1
    },
    "macros": {
      "calories": 185,
      "protein": 21,
      "carbs": 1,
      "fat": 11
    }
  },
  {
    "id": "staple-lomo-cerdo",
    "nombre": "Lomo de cerdo magro horneado / asado",
    "categoria": "aoa",
    "porcion": "1 porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "rebanada": 50,
      "pieza": 100,
      "g": 1
    },
    "macros": {
      "calories": 165,
      "protein": 27,
      "carbs": 0,
      "fat": 5.5
    }
  },
  {
    "id": "staple-chuleta-cerdo",
    "nombre": "Chuleta de cerdo magra asada",
    "categoria": "aoa",
    "porcion": "1 pieza (90g cocida)",
    "unidadBase": "pieza",
    "gramosReferencia": 90,
    "densidades": {
      "pieza": 90,
      "porción": 90,
      "g": 1
    },
    "macros": {
      "calories": 175,
      "protein": 24,
      "carbs": 0,
      "fat": 8.5
    }
  },
  {
    "id": "staple-queso-panela",
    "nombre": "Queso panela bajo en grasa",
    "categoria": "aoa",
    "porcion": "1 rebanada (40g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 40,
    "densidades": {
      "rebanada": 40,
      "pieza": 40,
      "g": 1,
      "porción": 40
    },
    "macros": {
      "calories": 85,
      "protein": 7,
      "carbs": 1,
      "fat": 5.5
    }
  },
  {
    "id": "staple-queso-oaxaca",
    "nombre": "Queso Oaxaca light / en hebra",
    "categoria": "aoa",
    "porcion": "1 porción (30g)",
    "unidadBase": "porción",
    "gramosReferencia": 30,
    "densidades": {
      "porción": 30,
      "rebanada": 30,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 84,
      "protein": 7.5,
      "carbs": 0.5,
      "fat": 6
    }
  },
  {
    "id": "staple-queso-fresco-ranchero",
    "nombre": "Queso fresco tipo ranchero o canasta",
    "categoria": "aoa",
    "porcion": "1 rebanada (30g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 30,
    "densidades": {
      "rebanada": 30,
      "porción": 30,
      "g": 1
    },
    "macros": {
      "calories": 75,
      "protein": 5.5,
      "carbs": 1,
      "fat": 5.5
    }
  },
  {
    "id": "staple-requeson",
    "nombre": "Requesón bajo en grasa",
    "categoria": "aoa",
    "porcion": "1 cucharada (15g)",
    "unidadBase": "cda",
    "gramosReferencia": 15,
    "densidades": {
      "cda": 15,
      "g": 1,
      "taza": 220,
      "porción": 45
    },
    "macros": {
      "calories": 15,
      "protein": 1.8,
      "carbs": 0.5,
      "fat": 0.6
    }
  },
  {
    "id": "staple-cottage",
    "nombre": "Queso cottage bajo en grasa (light)",
    "categoria": "aoa",
    "porcion": "1/2 taza (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 200,
    "densidades": {
      "taza": 200,
      "cda": 20,
      "g": 1,
      "porción": 100
    },
    "macros": {
      "calories": 144,
      "protein": 22,
      "carbs": 6.5,
      "fat": 3
    }
  },
  {
    "id": "staple-mozzarella-light",
    "nombre": "Queso mozzarella bajo en grasa rallado",
    "categoria": "aoa",
    "porcion": "1 porción (30g)",
    "unidadBase": "porción",
    "gramosReferencia": 30,
    "densidades": {
      "porción": 30,
      "cda": 10,
      "taza": 110,
      "g": 1
    },
    "macros": {
      "calories": 80,
      "protein": 8,
      "carbs": 1,
      "fat": 5
    }
  },
  {
    "id": "staple-queso-parmesano",
    "nombre": "Queso parmesano rallado",
    "categoria": "aoa",
    "porcion": "1 cucharada (10g)",
    "unidadBase": "cda",
    "gramosReferencia": 10,
    "densidades": {
      "cda": 10,
      "cdta": 3.3,
      "g": 1
    },
    "macros": {
      "calories": 43,
      "protein": 3.8,
      "carbs": 0.4,
      "fat": 2.9
    }
  },
  {
    "id": "staple-jamon-pavo",
    "nombre": "Jamón de pechuga de pavo bajo en sodio",
    "categoria": "aoa",
    "porcion": "1 rebanada (20g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 20,
    "densidades": {
      "rebanada": 20,
      "pieza": 20,
      "g": 1
    },
    "macros": {
      "calories": 21,
      "protein": 3.8,
      "carbs": 0.4,
      "fat": 0.4
    }
  },
  {
    "id": "staple-tofu-firme",
    "nombre": "Tofu firme escurrido",
    "categoria": "aoa",
    "porcion": "1 porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "rebanada": 50,
      "taza": 125,
      "g": 1
    },
    "macros": {
      "calories": 83,
      "protein": 10,
      "carbs": 2,
      "fat": 4.8
    }
  },
  {
    "id": "staple-tempeh",
    "nombre": "Tempeh a la plancha",
    "categoria": "aoa",
    "porcion": "1 porción (85g)",
    "unidadBase": "porción",
    "gramosReferencia": 85,
    "densidades": {
      "porción": 85,
      "g": 1
    },
    "macros": {
      "calories": 160,
      "protein": 16,
      "carbs": 8,
      "fat": 9
    }
  },
  {
    "id": "staple-tortilla-maiz",
    "nombre": "Tortilla de maíz",
    "categoria": "cereal",
    "porcion": "1 pieza (30g)",
    "unidadBase": "pieza",
    "gramosReferencia": 30,
    "densidades": {
      "pieza": 30,
      "g": 1
    },
    "macros": {
      "calories": 64,
      "protein": 1.4,
      "carbs": 13.6,
      "fat": 0.7
    }
  },
  {
    "id": "staple-tortilla-nopal",
    "nombre": "Tortilla de nopal",
    "categoria": "cereal",
    "porcion": "1 pieza (25g)",
    "unidadBase": "pieza",
    "gramosReferencia": 25,
    "densidades": {
      "pieza": 25,
      "g": 1
    },
    "macros": {
      "calories": 23,
      "protein": 0.7,
      "carbs": 4.5,
      "fat": 0.2
    }
  },
  {
    "id": "staple-tortilla-harina-integral",
    "nombre": "Tortilla de harina integral",
    "categoria": "cereal",
    "porcion": "1 pieza (35g)",
    "unidadBase": "pieza",
    "gramosReferencia": 35,
    "densidades": {
      "pieza": 35,
      "g": 1
    },
    "macros": {
      "calories": 100,
      "protein": 3,
      "carbs": 18,
      "fat": 2.2
    }
  },
  {
    "id": "staple-tortilla-harina-blanca",
    "nombre": "Tortilla de harina de trigo tradicional",
    "categoria": "cereal",
    "porcion": "1 pieza (30g)",
    "unidadBase": "pieza",
    "gramosReferencia": 30,
    "densidades": {
      "pieza": 30,
      "g": 1
    },
    "macros": {
      "calories": 95,
      "protein": 2.4,
      "carbs": 15,
      "fat": 3
    }
  },
  {
    "id": "staple-tostada-horneada",
    "nombre": "Tostada de maíz horneada (Saníssimo)",
    "categoria": "cereal",
    "porcion": "1 pieza (11g)",
    "unidadBase": "pieza",
    "gramosReferencia": 11,
    "densidades": {
      "pieza": 11,
      "g": 1
    },
    "macros": {
      "calories": 25,
      "protein": 0.7,
      "carbs": 5.5,
      "fat": 0.2
    }
  },
  {
    "id": "staple-tostada-nopal",
    "nombre": "Tostada de nopal horneada",
    "categoria": "cereal",
    "porcion": "1 pieza (10g)",
    "unidadBase": "pieza",
    "gramosReferencia": 10,
    "densidades": {
      "pieza": 10,
      "g": 1
    },
    "macros": {
      "calories": 20,
      "protein": 0.6,
      "carbs": 4.5,
      "fat": 0.1
    }
  },
  {
    "id": "staple-totopos-horneados",
    "nombre": "Totopos de maíz horneados sin grasa",
    "categoria": "cereal",
    "porcion": "1 taza (30g)",
    "unidadBase": "taza",
    "gramosReferencia": 30,
    "densidades": {
      "taza": 30,
      "porción": 30,
      "g": 1
    },
    "macros": {
      "calories": 115,
      "protein": 2.5,
      "carbs": 24,
      "fat": 1.2
    }
  },
  {
    "id": "staple-pan-integral",
    "nombre": "Pan de caja 100% integral",
    "categoria": "cereal",
    "porcion": "1 rebanada (28g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 28,
    "densidades": {
      "rebanada": 28,
      "pieza": 28,
      "g": 1
    },
    "macros": {
      "calories": 68,
      "protein": 3.2,
      "carbs": 12.5,
      "fat": 0.9
    }
  },
  {
    "id": "staple-pan-masa-madre",
    "nombre": "Pan de masa madre (Sourdough)",
    "categoria": "cereal",
    "porcion": "1 rebanada (45g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 45,
    "densidades": {
      "rebanada": 45,
      "pieza": 45,
      "g": 1
    },
    "macros": {
      "calories": 110,
      "protein": 4,
      "carbs": 22,
      "fat": 0.8
    }
  },
  {
    "id": "staple-pan-ezequiel",
    "nombre": "Pan Ezequiel de granos germinados",
    "categoria": "cereal",
    "porcion": "1 rebanada (34g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 34,
    "densidades": {
      "rebanada": 34,
      "pieza": 34,
      "g": 1
    },
    "macros": {
      "calories": 80,
      "protein": 5,
      "carbs": 15,
      "fat": 0.5
    }
  },
  {
    "id": "staple-pan-pita-integral",
    "nombre": "Pan pita integral",
    "categoria": "cereal",
    "porcion": "1 pieza mediana (40g)",
    "unidadBase": "pieza",
    "gramosReferencia": 40,
    "densidades": {
      "pieza": 40,
      "g": 1
    },
    "macros": {
      "calories": 100,
      "protein": 4,
      "carbs": 20,
      "fat": 1
    }
  },
  {
    "id": "staple-avena",
    "nombre": "Avena en hojuelas (en seco)",
    "categoria": "cereal",
    "porcion": "1/2 taza en seco (40g)",
    "unidadBase": "taza",
    "gramosReferencia": 80,
    "densidades": {
      "taza": 80,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 300,
      "protein": 10,
      "carbs": 54,
      "fat": 5
    }
  },
  {
    "id": "staple-salvado-avena",
    "nombre": "Harina o salvado de avena",
    "categoria": "cereal",
    "porcion": "1/3 taza (30g)",
    "unidadBase": "taza",
    "gramosReferencia": 90,
    "densidades": {
      "taza": 90,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 330,
      "protein": 15,
      "carbs": 55,
      "fat": 6.5
    }
  },
  {
    "id": "staple-arroz-cocido",
    "nombre": "Arroz blanco o integral cocido",
    "categoria": "cereal",
    "porcion": "1/2 taza (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 210,
      "protein": 4.4,
      "carbs": 46,
      "fat": 0.8
    }
  },
  {
    "id": "staple-arroz-jazmin",
    "nombre": "Arroz jazmín o basmati cocido",
    "categoria": "cereal",
    "porcion": "1/2 taza (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 205,
      "protein": 4.2,
      "carbs": 45,
      "fat": 0.5
    }
  },
  {
    "id": "staple-quinoa-cocida",
    "nombre": "Quinoa cocida",
    "categoria": "cereal",
    "porcion": "1/2 taza (90g)",
    "unidadBase": "taza",
    "gramosReferencia": 180,
    "densidades": {
      "taza": 180,
      "cda": 18,
      "g": 1
    },
    "macros": {
      "calories": 222,
      "protein": 8,
      "carbs": 39,
      "fat": 3.6
    }
  },
  {
    "id": "staple-cuscus-cocido",
    "nombre": "Cuscús cocido",
    "categoria": "cereal",
    "porcion": "1/2 taza (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 176,
      "protein": 6,
      "carbs": 36,
      "fat": 0.4
    }
  },
  {
    "id": "staple-pasta-cocida",
    "nombre": "Pasta integral o tradicional cocida",
    "categoria": "cereal",
    "porcion": "1/2 taza (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 215,
      "protein": 7.5,
      "carbs": 42,
      "fat": 1.2
    }
  },
  {
    "id": "staple-pasta-legumbres",
    "nombre": "Pasta de garbanzo o lenteja cocida",
    "categoria": "cereal",
    "porcion": "1/2 taza (70g)",
    "unidadBase": "taza",
    "gramosReferencia": 140,
    "densidades": {
      "taza": 140,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 210,
      "protein": 14,
      "carbs": 34,
      "fat": 2.2
    }
  },
  {
    "id": "staple-papa-cocida",
    "nombre": "Papa cocida o al vapor con cáscara",
    "categoria": "cereal",
    "porcion": "1 pieza mediana (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "g": 1,
      "taza": 150
    },
    "macros": {
      "calories": 104,
      "protein": 2.5,
      "carbs": 24,
      "fat": 0.2
    }
  },
  {
    "id": "staple-camote-cocido",
    "nombre": "Camote cocido al vapor",
    "categoria": "cereal",
    "porcion": "1/2 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 200,
    "densidades": {
      "pieza": 200,
      "g": 1,
      "taza": 160
    },
    "macros": {
      "calories": 172,
      "protein": 3.2,
      "carbs": 40,
      "fat": 0.3
    }
  },
  {
    "id": "staple-elote-desgranado",
    "nombre": "Elote blanco desgranado cocido",
    "categoria": "cereal",
    "porcion": "1/2 taza (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 150,
      "protein": 5,
      "carbs": 32,
      "fat": 1.8
    }
  },
  {
    "id": "staple-elote-entero",
    "nombre": "Mazorca de elote entera cocida",
    "categoria": "cereal",
    "porcion": "1 pieza mediana (150g)",
    "unidadBase": "pieza",
    "gramosReferencia": 150,
    "densidades": {
      "pieza": 150,
      "g": 1
    },
    "macros": {
      "calories": 130,
      "protein": 4.5,
      "carbs": 28,
      "fat": 1.8
    }
  },
  {
    "id": "staple-yuca-cocida",
    "nombre": "Yuca cocida al vapor",
    "categoria": "cereal",
    "porcion": "1/2 taza (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "pieza": 100,
      "g": 1
    },
    "macros": {
      "calories": 256,
      "protein": 2.2,
      "carbs": 60,
      "fat": 0.5
    }
  },
  {
    "id": "staple-galletas-habaneras",
    "nombre": "Galletas de salvado / habaneras integrales",
    "categoria": "cereal",
    "porcion": "4 piezas (28g)",
    "unidadBase": "pieza",
    "gramosReferencia": 7,
    "densidades": {
      "pieza": 7,
      "g": 1
    },
    "macros": {
      "calories": 28,
      "protein": 0.7,
      "carbs": 5.2,
      "fat": 0.5
    }
  },
  {
    "id": "staple-rice-cakes",
    "nombre": "Galletas de arroz inflado (Rice Cakes)",
    "categoria": "cereal",
    "porcion": "2 piezas (18g)",
    "unidadBase": "pieza",
    "gramosReferencia": 9,
    "densidades": {
      "pieza": 9,
      "g": 1
    },
    "macros": {
      "calories": 35,
      "protein": 0.7,
      "carbs": 7.5,
      "fat": 0.3
    }
  },
  {
    "id": "staple-palomitas-naturales",
    "nombre": "Palomitas de maíz naturales (con aire caliente sin grasa)",
    "categoria": "cereal",
    "porcion": "3 tazas (24g)",
    "unidadBase": "taza",
    "gramosReferencia": 8,
    "densidades": {
      "taza": 8,
      "g": 1
    },
    "macros": {
      "calories": 31,
      "protein": 1,
      "carbs": 6.2,
      "fat": 0.4
    }
  },
  {
    "id": "staple-amaranto-tostado",
    "nombre": "Amaranto tostado natural sin azúcar",
    "categoria": "cereal",
    "porcion": "1/4 taza (10g)",
    "unidadBase": "taza",
    "gramosReferencia": 40,
    "densidades": {
      "taza": 40,
      "cda": 5,
      "g": 1
    },
    "macros": {
      "calories": 148,
      "protein": 5.6,
      "carbs": 26,
      "fat": 2.6
    }
  },
  {
    "id": "staple-harina-maiz-maseca",
    "nombre": "Harina de maíz nixtamalizado seca (Maseca)",
    "categoria": "cereal",
    "porcion": "1/4 taza (30g)",
    "unidadBase": "taza",
    "gramosReferencia": 120,
    "densidades": {
      "taza": 120,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 430,
      "protein": 10,
      "carbs": 88,
      "fat": 4.5
    }
  },
  {
    "id": "staple-frijoles-olla",
    "nombre": "Frijoles negros / bayos de la olla cocidos",
    "categoria": "leguminosa",
    "porcion": "1/2 taza con caldo (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 180,
    "densidades": {
      "taza": 180,
      "cda": 18,
      "g": 1
    },
    "macros": {
      "calories": 230,
      "protein": 15,
      "carbs": 40,
      "fat": 1
    }
  },
  {
    "id": "staple-frijoles-peruanos",
    "nombre": "Frijoles peruanos / flor de mayo de la olla",
    "categoria": "leguminosa",
    "porcion": "1/2 taza con caldo (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 180,
    "densidades": {
      "taza": 180,
      "cda": 18,
      "g": 1
    },
    "macros": {
      "calories": 225,
      "protein": 15.5,
      "carbs": 39,
      "fat": 1.1
    }
  },
  {
    "id": "staple-frijoles-refritos",
    "nombre": "Frijoles refritos caseros con poco aceite",
    "categoria": "leguminosa",
    "porcion": "1/3 taza (75g)",
    "unidadBase": "taza",
    "gramosReferencia": 220,
    "densidades": {
      "taza": 220,
      "cda": 20,
      "g": 1
    },
    "macros": {
      "calories": 260,
      "protein": 14,
      "carbs": 38,
      "fat": 6
    }
  },
  {
    "id": "staple-lentejas-cocidas",
    "nombre": "Lentejas cocidas de la olla",
    "categoria": "leguminosa",
    "porcion": "1/2 taza con caldo (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 200,
    "densidades": {
      "taza": 200,
      "cda": 20,
      "g": 1
    },
    "macros": {
      "calories": 230,
      "protein": 18,
      "carbs": 40,
      "fat": 0.8
    }
  },
  {
    "id": "staple-garbanzos-cocidos",
    "nombre": "Garbanzos cocidos",
    "categoria": "leguminosa",
    "porcion": "1/2 taza (90g)",
    "unidadBase": "taza",
    "gramosReferencia": 180,
    "densidades": {
      "taza": 180,
      "cda": 18,
      "g": 1
    },
    "macros": {
      "calories": 269,
      "protein": 14.5,
      "carbs": 45,
      "fat": 4.2
    }
  },
  {
    "id": "staple-habas-cocidas",
    "nombre": "Habas cocidas de la olla",
    "categoria": "leguminosa",
    "porcion": "1/2 taza (85g)",
    "unidadBase": "taza",
    "gramosReferencia": 170,
    "densidades": {
      "taza": 170,
      "cda": 18,
      "g": 1
    },
    "macros": {
      "calories": 210,
      "protein": 16,
      "carbs": 36,
      "fat": 1
    }
  },
  {
    "id": "staple-edamames-desgranados",
    "nombre": "Edamames al vapor desgranados",
    "categoria": "leguminosa",
    "porcion": "1/2 taza (75g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 188,
      "protein": 18.5,
      "carbs": 14,
      "fat": 8
    }
  },
  {
    "id": "staple-edamames-vaina",
    "nombre": "Edamames al vapor con vaina",
    "categoria": "leguminosa",
    "porcion": "1 taza con vaina (120g)",
    "unidadBase": "taza",
    "gramosReferencia": 120,
    "densidades": {
      "taza": 120,
      "g": 1
    },
    "macros": {
      "calories": 150,
      "protein": 14,
      "carbs": 11,
      "fat": 6
    }
  },
  {
    "id": "staple-hummus",
    "nombre": "Hummus tradicional de garbanzo con tahini",
    "categoria": "leguminosa",
    "porcion": "2 cucharadas (30g)",
    "unidadBase": "cda",
    "gramosReferencia": 15,
    "densidades": {
      "cda": 15,
      "taza": 220,
      "g": 1
    },
    "macros": {
      "calories": 35,
      "protein": 1.2,
      "carbs": 2.8,
      "fat": 2.2
    }
  },
  {
    "id": "staple-soya-texturizada",
    "nombre": "Soya texturizada deshidratada",
    "categoria": "leguminosa",
    "porcion": "1/4 taza (15g en seco)",
    "unidadBase": "taza",
    "gramosReferencia": 50,
    "densidades": {
      "taza": 50,
      "cda": 8,
      "g": 1
    },
    "macros": {
      "calories": 165,
      "protein": 26,
      "carbs": 16,
      "fat": 0.6
    }
  },
  {
    "id": "staple-aguacate-hass",
    "nombre": "Aguacate Hass",
    "categoria": "grasa",
    "porcion": "1/4 pieza (30g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "cda": 15,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 192,
      "protein": 2.4,
      "carbs": 10.2,
      "fat": 18
    }
  },
  {
    "id": "staple-aceite-oliva",
    "nombre": "Aceite de oliva extra virgen",
    "categoria": "grasa",
    "porcion": "1 cucharada (14g / 15ml)",
    "unidadBase": "cda",
    "gramosReferencia": 14,
    "densidades": {
      "cda": 14,
      "cdta": 4.5,
      "ml": 15,
      "g": 1
    },
    "macros": {
      "calories": 120,
      "protein": 0,
      "carbs": 0,
      "fat": 13.5
    }
  },
  {
    "id": "staple-aceite-aguacate",
    "nombre": "Aceite de aguacate prensado en frío",
    "categoria": "grasa",
    "porcion": "1 cucharada (14g / 15ml)",
    "unidadBase": "cda",
    "gramosReferencia": 14,
    "densidades": {
      "cda": 14,
      "cdta": 4.5,
      "ml": 15,
      "g": 1
    },
    "macros": {
      "calories": 120,
      "protein": 0,
      "carbs": 0,
      "fat": 13.5
    }
  },
  {
    "id": "staple-aceite-canola",
    "nombre": "Aceite de canola o girasol",
    "categoria": "grasa",
    "porcion": "1 cucharada (14g / 15ml)",
    "unidadBase": "cda",
    "gramosReferencia": 14,
    "densidades": {
      "cda": 14,
      "cdta": 4.5,
      "ml": 15,
      "g": 1
    },
    "macros": {
      "calories": 120,
      "protein": 0,
      "carbs": 0,
      "fat": 13.5
    }
  },
  {
    "id": "staple-aceite-coco",
    "nombre": "Aceite de coco virgen",
    "categoria": "grasa",
    "porcion": "1 cucharada (14g / 15ml)",
    "unidadBase": "cda",
    "gramosReferencia": 14,
    "densidades": {
      "cda": 14,
      "cdta": 4.5,
      "ml": 15,
      "g": 1
    },
    "macros": {
      "calories": 121,
      "protein": 0,
      "carbs": 0,
      "fat": 13.6
    }
  },
  {
    "id": "staple-mantequilla-ghee",
    "nombre": "Mantequilla pura de vaca o Ghee clarificado",
    "categoria": "grasa",
    "porcion": "1 cucharadita (5g)",
    "unidadBase": "cda",
    "gramosReferencia": 14,
    "densidades": {
      "cda": 14,
      "cdta": 5,
      "g": 1
    },
    "macros": {
      "calories": 102,
      "protein": 0.1,
      "carbs": 0,
      "fat": 11.5
    }
  },
  {
    "id": "staple-crema-cacahuate",
    "nombre": "Crema de cacahuate sin azúcar",
    "categoria": "grasa",
    "porcion": "1 cucharada (16g)",
    "unidadBase": "cda",
    "gramosReferencia": 16,
    "densidades": {
      "cda": 16,
      "cdta": 5.5,
      "g": 1
    },
    "macros": {
      "calories": 95,
      "protein": 4,
      "carbs": 3,
      "fat": 8
    }
  },
  {
    "id": "staple-crema-almendras",
    "nombre": "Crema de almendras 100% natural sin azúcar",
    "categoria": "grasa",
    "porcion": "1 cucharada (16g)",
    "unidadBase": "cda",
    "gramosReferencia": 16,
    "densidades": {
      "cda": 16,
      "cdta": 5.5,
      "g": 1
    },
    "macros": {
      "calories": 98,
      "protein": 3.4,
      "carbs": 3,
      "fat": 8.9
    }
  },
  {
    "id": "staple-almendras",
    "nombre": "Almendras enteras naturales",
    "categoria": "grasa",
    "porcion": "10 piezas (12g)",
    "unidadBase": "pieza",
    "gramosReferencia": 1.2,
    "densidades": {
      "pieza": 1.2,
      "cda": 12,
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 7,
      "protein": 0.25,
      "carbs": 0.25,
      "fat": 0.6
    }
  },
  {
    "id": "staple-nueces",
    "nombre": "Nueces en mitades",
    "categoria": "grasa",
    "porcion": "3 mitades (10g)",
    "unidadBase": "pieza",
    "gramosReferencia": 3.3,
    "densidades": {
      "pieza": 3.3,
      "cda": 10,
      "taza": 120,
      "g": 1
    },
    "macros": {
      "calories": 22,
      "protein": 0.5,
      "carbs": 0.45,
      "fat": 2.2
    }
  },
  {
    "id": "staple-nuez-india",
    "nombre": "Nuez de la India tostada sin sal",
    "categoria": "grasa",
    "porcion": "7 piezas (10g)",
    "unidadBase": "pieza",
    "gramosReferencia": 1.5,
    "densidades": {
      "pieza": 1.5,
      "cda": 12,
      "taza": 130,
      "g": 1
    },
    "macros": {
      "calories": 8.5,
      "protein": 0.27,
      "carbs": 0.45,
      "fat": 0.67
    }
  },
  {
    "id": "staple-pistaches",
    "nombre": "Pistaches tostados sin sal pelados",
    "categoria": "grasa",
    "porcion": "15 piezas (10g)",
    "unidadBase": "pieza",
    "gramosReferencia": 0.7,
    "densidades": {
      "pieza": 0.7,
      "cda": 10,
      "taza": 120,
      "g": 1
    },
    "macros": {
      "calories": 4,
      "protein": 0.14,
      "carbs": 0.2,
      "fat": 0.32
    }
  },
  {
    "id": "staple-chia",
    "nombre": "Semillas de chía",
    "categoria": "grasa",
    "porcion": "1 cucharada (12g)",
    "unidadBase": "cda",
    "gramosReferencia": 12,
    "densidades": {
      "cda": 12,
      "cdta": 4,
      "g": 1
    },
    "macros": {
      "calories": 58,
      "protein": 2,
      "carbs": 5,
      "fat": 3.7
    }
  },
  {
    "id": "staple-linaza-molida",
    "nombre": "Semillas de linaza molida",
    "categoria": "grasa",
    "porcion": "1 cucharada (10g)",
    "unidadBase": "cda",
    "gramosReferencia": 10,
    "densidades": {
      "cda": 10,
      "cdta": 3.5,
      "g": 1
    },
    "macros": {
      "calories": 53,
      "protein": 1.8,
      "carbs": 2.9,
      "fat": 4.2
    }
  },
  {
    "id": "staple-pepitas-calabaza",
    "nombre": "Pepitas de calabaza tostadas sin sal",
    "categoria": "grasa",
    "porcion": "1 cucharada (10g)",
    "unidadBase": "cda",
    "gramosReferencia": 10,
    "densidades": {
      "cda": 10,
      "taza": 130,
      "g": 1
    },
    "macros": {
      "calories": 56,
      "protein": 3,
      "carbs": 1.5,
      "fat": 4.7
    }
  },
  {
    "id": "staple-semillas-girasol",
    "nombre": "Semillas de girasol peladas tostadas",
    "categoria": "grasa",
    "porcion": "1 cucharada (10g)",
    "unidadBase": "cda",
    "gramosReferencia": 10,
    "densidades": {
      "cda": 10,
      "taza": 125,
      "g": 1
    },
    "macros": {
      "calories": 58,
      "protein": 2.1,
      "carbs": 2,
      "fat": 5.1
    }
  },
  {
    "id": "staple-ajonjoli",
    "nombre": "Semillas de ajonjolí / sésamo blanco o tostado",
    "categoria": "grasa",
    "porcion": "1 cucharada (9g)",
    "unidadBase": "cda",
    "gramosReferencia": 9,
    "densidades": {
      "cda": 9,
      "cdta": 3,
      "g": 1
    },
    "macros": {
      "calories": 52,
      "protein": 1.6,
      "carbs": 2.1,
      "fat": 4.5
    }
  },
  {
    "id": "staple-aceitunas",
    "nombre": "Aceitunas verdes o negras deshuesadas",
    "categoria": "grasa",
    "porcion": "6 piezas (24g)",
    "unidadBase": "pieza",
    "gramosReferencia": 4,
    "densidades": {
      "pieza": 4,
      "cda": 15,
      "taza": 130,
      "g": 1
    },
    "macros": {
      "calories": 6,
      "protein": 0.05,
      "carbs": 0.25,
      "fat": 0.6
    }
  },
  {
    "id": "staple-mayonesa-light",
    "nombre": "Mayonesa baja en grasa / con aceite de aguacate",
    "categoria": "grasa",
    "porcion": "1 cucharada (15g)",
    "unidadBase": "cda",
    "gramosReferencia": 15,
    "densidades": {
      "cda": 15,
      "cdta": 5,
      "g": 1
    },
    "macros": {
      "calories": 45,
      "protein": 0.1,
      "carbs": 1.5,
      "fat": 4.5
    }
  },
  {
    "id": "staple-chocolate-amargo",
    "nombre": "Chocolate negro amargo (70-85% cacao)",
    "categoria": "grasa",
    "porcion": "1 cuadrito / porción (10g)",
    "unidadBase": "rebanada",
    "gramosReferencia": 10,
    "densidades": {
      "rebanada": 10,
      "pieza": 20,
      "porción": 10,
      "g": 1
    },
    "macros": {
      "calories": 60,
      "protein": 0.8,
      "carbs": 4.5,
      "fat": 4.3
    }
  },
  {
    "id": "staple-coco-rallado",
    "nombre": "Coco seco rallado deshidratado sin azúcar",
    "categoria": "grasa",
    "porcion": "1 cucharada (8g)",
    "unidadBase": "cda",
    "gramosReferencia": 8,
    "densidades": {
      "cda": 8,
      "taza": 80,
      "g": 1
    },
    "macros": {
      "calories": 53,
      "protein": 0.5,
      "carbs": 1.9,
      "fat": 5.2
    }
  },
  {
    "id": "staple-crema-acida-light",
    "nombre": "Crema ácida mexicana reducida en grasa",
    "categoria": "grasa",
    "porcion": "1 cucharada (15g)",
    "unidadBase": "cda",
    "gramosReferencia": 15,
    "densidades": {
      "cda": 15,
      "cdta": 5,
      "g": 1
    },
    "macros": {
      "calories": 30,
      "protein": 0.6,
      "carbs": 1,
      "fat": 2.7
    }
  },
  {
    "id": "staple-nopales-cocidos",
    "nombre": "Nopales picados cocidos o asados",
    "categoria": "verdura",
    "porcion": "1 taza (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "pieza": 60,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 22,
      "protein": 1.8,
      "carbs": 4.5,
      "fat": 0.2
    }
  },
  {
    "id": "staple-pico-de-gallo",
    "nombre": "Pico de gallo fresco (jitomate, cebolla, cilantro)",
    "categoria": "verdura",
    "porcion": "1 porción (50g)",
    "unidadBase": "porción",
    "gramosReferencia": 50,
    "densidades": {
      "porción": 50,
      "cda": 20,
      "taza": 180,
      "g": 1
    },
    "macros": {
      "calories": 15,
      "protein": 0.6,
      "carbs": 3.2,
      "fat": 0.1
    }
  },
  {
    "id": "staple-salsa-taquera",
    "nombre": "Salsa taquera roja / verde casera",
    "categoria": "verdura",
    "porcion": "1 porción (30g)",
    "unidadBase": "porción",
    "gramosReferencia": 30,
    "densidades": {
      "porción": 30,
      "cda": 15,
      "taza": 200,
      "g": 1
    },
    "macros": {
      "calories": 10,
      "protein": 0.4,
      "carbs": 2.1,
      "fat": 0.1
    }
  },
  {
    "id": "staple-salsa-verde",
    "nombre": "Salsa verde casera cocida de tomatillo",
    "categoria": "verdura",
    "porcion": "1 porción (30g)",
    "unidadBase": "porción",
    "gramosReferencia": 30,
    "densidades": {
      "porción": 30,
      "cda": 15,
      "taza": 200,
      "g": 1
    },
    "macros": {
      "calories": 12,
      "protein": 0.5,
      "carbs": 2.4,
      "fat": 0.2
    }
  },
  {
    "id": "staple-jitomate",
    "nombre": "Jitomate / Tomate picado",
    "categoria": "verdura",
    "porcion": "1 pieza (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "taza": 150,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 22,
      "protein": 1,
      "carbs": 4.8,
      "fat": 0.2
    }
  },
  {
    "id": "staple-jitomate-cherry",
    "nombre": "Jitomate cherry / uva fresco",
    "categoria": "verdura",
    "porcion": "6 piezas (90g)",
    "unidadBase": "pieza",
    "gramosReferencia": 15,
    "densidades": {
      "pieza": 15,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 2.7,
      "protein": 0.13,
      "carbs": 0.6,
      "fat": 0.03
    }
  },
  {
    "id": "staple-tomate-verde",
    "nombre": "Tomate verde / tomatillo cocido o crudo",
    "categoria": "verdura",
    "porcion": "2 piezas medianas (80g)",
    "unidadBase": "pieza",
    "gramosReferencia": 40,
    "densidades": {
      "pieza": 40,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 13,
      "protein": 0.4,
      "carbs": 2.3,
      "fat": 0.4
    }
  },
  {
    "id": "staple-pure-tomate",
    "nombre": "Puré de tomate natural sin sal añadida",
    "categoria": "verdura",
    "porcion": "1/4 taza (60g)",
    "unidadBase": "taza",
    "gramosReferencia": 220,
    "densidades": {
      "taza": 220,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 84,
      "protein": 3.6,
      "carbs": 18,
      "fat": 0.4
    }
  },
  {
    "id": "staple-cebolla",
    "nombre": "Cebolla blanca picada",
    "categoria": "verdura",
    "porcion": "1/4 pieza (30g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "cda": 15,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 48,
      "protein": 1.3,
      "carbs": 11,
      "fat": 0.1
    }
  },
  {
    "id": "staple-cebolla-morada",
    "nombre": "Cebolla morada picada",
    "categoria": "verdura",
    "porcion": "1/4 pieza (30g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "cda": 15,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 48,
      "protein": 1.3,
      "carbs": 11,
      "fat": 0.1
    }
  },
  {
    "id": "staple-cebollitas-cambray",
    "nombre": "Cebollitas cambray asadas",
    "categoria": "verdura",
    "porcion": "3 piezas (75g)",
    "unidadBase": "pieza",
    "gramosReferencia": 25,
    "densidades": {
      "pieza": 25,
      "g": 1
    },
    "macros": {
      "calories": 9,
      "protein": 0.3,
      "carbs": 2.1,
      "fat": 0.05
    }
  },
  {
    "id": "staple-lechuga",
    "nombre": "Hojas de lechuga orejona / romana",
    "categoria": "verdura",
    "porcion": "3 hojas grandes (60g)",
    "unidadBase": "pieza",
    "gramosReferencia": 20,
    "densidades": {
      "pieza": 20,
      "taza": 45,
      "g": 1
    },
    "macros": {
      "calories": 3,
      "protein": 0.3,
      "carbs": 0.6,
      "fat": 0.05
    }
  },
  {
    "id": "staple-espinacas",
    "nombre": "Espinacas frescas",
    "categoria": "verdura",
    "porcion": "2 tazas crudas (60g)",
    "unidadBase": "taza",
    "gramosReferencia": 30,
    "densidades": {
      "taza": 30,
      "g": 1
    },
    "macros": {
      "calories": 7,
      "protein": 0.9,
      "carbs": 1.1,
      "fat": 0.1
    }
  },
  {
    "id": "staple-acelgas",
    "nombre": "Acelgas frescas o al vapor",
    "categoria": "verdura",
    "porcion": "1 taza cocida (140g)",
    "unidadBase": "taza",
    "gramosReferencia": 140,
    "densidades": {
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 27,
      "protein": 2.6,
      "carbs": 5.3,
      "fat": 0.3
    }
  },
  {
    "id": "staple-calabacita",
    "nombre": "Calabacita italiana cocida o cruda",
    "categoria": "verdura",
    "porcion": "1 pieza mediana (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 20,
      "protein": 1.4,
      "carbs": 3.8,
      "fat": 0.4
    }
  },
  {
    "id": "staple-chayote",
    "nombre": "Chayote cocido en cubos",
    "categoria": "verdura",
    "porcion": "1/2 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 200,
    "densidades": {
      "pieza": 200,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 38,
      "protein": 1.6,
      "carbs": 9,
      "fat": 0.2
    }
  },
  {
    "id": "staple-pepino",
    "nombre": "Pepino rebanado con cáscara",
    "categoria": "verdura",
    "porcion": "1 taza (120g)",
    "unidadBase": "taza",
    "gramosReferencia": 120,
    "densidades": {
      "taza": 120,
      "pieza": 200,
      "g": 1
    },
    "macros": {
      "calories": 18,
      "protein": 0.8,
      "carbs": 4.3,
      "fat": 0.1
    }
  },
  {
    "id": "staple-zanahoria",
    "nombre": "Zanahoria rallada o en rodajas",
    "categoria": "verdura",
    "porcion": "1/2 taza (60g)",
    "unidadBase": "taza",
    "gramosReferencia": 120,
    "densidades": {
      "taza": 120,
      "pieza": 80,
      "g": 1
    },
    "macros": {
      "calories": 50,
      "protein": 1.1,
      "carbs": 11.5,
      "fat": 0.3
    }
  },
  {
    "id": "staple-brocoli",
    "nombre": "Brócoli al vapor",
    "categoria": "verdura",
    "porcion": "1 taza cocida (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "pieza": 250,
      "g": 1
    },
    "macros": {
      "calories": 52,
      "protein": 3.8,
      "carbs": 10.2,
      "fat": 0.6
    }
  },
  {
    "id": "staple-coliflor",
    "nombre": "Coliflor cocida o al vapor en ramilletes",
    "categoria": "verdura",
    "porcion": "1 taza (130g)",
    "unidadBase": "taza",
    "gramosReferencia": 130,
    "densidades": {
      "taza": 130,
      "pieza": 500,
      "g": 1
    },
    "macros": {
      "calories": 33,
      "protein": 2.4,
      "carbs": 6.4,
      "fat": 0.4
    }
  },
  {
    "id": "staple-arroz-coliflor",
    "nombre": "Arroz de coliflor rallado al vapor o salteado",
    "categoria": "verdura",
    "porcion": "1 taza (110g)",
    "unidadBase": "taza",
    "gramosReferencia": 110,
    "densidades": {
      "taza": 110,
      "g": 1
    },
    "macros": {
      "calories": 28,
      "protein": 2.1,
      "carbs": 5.5,
      "fat": 0.3
    }
  },
  {
    "id": "staple-champinones",
    "nombre": "Champiñones rebanados cocidos o crudos",
    "categoria": "verdura",
    "porcion": "1 taza (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 100,
    "densidades": {
      "taza": 100,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 22,
      "protein": 3.1,
      "carbs": 3.3,
      "fat": 0.3
    }
  },
  {
    "id": "staple-portobello",
    "nombre": "Champiñón Portobello asado a la plancha",
    "categoria": "verdura",
    "porcion": "1 pieza mediana (85g)",
    "unidadBase": "pieza",
    "gramosReferencia": 85,
    "densidades": {
      "pieza": 85,
      "taza": 120,
      "g": 1
    },
    "macros": {
      "calories": 22,
      "protein": 2.1,
      "carbs": 3.3,
      "fat": 0.3
    }
  },
  {
    "id": "staple-pimiento-rojo",
    "nombre": "Pimiento morrón rojo picado o en tiras",
    "categoria": "verdura",
    "porcion": "1 pieza mediana (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "taza": 140,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 37,
      "protein": 1.2,
      "carbs": 7.2,
      "fat": 0.4
    }
  },
  {
    "id": "staple-pimiento-verde",
    "nombre": "Pimiento morrón verde picado o en tiras",
    "categoria": "verdura",
    "porcion": "1 pieza mediana (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "taza": 140,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 24,
      "protein": 1,
      "carbs": 5.5,
      "fat": 0.2
    }
  },
  {
    "id": "staple-apio",
    "nombre": "Apio en varas picado",
    "categoria": "verdura",
    "porcion": "1 taza picada (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 100,
    "densidades": {
      "taza": 100,
      "pieza": 40,
      "cda": 12,
      "g": 1
    },
    "macros": {
      "calories": 16,
      "protein": 0.7,
      "carbs": 3,
      "fat": 0.2
    }
  },
  {
    "id": "staple-esparragos",
    "nombre": "Espárragos a la plancha o al vapor",
    "categoria": "verdura",
    "porcion": "5 piezas (75g)",
    "unidadBase": "pieza",
    "gramosReferencia": 15,
    "densidades": {
      "pieza": 15,
      "taza": 130,
      "g": 1
    },
    "macros": {
      "calories": 3.3,
      "protein": 0.33,
      "carbs": 0.6,
      "fat": 0.03
    }
  },
  {
    "id": "staple-ejotes",
    "nombre": "Ejotes tiernos cocidos",
    "categoria": "verdura",
    "porcion": "1 taza (125g)",
    "unidadBase": "taza",
    "gramosReferencia": 125,
    "densidades": {
      "taza": 125,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 44,
      "protein": 2.4,
      "carbs": 9.8,
      "fat": 0.4
    }
  },
  {
    "id": "staple-betabel",
    "nombre": "Betabel / remolacha cocido en cubos",
    "categoria": "verdura",
    "porcion": "1/2 taza (75g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "pieza": 100,
      "g": 1
    },
    "macros": {
      "calories": 65,
      "protein": 2.5,
      "carbs": 14.4,
      "fat": 0.3
    }
  },
  {
    "id": "staple-col-repollo",
    "nombre": "Col / repollo morado o blanco rallado",
    "categoria": "verdura",
    "porcion": "1 taza (70g)",
    "unidadBase": "taza",
    "gramosReferencia": 70,
    "densidades": {
      "taza": 70,
      "g": 1
    },
    "macros": {
      "calories": 18,
      "protein": 0.9,
      "carbs": 4.1,
      "fat": 0.1
    }
  },
  {
    "id": "staple-chile-poblano-rajas",
    "nombre": "Chile poblano asado en rajas",
    "categoria": "verdura",
    "porcion": "1/2 taza (60g)",
    "unidadBase": "taza",
    "gramosReferencia": 120,
    "densidades": {
      "taza": 120,
      "pieza": 70,
      "g": 1
    },
    "macros": {
      "calories": 36,
      "protein": 1.8,
      "carbs": 7.2,
      "fat": 0.5
    }
  },
  {
    "id": "staple-rabanos",
    "nombre": "Rábanos rebanados frescos",
    "categoria": "verdura",
    "porcion": "4 piezas (50g)",
    "unidadBase": "pieza",
    "gramosReferencia": 12,
    "densidades": {
      "pieza": 12,
      "taza": 110,
      "g": 1
    },
    "macros": {
      "calories": 2,
      "protein": 0.08,
      "carbs": 0.4,
      "fat": 0.01
    }
  },
  {
    "id": "staple-germinado-alfalfa",
    "nombre": "Germinado de alfalfa fresco",
    "categoria": "verdura",
    "porcion": "1 taza (33g)",
    "unidadBase": "taza",
    "gramosReferencia": 33,
    "densidades": {
      "taza": 33,
      "cda": 5,
      "g": 1
    },
    "macros": {
      "calories": 8,
      "protein": 1.3,
      "carbs": 0.7,
      "fat": 0.2
    }
  },
  {
    "id": "staple-berenjena",
    "nombre": "Berenjena asada en rebanadas o cubos",
    "categoria": "verdura",
    "porcion": "1 taza (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 100,
    "densidades": {
      "taza": 100,
      "rebanada": 30,
      "pieza": 300,
      "g": 1
    },
    "macros": {
      "calories": 25,
      "protein": 1,
      "carbs": 6,
      "fat": 0.2
    }
  },
  {
    "id": "staple-flor-calabaza",
    "nombre": "Flor de calabaza limpia cocida",
    "categoria": "verdura",
    "porcion": "1 taza (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 100,
    "densidades": {
      "taza": 100,
      "g": 1
    },
    "macros": {
      "calories": 15,
      "protein": 1.5,
      "carbs": 2.8,
      "fat": 0.2
    }
  },
  {
    "id": "staple-verdolagas",
    "nombre": "Verdolagas cocidas de la olla",
    "categoria": "verdura",
    "porcion": "1 taza cocida (120g)",
    "unidadBase": "taza",
    "gramosReferencia": 120,
    "densidades": {
      "taza": 120,
      "g": 1
    },
    "macros": {
      "calories": 20,
      "protein": 2.4,
      "carbs": 3.6,
      "fat": 0.4
    }
  },
  {
    "id": "staple-chile-serrano",
    "nombre": "Chile serrano o jalapeño fresco picado",
    "categoria": "verdura",
    "porcion": "1 pieza (15g)",
    "unidadBase": "pieza",
    "gramosReferencia": 15,
    "densidades": {
      "pieza": 15,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 6,
      "protein": 0.3,
      "carbs": 1.3,
      "fat": 0.1
    }
  },
  {
    "id": "staple-cilantro",
    "nombre": "Cilantro fresco picado",
    "categoria": "verdura",
    "porcion": "2 cucharadas (10g)",
    "unidadBase": "cda",
    "gramosReferencia": 5,
    "densidades": {
      "cda": 5,
      "taza": 40,
      "g": 1
    },
    "macros": {
      "calories": 1.2,
      "protein": 0.1,
      "carbs": 0.2,
      "fat": 0.02
    }
  },
  {
    "id": "staple-manzana",
    "nombre": "Manzana verde o roja",
    "categoria": "fruta",
    "porcion": "1 pieza mediana (140g)",
    "unidadBase": "pieza",
    "gramosReferencia": 140,
    "densidades": {
      "pieza": 140,
      "taza": 125,
      "g": 1
    },
    "macros": {
      "calories": 72,
      "protein": 0.4,
      "carbs": 19,
      "fat": 0.2
    }
  },
  {
    "id": "staple-manzana-cubos",
    "nombre": "Manzana picada en cubos (sin corazón)",
    "categoria": "fruta",
    "porcion": "1 taza (125g)",
    "unidadBase": "taza",
    "gramosReferencia": 125,
    "densidades": {
      "taza": 125,
      "g": 1
    },
    "macros": {
      "calories": 65,
      "protein": 0.3,
      "carbs": 17,
      "fat": 0.2
    }
  },
  {
    "id": "staple-platano",
    "nombre": "Plátano / Banano",
    "categoria": "fruta",
    "porcion": "1/2 pieza (60g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 105,
      "protein": 1.3,
      "carbs": 27,
      "fat": 0.4
    }
  },
  {
    "id": "staple-platano-macho",
    "nombre": "Plátano macho cocido o al vapor",
    "categoria": "fruta",
    "porcion": "1/3 pieza (50g)",
    "unidadBase": "pieza",
    "gramosReferencia": 150,
    "densidades": {
      "pieza": 150,
      "rebanada": 15,
      "taza": 160,
      "g": 1
    },
    "macros": {
      "calories": 180,
      "protein": 2,
      "carbs": 47,
      "fat": 0.4
    }
  },
  {
    "id": "staple-fresas",
    "nombre": "Fresas frescas",
    "categoria": "fruta",
    "porcion": "1 taza entera (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "pieza": 15,
      "g": 1
    },
    "macros": {
      "calories": 48,
      "protein": 1,
      "carbs": 11.5,
      "fat": 0.5
    }
  },
  {
    "id": "staple-fresas-congeladas",
    "nombre": "Fresas congeladas para smoothie",
    "categoria": "fruta",
    "porcion": "1 taza entera (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 48,
      "protein": 1,
      "carbs": 11.5,
      "fat": 0.5
    }
  },
  {
    "id": "staple-papaya",
    "nombre": "Papaya picada en cubos",
    "categoria": "fruta",
    "porcion": "1 taza en cubos (140g)",
    "unidadBase": "taza",
    "gramosReferencia": 140,
    "densidades": {
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 55,
      "protein": 0.7,
      "carbs": 13.8,
      "fat": 0.2
    }
  },
  {
    "id": "staple-pina",
    "nombre": "Piña picada en cubos",
    "categoria": "fruta",
    "porcion": "3/4 taza (120g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "rebanada": 80,
      "g": 1
    },
    "macros": {
      "calories": 80,
      "protein": 0.9,
      "carbs": 21,
      "fat": 0.2
    }
  },
  {
    "id": "staple-melon",
    "nombre": "Melón picado",
    "categoria": "fruta",
    "porcion": "1 taza (160g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "g": 1
    },
    "macros": {
      "calories": 54,
      "protein": 1.3,
      "carbs": 13,
      "fat": 0.3
    }
  },
  {
    "id": "staple-melon-cantaloupe",
    "nombre": "Melón cantaloupe / chino picado en cubos",
    "categoria": "fruta",
    "porcion": "1 taza (160g)",
    "unidadBase": "taza",
    "gramosReferencia": 160,
    "densidades": {
      "taza": 160,
      "g": 1
    },
    "macros": {
      "calories": 54,
      "protein": 1.3,
      "carbs": 13,
      "fat": 0.3
    }
  },
  {
    "id": "staple-sandia",
    "nombre": "Sandía en cubos",
    "categoria": "fruta",
    "porcion": "1 taza (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "rebanada": 120,
      "g": 1
    },
    "macros": {
      "calories": 45,
      "protein": 0.9,
      "carbs": 11.5,
      "fat": 0.2
    }
  },
  {
    "id": "staple-naranja",
    "nombre": "Naranja en gajos",
    "categoria": "fruta",
    "porcion": "1 pieza mediana (150g)",
    "unidadBase": "pieza",
    "gramosReferencia": 150,
    "densidades": {
      "pieza": 150,
      "taza": 180,
      "g": 1
    },
    "macros": {
      "calories": 65,
      "protein": 1.3,
      "carbs": 16,
      "fat": 0.2
    }
  },
  {
    "id": "staple-frutos-rojos",
    "nombre": "Frutos rojos mixtos (arándanos, frambuesas, moras)",
    "categoria": "fruta",
    "porcion": "3/4 taza (100g)",
    "unidadBase": "taza",
    "gramosReferencia": 140,
    "densidades": {
      "taza": 140,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 57,
      "protein": 1,
      "carbs": 14,
      "fat": 0.5
    }
  },
  {
    "id": "staple-mango-ataulfo",
    "nombre": "Mango Ataulfo dulce maduro",
    "categoria": "fruta",
    "porcion": "1 pieza mediana limpia (120g)",
    "unidadBase": "pieza",
    "gramosReferencia": 120,
    "densidades": {
      "pieza": 120,
      "taza": 165,
      "g": 1
    },
    "macros": {
      "calories": 72,
      "protein": 0.9,
      "carbs": 18,
      "fat": 0.3
    }
  },
  {
    "id": "staple-mango-petacon",
    "nombre": "Mango Petacón / Tommy en cubos",
    "categoria": "fruta",
    "porcion": "1/2 taza en cubos (80g)",
    "unidadBase": "taza",
    "gramosReferencia": 165,
    "densidades": {
      "taza": 165,
      "pieza": 250,
      "g": 1
    },
    "macros": {
      "calories": 99,
      "protein": 1.4,
      "carbs": 24.8,
      "fat": 0.6
    }
  },
  {
    "id": "staple-guayaba",
    "nombre": "Guayaba dulce fresca",
    "categoria": "fruta",
    "porcion": "2 piezas medianas (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 50,
    "densidades": {
      "pieza": 50,
      "taza": 165,
      "g": 1
    },
    "macros": {
      "calories": 34,
      "protein": 1.3,
      "carbs": 7.2,
      "fat": 0.5
    }
  },
  {
    "id": "staple-uvas-verdes",
    "nombre": "Uvas verdes sin semilla",
    "categoria": "fruta",
    "porcion": "1 taza (150g / aprox. 30 uvas)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "pieza": 5,
      "g": 1
    },
    "macros": {
      "calories": 104,
      "protein": 1.1,
      "carbs": 27.2,
      "fat": 0.2
    }
  },
  {
    "id": "staple-uvas-rojas",
    "nombre": "Uvas rojas / globo frescas",
    "categoria": "fruta",
    "porcion": "1 taza (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "pieza": 6,
      "g": 1
    },
    "macros": {
      "calories": 104,
      "protein": 1.1,
      "carbs": 27.2,
      "fat": 0.2
    }
  },
  {
    "id": "staple-durazno",
    "nombre": "Durazno amarillo / melocotón fresco",
    "categoria": "fruta",
    "porcion": "1 pieza mediana (130g)",
    "unidadBase": "pieza",
    "gramosReferencia": 130,
    "densidades": {
      "pieza": 130,
      "taza": 150,
      "rebanada": 15,
      "g": 1
    },
    "macros": {
      "calories": 51,
      "protein": 1.2,
      "carbs": 12.4,
      "fat": 0.3
    }
  },
  {
    "id": "staple-nectarina",
    "nombre": "Nectarina fresca",
    "categoria": "fruta",
    "porcion": "1 pieza mediana (140g)",
    "unidadBase": "pieza",
    "gramosReferencia": 140,
    "densidades": {
      "pieza": 140,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 62,
      "protein": 1.5,
      "carbs": 15,
      "fat": 0.4
    }
  },
  {
    "id": "staple-kiwi",
    "nombre": "Kiwi fresco pelado",
    "categoria": "fruta",
    "porcion": "1 pieza mediana (75g)",
    "unidadBase": "pieza",
    "gramosReferencia": 75,
    "densidades": {
      "pieza": 75,
      "rebanada": 12,
      "taza": 180,
      "g": 1
    },
    "macros": {
      "calories": 46,
      "protein": 0.9,
      "carbs": 11,
      "fat": 0.4
    }
  },
  {
    "id": "staple-pera",
    "nombre": "Pera D'Anjou / Mantequilla / Bosc",
    "categoria": "fruta",
    "porcion": "1/2 pieza grande (80g)",
    "unidadBase": "pieza",
    "gramosReferencia": 160,
    "densidades": {
      "pieza": 160,
      "rebanada": 20,
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 91,
      "protein": 0.6,
      "carbs": 24,
      "fat": 0.2
    }
  },
  {
    "id": "staple-mandarina",
    "nombre": "Mandarina / Clementina en gajos",
    "categoria": "fruta",
    "porcion": "2 piezas medianas (180g)",
    "unidadBase": "pieza",
    "gramosReferencia": 90,
    "densidades": {
      "pieza": 90,
      "taza": 180,
      "g": 1
    },
    "macros": {
      "calories": 48,
      "protein": 0.7,
      "carbs": 12,
      "fat": 0.3
    }
  },
  {
    "id": "staple-toronja",
    "nombre": "Toronja / Pomelo fresco en mitades o gajos",
    "categoria": "fruta",
    "porcion": "1/2 pieza (100g)",
    "unidadBase": "pieza",
    "gramosReferencia": 200,
    "densidades": {
      "pieza": 200,
      "taza": 200,
      "g": 1
    },
    "macros": {
      "calories": 84,
      "protein": 1.6,
      "carbs": 21,
      "fat": 0.2
    }
  },
  {
    "id": "staple-ciruela-roja",
    "nombre": "Ciruela roja o negra fresca",
    "categoria": "fruta",
    "porcion": "2 piezas (130g)",
    "unidadBase": "pieza",
    "gramosReferencia": 65,
    "densidades": {
      "pieza": 65,
      "taza": 165,
      "g": 1
    },
    "macros": {
      "calories": 30,
      "protein": 0.5,
      "carbs": 7.5,
      "fat": 0.2
    }
  },
  {
    "id": "staple-ciruela-pasa",
    "nombre": "Ciruela pasa sin hueso",
    "categoria": "fruta",
    "porcion": "3 piezas (24g)",
    "unidadBase": "pieza",
    "gramosReferencia": 8,
    "densidades": {
      "pieza": 8,
      "cda": 15,
      "taza": 170,
      "g": 1
    },
    "macros": {
      "calories": 19,
      "protein": 0.2,
      "carbs": 5.1,
      "fat": 0.03
    }
  },
  {
    "id": "staple-tuna-verde",
    "nombre": "Tuna verde fresca pelada",
    "categoria": "fruta",
    "porcion": "2 piezas (160g)",
    "unidadBase": "pieza",
    "gramosReferencia": 80,
    "densidades": {
      "pieza": 80,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 33,
      "protein": 0.6,
      "carbs": 7.7,
      "fat": 0.4
    }
  },
  {
    "id": "staple-tuna-roja",
    "nombre": "Tuna roja / cardona pelada",
    "categoria": "fruta",
    "porcion": "2 piezas (160g)",
    "unidadBase": "pieza",
    "gramosReferencia": 80,
    "densidades": {
      "pieza": 80,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 33,
      "protein": 0.6,
      "carbs": 7.7,
      "fat": 0.4
    }
  },
  {
    "id": "staple-jicama",
    "nombre": "Jícama picada en tiras o cubos con limón y chile",
    "categoria": "fruta",
    "porcion": "1 taza (130g)",
    "unidadBase": "taza",
    "gramosReferencia": 130,
    "densidades": {
      "taza": 130,
      "g": 1
    },
    "macros": {
      "calories": 49,
      "protein": 0.9,
      "carbs": 11.5,
      "fat": 0.1
    }
  },
  {
    "id": "staple-mamey",
    "nombre": "Mamey / Zapote mamey en rebanadas",
    "categoria": "fruta",
    "porcion": "1/3 pieza o 1 taza (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "rebanada": 80,
      "pieza": 350,
      "g": 1
    },
    "macros": {
      "calories": 186,
      "protein": 2.2,
      "carbs": 48,
      "fat": 0.7
    }
  },
  {
    "id": "staple-granada",
    "nombre": "Granada roja desgranada",
    "categoria": "fruta",
    "porcion": "1/2 taza (75g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 125,
      "protein": 2.5,
      "carbs": 28,
      "fat": 1.8
    }
  },
  {
    "id": "staple-higo",
    "nombre": "Higo fresco dulce",
    "categoria": "fruta",
    "porcion": "2 piezas medianas (90g)",
    "unidadBase": "pieza",
    "gramosReferencia": 45,
    "densidades": {
      "pieza": 45,
      "g": 1
    },
    "macros": {
      "calories": 34,
      "protein": 0.3,
      "carbs": 8.6,
      "fat": 0.1
    }
  },
  {
    "id": "staple-datil",
    "nombre": "Dátil Medjool sin hueso",
    "categoria": "fruta",
    "porcion": "1 pieza (24g)",
    "unidadBase": "pieza",
    "gramosReferencia": 24,
    "densidades": {
      "pieza": 24,
      "g": 1
    },
    "macros": {
      "calories": 66,
      "protein": 0.4,
      "carbs": 18,
      "fat": 0.04
    }
  },
  {
    "id": "staple-pasitas",
    "nombre": "Pasitas / Uva pasa",
    "categoria": "fruta",
    "porcion": "1 cucharada (12g)",
    "unidadBase": "cda",
    "gramosReferencia": 12,
    "densidades": {
      "cda": 12,
      "taza": 150,
      "g": 1
    },
    "macros": {
      "calories": 36,
      "protein": 0.4,
      "carbs": 9.5,
      "fat": 0.06
    }
  },
  {
    "id": "staple-arandanos-deshidratados",
    "nombre": "Arándanos deshidratados (craisins)",
    "categoria": "fruta",
    "porcion": "1 cucharada (12g)",
    "unidadBase": "cda",
    "gramosReferencia": 12,
    "densidades": {
      "cda": 12,
      "taza": 120,
      "g": 1
    },
    "macros": {
      "calories": 37,
      "protein": 0.1,
      "carbs": 9.8,
      "fat": 0.1
    }
  },
  {
    "id": "staple-blueberries",
    "nombre": "Arándanos azules frescos / Blueberries",
    "categoria": "fruta",
    "porcion": "3/4 taza (110g)",
    "unidadBase": "taza",
    "gramosReferencia": 150,
    "densidades": {
      "taza": 150,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 85,
      "protein": 1.1,
      "carbs": 21.5,
      "fat": 0.5
    }
  },
  {
    "id": "staple-frambuesas",
    "nombre": "Frambuesas frescas",
    "categoria": "fruta",
    "porcion": "1 taza (125g)",
    "unidadBase": "taza",
    "gramosReferencia": 125,
    "densidades": {
      "taza": 125,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 65,
      "protein": 1.5,
      "carbs": 14.9,
      "fat": 0.8
    }
  },
  {
    "id": "staple-zarzamoras",
    "nombre": "Zarzamoras frescas (blackberries)",
    "categoria": "fruta",
    "porcion": "1 taza (140g)",
    "unidadBase": "taza",
    "gramosReferencia": 140,
    "densidades": {
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 60,
      "protein": 2,
      "carbs": 13.8,
      "fat": 0.7
    }
  },
  {
    "id": "staple-cerezas",
    "nombre": "Cerezas frescas sin hueso",
    "categoria": "fruta",
    "porcion": "15 piezas (105g)",
    "unidadBase": "pieza",
    "gramosReferencia": 7,
    "densidades": {
      "pieza": 7,
      "taza": 140,
      "g": 1
    },
    "macros": {
      "calories": 4.4,
      "protein": 0.07,
      "carbs": 1.1,
      "fat": 0.01
    }
  },
  {
    "id": "staple-guanabana",
    "nombre": "Guanábana fresca en pulpa",
    "categoria": "fruta",
    "porcion": "1/2 taza de pulpa (90g)",
    "unidadBase": "taza",
    "gramosReferencia": 180,
    "densidades": {
      "taza": 180,
      "g": 1
    },
    "macros": {
      "calories": 120,
      "protein": 1.8,
      "carbs": 30,
      "fat": 0.5
    }
  },
  {
    "id": "staple-zapote-negro",
    "nombre": "Zapote negro en pulpa",
    "categoria": "fruta",
    "porcion": "1/2 pieza o 1/2 taza (90g)",
    "unidadBase": "taza",
    "gramosReferencia": 180,
    "densidades": {
      "taza": 180,
      "pieza": 150,
      "g": 1
    },
    "macros": {
      "calories": 142,
      "protein": 1.2,
      "carbs": 34,
      "fat": 0.2
    }
  },
  {
    "id": "staple-limon",
    "nombre": "Limón persa fresco / jugo",
    "categoria": "fruta",
    "porcion": "1 pieza (50g)",
    "unidadBase": "pieza",
    "gramosReferencia": 50,
    "densidades": {
      "pieza": 50,
      "cda": 15,
      "cdta": 5,
      "g": 1
    },
    "macros": {
      "calories": 15,
      "protein": 0.4,
      "carbs": 4.5,
      "fat": 0.1
    }
  },
  {
    "id": "staple-maracuya",
    "nombre": "Maracuyá fresco / pulpa de fruta de la pasión",
    "categoria": "fruta",
    "porcion": "1 pieza (40g)",
    "unidadBase": "pieza",
    "gramosReferencia": 40,
    "densidades": {
      "pieza": 40,
      "cda": 15,
      "taza": 180,
      "g": 1
    },
    "macros": {
      "calories": 39,
      "protein": 0.9,
      "carbs": 9.3,
      "fat": 0.3
    }
  },
  {
    "id": "staple-chavacano",
    "nombre": "Chavacano / Albaricoque fresco",
    "categoria": "fruta",
    "porcion": "3 piezas (105g)",
    "unidadBase": "pieza",
    "gramosReferencia": 35,
    "densidades": {
      "pieza": 35,
      "taza": 155,
      "g": 1
    },
    "macros": {
      "calories": 17,
      "protein": 0.5,
      "carbs": 3.9,
      "fat": 0.1
    }
  },
  {
    "id": "staple-carambola",
    "nombre": "Carambola / Fruta estrella rebanada",
    "categoria": "fruta",
    "porcion": "1 pieza mediana (90g)",
    "unidadBase": "pieza",
    "gramosReferencia": 90,
    "densidades": {
      "pieza": 90,
      "rebanada": 15,
      "taza": 110,
      "g": 1
    },
    "macros": {
      "calories": 28,
      "protein": 0.9,
      "carbs": 6,
      "fat": 0.3
    }
  },
  {
    "id": "staple-lichi",
    "nombre": "Lichi fresco pelado",
    "categoria": "fruta",
    "porcion": "8 piezas (80g)",
    "unidadBase": "pieza",
    "gramosReferencia": 10,
    "densidades": {
      "pieza": 10,
      "taza": 160,
      "g": 1
    },
    "macros": {
      "calories": 6.6,
      "protein": 0.08,
      "carbs": 1.6,
      "fat": 0.04
    }
  },
  {
    "id": "staple-acai",
    "nombre": "Pulpa de açaí puro sin azúcar",
    "categoria": "fruta",
    "porcion": "1 paquete / porción (100g)",
    "unidadBase": "porción",
    "gramosReferencia": 100,
    "densidades": {
      "porción": 100,
      "g": 1
    },
    "macros": {
      "calories": 70,
      "protein": 1,
      "carbs": 4,
      "fat": 5
    }
  },
  {
    "id": "staple-leche-deslactosada",
    "nombre": "Leche deslactosada light",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 95,
      "protein": 8.5,
      "carbs": 12,
      "fat": 1.5
    }
  },
  {
    "id": "staple-leche-descremada",
    "nombre": "Leche descremada / light tradicional",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 86,
      "protein": 8.3,
      "carbs": 12.2,
      "fat": 0.4
    }
  },
  {
    "id": "staple-leche-entera",
    "nombre": "Leche entera pasteurizada",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 149,
      "protein": 7.7,
      "carbs": 11.7,
      "fat": 7.9
    }
  },
  {
    "id": "staple-yogurt-griego",
    "nombre": "Yogurt griego natural sin azúcar (Chobani/Fage 0%)",
    "categoria": "lacteo",
    "porcion": "3/4 taza (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 200,
    "densidades": {
      "taza": 200,
      "cda": 20,
      "g": 1
    },
    "macros": {
      "calories": 118,
      "protein": 20,
      "carbs": 7.2,
      "fat": 0.8
    }
  },
  {
    "id": "staple-yogurt-natural",
    "nombre": "Yogurt natural tradicional sin azúcar",
    "categoria": "lacteo",
    "porcion": "3/4 taza (150g)",
    "unidadBase": "taza",
    "gramosReferencia": 200,
    "densidades": {
      "taza": 200,
      "cda": 20,
      "g": 1
    },
    "macros": {
      "calories": 100,
      "protein": 10,
      "carbs": 11,
      "fat": 2
    }
  },
  {
    "id": "staple-kefir",
    "nombre": "Kéfir natural líquido sin azúcar",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "g": 1
    },
    "macros": {
      "calories": 110,
      "protein": 11,
      "carbs": 9,
      "fat": 2.5
    }
  },
  {
    "id": "staple-jocoque",
    "nombre": "Jocoque seco artesanal",
    "categoria": "lacteo",
    "porcion": "2 cucharadas (40g)",
    "unidadBase": "cda",
    "gramosReferencia": 20,
    "densidades": {
      "cda": 20,
      "taza": 200,
      "porción": 30,
      "g": 1
    },
    "macros": {
      "calories": 30,
      "protein": 2.2,
      "carbs": 1.2,
      "fat": 1.8
    }
  },
  {
    "id": "staple-leche-almendras",
    "nombre": "Leche de almendras sin azúcar (Silk/Nature's Heart)",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 35,
      "protein": 1,
      "carbs": 1.5,
      "fat": 2.5
    }
  },
  {
    "id": "staple-leche-soya",
    "nombre": "Leche de soya sin azúcar",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 80,
      "protein": 7,
      "carbs": 4,
      "fat": 4
    }
  },
  {
    "id": "staple-leche-avena",
    "nombre": "Leche de avena sin azúcar",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 90,
      "protein": 2,
      "carbs": 14,
      "fat": 2.5
    }
  },
  {
    "id": "staple-leche-coco",
    "nombre": "Leche de coco para beber sin azúcar",
    "categoria": "lacteo",
    "porcion": "1 taza (240ml)",
    "unidadBase": "taza",
    "gramosReferencia": 240,
    "densidades": {
      "taza": 240,
      "ml": 1,
      "cda": 15,
      "g": 1
    },
    "macros": {
      "calories": 45,
      "protein": 0.5,
      "carbs": 1,
      "fat": 4.5
    }
  },
  {
    "id": "staple-proteina-whey",
    "nombre": "Proteína Whey Isolate en polvo",
    "categoria": "suplemento",
    "porcion": "1 scoop (30g)",
    "unidadBase": "scoop",
    "gramosReferencia": 30,
    "densidades": {
      "scoop": 30,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 115,
      "protein": 25,
      "carbs": 1.5,
      "fat": 0.8
    }
  },
  {
    "id": "staple-proteina-vegetal",
    "nombre": "Proteína vegetal en polvo (chícharo y arroz)",
    "categoria": "suplemento",
    "porcion": "1 scoop (30g)",
    "unidadBase": "scoop",
    "gramosReferencia": 30,
    "densidades": {
      "scoop": 30,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 120,
      "protein": 24,
      "carbs": 2,
      "fat": 1.5
    }
  },
  {
    "id": "staple-caseina",
    "nombre": "Caseína micelar en polvo",
    "categoria": "suplemento",
    "porcion": "1 scoop (30g)",
    "unidadBase": "scoop",
    "gramosReferencia": 30,
    "densidades": {
      "scoop": 30,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 110,
      "protein": 24,
      "carbs": 1,
      "fat": 0.8
    }
  },
  {
    "id": "staple-creatina",
    "nombre": "Creatina monohidratada en polvo",
    "categoria": "suplemento",
    "porcion": "1 scoop / cucharadita (5g)",
    "unidadBase": "scoop",
    "gramosReferencia": 5,
    "densidades": {
      "scoop": 5,
      "cdta": 5,
      "g": 1
    },
    "macros": {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  },
  {
    "id": "staple-colageno",
    "nombre": "Colágeno hidrolizado en polvo",
    "categoria": "suplemento",
    "porcion": "1 scoop (10g)",
    "unidadBase": "scoop",
    "gramosReferencia": 10,
    "densidades": {
      "scoop": 10,
      "cda": 10,
      "g": 1
    },
    "macros": {
      "calories": 36,
      "protein": 9,
      "carbs": 0,
      "fat": 0
    }
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

    // Coincidencia exacta o por id
    const exact = BASE_MEXICAN_STAPLES.find(s => 
      s.nombre.toLowerCase() === q ||
      s.id.toLowerCase() === q
    );
    if (exact) return exact;

    // Coincidencia prioritaria con palabras clave comunes
    return BASE_MEXICAN_STAPLES.find(s => {
      const sName = s.nombre.toLowerCase();
      const sId = s.id.toLowerCase();

      // Frutas específicas
      if (q.includes('mango')) {
        if (q.includes('petacon') || q.includes('petacón') || q.includes('tommy')) return sId === 'staple-mango-petacon';
        return sId === 'staple-mango-ataulfo';
      }
      if (q.includes('platano') || q.includes('plátano') || q.includes('banano')) {
        if (q.includes('macho')) return sId === 'staple-platano-macho';
        return sId === 'staple-platano';
      }
      if (q.includes('fresa')) {
        if (q.includes('congelad') || q.includes('smoothie')) return sId === 'staple-fresas-congeladas';
        return sId === 'staple-fresas';
      }
      if (q.includes('manzana')) {
        if (q.includes('cubo') || q.includes('picad')) return sId === 'staple-manzana-cubos';
        return sId === 'staple-manzana';
      }
      if (q.includes('melon') || q.includes('melón')) {
        if (q.includes('cantaloupe') || q.includes('chino')) return sId === 'staple-melon-cantaloupe';
        return sId === 'staple-melon';
      }
      if (q.includes('sandia') || q.includes('sandía')) return sId === 'staple-sandia';
      if (q.includes('papaya')) return sId === 'staple-papaya';
      if (q.includes('piña') || q.includes('pina')) return sId === 'staple-pina';
      if (q.includes('guayaba')) return sId === 'staple-guayaba';
      if (q.includes('uva')) {
        if (q.includes('roja') || q.includes('globo')) return sId === 'staple-uvas-rojas';
        return sId === 'staple-uvas-verdes';
      }
      if (q.includes('durazno') || q.includes('melocoton') || q.includes('melocotón')) return sId === 'staple-durazno';
      if (q.includes('nectarina')) return sId === 'staple-nectarina';
      if (q.includes('kiwi')) return sId === 'staple-kiwi';
      if (q.includes('pera')) return sId === 'staple-pera';
      if (q.includes('mandarina') || q.includes('clementina')) return sId === 'staple-mandarina';
      if (q.includes('toronja') || q.includes('pomelo')) return sId === 'staple-toronja';
      if (q.includes('ciruela')) {
        if (q.includes('pasa')) return sId === 'staple-ciruela-pasa';
        return sId === 'staple-ciruela-roja';
      }
      if (q.includes('tuna')) {
        if (q.includes('roja') || q.includes('cardona')) return sId === 'staple-tuna-roja';
        return sId === 'staple-tuna-verde';
      }
      if (q.includes('jicama') || q.includes('jícama')) return sId === 'staple-jicama';
      if (q.includes('mamey')) return sId === 'staple-mamey';
      if (q.includes('granada')) return sId === 'staple-granada';
      if (q.includes('higo')) return sId === 'staple-higo';
      if (q.includes('datil') || q.includes('dátil')) return sId === 'staple-datil';
      if (q.includes('pasita') || q.includes('pasitas') || q.includes('uva pasa')) return sId === 'staple-pasitas';
      if (q.includes('arandano') || q.includes('arándano') || q.includes('blueberry') || q.includes('blueberries')) {
        if (q.includes('deshidratad') || q.includes('seco')) return sId === 'staple-arandanos-deshidratados';
        return sId === 'staple-blueberries';
      }
      if (q.includes('frambuesa')) return sId === 'staple-frambuesas';
      if (q.includes('zarzamora') || q.includes('blackberry')) return sId === 'staple-zarzamoras';
      if (q.includes('cereza')) return sId === 'staple-cerezas';
      if (q.includes('guanabana') || q.includes('guanábana')) return sId === 'staple-guanabana';
      if (q.includes('zapote')) {
        if (q.includes('mamey')) return sId === 'staple-mamey';
        return sId === 'staple-zapote-negro';
      }
      if (q.includes('limon') || q.includes('limón') || q.includes('lima')) return sId === 'staple-limon';
      if (q.includes('maracuya') || q.includes('maracuyá')) return sId === 'staple-maracuya';
      if (q.includes('chavacano') || q.includes('albaricoque')) return sId === 'staple-chavacano';
      if (q.includes('carambola')) return sId === 'staple-carambola';
      if (q.includes('lichi')) return sId === 'staple-lichi';
      if (q.includes('acai') || q.includes('açaí')) return sId === 'staple-acai';

      // Verduras y vegetales específicos
      if (q.includes('coliflor')) {
        if (q.includes('arroz')) return sId === 'staple-arroz-coliflor';
        return sId === 'staple-coliflor';
      }
      if (q.includes('esparrago') || q.includes('espárrago')) return sId === 'staple-esparragos';
      if (q.includes('pimiento') || q.includes('morron') || q.includes('morrón')) {
        if (q.includes('verde')) return sId === 'staple-pimiento-verde';
        return sId === 'staple-pimiento-rojo';
      }
      if (q.includes('apio')) return sId === 'staple-apio';
      if (q.includes('ejote')) return sId === 'staple-ejotes';
      if (q.includes('betabel') || q.includes('remolacha')) return sId === 'staple-betabel';
      if (q.includes('portobello')) return sId === 'staple-portobello';
      if (q.includes('champinon') || q.includes('champiñón') || q.includes('champiñon') || q.includes('seta')) return sId === 'staple-champinones';
      if (q.includes('rabano') || q.includes('rábano')) return sId === 'staple-rabanos';
      if (q.includes('nopal')) return sId === 'staple-nopales-cocidos';
      if (q.includes('pico de gallo')) return sId === 'staple-pico-de-gallo';
      if (q.includes('salsa')) {
        if (q.includes('verde')) return sId === 'staple-salsa-verde';
        return sId === 'staple-salsa-taquera';
      }
      if (q.includes('cherry')) return sId === 'staple-jitomate-cherry';
      if (q.includes('jitomate') || q.includes('tomate')) {
        if (q.includes('verde') || q.includes('tomatillo')) return sId === 'staple-tomate-verde';
        if (q.includes('cherry')) return sId === 'staple-jitomate-cherry';
        if (q.includes('puré') || q.includes('pure')) return sId === 'staple-pure-tomate';
        return sId === 'staple-jitomate';
      }
      if (q.includes('cebolla')) {
        if (q.includes('cambray')) return sId === 'staple-cebollitas-cambray';
        if (q.includes('morada')) return sId === 'staple-cebolla-morada';
        return sId === 'staple-cebolla';
      }
      if (q.includes('lechuga')) return sId === 'staple-lechuga';
      if (q.includes('espinaca')) return sId === 'staple-espinacas';
      if (q.includes('acelga')) return sId === 'staple-acelgas';
      if (q.includes('calabacita') || q.includes('calabaza')) {
        if (q.includes('flor')) return sId === 'staple-flor-calabaza';
        return sId === 'staple-calabacita';
      }
      if (q.includes('chayote')) return sId === 'staple-chayote';
      if (q.includes('pepino')) return sId === 'staple-pepino';
      if (q.includes('zanahoria')) return sId === 'staple-zanahoria';
      if (q.includes('brocoli') || q.includes('brócoli')) return sId === 'staple-brocoli';

      // Proteínas específicas
      if (q.includes('aguacate') && sName.includes('aguacate')) return true;
      if (q.includes('tortilla')) {
        if (q.includes('nopal')) return sId === 'staple-tortilla-nopal';
        if (q.includes('harina')) {
          if (q.includes('integral')) return sId === 'staple-tortilla-harina-integral';
          return sId === 'staple-tortilla-harina-blanca';
        }
        return sId === 'staple-tortilla-maiz';
      }
      if (q.includes('pechuga') || q.includes('pollo')) {
        if (q.includes('deshebrad')) return sId === 'staple-pechuga-deshebrada';
        if (q.includes('muslo')) return sId === 'staple-muslo-pollo';
        if (q.includes('milanesa')) return sId === 'staple-milanesa-pollo';
        return sId === 'staple-pechuga-pollo';
      }
      if (q.includes('pavo')) return sId === 'staple-pechuga-pavo-horneada';
      if (q.includes('arroz')) {
        if (q.includes('jazmin') || q.includes('jazmín') || q.includes('basmati')) return sId === 'staple-arroz-jazmin';
        return sId === 'staple-arroz-cocido';
      }
      if (q.includes('frijol')) {
        if (q.includes('refrit')) return sId === 'staple-frijoles-refritos';
        if (q.includes('peruano') || q.includes('flor de mayo')) return sId === 'staple-frijoles-peruanos';
        return sId === 'staple-frijoles-olla';
      }
      if (q.includes('lenteja')) return sId === 'staple-lentejas-cocidas';
      if (q.includes('garbanzo')) return sId === 'staple-garbanzos-cocidos';
      if (q.includes('avena')) {
        if (q.includes('salvado') || q.includes('harina')) return sId === 'staple-salvado-avena';
        return sId === 'staple-avena';
      }
      if (q.includes('huevo')) {
        if (q.includes('clara')) {
          if (q.includes('liquida') || q.includes('líquida')) return sId === 'staple-clara-liquida';
          return sId === 'staple-clara-huevo';
        }
        if (q.includes('estrellado') || q.includes('revuelto')) return sId === 'staple-huevo-estrellado';
        return sId === 'staple-huevo-entero';
      }
      if (q.includes('clara')) {
        if (q.includes('liquida') || q.includes('líquida')) return sId === 'staple-clara-liquida';
        return sId === 'staple-clara-huevo';
      }
      if (q.includes('atun') || q.includes('atún')) {
        if (q.includes('medallon') || q.includes('medallón') || q.includes('fresco')) return sId === 'staple-medallon-atun';
        return sId === 'staple-atun-agua';
      }
      if (q.includes('salmon') || q.includes('salmón')) {
        if (q.includes('ahumad')) return sId === 'staple-salmon-ahumado';
        return sId === 'staple-salmon';
      }
      if (q.includes('bistec') || q.includes('res') || q.includes('carne')) {
        if (q.includes('molida')) return sId === 'staple-carne-molida-magra';
        if (q.includes('falda') || q.includes('deshebrad')) return sId === 'staple-falda-res';
        if (q.includes('milanesa')) return sId === 'staple-milanesa-res';
        if (q.includes('cecina')) return sId === 'staple-cecina-res';
        return sId === 'staple-bistec-res';
      }
      if (q.includes('panela')) return sId === 'staple-queso-panela';
      if (q.includes('oaxaca')) return sId === 'staple-queso-oaxaca';
      if (q.includes('cottage')) return sId === 'staple-cottage';
      if (q.includes('requeson') || q.includes('requesón')) return sId === 'staple-requeson';
      if (q.includes('mozzarella')) return sId === 'staple-mozzarella-light';
      if (q.includes('parmesano')) return sId === 'staple-queso-parmesano';
      if (q.includes('tofu')) return sId === 'staple-tofu-firme';
      if (q.includes('tempeh')) return sId === 'staple-tempeh';
      if (q.includes('edamame')) return sId === 'staple-edamames-desgranados';
      if (q.includes('hummus')) return sId === 'staple-hummus';
      if (q.includes('oliva')) return sId === 'staple-aceite-oliva';
      if (q.includes('creatina')) return sId === 'staple-creatina';
      if (q.includes('colageno') || q.includes('colágeno')) return sId === 'staple-colageno';
      if (q.includes('caseina') || q.includes('caseína')) return sId === 'staple-caseina';
      if (q.includes('proteina') || q.includes('whey') || q.includes('proteína')) {
        if (q.includes('vegetal')) return sId === 'staple-proteina-vegetal';
        return sId === 'staple-proteina-whey';
      }
      if (q.includes('kefir') || q.includes('kéfir')) return sId === 'staple-kefir';
      if (q.includes('jocoque')) return sId === 'staple-jocoque';
      if (q.includes('yogurt') || q.includes('yogur')) {
        if (q.includes('griego')) return sId === 'staple-yogurt-griego';
        return sId === 'staple-yogurt-natural';
      }

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
    const defaultQty = (defaultUnit === 'g' || defaultUnit === 'ml') ? defaultGrams : 1;

    return {
      cantidad: defaultQty,
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
      'whey protein': 'Proteína Whey en polvo',
      'mango': 'Mango fresco',
      'guava': 'Guayaba',
      'grapes': 'Uvas',
      'green grapes': 'Uvas verdes',
      'red grapes': 'Uvas rojas',
      'peach': 'Durazno',
      'nectarine': 'Nectarina',
      'kiwi': 'Kiwi',
      'pear': 'Pera',
      'tangerine': 'Mandarina',
      'grapefruit': 'Toronja',
      'plum': 'Ciruela',
      'prune': 'Ciruela pasa',
      'prunes': 'Ciruelas pasas',
      'prickly pear': 'Tuna',
      'cactus pear': 'Tuna',
      'jicama': 'Jícama',
      'pomegranate': 'Granada',
      'fig': 'Higo',
      'figs': 'Higos',
      'date': 'Dátil Medjool',
      'dates': 'Dátiles Medjool',
      'raisin': 'Pasitas',
      'raisins': 'Pasitas',
      'blueberry': 'Arándano azul (Blueberry)',
      'blueberries': 'Arándanos azules (Blueberries)',
      'raspberry': 'Frambuesa',
      'raspberries': 'Frambuesas',
      'blackberry': 'Zarzamora',
      'blackberries': 'Zarzamoras',
      'cherries': 'Cerezas',
      'cherry': 'Cereza',
      'lemon': 'Limón',
      'lime': 'Limón persa / verde',
      'watermelon': 'Sandía',
      'cantaloupe': 'Melón cantaloupe',
      'melon': 'Melón',
      'pineapple': 'Piña',
      'papaya': 'Papaya',
      'orange': 'Naranja',
      'passion fruit': 'Maracuyá',
      'apricot': 'Chavacano / Albaricoque',
      'starfruit': 'Carambola',
      'lychee': 'Lichi',
      'acai': 'Açaí',
      'cauliflower': 'Coliflor',
      'asparagus': 'Espárragos',
      'celery': 'Apio',
      'bell pepper': 'Pimiento morrón',
      'green beans': 'Ejotes',
      'beet': 'Betabel / Remolacha',
      'beets': 'Betabel / Remolacha',
      'cabbage': 'Col / Repollo',
      'mushrooms': 'Champiñones',
      'cucumber': 'Pepino',
      'carrot': 'Zanahoria',
      'carrots': 'Zanahorias',
      'broccoli': 'Brócoli',
      'turkey breast': 'Pechuga de pavo',
      'ground beef': 'Carne molida de res',
      'beef steak': 'Bistec de res',
      'shrimp': 'Camarones',
      'pork loin': 'Lomo de cerdo magro',
      'tofu': 'Tofu firme',
      'almonds': 'Almendras',
      'walnuts': 'Nueces',
      'chia seeds': 'Semillas de chía',
      'flaxseed': 'Semillas de linaza',
      'pumpkin seeds': 'Pepitas de calabaza',
      'sunflower seeds': 'Semillas de girasol',
      'greek yogurt': 'Yogurt griego sin azúcar',
      'almond milk': 'Leche de almendras',
      'soy milk': 'Leche de soya',
      'oat milk': 'Leche de avena',
      'coconut milk': 'Leche de coco',
      'creatine': 'Creatina monohidratada',
      'collagen': 'Colágeno hidrolizado'
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
    // Nivel 2: Catálogo Oficial Mexicano (SMAE) con normalización y prioridad
    // -------------------------------------------------------------
    const normalizeSearch = (text: string) => 
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const qClean = normalizeSearch(q);
    const qWords = qClean.split(/\s+/).filter(Boolean);

    const scoredStaples = BASE_MEXICAN_STAPLES.map(s => {
      const sNameNorm = normalizeSearch(s.nombre);
      const sIdNorm = normalizeSearch(s.id);
      let score = 0;

      if (sNameNorm === qClean || sIdNorm === qClean) {
        score += 1000;
      } else if (sNameNorm.startsWith(qClean)) {
        score += 500;
      } else if (new RegExp(`\\b${qClean}\\b`, 'i').test(sNameNorm)) {
        score += 300;
      } else if (qWords.length > 1 && qWords.every(w => sNameNorm.includes(w))) {
        score += 100;
      } else if (sNameNorm.includes(qClean)) {
        score += 50;
      }

      return { staple: s, score };
    }).filter(item => item.score > 0);

    scoredStaples.sort((a, b) => b.score - a.score);
    const stapleMatches = scoredStaples.map(item => item.staple);

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
   *
   * IMPORTANTE: baseMacros siempre se calculan como MACROS POR GRAMO (per-gram).
   * Esto garantiza que al cambiar cantidad o unidad, la fórmula sea:
   *   totalGrams = cantidad × gramsPerUnit(unidad)
   *   macros = baseMacros × totalGrams
   */
  static ensureDishIngredients(dish: DishItem): DishIngredient[] {
    if (dish.ingredientesDetalle && dish.ingredientesDetalle.length > 0) {
      return dish.ingredientesDetalle.map(ing => {
        let cleanUnit = this.normalizeUnitKey(ing.unidad);
        let qty = ing.cantidad;
        let totalGrams = ing.gramosEquivalentes || this.calculateIngredientGrams(qty, cleanUnit, ing.nombre);

        // Auto-reparación de inconsistencias previas (ej. "1 g" con ≈ 100g de bistec)
        if (cleanUnit === 'g' && qty === 1 && totalGrams > 10) {
          const staple = this.findStapleMatch(ing.nombre);
          if (staple && staple.unidadBase === 'pieza') {
            cleanUnit = 'pieza';
            qty = 1;
          } else {
            qty = totalGrams;
          }
        }

        const safeGrams = Math.max(1, totalGrams);
        return {
          ...ing,
          cantidad: qty,
          unidad: cleanUnit,
          gramosEquivalentes: totalGrams,
          // baseMacros = macros per 1 gram (invariant anchor for all scaling)
          baseMacros: {
            calories: ing.macros.calories / safeGrams,
            protein: ing.macros.protein / safeGrams,
            carbs: ing.macros.carbs / safeGrams,
            fat: ing.macros.fat / safeGrams
          }
        };
      });
    }

    const stringList = dish.ingredientes || [];
    if (stringList.length === 0) {
      // Single ingredient fallback — baseMacros per gram (assume ~100g serving)
      const fallbackGrams = 100;
      return [{
        id: `ing_${Date.now()}`,
        nombre: dish.nombre,
        cantidad: 1,
        unidad: 'porción',
        gramosEquivalentes: fallbackGrams,
        macros: { ...dish.macros },
        baseMacros: {
          calories: dish.macros.calories / fallbackGrams,
          protein: dish.macros.protein / fallbackGrams,
          carbs: dish.macros.carbs / fallbackGrams,
          fat: dish.macros.fat / fallbackGrams
        }
      }];
    }

    const count = stringList.length;
    return stringList.map((ingStr, idx) => {
      const parsed = this.parseIngredientString(ingStr);
      const staple = this.findStapleMatch(parsed.nombre);
      const totalGrams = parsed.gramosEquivalentes || 50;
      const safeGrams = Math.max(1, totalGrams);

      let itemMacros: { calories: number; protein: number; carbs: number; fat: number };

      if (staple) {
        // Use real SMAE macros scaled to the parsed grams
        const factor = totalGrams / (staple.gramosReferencia || 100);
        itemMacros = {
          calories: Math.round(staple.macros.calories * factor),
          protein: +(staple.macros.protein * factor).toFixed(1),
          carbs: +(staple.macros.carbs * factor).toFixed(1),
          fat: +(staple.macros.fat * factor).toFixed(1)
        };
      } else {
        // No SMAE match — distribute dish macros proportionally
        itemMacros = {
          calories: Math.round(dish.macros.calories / count),
          protein: +(dish.macros.protein / count).toFixed(1),
          carbs: +(dish.macros.carbs / count).toFixed(1),
          fat: +(dish.macros.fat / count).toFixed(1)
        };
      }

      return {
        id: `ing_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nombre: parsed.nombre,
        cantidad: parsed.cantidad,
        unidad: parsed.unidad,
        gramosEquivalentes: totalGrams,
        macros: itemMacros,
        // baseMacros = macros per 1 gram
        baseMacros: {
          calories: itemMacros.calories / safeGrams,
          protein: itemMacros.protein / safeGrams,
          carbs: itemMacros.carbs / safeGrams,
          fat: itemMacros.fat / safeGrams
        }
      };
    });
  }
}
