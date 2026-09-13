import type { ClinicalRecord, BiologicalSex } from './patientProgress';
import type { DietPlanMenu } from './dietMenu';

export type { BiologicalSex };
export type PatientStatus = 'activo' | 'seguimiento' | 'inactivo' | 'pausado';
export type AppointmentStatus = 'programada' | 'completada' | 'cancelada' | 'no_asistio';
export type AppointmentType = 'primera_vez' | 'seguimiento' | 'revision_plan' | 'urgencia' | 'online' | 'presencial';
export type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'muy_intenso';

/**
 * Root Document in Firestore: `pacientes/{patientId}`
 * Datos clínicos compartidos accesibles para la Nutrióloga Propietaria (RW)
 * y el Paciente Vinculado (SOLO LECTURA).
 */
export interface Patient {
  id: string; // Inmutable tras creación
  ownerUid: string; // Firebase Auth UID de la nutrióloga dueña. Inmutable tras creación.
  userId?: string; // UID de cuenta de paciente vinculada. Controlado exclusivamente por la nutrióloga dueña.
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
  alertasMedicas?: string[]; // Alergias prioritarias, patologías graves (Persistido en /private/clinical)
  metas: {
    metaPeso?: number | string;
    metaGrasa?: number | string;
    metaMusculo?: number | string;
    fechaObjetivo?: string;
    notas?: string;
  };
  tags?: string[]; // ej. ['Atleta', 'Vegano', 'Matutino', 'Presencial', 'Online']
  notasGenerales?: string; // Notas generales de consulta (Persistido en /private/clinical)
  ultimaConsulta?: string;
  proximaCita?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Subcollection Document: `pacientes/{patientId}/private/clinical`
 * Acceso EXCLUSIVO para la Nutrióloga Propietaria (ownerUid).
 * DENY estricto para Paciente Vinculado y terceros.
 */
export interface PrivateClinicalData {
  alertasMedicas?: string[];
  notasGenerales?: string;
  observacionesClinicas?: string;
  diagnosticos?: string[];
  notasInternas?: string;
  updatedAt?: any;
}

/** Input for creating a new patient document (id, ownerUid, timestamps assigned at persistence) */
export type CreatePatientInput = Omit<Patient, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'> & {
  privateClinical?: Partial<PrivateClinicalData>;
};

/** Input for editing an existing patient document (id and ownerUid are immutable; userId is modifiable by owner) */
export type UpdatePatientInput = Partial<Omit<Patient, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>> & {
  privateClinical?: Partial<PrivateClinicalData>;
};

/** Definition for offline/local seed fixtures (no fake ownerUid) */
export type PatientSeed = Omit<Patient, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>;

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
 * Información de citas compartida y visible para el paciente (fecha, motivo, acuerdos, etc.)
 */
export interface PatientAppointment {
  id: string;
  fecha: string; // 'YYYY-MM-DD' o legible
  hora?: string; // '10:00 AM'
  tipo: AppointmentType;
  motivo: string;
  status: AppointmentStatus;
  notasEvolucion?: string; // En memoria / UI nutrióloga; persistido en citas_private/{citaId}
  acuerdosCompromisos?: string;
  proximaCitaSugerida?: string;
  createdAt: any;
  updatedAt?: any;
}

/**
 * Subcollection: `pacientes/{patientId}/citas_private/{citaId}`
 * Notas clínicas privadas del especialista (SOAP, observaciones internas).
 * Exclusivo nutrióloga dueña. DENY paciente.
 */
export interface AppointmentPrivateData {
  notasEvolucion?: string; // Notas clínicas del especialista (SOAP)
  observacionesClinicas?: string;
  notasInternas?: string;
  updatedAt?: any;
}

/**
 * Subcollection: `pacientes/{patientId}/mediciones/{medicionId}`
 * Métricas antropométricas compartidas y legibles por el paciente.
 */
export interface PatientMeasurement extends ClinicalRecord {
  id: string;
  notasConsulta?: string; // En memoria / UI nutrióloga; persistido en mediciones_private/{medicionId}
  createdAt: any;
}

/**
 * Subcollection: `pacientes/{patientId}/mediciones_private/{medicionId}`
 * Notas y observaciones clínicas de la medición. Exclusivo nutrióloga dueña.
 */
export interface MeasurementPrivateData {
  notasConsulta?: string;
  observacionesClinicas?: string;
  notasInternas?: string;
  updatedAt?: any;
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
  updatedAt?: any;
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
