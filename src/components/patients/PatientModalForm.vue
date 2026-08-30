<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
    <div class="glass-card max-w-2xl w-full p-6 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] transition-colors">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
          <UserPlus v-if="!isEdit" class="w-6 h-6" />
          <UserCheck v-else class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            {{ isEdit ? 'Editar Expediente de Paciente' : 'Registrar Nuevo Paciente' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingresa los datos generales, objetivos y antecedentes clínicos prioritarios.
          </p>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Row 1: Nombre Completo & Sexo -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Nombre Completo *
            </label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="ej. Valeria Rivas Gómez"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Sexo Biológico *
            </label>
            <select
              v-model="form.sexo"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="M" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Mujer (Femenino)</option>
              <option value="H" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Hombre (Masculino)</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Edad / Fecha Nacimiento, Teléfono, Email -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Edad (Años)
            </label>
            <input
              v-model.number="form.edad"
              type="number"
              min="1"
              max="120"
              placeholder="ej. 28"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Teléfono (WhatsApp)
            </label>
            <input
              v-model="form.telefono"
              type="tel"
              placeholder="ej. 3541009737"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="ej. paciente@gmail.com"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <!-- Row 3: Objetivo Principal & Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Objetivo Nutricional Principal *
            </label>
            <select
              v-model="form.objetivoPrincipal"
              required
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="Pérdida de grasa" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Pérdida de grasa</option>
              <option value="Hipertrofia muscular" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Hipertrofia muscular</option>
              <option value="Recomposición corporal" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Recomposición corporal</option>
              <option value="Salud digestiva / clínica" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Salud digestiva / clínica</option>
              <option value="Rendimiento deportivo" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Rendimiento deportivo</option>
              <option value="Mantenimiento y hábitos" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Mantenimiento y hábitos</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Estatus del Paciente
            </label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="activo" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Activo (En tratamiento)</option>
              <option value="seguimiento" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Seguimiento</option>
              <option value="pausado" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Pausado</option>
              <option value="inactivo" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Inactivo</option>
            </select>
          </div>
        </div>

        <!-- Row 4: Alertas Médicas & Alergias (Interactive Tag List) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
            <span class="flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>Alertas Médicas / Alergias Críticas</span>
            </span>
            <span class="text-[10px] text-slate-400 font-normal">Presiona Enter o Añadir</span>
          </label>
          
          <div class="flex items-center gap-2">
            <input
              v-model="newAlertInput"
              @keydown.enter.prevent="addAlert"
              type="text"
              placeholder="ej. Gastritis, Alergia a Mariscos, Hipotiroidismo, Resistencia Insulina..."
              class="flex-1 px-3.5 py-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/40 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <button
              type="button"
              @click="addAlert"
              class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              + Agregar
            </button>
          </div>

          <!-- Active Alert Badges -->
          <div v-if="form.alertasMedicas.length > 0" class="flex flex-wrap gap-1.5 mt-2">
            <span
              v-for="(alert, idx) in form.alertasMedicas"
              :key="idx"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50"
            >
              <span>⚠️ {{ alert }}</span>
              <button
                type="button"
                @click="removeAlert(idx)"
                class="hover:text-red-500 font-black text-xs ml-0.5"
              >
                ✕
              </button>
            </span>
          </div>
        </div>

        <!-- Row 5: Metas Iniciales (Peso Meta & % Grasa Meta) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              🎯 Peso Meta (kg) (Opcional)
            </label>
            <input
              v-model="form.metas.metaPeso"
              type="number"
              step="0.1"
              placeholder="ej. 63.5"
              class="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              🎯 % Grasa Meta (Opcional)
            </label>
            <input
              v-model="form.metas.metaGrasa"
              type="number"
              step="0.1"
              placeholder="ej. 19.0"
              class="w-full px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- Row 6: Motivo de consulta / Notas Generales -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Motivo de Consulta / Notas Iniciales
          </label>
          <textarea
            v-model="form.motivoConsulta"
            rows="2"
            placeholder="Describe el motivo principal por el que acude el paciente..."
            class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
          ></textarea>
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
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-lg transition-all disabled:opacity-50"
          >
            {{ isSubmitting ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Registrar Paciente') }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { X, UserPlus, UserCheck, AlertTriangle } from 'lucide-vue-next';
import type { Patient, PatientStatus, BiologicalSex } from '../../types/patient';

const props = defineProps<{
  initialData?: Patient | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', patient: any): void;
}>();

const isEdit = computed(() => Boolean(props.initialData?.id));
const isSubmitting = ref(false);
const newAlertInput = ref('');

const form = reactive({
  nombre: '',
  sexo: 'M' as BiologicalSex,
  edad: '' as string | number,
  telefono: '',
  email: '',
  ocupacion: '',
  objetivoPrincipal: 'Pérdida de grasa',
  status: 'activo' as PatientStatus,
  alertasMedicas: [] as string[],
  metas: {
    metaPeso: '' as string | number,
    metaGrasa: '' as string | number,
    metaMusculo: '' as string | number,
    notas: ''
  },
  motivoConsulta: '',
  tags: ['Presencial'] as string[]
});

function initFormFromData(data?: Patient | null) {
  if (data) {
    form.nombre = data.nombre || '';
    form.sexo = (data.sexo || 'M') as BiologicalSex;
    form.edad = data.edad !== undefined && data.edad !== null ? data.edad : '';
    form.telefono = data.telefono || '';
    form.email = data.email || '';
    form.ocupacion = data.ocupacion || '';
    form.objetivoPrincipal = data.objetivoPrincipal || 'Pérdida de grasa';
    form.status = (data.status || 'activo') as PatientStatus;
    form.alertasMedicas = [...(data.alertasMedicas || [])];
    form.metas = {
      metaPeso: data.metas?.metaPeso !== undefined ? data.metas.metaPeso : '',
      metaGrasa: data.metas?.metaGrasa !== undefined ? data.metas.metaGrasa : '',
      metaMusculo: data.metas?.metaMusculo !== undefined ? data.metas.metaMusculo : '',
      notas: data.metas?.notas || ''
    };
    form.motivoConsulta = data.motivoConsulta || '';
    form.tags = [...(data.tags || ['Presencial'])];
  } else {
    form.nombre = '';
    form.sexo = 'M';
    form.edad = '';
    form.telefono = '';
    form.email = '';
    form.ocupacion = '';
    form.objetivoPrincipal = 'Pérdida de grasa';
    form.status = 'activo';
    form.alertasMedicas = [];
    form.metas = { metaPeso: '', metaGrasa: '', metaMusculo: '', notas: '' };
    form.motivoConsulta = '';
    form.tags = ['Presencial'];
  }
}

watch(
  () => props.initialData,
  (val) => {
    initFormFromData(val);
  },
  { immediate: true, deep: true }
);

function addAlert() {
  if (newAlertInput.value.trim()) {
    form.alertasMedicas.push(newAlertInput.value.trim());
    newAlertInput.value = '';
  }
}

function removeAlert(index: number) {
  form.alertasMedicas.splice(index, 1);
}

function handleSubmit() {
  if (!form.nombre.trim()) return;
  isSubmitting.value = true;
  emit('save', {
    ...form,
    edad: form.edad !== '' ? Number(form.edad) : '',
    id: props.initialData?.id
  });
}
</script>
