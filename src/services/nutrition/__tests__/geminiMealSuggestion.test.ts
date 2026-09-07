import { GeminiMealSuggestionService, type MealSuggestionInput } from '../GeminiMealSuggestionService';

function runGeminiMealSuggestionTests() {
  console.log('Testing GeminiMealSuggestionService Prompt & Sanitization...');

  const mockInput: MealSuggestionInput = {
    patient: {
      id: 'patient-123',
      nombre: 'Valeria Morales',
      edad: 29,
      sexo: 'femenino',
      peso: 62,
      estatura: 165,
      objetivoPrincipal: 'Pérdida de grasa y tonificación',
      alertasMedicas: ['Intolerancia a la lactosa']
    },
    clinicalHistory: {
      alergiasIntolerancias: ['Mariscos'],
      preferenciasAlimentarias: {
        gustosFavoritos: ['Aguacate', 'Pechuga de pollo', 'Frijoles de la olla'],
        aversionesDisgustos: ['Pescado blanco', 'Brócoli crudo'],
        restriccionesEspeciales: 'Sin lácteos'
      },
      antecedentesPatologicos: ['Gastritis leve'],
      sintomasDigestivos: ['Distensión por lácteos'],
      observacionesGenerales: 'Prefiere cenas ligeras'
    },
    dayName: 'Lunes',
    targetMealTime: {
      key: 'comida',
      label: 'Comida',
      icon: '🍲'
    },
    remainingMacros: {
      calories: 520,
      protein: 38,
      carbs: 55,
      fat: 16
    },
    dailyPlanMacros: {
      calories: 1800,
      protein: 120,
      carbs: 190,
      fat: 60
    },
    optionsCount: 3,
    culinaryStyle: 'mexicana_casera',
    customNotes: 'Incluir tortillas de maíz y salsa verde suave'
  };

  // Test 1: Prompt Construction
  const prompt = GeminiMealSuggestionService.buildPrompt(mockInput);

  if (!prompt.includes('Valeria Morales')) throw new Error('Prompt should include patient name');
  if (!prompt.includes('Mariscos')) throw new Error('Prompt should include allergy Mariscos');
  if (!prompt.includes('Intolerancia a la lactosa')) throw new Error('Prompt should include medical alert Intolerancia a la lactosa');
  if (!prompt.includes('Pescado blanco')) throw new Error('Prompt should include dislike Pescado blanco');
  if (!prompt.includes('Aguacate')) throw new Error('Prompt should include favorite Aguacate');
  if (!prompt.includes('Gastritis leve')) throw new Error('Prompt should include pathology Gastritis leve');
  if (!prompt.includes('Lunes')) throw new Error('Prompt should include day Lunes');
  if (!prompt.includes('Comida')) throw new Error('Prompt should include meal Comida');
  if (!prompt.includes('520 kcal')) throw new Error('Prompt should include remaining calories 520 kcal');
  if (!prompt.includes('38g')) throw new Error('Prompt should include remaining protein 38g');
  if (!prompt.includes('exactamente 3 opciones diferentes')) throw new Error('Prompt should request exactly 3 options');
  if (!prompt.includes('Incluir tortillas de maíz y salsa verde suave')) throw new Error('Prompt should include custom notes');
  if (!prompt.includes('SMAE')) throw new Error('Prompt should reference SMAE');

  console.log('✓ Test 1 Passed: Prompt properly constructed with all clinical constraints and targets.');

  // Test 2: Sanitizing JSON response
  const rawGeminiJson = JSON.stringify([
    {
      nombre: 'Tacos dorados de pollo al comal',
      descripcion: 'Tacos de pechuga cocidos al comal con salsa verde suave y aguacate fresco.',
      porcion: '1 plato (3 tacos)',
      tiempoPreparacionMin: 20,
      ingredientes: [
        '130 g Pechuga de pollo cocida y deshebrada',
        '3 piezas (90g) Tortilla de maíz',
        '1/4 pieza (30g) Aguacate Hass',
        '1/2 taza (100g) Frijoles negros refritos con poco aceite',
        '1 porción Salsa verde cocida no irritante'
      ],
      macros: {
        calories: 515,
        protein: 39,
        carbs: 52,
        fat: 15
      },
      justificacionClinica: 'Aporte de 39g de proteína magra con tortillas como fuente de carbohidratos complejos y sin lácteos.'
    }
  ]);

  const parsed = (GeminiMealSuggestionService as any).parseAndSanitizeDishes(rawGeminiJson, mockInput);

  if (!Array.isArray(parsed) || parsed.length !== 1) throw new Error('Expected 1 parsed dish');
  const dish = parsed[0];
  if (dish.nombre !== 'Tacos dorados de pollo al comal') throw new Error('Unexpected dish name');
  if (dish.categoria !== 'comida') throw new Error('Dish category should match target meal');
  if (dish.macros.calories !== 515) throw new Error('Unexpected calories');
  if (dish.macros.protein !== 39) throw new Error('Unexpected protein');
  if (!dish.justificacionClinica.includes('39g de proteína magra')) throw new Error('Clinical rationale missing');

  dish.ingredientes.forEach((ing: string) => {
    if (/^\d+\s+\d+/.test(ing)) {
      throw new Error(`Corrupt duplicate number in ingredient: ${ing}`);
    }
  });

  console.log('✓ Test 2 Passed: JSON response safely sanitized into clean Mexican SMAE portions.');
  console.log('All Gemini Meal Suggestion tests passed successfully!');
}

runGeminiMealSuggestionTests();
