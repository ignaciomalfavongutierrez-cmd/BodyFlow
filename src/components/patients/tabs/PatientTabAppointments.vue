<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
          <Calendar class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Historial de Citas & Consultas Clínicas
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Registro cronológico de sesiones, notas de evolución del especialista (SOAP) y acuerdos.
          </p>
        </div>
      </div>

      <button
        @click="$emit('scheduleAppointment')"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
      >
        <CalendarPlus class="w-4 h-4" />
        <span>+ Agendar Consulta</span>
      </button>
    </div>

    <!-- Empty State -->
    <div 
      v-if="!appointments || appointments.length === 0" 
      class="bg-white dark:bg-[#18181b] p-12 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-3"
    >
      <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto text-2xl font-bold">
        🗓️
      </div>
      <h4 class="text-base font-bold text-slate-900 dark:text-white">No hay citas registradas</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Comienza agendando la primera consulta de seguimiento o de evaluación inicial para este paciente.
      </p>
      <button
        @click="$emit('scheduleAppointment')"
        class="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
      >
        <CalendarPlus class="w-3.5 h-3.5" />
        <span>Registrar Primera Cita</span>
      </button>
    </div>

    <!-- Timeline of Appointments -->
    <div v-else class="space-y-4">
      <div
        v-for="apt in sortedAppointments"
        :key="apt.id"
        class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-white/20 transition-all"
      >
        
        <!-- Top Row: Date, Type, Status & Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
          
          <div class="flex items-center gap-3">
            <div 
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
              :class="apt.status === 'programada' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'"
            >
              <Clock v-if="apt.status === 'programada'" class="w-5 h-5" />
              <CheckCircle2 v-else class="w-5 h-5" />
            </div>

            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-extrabold text-slate-900 dark:text-white text-sm">
                  {{ apt.fecha }} <span v-if="apt.hora" class="font-semibold text-slate-500">({{ apt.hora }})</span>
                </h4>
                <span 
                  class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-2xs"
                  :class="getStatusBadgeClass(apt.status)"
                >
                  {{ getStatusLabel(apt.status) }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 capitalize">
                Modalidad: {{ apt.tipo }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5">
            <button
              v-if="apt.status === 'programada'"
              @click="markCompleted(apt)"
              class="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 transition-all flex items-center gap-1"
              title="Marcar como Completada"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Completar</span>
            </button>

            <button
              @click="$emit('editAppointment', apt)"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Editar Cita"
            >
              <Edit3 class="w-4 h-4" />
            </button>

            <button
              @click="deleteApt(apt.id)"
              class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Eliminar Cita"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

        </div>

        <!-- Motivo -->
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Motivo de Consulta:</span>
          <p class="text-xs font-bold text-slate-800 dark:text-white mt-0.5">{{ apt.motivo }}</p>
        </div>

        <!-- Notas de Evolución SOAP -->
        <div v-if="apt.notasEvolucion" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
          <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <FileText class="w-3 h-3" />
            <span>Notas Clínicas del Especialista (SOAP):</span>
          </span>
          <p class="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
            {{ apt.notasEvolucion }}
          </p>
        </div>

        <!-- Acuerdos y Compromisos -->
        <div v-if="apt.acuerdosCompromisos" class="flex items-start gap-2 text-xs bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/30 text-amber-900 dark:text-amber-200">
          <span class="font-bold shrink-0">🤝 Acuerdos:</span>
          <span>{{ apt.acuerdosCompromisos }}</span>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Calendar, 
  CalendarPlus, 
  Clock, 
  CheckCircle2, 
  Check, 
  Edit3, 
  Trash2, 
  FileText 
} from 'lucide-vue-next';
import type { PatientAppointment, AppointmentStatus } from '../../../types/patient';
import { PatientsService } from '../../../services/patients/patients.service';

const props = defineProps<{
  patientId: string;
  appointments?: PatientAppointment[];
}>();

const emit = defineEmits<{
  (e: 'scheduleAppointment'): void;
  (e: 'editAppointment', apt: PatientAppointment): void;
  (e: 'refresh'): void;
}>();

const sortedAppointments = computed(() => {
  if (!props.appointments) return [];
  return [...props.appointments].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
});

function getStatusBadgeClass(status: AppointmentStatus) {
  switch (status) {
    case 'completada':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'programada':
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
    case 'cancelada':
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
    case 'no_asistio':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30';
  }
}

function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case 'completada': return 'Completada';
    case 'programada': return 'Programada';
    case 'cancelada': return 'Cancelada';
    case 'no_asistio': return 'No Asistió';
    default: return status;
  }
}

async function markCompleted(apt: PatientAppointment) {
  await PatientsService.updateAppointment(props.patientId, apt.id, { status: 'completada' });
  emit('refresh');
}

async function deleteApt(aptId: string) {
  if (confirm('¿Estás segura de eliminar esta cita del expediente?')) {
    await PatientsService.deleteAppointment(props.patientId, aptId);
    emit('refresh');
  }
}
</script>
