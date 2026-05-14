import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { useUserStore } from './user';
import { useDietStore } from './diet';
import { useFoodsStore } from './foods';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const router = useRouter();
  
  const userStore = useUserStore();
  const dietStore = useDietStore();
  const foodsStore = useFoodsStore();

  // Listen to Auth changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    user.value = firebaseUser;
    loading.value = false;
    
    if (firebaseUser) {
      // Fetch user data from Firestore
      await Promise.all([
        userStore.fetchProfile(),
        dietStore.fetchDiet(),
        foodsStore.fetchMyFoods()
      ]);
    } else {
      // Clear and reset stores on logout
      userStore.reset();
      dietStore.reset();
      foodsStore.reset();
      localStorage.clear();
      router.push('/login');
    }
  });

  const logout = async () => {
    await signOut(auth);
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
