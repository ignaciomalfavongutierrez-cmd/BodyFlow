import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import type { ClinicalRecord } from '../../types/patientProgress';
import { ProgressCalculationService } from './ProgressCalculationService';

export interface ParseResult {
  patientName: string;
  records: ClinicalRecord[];
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
    const text = mammothResult.value;

    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const records: ClinicalRecord[] = [];
    let currentRecord: Partial<ClinicalRecord> = {};
    let detectedName = fallbackName;

    const pushCurrent = () => {
      if (Object.keys(currentRecord).length > 2) {
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
    const lineaNombre = lines.find((l) => /Nombre del paciente/i.test(l));
    if (lineaNombre) {
      const matchNombre = lineaNombre.match(
        /Nombre del paciente[^:]*:\s*([A-Za-zÀ-ÿñÑ][A-Za-zÀ-ÿñÑ\s]*?)(?:\s{2,}|\s+(?:Fecha|Edad|Sexo|Talla|Estatura|Peso)\b|$)/i
      );
      if (matchNombre && matchNombre[1]) {
        detectedName = matchNombre[1].trim().toUpperCase();
      }
    }

    lines.forEach((linea) => {
      const L = linea.toLowerCase();

      // Date match
      const matchFecha = linea.match(
        /(?:Fecha de elaboración:|Seguimiento)?\s*(\d{1,2}\s+de\s+[a-z]+(?:\s+del\s+\d{4})?)/i
      );
      if (matchFecha && L.length < 50) {
        if (currentRecord.Peso || currentRecord.Cintura) {
          pushCurrent();
        }
        currentRecord.Fecha = matchFecha[1].trim();
      }

      // Age
      const matchEdad = linea.match(/Edad:\s*(\d+)/i);
      if (matchEdad) currentRecord.Edad = parseInt(matchEdad[1], 10);

      // Weight
      const matchPeso = linea.match(/Peso:\s*([\d.]+)/i);
      if (matchPeso) currentRecord.Peso = parseFloat(matchPeso[1]);

      // Height
      const matchTalla = linea.match(/(?:Talla|Estatura|Altura):\s*([\d.]+)/i);
      if (matchTalla) {
        const t = parseFloat(matchTalla[1]);
        currentRecord.Talla = t < 3 ? Number((t * 100).toFixed(1)) : t;
      }

      // Circumferences
      const matchCintura = linea.match(/(?:Cintura):\s*([\d.]+)/i);
      if (matchCintura) currentRecord.Cintura = parseFloat(matchCintura[1]);

      const matchCadera = linea.match(/(?:Cadera|Gluteo|Glúteo|Pompa):\s*([\d.]+)/i);
      if (matchCadera) currentRecord.Cadera = parseFloat(matchCadera[1]);

      const matchPecho = linea.match(/(?:Pecho|Torax|Tórax):\s*([\d.]+)/i);
      if (matchPecho) currentRecord.Pecho = parseFloat(matchPecho[1]);

      const matchBrazo = linea.match(/(?:Brazo|Bicep|Bíceps):\s*([\d.]+)/i);
      if (matchBrazo) currentRecord.Brazo = parseFloat(matchBrazo[1]);

      const matchMuslo = linea.match(/(?:Muslo|Pierna):\s*([\d.]+)/i);
      if (matchMuslo) currentRecord.Muslo = parseFloat(matchMuslo[1]);

      const matchPantorrilla = linea.match(/(?:Pantorrilla|Gemelo):\s*([\d.]+)/i);
      if (matchPantorrilla) currentRecord.Pantorrilla = parseFloat(matchPantorrilla[1]);

      // Skinfolds
      if (!currentRecord.Pliegues) {
        currentRecord.Pliegues = { tricep: null, bicep: null, subescapular: null, cresta: null };
      }

      const matchTri = linea.match(/Tricep:\s*([\d.]+)/i);
      const matchBi = linea.match(/Bicep:\s*([\d.]+)/i);
      const matchSub = linea.match(/Subespular:\s*([\d.]+)/i) || linea.match(/Subescapular:\s*([\d.]+)/i);
      const matchCresta = linea.match(/Cresta:\s*([\d.]+)/i);

      if (matchTri) currentRecord.Pliegues.tricep = parseFloat(matchTri[1]);
      if (matchBi) currentRecord.Pliegues.bicep = parseFloat(matchBi[1]);
      if (matchSub) currentRecord.Pliegues.subescapular = parseFloat(matchSub[1]);
      if (matchCresta) currentRecord.Pliegues.cresta = parseFloat(matchCresta[1]);

      // Scale fat
      const matchGrasa = linea.match(/([\d.]+)\s*%?\s*(?:de)?\s*grasa|([\d.]+)\s*%g/i);
      if (matchGrasa) {
        currentRecord.Grasa_Bascula = parseFloat(matchGrasa[1] || matchGrasa[2]);
        currentRecord.Grasa_Fuente = 'bascula';
        currentRecord.Grasa_Porcentaje = currentRecord.Grasa_Bascula;
      }

      // Muscle mass
      const matchMusculo = linea.match(/([\d.]+)\s*%m/i);
      if (matchMusculo && currentRecord.Peso) {
        const porcMusculo = parseFloat(matchMusculo[1]);
        currentRecord.Musculo_Kg = Number((Number(currentRecord.Peso) * (porcMusculo / 100)).toFixed(1));
      }
    });

    pushCurrent();

    const validRecords = records.filter((r) => r.Peso || r.Fecha);
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

    const records: ClinicalRecord[] = rawRows.map((row: any) => {
      const pliegues = {
        tricep: row.Tricep || row.Tricep_mm || row.tricep || null,
        bicep: row.Bicep || row.Bicep_mm || row.bicep || null,
        subescapular: row.Subescapular || row.Subescapular_mm || row.subescapular || null,
        cresta: row.Cresta || row.Cresta_Iliaca_mm || row.cresta || null,
      };

      const reg: Partial<ClinicalRecord> = {
        Fecha: row.Fecha || row.Date || row.fecha || '',
        Edad: row.Edad || row.Age || row.edad || '',
        Peso: row.Peso || row.Weight || row.peso || '',
        Talla: row.Talla || row.Talla_cm || row.Height || row.talla || '',
        Cintura: row.Cintura || row.Waist || row.cintura || '',
        Cadera: row.Cadera || row.Hip || row.cadera || row.Gluteo || '',
        Pecho: row.Pecho || row.Pecho_cm || row.Torax || row.torax || '',
        Brazo: row.Brazo || row.Brazo_cm || row.Bicep_circ || row.brazo || '',
        Muslo: row.Muslo || row.Muslo_cm || row.Pierna || row.muslo || '',
        Pantorrilla: row.Pantorrilla || row.Pantorrilla_cm || row.pantorrilla || '',
        Pliegues: pliegues,
        Suma_Pliegues: row.Suma_Pliegues || row.Suma_Pliegues_mm || row.suma_pliegues || '',
        Grasa_Bascula: row.Grasa_Bascula || row.Grasa_Bascula_pct || row.grasa_bascula || '',
        Grasa_Formula: row.Grasa_Formula || row.Grasa_Formula_pct || row.grasa_formula || '',
        Grasa_Fuente: (row.Fuente_Grasa_Mostrada || row.Grasa_Fuente || '').toLowerCase().includes('bascula') ? 'bascula' : 'formula',
        Grasa_Porcentaje: row.Grasa_Mostrada_pct || row.Grasa_Porcentaje || null,
        Musculo_Kg: row.Musculo_Kg || row.Musculo || row.musculo_kg || '',
        IMC: row.IMC || row.imc || '',
        ICC: row.ICC || row.icc || '',
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
