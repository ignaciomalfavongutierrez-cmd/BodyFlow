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
        v-for="plan in sortedDietPlans"
        :key="plan.id"
        class="bg-white dark:bg-[#18181b] p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 transition-all group"
        :class="plan.status === 'activo' ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/40'"
      >
        <div class="space-y-3.5">
          
          <!-- Top Row: Name, Date, Objective & Status Switcher -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span 
                  v-if="plan.status === 'activo'" 
                  class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs tracking-wider flex items-center gap-1"
                >
                  <span>✓</span>
                  <span>Plan Activo</span>
                </span>
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

          <!-- Row 2: Secondary Exports (Edit, Previsualizar, PDF, Word, Shopping) -->
          <div class="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                @click="openEditPlan(plan)"
                class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1"
                title="Modificar requerimientos calóricos, macros y objetivo"
              >
                <Edit2 class="w-3.5 h-3.5 text-emerald-600" />
                <span class="text-[11px]">Editar</span>
              </button>

              <button
                @click="openPreviewModal(plan)"
                class="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Previsualizar cómo se verá el documento membretado oficial"
              >
                <Eye class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span class="text-[11px]">Previsualizar</span>
              </button>

              <button
                @click="exportPdf(plan)"
                :disabled="isExportingPdf"
                class="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
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

    <!-- Live Clinical Sheet Preview Modal -->
    <div
      v-if="showPreviewModal && previewPlan"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden"
      @click.self="closePreviewModal"
    >
      <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/20 rounded-3xl shadow-2xl flex flex-col w-full max-w-[1340px] h-[94vh] overflow-hidden text-slate-900 dark:text-white transition-all">
        
        <!-- Header Bar -->
        <div class="p-4 sm:px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-white/5">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Eye class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-black text-slate-900 dark:text-white truncate" style="font-family: var(--font-display);">
                  Previsualización de Menú Membretado Oficial
                </h3>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  {{ previewPlan.calorias }} kcal • {{ previewPlan.comidasSugeridas || 5 }} comidas/día
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                Documento clínico para <strong>{{ patient.nombre }}</strong> • {{ previewPlan.nombre }}
              </p>
            </div>
          </div>

          <!-- Controls: Zoom & Direct Exports & Close -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Zoom Controls Group -->
            <div class="hidden sm:flex items-center gap-1 bg-white dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-2xs">
              <button
                @click="zoomOut"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Alejar (-)"
              >
                <ZoomOut class="w-3.5 h-3.5" />
              </button>
              <button
                @click="resetZoom(previewZoom === 1.0 ? 0.75 : 1.0)"
                class="px-2 py-1 text-[11px] font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Alternar escala"
              >
                {{ Math.round(previewZoom * 100) }}%
              </button>
              <button
                @click="zoomIn"
                class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Acercar (+)"
              >
                <ZoomIn class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Export Buttons -->
            <button
              @click="exportPdfFromPreview"
              :disabled="isExportingPdf"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
              title="Descargar PDF Oficial"
            >
              <FileText class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ isExportingPdf ? 'Generando...' : 'Descargar PDF' }}</span>
              <span class="sm:hidden">PDF</span>
            </button>

            <button
              @click="exportWordFromPreview"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              title="Descargar Word (.doc)"
            >
              <Download class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Word</span>
            </button>

            <!-- Close Button -->
            <button
              @click="closePreviewModal"
              class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer ml-1"
              title="Cerrar vista previa"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Scrollable Document Viewport with live scaling -->
        <div class="flex-1 overflow-auto p-2 sm:p-6 bg-slate-200/80 dark:bg-[#0c0c0e] flex justify-center items-start scrollbar-thin">
          <div 
            class="w-full max-w-[1200px] shadow-2xl rounded-2xl overflow-hidden bg-white transition-all"
            :style="previewZoom !== 1.0 ? { transform: `scale(${previewZoom})`, transformOrigin: 'top center' } : {}"
          >
            <!-- Injected HTML representation of the clinical sheet -->
            <div v-html="previewHtml" />
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
import { ref, reactive, computed } from 'vue';
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
  Edit2,
  Eye,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-vue-next';
import type { 
  Patient, 
  ClinicalHistory, 
  PatientMeasurement, 
  PatientDietPlan 
} from '../../../types/patient';
import type { DietPlanMenu, DishItem } from '../../../types/dietMenu';
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

// Ordenamiento inteligente: plan ACTIVO siempre al principio, luego más recientes
const sortedDietPlans = computed(() => {
  if (!props.dietPlans || props.dietPlans.length === 0) return [];
  return [...props.dietPlans].sort((a, b) => {
    // 1. Activo primero
    if (a.status === 'activo' && b.status !== 'activo') return -1;
    if (a.status !== 'activo' && b.status === 'activo') return 1;
    // 2. Más reciente primero
    const dateA = new Date(a.fechaAsignacion || a.createdAt || 0).getTime();
    const dateB = new Date(b.fechaAsignacion || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
});

const showCreatePlanModal = ref(false);
const editingPlan = ref<PatientDietPlan | null>(null);
const expandedTraceability = reactive<Record<string, boolean>>({});
const selectedPlanForWhatsApp = ref<PatientDietPlan | null>(null);

// Estado de Previsualización en Vivo
const showPreviewModal = ref(false);
const previewPlan = ref<PatientDietPlan | null>(null);
const previewHtml = ref('');
const previewZoom = ref(0.85); // 85% para visualización cómoda en pantallas estándar

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

/**
 * Genera un menú dinámico respetando el número de comidas sugeridas asignadas (3, 4 o 5 comidas)
 */
function ensureFallbackMenu(plan: PatientDietPlan): DietPlanMenu {
  if (plan.menu) return plan.menu;

  const targetMealsCount = plan.comidasSugeridas || 5;

  const mealDishes: Record<string, DishItem[]> = {
    desayuno: [
      {
        id: 'f_des',
        nombre: 'Huevos con Espinacas y Tortillas de Maíz',
        categoria: 'desayuno',
        porcion: '2 huevos + 1 taza espinaca + 2 tortillas',
        macros: { calories: 340, protein: 18, carbs: 28, fat: 16 },
        ingredientes: ['2 pzas Huevo entero', '1 taza Espinaca fresca', '2 pzas Tortilla de maíz', '1 cdita Aceite de oliva']
      }
    ],
    comida: [
      {
        id: 'f_com',
        nombre: 'Pechuga Asada con Arroz Jazmín y Ensalada Fresca',
        categoria: 'comida',
        porcion: '140g pechuga + 1/2 taza arroz + ensalada abundante',
        macros: { calories: 430, protein: 40, carbs: 42, fat: 10 },
        ingredientes: ['140g Pechuga de pollo', '1/2 taza Arroz cocido', '1.5 tazas Lechuga mixta', '1/2 pza Pepino', '1/2 pza Jitomate']
      }
    ],
    cena: [
      {
        id: 'f_cen',
        nombre: 'Filete de Pescado o Atún con Aguacate y Tostadas',
        categoria: 'cena',
        porcion: '1 lata atún / 130g pescado + 1/3 aguacate + 2 tostadas',
        macros: { calories: 310, protein: 30, carbs: 24, fat: 9 },
        ingredientes: ['1 lata Atún en agua o pescado blanco', '1/3 pza Aguacate', '2 pzas Tostadas horneadas', 'Verduras al gusto']
      }
    ]
  };

  const activeKeys = ['desayuno', 'comida', 'cena'];

  if (targetMealsCount >= 4) {
    activeKeys.splice(1, 0, 'colacion_1');
    mealDishes.colacion_1 = [
      {
        id: 'f_col1',
        nombre: 'Yogur Griego con Manzana y Canela',
        categoria: 'colacion_1',
        porcion: '3/4 taza yogur + 1 manzana',
        macros: { calories: 170, protein: 14, carbs: 22, fat: 2 },
        ingredientes: ['3/4 taza Yogur griego natural sin azúcar', '1 pza Manzana verde picada', 'Pizca de Canela']
      }
    ];
  }

  if (targetMealsCount >= 5) {
    const cenaIndex = activeKeys.indexOf('cena');
    activeKeys.splice(cenaIndex, 0, 'colacion_2');
    mealDishes.colacion_2 = [
      {
        id: 'f_col2',
        nombre: 'Puñado de Almendras y Frutos Rojos',
        categoria: 'colacion_2',
        porcion: '12 almendras + 1/2 taza frutos rojos',
        macros: { calories: 150, protein: 5, carbs: 14, fat: 9 },
        ingredientes: ['12 pzas Almendras naturales', '1/2 taza Frutos rojos frescos']
      }
    ];
  }

  return {
    planId: plan.id,
    tipoEstructura: 'dia_tipo',
    tiemposComida: activeKeys,
    updatedAt: new Date().toISOString(),
    dias: [
      {
        diaId: 'dia_tipo',
        diaNombre: 'Día Tipo Habitual',
        comidas: mealDishes
      }
    ]
  };
}

// Previsualización interactiva
function openPreviewModal(plan: PatientDietPlan) {
  previewPlan.value = plan;
  const menu = ensureFallbackMenu(plan);
  previewHtml.value = MenuExportService.generateClinicalMenuHtml(props.patient, plan, menu, { isForPreview: true });
  previewZoom.value = 1.0;
  showPreviewModal.value = true;
}

function closePreviewModal() {
  showPreviewModal.value = false;
  previewPlan.value = null;
  previewHtml.value = '';
}

function zoomIn() {
  previewZoom.value = Math.min(1.4, Math.round((previewZoom.value + 0.1) * 10) / 10);
}

function zoomOut() {
  previewZoom.value = Math.max(0.45, Math.round((previewZoom.value - 0.1) * 10) / 10);
}

function resetZoom(level = 1.0) {
  previewZoom.value = level;
}

async function exportPdfFromPreview() {
  if (!previewPlan.value) return;
  await exportPdf(previewPlan.value);
}

function exportWordFromPreview() {
  if (!previewPlan.value) return;
  exportWord(previewPlan.value);
}

function openWhatsAppModal(plan: PatientDietPlan) {
  const planWithMenu = {
    ...plan,
    menu: ensureFallbackMenu(plan)
  };
  selectedPlanForWhatsApp.value = planWithMenu;
}

const isExportingPdf = ref(false);

async function exportPdf(plan: PatientDietPlan) {
  try {
    isExportingPdf.value = true;
    const menu = ensureFallbackMenu(plan);
    await MenuExportService.exportMenuToPdf(props.patient, plan, menu);
  } finally {
    isExportingPdf.value = false;
  }
}

function exportWord(plan: PatientDietPlan) {
  const menu = ensureFallbackMenu(plan);
  MenuExportService.exportMenuToWord(props.patient, plan, menu);
}
</script>
