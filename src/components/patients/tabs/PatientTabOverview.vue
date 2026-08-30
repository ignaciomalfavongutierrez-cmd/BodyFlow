<template>
  <div class="space-y-6">
    
    <!-- Top Grid: 1. Goal Progress Card & 2. Next Appointment Highlight -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Card 1: Metas & Objetivo Clínico -->
      <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Target class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-extrabold text-slate-900 dark:text-white text-base" style="font-family: var(--font-display);">
                Meta & Objetivo Nutricional
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ patient.objetivoPrincipal || 'Sin objetivo asignado' }}</p>
            </div>
          </div>
          <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
            En Progreso
          </span>
        </div>

        <!-- Progress Bar for Target Weight -->
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-slate-600 dark:text-slate-300">Peso Actual: {{ currentWeight ? `${currentWeight} kg` : '--' }}</span>
            <span class="text-indigo-600 dark:text-indigo-400">Meta: {{ targetWeight ? `${targetWeight} kg` : 'Por definir' }}</span>
          </div>

          <div class="w-full bg-slate-100 dark:bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
            <div 
              class="h-full rounded-full transition-all duration-500" 
              :style="{ width: `${progressPercentage}%`, background: 'var(--kinetic-glow)' }"
            ></div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Inicio: {{ initialWeight ? `${initialWeight} kg` : '--' }}</span>
            <span>{{ progressPercentage }}% alcanzado</span>
            <span>Meta: {{ targetWeight ? `${targetWeight} kg` : '--' }}</span>
          </div>
        </div>

        <!-- Notes on goal -->
        <div v-if="patient.metas?.notas" class="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <span class="font-bold text-slate-800 dark:text-white">Indicación de Meta: </span>
          <span>{{ patient.metas.notas }}</span>
        </div>
      </div>

      <!-- Card 2: Próxima Cita & Estado de Consulta -->
      <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
        
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <Calendar class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 dark:text-white text-base" style="font-family: var(--font-display);">
                  Próxima Consulta
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Seguimiento en agenda</p>
              </div>
            </div>

            <button
              @click="$emit('goToAppointments')"
              class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Ver todas →
            </button>
          </div>

          <!-- Appointment Detail Box -->
          <div v-if="nextAppointment" class="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/30 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{{ nextAppointment.fecha }} • {{ nextAppointment.hora || 'Por confirmar' }}</span>
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                {{ nextAppointment.tipo }}
              </span>
            </div>
            <p class="text-xs font-bold text-slate-800 dark:text-white">{{ nextAppointment.motivo }}</p>
            <p v-if="nextAppointment.acuerdosCompromisos" class="text-[11px] text-slate-600 dark:text-slate-400">
              <strong>Compromiso:</strong> {{ nextAppointment.acuerdosCompromisos }}
            </p>
          </div>

          <div v-else class="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>No hay citas programadas próximamente.</span>
          </div>
        </div>

        <button
          @click="$emit('scheduleAppointment')"
          class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CalendarPlus class="w-4 h-4" />
          <span>{{ nextAppointment ? 'Reagendar o Nueva Cita' : 'Agendar Próxima Cita' }}</span>
        </button>

      </div>

    </div>

    <!-- Quick Action Shortcuts Grid (4 Fast Tools) -->
    <div class="space-y-3">
      <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Acciones Rápidas del Expediente
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Action 1: Nueva Medición -->
        <div
          @click="$emit('newMeasurement')"
          class="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all cursor-pointer group shadow-2xs"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Activity class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            Registrar Medición
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Captura peso, pliegues cutáneos y circunferencias.
          </p>
        </div>

        <!-- Action 2: Hoja Oficial de Recomendaciones -->
        <div
          @click="$emit('openRecommendations')"
          class="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-[#7e9455] transition-all cursor-pointer group shadow-2xs"
        >
          <div class="w-10 h-10 rounded-xl bg-[#7e9455]/15 text-[#556637] dark:text-[#9eb07a] border border-[#7e9455]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#556637] dark:group-hover:text-[#9eb07a] transition-colors">
            Hoja de Recomendaciones
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Ficha oficial con padecimientos y descarga PDF.
          </p>
        </div>

        <!-- Action 3: Ver Gráficas y Evolución -->
        <div
          @click="$emit('goToMeasurements')"
          class="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BarChart3 class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Gráficas y Reporte
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Visualiza analítica de avances y composición corporal.
          </p>
        </div>

        <!-- Action 4: Historial Clínico Completo -->
        <div
          @click="$emit('goToHistory')"
          class="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group shadow-2xs"
        >
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ClipboardList class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 dark:text-white text-xs group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            Historial & Gustos IA
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Anamnesis, aversiones y preferencias para la dieta.
          </p>
        </div>

      </div>
    </div>

    <!-- Recent Measurements Mini Summary Table -->
    <div v-if="measurements && measurements.length > 0" class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-extrabold text-slate-900 dark:text-white text-base" style="font-family: var(--font-display);">
            Historial Rápido de Mediciones
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Últimas visitas registradas</p>
        </div>
        <button
          @click="$emit('goToMeasurements')"
          class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Ver Dashboard Completo →
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-white/5 text-[10px] uppercase font-bold text-slate-400">
              <th class="py-2.5 px-3">Fecha</th>
              <th class="py-2.5 px-3">Peso (kg)</th>
              <th class="py-2.5 px-3">Cintura (cm)</th>
              <th class="py-2.5 px-3">Cadera (cm)</th>
              <th class="py-2.5 px-3">% Grasa</th>
              <th class="py-2.5 px-3">Músculo (kg)</th>
              <th class="py-2.5 px-3">IMC</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300 font-semibold">
            <tr 
              v-for="(m, idx) in recentMeasurements" 
              :key="m.id || idx"
              class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{{ m.Fecha }}</td>
              <td class="py-2.5 px-3">{{ m.Peso }} kg</td>
              <td class="py-2.5 px-3">{{ m.Cintura || '--' }} cm</td>
              <td class="py-2.5 px-3">{{ m.Cadera || '--' }} cm</td>
              <td class="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                {{ m.Grasa_Porcentaje || m.Grasa_Formula || '--' }}%
              </td>
              <td class="py-2.5 px-3">{{ m.Musculo_Kg || '--' }} kg</td>
              <td class="py-2.5 px-3">{{ m.IMC || '--' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Target, 
  Calendar, 
  Clock, 
  CalendarPlus, 
  Activity, 
  FileText, 
  BarChart3, 
  ClipboardList 
} from 'lucide-vue-next';
import type { Patient, PatientMeasurement, PatientAppointment } from '../../../types/patient';

const props = defineProps<{
  patient: Patient;
  measurements?: PatientMeasurement[];
  appointments?: PatientAppointment[];
}>();

defineEmits<{
  (e: 'newMeasurement'): void;
  (e: 'scheduleAppointment'): void;
  (e: 'openRecommendations'): void;
  (e: 'goToAppointments'): void;
  (e: 'goToMeasurements'): void;
  (e: 'goToHistory'): void;
}>();

const nextAppointment = computed(() => {
  if (!props.appointments || props.appointments.length === 0) return null;
  return props.appointments.find(a => a.status === 'programada') || null;
});

const initialWeight = computed(() => {
  if (!props.measurements || props.measurements.length === 0) return null;
  return Number(props.measurements[0].Peso) || null;
});

const currentWeight = computed(() => {
  if (!props.measurements || props.measurements.length === 0) return null;
  const last = props.measurements[props.measurements.length - 1];
  return Number(last.Peso) || null;
});

const targetWeight = computed(() => {
  return Number(props.patient.metas?.metaPeso) || null;
});

const progressPercentage = computed(() => {
  if (!initialWeight.value || !currentWeight.value || !targetWeight.value) return 50;
  const totalDiff = initialWeight.value - targetWeight.value;
  if (totalDiff === 0) return 100;
  const currentDiff = initialWeight.value - currentWeight.value;
  const pct = Math.min(Math.max(Math.round((currentDiff / totalDiff) * 100), 0), 100);
  return pct;
});

const recentMeasurements = computed(() => {
  if (!props.measurements) return [];
  return [...props.measurements].slice(-5).reverse();
});
</script>
