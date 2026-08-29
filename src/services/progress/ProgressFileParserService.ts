import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import type { ClinicalRecord } from '../../types/patientProgress';
import { ProgressCalculationService } from './ProgressCalculationService';

export interface ParseResult {
  patientName: string;
  records: ClinicalRecord[];
}

/**
 * Helper to safely extract a float/number from raw string, supporting comma decimals (e.g. 72,6 or 72.6)
 */
function parseNumber(raw?: string | null): number | null {
  if (!raw) return null;
  const clean = raw.trim().replace(',', '.');
  const match = clean.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return Number.isFinite(num) ? num : null;
}

export class ProgressFileParserService {
  /**
   * Main entry point to parse a File (.docx, .xlsx, .xls, .csv)
   */
  public static async parseFile(file: File): Promise<ParseResult> {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const buffer = await file.arrayBuffer();

    let patientName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .toUpperCase();

    if (extension === 'docx') {
      return this.parseDocx(buffer, patientName);
    } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return this.parseExcel(buffer, patientName);
    } else {
      throw new Error('Formato no compatible. Por favor sube un archivo .docx, .xlsx, .xls o .csv');
    }
  }

  /**
   * Parses text from Word .docx file
   */
  private static async parseDocx(buffer: ArrayBuffer, fallbackName: string): Promise<ParseResult> {
    const mammothResult = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = mammothResult.value || '';

    // Split lines and expand tab-separated or pipe-separated cells
    const rawLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const expandedLines: string[] = [];
    for (const line of rawLines) {
      if (line.includes('\t') || line.includes('|')) {
        const parts = line.split(/[\t|]/).map((p) => p.trim()).filter((p) => p.length > 0);
        expandedLines.push(...parts);
      } else {
        expandedLines.push(line);
      }
    }

    // Merge consecutive label/value pairs if line i is a label with no digits and line i+1 is a pure value
    const lines: string[] = [];
    const labelPattern = /^(?:peso|edad|estatura|talla|altura|cintura|cadera|pecho|t[oó]rax|brazo|muslo|pantorrilla|tr[ií]c(?:ep|eps|ipital)?|b[ií]c(?:ep|eps|ipital)?|sub[-_\s]?(?:escapul|espul)[a-z]*|escapul[a-z]*|cresta|suprail[eéí]ac[ao]s?|fat|grasa|m[uú]sculo|muscle|masa\s+muscular|imc|ibm|bmi)(?:\s*\([^)]*\))?\s*[:=-]?$/i;
    const valuePattern = /^[-+]?\d+(?:[.,]\d+)?\s*(?:kg|kilos|cm|m|mm|%|%g|%m)?$/i;

    for (let i = 0; i < expandedLines.length; i++) {
      const curr = expandedLines[i];
      const next = expandedLines[i + 1];

      if (next && labelPattern.test(curr) && !/\d/.test(curr) && valuePattern.test(next)) {
        lines.push(`${curr}: ${next}`);
        i++; // skip next line since it was merged
      } else {
        lines.push(curr);
      }
    }

    const records: ClinicalRecord[] = [];
    let currentRecord: Partial<ClinicalRecord> = {};
    let tempMusculoPct: number | null = null;
    let detectedName = fallbackName;

    const pushCurrent = () => {
      // If we had a muscle percentage saved, calculate muscle kg from current peso
      if (tempMusculoPct !== null) {
        if (currentRecord.Peso && Number(currentRecord.Peso) > 0) {
          currentRecord.Musculo_Kg = Number((Number(currentRecord.Peso) * (tempMusculoPct / 100)).toFixed(1));
        } else {
          currentRecord.Musculo_Kg = tempMusculoPct;
        }
        tempMusculoPct = null;
      }

      // Check if current record has meaningful clinical data
      const hasData =
        currentRecord.Peso ||
        currentRecord.Cintura ||
        currentRecord.Cadera ||
        currentRecord.Talla ||
        currentRecord.Pecho ||
        currentRecord.Brazo ||
        currentRecord.Grasa_Bascula ||
        currentRecord.Grasa_Formula ||
        (currentRecord.Pliegues && (currentRecord.Pliegues.tricep !== null || currentRecord.Pliegues.cresta !== null));

      if (hasData || currentRecord.Fecha) {
        records.push(ProgressCalculationService.normalizeRecord(currentRecord));
      }

      currentRecord = {
        Fecha: '',
        Edad: '',
        Peso: '',
        Talla: '',
        Cintura: '',
        Cadera: '',
        Pecho: '',
        Brazo: '',
        Muslo: '',
        Pantorrilla: '',
        Suma_Pliegues: '',
        Grasa_Bascula: '',
        Grasa_Formula: '',
        Grasa_Fuente: 'formula',
        Grasa_Porcentaje: null,
        Musculo_Kg: '',
        IMC: '',
        ICC: '',
        Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
        Suma_Manual: false,
        mostrarDetallePliegues: false,
        mostrarDetalleCircunferencias: false,
      };
    };

    pushCurrent();

    // Look for patient name line
    const isPatientLine = (l: string) => /(?:nombre(?:\s+del?\s+paciente)?|paciente|cliente|client)\s*[:=-]/i.test(l);
    const lineaNombre = lines.find(isPatientLine);
    if (lineaNombre) {
      const matchNombre = lineaNombre.match(
        /(?:nombre(?:\s+del?\s+paciente)?|paciente|cliente|client)\s*[:=-]\s*([A-Za-zÀ-ÿñÑ][A-Za-zÀ-ÿñÑ\s.'-]*?)(?:\s{2,}|\s+(?:Fecha|Edad|Sexo|Talla|Estatura|Peso|Cintura)\b|$)/i
      );
      if (matchNombre && matchNombre[1]) {
        detectedName = matchNombre[1].trim().toUpperCase();
      }
    }

    lines.forEach((linea) => {
      // 1. Date match
      const matchFecha =
        linea.match(
          /(?:Fecha(?:\s+de\s+(?:elaboraci[oó]n|consulta|evaluaci[oó]n|cita|registro))?|Seguimiento|Consulta|Cita|Visita)\s*(?:\d+)?\s*[:=-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.](?:\d{4}|\d{2})|\d{1,2}\s+de\s+[a-zÀ-ÿñÑ]+(?:\s+(?:de|del)\s+\d{4})?|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/i
        ) ||
        linea.match(/^(\d{1,2}\s+de\s+[a-zÀ-ÿñÑ]+(?:\s+(?:de|del)\s+\d{4})?)$/i) ||
        linea.match(/^(\d{1,2}[\/\-.]\d{1,2}[\/\-.](?:\d{4}|\d{2}))$/i);

      if (matchFecha && linea.length < 60) {
        if (currentRecord.Peso || currentRecord.Cintura || currentRecord.Fecha) {
          pushCurrent();
        }
        currentRecord.Fecha = matchFecha[1].trim();
      }

      // 2. Age (excluding metabolic age)
      if (!/metab[oó]lic/i.test(linea)) {
        const matchEdad = linea.match(/(?:^|\b)(?:edad(?:\s*cronol[oó]gica)?|age)(?:\s*\([^)]*\))?\s*[:=-]?\s*(\d+)/i);
        if (matchEdad) {
          const e = parseInt(matchEdad[1], 10);
          if (e > 0 && e < 120) currentRecord.Edad = e;
        }
      }

      // 3. Weight
      if (!/meta|objetivo|deseado|ideal/i.test(linea)) {
        const matchPeso = linea.match(
          /(?:^|\b)(?:peso(?:\s*actual|\s*corporal)?|weight)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
        );
        if (matchPeso) {
          const p = parseNumber(matchPeso[1]);
          if (p !== null && p > 0) {
            // If current record already has a distinct weight and no date line came in between, start a new visit
            if (currentRecord.Peso && currentRecord.Peso !== p) {
              pushCurrent();
            }
            currentRecord.Peso = p;
          }
        }
      }

      // 4. Height / Estatura
      const matchTalla = linea.match(
        /(?:^|\b)(?:talla|estatura|altura|height)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchTalla) {
        const t = parseNumber(matchTalla[1]);
        if (t !== null && t > 0) {
          currentRecord.Talla = t < 3 ? Number((t * 100).toFixed(1)) : t;
        }
      }

      // 5. Circumferences
      // Cintura
      const matchCintura = linea.match(/(?:^|\b)(?:cintura|waist)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchCintura) {
        const v = parseNumber(matchCintura[1]);
        if (v !== null) currentRecord.Cintura = v;
      }

      // Cadera / Glúteo / Pompa
      const matchCadera = linea.match(
        /(?:^|\b)(?:cadera|gl[uú]teos?|pompas?|hip)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchCadera) {
        const v = parseNumber(matchCadera[1]);
        if (v !== null) currentRecord.Cadera = v;
      }

      // Pecho / Tórax
      const matchPecho = linea.match(
        /(?:^|\b)(?:pecho|t[oó]rax|chest)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchPecho) {
        const v = parseNumber(matchPecho[1]);
        if (v !== null) currentRecord.Pecho = v;
      }

      // Brazo circumference (Brazo, Brazo contraído, Bíceps contraído, etc.)
      const matchBrazo =
        linea.match(
          /(?:^|\b)(?:brazo|b[ií]ceps?)\s*(?:contra[ií]do|relajado|flexionado)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
        ) ||
        linea.match(
          /(?:^|\b)(?:brazo|per[ií]metro\s+braquial|circunferencia\s+(?:de\s+)?brazo)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
        );
      if (matchBrazo) {
        const v = parseNumber(matchBrazo[1]);
        if (v !== null) currentRecord.Brazo = v;
      }

      // Muslo / Pierna
      const matchMuslo = linea.match(
        /(?:^|\b)(?:muslo(?:\s+medio)?|pierna|thigh)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchMuslo) {
        const v = parseNumber(matchMuslo[1]);
        if (v !== null) currentRecord.Muslo = v;
      }

      // Pantorrilla / Gemelo
      const matchPantorrilla = linea.match(
        /(?:^|\b)(?:pantorrilla|gemelo|calf)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchPantorrilla) {
        const v = parseNumber(matchPantorrilla[1]);
        if (v !== null) currentRecord.Pantorrilla = v;
      }

      // 6. Skinfolds (Pliegues)
      if (!currentRecord.Pliegues) {
        currentRecord.Pliegues = { tricep: null, bicep: null, subescapular: null, cresta: null };
      }

      // Tríceps skinfold
      const matchTri = linea.match(
        /(?:^|\b)(?:pliegue\s+)?(?:tr[ií]c(?:ep|eps|ipital)?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchTri) {
        const v = parseNumber(matchTri[1]);
        if (v !== null) currentRecord.Pliegues.tricep = v;
      }

      // Bíceps skinfold (only if not arm circumference/contraido)
      if (!/(?:contra[ií]do|relajado|flexionado|circunferencia|per[ií]metro|\(cm\))/i.test(linea)) {
        const matchBi = linea.match(
          /(?:^|\b)(?:pliegue\s+)?(?:b[ií]c(?:ep|eps|ipital)?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
        );
        if (matchBi) {
          const v = parseNumber(matchBi[1]);
          if (v !== null) currentRecord.Pliegues.bicep = v;
        }
      }

      // Subescapular / Escapular skinfold
      const matchSub = linea.match(
        /(?:^|\b)(?:pliegue\s+)?(?:sub[-_\s]?(?:escapul|espul)[a-z]*|escapul[a-z]*)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchSub) {
        const v = parseNumber(matchSub[1]);
        if (v !== null) currentRecord.Pliegues.subescapular = v;
      }

      // Cresta ilíaca / ileca / iliaca / suprailíaco skinfold
      const matchCresta = linea.match(
        /(?:^|\b)(?:pliegue\s+)?(?:cresta(?:\s+[a-zÀ-ÿñÑ]+)*|supra[-_\s]?il[a-zÀ-ÿñÑ]*|il[eéí]a?c[ao]s?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchCresta) {
        const v = parseNumber(matchCresta[1]);
        if (v !== null) currentRecord.Pliegues.cresta = v;
      }

      // Suma de pliegues (manual / parsed)
      const matchSuma = linea.match(
        /(?:^|\b)(?:suma(?:toria)?(?:\s+de)?(?:\s+\d+)?\s+pliegues?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchSuma) {
        const v = parseNumber(matchSuma[1]);
        if (v !== null) {
          currentRecord.Suma_Pliegues = v;
          currentRecord.Suma_Manual = true;
        }
      }

      // 7. Body Fat % (Báscula / Bioimpedancia / % Grasa / Fat)
      const matchGrasa =
        linea.match(
          /(?:^|\b)(?:fat|%?\s*grasa(?:\s*corporal|\s*b[aá]scula)?|porcentaje\s*(?:de\s*)?grasa|%\s*fat)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
        ) ||
        linea.match(/(?:^|\s)([\d]+(?:[.,]\d+)?)\s*%\s*(?:de\s*)?(?:grasa|fat)/i) ||
        linea.match(/(?:^|\s)([\d]+(?:[.,]\d+)?)\s*%g\b/i);

      if (matchGrasa) {
        const v = parseNumber(matchGrasa[1] || matchGrasa[2]);
        if (v !== null && v > 0) {
          currentRecord.Grasa_Bascula = v;
          currentRecord.Grasa_Fuente = 'bascula';
          currentRecord.Grasa_Porcentaje = v;
        }
      }

      // 8. Muscle mass (% or kg)
      const matchMusculo =
        linea.match(
          /(?:^|\b)(?:m[uú]sculo|muscle|masa\s+muscular|%?\s*m[uú]sculo)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)(?:\s*(%|kg|kilos))?/i
        ) ||
        linea.match(/(?:^|\s)([\d]+(?:[.,]\d+)?)\s*%\s*(?:de\s*)?m[uú]sculo/i) ||
        linea.match(/(?:^|\s)([\d]+(?:[.,]\d+)?)\s*%m\b/i);

      if (matchMusculo) {
        const val = parseNumber(matchMusculo[1]);
        const unit = (matchMusculo[2] || '').toLowerCase();
        const isPercent = unit === '%' || linea.includes('%') || (val !== null && val <= 50 && unit !== 'kg' && unit !== 'kilos');

        if (val !== null) {
          if (isPercent) {
            tempMusculoPct = val;
            if (currentRecord.Peso && Number(currentRecord.Peso) > 0) {
              currentRecord.Musculo_Kg = Number((Number(currentRecord.Peso) * (val / 100)).toFixed(1));
            }
          } else {
            currentRecord.Musculo_Kg = val;
          }
        }
      }

      // 9. BMI / IMC / IBM
      const matchIMC = linea.match(
        /(?:^|\b)(?:imc|ibm|bmi|[ií]ndice\s+de\s+masa\s+corporal)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
      );
      if (matchIMC) {
        const v = parseNumber(matchIMC[1]);
        if (v !== null) currentRecord.IMC = v;
      }
    });

    pushCurrent();

    const validRecords = records.filter((r) => r.Peso || r.Fecha || r.Cintura || r.Cadera || r.Talla);

    // Provide default fallback dates if not found in doc
    validRecords.forEach((rec, idx) => {
      if (!rec.Fecha) {
        if (validRecords.length === 1) {
          rec.Fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
        } else {
          rec.Fecha = `Consulta ${idx + 1}`;
        }
      }
    });

    return {
      patientName: detectedName,
      records: validRecords,
    };
  }

  /**
   * Parses structured rows from Excel sheet (.xlsx, .xls, .csv)
   */
  private static parseExcel(buffer: ArrayBuffer, fallbackName: string): ParseResult {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<any>(firstSheet);

    const getVal = (row: any, keys: string[]): any => {
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== '') return row[k];
        const normCand = k
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');
        const found = rowKeys.find((rk) => {
          const normRk = rk
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
          return normRk === normCand || normRk.startsWith(normCand);
        });
        if (found && row[found] !== undefined && row[found] !== '') {
          return row[found];
        }
      }
      return null;
    };

    const records: ClinicalRecord[] = rawRows.map((row: any) => {
      const pliegues = {
        tricep: getVal(row, ['Tricep', 'Triceps', 'Tricep_mm', 'Triceps_mm', 'tricep', 'pliegue_tricep']),
        bicep: getVal(row, ['Bicep', 'Biceps', 'Bicep_mm', 'Biceps_mm', 'bicep', 'pliegue_bicep']),
        subescapular: getVal(row, [
          'Subescapular',
          'Subescapular_mm',
          'Subespular',
          'Escapular',
          'subescapular',
          'pliegue_subescapular',
        ]),
        cresta: getVal(row, [
          'Cresta',
          'Cresta_Iliaca',
          'Cresta_Iliaca_mm',
          'Cresta_ileca',
          'Suprailiaco',
          'cresta',
          'pliegue_cresta',
        ]),
      };

      const reg: Partial<ClinicalRecord> = {
        Fecha: getVal(row, ['Fecha', 'Date', 'fecha', 'Consulta', 'Cita']) || '',
        Edad: getVal(row, ['Edad', 'Age', 'edad']) || '',
        Peso: getVal(row, ['Peso', 'Weight', 'peso', 'Peso_kg']) || '',
        Talla: getVal(row, ['Talla', 'Talla_cm', 'Height', 'Estatura', 'Altura', 'talla']) || '',
        Cintura: getVal(row, ['Cintura', 'Waist', 'cintura', 'Cintura_cm']) || '',
        Cadera: getVal(row, ['Cadera', 'Hip', 'cadera', 'Gluteo', 'Cadera_cm']) || '',
        Pecho: getVal(row, ['Pecho', 'Pecho_cm', 'Torax', 'torax', 'Chest']) || '',
        Brazo: getVal(row, ['Brazo', 'Brazo_cm', 'Bicep_contraido', 'Brazo_contraido', 'brazo']) || '',
        Muslo: getVal(row, ['Muslo', 'Muslo_cm', 'Pierna', 'muslo', 'Thigh']) || '',
        Pantorrilla: getVal(row, ['Pantorrilla', 'Pantorrilla_cm', 'Gemelo', 'pantorrilla', 'Calf']) || '',
        Pliegues: pliegues,
        Suma_Pliegues: getVal(row, ['Suma_Pliegues', 'Suma_Pliegues_mm', 'suma_pliegues']) || '',
        Grasa_Bascula: getVal(row, ['Grasa_Bascula', 'Grasa_Bascula_pct', 'grasa_bascula', 'Fat', 'Grasa']) || '',
        Grasa_Formula: getVal(row, ['Grasa_Formula', 'Grasa_Formula_pct', 'grasa_formula']) || '',
        Grasa_Fuente: String(getVal(row, ['Fuente_Grasa_Mostrada', 'Grasa_Fuente']) || '')
          .toLowerCase()
          .includes('bascula')
          ? 'bascula'
          : 'formula',
        Grasa_Porcentaje: getVal(row, ['Grasa_Mostrada_pct', 'Grasa_Porcentaje', 'Fat_pct', 'Porcentaje_Grasa']) || null,
        Musculo_Kg: getVal(row, ['Musculo_Kg', 'Musculo', 'musculo_kg', 'Músculo', 'Muscle']) || '',
        IMC: getVal(row, ['IMC', 'imc', 'BMI', 'bmi', 'IBM', 'ibm']) || '',
        ICC: getVal(row, ['ICC', 'icc']) || '',
      };

      return ProgressCalculationService.normalizeRecord(reg);
    });

    return {
      patientName: fallbackName,
      records,
    };
  }

  /**
   * Exports clinical progress to clean Excel .xlsx file
   */
  public static exportToExcel(records: ClinicalRecord[], patientName: string): void {
    const exportData = records.map((r) => ({
      Fecha: r.Fecha,
      Edad: r.Edad,
      Peso_kg: r.Peso,
      Talla_cm: r.Talla,
      IMC: r.IMC,
      Cintura_cm: r.Cintura,
      Cadera_cm: r.Cadera,
      Pecho_cm: r.Pecho ?? '',
      Brazo_cm: r.Brazo ?? '',
      Muslo_cm: r.Muslo ?? '',
      Pantorrilla_cm: r.Pantorrilla ?? '',
      ICC: r.ICC,
      Tricep_mm: r.Pliegues?.tricep ?? '',
      Bicep_mm: r.Pliegues?.bicep ?? '',
      Subescapular_mm: r.Pliegues?.subescapular ?? '',
      Cresta_Iliaca_mm: r.Pliegues?.cresta ?? '',
      Suma_Pliegues_mm: r.Suma_Pliegues,
      Grasa_Bascula_pct: r.Grasa_Bascula ?? '',
      Grasa_Formula_pct: r.Grasa_Formula ?? '',
      Grasa_Mostrada_pct: r.Grasa_Porcentaje ?? '',
      Fuente_Grasa_Mostrada: r.Grasa_Fuente === 'bascula' ? 'Báscula' : 'Fórmula',
      Musculo_Kg: r.Musculo_Kg ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Progreso_Clinico');

    const cleanName = (patientName || 'Paciente').replace(/\s+/g, '_');
    XLSX.writeFile(wb, `${cleanName}_Progreso_Clinico.xlsx`);
  }
}

