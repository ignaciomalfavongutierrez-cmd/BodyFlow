import { FOOD_STATE_CONVERSIONS } from '../../catalog/shopping/conversions';
import type { FoodState  } from '../../types/shoppingDiet';

export class FoodStateConversionService {
  public static processFoodState(
    ingredientId: string | null,
    ingredientName: string,
    quantity: number | null,
    state: FoodState,
    categoryId?: string | null
  ): { quantity: number | null; state: FoodState; warning: string | null } {
    if (state !== 'cooked' && state !== 'prepared') {
      return { quantity, state: 'raw', warning: null };
    }

    if (quantity === null) {
      return { quantity: null, state: 'raw', warning: null };
    }

    // 1. Direct configured factor by ingredient ID
    if (ingredientId) {
      const conversion = FOOD_STATE_CONVERSIONS.find(
        (c) => c.ingredient_id === ingredientId && c.from_state === 'cooked'
      );

      if (conversion) {
        const convertedQty = Math.round(quantity * conversion.factor * 100) / 100;
        return {
          quantity: convertedQty,
          state: 'raw',
          warning: null,
        };
      }
    }

    // 2. Category / Heuristic fallback for animal proteins (cat-1) or cereals (cat-2)
    const lowerName = (ingredientName || '').toLowerCase();

    // Animal proteins: yield loss in cooking (~20-25% water loss), raw purchase weight = cooked * 1.25
    if (
      categoryId === 'cat-1' ||
      /(pollo|res\b|carne|pescado|salmon|atun|tilapia|cerdo|pavo|bistec|camaron|lomo|arrachera)/i.test(lowerName)
    ) {
      return {
        quantity: Math.round(quantity * 1.25 * 100) / 100,
        state: 'raw',
        warning: null,
      };
    }

    // Cereals (arroz, pasta, quinoa): water absorption in cooking, raw dry weight = cooked * 0.40
    if (
      categoryId === 'cat-2' ||
      /(arroz|pasta|espagueti|spaghetti|quinoa|quinua|fideo)/i.test(lowerName)
    ) {
      return {
        quantity: Math.round(quantity * 0.40 * 100) / 100,
        state: 'raw',
        warning: null,
      };
    }

    // Default for vegetables and others: 1:1 conversion to raw purchase weight
    return {
      quantity: quantity,
      state: 'raw',
      warning: null,
    };
  }
}

