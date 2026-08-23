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
  const user = ref<User | null>(auth.currentUser);
  const loading = ref(true);
  const isAuthReady = ref(false);
  const router = useRouter();

  const userStore = useUserStore();
  const dietStore = useDietStore();
  const foodsStore = useFoodsStore();
  const logStore = useLogStore();

  let initialAuthChecked = false;

  // Initialize auth state ready promise
  auth.authStateReady().then(() => {
    isAuthReady.value = true;
    user.value = auth.currentUser;
  }).catch((err) => {
    console.warn('[AUTH] authStateReady error:', err);
    isAuthReady.value = true;
  });

  // Listen to Auth changes — this is the only listener that lives for the full app lifetime
  onAuthStateChanged(auth, async (firebaseUser) => {
    const wasLoggedIn = !!user.value;
    user.value = firebaseUser;
    isAuthReady.value = true;

    try {
      if (firebaseUser) {
        // Auth confirmed → now safe to open Firestore listeners
        await Promise.allSettled([
          userStore.fetchProfile(),
          dietStore.fetchDiet(),
          foodsStore.fetchMyFoods()
        ]);

        // If user is logged in and currently on the login screen, forward to dashboard
        if (router.currentRoute.value?.name === 'login') {
          const redirect = router.currentRoute.value?.query?.redirect as string;
          const target = redirect && redirect !== '/login' ? redirect : '/';
          router.replace(target);
        }
      } else {
        // Only trigger session loss redirect if user was previously logged in and this is not initial cold boot
        if (initialAuthChecked && wasLoggedIn) {
          _cleanupAllStores();
          if (router.currentRoute.value?.meta?.requiresAuth) {
            router.push({ name: 'login', query: { expired: 'true' } });
          }
        } else {
          _cleanupAllStores();
        }
      }
    } catch (error) {
      console.error('[AUTH ERROR] Failed to initialize stores:', error);
    } finally {
      initialAuthChecked = true;
      loading.value = false;
    }
  });

  /**
   * Stops all Firestore onSnapshot listeners and clears Pinia state.
   */
  function _cleanupAllStores() {
    userStore.reset();
    dietStore.reset();
    foodsStore.reset();
    logStore.reset();
  }

  /**
   * Logout handler:
   * 1. Detach all Firestore listeners
   * 2. signOut from Firebase Auth
   * 3. Navigate to login
   */
  const handleLogout = async () => {
    _cleanupAllStores();
    await signOut(auth);
    user.value = null;
    router.push({ name: 'login' });
  };

  const isAuthenticated = () => !!user.value;

  return {
    user,
    loading,
    isAuthReady,
    handleLogout,
    logout: handleLogout,
    isAuthenticated
  };
});


