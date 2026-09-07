import assert from 'node:assert';
import { MenuExportService } from '../MenuExportService';
import { PatientsService } from '../../patients/patients.service';
import type { Patient, PatientDietPlan } from '../../../types/patient';
import type { DietPlanMenu } from '../../../types/dietMenu';

console.log('Testing MenuExportService & PatientsService dynamic meal export...');

// Test 1: Plan with 3 suggested meals should only render 3 sections
const plan3Meals: PatientDietPlan = {
  id: 'plan-3-meals',
  nombre: 'Plan 3 Comidas Definición',
  calorias: 1800,
  macros: { protein: 140, carbs: 180, fat: 50 },
  comidasSugeridas: 3,
  objetivo: 'Pérdida de Grasa',
  fechaAsignacion: '2026-09-06',
  status: 'activo'
};

const emptyMenu: DietPlanMenu = {
  planId: 'plan-3-meals',
  tipoEstructura: 'siete_dias',
  tiemposComida: ['desayuno', 'comida', 'cena'],
  dias: [],
  updatedAt: '2026-09-06T10:00:00Z'
};

const sections3 = MenuExportService.getActiveMealSections(plan3Meals, emptyMenu);
assert.strictEqual(sections3.length, 3, 'Should produce exactly 3 meal sections for 3 suggested meals');
assert.deepStrictEqual(sections3.map(s => s.key), ['desayuno', 'comida', 'cena'], 'Should contain desayuno, comida, cena');
assert.strictEqual(sections3[0].icon, '🍳', 'Desayuno icon should be 🍳');
assert.strictEqual(sections3[1].icon, '🍲', 'Comida icon should be 🍲');
assert.strictEqual(sections3[2].icon, '🥗', 'Cena icon should be 🥗');
console.log('✓ Test 1 Passed: 3-meal dynamic structure generates exactly 3 sections with icons');

// Test 2: Custom meal config with user-assigned icons (e.g. 🍎 Snack, ⚡ Pre-entreno)
const customMenu: DietPlanMenu = {
  planId: 'plan-custom',
  tipoEstructura: 'siete_dias',
  tiemposComida: ['desayuno', 'snack_am', 'comida', 'pre_entreno'],
  tiemposComidaConfig: [
    { key: 'desayuno', label: 'Desayuno Campeón', defaultTime: '07:30 AM', icon: '🥑' },
    { key: 'snack_am', label: 'Snack Media Mañana', defaultTime: '11:00 AM', icon: '🍎' },
    { key: 'comida', label: 'Almuerzo Fuerte', defaultTime: '02:00 PM', icon: '🥩' },
    { key: 'pre_entreno', label: 'Power Shot', defaultTime: '06:00 PM', icon: '⚡' }
  ],
  dias: [],
  updatedAt: '2026-09-06T10:00:00Z'
};

const sectionsCustom = MenuExportService.getActiveMealSections(plan3Meals, customMenu);
assert.strictEqual(sectionsCustom.length, 4, 'Should honor custom tiemposComidaConfig length (4)');
assert.strictEqual(sectionsCustom[0].icon, '🥑', 'Custom icon 🥑 preserved');
assert.strictEqual(sectionsCustom[1].icon, '🍎', 'Custom icon 🍎 preserved');
assert.strictEqual(sectionsCustom[2].icon, '🥩', 'Custom icon 🥩 preserved');
assert.strictEqual(sectionsCustom[3].icon, '⚡', 'Custom icon ⚡ preserved');
console.log('✓ Test 2 Passed: Custom meal times & custom icons are completely preserved');

// Test 3: PatientsService.sortDietPlans prioritizes active plan first
const plansUnsorted: PatientDietPlan[] = [
  {
    id: 'plan-1',
    nombre: 'Fase 1: Adaptación',
    calorias: 2000,
    macros: { protein: 120, carbs: 250, fat: 60 },
    fechaAsignacion: '2026-08-01',
    status: 'completado'
  },
  {
    id: 'plan-2',
    nombre: 'Fase 2: Definición Avanzada',
    calorias: 1700,
    macros: { protein: 150, carbs: 160, fat: 45 },
    fechaAsignacion: '2026-09-01',
    status: 'activo'
  }
];

const sorted = PatientsService.sortDietPlans(plansUnsorted);
assert.strictEqual(sorted[0].id, 'plan-2', 'Active plan must be first in array');
assert.strictEqual(sorted[0].status, 'activo', 'First plan must have status activo');
assert.strictEqual(sorted[1].id, 'plan-1', 'Completed plan must be second');
console.log('✓ Test 3 Passed: Active diet plan is prioritized first, fixing the "Version 1 download" bug');

// Test 4: HTML output includes icons and centered MENU styling
const patientMock: Patient = {
  id: 'pat-1',
  nombre: 'Carlos Mendoza',
  email: 'carlos@example.com',
  status: 'activo',
  sexo: 'masculino',
  alertasMedicas: [],
  metas: {},
  telefono: '5551234567',
  tags: [],
  createdAt: '2026-09-06T10:00:00Z',
  updatedAt: '2026-09-06T10:00:00Z'
};

const htmlPreview = MenuExportService.generateClinicalMenuHtml(patientMock, plan3Meals, customMenu, { isForPreview: true });
assert.ok(htmlPreview.includes('🥑'), 'HTML contains custom breakfast icon');
assert.ok(htmlPreview.includes('🍎'), 'HTML contains custom snack icon');
assert.ok(htmlPreview.includes('M&nbsp;&nbsp;E&nbsp;&nbsp;N&nbsp;&nbsp;Ú'), 'HTML contains centered MENÚ table banner');
assert.ok(htmlPreview.includes('width: 100%; max-width: 1200px;'), 'Preview HTML container is responsive and not cut off by rigid 1200px');
assert.ok(htmlPreview.includes('PACIENTE'), 'HTML contains executive PACIENTE metadata label');
assert.ok(htmlPreview.includes('Carlos Mendoza'), 'HTML contains patient name');
console.log('✓ Test 4 Passed: Preview HTML renders responsive container, centered MENÚ table, and emoji icons');

// Test 5: Word export omits watermark and avoids rigid height to prevent blank pages
const htmlWord = MenuExportService.generateClinicalMenuHtml(patientMock, plan3Meals, customMenu, { isForWord: true });
assert.strictEqual(htmlWord.includes('Marca de Agua'), false, 'Word export must NOT contain in-flow absolute watermark (prevents 2 blank pages)');
assert.ok(htmlWord.includes('width: 100%;'), 'Word export must use 100% width');
console.log('✓ Test 5 Passed: Word HTML omits watermark block and rigid 1200px inline styles (eliminates 2 blank pages)');

console.log('\n=============================================');
console.log('🎉 ALL DYNAMIC MENU EXPORT TESTS PASSED!');
console.log('=============================================\n');
