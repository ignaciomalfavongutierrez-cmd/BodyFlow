<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
          <Utensils class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
            Planes Nutricionales & Dietas Asignadas
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Control de requerimientos calóricos, distribución de macros y listas de compras vinculadas.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="showCreatePlanModal = true"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>+ Asignar Plan</span>
        </button>

        <button
          @click="$emit('openShoppingList')"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-300 dark:border-emerald-700/40 transition-all cursor-pointer"
        >
          <ShoppingCart class="w-4 h-4" />
          <span>Lista de Compras</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="!dietPlans || dietPlans.length === 0" 
      class="bg-white dark:bg-[#18181b] p-12 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-3"
    >
      <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold">
        🥗
      </div>
      <h4 class="text-base font-bold text-slate-900 dark:text-white">No hay planes nutricionales asignados</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Asigna el primer plan de alimentación personalizado o genera una lista de compras inteligente a partir de su menú.
      </p>
      <button
        @click="showCreatePlanModal = true"
        class="px-4 py-2 btn-primary text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Crear Nuevo Plan</span>
      </button>
    </div>

    <!-- Diet Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="plan in dietPlans"
        :key="plan.id"
        class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-5 hover:border-emerald-500/40 transition-all group"
      >
        
        <div class="space-y-3">
          
          <!-- Top Row: Name, Date & Status -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Asignado: {{ plan.fechaAsignacion }}</span>
              <h4 class="font-bold text-slate-900 dark:text-white text-base mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ plan.nombre }}
              </h4>
            </div>
            <span
              class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border shadow-2xs shrink-0"
              :class="plan.status === 'activo' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'"
            >
              {{ plan.status }}
            </span>
          </div>

          <!-- Calories & Macros Badges -->
          <div class="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
            <div>
              <p class="text-[9px] uppercase font-bold text-slate-400">Calorías</p>
              <p class="text-xs font-black text-slate-900 dark:text-white mt-0.5">{{ plan.calorias }} kcal</p>
            </div>
            <div>
              <p class="text-[9px] uppercase font-bold text-blue-500">Proteínas</p>
              <p class="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{{ plan.macros?.protein }}g</p>
            </div>
            <div>
              <p class="text-[9px] uppercase font-bold text-amber-500">Carbos</p>
              <p class="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{{ plan.macros?.carbs }}g</p>
            </div>
            <div>
              <p class="text-[9px] uppercase font-bold text-rose-500">Grasas</p>
              <p class="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{{ plan.macros?.fat }}g</p>
            </div>
          </div>

          <!-- Notes -->
          <p v-if="plan.notas" class="text-xs text-slate-600 dark:text-slate-300 italic">
            "{{ plan.notas }}"
          </p>
        </div>

        <!-- Plan Bottom Actions -->
        <div class="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
          <button
            @click="$emit('openShoppingList')"
            class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <ShoppingCart class="w-3.5 h-3.5" />
            <span>Generar Lista de Compras →</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Simple Modal for creating a new diet plan -->
    <div
      v-if="showCreatePlanModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div class="glass-card max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] transition-colors">
        <button
          @click="showCreatePlanModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl"
        >
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
          Asignar Nuevo Plan Nutricional
        </h3>

        <form @submit.prevent="handleCreatePlan" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Nombre del Plan *</label>
            <input
              v-model="newPlanForm.nombre"
              type="text"
              required
              placeholder="ej. Plan Hipocalórico 1,750 kcal Fase 2"
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Calorías (kcal)</label>
              <input
                v-model.number="newPlanForm.calorias"
                type="number"
                placeholder="1750"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Proteína (g)</label>
              <input
                v-model.number="newPlanForm.macros.protein"
                type="number"
                placeholder="130"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Carbohidratos (g)</label>
              <input
                v-model.number="newPlanForm.macros.carbs"
                type="number"
                placeholder="180"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Grasas (g)</label>
              <input
                v-model.number="newPlanForm.macros.fat"
                type="number"
                placeholder="55"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Notas del Plan</label>
            <textarea
              v-model="newPlanForm.notas"
              rows="2"
              placeholder="Indicaciones sobre horarios, hidratación o ciclado..."
              class="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            ></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-end gap-2">
            <button
              type="button"
              @click="showCreatePlanModal = false"
              class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md"
            >
              Guardar Plan
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Utensils, Plus, ShoppingCart, X } from 'lucide-vue-next';
import type { Patient, PatientDietPlan } from '../../../types/patient';
import { PatientsService } from '../../../services/patients/patients.service';

const props = defineProps<{
  patient: Patient;
  dietPlans?: PatientDietPlan[];
}>();

const emit = defineEmits<{
  (e: 'openShoppingList'): void;
  (e: 'refresh'): void;
}>();

const showCreatePlanModal = ref(false);

const newPlanForm = reactive({
  nombre: '',
  calorias: 1800,
  macros: {
    protein: 130,
    carbs: 180,
    fat: 55
  },
  status: 'activo' as const,
  notas: ''
});

async function handleCreatePlan() {
  if (!newPlanForm.nombre.trim()) return;
  await PatientsService.savePatientDietPlan(props.patient.id, {
    ...newPlanForm,
    fechaAsignacion: new Date().toISOString().split('T')[0]
  });
  showCreatePlanModal.value = false;
  emit('refresh');
}
</script>
