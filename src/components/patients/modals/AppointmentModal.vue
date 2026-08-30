<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
    <div class="glass-card max-w-xl w-full p-6 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] transition-colors">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
        <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
          <Calendar class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            {{ isEdit ? 'Editar Consulta / Cita' : 'Registrar / Agendar Nueva Consulta' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ patientName ? `Paciente: ${patientName}` : 'Detalles de la sesión clínica' }}
          </p>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Row 1: Fecha, Hora & Tipo -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Fecha *
            </label>
            <input
              v-model="form.fecha"
              type="date"
              required
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Hora
            </label>
            <input
              v-model="form.hora"
              type="time"
              placeholder="10:00"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Tipo de Cita
            </label>
            <select
              v-model="form.tipo"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="seguimiento" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Seguimiento</option>
              <option value="primera_vez" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Primera Vez</option>
              <option value="revision_plan" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Revisión de Plan</option>
              <option value="online" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Online / Virtual</option>
              <option value="presencial" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Presencial</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Status & Motivo -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Estatus
            </label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="programada" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Programada</option>
              <option value="completada" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Completada</option>
              <option value="cancelada" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Cancelada</option>
              <option value="no_asistio" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">No Asistió</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Motivo de Consulta *
            </label>
            <input
              v-model="form.motivo"
              type="text"
              required
              placeholder="ej. Control antropométrico mensual y ajuste calórico"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <!-- Row 3: SOAP Evolution Notes -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <FileText class="w-3.5 h-3.5 text-indigo-500" />
              <span>Notas de Evolución Clínica (SOAP / Observaciones)</span>
            </span>
            <span class="text-[10px] text-slate-400 font-normal">Subjetivo, Objetivo, Análisis, Plan</span>
          </label>
          <textarea
            v-model="form.notasEvolucion"
            rows="4"
            placeholder="S: Paciente refiere buena energía y digestión ligera...&#10;O: Peso 64.8kg (-2.0kg), Cintura 73cm...&#10;A: Adherencia del 95% al plan...&#10;P: Mantener fase de definición 1,750 kcal..."
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-mono"
          ></textarea>
        </div>

        <!-- Row 4: Acuerdos & Compromisos -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Acuerdos y Compromisos del Paciente
          </label>
          <input
            v-model="form.acuerdosCompromisos"
            type="text"
            placeholder="ej. Incrementar consumo de agua a 2.5L y mantener magnesio nocturno"
            class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <!-- Footer Action Buttons -->
        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg transition-all"
          >
            {{ isEdit ? 'Guardar Consulta' : 'Registrar Consulta' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { X, Calendar, FileText } from 'lucide-vue-next';
import type { PatientAppointment, AppointmentStatus, AppointmentType } from '../../../types/patient';

const props = defineProps<{
  patientName?: string;
  initialData?: PatientAppointment | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', appointment: any): void;
}>();

const isEdit = computed(() => Boolean(props.initialData?.id));

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  fecha: props.initialData?.fecha || today,
  hora: props.initialData?.hora || '10:00',
  tipo: (props.initialData?.tipo || 'seguimiento') as AppointmentType,
  motivo: props.initialData?.motivo || '',
  status: (props.initialData?.status || 'programada') as AppointmentStatus,
  notasEvolucion: props.initialData?.notasEvolucion || '',
  acuerdosCompromisos: props.initialData?.acuerdosCompromisos || '',
  proximaCitaSugerida: props.initialData?.proximaCitaSugerida || ''
});

function handleSubmit() {
  if (!form.fecha || !form.motivo.trim()) return;
  emit('save', {
    ...form,
    id: props.initialData?.id
  });
}
</script>
