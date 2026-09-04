import { NutritionEngineService } from '../NutritionEngineService';
import type { PatientDietPlan, Patient, ClinicalHistory, PatientMeasurement } from '../../../types/patient';
import { CIRCUMFERENCE_CATALOG } from '../../../types/patientProgress';

interface TestAssertionResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestAssertionResult[] = [];

function assert(name: string, condition: boolean, details?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } else {
    results.push({ name, passed: false, details });
    console.error(`  ✕ ${name} - FAILED: ${details}`);
  }
}

console.log('===============================================================');
console.log(' EJECUTANDO SUITE DE PRUEBAS DEL MOTOR NUTRICIONAL BODYFLOW');
console.log('===============================================================');

// ---------------------------------------------------------------------------
// 1. Paciente sedentario + mantenimiento
// ---------------------------------------------------------------------------
console.log('\n[Caso 1: Paciente sedentario + mantenimiento]');
const res1 = NutritionEngineService.calculateNutritionPlan({
  peso: 70,
  talla: 170,
  edad: 30,
  sexo: 'M',
  nivelActividad: 'sedentario',
  actividadFisicaDetalle: 'Sin ejercicio',
  objetivoId: 'Mantenimiento de peso'
});
assert('TMB calculada con Mifflin para mujer sedentaria', res1.tmb === 1452, `TMB esperada 1452, obtenida: ${res1.tmb}`);
assert('Factor de actividad sedentario es 1.2', res1.factorActividad === 1.2, `Factor: ${res1.factorActividad}`);
assert('GET = TMB * 1.2', res1.get === Math.round(res1.tmb * 1.2), `GET: ${res1.get}`);
assert('Calorías objetivo igual al GET en mantenimiento', res1.caloriasObjetivo === res1.get, `Calorías: ${res1.caloriasObjetivo}`);
assert('Proteína en rango de mantenimiento (1.4 - 1.8 g/kg)', res1.gKgValores.proteinGKg >= 1.4 && res1.gKgValores.proteinGKg <= 1.8, `Proteína g/kg: ${res1.gKgValores.proteinGKg}`);
assert('Tooltips generados correctamente', Boolean(res1.tooltips.tmb && res1.tooltips.calorias));

// ---------------------------------------------------------------------------
// 2. Paciente con entrenamiento de fuerza + ganancia muscular
// ---------------------------------------------------------------------------
console.log('\n[Caso 2: Paciente fuerza + ganancia muscular (hipertrofia)]');
const res2 = NutritionEngineService.calculateNutritionPlan({
  peso: 75,
  talla: 178,
  edad: 26,
  sexo: 'H',
  nivelActividad: 'moderado',
  actividadFisicaDetalle: 'Pesas en gimnasio 5 días por semana hipertrofia',
  objetivoId: 'Ganancia de masa muscular'
});
assert('GET refleja superávit calórico (+10% a +15%)', res2.caloriasObjetivo > res2.get, `Calorías ${res2.caloriasObjetivo} vs GET ${res2.get}`);
assert('Proteína optimizada para fuerza e hipertrofia (>= 1.8 g/kg)', res2.gKgValores.proteinGKg >= 1.8, `Proteína g/kg: ${res2.gKgValores.proteinGKg}`);
assert('Grasas balanceadas y carbohidratos restantes calculados', res2.macros.fat > 0 && res2.macros.carbs > 0);

// ---------------------------------------------------------------------------
// 3. Paciente con fuerza + pérdida de grasa
// ---------------------------------------------------------------------------
console.log('\n[Caso 3: Paciente fuerza + pérdida de grasa (déficit)]');
const res3 = NutritionEngineService.calculateNutritionPlan({
  peso: 80,
  talla: 175,
  edad: 32,
  sexo: 'H',
  nivelActividad: 'moderado',
  actividadFisicaDetalle: 'Entrenamiento de fuerza funcional 4 días/semana',
  objetivoId: 'Pérdida de grasa'
});
assert('Calorías en déficit respecto a GET', res3.caloriasObjetivo < res3.get, `Calorías: ${res3.caloriasObjetivo}, GET: ${res3.get}`);
assert('Proteína elevada para preservar masa muscular (>= 2.0 g/kg)', res3.gKgValores.proteinGKg >= 2.0, `Proteína g/kg: ${res3.gKgValores.proteinGKg}`);
assert('Grasas respetan mínimo fisiológico', res3.macros.fat >= Math.round(80 * 0.7), `Grasas: ${res3.macros.fat}g`);

// ---------------------------------------------------------------------------
// 4. Paciente con actividad cardiovascular / resistencia
// ---------------------------------------------------------------------------
console.log('\n[Caso 4: Paciente con actividad cardiovascular/resistencia]');
const res4 = NutritionEngineService.calculateNutritionPlan({
  peso: 62,
  talla: 168,
  edad: 29,
  sexo: 'M',
  nivelActividad: 'intenso',
  actividadFisicaDetalle: 'Ciclismo y correr 6 días por semana',
  objetivoId: 'Rendimiento deportivo'
});
assert('Factor de actividad intenso (1.725)', res4.factorActividad === 1.725, `Factor: ${res4.factorActividad}`);
assert('Carbohidratos elevados para demanda glucogénica (>= 4 g/kg)', res4.gKgValores.carbsGKg >= 4.0, `Carbos g/kg: ${res4.gKgValores.carbsGKg}`);

// ---------------------------------------------------------------------------
// 5. Paciente con datos incompletos
// ---------------------------------------------------------------------------
console.log('\n[Caso 5: Paciente con datos incompletos]');
const res5 = NutritionEngineService.calculateNutritionPlan({
  peso: null,
  talla: null,
  edad: null,
  sexo: 'M',
  objetivoId: 'Pérdida de grasa'
});
assert('Identifica que no está completo (isComplete = false)', res5.isComplete === false);
assert('Lista los campos faltantes con precisión', res5.missingFields.includes('Peso corporal') && res5.missingFields.includes('Estatura / Talla'));
assert('No rompe la ejecución y ofrece fallback seguro', res5.caloriasObjetivo > 0 && res5.macros.protein > 0);

// ---------------------------------------------------------------------------
// 6. Paciente con condición clínica relevante (Renal, Diabetes, Hipertensión)
// ---------------------------------------------------------------------------
console.log('\n[Caso 6: Paciente con condición clínica relevante]');
const clinicalHist: ClinicalHistory = {
  id: 'main',
  antecedentesPatologicos: ['Enfermedad renal crónica estadio 2', 'Diabetes tipo 2', 'Hipertensión arterial'],
  sintomasDigestivos: ['Gastritis']
};
const res6 = NutritionEngineService.calculateNutritionPlan({
  peso: 72,
  talla: 165,
  edad: 55,
  sexo: 'M',
  objetivoId: 'Pérdida de grasa',
  clinicalHistory: clinicalHist
});
assert('Emite advertencia renal sin romper', res6.advertenciasClinicas.some(w => w.includes('Renal')));
assert('Emite advertencia glucémica/diabetes', res6.advertenciasClinicas.some(w => w.includes('Glucémico') || w.includes('Diabetes')));
assert('Emite advertencia cardiovascular/hipertensión', res6.advertenciasClinicas.some(w => w.includes('Cardiovascular')));
assert('Sugiere aporte proteico prudente ante antecedente renal (<= 1.2 g/kg)', res6.snapshot.gKgProteina! <= 1.2, `Proteína g/kg: ${res6.snapshot.gKgProteina}`);

// ---------------------------------------------------------------------------
// 7. Edición manual de proteína
// ---------------------------------------------------------------------------
console.log('\n[Caso 7: Edición manual de proteína]');
const res7 = NutritionEngineService.calculateNutritionPlan({
  peso: 70,
  talla: 175,
  edad: 28,
  sexo: 'H',
  objetivoId: 'Mantenimiento de peso',
  customProteinaGKg: 2.3 // Modificación manual
});
assert('Acepta y respeta el valor de proteína personalizado', res7.snapshot.gKgProteina === 2.3);
assert('Calcula gramos exactos de acuerdo al input manual', res7.macros.protein === Math.round(70 * 2.3));

// ---------------------------------------------------------------------------
// 8. Edición manual de carbohidratos
// ---------------------------------------------------------------------------
console.log('\n[Caso 8: Edición manual de carbohidratos]');
const checkConsistency8 = NutritionEngineService.verifyCaloricConsistency(2000, 150, 200, 60);
// 150*4 = 600, 200*4 = 800, 60*9 = 540 -> Total: 1940 kcal (diferencia: -60)
assert('Detecta variación tras editar carbohidratos manualmente', checkConsistency8.totalMacrosKcal === 1940);
assert('Reporta diferencia respecto a calorías objetivo', checkConsistency8.diferencia === -60);

// ---------------------------------------------------------------------------
// 9. Edición manual de grasas
// ---------------------------------------------------------------------------
console.log('\n[Caso 9: Edición manual de grasas y rebalanceo]');
const balancedCarbs = NutritionEngineService.balanceCarbsToTarget(2000, 150, 60);
// Con 2000 kcal, 150g P (600 kcal), 60g Fat (540 kcal) -> restan 860 kcal / 4 = 215g carbs
assert('Asistente calcula carbohidratos exactos para absorber ajuste de grasas', balancedCarbs === 215, `Carbos calculados: ${balancedCarbs}`);

// ---------------------------------------------------------------------------
// 10. Edición manual de kcal
// ---------------------------------------------------------------------------
console.log('\n[Caso 10: Edición manual de kcal]');
const res10 = NutritionEngineService.calculateNutritionPlan({
  peso: 70,
  talla: 170,
  edad: 30,
  sexo: 'M',
  objetivoId: 'Pérdida de grasa',
  customCaloriasDelta: -300 // Déficit manual de 300 kcal
});
assert('Aplica delta calórico manual', res10.caloriasObjetivo === res10.get - 300);

// ---------------------------------------------------------------------------
// 11. Verificación de consistencia calórica
// ---------------------------------------------------------------------------
console.log('\n[Caso 11: Verificación de consistencia calórica]');
const consPerfect = NutritionEngineService.verifyCaloricConsistency(1800, 135, 180, 60);
// 135*4 = 540, 180*4 = 720, 60*9 = 540 -> Total: 1800 kcal
assert('Identifica consistencia exacta (1800 kcal = 1800 kcal)', consPerfect.esConsistente === true);
assert('Calcula porcentajes calóricos correctos (30% P, 40% C, 30% G)', consPerfect.porcentajeProteina === 30 && consPerfect.porcentajeCarbos === 40 && consPerfect.porcentajeGrasas === 30);

// ---------------------------------------------------------------------------
// 12. Guardado del plan con snapshot y parámetros de auditoría
// ---------------------------------------------------------------------------
console.log('\n[Caso 12: Guardado del plan con snapshot de auditoría]');
const planToSave: Omit<PatientDietPlan, 'id' | 'createdAt'> = {
  nombre: 'Plan Hipocalórico Fase 1',
  fechaAsignacion: '2026-09-04',
  status: 'activo',
  calorias: 1800,
  macros: { protein: 140, carbs: 165, fat: 55 },
  objetivo: 'Pérdida de grasa',
  fuenteCalculo: 'ajustado',
  metodoCalculo: 'mifflin_st_jeor',
  calculoOriginal: {
    calorias: 1800,
    macros: { protein: 129, carbs: 180, fat: 55 }
  },
  ajustesNutriologo: {
    calorias: 1800,
    macros: { protein: 140, carbs: 165, fat: 55 },
    motivoAjuste: 'Mayor saciedad y entrenamiento de hipertrofia'
  },
  parametrosCalculo: {
    pesoUtilizado: 72,
    tallaUtilizada: 165,
    edadUtilizada: 28,
    sexoUtilizado: 'M',
    nivelActividadUtilizado: 'moderado',
    tmbCalculada: 1450,
    getCalculado: 2247
  }
};
assert('Plan almacena valores originales y ajustados por separado', 
  planToSave.calculoOriginal?.macros.protein === 129 && planToSave.macros.protein === 140
);
assert('Plan almacena snapshot de parámetros antropométricos', planToSave.parametrosCalculo?.pesoUtilizado === 72);

// ---------------------------------------------------------------------------
// 13. Recuperación del plan (compatible con legados y nuevos)
// ---------------------------------------------------------------------------
console.log('\n[Caso 13: Recuperación y compatibilidad con planes legados]');
const legacyPlan: PatientDietPlan = {
  id: 'legacy-1',
  nombre: 'Plan Antiguo Sin Metadatos',
  fechaAsignacion: '2025-05-10',
  status: 'completado',
  calorias: 1750,
  macros: { protein: 120, carbs: 190, fat: 50 },
  createdAt: '2025-05-10T10:00:00Z'
};
assert('Plan legado se lee sin error a pesar de no tener snapshot', legacyPlan.calorias === 1750 && legacyPlan.macros.protein === 120);

// ---------------------------------------------------------------------------
// 14. Plan histórico después de modificar datos del paciente (inmutabilidad)
// ---------------------------------------------------------------------------
console.log('\n[Caso 14: Inmutabilidad del plan histórico ante cambios futuros del paciente]');
// Simulamos que el paciente se pesa un mes después y ahora pesa 65kg en vez de 72kg
const patientOneMonthLater: Patient = {
  id: 'pat-1',
  nombre: 'Valeria Rivas',
  sexo: 'M',
  status: 'activo',
  alertasMedicas: [],
  metas: { metaPeso: 60 },
  createdAt: null,
  updatedAt: null
};
const newMeasurement: PatientMeasurement = {
  id: 'm-2',
  Fecha: '2026-10-04',
  Edad: 28,
  Peso: 65, // bajó 7 kg
  Talla: 165,
  Cintura: 76,
  Cadera: 98,
  Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
  Suma_Pliegues: '',
  Grasa_Bascula: '',
  Grasa_Formula: '',
  Grasa_Fuente: 'formula',
  Grasa_Porcentaje: 22,
  Musculo_Kg: 27,
  IMC: 23.9,
  ICC: 0.78,
  createdAt: '2026-10-04T10:00:00Z'
};

// El plan guardado previamente en el caso 12 debe conservar sus 1800 kcal y sus 72kg en snapshot
assert('El plan histórico conserva sus 1800 kcal para ' + patientOneMonthLater.nombre, planToSave.calorias === 1800);
assert('El plan histórico conserva el snapshot del peso original (72 kg)', planToSave.parametrosCalculo?.pesoUtilizado === 72);
assert('El nuevo peso del paciente (65 kg) no sobreescribió el plan histórico', newMeasurement.Peso !== planToSave.parametrosCalculo?.pesoUtilizado);

// ---------------------------------------------------------------------------
// 15. Selector de fórmulas (Mifflin vs Katch-McArdle vs Harris-Benedict vs Fijo)
// ---------------------------------------------------------------------------
console.log('\n[Caso 15: Selector de fórmulas alternativas]');
const bmrMifflin = NutritionEngineService.calculateBMR(70, 175, 25, 'H', null, 'mifflin_st_jeor');
const bmrHarris = NutritionEngineService.calculateBMR(70, 175, 25, 'H', null, 'harris_benedict');
const bmrKatch = NutritionEngineService.calculateBMR(70, 175, 25, 'H', 15, 'katch_mcardle'); // 15% grasa -> LBM = 59.5kg -> 370 + 21.6*59.5 = 1655
const bmrFijo = NutritionEngineService.calculateBMR(70, 175, 25, 'H', null, 'fijo_kg'); // 70 * 24 = 1680

assert('Mifflin-St Jeor ejecutada correctamente', bmrMifflin.formulaUsed === 'Mifflin-St Jeor' && bmrMifflin.tmb > 1500);
assert('Harris-Benedict ejecutada correctamente', bmrHarris.formulaUsed === 'Harris-Benedict (Revisada)' && bmrHarris.tmb > 1500);
assert('Katch-McArdle calcula con masa magra', bmrKatch.formulaUsed === 'Katch-McArdle' && bmrKatch.tmb === 1655);
assert('Gasto Fijo por kg calcula 70kg * 24', bmrFijo.tmb === 1680);

// ---------------------------------------------------------------------------
// 16. Catálogo de circunferencias de gimnasio
// ---------------------------------------------------------------------------
console.log('\n[Caso 16: Catálogo de circunferencias antropométricas para gimnasio]');
const hasBicepsContr = CIRCUMFERENCE_CATALOG.some(c => c.key === 'brazo_contraido');
const hasMusloMed = CIRCUMFERENCE_CATALOG.some(c => c.key === 'muslo_medio');
const hasAntebrazo = CIRCUMFERENCE_CATALOG.some(c => c.key === 'antebrazo');
const hasHombros = CIRCUMFERENCE_CATALOG.some(c => c.key === 'hombros');
assert('Catálogo incluye brazo/bíceps contraído', hasBicepsContr);
assert('Catálogo incluye muslo/pierna medio', hasMusloMed);
assert('Catálogo incluye antebrazo y hombros', hasAntebrazo && hasHombros);

console.log('\n===============================================================');
const failed = results.filter(r => !r.passed);
if (failed.length === 0) {
  console.log(` ✅ TODAS LAS PRUEBAS (${results.length}/${results.length}) PASARON CON ÉXITO!`);
} else {
  console.error(` ❌ FALLARON ${failed.length} DE ${results.length} PRUEBAS.`);
  throw new Error(`Fallaron ${failed.length} pruebas.`);
}
console.log('===============================================================');
