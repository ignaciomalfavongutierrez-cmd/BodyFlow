import type { DietStructure, DietItem  } from '../../types/shoppingDiet';
import { IngredientNormalizerService } from './IngredientNormalizerService';
import { CATEGORIES } from '../../catalog/shopping/categories';

export class DietExtractionService {
  public static expandCompositeVegetables(rawItems: any[]): any[] {
    const expanded: any[] = [];

    for (const item of rawItems || []) {
      const orig = (item.original_name || item.normalized_name || '').trim();
      const lower = orig.toLowerCase();

      // Check for parenthetical list of vegetables: e.g. "Verduras (pepino, zanahoria, espinaca, jitomate) 250g"
      // or "Verdura (lechuga, jitomate) 200g"
      const parenMatch = lower.match(/(?:verdura[s]?|vegetal[es]?|ensalada|mix)\s*\(([^)]+)\)/i);
      
      // Or connected vegetables: e.g. "Pepino y zanahoria 2 tazas", "Espinaca, jitomate y champiñones"
      const isConnectedVeggies = !parenMatch && /(pepino|zanahoria|espinaca|jitomate|tomate|lechuga|calabacita|brocoli|brócoli|champin|hongo|seta|nopal|apio|pimiento|ejote|coliflor|esparrag)\w*\s*(?:,| y | e )\s*(pepino|zanahoria|espinaca|jitomate|tomate|lechuga|calabacita|brocoli|brócoli|champin|hongo|seta|nopal|apio|pimiento|ejote|coliflor|esparrag)/i.test(lower);

      let veggieList: string[] = [];

      if (parenMatch) {
        veggieList = parenMatch[1]
          .split(/[,;]|(?:\s+(?:y|e)\s+)/i)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 2);
      } else if (isConnectedVeggies) {
        // Strip leading bullets/words and quantity if at the end
        const cleanText = lower.replace(/^[•\-\*\d\.\s]+/g, '').replace(/\b\d+\s*(?:g|gr|kg|ml|l|taza[s]?|pieza[s]?)\b/gi, '').trim();
        veggieList = cleanText
          .split(/[,;]|(?:\s+(?:y|e)\s+)/i)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 2);
      }

      if (veggieList.length >= 2) {
        const count = veggieList.length;
        const totalQty = item.quantity !== undefined && item.quantity !== null && !isNaN(Number(item.quantity))
          ? Number(item.quantity)
          : null;
        const dividedQty = totalQty !== null ? Math.round((totalQty / count) * 10) / 10 : null;

        for (const vegName of veggieList) {
          expanded.push({
            original_name: vegName.charAt(0).toUpperCase() + vegName.slice(1),
            normalized_name: vegName,
            category: 'verduras',
            quantity: dividedQty,
            unit: item.unit || 'g',
            state: item.state || 'raw',
            notes: item.notes && !/porci[oó]n|parte de/i.test(item.notes) ? item.notes : null,
          });
        }
      } else {
        expanded.push(item);
      }
    }

    return expanded;
  }

  public static validateAndStructure(rawDiet: any): DietStructure {
    const warnings: string[] = [...(rawDiet.warnings || [])];
    let itemCount = 0;

    const days = (rawDiet.days || []).map((day: any, dIdx: number) => {
      const dayNum = day.day_number || dIdx + 1;

      const meals = (day.meals || []).map((meal: any, mIdx: number) => {
        const mealName = meal.meal_name || `Comida ${mIdx + 1}`;

        // First expand composite vegetable lists (e.g. "Verduras (pepino, zanahoria, espinaca, jitomate)")
        const expandedItems = this.expandCompositeVegetables(meal.items || []);

        const items: DietItem[] = expandedItems.map((item: any, iIdx: number) => {
          itemCount++;
          const id = `item-${dayNum}-${mIdx + 1}-${iIdx + 1}-${Math.random().toString(36).substr(2, 5)}`;
          const origName = (item.original_name || item.normalized_name || 'Alimento sin nombre').trim();
          const rawNormName = (item.normalized_name || origName).trim();

          // Normalization & Category Resolution
          const normResult = IngredientNormalizerService.normalize(
            rawNormName,
            item.category || item.category_id || item.category_slug
          );

          const categoryId = normResult.category_id;
          const categoryObj = CATEGORIES.find((c) => c.id === categoryId);
          const categoryName = categoryObj ? categoryObj.name : 'Otros';

          let qty = item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : null;
          if (qty !== null && isNaN(qty)) {
            qty = null;
          }

          let unit = (item.unit || '').trim();
          let state = item.state || 'unspecified';
          let notes = item.notes || null;

          if (qty === null) {
            if (!notes) {
              notes = 'Cantidad no especificada';
            }
            if (notes.toLowerCase().includes('gusto')) {
              unit = 'al gusto';
            }
          }

          if (normResult.alternative_option) {
            notes = notes
              ? `${notes}, Opción alternativa: ${normResult.alternative_option}`
              : `Opción alternativa: ${normResult.alternative_option}`;
          }

          return {
            id,
            original_name: origName,
            normalized_name: normResult.normalized_name,
            category_id: categoryId,
            category_name: categoryName,
            quantity: qty,
            unit,
            state,
            notes,
            source_day: dayNum,
            source_meal: mealName,
          };
        });

        return {
          meal_name: mealName,
          items,
        };
      });

      return {
        day_number: dayNum,
        meals,
      };
    });

    if (itemCount === 0) {
      warnings.push('No se detectaron alimentos en la dieta proporcionada.');
    }

    return {
      diet_name: rawDiet.diet_name || 'Plan Nutricional',
      days,
      warnings,
    };
  }
}
