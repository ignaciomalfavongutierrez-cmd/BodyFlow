<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import { usePwaStore } from './stores/pwa'
import { useAuthStore } from './stores/auth'
// import splashVideoSrc from './assets/splashscreen.mp4'

const isOffline = ref(!navigator.onLine)
const authStore = useAuthStore()
const pwaStore = usePwaStore()

const isAuthReady = computed(() => !authStore.loading)
const splashActive = ref(true)
// const videoRef = ref<HTMLVideoElement | null>(null)

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

// function handleVideoLoaded() {
//   if (videoRef.value) {
//     // Recortar los primeros 2 segundos como se solicitó antes
//     videoRef.value.currentTime = 2;
//     videoRef.value.play().catch(e => console.warn('Autoplay prevented:', e));
//   }
// }

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  window.addEventListener('beforeinstallprompt', (e) => {
    pwaStore.capturePrompt(e)
  })

  // Muestra el splash screen al menos por 2.5 segundos
  setTimeout(() => {
    splashActive.value = false
  }, 2500)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
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
      class="fixed top-0 left-0 right-0 text-xs font-bold py-1.5 text-center z-50 shadow-sm"
      style="background: var(--error-container); color: var(--error);"
    >
      Estás sin conexión. Mostrando datos guardados.
    </div>

    <!-- Beautiful Text Splash Screen -->
    <transition name="fade-splash">
      <div v-if="isSplashVisible" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0c] p-6 text-white overflow-hidden">
        
        <!-- Glowing Ambient Lights in Background -->
        <div class="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] -top-10 -left-10 pointer-events-none"></div>
        <div class="absolute w-72 h-72 bg-teal-500/10 rounded-full blur-[100px] -bottom-10 -right-10 pointer-events-none"></div>

        <!-- App Branding Container -->
        <div class="flex flex-col items-center select-none text-center">
          
          <!-- Animated Icon Container -->
          <div class="relative mb-6 flex items-center justify-center">
            <div class="absolute w-24 h-24 bg-emerald-500/15 rounded-full blur-xl animate-pulse-glow"></div>
            <div class="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#10b981] to-[#06b6d4] shadow-[0_12px_40px_rgba(16,185,129,0.35)] border border-emerald-400/20">
              <!-- Wavy lines or generic abstract logo representing health flow/nutrition -->
              <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <!-- Glowing App Name -->
          <h1 class="text-4xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 animate-shimmer" style="font-family: var(--font-display, sans-serif);">
            BodyFlow
          </h1>

          <!-- Tagline -->
          <p class="text-[11px] mt-2.5 tracking-[0.25em] text-gray-400 uppercase font-semibold">
            Fluye con tu nutrición
          </p>
        </div>

        <!-- Animated Loading indicators -->
        <div class="absolute bottom-16 flex flex-col items-center gap-3">
          <div class="flex gap-2 justify-center items-center">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
          <span class="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase">Iniciando</span>
        </div>

      </div>
    </transition>
    
    <AppLayout v-if="!isSplashVisible" :class="{'pt-6': isOffline}" />
  </div>
</template>

<style scoped>
.fade-splash-leave-active {
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-splash-leave-to {
  opacity: 0;
}

/* Animations */
@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
  40% { transform: scale(1.25); opacity: 1; }
}

.animate-bounce-slow {
  animation: bounceSlow 3.5s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulseGlow 3s ease-in-out infinite;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  animation: dotPulse 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }
</style>
