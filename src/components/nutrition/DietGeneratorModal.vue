<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
    <div class="max-w-3xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-6 bg-white dark:bg-[#18181b] text-slate-900 dark:text-white max-h-[92vh] flex flex-col transition-all">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10 cursor-pointer"
        title="Cerrar modal"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Header -->
      <div class="border-b border-slate-100 dark:border-white/10 pb-4 mb-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-black">
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xl font-black text-slate-900 dark:text-white leading-tight" style="font-family: var(--font-display);">
                Generador de Dietas • Diseñador Nutricional
              </h3>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                IA & Menús
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ headerSubtitle }}
            </p>
          </div>
        </div>
      </div>

      <!-- STEP 1: Main Mode Choice (Express vs DB Patient) -->
      <div v-if="currentStep === 'choice'" class="space-y-6 py-2 overflow-y-auto">
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
          ¿Cómo deseas estructurar el plan de alimentación?
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <!-- Option A: Dieta Rápida / Consulta Express -->
          <div
            @click="currentStep = 'express'"
            class="p-6 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500 bg-purple-50/40 dark:bg-purple-950/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap class="w-6 h-6" />
                </div>
                <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  ⚡ Consulta Express
                </span>
              </div>
              
              <div>
                <h4 class="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Generar Dieta Rápida
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Ideal para consultas express o menús de muestra. Define calorías, macros y tiempos de comida para entrar directamente al Diseñador de Menú con IA y exportar (PDF, Word, WhatsApp).
                </p>
              </div>
            </div>

            <div class="pt-3 border-t border-purple-200 dark:border-purple-500/20 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <span>Iniciar Dieta Express</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <!-- Option B: Seleccionar Paciente de la Base de Datos -->
          <div
            @click="currentStep = 'patient-select'"
            class="p-6 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users class="w-6 h-6" />
                </div>
                <span class="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  👥 Expediente en DB
                </span>
              </div>
              
              <div>
                <h4 class="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Seleccionar Paciente de la BD
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  Carga el expediente clínico de un paciente registrado, revisa sus dietas activas, calcula requerimientos con sus mediciones y diseña un menú totalmente personalizado.
                </p>
              </div>
            </div>

            <div class="pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Elegir Paciente Registrado</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

        </div>

        <!-- Directory Quick Link -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <ClipboardList class="w-4 h-4 text-slate-400 shrink-0" />
            <span>¿Prefieres ver el listado general con filtros avanzados y expedientes?</span>
          </div>
          <button
            type="button"
            @click="handleGoToFullDirectory"
            class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Ir a Directorio de Pacientes</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- STEP 2A: Express Diet Configuration Form -->
      <form
        v-else-if="currentStep === 'express'"
        @submit.prevent="handleCreateExpressDiet"
        class="space-y-5 overflow-y-auto pr-1 pb-2 scrollbar-thin flex-1"
      >
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-between">
          <button
            type="button"
            @click="currentStep = 'choice'"
            class="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver a opciones</span>
          </button>
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            Paso 2: Datos de Consulta Express
          </span>
        </div>

        <!-- 1. Identificación Básica del Paciente Express -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Nombre del Paciente / Consulta *
            </label>
            <input
              v-model="expressForm.nombre"
              type="text"
              required
              placeholder="ej. Mariana Torres (Consulta Express)"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Sexo Biológico
            </label>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                @click="expressForm.sexo = 'M'"
                class="py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                :class="expressForm.sexo === 'M' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-slate-50 dark:bg-[#201f22] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'"
              >
                Femenino
              </button>
              <button
                type="button"
                @click="expressForm.sexo = 'H'"
                class="py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                :class="expressForm.sexo === 'H' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-slate-50 dark:bg-[#201f22] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'"
              >
                Masculino
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Objetivo Nutricional -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
            Objetivo Nutricional
          </label>
          <select
            v-model="expressForm.objetivoId"
            @change="onObjectiveChange"
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
          >
            <option
              v-for="obj in PLAN_OBJECTIVES"
              :key="obj.id"
              :value="obj.id"
            >
              {{ obj.label }} — {{ obj.description }}
            </option>
          </select>
        </div>

        <!-- 3. Calorías y Macronutrientes -->
        <div class="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-500/20 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <Flame class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span class="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-200">
                Requerimiento Energético & Macronutrientes
              </span>
            </div>

            <!-- Quick Presets -->
            <div class="flex items-center gap-1.5 text-[10px]">
              <span class="text-slate-400 font-bold hidden sm:inline">Presets:</span>
              <button
                type="button"
                @click="applyMacroPreset('balanced')"
                class="px-2 py-0.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-purple-400 font-bold cursor-pointer"
              >
                Equilibrado
              </button>
              <button
                type="button"
                @click="applyMacroPreset('high_protein')"
                class="px-2 py-0.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-purple-400 font-bold cursor-pointer"
              >
                Alta Proteína
              </button>
              <button
                type="button"
                @click="applyMacroPreset('low_carb')"
                class="px-2 py-0.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-purple-400 font-bold cursor-pointer"
              >
                Bajo en Carbos
              </button>
            </div>
          </div>

          <!-- Calories and Macros Inputs Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <!-- Calorías -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Calorías (kcal) *
              </label>
              <input
                v-model.number="expressForm.calorias"
                @input="onCaloriesInput"
                type="number"
                min="800"
                max="6000"
                step="25"
                required
                class="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <!-- Proteína -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Proteínas (g)</span>
                <span class="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">{{ proteinKcalPercent }}%</span>
              </label>
              <input
                v-model.number="expressForm.protein"
                type="number"
                min="20"
                max="400"
                class="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <!-- Carbohidratos -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Carbos (g)</span>
                <span class="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">{{ carbsKcalPercent }}%</span>
              </label>
              <input
                v-model.number="expressForm.carbs"
                type="number"
                min="20"
                max="800"
                class="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <!-- Grasas -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Grasas (g)</span>
                <span class="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">{{ fatKcalPercent }}%</span>
              </label>
              <input
                v-model.number="expressForm.fat"
                type="number"
                min="10"
                max="250"
                class="w-full px-3 py-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <!-- Macro Consistency Bar & Auto-balance -->
          <div class="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">
                Suma de macros: <strong :class="isMacroSumMatched ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'">{{ macroKcalSum }} kcal</strong> (Meta: {{ expressForm.calorias }} kcal)
              </span>
            </div>
            <button
              type="button"
              @click="autoBalanceCarbs"
              class="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw class="w-3 h-3" />
              <span>Auto-cuadrar Carbohidratos</span>
            </button>
          </div>
        </div>

        <!-- 4. Distribución de Comidas y Estructura -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Número de comidas -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Número de Comidas al Día
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                v-for="meals in [3, 4, 5]"
                :key="meals"
                @click="expressForm.comidasSugeridas = meals"
                class="py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center gap-0.5"
                :class="expressForm.comidasSugeridas === meals ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-slate-50 dark:bg-[#201f22] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-purple-300'"
              >
                <span>{{ meals }} Comidas</span>
                <span class="text-[9px] opacity-80 font-normal">
                  {{ meals === 3 ? 'Des, Com, Cen' : (meals === 4 ? '+ 1 Colación' : '+ 2 Colaciones') }}
                </span>
              </button>
            </div>
          </div>

          <!-- Estructura del Menú -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Estructura Inicial del Menú
            </label>
            <select
              v-model="expressForm.tipoEstructura"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
            >
              <option value="dia_tipo">📄 Día Tipo Único (Recomendado para Express)</option>
              <option value="siete_dias">📅 7 Días Personalizados (Semana Completa)</option>
            </select>
          </div>
        </div>

        <!-- 5. Pre-cargar platillos saludables sugeridos -->
        <label class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer">
          <input
            v-model="expressForm.prefillDishes"
            type="checkbox"
            class="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 border-slate-300"
          />
          <div class="text-xs">
            <span class="font-bold text-slate-900 dark:text-white">Pre-cargar con platillos saludables sugeridos</span>
            <p class="text-slate-500 dark:text-slate-400 text-[11px]">
              El menú arrancará con recetas balanceadas ya listas. Podrás ajustarlas o cambiarlas con Inteligencia Artificial.
            </p>
          </div>
        </label>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-white transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            style="background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Sparkles v-else class="w-4 h-4" />
            <span>{{ isSubmitting ? 'Creando plan express...' : 'Generar Dieta y Abrir Diseñador de Menú 🚀' }}</span>
          </button>
        </div>
      </form>

      <!-- STEP 2B: Patient Database Selector -->
      <div v-else-if="currentStep === 'patient-select'" class="space-y-4 overflow-y-auto pr-1 pb-2 scrollbar-thin flex-1 flex flex-col">
        <!-- Top Back Navigation -->
        <div class="flex items-center justify-between">
          <button
            type="button"
            @click="currentStep = 'choice'"
            class="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Volver a opciones</span>
          </button>
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
            Paso 2: Elegir Paciente de la Base de Datos
          </span>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar paciente por nombre, objetivo o teléfono..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <!-- Loading State -->
        <div v-if="isLoadingPatients" class="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin text-emerald-500" />
          <span>Cargando pacientes de la base de datos...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredPatients.length === 0" class="py-10 text-center space-y-2">
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300">No se encontraron pacientes</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Intenta con otro término de búsqueda o crea uno nuevo en el directorio.</p>
          <button
            type="button"
            @click="handleGoToFullDirectory"
            class="px-4 py-2 mt-2 rounded-xl btn-primary text-xs font-bold cursor-pointer"
          >
            Ir al Directorio de Pacientes
          </button>
        </div>

        <!-- Patients List -->
        <div v-else class="space-y-2 overflow-y-auto flex-1 max-h-[360px] pr-1">
          <div
            v-for="pat in filteredPatients"
            :key="pat.id"
            @click="handleSelectPatient(pat.id)"
            class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar Circle -->
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-black text-sm shrink-0">
                {{ getInitials(pat.nombre) }}
              </div>

              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h5 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {{ pat.nombre }}
                  </h5>
                  <span
                    v-if="pat.status"
                    class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md"
                    :class="pat.status === 'activo' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-white/10 text-slate-500'"
                  >
                    {{ pat.status }}
                  </span>
                  <span
                    v-for="tag in (pat.tags || []).slice(0, 2)"
                    :key="tag"
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                  >
                    {{ tag }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ pat.objetivoPrincipal || 'Sin objetivo asignado' }}
                  <span v-if="pat.edad"> • {{ pat.edad }} años</span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
              <span class="hidden sm:inline">Ver Dietas</span>
              <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <!-- Bottom Action: Directorio de Pacientes -->
        <div class="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          <span class="text-slate-400">Mostrando {{ filteredPatients.length }} paciente(s)</span>
          <button
            type="button"
            @click="handleGoToFullDirectory"
            class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Directorio Completo de Pacientes</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Sparkles,
  Zap,
  Users,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Search,
  RotateCcw,
  Loader2,
  Flame,
  ClipboardList
} from 'lucide-vue-next';
import { PLAN_OBJECTIVES } from '../../services/nutrition/NutritionEngineService';
import { PatientsService } from '../../services/patients/patients.service';
import type { Patient, PatientDietPlan, BiologicalSex } from '../../types/patient';
import type { DietPlanMenu, DishItem, MealTimeCatalogItem, DayMenuSchedule } from '../../types/dietMenu';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();

// Steps: 'choice' | 'express' | 'patient-select'
const currentStep = ref<'choice' | 'express' | 'patient-select'>('choice');

const headerSubtitle = computed(() => {
  if (currentStep.value === 'choice') {
    return 'Crea un plan de alimentación rápido para consulta express o asígnalo al expediente de un paciente existente.';
  }
  if (currentStep.value === 'express') {
    return 'Define calorías, macronutrientes y distribución para generar un menú editable al instante.';
  }
  return 'Selecciona un paciente registrado en tu base de datos para ver y gestionar sus planes nutricionales.';
});

// =========================================================================
// EXPRESS CONSULTATION FORM STATE
// =========================================================================
const isSubmitting = ref(false);

const expressForm = reactive({
  nombre: '',
  sexo: 'M' as BiologicalSex,
  edad: 28,
  objetivoId: 'Pérdida de grasa',
  calorias: 1800,
  protein: 135,
  carbs: 180,
  fat: 60,
  comidasSugeridas: 4,
  tipoEstructura: 'dia_tipo' as 'dia_tipo' | 'siete_dias',
  prefillDishes: true
});

// Kcal percentages
const proteinKcalPercent = computed(() => {
  if (!expressForm.calorias) return 0;
  return Math.round((expressForm.protein * 4 / expressForm.calorias) * 100);
});

const carbsKcalPercent = computed(() => {
  if (!expressForm.calorias) return 0;
  return Math.round((expressForm.carbs * 4 / expressForm.calorias) * 100);
});

const fatKcalPercent = computed(() => {
  if (!expressForm.calorias) return 0;
  return Math.round((expressForm.fat * 9 / expressForm.calorias) * 100);
});

const macroKcalSum = computed(() => {
  return (expressForm.protein * 4) + (expressForm.carbs * 4) + (expressForm.fat * 9);
});

const isMacroSumMatched = computed(() => {
  return Math.abs(macroKcalSum.value - expressForm.calorias) <= 15;
});

function onObjectiveChange() {
  const targetObj = PLAN_OBJECTIVES.find(o => o.id === expressForm.objetivoId);
  if (!targetObj) return;

  if (targetObj.id === 'Pérdida de grasa') {
    expressForm.calorias = 1650;
    applyMacroPreset('high_protein');
  } else if (targetObj.id === 'Ganancia de masa muscular') {
    expressForm.calorias = 2300;
    applyMacroPreset('balanced');
  } else if (targetObj.id === 'Recomposición corporal') {
    expressForm.calorias = 1850;
    applyMacroPreset('high_protein');
  } else {
    applyMacroPreset('balanced');
  }
}

function onCaloriesInput() {
  autoBalanceCarbs();
}

function applyMacroPreset(preset: 'balanced' | 'high_protein' | 'low_carb') {
  const kcal = expressForm.calorias || 1800;
  if (preset === 'balanced') {
    // 25% P, 50% C, 25% F
    expressForm.protein = Math.round((kcal * 0.25) / 4);
    expressForm.fat = Math.round((kcal * 0.25) / 9);
    expressForm.carbs = Math.round((kcal * 0.50) / 4);
  } else if (preset === 'high_protein') {
    // 32% P, 43% C, 25% F
    expressForm.protein = Math.round((kcal * 0.32) / 4);
    expressForm.fat = Math.round((kcal * 0.25) / 9);
    expressForm.carbs = Math.round((kcal * 0.43) / 4);
  } else if (preset === 'low_carb') {
    // 35% P, 25% C, 40% F
    expressForm.protein = Math.round((kcal * 0.35) / 4);
    expressForm.fat = Math.round((kcal * 0.40) / 9);
    expressForm.carbs = Math.round((kcal * 0.25) / 4);
  }
}

function autoBalanceCarbs() {
  const remainingKcal = expressForm.calorias - (expressForm.protein * 4) - (expressForm.fat * 9);
  expressForm.carbs = Math.max(0, Math.round(remainingKcal / 4));
}

/**
 * Builds the initial menu structure with fallback dishes tailored to the requested meal count
 */
function buildInitialMenu(planId: string): DietPlanMenu {
  const mealsCount = expressForm.comidasSugeridas || 4;
  const activeKeys = ['desayuno', 'comida', 'cena'];
  if (mealsCount >= 4) activeKeys.splice(1, 0, 'colacion_1');
  if (mealsCount >= 5) activeKeys.splice(activeKeys.indexOf('cena'), 0, 'colacion_2');

  const allConfig: MealTimeCatalogItem[] = [
    { key: 'desayuno', label: 'Desayuno', defaultTime: '08:30 AM', icon: '🍳' },
    { key: 'colacion_1', label: 'Colación Matutina', defaultTime: '11:30 AM', icon: '🍏' },
    { key: 'comida', label: 'Comida', defaultTime: '02:30 PM', icon: '🍲' },
    { key: 'colacion_2', label: 'Colación Vespertina', defaultTime: '05:30 PM', icon: '🥜' },
    { key: 'cena', label: 'Cena', defaultTime: '08:30 PM', icon: '🥗' }
  ];
  const tiemposComidaConfig = allConfig.filter(c => activeKeys.includes(c.key));

  const mealDishes: Record<string, DishItem[]> = {};
  activeKeys.forEach(k => { mealDishes[k] = []; });

  if (expressForm.prefillDishes) {
    const kcal = expressForm.calorias;
    const protein = expressForm.protein;
    const carbs = expressForm.carbs;
    const fat = expressForm.fat;

    mealDishes.desayuno = [
      {
        id: `exp_des_${Date.now()}`,
        nombre: 'Huevos con Espinacas y Tortillas de Maíz',
        categoria: 'desayuno',
        porcion: '2 huevos + 1 taza espinaca + 2 tortillas',
        macros: {
          calories: Math.round(kcal * (mealsCount === 3 ? 0.32 : 0.26)),
          protein: Math.round(protein * 0.28),
          carbs: Math.round(carbs * 0.26),
          fat: Math.round(fat * 0.28)
        },
        ingredientes: ['2 pzas Huevo entero', '1 taza Espinaca fresca', '2 pzas Tortilla de maíz', '1 cdita Aceite de oliva']
      }
    ];

    mealDishes.comida = [
      {
        id: `exp_com_${Date.now()}`,
        nombre: 'Pechuga Asada con Arroz Jazmín y Ensalada Fresca',
        categoria: 'comida',
        porcion: '140g pechuga + 1/2 taza arroz + ensalada abundante',
        macros: {
          calories: Math.round(kcal * (mealsCount === 3 ? 0.40 : 0.36)),
          protein: Math.round(protein * 0.40),
          carbs: Math.round(carbs * 0.38),
          fat: Math.round(fat * 0.30)
        },
        ingredientes: ['140g Pechuga de pollo', '1/2 taza Arroz cocido', '1.5 tazas Lechuga mixta', '1/2 pza Pepino', '1/2 pza Jitomate']
      }
    ];

    mealDishes.cena = [
      {
        id: `exp_cen_${Date.now()}`,
        nombre: 'Filete de Pescado o Atún con Aguacate y Tostadas',
        categoria: 'cena',
        porcion: '1 lata atún / 130g pescado + 1/3 aguacate + 2 tostadas',
        macros: {
          calories: Math.round(kcal * (mealsCount === 3 ? 0.28 : 0.22)),
          protein: Math.round(protein * 0.24),
          carbs: Math.round(carbs * 0.22),
          fat: Math.round(fat * 0.26)
        },
        ingredientes: ['1 lata Atún en agua o pescado blanco', '1/3 pza Aguacate', '2 pzas Tostadas horneadas', 'Verduras al gusto']
      }
    ];

    if (mealsCount >= 4) {
      mealDishes.colacion_1 = [
        {
          id: `exp_col1_${Date.now()}`,
          nombre: 'Yogur Griego con Manzana y Canela',
          categoria: 'colacion_1',
          porcion: '3/4 taza yogur + 1 manzana',
          macros: {
            calories: Math.round(kcal * 0.10),
            protein: Math.round(protein * 0.14),
            carbs: Math.round(carbs * 0.14),
            fat: Math.round(fat * 0.08)
          },
          ingredientes: ['3/4 taza Yogur griego natural sin azúcar', '1 pza Manzana verde picada', 'Pizca de Canela']
        }
      ];
    }

    if (mealsCount >= 5) {
      mealDishes.colacion_2 = [
        {
          id: `exp_col2_${Date.now()}`,
          nombre: 'Puñado de Almendras y Frutos Rojos',
          categoria: 'colacion_2',
          porcion: '12 almendras + 1/2 taza frutos rojos',
          macros: {
            calories: Math.round(kcal * 0.06),
            protein: Math.round(protein * 0.04),
            carbs: Math.round(carbs * 0.06),
            fat: Math.round(fat * 0.10)
          },
          ingredientes: ['12 pzas Almendras naturales', '1/2 taza Frutos rojos frescos']
        }
      ];
    }
  }

  let dias: DayMenuSchedule[] = [];
  if (expressForm.tipoEstructura === 'siete_dias') {
    const DAYS = [
      { id: 'lunes', label: 'Lunes' },
      { id: 'martes', label: 'Martes' },
      { id: 'miercoles', label: 'Miércoles' },
      { id: 'jueves', label: 'Jueves' },
      { id: 'viernes', label: 'Viernes' },
      { id: 'sabado', label: 'Sábado' },
      { id: 'domingo', label: 'Domingo' }
    ];
    dias = DAYS.map(d => ({
      diaId: d.id,
      diaNombre: d.label,
      comidas: JSON.parse(JSON.stringify(mealDishes))
    }));
  } else {
    dias = [
      {
        diaId: 'dia_tipo',
        diaNombre: 'Día Tipo Habitual',
        comidas: mealDishes
      }
    ];
  }

  return {
    planId,
    tipoEstructura: expressForm.tipoEstructura,
    tiemposComida: activeKeys,
    tiemposComidaConfig,
    updatedAt: new Date().toISOString(),
    dias
  };
}

async function handleCreateExpressDiet() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const patientName = expressForm.nombre.trim() || 'Paciente Express';
    
    // 1. Crear Paciente Express en la base de datos
    const createdPatient = await PatientsService.createPatient({
      nombre: patientName,
      sexo: expressForm.sexo,
      edad: expressForm.edad || 28,
      objetivoPrincipal: expressForm.objetivoId,
      status: 'activo',
      tags: ['Consulta Express'],
      alertasMedicas: [],
      metas: {},
      notasGenerales: `Consulta express generada el ${new Date().toLocaleDateString('es-MX')}.`
    });

    // 2. Construir menú inicial y plan nutricional
    const planId = `plan_exp_${Date.now()}`;
    const initialMenu = buildInitialMenu(planId);

    const newPlan: Omit<PatientDietPlan, 'id' | 'createdAt'> & { id: string } = {
      id: planId,
      nombre: `Plan Express • ${expressForm.objetivoId}`,
      fechaAsignacion: new Date().toISOString().split('T')[0],
      status: 'activo',
      calorias: expressForm.calorias,
      macros: {
        protein: expressForm.protein,
        carbs: expressForm.carbs,
        fat: expressForm.fat
      },
      objetivo: expressForm.objetivoId,
      fuenteCalculo: 'manual',
      comidasSugeridas: expressForm.comidasSugeridas,
      menu: initialMenu,
      menuGenerado: true,
      notas: 'Plan alimenticio generado en Consulta Express.'
    };

    await PatientsService.savePatientDietPlan(createdPatient.id, newPlan);

    emit('close');

    // 3. Redirigir directamente al Diseñador de Menú del paciente
    router.push(`/utilities/pacientes/${createdPatient.id}/planes/${planId}/menu`);
  } catch (err) {
    console.error('Error al generar la dieta express:', err);
    alert('Ocurrió un error al generar la consulta express. Por favor intenta de nuevo.');
  } finally {
    isSubmitting.value = false;
  }
}

// =========================================================================
// PATIENT SELECTION FROM DB STATE
// =========================================================================
const dbPatients = ref<Patient[]>([]);
const searchQuery = ref('');
const isLoadingPatients = ref(false);

async function loadDbPatients() {
  isLoadingPatients.value = true;
  try {
    dbPatients.value = await PatientsService.getPatients();
  } catch (err) {
    console.warn('Error loading db patients:', err);
  } finally {
    isLoadingPatients.value = false;
  }
}

const filteredPatients = computed(() => {
  if (!searchQuery.value.trim()) return dbPatients.value;
  const q = searchQuery.value.toLowerCase().trim();
  return dbPatients.value.filter(p =>
    (p.nombre || '').toLowerCase().includes(q) ||
    (p.objetivoPrincipal || '').toLowerCase().includes(q) ||
    (p.telefono || '').toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );
});

function getInitials(name?: string): string {
  if (!name) return 'PX';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function handleSelectPatient(patientId: string) {
  emit('close');
  router.push(`/utilities/pacientes/${patientId}/diet-plans`);
}

function handleGoToFullDirectory() {
  emit('close');
  router.push('/utilities/pacientes');
}

onMounted(() => {
  loadDbPatients();
});
</script>
