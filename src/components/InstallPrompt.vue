<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePwaStore } from '../stores/pwa'
import { useAuthStore } from '../stores/auth'
import { Download, X, Share } from 'lucide-vue-next'

const route = useRoute()
const pwaStore = usePwaStore()
const authStore = useAuthStore()

const isVisible = computed(() => {
  // Do not show on login screen or if unauthenticated or if already standalone/dismissed
  if (route.name === 'login' || !authStore.user || pwaStore.isStandalone || pwaStore.isDismissed) {
    return false
  }
  return pwaStore.isInstallable || pwaStore.isIOS
})

async function handleInstall() {
  await pwaStore.promptInstall()
}

function handleDismiss() {
  pwaStore.dismissPrompt()
}
</script>

<template>
  <transition name="slide-fade">
    <div 
      v-if="isVisible" 
      class="fixed bottom-20 left-4 right-4 p-4 rounded-2xl shadow-2xl z-50 md:max-w-md md:mx-auto md:left-0 md:right-0 border border-slate-200 dark:border-white/10 backdrop-blur-xl transition-all"
      style="background: var(--glass-bg);"
    >
      <div class="flex items-start justify-between gap-3">
        <!-- Icon & Info -->
        <div class="flex items-center gap-3.5 flex-1 min-w-0">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(25, 232, 13, 0.12); color: var(--primary);">
            <Download v-if="!pwaStore.isIOS || pwaStore.isInstallable" class="h-5 w-5" />
            <Share v-else class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-sm truncate" style="color: var(--on-surface);">Instalar BodyFlow</h3>
            <p v-if="!pwaStore.isIOS || pwaStore.isInstallable" class="text-xs mt-0.5" style="color: var(--on-surface-muted);">
              Acceso rápido desde tu pantalla de inicio
            </p>
            <p v-else class="text-xs mt-0.5 leading-snug" style="color: var(--on-surface-muted);">
              Toca <Share class="inline h-3.5 w-3.5 mx-0.5 text-emerald-600 dark:text-[#87ff70]" /> y selecciona <strong class="text-slate-800 dark:text-white">"Agregar a inicio"</strong>
            </p>
          </div>
        </div>

        <!-- Dismiss button -->
        <button 
          @click="handleDismiss"
          class="p-1.5 -mr-1 -mt-1 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/10"
          aria-label="Cerrar aviso"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Actions for Android/Desktop -->
      <div v-if="pwaStore.isInstallable" class="mt-3.5 flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
        <button 
          @click="handleDismiss" 
          class="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors text-gray-400 hover:text-white"
        >
          Después
        </button>
        <button 
          @click="handleInstall" 
          class="px-4 py-1.5 text-xs font-bold btn-primary rounded-xl shadow-md active:scale-95 transition-all"
        >
          Instalar App
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from {
  transform: translateY(24px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(16px);
  opacity: 0;
}
</style>

