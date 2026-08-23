import type { DietStructure  } from '../../types/shoppingDiet';

export const SAMPLE_DIET: DietStructure = {
  diet_name: 'Plan Nutricional 7 Días - Ejemplo de Prueba',
  days: [
    {
      day_number: 1,
      meals: [
        {
          meal_name: 'Desayuno',
          items: [
            { id: 's1', original_name: '60 g avena', normalized_name: 'Avena', quantity: 60, unit: 'g', state: 'raw', notes: null, source_day: 1, source_meal: 'Desayuno' },
            { id: 's2', original_name: '300 ml leche entera', normalized_name: 'Leche entera', quantity: 300, unit: 'ml', state: 'liquid', notes: null, source_day: 1, source_meal: 'Desayuno' },
            { id: 's3', original_name: '1 plátano', normalized_name: 'Plátano', quantity: 1, unit: 'pieza', state: 'raw', notes: null, source_day: 1, source_meal: 'Desayuno' },
            { id: 's4', original_name: '10 g crema de cacahuate', normalized_name: 'Crema de cacahuate', quantity: 10, unit: 'g', state: 'prepared', notes: null, source_day: 1, source_meal: 'Desayuno' },
          ],
        },
        {
          meal_name: 'Almuerzo',
          items: [
            { id: 's5', original_name: '1 lata de atún en agua', normalized_name: 'Atún en agua', quantity: 1, unit: 'lata', state: 'prepared', notes: null, source_day: 1, source_meal: 'Almuerzo' },
            { id: 's6', original_name: '4 tostadas horneadas', normalized_name: 'Tostadas horneadas', quantity: 4, unit: 'pieza', state: 'prepared', notes: null, source_day: 1, source_meal: 'Almuerzo' },
            { id: 's7', original_name: '40 g aguacate', normalized_name: 'Aguacate', quantity: 40, unit: 'g', state: 'raw', notes: null, source_day: 1, source_meal: 'Almuerzo' },
          ],
        },
        {
          meal_name: 'Comida',
          items: [
            { id: 's8', original_name: '160 g pechuga de pollo', normalized_name: 'Pechuga de pollo', quantity: 160, unit: 'g', state: 'raw', notes: null, source_day: 1, source_meal: 'Comida' },
            { id: 's9', original_name: '275 g arroz cocido', normalized_name: 'Arroz', quantity: 275, unit: 'g', state: 'cooked', notes: null, source_day: 1, source_meal: 'Comida' },
            { id: 's10', original_name: 'Jitomate al gusto', normalized_name: 'Jitomate', quantity: null, unit: 'al gusto', state: 'raw', notes: 'Al gusto', source_day: 1, source_meal: 'Comida' },
          ],
        },
      ],
    },
    {
      day_number: 2,
      meals: [
        {
          meal_name: 'Desayuno',
          items: [
            { id: 's11', original_name: '3 huevos enteros', normalized_name: 'Huevo entero', quantity: 3, unit: 'pieza', state: 'raw', notes: null, source_day: 2, source_meal: 'Desayuno' },
            { id: 's12', original_name: '2 tortillas de maíz', normalized_name: 'Tortillas de maíz', quantity: 2, unit: 'pieza', state: 'prepared', notes: null, source_day: 2, source_meal: 'Desayuno' },
            { id: 's13', original_name: 'Espinaca al gusto', normalized_name: 'Espinaca', quantity: null, unit: 'al gusto', state: 'raw', notes: 'Al gusto', source_day: 2, source_meal: 'Desayuno' },
          ],
        },
        {
          meal_name: 'Comida',
          items: [
            { id: 's14', original_name: '170 g pechuga de pollo', normalized_name: 'Pechuga de pollo', quantity: 170, unit: 'g', state: 'raw', notes: null, source_day: 2, source_meal: 'Comida' },
            { id: 's15', original_name: '200 g arroz cocido', normalized_name: 'Arroz', quantity: 200, unit: 'g', state: 'cooked', notes: null, source_day: 2, source_meal: 'Comida' },
          ],
        },
      ],
    },
    {
      day_number: 3,
      meals: [
        {
          meal_name: 'Desayuno',
          items: [
            { id: 's16', original_name: '60 g avena', normalized_name: 'Avena', quantity: 60, unit: 'g', state: 'raw', notes: null, source_day: 3, source_meal: 'Desayuno' },
            { id: 's17', original_name: '300 ml leche entera', normalized_name: 'Leche entera', quantity: 300, unit: 'ml', state: 'liquid', notes: null, source_day: 3, source_meal: 'Desayuno' },
          ],
        },
        {
          meal_name: 'Comida',
          items: [
            { id: 's18', original_name: '160 g pechuga de pollo', normalized_name: 'Pechuga de pollo', quantity: 160, unit: 'g', state: 'raw', notes: null, source_day: 3, source_meal: 'Comida' },
            { id: 's19', original_name: '1 lata de atún en agua', normalized_name: 'Atún en agua', quantity: 1, unit: 'lata', state: 'prepared', notes: null, source_day: 3, source_meal: 'Comida' },
            { id: 's20', original_name: 'Canela una cucharadita', normalized_name: 'Canela', quantity: 1, unit: 'cucharadita', state: 'prepared', notes: null, source_day: 3, source_meal: 'Comida' },
          ],
        },
      ],
    },
    {
      day_number: 4,
      meals: [
        {
          meal_name: 'Desayuno',
          items: [
            { id: 's21', original_name: '3 huevos enteros', normalized_name: 'Huevo entero', quantity: 3, unit: 'pieza', state: 'raw', notes: null, source_day: 4, source_meal: 'Desayuno' },
          ],
        },
      ],
    },
    {
      day_number: 5,
      meals: [
        {
          meal_name: 'Comida',
          items: [
            { id: 's22', original_name: '160 g pechuga de pollo', normalized_name: 'Pechuga de pollo', quantity: 160, unit: 'g', state: 'raw', notes: null, source_day: 5, source_meal: 'Comida' },
            { id: 's23', original_name: 'Limón', normalized_name: 'Limón', quantity: null, unit: 'unspecified', state: 'raw', notes: 'Cantidad no especificada', source_day: 5, source_meal: 'Comida' },
          ],
        },
      ],
    },
    {
      day_number: 6,
      meals: [
        {
          meal_name: 'Cena',
          items: [
            { id: 's24', original_name: '1 lata de atún en agua', normalized_name: 'Atún en agua', quantity: 1, unit: 'lata', state: 'prepared', notes: null, source_day: 6, source_meal: 'Cena' },
          ],
        },
      ],
    },
    {
      day_number: 7,
      meals: [
        {
          meal_name: 'Desayuno',
          items: [
            { id: 's25', original_name: '3 huevos enteros', normalized_name: 'Huevo entero', quantity: 3, unit: 'pieza', state: 'raw', notes: null, source_day: 7, source_meal: 'Desayuno' },
          ],
        },
      ],
    },
  ],
  warnings: [],
};
