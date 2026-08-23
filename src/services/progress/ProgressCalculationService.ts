import type {
  ClinicalRecord,
  BiologicalSex,
  MetricSummary,
  PatientAchievement,
  Skinfolds
} from '../../types/patientProgress';
import { SKIN_FOLD_CATALOG } from '../../types/patientProgress';

export class ProgressCalculationService {
  /**
   * Normalizes a clinical record to ensure all default structures and fields exist
   */
  public static normalizeRecord(reg: Partial<ClinicalRecord>): ClinicalRecord {
    const pliegues: Skinfolds = {
      tricep: null,
      bicep: null,
      subescapular: null,
      cresta: null,
      ...(reg.Pliegues || {})
    };

    return {
      id: reg.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      Fecha: reg.Fecha || '',
      Edad: reg.Edad !== undefined && reg.Edad !== null ? reg.Edad : '',
      Peso: reg.Peso !== undefined && reg.Peso !== null ? reg.Peso : '',
      Talla: reg.Talla !== undefined && reg.Talla !== null ? reg.Talla : '',
      Cintura: reg.Cintura !== undefined && reg.Cintura !== null ? reg.Cintura : '',
      Cadera: reg.Cadera !== undefined && reg.Cadera !== null ? reg.Cadera : '',
      Pecho: reg.Pecho !== undefined && reg.Pecho !== null ? reg.Pecho : '',
      Brazo: reg.Brazo !== undefined && reg.Brazo !== null ? reg.Brazo : '',
      Muslo: reg.Muslo !== undefined && reg.Muslo !== null ? reg.Muslo : '',
      Pantorrilla: reg.Pantorrilla !== undefined && reg.Pantorrilla !== null ? reg.Pantorrilla : '',
      Pliegues: pliegues,
      Suma_Pliegues: reg.Suma_Pliegues !== undefined && reg.Suma_Pliegues !== null ? reg.Suma_Pliegues : '',
      Suma_Manual: Boolean(reg.Suma_Manual),
      Grasa_Bascula: reg.Grasa_Bascula !== undefined && reg.Grasa_Bascula !== null ? reg.Grasa_Bascula : '',
      Grasa_Formula: reg.Grasa_Formula !== undefined && reg.Grasa_Formula !== null ? reg.Grasa_Formula : '',
      Grasa_Fuente: reg.Grasa_Fuente || 'formula',
      Grasa_Porcentaje: reg.Grasa_Porcentaje !== undefined && reg.Grasa_Porcentaje !== null ? reg.Grasa_Porcentaje : null,
      Musculo_Kg: reg.Musculo_Kg !== undefined && reg.Musculo_Kg !== null ? reg.Musculo_Kg : '',
      IMC: reg.IMC !== undefined && reg.IMC !== null ? reg.IMC : '',
      ICC: reg.ICC !== undefined && reg.ICC !== null ? reg.ICC : '',
      mostrarDetallePliegues: Boolean(reg.mostrarDetallePliegues),
      mostrarDetalleCircunferencias: Boolean(reg.mostrarDetalleCircunferencias)
    };
  }

  /**
   * Updates Grasa_Porcentaje based on the selected Grasa_Fuente ('formula' | 'bascula')
   */
  public static updateDisplayedFat(reg: ClinicalRecord): void {
    if (reg.Grasa_Fuente === 'bascula' && reg.Grasa_Bascula !== '' && reg.Grasa_Bascula !== null && !isNaN(Number(reg.Grasa_Bascula))) {
      reg.Grasa_Porcentaje = Number(Number(reg.Grasa_Bascula).toFixed(1));
    } else if (reg.Grasa_Formula !== '' && reg.Grasa_Formula !== null && !isNaN(Number(reg.Grasa_Formula))) {
      reg.Grasa_Porcentaje = Number(Number(reg.Grasa_Formula).toFixed(1));
    } else {
      reg.Grasa_Porcentaje = null;
    }
  }

  /**
   * Recalculates sum of skinfolds, Durnin-Womersley density, Siri % Fat, IMC, ICC
   */
  public static recalculateFormulas(records: ClinicalRecord[], sex: BiologicalSex): void {
    records.forEach((reg) => {
      this.normalizeRecord(reg);

      const edad = parseFloat(String(reg.Edad));
      
      // Calculate Sum of Skinfolds
      const sumaCalculada = SKIN_FOLD_CATALOG.reduce((total, pl) => {
        const v = parseFloat(String(reg.Pliegues[pl.key]));
        return total + (Number.isFinite(v) ? v : 0);
      }, 0);

      if (!reg.Suma_Manual) {
        reg.Suma_Pliegues = sumaCalculada > 0 ? Number(sumaCalculada.toFixed(1)) : '';
      }

      const sumaP = parseFloat(String(reg.Suma_Pliegues));

      // Durnin & Womersley Body Density calculation
      if (sumaP > 0 && edad > 0) {
        let D = 0;
        const L = Math.log10(sumaP);

        if (sex === 'H') {
          if (edad < 30) D = 1.1631 - 0.0632 * L;
          else if (edad < 40) D = 1.1422 - 0.0544 * L;
          else if (edad < 50) D = 1.1620 - 0.0700 * L;
          else D = 1.1715 - 0.0779 * L;
        } else {
          if (edad < 30) D = 1.1599 - 0.0717 * L;
          else if (edad < 40) D = 1.1423 - 0.0632 * L;
          else if (edad < 50) D = 1.1333 - 0.0612 * L;
          else D = 1.1339 - 0.0645 * L;
        }

        // Siri equation: % Fat = (4.95 / D - 4.5) * 100
        const porcentajeGrasa = (4.95 / D - 4.5) * 100;
        if (Number.isFinite(porcentajeGrasa) && porcentajeGrasa > 0) {
          reg.Grasa_Formula = Number(porcentajeGrasa.toFixed(1));
        } else {
          reg.Grasa_Formula = '';
        }
      } else {
        reg.Grasa_Formula = '';
      }

      this.updateDisplayedFat(reg);

      // IMC = Peso(kg) / Talla(m)^2
      const talla = parseFloat(String(reg.Talla));
      const peso = parseFloat(String(reg.Peso));
      if (talla > 0 && peso > 0) {
        const tallaM = talla < 3 ? talla : talla / 100;
        reg.IMC = Number((peso / (tallaM * tallaM)).toFixed(1));
      } else {
        reg.IMC = '';
      }

      // ICC = Cintura(cm) / Cadera(cm)
      const cint = parseFloat(String(reg.Cintura));
      const cad = parseFloat(String(reg.Cadera));
      if (cint > 0 && cad > 0) {
        reg.ICC = Number((cint / cad).toFixed(2));
      } else {
        reg.ICC = '';
      }
    });
  }

  /**
   * Builds summary cards comparison: Initial Visit vs. Latest Visit
   */
  public static buildSummary(records: ClinicalRecord[]): MetricSummary[] {
    if (!records || records.length < 2) return [];
    const primero = records[0];
    const ultimo = records[records.length - 1];

    const createMetric = (
      label: string,
      icon: string,
      key: keyof ClinicalRecord,
      unidad: string,
      mejorSiBaja: boolean | null,
      theme: 'indigo' | 'rose' | 'emerald' | 'sky' | 'fuchsia',
      decimales = 1
    ): MetricSummary | null => {
      const vi = parseFloat(String(primero[key]));
      const vf = parseFloat(String(ultimo[key]));
      if (!Number.isFinite(vi) || !Number.isFinite(vf)) return null;

      const delta = Number((vf - vi).toFixed(decimales));
      return {
        label,
        icon,
        unidad,
        inicio: vi.toFixed(decimales),
        actual: vf.toFixed(decimales),
        delta,
        favorable: mejorSiBaja === null ? null : (mejorSiBaja ? delta < 0 : delta > 0),
        sinCambio: Math.abs(delta) < (decimales === 2 ? 0.01 : 0.05),
        theme,
      };
    };

    const summaries: (MetricSummary | null)[] = [
      createMetric('Peso Total', '⚖️', 'Peso', 'kg', null, 'indigo'),
      createMetric('% Grasa Corporal', '🔥', 'Grasa_Porcentaje', '%', true, 'rose'),
      createMetric('Masa Muscular', '💪', 'Musculo_Kg', 'kg', false, 'emerald'),
      createMetric('IMC', '🩵', 'IMC', 'kg/m²', null, 'sky'),
      createMetric('Índice C-C', '📐', 'ICC', '', true, 'fuchsia', 2),
    ];

    return summaries.filter((s): s is MetricSummary => s !== null);
  }

  /**
   * Generates motivational achievement badges and streak summary
   */
  public static buildAchievements(
    records: ClinicalRecord[],
    metaPeso?: number | string,
    metaGrasa?: number | string
  ): { badges: PatientAchievement[]; streakText: string } {
    if (!records || records.length < 2) {
      return { badges: [], streakText: '' };
    }

    const primero = records[0];
    const ultimo = records[records.length - 1];
    const badges: PatientAchievement[] = [];

    const dPeso = parseFloat(String(ultimo.Peso)) - parseFloat(String(primero.Peso));
    const dGrasa = parseFloat(String(ultimo.Grasa_Porcentaje)) - parseFloat(String(primero.Grasa_Porcentaje));
    const dMusculo = parseFloat(String(ultimo.Musculo_Kg)) - parseFloat(String(primero.Musculo_Kg));
    const dCintura = parseFloat(String(ultimo.Cintura)) - parseFloat(String(primero.Cintura));

    if (Number.isFinite(dPeso) && dPeso <= -1) {
      badges.push({ icon: '⚖️', texto: `Ha reducido ${Math.abs(dPeso).toFixed(1)} kg desde el inicio`, category: 'peso' });
    }
    if (Number.isFinite(dGrasa) && dGrasa <= -1) {
      badges.push({ icon: '🔥', texto: `Reducción de ${Math.abs(dGrasa).toFixed(1)}% en grasa corporal`, category: 'grasa' });
    }
    if (Number.isFinite(dMusculo) && dMusculo >= 0.5) {
      badges.push({ icon: '💪', texto: `Ganancia de +${dMusculo.toFixed(1)} kg de masa muscular`, category: 'musculo' });
    }
    if (Number.isFinite(dCintura) && dCintura <= -2) {
      badges.push({ icon: '📐', texto: `Reducción de ${Math.abs(dCintura).toFixed(1)} cm de cintura`, category: 'cintura' });
    }

    const mP = parseFloat(String(metaPeso));
    if (mP > 0) {
      const faltaPeso = parseFloat(String(ultimo.Peso)) - mP;
      if (faltaPeso > 0) {
        badges.push({ icon: '🎯', texto: `A ${faltaPeso.toFixed(1)} kg de alcanzar la meta de peso`, category: 'meta' });
      } else {
        badges.push({ icon: '🏆', texto: '¡Meta de peso alcanzada con éxito!', category: 'meta' });
      }
    }

    const mG = parseFloat(String(metaGrasa));
    if (mG > 0 && ultimo.Grasa_Porcentaje) {
      const faltaGrasa = parseFloat(String(ultimo.Grasa_Porcentaje)) - mG;
      if (faltaGrasa > 0) {
        badges.push({ icon: '🎯', texto: `A ${faltaGrasa.toFixed(1)}% de la meta de grasa corporal`, category: 'meta' });
      } else {
        badges.push({ icon: '🏆', texto: '¡Meta de grasa corporal lograda!', category: 'meta' });
      }
    }

    const streakText = `${records.length} evaluaciones clínicas registradas en el seguimiento`;

    return { badges, streakText };
  }
}
