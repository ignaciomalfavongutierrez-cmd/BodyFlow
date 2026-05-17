import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '../firebase'
import { doc, setDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import type { UserProfile } from '../services/nutrition/models'

// Re-export so consumers can import types from the store without knowing the service path
export type { UserProfile }

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
  async function updateProfile(newProfile: Partial<UserProfile>) {
    const oldWeight = profile.value.weight
    profile.value = { ...profile.value, ...newProfile }

    const uid = auth.currentUser?.uid
    if (uid) {
      await setDoc(doc(db, 'users', uid), profile.value, { merge: true })

      if (
        newProfile.weight !== undefined &&
        newProfile.weight !== oldWeight &&
        newProfile.weight !== null
      ) {
        const historyRef = collection(db, 'users', uid, 'weight_history')
        await addDoc(historyRef, {
          weight: newProfile.weight,
          date: serverTimestamp()
        })
      }
    }
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
    fetchProfile,
    updateProfile,
    reset
  }
})
