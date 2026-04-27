<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useDietStore } from '../stores/diet'
import { useLogStore } from '../stores/log'
import BaseInput from '../components/BaseInput.vue'

const userStore = useUserStore()
const dietStore = useDietStore()
const logStore = useLogStore()

const weight = ref(userStore.profile.weight)
const height = ref(userStore.profile.height)
const goal = ref(userStore.profile.goal || 'maintain')

const calories = ref(userStore.profile.macroTargets.calories)
const protein = ref(userStore.profile.macroTargets.protein)
const carbs = ref(userStore.profile.macroTargets.carbs)
const fat = ref(userStore.profile.macroTargets.fat)
const sugar = ref(userStore.profile.macroTargets.sugar)

const isSaved = ref(false)
const validationError = ref('')

const isFormValid = computed(() => {
  if (weight.value && weight.value < 0) return false
  if (height.value && height.value < 0) return false
  if (calories.value < 0 || protein.value < 0 || carbs.value < 0 || fat.value < 0 || sugar.value < 0) return false
  return true
})

function saveProfile() {
  if (!isFormValid.value) {
    validationError.value = 'Values cannot be negative.'
    return
  }
  
  validationError.value = ''
  
  userStore.updateProfile({
    weight: weight.value ? Number(weight.value) : null,
    height: height.value ? Number(height.value) : null,
    goal: goal.value,
    macroTargets: {
      calories: Number(calories.value),
      protein: Number(protein.value),
      carbs: Number(carbs.value),
      fat: Number(fat.value),
      sugar: Number(sugar.value)
    }
  })
  
  isSaved.value = true
  setTimeout(() => {
    isSaved.value = false
  }, 2000)
}

function autoCalculate() {
  if (!weight.value) {
    validationError.value = 'Please enter your weight first.'
    return
  }
  
  // Simple heuristic for demo purposes
  // BMR approx = weight * 22
  let targetCals = weight.value * 22
  
  if (goal.value === 'cut') targetCals *= 0.8
  if (goal.value === 'bulk') targetCals *= 1.2
  
  calories.value = Math.round(targetCals)
  protein.value = Math.round(weight.value * 2) // 2g per kg
  fat.value = Math.round((targetCals * 0.25) / 9) // 25% from fat
  carbs.value = Math.round((targetCals - (protein.value * 4) - (fat.value * 9)) / 4)
  sugar.value = 30 // fixed simple target
  
  saveProfile()
}

// Data Management
const fileInput = ref<HTMLInputElement | null>(null)
const importError = ref('')
const importSuccess = ref(false)

function exportData() {
  const data = {
    user: userStore.$state,
    diet: dietStore.$state,
    log: logStore.$state
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bodyflow-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const data = JSON.parse(content)
      
      if (!data.user || !data.diet || !data.log) {
        throw new Error('Invalid backup format')
      }

      userStore.$state = data.user
      dietStore.$state = data.diet
      logStore.$state = data.log

      importSuccess.value = true
      importError.value = ''
      
      // Update local refs to reflect new user profile state
      weight.value = userStore.profile.weight
      height.value = userStore.profile.height
      goal.value = userStore.profile.goal || 'maintain'
      calories.value = userStore.profile.macroTargets.calories
      protein.value = userStore.profile.macroTargets.protein
      carbs.value = userStore.profile.macroTargets.carbs
      fat.value = userStore.profile.macroTargets.fat
      sugar.value = userStore.profile.macroTargets.sugar

      setTimeout(() => {
        importSuccess.value = false
      }, 3000)
    } catch (err: any) {
      importError.value = err.message || 'Failed to import backup'
      setTimeout(() => {
        importError.value = ''
      }, 3000)
    }
    // reset input
    if (fileInput.value) fileInput.value.value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="max-w-md mx-auto w-full flex flex-col h-full bg-white min-h-[calc(100vh-64px)]">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center shadow-sm">
      <h1 class="text-xl font-bold text-gray-900">Profile</h1>
      <span v-if="isSaved" class="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md transition-opacity">
        Saved!
      </span>
    </header>

    <div class="p-4 flex-1 pb-24 overflow-y-auto space-y-8">
      
      <div v-if="validationError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">
        {{ validationError }}
      </div>

      <!-- Personal Info Section -->
      <section>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Personal Info</h2>
        <div class="bg-white rounded-2xl">
          <div class="grid grid-cols-2 gap-4">
            <BaseInput label="Weight (kg)" v-model="weight" type="number" placeholder="e.g. 70" />
            <BaseInput label="Height (cm)" v-model="height" type="number" placeholder="e.g. 175" />
          </div>
          
          <div class="flex flex-col mb-4">
            <label class="text-sm font-medium text-gray-700 mb-1">Goal</label>
            <select 
              v-model="goal"
              class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none w-full text-gray-900 appearance-none"
            >
              <option value="cut">Cut (Lose fat)</option>
              <option value="maintain">Maintain</option>
              <option value="bulk">Bulk (Build muscle)</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Macro Targets Section -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Macro Targets</h2>
          <button @click="autoCalculate" class="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
            Auto-calculate
          </button>
        </div>
        
        <div class="bg-white rounded-2xl">
          <BaseInput label="Calories (kcal)" v-model="calories" type="number" placeholder="e.g. 2000" />
          
          <div class="grid grid-cols-2 gap-4">
            <BaseInput label="Protein (g)" v-model="protein" type="number" placeholder="e.g. 150" />
            <BaseInput label="Carbs (g)" v-model="carbs" type="number" placeholder="e.g. 200" />
            <BaseInput label="Fat (g)" v-model="fat" type="number" placeholder="e.g. 60" />
            <BaseInput label="Sugar (g)" v-model="sugar" type="number" placeholder="e.g. 30" />
          </div>
        </div>
      </section>

      <!-- Data Management Section -->
      <section>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
        
        <div v-if="importError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">
          {{ importError }}
        </div>
        <div v-if="importSuccess" class="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg mb-4">
          Data imported successfully!
        </div>

        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 class="text-sm font-bold text-gray-800 mb-1">Export Data</h3>
            <p class="text-xs text-gray-500 mb-3">Save your profile, diet plan, and logs as a backup file.</p>
            <button 
              @click="exportData"
              class="w-full py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-sm"
            >
              Export JSON Backup
            </button>
          </div>
          
          <div class="pt-4 border-t border-gray-100">
            <h3 class="text-sm font-bold text-gray-800 mb-1">Import Data</h3>
            <p class="text-xs text-gray-500 mb-3">Restore your data from a previous backup file.</p>
            <input 
              type="file" 
              ref="fileInput" 
              accept=".json" 
              class="hidden" 
              @change="handleImport"
            />
            <button 
              @click="triggerImport"
              class="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              Import JSON Backup
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Fixed Bottom Save Button -->
    <div class="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:max-w-md md:mx-auto">
      <button 
        @click="saveProfile"
        class="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50"
        :disabled="!isFormValid"
      >
        Save Profile
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Custom select chevron using background image since we use appearance-none */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
