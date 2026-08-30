import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import type { ClinicalRecord } from '../../types/patientProgress';
import { ProgressCalculationService } from './ProgressCalculationService';

export interface ParseResult {
  patientName: string;
  records: ClinicalRecord[];
  sex?: 'H' | 'M';
  age?: number;
  ocupacion?: string;
  dislikedFoods?: string[];
  allergies?: string[];
  waterIntake?: string;
  notes?: string;
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

    // Helper: strip underscores used as fill-in blanks
    const cleanUnderscores = (str: string) => str.replace(/^_+|_+$/g, '').trim();

    // 1. Extract Document-level metadata from Header
    let initialDocDate = '';
    const matchHeaderFecha = text.match(
      /(?:Fecha|Date)\s*[:=-]\s*_{0,10}([0-9]{1,2}\s+de\s+[a-zÀ-ÿñÑ]+(?:\s+(?:de|del)\s+\d{4})?|[0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i
    );
    if (matchHeaderFecha && matchHeaderFecha[1]) {
      initialDocDate = cleanUnderscores(matchHeaderFecha[1]).replace(/\bdel\b/i, 'de');
    }

    let detectedName = fallbackName;
    const matchHeaderNombre = text.match(
      /(?:Nombre(?:\s+completo|\s+del?\s+paciente)?|Paciente|Cliente)\s*[:=-]\s*_{0,10}([A-Za-zÀ-ÿñÑ][A-Za-zÀ-ÿñÑ\s.'-]{2,50}?)(?:_{0,10}|\s{2,}|\t|\r|\n|\b(?:Edad|Sexo|Fecha|Talla|Ocupaci[oó]n|Tel)\b|$)/i
    );
    if (matchHeaderNombre && matchHeaderNombre[1]) {
      const n = cleanUnderscores(matchHeaderNombre[1]);
      if (n.length > 2 && !/^(?:del?|de\s+la|los?|las?|un|una)$/i.test(n)) {
        detectedName = n.toUpperCase();
      }
    }

    let detectedAge: number | undefined = undefined;
    const matchHeaderAge = text.match(/(?:^|\b)(?:Edad|Age)\s*[:=-]\s*_{0,10}(\d{1,3})(?:_{0,10}|\s|años|years|$)/i);
    if (matchHeaderAge && matchHeaderAge[1]) {
      const a = parseInt(matchHeaderAge[1], 10);
      if (a > 0 && a < 120) detectedAge = a;
    }

    let detectedSex: 'H' | 'M' | undefined = undefined;
    const matchHeaderSex = text.match(/(?:^|\b)(?:Sexo|G[eé]nero)\s*[:=-]\s*_{0,10}(hombre|mujer|masculino|femenino|h|m)\b/i);
    if (matchHeaderSex && matchHeaderSex[1]) {
      const s = matchHeaderSex[1].toLowerCase();
      detectedSex = (s.startsWith('h') || s.startsWith('m') && s.includes('asc')) ? 'H' : 'M';
    }

    let detectedOccupation: string | undefined = undefined;
    const matchHeaderOcupacion = text.match(/(?:Ocupaci[oó]n|Profesi[oó]n)\s*[:=-]\s*_{0,10}([A-Za-zÀ-ÿñÑ\s]{2,40}?)(?:_{0,10}|\s{2,}|\t|\r|\n|$)/i);
    if (matchHeaderOcupacion && matchHeaderOcupacion[1]) {
      detectedOccupation = cleanUnderscores(matchHeaderOcupacion[1]);
    }

    let dislikedFoods: string[] = [];
    const matchDisliked = text.match(/Alimentos\s+que\s+no\s+le\s+agradan[^\n:]*:\s*_{0,10}([^\n\r_]+)/i);
    if (matchDisliked && matchDisliked[1]) {
      dislikedFoods = matchDisliked[1]
        .split(/[,;\n]/)
        .map(f => cleanUnderscores(f))
        .filter(f => f.length > 1);
    }

    // 2. Preprocess lines
    const rawLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const expandedLines: string[] = [];
    for (const line of rawLines) {
      // Ignore lines that are only underscores / blanks
      if (/^_{3,}[.:]?_{0,}$/.test(line)) continue;

      if (line.includes('\t') || line.includes('|')) {
        const parts = line.split(/[\t|]/).map((p) => p.trim()).filter((p) => p.length > 0 && !/^_{3,}$/.test(p));
        expandedLines.push(...parts);
      } else {
        expandedLines.push(line);
      }
    }

    // Merge consecutive label/value pairs if line i is a label and line i+1 is a pure numeric value
    const lines: string[] = [];
    const labelPattern = /^(?:peso|edad|estatura|talla|altura|cintura|cadera|pecho|t[oó]rax|brazo|b[ií]ceps?\s*contra[ií]do|muslo|pantorrilla|tr[ií]c(?:ep|eps|ipital)?|b[ií]c(?:ep|eps|ipital)?|sub[-_\s]?(?:escapul|espul)[a-z]*|escapul[a-z]*|cresta(?:\s*il[eéí]a?c[ao]s?)?|supra[-_\s]?il[a-zÀ-ÿñÑ]*|fat|grasa|m[uú]sculo|muscle|masa\s+muscular|imc|ibm|bmi|edad\s*metab[oó]lica)(?:\s*\([^)]*\))?\s*[:=-]?$/i;
    const valuePattern = /^[-+]?\d+(?:[.,]\d+)?\s*(?:kg|kilos|cm|m|mm|%|%g|%m)?$/i;

    for (let i = 0; i < expandedLines.length; i++) {
      const curr = expandedLines[i];
      const next = expandedLines[i + 1];

      if (next && labelPattern.test(curr) && !/\d/.test(curr) && valuePattern.test(next)) {
        lines.push(`${curr}: ${next}`);
        i++;
      } else {
        lines.push(curr);
      }
    }

    const records: ClinicalRecord[] = [];
    let currentRecord: Partial<ClinicalRecord> = {};
    let tempMusculoPct: number | null = null;
    let currentRecordHasAnyMeasurement = false;

    const pushCurrent = () => {
      // Calculate muscle kg from percentage if available
      if (tempMusculoPct !== null) {
        if (currentRecord.Peso && Number(currentRecord.Peso) > 0) {
          currentRecord.Musculo_Kg = Number((Number(currentRecord.Peso) * (tempMusculoPct / 100)).toFixed(1));
        } else {
          currentRecord.Musculo_Kg = tempMusculoPct;
        }
        tempMusculoPct = null;
      }

      // Check if current record has actual numeric body data
      const hasNumericData =
        (currentRecord.Peso !== undefined && currentRecord.Peso !== '' && Number(currentRecord.Peso) > 0) ||
        (currentRecord.Cintura !== undefined && currentRecord.Cintura !== '' && Number(currentRecord.Cintura) > 0) ||
        (currentRecord.Cadera !== undefined && currentRecord.Cadera !== '' && Number(currentRecord.Cadera) > 0) ||
        (currentRecord.Pecho !== undefined && currentRecord.Pecho !== '' && Number(currentRecord.Pecho) > 0) ||
        (currentRecord.Grasa_Bascula !== undefined && currentRecord.Grasa_Bascula !== '' && Number(currentRecord.Grasa_Bascula) > 0) ||
        (currentRecord.Grasa_Formula !== undefined && currentRecord.Grasa_Formula !== '' && Number(currentRecord.Grasa_Formula) > 0) ||
        (currentRecord.Pliegues && (
          (currentRecord.Pliegues.tricep !== null && currentRecord.Pliegues.tricep > 0) ||
          (currentRecord.Pliegues.bicep !== null && currentRecord.Pliegues.bicep > 0) ||
          (currentRecord.Pliegues.subescapular !== null && currentRecord.Pliegues.subescapular > 0) ||
          (currentRecord.Pliegues.cresta !== null && currentRecord.Pliegues.cresta > 0)
        ));

      if (hasNumericData) {
        // If age is missing in this record, use detected age from doc header
        if (!currentRecord.Edad && detectedAge) {
          currentRecord.Edad = detectedAge;
        }
        records.push(ProgressCalculationService.normalizeRecord(currentRecord));
      }

      currentRecordHasAnyMeasurement = false;
      currentRecord = {
        Fecha: '',
        Edad: detectedAge || '',
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

    lines.forEach((rawLinea) => {
      const linea = cleanUnderscores(rawLinea);
      if (!linea) return;

      // 1. Date Detection (e.g. "8 de agosto de 2026", "29 de agosto del 2026", "Fecha: ...")
      const matchFecha =
        linea.match(
          /(?:Fecha(?:\s+de\s+(?:elaboraci[oó]n|consulta|evaluaci[oó]n|cita|registro))?|Seguimiento|Consulta|Cita|Visita)\s*(?:\d+)?\s*[:=-]?\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.](?:\d{4}|\d{2})|\d{1,2}\s+de\s+[a-zÀ-ÿñÑ]+(?:\s+(?:de|del)\s+\d{4})?|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/i
        ) ||
        linea.match(/^(\d{1,2}\s+de\s+[a-zÀ-ÿñÑ]+(?:\s+(?:de|del)\s+\d{4})?)$/i) ||
        linea.match(/^(\d{1,2}[\/\-.]\d{1,2}[\/\-.](?:\d{4}|\d{2}))$/i);

      if (matchFecha && linea.length < 50 && !/nacimiento|inicio/i.test(linea)) {
        const foundDate = cleanUnderscores(matchFecha[1]).replace(/\bdel\b/i, 'de');
        // If current record already had measurements or a date, push it
        if (currentRecordHasAnyMeasurement || currentRecord.Fecha) {
          pushCurrent();
        }
        currentRecord.Fecha = foundDate;
        return;
      }

      // 2. Weight (PESO, PESO (KG), Peso: 72.6 kg)
      if (!/meta|objetivo|deseado|ideal|bajar\s+de\s+peso/i.test(linea)) {
        const matchPeso = linea.match(
          /(?:^|\b)(?:peso(?:\s*\(kg\))?|weight)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i
        );
        if (matchPeso) {
          const p = parseNumber(matchPeso[1]);
          if (p !== null && p > 0) {
            // If current record already has a distinct weight and was not pushed yet, start next
            if (currentRecord.Peso && currentRecord.Peso !== p) {
              pushCurrent();
            }
            currentRecord.Peso = p;
            currentRecordHasAnyMeasurement = true;
          }
        }
      }

      // 3. Chronological Age (excluding metabolic age)
      if (!/metab[oó]lic/i.test(linea)) {
        const matchEdad = linea.match(/(?:^|\b)(?:edad(?:\s*cronol[oó]gica)?|age)(?:\s*\([^)]*\))?\s*[:=-]?\s*(\d{1,3})/i);
        if (matchEdad) {
          const e = parseInt(matchEdad[1], 10);
          if (e > 0 && e < 120) currentRecord.Edad = e;
        }
      }

      // 4. Height / Estatura / Talla (e.g. "Estatura: 1.81m", "Talla: 181 cm", "1.81")
      const matchTalla = linea.match(
        /(?:^|\b)(?:talla|estatura|altura|height)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)\s*(?:m|cm|mts)?/i
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
        if (v !== null && v > 0) {
          currentRecord.Cintura = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Cadera
      const matchCadera = linea.match(/(?:^|\b)(?:cadera|gl[uú]teos?|hip)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchCadera) {
        const v = parseNumber(matchCadera[1]);
        if (v !== null && v > 0) {
          currentRecord.Cadera = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Pecho / Tórax
      const matchPecho = linea.match(/(?:^|\b)(?:pecho|t[oó]rax|chest)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchPecho) {
        const v = parseNumber(matchPecho[1]);
        if (v !== null && v > 0) {
          currentRecord.Pecho = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Brazo (Bicep contraído / Brazo flexionado / Brazo)
      const matchBrazo =
        linea.match(/(?:^|\b)(?:b[ií]ceps?\s*contra[ií]do|brazo(?:\s*contra[ií]do|\s*relajado)?|per[ií]metro\s*braquial)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i) ||
        linea.match(/(?:^|\b)(?:brazo)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchBrazo) {
        const v = parseNumber(matchBrazo[1]);
        if (v !== null && v > 0) {
          currentRecord.Brazo = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Muslo
      const matchMuslo = linea.match(/(?:^|\b)(?:muslo(?:\s*medio)?|pierna|thigh)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchMuslo) {
        const v = parseNumber(matchMuslo[1]);
        if (v !== null && v > 0) {
          currentRecord.Muslo = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Pantorrilla
      const matchPantorrilla = linea.match(/(?:^|\b)(?:pantorrilla|gemelo|calf)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchPantorrilla) {
        const v = parseNumber(matchPantorrilla[1]);
        if (v !== null && v > 0) {
          currentRecord.Pantorrilla = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // 6. Skinfolds (Pliegues cutáneos)
      if (!currentRecord.Pliegues) {
        currentRecord.Pliegues = { tricep: null, bicep: null, subescapular: null, cresta: null };
      }

      // Tríceps skinfold
      const matchTri = linea.match(/(?:^|\b)(?:pliegue\s+)?(?:tr[ií]c(?:ep|eps|ipital)?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchTri) {
        const v = parseNumber(matchTri[1]);
        if (v !== null && v > 0) {
          currentRecord.Pliegues.tricep = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Bíceps skinfold (only if not arm circumference/contraido)
      if (!/(?:contra[ií]do|relajado|flexionado|circunferencia|per[ií]metro|\(cm\))/i.test(linea)) {
        const matchBi = linea.match(/(?:^|\b)(?:pliegue\s+)?(?:b[ií]c(?:ep|eps|ipital)?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
        if (matchBi) {
          const v = parseNumber(matchBi[1]);
          if (v !== null && v > 0) {
            currentRecord.Pliegues.bicep = v;
            currentRecordHasAnyMeasurement = true;
          }
        }
      }

      // Subescapular / Escapular skinfold
      const matchSub = linea.match(/(?:^|\b)(?:pliegue\s+)?(?:sub[-_\s]?(?:escapul|espul)[a-z]*|escapular?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchSub) {
        const v = parseNumber(matchSub[1]);
        if (v !== null && v > 0) {
          currentRecord.Pliegues.subescapular = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Cresta ilíaca / ileca / ileaca / suprailíaco skinfold
      const matchCresta = linea.match(/(?:^|\b)(?:pliegue\s+)?(?:cresta(?:\s*il[eéí]a?c[ao]s?)?|supra[-_\s]?il[eéí]a?c[ao]s?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchCresta) {
        const v = parseNumber(matchCresta[1]);
        if (v !== null && v > 0) {
          currentRecord.Pliegues.cresta = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // Suma pliegues manual
      const matchSuma = linea.match(/(?:^|\b)(?:suma(?:toria)?(?:\s+de)?(?:\s+\d+)?\s+pliegues?)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchSuma) {
        const v = parseNumber(matchSuma[1]);
        if (v !== null && v > 0) {
          currentRecord.Suma_Pliegues = v;
          currentRecord.Suma_Manual = true;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // 7. Body Fat % (Fat: 20.1%, Fat (BASCULA): 29.9%, % Grasa: 20.1%)
      const matchGrasa =
        linea.match(/(?:^|\b)(?:fat(?:\s*\(b[aá]scula\))?|grasa(?:\s*\(b[aá]scula\))?|%?\s*grasa(?:\s*corporal)?|%\s*fat)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)\s*%?/i) ||
        linea.match(/(?:^|\s)([\d]+(?:[.,]\d+)?)\s*%\s*(?:de\s*)?(?:grasa|fat)/i);
      if (matchGrasa) {
        const v = parseNumber(matchGrasa[1] || matchGrasa[2]);
        if (v !== null && v > 0) {
          currentRecord.Grasa_Bascula = v;
          currentRecord.Grasa_Fuente = 'bascula';
          currentRecord.Grasa_Porcentaje = v;
          currentRecordHasAnyMeasurement = true;
        }
      }

      // 8. Muscle mass (% or kg, e.g. "Musculo: 32.8%", "Musculo (BASCULA): 30.2%")
      const matchMusculo =
        linea.match(/(?:^|\b)(?:m[uú]sculo(?:\s*\(b[aá]scula\))?|muscle|masa\s*muscular)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)\s*(%|kg)?/i) ||
        linea.match(/(?:^|\s)([\d]+(?:[.,]\d+)?)\s*%\s*(?:de\s*)?m[uú]sculo/i);
      if (matchMusculo) {
        const val = parseNumber(matchMusculo[1]);
        const unit = (matchMusculo[2] || '').toLowerCase();
        const isPercent = unit === '%' || linea.includes('%') || (val !== null && val <= 50 && unit !== 'kg');

        if (val !== null && val > 0) {
          if (isPercent) {
            tempMusculoPct = val;
            if (currentRecord.Peso && Number(currentRecord.Peso) > 0) {
              currentRecord.Musculo_Kg = Number((Number(currentRecord.Peso) * (val / 100)).toFixed(1));
            }
          } else {
            currentRecord.Musculo_Kg = val;
          }
          currentRecordHasAnyMeasurement = true;
        }
      }

      // 9. BMI / IMC / IBM (e.g. "Ibm: 22.2", "IMC: 22.2")
      const matchIMC = linea.match(/(?:^|\b)(?:imc|ibm|bmi|[ií]ndice\s+de\s+masa\s+corporal)(?:\s*\([^)]*\))?\s*[:=-]?\s*([\d]+(?:[.,]\d+)?)/i);
      if (matchIMC) {
        const v = parseNumber(matchIMC[1]);
        if (v !== null && v > 0) {
          currentRecord.IMC = v;
        }
      }
    });

    pushCurrent();

    // Filter valid records that have actual measurements
    const validRecords = records.filter(
      (r) =>
        (r.Peso !== undefined && r.Peso !== '' && Number(r.Peso) > 0) ||
        (r.Cintura !== undefined && r.Cintura !== '' && Number(r.Cintura) > 0) ||
        (r.Cadera !== undefined && r.Cadera !== '' && Number(r.Cadera) > 0) ||
        (r.Grasa_Bascula !== undefined && r.Grasa_Bascula !== '' && Number(r.Grasa_Bascula) > 0) ||
        (r.Grasa_Formula !== undefined && r.Grasa_Formula !== '' && Number(r.Grasa_Formula) > 0) ||
        (r.Pliegues && (r.Pliegues.tricep || r.Pliegues.subescapular || r.Pliegues.cresta))
    );

    // If first valid record has no date, assign the initial doc header date
    if (validRecords.length > 0 && !validRecords[0].Fecha && initialDocDate) {
      validRecords[0].Fecha = initialDocDate;
    }

    // Ensure all records have a reasonable date label
    validRecords.forEach((rec, idx) => {
      if (!rec.Fecha) {
        if (validRecords.length === 1 && initialDocDate) {
          rec.Fecha = initialDocDate;
        } else {
          rec.Fecha = `Consulta ${idx + 1}`;
        }
      }
    });

    // Run clinical calculations across all records (Durnin & Womersley, Siri, IMC, ICC, etc.)
    ProgressCalculationService.recalculateFormulas(validRecords, detectedSex || 'H');

    return {
      patientName: detectedName,
      records: validRecords,
      sex: detectedSex,
      age: detectedAge,
      ocupacion: detectedOccupation,
      dislikedFoods
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

