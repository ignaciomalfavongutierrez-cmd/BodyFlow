import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressCalculationService } from '../ProgressCalculationService';
import type { ClinicalRecord } from '../../../types/patientProgress';

describe('ProgressCalculationService - Muscle Mass (Kg) Calculation', () => {
  it('calculates muscle mass (lean mass) correctly from weight and body fat percentage', () => {
    // 70kg at 20% fat: 70 - (70 * 0.20) = 56.0 kg
    const res1 = ProgressCalculationService.calculateMuscleKg(70, 20);
    assert.equal(res1, 56.0);

    // 85.5kg at 15.5% fat: 85.5 - 13.2525 = 72.2475 -> 72.2 kg
    const res2 = ProgressCalculationService.calculateMuscleKg('85.5', '15.5');
    assert.equal(res2, 72.2);

    // 64.0kg at 25% fat: 64 - 16 = 48.0 kg
    const res3 = ProgressCalculationService.calculateMuscleKg(64, 25);
    assert.equal(res3, 48.0);
  });

  it('returns null for invalid inputs (zero weight, negative or > 100% fat)', () => {
    assert.equal(ProgressCalculationService.calculateMuscleKg(0, 20), null);
    assert.equal(ProgressCalculationService.calculateMuscleKg(-50, 20), null);
    assert.equal(ProgressCalculationService.calculateMuscleKg(70, 0), null);
    assert.equal(ProgressCalculationService.calculateMuscleKg(70, 105), null);
    assert.equal(ProgressCalculationService.calculateMuscleKg('', ''), null);
  });

  it('automatically calculates Musculo_Kg in recalculateFormulas if field is empty or missing', () => {
    const record: ClinicalRecord = {
      Fecha: '10 de Marzo 2026',
      Edad: 30,
      Peso: 80,
      Talla: 175,
      Cintura: 85,
      Cadera: 100,
      Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
      Suma_Pliegues: '',
      Grasa_Bascula: 20,
      Grasa_Formula: '',
      Grasa_Fuente: 'bascula',
      Grasa_Porcentaje: 20,
      Musculo_Kg: '', // Missing field
      IMC: '',
      ICC: ''
    };

    ProgressCalculationService.recalculateFormulas([record], 'H');

    // 80kg - (80 * 0.20) = 64.0 kg
    assert.equal(record.Musculo_Kg, 64.0);
    assert.equal(record.IMC, 26.1);
    assert.equal(record.ICC, 0.85);
  });

  it('preserves an existing manual Musculo_Kg in recalculateFormulas', () => {
    const record: ClinicalRecord = {
      Fecha: '10 de Marzo 2026',
      Edad: 30,
      Peso: 80,
      Talla: 175,
      Cintura: 85,
      Cadera: 100,
      Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
      Suma_Pliegues: '',
      Grasa_Bascula: 20,
      Grasa_Formula: '',
      Grasa_Fuente: 'bascula',
      Grasa_Porcentaje: 20,
      Musculo_Kg: 35.5, // Specifically provided custom value
      IMC: '',
      ICC: ''
    };

    ProgressCalculationService.recalculateFormulas([record], 'H');

    // Should remain 35.5 and not be overridden
    assert.equal(record.Musculo_Kg, 35.5);
  });

  it('backfills missing muscle mass across records using backfillMuscleMass()', () => {
    const records: ClinicalRecord[] = [
      {
        Fecha: '01 de Enero 2026',
        Edad: 25,
        Peso: 60,
        Talla: 160,
        Cintura: 70,
        Cadera: 95,
        Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
        Suma_Pliegues: '',
        Grasa_Bascula: 25,
        Grasa_Formula: '',
        Grasa_Fuente: 'bascula',
        Grasa_Porcentaje: 25,
        Musculo_Kg: '', // missing
        IMC: 23.4,
        ICC: 0.74
      },
      {
        Fecha: '01 de Febrero 2026',
        Edad: 25,
        Peso: 58,
        Talla: 160,
        Cintura: 68,
        Cadera: 93,
        Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
        Suma_Pliegues: '',
        Grasa_Bascula: 22,
        Grasa_Formula: '',
        Grasa_Fuente: 'bascula',
        Grasa_Porcentaje: 22,
        Musculo_Kg: 42.0, // already filled
        IMC: 22.7,
        ICC: 0.73
      }
    ];

    const updated = ProgressCalculationService.backfillMuscleMass(records, false);
    assert.equal(updated, true);

    // Record 1: 60 - (60 * 0.25) = 45.0 kg
    assert.equal(records[0].Musculo_Kg, 45.0);
    // Record 2: kept 42.0
    assert.equal(records[1].Musculo_Kg, 42.0);

    // When overwrite is true:
    const overwritten = ProgressCalculationService.backfillMuscleMass(records, true);
    assert.equal(overwritten, true);
    // Record 2 recalculated: 58 - (58 * 0.22) = 58 - 12.76 = 45.24 -> 45.2 kg
    assert.equal(records[1].Musculo_Kg, 45.2);
  });
});

describe('ProgressCalculationService - Chronological Sorting (Oldest on Left, Newest on Right)', () => {
  it('parses clinical dates correctly across formats', () => {
    // ISO format
    const tIso = ProgressCalculationService.parseClinicalDate('2026-01-12');
    assert.ok(tIso > 0);

    // DD/MM/YYYY format
    const tDmy = ProgressCalculationService.parseClinicalDate('15/07/2026');
    assert.ok(tDmy > 0);

    // Spanish textual date
    const tEnero = ProgressCalculationService.parseClinicalDate('12 de Enero 2026');
    const tFebrero = ProgressCalculationService.parseClinicalDate('02 de Febrero 2026');
    const tAgosto = ProgressCalculationService.parseClinicalDate('29 de agosto del 2026');
    assert.ok(tEnero > 0);
    assert.ok(tFebrero > 0);
    assert.ok(tAgosto > 0);
    assert.ok(tEnero < tFebrero);
    assert.ok(tFebrero < tAgosto);

    // Numbered consultations
    const c1 = ProgressCalculationService.parseClinicalDate('Consulta 1');
    const c2 = ProgressCalculationService.parseClinicalDate('Consulta 2');
    assert.ok(c1 < c2);

    // Invalid or empty
    assert.equal(ProgressCalculationService.parseClinicalDate(''), 0);
    assert.equal(ProgressCalculationService.parseClinicalDate(null), 0);
    assert.equal(ProgressCalculationService.parseClinicalDate(undefined), 0);
  });

  it('sorts inverted records chronologically (oldest consultation at index 0, latest at the end)', () => {
    // Inverted array: newest consultation first (as often parsed from Word/Excel documents)
    const invertedRecords = [
      { Fecha: '29 de agosto del 2026', Peso: 65.0, Grasa_Porcentaje: 20.0 },
      { Fecha: '08 de agosto de 2026', Peso: 66.5, Grasa_Porcentaje: 21.0 },
      { Fecha: '15/07/2026', Peso: 68.0, Grasa_Porcentaje: 22.5 },
      { Fecha: '12 de Enero 2026', Peso: 72.4, Grasa_Porcentaje: 27.2 },
    ];

    const sorted = ProgressCalculationService.sortByDateChronological(invertedRecords);

    // Oldest visit (12 de Enero) must be first (index 0, left on charts)
    assert.equal(sorted[0].Fecha, '12 de Enero 2026');
    assert.equal(sorted[0].Peso, 72.4);

    // Subsequent visits in chronological order
    assert.equal(sorted[1].Fecha, '15/07/2026');
    assert.equal(sorted[2].Fecha, '08 de agosto de 2026');

    // Most recent visit (29 de agosto) must be last (index 3, right on charts)
    assert.equal(sorted[3].Fecha, '29 de agosto del 2026');
    assert.equal(sorted[3].Peso, 65.0);
  });

  it('sorts numbered consultations chronologically (Consulta 1 first)', () => {
    const invertedConsultations = [
      { Fecha: 'Consulta 4', Peso: 62 },
      { Fecha: 'Consulta 3', Peso: 64 },
      { Fecha: 'Consulta 2', Peso: 67 },
      { Fecha: 'Consulta 1', Peso: 70 },
    ];

    const sorted = ProgressCalculationService.sortByDateChronological(invertedConsultations);
    assert.equal(sorted[0].Fecha, 'Consulta 1');
    assert.equal(sorted[1].Fecha, 'Consulta 2');
    assert.equal(sorted[2].Fecha, 'Consulta 3');
    assert.equal(sorted[3].Fecha, 'Consulta 4');
  });

  it('buildSummary computes initial vs. latest deltas correctly with chronologically sorted records', () => {
    // Patient who lost weight: started at 72.4kg, latest is 65.0kg
    const records = ProgressCalculationService.sortByDateChronological([
      {
        id: 'rec-latest',
        Fecha: '29 de agosto 2026',
        Peso: 65.0,
        Grasa_Porcentaje: 20.0,
        Musculo_Kg: 26.0,
        IMC: 23.8,
        ICC: 0.74,
      } as ClinicalRecord,
      {
        id: 'rec-initial',
        Fecha: '12 de Enero 2026',
        Peso: 72.4,
        Grasa_Porcentaje: 27.2,
        Musculo_Kg: 24.2,
        IMC: 26.6,
        ICC: 0.79,
      } as ClinicalRecord,
    ]);

    // Index 0 must be initial, index 1 must be latest
    assert.equal(records[0].id, 'rec-initial');
    assert.equal(records[1].id, 'rec-latest');

    const summaries = ProgressCalculationService.buildSummary(records);
    const pesoSummary = summaries.find(s => s.label === 'Peso Total');
    assert.ok(pesoSummary);
    assert.equal(pesoSummary.inicio, '72.4');
    assert.equal(pesoSummary.actual, '65.0');
    // Delta should be negative (lost 7.4 kg)
    assert.equal(pesoSummary.delta, -7.4);

    const grasaSummary = summaries.find(s => s.label === '% Grasa Corporal');
    assert.ok(grasaSummary);
    assert.equal(grasaSummary.inicio, '27.2');
    assert.equal(grasaSummary.actual, '20.0');
    assert.equal(grasaSummary.delta, -7.2);
    assert.equal(grasaSummary.favorable, true); // Dropping fat is favorable
  });
});

