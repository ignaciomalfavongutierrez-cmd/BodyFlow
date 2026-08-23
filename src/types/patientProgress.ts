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

export type CircumferenceKey = 'cadera' | 'cintura' | 'pecho' | 'brazo' | 'muslo' | 'pantorrilla';

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
  { key: 'brazo', label: 'Brazo / Bíceps', shortLabel: 'Brazo', color: 'rgb(16, 185, 129)', defaultActive: false },
  { key: 'muslo', label: 'Muslo', shortLabel: 'Muslo', color: 'rgb(236, 72, 153)', defaultActive: false },
  { key: 'pantorrilla', label: 'Pantorrilla', shortLabel: 'Pantorrilla', color: 'rgb(20, 184, 166)', defaultActive: false },
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
  Muslo?: number | string;
  Pantorrilla?: number | string;
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
