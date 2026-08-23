import { UNIT_CONVERSIONS } from '../../catalog/shopping/conversions';
import type { IngredientCatalogItem  } from '../../types/shoppingDiet';

export class UnitConversionService {
  public static normalizeUnitName(unit: string): string {
    if (!unit) return 'unspecified';
    const u = unit.toLowerCase().trim();
    if (u === 'g' || u === 'gr' || u === 'gramos' || u === 'gramo') return 'g';
    if (u === 'kg' || u === 'kilos' || u === 'kilo' || u === 'kilogramo' || u === 'kilogramos') return 'kg';
    if (u === 'ml' || u === 'mililitros' || u === 'mililitro' || u === 'cc') return 'ml';
    if (u === 'l' || u === 'lt' || u === 'litros' || u === 'litro') return 'L';
    if (u === 'pieza' || u === 'piezas' || u === 'pza' || u === 'pzas' || u === 'unidad' || u === 'unidades') return 'pieza';
    if (u === 'rebanada' || u === 'rebanadas') return 'rebanada';
    if (u === 'tortilla' || u === 'tortillas') return 'tortilla';
    if (u === 'lata' || u === 'latas') return 'lata';
    if (u === 'taza' || u === 'tazas') return 'taza';
    if (u === 'cucharada' || u === 'cucharadas' || u === 'cda' || u === 'cdas') return 'cucharada';
    if (u === 'cucharadita' || u === 'cucharaditas' || u === 'cdita' || u === 'cditas') return 'cucharadita';
    if (u === 'scoop' || u === 'scoops' || u === 'medida' || u === 'medidas') return 'scoop';
    if (u === 'porcion' || u === 'porciones' || u === 'porción') return 'porción';
    if (u === 'toma' || u === 'tomas') return 'toma';
    if (u === 'clara' || u === 'claras') return 'clara';
    if (u === 'paquete' || u === 'paquetes' || u === 'paq') return 'paquete';
    if (u === 'bote' || u === 'botes') return 'bote';
    if (u === 'frasco' || u === 'frascos') return 'frasco';
    if (u === 'botella' || u === 'botellas') return 'botella';
    if (u === 'bolsa' || u === 'bolsas') return 'bolsa';
    if (u === 'caja' || u === 'cajas') return 'caja';
    if (u === 'al gusto' || u === 'libre') return 'al gusto';
    return u;
  }

  public static convert(
    quantity: number,
    fromUnit: string,
    toUnit: string,
    ingredient?: IngredientCatalogItem | null
  ): { quantity: number; unit: string; converted: boolean } {
    const normFrom = this.normalizeUnitName(fromUnit);
    const normTo = this.normalizeUnitName(toUnit);

    if (normFrom === normTo) {
      return { quantity, unit: normFrom, converted: false };
    }

    // 1. Direct table conversion
    const directConv = UNIT_CONVERSIONS.find(
      (c) => c.from_unit === normFrom && c.to_unit === normTo
    );
    if (directConv) {
      return {
        quantity: Math.round(quantity * directConv.factor * 1000) / 1000,
        unit: normTo,
        converted: true,
      };
    }

    // 2. Inverse table conversion
    const inverseConv = UNIT_CONVERSIONS.find(
      (c) => c.from_unit === normTo && c.to_unit === normFrom
    );
    if (inverseConv && inverseConv.factor > 0) {
      return {
        quantity: Math.round((quantity / inverseConv.factor) * 1000) / 1000,
        unit: normTo,
        converted: true,
      };
    }

    // 3. Ingredient-specific piece / culinary conversions
    if (ingredient) {
      const ingId = ingredient.id;

      // Claras de huevo (ing-29): 1 pieza/clara = 33 ml
      if (ingId === 'ing-29') {
        if (normFrom === 'pieza' && normTo === 'ml') {
          return { quantity: quantity * 33, unit: 'ml', converted: true };
        }
        if (normFrom === 'pieza' && normTo === 'L') {
          return { quantity: (quantity * 33) / 1000, unit: 'L', converted: true };
        }
        if (normFrom === 'clara' && normTo === 'ml') {
          return { quantity: quantity * 33, unit: 'ml', converted: true };
        }
      }

      // Pan integral (ing-10): 1 pieza = 1 rebanada = 25g
      if (ingId === 'ing-10') {
        if (normFrom === 'pieza' && normTo === 'rebanada') {
          return { quantity, unit: 'rebanada', converted: true };
        }
        if (normFrom === 'g' && normTo === 'rebanada') {
          return { quantity: Math.round((quantity / 25) * 10) / 10, unit: 'rebanada', converted: true };
        }
      }

      // Atún en agua (ing-2): 1 lata ≈ 120 g (masa drenada)
      if (ingId === 'ing-2') {
        if (normFrom === 'g' && normTo === 'lata') {
          return { quantity: Math.round((quantity / 120) * 10) / 10, unit: 'lata', converted: true };
        }
        if (normFrom === 'lata' && normTo === 'g') {
          return { quantity: quantity * 120, unit: 'g', converted: true };
        }
      }

      // Plátano (ing-15): 1 pieza ≈ 130 g, 1 taza ≈ 150 g
      if (ingId === 'ing-15') {
        if (normFrom === 'g' && normTo === 'pieza') {
          return { quantity: Math.round((quantity / 120) * 10) / 10, unit: 'pieza', converted: true };
        }
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 120, unit: 'g', converted: true };
        }
        if (normFrom === 'taza' && normTo === 'pieza') {
          return { quantity: Math.round(quantity * 1.2 * 10) / 10, unit: 'pieza', converted: true };
        }
      }

      // Aguacate (ing-19): 1 pieza ≈ 150 g
      if (ingId === 'ing-19') {
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 150, unit: 'g', converted: true };
        }
        if (normFrom === 'g' && normTo === 'pieza') {
          return { quantity: Math.round((quantity / 150) * 10) / 10, unit: 'pieza', converted: true };
        }
      }

      // Manzana (ing-16) & Naranja (ing-61): 1 pieza ≈ 150 g
      if (ingId === 'ing-16' || ingId === 'ing-61') {
        if (normFrom === 'g' && normTo === 'pieza') {
          return { quantity: Math.round((quantity / 150) * 10) / 10, unit: 'pieza', converted: true };
        }
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 150, unit: 'g', converted: true };
        }
      }

      // Lechuga (ing-46): 1 pieza ≈ 250 g
      if (ingId === 'ing-46' || /lechuga/i.test(ingredient.slug || '')) {
        if (normFrom === 'g' && (normTo === 'pieza' || normTo === 'piezas')) {
          return { quantity: Math.round((quantity / 250) * 100) / 100, unit: 'pieza', converted: true };
        }
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 250, unit: 'g', converted: true };
        }
      }

      // Pepino (ing-47): 1 pieza ≈ 250 g, 1 taza ≈ 150 g
      if (ingId === 'ing-47' || /pepino/i.test(ingredient.slug || '')) {
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 250, unit: 'g', converted: true };
        }
        if (normFrom === 'taza' && normTo === 'g') {
          return { quantity: quantity * 150, unit: 'g', converted: true };
        }
      }

      // Zanahoria (ing-14): 1 pieza ≈ 120 g, 1 taza ≈ 130 g
      if (ingId === 'ing-14' || /zanahoria/i.test(ingredient.slug || '')) {
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 120, unit: 'g', converted: true };
        }
        if (normFrom === 'taza' && normTo === 'g') {
          return { quantity: quantity * 130, unit: 'g', converted: true };
        }
      }

      // Jitomate (ing-11): 1 pieza ≈ 120 g, 1 taza ≈ 150 g
      if (ingId === 'ing-11' || /jitomate|tomate/i.test(ingredient.slug || '')) {
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 120, unit: 'g', converted: true };
        }
        if (normFrom === 'taza' && normTo === 'g') {
          return { quantity: quantity * 150, unit: 'g', converted: true };
        }
      }

      // Nopales (ing-45): 1 pieza/penca ≈ 100 g, 1 taza ≈ 150 g
      if (ingId === 'ing-45' || /nopal/i.test(ingredient.slug || '')) {
        if (normFrom === 'pieza' && normTo === 'g') {
          return { quantity: quantity * 100, unit: 'g', converted: true };
        }
        if (normFrom === 'taza' && normTo === 'g') {
          return { quantity: quantity * 150, unit: 'g', converted: true };
        }
      }

      // Espinaca (ing-13): 1 taza ≈ 60 g, 1 manojo ≈ 250 g
      if (ingId === 'ing-13' || /espinaca/i.test(ingredient.slug || '')) {
        if (normFrom === 'taza' && normTo === 'g') {
          return { quantity: quantity * 60, unit: 'g', converted: true };
        }
        if (normFrom === 'manojo' && normTo === 'g') {
          return { quantity: quantity * 250, unit: 'g', converted: true };
        }
      }

      // Fruta de temporada (ing-90): 1 taza de fruta picada ≈ 1 pieza (o 150g)
      if (ingId === 'ing-90') {
        if (normFrom === 'taza' && normTo === 'pieza') {
          return { quantity, unit: 'pieza', converted: true };
        }
        if (normFrom === 'g' && normTo === 'pieza') {
          return { quantity: Math.round((quantity / 150) * 10) / 10, unit: 'pieza', converted: true };
        }
      }

      // Aceite de oliva (ing-20) / líquidos: densidad 1 g ≈ 1 ml
      if (ingredient.category_id === 'cat-5' || ingredient.base_unit === 'ml') {
        if (normFrom === 'g' && normTo === 'ml') {
          return { quantity, unit: 'ml', converted: true };
        }
        if (normFrom === 'ml' && normTo === 'g') {
          return { quantity, unit: 'g', converted: true };
        }
      }
    }

    // 4. Multi-step intermediate conversions via 'g' or 'ml'
    // E.g. scoop -> g -> kg
    if (['scoop', 'porción', 'porcion', 'toma', 'cucharada', 'cucharadita', 'taza', 'rebanada'].includes(normFrom)) {
      const step1 = this.convert(quantity, normFrom, 'g');
      if (step1.converted) {
        if (normTo === 'kg') {
          return { quantity: Math.round((step1.quantity / 1000) * 1000) / 1000, unit: 'kg', converted: true };
        }
        return step1;
      }
    }

    // E.g. cda/cdita/taza -> ml -> L
    if (['cucharada', 'cucharadita', 'taza', 'clara'].includes(normFrom) && normTo === 'L') {
      const step1 = this.convert(quantity, normFrom, 'ml');
      if (step1.converted) {
        return { quantity: Math.round((step1.quantity / 1000) * 1000) / 1000, unit: 'L', converted: true };
      }
    }

    // 5. Default metric conversions
    if (normFrom === 'g' && (normTo === 'kg' || quantity >= 1000)) {
      return {
        quantity: Math.round((quantity / 1000) * 100) / 100,
        unit: 'kg',
        converted: true,
      };
    }

    if (normFrom === 'ml' && (normTo === 'L' || quantity >= 1000)) {
      return {
        quantity: Math.round((quantity / 1000) * 100) / 100,
        unit: 'L',
        converted: true,
      };
    }

    return { quantity, unit: normFrom, converted: false };
  }
}

