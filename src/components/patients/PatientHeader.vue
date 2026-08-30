<template>
  <div class="bg-white dark:bg-[#18181b] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden">
    
    <!-- Top Row: Back Button, Status Badge & Quick Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
      
      <!-- Back Navigation -->
      <button
        @click="$emit('back')"
        class="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors w-fit group"
      >
        <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all">
          <ArrowLeft class="w-4 h-4" />
        </div>
        <span>Volver al Directorio de Pacientes</span>
      </button>

      <!-- Action Buttons -->
      <div class="flex items-center flex-wrap gap-2">
        <button
          @click="$emit('newAppointment')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-all border border-indigo-200 dark:border-indigo-800/40 shadow-2xs"
        >
          <CalendarPlus class="w-3.5 h-3.5" />
          <span>+ Cita</span>
        </button>

        <button
          @click="$emit('newMeasurement')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800/40 shadow-2xs"
        >
          <Activity class="w-3.5 h-3.5" />
          <span>+ Medición</span>
        </button>

        <button
          @click="$emit('openRecommendations')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm"
          style="background: linear-gradient(135deg, #7e9455 0%, #4d5e2c 100%);"
          title="Generar Ficha Oficial de Recomendaciones"
        >
          <FileText class="w-3.5 h-3.5" />
          <span>Hoja Recomendaciones</span>
        </button>

        <button
          @click="$emit('editPatient')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-white/10 shadow-2xs"
        >
          <Edit3 class="w-3.5 h-3.5" />
          <span>Editar Perfil</span>
        </button>
      </div>

    </div>

    <!-- Main Identity & Contact Grid -->
    <div class="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      
      <!-- Left: Avatar, Name, Age, Sex, Phone/WhatsApp -->
      <div class="flex items-start sm:items-center gap-4 min-w-0">
        
        <!-- Large Stylized Avatar -->
        <div 
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shrink-0 shadow-lg"
          :style="{ background: avatarGradient }"
        >
          {{ patientInitials }}
        </div>

        <!-- Name & Demographics -->
        <div class="min-w-0 space-y-1">
          <div class="flex items-center flex-wrap gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate" style="font-family: var(--font-display);">
              {{ patient.nombre }}
            </h2>
            <span 
              class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs"
              :class="statusBadgeClass"
            >
              {{ patient.status }}
            </span>
          </div>

          <div class="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            <span v-if="patient.edad" class="flex items-center gap-1 font-semibold">
              <User class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ patient.edad }} años</span>
            </span>
            <span class="font-semibold text-slate-500">
              ({{ patient.sexo === 'H' ? 'Hombre' : 'Mujer' }})
            </span>
            <span v-if="patient.ocupacion" class="flex items-center gap-1 text-slate-500">
              <Briefcase class="w-3.5 h-3.5 text-slate-400" />
              <span>{{ patient.ocupacion }}</span>
            </span>
            <span v-if="patient.telefono" class="flex items-center gap-1">
              <Phone class="w-3.5 h-3.5 text-slate-400" />
              <a 
                :href="whatsAppLink" 
                target="_blank" 
                class="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                title="Abrir chat en WhatsApp"
              >
                <span>{{ patient.telefono }}</span>
                <span class="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">WhatsApp ↗</span>
              </a>
            </span>
          </div>

          <!-- Goal / Objective Tag -->
          <div v-if="patient.objetivoPrincipal" class="pt-1 flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Objetivo:</span>
            <span class="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/30">
              🎯 {{ patient.objetivoPrincipal }}
            </span>
          </div>
        </div>

      </div>

      <!-- Right: Mini KPIs summary (Delta Weight, % Fat, Current Weight) -->
      <div class="flex items-center flex-wrap gap-3 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shrink-0">
        
        <div class="text-center px-2 sm:px-3">
          <p class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Peso Actual</p>
          <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {{ currentWeight ? `${currentWeight} kg` : '--' }}
          </p>
        </div>

        <div class="h-8 w-px bg-slate-200 dark:bg-white/10"></div>

        <div class="text-center px-2 sm:px-3">
          <p class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Evolución</p>
          <p 
            class="text-lg font-black mt-0.5 flex items-center justify-center gap-0.5"
            :class="deltaWeightClass"
          >
            <TrendingDown v-if="weightDelta < 0" class="w-4 h-4" />
            <TrendingUp v-else-if="weightDelta > 0" class="w-4 h-4" />
            <span>{{ weightDeltaText }}</span>
          </p>
        </div>

        <div class="h-8 w-px bg-slate-200 dark:bg-white/10"></div>

        <div class="text-center px-2 sm:px-3">
          <p class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">% Grasa</p>
          <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {{ currentFat ? `${currentFat}%` : '--' }}
          </p>
        </div>

      </div>

    </div>

    <!-- CRITICAL MEDICAL ALERTS BANNER -->
    <div 
      v-if="hasAlerts" 
      class="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center gap-2.5 bg-amber-500/10 dark:bg-amber-500/15 p-3 rounded-2xl border border-amber-500/30"
    >
      <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-extrabold text-xs shrink-0">
        <AlertTriangle class="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
        <span>ALERTAS MÉDICAS / CONDICIONES:</span>
      </div>

      <div class="flex items-center flex-wrap gap-1.5">
        <span
          v-for="(alert, index) in combinedAlerts"
          :key="index"
          class="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#1f1f23] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50 shadow-2xs"
        >
          ⚠️ {{ alert }}
        </span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  ArrowLeft, 
  CalendarPlus, 
  Activity, 
  FileText, 
  Edit3, 
  User, 
  Briefcase, 
  Phone, 
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from 'lucide-vue-next';
import type { Patient, PatientMeasurement } from '../../types/patient';

const props = defineProps<{
  patient: Patient;
  measurements?: PatientMeasurement[];
}>();

defineEmits<{
  (e: 'back'): void;
  (e: 'newAppointment'): void;
  (e: 'newMeasurement'): void;
  (e: 'openRecommendations'): void;
  (e: 'editPatient'): void;
}>();

const patientInitials = computed(() => {
  if (!props.patient.nombre) return 'P';
  const parts = props.patient.nombre.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
});

const avatarGradient = computed(() => {
  if (props.patient.sexo === 'M') {
    return 'linear-gradient(135deg, #7e9455 0%, #4d5e2c 100%)';
  }
  return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
});

const statusBadgeClass = computed(() => {
  switch (props.patient.status) {
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
});

const whatsAppLink = computed(() => {
  if (!props.patient.telefono) return '#';
  const cleanNumber = props.patient.telefono.replace(/\D/g, '');
  const prefix = cleanNumber.length === 10 ? `52${cleanNumber}` : cleanNumber;
  return `https://wa.me/${prefix}?text=Hola%20${encodeURIComponent(props.patient.nombre)},%20te%20escribe%20la%20Nutri%C3%B3loga%20Talia%20Tinoco.`;
});

const combinedAlerts = computed(() => {
  return props.patient.alertasMedicas || [];
});

const hasAlerts = computed(() => combinedAlerts.value.length > 0);

// Measurements delta calculations
const currentWeight = computed(() => {
  if (!props.measurements || props.measurements.length === 0) return null;
  const last = props.measurements[props.measurements.length - 1];
  return last.Peso || null;
});

const currentFat = computed(() => {
  if (!props.measurements || props.measurements.length === 0) return null;
  const last = props.measurements[props.measurements.length - 1];
  return last.Grasa_Porcentaje || last.Grasa_Formula || null;
});

const weightDelta = computed(() => {
  if (!props.measurements || props.measurements.length < 2) return 0;
  const first = Number(props.measurements[0].Peso) || 0;
  const last = Number(props.measurements[props.measurements.length - 1].Peso) || 0;
  if (first === 0 || last === 0) return 0;
  return Number((last - first).toFixed(1));
});

const weightDeltaText = computed(() => {
  if (!props.measurements || props.measurements.length < 2) return '0.0 kg';
  const val = weightDelta.value;
  return val > 0 ? `+${val} kg` : `${val} kg`;
});

const deltaWeightClass = computed(() => {
  const d = weightDelta.value;
  if (d < 0) return 'text-emerald-600 dark:text-emerald-400';
  if (d > 0) return 'text-indigo-600 dark:text-indigo-400';
  return 'text-slate-500 dark:text-slate-400';
});
</script>
