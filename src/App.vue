<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import { usePwaStore } from './stores/pwa'
import { useAuthStore } from './stores/auth'

const isOffline = ref(!navigator.onLine)
const authStore = useAuthStore()
const pwaStore = usePwaStore()

const isAuthReady = computed(() => !authStore.loading)
const splashActive = ref(true)
const loadingProgress = ref(0)

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
    splashActive.value = false
    if (phraseInterval) clearInterval(phraseInterval)
  }, 2300)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  if (phraseInterval) clearInterval(phraseInterval)
  if (progressInterval) clearInterval(progressInterval)
})

const isSplashVisible = computed(() => {
  return !isAuthReady.value || splashActive.value
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

          <!-- Dynamic Intelligent Nutrition Phrase with Fade Animation -->
          <div class="h-14 mt-4 flex items-center justify-center">
            <transition name="phrase-fade" mode="out-in">
              <p :key="currentPhraseIndex" class="text-sm sm:text-base font-medium text-gray-300 tracking-wide leading-relaxed">
                "{{ nutritionPhrases[currentPhraseIndex] }}"
              </p>
            </transition>
          </div>
        </div>

        <!-- Footer Loading Bar & Status -->
        <div class="w-full max-w-xs flex flex-col items-center gap-3 z-10 pb-4">
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
    
    <AppLayout v-if="!isSplashVisible" :class="{'pt-6': isOffline}" />
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

