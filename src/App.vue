<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import InstallPrompt from './components/InstallPrompt.vue'

const isOffline = ref(!navigator.onLine)
const showSplash = ref(true)
const splashVideo = ref<HTMLVideoElement | null>(null)

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
  
  // Ocultar el splash screen después de 1.9 segundos exactos
  setTimeout(() => {
    showSplash.value = false
  }, 1900)
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
      class="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs font-bold py-1.5 text-center z-50 shadow-sm"
    >
      You are offline. Showing saved data.
    </div>

    <!-- Splash Screen con el video -->
    <transition name="fade">
      <div 
        v-if="showSplash" 
        class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900"
      >
        <!-- El src apunta a la carpeta public (/splashscreen2.mp4) lo que evita errores de build (import) -->
        <video 
          ref="splashVideo"
          src="/splashscreen.mp4" 
          class="w-48 h-48 object-cover rounded-3xl mb-6 shadow-2xl"
          muted 
          playsinline
          @loadedmetadata="handleVideoLoaded"
        ></video>
        <h1 class="text-3xl font-bold text-emerald-500 tracking-tight">BodyFlow</h1>
        <p class="text-emerald-600 font-medium text-sm mt-2 animate-pulse">Cargando...</p>
      </div>
    </transition>
    
    <AppLayout v-if="!showSplash" :class="{'pt-6': isOffline}" />
    
    <InstallPrompt />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
