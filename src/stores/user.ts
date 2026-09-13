import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth } from '../firebase'
import { doc, setDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import type { UserProfile, UserRole } from '../services/nutrition/models'

// Re-export so consumers can import types from the store without knowing the service path
export type { UserProfile, UserRole }

const DEFAULT_PROFILE: UserProfile = {
  weight: null,
  height: null,
  age: null,
  gender: null,
  activityFactor: 1.2,
  goal: 'maintain',
  macroTargets: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0
  }
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile>({ ...DEFAULT_PROFILE, macroTargets: { ...DEFAULT_PROFILE.macroTargets } })

  /**
   * Authoritative client-side role check: returns true ONLY if profile.role === 'nutritionist'.
   * Missing, undefined, null, or unknown roles fail closed to false.
   */
  const isNutritionist = computed(() => profile.value?.role === 'nutritionist')

  let unsubscribe: (() => void) | null = null

  // Attaches a real-time Firestore listener for the current user's profile document.
  // Returns a Promise that resolves after the first snapshot (loaded or empty).
  // Subsequent snapshots update the store reactively — Dashboard and all computed
  // properties that depend on `profile` will automatically re-render.
  function fetchProfile() {
    const uid = auth.currentUser?.uid
    if (!uid) return Promise.resolve()

    // Guard: detach any previous listener before opening a new one
    if (unsubscribe) unsubscribe()

    const docRef = doc(db, 'users', uid)

    return new Promise<void>((resolve) => {
      let isFirstLoad = true
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          profile.value = docSnap.data() as UserProfile
        }
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      }, (error) => {
        console.error(`[FIREBASE ERROR] Path: users/${uid}`, error)
        if (isFirstLoad) {
          isFirstLoad = false
          resolve()
        }
      })
    })
  }

  // Optimistic update: patches local state immediately for instant UI feedback,
  // then persists to Firestore. Also tracks weight changes in `weight_history`.
  // Role protection: normal profile updates must completely strip `role` to prevent client escalation.
  async function updateProfile(newProfile: Partial<UserProfile>) {
    const { role: _role, ...safeUpdates } = newProfile as any
    const oldWeight = profile.value.weight
    profile.value = { ...profile.value, ...safeUpdates }

    const uid = auth.currentUser?.uid
    if (uid) {
      await setDoc(doc(db, 'users', uid), safeUpdates, { merge: true })

      if (
        safeUpdates.weight !== undefined &&
        safeUpdates.weight !== oldWeight &&
        safeUpdates.weight !== null
      ) {
        const historyRef = collection(db, 'users', uid, 'weight_history')
        await addDoc(historyRef, {
          weight: safeUpdates.weight,
          date: serverTimestamp()
        })
      }
    }
  }

  // Replaces the active macroTargets with the imported meal plan totals.
  // Backs up the current TDEE-based targets so they can be restored later.
  async function applyMealPlanOverride(planMacros: import('../services/nutrition/models').MacroTargets) {
    // Only backup TDEE targets if we haven't already (avoid overwriting backup with plan data)
    const tdeeBackup = profile.value.tdeeTargets || { ...profile.value.macroTargets }

    await updateProfile({
      tdeeTargets: tdeeBackup,
      mealPlanTargets: { ...planMacros },
      macroTargets: { ...planMacros },
      useMealPlanOverride: true
    })
  }

  // Restores the active macroTargets from the TDEE backup.
  async function clearMealPlanOverride() {
    const tdeeTargets = profile.value.tdeeTargets
    if (!tdeeTargets) return

    await updateProfile({
      macroTargets: { ...tdeeTargets },
      useMealPlanOverride: false
    })
  }

  async function setDietSource(source: 'nutritionist' | 'custom_upload') {
    await updateProfile({ activeDietSource: source })
  }

  async function backupCustomUploadedPlan(week: any[], targets?: import('../services/nutrition/models').MacroTargets) {
    await updateProfile({
      customUploadedWeek: week,
      customUploadedTargets: targets || undefined,
      activeDietSource: 'custom_upload'
    })
  }

  async function applyNutritionistPlan(meta: { id: string; nombre: string; calorias: number; macros: any; objetivo?: string; updatedAt?: string }) {
    await updateProfile({
      nutritionistPlanMeta: meta,
      activeDietSource: 'nutritionist',
      useMealPlanOverride: true,
      macroTargets: {
        calories: meta.calorias,
        protein: meta.macros?.protein || 0,
        carbs: meta.macros?.carbs || 0,
        fat: meta.macros?.fat || 0,
        sugar: 0
      }
    })
  }

  // Called by authStore.handleLogout() BEFORE signOut() to cleanly detach the
  // Firestore listener. Without this, the listener fires after the UID becomes
  // null and produces "Insufficient Permissions" console errors.
  function reset() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    profile.value = { ...DEFAULT_PROFILE, macroTargets: { ...DEFAULT_PROFILE.macroTargets } }
  }

  return {
    profile,
    isNutritionist,
    fetchProfile,
    updateProfile,
    applyMealPlanOverride,
    clearMealPlanOverride,
    setDietSource,
    backupCustomUploadedPlan,
    applyNutritionistPlan,
    reset
  }
})
