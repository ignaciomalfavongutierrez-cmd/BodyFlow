<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  date: string
  meal: {
    id: string
    name: string
    items?: string[]
    plannedMacros?: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }
  isCompleted: boolean
  customFoods?: { id: string; name: string; quantity: string }[]
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const router = useRouter()

function goToDetail() {
  router.push({ name: 'mealDetail', params: { date: props.date, mealId: props.meal.id } })
}
</script>

<template>
  <div 
    class="glass-card p-4 flex items-center mb-3 cursor-pointer active:scale-[0.98] transition-transform"
    :class="isCompleted ? 'opacity-60' : ''"
    @click="goToDetail"
  >
    <div class="flex-1 min-w-0 pr-2">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="font-semibold truncate" :class="isCompleted ? 'line-through' : ''" :style="{ color: isCompleted ? 'var(--on-surface-muted)' : 'var(--on-surface)' }">{{ meal.name }}</h3>
        <!-- Substitution badge -->
        <span 
          v-if="customFoods && customFoods.length > 0" 
          class="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style="background: rgba(255, 220, 224, 0.15); color: var(--tertiary-container);"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
          </svg>
          Sustituido
        </span>
      </div>
      
      <!-- Substituted foods list -->
      <p v-if="customFoods && customFoods.length > 0" class="text-xs mt-0.5 truncate" style="color: var(--tertiary-container);">
        {{ customFoods.map(f => f.name).join(', ') }}
      </p>
      <!-- Original items subtitle (only when not substituted) -->
      <p v-else-if="meal.items && meal.items.length > 0" class="text-xs mt-0.5 truncate italic" style="color: var(--on-surface-muted);">
        {{ meal.items.join(', ') }}
      </p>
      
      <div v-if="meal.plannedMacros" class="flex gap-3 mt-1 text-xs" style="color: var(--on-surface-muted);">
        <span>{{ meal.plannedMacros.calories || 0 }} kcal</span>
        <span>P: {{ meal.plannedMacros.protein || 0 }}g</span>
        <span>C: {{ meal.plannedMacros.carbs || 0 }}g</span>
        <span>F: {{ meal.plannedMacros.fat || 0 }}g</span>
      </div>
      <div v-else class="text-xs mt-1" style="color: var(--on-surface-muted);">
        Sin macros planificados
      </div>
    </div>
    
    <div class="ml-4" @click.stop="emit('toggle')">
      <!-- Custom Checkbox -->
      <div 
        class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer"
        :style="{
          backgroundColor: isCompleted ? 'var(--primary-container)' : 'transparent',
          borderColor: isCompleted ? 'var(--primary-container)' : 'var(--outline)',
        }"
      >
        <svg v-if="isCompleted" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style="color: var(--on-primary);">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </div>
</template>
