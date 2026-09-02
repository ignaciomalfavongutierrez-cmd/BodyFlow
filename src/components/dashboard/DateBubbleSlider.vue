<script setup lang="ts">
import { computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
import { useDietStore } from '../../stores/diet'
import { useLogStore } from '../../stores/log'

const props = defineProps<{
  modelValue: string // YYYY-MM-DD
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const dietStore = useDietStore()
const logStore = useLogStore()

// Days of week short names (Monday to Sunday)
const DAY_LABELS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

// Today in YYYY-MM-DD
const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// Current selected Date object
const selectedDateObj = computed(() => {
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, d)
})

// Helper to format Date to YYYY-MM-DD
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Compute the 7 days of the current week (Monday to Sunday) for the selected date
const weekDays = computed(() => {
  const current = new Date(selectedDateObj.value)
  const dayOfWeek = current.getDay() // 0 = Sunday, 1 = Monday...
  // Calculate distance to previous Monday (if Sunday (0), distance is 6; otherwise dayOfWeek - 1)
  const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  
  const monday = new Date(current)
  monday.setDate(current.getDate() - distToMonday)
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    const dateStr = formatDate(dayDate)
    
    // Check adherence status
    const dayPlan = dietStore.getDayPlanForDate(dateStr)
    const plannedCount = dayPlan?.meals?.length || 0
    const dayLog = logStore.logs[dateStr]
    const completedCount = dayLog?.meals?.filter(m => m.completed)?.length || 0
    
    let status: 'completed' | 'partial' | 'pending' | 'none' = 'none'
    if (plannedCount > 0) {
      if (completedCount >= plannedCount) {
        status = 'completed'
      } else if (completedCount > 0) {
        status = 'partial'
      } else {
        status = 'pending'
      }
    }
    
    days.push({
      dateStr,
      dayNumber: dayDate.getDate(),
      monthLabel: dayDate.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
      dayLabel: DAY_LABELS[i],
      isToday: dateStr === todayStr.value,
      isSelected: dateStr === props.modelValue,
      status,
      completedCount,
      plannedCount
    })
  }
  return days
})

// Prefetch logs for the whole visible week so completion dots update in real time
watch(weekDays, (days) => {
  days.forEach(d => {
    logStore.fetchDayLog(d.dateStr)
  })
}, { immediate: true })

function selectDate(dateStr: string) {
  emit('update:modelValue', dateStr)
}

function shiftWeek(offsetWeeks: number) {
  const current = new Date(selectedDateObj.value)
  current.setDate(current.getDate() + (offsetWeeks * 7))
  emit('update:modelValue', formatDate(current))
}

function jumpToToday() {
  emit('update:modelValue', todayStr.value)
}

// Current month & year banner (e.g. "Septiembre 2026")
const currentMonthYearLabel = computed(() => {
  const formatted = selectedDateObj.value.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})
</script>

<template>
  <div class="w-full select-none mb-3">
    <!-- Month/Year Header & Week Controls -->
    <div class="flex items-center justify-between px-1 mb-2.5">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
          {{ currentMonthYearLabel }}
        </span>
        <button
          v-if="modelValue !== todayStr"
          @click="jumpToToday"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 border"
          style="background: rgba(25, 232, 13, 0.12); color: var(--primary); border-color: rgba(25, 232, 13, 0.3);"
        >
          Hoy
        </button>
      </div>

      <!-- Left / Right Week Shift Arrows -->
      <div class="flex items-center gap-1">
        <button 
          @click="shiftWeek(-1)" 
          class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:scale-95"
          style="color: var(--on-surface-muted);"
          title="Semana anterior"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button 
          @click="shiftWeek(1)" 
          class="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 active:scale-95"
          style="color: var(--on-surface-muted);"
          title="Semana siguiente"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 7-Day Bubble Strip -->
    <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
      <button
        v-for="day in weekDays"
        :key="day.dateStr"
        @click="selectDate(day.dateStr)"
        type="button"
        class="flex flex-col items-center justify-between py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer relative group border"
        :style="day.isSelected ? {
          background: 'linear-gradient(180deg, rgba(25, 232, 13, 0.18) 0%, rgba(25, 232, 13, 0.08) 100%)',
          borderColor: 'rgba(25, 232, 13, 0.5)',
          boxShadow: '0 4px 12px rgba(25, 232, 13, 0.15)'
        } : {
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: day.isToday ? 'rgba(255, 255, 255, 0.2)' : 'var(--glass-border)'
        }"
        :class="[
          day.isSelected ? 'scale-[1.03] z-10' : 'hover:bg-white/5 active:scale-95',
          day.isToday && !day.isSelected ? 'ring-1 ring-white/20' : ''
        ]"
      >
        <!-- Day Label (LUN, MAR...) -->
        <span 
          class="text-[9px] font-bold tracking-wider mb-0.5"
          :style="{
            color: day.isSelected ? 'var(--primary)' : 'var(--on-surface-muted)'
          }"
        >
          {{ day.dayLabel }}
        </span>

        <!-- Day Number -->
        <span 
          class="text-sm sm:text-base font-extrabold my-0.5 leading-none transition-colors"
          :style="{
            color: day.isSelected ? 'var(--on-surface)' : (day.isToday ? 'var(--primary)' : 'var(--on-surface-variant)')
          }"
        >
          {{ day.dayNumber }}
        </span>

        <!-- Status / Adherence Micro Dot -->
        <div class="h-2 flex items-center justify-center mt-1">
          <!-- Completed (Green Check/Dot) -->
          <div 
            v-if="day.status === 'completed'" 
            class="w-2 h-2 rounded-full flex items-center justify-center shadow-xs"
            style="background: var(--primary);"
            title="Todas las comidas completadas"
          >
            <Check class="w-1.5 h-1.5 text-black stroke-[3]" />
          </div>

          <!-- Partial (Amber Dot) -->
          <div 
            v-else-if="day.status === 'partial'" 
            class="w-1.5 h-1.5 rounded-full"
            style="background: #fbbf24;"
            title="Comidas en progreso"
          ></div>

          <!-- Pending Planned Meals (Subtle Gray Dot) -->
          <div 
            v-else-if="day.status === 'pending'" 
            class="w-1 h-1 rounded-full opacity-40"
            style="background: var(--on-surface-muted);"
          ></div>

          <!-- Empty placeholder for alignment -->
          <div v-else class="w-1 h-1"></div>
        </div>

        <!-- Tiny 'Hoy' Indicator Line on top -->
        <span 
          v-if="day.isToday"
          class="absolute -top-1 w-3 h-0.5 rounded-full"
          style="background: var(--primary);"
        ></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Smooth micro-interactions */
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
