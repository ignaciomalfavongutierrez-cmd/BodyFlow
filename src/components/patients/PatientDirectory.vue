<template>
  <div class="space-y-6 max-w-7xl mx-auto w-full">
    
    <!-- Top Header: Title, Subtitle, New Patient Button -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Directorio de Pacientes
          </h2>
          <span class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            {{ patients.length }} Registrados
          </span>
        </div>
        <p class="text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400">
          Monitorea expedientes clínicos, evolución antropométrica, dietas y consultas activas.
        </p>
      </div>

      <button
        @click="showNewPatientModal = true"
        class="inline-flex items-center gap-2 px-5 py-2.5 btn-primary text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
      >
        <UserPlus class="w-4 h-4" />
        <span>+ Nuevo Paciente</span>
      </button>
    </div>

    <!-- Summary KPI Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- KPI 1: Pacientes Activos -->
      <div class="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3.5 transition-colors">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Pacientes Activos</p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{{ activeCount }}</h3>
        </div>
      </div>

      <!-- KPI 2: En Seguimiento -->
      <div class="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3.5 transition-colors">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
          <CalendarCheck class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">En Seguimiento</p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{{ followUpCount }}</h3>
        </div>
      </div>

      <!-- KPI 3: Alertas Médicas Activas -->
      <div class="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3.5 transition-colors">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
          <AlertTriangle class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Casos Clínicos / Alertas</p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{{ alertsCount }}</h3>
        </div>
      </div>

      <!-- KPI 4: Adherencia Promedio -->
      <div class="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-3.5 transition-colors">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Adherencia Media</p>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">94%</h3>
        </div>
      </div>

    </div>

    <!-- Search & Filter Controls Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#18181b] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
      
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, objetivo, tag o teléfono..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
        >
          ✕
        </button>
      </div>

      <!-- Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          @click="selectedStatus = f.value"
          class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
          :class="selectedStatus === f.value ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black shadow-xs ring-1 ring-emerald-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'"
        >
          {{ f.label }}
        </button>
      </div>

    </div>

    <!-- Patient Cards Grid -->
    <div v-if="filteredPatients.length === 0" class="bg-white dark:bg-[#18181b] p-12 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-3">
      <div class="text-3xl">🔍</div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No se encontraron pacientes</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Prueba cambiando el término de búsqueda o el filtro de estado seleccionado.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      
      <div
        v-for="p in filteredPatients"
        :key="p.id"
        @click="$emit('selectPatient', p.id)"
        class="bg-white dark:bg-[#18181b] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-white/20 transition-all group cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden"
      >
        
        <!-- Top Row: Avatar, Name, Badges -->
        <div class="flex items-start justify-between gap-3">
          
          <div class="flex items-center gap-3.5 min-w-0">
            
            <!-- Avatar -->
            <div 
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform"
              :style="{ background: p.sexo === 'M' ? 'linear-gradient(135deg, #7e9455 0%, #4d5e2c 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }"
            >
              {{ getInitials(p.nombre) }}
            </div>

            <!-- Demographics -->
            <div class="min-w-0 space-y-0.5">
              <h4 class="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                {{ p.nombre }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                <span v-if="p.edad">{{ p.edad }} años • </span>
                <span>{{ p.sexo === 'H' ? 'Hombre' : 'Mujer' }}</span>
                <span v-if="p.telefono"> • {{ p.telefono }}</span>
              </p>
            </div>

          </div>

          <!-- Status Badge -->
          <span 
            class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border shadow-2xs shrink-0"
            :class="getStatusBadgeClass(p.status)"
          >
            {{ p.status }}
          </span>

        </div>

        <!-- Middle: Goal & Medical Alerts -->
        <div class="space-y-2">
          
          <!-- Objective -->
          <div class="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-bold">
            <span class="text-sm">🎯</span>
            <span class="truncate">{{ p.objetivoPrincipal || 'Sin objetivo asignado' }}</span>
          </div>

          <!-- Critical Medical Alerts Banner (If present) -->
          <div v-if="p.alertasMedicas && p.alertasMedicas.length > 0" class="flex flex-wrap gap-1 pt-1">
            <span
              v-for="(alert, idx) in p.alertasMedicas"
              :key="idx"
              class="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/30 flex items-center gap-1"
            >
              <span>⚠️</span>
              <span>{{ alert }}</span>
            </span>
          </div>

        </div>

        <!-- Bottom: Last Update & Next Consultation info + Action Button -->
        <div class="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          
          <div class="flex items-center gap-2">
            <span v-if="p.proximaCita" class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
              <Calendar class="w-3.5 h-3.5" />
              <span>Cita: {{ p.proximaCita }}</span>
            </span>
            <span v-else-if="p.ultimaConsulta" class="flex items-center gap-1 text-slate-400">
              <Clock class="w-3.5 h-3.5" />
              <span>Última: {{ p.ultimaConsulta }}</span>
            </span>
            <span v-else class="text-slate-400">Sin consultas registradas</span>
          </div>

          <div class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
            <span>Ver Expediente</span>
            <span>→</span>
          </div>

        </div>

      </div>

    </div>

    <!-- Modal for Creating New Patient -->
    <PatientModalForm
      v-if="showNewPatientModal"
      @close="showNewPatientModal = false"
      @save="handleCreatePatient"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Users, 
  UserPlus, 
  CalendarCheck, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Calendar, 
  Clock 
} from 'lucide-vue-next';
import type { Patient, PatientStatus } from '../../types/patient';
import { PatientsService } from '../../services/patients/patients.service';
import PatientModalForm from './PatientModalForm.vue';

const emit = defineEmits<{
  (e: 'selectPatient', patientId: string): void;
}>();

const patients = ref<Patient[]>([]);
const searchQuery = ref('');
const selectedStatus = ref<string>('todos');
const showNewPatientModal = ref(false);

let unsubscribe: (() => void) | null = null;

const filterOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'activo' },
  { label: 'Seguimiento', value: 'seguimiento' },
  { label: 'Pausados', value: 'pausado' },
  { label: 'Inactivos', value: 'inactivo' }
];

onMounted(async () => {
  unsubscribe = PatientsService.subscribePatients((updated) => {
    patients.value = updated;
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const activeCount = computed(() => {
  return patients.value.filter(p => p.status === 'activo').length;
});

const followUpCount = computed(() => {
  return patients.value.filter(p => p.status === 'seguimiento').length;
});

const alertsCount = computed(() => {
  return patients.value.filter(p => p.alertasMedicas && p.alertasMedicas.length > 0).length;
});

const filteredPatients = computed(() => {
  let list = [...patients.value];

  if (selectedStatus.value !== 'todos') {
    list = list.filter(p => p.status === selectedStatus.value);
  }

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    list = list.filter(p =>
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.objetivoPrincipal || '').toLowerCase().includes(term) ||
      (p.telefono || '').includes(term) ||
      (p.tags || []).some(t => t.toLowerCase().includes(term)) ||
      (p.alertasMedicas || []).some(a => a.toLowerCase().includes(term))
    );
  }

  return list;
});

function getInitials(name: string) {
  if (!name) return 'P';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function getStatusBadgeClass(status: PatientStatus) {
  switch (status) {
    case 'activo':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'seguimiento':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'pausado':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    case 'inactivo':
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30';
  }
}

async function handleCreatePatient(data: any) {
  const newPatient = await PatientsService.createPatient(data);
  showNewPatientModal.value = false;
  emit('selectPatient', newPatient.id);
}
</script>
