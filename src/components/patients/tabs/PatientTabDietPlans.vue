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
            Control de requerimientos calóricos, distribución de macros, diseño de menús y exportaciones clínicas.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="openCreatePlan"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>Asignar Plan</span>
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
        Asigna el primer plan con el motor inteligente basado en el historial clínico o define los requerimientos manualmente.
      </p>
      <button
        @click="openCreatePlan"
        class="px-4 py-2 btn-primary text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
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
        <div class="space-y-3.5">
          
          <!-- Top Row: Name, Date, Objective & Status Switcher -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Asignado: {{ plan.fechaAsignacion }}</span>
                <span 
                  v-if="plan.objetivo" 
                  @click="openEditPlan(plan)"
                  class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 cursor-pointer transition-colors"
                  title="Clic para cambiar objetivo clínico"
                >
                  🎯 {{ plan.objetivo }}
                </span>
                <span 
                  v-else
                  @click="openEditPlan(plan)"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-emerald-500/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
                  title="Clic para definir objetivo clínico"
                >
                  🎯 Sin objetivo definido
                </span>
                <!-- Calculation Source Tag -->
                <span 
                  v-if="plan.fuenteCalculo"
                  class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border"
                  :class="plan.fuenteCalculo === 'ajustado' 
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                    : (plan.fuenteCalculo === 'automatico' 
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30')"
                >
                  {{ plan.fuenteCalculo === 'ajustado' ? '✏️ Ajustado' : (plan.fuenteCalculo === 'automatico' ? '✓ Auto' : 'Manual') }}
                </span>
              </div>

              <h4 class="font-black text-slate-900 dark:text-white text-base mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ plan.nombre }}
              </h4>
            </div>

            <!-- Top Right: Edit Button & Status Switcher -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="openEditPlan(plan)"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-white/10 transition-all cursor-pointer text-[10px] font-extrabold uppercase shadow-2xs"
                title="Modificar requerimientos calóricos, macros y objetivo clínico"
              >
                <Edit2 class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Editar</span>
              </button>

              <div class="relative shrink-0">
                <select
                  :value="plan.status || 'activo'"
                  @change="onStatusChange(plan, ($event.target as HTMLSelectElement).value as any)"
                  class="appearance-none text-[10px] font-extrabold uppercase pl-2.5 pr-6 py-1 rounded-full border shadow-2xs cursor-pointer outline-none transition-all"
                  :class="getStatusClass(plan.status)"
                  title="Cambiar estatus del plan"
                >
                  <option value="activo" class="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white font-bold">Activo</option>
                  <option value="completado" class="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white font-bold">Completado</option>
                  <option value="archivado" class="bg-white dark:bg-[#18181b] text-slate-900 dark:text-white font-bold">Archivado</option>
                </select>
                <ChevronDown class="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
              </div>
            </div>
          </div>

          <!-- Calories & Macros Badges (Clickable to Edit) -->
          <div 
            @click="openEditPlan(plan)"
            class="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/[0.04] p-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-center cursor-pointer transition-all relative group/macros"
            title="Haz clic para modificar calorías y macronutrientes"
          >
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

            <!-- Subtle edit hint pill on hover -->
            <div class="absolute top-1 right-2 opacity-0 group-hover/macros:opacity-100 transition-opacity">
              <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-white dark:bg-[#18181b] px-1.5 py-0.5 rounded-md shadow-xs border border-emerald-500/30">
                <Edit2 class="w-2.5 h-2.5" />
                <span>Editar</span>
              </span>
            </div>
          </div>

          <!-- Menu Status Tag -->
          <div class="flex items-center justify-between text-xs px-1">
            <span v-if="plan.menu" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles class="w-3.5 h-3.5 text-emerald-500" />
              <span>Menú estructurado ({{ plan.menu.dias?.length || 1 }} día{{ (plan.menu.dias?.length || 1) > 1 ? 's' : '' }})</span>
            </span>
            <span v-else class="text-[11px] text-amber-600 dark:text-amber-400 italic">
              ⚠️ Menú aún no diseñado para este plan
            </span>

            <span v-if="plan.comidasSugeridas" class="text-[11px] text-slate-500 dark:text-slate-400">
              🍽️ {{ plan.comidasSugeridas }} comidas/día
            </span>
          </div>

          <!-- Audit Traceability Drawer (Cálculo original vs Ajuste) -->
          <div v-if="plan.calculoOriginal || plan.parametrosCalculo" class="text-xs">
            <button
              type="button"
              @click="toggleTraceability(plan.id)"
              class="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <History class="w-3 h-3" />
              <span>{{ expandedTraceability[plan.id] ? 'Ocultar trazabilidad clínica' : 'Ver trazabilidad y cálculo original' }}</span>
              <ChevronDown class="w-3 h-3 transition-transform" :class="{ 'rotate-180': expandedTraceability[plan.id] }" />
            </button>

            <!-- Expanded Audit Snapshot Panel -->
            <div 
              v-if="expandedTraceability[plan.id]" 
              class="mt-2.5 p-3 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-[11px] leading-relaxed"
            >
              <!-- Row 1: Original vs Final comparison -->
              <div v-if="plan.calculoOriginal" class="space-y-1">
                <p class="font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Comparativa de Ajuste:</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div class="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10">
                    <span class="text-slate-400 font-bold block text-[9px] uppercase">Cálculo Original:</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">
                      {{ plan.calculoOriginal.calorias }} kcal • {{ plan.calculoOriginal.macros.protein }}P / {{ plan.calculoOriginal.macros.carbs }}C / {{ plan.calculoOriginal.macros.fat }}G
                    </span>
                  </div>
                  <div class="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10">
                    <span class="text-emerald-600 dark:text-emerald-400 font-bold block text-[9px] uppercase">Resultado Final Autorizado:</span>
                    <span class="font-extrabold text-slate-900 dark:text-white">
                      {{ plan.calorias }} kcal • {{ plan.macros.protein }}P / {{ plan.macros.carbs }}C / {{ plan.macros.fat }}G
                    </span>
                  </div>
                </div>
              </div>

              <!-- Row 2: Parameters Snapshot -->
              <div v-if="plan.parametrosCalculo" class="pt-1 text-slate-600 dark:text-slate-400 space-y-0.5">
                <p>
                  <strong>Parámetros utilizados:</strong> 
                  {{ plan.parametrosCalculo.pesoUtilizado }} kg • 
                  {{ plan.parametrosCalculo.tallaUtilizada }} cm • 
                  {{ plan.parametrosCalculo.nivelActividadUtilizado }}
                  <span v-if="plan.parametrosCalculo.metodoTmb"> ({{ plan.parametrosCalculo.metodoTmb }})</span>
                </p>
                <p v-if="plan.parametrosCalculo.actividadFisicaDetalle">
                  <strong>Detalle de actividad:</strong> "{{ plan.parametrosCalculo.actividadFisicaDetalle }}"
                </p>
                <div v-if="plan.advertenciasClinicas && plan.advertenciasClinicas.length > 0" class="pt-1">
                  <span class="font-bold text-amber-600 dark:text-amber-400">Contexto clínico registrado:</span>
                  <ul class="list-disc pl-4 mt-0.5 text-amber-700 dark:text-amber-300">
                    <li v-for="(adv, i) in plan.advertenciasClinicas" :key="i">{{ adv }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <p v-if="plan.notas" class="text-xs text-slate-600 dark:text-slate-300 italic">
            "{{ plan.notas }}"
          </p>
        </div>

        <!-- Plan Bottom Actions Suite -->
        <div class="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
          
          <!-- Row 1: Primary Designer Action -->
          <div class="flex items-center gap-2">
            <button
              @click="$emit('openMenuDesigner', plan)"
              class="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Utensils class="w-4 h-4" />
              <span>{{ plan.menu ? 'Editar Menú de Comidas' : '🍽️ Diseñar Menú' }}</span>
            </button>

            <!-- WhatsApp Share Modal Trigger -->
            <button
              @click="openWhatsAppModal(plan)"
              class="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
              title="Compartir por WhatsApp"
            >
              <MessageSquare class="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>

          <!-- Row 2: Secondary Exports (Edit, PDF, Word, Shopping) -->
          <div class="flex items-center justify-between gap-2 pt-1">
            <div class="flex items-center gap-1.5">
              <button
                @click="openEditPlan(plan)"
                class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1"
                title="Modificar requerimientos calóricos, macros y objetivo"
              >
                <Edit2 class="w-3.5 h-3.5 text-emerald-600" />
                <span class="text-[11px]">Editar</span>
              </button>

              <button
                @click="exportPdf(plan)"
                class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1"
                title="Descargar PDF Oficial"
              >
                <FileText class="w-3.5 h-3.5 text-emerald-600" />
                <span class="text-[11px]">PDF</span>
              </button>

              <button
                @click="exportWord(plan)"
                class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1"
                title="Descargar Documento Word (.doc)"
              >
                <Download class="w-3.5 h-3.5 text-blue-600" />
                <span class="text-[11px]">Word</span>
              </button>
            </div>

            <button
              @click="$emit('openShoppingList')"
              class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ShoppingCart class="w-3.5 h-3.5" />
              <span>Lista de Compras →</span>
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- Modern Intelligent Modal for assigning/editing a diet plan -->
    <AssignDietPlanModal
      v-if="showCreatePlanModal"
      :patient="patient"
      :clinicalHistory="clinicalHistory"
      :measurements="measurements"
      :editingPlan="editingPlan"
      @close="handleCloseModal"
      @save="handleSavePlan"
      @goToHistory="handleGoToHistory"
    />

    <!-- WhatsApp Share Modal -->
    <WhatsAppShareModal
      v-if="selectedPlanForWhatsApp && selectedPlanForWhatsApp.menu"
      :patient="patient"
      :plan="selectedPlanForWhatsApp"
      :menu="selectedPlanForWhatsApp.menu"
      @close="selectedPlanForWhatsApp = null"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { 
  Utensils, 
  Plus, 
  ShoppingCart, 
  History, 
  ChevronDown, 
  MessageSquare, 
  FileText, 
  Download, 
  Sparkles,
  Edit2
} from 'lucide-vue-next';
import type { 
  Patient, 
  ClinicalHistory, 
  PatientMeasurement, 
  PatientDietPlan 
} from '../../../types/patient';
import type { DietPlanMenu } from '../../../types/dietMenu';
import { PatientsService } from '../../../services/patients/patients.service';
import { MenuExportService } from '../../../services/nutrition/MenuExportService';
import AssignDietPlanModal from '../modals/AssignDietPlanModal.vue';
import WhatsAppShareModal from '../modals/WhatsAppShareModal.vue';

const props = defineProps<{
  patient: Patient;
  clinicalHistory?: ClinicalHistory | null;
  measurements?: PatientMeasurement[];
  dietPlans?: PatientDietPlan[];
}>();

const emit = defineEmits<{
  (e: 'openShoppingList'): void;
  (e: 'openMenuDesigner', plan: PatientDietPlan): void;
  (e: 'refresh'): void;
  (e: 'goToHistory'): void;
}>();

const showCreatePlanModal = ref(false);
const editingPlan = ref<PatientDietPlan | null>(null);
const expandedTraceability = reactive<Record<string, boolean>>({});
const selectedPlanForWhatsApp = ref<PatientDietPlan | null>(null);

function openCreatePlan() {
  editingPlan.value = null;
  showCreatePlanModal.value = true;
}

function openEditPlan(plan: PatientDietPlan) {
  editingPlan.value = plan;
  showCreatePlanModal.value = true;
}

function handleCloseModal() {
  showCreatePlanModal.value = false;
  editingPlan.value = null;
}

function getStatusClass(status?: string) {
  switch (status) {
    case 'activo':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'completado':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'archivado':
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
}

async function onStatusChange(plan: PatientDietPlan, newStatus: 'activo' | 'completado' | 'archivado') {
  plan.status = newStatus;
  await PatientsService.updateDietPlanStatus(props.patient.id, plan.id, newStatus);
  emit('refresh');
}

function toggleTraceability(planId: string) {
  expandedTraceability[planId] = !expandedTraceability[planId];
}

async function handleSavePlan(planData: Omit<PatientDietPlan, 'id' | 'createdAt'> & { id?: string }) {
  await PatientsService.savePatientDietPlan(props.patient.id, planData);
  showCreatePlanModal.value = false;
  editingPlan.value = null;
  emit('refresh');
}

function handleGoToHistory() {
  showCreatePlanModal.value = false;
  editingPlan.value = null;
  emit('goToHistory');
}

function ensureFallbackMenu(plan: PatientDietPlan): DietPlanMenu {
  if (plan.menu) return plan.menu;
  return {
    planId: plan.id,
    tipoEstructura: 'dia_tipo',
    tiemposComida: ['desayuno', 'comida', 'cena'],
    updatedAt: new Date().toISOString(),
    dias: [
      {
        diaId: 'dia_tipo',
        diaNombre: 'Día Tipo Habitual',
        comidas: {
          desayuno: [
            {
              id: 'f_des',
              nombre: 'Huevos con Espinacas y Tortillas',
              categoria: 'desayuno',
              porcion: '2 huevos + 1 taza espinaca + 2 tortillas',
              macros: { calories: 340, protein: 18, carbs: 28, fat: 16 },
              ingredientes: ['2 pzas Huevo', '1 taza Espinaca fresca', '2 pzas Tortilla de maíz', '1 cdita Aceite de oliva']
            }
          ],
          colacion_1: [],
          comida: [
            {
              id: 'f_com',
              nombre: 'Pechuga Asada con Arroz y Ensalada Mixta',
              categoria: 'comida',
              porcion: '120g pechuga + 1/2 taza arroz + ensalada abundante',
              macros: { calories: 420, protein: 38, carbs: 42, fat: 10 },
              ingredientes: ['120g Pechuga de pollo', '1/2 taza Arroz cocido', '1 taza Lechuga', '1/2 pza Pepino', '1/2 pza Jitomate']
            }
          ],
          colacion_2: [],
          cena: [
            {
              id: 'f_cen',
              nombre: 'Ensalada Ligera de Atún en Agua',
              categoria: 'cena',
              porcion: '1 lata atún + verdura picada + 2 tostadas horneadas',
              macros: { calories: 290, protein: 28, carbs: 26, fat: 8 },
              ingredientes: ['1 lata Atún en agua', '1/3 pza Aguacate', '2 pzas Tostadas horneadas']
            }
          ],
          snack: []
        }
      }
    ]
  };
}

function openWhatsAppModal(plan: PatientDietPlan) {
  const planWithMenu = {
    ...plan,
    menu: ensureFallbackMenu(plan)
  };
  selectedPlanForWhatsApp.value = planWithMenu;
}

function exportPdf(plan: PatientDietPlan) {
  const menu = ensureFallbackMenu(plan);
  MenuExportService.exportMenuToPdf(props.patient, plan, menu);
}

function exportWord(plan: PatientDietPlan) {
  const menu = ensureFallbackMenu(plan);
  MenuExportService.exportMenuToWord(props.patient, plan, menu);
}
</script>
