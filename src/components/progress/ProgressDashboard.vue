<template>
  <div class="max-w-6xl mx-auto space-y-5">
    <!-- Action Bar (Hidden on print) -->
    <div class="bg-white dark:bg-[#18181b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print transition-colors">
      <div class="flex items-center space-x-3">
        <span class="text-xl">📈</span>
        <div>
          <h2 class="text-base font-extrabold text-slate-800 dark:text-white">Panel de Evolución Nutricional</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Gráficas clínicas y análisis antropométrico comparativo</p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="$emit('edit')"
          class="px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center space-x-1.5 cursor-pointer"
        >
          <span>✏️ Editar Datos</span>
        </button>
        <button
          @click="exportExcel"
          class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800/40 flex items-center space-x-1.5 cursor-pointer"
        >
          <span>📥 Excel Limpio</span>
        </button>
        <button
          @click="triggerPrint"
          class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <span>🖨️ Imprimir Reporte (2 Págs)</span>
        </button>
        <button
          @click="$emit('newPatient')"
          class="px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <span>🔄 Nuevo</span>
        </button>
      </div>
    </div>

    <!-- Chart Visibility & Filters Toolbar (Hidden on print) -->
    <div class="bg-white dark:bg-[#18181b] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print transition-colors">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase tracking-wider">📊 Gráficas a Incluir:</span>
        <button
          v-for="item in CHART_VISIBILITY_CATALOG"
          :key="item.key"
          @click="toggleChartVisibility(item.key)"
          class="px-2.5 py-1 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none"
          :class="[
            visibleCharts[item.key]
              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
          ]"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.shortLabel }}</span>
          <span class="text-[10px] ml-0.5">{{ visibleCharts[item.key] ? '✓' : '+' }}</span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[11px] text-slate-400 dark:text-slate-500">💡 Oculta gráficas para ajustar el grid a tu gusto</span>
      </div>
    </div>

    <!-- Printable Report Container -->
    <div id="progress-report" class="space-y-5 print-container">
      
      <!-- PAGE 1 SECTION -->
      <div class="print-page-1 flex flex-col justify-between">
        
        <div class="print-page-content space-y-3.5">
          <!-- BLOCK 1: Patient Header & Metric Cards (Arriba Cards) -->
          <div class="space-y-2.5 print-block-top">
            <!-- Patient Clinical Header Card -->
            <div class="bg-white dark:bg-[#18181b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 print-card transition-colors">
              <div>
                <div class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 print:!text-indigo-700 uppercase tracking-widest mb-0.5">
                  REPORTE DE SEGUIMIENTO NUTRICIONAL & ANTROPOMÉTRICO
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white print:!text-slate-900 tracking-tight">
                  {{ patientName || 'Paciente' }}
                </h1>
                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 print:!text-slate-600 mt-0.5">
                  <span>Sexo: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ sex === 'H' ? 'Hombre' : 'Mujer' }}</strong></span>
                  <span>•</span>
                  <span v-if="records.length">Periodo: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ records[0].Fecha }}</strong> al <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ records[records.length - 1].Fecha }}</strong></span>
                </div>
              </div>

              <div class="text-right text-xs text-slate-500 dark:text-slate-400 print:!text-slate-600 font-mono">
                <div>Evaluaciones: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ records.length }}</strong></div>
                <div>Fecha: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ currentDate }}</strong></div>
              </div>
            </div>

            <!-- Distinct Metric Summary Cards (5 Color Accents) -->
            <div v-if="summaryMetrics.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 print-card-grid">
              <div
                v-for="m in summaryMetrics"
                :key="m.label"
                class="metric-box bg-white dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-white/10 p-2.5 shadow-sm transition-colors"
                :class="[
                  m.theme === 'indigo' ? 'border-l-4 border-l-indigo-500' :
                  m.theme === 'rose' ? 'border-l-4 border-l-rose-500' :
                  m.theme === 'emerald' ? 'border-l-4 border-l-emerald-500' :
                  m.theme === 'sky' ? 'border-l-4 border-l-sky-500' :
                  'border-l-4 border-l-fuchsia-500'
                ]"
              >
                <div class="flex items-center justify-between gap-1">
                  <span
                    class="text-[9px] font-bold uppercase tracking-wide"
                    :class="[
                      m.theme === 'indigo' ? 'text-indigo-600 dark:text-indigo-400 print:!text-indigo-700' :
                      m.theme === 'rose' ? 'text-rose-600 dark:text-rose-400 print:!text-rose-700' :
                      m.theme === 'emerald' ? 'text-emerald-600 dark:text-emerald-400 print:!text-emerald-700' :
                      m.theme === 'sky' ? 'text-sky-600 dark:text-sky-400 print:!text-sky-700' :
                      'text-fuchsia-600 dark:text-fuchsia-400 print:!text-fuchsia-700'
                    ]"
                  >
                    {{ m.label }}
                  </span>
                  <span class="text-xs">{{ m.icon }}</span>
                </div>

                <div class="mt-0.5 flex items-baseline gap-1">
                  <span class="text-lg font-extrabold text-slate-900 dark:text-white print:!text-slate-900">{{ m.actual }}</span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 print:!text-slate-600 font-semibold">{{ m.unidad }}</span>
                </div>

                <div class="text-[9px] text-slate-400 dark:text-slate-500 print:!text-slate-600">
                  Inicio: {{ m.inicio }} {{ m.unidad }}
                </div>

                <div
                  class="mt-1 inline-flex items-center gap-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border"
                  :class="[
                    m.sinCambio
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                      : m.favorable === null
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
                      : m.favorable
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                  ]"
                >
                  <span>{{ m.sinCambio ? '→' : m.delta > 0 ? '↑' : '↓' }}</span>
                  <span>{{ m.sinCambio ? 'Sin cambio' : `${Math.abs(m.delta)} ${m.unidad}` }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BLOCK 2: Banner de Progreso / Logros Antropométricos (Bar de Progreso) -->
          <div v-if="achievements.badges.length" class="achievements-banner bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-white/10 p-3 shadow-sm print-card transition-colors print-block-middle">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 mb-1.5">
              <h3 class="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white print:!text-slate-900">
                <span>🎉</span>
                <span>Logros y Evolución Antropométrica</span>
              </h3>
              <span class="text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 print:!bg-slate-100 print:!text-slate-700 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40">
                {{ achievements.streakText }}
              </span>
            </div>

            <div class="flex flex-wrap gap-1">
              <span
                v-for="(b, idx) in achievements.badges"
                :key="idx"
                class="achievement-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-bold border transition-colors"
                :class="[
                  b.category === 'peso' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40 print:!bg-indigo-50/70 print:!text-indigo-900 print:!border-indigo-200' :
                  b.category === 'grasa' ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40 print:!bg-rose-50/70 print:!text-rose-900 print:!border-rose-200' :
                  b.category === 'musculo' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 print:!bg-emerald-50/70 print:!text-emerald-900 print:!border-emerald-200' :
                  b.category === 'cintura' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40 print:!bg-purple-50/70 print:!text-purple-900 print:!border-purple-200' :
                  'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40 print:!bg-amber-50/70 print:!text-amber-900 print:!border-amber-200'
                ]"
              >
                <span>{{ b.icon }}</span>
                <span>{{ b.texto }}</span>
              </span>
            </div>
          </div>

          <!-- BLOCK 3: Gráfica Principal de Composición Corporal -->
          <div
            v-show="visibleCharts.composicion"
            class="bg-white dark:bg-[#18181b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 border-l-4 border-l-indigo-500 shadow-sm print-card transition-colors print-block-chart"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div class="flex items-center space-x-2">
                <span class="text-base">📈</span>
                <div>
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900">
                    1. Evolución de Composición Corporal
                  </h3>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    Peso total (kg), Porcentaje de grasa (%) y Masa muscular (kg) con líneas de meta
                  </p>
                </div>
              </div>

              <!-- Series Filter Buttons (Hidden on print) -->
              <div class="flex items-center gap-1.5 no-print">
                <button
                  @click="toggleFilter('peso')"
                  class="px-2 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  :class="[filters.peso ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400']"
                >
                  <span>⚖️ Peso</span>
                </button>
                <button
                  @click="toggleFilter('grasa')"
                  class="px-2 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  :class="[filters.grasa ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400']"
                >
                  <span>🔥 Grasa</span>
                </button>
                <button
                  @click="toggleFilter('musculo')"
                  class="px-2 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  :class="[filters.musculo ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400']"
                >
                  <span>💪 Músculo</span>
                </button>
                <button
                  @click="toggleChartVisibility('composicion')"
                  class="text-slate-400 hover:text-red-500 p-1 text-xs ml-1 cursor-pointer"
                  title="Ocultar esta gráfica"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="chart-container-main relative w-full">
              <canvas ref="chartComposicionRef"></canvas>
            </div>
          </div>
        </div>

        <!-- Printable Footer Signature Block (Page 1) -->
        <div
          class="clinical-footer bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-1 text-[10.5px] print-card transition-colors mt-auto"
          :class="{ 'hidden sm:hidden md:hidden lg:hidden print:!flex': hasSecondaryVisibleCharts }"
        >
          <div class="text-slate-600 dark:text-slate-400 print:!text-slate-700 text-center sm:text-left flex items-center gap-1.5">
            <span>🩺</span>
            <span>Control Clínico Nutricional • <strong>Lic. N. Talia Tinoco Fabián</strong></span>
          </div>
          <div class="text-center sm:text-right font-medium text-slate-700 dark:text-slate-300 print:!text-slate-900">
            Cédula Profesional: <strong class="text-indigo-600 dark:text-indigo-400 print:!text-indigo-800 font-mono">11290678</strong>
          </div>
        </div>

      </div>

      <!-- PAGE BREAK DIVIDER (Active only on Print when secondary charts exist) -->
      <div v-if="hasSecondaryVisibleCharts" class="page-break-divider no-print"></div>

      <!-- PAGE 2 SECTION (2x2 Grid for Secondary Charts) -->
      <div v-if="hasSecondaryVisibleCharts" class="print-page-2 flex flex-col justify-between">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 secondary-charts-grid">
          
          <!-- Chart 2: Dona Composición Actual -->
          <div
            v-show="visibleCharts.dona"
            class="bg-white dark:bg-[#18181b] p-3 rounded-2xl border border-slate-200 dark:border-white/10 border-l-4 border-l-rose-500 shadow-sm print-card transition-colors chart-card-2x2"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1.5">
                <span class="text-sm">🍩</span>
                <div>
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900">
                    2. Composición Actual — Última Consulta
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    Masa Grasa vs. Masa Magra
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('dona')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer"
                title="Ocultar gráfica"
              >
                ✕
              </button>
            </div>
            <div class="chart-container-2x2 relative w-full flex items-center justify-center">
              <canvas ref="chartDonaRef"></canvas>
            </div>
          </div>

          <!-- Chart 3: Sumatoria de Pliegues -->
          <div
            v-show="visibleCharts.pliegues"
            class="bg-white dark:bg-[#18181b] p-3 rounded-2xl border border-slate-200 dark:border-white/10 border-l-4 border-l-amber-500 shadow-sm print-card transition-colors chart-card-2x2"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1.5">
                <span class="text-sm">📏</span>
                <div>
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900">
                    3. Sumatoria de Pliegues Cutáneos (mm)
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    Tríceps, Bíceps, Subescapular y Cresta
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('pliegues')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer"
                title="Ocultar gráfica"
              >
                ✕
              </button>
            </div>
            <div class="chart-container-2x2 relative w-full">
              <canvas ref="chartPlieguesRef"></canvas>
            </div>
          </div>

          <!-- Chart 4: Circunferencias (with selectable pills) -->
          <div
            v-show="visibleCharts.circunferencias"
            class="bg-white dark:bg-[#18181b] p-3 rounded-2xl border border-slate-200 dark:border-white/10 border-l-4 border-l-blue-500 shadow-sm print-card transition-colors chart-card-2x2"
          >
            <div class="flex items-center justify-between gap-1 mb-1">
              <div class="flex items-center space-x-1.5">
                <span class="text-sm">📐</span>
                <div>
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900">
                    4. Circunferencias Corporales (cm)
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    Cadera/Pompa, Cintura, Pecho, Brazo, Muslo
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('circunferencias')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer"
                title="Ocultar gráfica"
              >
                ✕
              </button>
            </div>

            <!-- Circumferences Multi-Selector Pills -->
            <div class="flex flex-wrap gap-1 mb-1 no-print">
              <button
                v-for="item in CIRCUMFERENCE_CATALOG"
                :key="item.key"
                @click="toggleCircumference(item.key)"
                class="px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition-all flex items-center space-x-1 border cursor-pointer select-none"
                :class="[
                  selectedCircumferences[item.key]
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></span>
                <span>{{ item.shortLabel }}</span>
              </button>
            </div>

            <div class="chart-container-2x2 relative w-full">
              <canvas ref="chartCircunferenciasRef"></canvas>
            </div>
          </div>

          <!-- Chart 5: Indicadores IMC & ICC -->
          <div
            v-show="visibleCharts.indicadores"
            class="bg-white dark:bg-[#18181b] p-3 rounded-2xl border border-slate-200 dark:border-white/10 border-l-4 border-l-fuchsia-500 shadow-sm print-card transition-colors chart-card-2x2"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-1.5">
                <span class="text-sm">🧮</span>
                <div>
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900">
                    5. Indicadores Antropométricos
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    IMC (izq) e Índice Cintura-Cadera (der)
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('indicadores')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer"
                title="Ocultar gráfica"
              >
                ✕
              </button>
            </div>
            <div class="chart-container-2x2 relative w-full">
              <canvas ref="chartIndicadoresRef"></canvas>
            </div>
          </div>

        </div>

        <!-- Printable Footer Signature Block (Page 2) -->
        <div class="clinical-footer bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-1 text-[10.5px] print-card transition-colors mt-auto">
          <div class="text-slate-600 dark:text-slate-400 print:!text-slate-700 text-center sm:text-left flex items-center gap-1.5">
            <span>🩺</span>
            <span>Control Clínico Nutricional • <strong>Lic. N. Talia Tinoco Fabián</strong></span>
          </div>
          <div class="text-center sm:text-right font-medium text-slate-700 dark:text-slate-300 print:!text-slate-900">
            Cédula Profesional: <strong class="text-indigo-600 dark:text-indigo-400 print:!text-indigo-800 font-mono">11290678</strong>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  ArcElement
} from 'chart.js';
import type {
  ClinicalRecord,
  BiologicalSex,
  PatientGoals,
  ProgressFilters,
  CircumferenceKey
} from '../../types/patientProgress';
import { CIRCUMFERENCE_CATALOG } from '../../types/patientProgress';
import { ProgressCalculationService } from '../../services/progress/ProgressCalculationService';
import { ProgressFileParserService } from '../../services/progress/ProgressFileParserService';

// Register Chart.js modules
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  ArcElement
);

type ChartVisibilityKey = 'composicion' | 'dona' | 'pliegues' | 'circunferencias' | 'indicadores';

interface ChartCatalogItem {
  key: ChartVisibilityKey;
  label: string;
  shortLabel: string;
  icon: string;
}

const CHART_VISIBILITY_CATALOG: ChartCatalogItem[] = [
  { key: 'composicion', label: '1. Composición Spline', shortLabel: '1. Composición', icon: '📈' },
  { key: 'dona', label: '2. Dona Actual', shortLabel: '2. Dona', icon: '🍩' },
  { key: 'pliegues', label: '3. Pliegues (mm)', shortLabel: '3. Pliegues', icon: '📏' },
  { key: 'circunferencias', label: '4. Circunferencias (cm)', shortLabel: '4. Circunferencias', icon: '📐' },
  { key: 'indicadores', label: '5. IMC e ICC', shortLabel: '5. IMC/ICC', icon: '🧮' },
];

const props = defineProps<{
  records: ClinicalRecord[];
  patientName: string;
  sex: BiologicalSex;
  goals: PatientGoals;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'newPatient'): void;
}>();

const chartComposicionRef = ref<HTMLCanvasElement | null>(null);
const chartDonaRef = ref<HTMLCanvasElement | null>(null);
const chartPlieguesRef = ref<HTMLCanvasElement | null>(null);
const chartCircunferenciasRef = ref<HTMLCanvasElement | null>(null);
const chartIndicadoresRef = ref<HTMLCanvasElement | null>(null);

let instComposicion: Chart | null = null;
let instDona: Chart | null = null;
let instPliegues: Chart | null = null;
let instCircunferencias: Chart | null = null;
let instIndicadores: Chart | null = null;

const visibleCharts = ref<Record<ChartVisibilityKey, boolean>>({
  composicion: true,
  dona: true,
  pliegues: true,
  circunferencias: true,
  indicadores: true,
});

const filters = ref<ProgressFilters>({
  peso: true,
  grasa: true,
  musculo: true,
});

const selectedCircumferences = ref<Record<CircumferenceKey, boolean>>({
  cadera: true,
  cintura: true,
  pecho: false,
  brazo: false,
  muslo: false,
  pantorrilla: false,
});

const currentDate = computed(() =>
  new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
);

const summaryMetrics = computed(() => ProgressCalculationService.buildSummary(props.records));

const achievements = computed(() =>
  ProgressCalculationService.buildAchievements(
    props.records,
    props.goals.metaPeso,
    props.goals.metaGrasa
  )
);

const hasSecondaryVisibleCharts = computed(() =>
  visibleCharts.value.dona ||
  visibleCharts.value.pliegues ||
  visibleCharts.value.circunferencias ||
  visibleCharts.value.indicadores
);

function toggleChartVisibility(key: ChartVisibilityKey) {
  visibleCharts.value[key] = !visibleCharts.value[key];
  nextTick(() => {
    renderAllCharts();
  });
}

function toggleFilter(key: keyof ProgressFilters) {
  filters.value[key] = !filters.value[key];
  if (instComposicion) {
    if (key === 'peso') instComposicion.data.datasets[0].hidden = !filters.value.peso;
    if (key === 'grasa') instComposicion.data.datasets[1].hidden = !filters.value.grasa;
    if (key === 'musculo') instComposicion.data.datasets[2].hidden = !filters.value.musculo;
    instComposicion.update();
  }
}

function toggleCircumference(key: CircumferenceKey) {
  selectedCircumferences.value[key] = !selectedCircumferences.value[key];
  renderCircunferenciasChart();
}

function createGradient(ctx: CanvasRenderingContext2D, area: any, colorRgb: string, alphaTop = 0.28, alphaBottom = 0.02) {
  if (!area) return colorRgb;
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
  gradient.addColorStop(0, colorRgb.replace(')', `, ${alphaTop})`).replace('rgb', 'rgba'));
  gradient.addColorStop(1, colorRgb.replace(')', `, ${alphaBottom})`).replace('rgb', 'rgba'));
  return gradient;
}

function renderCircunferenciasChart() {
  if (!chartCircunferenciasRef.value || !visibleCharts.value.circunferencias) return;
  if (instCircunferencias) {
    instCircunferencias.destroy();
    instCircunferencias = null;
  }

  const data = props.records;
  if (!data || data.length === 0) return;

  const labels = data.map((d) => d.Fecha || 'Sin fecha');
  const ctx = chartCircunferenciasRef.value.getContext('2d');
  if (!ctx) return;

  const circDatasets: any[] = [];

  CIRCUMFERENCE_CATALOG.forEach((item) => {
    if (!selectedCircumferences.value[item.key]) return;

    let serieData: (number | null)[] = [];
    if (item.key === 'cadera') {
      serieData = data.map((d) => parseFloat(String(d.Cadera)) || null);
    } else if (item.key === 'cintura') {
      serieData = data.map((d) => parseFloat(String(d.Cintura)) || null);
    } else if (item.key === 'pecho') {
      serieData = data.map((d) => parseFloat(String(d.Pecho)) || null);
    } else if (item.key === 'brazo') {
      serieData = data.map((d) => parseFloat(String(d.Brazo)) || null);
    } else if (item.key === 'muslo') {
      serieData = data.map((d) => parseFloat(String(d.Muslo)) || null);
    } else if (item.key === 'pantorrilla') {
      serieData = data.map((d) => parseFloat(String(d.Pantorrilla)) || null);
    }

    const hasValues = serieData.some((v) => v !== null && v > 0);
    if (hasValues) {
      circDatasets.push({
        label: `${item.label} (cm)`,
        data: serieData,
        borderColor: item.color,
        backgroundColor: item.color,
        borderWidth: 2.5,
        pointRadius: 3.5,
        pointHoverRadius: 5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: item.color,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: false,
        spanGaps: true,
      });
    }
  });

  instCircunferencias = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: circDatasets.length > 0 ? circDatasets : [
        {
          label: 'Sin medidas seleccionadas',
          data: labels.map(() => null),
          borderColor: 'rgba(148, 163, 184, 0.4)',
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: {
        padding: { top: 6, bottom: 4, left: 4, right: 14 }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 8, font: { size: 9, weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} cm`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { font: { size: 8.5, weight: 'bold' }, padding: 3 },
          grid: { color: 'rgba(148, 163, 184, 0.12)' }
        },
        x: {
          ticks: { font: { size: 8.5, weight: 'bold' }, maxRotation: 20, minRotation: 0, padding: 2 },
          grid: { display: false }
        },
      },
    },
  });
}

function renderAllCharts() {
  const data = props.records;
  if (!data || data.length === 0) return;

  const labels = data.map((d) => d.Fecha || 'Sin fecha');
  const peso = data.map((d) => parseFloat(String(d.Peso)) || 0);
  const grasa = data.map((d) => parseFloat(String(d.Grasa_Porcentaje)) || 0);
  const musculo = data.map((d) => parseFloat(String(d.Musculo_Kg)) || null);
  const pliegues = data.map((d) => parseFloat(String(d.Suma_Pliegues)) || 0);
  const imc = data.map((d) => parseFloat(String(d.IMC)) || null);
  const icc = data.map((d) => parseFloat(String(d.ICC)) || null);

  destroyAllCharts();

  // 1. Chart Composición Corporal
  if (chartComposicionRef.value && visibleCharts.value.composicion) {
    const ctx = chartComposicionRef.value.getContext('2d');
    if (ctx) {
      const datasets: any[] = [
        {
          label: 'Peso (kg)',
          data: peso,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: (c: any) => createGradient(ctx, c.chart.chartArea, 'rgb(99, 102, 241)'),
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgb(99, 102, 241)',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
          hidden: !filters.value.peso,
        },
        {
          label: 'Grasa (%)',
          data: grasa,
          borderColor: 'rgb(244, 63, 94)',
          backgroundColor: (c: any) => createGradient(ctx, c.chart.chartArea, 'rgb(244, 63, 94)'),
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgb(244, 63, 94)',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
          hidden: !filters.value.grasa,
        },
        {
          label: 'Músculo (kg)',
          data: musculo,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: (c: any) => createGradient(ctx, c.chart.chartArea, 'rgb(16, 185, 129)'),
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgb(16, 185, 129)',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
          spanGaps: true,
          hidden: !filters.value.musculo,
        },
      ];

      const mP = parseFloat(String(props.goals.metaPeso));
      if (mP > 0) {
        datasets.push({
          label: 'Meta Peso',
          data: labels.map(() => mP),
          borderColor: 'rgba(99, 102, 241, 0.75)',
          borderDash: [6, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        });
      }

      const mG = parseFloat(String(props.goals.metaGrasa));
      if (mG > 0) {
        datasets.push({
          label: 'Meta Grasa',
          data: labels.map(() => mG),
          borderColor: 'rgba(244, 63, 94, 0.75)',
          borderDash: [6, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        });
      }

      instComposicion = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          layout: {
            padding: { top: 8, bottom: 6, left: 6, right: 14 }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, font: { size: 9.5, weight: 'bold' } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const u = ctx.dataset.label?.includes('%') ? '%' : ' kg';
                  return ` ${ctx.dataset.label}: ${ctx.parsed.y}${u}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { size: 9, weight: 'bold' }, padding: 4 },
              grid: { color: 'rgba(148, 163, 184, 0.12)' }
            },
            x: {
              ticks: { font: { size: 9, weight: 'bold' }, maxRotation: 20, minRotation: 0, padding: 3 },
              grid: { display: false }
            },
          },
        },
      });
    }
  }

  // 2. Chart Dona Composición Actual
  if (chartDonaRef.value && visibleCharts.value.dona && data.length > 0) {
    const ctx = chartDonaRef.value.getContext('2d');
    const ultimo = data[data.length - 1];
    const grasaActual = parseFloat(String(ultimo.Grasa_Porcentaje)) || 0;
    if (ctx && grasaActual > 0) {
      instDona = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Masa Grasa', 'Masa Magra'],
          datasets: [
            {
              data: [grasaActual, Math.max(0, 100 - grasaActual)],
              backgroundColor: ['rgba(244, 63, 94, 0.85)', 'rgba(16, 185, 129, 0.85)'],
              borderColor: '#ffffff',
              borderWidth: 2.5,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%',
          layout: {
            padding: { top: 4, bottom: 4 }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, font: { size: 9, weight: 'bold' }, padding: 6 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
              },
            },
          },
        },
      });
    }
  }

  // 3. Chart Sumatoria Pliegues
  if (chartPlieguesRef.value && visibleCharts.value.pliegues) {
    const ctx = chartPlieguesRef.value.getContext('2d');
    if (ctx) {
      instPliegues = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Suma de Pliegues (mm)',
              data: pliegues,
              borderColor: 'rgb(245, 158, 11)',
              backgroundColor: (c: any) => createGradient(ctx, c.chart.chartArea, 'rgb(245, 158, 11)'),
              borderWidth: 2.5,
              pointRadius: 3.5,
              pointHoverRadius: 5,
              pointBackgroundColor: '#fff',
              pointBorderColor: 'rgb(245, 158, 11)',
              pointBorderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: { top: 6, bottom: 4, left: 4, right: 14 }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} mm`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { size: 8.5, weight: 'bold' }, padding: 3 },
              grid: { color: 'rgba(148, 163, 184, 0.12)' }
            },
            x: {
              ticks: { font: { size: 8.5, weight: 'bold' }, maxRotation: 20, minRotation: 0, padding: 2 },
              grid: { display: false }
            },
          },
        },
      });
    }
  }

  // 4. Render Circumferences
  renderCircunferenciasChart();

  // 5. Chart Indicadores (IMC / ICC)
  if (chartIndicadoresRef.value && visibleCharts.value.indicadores) {
    const ctx = chartIndicadoresRef.value.getContext('2d');
    if (ctx) {
      instIndicadores = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'IMC (kg/m²)',
              data: imc,
              borderColor: 'rgb(14, 165, 233)',
              backgroundColor: 'rgb(14, 165, 233)',
              borderWidth: 2.5,
              pointRadius: 3.5,
              tension: 0.4,
              yAxisID: 'yImc',
            },
            {
              label: 'ICC',
              data: icc,
              borderColor: 'rgb(217, 70, 239)',
              backgroundColor: 'rgb(217, 70, 239)',
              borderWidth: 2.5,
              pointRadius: 3.5,
              tension: 0.4,
              yAxisID: 'yIcc',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          layout: {
            padding: { top: 6, bottom: 4, left: 4, right: 16 }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, font: { size: 9, weight: 'bold' } }
            },
          },
          scales: {
            yImc: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'IMC (kg/m²)', font: { size: 8.5 } },
              ticks: { font: { size: 8, weight: 'bold' }, padding: 2 },
              grid: { color: 'rgba(148, 163, 184, 0.12)' },
            },
            yIcc: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'ICC', font: { size: 8.5 } },
              ticks: { font: { size: 8, weight: 'bold' }, padding: 2 },
              grid: { drawOnChartArea: false },
            },
            x: {
              ticks: { font: { size: 8, weight: 'bold' }, maxRotation: 20, minRotation: 0, padding: 2 },
              grid: { display: false }
            },
          },
        },
      });
    }
  }
}

function destroyAllCharts() {
  if (instComposicion) { instComposicion.destroy(); instComposicion = null; }
  if (instDona) { instDona.destroy(); instDona = null; }
  if (instPliegues) { instPliegues.destroy(); instPliegues = null; }
  if (instCircunferencias) { instCircunferencias.destroy(); instCircunferencias = null; }
  if (instIndicadores) { instIndicadores.destroy(); instIndicadores = null; }
}

function exportExcel() {
  ProgressFileParserService.exportToExcel(props.records, props.patientName);
}

function triggerPrint() {
  renderAllCharts();
  nextTick(() => {
    instComposicion?.resize();
    instDona?.resize();
    instPliegues?.resize();
    instCircunferencias?.resize();
    instIndicadores?.resize();
    setTimeout(() => {
      window.print();
    }, 150);
  });
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => renderAllCharts(), 150);
  });
});

watch(
  () => [props.records, props.goals, props.sex],
  () => {
    nextTick(() => {
      renderAllCharts();
    });
  },
  { deep: true }
);

onBeforeUnmount(() => {
  destroyAllCharts();
});
</script>

<style scoped>
.chart-container-main {
  height: 330px;
  position: relative;
}
.chart-container-2x2 {
  height: 230px;
  position: relative;
}

@page {
  size: portrait;
  margin: 12mm 14mm;
}

@media print {
  .no-print {
    display: none !important;
  }
  
  #progress-report,
  .print-container {
    max-width: 100% !important;
    width: 100% !important;
    min-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #ffffff !important;
    color: #0f172a !important;
    box-sizing: border-box !important;
  }

  .print-page-1 {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    page-break-after: always !important;
    break-after: page !important;
    min-height: 248mm !important;
    height: 248mm !important;
    max-height: 248mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }

  .print-page-2 {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-before: page !important;
    page-break-before: always !important;
    min-height: 248mm !important;
    height: 248mm !important;
    max-height: 248mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }

  .print-page-content {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }

  .print-block-top {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }

  .print-card, .metric-box {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 0 !important;
    padding: 8px 10px !important;
    box-sizing: border-box !important;
  }

  .chart-heading, h1, h2, h3, h4, p, span, strong {
    color: #0f172a !important;
  }

  .achievements-banner {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
    padding: 8px 10px !important;
    margin-bottom: 0 !important;
    box-sizing: border-box !important;
  }

  .achievement-pill {
    padding: 2px 7px !important;
    font-size: 9px !important;
    border: 1px solid #cbd5e1 !important;
  }

  .chart-container-main {
    height: 235px !important;
    min-height: 235px !important;
    max-height: 235px !important;
    width: 100% !important;
    position: relative !important;
    overflow: hidden !important;
  }

  .secondary-charts-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .chart-card-2x2 {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin-bottom: 0 !important;
    padding: 8px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  .chart-container-2x2 {
    height: 170px !important;
    min-height: 170px !important;
    max-height: 170px !important;
    width: 100% !important;
    position: relative !important;
    overflow: hidden !important;
  }

  .clinical-footer {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 6px 12px !important;
    margin-top: auto !important;
    margin-bottom: 0 !important;
    border: 1px solid #cbd5e1 !important;
    background: #f8fafc !important;
    font-size: 9.5px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  canvas {
    max-width: 100% !important;
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }
}
</style>
