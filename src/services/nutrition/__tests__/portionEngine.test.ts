import { IngredientSearchService, BASE_MEXICAN_STAPLES } from '../IngredientSearchService';

async function runPortionEngineTests() {
  console.log('Testing Portion Engine & Unit Conversions...');

  // Test 1: Corrupt Double-Number Sanitization
  const dirty1 = '0.5 1 scoop (30g) Proteína Whey Isolate en polvo';
  const p1 = IngredientSearchService.parseIngredientString(dirty1);
  const f1 = IngredientSearchService.formatIngredientDisplay(p1);

  if (p1.cantidad !== 0.5 || p1.unidad !== 'scoop' || !f1.includes('1/2 scoop') || f1.includes('0.5 1')) {
    throw new Error(`Test 1 Failed: Expected clean 1/2 scoop without 0.5 1, got: ${f1}`);
  }
  console.log('✓ Test 1 Passed: "0.5 1 scoop..." sanitizes to: ' + f1);

  // Test 2: Double Number Tortilla
  const dirty2 = '4 1 pieza (30g) Tortilla de maíz';
  const p2 = IngredientSearchService.parseIngredientString(dirty2);
  const f2 = IngredientSearchService.formatIngredientDisplay(p2);

  if (p2.cantidad !== 4 || p2.unidad !== 'pieza' || !f2.startsWith('4 piezas (120g)')) {
    throw new Error(`Test 2 Failed: Expected 4 piezas (120g) Tortilla de maíz, got: ${f2}`);
  }
  console.log('✓ Test 2 Passed: "4 1 pieza..." sanitizes to: ' + f2);

  // Test 3: Fractional Rice
  const dirty3 = '2 1/2 taza (80g) Arroz blanco o integral cocido';
  const p3 = IngredientSearchService.parseIngredientString(dirty3);
  const f3 = IngredientSearchService.formatIngredientDisplay(p3);

  if (p3.cantidad !== 1 || p3.unidad !== 'taza' || !f3.startsWith('1 taza (160g)')) {
    throw new Error(`Test 3 Failed: Expected 1 taza (160g) Arroz blanco..., got: ${f3}`);
  }
  console.log('✓ Test 3 Passed: "2 1/2 taza..." sanitizes to: ' + f3);

  // Test 4: Avocado normalization (0.2 pieza -> 1/4 pieza / 30g)
  const dirty4 = '0.2 pieza aguacate hass';
  const p4 = IngredientSearchService.parseIngredientString(dirty4);
  const f4 = IngredientSearchService.formatIngredientDisplay(p4);

  if (p4.cantidad !== 0.25 || !f4.includes('1/4 pieza (30g)')) {
    throw new Error(`Test 4 Failed: Expected 1/4 pieza (30g) aguacate hass, got: ${f4}`);
  }
  console.log('✓ Test 4 Passed: "0.2 pieza aguacate" normalizes to: ' + f4);

  // Test 5: Direct Grams (130 g pechuga)
  const direct5 = '130 g pechuga de pollo cocida';
  const p5 = IngredientSearchService.parseIngredientString(direct5);
  const f5 = IngredientSearchService.formatIngredientDisplay(p5);

  if (p5.cantidad !== 130 || p5.unidad !== 'g' || f5 !== '130 g pechuga de pollo cocida') {
    throw new Error(`Test 5 Failed: Expected "130 g pechuga de pollo cocida", got: ${f5}`);
  }
  console.log('✓ Test 5 Passed: "130 g pechuga..." formats cleanly: ' + f5);

  // Test 6: Unit Conversion (Aguacate 0.25 pieza <-> 30g)
  const toGrams = IngredientSearchService.convertIngredientUnit(0.25, 'pieza', 'g', 'Aguacate Hass');
  const toPieza = IngredientSearchService.convertIngredientUnit(30, 'g', 'pieza', 'Aguacate Hass');

  if (toGrams.newCantidad !== 30 || toPieza.newCantidad !== 0.25) {
    throw new Error(`Test 6 Failed: Avocado conversion error: toGrams=${toGrams.newCantidad}, toPieza=${toPieza.newCantidad}`);
  }
  console.log('✓ Test 6 Passed: Avocado 0.25 pieza <-> 30g bidirectional conversion exact');

  // Test 7: Unit Conversion (Arroz 1 taza <-> 160g)
  const arrozToGrams = IngredientSearchService.convertIngredientUnit(1, 'taza', 'g', 'Arroz blanco o integral cocido');
  const arrozToTaza = IngredientSearchService.convertIngredientUnit(80, 'g', 'taza', 'Arroz blanco o integral cocido');

  if (arrozToGrams.newCantidad !== 160 || arrozToTaza.newCantidad !== 0.5) {
    throw new Error(`Test 7 Failed: Rice conversion error: ${arrozToGrams.newCantidad}, ${arrozToTaza.newCantidad}`);
  }
  console.log('✓ Test 7 Passed: Rice 1 taza <-> 160g (and 80g -> 0.5 taza) exact');

  // Test 8: Bistec de res magro a la plancha must be 'pieza'
  const bistec = IngredientSearchService.findStapleMatch('Bistec de res magro a la plancha');
  if (!bistec) {
    throw new Error('Test 8 Failed: Bistec de res not found in BASE_MEXICAN_STAPLES');
  }
  if (bistec.unidadBase !== 'pieza' || bistec.gramosReferencia !== 100) {
    throw new Error(`Test 8 Failed: Expected bistec unidadBase: 'pieza', refGrams: 100, got: ${bistec.unidadBase}, ${bistec.gramosReferencia}`);
  }
  const bistecToGrams = IngredientSearchService.convertIngredientUnit(1, 'pieza', 'g', 'Bistec de res magro a la plancha');
  const bistecToPieza = IngredientSearchService.convertIngredientUnit(100, 'g', 'pieza', 'Bistec de res magro a la plancha');
  if (bistecToGrams.newCantidad !== 100 || bistecToPieza.newCantidad !== 1) {
    throw new Error(`Test 8 Failed: Bistec conversion error: 1 pieza -> ${bistecToGrams.newCantidad}g, 100g -> ${bistecToPieza.newCantidad} pieza`);
  }
  console.log('✓ Test 8 Passed: Bistec de res is correctly configured as 1 pieza (100g) with exact bidirectional conversion');

  // Test 9: Catalog Integrity - No staple has unidadBase 'g' with gramosReferencia != 1
  for (const s of BASE_MEXICAN_STAPLES) {
    if (s.unidadBase === 'g' && s.gramosReferencia !== 1) {
      throw new Error(`Test 9 Failed: Staple "${s.id}" has unidadBase 'g' but gramosReferencia is ${s.gramosReferencia}. 1 gram must be 1 gram.`);
    }
    if (s.densidades && s.densidades[s.unidadBase] && s.densidades[s.unidadBase] !== s.gramosReferencia) {
      throw new Error(`Test 9 Failed: Staple "${s.id}" densidades[${s.unidadBase}] (${s.densidades[s.unidadBase]}) does not match gramosReferencia (${s.gramosReferencia})`);
    }
  }
  console.log(`✓ Test 9 Passed: All ${BASE_MEXICAN_STAPLES.length} staples in BASE_MEXICAN_STAPLES verified mathematically consistent`);

  // Test 10: Auto-healing corrupted dishes (1 g of bistec with 100g total)
  const corruptedDish: any = {
    id: 'test_corrupted_1',
    nombre: 'Comida con Bistec',
    macros: { calories: 180, protein: 26, carbs: 0, fat: 8 },
    ingredientesDetalle: [
      {
        nombre: 'Bistec de res magro a la plancha',
        cantidad: 1,
        unidad: 'g',
        gramosEquivalentes: 100,
        macros: { calories: 180, protein: 26, carbs: 0, fat: 8 }
      }
    ]
  };
  const healed = IngredientSearchService.ensureDishIngredients(corruptedDish);
  if (healed[0].unidad !== 'pieza' || healed[0].cantidad !== 1 || healed[0].gramosEquivalentes !== 100) {
    throw new Error(`Test 10 Failed: Auto-healing did not correct 1g bistec to 1 pieza: unidad=${healed[0].unidad}, cantidad=${healed[0].cantidad}`);
  }
  console.log('✓ Test 10 Passed: ensureDishIngredients auto-heals corrupted "1 g (100g)" ingredients to "1 pieza (100g)"');

  console.log('\n=============================================');
  console.log('🎉 ALL PORTION ENGINE & UNIT TESTS PASSED!');
  console.log('=============================================\n');
}

runPortionEngineTests();
