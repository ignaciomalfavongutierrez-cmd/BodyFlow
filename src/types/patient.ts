import type { ClinicalRecord, BiologicalSex } from './patientProgress';
import type { DietPlanMenu } from './dietMenu';

export type { BiologicalSex };
export type PatientStatus = 'activo' | 'seguimiento' | 'inactivo' | 'pausado';
export type AppointmentStatus = 'programada' | 'completada' | 'cancelada' | 'no_asistio';
export type AppointmentType = 'primera_vez' | 'seguimiento' | 'revision_plan' | 'urgencia' | 'online' | 'presencial';
export type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'muy_intenso';

/**
 * Root Document in Firestore: `pacientes/{patientId}`
 */
export interface Patient {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  edad?: number | string;
  sexo: BiologicalSex;
  ocupacion?: string;
  motivoConsulta?: string;
  objetivoPrincipal?: string; // ej. 'Pérdida de grasa', 'Hipertrofia muscular', 'Recomposición corporal', 'Salud digestiva / clínica'
  status: PatientStatus;
  alertasMedicas: string[]; // Alergias prioritarias, patologías graves (Diabetes, Hipotiroidismo, etc.)
  metas: {
    metaPeso?: number | string;
    metaGrasa?: number | string;
    metaMusculo?: number | string;
    fechaObjetivo?: string;
    notas?: string;
  };
  tags?: string[]; // ej. ['Atleta', 'Vegano', 'Matutino', 'Presencial', 'Online']
  notasGenerales?: string;
  ultimaConsulta?: string;
  proximaCita?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Subcollection: `pacientes/{patientId}/historial_clinico/main`
 */
export interface ClinicalHistory {
  id?: string;
  antecedentesPatologicos?: string[]; // ej. ['Diabetes tipo 2', 'Gastritis', 'Hipertensión']
  antecedentesHeredofamiliares?: string;
  medicamentosActuales?: string;
  suplementacion?: string;
  alergiasIntolerancias?: string[]; // ej. ['Mariscos', 'Lactosa', 'Gluten', 'Cacahuates']
  preferenciasAlimentarias?: {
    gustosFavoritos?: string[];
    aversionesDisgustos?: string[];
    recordatorio24h?: string;
    comidasAlDia?: number;
    consumoAguaLitros?: number;
    restriccionesEspeciales?: string; // ej. 'Vegetariano', 'Sin carnes rojas', 'Kosher'
  };
  estiloDeVida?: {
    nivelActividad?: ActivityLevel;
    actividadFisicaDetalle?: string;
    horasSueno?: number;
    nivelEstres?: 'bajo' | 'medio' | 'alto';
    consumoAlcoholTabaco?: string;
  };
  sintomasDigestivos?: string[]; // ej. ['Distensión abdominal', 'Reflujo matutino', 'Estreñimiento']
  observacionesGenerales?: string;
  updatedAt?: any;
}

/**
 * Subcollection: `pacientes/{patientId}/citas/{citaId}`
 */
export interface PatientAppointment {
  id: string;
  fecha: string; // 'YYYY-MM-DD' o legible
  hora?: string; // '10:00 AM'
  tipo: AppointmentType;
  motivo: string;
  status: AppointmentStatus;
  notasEvolucion?: string; // Notas clínicas del especialista (SOAP)
  acuerdosCompromisos?: string;
  proximaCitaSugerida?: string;
  createdAt: any;
  updatedAt?: any;
}

/**
 * Subcollection: `pacientes/{patientId}/mediciones/{medicionId}`
 * Compatible 1:1 con ClinicalRecord para el motor de gráficas
 */
export interface PatientMeasurement extends ClinicalRecord {
  id: string;
  notasConsulta?: string;
  createdAt: any;
}

export interface PatientPlanCalculationSnapshot {
  pesoUtilizado?: number;
  tallaUtilizada?: number;
  edadUtilizada?: number;
  sexoUtilizado?: BiologicalSex;
  grasaPorcentajeUtilizada?: number | null;
  masaMagraKgUtilizada?: number | null;
  nivelActividadUtilizado?: ActivityLevel;
  actividadFisicaDetalle?: string;
  factorActividad?: number;
  tmbCalculada?: number;
  metodoTmb?: string;
  getCalculado?: number;
  ajusteCaloricoObjetivo?: number; // +/- kcal
  caloriasObjetivo?: number;
  metodoProteina?: string;
  gKgProteina?: number;
  proteinaGramos?: number;
  metodoGrasas?: string;
  porcentajeGrasas?: number;
  grasasGramos?: number;
  carbosGramos?: number;
  alertasClinicasDetectadas?: string[];
  fechaCalculo?: string;
  formulaExplicacion?: {
    tmb?: string;
    get?: string;
    calorias?: string;
    proteina?: string;
    grasas?: string;
    carbos?: string;
  };
}

/**
 * Subcollection: `pacientes/{patientId}/planes_nutricionales/{planId}`
 */
export interface PatientDietPlan {
  id: string;
  nombre: string;
  fechaAsignacion: string;
  status: 'activo' | 'completado' | 'archivado';
  calorias: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  objetivo?: string;
  fuenteCalculo?: 'automatico' | 'manual' | 'ajustado';
  metodoCalculo?: string;
  calculoOriginal?: {
    calorias: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  ajustesNutriologo?: {
    calorias?: number;
    macros?: {
      protein?: number;
      carbs?: number;
      fat?: number;
    };
    motivoAjuste?: string;
  };
  parametrosCalculo?: PatientPlanCalculationSnapshot;
  advertenciasClinicas?: string[];
  comidasSugeridas?: number;
  menu?: DietPlanMenu;
  menuGenerado?: boolean;
  enlaceShoppingListId?: string;
  pdfUrl?: string;
  notas?: string;
  createdAt: any;
}

/**
 * Subcollection: `pacientes/{patientId}/archivos/{archivoId}`
 */
export interface PatientDeliverable {
  id: string;
  tipo: 'hoja_recomendaciones' | 'lista_compras' | 'grafica_progreso_pdf' | 'estudio_laboratorio' | 'otro';
  titulo: string;
  fecha: string;
  metadata?: Record<string, any>;
  url?: string;
  createdAt: any;
}
