<template>
  <div class="min-h-full pb-24 px-4 pt-4 max-w-2xl mx-auto space-y-6">
    
    <!-- Top Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 border border-slate-200 dark:border-white/10">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
          📈
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
              Mi Progreso & Consultas
            </h1>
            <span 
              v-if="isLinkedWithNutritionist"
              class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Oficial
            </span>
            <span 
              v-else
              class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
            >
              Personal
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span v-if="isLinkedWithNutritionist">
              Expediente clínico en seguimiento con <strong>Lic. Talia Tinoco</strong>
            </span>
            <span v-else>
              Registro autónomo de mediciones y avances corporales
            </span>
          </p>
        </div>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          @click="showAddModal = true"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Plus class="w-4 h-4" />
          <span>{{ isLinkedWithNutritionist ? 'Registrar en Casa' : '+ Nueva Medición' }}</span>
        </button>

        <a
          v-if="isLinkedWithNutritionist"
          :href="whatsappTaliaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 transition-all cursor-pointer"
          title="Escribir a Lic. Talia por WhatsApp"
        >
          <MessageCircle class="w-4 h-4" />
          <span class="hidden sm:inline">WhatsApp Talia</span>
        </a>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="glass-card p-12 text-center space-y-3">
      <div class="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-slate-500 dark:text-slate-400">Cargando mediciones y citas del expediente...</p>
    </div>

    <template v-else>
      <!-- ========================================================================= -->
      <!-- SECTION 1: HERO CARD - SIGUIENTE CITA                                     -->
      <!-- ========================================================================= -->
      <section v-if="isLinkedWithNutritionist" class="glass-card p-5 sm:p-6 border border-indigo-500/30 relative overflow-hidden bg-gradient-to-br from-indigo-950/30 via-slate-900/40 to-slate-900/80">
        <div class="absolute -right-10 -bottom-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <!-- If upcoming appointment exists -->
        <div v-if="upcomingAppointment" class="relative z-10 space-y-4">
          <div class="flex items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">🗓️</span>
              <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                Tu Próxima Cita Programada
              </span>
            </div>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {{ upcomingAppointment.tipo === 'online' ? '💻 Consulta Virtual' : '🏥 Consulta Presencial' }}
            </span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-baseline gap-2">
                <h3 class="text-xl sm:text-2xl font-black text-white capitalize" style="font-family: var(--font-display);">
                  {{ formatAppointmentDate(upcomingAppointment.fecha) }}
                </h3>
                <span v-if="upcomingAppointment.hora" class="text-base font-bold text-emerald-400">
                  {{ upcomingAppointment.hora }}
                </span>
              </div>
              <p class="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{{ upcomingAppointment.tipo === 'online' ? 'Videollamada Google Meet / WhatsApp' : 'AND. Emiliano Zapata No. 2, col. Obrera, Santa Clara' }}</span>
              </p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <a
                :href="getAppointmentConfirmationUrl(upcomingAppointment)"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 class="w-4 h-4" />
                <span>Confirmar / Preguntar</span>
              </a>
            </div>
          </div>

          <!-- Reason & Notes from last visit -->
          <div v-if="upcomingAppointment.motivo || latestAppointmentWithNotes?.acuerdosCompromisos" class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div v-if="upcomingAppointment.motivo" class="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span class="text-[10px] uppercase font-bold text-indigo-300 block mb-0.5">Motivo:</span>
              <p class="text-slate-200 font-medium">{{ upcomingAppointment.motivo }}</p>
            </div>
            <div v-if="latestAppointmentWithNotes?.acuerdosCompromisos" class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span class="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">🤝 Acuerdos de tu última sesión:</span>
              <p class="text-amber-100 font-medium line-clamp-2">{{ latestAppointmentWithNotes.acuerdosCompromisos }}</p>
            </div>
          </div>
        </div>

        <!-- If no upcoming appointment -->
        <div v-else class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left py-2">
          <div class="space-y-1">
            <div class="flex items-center justify-center sm:justify-start gap-2">
              <span class="text-lg">🗓️</span>
              <h3 class="text-base font-bold text-white">Sin cita programada próximamente</h3>
            </div>
            <p class="text-xs text-slate-400">
              Mantén el seguimiento continuo de tus objetivos agendando tu siguiente consulta de control con Lic. Talia.
            </p>
          </div>
          <a
            :href="whatsappScheduleUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md inline-flex items-center justify-center gap-2 shrink-0 transition-all"
          >
            <CalendarPlus class="w-4 h-4" />
            <span>Agendar Cita por WhatsApp</span>
          </a>
        </div>
      </section>

      <!-- If external user: Friendly invitation card to link with Talia -->
      <section v-else class="glass-card p-4 sm:p-5 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-base">🥗</span>
            <h3 class="text-sm font-bold text-emerald-400">¿Eres paciente de Lic. Talia Tinoco?</h3>
          </div>
          <p class="text-xs text-slate-400">
            Pide a tu nutrióloga que registre tu correo para sincronizar automáticamente tu expediente clínico, citas y menús aquí.
          </p>
        </div>
        <router-link to="/settings" class="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold shrink-0 text-center transition-colors">
          Configurar en Cuenta →
        </router-link>
      </section>

      <!-- ========================================================================= -->
      <!-- SECTION 2: CLINICAL KPI SUMMARY CARDS                                    -->
      <!-- ========================================================================= -->
      <section v-if="clinicalStats" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
            <span>📊</span>
            <span>Resumen de Avances Corporales</span>
          </h2>
          <span class="text-[11px] text-slate-500">
            {{ records.length }} evaluaciones registradas
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          <!-- Peso Actual & Delta -->
          <div class="glass-card p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Peso Actual</span>
              <Scale class="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                {{ clinicalStats.latestPeso }}
              </span>
              <span class="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div class="mt-2 flex items-center gap-1.5 text-xs">
              <span 
                class="font-extrabold text-[11px] px-1.5 py-0.5 rounded-md"
                :class="clinicalStats.deltaPeso <= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'"
              >
                {{ clinicalStats.deltaPeso > 0 ? `+${clinicalStats.deltaPeso}` : clinicalStats.deltaPeso }} kg
              </span>
              <span class="text-[10px] text-slate-400">vs inicio</span>
            </div>
          </div>

          <!-- % Grasa Corporal -->
          <div class="glass-card p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Grasa Corporal</span>
              <span class="text-amber-400 text-xs">⚡</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                {{ clinicalStats.latestGrasa > 0 ? clinicalStats.latestGrasa : '--' }}
              </span>
              <span class="text-xs font-bold text-slate-400">%</span>
            </div>
            <div class="mt-2 flex items-center gap-1.5 text-xs">
              <span 
                v-if="clinicalStats.hasGrasaDelta"
                class="font-extrabold text-[11px] px-1.5 py-0.5 rounded-md"
                :class="clinicalStats.deltaGrasa <= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'"
              >
                {{ clinicalStats.deltaGrasa > 0 ? `+${clinicalStats.deltaGrasa}` : clinicalStats.deltaGrasa }}%
              </span>
              <span class="text-[10px] text-slate-400">
                {{ clinicalStats.latestGrasaKg ? `${clinicalStats.latestGrasaKg} kg grasa` : 'de masa grasa' }}
              </span>
            </div>
          </div>

          <!-- Masa Muscular -->
          <div class="glass-card p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Masa Muscular</span>
              <span class="text-cyan-400 text-xs">💪</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                {{ clinicalStats.latestMusculo > 0 ? clinicalStats.latestMusculo : '--' }}
              </span>
              <span class="text-xs font-bold text-slate-400">kg</span>
            </div>
            <div class="mt-2 flex items-center gap-1.5 text-xs">
              <span 
                v-if="clinicalStats.hasMusculoDelta"
                class="font-extrabold text-[11px] px-1.5 py-0.5 rounded-md"
                :class="clinicalStats.deltaMusculo >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'"
              >
                {{ clinicalStats.deltaMusculo > 0 ? `+${clinicalStats.deltaMusculo}` : clinicalStats.deltaMusculo }} kg
              </span>
              <span class="text-[10px] text-slate-400">músculo activo</span>
            </div>
          </div>

          <!-- IMC con categoría OMS -->
          <div class="glass-card p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>IMC (Índice Masa)</span>
              <span class="text-xs">🧮</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                {{ clinicalStats.imc > 0 ? clinicalStats.imc : '--' }}
              </span>
            </div>
            <div class="mt-2">
              <span 
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border inline-block"
                :class="clinicalStats.imcBadgeClass"
              >
                {{ clinicalStats.imcCategory }}
              </span>
            </div>
          </div>

          <!-- Cintura -->
          <div class="glass-card p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Cintura</span>
              <span class="text-xs">📐</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                {{ clinicalStats.latestCintura > 0 ? clinicalStats.latestCintura : '--' }}
              </span>
              <span class="text-xs font-bold text-slate-400">cm</span>
            </div>
            <div class="mt-2 flex items-center gap-1.5 text-xs">
              <span 
                v-if="clinicalStats.hasCinturaDelta"
                class="font-extrabold text-[11px] px-1.5 py-0.5 rounded-md"
                :class="clinicalStats.deltaCintura <= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'"
              >
                {{ clinicalStats.deltaCintura > 0 ? `+${clinicalStats.deltaCintura}` : clinicalStats.deltaCintura }} cm
              </span>
              <span class="text-[10px] text-slate-400">evolución</span>
            </div>
          </div>

          <!-- ICC (Índice Cintura / Cadera) -->
          <div class="glass-card p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>ICC (Riesgo CV)</span>
              <span class="text-xs">❤️</span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-black text-slate-900 dark:text-white" style="font-family: var(--font-display);">
                {{ clinicalStats.icc > 0 ? clinicalStats.icc : '--' }}
              </span>
            </div>
            <div class="mt-2">
              <span 
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border inline-block"
                :class="clinicalStats.iccBadgeClass"
              >
                {{ clinicalStats.iccRiskLabel }}
              </span>
            </div>
          </div>

        </div>
      </section>

      <!-- Empty State if no measurements recorded yet -->
      <div v-if="!records || records.length === 0" class="glass-card p-10 text-center space-y-4">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl font-bold">
          📊
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-bold text-white">Aún no hay mediciones registradas</h3>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Registra tu primer peso y medidas para comenzar a generar automáticamente tus gráficas y deltas de evolución corporal.
          </p>
        </div>
        <button
          @click="showAddModal = true"
          class="px-5 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer"
        >
          + Registrar Primera Medición
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- SECTION 3: READ-ONLY CHARTS (CHART.JS)                                   -->
      <!-- ========================================================================= -->
      <section v-else class="glass-card p-4 sm:p-5 border border-slate-200 dark:border-white/10 space-y-4">
        
        <!-- Chart Controls / Tabs -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-base">📈</span>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white" style="font-family: var(--font-display);">
              Gráficas de Evolución
            </h3>
          </div>

          <div class="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold">
            <button
              @click="activeChartTab = 'spline'"
              class="px-3 py-1.5 rounded-xl transition-all"
              :class="activeChartTab === 'spline' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-white'"
            >
              Composición
            </button>
            <button
              @click="activeChartTab = 'dona'"
              class="px-3 py-1.5 rounded-xl transition-all"
              :class="activeChartTab === 'dona' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-white'"
            >
              Dona Actual
            </button>
            <button
              @click="activeChartTab = 'circunferencias'"
              class="px-3 py-1.5 rounded-xl transition-all"
              :class="activeChartTab === 'circunferencias' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-white'"
            >
              Medidas (cm)
            </button>
          </div>
        </div>

        <!-- Canvas Containers -->
        <div class="relative w-full h-72 sm:h-80">
          <canvas v-show="activeChartTab === 'spline'" ref="chartSplineRef"></canvas>
          <canvas v-show="activeChartTab === 'dona'" ref="chartDonaRef"></canvas>
          <canvas v-show="activeChartTab === 'circunferencias'" ref="chartCircunferenciasRef"></canvas>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- SECTION 4: APPOINTMENTS HISTORY (SOAP NOTES & AGREEMENTS)                -->
      <!-- ========================================================================= -->
      <section v-if="appointments && appointments.length > 0" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>📋</span>
            <span>Historial de Consultas con Talia</span>
          </h2>
          <span class="text-[11px] text-slate-500">{{ appointments.length }} sesiones</span>
        </div>

        <div class="space-y-2.5">
          <div
            v-for="apt in sortedAppointments"
            :key="apt.id"
            class="glass-card p-4 border border-slate-200 dark:border-white/10 space-y-2 hover:border-indigo-500/30 transition-all"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">{{ apt.fecha }}</span>
                <span v-if="apt.hora" class="text-xs text-slate-400">({{ apt.hora }})</span>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border" :class="getAptStatusClass(apt.status)">
                  {{ apt.status }}
                </span>
              </div>
              <span class="text-[11px] text-indigo-400 font-medium capitalize">
                {{ apt.tipo }}
              </span>
            </div>

            <p v-if="apt.motivo" class="text-xs text-slate-300">
              <strong class="text-slate-400">Motivo:</strong> {{ apt.motivo }}
            </p>

            <div v-if="apt.acuerdosCompromisos" class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-100">
              <strong class="text-amber-300">Acuerdos:</strong> {{ apt.acuerdosCompromisos }}
            </div>

            <div v-if="apt.notasEvolucion" class="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
              <strong class="text-indigo-400 font-sans block mb-1">Notas del Especialista (SOAP):</strong>
              {{ apt.notasEvolucion }}
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- SECTION 5: MEASUREMENTS READ-ONLY LOG TABLE                              -->
      <!-- ========================================================================= -->
      <section v-if="records && records.length > 0" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>📐</span>
            <span>Registro Cronológico de Medidas</span>
          </h2>
          <span class="text-[11px] text-slate-500">Solo lectura</span>
        </div>

        <div class="glass-card overflow-hidden border border-slate-200 dark:border-white/10">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th class="py-3 px-3">Fecha</th>
                  <th class="py-3 px-3">Peso</th>
                  <th class="py-3 px-3">% Grasa</th>
                  <th class="py-3 px-3">Músculo</th>
                  <th class="py-3 px-3">IMC</th>
                  <th class="py-3 px-3">Cintura</th>
                  <th class="py-3 px-3">Cadera</th>
                  <th v-if="!isLinkedWithNutritionist" class="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-white/5">
                <tr 
                  v-for="rec in reversedRecords" 
                  :key="rec.id" 
                  class="hover:bg-white/5 transition-colors"
                >
                  <td class="py-2.5 px-3 font-bold text-slate-800 dark:text-white">{{ rec.Fecha }}</td>
                  <td class="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ rec.Peso }} kg</td>
                  <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{{ rec.Grasa_Porcentaje ? `${rec.Grasa_Porcentaje}%` : '--' }}</td>
                  <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{{ rec.Musculo_Kg ? `${rec.Musculo_Kg} kg` : '--' }}</td>
                  <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{{ rec.IMC || '--' }}</td>
                  <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{{ rec.Cintura ? `${rec.Cintura} cm` : '--' }}</td>
                  <td class="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{{ rec.Cadera ? `${rec.Cadera} cm` : '--' }}</td>
                  <td v-if="!isLinkedWithNutritionist" class="py-2.5 px-3 text-right">
                    <button
                      @click="deleteManualRecord(rec.id!)"
                      class="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Professional Clinical Badge Footer -->
      <footer class="glass-card p-4 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-lg">
            🩺
          </div>
          <div class="text-xs">
            <h4 class="font-extrabold text-white">Lic. N. Talia Tinoco Fabián</h4>
            <p class="text-slate-400">Nutrióloga Clínica • Cédula Profesional: 11290678</p>
          </div>
        </div>
        <div class="text-xs text-slate-400 font-mono">
          Tel / Citas: <strong class="text-emerald-400">3541009737</strong>
        </div>
      </footer>

    </template>

    <!-- ========================================================================= -->
    <!-- MODAL: AGREGAR MEDICIÓN MANUAL                                            -->
    <!-- ========================================================================= -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div class="glass-card max-w-md w-full p-6 border border-white/20 shadow-2xl relative my-8 bg-[#18181b] space-y-4">
        
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚖️</span>
            <h3 class="text-base font-extrabold text-white">
              {{ isLinkedWithNutritionist ? 'Registrar Peso / Medidas' : 'Nueva Medición' }}
            </h3>
          </div>
          <button
            @click="showAddModal = false"
            class="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveNewMeasurement" class="space-y-3.5 text-xs">
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-400 mb-1">Fecha *</label>
              <input
                v-model="modalForm.fecha"
                type="date"
                required
                class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-400 mb-1">Peso (kg) *</label>
              <input
                v-model.number="modalForm.peso"
                type="number"
                step="0.1"
                min="20"
                max="300"
                required
                placeholder="ej. 72.5"
                class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-400 mb-1">% Grasa Corporal (opcional)</label>
              <input
                v-model.number="modalForm.grasaPorcentaje"
                type="number"
                step="0.1"
                min="3"
                max="65"
                placeholder="ej. 21.0"
                class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-400 mb-1">Músculo (kg) (opcional)</label>
              <input
                v-model.number="modalForm.musculoKg"
                type="number"
                step="0.1"
                min="10"
                max="150"
                placeholder="ej. 32.5"
                class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-400 mb-1">Cintura (cm)</label>
              <input
                v-model.number="modalForm.cintura"
                type="number"
                step="0.5"
                min="40"
                max="200"
                placeholder="ej. 82.0"
                class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-400 mb-1">Cadera (cm)</label>
              <input
                v-model.number="modalForm.cadera"
                type="number"
                step="0.5"
                min="40"
                max="200"
                placeholder="ej. 98.0"
                class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-400 mb-1">Notas / Observaciones</label>
            <input
              v-model="modalForm.notas"
              type="text"
              placeholder="ej. Pesaje en ayunas por la mañana"
              class="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl btn-primary font-bold shadow-md cursor-pointer"
            >
              Guardar Medición
            </button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { 
  Plus, 
  Scale, 
  MapPin, 
  MessageCircle, 
  CalendarPlus, 
  CheckCircle2, 
  Trash2, 
  X 
} from 'lucide-vue-next';
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
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import { PatientsService } from '../services/patients/patients.service';
import { PatientSyncService } from '../services/patients/PatientSyncService';
import { PersonalTrackingService } from '../services/progress/PersonalTrackingService';
import type { Patient, PatientAppointment, AppointmentStatus } from '../types/patient';
import type { ClinicalRecord } from '../types/patientProgress';

// Register Chart.js
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

const authStore = useAuthStore();
const userStore = useUserStore();

const isLoading = ref(true);
const patient = ref<Patient | null>(null);
const appointments = ref<PatientAppointment[]>([]);
const records = ref<ClinicalRecord[]>([]);

const activeChartTab = ref<'spline' | 'dona' | 'circunferencias'>('spline');
const showAddModal = ref(false);

const modalForm = ref({
  fecha: new Date().toISOString().split('T')[0],
  peso: null as number | null,
  grasaPorcentaje: null as number | null,
  musculoKg: null as number | null,
  cintura: null as number | null,
  cadera: null as number | null,
  notas: ''
});

// Chart canvas refs
const chartSplineRef = ref<HTMLCanvasElement | null>(null);
const chartDonaRef = ref<HTMLCanvasElement | null>(null);
const chartCircunferenciasRef = ref<HTMLCanvasElement | null>(null);

let instSpline: Chart | null = null;
let instDona: Chart | null = null;
let instCircunferencias: Chart | null = null;

const isLinkedWithNutritionist = computed(() => {
  return Boolean(userStore.profile.linkedPatientId || patient.value?.id);
});

const sortedAppointments = computed(() => {
  return [...appointments.value].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
});

const upcomingAppointment = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  const programadas = appointments.value.filter(a => a.status === 'programada' && a.fecha >= today);
  programadas.sort((a, b) => a.fecha.localeCompare(b.fecha));
  return programadas[0] || null;
});

const latestAppointmentWithNotes = computed(() => {
  return appointments.value.find(a => Boolean(a.acuerdosCompromisos || a.notasEvolucion));
});

const reversedRecords = computed(() => {
  return [...records.value].sort((a, b) => (b.Fecha || '').localeCompare(a.Fecha || ''));
});

// WhatsApp contact URLs
const whatsappTaliaUrl = computed(() => {
  const name = userStore.profile.name ? `Hola Lic. Talia, soy ${userStore.profile.name}` : 'Hola Lic. Talia';
  return `https://wa.me/523541009737?text=${encodeURIComponent(`${name}, te contacto desde mi app BodyFlow.`)}`;
});

const whatsappScheduleUrl = computed(() => {
  const name = userStore.profile.name ? `Hola Lic. Talia, soy ${userStore.profile.name}` : 'Hola Lic. Talia';
  return `https://wa.me/523541009737?text=${encodeURIComponent(`${name}, me gustaría agendar mi próxima consulta de seguimiento nutricional.`)}`;
});

function getAppointmentConfirmationUrl(apt: PatientAppointment) {
  const name = userStore.profile.name || 'Paciente';
  const msg = `Hola Lic. Talia, soy ${name}. Te escribo para confirmar mi consulta de seguimiento del día ${apt.fecha} a las ${apt.hora || 'la hora programada'}.`;
  return `https://wa.me/523541009737?text=${encodeURIComponent(msg)}`;
}

// Format appointment date to Spanish
function formatAppointmentDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return dateStr;
  }
}

function getAptStatusClass(status: AppointmentStatus) {
  switch (status) {
    case 'completada':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'programada':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'cancelada':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

// Compute clinical statistics
const clinicalStats = computed(() => {
  if (!records.value || records.value.length === 0) return null;
  const initial = records.value[0];
  const latest = records.value[records.value.length - 1];

  const initPeso = Number(initial.Peso) || 0;
  const lastPeso = Number(latest.Peso) || 0;
  const deltaPeso = Number((lastPeso - initPeso).toFixed(1));

  const initGrasa = Number(initial.Grasa_Porcentaje) || 0;
  const lastGrasa = Number(latest.Grasa_Porcentaje) || 0;
  const deltaGrasa = Number((lastGrasa - initGrasa).toFixed(1));
  const hasGrasaDelta = initGrasa > 0 && lastGrasa > 0;

  const initMusculo = Number(initial.Musculo_Kg) || 0;
  const lastMusculo = Number(latest.Musculo_Kg) || 0;
  const deltaMusculo = Number((lastMusculo - initMusculo).toFixed(1));
  const hasMusculoDelta = initMusculo > 0 && lastMusculo > 0;

  const initCintura = Number(initial.Cintura) || 0;
  const lastCintura = Number(latest.Cintura) || 0;
  const deltaCintura = Number((lastCintura - initCintura).toFixed(1));
  const hasCinturaDelta = initCintura > 0 && lastCintura > 0;

  const imc = Number(latest.IMC) || 0;
  let imcCategory = 'Normal';
  let imcBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (imc > 0) {
    if (imc < 18.5) {
      imcCategory = 'Bajo Peso';
      imcBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (imc < 25) {
      imcCategory = 'Peso Saludable';
      imcBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (imc < 30) {
      imcCategory = 'Sobrepeso';
      imcBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else {
      imcCategory = 'Obesidad';
      imcBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  }

  const icc = Number(latest.ICC) || 0;
  let iccRiskLabel = 'Riesgo Bajo';
  let iccBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (icc > 0) {
    const isMale = patient.value?.sexo === 'H' || userStore.profile.gender === 'male';
    const limit = isMale ? 0.95 : 0.85;
    if (icc > limit) {
      iccRiskLabel = 'Riesgo Elevado';
      iccBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    } else {
      iccRiskLabel = 'Riesgo Normal';
      iccBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  }

  return {
    latestPeso: lastPeso,
    deltaPeso,
    latestGrasa: lastGrasa,
    latestGrasaKg: (lastPeso > 0 && lastGrasa > 0) ? Number(((lastPeso * lastGrasa) / 100).toFixed(1)) : null,
    deltaGrasa,
    hasGrasaDelta,
    latestMusculo: lastMusculo,
    deltaMusculo,
    hasMusculoDelta,
    latestCintura: lastCintura,
    deltaCintura,
    hasCinturaDelta,
    imc,
    imcCategory,
    imcBadgeClass,
    icc,
    iccRiskLabel,
    iccBadgeClass
  };
});

// Load patient data
async function loadData() {
  isLoading.value = true;
  try {
    // 1. Check if linked via profile or search by email
    let patientId = userStore.profile.linkedPatientId;

    if (!patientId && authStore.user?.email) {
      const found = await PatientSyncService.findPatientByEmail(authStore.user.email);
      if (found) {
        patientId = found.id;
        await userStore.updateProfile({ linkedPatientId: found.id });
      }
    }

    if (patientId) {
      // Linked with Talia Tinoco
      const [patDoc, measList, aptList] = await Promise.all([
        PatientsService.getPatientById(patientId),
        PatientsService.getMeasurements(patientId),
        PatientsService.getAppointments(patientId)
      ]);

      patient.value = patDoc;
      appointments.value = aptList || [];

      if (measList && measList.length > 0) {
        records.value = [...measList].sort((a, b) => (a.Fecha || '').localeCompare(b.Fecha || ''));
      }
    } else {
      // Independent user mode: load personal measurements
      const uid = authStore.user?.uid || 'guest';
      const pMeas = await PersonalTrackingService.getMeasurements(uid);
      const userHeight = userStore.profile.height || 170;
      const userAge = userStore.profile.age || 28;
      records.value = PersonalTrackingService.toClinicalRecords(pMeas, userHeight, userAge);
    }
  } catch (err) {
    console.error('[PATIENT PROGRESS] Error loading progress data:', err);
  } finally {
    isLoading.value = false;
    await nextTick();
    renderActiveCharts();
  }
}

// Chart rendering
function renderActiveCharts() {
  if (!records.value || records.value.length === 0) return;

  const dates = records.value.map(r => r.Fecha || '');
  const weights = records.value.map(r => Number(r.Peso) || 0);
  const fats = records.value.map(r => Number(r.Grasa_Porcentaje) || 0);
  const muscles = records.value.map(r => Number(r.Musculo_Kg) || 0);

  // 1. Spline Chart (Evolution)
  if (chartSplineRef.value) {
    if (instSpline) instSpline.destroy();
    instSpline = new Chart(chartSplineRef.value, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Peso (kg)',
            data: weights,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          },
          {
            label: '% Grasa',
            data: fats,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 3,
            pointBackgroundColor: '#f59e0b'
          },
          {
            label: 'Músculo (kg)',
            data: muscles,
            borderColor: '#06b6d4',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#06b6d4'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }
          },
          tooltip: {
            backgroundColor: 'rgba(24, 24, 27, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.15)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }

  // 2. Dona Chart (Current Composition)
  if (chartDonaRef.value) {
    if (instDona) instDona.destroy();
    const latest = records.value[records.value.length - 1];
    const pesoTotal = Number(latest.Peso) || 70;
    const grasaPct = Number(latest.Grasa_Porcentaje) || 0;
    const grasaKg = (pesoTotal > 0 && grasaPct > 0) ? Number(((pesoTotal * grasaPct) / 100).toFixed(1)) : 15;
    const musculoKg = Number(latest.Musculo_Kg) || 30;
    const residualKg = Math.max(0, Number((pesoTotal - grasaKg - musculoKg).toFixed(1)));

    instDona = new Chart(chartDonaRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Masa Grasa', 'Masa Muscular', 'Masa Residual (Óseo/Órganos)'],
        datasets: [{
          data: [grasaKg, musculoKg, residualKg],
          backgroundColor: ['#f59e0b', '#06b6d4', '#64748b'],
          borderColor: '#18181b',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 11, weight: 'bold' }, boxWidth: 12 }
          }
        }
      }
    });
  }

  // 3. Circunferencias Chart
  if (chartCircunferenciasRef.value) {
    if (instCircunferencias) instCircunferencias.destroy();
    const cinturas = records.value.map(r => Number(r.Cintura) || 0);
    const caderas = records.value.map(r => Number(r.Cadera) || 0);

    instCircunferencias = new Chart(chartCircunferenciasRef.value, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Cintura (cm)',
            data: cinturas,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4
          },
          {
            label: 'Cadera (cm)',
            data: caderas,
            borderColor: '#a855f7',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }
}

watch(activeChartTab, async () => {
  await nextTick();
  renderActiveCharts();
});

// Add manual measurement
async function saveNewMeasurement() {
  if (!modalForm.value.peso) return;
  const uid = authStore.user?.uid || 'guest';

  await PersonalTrackingService.addMeasurement(uid, {
    fecha: modalForm.value.fecha,
    peso: Number(modalForm.value.peso),
    grasaPorcentaje: modalForm.value.grasaPorcentaje ? Number(modalForm.value.grasaPorcentaje) : undefined,
    musculoKg: modalForm.value.musculoKg ? Number(modalForm.value.musculoKg) : undefined,
    cintura: modalForm.value.cintura ? Number(modalForm.value.cintura) : undefined,
    cadera: modalForm.value.cadera ? Number(modalForm.value.cadera) : undefined,
    notas: modalForm.value.notas || undefined
  });

  // If user profile weight is older or different, sync it
  if (modalForm.value.peso) {
    await userStore.updateProfile({ weight: Number(modalForm.value.peso) });
  }

  showAddModal.value = false;
  modalForm.value.peso = null;
  modalForm.value.grasaPorcentaje = null;
  modalForm.value.musculoKg = null;
  modalForm.value.cintura = null;
  modalForm.value.cadera = null;
  modalForm.value.notas = '';

  await loadData();
}

async function deleteManualRecord(recordId: string) {
  if (!confirm('¿Deseas eliminar este registro de medición?')) return;
  const uid = authStore.user?.uid || 'guest';
  await PersonalTrackingService.deleteMeasurement(uid, recordId);
  await loadData();
}

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  if (instSpline) instSpline.destroy();
  if (instDona) instDona.destroy();
  if (instCircunferencias) instCircunferencias.destroy();
});
</script>
