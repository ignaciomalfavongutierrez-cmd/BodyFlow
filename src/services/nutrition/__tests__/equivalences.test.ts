import { 
  SMAE_EQUIVALENCE_GROUPS, 
  searchEquivalences, 
  findGroupByFoodName 
} from '../../../catalog/nutrition/equivalencesCatalog';

console.log('===============================================================');
console.log(' EJECUTANDO PRUEBAS DEL SISTEMA DE EQUIVALENCIAS (SMAE)');
console.log('===============================================================');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

// 1. Verificación de los 8 grupos oficiales SMAE
console.log('\n[1. Grupos Oficiales SMAE]');
assert(SMAE_EQUIVALENCE_GROUPS.length === 8, 'Existen exactamente 8 grupos de equivalencias oficiales');

const expectedKeys = ['verduras', 'frutas', 'cereales', 'leguminosas', 'aoa', 'lacteos', 'grasas', 'azucares_libres'];
expectedKeys.forEach(k => {
  const found = SMAE_EQUIVALENCE_GROUPS.some(g => g.key === k);
  assert(found, `Grupo oficial '${k}' está registrado`);
});

// 2. Verificación de macros promedio y contenido de alimentos
console.log('\n[2. Macros Promedio y Catálogo]');
const cerealesGroup = SMAE_EQUIVALENCE_GROUPS.find(g => g.key === 'cereales')!;
assert(cerealesGroup.macrosPromedio.carbs === 15, 'Cereales aportan ~15g de carbohidratos por equivalente');
assert(cerealesGroup.macrosPromedio.calories === 70, 'Cereales aportan ~70 kcal por equivalente');
assert(cerealesGroup.alimentos.length >= 10, 'Cereales cuenta con más de 10 alimentos básicos');

const aoaGroup = SMAE_EQUIVALENCE_GROUPS.find(g => g.key === 'aoa')!;
assert(aoaGroup.macrosPromedio.protein === 7, 'Proteínas/AOA aportan ~7g de proteína por equivalente');

const totalFoods = SMAE_EQUIVALENCE_GROUPS.reduce((acc, g) => acc + g.alimentos.length, 0);
assert(totalFoods >= 75, `Catálogo completo cuenta con ${totalFoods} alimentos registrados (>= 75 alimentos)`);

// 3. Verificación de Búsqueda Reactiva Instantánea
console.log('\n[3. Búsqueda Reactiva de Equivalencias]');
const tortillaResults = searchEquivalences('tortilla');
assert(tortillaResults.length >= 2, 'Búsqueda de "tortilla" devuelve al menos tortilla de maíz y nopal');
assert(tortillaResults.some(r => r.food.nombre.toLowerCase().includes('maíz')), 'Encuentra tortilla de maíz');

const polloResults = searchEquivalences('pollo');
assert(polloResults.length >= 1, 'Búsqueda de "pollo" devuelve pechuga de pollo');

const aguacateResults = searchEquivalences('aguacate');
assert(aguacateResults.length >= 1, 'Búsqueda de "aguacate" devuelve aguacate');

// 4. Verificación de findGroupByFoodName
console.log('\n[4. Clasificación Automática de Grupo]');
const groupPollo = findGroupByFoodName('Pechuga de pollo');
assert(groupPollo?.key === 'aoa', 'Pechuga de pollo se clasifica correctamente en AOA / Proteínas');

const groupManzana = findGroupByFoodName('Manzana verde');
assert(groupManzana?.key === 'frutas', 'Manzana se clasifica en Frutas');

const groupArroz = findGroupByFoodName('Arroz blanco');
assert(groupArroz?.key === 'cereales', 'Arroz cocido se clasifica en Cereales');

console.log('\n===============================================================');
console.log(' ✅ TODAS LAS PRUEBAS DE EQUIVALENCIAS PASARON CON ÉXITO!');
console.log('===============================================================\n');
