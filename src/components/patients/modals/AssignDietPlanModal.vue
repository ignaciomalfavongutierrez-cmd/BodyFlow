<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
    <div class="max-w-3xl w-full p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 bg-white dark:bg-[#18181b] transition-all text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
      
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10"
        title="Cerrar modal"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Header -->
      <div class="border-b border-slate-100 dark:border-white/10 pb-4 mb-4 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
            <Utensils class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white leading-tight" style="font-family: var(--font-display);">
              {{ isEditing ? 'Editar Plan Nutricional' : 'Asignar Nuevo Plan Nutricional' }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ isEditing ? 'Ajusta requerimientos calóricos, macros, objetivo clínico o recalcula con el expediente.' : 'Propuesta automática basada en el expediente clínico + criterio y ajuste profesional del nutriólogo.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Scrollable Form Body -->
      <form @submit.prevent="handleSubmit" class="space-y-5 overflow-y-auto pr-1 pb-2 scrollbar-thin">
        
        <!-- SECTION 1: Identificación y Objetivo del Plan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nombre del Plan *
            </label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="ej. Plan Hipocalórico 1,800 kcal Fase 1"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Objetivo del Plan *</span>
              <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold lowercase">motor activo</span>
            </label>
            <select
              v-model="form.objetivoId"
              @change="onObjectiveChange"
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option
                v-for="obj in PLAN_OBJECTIVES"
                :key="obj.id"
                :value="obj.id"
                class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white"
              >
                {{ obj.label }}
              </option>
            </select>
            <div class="flex items-center justify-between mt-1.5 flex-wrap gap-1">
              <span class="text-[10px] text-slate-500 dark:text-slate-400">
                Delta: <strong :class="currentObjectiveDeltaClass">{{ currentObjectiveDeltaText }}</strong>
              </span>
              <button
                type="button"
                @click="onObjectiveChange"
                class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="Recalcular calorías y macros según este objetivo y el historial clínico"
              >
                <RotateCcw class="w-3 h-3" />
                <span>Recalcular con Historial</span>
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION 2: Resumen del Perfil Clínico Utilizado -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ClipboardList class="w-4 h-4 text-emerald-500" />
              <span>Perfil Clínico Utilizado para el Cálculo</span>
            </span>
            <button
              type="button"
              @click="$emit('goToHistory')"
              class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver / Editar Historial Clínico</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Micro KPIs Chips -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div class="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Peso Actual</p>
              <p class="font-extrabold text-slate-900 dark:text-white mt-0.5">{{ currentWeight ? `${currentWeight} kg` : 'No registrado' }}</p>
            </div>
            <div class="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Talla / IMC</p>
              <p class="font-extrabold text-slate-900 dark:text-white mt-0.5">
                {{ currentHeight ? `${currentHeight} cm` : '--' }} <span v-if="currentImc" class="text-slate-400 font-normal">({{ currentImc }})</span>
              </p>
            </div>
            <div class="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Composición</p>
              <p class="font-extrabold text-slate-900 dark:text-white mt-0.5">
                {{ currentFat ? `${currentFat}% Grasa` : (currentMuscle ? `${currentMuscle}kg Músc` : 'Por medir') }}
              </p>
            </div>
            <div class="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Actividad</p>
              <p class="font-extrabold text-slate-900 dark:text-white mt-0.5 capitalize truncate" :title="activityLevel">
                {{ activityLevel }}
              </p>
            </div>
          </div>

          <!-- Physical Activity Detail if available -->
          <p v-if="activityDetail" class="text-[11px] text-slate-600 dark:text-slate-400 italic">
            <strong>Rutina de entrenamiento:</strong> "{{ activityDetail }}"
          </p>

          <!-- Incomplete Data Banner if weight/height missing -->
          <div v-if="!engineResult.isComplete" class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span class="font-bold">Faltan datos indispensables para el cálculo automático:</span>
              <p class="mt-0.5">{{ engineResult.missingFields.join(', ') }}. Puedes completar el expediente en el historial o ingresar las calorías y macros manualmente abajo.</p>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Advertencias Clínicas Detectadas -->
        <div v-if="engineResult.advertenciasClinicas.length > 0" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div class="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            <ShieldAlert class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Condiciones Clínicas Relevantes Detectadas</span>
          </div>
          <ul class="space-y-1 text-xs text-amber-900 dark:text-amber-200 pl-5 list-disc">
            <li v-for="(warn, idx) in engineResult.advertenciasClinicas" :key="idx">
              {{ warn }}
            </li>
          </ul>
          <p class="text-[10px] text-amber-700 dark:text-amber-400 italic pt-1">
            * Las condiciones clínicas funcionan como contexto orientativo. El profesional conserva plena potestad para modificar las cantidades según su criterio clínico.
          </p>
        </div>

        <!-- SECTION 4: Selector de Fórmula y Gasto Energético -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Método de Cálculo Energético
              </span>
              <div class="relative group cursor-pointer">
                <Info class="w-4 h-4 text-slate-400 hover:text-emerald-500 transition-colors" />
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                  <p class="font-bold text-emerald-400 mb-1">Ecuaciones Disponibles:</p>
                  <p><strong>Mifflin-St Jeor:</strong> Estándar clínico para población general y deportistas.</p>
                  <p><strong>Katch-McArdle:</strong> Basada en masa libre de grasa (% de grasa corporal).</p>
                  <p><strong>Harris-Benedict:</strong> Ecuación clásica revisada por Roza & Shizgal.</p>
                  <p><strong>Gasto Fijo:</strong> Factor simplificado por kg de peso.</p>
                </div>
              </div>
            </div>

            <!-- Formula Selector Dropdown -->
            <select
              v-model="form.metodoTmb"
              @change="onMethodChange"
              class="px-3 py-1.5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="mifflin_st_jeor">Mifflin-St Jeor (Estándar)</option>
              <option value="katch_mcardle">Katch-McArdle (Masa Magra)</option>
              <option value="harris_benedict">Harris-Benedict (Revisada)</option>
              <option value="fijo_kg">Gasto Fijo por kg</option>
            </select>
          </div>

          <!-- Energy Expenditure Readout -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            <div class="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 relative group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold text-slate-400">TMB Estimada</span>
                <Info class="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500" />
              </div>
              <p class="text-sm font-black text-slate-900 dark:text-white mt-1">{{ engineResult.tmb }} kcal</p>
              <!-- Tooltip on hover -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.tmb }}
              </div>
            </div>

            <div class="p-3 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 relative group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold text-slate-400">GET (Mantenimiento)</span>
                <Info class="w-3.5 h-3.5 text-slate-400 hover:text-emerald-500" />
              </div>
              <p class="text-sm font-black text-slate-900 dark:text-white mt-1">{{ engineResult.get }} kcal</p>
              <!-- Tooltip on hover -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.get }}
              </div>
            </div>

            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 relative group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Calorías Propuestas</span>
                <Info class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p class="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-1">{{ engineResult.caloriasObjetivo }} kcal</p>
              <!-- Tooltip on hover -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.calorias }}
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 5: Distribución de Calorías y Macronutrientes (Totalmente Editables) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Distribución de Macronutrientes
            </span>
            <button
              v-if="hasManualModifications"
              type="button"
              @click="revertToEngineCalculations"
              class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Restaurar cálculo automático</span>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <!-- Calorías -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 relative group">
              <div class="flex items-center justify-between">
                <label class="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400">Calorías</label>
                <div class="flex items-center gap-1">
                  <span v-if="isFieldModified('calorias')" class="w-1.5 h-1.5 rounded-full bg-amber-500" title="Ajustado manualmente"></span>
                  <Info class="w-3 h-3 text-slate-400 hover:text-emerald-500 cursor-pointer" />
                </div>
              </div>
              <div class="flex items-baseline gap-1">
                <input
                  v-model.number="form.calorias"
                  @input="onFieldInput('calorias')"
                  type="number"
                  min="500"
                  max="8000"
                  required
                  class="w-full font-black text-base bg-white dark:bg-[#18181b] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <span class="text-[10px] font-bold text-slate-400">kcal</span>
              </div>
              <p class="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                Meta energética diaria
              </p>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.calorias }}
              </div>
            </div>

            <!-- Proteínas -->
            <div class="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1.5 relative group">
              <div class="flex items-center justify-between">
                <label class="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400">Proteína</label>
                <div class="flex items-center gap-1">
                  <span v-if="isFieldModified('protein')" class="w-1.5 h-1.5 rounded-full bg-amber-500" title="Ajustado manualmente"></span>
                  <Info class="w-3 h-3 text-blue-400 hover:text-blue-600 cursor-pointer" />
                </div>
              </div>
              <div class="flex items-baseline gap-1">
                <input
                  v-model.number="form.macros.protein"
                  @input="onFieldInput('protein')"
                  type="number"
                  min="0"
                  max="500"
                  required
                  class="w-full font-black text-base bg-white dark:bg-[#18181b] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-blue-500 text-blue-700 dark:text-blue-300"
                />
                <span class="text-[10px] font-bold text-blue-500">g</span>
              </div>
              <p class="text-[9px] font-bold text-blue-600 dark:text-blue-400">
                {{ currentWeight ? `${(form.macros.protein / currentWeight).toFixed(1)} g/kg` : '--' }} • {{ proteinKcalPercent }}%
              </p>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.proteina }}
              </div>
            </div>

            <!-- Carbohidratos -->
            <div class="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 relative group">
              <div class="flex items-center justify-between">
                <label class="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400">Carbos</label>
                <div class="flex items-center gap-1">
                  <span v-if="isFieldModified('carbs')" class="w-1.5 h-1.5 rounded-full bg-amber-500" title="Ajustado manualmente"></span>
                  <Info class="w-3 h-3 text-amber-400 hover:text-amber-600 cursor-pointer" />
                </div>
              </div>
              <div class="flex items-baseline gap-1">
                <input
                  v-model.number="form.macros.carbs"
                  @input="onFieldInput('carbs')"
                  type="number"
                  min="0"
                  max="1000"
                  required
                  class="w-full font-black text-base bg-white dark:bg-[#18181b] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-amber-500 text-amber-700 dark:text-amber-300"
                />
                <span class="text-[10px] font-bold text-amber-500">g</span>
              </div>
              <p class="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                {{ currentWeight ? `${(form.macros.carbs / currentWeight).toFixed(1)} g/kg` : '--' }} • {{ carbsKcalPercent }}%
              </p>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.carbos }}
              </div>
            </div>

            <!-- Grasas -->
            <div class="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1.5 relative group">
              <div class="flex items-center justify-between">
                <label class="text-[10px] uppercase font-extrabold text-rose-600 dark:text-rose-400">Grasas</label>
                <div class="flex items-center gap-1">
                  <span v-if="isFieldModified('fat')" class="w-1.5 h-1.5 rounded-full bg-amber-500" title="Ajustado manualmente"></span>
                  <Info class="w-3 h-3 text-rose-400 hover:text-rose-600 cursor-pointer" />
                </div>
              </div>
              <div class="flex items-baseline gap-1">
                <input
                  v-model.number="form.macros.fat"
                  @input="onFieldInput('fat')"
                  type="number"
                  min="0"
                  max="300"
                  required
                  class="w-full font-black text-base bg-white dark:bg-[#18181b] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-rose-500 text-rose-700 dark:text-rose-300"
                />
                <span class="text-[10px] font-bold text-rose-500">g</span>
              </div>
              <p class="text-[9px] font-bold text-rose-600 dark:text-rose-400">
                {{ currentWeight ? `${(form.macros.fat / currentWeight).toFixed(1)} g/kg` : '--' }} • {{ fatKcalPercent }}%
              </p>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-xl z-30 pointer-events-none leading-relaxed border border-white/10">
                {{ engineResult.tooltips.grasas }}
              </div>
            </div>

          </div>
        </div>

        <!-- SECTION 6: Estado de Auditoría & Consistencia Energética -->
        <div class="p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          :class="consistency.esConsistente ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'"
        >
          <!-- Audit Status Badge -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border"
                :class="hasManualModifications 
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'"
              >
                {{ hasManualModifications ? '✏️ Valores ajustados por el nutriólogo' : '✓ Calculado automáticamente' }}
              </span>
              <span v-if="hasManualModifications" class="text-[11px] text-slate-500 dark:text-slate-400">
                Original: {{ engineResult.caloriasObjetivo }} kcal ({{ engineResult.macros.protein }}P / {{ engineResult.macros.carbs }}C / {{ engineResult.macros.fat }}G)
              </span>
            </div>
            <p class="text-[11px] font-medium" :class="consistency.esConsistente ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'">
              {{ consistency.mensaje }}
            </p>
          </div>

          <!-- Quick Balance Helpers if inconsistent -->
          <div v-if="!consistency.esConsistente" class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="handleAutoBalanceCarbs"
              class="px-2.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50 text-[10px] font-bold hover:bg-amber-200 cursor-pointer transition-colors"
            >
              Equilibrar Carbos
            </button>
            <button
              type="button"
              @click="handleSyncKcalToMacros"
              class="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white text-[10px] font-bold hover:bg-slate-300 dark:hover:bg-white/20 cursor-pointer transition-colors"
            >
              Fijar {{ consistency.totalMacrosKcal }} kcal
            </button>
          </div>
        </div>

        <!-- SECTION 7: Preparación para Futura Generación de Menú (Comidas al Día) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Tiempos / Comidas al Día</span>
              <span class="text-[10px] text-slate-400">Para menú y distribución</span>
            </label>
            <input
              v-model.number="form.comidasSugeridas"
              type="number"
              min="2"
              max="7"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Estado del Plan
            </label>
            <select
              v-model="form.status"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="activo" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Activo (Plan actual del paciente)</option>
              <option value="completado" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Completado</option>
              <option value="archivado" class="bg-white dark:bg-[#1e1e24] text-slate-900 dark:text-white">Archivado (Borrador o fase previa)</option>
            </select>
          </div>
        </div>

        <!-- SECTION 8: Notas del Plan -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Indicaciones Clínicas y Notas del Plan
          </label>
          <textarea
            v-model="form.notas"
            rows="2"
            placeholder="Pautas sobre hidratación, horarios, suplementación, pre/post-entreno o ciclado de carbohidratos..."
            class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          ></textarea>
        </div>

        <!-- Modal Footer Actions -->
        <div class="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Save class="w-4 h-4" />
            <span>{{ isEditing ? 'Actualizar Plan Nutricional' : 'Guardar Plan Nutricional' }}</span>
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { 
  Utensils, 
  X, 
  Save, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  ClipboardList, 
  RotateCcw, 
  ExternalLink 
} from 'lucide-vue-next';
import type { 
  Patient, 
  ClinicalHistory, 
  PatientMeasurement, 
  PatientDietPlan 
} from '../../../types/patient';
import { 
  NutritionEngineService, 
  PLAN_OBJECTIVES, 
  type BmrFormula, 
  type NutritionEngineResult 
} from '../../../services/nutrition/NutritionEngineService';

const props = defineProps<{
  patient: Patient;
  clinicalHistory?: ClinicalHistory | null;
  measurements?: PatientMeasurement[];
  editingPlan?: PatientDietPlan | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', plan: Omit<PatientDietPlan, 'id' | 'createdAt'> & { id?: string; menu?: any; createdAt?: string }): void;
  (e: 'goToHistory'): void;
}>();

const isEditing = computed(() => Boolean(props.editingPlan));

// Extraer métricas más recientes del paciente
const latestMeasurement = computed(() => {
  if (!props.measurements || props.measurements.length === 0) return null;
  return props.measurements[props.measurements.length - 1];
});

const currentWeight = computed(() => {
  return Number(latestMeasurement.value?.Peso) || null;
});

const currentHeight = computed(() => {
  return Number(latestMeasurement.value?.Talla) || null;
});

const currentImc = computed(() => {
  return latestMeasurement.value?.IMC || null;
});

const currentFat = computed(() => {
  return Number(latestMeasurement.value?.Grasa_Porcentaje || latestMeasurement.value?.Grasa_Formula) || null;
});

const currentMuscle = computed(() => {
  return Number(latestMeasurement.value?.Musculo_Kg) || null;
});

const currentAge = computed(() => {
  return Number(latestMeasurement.value?.Edad || props.patient.edad) || 28;
});

const activityLevel = computed(() => {
  return props.clinicalHistory?.estiloDeVida?.nivelActividad || 'moderado';
});

const activityDetail = computed(() => {
  return props.clinicalHistory?.estiloDeVida?.actividadFisicaDetalle || '';
});

// Detectar objetivo inicial canónico
function getInitialObjective(): string {
  const goal = (props.patient.objetivoPrincipal || '').toLowerCase();
  if (goal.includes('grasa') || goal.includes('déficit') || goal.includes('deficit')) return 'Pérdida de grasa';
  if (goal.includes('hipertrofia') || goal.includes('masa') || goal.includes('músculo') || goal.includes('musculo')) return 'Ganancia de masa muscular';
  if (goal.includes('recomposición') || goal.includes('recomposicion')) return 'Recomposición corporal';
  if (goal.includes('rendimiento') || goal.includes('deporte') || goal.includes('atleta')) return 'Rendimiento deportivo';
  if (goal.includes('subir') || goal.includes('ganancia de peso')) return 'Ganancia de peso';
  if (goal.includes('digestiv') || goal.includes('gastrit') || goal.includes('clínic') || goal.includes('clinic')) return 'Salud digestiva / clínica';
  if (goal.includes('mantenimiento') || goal.includes('hábito') || goal.includes('habito')) return 'Mantenimiento de peso';
  return 'Mantenimiento de peso';
}

function resolveObjective(objName?: string): string {
  if (!objName) return getInitialObjective();
  const exact = PLAN_OBJECTIVES.find(o => o.id.toLowerCase() === objName.toLowerCase());
  if (exact) return exact.id;
  const lower = objName.toLowerCase();
  if (lower.includes('grasa') || lower.includes('déficit') || lower.includes('deficit') || (lower.includes('peso') && lower.includes('bajar'))) return 'Pérdida de grasa';
  if (lower.includes('muscul') || lower.includes('hipertrofia') || lower.includes('masa')) return 'Ganancia de masa muscular';
  if (lower.includes('recomp')) return 'Recomposición corporal';
  if (lower.includes('mantenimiento')) return 'Mantenimiento de peso';
  if (lower.includes('subir') || lower.includes('ganancia de peso')) return 'Ganancia de peso';
  if (lower.includes('deport') || lower.includes('rendimiento')) return 'Rendimiento deportivo';
  if (lower.includes('digestiv') || lower.includes('clinic') || lower.includes('clínic')) return 'Salud digestiva / clínica';
  return 'Mantenimiento de peso';
}

const form = reactive({
  nombre: props.editingPlan?.nombre || '',
  objetivoId: resolveObjective(props.editingPlan?.objetivo),
  metodoTmb: (props.editingPlan?.metodoCalculo as BmrFormula) || 'mifflin_st_jeor',
  calorias: props.editingPlan?.calorias ?? 1800,
  macros: {
    protein: props.editingPlan?.macros?.protein ?? 130,
    carbs: props.editingPlan?.macros?.carbs ?? 180,
    fat: props.editingPlan?.macros?.fat ?? 55
  },
  comidasSugeridas: props.editingPlan?.comidasSugeridas || props.clinicalHistory?.preferenciasAlimentarias?.comidasAlDia || 5,
  status: props.editingPlan?.status || 'activo',
  notas: props.editingPlan?.notas || ''
});

// Guardar qué campos han sido modificados manualmente por el profesional
const modifiedFields = reactive<Record<string, boolean>>({
  calorias: false,
  protein: false,
  carbs: false,
  fat: false
});

// Información dinámica del objetivo seleccionado
const currentObjectiveOption = computed(() => {
  return PLAN_OBJECTIVES.find(o => o.id === form.objetivoId);
});

const currentObjectiveDeltaText = computed(() => {
  const opt = currentObjectiveOption.value;
  if (!opt) return '--';
  if (opt.caloricDeltaPercent > 0) return `+${opt.caloricDeltaPercent}% (Superávit)`;
  if (opt.caloricDeltaPercent < 0) return `${opt.caloricDeltaPercent}% (Déficit)`;
  return '0% (Mantenimiento)';
});

const currentObjectiveDeltaClass = computed(() => {
  const opt = currentObjectiveOption.value;
  if (!opt) return 'text-slate-400';
  if (opt.caloricDeltaPercent > 0) return 'text-blue-500 dark:text-blue-400';
  if (opt.caloricDeltaPercent < 0) return 'text-amber-500 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
});

// Resultado del motor de cálculo automático
const engineResult = ref<NutritionEngineResult>(getEngineCalculations());

function getEngineCalculations(): NutritionEngineResult {
  return NutritionEngineService.calculateNutritionPlan({
    peso: currentWeight.value,
    talla: currentHeight.value,
    edad: currentAge.value,
    sexo: props.patient.sexo || 'M',
    grasaPorcentaje: currentFat.value,
    musculoKg: currentMuscle.value,
    nivelActividad: activityLevel.value,
    actividadFisicaDetalle: activityDetail.value,
    objetivoId: form.objetivoId,
    clinicalHistory: props.clinicalHistory,
    alertasMedicas: props.patient.alertasMedicas || [],
    metodoTmb: form.metodoTmb
  });
}

function recalculateFromEngine(force = false) {
  engineResult.value = getEngineCalculations();

  if (!modifiedFields.calorias || force) {
    form.calorias = engineResult.value.caloriasObjetivo;
  }
  if (!modifiedFields.protein || force) {
    form.macros.protein = engineResult.value.macros.protein;
  }
  if (!modifiedFields.carbs || force) {
    form.macros.carbs = engineResult.value.macros.carbs;
  }
  if (!modifiedFields.fat || force) {
    form.macros.fat = engineResult.value.macros.fat;
  }

  // Sugerir nombre predeterminado si está vacío o coincide con el genérico
  if (!form.nombre || form.nombre.startsWith('Plan ') || form.nombre.toLowerCase() === 'plan nutricional') {
    form.nombre = `Plan ${form.objetivoId} ${form.calorias.toLocaleString()} kcal`;
  }
}

function onObjectiveChange() {
  engineResult.value = getEngineCalculations();
  form.calorias = engineResult.value.caloriasObjetivo;
  form.macros.protein = engineResult.value.macros.protein;
  form.macros.carbs = engineResult.value.macros.carbs;
  form.macros.fat = engineResult.value.macros.fat;

  modifiedFields.calorias = false;
  modifiedFields.protein = false;
  modifiedFields.carbs = false;
  modifiedFields.fat = false;

  if (!form.nombre || form.nombre.startsWith('Plan ') || form.nombre.toLowerCase() === 'plan nutricional') {
    form.nombre = `Plan ${form.objetivoId} ${form.calorias.toLocaleString()} kcal`;
  }
}

function onMethodChange() {
  engineResult.value = getEngineCalculations();
  if (!modifiedFields.calorias) {
    form.calorias = engineResult.value.caloriasObjetivo;
  }
  if (!modifiedFields.protein) {
    form.macros.protein = engineResult.value.macros.protein;
  }
  if (!modifiedFields.carbs) {
    form.macros.carbs = engineResult.value.macros.carbs;
  }
  if (!modifiedFields.fat) {
    form.macros.fat = engineResult.value.macros.fat;
  }
}

function onFieldInput(field: 'calorias' | 'protein' | 'carbs' | 'fat') {
  modifiedFields[field] = true;
}

function isFieldModified(field: string): boolean {
  return Boolean(modifiedFields[field]);
}

const hasManualModifications = computed(() => {
  return modifiedFields.calorias || modifiedFields.protein || modifiedFields.carbs || modifiedFields.fat;
});

function revertToEngineCalculations() {
  modifiedFields.calorias = false;
  modifiedFields.protein = false;
  modifiedFields.carbs = false;
  modifiedFields.fat = false;
  onObjectiveChange();
}

// Porcentajes calóricos dinámicos de cada macronutriente
const totalCurrentKcal = computed(() => {
  return (form.macros.protein * 4) + (form.macros.carbs * 4) + (form.macros.fat * 9);
});

const proteinKcalPercent = computed(() => {
  const base = form.calorias > 0 ? form.calorias : (totalCurrentKcal.value || 1);
  return Math.round(((form.macros.protein * 4) / base) * 100);
});

const carbsKcalPercent = computed(() => {
  const base = form.calorias > 0 ? form.calorias : (totalCurrentKcal.value || 1);
  return Math.round(((form.macros.carbs * 4) / base) * 100);
});

const fatKcalPercent = computed(() => {
  const base = form.calorias > 0 ? form.calorias : (totalCurrentKcal.value || 1);
  return Math.round(((form.macros.fat * 9) / base) * 100);
});

// Consistencia energética en tiempo real
const consistency = computed(() => {
  return NutritionEngineService.verifyCaloricConsistency(
    form.calorias,
    form.macros.protein,
    form.macros.carbs,
    form.macros.fat
  );
});

function handleAutoBalanceCarbs() {
  form.macros.carbs = NutritionEngineService.balanceCarbsToTarget(
    form.calorias,
    form.macros.protein,
    form.macros.fat
  );
  modifiedFields.carbs = true;
}

function handleSyncKcalToMacros() {
  form.calorias = consistency.value.totalMacrosKcal;
  modifiedFields.calorias = true;
}

onMounted(() => {
  engineResult.value = getEngineCalculations();
  if (!props.editingPlan) {
    recalculateFromEngine(true);
  } else {
    // Si el plan ya venía con datos, verificar si difiere del cálculo de referencia
    if (
      props.editingPlan.fuenteCalculo === 'ajustado' ||
      props.editingPlan.calorias !== engineResult.value.caloriasObjetivo ||
      props.editingPlan.macros?.protein !== engineResult.value.macros.protein ||
      props.editingPlan.macros?.carbs !== engineResult.value.macros.carbs ||
      props.editingPlan.macros?.fat !== engineResult.value.macros.fat
    ) {
      modifiedFields.calorias = true;
      modifiedFields.protein = true;
      modifiedFields.carbs = true;
      modifiedFields.fat = true;
    }
  }
});

watch(() => [currentWeight.value, currentHeight.value, props.clinicalHistory], () => {
  if (!props.editingPlan) {
    recalculateFromEngine();
  }
}, { deep: true });

function handleSubmit() {
  if (!form.nombre.trim()) return;

  const fuenteCalculo: 'automatico' | 'ajustado' | 'manual' = !engineResult.value.isComplete
    ? 'manual'
    : (hasManualModifications.value ? 'ajustado' : 'automatico');

  const payload: Omit<PatientDietPlan, 'id' | 'createdAt'> & { id?: string; menu?: any; createdAt?: string } = {
    ...(props.editingPlan ? {
      id: props.editingPlan.id,
      createdAt: props.editingPlan.createdAt,
      ...(props.editingPlan.menu ? { menu: props.editingPlan.menu } : {})
    } : {}),
    nombre: form.nombre.trim(),
    fechaAsignacion: props.editingPlan?.fechaAsignacion || new Date().toISOString().split('T')[0],
    status: form.status,
    calorias: form.calorias,
    macros: {
      protein: form.macros.protein,
      carbs: form.macros.carbs,
      fat: form.macros.fat
    },
    objetivo: form.objetivoId,
    fuenteCalculo,
    metodoCalculo: form.metodoTmb,
    ...(engineResult.value.isComplete ? {
      calculoOriginal: {
        calorias: engineResult.value.caloriasObjetivo,
        macros: {
          protein: engineResult.value.macros.protein,
          carbs: engineResult.value.macros.carbs,
          fat: engineResult.value.macros.fat
        }
      }
    } : (props.editingPlan?.calculoOriginal ? { calculoOriginal: props.editingPlan.calculoOriginal } : {})),
    ...(hasManualModifications.value ? {
      ajustesNutriologo: {
        calorias: form.calorias,
        macros: {
          protein: form.macros.protein,
          carbs: form.macros.carbs,
          fat: form.macros.fat
        }
      }
    } : {}),
    parametrosCalculo: {
      ...engineResult.value.snapshot,
      caloriasObjetivo: form.calorias,
      proteinaGramos: form.macros.protein,
      carbosGramos: form.macros.carbs,
      grasasGramos: form.macros.fat
    },
    advertenciasClinicas: engineResult.value.advertenciasClinicas || [],
    comidasSugeridas: form.comidasSugeridas,
    notas: form.notas.trim()
  };

  emit('save', payload as any);
}
</script>
