export class WasteCalculatorService {
  public static readonly WASTE_NOTE =
    'Las cantidades sugeridas incluyen un 10 % adicional de merma para compensar desperdicio, limpieza y preparación de los alimentos.';

  public static applyWaste(quantity: number | null, wastePercentage: number = 10): number | null {
    if (quantity === null || isNaN(quantity)) {
      return null;
    }
    const factor = 1 + wastePercentage / 100;
    return Math.round(quantity * factor * 100) / 100;
  }
}
