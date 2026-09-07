<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Home, Utensils, TrendingUp, Calculator, User } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import InstallPrompt from '../components/InstallPrompt.vue'

const route = useRoute()
const authStore = useAuthStore()

const showBottomNav = computed(() => {
  return Boolean(route.meta.requiresAuth && authStore.user && !route.path.startsWith('/utilities'))
})
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--surface-container-lowest); font-family: var(--font-body);">
    <!-- Main content area -->
    <main class="flex-1 overflow-y-auto" :class="{'pb-16': showBottomNav}">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Floating PWA Install Prompt Banner -->
    <InstallPrompt />

    <!-- Bottom Navigation - 5 tabs for patient views -->
    <nav
      v-if="showBottomNav"
      class="fixed bottom-0 w-full flex justify-around items-center px-1 py-2 pb-safe z-50 backdrop-blur-md no-print shadow-lg transition-colors"
      style="background: var(--glass-bg); border-top: 1px solid var(--glass-border);"
    >
      <router-link to="/" class="nav-item flex flex-col items-center justify-center transition-colors px-2 py-1">
        <Home class="h-5 w-5" />
        <span class="text-[10px] mt-0.5 font-medium tracking-tight">Inicio</span>
      </router-link>

      <router-link to="/planner" class="nav-item flex flex-col items-center justify-center transition-colors px-2 py-1">
        <Utensils class="h-5 w-5" />
        <span class="text-[10px] mt-0.5 font-medium tracking-tight">Planner</span>
      </router-link>

      <router-link to="/progress" class="nav-item flex flex-col items-center justify-center transition-colors px-2 py-1">
        <TrendingUp class="h-5 w-5" />
        <span class="text-[10px] mt-0.5 font-medium tracking-tight">Consultas</span>
      </router-link>

      <router-link to="/tools" class="nav-item flex flex-col items-center justify-center transition-colors px-2 py-1">
        <Calculator class="h-5 w-5" />
        <span class="text-[10px] mt-0.5 font-medium tracking-tight">Herramientas</span>
      </router-link>

      <router-link to="/settings" class="nav-item flex flex-col items-center justify-center transition-colors px-2 py-1">
        <User class="h-5 w-5" />
        <span class="text-[10px] mt-0.5 font-medium tracking-tight">Cuenta</span>
      </router-link>
    </nav>
  </div>
</template>


<style scoped>
.nav-item {
  color: var(--on-surface-muted);
}
.nav-item:hover {
  color: var(--primary);
}
.router-link-active.nav-item {
  color: var(--primary-container);
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0.75rem);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
