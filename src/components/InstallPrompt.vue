<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const deferredPrompt = ref<any>(null)
const showInstallPrompt = ref(false)

const handleBeforeInstallPrompt = (e: Event) => {
  e.preventDefault()
  deferredPrompt.value = e
  showInstallPrompt.value = true
}

const installApp = async () => {
  if (!deferredPrompt.value) return
  
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    showInstallPrompt.value = false
  }
  deferredPrompt.value = null
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>

<template>
  <div 
    v-if="showInstallPrompt" 
    class="fixed bottom-20 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between z-50 md:max-w-md md:mx-auto md:left-0 md:right-0"
  >
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-sm">Install App</h3>
        <p class="text-xs text-gray-400">Add to home screen</p>
      </div>
    </div>
    
    <div class="flex gap-2">
      <button @click="showInstallPrompt = false" class="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors">
        Later
      </button>
      <button @click="installApp" class="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
        Install
      </button>
    </div>
  </div>
</template>
