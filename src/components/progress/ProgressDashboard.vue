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

      <div class="flex items-center flex-wrap gap-2">
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
          <span>📥 Excel</span>
        </button>
        <button
          @click="triggerPrint"
          class="px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center space-x-1.5 cursor-pointer"
        >
          <span>🖨️ Imprimir</span>
        </button>
        <button
          @click="downloadPDF"
          :disabled="isGeneratingPdf"
          class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <span v-if="isGeneratingPdf" class="inline-block animate-spin mr-1">⏳</span>
          <span v-else>📄</span>
          <span>{{ isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF' }}</span>
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
              <div class="flex-1 min-w-0">
                <div class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 print:!text-indigo-700 uppercase tracking-widest mb-1">
                  REPORTE DE SEGUIMIENTO NUTRICIONAL & ANTROPOMÉTRICO
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white print:!text-slate-900 tracking-tight leading-snug mb-1.5 break-words">
                  {{ patientName || 'Paciente' }}
                </h1>
                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 print:!text-slate-600 pt-0.5">
                  <span>Sexo: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ sex === 'H' ? 'Hombre' : 'Mujer' }}</strong></span>
                  <span>•</span>
                  <span v-if="records.length">Periodo: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ records[0].Fecha }}</strong> al <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ records[records.length - 1].Fecha }}</strong></span>
                </div>
              </div>

              <div class="text-right text-xs text-slate-500 dark:text-slate-400 print:!text-slate-600 font-mono shrink-0">
                <div>Evaluaciones: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ records.length }}</strong></div>
                <div>Fecha: <strong class="text-slate-800 dark:text-slate-200 print:!text-slate-900">{{ currentDate }}</strong></div>
              </div>
            </div>

            <!-- Patient Clinical Status & Diagnostic Banner (Estado Actual del Paciente) -->
            <div v-if="patientClinicalStatus" class="patient-status-card bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200 dark:border-white/10 p-3 sm:p-3.5 shadow-sm print-card transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-base shrink-0">🩺</span>
                  <div>
                    <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white print:!text-slate-900 leading-snug">
                      Estado Actual & Diagnóstico Nutricional
                    </h3>
                    <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600 leading-normal">
                      Evaluación clínica de la última consulta ({{ patientClinicalStatus.latestDate }})
                    </p>
                  </div>
                </div>

                <!-- Overall Status Badge -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border" :class="patientClinicalStatus.imcColor">
                    IMC: {{ patientClinicalStatus.imc }} • {{ patientClinicalStatus.imcCategory }}
                  </span>
                </div>
              </div>

              <!-- Diagnostic Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <!-- Col 1: Peso & Avance de Meta -->
                <div class="bg-slate-50/80 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 space-y-1">
                  <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>⚖️ Peso Corporal</span>
                    <span v-if="patientClinicalStatus.goalProgress" class="text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {{ patientClinicalStatus.goalProgress.percent }}% de Meta
                    </span>
                  </div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-base font-black text-slate-900 dark:text-white print:!text-slate-900">{{ patientClinicalStatus.latestPeso }} kg</span>
                    <span class="text-[10px] font-bold" :class="patientClinicalStatus.deltaPeso <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                      ({{ patientClinicalStatus.deltaPeso > 0 ? '+' : '' }}{{ patientClinicalStatus.deltaPeso }} kg)
                    </span>
                  </div>
                  <div class="text-[9px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    Inicial: <strong>{{ patientClinicalStatus.initialPeso }} kg</strong>
                    <span v-if="patientClinicalStatus.goalProgress"> • Meta: <strong>{{ patientClinicalStatus.goalProgress.target }} kg</strong></span>
                  </div>
                </div>

                <!-- Col 2: Composición Corporal Actual -->
                <div class="bg-slate-50/80 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 space-y-1">
                  <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    🧬 Composición Corporal
                  </div>
                  <div class="flex items-center justify-between text-[11px] pt-0.5">
                    <div>
                      <span class="text-slate-400 text-[9px] block">Grasa:</span>
                      <strong class="text-rose-600 dark:text-rose-400 font-extrabold">{{ patientClinicalStatus.latestGrasa }}%</strong>
                      <span class="text-[9px] text-slate-400 block font-normal">({{ patientClinicalStatus.deltaGrasa > 0 ? '+' : '' }}{{ patientClinicalStatus.deltaGrasa }}%)</span>
                    </div>
                    <div class="text-right">
                      <span class="text-slate-400 text-[9px] block">Masa Muscular:</span>
                      <strong class="text-emerald-600 dark:text-emerald-400 font-extrabold">{{ patientClinicalStatus.latestMusculo ? `${patientClinicalStatus.latestMusculo} kg` : 'N/D' }}</strong>
                      <span v-if="patientClinicalStatus.latestMusculo" class="text-[9px] text-slate-400 block font-normal">({{ patientClinicalStatus.deltaMusculo > 0 ? '+' : '' }}{{ patientClinicalStatus.deltaMusculo }} kg)</span>
                    </div>
                  </div>
                </div>

                <!-- Col 3: Riesgo Cardiovascular (ICC) & Diagnóstico -->
                <div class="bg-slate-50/80 dark:bg-white/5 p-2 rounded-xl border border-slate-100 dark:border-white/5 space-y-1">
                  <div class="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    ❤️ Riesgo Cardiovascular (ICC)
                  </div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-base font-black text-slate-900 dark:text-white print:!text-slate-900">{{ patientClinicalStatus.icc || 'N/D' }}</span>
                    <span class="text-[9.5px] font-bold" :class="patientClinicalStatus.iccRisk.includes('Bajo') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
                      {{ patientClinicalStatus.iccRisk }}
                    </span>
                  </div>
                  <div class="text-[9px] text-slate-500 dark:text-slate-400 print:!text-slate-600">
                    Cintura/Cadera • Relación Antropométrica
                  </div>
                </div>
              </div>
            </div>

            <!-- Distinct Metric Summary Cards (5 Color Accents) -->
            <div v-if="summaryMetrics.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 print:!grid-cols-5 gap-2 print-card-grid">
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
              <h3 class="text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-900 dark:text-white print:!text-slate-900 leading-snug">
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
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div class="flex items-start space-x-2 min-w-0">
                <span class="text-base shrink-0 mt-0.5">📈</span>
                <div class="min-w-0">
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900 leading-snug">
                    1. Evolución de Composición Corporal
                  </h3>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 print:!text-slate-600 leading-normal mt-0.5">
                    Peso total (kg), Porcentaje de grasa (%) y Masa muscular (kg) con líneas de meta
                  </p>
                </div>
              </div>

              <!-- Series Filter Buttons (Hidden on print) -->
              <div class="flex items-center gap-1.5 no-print shrink-0">
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

        <!-- Professional Clinical Footer (Page 1) -->
        <footer class="sheet-footer clinical-footer mt-5 pt-2">
          <div class="contact-card">
            <div class="contact-grid">
              <div class="contact-item">
                <span class="contact-icon">👤</span>
                <span><strong>Nutrióloga:</strong> Lic. N. Talia Tinoco Fabián</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">🪪</span>
                <span><strong>Cédula Profesional:</strong> 11290678</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span><strong>Dirección:</strong> AND. Emiliano Zapata No. 2, col. Obrera, Santa Clara</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span><strong>Teléfono / Citas:</strong> 3541009737</span>
              </div>
              <div class="contact-item span-2">
                <span class="contact-icon">✉️</span>
                <span><strong>Correo Electrónico:</strong> lic.n.talia@gmail.com</span>
              </div>
            </div>
          </div>

          <div class="footer-logo">
            <TaliaOfficialLogo :size="100" customClass="footer-logo-img" />
          </div>
        </footer>

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
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="flex items-start gap-1.5 min-w-0">
                <span class="text-sm shrink-0 mt-0.5">🍩</span>
                <div class="min-w-0">
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900 leading-snug break-words">
                    2. Composición Actual — Última Consulta
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600 leading-normal mt-0.5">
                    Masa Grasa vs. Masa Magra
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('dona')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer shrink-0"
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
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="flex items-start gap-1.5 min-w-0">
                <span class="text-sm shrink-0 mt-0.5">📏</span>
                <div class="min-w-0">
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900 leading-snug break-words">
                    3. Sumatoria de Pliegues Cutáneos (mm)
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600 leading-normal mt-0.5">
                    Tríceps, Bíceps, Subescapular y Cresta
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('pliegues')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer shrink-0"
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
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="flex items-start gap-1.5 min-w-0">
                <span class="text-sm shrink-0 mt-0.5">📐</span>
                <div class="min-w-0">
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900 leading-snug break-words">
                    4. Circunferencias Corporales (cm)
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600 leading-normal mt-0.5">
                    Cadera/Pompa, Cintura, Pecho, Brazo, Muslo
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('circunferencias')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer shrink-0"
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
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="flex items-start gap-1.5 min-w-0">
                <span class="text-sm shrink-0 mt-0.5">🧮</span>
                <div class="min-w-0">
                  <h3 class="chart-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white print:!text-slate-900 leading-snug break-words">
                    5. Indicadores Antropométricos
                  </h3>
                  <p class="text-[9.5px] text-slate-500 dark:text-slate-400 print:!text-slate-600 leading-normal mt-0.5">
                    IMC (izq) e Índice Cintura-Cadera (der)
                  </p>
                </div>
              </div>
              <button
                @click="toggleChartVisibility('indicadores')"
                class="no-print text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer shrink-0"
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

        <!-- Professional Clinical Footer (Page 2) -->
        <footer class="sheet-footer clinical-footer mt-5 pt-2">
          <div class="contact-card">
            <div class="contact-grid">
              <div class="contact-item">
                <span class="contact-icon">👤</span>
                <span><strong>Nutrióloga:</strong> Lic. N. Talia Tinoco Fabián</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">🪪</span>
                <span><strong>Cédula Profesional:</strong> 11290678</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span><strong>Dirección:</strong> AND. Emiliano Zapata No. 2, col. Obrera, Santa Clara</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span><strong>Teléfono / Citas:</strong> 3541009737</span>
              </div>
              <div class="contact-item span-2">
                <span class="contact-icon">✉️</span>
                <span><strong>Correo Electrónico:</strong> lic.n.talia@gmail.com</span>
              </div>
            </div>
          </div>

          <div class="footer-logo">
            <TaliaOfficialLogo :size="100" customClass="footer-logo-img" />
          </div>
        </footer>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
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
import TaliaOfficialLogo from '../common/TaliaOfficialLogo.vue';

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

const isGeneratingPdf = ref<boolean>(false);

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

const patientClinicalStatus = computed(() => {
  if (!props.records || props.records.length === 0) return null;
  const initial = props.records[0];
  const latest = props.records[props.records.length - 1];

  const initialPeso = parseFloat(String(initial.Peso)) || 0;
  const latestPeso = parseFloat(String(latest.Peso)) || 0;
  const deltaPeso = Number((latestPeso - initialPeso).toFixed(1));

  const initialGrasa = parseFloat(String(initial.Grasa_Porcentaje)) || 0;
  const latestGrasa = parseFloat(String(latest.Grasa_Porcentaje)) || 0;
  const deltaGrasa = Number((latestGrasa - initialGrasa).toFixed(1));

  const latestMusculo = parseFloat(String(latest.Musculo_Kg)) || 0;
  const initialMusculo = parseFloat(String(initial.Musculo_Kg)) || 0;
  const deltaMusculo = Number((latestMusculo - initialMusculo).toFixed(1));

  const imc = parseFloat(String(latest.IMC)) || 0;
  let imcCategory = 'No calculado';
  let imcColor = 'text-slate-600 bg-slate-100 border-slate-200';
  if (imc > 0) {
    if (imc < 18.5) {
      imcCategory = 'Bajo Peso';
      imcColor = 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40';
    } else if (imc < 25.0) {
      imcCategory = 'Normopeso (Saludable)';
      imcColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40';
    } else if (imc < 30.0) {
      imcCategory = 'Sobrepeso';
      imcColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40';
    } else if (imc < 35.0) {
      imcCategory = 'Obesidad Grado I';
      imcColor = 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/40';
    } else {
      imcCategory = 'Obesidad Grado II/III';
      imcColor = 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40';
    }
  }

  const icc = parseFloat(String(latest.ICC)) || 0;
  let iccRisk = 'No calculado';
  if (icc > 0) {
    if (props.sex === 'H') {
      if (icc < 0.90) {
        iccRisk = 'Bajo Riesgo Cardiovascular';
      } else if (icc <= 0.95) {
        iccRisk = 'Riesgo Moderado';
      } else {
        iccRisk = 'Alto Riesgo';
      }
    } else {
      if (icc < 0.80) {
        iccRisk = 'Bajo Riesgo Cardiovascular';
      } else if (icc <= 0.85) {
        iccRisk = 'Riesgo Moderado';
      } else {
        iccRisk = 'Alto Riesgo';
      }
    }
  }

  // Goal Progress
  const metaPeso = parseFloat(String(props.goals.metaPeso)) || 0;
  let goalProgress = null;
  if (metaPeso > 0 && initialPeso > metaPeso) {
    const totalToLose = initialPeso - metaPeso;
    const lostSoFar = initialPeso - latestPeso;
    const pct = Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
    goalProgress = {
      target: metaPeso,
      percent: pct,
      remaining: Math.max(0, Number((latestPeso - metaPeso).toFixed(1)))
    };
  }

  return {
    latestDate: latest.Fecha,
    latestPeso,
    initialPeso,
    deltaPeso,
    latestGrasa,
    initialGrasa,
    deltaGrasa,
    latestMusculo,
    initialMusculo,
    deltaMusculo,
    imc,
    imcCategory,
    imcColor,
    icc,
    iccRisk,
    goalProgress
  };
});

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
    instComposicion.update('none');
  }
}

function toggleCircumference(key: CircumferenceKey) {
  selectedCircumferences.value[key] = !selectedCircumferences.value[key];
  renderCircunferenciasChart();
}

function createGradient(ctx: CanvasRenderingContext2D, chartArea: any, color: string) {
  if (!chartArea) return color;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, color.replace('rgb', 'rgba').replace(')', ', 0.25)'));
  gradient.addColorStop(1, color.replace('rgb', 'rgba').replace(')', ', 0.0)'));
  return gradient;
}

function renderCircunferenciasChart() {
  if (!chartCircunferenciasRef.value || !visibleCharts.value.circunferencias) return;
  const data = props.records;
  if (!data || data.length === 0) return;

  const ctx = chartCircunferenciasRef.value.getContext('2d');
  if (!ctx) return;

  if (instCircunferencias) {
    instCircunferencias.destroy();
    instCircunferencias = null;
  }

  const labels = data.map((d) => d.Fecha || 'Sin fecha');
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
      animation: false,
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

      const pointDataLabelsPlugin = {
        id: 'pointDataLabels',
        afterDatasetsDraw(chart: any) {
          const cCtx = chart.ctx;
          chart.data.datasets.forEach((dataset: any, i: number) => {
            if (dataset.label?.includes('Meta') || dataset.hidden) return;
            const meta = chart.getDatasetMeta(i);
            if (meta.hidden) return;

            meta.data.forEach((element: any, index: number) => {
              const val = dataset.data[index];
              if (val === null || val === undefined || isNaN(val)) return;

              const unit = dataset.label?.includes('%') ? '%' : ' kg';
              const text = `${val}${unit}`;
              const { x, y } = element.tooltipPosition();

              cCtx.save();
              cCtx.font = 'bold 8.5px system-ui, -apple-system, sans-serif';
              cCtx.textAlign = 'center';
              cCtx.textBaseline = 'middle';

              const textWidth = cCtx.measureText(text).width;
              const padX = 3;
              const pillY = i === 1 ? y + 13 : (i === 2 ? y - 20 : y - 13);

              cCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
              cCtx.strokeStyle = dataset.borderColor;
              cCtx.lineWidth = 1.2;
              cCtx.beginPath();
              if (cCtx.roundRect) {
                cCtx.roundRect(x - textWidth / 2 - padX, pillY - 5.5, textWidth + padX * 2, 11, 2.5);
              } else {
                cCtx.rect(x - textWidth / 2 - padX, pillY - 5.5, textWidth + padX * 2, 11);
              }
              cCtx.fill();
              cCtx.stroke();

              cCtx.fillStyle = '#0f172a';
              cCtx.fillText(text, x, pillY + 0.5);
              cCtx.restore();
            });
          });
        }
      };

      instComposicion = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        plugins: [pointDataLabelsPlugin],
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          layout: {
            padding: { top: 24, bottom: 8, left: 8, right: 16 }
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
      const magraActual = +(Math.max(0, 100 - grasaActual)).toFixed(1);
      const pesoActual = parseFloat(String(ultimo.Peso)) || 0;
      const grasaKg = pesoActual > 0 ? +((pesoActual * grasaActual) / 100).toFixed(1) : 0;
      const magraKg = pesoActual > 0 ? +(pesoActual - grasaKg).toFixed(1) : 0;

      const labelGrasa = `Masa Grasa: ${grasaActual}%${grasaKg > 0 ? ` (${grasaKg} kg)` : ''}`;
      const labelMagra = `Masa Magra: ${magraActual}%${magraKg > 0 ? ` (${magraKg} kg)` : ''}`;

      instDona = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [labelGrasa, labelMagra],
          datasets: [
            {
              data: [grasaActual, magraActual],
              backgroundColor: ['rgba(244, 63, 94, 0.9)', 'rgba(16, 185, 129, 0.9)'],
              borderColor: '#ffffff',
              borderWidth: 2.5,
              hoverOffset: 4,
            },
          ],
        },
        plugins: [
          {
            id: 'doughnutCenterText',
            beforeDraw(chart) {
              const { ctx } = chart;
              const chartArea = chart.chartArea;
              if (!chartArea) return;
              ctx.save();
              const centerX = (chartArea.left + chartArea.right) / 2;
              const centerY = (chartArea.top + chartArea.bottom) / 2;

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              // Text top: % GRASA
              ctx.font = 'bold 9px sans-serif';
              ctx.fillStyle = '#64748b';
              ctx.fillText('% GRASA', centerX, centerY - 13);

              // Text middle: value
              ctx.font = 'bold 16px sans-serif';
              ctx.fillStyle = '#f43f5e';
              ctx.fillText(`${grasaActual}%`, centerX, centerY + 2);

              // Text bottom: % MAGRA
              ctx.font = 'bold 9px sans-serif';
              ctx.fillStyle = '#10b981';
              ctx.fillText(`${magraActual}% Magra`, centerX, centerY + 16);

              ctx.restore();
            },
          },
        ],
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          layout: {
            padding: { top: 4, bottom: 4 }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: { size: 9, weight: 'bold' },
                padding: 6,
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}`,
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
          animation: false,
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
          animation: false,
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
  window.print();
}

async function capturePageForPdf(sourceElement: HTMLElement): Promise<{ dataUrl: string; width: number; height: number }> {
  // 1. Create an isolated off-screen sandbox container with FIXED standard desktop width (850px)
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-9999px';
  sandbox.style.top = '0';
  sandbox.style.width = '850px';
  sandbox.style.padding = '0';
  sandbox.style.margin = '0';
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.color = '#0f172a';
  sandbox.style.zIndex = '-9999';
  sandbox.className = 'light bg-white text-slate-900';

  // 2. Clone the page element
  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.width = '850px';
  clone.style.maxWidth = '850px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#0f172a';
  clone.style.boxSizing = 'border-box';

  // 3. Convert all source canvases directly to <img> in clone (100% sharp Chart.js images)
  const sourceCanvases = sourceElement.querySelectorAll<HTMLCanvasElement>('canvas');
  const clonedCanvases = clone.querySelectorAll<HTMLCanvasElement>('canvas');
  sourceCanvases.forEach((src, i) => {
    const dest = clonedCanvases[i];
    if (dest) {
      const img = document.createElement('img');
      img.src = src.toDataURL('image/png');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      dest.parentNode?.replaceChild(img, dest);
    }
  });

  // 4. Remove all no-print elements from clone
  clone.querySelectorAll('.no-print').forEach((el) => el.remove());

  // 5. Remove dark classes & force clean light colors
  clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const classesToRemove: string[] = [];
    el.classList.forEach((cls) => {
      if (cls.startsWith('dark:') || cls === 'dark') {
        classesToRemove.push(cls);
      }
    });
    classesToRemove.forEach((cls) => el.classList.remove(cls));

    // Force white background on cards
    if (
      el.classList.contains('print-card') ||
      el.classList.contains('metric-box') ||
      el.classList.contains('achievements-banner') ||
      el.classList.contains('chart-card-2x2')
    ) {
      el.style.backgroundColor = '#ffffff';
      el.style.borderColor = '#cbd5e1';
      el.style.boxShadow = 'none';
    }
  });

  // 6. Force 5-column grid on summary cards in clone
  const gridContainer = clone.querySelector<HTMLElement>('.print-card-grid');
  if (gridContainer) {
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
    gridContainer.style.gap = '8px';
  }

  // 7. Force 2x2 grid on secondary charts in clone
  const secondaryGrid = clone.querySelector<HTMLElement>('.secondary-charts-grid');
  if (secondaryGrid) {
    secondaryGrid.style.display = 'grid';
    secondaryGrid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    secondaryGrid.style.gap = '10px';
  }

  // 8. Ensure standardized clinical footer is styled with exact sage green theme in clone
  const footer = clone.querySelector<HTMLElement>('.sheet-footer');
  if (footer) {
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';
    footer.style.backgroundColor = '#ffffff';
    footer.style.borderTop = '1.5px solid #a3b88c';
    footer.style.marginTop = '28px';
    footer.style.padding = '8px 12px';
    footer.style.boxSizing = 'border-box';
  }
  const contactCard = clone.querySelector<HTMLElement>('.contact-card');
  if (contactCard) {
    contactCard.style.backgroundColor = '#f4f7ee';
    contactCard.style.border = '1px solid #d4dfc7';
    contactCard.style.color = '#43512b';
    contactCard.style.padding = '6px 12px';
    contactCard.style.borderRadius = '6px';
  }
  const contactGrid = clone.querySelector<HTMLElement>('.contact-grid');
  if (contactGrid) {
    contactGrid.style.display = 'grid';
    contactGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    contactGrid.style.gap = '3px 14px';
    contactGrid.style.fontSize = '9px';
    contactGrid.style.color = '#43512b';
  }


  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    const dataUrl = await toJpeg(clone, {
      quality: 0.96,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve) => {
      if (img.complete) resolve();
      else img.onload = () => resolve();
    });

    return {
      dataUrl,
      width: img.width,
      height: img.height,
    };
  } finally {
    document.body.removeChild(sandbox);
  }
}

async function downloadPDF() {
  if (isGeneratingPdf.value) return;
  isGeneratingPdf.value = true;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;

    // 1. Capture Page 1
    const page1El = document.querySelector<HTMLElement>('.print-page-1');
    if (!page1El) throw new Error('No se encontró la página 1 del reporte.');

    const page1 = await capturePageForPdf(page1El);
    const imgHeight1 = (page1.height * contentWidth) / page1.width;
    const finalHeight1 = Math.min(imgHeight1, pageHeight - margin * 2);

    pdf.addImage(page1.dataUrl, 'JPEG', margin, margin, contentWidth, finalHeight1);

    // 2. Capture Page 2 if secondary charts are visible
    if (hasSecondaryVisibleCharts.value) {
      const page2El = document.querySelector<HTMLElement>('.print-page-2');
      if (page2El) {
        const page2 = await capturePageForPdf(page2El);
        pdf.addPage('letter', 'portrait');
        const imgHeight2 = (page2.height * contentWidth) / page2.width;
        const finalHeight2 = Math.min(imgHeight2, pageHeight - margin * 2);

        pdf.addImage(page2.dataUrl, 'JPEG', margin, margin, contentWidth, finalHeight2);
      }
    }

    const cleanName = props.patientName
      ? `_${props.patientName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, '').replace(/ +/g, '_')}`
      : '';
    const filename = `Reporte_Evolucion${cleanName}.pdf`;

    // Direct browser download
    pdf.save(filename);
  } catch (err: any) {
    console.error('Error generando archivo PDF:', err);
    alert('Ocurrió un error al generar el archivo PDF: ' + (err.message || err));
  } finally {
    isGeneratingPdf.value = false;
  }
}

onMounted(() => {
  nextTick(() => {
    renderAllCharts();
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
  size: letter portrait;
  margin: 10mm 12mm;
}

@media print {
  body {
    background: #ffffff !important;
    color: #0f172a !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

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
    min-height: 242mm !important;
    height: 248mm !important;
    max-height: 250mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 1mm 1mm 0 1mm !important;
    box-sizing: border-box !important;
  }

  .print-page-2 {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-before: page !important;
    page-break-before: always !important;
    min-height: 242mm !important;
    height: 248mm !important;
    max-height: 250mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 1mm 1mm 0 1mm !important;
    box-sizing: border-box !important;
  }

  .print-page-content {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }

  .print-block-top {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }

  .print-card-grid {
    display: grid !important;
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    gap: 6px !important;
    width: 100% !important;
  }

  .print-card, .metric-box {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 12px !important;
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
    border-radius: 12px !important;
    box-shadow: none !important;
    padding: 7px 10px !important;
    margin-bottom: 0 !important;
    box-sizing: border-box !important;
  }

  .achievement-pill {
    padding: 2px 7px !important;
    font-size: 9px !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 8px !important;
  }

  .chart-container-main {
    height: 250px !important;
    min-height: 250px !important;
    max-height: 250px !important;
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
    border-radius: 12px !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  .chart-container-2x2 {
    height: 165px !important;
    min-height: 165px !important;
    max-height: 165px !important;
    width: 100% !important;
    position: relative !important;
    overflow: hidden !important;
  }

  .clinical-footer {
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 8px 12px !important;
    margin-top: auto !important;
    margin-bottom: 0 !important;
    border-top: 1.5px solid #a3b88c !important;
    background: #ffffff !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .footer-logo img {
    width: 75px !important;
    height: 75px !important;
    object-fit: contain !important;
  }

  canvas {
    max-width: 100% !important;
    width: 100% !important;
    height: 100% !important;
    display: block !important;
  }
}

/* Professional Clinical Footer (Standardized with RecommendationSheet) */
.sheet-footer {
  margin-top: 24px;
  border-top: 1.5px solid #a3b88c;
  background: #ffffff;
  padding: 8px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  box-sizing: border-box;
}

:root.dark .sheet-footer,
.dark .sheet-footer {
  background: rgba(24, 24, 27, 0.4);
  border-top: 1.5px solid rgba(78, 222, 163, 0.3);
}

.contact-card {
  background: #f4f7ee;
  border-radius: 6px;
  padding: 6px 12px;
  border: 1px solid #d4dfc7;
  max-width: 600px;
  flex: 1;
}

:root.dark .contact-card,
.dark .contact-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 14px;
  font-size: 8.8px;
  color: #43512b;
}

:root.dark .contact-grid,
.dark .contact-grid {
  color: #cbd5e1;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.contact-icon {
  font-size: 9px;
  line-height: 1;
}

.contact-item strong {
  color: #2c361c;
}

:root.dark .contact-item strong,
.dark .contact-item strong {
  color: #f1f5f9;
}

.contact-item.span-2 {
  grid-column: span 2;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-left: 16px;
}






/* PDF Export styles when capturing canvas with html-to-image */
.is-pdf-export,
.is-pdf-export * {
  color-scheme: light !important;
}

.is-pdf-export {
  background: #ffffff !important;
  background-color: #ffffff !important;
  color: #0f172a !important;
  padding: 0 !important;
  margin: 0 !important;
}

.is-pdf-export .no-print {
  display: none !important;
}

.is-pdf-export div,
.is-pdf-export .print-card,
.is-pdf-export .metric-box,
.is-pdf-export .achievements-banner,
.is-pdf-export .chart-card-2x2,
.is-pdf-export [class*="bg-white"],
.is-pdf-export [class*="dark:bg-"] {
  background: #ffffff !important;
  background-color: #ffffff !important;
  border-color: #cbd5e1 !important;
  box-shadow: none !important;
}

.is-pdf-export .sheet-footer {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  border-top: 1.5px solid #a3b88c !important;
  margin-top: 28px !important;
  box-shadow: none !important;
}

.is-pdf-export .contact-card {
  background: #f4f7ee !important;
  background-color: #f4f7ee !important;
  border: 1px solid #d4dfc7 !important;
  color: #43512b !important;
}

.is-pdf-export h1,
.is-pdf-export h2,
.is-pdf-export h3,
.is-pdf-export h4,
.is-pdf-export strong,
.is-pdf-export [class*="dark:text-white"],
.is-pdf-export [class*="dark:text-slate-200"],
.is-pdf-export [class*="dark:text-slate-300"],
.is-pdf-export [class*="text-slate-900"],
.is-pdf-export [class*="text-slate-800"] {
  color: #0f172a !important;
}

.is-pdf-export p,
.is-pdf-export span,
.is-pdf-export [class*="dark:text-slate-400"],
.is-pdf-export [class*="dark:text-slate-500"],
.is-pdf-export [class*="text-slate-500"],
.is-pdf-export [class*="text-slate-400"],
.is-pdf-export [class*="text-slate-600"] {
  color: #475569 !important;
}

/* Metric colored labels */
.is-pdf-export [class*="text-indigo-"] { color: #4338ca !important; }
.is-pdf-export [class*="text-rose-"] { color: #e11d48 !important; }
.is-pdf-export [class*="text-emerald-"] { color: #047857 !important; }
.is-pdf-export [class*="text-sky-"] { color: #0284c7 !important; }
.is-pdf-export [class*="text-fuchsia-"] { color: #c026d3 !important; }

/* Delta pills in metric boxes */
.is-pdf-export [class*="bg-emerald-"] {
  background-color: #ecfdf5 !important;
  color: #047857 !important;
  border-color: #a7f3d0 !important;
}
.is-pdf-export [class*="bg-rose-"] {
  background-color: #fff1f2 !important;
  color: #be123c !important;
  border-color: #fecdd3 !important;
}
.is-pdf-export [class*="bg-slate-"] {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border-color: #cbd5e1 !important;
}

.is-pdf-export .print-page-1 {
  page-break-after: always !important;
  break-after: page !important;
  margin-bottom: 24px !important;
}

.is-pdf-export .print-page-2 {
  page-break-before: always !important;
  break-before: page !important;
}
</style>
