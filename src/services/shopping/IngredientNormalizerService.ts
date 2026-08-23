import { INGREDIENTS } from '../../catalog/shopping/ingredients';
import { INGREDIENT_ALIASES } from '../../catalog/shopping/aliases';
import { CATEGORIES } from '../../catalog/shopping/categories';
import type { IngredientCatalogItem  } from '../../types/shoppingDiet';

export interface NormalizedResult {
  ingredient: IngredientCatalogItem | null;
  normalized_name: string;
  category_id: string;
  alternative_option?: string | null;
  warning: string | null;
}

export class IngredientNormalizerService {
  /**
   * Sanitizes text for comparison:
   * - Converts to lowercase
   * - Strips accents and diacritics
   * - Strips leading bullets (•, -, *, etc.) and numbers
   * - Normalizes common typos (e.g. yogut -> yogurt, brocoli -> brocoli)
   */
  public static cleanText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/^[•\-\*\d\.\s]+/g, '')   // remove leading bullets / numbers
      .replace(/\byogut\b/g, 'yogurt')   // typo fix
      .replace(/\byogur\b/g, 'yogurt')   // typo fix
      .replace(/\byoghurt\b/g, 'yogurt') // typo fix
      .replace(/[^a-z0-9\s]/g, ' ')      // replace punctuation with spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Converts a category slug or name (e.g. 'lacteos', 'verduras', 'cat-7') into canonical category_id ('cat-7', etc.)
   */
  public static resolveCategoryId(categoryInput?: string | null): string | null {
    if (!categoryInput) return null;
    const cleaned = this.cleanText(categoryInput);

    // If it's already a valid cat-X
    const directCat = CATEGORIES.find((c) => c.id === categoryInput || c.id === cleaned);
    if (directCat) return directCat.id;

    // Check slug or name match
    const slugMap: Record<string, string> = {
      proteinas: 'cat-1',
      proteina: 'cat-1',
      cereales: 'cat-2',
      cereal: 'cat-2',
      verduras: 'cat-3',
      verdura: 'cat-3',
      frutas: 'cat-4',
      fruta: 'cat-4',
      grasas: 'cat-5',
      grasa: 'cat-5',
      leguminosas: 'cat-6',
      leguminosa: 'cat-6',
      lacteos: 'cat-7',
      lacteo: 'cat-7',
      otros: 'cat-8',
      otro: 'cat-8',
    };

    return slugMap[cleaned] || null;
  }

  /**
   * Infers nutritional category by semantic keywords/roots when not present in the catalog.
   */
  public static inferCategoryByKeywords(text: string): string {
    const cleaned = this.cleanText(text);

    // 1. Lácteos (cat-7)
    if (
      /(yogur|yogut|yoghurt|queso|leche|lacteo|kefir|cottage|panela|oaxaca|ricotta|requeson|mozzarella|parmesano|crema\s+acida|mantequilla)/.test(
        cleaned
      )
    ) {
      return 'cat-7';
    }

    // 2. Verduras (cat-3)
    if (
      /(verdura|vegetal|ensalada|saltead|espinaca|brocoli|calabac|champin|hongo|seta|nopal|lechuga|pepino|apio|pimient|ejote|coliflor|esparrago|jitomate|tomate|cebolla|zanahoria|chile|betabel|alcachofa|col\b|repollo|arugula|rucula|kale|acelga|puerro|rabano)/.test(
        cleaned
      )
    ) {
      return 'cat-3';
    }

    // 3. Frutas (cat-4)
    if (
      /(fruta|platano|banana|manzana|fresa|fruto|mora|berry|berries|frambuesa|arandano|papaya|melon|pina|pinya|naranja|mango|toronja|mandarina|kiwi|uva|sandia|durazno|pera|guayaba|ciruela|higo|zarzamora)/.test(
        cleaned
      )
    ) {
      return 'cat-4';
    }

    // 4. Proteínas (cat-1)
    if (
      /(pollo|pechuga|pavo|res\b|carne|ternera|cerdo|pescado|salmon|atun|tilapia|basa|camaron|huevo|clara|lomo|arrachera|bistec|bife|costilla|marisco|pulpo|sardina|tofu|seitan|tempeh|proteina|whey)/.test(
        cleaned
      )
    ) {
      return 'cat-1';
    }

    // 5. Cereales (cat-2)
    if (
      /(arroz|avena|cereal|pan\b|tortilla|tostada|pasta|espagueti|spaghetti|macarron|quinoa|quinua|papa\b|papas|camote|batata|elote|maiz|harina|galleta|trigo|centeno|couscous|cuscus)/.test(
        cleaned
      )
    ) {
      return 'cat-2';
    }

    // 6. Grasas (cat-5)
    if (
      /(aceite|aguacate|palta|nuez|nueces|almendra|cacahuate|mani|mantequilla\s+de\s+mani|crema\s+de\s+cacahuate|chia|semilla|ajonjoli|oliva|olivo|aceituna|coco|mayonesa|ghee|spray)/.test(
        cleaned
      )
    ) {
      return 'cat-5';
    }

    // 7. Leguminosas (cat-6)
    if (/(frijol|lenteja|garbanzo|haba|soya|soja|edamame|alubia|judia)/.test(cleaned)) {
      return 'cat-6';
    }

    // 8. Otros (cat-8)
    return 'cat-8';
  }

  /**
   * Main normalizer with multi-tier matching and contextual category preservation.
   */
  public static normalize(rawName: string, explicitCategory?: string | null): NormalizedResult {
    const cleaned = this.cleanText(rawName);

    if (!cleaned) {
      return {
        ingredient: null,
        normalized_name: rawName,
        category_id: this.resolveCategoryId(explicitCategory) || 'cat-8',
        warning: 'Nombre de ingrediente vacío.',
      };
    }

    // 1. Exact alias match
    const aliasMatch = INGREDIENT_ALIASES.find(
      (a) => this.cleanText(a.alias) === cleaned
    );

    if (aliasMatch) {
      const ing = INGREDIENTS.find((i) => i.id === aliasMatch.ingredient_id);
      if (ing) {
        return {
          ingredient: ing,
          normalized_name: ing.name,
          category_id: ing.category_id,
          warning: null,
        };
      }
    }

    // 2. Exact ingredient name match
    const directIngMatch = INGREDIENTS.find(
      (i) => this.cleanText(i.name) === cleaned
    );

    if (directIngMatch) {
      return {
        ingredient: directIngMatch,
        normalized_name: directIngMatch.name,
        category_id: directIngMatch.category_id,
        warning: null,
      };
    }

    // 3. Check for Disjunctive / Alternative options (e.g. "Miel de abeja o Mermelada natural", "Pollo o Atún")
    if (/\s+(?:o|o bien|\/)\s+/i.test(rawName)) {
      const parts = rawName.split(/\s+(?:o|o bien|\/)\s+/i);
      if (parts.length > 1) {
        const primaryPart = parts[0].trim();
        const secondaryPart = parts.slice(1).join(', ').trim();
        
        // Normalize primary option
        const primaryResult = this.normalize(primaryPart, explicitCategory);
        if (primaryResult.ingredient || primaryResult.category_id !== 'cat-8') {
          return {
            ...primaryResult,
            alternative_option: secondaryPart,
          };
        }
      }
    }

    // 4. Partial alias match (sorted by alias length descending to match most specific alias first)
    const sortedAliases = [...INGREDIENT_ALIASES].sort(
      (a, b) => b.alias.length - a.alias.length
    );

    const partialAlias = sortedAliases.find((a) => {
      const cAlias = this.cleanText(a.alias);
      if (cAlias.length < 3) return false;
      return cleaned.includes(cAlias) || (cleaned.length > 4 && cAlias.includes(cleaned));
    });

    if (partialAlias) {
      const ing = INGREDIENTS.find((i) => i.id === partialAlias.ingredient_id);
      if (ing) {
        return {
          ingredient: ing,
          normalized_name: ing.name,
          category_id: ing.category_id,
          warning: null,
        };
      }
    }

    // 5. Partial ingredient name match
    const sortedIngredients = [...INGREDIENTS].sort(
      (a, b) => b.name.length - a.name.length
    );
    const partialIng = sortedIngredients.find((i) => {
      const cName = this.cleanText(i.name);
      if (cName.length < 3) return false;
      return cleaned.includes(cName) || (cleaned.length > 4 && cName.includes(cleaned));
    });

    if (partialIng) {
      return {
        ingredient: partialIng,
        normalized_name: partialIng.name,
        category_id: partialIng.category_id,
        warning: null,
      };
    }

    // 6. Fallback: Format name and infer category semantically or use explicit category from AI
    const explicitCatId = this.resolveCategoryId(explicitCategory);
    const semanticCatId = explicitCatId || this.inferCategoryByKeywords(rawName);

    // Clean leading bullets for display
    const cleanDisplay = rawName.replace(/^[•\-\*\d\.\s]+/g, '').trim();
    const formattedName = cleanDisplay.length > 0
      ? cleanDisplay.charAt(0).toUpperCase() + cleanDisplay.slice(1)
      : rawName;

    return {
      ingredient: null,
      normalized_name: formattedName,
      category_id: semanticCatId,
      warning: semanticCatId === 'cat-8'
        ? `El ingrediente "${formattedName}" no se encontró en el catálogo predeterminado y se asignó a "Otros".`
        : null,
    };
  }
}
