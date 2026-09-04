/**
 * Patient Progress & Anthropometric Clinical Types
 */

export interface Skinfolds {
  tricep: number | null;
  bicep: number | null;
  subescapular: number | null;
  cresta: number | null;
  [key: string]: number | null;
}

export type BiologicalSex = 'H' | 'M';
export type FatSource = 'formula' | 'bascula';

export type CircumferenceKey = 
  | 'cadera' 
  | 'cintura' 
  | 'pecho' 
  | 'brazo' 
  | 'brazo_relajado'
  | 'brazo_contraido'
  | 'antebrazo'
  | 'muslo' 
  | 'muslo_medio'
  | 'pantorrilla'
  | 'hombros'
  | 'cuello';

export interface CircumferenceCatalogItem {
  key: CircumferenceKey;
  label: string;
  shortLabel: string;
  color: string;
  defaultActive: boolean;
}

export const CIRCUMFERENCE_CATALOG: CircumferenceCatalogItem[] = [
  { key: 'cadera', label: 'Cadera / Glúteo (Pompa)', shortLabel: 'Cadera/Pompa', color: 'rgb(139, 92, 246)', defaultActive: true },
  { key: 'cintura', label: 'Cintura', shortLabel: 'Cintura', color: 'rgb(59, 130, 246)', defaultActive: true },
  { key: 'pecho', label: 'Pecho / Tórax', shortLabel: 'Pecho', color: 'rgb(249, 115, 22)', defaultActive: false },
  { key: 'brazo', label: 'Brazo / Bíceps Relajado', shortLabel: 'Brazo', color: 'rgb(16, 185, 129)', defaultActive: false },
  { key: 'brazo_contraido', label: 'Brazo / Bíceps Contraído (Fuerza)', shortLabel: 'Bíceps (Contr.)', color: 'rgb(5, 150, 105)', defaultActive: false },
  { key: 'antebrazo', label: 'Antebrazo', shortLabel: 'Antebrazo', color: 'rgb(14, 165, 233)', defaultActive: false },
  { key: 'muslo', label: 'Muslo / Pierna (Máximo)', shortLabel: 'Muslo Máx', color: 'rgb(236, 72, 153)', defaultActive: false },
  { key: 'muslo_medio', label: 'Muslo / Pierna Medio', shortLabel: 'Muslo Med', color: 'rgb(219, 39, 119)', defaultActive: false },
  { key: 'pantorrilla', label: 'Pantorrilla / Gemelo', shortLabel: 'Pantorrilla', color: 'rgb(20, 184, 166)', defaultActive: false },
  { key: 'hombros', label: 'Hombros / Deltoides', shortLabel: 'Hombros', color: 'rgb(245, 158, 11)', defaultActive: false },
  { key: 'cuello', label: 'Cuello', shortLabel: 'Cuello', color: 'rgb(99, 102, 241)', defaultActive: false },
];

export interface ClinicalRecord {
  id?: string;
  Fecha: string;
  Edad: number | string;
  Peso: number | string;
  Talla: number | string;
  Cintura: number | string;
  Cadera: number | string;
  Pecho?: number | string;
  Brazo?: number | string;
  Brazo_Relajado?: number | string;
  Brazo_Contraido?: number | string;
  Antebrazo?: number | string;
  Muslo?: number | string;
  Muslo_Medio?: number | string;
  Pantorrilla?: number | string;
  Hombros?: number | string;
  Cuello?: number | string;
  Pliegues: Skinfolds;
  Suma_Pliegues: number | string;
  Suma_Manual?: boolean;
  Grasa_Bascula: number | string;
  Grasa_Formula: number | string;
  Grasa_Fuente: FatSource;
  Grasa_Porcentaje: number | null;
  Musculo_Kg: number | string;
  IMC: number | string;
  ICC: number | string;
  mostrarDetallePliegues?: boolean;
  mostrarDetalleCircunferencias?: boolean;
}

export type MetricTheme = 'indigo' | 'rose' | 'emerald' | 'sky' | 'fuchsia';

export interface MetricSummary {
  label: string;
  icon: string;
  unidad: string;
  inicio: string;
  actual: string;
  delta: number;
  favorable: boolean | null;
  sinCambio: boolean;
  theme?: MetricTheme;
}

export type AchievementCategory = 'peso' | 'grasa' | 'musculo' | 'cintura' | 'meta' | 'general';

export interface PatientAchievement {
  icon: string;
  texto: string;
  category?: AchievementCategory;
}

export interface ProgressFilters {
  peso: boolean;
  grasa: boolean;
  musculo: boolean;
}

export interface PatientGoals {
  metaPeso: string | number;
  metaGrasa: string | number;
}

export type SkinfoldKey = 'tricep' | 'bicep' | 'subescapular' | 'cresta';

export interface SkinfoldCatalogItem {
  key: SkinfoldKey;
  label: string;
}

export const SKIN_FOLD_CATALOG: SkinfoldCatalogItem[] = [
  { key: 'tricep', label: 'Tríceps' },
  { key: 'bicep', label: 'Bíceps' },
  { key: 'subescapular', label: 'Subescapular' },
  { key: 'cresta', label: 'Cresta ilíaca' },
];
