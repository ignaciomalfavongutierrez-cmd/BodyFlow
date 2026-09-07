import { PatientSyncService } from '../PatientSyncService';
import type { DietPlanMenu } from '../../../types/dietMenu';

console.log('===============================================================');
console.log(' EJECUTANDO PRUEBAS DEL SERVICIO DE SINCRONIZACIÓN CLÍNICA');
console.log('===============================================================');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

// 1. Conversión de menú semanal clínico a DayPlan[] de tracking
console.log('\n[1. Conversión de Menú Clínico a DayPlan[]]');

const sampleDietMenu: DietPlanMenu = {
  tipoEstructura: 'semanal',
  tiemposComidaConfig: [
    { key: 'desayuno', label: 'Desayuno', orden: 1, esColacion: false },
    { key: 'comida', label: 'Comida', orden: 2, esColacion: false },
    { key: 'cena', label: 'Cena', orden: 3, esColacion: false }
  ],
  dias: [
    {
      diaId: 'lunes',
      diaNombre: 'Lunes',
      comidas: {
        desayuno: [
          {
            id: 'd1',
            nombre: 'Omelette de claras con espinaca',
            porcion: '2 piezas',
            ingredientes: ['2 claras de huevo', '1 taza de espinacas', '1 cdita de aceite de oliva'],
            macros: { calories: 250, protein: 22, carbs: 6, fat: 12 }
          }
        ],
        comida: [
          {
            id: 'd2',
            nombre: 'Pechuga de pollo a la plancha con arroz y ensalada',
            ingredientes: ['120g pechuga de pollo', '1/2 taza de arroz integral', 'ensalada mixta'],
            macros: { calories: 500, protein: 45, carbs: 45, fat: 10 }
          }
        ],
        cena: [
          {
            id: 'd3',
            nombre: 'Yogurt griego con moras y nueces',
            macros: { calories: 300, protein: 20, carbs: 25, fat: 10 }
          }
        ]
      }
    },
    {
      diaId: 'martes',
      diaNombre: 'Martes',
      comidas: {
        desayuno: [
          {
            id: 'd4',
            nombre: 'Avena con leche de almendras y canela',
            macros: { calories: 280, protein: 12, carbs: 42, fat: 6 }
          }
        ]
      }
    }
  ]
};

const dayPlans = PatientSyncService.convertDietPlanMenuToDayPlans(sampleDietMenu, 1800);

assert(dayPlans.length === 2, 'Generó exactamente 2 DayPlans para los 2 días configurados');

// Validar día Lunes
const lunesPlan = dayPlans[0];
assert(lunesPlan.dayName === 'Lunes', 'Nombre del día asignado correctamente a Lunes');
assert(Array.isArray(lunesPlan.assignedDays) && lunesPlan.assignedDays.includes(1), 'Lunes mapeado a assignedDays = [1]');
assert(lunesPlan.meals.length === 3, 'Lunes cuenta con 3 comidas planificadas (Desayuno, Comida, Cena)');

const desayuno = lunesPlan.meals.find(m => m.mealType === 'Desayuno' || m.name.includes('Omelette'));
assert(!!desayuno, 'Comida Desayuno existe en el plan');
assert(desayuno?.mealType === 'Desayuno', 'Comida tiene tag mealType = "Desayuno"');
assert(desayuno?.name === 'Omelette de claras con espinaca', 'Comida tiene name = "Omelette de claras con espinaca"');
assert(desayuno?.plannedMacros?.calories === 250, 'Desayuno tiene 250 kcal calculadas de sus platillos');
assert(desayuno?.plannedMacros?.protein === 22, 'Desayuno tiene 22g de proteína');
assert((desayuno?.items?.length || 0) >= 3, 'Desayuno preservó los ingredientes detallados');

// Validar día Martes
const martesPlan = dayPlans[1];
assert(martesPlan.dayName === 'Martes', 'Nombre del día asignado correctamente a Martes');
assert(Array.isArray(martesPlan.assignedDays) && martesPlan.assignedDays.includes(2), 'Martes mapeado a assignedDays = [2]');

// 2. Conversión de día tipo (aplica a toda la semana)
console.log('\n[2. Conversión de Día Tipo Único]');
const singleTypeMenu: DietPlanMenu = {
  tipoEstructura: 'dia_tipo',
  tiemposComidaConfig: [
    { key: 'desayuno', label: 'Desayuno', orden: 1, esColacion: false }
  ],
  dias: [
    {
      diaId: 'dia_tipo',
      diaNombre: 'Menú Base',
      comidas: {
        desayuno: [
          {
            id: 'dt1',
            nombre: 'Smoothie Verde Proteico'
          }
        ]
      }
    }
  ]
};

const singleDayPlans = PatientSyncService.convertDietPlanMenuToDayPlans(singleTypeMenu, 1600);
assert(singleDayPlans.length === 1, 'Genera 1 DayPlan representativo');
assert(singleDayPlans[0].assignedDays?.length === 7, 'Día tipo se asigna a los 7 días de la semana [0..6]');
assert(singleDayPlans[0].meals[0].plannedMacros?.calories === 1600, 'Distribuye calorías del plan si los platillos no tenían desglose');

console.log('\n===============================================================');
console.log(' ¡TODAS LAS PRUEBAS DE SINCRONIZACIÓN CLÍNICA PASARON CON ÉXITO!');
console.log('===============================================================');
