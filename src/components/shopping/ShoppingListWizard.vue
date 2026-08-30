<template>
  <div class="min-h-full pb-16">
    <!-- Stepper Header with Navigation -->
    <WizardHeader
      :currentStep="currentStep"
      :hasDietData="Boolean(dietData)"
      @stepClick="handleStepClick"
    />

    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Error notification -->
      <div v-if="globalError" class="max-w-3xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 text-red-300 px-5 py-4 rounded-2xl shadow-sm flex items-center justify-between no-print">
        <div class="flex items-center space-x-2">
          <span class="text-xl">⚠️</span>
          <span class="text-xs font-semibold leading-relaxed">{{ globalError }}</span>
        </div>
        <button @click="globalError = ''" class="text-red-400 font-bold px-2 hover:text-red-300">✕</button>
      </div>

      <!-- STEP 1: Upload Diet File (PDF, Word, Images, Excel, etc.) -->
      <template v-if="currentStep === 1">
        <DietAnalysisProgress v-if="isLoading" />
        <DietPdfUploader
          v-else
          @fileSelected="handleFileSelected"
          @loadSample="handleLoadSample"
        />
      </template>

      <!-- STEP 2: Human Review Table -->
      <template v-if="currentStep === 2 && dietData">
        <DietReviewTable
          :diet="dietData"
          @continue="goToStep3"
        />
      </template>

      <!-- STEP 3: Day Selector -->
      <template v-if="currentStep === 3">
        <DaySelector
          :availableDays="availableDays"
          v-model:selectedDays="selectedDays"
          v-model:multiplier="cycleMultiplier"
          @back="currentStep = 2"
          @continue="currentStep = 4"
        />
      </template>

      <!-- STEP 4: Purchase Strategy Selector -->
      <template v-if="currentStep === 4">
        <PurchaseStrategySelector
          v-model:selectedStrategy="purchaseStrategy"
          @back="currentStep = 3"
          @generate="generateShoppingList"
        />
      </template>

      <!-- STEP 5: Final Shopping List -->
      <template v-if="currentStep === 5 && calculationResult">
        <ShoppingList
          :result="calculationResult"
          @newList="resetAll"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DietStructure, PurchaseStrategy, ShoppingListCalculationResult  } from '../../types/shoppingDiet';
import { GeminiDietParserService } from '../../services/shopping/GeminiDietParserService';
import { DietExtractionService } from '../../services/shopping/DietExtractionService';
import { ShoppingListCalculatorService } from '../../services/shopping/ShoppingListCalculatorService';
import { SAMPLE_DIET } from '../../catalog/shopping/sampleDiet';

import WizardHeader from './WizardHeader.vue';
import DietPdfUploader from './DietPdfUploader.vue';
import DietAnalysisProgress from './DietAnalysisProgress.vue';
import DietReviewTable from './DietReviewTable.vue';
import DaySelector from './DaySelector.vue';
import PurchaseStrategySelector from './PurchaseStrategySelector.vue';
import ShoppingList from './ShoppingList.vue';

const currentStep = ref<number>(1);
const isLoading = ref<boolean>(false);
const globalError = ref<string>('');

const dietData = ref<DietStructure | null>(null);
const selectedDays = ref<number[]>([]);
const cycleMultiplier = ref<number>(1);
const purchaseStrategy = ref<PurchaseStrategy>('value'); // Calidad / Precio by default
const calculationResult = ref<ShoppingListCalculationResult | null>(null);

const availableDays = computed(() => {
  if (!dietData.value || !dietData.value.days) return [];
  return dietData.value.days.map((d) => d.day_number).sort((a, b) => a - b);
});

async function handleFileSelected(file: File) {
  isLoading.value = true;
  globalError.value = '';

  try {
    const rawParsed = await GeminiDietParserService.parseDietFile(file);
    dietData.value = DietExtractionService.validateAndStructure(rawParsed);
    selectedDays.value = [...availableDays.value];
    cycleMultiplier.value = 1;
    currentStep.value = 2;
  } catch (error: any) {
    console.error('Error analizando el archivo de dieta:', error);
    globalError.value = error.message || 'Ocurrió un error al procesar el archivo con Gemini.';
  } finally {
    isLoading.value = false;
  }
}

function handleLoadSample() {
  globalError.value = '';
  dietData.value = DietExtractionService.validateAndStructure(SAMPLE_DIET);
  selectedDays.value = [...availableDays.value];
  cycleMultiplier.value = 1;
  currentStep.value = 2;
}

function goToStep3() {
  if (!dietData.value || dietData.value.days.length === 0) {
    globalError.value = 'La dieta debe contener al menos un día con ingredientes.';
    return;
  }
  // Default to selecting all days initially
  if (selectedDays.value.length === 0) {
    selectedDays.value = [...availableDays.value];
  }
  currentStep.value = 3;
}

function generateShoppingList() {
  if (!dietData.value || selectedDays.value.length === 0) {
    globalError.value = 'Debes seleccionar al menos un día para generar la lista.';
    return;
  }

  try {
    calculationResult.value = ShoppingListCalculatorService.calculate(
      dietData.value,
      selectedDays.value,
      purchaseStrategy.value,
      cycleMultiplier.value
    );
    currentStep.value = 5;
  } catch (error: any) {
    console.error('Error calculando la lista de compras:', error);
    globalError.value = error.message || 'Error al calcular la lista de compras.';
  }
}

function handleStepClick(targetStep: number) {
  if (targetStep === currentStep.value) return;

  if (targetStep === 1) {
    currentStep.value = 1;
    return;
  }

  if (!dietData.value || dietData.value.days.length === 0) {
    globalError.value = 'Primero debes cargar o analizar una dieta en el Paso 1.';
    return;
  }

  if (targetStep === 2) {
    currentStep.value = 2;
    return;
  }

  if (targetStep === 3) {
    if (selectedDays.value.length === 0) {
      selectedDays.value = [...availableDays.value];
    }
    currentStep.value = 3;
    return;
  }

  if (targetStep === 4) {
    if (selectedDays.value.length === 0) {
      selectedDays.value = [...availableDays.value];
    }
    currentStep.value = 4;
    return;
  }

  if (targetStep === 5) {
    if (selectedDays.value.length === 0) {
      selectedDays.value = [...availableDays.value];
    }
    generateShoppingList();
  }
}

function resetAll() {
  currentStep.value = 1;
  isLoading.value = false;
  globalError.value = '';
  dietData.value = null;
  selectedDays.value = [];
  purchaseStrategy.value = 'value';
  calculationResult.value = null;
}
</script>
