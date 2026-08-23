<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { auth } from '../firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logoImg from '../assets/logo.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isRegister = ref(false)
const error = ref('')
const loading = ref(false)

function navigateToHome() {
  const redirect = route.query.redirect as string
  const target = redirect && redirect !== '/login' ? redirect : '/'
  router.replace(target)
}

// Automatically navigate away from login as soon as auth state confirms user
watch(
  () => [authStore.user, auth.currentUser],
  ([storeUser, directUser]) => {
    if (storeUser || directUser) {
      navigateToHome()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  // If user is already authenticated on mount, redirect to home
  if (auth.currentUser || authStore.user) {
    navigateToHome()
    return
  }

  try {
    const result = await getRedirectResult(auth)
    if (result && result.user) {
      navigateToHome()
    }
  } catch (err: any) {
    if (err.code !== 'auth/credential-already-in-use') {
      console.warn('[LOGIN VIEW] getRedirectResult notice:', err)
    }
  }
})

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
    navigateToHome()
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  loading.value = true
  error.value = ''
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   window.matchMedia('(display-mode: standalone)').matches ||
                   window.innerWidth < 768

  try {
    if (isMobile) {
      // Direct redirect on mobile avoids tab freeze & unresolving popups in iOS Safari / Android Chrome
      await signInWithRedirect(auth, provider)
      return
    }

    const result = await signInWithPopup(auth, provider)
    if (result && result.user) {
      navigateToHome()
    }
  } catch (err: any) {
    console.error('Error Google Auth:', err)
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      error.value = ''
      loading.value = false
      return
    }

    if (
      err.code === 'auth/popup-blocked' || 
      err.code === 'auth/operation-not-supported-in-this-environment' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      try {
        await signInWithRedirect(auth, provider)
        return
      } catch (redirErr: any) {
        error.value = redirErr.message || 'Error al redirigir para autenticación.'
      }
    } else if (err.code === 'auth/unauthorized-domain') {
      error.value = 'Dominio no autorizado en Firebase. Añade este dominio/IP en Firebase Console > Authentication > Dominios autorizados.'
    } else {
      error.value = err.message || 'Error al iniciar sesión con Google.'
    }
  } finally {
    if (!isMobile) {
      loading.value = false
    }
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
          class="w-full py-4 btn-primary text-lg rounded-2xl active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
        :disabled="loading"
        class="w-full mt-6 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all btn-secondary disabled:opacity-60 cursor-pointer"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
        {{ loading ? 'Conectando con Google...' : 'Continuar con Google' }}
      </button>

      <p class="mt-8 text-center text-sm" style="color: var(--on-surface-muted);">
        {{ isRegister ? '¿Ya tienes cuenta?' : '¿Nuevo en BodyFlow?' }}
        <button @click="isRegister = !isRegister" class="font-bold ml-1 hover:underline cursor-pointer" style="color: var(--primary);">
          {{ isRegister ? 'Iniciar sesión' : 'Crear cuenta' }}
        </button>
      </p>
    </div>
  </div>
</template>
