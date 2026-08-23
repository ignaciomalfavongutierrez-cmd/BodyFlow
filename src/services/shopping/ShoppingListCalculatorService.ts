import type { DietStructure,
  PurchaseStrategy,
  ShoppingListCalculationResult,
  ShoppingItem,
  ShoppingCategoryGroup,
 } from '../../types/shoppingDiet';
import { CATEGORIES } from '../../catalog/shopping/categories';
import { IngredientNormalizerService } from './IngredientNormalizerService';
import { FoodStateConversionService } from './FoodStateConversionService';
import { UnitConversionService } from './UnitConversionService';
import { WasteCalculatorService } from './WasteCalculatorService';
import { CommercialQuantityService } from './CommercialQuantityService';

export class ShoppingListCalculatorService {
  public static calculate(
    diet: DietStructure,
    selectedDays: number[],
    purchaseStrategy: PurchaseStrategy = 'value',
    multiplier: number = 1
  ): ShoppingListCalculationResult {
    const validMultiplier = Math.max(1, multiplier || 1);
    const warnings: string[] = [...(diet.warnings || [])];
    const itemGroupsMap = new Map<string, {
      normalized_name: string;
      ingredient_id: string | null;
      category_id: string;
      unit: string;
      state: any;
      total_quantity: number | null;
      rounding_step?: number;
      commercial_unit?: string;
      notesSet: Set<string>;
      is_unspecified: boolean;
      itemWarnings: string[];
      sources: { day: number; meal: string; original_name: string; qty: number | null; unit: string }[];
    }>();

    // 1. Filter days and aggregate items
    for (const day of diet.days || []) {
      if (!selectedDays.includes(day.day_number)) {
        continue;
      }

      for (const meal of day.meals || []) {
        for (const item of meal.items || []) {
          // Normalize ingredient
          const normResult = IngredientNormalizerService.normalize(
            item.normalized_name || item.original_name,
            item.category_id || (item as any).category
          );
          if (normResult.warning) {
            warnings.push(normResult.warning);
          }

          // Process food state (convert cooked/prepared to raw purchase state)
          const stateResult = FoodStateConversionService.processFoodState(
            normResult.ingredient?.id || null,
            normResult.normalized_name,
            item.quantity,
            item.state || 'unspecified',
            normResult.category_id
          );
          if (stateResult.warning) {
            warnings.push(stateResult.warning);
          }

          let normUnit = UnitConversionService.normalizeUnitName(item.unit);
          let effectiveQty = stateResult.quantity;

          // Determine canonical base unit for this ingredient
          const targetBaseUnit = normResult.ingredient?.base_unit || (
            normUnit === 'ml' || normUnit === 'L' ? 'ml' :
            normUnit === 'pieza' || normUnit === 'piezas' ? 'pieza' :
            normUnit === 'rebanada' || normUnit === 'rebanadas' ? 'rebanada' : 'g'
          );

          // Convert culinary kitchen units, scoops, slices, pieces to canonical base unit
          if (effectiveQty !== null) {
            const converted = UnitConversionService.convert(
              effectiveQty,
              normUnit,
              targetBaseUnit,
              normResult.ingredient
            );
            if (converted.converted) {
              effectiveQty = converted.quantity;
              normUnit = converted.unit;
            }
          }

          const isUnspecified = effectiveQty === null;

          // Unified grouping key by ingredient ID (or clean canonical name for custom items)
          const groupKey = normResult.ingredient
            ? `ing-${normResult.ingredient.id}`
            : `custom-${normResult.normalized_name.toLowerCase().trim()}`;

          if (!itemGroupsMap.has(groupKey)) {
            itemGroupsMap.set(groupKey, {
              normalized_name: normResult.normalized_name,
              ingredient_id: normResult.ingredient?.id || null,
              category_id: normResult.category_id,
              unit: targetBaseUnit,
              state: 'raw',
              total_quantity: isUnspecified ? null : 0,
              rounding_step: normResult.ingredient?.commercial_rounding_step,
              commercial_unit: normResult.ingredient?.commercial_unit,
              notesSet: new Set<string>(),
              is_unspecified: isUnspecified,
              itemWarnings: [],
              sources: [],
            });
          }

          const group = itemGroupsMap.get(groupKey)!;

          if (item.notes) {
            group.notesSet.add(item.notes);
          }
          if (normResult.alternative_option) {
            group.notesSet.add(`Opción alternativa: ${normResult.alternative_option}`);
          }

          group.sources.push({
            day: day.day_number,
            meal: meal.meal_name,
            original_name: item.original_name,
            qty: item.quantity,
            unit: item.unit,
          });

          if (!isUnspecified && effectiveQty !== null) {
            group.total_quantity = (group.total_quantity || 0) + effectiveQty;
            group.is_unspecified = false; // If at least one meal has a specified quantity, it becomes measurable
          }
        }
      }
    }

    const calculatedItems: ShoppingItem[] = [];
    const unspecifiedItems: ShoppingItem[] = [];
    let idCounter = 1;

    for (const [, group] of itemGroupsMap.entries()) {
      // Clean and deduplicate notes, discarding extraction noise
      const cleanNotesList: string[] = [];
      for (const rawNote of Array.from(group.notesSet)) {
        const parts = rawNote.split(' • ').map((p) => p.trim());
        for (const part of parts) {
          if (
            part &&
            !/^(al gusto|cantidad no especificada|porci[oó]n dividida|parte de|porci[oó]n sugerida)/i.test(part) &&
            !cleanNotesList.includes(part)
          ) {
            cleanNotesList.push(part);
          }
        }
      }

      // Automatic culinary suggestions for generic mixes based on preparation style
      if (!cleanNotesList.some((n) => /sugerencia/i.test(n))) {
        if (group.ingredient_id === 'ing-53' || /mix de verduras salteadas|verduras salteadas/i.test(group.normalized_name)) {
          cleanNotesList.push('Sugerencia: Calabacitas, brócoli, champiñones o pimientos');
        } else if (group.ingredient_id === 'ing-54' || /verduras al vapor/i.test(group.normalized_name)) {
          cleanNotesList.push('Sugerencia: Brócoli, coliflor, calabacitas o zanahoria');
        } else if (group.ingredient_id === 'ing-91' || /verduras para guisar|verduras mixtas/i.test(group.normalized_name)) {
          cleanNotesList.push('Sugerencia: Espinacas, champiñones, jitomate o nopales');
        } else if (group.ingredient_id === 'ing-55' || /ensalada verde/i.test(group.normalized_name)) {
          cleanNotesList.push('Sugerencia: Lechuga, pepino, espinaca o arúgula');
        } else if (group.ingredient_id === 'ing-90' || /fruta de temporada/i.test(group.normalized_name)) {
          cleanNotesList.push('Sugerencia: Manzana, plátano, fresas o frutos rojos');
        }
      }

      const combinedNotes = cleanNotesList.length > 0 ? cleanNotesList.join(' • ') : null;

      if (group.is_unspecified || group.total_quantity === null) {
        unspecifiedItems.push({
          id: `shop-unspec-${idCounter++}`,
          ingredient_id: group.ingredient_id,
          normalized_name: group.normalized_name,
          category_id: group.category_id,
          calculated_quantity: null,
          quantity_with_waste: null,
          unit: group.unit,
          purchase_quantity: 'Al gusto',
          purchase_unit: 'al gusto',
          state: group.state,
          notes: combinedNotes || 'Al gusto / Cantidad no especificada',
          is_purchased: false,
          is_unspecified_quantity: true,
          warnings: group.itemWarnings,
          sources: group.sources,
        });
        continue;
      }

      // Multiply total quantity across selected cycle by the planning multiplier (e.g. x2 for 14 days, x4 for 28 days)
      const baseTotalQty = group.total_quantity * validMultiplier;

      // Convert unit only if quantity >= 1000 (e.g. 1500 g -> 1.5 kg, 1500 ml -> 1.5 L)
      let targetUnit = group.unit;
      if (group.unit === 'g' && baseTotalQty >= 1000) {
        targetUnit = 'kg';
      } else if (group.unit === 'ml' && baseTotalQty >= 1000) {
        targetUnit = 'L';
      }
      const unitConversion = UnitConversionService.convert(baseTotalQty, group.unit, targetUnit);
      const calculatedQty = unitConversion.quantity;
      const finalUnit = unitConversion.unit;

      // Apply 10% Merma
      const qtyWithWaste = WasteCalculatorService.applyWaste(calculatedQty, 10);

      // Commercial rounding calculation
      const commercialInfo = CommercialQuantityService.calculateCommercialQuantity(
        qtyWithWaste,
        finalUnit,
        group.rounding_step,
        group.commercial_unit,
        group.ingredient_id,
        group.normalized_name
      );

      calculatedItems.push({
        id: `shop-item-${idCounter++}`,
        ingredient_id: group.ingredient_id,
        normalized_name: group.normalized_name,
        category_id: group.category_id,
        calculated_quantity: calculatedQty,
        quantity_with_waste: qtyWithWaste,
        unit: finalUnit,
        purchase_quantity: commercialInfo.purchase_quantity,
        purchase_unit: commercialInfo.purchase_unit,
        state: group.state,
        notes: combinedNotes,
        is_purchased: false,
        is_unspecified_quantity: false,
        warnings: group.itemWarnings,
        sources: group.sources,
      });
    }

    // 3. Group by Categories in required order
    const categoryGroups: ShoppingCategoryGroup[] = CATEGORIES.map((cat) => {
      const itemsInCat = calculatedItems.filter((i) => i.category_id === cat.id);
      return {
        category: cat,
        items: itemsInCat,
      };
    }).filter((g) => g.items.length > 0);

    // Deduplicate warnings
    const uniqueWarnings = Array.from(new Set(warnings));

    return {
      diet_name: diet.diet_name || 'Plan Nutricional',
      selected_days: selectedDays.sort((a, b) => a - b),
      cycle_multiplier: validMultiplier,
      total_days_planned: selectedDays.length * validMultiplier,
      purchase_strategy: purchaseStrategy,
      categories: categoryGroups,
      unspecified_items: unspecifiedItems,
      warnings: uniqueWarnings,
      waste_note: WasteCalculatorService.WASTE_NOTE,
      generated_at: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }
}
