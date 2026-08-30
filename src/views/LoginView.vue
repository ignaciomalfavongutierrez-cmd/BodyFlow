<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { auth } from '../firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, classifyAuthError, friendlyAuthMessage } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { isAdminEmail } from '../router'
import logoImg from '../assets/logo.png'
import { Mail, Lock, User, Eye, EyeOff, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

// Mode: Login vs Register
const isRegister = ref(false)

// Form fields
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Password visibility
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// UI states
const error = ref('')
const successMessage = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const showResetModal = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetSent = ref(false)

function navigateToHome() {
  const redirect = route.query.redirect as string
  const userEmail = (authStore.user?.email || auth.currentUser?.email || '').toLowerCase().trim()
  const isAdmin = isAdminEmail(userEmail)

  let target = '/'
  if (redirect && redirect !== '/login') {
    if (redirect.startsWith('/utilities')) {
      target = isAdmin ? redirect : '/'
    } else {
      target = redirect
    }
  }
  router.replace(target)
}

// Automatically navigate away from login as soon as auth confirms user
watch(
  () => authStore.user,
  (storeUser) => {
    if (storeUser) {
      navigateToHome()
    }
  },
  { immediate: true }
)

/** Validation helpers */
const passwordsMatch = computed(() => {
  if (!isRegister.value || !confirmPassword.value) return true
  return password.value === confirmPassword.value
})

/** Map Firebase email/password error codes to friendly Spanish messages */
function friendlyEmailError(err: any): string {
  const code = err?.code || ''
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos.'
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espera un momento e inténtalo de nuevo.'
    case 'auth/network-request-failed':
      return 'Problema de conexión. Verifica tu internet e inténtalo nuevamente.'
    case 'auth/operation-not-allowed':
      return 'El registro por correo no está habilitado actualmente en el servidor.'
    default:
      return err?.message || 'No pudimos procesar tu solicitud. Inténtalo nuevamente.'
  }
}

/** Handle Email & Password Submission (Login / Register) */
async function handleSubmit() {
  error.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    error.value = 'Por favor completa todos los campos requeridos.'
    return
  }

  if (isRegister.value) {
    if (!name.value.trim()) {
      error.value = 'Por favor ingresa tu nombre.'
      return
    }
    if (password.value.length < 6) {
      error.value = 'La contraseña debe tener al menos 6 caracteres.'
      return
    }
    if (password.value !== confirmPassword.value) {
      error.value = 'Las contraseñas no coinciden.'
      return
    }
  }

  loading.value = true

  try {
    if (isRegister.value) {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value)
      
      // 2. Set display name in Firebase Auth
      if (name.value.trim()) {
        try {
          await updateProfile(userCredential.user, {
            displayName: name.value.trim()
          })
        } catch (profileErr) {
          console.warn('[AUTH] updateProfile display name warning:', profileErr)
        }
      }

      // 3. Initialize Firestore profile document
      try {
        await userStore.updateProfile({
          name: name.value.trim(),
          email: email.value.trim()
        })
      } catch (storeErr) {
        console.warn('[AUTH] Firestore user profile init warning:', storeErr)
      }

      navigateToHome()
    } else {
      // Login existing user
      await signInWithEmailAndPassword(auth, email.value.trim(), password.value)
      navigateToHome()
    }
  } catch (err: any) {
    error.value = friendlyEmailError(err)
  } finally {
    loading.value = false
  }
}

/** Google Sign-In with popup-first and fallback */
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  googleLoading.value = true
  error.value = ''

  try {
    // Attempt popup first on all platforms (works directly in-place on mobile Safari/Chrome)
    const result = await signInWithPopup(auth, provider)
    if (result && result.user) {
      // Initialize/sync profile name if available
      if (result.user.displayName || result.user.email) {
        userStore.updateProfile({
          name: result.user.displayName || '',
          email: result.user.email || ''
        }).catch(() => {})
      }
      navigateToHome()
    }
  } catch (err: any) {
    const kind = classifyAuthError(err)

    if (kind === 'cancelled') {
      // User closed popup or cancelled — silent, no error message
      googleLoading.value = false
      return
    }

    // If popup was blocked or unsupported, fallback to redirect
    if (
      err.code === 'auth/popup-blocked' || 
      err.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      try {
        await signInWithRedirect(auth, provider)
        return
      } catch (redirErr: any) {
        error.value = friendlyAuthMessage(classifyAuthError(redirErr))
      }
    } else {
      error.value = friendlyAuthMessage(kind)
    }

    if (import.meta.env.DEV) {
      console.warn('[AUTH:ERROR] Google Sign-In failed:', err?.code, err?.message)
    }
  } finally {
    googleLoading.value = false
  }
}

/** Send Password Reset Email */
async function handlePasswordReset() {
  if (!resetEmail.value.trim()) return
  resetLoading.value = true
  error.value = ''

  try {
    await sendPasswordResetEmail(auth, resetEmail.value.trim())
    resetSent.value = true
  } catch (err: any) {
    error.value = friendlyEmailError(err)
  } finally {
    resetLoading.value = false
  }
}

function openResetModal() {
  resetEmail.value = email.value
  resetSent.value = false
  showResetModal.value = true
}

function switchMode(register: boolean) {
  isRegister.value = register
  error.value = ''
  successMessage.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-6" style="background: var(--surface-container-lowest, #0e0e10);">
    <!-- Background Ambient Glows -->
    <div class="fixed w-96 h-96 bg-[#19e80d]/10 rounded-full blur-[140px] -top-20 -left-20 pointer-events-none"></div>
    <div class="fixed w-96 h-96 bg-[#4edea3]/10 rounded-full blur-[140px] -bottom-20 -right-20 pointer-events-none"></div>

    <div class="max-w-md w-full glass-card p-6 sm:p-8 relative z-10 my-4">
      
      <!-- Brand Header -->
      <div class="text-center mb-6">
        <div class="relative inline-block mb-3">
          <div class="absolute inset-0 bg-[#19e80d]/20 rounded-2xl blur-lg animate-pulse"></div>
          <img :src="logoImg" alt="BodyFlow" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl relative z-10 shadow-lg" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-[#87ff70] dark:via-[#4edea3] dark:to-[#19e80d]" style="font-family: var(--font-display, 'Outfit', sans-serif);">
          BodyFlow
        </h1>
        <p class="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
          {{ isRegister ? 'Crea tu cuenta y optimiza tu nutrición con IA' : 'Tu tracking inteligente de nutrición y macros' }}
        </p>
      </div>

      <!-- Segmented Tab Switcher (Iniciar Sesión / Registrarse) -->
      <div class="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6 border border-slate-200 dark:border-white/5 backdrop-blur-sm">
        <button 
          type="button"
          @click="switchMode(false)"
          class="flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer"
          :class="!isRegister ? 'bg-emerald-600 dark:bg-gradient-to-r dark:from-[#19e80d] dark:to-[#87ff70] text-white dark:text-[#013a00] shadow-md' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'"
        >
          Iniciar Sesión
        </button>
        <button 
          type="button"
          @click="switchMode(true)"
          class="flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer"
          :class="isRegister ? 'bg-emerald-600 dark:bg-gradient-to-r dark:from-[#19e80d] dark:to-[#87ff70] text-white dark:text-[#013a00] shadow-md' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'"
        >
          Crear Cuenta
        </button>
      </div>

      <!-- Error Banner -->
      <div 
        v-if="error" 
        class="mb-4 p-3.5 text-xs rounded-xl flex items-start gap-2.5 animate-shake"
        style="background: rgba(147, 0, 10, 0.4); color: #ffb4ab; border: 1px solid rgba(255, 180, 171, 0.25);"
      >
        <span class="text-base">⚠️</span>
        <span class="leading-relaxed">{{ error }}</span>
      </div>

      <!-- Session Expired Banner -->
      <div 
        v-if="route.query.expired" 
        class="mb-4 p-3 text-xs rounded-xl flex items-center gap-2"
        style="background: rgba(255, 220, 224, 0.1); color: var(--tertiary, #ffdce0); border: 1px solid rgba(255, 220, 224, 0.15);"
      >
        <KeyRound class="w-4 h-4 shrink-0" />
        <span>Tu sesión ha expirado. Por favor ingresa nuevamente.</span>
      </div>

      <!-- Form (Login & Register) -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <!-- Name (Register Only) -->
        <div v-if="isRegister" class="transition-all duration-300">
          <label class="block text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1 text-slate-600 dark:text-gray-400">
            Nombre Completo
          </label>
          <div class="relative">
            <User class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              v-model="name"
              type="text" 
              placeholder="Tu nombre"
              class="w-full input-field pl-10 text-sm"
              autocomplete="name"
              required
            >
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1 text-slate-600 dark:text-gray-400">
            Correo Electrónico
          </label>
          <div class="relative">
            <Mail class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              v-model="email"
              type="email" 
              placeholder="tu@email.com"
              class="w-full input-field pl-10 text-sm"
              autocomplete="email"
              required
            >
          </div>
        </div>
        
        <!-- Password -->
        <div>
          <div class="flex justify-between items-center mb-1.5 ml-1">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">
              Contraseña
            </label>
            <button 
              v-if="!isRegister"
              type="button" 
              @click="openResetModal" 
              class="text-[11px] text-emerald-700 dark:text-[#87ff70] hover:underline cursor-pointer font-bold"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div class="relative">
            <Lock class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              :placeholder="isRegister ? 'Mínimo 6 caracteres' : '••••••••'"
              class="w-full input-field pl-10 pr-10 text-sm"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              required
            >
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 cursor-pointer"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Confirm Password (Register Only) -->
        <div v-if="isRegister" class="transition-all duration-300">
          <label class="block text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1 text-slate-600 dark:text-gray-400">
            Confirmar Contraseña
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="Repite tu contraseña"
              class="w-full input-field pl-10 pr-10 text-sm"
              :class="{'!border-red-500/50': !passwordsMatch}"
              autocomplete="new-password"
              required
            >
            <button 
              type="button" 
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 cursor-pointer"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="confirmPassword && !passwordsMatch" class="text-[11px] text-red-400 mt-1 ml-1">
            Las contraseñas no coinciden.
          </p>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading || googleLoading"
          class="w-full mt-4 py-3.5 btn-primary text-base font-bold rounded-2xl active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-[#013a00]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...') : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión') }}</span>
          <ArrowRight v-if="!loading" class="w-4 h-4" />
        </button>
      </form>

      <!-- Divider -->
      <div class="my-5 flex items-center gap-4">
        <div class="flex-1 h-px" style="background: var(--glass-border, rgba(255,255,255,0.08));"></div>
        <span class="text-xs font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wider">o</span>
        <div class="flex-1 h-px" style="background: var(--glass-border, rgba(255,255,255,0.08));"></div>
      </div>

      <!-- Google Sign-In Button -->
      <button 
        @click="loginWithGoogle"
        :disabled="googleLoading || loading"
        class="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-all btn-secondary disabled:opacity-60 cursor-pointer shadow-sm"
      >
        <svg v-if="googleLoading" class="animate-spin h-4 w-4 text-emerald-600 dark:text-[#87ff70]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <img v-else src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
        <span>{{ googleLoading ? 'Conectando con Google...' : 'Continuar con Google' }}</span>
      </button>

      <!-- Footer Help / Toggle -->
      <p class="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-gray-400">
        {{ isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?' }}
        <button 
          type="button"
          @click="switchMode(!isRegister)" 
          class="font-bold ml-1 text-emerald-700 dark:text-[#87ff70] hover:underline cursor-pointer"
        >
          {{ isRegister ? 'Inicia sesión' : 'Regístrate gratis' }}
        </button>
      </p>
    </div>

    <!-- Password Reset Modal -->
    <transition name="fade">
      <div 
        v-if="showResetModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        @click.self="showResetModal = false"
      >
        <div class="max-w-sm w-full glass-card p-6 border border-white/10 shadow-2xl relative animate-scale-up">
          <h2 class="text-lg font-bold text-white mb-1" style="font-family: var(--font-display);">
            Recuperar Contraseña
          </h2>
          <p class="text-xs text-gray-400 mb-4">
            Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>

          <div v-if="resetSent" class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 shrink-0" />
            <span>¡Listo! Revisa tu bandeja de entrada (y spam).</span>
          </div>

          <div v-else class="space-y-3">
            <div class="relative">
              <Mail class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                v-model="resetEmail"
                type="email" 
                placeholder="nombre@ejemplo.com"
                class="w-full input-field pl-10 text-sm"
                required
              >
            </div>

            <button 
              type="button" 
              @click="handlePasswordReset"
              :disabled="resetLoading || !resetEmail"
              class="w-full py-3 btn-primary text-sm font-bold rounded-xl active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {{ resetLoading ? 'Enviando...' : 'Enviar enlace' }}
            </button>
          </div>

          <button 
            type="button" 
            @click="showResetModal = false"
            class="w-full mt-3 py-2 text-xs text-gray-400 hover:text-white cursor-pointer font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-up {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
