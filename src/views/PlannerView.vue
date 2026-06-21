<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDietStore, type DayPlan } from '../stores/diet'
import { useLogStore } from '../stores/log'
import MealCard from '../components/MealCard.vue'

const dietStore = useDietStore()
const logStore = useLogStore()

const DAYS_ES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_ES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// ─── Real week days (Mon–Sun) ───
const realWeekDays = computed(() => {
  const today = new Date()
  const dow = today.getDay() // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow // offset to Monday
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return {
      iso,
      dayIndex: d.getDay(),
      dayName: DAYS_ES_SHORT[d.getDay()],
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    }
  })
})

const selectedDate = ref('')

onMounted(() => {
  const todayEntry = realWeekDays.value.find(d => d.isToday)
  selectedDate.value = todayEntry?.iso ?? realWeekDays.value[0]?.iso ?? ''
})

watch(() => dietStore.week.length, () => {
  if (!selectedDate.value) {
    const todayEntry = realWeekDays.value.find(d => d.isToday)
    selectedDate.value = todayEntry?.iso ?? realWeekDays.value[0]?.iso ?? ''
  }
})

function selectDate(iso: string) {
  selectedDate.value = iso
}

// ─── Current day plan via assignedDays ───
const currentDayPlan = computed((): DayPlan | null => {
  if (!selectedDate.value || dietStore.week.length === 0) return null
  return dietStore.getDayPlanForDate(selectedDate.value)
})

const selectedDayInfo = computed(() => {
  return realWeekDays.value.find(d => d.iso === selectedDate.value) || null
})

function hasPlanForDay(dayIndex: number, iso: string): boolean {
  if (dietStore.tempAssignments[iso]) return true
  return dietStore.week.some(dp => dp.assignedDays?.includes(dayIndex))
}

// ─── Meal tracking ───
function isMealCompleted(mealId: string) {
  if (!selectedDate.value) return false
  const dailyLogs = logStore.logs[selectedDate.value]
  if (!dailyLogs) return false
  return dailyLogs.meals.find(m => m.id === mealId)?.completed ?? false
}

function toggleMeal(mealId: string) {
  if (!selectedDate.value) return
  logStore.toggleMeal(selectedDate.value, mealId)
}

function getMealCustomFoods(mealId: string) {
  if (!selectedDate.value) return []
  const dailyLogs = logStore.logs[selectedDate.value]
  if (!dailyLogs) return []
  return dailyLogs.meals.find(m => m.id === mealId)?.customFoods || []
}

// ─── Assignment table ───
const showAssignment = ref(false)

const WEEKDAY_HEADERS = [
  { label: 'L', index: 1 },
  { label: 'M', index: 2 },
  { label: 'X', index: 3 },
  { label: 'J', index: 4 },
  { label: 'V', index: 5 },
  { label: 'S', index: 6 },
  { label: 'D', index: 0 },
]

function toggleAssignment(dayPlan: DayPlan, dayIndex: number) {
  dietStore.toggleAssignedDay(dayPlan.date, dayIndex)
}

// ─── Plan picker for unassigned days ───
const showPlanPicker = ref(false)
const pickerRecurring = ref(true)

function openPlanPicker() {
  pickerRecurring.value = true
  showPlanPicker.value = true
}

function assignPlan(planDate: string) {
  const info = selectedDayInfo.value
  if (!info) return
  if (pickerRecurring.value) {
    dietStore.assignDayRecurring(planDate, info.dayIndex)
  } else {
    dietStore.setTempAssignment(info.iso, planDate)
  }
  showPlanPicker.value = false
}

function closePlanPicker() {
  showPlanPicker.value = false
}
</script>

<template>
  <div class="h-full flex flex-col relative max-w-md mx-auto w-full min-h-[calc(100vh-64px)]" style="background: var(--surface-container-lowest);">
    <!-- Sticky Header & Day Selector -->
    <header class="sticky top-0 z-10 backdrop-blur-md" style="background: rgba(14, 14, 16, 0.8); border-bottom: 1px solid var(--glass-border);">
      <div class="px-4 pt-6 pb-3">
        <h1 class="text-xl font-bold mb-4" style="font-family: var(--font-display); color: var(--on-surface);">Planificador Semanal</h1>
        
        <!-- Day Navigation — real week -->
        <div class="flex overflow-x-auto pb-1 hide-scrollbar snap-x">
          <div class="flex gap-1 min-w-max px-1">
            <button
              v-for="day in realWeekDays"
              :key="day.iso"
              @click="selectDate(day.iso)"
              class="snap-start flex flex-col items-center justify-center w-13 h-16 rounded-2xl transition-all font-medium border relative"
              :style="selectedDate === day.iso ? {
                background: 'var(--kinetic-glow)',
                color: 'var(--on-primary)',
                borderColor: 'var(--primary-container)',
                transform: 'scale(1.05)'
              } : day.isToday ? {
                background: 'rgba(25, 232, 13, 0.12)',
                color: 'var(--primary)',
                borderColor: 'rgba(25, 232, 13, 0.3)'
              } : {
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--on-surface-muted)',
                borderColor: 'var(--glass-border)'
              }"
            >
              <span
                class="text-[10px] uppercase font-bold mb-0.5 tracking-wider"
                :style="{ color: selectedDate === day.iso ? 'var(--on-primary)' : 'var(--on-surface-muted)' }"
              >{{ day.dayName }}</span>
              <span class="text-lg leading-none font-bold">
                {{ day.dayNum }}
              </span>
              <!-- Dot indicator: no plan -->
              <span
                v-if="dietStore.week.length > 0 && !hasPlanForDay(day.dayIndex, day.iso)"
                class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2"
                style="border-color: var(--surface-container-lowest);"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 p-4 pb-20 overflow-y-auto">
      
      <!-- Schedule Assignment Table -->
      <div v-if="dietStore.week.length > 0" class="glass-card p-4 mb-4">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-sm" style="color: var(--on-surface);">Asignar a días de la semana</h3>
          <button @click="showAssignment = !showAssignment" class="text-xs font-semibold" style="color: var(--primary);">
            {{ showAssignment ? 'Ocultar' : 'Editar horario' }}
          </button>
        </div>
        
        <div v-if="showAssignment" class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="border-b" style="color: var(--on-surface-muted); border-color: var(--glass-border);">
                <th class="py-2 font-medium w-1/4">Plan</th>
                <th
                  v-for="col in WEEKDAY_HEADERS"
                  :key="col.index"
                  class="py-2 text-center font-medium"
                >{{ col.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dayPlan, index) in dietStore.week" :key="index" class="border-b last:border-0" style="border-color: rgba(255,255,255,0.02);">
                <td class="py-3 font-semibold truncate max-w-[80px]" :style="{ color: 'var(--on-surface)' }" :title="dayPlan.dayName || dayPlan.date">
                  {{ dayPlan.dayName || dayPlan.date }}
                </td>
                <td
                  v-for="col in WEEKDAY_HEADERS"
                  :key="col.index"
                  class="py-3 text-center"
                >
                  <input
                    type="checkbox"
                    :checked="dayPlan.assignedDays?.includes(col.index)"
                    @change="toggleAssignment(dayPlan, col.index)"
                    class="w-4 h-4 cursor-pointer"
                    style="accent-color: var(--primary-container);"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <p class="text-[10px] mt-3.5" style="color: var(--on-surface-muted);">Marca los días de la semana a los que quieres asignar cada plan. Un día solo puede tener un plan activo.</p>
        </div>
      </div>

      <!-- No diet loaded -->
      <div v-if="dietStore.week.length === 0" class="glass-card p-8 text-center mt-8">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background: var(--surface-container-high); color: var(--on-surface-muted);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="font-bold text-lg mb-2" style="color: var(--on-surface);">No se encontró plan de dieta</h3>
        <p class="text-sm mb-6" style="color: var(--on-surface-muted);">Sube tu dieta semanal para verla y gestionarla aquí.</p>
        
        <router-link to="/upload" class="inline-block w-full py-3 btn-primary text-sm font-bold shadow-md">
          Subir Plan
        </router-link>
      </div>

      <!-- Day with assigned plan -->
      <div v-else-if="currentDayPlan">
        <div class="flex justify-between items-end mb-4 px-1">
          <h2 class="text-lg font-bold" style="font-family: var(--font-display); color: var(--on-surface);">
            Comidas — {{ selectedDayInfo ? DAYS_ES_FULL[selectedDayInfo.dayIndex] : '' }}
            <span class="text-sm font-normal ml-1" style="color: var(--on-surface-muted);">({{ currentDayPlan.dayName }})</span>
          </h2>
          <span class="text-[10px] font-bold px-2 py-1 rounded-full" style="background: var(--surface-container-high); color: var(--on-surface-muted);">{{ currentDayPlan.meals.length }} comidas</span>
        </div>

        <div class="space-y-3">
          <MealCard 
            v-for="meal in currentDayPlan.meals" 
            :key="meal.id"
            :date="selectedDate"
            :meal="meal as any"
            :isCompleted="isMealCompleted(meal.id)"
            :customFoods="getMealCustomFoods(meal.id)"
            @toggle="toggleMeal(meal.id)"
          />
        </div>
      </div>

      <!-- Unassigned day -->
      <div v-else-if="dietStore.week.length > 0 && selectedDayInfo" class="glass-card p-8 text-center mt-4">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background: rgba(251, 191, 36, 0.1); color: #fbbf24;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-bold text-lg mb-2" style="color: var(--on-surface);">Sin plan asignado</h3>
        <p class="text-sm mb-6" style="color: var(--on-surface-muted);">
          No hay plan de dieta asignado para el <strong>{{ DAYS_ES_FULL[selectedDayInfo.dayIndex] }}</strong>.
          Elige un plan existente para este día.
        </p>
        <button
          @click="openPlanPicker"
          class="w-full py-3 btn-primary"
        >
          Elegir plan
        </button>
      </div>

      <div v-else class="text-center mt-10" style="color: var(--on-surface-muted);">
        Selecciona un día para ver las comidas
      </div>
    </div>

    <!-- Plan Picker Modal (bottom sheet) -->
    <Teleport to="body">
      <div
        v-if="showPlanPicker"
        class="fixed inset-0 z-50 flex items-end justify-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 transition-opacity" @click="closePlanPicker"></div>

        <!-- Sheet -->
        <div class="relative w-full max-w-md rounded-t-3xl shadow-2xl p-6 pb-8 animate-slide-up" style="background: var(--surface-container-high); border: 1px solid var(--glass-border); border-bottom: none;">
          <div class="w-10 h-1 rounded-full mx-auto mb-5" style="background: var(--surface-container-highest);"></div>
          <h3 class="text-lg font-bold mb-1" style="font-family: var(--font-display); color: var(--on-surface);">Elegir plan para {{ selectedDayInfo ? DAYS_ES_FULL[selectedDayInfo.dayIndex] : '' }}</h3>
          <p class="text-sm mb-5" style="color: var(--on-surface-muted);">Selecciona un plan de dieta existente.</p>

          <!-- Recurring toggle -->
          <div class="flex items-center justify-between p-3 rounded-xl mb-5" style="background: var(--surface-container-lowest); border: 1px solid var(--glass-border);">
            <div>
              <p class="text-sm font-semibold" style="color: var(--on-surface);">Recurrente cada semana</p>
              <p class="text-[11px]" style="color: var(--on-surface-muted);">{{ pickerRecurring ? 'Se asignará todos los ' + (selectedDayInfo ? DAYS_ES_FULL[selectedDayInfo.dayIndex] : '') : 'Solo para esta fecha' }}</p>
            </div>
            <button
              @click="pickerRecurring = !pickerRecurring"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="pickerRecurring ? 'bg-emerald-500' : 'bg-zinc-700'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
                :class="pickerRecurring ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <!-- Plan list -->
          <div class="space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
            <button
              v-for="plan in dietStore.week"
              :key="plan.date"
              @click="assignPlan(plan.date)"
              class="w-full text-left p-4 rounded-xl border transition-all"
              style="background: rgba(255,255,255,0.02); border-color: var(--glass-border);"
              onmouseover="this.style.borderColor='var(--primary-container)'; this.style.background='rgba(25, 232, 13, 0.05)';"
              onmouseout="this.style.borderColor='var(--glass-border)'; this.style.background='rgba(255,255,255,0.02)';"
            >
              <span class="font-semibold block" style="color: var(--on-surface);">{{ plan.dayName || plan.date }}</span>
              <span class="text-xs block mt-1" style="color: var(--on-surface-muted);">{{ plan.meals.length }} comidas — {{ plan.meals.map(m => m.name).join(', ') }}</span>
            </button>
          </div>

          <button
            @click="closePlanPicker"
            class="w-full mt-4 py-3 rounded-xl font-bold transition-colors"
            style="background: var(--surface-container-lowest); color: var(--on-surface);"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
