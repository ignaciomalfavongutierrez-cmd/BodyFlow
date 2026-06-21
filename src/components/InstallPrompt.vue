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
    class="fixed bottom-20 left-4 right-4 p-4 rounded-2xl shadow-xl flex items-center justify-between z-50 md:max-w-md md:mx-auto md:left-0 md:right-0 border border-glass-border-hover animate-slide-up"
    style="background: rgba(14, 14, 16, 0.9); backdrop-filter: blur(20px);"
  >
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(25, 232, 13, 0.12); color: var(--primary);">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-sm" style="color: var(--on-surface);">Instalar BodyFlow</h3>
        <p class="text-xs" style="color: var(--on-surface-muted);">Añadir a pantalla de inicio</p>
      </div>
    </div>
    
    <div class="flex gap-2">
      <button @click="showInstallPrompt = false" class="px-3 py-2 text-xs font-bold transition-colors" style="color: var(--on-surface-muted); hover: color: var(--on-surface);">
        Después
      </button>
      <button @click="installApp" class="px-3 py-2 text-xs font-bold btn-primary">
        Instalar
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
</style>
