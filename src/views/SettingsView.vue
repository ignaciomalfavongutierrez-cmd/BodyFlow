<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { auth } from '../firebase'
import { updateProfile as updateAuthProfile } from 'firebase/auth'
import BaseInput from '../components/BaseInput.vue'
import { CheckCircle, AlertTriangle, LogOut } from 'lucide-vue-next'
import { usePwaStore } from '../stores/pwa'
import { useAuthStore } from '../stores/auth'
import { generateNutritionPlan } from '../services/nutrition/calculations'
import type { PhysicalData, NutritionGoals } from '../services/nutrition/models'

const userStore = useUserStore()
const pwaStore = usePwaStore()
const authStore = useAuthStore()

const showLogoutModal = ref(false)
const isSaved = ref(false)
const validationError = ref('')

// --- Draft State ---
// Each field is a local ref that starts as a default and gets populated by the
// watcher below once Firestore resolves. Using individual refs (not a single
// reactive object) keeps v-model bindings simple in the template.
const name = ref('')
const email = ref('')
const weight = ref<number | null>(null)
const height = ref<number | null>(null)
const age = ref<number | null>(null)
const gender = ref<'male' | 'female' | null>(null)
const activityFactor = ref(1.2)
const goal = ref('maintain')
const calories = ref(0)
const protein = ref(0)
const carbs = ref(0)
const fat = ref(0)
const sugar = ref(0)

// isDirty: true once the user has touched any field. While false, incoming
// Firestore snapshots are allowed to re-hydrate the form (safe initial load).
// Once true, we stop overwriting to avoid clobbering active user edits.
const isDirty = ref(false)

// Hydrate form from async store.
// PROBLEM THIS SOLVES: Previously refs were initialized with `ref(userStore.profile.weight)`.
// Because Firestore is async, the store holds null/defaults at mount time.
// The ref captured null and was never updated again — form always showed empty.
// NOW: this watcher fires once immediately (with defaults) and again when
// Firestore resolves, safely populating the form without overwriting edits.
watch(
  () => userStore.profile,
  (p) => {
    if (isDirty.value) return
    name.value = p.name || auth.currentUser?.displayName || ''
    email.value = p.email || auth.currentUser?.email || ''
    weight.value = p.weight
    height.value = p.height
    age.value = p.age
    gender.value = p.gender
    activityFactor.value = p.activityFactor || 1.2
    goal.value = p.goal || 'maintain'
    calories.value = p.macroTargets.calories
    protein.value = p.macroTargets.protein
    carbs.value = p.macroTargets.carbs
    fat.value = p.macroTargets.fat
    sugar.value = p.macroTargets.sugar
  },
  { deep: true, immediate: true }
)

const isFormValid = computed(() => {
  if (weight.value && weight.value < 0) return false
  if (height.value && height.value < 0) return false
  if (age.value && age.value < 0) return false
  if (calories.value < 0 || protein.value < 0 || carbs.value < 0 || fat.value < 0 || sugar.value < 0) return false
  return true
})

async function saveProfile() {
  if (!isFormValid.value) {
    validationError.value = 'Values cannot be negative.'
    return
  }

  validationError.value = ''

  try {
    if (auth.currentUser && name.value !== auth.currentUser.displayName) {
      await updateAuthProfile(auth.currentUser, { displayName: name.value })
    }
  } catch (e: any) {
    validationError.value = e.message
    return
  }

  await userStore.updateProfile({
    name: name.value,
    email: email.value,
    weight: weight.value ? Number(weight.value) : null,
    height: height.value ? Number(height.value) : null,
    age: age.value ? Number(age.value) : null,
    gender: gender.value,
    activityFactor: Number(activityFactor.value),
    goal: goal.value,
    macroTargets: {
      calories: Number(calories.value),
      protein: Number(protein.value),
      carbs: Number(carbs.value),
      fat: Number(fat.value),
      sugar: Number(sugar.value)
    }
  })

  // After saving, allow Firestore to re-hydrate (clear dirty flag)
  isDirty.value = false
  isSaved.value = true
  setTimeout(() => { isSaved.value = false }, 2000)
}

// Auto-calculate uses the canonical nutrition service (Mifflin-St Jeor).
// All business logic lives in src/services/nutrition/ — never in components.
function autoCalculate() {
  const physicalData: PhysicalData = {
    weight: weight.value ? Number(weight.value) : null,
    height: height.value ? Number(height.value) : null,
    age: age.value ? Number(age.value) : null,
    gender: gender.value,
    activityFactor: Number(activityFactor.value)
  }
  const nutritionGoals: NutritionGoals = { goal: goal.value }

  try {
    const targets = generateNutritionPlan({ ...physicalData, ...nutritionGoals })
    calories.value = targets.calories
    protein.value = targets.protein
    carbs.value = targets.carbs
    fat.value = targets.fat
    sugar.value = targets.sugar
    validationError.value = ''
    isDirty.value = true
    saveProfile()
  } catch (e: any) {
    validationError.value = e.message
  }
}

function markDirty() {
  isDirty.value = true
}

function confirmLogout() {
  authStore.handleLogout()
}
</script>

<template>
  <div class="max-w-md mx-auto w-full flex flex-col h-full bg-gray-50 min-h-[calc(100vh-64px)]">
    <header class="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex justify-between items-center shadow-sm">
      <h1 class="text-xl font-bold text-gray-900">Account</h1>
      <transition name="fade">
        <span v-if="isSaved" class="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          <CheckCircle class="w-4 h-4" /> Saved!
        </span>
      </transition>
    </header>

    <div class="p-4 flex-1 pb-24 overflow-y-auto space-y-6">
      <div v-if="validationError" class="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
        <AlertTriangle class="w-5 h-5 flex-shrink-0" />
        {{ validationError }}
      </div>

      <!-- PWA Install -->
      <section v-if="pwaStore.isInstallable" class="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-emerald-900">Install BodyFlow</h2>
          <p class="text-xs text-emerald-700">Add to your home screen.</p>
        </div>
        <button @click="pwaStore.promptInstall" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-emerald-700 transition">
          Install
        </button>
      </section>

      <!-- Account Info -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
        <div class="space-y-4">
          <BaseInput label="Name" v-model="name" type="text" placeholder="Your name" @input="markDirty" />
          <BaseInput label="Email" v-model="email" type="text" disabled placeholder="your@email.com" />
        </div>
      </section>

      <!-- Physical Data -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Physical Data</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <BaseInput label="Weight (kg)" v-model="weight" type="number" placeholder="e.g. 70" @input="markDirty" />
          <BaseInput label="Height (cm)" v-model="height" type="number" placeholder="e.g. 175" @input="markDirty" />
          <BaseInput label="Age" v-model="age" type="number" placeholder="e.g. 25" @input="markDirty" />
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Biological Sex</label>
            <select v-model="gender" @change="markDirty" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-gray-900 appearance-none">
              <option :value="null" disabled>Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col mb-4">
          <label class="text-sm font-medium text-gray-700 mb-1">Activity Level</label>
          <select v-model="activityFactor" @change="markDirty" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-gray-900 appearance-none">
            <option :value="1.2">Sedentary (Little/No Exercise)</option>
            <option :value="1.375">Lightly Active (1-3 days/wk)</option>
            <option :value="1.55">Moderately Active (3-5 days/wk)</option>
            <option :value="1.725">Very Active (6-7 days/wk)</option>
            <option :value="1.9">Extremely Active (Physical job)</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">Goal</label>
          <select v-model="goal" @change="markDirty" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-gray-900 appearance-none">
            <option value="cut">Cut (Lose fat)</option>
            <option value="maintain">Maintain</option>
            <option value="bulk">Bulk (Build muscle)</option>
          </select>
        </div>
      </section>

      <!-- Macro Targets -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Macro Targets</h2>
          <button @click="autoCalculate" class="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
            Auto-calculate
          </button>
        </div>

        <BaseInput label="Calories (kcal)" v-model="calories" type="number" placeholder="e.g. 2000" class="mb-4" @input="markDirty" />

        <div class="grid grid-cols-2 gap-4">
          <BaseInput label="Protein (g)" v-model="protein" type="number" placeholder="e.g. 150" @input="markDirty" />
          <BaseInput label="Carbs (g)" v-model="carbs" type="number" placeholder="e.g. 200" @input="markDirty" />
          <BaseInput label="Fat (g)" v-model="fat" type="number" placeholder="e.g. 60" @input="markDirty" />
          <BaseInput label="Sugar (g)" v-model="sugar" type="number" placeholder="e.g. 30" @input="markDirty" />
        </div>
      </section>

      <!-- Logout Button -->
      <section class="mt-6 mb-8">
        <button @click="showLogoutModal = true" class="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors">
          <LogOut class="w-5 h-5" />
          Cerrar Sesión
        </button>
      </section>

    </div>

    <!-- Fixed Bottom Save Button -->
    <div class="fixed bottom-16 left-0 right-0 p-4 bg-white/70 backdrop-blur-md border-t border-gray-100 md:max-w-md md:mx-auto z-10">
      <button
        @click="saveProfile"
        class="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
        :disabled="!isFormValid"
      >
        Save Settings
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
    <transition name="fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div class="bg-white/80 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-2xl max-w-sm w-full">
          <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <LogOut class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">¿Cerrar sesión?</h3>
          <p class="text-sm text-gray-600 mb-6">Tendrás que volver a ingresar tus credenciales para acceder a tus datos.</p>
          <div class="flex gap-3">
            <button @click="showLogoutModal = false" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button @click="confirmLogout" class="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-colors">
              Salir
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
