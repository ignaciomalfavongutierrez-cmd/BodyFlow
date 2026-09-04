export type MealTimeKey = 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena' | 'snack' | string;

export interface MealTimeCatalogItem {
  key: string;
  label: string;
  defaultTime: string;
  icon: string;
}

export const MEAL_TIMES_CATALOG: MealTimeCatalogItem[] = [
  { key: 'desayuno', label: 'Desayuno', defaultTime: '08:30 AM', icon: '🍳' },
  { key: 'colacion_1', label: 'Colación Matutina', defaultTime: '11:30 AM', icon: '🍏' },
  { key: 'comida', label: 'Comida', defaultTime: '02:30 PM', icon: '🍲' },
  { key: 'colacion_2', label: 'Colación Vespertina', defaultTime: '05:30 PM', icon: '🥜' },
  { key: 'cena', label: 'Cena', defaultTime: '08:30 PM', icon: '🥗' },
  { key: 'snack', label: 'Snack Opcional', defaultTime: '10:00 PM', icon: '🍵' },
];

export interface DishIngredient {
  id?: string;
  nombre: string;
  cantidad: number;
  unidad: string; // 'pieza', 'g', 'ml', 'taza', 'cucharada', etc.
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  baseMacros?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DishItem {
  id: string;
  nombre: string;
  descripcion?: string;
  porcion: string;
  categoria: MealTimeKey;
  ingredientes: string[];
  ingredientesDetalle?: DishIngredient[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  notas?: string;
  esPersonalizado?: boolean;
}

export interface DayMenuSchedule {
  diaId: string;
  diaNombre: string;
  comidas: Record<string, DishItem[]>;
}

export type MenuScheduleType = 'dia_tipo' | 'semana_fin' | 'siete_dias';

export interface DietPlanMenu {
  id?: string;
  planId: string;
  tipoEstructura: MenuScheduleType;
  tiemposComida: string[];
  tiemposComidaConfig?: MealTimeCatalogItem[];
  dias: DayMenuSchedule[];
  notasGenerales?: string;
  updatedAt: string;
}
