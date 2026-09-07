<template>
  <div class="min-h-full pb-16 px-2 sm:px-4">
    <div class="max-w-[850px] mx-auto w-full space-y-6">
      
      <!-- Top Control Bar (Hidden on Print) -->
      <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm no-print transition-colors w-full">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          <!-- Header Info -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20" style="background: linear-gradient(135deg, #7e9455 0%, #4d5e2c 100%);">
              <Scale class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                  Sistema de Equivalencias
                </h2>
                <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  SMAE Oficial • Talia Tinoco
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Guía clínica oficial de porciones e intercambios alimentarios. Imprime o descarga el formato oficial para tus pacientes.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center flex-wrap gap-2.5">
            <button
              @click="triggerPrint"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer shadow-xs"
            >
              <Printer class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              @click="downloadPDF"
              :disabled="isGeneratingPdf"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
              style="background: linear-gradient(135deg, #7e9455 0%, #5b6f39 100%);"
            >
              <Loader2 v-if="isGeneratingPdf" class="w-4 h-4 animate-spin" />
              <Download v-else class="w-4 h-4" />
              <span>{{ isGeneratingPdf ? 'Generando PDF...' : 'Descargar en PDF' }}</span>
            </button>
          </div>

        </div>

        <!-- Controls Grid -->
        <div class="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- 1. Paciente de la Base de Datos -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Users class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Asignar a Paciente Registrado</span>
            </label>
            <div class="relative">
              <select
                v-model="selectedPatientId"
                @change="handlePatientSelect"
                class="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" class="bg-white dark:bg-[#1f1f23] text-slate-800 dark:text-white">
                  -- Guía General (Sin paciente específico) --
                </option>
                <option 
                  v-for="p in registeredPatients" 
                  :key="p.id" 
                  :value="p.id"
                  class="bg-white dark:bg-[#1f1f23] text-slate-800 dark:text-white py-1"
                >
                  {{ p.nombre }} ({{ p.objetivoPrincipal || 'General' }})
                </option>
              </select>
              <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- 2. Nombre del Paciente en la Hoja -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Nombre Mostrado en la Ficha</span>
            </label>
            <input
              v-model="patientName"
              type="text"
              placeholder="Opcional (ej: Formato General o Juan Pérez)"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

        </div>

        <!-- Indicaciones Nutricionales Específicas -->
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-amber-500" />
              <span>Indicación Nutricional Personalizada (Opcional):</span>
            </span>
            <span class="text-[10px] text-slate-400 font-normal lowercase">Se imprimirá en el recuadro destacado</span>
          </label>
          <textarea
            v-model="specificIndications"
            rows="2"
            placeholder="Ej: Dar preferencia a verduras crudas para saciedad; limitar frutas a 2 equivalentes diarios con cáscara..."
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
          ></textarea>
        </div>

      </div>

      <!-- Live Printable Sheet Preview Container -->
      <div class="w-full flex justify-center">
        <EquivalenceSheet
          :patientName="patientName"
          :specificIndications="specificIndications"
          :isPrinting="isPrintingState"
          @update:patientName="patientName = $event"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Scale, 
  Printer, 
  Download, 
  Users, 
  User, 
  Sparkles, 
  ChevronDown, 
  Loader2 
} from 'lucide-vue-next';
import EquivalenceSheet from './EquivalenceSheet.vue';
import { EquivalenceExportService } from '../../services/nutrition/EquivalenceExportService';
import { PatientsService } from '../../services/patients/patients.service';
import type { Patient } from '../../types/patient';

const props = withDefaults(
  defineProps<{
    initialPatientName?: string;
    initialIndications?: string;
  }>(),
  {
    initialPatientName: '',
    initialIndications: ''
  }
);

const registeredPatients = ref<Patient[]>([]);
const selectedPatientId = ref<string>('');
const patientName = ref<string>(props.initialPatientName || '');
const specificIndications = ref<string>(props.initialIndications || '');
const isPrintingState = ref<boolean>(false);
const isGeneratingPdf = ref<boolean>(false);

onMounted(async () => {
  try {
    const list = await PatientsService.getPatients();
    if (list && list.length > 0) {
      registeredPatients.value = list;
    }
  } catch (err) {
    console.warn('No se pudieron cargar los pacientes registrados:', err);
  }
});

function handlePatientSelect() {
  if (!selectedPatientId.value) {
    patientName.value = '';
    return;
  }
  const found = registeredPatients.value.find(p => p.id === selectedPatientId.value);
  if (found) {
    patientName.value = found.nombre;
    if (found.notasGenerales) {
      specificIndications.value = found.notasGenerales;
    }
  }
}

function triggerPrint() {
  isPrintingState.value = true;
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      isPrintingState.value = false;
    }, 600);
  }, 100);
}

async function downloadPDF() {
  if (isGeneratingPdf.value) return;
  isGeneratingPdf.value = true;
  isPrintingState.value = true;

  try {
    await EquivalenceExportService.exportSheetToPdf(
      'printable-equivalence-sheet',
      patientName.value
    );
  } catch (err: any) {
    console.error('Error generando PDF de equivalencias:', err);
    alert('Ocurrió un error al generar el archivo PDF: ' + (err.message || err));
  } finally {
    isGeneratingPdf.value = false;
    isPrintingState.value = false;
  }
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
