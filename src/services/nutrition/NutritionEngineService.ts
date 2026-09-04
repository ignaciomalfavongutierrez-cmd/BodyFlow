import type { ActivityLevel, BiologicalSex, ClinicalHistory } from '../../types/patient';
import type { PatientPlanCalculationSnapshot } from '../../types/patient';

export type BmrFormula = 'mifflin_st_jeor' | 'katch_mcardle' | 'harris_benedict' | 'fijo_kg';
export type ProteinStrategy = 'peso_total' | 'masa_magra' | 'porcentaje';
export type FatStrategy = 'porcentaje' | 'g_kg';

export interface PlanObjectiveOption {
  id: string;
  label: string;
  description: string;
  caloricDeltaPercent: number; // e.g. -20 for 20% deficit, +15 for 15% surplus
  proteinRangeGKg: [number, number]; // [min, max] g/kg
  fatRangePercent: [number, number]; // [min, max] % of total kcal
}

export const PLAN_OBJECTIVES: PlanObjectiveOption[] = [
  {
    id: 'Pérdida de grasa',
    label: 'Pérdida de grasa',
    description: 'Déficit calórico controlado (-15% a -25%) con alta proteína para preservar masa muscular.',
    caloricDeltaPercent: -20,
    proteinRangeGKg: [1.8, 2.4],
    fatRangePercent: [20, 28]
  },
  {
    id: 'Mantenimiento de peso',
    label: 'Mantenimiento de peso',
    description: 'Aporte isocalórico (100% GET) para estabilidad metabólica y consolidación de hábitos.',
    caloricDeltaPercent: 0,
    proteinRangeGKg: [1.4, 1.8],
    fatRangePercent: [25, 30]
  },
  {
    id: 'Ganancia de masa muscular',
    label: 'Ganancia de masa muscular',
    description: 'Superávit calórico optimizado (+10% a +15%) para hipertrofia con mínimo acúmulo adiposo.',
    caloricDeltaPercent: 12,
    proteinRangeGKg: [1.8, 2.2],
    fatRangePercent: [20, 25]
  },
  {
    id: 'Recomposición corporal',
    label: 'Recomposición corporal',
    description: 'Aporte normocalórico o déficit suave (-5% a -10%) con alta densidad proteica y entrenamiento de fuerza.',
    caloricDeltaPercent: -8,
    proteinRangeGKg: [2.0, 2.4],
    fatRangePercent: [22, 28]
  },
  {
    id: 'Ganancia de peso',
    label: 'Ganancia de peso',
    description: 'Superávit calórico elevado (+15% a +25%) para recuperación ponderal o bajo peso.',
    caloricDeltaPercent: 18,
    proteinRangeGKg: [1.6, 2.0],
    fatRangePercent: [25, 30]
  },
  {
    id: 'Rendimiento deportivo',
    label: 'Rendimiento deportivo',
    description: 'Aporte energético elevado con maximización de glucógeno y reposición de sustratos.',
    caloricDeltaPercent: 10,
    proteinRangeGKg: [1.6, 2.0],
    fatRangePercent: [20, 25]
  },
  {
    id: 'Salud digestiva / clínica',
    label: 'Salud digestiva / clínica',
    description: 'Enfoque terapéutico personalizado orientado a alivio de síntomas, tolerancia y recuperación.',
    caloricDeltaPercent: 0,
    proteinRangeGKg: [1.2, 1.6],
    fatRangePercent: [22, 28]
  },
  {
    id: 'Otro',
    label: 'Otro / Personalizado',
    description: 'Configuración libre y flexible según el criterio del profesional.',
    caloricDeltaPercent: 0,
    proteinRangeGKg: [1.4, 2.0],
    fatRangePercent: [25, 30]
  }
];

export interface NutritionEngineInput {
  peso: number | null; // kg
  talla: number | null; // cm
  edad: number | null; // años
  sexo: BiologicalSex; // 'H' | 'M'
  grasaPorcentaje?: number | null; // % grasa Siri / báscula
  musculoKg?: number | null; // kg masa muscular si existe
  nivelActividad?: ActivityLevel;
  actividadFisicaDetalle?: string;
  objetivoId: string; // ej. 'Pérdida de grasa'
  clinicalHistory?: ClinicalHistory | null;
  alertasMedicas?: string[];
  // Opciones de personalización de fórmulas
  metodoTmb?: BmrFormula;
  metodoProteina?: ProteinStrategy;
  customProteinaGKg?: number;
  metodoGrasas?: FatStrategy;
  customPorcentajeGrasas?: number;
  customCaloriasDelta?: number; // Override manual de déficit/superávit en kcal
}

export interface FormulaTooltipBreakdown {
  tmb: string;
  get: string;
  calorias: string;
  proteina: string;
  grasas: string;
  carbos: string;
  consistencia: string;
}

export interface NutritionEngineResult {
  isComplete: boolean;
  missingFields: string[];
  advertenciasClinicas: string[];
  tmb: number;
  factorActividad: number;
  get: number;
  caloriasObjetivo: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  macrosCalorias: {
    proteinKcal: number;
    carbsKcal: number;
    fatKcal: number;
    totalKcal: number;
  };
  macrosPorcentaje: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  gKgValores: {
    proteinGKg: number;
    carbsGKg: number;
    fatGKg: number;
  };
  snapshot: PatientPlanCalculationSnapshot;
  tooltips: FormulaTooltipBreakdown;
}

export class NutritionEngineService {
  /**
   * Obtiene el multiplicador de actividad física adaptado al nivel y detalle del deporte
   */
  public static getActivityMultiplier(
    nivel: ActivityLevel = 'sedentario',
    detalle = ''
  ): { factor: number; explicacion: string } {
    const d = (detalle || '').toLowerCase();
    const hasStrength = d.includes('pesas') || d.includes('gimnasio') || d.includes('fuerza') || d.includes('crossfit') || d.includes('hipertrofia');
    const hasCardio = d.includes('correr') || d.includes('ciclismo') || d.includes('natación') || d.includes('bici') || d.includes('maratón') || d.includes('futbol');

    let factor = 1.2;
    let label = 'Sedentario (1.20)';

    switch (nivel) {
      case 'sedentario':
        factor = 1.2;
        label = 'Sedentario (poco o ningún ejercicio: 1.20)';
        break;
      case 'ligero':
        factor = hasStrength ? 1.4 : 1.375;
        label = 'Ligero (1-3 días/sem: 1.375 - 1.40)';
        break;
      case 'moderado':
        factor = (hasStrength && hasCardio) ? 1.6 : 1.55;
        label = 'Moderado (3-5 días/sem: 1.55 - 1.60)';
        break;
      case 'intenso':
        factor = 1.725;
        label = 'Intenso (6-7 días/sem: 1.725)';
        break;
      case 'muy_intenso':
        factor = 1.9;
        label = 'Muy Intenso (Atleta de alto rendimiento: 1.90)';
        break;
      default:
        factor = 1.2;
        label = 'Sedentario (1.20)';
    }

    return { factor, explicacion: label };
  }

  /**
   * Calcula la Tasa Metabólica Basal (TMB) según el método seleccionado
   */
  public static calculateBMR(
    peso: number,
    talla: number,
    edad: number,
    sexo: BiologicalSex,
    grasaPorcentaje?: number | null,
    metodo: BmrFormula = 'mifflin_st_jeor'
  ): { tmb: number; formulaUsed: string; explicacion: string } {
    // Normalizar talla en cm
    const tallaCm = talla < 3 ? talla * 100 : talla;
    let tmb = 0;
    let formulaUsed = 'Mifflin-St Jeor';
    let explicacion = '';

    if (metodo === 'katch_mcardle' && grasaPorcentaje && grasaPorcentaje > 0 && grasaPorcentaje < 70) {
      // Masa libre de grasa (Lean Body Mass - LBM)
      const lbm = peso * (1 - (grasaPorcentaje / 100));
      tmb = Math.round(370 + (21.6 * lbm));
      formulaUsed = 'Katch-McArdle';
      explicacion = `Katch-McArdle: 370 + (21.6 × ${lbm.toFixed(1)}kg masa magra) = ${tmb} kcal`;
    } else if (metodo === 'harris_benedict') {
      if (sexo === 'H') {
        tmb = Math.round(88.362 + (13.397 * peso) + (4.799 * tallaCm) - (5.677 * edad));
        formulaUsed = 'Harris-Benedict (Revisada)';
        explicacion = `Harris-Benedict: 88.36 + (13.40 × ${peso}kg) + (4.80 × ${tallaCm}cm) - (5.68 × ${edad}a) = ${tmb} kcal`;
      } else {
        tmb = Math.round(447.593 + (9.247 * peso) + (3.098 * tallaCm) - (4.330 * edad));
        formulaUsed = 'Harris-Benedict (Revisada)';
        explicacion = `Harris-Benedict: 447.59 + (9.25 × ${peso}kg) + (3.10 × ${tallaCm}cm) - (4.33 × ${edad}a) = ${tmb} kcal`;
      }
    } else if (metodo === 'fijo_kg') {
      const kcalPorKg = sexo === 'H' ? 24 : 22;
      tmb = Math.round(peso * kcalPorKg);
      formulaUsed = 'Gasto Fijo Basal (kcal/kg)';
      explicacion = `Fórmula Rápida Basal: ${peso}kg × ${kcalPorKg} kcal/kg = ${tmb} kcal`;
    } else {
      // Por defecto: Mifflin-St Jeor (gold standard clínico)
      const base = (10 * peso) + (6.25 * tallaCm) - (5 * edad);
      tmb = Math.round(sexo === 'H' ? base + 5 : base - 161);
      formulaUsed = 'Mifflin-St Jeor';
      const sexAdj = sexo === 'H' ? '+ 5' : '- 161';
      explicacion = `Mifflin-St Jeor: (10 × ${peso}kg) + (6.25 × ${tallaCm}cm) - (5 × ${edad}a) ${sexAdj} = ${tmb} kcal`;
    }

    return { tmb: Math.max(tmb, 800), formulaUsed, explicacion };
  }

  /**
   * Analiza el historial clínico y genera advertencias contextuales
   */
  public static detectClinicalAlerts(
    history?: ClinicalHistory | null,
    alertasMedicas: string[] = []
  ): string[] {
    const warnings: string[] = [];
    const patologias = [
      ...(history?.antecedentesPatologicos || []),
      ...(alertasMedicas || [])
    ].map(p => p.toLowerCase());

    const medicamentos = (history?.medicamentosActuales || '').toLowerCase();
    const sintomas = (history?.sintomasDigestivos || []).map(s => s.toLowerCase());

    // 1. Enfermedad Renal
    if (patologias.some(p => p.includes('renal') || p.includes('riñón') || p.includes('nefro') || p.includes('glomerul'))) {
      warnings.push('⚠️ Condición Renal: Se detectó antecedente o alerta renal. Evaluar cuidadosamente el aporte proteico con base en función renal y creatinina.');
    }

    // 2. Diabetes / Resistencia a la Insulina
    if (patologias.some(p => p.includes('diabet') || p.includes('insulina') || p.includes('glucem') || p.includes('sop') || p.includes('metabólico'))) {
      warnings.push('⚠️ Control Glucémico: Paciente con Diabetes / Resistencia a la Insulina. Se recomienda modular la carga glucémica y distribución de carbohidratos complejos.');
    }

    // 3. Hipertensión / Cardiovascular
    if (patologias.some(p => p.includes('hipertens') || p.includes('cardio') || p.includes('presión') || p.includes('dislipidem') || p.includes('colesterol') || p.includes('triglicérid'))) {
      warnings.push('⚠️ Salud Cardiovascular: Antecedente de hipertensión o dislipidemia. Controlar el aporte de sodio y priorizar ácidos grasos monoinsaturados y omega-3.');
    }

    // 4. Hepática
    if (patologias.some(p => p.includes('hígado') || p.includes('hepat') || p.includes('esteatos') || p.includes('cirros'))) {
      warnings.push('⚠️ Condición Hepática: Considerar metabolismo hepático en la selección y fraccionamiento de macronutrientes.');
    }

    // 5. Gastrointestinal
    if (patologias.some(p => p.includes('gastrit') || p.includes('refluj') || p.includes('colit') || p.includes('crohn') || p.includes('eii')) ||
        sintomas.some(s => s.includes('reflujo') || s.includes('distensión') || s.includes('acidez') || s.includes('gastritis'))) {
      warnings.push('ℹ️ Contexto Digestivo: Molestias digestivas o gastritis reportadas. Fraccionar comidas en 4-5 tiempos y moderar condimentos grasos o irritantes.');
    }

    // 6. Alergias e Intolerancias
    const alergias = history?.alergiasIntolerancias || [];
    if (alergias.length > 0) {
      warnings.push(`🚫 Restricciones Alimentarias: ${alergias.join(', ')} registradas en el expediente clínico.`);
    }

    // 7. Medicamentos relevantes
    if (medicamentos.includes('cortico') || medicamentos.includes('prednison') || medicamentos.includes('metformina') || medicamentos.includes('levotirox')) {
      warnings.push('💊 Interacción Fármaco-Nutrimento: Paciente con medicación que puede incidir en metabolismo glucémico, tiroideo o balance hidroelectrolítico.');
    }

    return warnings;
  }

  /**
   * Ejecuta el pipeline completo de cálculo nutricional clínico
   */
  public static calculateNutritionPlan(input: NutritionEngineInput): NutritionEngineResult {
    const missingFields: string[] = [];
    if (!input.peso || input.peso <= 0) missingFields.push('Peso corporal');
    if (!input.talla || input.talla <= 0) missingFields.push('Estatura / Talla');
    if (!input.edad || input.edad <= 0) missingFields.push('Edad');

    const warnings = this.detectClinicalAlerts(input.clinicalHistory, input.alertasMedicas);

    // Si faltan datos indispensables, retornamos estado de alerta y fallback
    if (missingFields.length > 0) {
      warnings.unshift(`Faltan datos indispensables para el cálculo automático: ${missingFields.join(', ')}.`);
      return {
        isComplete: false,
        missingFields,
        advertenciasClinicas: warnings,
        tmb: 0,
        factorActividad: 1.2,
        get: 0,
        caloriasObjetivo: 1800,
        macros: { protein: 130, carbs: 180, fat: 55 },
        macrosCalorias: { proteinKcal: 520, carbsKcal: 720, fatKcal: 495, totalKcal: 1735 },
        macrosPorcentaje: { proteinPct: 30, carbsPct: 41, fatPct: 29 },
        gKgValores: { proteinGKg: 0, carbsGKg: 0, fatGKg: 0 },
        snapshot: {
          pesoUtilizado: input.peso || 0,
          tallaUtilizada: input.talla || 0,
          edadUtilizada: input.edad || 0,
          sexoUtilizado: input.sexo,
          alertasClinicasDetectadas: warnings
        },
        tooltips: {
          tmb: 'Sin datos suficientes para calcular TMB.',
          get: 'Sin datos suficientes para calcular GET.',
          calorias: 'Valores base predeterminados.',
          proteina: 'Sin datos de peso.',
          grasas: 'Sin datos de peso.',
          carbos: 'Sin datos de peso.',
          consistencia: 'Verifique los valores ingresados.'
        }
      };
    }

    const peso = Number(input.peso);
    const talla = Number(input.talla);
    const edad = Number(input.edad);
    const sexo = input.sexo;

    // 1. TMB
    const metodoTmb = input.metodoTmb || (input.grasaPorcentaje && input.grasaPorcentaje > 0 ? 'mifflin_st_jeor' : 'mifflin_st_jeor');
    const { tmb, formulaUsed, explicacion: tmbExplicacion } = this.calculateBMR(
      peso,
      talla,
      edad,
      sexo,
      input.grasaPorcentaje,
      metodoTmb
    );

    // 2. Factor de Actividad y GET
    const nivel = input.nivelActividad || input.clinicalHistory?.estiloDeVida?.nivelActividad || 'sedentario';
    const detalleAct = input.actividadFisicaDetalle || input.clinicalHistory?.estiloDeVida?.actividadFisicaDetalle || '';
    const { factor: factorActividad, explicacion: actExplicacion } = this.getActivityMultiplier(nivel, detalleAct);
    const get = Math.round(tmb * factorActividad);
    const getExplicacion = `GET = TMB (${tmb} kcal) × Factor de Actividad (${factorActividad}) [${actExplicacion}] = ${get} kcal`;

    // 3. Objetivo y Ajuste Calórico
    const objOption = PLAN_OBJECTIVES.find(o => o.id === input.objetivoId) || PLAN_OBJECTIVES[0];
    let ajusteKcal = 0;

    if (input.customCaloriasDelta !== undefined && input.customCaloriasDelta !== null) {
      ajusteKcal = Number(input.customCaloriasDelta);
    } else {
      ajusteKcal = Math.round(get * (objOption.caloricDeltaPercent / 100));
    }

    const caloriasObjetivo = Math.max(1000, Math.round(get + ajusteKcal));
    const deltaSign = ajusteKcal >= 0 ? `+${ajusteKcal}` : `${ajusteKcal}`;
    const caloriasExplicacion = `Calorías Objetivo (${objOption.label}): GET (${get} kcal) ${deltaSign} kcal (${objOption.caloricDeltaPercent}%) = ${caloriasObjetivo} kcal`;

    // 4. Proteína (g y g/kg)
    const dLower = detalleAct.toLowerCase();
    const isStrength = dLower.includes('pesas') || dLower.includes('fuerza') || dLower.includes('gimnasio') || dLower.includes('crossfit');
    let gKgProteina = input.customProteinaGKg;

    if (!gKgProteina) {
      if (input.objetivoId === 'Pérdida de grasa') {
        gKgProteina = isStrength ? 2.2 : 1.9;
      } else if (input.objetivoId === 'Ganancia de masa muscular') {
        gKgProteina = isStrength ? 2.0 : 1.8;
      } else if (input.objetivoId === 'Recomposición corporal') {
        gKgProteina = 2.2;
      } else if (input.objetivoId === 'Rendimiento deportivo') {
        gKgProteina = 1.8;
      } else if (input.objetivoId === 'Ganancia de peso') {
        gKgProteina = 1.7;
      } else {
        gKgProteina = isStrength ? 1.8 : 1.5;
      }
    }

    // Adaptación si hay alerta renal estricta
    const hasRenal = warnings.some(w => w.includes('Condición Renal'));
    if (hasRenal && gKgProteina > 1.2) {
      gKgProteina = 1.0;
      warnings.push('⚠️ Se sugirió automáticamente un aporte proteico prudente (1.0 g/kg) por antecedente renal.');
    }

    let proteinGramos = Math.round(peso * gKgProteina);
    let proteinaExplicacion = `Proteína: ${gKgProteina} g/kg × ${peso}kg = ${proteinGramos}g (${proteinGramos * 4} kcal)`;

    // 5. Grasas
    let fatGramos = 0;
    let fatExplicacion = '';

    if (input.metodoGrasas === 'g_kg') {
      const gKgGrasa = 0.9;
      fatGramos = Math.round(peso * gKgGrasa);
      fatExplicacion = `Grasas: ${gKgGrasa} g/kg × ${peso}kg = ${fatGramos}g (${fatGramos * 9} kcal)`;
    } else {
      // Por porcentaje de las calorías objetivo (rango 20-30%)
      let fatPct = input.customPorcentajeGrasas;
      if (!fatPct) {
        if (input.objetivoId === 'Pérdida de grasa') fatPct = 25;
        else if (input.objetivoId === 'Ganancia de masa muscular') fatPct = 22;
        else if (input.objetivoId === 'Rendimiento deportivo') fatPct = 22;
        else fatPct = 27;
      }
      const fatKcal = caloriasObjetivo * (fatPct / 100);
      fatGramos = Math.round(fatKcal / 9);
      // Garantizar mínimo fisiológico de 0.7 g/kg
      const minFatGramos = Math.round(peso * 0.7);
      if (fatGramos < minFatGramos) {
        fatGramos = minFatGramos;
      }
      const finalFatPct = Math.round(((fatGramos * 9) / caloriasObjetivo) * 100);
      fatExplicacion = `Grasas: ${fatPct}% de ${caloriasObjetivo} kcal = ${Math.round(fatKcal)} kcal / 9 = ${fatGramos}g (~${(fatGramos / peso).toFixed(1)} g/kg • ${finalFatPct}%)`;
    }

    // 6. Carbohidratos como energía restante
    const proteinKcal = proteinGramos * 4;
    const fatKcal = fatGramos * 9;
    const remainingKcal = caloriasObjetivo - proteinKcal - fatKcal;
    let carbsGramos = Math.round(remainingKcal / 4);
    if (carbsGramos < 0) carbsGramos = 0;

    const carbsKcal = carbsGramos * 4;
    const carbsPct = Math.round((carbsKcal / caloriasObjetivo) * 100);
    const carbsExplicacion = `Carbohidratos (Energía restante): (${caloriasObjetivo} kcal - ${proteinKcal} kcal P - ${fatKcal} kcal G) = ${remainingKcal} kcal / 4 = ${carbsGramos}g (~${(carbsGramos / peso).toFixed(1)} g/kg • ${carbsPct}%)`;

    // 7. Consistencia y porcentajes
    const totalMacrosKcal = proteinKcal + carbsKcal + fatKcal;
    const pPct = Math.round((proteinKcal / totalMacrosKcal) * 100);
    const cPct = Math.round((carbsKcal / totalMacrosKcal) * 100);
    const fPct = Math.round((fatKcal / totalMacrosKcal) * 100);

    const diffKcal = totalMacrosKcal - caloriasObjetivo;
    const consistenciaExplicacion = Math.abs(diffKcal) <= 5
      ? `Consistencia verificada: (P: ${proteinGramos}g × 4) + (C: ${carbsGramos}g × 4) + (G: ${fatGramos}g × 9) = ${totalMacrosKcal} kcal (100% de la meta)`
      : `Discrepancia detectada: Los macros suman ${totalMacrosKcal} kcal (${diffKcal > 0 ? '+' : ''}${diffKcal} kcal vs meta de ${caloriasObjetivo} kcal)`;

    const snapshot: PatientPlanCalculationSnapshot = {
      pesoUtilizado: peso,
      tallaUtilizada: talla,
      edadUtilizada: edad,
      sexoUtilizado: sexo,
      grasaPorcentajeUtilizada: input.grasaPorcentaje ?? null,
      masaMagraKgUtilizada: input.musculoKg ?? null,
      nivelActividadUtilizado: nivel,
      actividadFisicaDetalle: detalleAct,
      factorActividad,
      tmbCalculada: tmb,
      metodoTmb: formulaUsed,
      getCalculado: get,
      ajusteCaloricoObjetivo: ajusteKcal,
      caloriasObjetivo,
      metodoProteina: 'peso_total',
      gKgProteina,
      proteinaGramos: proteinGramos,
      metodoGrasas: 'porcentaje',
      porcentajeGrasas: fPct,
      grasasGramos: fatGramos,
      carbosGramos: carbsGramos,
      alertasClinicasDetectadas: warnings,
      fechaCalculo: new Date().toISOString(),
      formulaExplicacion: {
        tmb: tmbExplicacion,
        get: getExplicacion,
        calorias: caloriasExplicacion,
        proteina: proteinaExplicacion,
        grasas: fatExplicacion,
        carbos: carbsExplicacion
      }
    };

    return {
      isComplete: true,
      missingFields: [],
      advertenciasClinicas: warnings,
      tmb,
      factorActividad,
      get,
      caloriasObjetivo,
      macros: {
        protein: proteinGramos,
        carbs: carbsGramos,
        fat: fatGramos
      },
      macrosCalorias: {
        proteinKcal,
        carbsKcal,
        fatKcal,
        totalKcal: totalMacrosKcal
      },
      macrosPorcentaje: {
        proteinPct: pPct,
        carbsPct: cPct,
        fatPct: fPct
      },
      gKgValores: {
        proteinGKg: Number((proteinGramos / peso).toFixed(2)),
        carbsGKg: Number((carbsGramos / peso).toFixed(2)),
        fatGKg: Number((fatGramos / peso).toFixed(2))
      },
      snapshot,
      tooltips: {
        tmb: tmbExplicacion,
        get: getExplicacion,
        calorias: caloriasExplicacion,
        proteina: proteinaExplicacion,
        grasas: fatExplicacion,
        carbos: carbsExplicacion,
        consistencia: consistenciaExplicacion
      }
    };
  }

  /**
   * Verifica la consistencia matemática entre calorías declaradas y macronutrientes
   */
  public static verifyCaloricConsistency(
    calorias: number,
    protein: number,
    carbs: number,
    fat: number
  ): {
    totalMacrosKcal: number;
    diferencia: number;
    esConsistente: boolean;
    porcentajeProteina: number;
    porcentajeCarbos: number;
    porcentajeGrasas: number;
    mensaje: string;
  } {
    const pKcal = (protein || 0) * 4;
    const cKcal = (carbs || 0) * 4;
    const fKcal = (fat || 0) * 9;
    const totalMacrosKcal = pKcal + cKcal + fKcal;
    const diferencia = totalMacrosKcal - (calorias || 0);
    const esConsistente = Math.abs(diferencia) <= 5;

    const baseKcal = totalMacrosKcal > 0 ? totalMacrosKcal : 1;
    const porcentajeProteina = Math.round((pKcal / baseKcal) * 100);
    const porcentajeCarbos = Math.round((cKcal / baseKcal) * 100);
    const porcentajeGrasas = Math.round((fKcal / baseKcal) * 100);

    let mensaje = '';
    if (esConsistente) {
      mensaje = `Macros matemáticamente consistentes (${totalMacrosKcal} kcal ≈ ${calorias} kcal).`;
    } else if (diferencia > 0) {
      mensaje = `Los macros suman ${totalMacrosKcal} kcal (+${diferencia} kcal por encima de la meta del plan).`;
    } else {
      mensaje = `Los macros suman ${totalMacrosKcal} kcal (${diferencia} kcal por debajo de la meta del plan).`;
    }

    return {
      totalMacrosKcal,
      diferencia,
      esConsistente,
      porcentajeProteina,
      porcentajeCarbos,
      porcentajeGrasas,
      mensaje
    };
  }

  /**
   * Asistente de rebalanceo: ajusta carbohidratos para absorber la diferencia calórica
   */
  public static balanceCarbsToTarget(
    calorias: number,
    protein: number,
    fat: number
  ): number {
    const proteinKcal = (protein || 0) * 4;
    const fatKcal = (fat || 0) * 9;
    const remaining = (calorias || 0) - proteinKcal - fatKcal;
    return Math.max(0, Math.round(remaining / 4));
  }
}
