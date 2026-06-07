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
import logoImg from '../assets/logo.png'

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
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--surface-container-lowest);">
    <div class="max-w-md w-full glass-card p-8">
      <div class="text-center mb-8">
        <img :src="logoImg" alt="BodyFlow" class="w-20 h-20 mx-auto mb-4 rounded-2xl" />
        <h1 class="text-3xl font-bold" style="font-family: var(--font-display); color: var(--primary);">BodyFlow</h1>
        <p class="mt-2" style="color: var(--on-surface-muted);">{{ isRegister ? 'Crea tu cuenta' : 'Bienvenido de vuelta' }}</p>
      </div>

      <div v-if="error" class="mb-4 p-3 text-xs rounded-xl" style="background: var(--error-container); color: var(--error); border: 1px solid rgba(255, 180, 171, 0.2);">
        {{ error }}
      </div>
      
      <div v-if="route.query.expired" class="mb-4 p-3 text-xs rounded-xl" style="background: rgba(255, 220, 224, 0.1); color: var(--tertiary); border: 1px solid rgba(255, 220, 224, 0.15);">
        Tu sesión ha expirado. Por favor ingresa nuevamente.
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2 ml-1" style="color: var(--on-surface-muted); font-family: var(--font-body);">Email</label>
          <input 
            v-model="email"
            type="email" 
            placeholder="nombre@ejemplo.com"
            class="w-full input-field"
            required
          >
        </div>
        
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2 ml-1" style="color: var(--on-surface-muted); font-family: var(--font-body);">Contraseña</label>
          <input 
            v-model="password"
            type="password" 
            placeholder="••••••••"
            class="w-full input-field"
            required
          >
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-4 btn-primary text-lg rounded-2xl active:scale-[0.98] disabled:opacity-50"
        >
          {{ loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Iniciar Sesión') }}
        </button>
      </form>

      <div class="mt-6 flex items-center gap-4">
        <div class="flex-1 h-px" style="background: var(--glass-border);"></div>
        <span class="text-xs font-medium" style="color: var(--on-surface-muted);">O</span>
        <div class="flex-1 h-px" style="background: var(--glass-border);"></div>
      </div>

      <button 
        @click="loginWithGoogle"
        class="w-full mt-6 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all btn-secondary"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
        Continuar con Google
      </button>

      <p class="mt-8 text-center text-sm" style="color: var(--on-surface-muted);">
        {{ isRegister ? '¿Ya tienes cuenta?' : '¿Nuevo en BodyFlow?' }}
        <button @click="isRegister = !isRegister" class="font-bold ml-1 hover:underline" style="color: var(--primary);">
          {{ isRegister ? 'Iniciar sesión' : 'Crear cuenta' }}
        </button>
      </p>
    </div>
  </div>
</template>
