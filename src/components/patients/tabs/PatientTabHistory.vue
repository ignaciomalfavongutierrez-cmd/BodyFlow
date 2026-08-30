<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
          <ClipboardList class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Historial Clínico & Preferencias Alimentarias
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Anamnesis completa, padecimientos y base de conocimiento para la adaptación de dietas con IA.
          </p>
        </div>
      </div>

      <button
        @click="handleSave"
        :disabled="isSaving"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 transition-all"
      >
        <Save v-if="!isSaving" class="w-4 h-4" />
        <Loader2 v-else class="w-4 h-4 animate-spin" />
        <span>{{ isSaving ? 'Guardando...' : 'Guardar Historial' }}</span>
      </button>
    </div>

    <!-- Success / Info banner -->
    <transition name="fade">
      <div v-if="saveSuccess" class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
        <CheckCircle class="w-4 h-4 text-emerald-500" />
        <span>¡Historial clínico actualizado correctamente en Firestore!</span>
      </div>
    </transition>

    <!-- SECTION 1: Antecedentes Patológicos & Alergias -->
    <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
      <div class="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm border-b border-slate-100 dark:border-white/5 pb-3">
        <AlertCircle class="w-4 h-4 text-amber-500" />
        <span>1. Antecedentes Médicos, Patológicos y Alergias</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Patologías -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Padecimientos y Antecedentes Patológicos
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="newPatologiaInput"
              @keydown.enter.prevent="addPatologia"
              type="text"
              placeholder="ej. Gastritis, Hipertensión, Hipotiroidismo, SOP..."
              class="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              @click="addPatologia"
              class="px-3 py-2 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30"
            >
              + Añadir
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-for="(pat, idx) in historyData.antecedentesPatologicos"
              :key="idx"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50"
            >
              <span>{{ pat }}</span>
              <button @click="historyData.antecedentesPatologicos?.splice(idx, 1)" class="hover:text-red-500 ml-1">✕</button>
            </span>
          </div>
        </div>

        <!-- Alergias e Intolerancias -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Alergias e Intolerancias Alimentarias
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="newAlergiaInput"
              @keydown.enter.prevent="addAlergia"
              type="text"
              placeholder="ej. Lactosa, Gluten, Mariscos, Nueces..."
              class="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              @click="addAlergia"
              class="px-3 py-2 bg-red-500/15 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold border border-red-500/30"
            >
              + Añadir
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-for="(alg, idx) in historyData.alergiasIntolerancias"
              :key="idx"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-700/50"
            >
              <span>🚫 {{ alg }}</span>
              <button @click="historyData.alergiasIntolerancias?.splice(idx, 1)" class="hover:text-red-500 ml-1">✕</button>
            </span>
          </div>
        </div>

        <!-- Antecedentes Heredofamiliares -->
        <div class="md:col-span-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Antecedentes Heredofamiliares
          </label>
          <input
            v-model="historyData.antecedentesHeredofamiliares"
            type="text"
            placeholder="ej. Madre con hipotiroidismo, padre con hipertensión y diabetes tipo 2..."
            class="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <!-- Medicamentos Actuales & Suplementación -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Medicamentos Actuales y Dosis
          </label>
          <textarea
            v-model="historyData.medicamentosActuales"
            rows="2"
            placeholder="ej. Omeprazol 20mg ayunas, Eutirox 75mcg..."
            class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Suplementación Actual
          </label>
          <textarea
            v-model="historyData.suplementacion"
            rows="2"
            placeholder="ej. Omega 3 (2g), Magnesio bisglicinato (300mg noche), Creatina 5g..."
            class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

      </div>
    </div>

    <!-- SECTION 2: Gustos, Aversiones & Preferencias para la IA -->
    <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
        <div class="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
          <Sparkles class="w-4 h-4 text-emerald-500" />
          <span>2. Preferencias Alimentarias & Perfil para el Generador de Dietas IA</span>
        </div>
        <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          IA Context
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Alimentos Favoritos / Gustos -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Alimentos Favoritos / Preferidos
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="newFavoritoInput"
              @keydown.enter.prevent="addFavorito"
              type="text"
              placeholder="ej. Salmón, Aguacate, Avena, Frutos rojos..."
              class="flex-1 px-3 py-2 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/40 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              @click="addFavorito"
              class="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              + Añadir
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-for="(fav, idx) in historyData.preferenciasAlimentarias?.gustosFavoritos"
              :key="idx"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/50"
            >
              <span>💚 {{ fav }}</span>
              <button @click="historyData.preferenciasAlimentarias?.gustosFavoritos?.splice(idx, 1)" class="hover:text-red-500 ml-1">✕</button>
            </span>
          </div>
        </div>

        <!-- Aversiones / Disgustos -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            Aversiones / Alimentos que NO le gustan
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="newAversionInput"
              @keydown.enter.prevent="addAversion"
              type="text"
              placeholder="ej. Hígado, Papaya, Cilantro, Brócoli cocido..."
              class="flex-1 px-3 py-2 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-700/40 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="button"
              @click="addAversion"
              class="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              + Añadir
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-for="(av, idx) in historyData.preferenciasAlimentarias?.aversionesDisgustos"
              :key="idx"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700/50"
            >
              <span>👎 {{ av }}</span>
              <button @click="historyData.preferenciasAlimentarias?.aversionesDisgustos?.splice(idx, 1)" class="hover:text-red-500 ml-1">✕</button>
            </span>
          </div>
        </div>

        <!-- Comidas al día, Agua y Restricciones -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:col-span-2">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Comidas al Día
            </label>
            <input
              v-model.number="historyData.preferenciasAlimentarias!.comidasAlDia"
              type="number"
              min="2"
              max="7"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Consumo de Agua (Litros/día)
            </label>
            <input
              v-model.number="historyData.preferenciasAlimentarias!.consumoAguaLitros"
              type="number"
              step="0.5"
              min="0.5"
              max="8"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Restricciones Especiales
            </label>
            <input
              v-model="historyData.preferenciasAlimentarias!.restriccionesEspeciales"
              type="text"
              placeholder="ej. Sin lácteos, Vegetariano..."
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <!-- Recordatorio de 24 horas -->
        <div class="md:col-span-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Recordatorio de 24 Horas (Alimentación habitual)
          </label>
          <textarea
            v-model="historyData.preferenciasAlimentarias!.recordatorio24h"
            rows="2"
            placeholder="Desayuno: Huevos con verduras y tortilla. Comida: Pollo con arroz y ensalada. Cena: Quesadillas..."
            class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          ></textarea>
        </div>

      </div>
    </div>

    <!-- SECTION 3: Estilo de Vida, Actividad Física y Síntomas Digestivos -->
    <div class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
      <div class="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm border-b border-slate-100 dark:border-white/5 pb-3">
        <HeartPulse class="w-4 h-4 text-indigo-500" />
        <span>3. Estilo de Vida, Actividad Física & Síntomas Digestivos</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Nivel de Actividad Física
          </label>
          <select
            v-model="historyData.estiloDeVida!.nivelActividad"
            class="w-full px-3 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          >
            <option value="sedentario" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Sedentario (Poco o ningún ejercicio)</option>
            <option value="ligero" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Ligero (1-3 días/semana)</option>
            <option value="moderado" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Moderado (3-5 días/semana)</option>
            <option value="intenso" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Intenso (6-7 días/semana)</option>
            <option value="muy_intenso" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Muy Intenso (Atleta de alto rendimiento)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Detalle del Entrenamiento / Deporte
          </label>
          <input
            v-model="historyData.estiloDeVida!.actividadFisicaDetalle"
            type="text"
            placeholder="ej. Gimnasio pesas 4 días/semana (50 min) + caminata 20 min"
            class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Horas de Sueño
            </label>
            <input
              v-model.number="historyData.estiloDeVida!.horasSueno"
              type="number"
              step="0.5"
              placeholder="7.5"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Nivel de Estrés
            </label>
            <select
              v-model="historyData.estiloDeVida!.nivelEstres"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="bajo" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Bajo</option>
              <option value="medio" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Medio</option>
              <option value="alto" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Alto</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Síntomas Digestivos Frecuentes
          </label>
          <input
            v-model="digestiveSymptomsString"
            type="text"
            placeholder="ej. Distensión abdominal por las tardes, Reflujo con café..."
            class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { 
  ClipboardList, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  HeartPulse, 
  Loader2 
} from 'lucide-vue-next';
import type { ClinicalHistory } from '../../../types/patient';
import { PatientsService } from '../../../services/patients/patients.service';

const props = defineProps<{
  patientId: string;
  initialHistory?: ClinicalHistory | null;
}>();

const emit = defineEmits<{
  (e: 'updated', history: ClinicalHistory): void;
}>();

const isSaving = ref(false);
const saveSuccess = ref(false);

const newPatologiaInput = ref('');
const newAlergiaInput = ref('');
const newFavoritoInput = ref('');
const newAversionInput = ref('');

const historyData = reactive<ClinicalHistory>({
  id: props.initialHistory?.id || 'main',
  antecedentesPatologicos: [...(props.initialHistory?.antecedentesPatologicos || [])],
  antecedentesHeredofamiliares: props.initialHistory?.antecedentesHeredofamiliares || '',
  medicamentosActuales: props.initialHistory?.medicamentosActuales || '',
  suplementacion: props.initialHistory?.suplementacion || '',
  alergiasIntolerancias: [...(props.initialHistory?.alergiasIntolerancias || [])],
  preferenciasAlimentarias: {
    gustosFavoritos: [...(props.initialHistory?.preferenciasAlimentarias?.gustosFavoritos || [])],
    aversionesDisgustos: [...(props.initialHistory?.preferenciasAlimentarias?.aversionesDisgustos || [])],
    recordatorio24h: props.initialHistory?.preferenciasAlimentarias?.recordatorio24h || '',
    comidasAlDia: props.initialHistory?.preferenciasAlimentarias?.comidasAlDia || 4,
    consumoAguaLitros: props.initialHistory?.preferenciasAlimentarias?.consumoAguaLitros || 2.5,
    restriccionesEspeciales: props.initialHistory?.preferenciasAlimentarias?.restriccionesEspeciales || ''
  },
  estiloDeVida: {
    nivelActividad: props.initialHistory?.estiloDeVida?.nivelActividad || 'moderado',
    actividadFisicaDetalle: props.initialHistory?.estiloDeVida?.actividadFisicaDetalle || '',
    horasSueno: props.initialHistory?.estiloDeVida?.horasSueno || 7.5,
    nivelEstres: props.initialHistory?.estiloDeVida?.nivelEstres || 'medio',
    consumoAlcoholTabaco: props.initialHistory?.estiloDeVida?.consumoAlcoholTabaco || ''
  },
  sintomasDigestivos: [...(props.initialHistory?.sintomasDigestivos || [])],
  observacionesGenerales: props.initialHistory?.observacionesGenerales || ''
});

const digestiveSymptomsString = computed({
  get: () => (historyData.sintomasDigestivos || []).join(', '),
  set: (val: string) => {
    historyData.sintomasDigestivos = val.split(',').map(s => s.trim()).filter(Boolean);
  }
});

function addPatologia() {
  if (newPatologiaInput.value.trim()) {
    if (!historyData.antecedentesPatologicos) historyData.antecedentesPatologicos = [];
    historyData.antecedentesPatologicos.push(newPatologiaInput.value.trim());
    newPatologiaInput.value = '';
  }
}

function addAlergia() {
  if (newAlergiaInput.value.trim()) {
    if (!historyData.alergiasIntolerancias) historyData.alergiasIntolerancias = [];
    historyData.alergiasIntolerancias.push(newAlergiaInput.value.trim());
    newAlergiaInput.value = '';
  }
}

function addFavorito() {
  if (newFavoritoInput.value.trim()) {
    if (!historyData.preferenciasAlimentarias?.gustosFavoritos) {
      historyData.preferenciasAlimentarias!.gustosFavoritos = [];
    }
    historyData.preferenciasAlimentarias!.gustosFavoritos.push(newFavoritoInput.value.trim());
    newFavoritoInput.value = '';
  }
}

function addAversion() {
  if (newAversionInput.value.trim()) {
    if (!historyData.preferenciasAlimentarias?.aversionesDisgustos) {
      historyData.preferenciasAlimentarias!.aversionesDisgustos = [];
    }
    historyData.preferenciasAlimentarias!.aversionesDisgustos.push(newAversionInput.value.trim());
    newAversionInput.value = '';
  }
}

async function handleSave() {
  isSaving.value = true;
  saveSuccess.value = false;
  try {
    await PatientsService.upsertClinicalHistory(props.patientId, historyData);
    saveSuccess.value = true;
    emit('updated', { ...historyData });
    setTimeout(() => {
      saveSuccess.value = false;
    }, 4000);
  } catch (err) {
    console.error('Error saving clinical history:', err);
  } finally {
    isSaving.value = false;
  }
}
</script>
