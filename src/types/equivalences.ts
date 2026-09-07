export type EquivalenceCategoryKey =
  | 'verduras'
  | 'frutas'
  | 'cereales'
  | 'leguminosas'
  | 'aoa'
  | 'lacteos'
  | 'grasas'
  | 'azucares_libres';

export interface EquivalenceFoodItem {
  id: string;
  nombre: string;
  porcion: string;
  gramosAprox?: number;
  medidaCasera: string;
  nota?: string;
  subcategoria?: string;
  icon?: string;
}

export interface EquivalenceAverageMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface EquivalenceGroup {
  key: EquivalenceCategoryKey;
  nombre: string;
  descripcionCorta: string;
  icon: string;
  colorTheme: {
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    headerBg: string;
    headerText: string;
    dotColor: string;
    // Tracking app style colors (neon/dark mode accents)
    trackingBg: string;
    trackingBorder: string;
    trackingText: string;
    trackingGlow: string;
  };
  macrosPromedio: EquivalenceAverageMacros;
  reglaIntercambio: string;
  alimentos: EquivalenceFoodItem[];
}

export interface EquivalenceSheetConfig {
  pacienteNombre?: string;
  fechaStr?: string;
  tituloPersonalizado?: string;
  indicacionesClinicas?: string;
  gruposSeleccionados?: EquivalenceCategoryKey[];
}
