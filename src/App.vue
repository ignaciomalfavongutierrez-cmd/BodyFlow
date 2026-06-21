<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import { usePwaStore } from './stores/pwa'
import { useAuthStore } from './stores/auth'
import splashVideo from './assets/splashscreen2.mp4'

const isOffline = ref(!navigator.onLine)
const authStore = useAuthStore()
const pwaStore = usePwaStore()

const isAuthReady = computed(() => !authStore.loading)
const splashActive = ref(true)

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

function handleVideoLoaded() {
  if (splashVideo.value) {
    // Recortar los primeros 2 segundos como se solicitó antes
    splashVideo.value.currentTime = 2;
    splashVideo.value.play().catch(e => console.warn('Autoplay prevented:', e));
  }
}

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

    <!-- Splash Screen with Video -->
    <transition name="fade-splash">
      <div v-if="isSplashVisible" class="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        <video
          :src="splashVideo"
          autoplay
          muted
          playsinline
          loop
          class="w-full h-full object-cover"
        ></video>
      </div>
    </transition>
    
    <AppLayout v-if="!isSplashVisible" :class="{'pt-6': isOffline}" />
  </div>
</template>

<style scoped>
.fade-splash-leave-active {
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-splash-leave-to {
  opacity: 0;
}
</style>
