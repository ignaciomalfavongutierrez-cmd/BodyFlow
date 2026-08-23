import type { UnitConversionFactor, FoodStateConversionFactor  } from '../../types/shoppingDiet';

export const UNIT_CONVERSIONS: UnitConversionFactor[] = [
  // Gramos a Kilogramos
  { from_unit: 'g', to_unit: 'kg', factor: 0.001 },
  { from_unit: 'kg', to_unit: 'g', factor: 1000 },

  // Mililitros a Litros
  { from_unit: 'ml', to_unit: 'L', factor: 0.001 },
  { from_unit: 'L', to_unit: 'ml', factor: 1000 },
  { from_unit: 'l', to_unit: 'L', factor: 1 },

  // Unidades culinarias a Gramos (estándar culinario)
  { from_unit: 'cucharadita', to_unit: 'g', factor: 5 },
  { from_unit: 'cucharada', to_unit: 'g', factor: 15 },
  { from_unit: 'taza', to_unit: 'g', factor: 240 },
  { from_unit: 'scoop', to_unit: 'g', factor: 30 },
  { from_unit: 'porción', to_unit: 'g', factor: 30 },
  { from_unit: 'porcion', to_unit: 'g', factor: 30 },
  { from_unit: 'toma', to_unit: 'g', factor: 30 },
  { from_unit: 'rebanada', to_unit: 'g', factor: 25 },

  // Unidades culinarias a Mililitros
  { from_unit: 'cucharadita', to_unit: 'ml', factor: 5 },
  { from_unit: 'cucharada', to_unit: 'ml', factor: 15 },
  { from_unit: 'taza', to_unit: 'ml', factor: 240 },

  // Equivalencias de piezas a unidades base (peso/volumen promedio)
  { from_unit: 'clara', to_unit: 'ml', factor: 33 },
  { from_unit: 'claras', to_unit: 'ml', factor: 33 },
];

export const FOOD_STATE_CONVERSIONS: FoodStateConversionFactor[] = [
  // Proteínas animales (pérdida de agua por cocción ~20-25%: peso crudo de compra = peso cocido * 1.25)
  { ingredient_id: 'ing-1', from_state: 'cooked', to_state: 'raw', factor: 1.25 },  // Pechuga de pollo
  { ingredient_id: 'ing-4', from_state: 'cooked', to_state: 'raw', factor: 1.25 },  // Carne molida de res
  { ingredient_id: 'ing-5', from_state: 'cooked', to_state: 'raw', factor: 1.25 },  // Filete de pescado
  { ingredient_id: 'ing-28', from_state: 'cooked', to_state: 'raw', factor: 1.20 }, // Pechuga de pavo
  { ingredient_id: 'ing-30', from_state: 'cooked', to_state: 'raw', factor: 1.25 }, // Salmón fresco
  { ingredient_id: 'ing-31', from_state: 'cooked', to_state: 'raw', factor: 1.30 }, // Camarón
  { ingredient_id: 'ing-32', from_state: 'cooked', to_state: 'raw', factor: 1.25 }, // Bistec de res magro
  { ingredient_id: 'ing-33', from_state: 'cooked', to_state: 'raw', factor: 1.25 }, // Lomo de cerdo

  // Cereales (absorción de agua: peso crudo = peso cocido * factor)
  { ingredient_id: 'ing-7', from_state: 'cooked', to_state: 'raw', factor: 0.40 },  // Arroz blanco (triplica)
  { ingredient_id: 'ing-36', from_state: 'cooked', to_state: 'raw', factor: 0.40 }, // Arroz integral
  { ingredient_id: 'ing-37', from_state: 'cooked', to_state: 'raw', factor: 0.45 }, // Pasta integral (duplica y medio)
  { ingredient_id: 'ing-35', from_state: 'cooked', to_state: 'raw', factor: 0.40 }, // Quinoa

  // Tubérculos y verduras cocidas / salteadas (relación 1:1 de compra)
  { ingredient_id: 'ing-40', from_state: 'cooked', to_state: 'raw', factor: 1.0 },  // Papa
  { ingredient_id: 'ing-41', from_state: 'cooked', to_state: 'raw', factor: 1.0 },  // Camote
  { ingredient_id: 'ing-45', from_state: 'cooked', to_state: 'raw', factor: 1.0 },  // Nopales
  { ingredient_id: 'ing-53', from_state: 'cooked', to_state: 'raw', factor: 1.0 },  // Mix de verduras salteadas
  { ingredient_id: 'ing-54', from_state: 'cooked', to_state: 'raw', factor: 1.0 },  // Verduras al vapor
];

