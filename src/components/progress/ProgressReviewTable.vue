<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      <div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🔎</span>
          <h2 class="text-2xl font-extrabold text-slate-800 dark:text-white">Revisión de Medidas y Visitas</h2>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Confirma las mediciones antropométricas, selecciona los pliegues a sumar y define si el % de grasa se mostrará por fórmula o báscula.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center space-x-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-300">Sexo biológico:</label>
          <select
            :value="sex"
            @change="$emit('update:sex', ($event.target as HTMLSelectElement).value as BiologicalSex)"
            class="border border-slate-200 dark:border-white/15 rounded-lg px-2 py-1 text-xs bg-white dark:bg-[#201f22] text-slate-800 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="H">Hombre</option>
            <option value="M">Mujer</option>
          </select>
        </div>

        <button
          @click="onAddRow"
          class="px-3.5 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200 dark:border-white/10"
        >
          <span>＋ Añadir Visita</span>
        </button>
      </div>
    </div>

    <!-- Patient Name & Goals Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Patient Name -->
      <div class="bg-white dark:bg-[#18181b] p-4 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col justify-center space-y-1 shadow-xs transition-colors">
        <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nombre del Paciente</label>
        <input
          :value="patientName"
          @input="$emit('update:patientName', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Escribe el nombre del paciente..."
          class="w-full px-3 py-1.5 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <!-- Target Weight -->
      <div class="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/40 flex flex-col justify-center space-y-1 shadow-xs transition-colors">
        <label class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">🎯 Peso Meta (kg) <span class="font-normal text-slate-400 dark:text-slate-500">(Opcional)</span></label>
        <input
          :value="goals.metaPeso"
          @input="$emit('update:goals', { ...goals, metaPeso: ($event.target as HTMLInputElement).value })"
          type="number"
          step="0.1"
          placeholder="ej: 68.0"
          class="w-full px-3 py-1.5 border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-white/5 rounded-lg text-sm font-bold text-indigo-900 dark:text-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <!-- Target Body Fat -->
      <div class="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/40 flex flex-col justify-center space-y-1 shadow-xs transition-colors">
        <label class="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">🎯 % Grasa Meta <span class="font-normal text-slate-400 dark:text-slate-500">(Opcional)</span></label>
        <input
          :value="goals.metaGrasa"
          @input="$emit('update:goals', { ...goals, metaGrasa: ($event.target as HTMLInputElement).value })"
          type="number"
          step="0.1"
          placeholder="ej: 16.0"
          class="w-full px-3 py-1.5 border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-white/5 rounded-lg text-sm font-bold text-indigo-900 dark:text-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
    </div>

    <!-- Visits List -->
    <div class="space-y-4">
      <div
        v-for="(reg, i) in records"
        :key="reg.id || i"
        class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 transition-colors"
      >
        <!-- Top Row: General Data -->
        <div class="flex flex-wrap items-end gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
          <div class="flex-1 min-w-[150px]">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Fecha de Consulta</label>
            <input
              type="text"
              v-model="reg.Fecha"
              placeholder="ej: 15 de Enero 2026"
              class="w-full p-2 border rounded-lg text-xs font-bold text-slate-800 dark:text-white dark:bg-white/5 outline-none focus:ring-2 focus:ring-indigo-300"
              :class="!reg.Fecha ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/15'"
            />
          </div>

          <div class="w-20">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Edad</label>
            <input
              type="number"
              v-model="reg.Edad"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="Años"
            />
          </div>

          <div class="w-24">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Peso"
              @input="onRecordChange"
              class="w-full p-2 border rounded-lg text-xs font-bold text-slate-800 dark:text-white dark:bg-white/5 outline-none"
              :class="!reg.Peso ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/15'"
              placeholder="kg"
            />
          </div>

          <div class="w-24">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Talla (cm)</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Talla"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="w-20">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Cintura</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Cintura"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="w-24">
            <label class="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase block mb-1">Cadera/Pompa</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Cadera"
              @input="onRecordChange"
              class="w-full p-2 border border-purple-200 dark:border-purple-800/40 dark:bg-white/5 rounded-lg text-xs text-purple-900 dark:text-purple-200 font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="w-20">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Pecho</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Pecho"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="w-20">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Brazo</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Brazo"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="w-20">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Muslo</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Muslo"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="w-20">
            <label class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Pantorrilla</label>
            <input
              type="number"
              step="0.1"
              v-model="reg.Pantorrilla"
              @input="onRecordChange"
              class="w-full p-2 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs text-slate-800 dark:text-white font-bold outline-none"
              placeholder="cm"
            />
          </div>

          <div class="flex items-center gap-2 ml-auto">
            <span class="px-2.5 py-1.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-bold whitespace-nowrap border border-sky-200 dark:border-sky-800/40">
              IMC {{ reg.IMC || '—' }}
            </span>
            <span class="px-2.5 py-1.5 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-800 dark:text-fuchsia-300 text-xs font-bold whitespace-nowrap border border-fuchsia-200 dark:border-fuchsia-800/40">
              ICC {{ reg.ICC || '—' }}
            </span>
            <button
              @click="onDeleteRow(i)"
              class="text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-bold px-2.5 py-1.5 transition-colors"
              title="Eliminar visita"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Bottom Grid: Skinfolds + Fat / Muscle Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4">
          
          <!-- Skinfolds Block -->
          <div class="bg-slate-50/70 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">📏 Pliegues Cutáneos (mm)</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{{ countActiveSkinfolds(reg) }} pliegues incluidos</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label
                v-for="pl in SKIN_FOLD_CATALOG"
                :key="pl.key"
                class="flex flex-col gap-1 p-2 rounded-lg border cursor-pointer transition-all"
                :class="[
                  isSkinfoldActive(reg, pl.key)
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70'
                ]"
              >
                <span class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                  <input
                    type="checkbox"
                    :checked="isSkinfoldActive(reg, pl.key)"
                    @change="toggleSkinfold(reg, pl.key, ($event.target as HTMLInputElement).checked)"
                    class="h-3.5 w-3.5 text-indigo-600 rounded border-slate-300 dark:border-white/20"
                  />
                  <span>{{ pl.label }}</span>
                </span>
                <input
                  type="number"
                  step="0.1"
                  v-model="reg.Pliegues[pl.key]"
                  @input="onRecordChange"
                  class="w-full p-1 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded text-xs font-bold text-slate-800 dark:text-white outline-none"
                  :disabled="!isSkinfoldActive(reg, pl.key)"
                  placeholder="mm"
                />
              </label>
            </div>

            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-2">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Σ Pliegues:</label>
                <input
                  type="number"
                  step="0.1"
                  v-model="reg.Suma_Pliegues"
                  @input="reg.Suma_Manual = true; onRecordChange()"
                  class="w-20 p-1 border border-indigo-200 dark:border-indigo-800/60 rounded bg-white dark:bg-white/5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 outline-none"
                />
                <span class="text-[10px] text-slate-400 dark:text-slate-500">
                  {{ reg.Suma_Manual ? 'Editado manual' : 'Auto' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Body Fat / Muscle Block -->
          <div class="bg-slate-50/70 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-3.5 flex flex-col justify-between space-y-2">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">🔥 Composición Grasa & Músculo</span>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Báscula (%)</label>
                <input
                  type="number"
                  step="0.1"
                  v-model="reg.Grasa_Bascula"
                  @input="reg.Grasa_Fuente = 'bascula'; onRecordChange()"
                  class="w-full p-1.5 border border-amber-200 dark:border-amber-800/50 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 text-xs font-bold text-amber-900 dark:text-amber-300 outline-none"
                  placeholder="%"
                />
              </div>
              <div>
                <label class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Fórmula Pliegues (%)</label>
                <input
                  type="number"
                  step="0.1"
                  :value="reg.Grasa_Formula"
                  readonly
                  class="w-full p-1.5 border border-emerald-200 dark:border-emerald-800/50 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 text-xs font-bold text-emerald-900 dark:text-emerald-300 outline-none cursor-not-allowed"
                  placeholder="%"
                />
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <div class="flex-1 mr-2">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">Fuente a mostrar</label>
                <select
                  v-model="reg.Grasa_Fuente"
                  @change="onRecordChange"
                  class="w-full p-1.5 border border-slate-200 dark:border-white/15 rounded-lg bg-white dark:bg-[#201f22] text-xs font-semibold text-slate-800 dark:text-white outline-none"
                >
                  <option value="formula">Fórmula (Pliegues Durnin)</option>
                  <option value="bascula">Báscula (Bioimpedancia)</option>
                </select>
              </div>
              <div class="w-24">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">Músculo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  v-model="reg.Musculo_Kg"
                  @input="onRecordChange"
                  class="w-full p-1.5 border border-slate-200 dark:border-white/15 dark:bg-white/5 rounded-lg text-xs font-bold text-slate-800 dark:text-white outline-none"
                  placeholder="kg"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-[#18181b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
      <button
        @click="$emit('back')"
        class="px-4 py-2 border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
      >
        ← Volver a Cargar Archivo
      </button>

      <div class="flex items-center space-x-3">
        <button
          @click="exportExcel"
          class="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800/40 flex items-center space-x-1.5"
        >
          <span>📥 Descargar Excel Limpio</span>
        </button>
        <button
          @click="onConfirm"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
        >
          <span>⚡ Generar Gráficas y Métricas →</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClinicalRecord, BiologicalSex, PatientGoals, SkinfoldKey } from '../../types/patientProgress';
import { SKIN_FOLD_CATALOG } from '../../types/patientProgress';
import { ProgressCalculationService } from '../../services/progress/ProgressCalculationService';
import { ProgressFileParserService } from '../../services/progress/ProgressFileParserService';

const props = defineProps<{
  records: ClinicalRecord[];
  patientName: string;
  sex: BiologicalSex;
  goals: PatientGoals;
}>();

const emit = defineEmits<{
  (e: 'update:records', records: ClinicalRecord[]): void;
  (e: 'update:patientName', name: string): void;
  (e: 'update:sex', sex: BiologicalSex): void;
  (e: 'update:goals', goals: PatientGoals): void;
  (e: 'back'): void;
  (e: 'continue'): void;
}>();

function onRecordChange() {
  ProgressCalculationService.recalculateFormulas(props.records, props.sex);
  emit('update:records', [...props.records]);
}

function isSkinfoldActive(reg: ClinicalRecord, key: SkinfoldKey): boolean {
  return reg.Pliegues[key] !== null && reg.Pliegues[key] !== undefined;
}

function countActiveSkinfolds(reg: ClinicalRecord): number {
  if (!reg.Pliegues) return 0;
  return SKIN_FOLD_CATALOG.filter((item) => {
    const val = reg.Pliegues[item.key];
    return val !== null && val !== undefined && !isNaN(Number(val));
  }).length;
}

function toggleSkinfold(reg: ClinicalRecord, key: SkinfoldKey, checked: boolean) {
  if (!reg.Pliegues) {
    reg.Pliegues = { tricep: null, bicep: null, subescapular: null, cresta: null };
  }
  if (!checked) {
    reg.Pliegues[key] = null;
  } else {
    if (reg.Pliegues[key] === null || reg.Pliegues[key] === undefined) {
      reg.Pliegues[key] = 0;
    }
  }
  reg.Suma_Manual = false;
  onRecordChange();
}

function onAddRow() {
  const lastAge = props.records.length > 0 ? props.records[props.records.length - 1].Edad : '';
  const lastHeight = props.records.length > 0 ? props.records[props.records.length - 1].Talla : '';

  const newRec: ClinicalRecord = ProgressCalculationService.normalizeRecord({
    Fecha: '',
    Edad: lastAge,
    Peso: '',
    Talla: lastHeight,
    Cintura: '',
    Cadera: '',
    Pecho: '',
    Brazo: '',
    Muslo: '',
    Pantorrilla: '',
    Pliegues: { tricep: null, bicep: null, subescapular: null, cresta: null },
    Suma_Pliegues: '',
    Grasa_Bascula: '',
    Grasa_Formula: '',
    Grasa_Fuente: 'formula',
    Grasa_Porcentaje: null,
    Musculo_Kg: '',
    IMC: '',
    ICC: '',
  });

  emit('update:records', [...props.records, newRec]);
}

function onDeleteRow(index: number) {
  const next = [...props.records];
  next.splice(index, 1);
  emit('update:records', next);
}

function exportExcel() {
  ProgressFileParserService.exportToExcel(props.records, props.patientName);
}

function onConfirm() {
  const invalid = props.records.some((r) => !r.Fecha || !r.Peso);
  if (invalid) {
    alert('Por favor verifica que todas las visitas cuenten con fecha y peso válidos.');
    return;
  }
  onRecordChange();
  emit('continue');
}
</script>
