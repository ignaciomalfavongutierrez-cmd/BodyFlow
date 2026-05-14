<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { auth } from '../firebase'
import { updateProfile as updateAuthProfile, updateEmail } from 'firebase/auth'
import BaseInput from '../components/BaseInput.vue'
import { CheckCircle, AlertTriangle } from 'lucide-vue-next'

const userStore = useUserStore()

const name = ref(userStore.profile.name || auth.currentUser?.displayName || '')
const email = ref(userStore.profile.email || auth.currentUser?.email || '')

const weight = ref(userStore.profile.weight)
const height = ref(userStore.profile.height)
const age = ref(userStore.profile.age)
const gender = ref(userStore.profile.gender)
const activityFactor = ref(userStore.profile.activityFactor || 1.2)
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
    if (auth.currentUser) {
      if (name.value !== auth.currentUser.displayName) {
        await updateAuthProfile(auth.currentUser, { displayName: name.value })
      }
      // Note: updateEmail might require re-authentication, ignoring for simplicity
      // if (email.value !== auth.currentUser.email) {
      //   await updateEmail(auth.currentUser, email.value)
      // }
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
    gender: gender.value as 'male' | 'female' | null,
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
  
  isSaved.value = true
  setTimeout(() => {
    isSaved.value = false
  }, 2000)
}

function autoCalculate() {
  if (!weight.value || !height.value || !age.value || !gender.value) {
    validationError.value = 'Please enter weight, height, age, and gender first.'
    return
  }
  
  // Mifflin-St Jeor Equation
  let bmr = (10 * weight.value) + (6.25 * height.value) - (5 * age.value)
  if (gender.value === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }

  let tdee = bmr * activityFactor.value

  if (goal.value === 'cut') tdee -= 500
  if (goal.value === 'bulk') tdee += 500
  
  calories.value = Math.round(tdee)
  protein.value = Math.round(weight.value * 2.2) // ~2.2g per kg
  fat.value = Math.round((tdee * 0.25) / 9) // 25% from fat
  carbs.value = Math.round((tdee - (protein.value * 4) - (fat.value * 9)) / 4)
  sugar.value = 30 // fixed simple target
  
  saveProfile()
}
</script>

<template>
  <div class="max-w-md mx-auto w-full flex flex-col h-full bg-gray-50 min-h-[calc(100vh-64px)]">
    <header class="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex justify-between items-center shadow-sm">
      <h1 class="text-xl font-bold text-gray-900">Settings</h1>
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

      <!-- Account Info -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
        <div class="space-y-4">
          <BaseInput label="Name" v-model="name" type="text" placeholder="Your name" />
          <BaseInput label="Email" v-model="email" type="email" disabled placeholder="your@email.com" />
        </div>
      </section>

      <!-- Physical Data -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Physical Data</h2>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <BaseInput label="Weight (kg)" v-model="weight" type="number" placeholder="e.g. 70" />
          <BaseInput label="Height (cm)" v-model="height" type="number" placeholder="e.g. 175" />
          <BaseInput label="Age" v-model="age" type="number" placeholder="e.g. 25" />
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-700 mb-1">Biological Sex</label>
            <select v-model="gender" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-gray-900 appearance-none">
              <option :value="null" disabled>Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        
        <div class="flex flex-col mb-4">
          <label class="text-sm font-medium text-gray-700 mb-1">Activity Level</label>
          <select v-model="activityFactor" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-gray-900 appearance-none">
            <option :value="1.2">Sedentary (Little/No Exercise)</option>
            <option :value="1.375">Lightly Active (1-3 days/wk)</option>
            <option :value="1.55">Moderately Active (3-5 days/wk)</option>
            <option :value="1.725">Very Active (6-7 days/wk)</option>
            <option :value="1.9">Extremely Active (Physical job)</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">Goal</label>
          <select v-model="goal" class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-sm text-gray-900 appearance-none">
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
        
        <BaseInput label="Calories (kcal)" v-model="calories" type="number" placeholder="e.g. 2000" class="mb-4" />
        
        <div class="grid grid-cols-2 gap-4">
          <BaseInput label="Protein (g)" v-model="protein" type="number" placeholder="e.g. 150" />
          <BaseInput label="Carbs (g)" v-model="carbs" type="number" placeholder="e.g. 200" />
          <BaseInput label="Fat (g)" v-model="fat" type="number" placeholder="e.g. 60" />
          <BaseInput label="Sugar (g)" v-model="sugar" type="number" placeholder="e.g. 30" />
        </div>
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
