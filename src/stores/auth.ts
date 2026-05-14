import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { useUserStore } from './user';
import { useDietStore } from './diet';
import { useFoodsStore } from './foods';
import { useLogStore } from './log';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const router = useRouter();

  const userStore = useUserStore();
  const dietStore = useDietStore();
  const foodsStore = useFoodsStore();
  const logStore = useLogStore();

  // Listen to Auth changes — this is the only listener that lives for the full app lifetime
  onAuthStateChanged(auth, async (firebaseUser) => {
    user.value = firebaseUser;

    try {
      if (firebaseUser) {
        // Auth confirmed → now safe to open Firestore listeners
        await Promise.all([
          userStore.fetchProfile(),
          dietStore.fetchDiet(),
          foodsStore.fetchMyFoods()
        ]);
      } else {
        // Session lost (token expired, etc.) — cleanup is handled by handleLogout
        // This branch only runs for unexpected session loss
        _cleanupAllStores();
        if (router.currentRoute.value?.meta?.requiresAuth) {
          router.push({ name: 'login', query: { expired: 'true' } });
        }
      }
    } catch (error) {
      console.error('[AUTH ERROR] Failed to initialize stores:', error);
    } finally {
      loading.value = false;
    }
  });

  /**
   * Stops all Firestore onSnapshot listeners and clears Pinia state.
   * Must be called BEFORE signOut to avoid "Insufficient Permissions" errors
   * that occur when listeners try to re-fetch after the UID becomes null.
   */
  function _cleanupAllStores() {
    userStore.reset();   // calls unsubscribe() internally
    dietStore.reset();   // calls unsubscribe() internally
    foodsStore.reset();  // calls unsubscribe() internally
    logStore.reset();    // calls all day unsubscribes() internally
  }

  /**
   * Quirurgical logout:
   * 1. Detach all Firestore listeners (prevents Insufficient Permissions flood)
   * 2. signOut from Firebase Auth
   * 3. Navigate to login
   */
  const handleLogout = async () => {
    // STEP 1: Kill all listeners BEFORE the UID becomes null
    _cleanupAllStores();

    // STEP 2: Sign out from Firebase
    await signOut(auth);

    // STEP 3: Navigate to login
    router.push({ name: 'login' });
  };

  const isAuthenticated = () => !!user.value;

  return {
    user,
    loading,
    handleLogout,
    // Keep 'logout' as alias for backward compatibility
    logout: handleLogout,
    isAuthenticated
  };
});

