<script setup lang="ts">
import { RouterView } from 'vue-router'
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
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs mt-1 font-medium">Home</span>
      </router-link>
      <router-link to="/planner" class="flex flex-col items-center text-gray-400 hover:text-emerald-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span class="text-xs mt-1 font-medium">Planner</span>
      </router-link>
      <router-link to="/profile" class="flex flex-col items-center text-gray-400 hover:text-emerald-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs mt-1 font-medium">Profile</span>
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
