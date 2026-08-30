<template>
  <div class="space-y-6 max-w-7xl mx-auto w-full pb-16">
    
    <!-- Top Persistent Patient Header -->
    <PatientHeader
      :patient="patient"
      :measurements="measurements"
      @back="$emit('back')"
      @newAppointment="openNewAppointmentModal"
      @newMeasurement="openNewMeasurementModal"
      @openRecommendations="handleOpenRecommendations"
      @editPatient="showEditPatientModal = true"
    />

    <!-- Internal Navigation Tabs Bar (Sticky on Desktop) -->
    <div class="sticky top-16 z-30 bg-white/90 dark:bg-[#0e0e10]/90 backdrop-blur-xl py-2 -my-2 border-b border-slate-200 dark:border-white/10 no-print transition-colors">
      <nav class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer"
          :class="[
            activeTab === tab.id
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-1 ring-slate-900/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4 shrink-0" />
          <span>{{ tab.label }}</span>
          <span 
            v-if="tab.badge" 
            class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold"
            :class="activeTab === tab.id ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'"
          >
            {{ tab.badge }}
          </span>
        </button>

      </nav>
    </div>

    <!-- Tab Contents Transition Area -->
    <main class="min-h-[450px]">
      
      <!-- TAB 1: Resumen / Overview -->
      <PatientTabOverview
        v-if="activeTab === 'overview'"
        :patient="patient"
        :measurements="measurements"
        :appointments="appointments"
        @newMeasurement="openNewMeasurementModal"
        @scheduleAppointment="openNewAppointmentModal"
        @openRecommendations="handleOpenRecommendations"
        @goToAppointments="activeTab = 'appointments'"
        @goToMeasurements="activeTab = 'measurements'"
        @goToHistory="activeTab = 'history'"
      />

      <!-- TAB 2: Historial Clínico & Preferencias IA -->
      <PatientTabHistory
        v-else-if="activeTab === 'history'"
        :patientId="patient.id"
        :initialHistory="clinicalHistory"
        @updated="handleHistoryUpdated"
      />

      <!-- TAB 3: Citas & Consultas -->
      <PatientTabAppointments
        v-else-if="activeTab === 'appointments'"
        :patientId="patient.id"
        :appointments="appointments"
        @scheduleAppointment="openNewAppointmentModal"
        @editAppointment="openEditAppointmentModal"
        @refresh="loadPatientData"
      />

      <!-- TAB 4: Mediciones & Avances -->
      <PatientTabMeasurements
        v-else-if="activeTab === 'measurements'"
        :patient="patient"
        :measurements="measurements"
        @newMeasurement="openNewMeasurementModal"
        @refresh="loadPatientData"
      />

      <!-- TAB 5: Planes & Dietas -->
      <PatientTabDietPlans
        v-else-if="activeTab === 'diet-plans'"
        :patient="patient"
        :dietPlans="dietPlans"
        @openShoppingList="$emit('openShoppingList', patient)"
        @refresh="loadPatientData"
      />

      <!-- TAB 6: Archivos & Entregables Oficiales -->
      <PatientTabFiles
        v-else-if="activeTab === 'files'"
        :patient="patient"
        @openRecommendations="handleOpenRecommendations"
        @goToMeasurements="activeTab = 'measurements'"
      />

    </main>

    <!-- Modals -->
    
    <!-- 1. Edit Patient Modal -->
    <PatientModalForm
      v-if="showEditPatientModal"
      :initialData="patient"
      @close="showEditPatientModal = false"
      @save="handleSavePatientEdit"
    />

    <!-- 2. Appointment Modal (New / Edit) -->
    <AppointmentModal
      v-if="showAppointmentModal"
      :patientName="patient.nombre"
      :initialData="selectedAppointment"
      @close="showAppointmentModal = false"
      @save="handleSaveAppointment"
    />

    <!-- 3. Quick Measurement Modal -->
    <QuickMeasurementModal
      v-if="showMeasurementModal"
      :patientName="patient.nombre"
      :sex="patient.sexo"
      :initialData="selectedMeasurement"
      @close="showMeasurementModal = false"
      @save="handleSaveMeasurement"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Target, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  Utensils, 
  FolderArchive 
} from 'lucide-vue-next';
import type { 
  Patient, 
  ClinicalHistory, 
  PatientAppointment, 
  PatientMeasurement, 
  PatientDietPlan 
} from '../../types/patient';
import { PatientsService } from '../../services/patients/patients.service';

import PatientHeader from './PatientHeader.vue';
import PatientTabOverview from './tabs/PatientTabOverview.vue';
import PatientTabHistory from './tabs/PatientTabHistory.vue';
import PatientTabAppointments from './tabs/PatientTabAppointments.vue';
import PatientTabMeasurements from './tabs/PatientTabMeasurements.vue';
import PatientTabDietPlans from './tabs/PatientTabDietPlans.vue';
import PatientTabFiles from './tabs/PatientTabFiles.vue';

import PatientModalForm from './PatientModalForm.vue';
import AppointmentModal from './modals/AppointmentModal.vue';
import QuickMeasurementModal from './modals/QuickMeasurementModal.vue';

const props = defineProps<{
  patientId: string;
  initialTab?: string;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'openRecommendations', patient: Patient): void;
  (e: 'openShoppingList', patient: Patient): void;
}>();

type TabId = 'overview' | 'history' | 'appointments' | 'measurements' | 'diet-plans' | 'files';

const activeTab = ref<TabId>((props.initialTab as TabId) || 'overview');

const patient = ref<Patient>({
  id: props.patientId,
  nombre: 'Cargando paciente...',
  sexo: 'M',
  status: 'activo',
  alertasMedicas: [],
  metas: {},
  createdAt: null,
  updatedAt: null
});

const clinicalHistory = ref<ClinicalHistory | null>(null);
const appointments = ref<PatientAppointment[]>([]);
const measurements = ref<PatientMeasurement[]>([]);
const dietPlans = ref<PatientDietPlan[]>([]);

// Modal States
const showEditPatientModal = ref(false);
const showAppointmentModal = ref(false);
const selectedAppointment = ref<PatientAppointment | null>(null);
const showMeasurementModal = ref(false);
const selectedMeasurement = ref<PatientMeasurement | null>(null);

const tabs = computed(() => [
  { id: 'overview' as const, label: 'Resumen', icon: Target },
  { id: 'history' as const, label: 'Historial Clínico', icon: ClipboardList },
  { id: 'appointments' as const, label: 'Citas', icon: Calendar, badge: appointments.value.length ? String(appointments.value.length) : undefined },
  { id: 'measurements' as const, label: 'Mediciones & Avances', icon: BarChart3, badge: measurements.value.length ? String(measurements.value.length) : undefined },
  { id: 'diet-plans' as const, label: 'Planes & Dietas', icon: Utensils, badge: dietPlans.value.length ? String(dietPlans.value.length) : undefined },
  { id: 'files' as const, label: 'Archivos & Fichas', icon: FolderArchive }
]);

async function loadPatientData() {
  if (!props.patientId) return;
  const p = await PatientsService.getPatientById(props.patientId);
  if (p) {
    patient.value = p;
  }
  clinicalHistory.value = await PatientsService.getClinicalHistory(props.patientId);
  appointments.value = await PatientsService.getAppointments(props.patientId);
  measurements.value = await PatientsService.getMeasurements(props.patientId);
  dietPlans.value = await PatientsService.getPatientDietPlans(props.patientId);
}

onMounted(() => {
  loadPatientData();
});

watch(() => props.patientId, () => {
  loadPatientData();
});

function openNewAppointmentModal() {
  selectedAppointment.value = null;
  showAppointmentModal.value = true;
}

function openEditAppointmentModal(apt: PatientAppointment) {
  selectedAppointment.value = apt;
  showAppointmentModal.value = true;
}

async function handleSaveAppointment(data: any) {
  if (data.id) {
    await PatientsService.updateAppointment(patient.value.id, data.id, data);
  } else {
    await PatientsService.createAppointment(patient.value.id, data);
  }
  showAppointmentModal.value = false;
  await loadPatientData();
}

function openNewMeasurementModal() {
  selectedMeasurement.value = null;
  showMeasurementModal.value = true;
}

async function handleSaveMeasurement(data: any) {
  if (data.id) {
    await PatientsService.updateMeasurement(patient.value.id, data.id, data);
  } else {
    await PatientsService.addMeasurement(patient.value.id, data);
  }
  showMeasurementModal.value = false;
  await loadPatientData();
}

async function handleSavePatientEdit(data: any) {
  patient.value = {
    ...patient.value,
    ...data
  };
  await PatientsService.updatePatient(patient.value.id, data);
  showEditPatientModal.value = false;
  await loadPatientData();
}

function handleHistoryUpdated(newHist: ClinicalHistory) {
  clinicalHistory.value = newHist;
}

function handleOpenRecommendations() {
  emit('openRecommendations', patient.value);
}
</script>
