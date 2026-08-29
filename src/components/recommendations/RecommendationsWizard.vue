<template>
  <div class="min-h-full pb-16 space-y-6">
    
    <!-- Top Control Bar (Hidden on Print) -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm no-print transition-colors">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        <!-- Header Info -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20" style="background: linear-gradient(135deg, #7e9455 0%, #4d5e2c 100%);">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                Hoja de Recomendaciones
              </h2>
              <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                Oficial • Talia Tinoco
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personaliza el objetivo, indicaciones clínicas y genera la ficha oficial imprimible o en PDF.
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
      <div class="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- 1. Objetivo Nutricional Selector -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>1. Objetivo Nutricional</span>
          </label>
          <div class="relative">
            <select
              v-model="selectedObjectiveId"
              class="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option 
                v-for="obj in RECOMMENDATION_OBJECTIVES" 
                :key="obj.id" 
                :value="obj.id"
                class="bg-white dark:bg-[#1f1f23] text-slate-800 dark:text-white py-1"
              >
                {{ obj.name }}
              </option>
            </select>
            <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <!-- 2. Paciente de la Base de Datos -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Users class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>2. Paciente (Base de Datos)</span>
          </label>
          <div class="relative">
            <select
              v-model="selectedPatientId"
              @change="handlePatientSelect"
              class="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" class="bg-white dark:bg-[#1f1f23] text-slate-800 dark:text-white">
                -- Seleccionar Paciente Registrado --
              </option>
              <option 
                v-for="p in SAMPLE_PATIENTS_LIST" 
                :key="p.id" 
                :value="p.id"
                class="bg-white dark:bg-[#1f1f23] text-slate-800 dark:text-white py-1"
              >
                {{ p.name }} ({{ p.goal }})
              </option>
            </select>
            <ChevronDown class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <!-- 3. Nombre del Paciente (Entrada Manual) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>3. Nombre en la Hoja</span>
          </label>
          <input
            v-model="patientName"
            type="text"
            placeholder="Opcional (dejar en blanco para genérico)"
            class="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

      </div>

      <!-- Specific Indications / Padecimientos Row -->
      <div class="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <Stethoscope class="w-3.5 h-3.5 text-amber-500" />
            <span>Indicaciones Específicas / Padecimientos Clínicos (Opcional):</span>
          </span>
          <span class="text-[10px] text-slate-400 font-normal lowercase">Se mostrará en la hoja como nota médica destacada</span>
        </label>
        <textarea
          v-model="specificIndications"
          rows="2"
          placeholder="Ej: Paciente refiere gastritis y reflujo matutino: evitar café en ayunas, moderar picantes y cenar mínimo 2 horas antes de dormir..."
          class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-y"
        ></textarea>
      </div>

    </div>

    <!-- Live Preview Sheet Container -->
    <div class="flex justify-center p-2 sm:p-4">
      <RecommendationSheet
        :objective="currentObjective"
        :patientName="patientName"
        :specificIndications="specificIndications"
        :isPrinting="isPrintingState"
        @update:patientName="patientName = $event"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { 
  FileText, 
  Printer, 
  Download, 
  Sparkles, 
  Users, 
  User, 
  Stethoscope, 
  ChevronDown, 
  Loader2 
} from 'lucide-vue-next';
import { RECOMMENDATION_OBJECTIVES, SAMPLE_PATIENTS_LIST } from '../../catalog/recommendations/objectivesCatalog';
import type { RecommendationObjective } from '../../types/recommendations';
import RecommendationSheet from './RecommendationSheet.vue';

const selectedObjectiveId = ref<string>('general');
const selectedPatientId = ref<string>('');
const patientName = ref<string>('');
const specificIndications = ref<string>('');
const isPrintingState = ref<boolean>(false);
const isGeneratingPdf = ref<boolean>(false);

const currentObjective = computed<RecommendationObjective>(() => {
  const found = RECOMMENDATION_OBJECTIVES.find((o) => o.id === selectedObjectiveId.value);
  return found || RECOMMENDATION_OBJECTIVES[0];
});

function handlePatientSelect() {
  if (!selectedPatientId.value) return;
  const patient = SAMPLE_PATIENTS_LIST.find((p) => p.id === selectedPatientId.value);
  if (patient) {
    patientName.value = patient.name;
    if (patient.objectiveId) {
      selectedObjectiveId.value = patient.objectiveId;
    }
    if (patient.notes) {
      specificIndications.value = patient.notes;
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
    const element = document.getElementById('printable-recommendation-sheet');
    if (!element) throw new Error('No se encontró el elemento imprimible');

    const cleanName = patientName.value
      ? `_${patientName.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').replace(/ +/g, '_')}`
      : '';
    const filename = `Recomendaciones_Nutricionales${cleanName}.pdf`;

    const imgData = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    const img = new Image();
    img.src = imgData;
    await new Promise<void>((resolve) => {
      if (img.complete) resolve();
      else img.onload = () => resolve();
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 4;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (img.height * contentWidth) / img.width;
    const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);

    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, finalHeight);

    pdf.save(filename);
  } catch (err: any) {
    console.error('Error generando PDF directo:', err);
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
