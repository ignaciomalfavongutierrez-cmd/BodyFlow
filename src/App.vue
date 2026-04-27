<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppLayout from './layouts/AppLayout.vue'
import InstallPrompt from './components/InstallPrompt.vue'

const isOffline = ref(!navigator.onLine)

function updateOnlineStatus() {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
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
    
    <AppLayout :class="{'pt-6': isOffline}" />
    
    <InstallPrompt />
  </div>
</template>
