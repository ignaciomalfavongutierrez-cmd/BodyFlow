<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar & View Mode Switcher (Hidden on print) -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm no-print">
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
          <BarChart3 class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Avances Antropométricos & Gráficas Clínicas
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ (displayRecords && displayRecords.length) || 0 }} mediciones registradas en el expediente.
          </p>
        </div>
      </div>

      <!-- Center / Right: View Toggle & Action Buttons -->
      <div class="flex items-center flex-wrap gap-2.5">
        
        <!-- View Toggle Pill -->
        <div class="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <button
            @click="activeView = 'dashboard'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            :class="activeView === 'dashboard' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
          >
            <BarChart3 class="w-3.5 h-3.5" />
            <span>Gráficas & Reporte</span>
          </button>

          <button
            @click="activeView = 'table'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            :class="activeView === 'table' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'"
          >
            <Table class="w-3.5 h-3.5" />
            <span>Tabla de Medidas</span>
          </button>
        </div>

        <!-- Add Manual Measurement Button -->
        <button
          @click="$emit('newMeasurement')"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ Añadir Medición</span>
        </button>

        <!-- Import from Word/Excel File Button -->
        <button
          @click="showImportModal = true"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold border border-indigo-200 dark:border-indigo-800/40 transition-all cursor-pointer"
        >
          <UploadCloud class="w-4 h-4" />
          <span>Importar Archivo</span>
        </button>

      </div>

    </div>

    <!-- Empty State -->
    <div 
      v-if="!displayRecords || displayRecords.length === 0" 
      class="bg-white dark:bg-[#18181b] p-12 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-3"
    >
      <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold">
        📊
      </div>
      <h4 class="text-base font-bold text-slate-900 dark:text-white">No hay mediciones registradas</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Comienza capturando la primera medición antropométrica o importa un archivo de Word/Excel para generar las gráficas de evolución.
      </p>
      <div class="flex items-center justify-center gap-3 pt-2">
        <button
          @click="$emit('newMeasurement')"
          class="px-4 py-2 btn-primary text-xs font-bold rounded-xl"
        >
          + Medición Manual
        </button>
        <button
          @click="showImportModal = true"
          class="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold rounded-xl"
        >
          Importar Word / Excel
        </button>
      </div>
    </div>

    <!-- VIEW 1: Visual Dashboard & Multi-Page Clinical Charts -->
    <div v-else-if="activeView === 'dashboard'">
      <ProgressDashboard
        :records="displayRecords"
        :patientName="patient.nombre"
        :sex="patient.sexo"
        :goals="{ metaPeso: patient.metas?.metaPeso || '', metaGrasa: patient.metas?.metaGrasa || '' }"
        @edit="activeView = 'table'"
        @newPatient="$emit('newMeasurement')"
      />
    </div>

    <!-- VIEW 2: Review & Edit Table Component -->
    <div v-else-if="activeView === 'table'" class="space-y-4">
      
      <!-- Import Notice Banner if file was just parsed -->
      <div 
        v-if="importNotice" 
        class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 p-4 rounded-2xl flex items-center justify-between shadow-xs transition-all"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            ✨
          </div>
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wide">Mediciones extraídas para revisión</h4>
            <p class="text-xs mt-0.5 leading-relaxed">{{ importNotice }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="handleSaveAndShowDashboard(displayRecords)"
            class="px-4 py-2 btn-primary text-xs font-bold rounded-xl shadow-md cursor-pointer shrink-0"
          >
            💾 Guardar en Expediente
          </button>
          <button 
            @click="importNotice = ''" 
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      <ProgressReviewTable
        :records="displayRecords"
        :patientName="patient.nombre"
        :sex="patient.sexo"
        :goals="{ metaPeso: patient.metas?.metaPeso || '', metaGrasa: patient.metas?.metaGrasa || '' }"
        @update:records="handleTableRecordsChange"
        @back="activeView = 'dashboard'"
        @continue="handleSaveAndShowDashboard(displayRecords)"
      />
    </div>

    <!-- Modal for importing file (Word / Excel) -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print"
    >
      <div class="glass-card max-w-xl w-full p-6 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] transition-colors">
        
        <button
          @click="showImportModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="text-center space-y-3 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <UploadCloud class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Importar Historial desde Archivo
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Sube un archivo de Word (.docx) o Excel (.xlsx, .csv) de la consulta de {{ patient.nombre }}.
          </p>
        </div>

        <div 
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          class="border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer"
          :class="isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-300 dark:border-white/20 hover:border-emerald-500/60 bg-slate-50 dark:bg-white/5'"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".docx,.xlsx,.xls,.csv"
            class="hidden"
            @change="handleFileChange"
          />

          <div class="space-y-3">
            <div class="text-3xl">📄</div>
            <div>
              <p class="text-xs font-bold text-slate-800 dark:text-white">
                Haz clic para seleccionar o arrastra aquí
              </p>
              <p class="text-[11px] text-slate-400 mt-0.5">Formatos compatibles: .docx, .xlsx, .csv</p>
            </div>
          </div>
        </div>

        <div v-if="importLoading" class="mt-4 text-center py-4 space-y-2">
          <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Procesando y extrayendo mediciones con IA/RegEx...</p>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  BarChart3, 
  Table, 
  Plus, 
  UploadCloud, 
  X 
} from 'lucide-vue-next';
import type { Patient, PatientMeasurement } from '../../../types/patient';
import type { ClinicalRecord } from '../../../types/patientProgress';
import ProgressDashboard from '../../progress/ProgressDashboard.vue';
import ProgressReviewTable from '../../progress/ProgressReviewTable.vue';
import { ProgressFileParserService } from '../../../services/progress/ProgressFileParserService';
import { PatientsService } from '../../../services/patients/patients.service';

const props = defineProps<{
  patient: Patient;
  measurements?: PatientMeasurement[];
}>();

const emit = defineEmits<{
  (e: 'newMeasurement'): void;
  (e: 'refresh'): void;
}>();

const activeView = ref<'dashboard' | 'table'>('dashboard');
const showImportModal = ref(false);
const isDragging = ref(false);
const importLoading = ref(false);
const importNotice = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

// Local working copy of records (for live editing and pre-save inspection)
const localEditingRecords = ref<ClinicalRecord[]>([]);

function mapMeasurementsToRecords(measList?: PatientMeasurement[]): ClinicalRecord[] {
  if (!measList || measList.length === 0) return [];
  return measList.map(m => ({
    ...m,
    id: m.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    Fecha: m.Fecha || '',
    Edad: m.Edad || props.patient.edad || 28,
    Peso: m.Peso || 0,
    Talla: m.Talla || 165,
    Cintura: m.Cintura || 0,
    Cadera: m.Cadera || 0,
    Pecho: m.Pecho,
    Brazo: m.Brazo,
    Muslo: m.Muslo,
    Pantorrilla: m.Pantorrilla,
    Pliegues: m.Pliegues || { tricep: null, bicep: null, subescapular: null, cresta: null },
    Suma_Pliegues: m.Suma_Pliegues || 0,
    Grasa_Bascula: m.Grasa_Bascula || 0,
    Grasa_Formula: m.Grasa_Formula || 0,
    Grasa_Fuente: m.Grasa_Fuente || 'formula',
    Grasa_Porcentaje: m.Grasa_Porcentaje ?? null,
    Musculo_Kg: m.Musculo_Kg || 0,
    IMC: m.IMC || 0,
    ICC: m.ICC || 0
  }));
}

onMounted(() => {
  localEditingRecords.value = mapMeasurementsToRecords(props.measurements);
});

watch(() => props.measurements, (newVal) => {
  // Only sync from props if not in the middle of a custom imported draft review
  if (!importNotice.value) {
    localEditingRecords.value = mapMeasurementsToRecords(newVal);
  }
}, { deep: true });

const displayRecords = computed<ClinicalRecord[]>(() => {
  if (localEditingRecords.value.length > 0) {
    return localEditingRecords.value;
  }
  return mapMeasurementsToRecords(props.measurements);
});

function handleTableRecordsChange(updated: ClinicalRecord[]) {
  localEditingRecords.value = updated;
}

async function handleSaveAndShowDashboard(records: ClinicalRecord[]) {
  await PatientsService.batchImportMeasurements(props.patient.id, records);
  importNotice.value = '';
  activeView.value = 'dashboard';
  emit('refresh');
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await processUploadedFile(target.files[0]);
  }
}

async function handleFileDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
    await processUploadedFile(event.dataTransfer.files[0]);
  }
}

async function processUploadedFile(file: File) {
  importLoading.value = true;
  try {
    const parseResult = await ProgressFileParserService.parseFile(file);
    if (parseResult && parseResult.records && parseResult.records.length > 0) {
      // 1. Put parsed records directly into localEditingRecords so the user can review & edit them
      localEditingRecords.value = parseResult.records;

      // 2. Auto-sync demographic data from Word clinical history if missing
      const updates: any = {};
      if (!props.patient.edad && parseResult.age) updates.edad = parseResult.age;
      if (parseResult.sex && parseResult.sex !== props.patient.sexo) updates.sexo = parseResult.sex;
      if (!props.patient.ocupacion && parseResult.ocupacion) updates.ocupacion = parseResult.ocupacion;
      if (Object.keys(updates).length > 0) {
        await PatientsService.updatePatient(props.patient.id, updates);
      }

      // 3. Set review banner message and switch to the review table view
      importNotice.value = `Se extrajeron ${parseResult.records.length} consultas desde "${file.name}". Puedes revisar o editar cualquier medida en la tabla antes de guardar.`;
      activeView.value = 'table';
      showImportModal.value = false;
    } else {
      alert('No se encontraron consultas o mediciones válidas en el archivo subido. Verifica que contenga tablas o bloques de evaluación antropométrica.');
    }
  } catch (err: any) {
    console.error('[PATIENTS:IMPORT] Error importing file:', err);
    alert(`Error al procesar el archivo: ${err?.message || 'Formato no reconocido'}`);
  } finally {
    importLoading.value = false;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
}
</script>
