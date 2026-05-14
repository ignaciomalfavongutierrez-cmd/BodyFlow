import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

export interface UserProfile {
  name?: string
  email?: string
  weight: number | null
  height: number | null
  age: number | null
  gender: 'male' | 'female' | null
  activityFactor: number
  goal: string
  macroTargets: MacroTargets
}

const DEFAULT_PROFILE: UserProfile = {
  weight: null,
  height: null,
  age: null,
  gender: null,
  activityFactor: 1.2,
  goal: '',
  macroTargets: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0
  }
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({ ...DEFAULT_PROFILE })

  async function fetchProfile() {
    const uid = auth.currentUser?.uid
    if (!uid) return

    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      profile.value = docSnap.data() as UserProfile
    }
  }

  async function updateProfile(newProfile: Partial<UserProfile>) {
    const oldWeight = profile.value.weight
    profile.value = { ...profile.value, ...newProfile }
    
    const uid = auth.currentUser?.uid
    if (uid) {
      await setDoc(doc(db, 'users', uid), profile.value, { merge: true })

      if (newProfile.weight !== undefined && newProfile.weight !== oldWeight && newProfile.weight !== null) {
        const historyRef = collection(db, 'users', uid, 'weight_history')
        await addDoc(historyRef, {
          weight: newProfile.weight,
          date: serverTimestamp()
        })
      }
    }
  }

  function reset() {
    profile.value = { ...DEFAULT_PROFILE }
  }

  return {
    profile,
    fetchProfile,
    updateProfile,
    reset
  }
})
