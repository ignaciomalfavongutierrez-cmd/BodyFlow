<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from './stores/user'
import { useDietStore } from './stores/diet'
import { useLogStore } from './stores/log'
import { usePwaStore } from './stores/pwa'

const isOffline = ref(!navigator.onLine)
const isAuthReady = ref(false)
const router = useRouter()

const userStore = useUserStore()
const dietStore = useDietStore()
const logStore = useLogStore()
const pwaStore = usePwaStore()

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  onAuthStateChanged(auth, (user) => {
    if (isAuthReady.value && !user) {
      userStore.reset()
      dietStore.reset()
      logStore.reset()
      
      if (router.currentRoute.value.meta.requiresAuth) {
        router.push({ name: 'login', query: { expired: 'true' } })
      }
    }
    
    isAuthReady.value = true
  })

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
