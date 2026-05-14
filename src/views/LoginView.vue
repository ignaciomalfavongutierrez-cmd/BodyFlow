<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const isRegister = ref(false)
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = ''
  
  try {
    if (isRegister.value) {
      await createUserWithEmailAndPassword(auth, email.value, password.value)
    } else {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    }
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } catch (err: any) {
    error.value = err.message
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">BodyFlow</h1>
        <p class="text-gray-500 mt-2">{{ isRegister ? 'Create your account' : 'Welcome back' }}</p>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
        {{ error }}
      </div>
      
      <div v-if="route.query.expired" class="mb-4 p-3 bg-amber-50 text-amber-700 text-xs rounded-xl border border-amber-100">
        Tu sesión ha expirado. Por favor ingresa nuevamente.
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email</label>
          <input 
            v-model="email"
            type="email" 
            placeholder="name@example.com"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            required
          >
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
          <input 
            v-model="password"
            type="password" 
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            required
          >
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Login') }}
        </button>
      </form>

      <div class="mt-6 flex items-center gap-4">
        <div class="flex-1 h-px bg-gray-100"></div>
        <span class="text-xs text-gray-400 font-medium">OR</span>
        <div class="flex-1 h-px bg-gray-100"></div>
      </div>

      <button 
        @click="loginWithGoogle"
        class="w-full mt-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
        Continue with Google
      </button>

      <p class="mt-8 text-center text-sm text-gray-500">
        {{ isRegister ? 'Already have an account?' : 'New to BodyFlow?' }}
        <button @click="isRegister = !isRegister" class="text-emerald-600 font-bold ml-1 hover:underline">
          {{ isRegister ? 'Login here' : 'Create account' }}
        </button>
      </p>
    </div>
  </div>
</template>
