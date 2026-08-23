<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import { usePwaStore } from './stores/pwa'
import { useAuthStore } from './stores/auth'

const isOffline = ref(!navigator.onLine)
const authStore = useAuthStore()
const pwaStore = usePwaStore()

// ─── Splash Control ───
// Splash shows during BOTH: minimum visual duration AND auth initialization.
// It disappears only when BOTH conditions are met.
const splashMinTimeElapsed = ref(false)
const loadingProgress = ref(0)

// Splash is visible when:
// 1. Auth is still initializing/restoring AND min time hasn't elapsed, OR
// 2. Auth is still initializing/restoring (even if min time elapsed — we wait for auth)
// 3. Min time hasn't elapsed (even if auth is ready — visual polish)
// BUT: if auth errors out, we show recovery UI instead of hiding splash
const isSplashVisible = computed(() => {
  // If auth resolved (authenticated or unauthenticated), only wait for min visual time
  if (authStore.isAuthReady && authStore.status !== 'error') {
    return !splashMinTimeElapsed.value
  }
  // If auth errored, keep splash visible to show recovery UI
  if (authStore.status === 'error') {
    return true
  }
  // Auth still loading — splash stays
  return true
})

// Show recovery UI when auth timed out or errored
const showRecoveryUI = computed(() => authStore.status === 'error')

// ─── Toast Notification System ───
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, durationMs = 4000) {
  if (!message) return
  toastMessage.value = message
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, durationMs)
}

// Watch for auth errors → show toast
watch(() => authStore.authError, (newError) => {
  if (newError && authStore.status !== 'error') {
    // Non-critical auth error (e.g., during login attempt) — show toast
    showToast(newError)
    authStore.clearError()
  }
})

// Dynamic phrases about intelligent nutrition
const nutritionPhrases = [
  "Nutrición inteligente guiada por Inteligencia Artificial.",
  "Optimizando tu energía y macronutrientes en tiempo real.",
  "Alimentación calculada para tu máximo rendimiento bio-físico.",
  "Tu cuerpo en equilibrio con decisiones nutricionales inteligentes."
]

const currentPhraseIndex = ref(0)
let phraseInterval: ReturnType<typeof setInterval> | null = null
let progressInterval: ReturnType<typeof setInterval> | null = null

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

async function handleRetry() {
  loadingProgress.value = 0
  await authStore.retryAuth()
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  window.addEventListener('beforeinstallprompt', (e) => {
    pwaStore.capturePrompt(e)
  })

  // Rotate phrases smoothly
  phraseInterval = setInterval(() => {
    currentPhraseIndex.value = (currentPhraseIndex.value + 1) % nutritionPhrases.length
  }, 2200)

  // Progress bar simulation up to 100%
  const startTime = Date.now()
  const duration = 2200 // 2.2 seconds total splash time

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(Math.round((elapsed / duration) * 100), 100)
    loadingProgress.value = progress

    if (progress >= 100) {
      if (progressInterval) clearInterval(progressInterval)
    }
  }, 30)

  // Ensure splash stays active for minimum 2.3s for visual enjoyment
  setTimeout(() => {
    splashMinTimeElapsed.value = true
    if (phraseInterval) clearInterval(phraseInterval)
  }, 2300)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  if (phraseInterval) clearInterval(phraseInterval)
  if (progressInterval) clearInterval(progressInterval)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <div>
    <!-- Offline Banner -->
    <div 
      v-if="isOffline" 
      class="fixed top-0 left-0 right-0 text-xs font-bold py-1.5 text-center z-[110] shadow-md border-b border-red-500/20 backdrop-blur-md"
      style="background: rgba(147, 0, 10, 0.9); color: #ffdad6;"
    >
      ⚡ Estás sin conexión. Mostrando datos guardados.
    </div>

    <!-- Premium Intelligent Nutrition Splash Loading Screen -->
    <transition name="fade-splash">
      <div 
        v-if="isSplashVisible" 
        class="fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-6 bg-[#09090b] text-white overflow-hidden select-none"
      >
        <!-- Background Glowing Orbs -->
        <div class="absolute w-96 h-96 bg-[#19e80d]/10 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none animate-pulse-glow"></div>
        <div class="absolute w-96 h-96 bg-[#4edea3]/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none animate-pulse-glow" style="animation-delay: 1.5s;"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,232,13,0.03)_0%,transparent_70%)] pointer-events-none"></div>

        <!-- Header Space / Badge -->
        <div class="w-full flex justify-center pt-4 z-10">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-[#19e80d] animate-ping"></span>
            <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-[#87ff70]">
              Nutrición Inteligente
            </span>
          </div>
        </div>

        <!-- Center Branding Container -->
        <div class="flex flex-col items-center text-center max-w-sm px-4 z-10 my-auto">
          
          <!-- Animated BioFlow Energy Icon -->
          <div class="relative mb-8 flex items-center justify-center">
            <div class="absolute w-28 h-28 bg-[#19e80d]/20 rounded-3xl blur-xl animate-pulse-glow"></div>
            <div class="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br from-[#19e80d] via-[#00a572] to-[#0e0e10] p-[1.5px] shadow-[0_0_50px_rgba(25,232,13,0.3)]">
              <div class="w-full h-full bg-[#0e0e10]/90 backdrop-blur-xl rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-[#19e80d]/15 to-transparent"></div>
                <!-- Abstract Bio/Leaf Spark Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="w-11 h-11 text-[#87ff70] drop-shadow-[0_0_12px_rgba(135,255,112,0.6)] animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- App Title BodyFlow -->
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#87ff70] via-[#4edea3] to-[#19e80d] drop-shadow-[0_0_20px_rgba(25,232,13,0.3)]" style="font-family: var(--font-display, 'Outfit', sans-serif);">
            BodyFlow
          </h1>

          <!-- Dynamic Intelligent Nutrition Phrase with Fade Animation (normal mode) -->
          <div v-if="!showRecoveryUI" class="h-14 mt-4 flex items-center justify-center">
            <transition name="phrase-fade" mode="out-in">
              <p :key="currentPhraseIndex" class="text-sm sm:text-base font-medium text-gray-300 tracking-wide leading-relaxed">
                "{{ nutritionPhrases[currentPhraseIndex] }}"
              </p>
            </transition>
          </div>

          <!-- Recovery UI (when auth timed out or errored) -->
          <div v-if="showRecoveryUI" class="mt-6 flex flex-col items-center gap-4">
            <p class="text-sm text-gray-400 leading-relaxed">
              {{ authStore.authError || 'El inicio de sesión está tardando más de lo esperado.' }}
            </p>
            <button
              @click="handleRetry"
              :disabled="authStore.loading"
              class="px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.96] cursor-pointer disabled:opacity-50"
              style="background: var(--kinetic-glow, linear-gradient(135deg, #19e80d 0%, #87ff70 100%)); color: #013a00;"
            >
              {{ authStore.loading ? 'Reintentando...' : 'Reintentar' }}
            </button>
          </div>
        </div>

        <!-- Footer Loading Bar & Status (normal mode) -->
        <div v-if="!showRecoveryUI" class="w-full max-w-xs flex flex-col items-center gap-3 z-10 pb-4">
          <!-- Sleek Glowing Progress Bar -->
          <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-[1px] backdrop-blur-sm border border-white/5 shadow-inner">
            <div 
              class="h-full bg-gradient-to-r from-[#19e80d] to-[#4edea3] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(25,232,13,0.8)]"
              :style="{ width: `${loadingProgress}%` }"
            ></div>
          </div>
          
          <div class="w-full flex justify-between items-center text-[10px] tracking-[0.15em] text-gray-400 font-mono">
            <span class="uppercase font-semibold text-emerald-400/80">Inicializando IA...</span>
            <span class="font-bold text-[#87ff70]">{{ loadingProgress }}%</span>
          </div>
        </div>

      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div
        v-if="toastVisible"
        class="fixed bottom-6 left-4 right-4 z-[120] flex justify-center pointer-events-none"
      >
        <div
          class="max-w-sm w-full px-4 py-3 rounded-2xl text-sm font-medium text-center pointer-events-auto shadow-xl backdrop-blur-md"
          style="background: rgba(24, 24, 27, 0.92); color: var(--on-surface, #e5e1e4); border: 1px solid var(--glass-border, rgba(255,255,255,0.08));"
        >
          {{ toastMessage }}
        </div>
      </div>
    </transition>
    
    <AppLayout :class="{'pt-6': isOffline}" />
  </div>
</template>

<style scoped>
.fade-splash-leave-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-splash-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.phrase-fade-enter-active,
.phrase-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.phrase-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.phrase-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Toast animation */
.toast-slide-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.08); }
}

@keyframes floatAnim {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
}

.animate-pulse-glow {
  animation: pulseGlow 3s ease-in-out infinite;
}

.animate-float {
  animation: floatAnim 3s ease-in-out infinite;
}
</style>
