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

const isDirty = ref(false)

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
    validationError.value = 'Los valores no pueden ser negativos.'
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

  isDirty.value = false
  isSaved.value = true
  setTimeout(() => { isSaved.value = false }, 2000)
}

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
  <div class="max-w-md mx-auto w-full flex flex-col h-full min-h-[calc(100vh-64px)]" style="background: var(--surface-container-lowest);">
    <!-- Header -->
    <header class="sticky top-0 z-10 px-4 py-4 flex justify-between items-center backdrop-blur-md" style="background: rgba(14, 14, 16, 0.8); border-bottom: 1px solid var(--glass-border);">
      <h1 class="text-xl font-bold" style="font-family: var(--font-display); color: var(--on-surface);">Cuenta</h1>
      <transition name="fade">
        <span v-if="isSaved" class="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style="background: rgba(25, 232, 13, 0.15); color: var(--primary);">
          <CheckCircle class="w-3.5 h-3.5" /> ¡Guardado!
        </span>
      </transition>
    </header>

    <div class="p-4 flex-1 pb-24 overflow-y-auto space-y-6">
      <div v-if="validationError" class="p-3 text-sm rounded-xl flex items-center gap-2" style="background: var(--error-container); color: var(--error); border: 1px solid rgba(255, 180, 171, 0.15);">
        <AlertTriangle class="w-5 h-5 flex-shrink-0" />
        {{ validationError }}
      </div>

      <!-- PWA Install -->
      <section v-if="pwaStore.isInstallable" class="glass-card p-5 flex items-center justify-between" style="border-color: rgba(25, 232, 13, 0.3);">
        <div>
          <h2 class="text-sm font-bold" style="color: var(--primary);">Instalar BodyFlow</h2>
          <p class="text-xs" style="color: var(--on-surface-muted);">Añádelo a tu pantalla de inicio.</p>
        </div>
        <button @click="pwaStore.promptInstall" class="px-4 py-2 btn-primary text-xs font-bold shadow transition">
          Instalar
        </button>
      </section>

      <!-- Account Info -->
      <section class="glass-card p-5 space-y-4">
        <h2 class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color: var(--on-surface-muted);">Información de Cuenta</h2>
        <div class="space-y-4">
          <BaseInput label="Nombre" v-model="name" type="text" placeholder="Tu nombre" @input="markDirty" />
          <BaseInput label="Email" v-model="email" type="text" disabled placeholder="tu@email.com" />
        </div>
      </section>

      <!-- Physical Data -->
      <section class="glass-card p-5">
        <h2 class="text-[11px] font-bold uppercase tracking-wider mb-4" style="color: var(--on-surface-muted);">Datos Físicos</h2>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <BaseInput label="Peso (kg)" v-model="weight" type="number" placeholder="Ej. 70" @input="markDirty" />
          <BaseInput label="Estatura (cm)" v-model="height" type="number" placeholder="Ej. 175" @input="markDirty" />
          <BaseInput label="Edad" v-model="age" type="number" placeholder="Ej. 25" @input="markDirty" />
          
          <div class="flex flex-col">
            <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" style="color: var(--on-surface-muted);">Sexo Biológico</label>
            <select v-model="gender" @change="markDirty" class="input-field text-sm w-full appearance-none">
              <option :value="null" disabled>Selecciona...</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col mb-4">
          <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" style="color: var(--on-surface-muted);">Nivel de Actividad</label>
          <select v-model="activityFactor" @change="markDirty" class="input-field text-sm w-full appearance-none">
            <option :value="1.2">Sedentario (Poco/Sin Ejercicio)</option>
            <option :value="1.375">Ligero (1-3 días/sem)</option>
            <option :value="1.55">Moderado (3-5 días/sem)</option>
            <option :value="1.725">Activo (6-7 días/sem)</option>
            <option :value="1.9">Muy Activo (Trabajo físico/Doble entreno)</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label class="text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1" style="color: var(--on-surface-muted);">Objetivo</label>
          <select v-model="goal" @change="markDirty" class="input-field text-sm w-full appearance-none">
            <option value="cut">Definición (Perder grasa)</option>
            <option value="maintain">Mantenimiento</option>
            <option value="bulk">Volumen (Ganar músculo)</option>
          </select>
        </div>
      </section>

      <!-- Macro Targets -->
      <section class="glass-card p-5">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-[11px] font-bold uppercase tracking-wider" style="color: var(--on-surface-muted);">Metas de Macros</h2>
          <button @click="autoCalculate" class="text-xs font-semibold px-3 py-1.5 rounded-lg btn-secondary">
            Auto-calcular
          </button>
        </div>

        <BaseInput label="Calorías (kcal)" v-model="calories" type="number" placeholder="Ej. 2000" class="mb-4" @input="markDirty" />

        <div class="grid grid-cols-2 gap-4">
          <BaseInput label="Proteína (g)" v-model="protein" type="number" placeholder="Ej. 150" @input="markDirty" />
          <BaseInput label="Carbs (g)" v-model="carbs" type="number" placeholder="Ej. 200" @input="markDirty" />
          <BaseInput label="Grasa (g)" v-model="fat" type="number" placeholder="Ej. 60" @input="markDirty" />
          <BaseInput label="Azúcar (g)" v-model="sugar" type="number" placeholder="Ej. 30" @input="markDirty" />
        </div>
      </section>

      <!-- Logout Button -->
      <section class="mt-6 mb-8">
        <button @click="showLogoutModal = true" class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-colors" style="background: rgba(255, 180, 171, 0.1); color: var(--error); border: 1px solid rgba(255, 180, 171, 0.15);">
          <LogOut class="w-5 h-5" />
          Cerrar Sesión
        </button>
      </section>
    </div>

    <!-- Fixed Bottom Save Button -->
    <div class="fixed bottom-16 left-0 right-0 p-4 border-t md:max-w-md md:mx-auto z-10 backdrop-blur-md" style="background: rgba(14, 14, 16, 0.85); border-top: 1px solid var(--glass-border);">
      <button
        @click="saveProfile"
        class="w-full py-4 btn-primary text-lg rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
        :disabled="!isFormValid"
      >
        Guardar Configuración
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
    <transition name="fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="glass-card p-6 max-w-sm w-full" style="background: var(--surface-container-high); border-color: var(--glass-border-hover);">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4" style="background: rgba(255, 180, 171, 0.15); color: var(--error);">
            <LogOut class="w-6 h-6" />
          </div>
          <h3 class="text-lg font-bold mb-2" style="color: var(--on-surface);">¿Cerrar sesión?</h3>
          <p class="text-sm mb-6" style="color: var(--on-surface-muted);">Tendrás que volver a ingresar tus credenciales para acceder a tu planificador.</p>
          <div class="flex gap-3">
            <button @click="showLogoutModal = false" class="flex-1 py-3 rounded-xl font-bold transition-colors" style="background: var(--surface-container-highest); color: var(--on-surface);">
              Cancelar
            </button>
            <button @click="confirmLogout" class="flex-1 py-3 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md" style="background: var(--error-container);">
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
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
