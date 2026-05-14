<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Home, Utensils, User, Settings } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Main content area -->
    <main class="flex-1 pb-16 overflow-y-auto">
      <RouterView />
    </main>

    <!-- Bottom Navigation (Mobile First) -->
    <nav class="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
      <router-link to="/" class="flex flex-col items-center text-gray-400 hover:text-emerald-600 active-nav-link">
        <Home class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Home</span>
      </router-link>
      <router-link to="/planner" class="flex flex-col items-center text-gray-400 hover:text-emerald-600">
        <Utensils class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Planner</span>
      </router-link>
      <router-link to="/profile" class="flex flex-col items-center text-gray-400 hover:text-emerald-600">
        <User class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Profile</span>
      </router-link>
      <router-link to="/settings" class="flex flex-col items-center text-gray-400 hover:text-emerald-600">
        <Settings class="h-6 w-6" />
        <span class="text-xs mt-1 font-medium">Settings</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.router-link-active {
  color: #059669; /* emerald-600 */
}
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0.75rem);
}
</style>
