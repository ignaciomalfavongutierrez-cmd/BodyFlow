export type FoodState = 'raw' | 'cooked' | 'prepared' | 'liquid' | 'piece' | 'unspecified';

export type PurchaseStrategy = 'economic' | 'value' | 'premium' | 'neutral';

export interface DietItem {
  id: string;
  original_name: string;
  normalized_name: string;
  category_id?: string;
  category_name?: string;
  quantity: number | null;
  unit: string;
  state: FoodState;
  notes: string | null;
  source_day: number;
  source_meal: string;
}

export interface DietMeal {
  meal_name: string;
  items: DietItem[];
}

export interface DietDay {
  day_number: number;
  meals: DietMeal[];
}

export interface DietStructure {
  diet_name: string;
  days: DietDay[];
  warnings: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
}

export interface IngredientCatalogItem {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  base_unit: string;
  purchase_unit: string;
  waste_percentage: number;
  commercial_rounding_step?: number;
  commercial_unit?: string;
  active: boolean;
}

export interface IngredientAlias {
  id: string;
  ingredient_id: string;
  alias: string;
}

export interface UnitConversionFactor {
  from_unit: string;
  to_unit: string;
  factor: number; // to_unit = from_unit * factor
}

export interface FoodStateConversionFactor {
  ingredient_id: string;
  from_state: FoodState;
  to_state: FoodState;
  factor: number; // target_qty = source_qty * factor
}

export interface ShoppingItem {
  id: string;
  ingredient_id: string | null;
  normalized_name: string;
  category_id: string;
  calculated_quantity: number | null; // Total before merma
  quantity_with_waste: number | null;  // Total after 10% merma
  unit: string;
  purchase_quantity: string;          // Commercial rounded quantity string (e.g., "2 kg")
  purchase_unit: string;
  state: FoodState;
  notes: string | null;
  is_purchased: boolean;
  is_unspecified_quantity: boolean;
  warnings: string[];
  sources: { day: number; meal: string; original_name: string; qty: number | null; unit: string }[];
}

export interface ShoppingCategoryGroup {
  category: Category;
  items: ShoppingItem[];
}

export interface ShoppingListCalculationResult {
  diet_name: string;
  selected_days: number[];
  cycle_multiplier?: number;
  total_days_planned?: number;
  purchase_strategy: PurchaseStrategy;
  categories: ShoppingCategoryGroup[];
  unspecified_items: ShoppingItem[];
  warnings: string[];
  waste_note: string;
  generated_at: string;
}
