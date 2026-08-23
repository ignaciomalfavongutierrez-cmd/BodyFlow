<template>
  <div class="min-h-full pb-16">
    
    <!-- Top Stepper Header (Hidden on print) -->
    <div class="w-full bg-white dark:bg-[#18181b] border-b border-slate-200 dark:border-white/10 py-4 px-6 shadow-sm no-print mb-8 rounded-2xl transition-colors">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20">
            📊
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">Avances y Progreso Clínico</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Analítica antropométrica y evolución de composición corporal</p>
          </div>
        </div>

        <!-- 3-Step Visual Progress Bar -->
        <div class="hidden md:flex items-center space-x-2">
          <template v-for="(step, index) in steps" :key="step.number">
            <button
              type="button"
              @click="handleStepClick(step.number)"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-semibold focus:outline-none"
              :class="[
                currentStep === step.number
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400'
                  : currentStep > step.number
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50 cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/60'
                  : canNavigateTo(step.number)
                  ? 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 cursor-pointer'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/5 opacity-60 cursor-not-allowed'
              ]"
            >
              <span>{{ step.icon }}</span>
              <span>{{ step.label }}</span>
            </button>
            <span v-if="index < steps.length - 1" class="text-slate-300 dark:text-white/20 font-bold text-sm">→</span>
          </template>
        </div>

        <!-- Mobile Step Indicator -->
        <div class="md:hidden flex items-center space-x-1">
          <span class="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-300 dark:border-indigo-700/50">
            Paso {{ currentStep }} de 3
          </span>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="container mx-auto px-4 max-w-6xl">
      
      <!-- Global Error Banner -->
      <div v-if="globalError" class="max-w-3xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 px-5 py-4 rounded-2xl shadow-sm flex items-center justify-between no-print">
        <div class="flex items-center space-x-2">
          <span class="text-xl">⚠️</span>
          <span class="text-xs font-semibold leading-relaxed">{{ globalError }}</span>
        </div>
        <button @click="globalError = ''" class="text-red-500 font-bold px-2 hover:text-red-400">✕</button>
      </div>

      <!-- STEP 1: Upload File or Choose Sample -->
      <template v-if="currentStep === 1">
        <ProgressFileUploader
          @fileSelected="handleFileSelected"
          @loadSample="handleLoadSample"
          @createManual="handleCreateManual"
        />
      </template>

      <!-- STEP 2: Review Table & Calculations -->
      <template v-if="currentStep === 2">
        <ProgressReviewTable
          :records="records"
          :patientName="patientName"
          :sex="sex"
          :goals="goals"
          @update:records="records = $event"
          @update:patientName="patientName = $event"
          @update:sex="handleSexChange"
          @update:goals="goals = $event"
          @back="currentStep = 1"
          @continue="currentStep = 3"
        />
      </template>

      <!-- STEP 3: Visual Dashboard & Charts -->
      <template v-if="currentStep === 3">
        <ProgressDashboard
          :records="records"
          :patientName="patientName"
          :sex="sex"
          :goals="goals"
          @edit="currentStep = 2"
          @newPatient="resetAll"
        />
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ClinicalRecord, BiologicalSex, PatientGoals } from '../../types/patientProgress';
import { ProgressCalculationService } from '../../services/progress/ProgressCalculationService';
import { ProgressFileParserService } from '../../services/progress/ProgressFileParserService';
import {
  SAMPLE_PATIENT_NAME,
  SAMPLE_PATIENT_SEX,
  SAMPLE_GOALS,
  SAMPLE_PROGRESS_RECORDS,
} from '../../catalog/progress/samplePatientProgress';

import ProgressFileUploader from './ProgressFileUploader.vue';
import ProgressReviewTable from './ProgressReviewTable.vue';
import ProgressDashboard from './ProgressDashboard.vue';

const currentStep = ref<number>(1);
const globalError = ref<string>('');

const records = ref<ClinicalRecord[]>([]);
const patientName = ref<string>('');
const sex = ref<BiologicalSex>('H');
const goals = ref<PatientGoals>({ metaPeso: '', metaGrasa: '' });

const steps = [
  { number: 1, label: 'Subir Archivo', icon: '📄' },
  { number: 2, label: 'Revisar Medidas', icon: '🔎' },
  { number: 3, label: 'Gráficas y Reporte', icon: '📈' },
];

function canNavigateTo(stepNumber: number): boolean {
  if (stepNumber === 1) return true;
  if (stepNumber === 2) return records.value.length > 0;
  if (stepNumber === 3) return records.value.length > 0;
  return false;
}

function handleStepClick(targetStep: number) {
  if (targetStep === currentStep.value) return;
  if (targetStep === 1) {
    currentStep.value = 1;
    return;
  }
  if (records.value.length === 0) {
    globalError.value = 'Primero debes cargar o ingresar mediciones en el Paso 1.';
    return;
  }
  currentStep.value = targetStep;
}

async function handleFileSelected(file: File) {
  globalError.value = '';
  try {
    const result = await ProgressFileParserService.parseFile(file);
    patientName.value = result.patientName;
    records.value = result.records;
    ProgressCalculationService.recalculateFormulas(records.value, sex.value);
    currentStep.value = 2;
  } catch (error: any) {
    console.error('Error procesando archivo de progreso:', error);
    globalError.value = error.message || 'No se pudo procesar el archivo seleccionado.';
  }
}

function handleLoadSample() {
  globalError.value = '';
  patientName.value = SAMPLE_PATIENT_NAME;
  sex.value = SAMPLE_PATIENT_SEX;
  goals.value = { ...SAMPLE_GOALS };
  records.value = JSON.parse(JSON.stringify(SAMPLE_PROGRESS_RECORDS));
  ProgressCalculationService.recalculateFormulas(records.value, sex.value);
  currentStep.value = 3; // Go straight to interactive charts
}

function handleCreateManual() {
  globalError.value = '';
  patientName.value = '';
  sex.value = 'H';
  goals.value = { metaPeso: '', metaGrasa: '' };
  records.value = [
    ProgressCalculationService.normalizeRecord({
      Fecha: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
      Edad: 25,
      Peso: 70,
      Talla: 170,
    }),
  ];
  ProgressCalculationService.recalculateFormulas(records.value, sex.value);
  currentStep.value = 2;
}

function handleSexChange(newSex: BiologicalSex) {
  sex.value = newSex;
  ProgressCalculationService.recalculateFormulas(records.value, sex.value);
}

function resetAll() {
  currentStep.value = 1;
  globalError.value = '';
  records.value = [];
  patientName.value = '';
  sex.value = 'H';
  goals.value = { metaPeso: '', metaGrasa: '' };
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
