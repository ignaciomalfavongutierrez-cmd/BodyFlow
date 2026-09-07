import { generatePrompt, parseManualJson } from '../../aiParser';

console.log('===============================================================');
console.log(' EJECUTANDO PRUEBAS DEL PARSER DE MENÚS Y PLATILLOS (AI PARSER)');
console.log('===============================================================');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

// 1. Verificación del Prompt
console.log('\n[1. Reglas del Prompt para Distinción de Tag vs Platillo]');
const prompt = generatePrompt('Documento de prueba');
assert(prompt.includes('mealType'), 'El prompt incluye la especificación de "mealType" para tags/horarios');
assert(prompt.includes('Huevos a la Mexicana con Claras'), 'El prompt incluye ejemplos claros de nombres de platillos reales');
assert(prompt.includes('NUNCA USES ESTE TAG COMO EL VALOR DE "name"'), 'El prompt contiene la directiva explícita de no confundir el tag con el platillo');

// 2. Parser con JSON Estructurado Correcto
console.log('\n[2. Parseo de JSON con mealType y name diferenciados]');
const sampleValidJson = JSON.stringify({
  week: [
    {
      date: 'lunes',
      dayName: 'Lunes',
      meals: [
        {
          id: 'm1',
          mealType: 'Desayuno',
          name: 'Huevos a la Mexicana con Claras, Tortillas y Aguacate:',
          items: [
            '1 pieza (50g) Huevo entero',
            '3 piezas (99g) Clara de huevo',
            '3 piezas (90g) Tortilla de maíz',
            '1/4 pieza (30g) Aguacate Hass'
          ],
          plannedMacros: { calories: 480, protein: 34, carbs: 48, fat: 16, sugar: 3 }
        },
        {
          id: 'm2',
          mealType: 'Colación',
          name: 'Licuado Proteico de Fresas con Leche de Almendras',
          items: [
            '1 scoop (30g) proteína',
            '1 taza (240g) Leche deslactosada light'
          ],
          plannedMacros: { calories: 385, protein: 39, carbs: 44, fat: 8, sugar: 12 }
        }
      ]
    }
  ]
});

const parsed = parseManualJson(sampleValidJson);
assert(parsed.length === 1, 'Extrajo 1 día');
const day = parsed[0];
assert(day.meals.length === 2, 'Extrajo 2 comidas');

const m1 = day.meals[0];
assert(m1.mealType === 'Desayuno', 'mealType es "Desayuno"');
assert(m1.name === 'Huevos a la Mexicana con Claras, Tortillas y Aguacate', 'Limpió los dos puntos finales y asignó el nombre del platillo');
assert(m1.items?.length === 4, 'items contiene los 4 ingredientes');

// 3. Parser con Fallback Inteligente (si el modelo envió "DESAYUNO" como name y el platillo en items[0])
console.log('\n[3. Sanitización y auto-recuperación cuando el modelo pone el platillo en items[0]]');
const legacyMessyJson = JSON.stringify({
  week: [
    {
      date: 'lunes',
      dayName: 'Lunes',
      meals: [
        {
          id: 'm_legacy',
          name: 'DESAYUNO',
          items: [
            'Huevos a la Mexicana con Claras, Tortillas y Aguacate:',
            '1 pieza (50g) Huevo entero',
            '3 piezas (99g) Clara de huevo'
          ],
          plannedMacros: { calories: 480, protein: 34, carbs: 48, fat: 16, sugar: 3 }
        }
      ]
    }
  ]
});

const parsedLegacy = parseManualJson(legacyMessyJson);
const mLegacy = parsedLegacy[0].meals[0];
assert(mLegacy.name === 'Huevos a la Mexicana con Claras, Tortillas y Aguacate', 'Extrajo automáticamente el platillo del primer item');
assert(mLegacy.mealType === 'Desayuno', 'Asignó "Desayuno" como mealType');
assert(mLegacy.items?.length === 2, 'Removió el título de items y dejó solo los 2 ingredientes reales');

console.log('\n===============================================================');
console.log(' ¡TODAS LAS PRUEBAS DE PARSEO DE PLATILLOS PASARON CON ÉXITO!');
console.log('===============================================================');
