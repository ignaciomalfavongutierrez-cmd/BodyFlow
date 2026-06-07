<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import { usePwaStore } from './stores/pwa'
import { useAuthStore } from './stores/auth'
import splashVideo from './assets/splashscreen.mp4'

const isOffline = ref(!navigator.onLine)
const authStore = useAuthStore()
const pwaStore = usePwaStore()

const isAuthReady = computed(() => !authStore.loading)

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  window.addEventListener('beforeinstallprompt', (e) => {
    pwaStore.capturePrompt(e)
  })
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
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
    <div v-if="!isAuthReady" class="fixed inset-0 z-[100] flex items-center justify-center" style="background: var(--surface-container-lowest);">
      <div class="flex flex-col items-center">
        <video
          :src="splashVideo"
          autoplay
          muted
          playsinline
          loop
          class="w-40 h-40 object-contain mb-4 rounded-3xl"
        ></video>
        <h1 class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display); color: var(--primary);">BodyFlow</h1>
        <p class="text-sm mt-2 animate-pulse" style="color: var(--primary-container);">Cargando...</p>
      </div>
    </div>
    
    <AppLayout v-else :class="{'pt-6': isOffline}" />
  </div>
</template>
