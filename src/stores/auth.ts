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

  // Listen to Auth changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    user.value = firebaseUser;
    
    try {
      if (firebaseUser) {
        // Fetch user data from Firestore
        await Promise.all([
          userStore.fetchProfile(),
          dietStore.fetchDiet(),
          foodsStore.fetchMyFoods()
        ]);
      } else {
        // Clear and reset stores on session expiry or logout
        userStore.reset();
        dietStore.reset();
        foodsStore.reset();
        logStore.reset();
        if (router.currentRoute.value?.meta?.requiresAuth) {
           router.push({ name: 'login', query: { expired: 'true' } });
        }
      }
    } catch (error) {
      console.error("[AUTH ERROR] Failed to initialize stores:", error);
    } finally {
      loading.value = false;
    }
  });

  const logout = async () => {
    // 1. Sign out from Firebase
    await signOut(auth);
    
    // 2 & 3. Reset all stores (this automatically calls their unsubscribe methods)
    userStore.reset();
    dietStore.reset();
    foodsStore.reset();
    logStore.reset();
    
    // 4. Redirect to login
    router.push('/login');
  };

  const isAuthenticated = () => !!user.value;

  return {
    user,
    loading,
    logout,
    isAuthenticated
  };
});
