<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import { usePwaStore } from './stores/pwa'
import { useAuthStore } from './stores/auth'

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
      class="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs font-bold py-1.5 text-center z-50 shadow-sm"
    >
      You are offline. Showing saved data.
    </div>

    <!-- Splash Screen / Global Loading -->
    <div v-if="!isAuthReady" class="min-h-screen flex items-center justify-center bg-gray-50 fixed inset-0 z-[100]">
      <div class="flex flex-col items-center">
        <div class="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-pulse">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">BodyFlow</h1>
        <p class="text-emerald-600 font-medium text-sm mt-2 animate-pulse">Cargando...</p>
      </div>
    </div>
    
    <AppLayout v-else :class="{'pt-6': isOffline}" />
  </div>
</template>
