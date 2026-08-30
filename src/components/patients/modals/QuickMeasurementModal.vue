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
          <Activity class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-xl font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            {{ isEdit ? 'Editar Medición Antropométrica' : 'Registrar Nueva Medición' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ patientName ? `Paciente: ${patientName} (${sex === 'H' ? 'Hombre' : 'Mujer'})` : 'Registro clínico de composición corporal' }}
          </p>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Row 1: Fecha, Edad, Peso, Talla -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Fecha *
            </label>
            <input
              v-model="form.Fecha"
              type="text"
              required
              placeholder="ej. 06 de Mayo 2026"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Edad
            </label>
            <input
              v-model="form.Edad"
              type="number"
              placeholder="28"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Peso (kg) *
            </label>
            <input
              v-model="form.Peso"
              type="number"
              step="0.1"
              required
              placeholder="64.5"
              @input="recalculate"
              class="w-full px-3 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/40 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Talla (cm) *
            </label>
            <input
              v-model="form.Talla"
              type="number"
              step="0.5"
              required
              placeholder="165"
              @input="recalculate"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <!-- Row 2: Circunferencias Principales (Cintura, Cadera, Pecho, Brazo) -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Circunferencias (cm)
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Cintura</label>
              <input
                v-model="form.Cintura"
                type="number"
                step="0.1"
                placeholder="73.0"
                @input="recalculate"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Cadera / Pompa</label>
              <input
                v-model="form.Cadera"
                type="number"
                step="0.1"
                placeholder="102.0"
                @input="recalculate"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Pecho</label>
              <input
                v-model="form.Pecho"
                type="number"
                step="0.1"
                placeholder="93.0"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Brazo</label>
              <input
                v-model="form.Brazo"
                type="number"
                step="0.1"
                placeholder="29.0"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Row 3: Pliegues Cutáneos (mm) -->
        <div class="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/30 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Pliegues Cutáneos (mm) — Durnin & Womersley
            </p>
            <span class="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
              Suma: {{ sumPliegues }} mm
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Tríceps</label>
              <input
                v-model.number="form.Pliegues.tricep"
                type="number"
                step="0.5"
                placeholder="12.5"
                @input="recalculate"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Bíceps</label>
              <input
                v-model.number="form.Pliegues.bicep"
                type="number"
                step="0.5"
                placeholder="6.0"
                @input="recalculate"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Subescapular</label>
              <input
                v-model.number="form.Pliegues.subescapular"
                type="number"
                step="0.5"
                placeholder="12.0"
                @input="recalculate"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">Cresta Ilíaca</label>
              <input
                v-model.number="form.Pliegues.cresta"
                type="number"
                step="0.5"
                placeholder="14.5"
                @input="recalculate"
                class="w-full px-2.5 py-1.5 bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-800/40 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Row 4: Cálculos Automáticos (% Grasa, Músculo kg, IMC, ICC) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-300 dark:border-emerald-700/30 text-center">
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-500">% Grasa Fórmula</p>
            <p class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ form.Grasa_Formula || '--' }}%</p>
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-500">Masa Muscular</p>
            <p class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ form.Musculo_Kg || '--' }} kg</p>
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-500">IMC</p>
            <p class="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">{{ form.IMC || '--' }}</p>
          </div>
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-500">ICC (Cintura/Cad)</p>
            <p class="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">{{ form.ICC || '--' }}</p>
          </div>
        </div>

        <!-- Row 5: Notas de Consulta -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Notas de la Consulta
          </label>
          <input
            v-model="form.notasConsulta"
            type="text"
            placeholder="ej. Medición mensual de seguimiento en consultorio..."
            class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
            class="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-lg transition-all"
          >
            {{ isEdit ? 'Guardar Medición' : 'Registrar Medición' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { X, Activity } from 'lucide-vue-next';
import type { PatientMeasurement } from '../../../types/patient';
import type { BiologicalSex } from '../../../types/patientProgress';
import { ProgressCalculationService } from '../../../services/progress/ProgressCalculationService';

const props = defineProps<{
  patientName?: string;
  sex?: BiologicalSex;
  initialData?: PatientMeasurement | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', measurement: any): void;
}>();

const isEdit = computed(() => Boolean(props.initialData?.id));

const form = reactive({
  Fecha: props.initialData?.Fecha || new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()),
  Edad: props.initialData?.Edad || 28,
  Peso: props.initialData?.Peso || '',
  Talla: props.initialData?.Talla || '',
  Cintura: props.initialData?.Cintura || '',
  Cadera: props.initialData?.Cadera || '',
  Pecho: props.initialData?.Pecho || '',
  Brazo: props.initialData?.Brazo || '',
  Muslo: props.initialData?.Muslo || '',
  Pantorrilla: props.initialData?.Pantorrilla || '',
  Pliegues: {
    tricep: props.initialData?.Pliegues?.tricep ?? null,
    bicep: props.initialData?.Pliegues?.bicep ?? null,
    subescapular: props.initialData?.Pliegues?.subescapular ?? null,
    cresta: props.initialData?.Pliegues?.cresta ?? null
  },
  Suma_Pliegues: props.initialData?.Suma_Pliegues || '',
  Grasa_Bascula: props.initialData?.Grasa_Bascula || '',
  Grasa_Formula: props.initialData?.Grasa_Formula || '',
  Grasa_Fuente: props.initialData?.Grasa_Fuente || 'formula',
  Grasa_Porcentaje: props.initialData?.Grasa_Porcentaje || null,
  Musculo_Kg: props.initialData?.Musculo_Kg || '',
  IMC: props.initialData?.IMC || '',
  ICC: props.initialData?.ICC || '',
  notasConsulta: props.initialData?.notasConsulta || ''
});

const sumPliegues = computed(() => {
  const t = Number(form.Pliegues.tricep) || 0;
  const b = Number(form.Pliegues.bicep) || 0;
  const s = Number(form.Pliegues.subescapular) || 0;
  const c = Number(form.Pliegues.cresta) || 0;
  return Number((t + b + s + c).toFixed(1));
});

function recalculate() {
  const currentSex = props.sex || 'H';
  // Use ProgressCalculationService
  ProgressCalculationService.recalculateFormulas([form as any], currentSex);

  // Muscle Kg (Lean Mass)
  const weight = Number(form.Peso) || 0;
  const fatPct = Number(form.Grasa_Porcentaje || form.Grasa_Formula) || 0;
  if (weight > 0 && fatPct > 0) {
    const fatKg = (weight * fatPct) / 100;
    form.Musculo_Kg = Number((weight - fatKg).toFixed(1));
  }
}

onMounted(() => {
  if (props.initialData) {
    recalculate();
  }
});

function handleSubmit() {
  if (!form.Fecha || !form.Peso || !form.Talla) return;
  recalculate();
  emit('save', {
    ...form,
    id: props.initialData?.id
  });
}
</script>
