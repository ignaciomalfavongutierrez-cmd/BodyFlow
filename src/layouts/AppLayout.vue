<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { Home, Utensils, User } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--surface-container-lowest); font-family: var(--font-body);">
    <!-- Main content area -->
    <main class="flex-1 overflow-y-auto" :class="{'pb-16': route.meta.requiresAuth && authStore.user}">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Bottom Navigation (Dark Glass) -->
    <nav
      v-if="route.meta.requiresAuth && authStore.user"
      class="fixed bottom-0 w-full flex justify-around p-3 pb-safe z-50 backdrop-blur-md"
      style="background: rgba(14, 14, 16, 0.85); border-top: 1px solid var(--glass-border);"
    >
      <router-link to="/" class="nav-item flex flex-col items-center transition-colors">
        <Home class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Inicio</span>
      </router-link>
      <router-link to="/planner" class="nav-item flex flex-col items-center transition-colors">
        <Utensils class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Planner</span>
      </router-link>
      <router-link to="/settings" class="nav-item flex flex-col items-center transition-colors">
        <User class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Cuenta</span>
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
