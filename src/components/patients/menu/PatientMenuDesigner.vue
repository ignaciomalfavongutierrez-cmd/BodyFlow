<template>
  <div class="space-y-6 max-w-7xl mx-auto w-full pb-16">
    
    <!-- TOP BAR: Navigation, Patient Context, Save & Export Actions -->
    <div class="bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-30 backdrop-blur-xl">
      
      <!-- Left: Back Button & Plan Title -->
      <div class="flex items-center gap-3">
        <button
          @click="$emit('back')"
          class="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all cursor-pointer shrink-0"
          title="Volver a planes"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-400">Paciente: {{ patient.nombre }}</span>
            <span v-if="plan.objetivo" class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              🎯 {{ plan.objetivo }}
            </span>
          </div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 leading-tight" style="font-family: var(--font-display);">
            Diseñador de Menú • {{ plan.nombre }}
          </h2>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="flex items-center gap-2 flex-wrap">
        
        <!-- Export Word Button -->
        <button
          type="button"
          @click="handleExportWord"
          class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center gap-1.5 cursor-pointer"
          title="Descargar documento Word editable"
        >
          <FileText class="w-3.5 h-3.5 text-blue-500" />
          <span class="hidden sm:inline">Word</span>
        </button>

        <!-- Export PDF Button -->
        <button
          type="button"
          @click="handleExportPDF"
          class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-white/10 flex items-center gap-1.5 cursor-pointer"
          title="Descargar PDF institucional membretado"
        >
          <Printer class="w-3.5 h-3.5 text-emerald-500" />
          <span class="hidden sm:inline">PDF</span>
        </button>

        <!-- WhatsApp Button -->
        <button
          type="button"
          @click="showWhatsAppModal = true"
          class="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          title="Enviar menú y lista de compras por WhatsApp"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">WhatsApp</span>
        </button>

        <!-- Save Menu Button -->
        <button
          type="button"
          @click="handleSaveMenu"
          :disabled="isSaving"
          class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
        >
          <Save v-if="!isSaving" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
          <span>{{ isSaving ? 'Guardando...' : 'Guardar Menú' }}</span>
        </button>
      </div>
    </div>

    <!-- NOTIFICATION BANNERS / TOAST -->
    <transition name="fade">
      <div v-if="saveSuccess" class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
        <span>¡Menú nutricional guardado exitosamente en el expediente del paciente!</span>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showToast" class="p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-bold flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
        <button @click="showToast = false" class="opacity-70 hover:opacity-100 cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition>

    <!-- DEDICATED 7-DAY NAVIGATION & CLONING SUITE -->
    <div class="bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      
      <!-- Top Controls Row: Structure Mode & Day Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3.5">
        
        <!-- Structure Mode Selector -->
        <div class="flex items-center gap-2.5">
          <Calendar class="w-4 h-4 text-emerald-500 shrink-0" />
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Estructura del Plan:</span>
          <select
            v-model="menuData.tipoEstructura"
            @change="handleStructureChange"
            class="px-3 py-1.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="siete_dias">📅 7 Días Personalizados (Lunes a Domingo)</option>
            <option value="semana_fin">🗓️ Lunes a Viernes + Fin de Semana</option>
            <option value="dia_tipo">📄 Día Tipo Único (Guía Diaria)</option>
          </select>
        </div>

        <!-- Day Tools Actions: Copiar día, Replicar día, Vaciar -->
        <div class="flex items-center gap-2 flex-wrap">
          
          <!-- Copiar Menú de Otro Día -->
          <button
            type="button"
            @click="showCopyDayModal = true"
            class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Copiar los platillos de otro día a este día"
          >
            <Copy class="w-3.5 h-3.5" />
            <span>Copiar menú de otro día</span>
          </button>

          <!-- Replicar este día a la semana -->
          <button
            type="button"
            @click="showReplicateModal = true"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Replicar este menú a otros días de la semana"
          >
            <Repeat class="w-3.5 h-3.5 text-blue-500" />
            <span>Replicar día...</span>
          </button>

          <!-- Vaciar platillos de este día -->
          <button
            type="button"
            @click="confirmClearDay"
            class="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
            title="Vaciar platillos del día activo"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Day Tabs Bar (7 Days / Weekly Mode) -->
      <div 
        class="grid gap-2"
        :class="menuData.dias.length === 7 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7' : (menuData.dias.length === 2 ? 'grid-cols-2' : 'grid-cols-1')"
      >
        <button
          v-for="(dia, idx) in menuData.dias"
          :key="dia.diaId"
          type="button"
          @click="activeDayIndex = idx"
          class="p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          :class="[
            activeDayIndex === idx
              ? 'bg-emerald-500/10 dark:bg-emerald-500/[0.14] border-2 border-emerald-500 dark:border-emerald-400 text-slate-900 dark:text-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/25'
              : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
          ]"
        >
          <!-- Top Row: Day Name & Dot Indicator -->
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs font-black uppercase tracking-wider">
              {{ dia.diaNombre }}
            </span>
            <span 
              class="w-2 h-2 rounded-full shrink-0"
              :class="getDayStatusDotClass(dia, activeDayIndex === idx)"
            ></span>
          </div>

          <!-- Bottom Row: Calories & Dishes count -->
          <div class="mt-2 pt-1.5 border-t flex items-center justify-between text-[10px]"
            :class="activeDayIndex === idx ? 'border-emerald-500/25 dark:border-emerald-500/20' : 'border-slate-200/60 dark:border-white/5'"
          >
            <span class="font-black" :class="activeDayIndex === idx ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'">
              {{ getDayKcal(dia) > 0 ? `${getDayKcal(dia)} kcal` : '0 kcal' }}
            </span>
            <span 
              class="text-[9px] font-bold"
              :class="activeDayIndex === idx ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-400'"
            >
              {{ getDayDishCount(dia) > 0 ? `${getDayDishCount(dia)} platillos` : 'Vacío' }}
            </span>
          </div>
        </button>
      </div>

    </div>

    <!-- LIVE MACRO TRACKER BAR (RESTADOR DINÁMICO DEL DÍA ACTIVO) -->
    <div class="bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-emerald-500" />
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Balance Energético: {{ activeDay.diaNombre.toUpperCase() }}
          </h3>
        </div>
        <span
          class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border self-start sm:self-auto"
          :class="isDayBalanced ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'"
        >
          {{ isDayBalanced ? '✓ Meta Diaria Cumplida (±5%)' : 'En Construcción / Ajuste' }}
        </span>
      </div>

      <!-- Live Macro Progress Counters -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        
        <!-- Calorías -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold text-slate-400">Calorías</span>
            <span class="font-black text-slate-900 dark:text-white">{{ dayTotals.calories }} / {{ plan.calorias }} kcal</span>
          </div>
          <!-- Progress Bar -->
          <div class="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="dayTotals.calories > plan.calorias ? 'bg-rose-500' : 'bg-emerald-500'"
              :style="{ width: `${Math.min(100, (dayTotals.calories / plan.calorias) * 100)}%` }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[10px] font-bold">
            <span :class="remainingKcal >= 0 ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500'">
              {{ remainingKcal >= 0 ? `Restan: ${remainingKcal} kcal` : `Excedente: +${Math.abs(remainingKcal)} kcal` }}
            </span>
            <span class="text-slate-400">{{ Math.round((dayTotals.calories / plan.calorias) * 100) }}%</span>
          </div>
        </div>

        <!-- Proteína -->
        <div class="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold text-blue-500">Proteína</span>
            <span class="font-black text-blue-700 dark:text-blue-300">{{ dayTotals.protein }}g / {{ plan.macros.protein }}g</span>
          </div>
          <div class="w-full bg-blue-200 dark:bg-blue-950/40 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, (dayTotals.protein / (plan.macros.protein || 1)) * 100)}%` }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <span>{{ remainingProtein >= 0 ? `Faltan: ${remainingProtein}g` : `+${Math.abs(remainingProtein)}g extra` }}</span>
            <span>{{ Math.round((dayTotals.protein / (plan.macros.protein || 1)) * 100) }}%</span>
          </div>
        </div>

        <!-- Carbohidratos -->
        <div class="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold text-amber-500">Carbos</span>
            <span class="font-black text-amber-700 dark:text-amber-300">{{ dayTotals.carbs }}g / {{ plan.macros.carbs }}g</span>
          </div>
          <div class="w-full bg-amber-200 dark:bg-amber-950/40 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-amber-500 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, (dayTotals.carbs / (plan.macros.carbs || 1)) * 100)}%` }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <span>{{ remainingCarbs >= 0 ? `Faltan: ${remainingCarbs}g` : `+${Math.abs(remainingCarbs)}g extra` }}</span>
            <span>{{ Math.round((dayTotals.carbs / (plan.macros.carbs || 1)) * 100) }}%</span>
          </div>
        </div>

        <!-- Grasas -->
        <div class="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase font-bold text-rose-500">Grasas</span>
            <span class="font-black text-rose-700 dark:text-rose-300">{{ dayTotals.fat }}g / {{ plan.macros.fat }}g</span>
          </div>
          <div class="w-full bg-rose-200 dark:bg-rose-950/40 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-rose-500 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(100, (dayTotals.fat / (plan.macros.fat || 1)) * 100)}%` }"
            ></div>
          </div>
          <div class="flex items-center justify-between text-[10px] font-bold text-rose-600 dark:text-rose-400">
            <span>{{ remainingFat >= 0 ? `Faltan: ${remainingFat}g` : `+${Math.abs(remainingFat)}g extra` }}</span>
            <span>{{ Math.round((dayTotals.fat / (plan.macros.fat || 1)) * 100) }}%</span>
          </div>
        </div>

      </div>
    </div>

    <!-- MAIN DESIGNER LAYOUT: MEAL TIMES LIST (LEFT) & DISH LIBRARY DRAWER (RIGHT) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- LEFT COLUMN: MEAL TIMES (8 Cols on Desktop) -->
      <div class="lg:col-span-8 space-y-4">
        
        <!-- Individual Meal Cards -->
        <div
          v-for="cat in activeMealTimes"
          :key="cat.key"
          @click="selectMealTime(cat.key)"
          class="p-5 rounded-3xl transition-all cursor-pointer space-y-3 relative group/card overflow-hidden"
          :class="[
            selectedTargetCategory === cat.key
              ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14] border-2 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/25 shadow-xl shadow-emerald-500/10'
              : 'bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
          ]"
        >
          <!-- Active Pill Accent on left edge -->
          <div
            v-if="selectedTargetCategory === cat.key"
            class="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-500 rounded-r-full shadow-sm shadow-emerald-500"
          ></div>

          <!-- Meal Time Header -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
            
            <!-- Left: Icon & Label (or inline editor) -->
            <div class="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
              <span class="text-2xl shrink-0">{{ cat.icon }}</span>
              
              <!-- If in edit mode -->
              <div v-if="editingMealKey === cat.key" class="flex items-center gap-2 flex-wrap flex-1" @click.stop>
                <input
                  v-model="editingMealName"
                  type="text"
                  placeholder="Nombre de la comida"
                  class="px-2.5 py-1 bg-white dark:bg-[#201f22] border-2 border-emerald-500 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                  @keyup.enter="saveEditingMeal(cat)"
                />
                <input
                  v-model="editingMealTime"
                  type="text"
                  placeholder="Horario (ej. 10:00 AM)"
                  class="w-24 px-2 py-1 bg-white dark:bg-[#201f22] border border-slate-300 dark:border-white/20 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 outline-none"
                  @keyup.enter="saveEditingMeal(cat)"
                />
                <button
                  type="button"
                  @click="saveEditingMeal(cat)"
                  class="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  title="Guardar nombre"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <button
                  type="button"
                  @click="cancelEditingMeal"
                  class="p-1 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Cancelar"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Normal display mode -->
              <div v-else class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-black text-slate-900 dark:text-white text-sm truncate">
                    {{ cat.label }}
                  </h4>

                  <!-- Active selection badge -->
                  <span
                    v-if="selectedTargetCategory === cat.key"
                    class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-black shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <Check class="w-2.5 h-2.5 stroke-[3]" />
                    Activo
                  </span>

                  <!-- Rename button (pencil) -->
                  <button
                    type="button"
                    @click.stop="startEditingMeal(cat)"
                    class="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Renombrar tiempo de comida u horario"
                  >
                    <Edit2 class="w-3 h-3" />
                  </button>
                </div>
                <p class="text-[10px] text-slate-400">Horario sugerido: {{ cat.defaultTime }}</p>
              </div>
            </div>

            <!-- Right: Subtotal, Add Button & Delete Meal Time Button -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                {{ getMealTimeSubtotal(cat.key).calories }} kcal
              </span>

              <!-- Add Dish Button -->
              <button
                type="button"
                @click.stop="selectMealTime(cat.key)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                :class="selectedTargetCategory === cat.key
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-500/40 shadow-sm font-black'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700/50'"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>{{ selectedTargetCategory === cat.key ? 'Asignando Aquí' : 'Agregar Platillo' }}</span>
              </button>

              <!-- Delete Meal Time Button -->
              <button
                type="button"
                @click.stop="removeMealTime(cat.key)"
                class="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Eliminar este tiempo de comida"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Dishes in this Meal Time -->
          <div 
            v-if="!activeDay.comidas[cat.key] || activeDay.comidas[cat.key].length === 0" 
            @click.stop="selectMealTime(cat.key)"
            class="py-4 px-3 text-center text-xs rounded-2xl border border-dashed transition-all cursor-pointer"
            :class="selectedTargetCategory === cat.key
              ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200'
              : 'border-slate-200 dark:border-white/10 text-slate-400 hover:border-emerald-500/30'"
          >
            Sin platillos asignados para este tiempo el {{ activeDay.diaNombre }}.
            <span class="block mt-0.5 font-bold" :class="selectedTargetCategory === cat.key ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
              {{ selectedTargetCategory === cat.key ? '👈 Selecciona platillos de la biblioteca a la derecha para agregarlos.' : 'Haz clic aquí o en "Agregar Platillo" para seleccionarlo.' }}
            </span>
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="(dish, dIdx) in activeDay.comidas[cat.key]"
              :key="dish.id || dIdx"
              class="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 group/item"
              @click.stop
            >
              <div class="space-y-1 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h5 class="font-bold text-slate-900 dark:text-white text-xs">
                    {{ dish.nombre }}
                  </h5>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    {{ dish.porcion }}
                  </span>
                </div>

                <p v-if="dish.descripcion" class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ dish.descripcion }}
                </p>

                <!-- Ingredients Pills -->
                <div v-if="dish.ingredientes && dish.ingredientes.length > 0" class="flex flex-wrap gap-1 pt-0.5">
                  <span
                    v-for="(ing, iIdx) in dish.ingredientes"
                    :key="iIdx"
                    class="text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-[#18181b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5"
                  >
                    {{ ing }}
                  </span>
                </div>

                <!-- Dish Macros Badges -->
                <div class="flex items-center gap-3 pt-1 text-[10px] font-extrabold">
                  <span class="text-slate-800 dark:text-slate-200">{{ dish.macros.calories }} kcal</span>
                  <span class="text-blue-600 dark:text-blue-400">{{ dish.macros.protein }}g P</span>
                  <span class="text-amber-600 dark:text-amber-400">{{ dish.macros.carbs }}g C</span>
                  <span class="text-rose-600 dark:text-rose-400">{{ dish.macros.fat }}g G</span>
                </div>
              </div>

              <!-- Action buttons on dish -->
              <div class="flex items-center gap-1 shrink-0">
                <!-- Edit Dish Portions & Ingredients -->
                <button
                  type="button"
                  @click.stop="openEditDishPortions(cat.key, dIdx, dish)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-all cursor-pointer opacity-80 group-hover/item:opacity-100"
                  title="Personalizar porciones e ingredientes"
                >
                  <SlidersHorizontal class="w-4 h-4" />
                </button>

                <!-- Delete Dish from Meal -->
                <button
                  type="button"
                  @click.stop="removeDish(cat.key, dIdx)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer opacity-80 group-hover/item:opacity-100"
                  title="Quitar platillo"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- BUTTON: ADD NEW MEAL TIME (BOTTOM) -->
        <button
          type="button"
          @click="showAddMealModal = true"
          class="w-full py-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-emerald-500 hover:bg-emerald-500/5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <Plus class="w-4 h-4" />
          <span>+ Agregar Nuevo Tiempo de Comida (ej. Snack Pre-Entreno, Colación Nocturna)</span>
        </button>

      </div>

      <!-- RIGHT COLUMN: HYBRID DISH LIBRARY & AI SUGGESTER (4 Cols on Desktop) -->
      <div class="lg:col-span-4 space-y-4 sticky top-36">
        
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          
          <!-- Library Header -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div class="flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-emerald-500" />
              <h3 class="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Biblioteca de Platillos
              </h3>
            </div>

            <!-- Create Custom Dish Trigger -->
            <button
              type="button"
              @click="showCreateCustomModal = true"
              class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Crear</span>
            </button>
          </div>

          <!-- Target Meal Time Selector (Synchronized with the active card) -->
          <div 
            class="p-3.5 rounded-2xl border transition-all space-y-1.5 bg-emerald-500/[0.08] border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <label class="block text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                Agregando platillos a:
              </label>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                {{ activeDay.diaNombre }}
              </span>
            </div>
            
            <select
              v-model="selectedTargetCategory"
              class="w-full px-3 py-2 bg-white dark:bg-[#201f22] border border-emerald-500/40 rounded-xl text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option v-for="cat in activeMealTimes" :key="cat.key" :value="cat.key">
                {{ cat.icon }} {{ cat.label }} ({{ getMealTimeSubtotal(cat.key).calories }} kcal)
              </option>
            </select>
          </div>

          <!-- Search Filter -->
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre o ingrediente..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Category Chips (Wrapped so all filters are visible without cut-off) -->
          <div class="flex flex-wrap items-center gap-1.5 text-[10px]">
            <button
              v-for="filter in libraryFilters"
              :key="filter.id"
              @click="libraryFilter = filter.id"
              class="px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer"
              :class="libraryFilter === filter.id 
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black shadow-xs ring-1 ring-emerald-500/30' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'"
            >
              {{ filter.label }}
            </button>
          </div>

          <!-- AI Assistant Suggestion Button -->
          <button
            type="button"
            @click="generateAiSuggestion"
            :disabled="isGeneratingAi"
            class="w-full py-2.5 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles v-if="!isGeneratingAi" class="w-4 h-4 text-emerald-500" />
            <Loader2 v-else class="w-4 h-4 animate-spin text-emerald-500" />
            <span>{{ isGeneratingAi ? 'Analizando macros faltantes...' : '✨ Sugerir con IA para macros restantes' }}</span>
          </button>

          <!-- AI Suggestion Card Result -->
          <div v-if="aiSuggestedDish" class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                Sugerencia IA para {{ activeDay.diaNombre }}
              </span>
              <button @click="aiSuggestedDish = null" class="text-slate-400 hover:text-white">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="text-xs font-bold text-slate-900 dark:text-white">{{ aiSuggestedDish.nombre }}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-300">{{ aiSuggestedDish.descripcion }}</p>
            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {{ aiSuggestedDish.macros.calories }} kcal • {{ aiSuggestedDish.macros.protein }}g P
              </span>
              <button
                type="button"
                @click="addDishToCurrentMeal(aiSuggestedDish)"
                class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer"
              >
                + Añadir
              </button>
            </div>
          </div>

          <!-- Dishes Scrollable List -->
          <div class="space-y-2 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
            <div
              v-for="dish in filteredLibraryDishes"
              :key="dish.id"
              class="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all space-y-1.5 group"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {{ dish.nombre }}
                    </h5>
                    <span v-if="dish.esPersonalizado" class="text-[8px] uppercase font-black px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Personalizado
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ dish.porcion }}</p>
                </div>

                <button
                  type="button"
                  @click="addDishToCurrentMeal(dish)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  + Añadir
                </button>
              </div>

              <!-- Mini Macros Bar -->
              <div class="flex items-center gap-2 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                <span class="text-slate-800 dark:text-slate-200">{{ dish.macros.calories }} kcal</span>
                <span class="text-blue-500">{{ dish.macros.protein }}g P</span>
                <span class="text-amber-500">{{ dish.macros.carbs }}g C</span>
                <span class="text-rose-500">{{ dish.macros.fat }}g G</span>
              </div>
            </div>

            <div v-if="filteredLibraryDishes.length === 0" class="py-8 text-center text-xs text-slate-400">
              No se encontraron platillos con ese término de búsqueda.
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- MODAL 1: COPIAR MENÚ DE OTRO DÍA -->
    <div
      v-if="showCopyDayModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-card max-w-lg w-full p-6 rounded-3xl border border-white/20 shadow-2xl relative bg-white dark:bg-[#18181b] text-slate-900 dark:text-white space-y-4 max-h-[90vh] flex flex-col">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Copy class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-black leading-tight">Copiar Menú a {{ activeDay.diaNombre }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Selecciona el día de origen cuyos platillos deseas duplicar</p>
            </div>
          </div>
          <button @click="showCopyDayModal = false" class="text-slate-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Available Source Days List -->
        <div class="space-y-2 overflow-y-auto pr-1 flex-1">
          <div
            v-for="(dia, idx) in availableSourceDays"
            :key="dia.diaId"
            @click="selectedSourceDayIndex = idx"
            class="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3"
            :class="[
              selectedSourceDayIndex === idx
                ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-white/5'
            ]"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-black text-xs uppercase">{{ dia.diaNombre }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#18181b] text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-white/10">
                  {{ getDayKcal(dia) }} kcal
                </span>
                <span class="text-[10px] text-slate-400 font-medium">
                  {{ getDayDishCount(dia) }} platillos
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {{ getDayDishesPreview(dia) }}
              </p>
            </div>

            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="selectedSourceDayIndex === idx ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-white/20'"
            >
              <Check v-if="selectedSourceDayIndex === idx" class="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <div v-if="availableSourceDays.length === 0" class="py-6 text-center text-xs text-slate-400">
            Aún no hay otros días con platillos asignados para copiar. Primero asigna platillos a algún día (ej. Lunes).
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            @click="showCopyDayModal = false"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="selectedSourceDayIndex === null"
            @click="handleApplyCopyDay"
            class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            Copiar a {{ activeDay.diaNombre }}
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL 2: REPLICAR DÍA A LA SEMANA -->
    <div
      v-if="showReplicateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-card max-w-md w-full p-6 rounded-3xl border border-white/20 shadow-2xl relative bg-white dark:bg-[#18181b] text-slate-900 dark:text-white space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Repeat class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-black leading-tight">Replicar Menú de {{ activeDay.diaNombre }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Selecciona los días destino donde replicar estos platillos</p>
            </div>
          </div>
          <button @click="showReplicateModal = false" class="text-slate-400 hover:text-white p-1">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Quick selection shortcuts -->
        <div class="flex items-center gap-2 text-xs">
          <button
            type="button"
            @click="selectWorkdaysToReplicate"
            class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-[11px] font-bold cursor-pointer"
          >
            Lun a Vie
          </button>
          <button
            type="button"
            @click="selectAllDaysToReplicate"
            class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-[11px] font-bold cursor-pointer"
          >
            Toda la Semana
          </button>
          <button
            type="button"
            @click="replicateTargetIndices = []"
            class="px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 text-[11px] font-bold cursor-pointer"
          >
            Deseleccionar
          </button>
        </div>

        <!-- Checkboxes of Target Days -->
        <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
          <label
            v-for="(dia, idx) in menuData.dias"
            :key="dia.diaId"
            class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
            :class="[
              idx === activeDayIndex ? 'opacity-40 pointer-events-none' : '',
              replicateTargetIndices.includes(idx) ? 'bg-emerald-500/10 border-emerald-500/40' : ''
            ]"
          >
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :value="idx"
                v-model="replicateTargetIndices"
                :disabled="idx === activeDayIndex"
                class="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span class="text-xs font-bold">{{ dia.diaNombre }}</span>
            </div>
            <span class="text-[10px] text-slate-400">
              {{ idx === activeDayIndex ? '(Día actual)' : `${getDayDishCount(dia)} platillos` }}
            </span>
          </label>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="showReplicateModal = false"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="replicateTargetIndices.length === 0"
            @click="handleApplyReplicate"
            class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            Replicar a {{ replicateTargetIndices.length }} día{{ replicateTargetIndices.length > 1 ? 's' : '' }}
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL 3: AGREGAR NUEVO TIEMPO DE COMIDA -->
    <div
      v-if="showAddMealModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div class="glass-card max-w-md w-full p-6 rounded-3xl border border-white/20 shadow-2xl relative bg-white dark:bg-[#18181b] text-slate-900 dark:text-white space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Plus class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black leading-tight">Nuevo Tiempo de Comida</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Agrega un momento personalizado al menú del día</p>
            </div>
          </div>
          <button @click="showAddMealModal = false" class="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3.5 text-xs">
          <!-- Meal Label Input -->
          <div class="space-y-1">
            <label class="font-bold text-slate-600 dark:text-slate-300">Nombre del tiempo de comida *</label>
            <input
              v-model="newMealForm.label"
              type="text"
              placeholder="ej. Snack Pre-Entreno, Colación Nocturna, etc."
              class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              autofocus
            />
          </div>

          <!-- Suggested Time Input -->
          <div class="space-y-1">
            <label class="font-bold text-slate-600 dark:text-slate-300">Horario sugerido</label>
            <input
              v-model="newMealForm.defaultTime"
              type="text"
              placeholder="ej. 06:00 PM, 10:30 PM"
              class="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#201f22] border border-slate-200 dark:border-white/10 rounded-xl font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Icon Selector -->
          <div class="space-y-1.5">
            <label class="font-bold text-slate-600 dark:text-slate-300">Icono representativo</label>
            <div class="flex items-center gap-2 flex-wrap">
              <button
                v-for="ico in ICON_PRESETS"
                :key="ico"
                type="button"
                @click="newMealForm.icon = ico"
                class="w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer"
                :class="newMealForm.icon === ico ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-xs' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'"
              >
                {{ ico }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="showAddMealModal = false"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="!newMealForm.label.trim()"
            @click="handleAddNewMealTime"
            class="px-5 py-2 rounded-xl btn-primary text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            Agregar al Menú
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL 4: WHATSAPP SHARE MODAL -->
    <WhatsAppShareModal
      v-if="showWhatsAppModal"
      :patient="patient"
      :plan="plan"
      :menu="menuData"
      @close="showWhatsAppModal = false"
    />

    <!-- MODAL 5: CREATE CUSTOM DISH MODAL -->
    <CreateCustomDishModal
      v-if="showCreateCustomModal"
      :initialCategory="selectedTargetCategory"
      @close="showCreateCustomModal = false"
      @created="handleCustomDishCreated"
    />

    <!-- MODAL 6: EDIT DISH PORTIONS MODAL -->
    <EditDishPortionsModal
      v-if="showEditPortionsModal && editingDishTarget"
      :dish="editingDishTarget.dish"
      :mealCategory="editingDishTarget.catKey"
      :dayName="activeDay.diaNombre"
      @close="closeEditDishPortions"
      @save="handleSaveEditedDishPortions"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  FileText, 
  MessageSquare, 
  Activity, 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Copy,
  Repeat,
  Check,
  Edit2,
  SlidersHorizontal,
  X
} from 'lucide-vue-next';
import type { Patient, PatientDietPlan } from '../../../types/patient';
import type { 
  DietPlanMenu, 
  MealTimeKey, 
  DishItem, 
  DayMenuSchedule, 
  MenuScheduleType,
  MealTimeCatalogItem
} from '../../../types/dietMenu';
import { HEALTHY_DISHES_CATALOG } from '../../../catalog/nutrition/healthyDishesCatalog';
import { MenuExportService } from '../../../services/nutrition/MenuExportService';
import { useFoodsStore } from '../../../stores/foods';
import { PatientsService } from '../../../services/patients/patients.service';
import WhatsAppShareModal from '../modals/WhatsAppShareModal.vue';
import CreateCustomDishModal from '../modals/CreateCustomDishModal.vue';
import EditDishPortionsModal from '../modals/EditDishPortionsModal.vue';

const props = defineProps<{
  patient: Patient;
  plan: PatientDietPlan;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'saved', updatedPlan: PatientDietPlan): void;
}>();

const foodsStore = useFoodsStore();

const isSaving = ref(false);
const saveSuccess = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const showWhatsAppModal = ref(false);
const showCreateCustomModal = ref(false);
const showEditPortionsModal = ref(false);
const editingDishTarget = ref<{ catKey: string; index: number; dish: DishItem } | null>(null);
const showCopyDayModal = ref(false);
const selectedSourceDayIndex = ref<number | null>(null);
const showReplicateModal = ref(false);
const replicateTargetIndices = ref<number[]>([]);
const showAddMealModal = ref(false);

const isGeneratingAi = ref(false);
const aiSuggestedDish = ref<DishItem | null>(null);

const activeDayIndex = ref(0);
const selectedTargetCategory = ref<string>('desayuno');
const searchQuery = ref('');
const libraryFilter = ref<string>('todos');

// Inline editing of meal times
const editingMealKey = ref<string | null>(null);
const editingMealName = ref('');
const editingMealTime = ref('');

const newMealForm = reactive({
  label: '',
  defaultTime: '06:00 PM',
  icon: '🍎'
});

const ICON_PRESETS = ['🍳', '🍏', '🍲', '🥜', '🥗', '🍎', '🥪', '🥑', '🥤', '🍵', '🍌', '⚡'];

const libraryFilters = [
  { id: 'todos', label: 'Todos' },
  { id: 'desayuno', label: 'Desayunos' },
  { id: 'comida', label: 'Comidas' },
  { id: 'cena', label: 'Cenas' },
  { id: 'colaciones', label: 'Colaciones' },
  { id: 'mis_platillos', label: 'Mis Guardados' }
];

const DAYS_OF_WEEK = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' }
];

// Default 5 meals explicitly: Desayuno -> Colación Matutina -> Comida -> Colación Vespertina -> Cena
const DEFAULT_5_MEAL_TIMES: MealTimeCatalogItem[] = [
  { key: 'desayuno', label: 'Desayuno', defaultTime: '08:30 AM', icon: '🍳' },
  { key: 'colacion_1', label: 'Colación Matutina', defaultTime: '11:30 AM', icon: '🍏' },
  { key: 'comida', label: 'Comida', defaultTime: '02:30 PM', icon: '🍲' },
  { key: 'colacion_2', label: 'Colación Vespertina', defaultTime: '05:30 PM', icon: '🥜' },
  { key: 'cena', label: 'Cena', defaultTime: '08:30 PM', icon: '🥗' }
];

// Helper to initialize default DayMenuSchedule
function createEmptySchedule(diaId: string, diaNombre: string): DayMenuSchedule {
  const comidas: Record<string, DishItem[]> = {};
  DEFAULT_5_MEAL_TIMES.forEach(m => {
    comidas[m.key] = [];
  });
  return {
    diaId,
    diaNombre,
    comidas
  };
}

function initMealTimesConfig(): MealTimeCatalogItem[] {
  const existing = props.plan.menu?.tiemposComidaConfig;
  if (existing && Array.isArray(existing) && existing.length >= 5) {
    return JSON.parse(JSON.stringify(existing));
  }
  if (existing && Array.isArray(existing) && existing.length > 0) {
    const list = JSON.parse(JSON.stringify(existing)) as MealTimeCatalogItem[];
    const hasColacion2 = list.some(m => m.key === 'colacion_2');
    if (!hasColacion2 && list.length === 4) {
      const cenaIdx = list.findIndex(m => m.key === 'cena');
      const colacion2Item: MealTimeCatalogItem = {
        key: 'colacion_2',
        label: 'Colación Vespertina',
        defaultTime: '05:30 PM',
        icon: '🥜'
      };
      if (cenaIdx !== -1) {
        list.splice(cenaIdx, 0, colacion2Item);
      } else {
        list.push(colacion2Item);
      }
      return list;
    }
    return list;
  }
  return JSON.parse(JSON.stringify(DEFAULT_5_MEAL_TIMES));
}

function initDays(): DayMenuSchedule[] {
  if (props.plan.menu?.dias && props.plan.menu.dias.length > 0) {
    const cloned = JSON.parse(JSON.stringify(props.plan.menu.dias)) as DayMenuSchedule[];
    cloned.forEach(d => {
      if (!d.comidas) d.comidas = {};
      DEFAULT_5_MEAL_TIMES.forEach(m => {
        if (!d.comidas[m.key]) d.comidas[m.key] = [];
      });
    });
    return cloned;
  }
  return DAYS_OF_WEEK.map(d => createEmptySchedule(d.id, d.label));
}

// Inicializar estado del menú (5 comidas por defecto, 7 días para máxima flexibilidad)
const menuData = reactive<DietPlanMenu>({
  planId: props.plan.id,
  tipoEstructura: (props.plan.menu?.tipoEstructura as MenuScheduleType) || 'siete_dias',
  tiemposComida: props.plan.menu?.tiemposComida || DEFAULT_5_MEAL_TIMES.map(m => m.key),
  tiemposComidaConfig: initMealTimesConfig(),
  dias: initDays(),
  notasGenerales: props.plan.menu?.notasGenerales || '',
  updatedAt: new Date().toISOString()
});

const activeDay = computed(() => {
  if (!menuData.dias || menuData.dias.length === 0) {
    return createEmptySchedule('dia_1', 'Lunes');
  }
  return menuData.dias[activeDayIndex.value] || menuData.dias[0];
});

// Dynamic Active Meal Times (editable, addable, removable)
const activeMealTimes = computed(() => {
  return menuData.tiemposComidaConfig || DEFAULT_5_MEAL_TIMES;
});

function selectMealTime(catKey: string) {
  selectedTargetCategory.value = catKey;
}

function startEditingMeal(cat: MealTimeCatalogItem) {
  editingMealKey.value = cat.key;
  editingMealName.value = cat.label;
  editingMealTime.value = cat.defaultTime;
}

function saveEditingMeal(cat: MealTimeCatalogItem) {
  if (editingMealName.value.trim()) {
    cat.label = editingMealName.value.trim();
  }
  if (editingMealTime.value.trim()) {
    cat.defaultTime = editingMealTime.value.trim();
  }
  editingMealKey.value = null;
  toastMessage.value = `Tiempo renombrado a "${cat.label}".`;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2500);
}

function cancelEditingMeal() {
  editingMealKey.value = null;
}

function removeMealTime(catKey: string) {
  const target = activeMealTimes.value.find(m => m.key === catKey);
  const name = target?.label || catKey;
  if (activeMealTimes.value.length <= 1) {
    alert('El menú debe contener al menos 1 tiempo de comida.');
    return;
  }
  if (confirm(`¿Estás segura de eliminar "${name}" del menú de todos los días?`)) {
    const idx = (menuData.tiemposComidaConfig || []).findIndex(m => m.key === catKey);
    if (idx !== -1) {
      menuData.tiemposComidaConfig?.splice(idx, 1);
    }
    menuData.dias.forEach(d => {
      if (d.comidas[catKey]) {
        delete d.comidas[catKey];
      }
    });
    if (selectedTargetCategory.value === catKey) {
      selectedTargetCategory.value = activeMealTimes.value[0]?.key || 'desayuno';
    }
    toastMessage.value = `Tiempo de comida "${name}" eliminado.`;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 2500);
  }
}

function handleAddNewMealTime() {
  if (!newMealForm.label.trim()) return;
  const key = `custom_${Date.now()}`;
  if (!menuData.tiemposComidaConfig) {
    menuData.tiemposComidaConfig = JSON.parse(JSON.stringify(DEFAULT_5_MEAL_TIMES));
  }
  const item: MealTimeCatalogItem = {
    key,
    label: newMealForm.label.trim(),
    defaultTime: newMealForm.defaultTime.trim() || '12:00 PM',
    icon: newMealForm.icon || '🍽️'
  };
  menuData.tiemposComidaConfig!.push(item);
  menuData.dias.forEach(d => {
    if (!d.comidas[key]) {
      d.comidas[key] = [];
    }
  });
  selectedTargetCategory.value = key;
  showAddMealModal.value = false;
  newMealForm.label = '';
  toastMessage.value = `¡"${item.label}" agregado al menú!`;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2500);
}

function handleStructureChange() {
  if (menuData.tipoEstructura === 'dia_tipo') {
    const firstDay = menuData.dias[0] || createEmptySchedule('dia_1', 'Día Tipo');
    firstDay.diaNombre = 'Día Tipo';
    menuData.dias = [firstDay];
    activeDayIndex.value = 0;
  } else if (menuData.tipoEstructura === 'semana_fin') {
    const workdays = menuData.dias[0] || createEmptySchedule('lunes_viernes', 'Lunes a Viernes');
    workdays.diaNombre = 'Lunes a Viernes';
    const weekend = menuData.dias[1] || createEmptySchedule('fin_semana', 'Fin de Semana (Sáb - Dom)');
    weekend.diaNombre = 'Fin de Semana (Sáb - Dom)';
    menuData.dias = [workdays, weekend];
    activeDayIndex.value = 0;
  } else if (menuData.tipoEstructura === 'siete_dias') {
    menuData.dias = DAYS_OF_WEEK.map((d, i) => {
      if (menuData.dias[i]) {
        menuData.dias[i].diaNombre = d.label;
        return menuData.dias[i];
      }
      return createEmptySchedule(d.id, d.label);
    });
    activeDayIndex.value = 0;
  }
}

// Helpers de conteo por día
function getDayKcal(dia: DayMenuSchedule): number {
  let total = 0;
  Object.values(dia.comidas).forEach(dishes => {
    dishes.forEach(d => {
      total += d.macros?.calories || 0;
    });
  });
  return total;
}

function getDayDishCount(dia: DayMenuSchedule): number {
  let count = 0;
  Object.values(dia.comidas).forEach(dishes => {
    count += dishes.length;
  });
  return count;
}

function getDayStatusDotClass(dia: DayMenuSchedule, isActive: boolean): string {
  const kcal = getDayKcal(dia);
  if (kcal === 0) {
    return isActive ? 'bg-white/40 dark:bg-black/40' : 'bg-slate-300 dark:bg-white/20';
  }
  const diff = Math.abs(kcal - props.plan.calorias);
  if (diff <= props.plan.calorias * 0.05) {
    return 'bg-emerald-500 shadow-xs shadow-emerald-500/50';
  }
  return 'bg-amber-500 shadow-xs shadow-amber-500/50';
}

function getDayDishesPreview(dia: DayMenuSchedule): string {
  const names: string[] = [];
  Object.values(dia.comidas).forEach(dishes => {
    dishes.forEach(d => {
      if (names.length < 3) names.push(d.nombre);
    });
  });
  if (names.length === 0) return 'Sin platillos asignados';
  return names.join(' • ') + (getDayDishCount(dia) > 3 ? '...' : '');
}

// Días disponibles para copiar (excluyendo el día activo)
const availableSourceDays = computed(() => {
  return menuData.dias.filter((_, idx) => idx !== activeDayIndex.value);
});

// Clonado de días
function copyDayMenu(sourceIndex: number, targetIndex: number) {
  const sourceDay = menuData.dias[sourceIndex];
  const targetDay = menuData.dias[targetIndex];
  if (!sourceDay || !targetDay) return;

  const clonedComidas: Record<string, DishItem[]> = {};

  Object.entries(sourceDay.comidas).forEach(([key, dishes]) => {
    clonedComidas[key] = dishes.map(d => ({
      ...JSON.parse(JSON.stringify(d)),
      id: `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    }));
  });

  targetDay.comidas = clonedComidas;
}

function handleApplyCopyDay() {
  if (selectedSourceDayIndex.value === null) return;
  const sourceDay = availableSourceDays.value[selectedSourceDayIndex.value];
  if (!sourceDay) return;

  const realSourceIdx = menuData.dias.findIndex(d => d.diaId === sourceDay.diaId);
  if (realSourceIdx !== -1) {
    copyDayMenu(realSourceIdx, activeDayIndex.value);
    toastMessage.value = `¡Menú de ${sourceDay.diaNombre} copiado a ${activeDay.value.diaNombre} con éxito!`;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 3200);
  }
  showCopyDayModal.value = false;
  selectedSourceDayIndex.value = null;
}

function selectWorkdaysToReplicate() {
  replicateTargetIndices.value = [0, 1, 2, 3, 4].filter(i => i !== activeDayIndex.value && i < menuData.dias.length);
}

function selectAllDaysToReplicate() {
  replicateTargetIndices.value = menuData.dias.map((_, i) => i).filter(i => i !== activeDayIndex.value);
}

function handleApplyReplicate() {
  const sourceDay = activeDay.value;
  replicateTargetIndices.value.forEach(tIdx => {
    copyDayMenu(activeDayIndex.value, tIdx);
  });
  toastMessage.value = `¡Menú de ${sourceDay.diaNombre} replicado a ${replicateTargetIndices.value.length} día(s)!`;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3200);
  showReplicateModal.value = false;
  replicateTargetIndices.value = [];
}

function confirmClearDay() {
  if (confirm(`¿Deseas vaciar todos los platillos de ${activeDay.value.diaNombre}?`)) {
    const emptyComidas: Record<string, DishItem[]> = {};
    activeMealTimes.value.forEach(m => {
      emptyComidas[m.key] = [];
    });
    activeDay.value.comidas = emptyComidas;
    toastMessage.value = `Se vaciaron los platillos de ${activeDay.value.diaNombre}`;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 2500);
  }
}

// Macros del día activo
const dayTotals = computed(() => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  Object.values(activeDay.value.comidas).forEach((dishes) => {
    dishes.forEach((d) => {
      calories += d.macros?.calories || 0;
      protein += d.macros?.protein || 0;
      carbs += d.macros?.carbs || 0;
      fat += d.macros?.fat || 0;
    });
  });

  return { calories, protein, carbs, fat };
});

const remainingKcal = computed(() => props.plan.calorias - dayTotals.value.calories);
const remainingProtein = computed(() => props.plan.macros.protein - dayTotals.value.protein);
const remainingCarbs = computed(() => props.plan.macros.carbs - dayTotals.value.carbs);
const remainingFat = computed(() => props.plan.macros.fat - dayTotals.value.fat);

const isDayBalanced = computed(() => {
  const diffKcal = Math.abs(remainingKcal.value);
  return diffKcal <= props.plan.calorias * 0.05;
});

function getMealTimeSubtotal(catKey: string) {
  const list = activeDay.value.comidas[catKey] || [];
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  list.forEach((d) => {
    calories += d.macros?.calories || 0;
    protein += d.macros?.protein || 0;
    carbs += d.macros?.carbs || 0;
    fat += d.macros?.fat || 0;
  });
  return { calories, protein, carbs, fat };
}

function addDishToCurrentMeal(dish: DishItem) {
  const targetKey = selectedTargetCategory.value;
  if (!activeDay.value.comidas[targetKey]) {
    activeDay.value.comidas[targetKey] = [];
  }
  activeDay.value.comidas[targetKey].push(JSON.parse(JSON.stringify(dish)));
}

function removeDish(catKey: string, idx: number) {
  if (activeDay.value.comidas[catKey]) {
    activeDay.value.comidas[catKey].splice(idx, 1);
  }
}

function openEditDishPortions(catKey: string, index: number, dish: DishItem) {
  editingDishTarget.value = {
    catKey,
    index,
    dish: JSON.parse(JSON.stringify(dish))
  };
  showEditPortionsModal.value = true;
}

function closeEditDishPortions() {
  showEditPortionsModal.value = false;
  editingDishTarget.value = null;
}

async function handleSaveEditedDishPortions(payload: {
  updatedDish: DishItem;
  saveAsNewInLibrary: boolean;
  customDishName?: string;
}) {
  if (!editingDishTarget.value) return;
  const { catKey, index } = editingDishTarget.value;

  if (activeDay.value.comidas[catKey] && activeDay.value.comidas[catKey][index]) {
    activeDay.value.comidas[catKey][index] = payload.updatedDish;
  }

  if (payload.saveAsNewInLibrary) {
    try {
      const name = payload.customDishName || payload.updatedDish.nombre;
      await foodsStore.saveFood({
        name,
        description: `${payload.updatedDish.porcion} • ${payload.updatedDish.ingredientes.join(', ')}`,
        macros: {
          calories: payload.updatedDish.macros.calories,
          protein: payload.updatedDish.macros.protein,
          carbs: payload.updatedDish.macros.carbs,
          fat: payload.updatedDish.macros.fat,
          sugar: 0
        }
      });
      await foodsStore.fetchMyFoods();
      toastMessage.value = `¡"${name}" actualizado en el menú y guardado en tu biblioteca!`;
    } catch (err) {
      console.error('Error guardando nuevo platillo en biblioteca:', err);
      toastMessage.value = `Platillo actualizado en el menú.`;
    }
  } else {
    toastMessage.value = `Platillo actualizado con nuevas porciones (${payload.updatedDish.macros.calories} kcal).`;
  }

  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
  closeEditDishPortions();
}

// Catálogo híbrido
const filteredLibraryDishes = computed(() => {
  let all: DishItem[] = [...HEALTHY_DISHES_CATALOG];

  const mySaved = foodsStore.myFoods.map(f => ({
    id: `saved_${f.id}`,
    nombre: f.name,
    descripcion: f.description,
    porcion: '1 porción',
    categoria: 'comida' as MealTimeKey,
    ingredientes: [],
    macros: {
      calories: f.macros.calories,
      protein: f.macros.protein,
      carbs: f.macros.carbs,
      fat: f.macros.fat
    },
    esPersonalizado: true
  }));

  all = [...all, ...mySaved];

  if (libraryFilter.value === 'mis_platillos') {
    all = all.filter(d => d.esPersonalizado);
  } else if (libraryFilter.value === 'desayuno') {
    all = all.filter(d => d.categoria === 'desayuno');
  } else if (libraryFilter.value === 'comida') {
    all = all.filter(d => d.categoria === 'comida');
  } else if (libraryFilter.value === 'cena') {
    all = all.filter(d => d.categoria === 'cena');
  } else if (libraryFilter.value === 'colaciones') {
    all = all.filter(d => ['colacion_1', 'colacion_2', 'snack'].includes(d.categoria));
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    all = all.filter(d => 
      d.nombre.toLowerCase().includes(q) ||
      (d.descripcion || '').toLowerCase().includes(q) ||
      (d.ingredientes || []).some(ing => ing.toLowerCase().includes(q))
    );
  }

  return all;
});

function handleCustomDishCreated(dish: DishItem) {
  showCreateCustomModal.value = false;
  addDishToCurrentMeal(dish);
  foodsStore.fetchMyFoods();
}

// Sugerencia Inteligente IA adaptada a los macros restantes de este día
function generateAiSuggestion() {
  isGeneratingAi.value = true;
  aiSuggestedDish.value = null;

  setTimeout(() => {
    const targetKcal = Math.max(150, Math.min(600, remainingKcal.value));
    const targetP = Math.max(10, Math.min(45, remainingProtein.value));

    const candidate = HEALTHY_DISHES_CATALOG.find(d => 
      Math.abs(d.macros.calories - targetKcal) < 120
    ) || HEALTHY_DISHES_CATALOG[0];

    aiSuggestedDish.value = {
      ...candidate,
      id: `ai_${Date.now()}`,
      nombre: `[Sugerido IA] ${candidate.nombre}`,
      descripcion: `Ajustado para ${activeDay.value.diaNombre} para aportar aprox ${targetKcal} kcal y ${targetP}g de proteína.`
    };
    isGeneratingAi.value = false;
  }, 600);
}

// Guardar Menú
async function handleSaveMenu() {
  isSaving.value = true;
  saveSuccess.value = false;

  const updatedPlan: PatientDietPlan = {
    ...props.plan,
    menu: JSON.parse(JSON.stringify(menuData)),
    menuGenerado: true
  };

  try {
    await PatientsService.savePatientDietPlan(props.patient.id, updatedPlan);
    saveSuccess.value = true;
    emit('saved', updatedPlan);
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3500);
  } catch (err) {
    console.error('Error saving menu:', err);
  } finally {
    isSaving.value = false;
  }
}

function handleExportWord() {
  MenuExportService.exportMenuToWord(props.patient, props.plan, menuData);
}

function handleExportPDF() {
  MenuExportService.exportMenuToPdf(props.patient, props.plan, menuData);
}

onMounted(() => {
  foodsStore.fetchMyFoods();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
