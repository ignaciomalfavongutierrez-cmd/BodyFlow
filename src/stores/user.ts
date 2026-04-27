import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export interface UserProfile {
  weight: number | null
  height: number | null
  goal: string
  macroTargets: MacroTargets
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({
    weight: null,
    height: null,
    goal: '',
    macroTargets: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0
    }
  })

  function updateProfile(newProfile: Partial<UserProfile>) {
    profile.value = { ...profile.value, ...newProfile }
  }

  return {
    profile,
    updateProfile
  }
})
