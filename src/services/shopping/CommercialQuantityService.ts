import { UnitConversionService } from './UnitConversionService';

export class CommercialQuantityService {
  public static calculateCommercialQuantity(
    quantityWithWaste: number | null,
    unit: string,
    roundingStep?: number,
    commercialUnit?: string,
    ingredientId?: string | null,
    ingredientName?: string
  ): { purchase_quantity: string; purchase_unit: string } {
    if (quantityWithWaste === null || isNaN(quantityWithWaste)) {
      return { purchase_quantity: 'Al gusto', purchase_unit: 'al gusto' };
    }

    const normUnit = UnitConversionService.normalizeUnitName(unit);
    const ingId = ingredientId || '';
    const ingNameLower = (ingredientName || '').toLowerCase();

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. Proteína en polvo (ing-34 o mención de proteína)
    // ─────────────────────────────────────────────────────────────────────────────
    if (ingId === 'ing-34' || /(proteina|proteína|whey)/i.test(ingNameLower)) {
      let tomas = 1;
      let totalGrams = 30;

      if (normUnit === 'scoop' || normUnit === 'porción' || normUnit === 'toma') {
        tomas = Math.max(1, Math.round(quantityWithWaste));
        totalGrams = tomas * 30;
      } else if (normUnit === 'g') {
        totalGrams = Math.round(quantityWithWaste);
        tomas = Math.max(1, Math.round(totalGrams / 30));
      } else if (normUnit === 'kg') {
        totalGrams = Math.round(quantityWithWaste * 1000);
        tomas = Math.max(1, Math.round(totalGrams / 30));
      }

      // Un bote comercial estándar tiene ~900g a 1kg (~30 tomas)
      // const botes = Math.max(1, Math.ceil(totalGrams / 900));
      return {
        purchase_quantity: `1 bote (${tomas} tomas plan • rinde ~30 tomas)`,
        purchase_unit: 'bote',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. Pan de caja / Pan integral (ing-10 o unit rebanada)
    // ─────────────────────────────────────────────────────────────────────────────
    if (ingId === 'ing-10' || normUnit === 'rebanada' || /pan\s+(integral|blanco|cero|tostado)/i.test(ingNameLower)) {
      const slices = Math.ceil(quantityWithWaste);
      // Un paquete de pan de caja promedio tiene 20-24 rebanadas
      const slicesPerPack = roundingStep && roundingStep > 1 ? roundingStep : 20;
      const paquetes = Math.max(1, Math.ceil(slices / slicesPerPack));
      return {
        purchase_quantity: `${paquetes} paquete${paquetes > 1 ? 's' : ''} (${slices} rebanadas)`,
        purchase_unit: 'paquete',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. Tostadas horneadas / integrales (ing-9)
    // ─────────────────────────────────────────────────────────────────────────────
    if (ingId === 'ing-9' || /tostada/i.test(ingNameLower)) {
      const pieces = Math.ceil(quantityWithWaste);
      const piecesPerPack = roundingStep && roundingStep > 1 ? roundingStep : 20;
      const paquetes = Math.max(1, Math.ceil(pieces / piecesPerPack));
      return {
        purchase_quantity: `${paquetes} paquete${paquetes > 1 ? 's' : ''} (${pieces} piezas)`,
        purchase_unit: 'paquete',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. Tortillas de nopal / Galletas de arroz (ing-38, ing-39)
    // ─────────────────────────────────────────────────────────────────────────────
    if (ingId === 'ing-38' || ingId === 'ing-39') {
      const pieces = Math.ceil(quantityWithWaste);
      const step = roundingStep && roundingStep > 1 ? roundingStep : 20;
      const paquetes = Math.max(1, Math.ceil(pieces / step));
      return {
        purchase_quantity: `${paquetes} paquete${paquetes > 1 ? 's' : ''} (${pieces} piezas)`,
        purchase_unit: 'paquete',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. Pasta integral / seca (ing-37)
    // ─────────────────────────────────────────────────────────────────────────────
    if (ingId === 'ing-37' || /pasta/i.test(ingNameLower)) {
      const grams = normUnit === 'kg' ? quantityWithWaste * 1000 : quantityWithWaste;
      if (grams <= 250) {
        return { purchase_quantity: `1 paquete (200g - 250g)`, purchase_unit: 'paquete' };
      }
      if (grams <= 500) {
        return { purchase_quantity: `1 paquete (500g)`, purchase_unit: 'paquete' };
      }
      const paquetes = Math.ceil(grams / 500);
      return { purchase_quantity: `${paquetes} paquetes (500g c/u)`, purchase_unit: 'paquete' };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 6. Atún en agua (ing-2)
    // ─────────────────────────────────────────────────────────────────────────────
    if (ingId === 'ing-2' || normUnit === 'lata' || /atun|atún/i.test(ingNameLower)) {
      let latas = 1;
      if (normUnit === 'lata') {
        latas = Math.max(1, Math.ceil(quantityWithWaste));
      } else if (normUnit === 'g') {
        // 1 lata ≈ 120g masa drenada
        latas = Math.max(1, Math.ceil(quantityWithWaste / 120));
      } else if (normUnit === 'kg') {
        latas = Math.max(1, Math.ceil((quantityWithWaste * 1000) / 120));
      }
      return {
        purchase_quantity: `${latas} lata${latas > 1 ? 's' : ''}`,
        purchase_unit: 'latas',
      };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 7. Frascos de condimentos / untables (Crema de cacahuate, Miel, Mermelada, Mostaza)
    // ─────────────────────────────────────────────────────────────────────────────
    if (
      commercialUnit === 'frasco' ||
      commercialUnit === 'bote' ||
      commercialUnit === 'botella' ||
      /crema de cacahuate|miel|mermelada|mostaza|mayonesa/i.test(ingNameLower)
    ) {
      const cUnit = commercialUnit || 'frasco';
      const grams = normUnit === 'kg' || normUnit === 'L' ? quantityWithWaste * 1000 : quantityWithWaste;
      if (grams <= 350) {
        return {
          purchase_quantity: `1 ${cUnit}`,
          purchase_unit: cUnit,
        };
      }
      const count = Math.ceil(grams / 350);
      return {
        purchase_quantity: `${count} ${cUnit}s`,
        purchase_unit: cUnit,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 8. Gramos -> Kilogramos (Carnes, Avena, Arroz, Frutas, Verduras)
    // ─────────────────────────────────────────────────────────────────────────────
    if (normUnit === 'g') {
      const kgValue = quantityWithWaste / 1000;
      if (kgValue < 0.5) {
        // Round to nearest 50g
        const roundedG = Math.ceil(quantityWithWaste / 50) * 50;
        return { purchase_quantity: `${roundedG} g`, purchase_unit: 'g' };
      }
      // Round to nearest 0.5 kg (0.5, 1.0, 1.5, 2.0 kg...)
      const roundedKg = Math.ceil(kgValue * 2) / 2;
      return { purchase_quantity: `${roundedKg} kg`, purchase_unit: 'kg' };
    }

    if (normUnit === 'kg') {
      const roundedKg = Math.ceil(quantityWithWaste * 2) / 2;
      return { purchase_quantity: `${roundedKg} kg`, purchase_unit: 'kg' };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 9. Mililitros -> Litros (Leche, Claras líquidas, Aceites)
    // ─────────────────────────────────────────────────────────────────────────────
    if (normUnit === 'ml') {
      const liters = quantityWithWaste / 1000;
      if (liters < 0.5) {
        const roundedMl = Math.ceil(quantityWithWaste / 50) * 50;
        return { purchase_quantity: `${roundedMl} ml`, purchase_unit: 'ml' };
      }
      const roundedL = Math.ceil(liters * 2) / 2;
      return { purchase_quantity: `${roundedL} L`, purchase_unit: 'L' };
    }

    if (normUnit === 'L') {
      const roundedL = Math.ceil(quantityWithWaste * 2) / 2;
      return { purchase_quantity: `${roundedL} L`, purchase_unit: 'L' };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 10. Piezas / Huevos / Frutas enteras
    // ─────────────────────────────────────────────────────────────────────────────
    if (normUnit === 'pieza' || normUnit === 'piezas' || normUnit === 'unidad') {
      if (roundingStep && roundingStep > 1) {
        const roundedPieces = Math.ceil(quantityWithWaste / roundingStep) * roundingStep;
        return { purchase_quantity: `${roundedPieces} pieza${roundedPieces > 1 ? 's' : ''}`, purchase_unit: roundedPieces > 1 ? 'piezas' : 'pieza' };
      }
      const roundedPieces = Math.ceil(quantityWithWaste);
      return { purchase_quantity: `${roundedPieces} pieza${roundedPieces > 1 ? 's' : ''}`, purchase_unit: roundedPieces > 1 ? 'piezas' : 'pieza' };
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 11. Fallback estándar para unidades discretas
    // ─────────────────────────────────────────────────────────────────────────────
    const roundedInt = Math.ceil(quantityWithWaste);
    const targetUnit = commercialUnit || normUnit;
    return {
      purchase_quantity: `${roundedInt} ${targetUnit}`,
      purchase_unit: targetUnit,
    };
  }
}

