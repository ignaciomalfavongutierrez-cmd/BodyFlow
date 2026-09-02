<script setup lang="ts">
import { ref, computed } from 'vue'
import { Droplet, Check, Settings2, Sparkles, X } from 'lucide-vue-next'
import { useLogStore } from '../../stores/log'
import { useUserStore } from '../../stores/user'

const props = defineProps<{
  date: string // YYYY-MM-DD
}>()

const logStore = useLogStore()
const userStore = useUserStore()

const showEditTargetModal = ref(false)
const customTargetInput = ref(2000)

// Target in ml (defaults to user profile waterTarget or 2000 ml)
const targetMl = computed(() => {
  return userStore.profile.waterTarget || 2000
})

// Current water logged for this date in ml
const currentWaterMl = computed(() => {
  const dayLog = logStore.logs[props.date]
  return dayLog?.waterIntake || 0
})

// Progress percentage (0 to 100+)
const progressPct = computed(() => {
  if (!targetMl.value || targetMl.value <= 0) return 0
  return Math.min(Math.round((currentWaterMl.value / targetMl.value) * 100), 100)
})

const isGoalReached = computed(() => {
  return currentWaterMl.value >= targetMl.value && targetMl.value > 0
})

// Quick Add / Subtract helpers
function addWater(amount: number) {
  logStore.addWater(props.date, amount)
}

function subtractWater(amount: number) {
  logStore.addWater(props.date, -amount)
}

function openTargetModal() {
  customTargetInput.value = targetMl.value
  showEditTargetModal.value = true
}

async function saveTarget() {
  const val = Number(customTargetInput.value)
  if (val && val >= 500 && val <= 10000) {
    await userStore.updateProfile({ waterTarget: val })
  }
  showEditTargetModal.value = false
}
</script>

<template>
  <div class="glass-card p-4 sm:p-5 relative overflow-hidden transition-all duration-300 border mb-4" style="background: var(--surface-container); border-color: rgba(6, 182, 212, 0.25);">
    
    <!-- Ambient cyan background glow -->
    <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20" style="background: #06b6d4;"></div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-3 relative z-10">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border transition-transform duration-300" style="background: rgba(6, 182, 212, 0.15); border-color: rgba(6, 182, 212, 0.35); color: #06b6d4;">
          <Droplet class="w-4 h-4 fill-cyan-400/30 text-cyan-400" />
        </div>
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
            Hidratación
            <span v-if="isGoalReached" class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full" style="background: rgba(25, 232, 13, 0.15); color: var(--primary);">
              <Check class="w-2.5 h-2.5 stroke-[3]" /> Meta
            </span>
          </h3>
          <p class="text-[10px] font-semibold text-slate-400 dark:text-zinc-400">
            {{ (currentWaterMl / 1000).toFixed(2) }} L / {{ (targetMl / 1000).toFixed(1) }} L ({{ progressPct }}%)
          </p>
        </div>
      </div>

      <!-- Quick Edit Target Button -->
      <button 
        @click="openTargetModal"
        class="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
        title="Personalizar meta diaria de agua"
      >
        <Settings2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Liquid Progress Bar -->
    <div class="w-full h-3 rounded-full overflow-hidden p-0.5 mb-3.5 border relative shadow-inner" style="background: rgba(0,0,0,0.3); border-color: rgba(6, 182, 212, 0.2);">
      <div 
        class="h-full rounded-full transition-all duration-500 relative overflow-hidden"
        :style="{
          width: `${progressPct}%`,
          background: isGoalReached 
            ? 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)' 
            : 'linear-gradient(90deg, #0284c7 0%, #06b6d4 100%)',
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
        }"
      >
        <!-- Shimmer light reflection -->
        <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="grid grid-cols-4 gap-2 relative z-10">
      <button 
        @click="addWater(250)"
        type="button"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:scale-102 active:scale-95 border cursor-pointer group"
        style="background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.25);"
      >
        <span class="text-xs font-extrabold text-cyan-500 dark:text-cyan-300 group-hover:text-cyan-200">+250 ml</span>
        <span class="text-[9px] text-slate-400 dark:text-zinc-400 font-medium mt-0.5">1 vaso 🥛</span>
      </button>

      <button 
        @click="addWater(500)"
        type="button"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:scale-102 active:scale-95 border cursor-pointer group"
        style="background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.25);"
      >
        <span class="text-xs font-extrabold text-cyan-500 dark:text-cyan-300 group-hover:text-cyan-200">+500 ml</span>
        <span class="text-[9px] text-slate-400 dark:text-zinc-400 font-medium mt-0.5">Botella 🍶</span>
      </button>

      <button 
        @click="addWater(1000)"
        type="button"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:scale-102 active:scale-95 border cursor-pointer group"
        style="background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.25);"
      >
        <span class="text-xs font-extrabold text-cyan-500 dark:text-cyan-300 group-hover:text-cyan-200">+1.0 L</span>
        <span class="text-[9px] text-slate-400 dark:text-zinc-400 font-medium mt-0.5">Jarra 🚰</span>
      </button>

      <button 
        @click="subtractWater(250)"
        :disabled="currentWaterMl <= 0"
        type="button"
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all hover:scale-102 active:scale-95 border cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        style="background: rgba(255, 255, 255, 0.03); border-color: var(--glass-border);"
      >
        <span class="text-xs font-bold text-slate-400 dark:text-zinc-400">-250 ml</span>
        <span class="text-[9px] text-slate-500 dark:text-zinc-500 font-medium mt-0.5">Ajustar ↩️</span>
      </button>
    </div>

    <!-- Celebration Banner if reached -->
    <div v-if="isGoalReached" class="mt-3 p-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold border animate-fade-in" style="background: rgba(25, 232, 13, 0.1); border-color: rgba(25, 232, 13, 0.25); color: var(--primary);">
      <Sparkles class="w-3.5 h-3.5" />
      <span>¡Excelente! Has alcanzado tu meta diaria de hidratación</span>
    </div>

    <!-- Edit Target Modal (Teleport to Body for full layer clearance) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showEditTargetModal" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div class="glass-card w-full max-w-xs p-5 rounded-3xl border shadow-2xl space-y-4 animate-modal-in" style="background: var(--surface-container-high); border-color: var(--glass-border);">
            <div class="flex justify-between items-center pb-2 border-b" style="border-color: var(--glass-border);">
              <div class="flex items-center gap-2">
                <Droplet class="w-4 h-4 text-cyan-400 fill-cyan-400/30" />
                <h4 class="font-bold text-sm text-slate-800 dark:text-white">Meta de Hidratación</h4>
              </div>
              <button @click="showEditTargetModal = false" class="p-1 rounded-full text-slate-400 hover:text-white">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 block mb-1">
                Objetivo diario en mililitros (ml)
              </label>
              <input 
                v-model="customTargetInput" 
                type="number" 
                min="500" 
                max="8000" 
                step="250"
                class="w-full input-field text-sm font-bold"
              />
              <p class="text-[10px] text-slate-400 dark:text-zinc-400 mt-1">
                Recomendado: 2000 ml a 3000 ml según tu actividad física.
              </p>
            </div>

            <!-- Quick target preset pills -->
            <div class="flex gap-1.5">
              <button 
                v-for="preset in [2000, 2500, 3000]" 
                :key="preset"
                @click="customTargetInput = preset"
                type="button"
                class="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors"
                :style="customTargetInput === preset ? { background: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4', borderColor: '#06b6d4' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'var(--glass-border)', color: 'var(--on-surface-muted)' }"
              >
                {{ preset / 1000 }}L
              </button>
            </div>

            <div class="flex gap-2 pt-2">
              <button 
                @click="showEditTargetModal = false"
                type="button"
                class="flex-1 py-2.5 rounded-xl font-bold text-xs"
                style="background: var(--surface-container-highest); color: var(--on-surface);"
              >
                Cancelar
              </button>
              <button 
                @click="saveTarget"
                type="button"
                class="flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md"
                style="background: #06b6d4; color: #000;"
              >
                Guardar Meta
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-modal-in {
  animation: modalIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
