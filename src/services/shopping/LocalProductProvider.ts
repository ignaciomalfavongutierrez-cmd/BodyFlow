import type { PurchaseStrategy  } from '../../types/shoppingDiet';

export interface CommercialProductInfo {
  brand: string | null;
  product_name: string;
  retailer: string | null;
  price_estimate: string | null;
}

export class LocalProductProvider {
  public static getRecommendation(
    normalizedIngredientName: string,
    _strategy: PurchaseStrategy
  ): CommercialProductInfo | null {
    // Return decoupling metadata without generating fake prices
    return {
      brand: null,
      product_name: normalizedIngredientName,
      retailer: null,
      price_estimate: null,
    };
  }
}
