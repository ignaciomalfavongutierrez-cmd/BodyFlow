<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { useDietStore } from '../stores/diet'
import { auth } from '../firebase'
import { updateProfile as updateAuthProfile } from 'firebase/auth'
import BaseInput from '../components/BaseInput.vue'
import { CheckCircle, AlertTriangle, LogOut, Wrench, Sun, Moon, RefreshCw, FileUp, ShieldCheck } from 'lucide-vue-next'
import { usePwaStore } from '../stores/pwa'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { generateNutritionPlan } from '../services/nutrition/calculations'
import { PatientSyncService } from '../services/patients/PatientSyncService'
import type { PhysicalData, NutritionGoals } from '../services/nutrition/models'

const userStore = useUserStore()
const pwaStore = usePwaStore()
const authStore = useAuthStore()
const { isDark, setTheme } = useTheme()

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
const waterTarget = ref(2000)

const isDirty = ref(false)
const isLoggingOut = ref(false)

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
    waterTarget.value = p.waterTarget || 2000
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
    },
    waterTarget: Number(waterTarget.value) || 2000
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

const dietStore = useDietStore()
const isSyncingPatient = ref(false)
const syncFeedback = ref('')
const syncSuccess = ref(false)

const isNutritionistLinked = computed(() => !!userStore.profile.linkedPatientId)
const activeDietSource = computed(() => userStore.profile.activeDietSource || (isNutritionistLinked.value ? 'nutritionist' : 'custom_upload'))
const hasCustomUpload = computed(() => Array.isArray(userStore.profile.customUploadedWeek) && userStore.profile.customUploadedWeek.length > 0)

async function syncWithNutritionist() {
  const linkedPatientId = userStore.profile.linkedPatientId
  if (!linkedPatientId) {
    syncSuccess.value = false
    syncFeedback.value = 'Tu cuenta aún no está vinculada con un expediente. Solicita a tu nutrióloga que vincule tu cuenta.'
    return
  }

  isSyncingPatient.value = true
  syncFeedback.value = ''
  syncSuccess.value = false

  try {
    const activePlan = await PatientSyncService.getActiveDietPlan(linkedPatientId)
    if (activePlan) {
      syncSuccess.value = true
      if (activePlan.menu) {
        const dayPlans = PatientSyncService.convertDietPlanMenuToDayPlans(activePlan.menu, activePlan.calorias)
        if (dayPlans && dayPlans.length > 0) {
          await dietStore.setDiet(dayPlans)
          await userStore.applyNutritionistPlan({
            id: activePlan.id,
            nombre: activePlan.nombre || 'Plan de Nutrición',
            calorias: activePlan.calorias || 0,
            macros: activePlan.macros,
            objetivo: activePlan.objetivo,
            updatedAt: activePlan.updatedAt
          })
          syncFeedback.value = `¡Sincronizado con éxito! Plan "${activePlan.nombre}" cargado.`
        }
      } else {
        syncFeedback.value = 'Expediente vinculado. La nutrióloga aún no ha activado un menú.'
      }
    } else {
      syncSuccess.value = false
      syncFeedback.value = 'No se encontró un plan activo asignado a tu expediente.'
    }
  } catch (err: any) {
    syncSuccess.value = false
    syncFeedback.value = 'Error al consultar el expediente asignado.'
  } finally {
    isSyncingPatient.value = false
    setTimeout(() => { syncFeedback.value = '' }, 5000)
  }
}

async function selectDietSource(source: 'nutritionist' | 'custom_upload') {
  if (source === 'nutritionist') {
    if (userStore.profile.linkedPatientId) {
      const activePlan = await PatientSyncService.getActiveDietPlan(userStore.profile.linkedPatientId)
      if (activePlan && activePlan.menu) {
        const dayPlans = PatientSyncService.convertDietPlanMenuToDayPlans(activePlan.menu, activePlan.calorias)
        await dietStore.setDiet(dayPlans)
        await userStore.applyNutritionistPlan({
          id: activePlan.id,
          nombre: activePlan.nombre || 'Plan de Nutrición',
          calorias: activePlan.calorias || 0,
          macros: activePlan.macros,
          objetivo: activePlan.objetivo,
          updatedAt: activePlan.updatedAt
        })
        return
      }
    }
    await userStore.setDietSource('nutritionist')
  } else {
    // Mi Menú Personal
    if (hasCustomUpload.value) {
      await dietStore.setDiet(userStore.profile.customUploadedWeek!)
      await userStore.setDietSource('custom_upload')
      if (userStore.profile.customUploadedTargets) {
        await userStore.applyMealPlanOverride(userStore.profile.customUploadedTargets)
      }
    } else {
      await userStore.setDietSource('custom_upload')
    }
  }
}

async function confirmLogout() {
  isLoggingOut.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  authStore.handleLogout()
}
</script>

<template>
  <div class="max-w-md mx-auto w-full flex flex-col h-full min-h-[calc(100vh-64px)]" style="background: var(--surface-container-lowest);">
    <!-- Header -->
    <header class="sticky top-0 z-10 px-4 py-4 flex justify-between items-center backdrop-blur-md shadow-xs transition-colors" style="background: var(--glass-bg); border-bottom: 1px solid var(--glass-border);">
      <h1 class="text-xl font-bold" style="font-family: var(--font-display); color: var(--on-surface);">Cuenta</h1>
      <transition name="fade">
        <span v-if="isSaved" class="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[var(--primary)] border border-emerald-300 dark:border-emerald-700/40">
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

      <!-- Admin Utilities Panel (Only for authorized nutritionist role) -->
      <section v-if="userStore.isNutritionist" class="glass-card p-5 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 dark:bg-[#19e80d]/10 rounded-full blur-xl pointer-events-none"></div>
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 dark:bg-[#19e80d] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-[#19e80d]"></span>
              </span>
              <h2 class="text-sm font-bold text-emerald-700 dark:text-[#87ff70]">Panel de Nutrióloga</h2>
            </div>
            <p class="text-xs text-slate-500 dark:text-gray-400">Acceso clínico exclusivo y herramientas de pacientes.</p>
          </div>
          <router-link to="/utilities" class="px-4 py-2.5 btn-primary text-xs font-bold shadow flex items-center gap-1.5 rounded-xl shrink-0">
            <Wrench class="w-3.5 h-3.5" />
            <span>Utilities</span>
          </router-link>
        </div>
      </section>

      <!-- Appearance / Theme Selector -->
      <section class="glass-card p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-800 dark:text-white">Apariencia y Tema</h2>
            <p class="text-xs text-slate-500 dark:text-gray-400">Personaliza la visualización de la interfaz.</p>
          </div>
          <span class="text-lg">{{ isDark ? '🌙' : '☀️' }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
          <button
            type="button"
            @click="setTheme('light')"
            class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="!isDark ? 'bg-white dark:bg-white/10 text-emerald-700 shadow-sm border border-emerald-500/20 ring-1 ring-emerald-500/10' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'"
          >
            <Sun class="w-4 h-4 text-amber-500" />
            <span>Modo Claro</span>
          </button>
          
          <button
            type="button"
            @click="setTheme('dark')"
            class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="isDark ? 'bg-[#201f22] text-[#87ff70] shadow-md border border-white/10 ring-1 ring-emerald-500/20' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'"
          >
            <Moon class="w-4 h-4 text-[#87ff70]" />
            <span>Modo Oscuro</span>
          </button>
        </div>
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

        <div class="grid grid-cols-2 gap-4 mb-4">
          <BaseInput label="Proteína (g)" v-model="protein" type="number" placeholder="Ej. 150" @input="markDirty" />
          <BaseInput label="Carbs (g)" v-model="carbs" type="number" placeholder="Ej. 200" @input="markDirty" />
          <BaseInput label="Grasa (g)" v-model="fat" type="number" placeholder="Ej. 60" @input="markDirty" />
          <BaseInput label="Azúcar (g)" v-model="sugar" type="number" placeholder="Ej. 30" @input="markDirty" />
        </div>

        <BaseInput label="Meta de Agua Diaria (ml)" v-model="waterTarget" type="number" placeholder="Ej. 2000" @input="markDirty" />
      </section>

      <!-- Plan de Alimentación & Sincronización Clínica -->
      <section class="glass-card p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <ShieldCheck v-if="isNutritionistLinked" class="w-4 h-4 text-emerald-500" />
              <FileUp v-else class="w-4 h-4 text-slate-400" />
              <span>Fuente del Plan de Alimentación</span>
            </h2>
            <p class="text-xs text-slate-500 dark:text-gray-400">
              Controla de dónde provienen tus comidas y macros diarios.
            </p>
          </div>
          <button
            @click="syncWithNutritionist"
            :disabled="isSyncingPatient"
            class="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border border-slate-200 dark:border-white/10 shrink-0"
            title="Sincronizar expediente clínico"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncingPatient }" />
          </button>
        </div>

        <!-- Sync Feedback Alert -->
        <transition name="fade">
          <div 
            v-if="syncFeedback" 
            class="p-3 text-xs rounded-xl flex items-start gap-2"
            :class="syncSuccess 
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'"
          >
            <span class="text-sm leading-none">{{ syncSuccess ? '✅' : 'ℹ️' }}</span>
            <span class="font-medium">{{ syncFeedback }}</span>
          </div>
        </transition>

        <!-- Clinical Link Status Banner -->
        <div 
          class="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs"
          :class="isNutritionistLinked 
            ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20' 
            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5'"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="isNutritionistLinked ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
            <div>
              <p class="font-bold text-slate-800 dark:text-white">
                {{ isNutritionistLinked ? 'Vinculado con Lic. Talia Tinoco' : 'Modo Independiente' }}
              </p>
              <p class="text-[11px] text-slate-500 dark:text-gray-400">
                {{ isNutritionistLinked ? 'Expediente clínico activo' : 'No se detectó un expediente clínico' }}
              </p>
            </div>
          </div>
          <span 
            class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
            :class="isNutritionistLinked 
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
              : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'"
          >
            {{ isNutritionistLinked ? 'Conectado' : 'Sin vincular' }}
          </span>
        </div>

        <!-- Dual Selection Options -->
        <div class="grid grid-cols-1 gap-2.5 pt-1">
          
          <!-- Option A: Plan Oficial de Nutrióloga -->
          <div
            @click="selectDietSource('nutritionist')"
            class="p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
            :class="activeDietSource === 'nutritionist'
              ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-75 hover:opacity-100'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm">🥗</span>
                  <p class="text-xs font-bold text-slate-900 dark:text-white">
                    Plan Oficial de Nutrióloga (Talia Tinoco)
                  </p>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-gray-400">
                  <template v-if="userStore.profile.nutritionistPlanMeta">
                    {{ userStore.profile.nutritionistPlanMeta.nombre }} • {{ userStore.profile.nutritionistPlanMeta.calorias }} kcal
                  </template>
                  <template v-else-if="isNutritionistLinked">
                    Expediente vinculado • Carga el plan activo de la consulta
                  </template>
                  <template v-else>
                    Requiere que tu nutrióloga asigne un menú a tu correo
                  </template>
                </p>
              </div>

              <span
                v-if="activeDietSource === 'nutritionist'"
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white shrink-0"
              >
                Activo
              </span>
              <span
                v-else
                class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 shrink-0"
              >
                Usar este
              </span>
            </div>
          </div>

          <!-- Option B: Mi Menú Personal (PDF / Externo) -->
          <div
            @click="selectDietSource('custom_upload')"
            class="p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden"
            :class="activeDietSource === 'custom_upload'
              ? 'bg-indigo-500/10 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-75 hover:opacity-100'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm">📄</span>
                  <p class="text-xs font-bold text-slate-900 dark:text-white">
                    Mi Menú Personal (PDF / Otra Nutrióloga)
                  </p>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-gray-400">
                  <template v-if="hasCustomUpload">
                    Menú guardado ({{ userStore.profile.customUploadedWeek?.length }} días)
                  </template>
                  <template v-else>
                    No has subido un menú personalizado aún
                  </template>
                </p>
              </div>

              <span
                v-if="activeDietSource === 'custom_upload'"
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500 text-white shrink-0"
              >
                Activo
              </span>
              <span
                v-else
                class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 shrink-0"
              >
                Usar este
              </span>
            </div>

            <!-- Upload new button if active or needed -->
            <div v-if="activeDietSource === 'custom_upload' || !hasCustomUpload" class="mt-2.5 pt-2 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between">
              <span class="text-[10px] text-slate-500 dark:text-gray-400">
                {{ hasCustomUpload ? '¿Deseas reemplazarlo con otro PDF?' : 'Sube un menú para comenzar:' }}
              </span>
              <router-link
                to="/upload"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <FileUp class="w-3 h-3" />
                <span>Subir PDF</span>
              </router-link>
            </div>
          </div>

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
    <transition name="fade">
      <div v-if="isDirty" class="fixed bottom-16 left-0 right-0 p-4 border-t md:max-w-md md:mx-auto z-10 backdrop-blur-md shadow-lg transition-colors" style="background: var(--glass-bg); border-top: 1px solid var(--glass-border);">
        <button
          @click="saveProfile"
          class="w-full py-4 btn-primary text-lg rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
          :disabled="!isFormValid"
        >
          Guardar Configuración
        </button>
      </div>
    </transition>

    <!-- Floating Success Toast -->
    <transition name="fade">
      <div v-if="isSaved" class="fixed bottom-20 left-4 right-4 md:max-w-md md:mx-auto z-50 flex items-center justify-center pointer-events-none">
        <div class="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border border-emerald-500/20 backdrop-blur-md" style="background: rgba(20, 20, 25, 0.95); color: var(--primary);">
          <CheckCircle class="w-5 h-5 text-emerald-400" />
          <span class="text-sm font-bold">Configuración guardada correctamente</span>
        </div>
      </div>
    </transition>

    <!-- Logout Confirmation Modal -->
    <transition name="fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="glass-card p-6 max-w-sm w-full transition-all duration-300" style="background: var(--surface-container-high); border-color: var(--glass-border-hover);">
          <div v-if="isLoggingOut" class="flex flex-col items-center py-6">
            <!-- Loading Spinner -->
            <div class="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4" style="border-color: rgba(25, 232, 13, 0.1); border-top-color: var(--primary);"></div>
            <h3 class="text-lg font-bold mb-1" style="color: var(--on-surface);">Cerrando sesión...</h3>
            <p class="text-xs text-center" style="color: var(--on-surface-muted);">Saliendo de tu cuenta de forma segura.</p>
          </div>
          
          <div v-else>
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
