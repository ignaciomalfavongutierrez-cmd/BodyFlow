import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { auth, persistenceReady } from '../firebase';
import { onAuthStateChanged, signOut, getRedirectResult, type User } from 'firebase/auth';
import router, { isAdminEmail } from '../router';
import { useUserStore } from './user';
import { useDietStore } from './diet';
import { useFoodsStore } from './foods';
import { useLogStore } from './log';

/**
 * Explicit auth states — eliminates ambiguity between
 * "don't know if there's a session" and "know there's no session".
 */
export type AuthStatus =
  | 'initializing'       // Firebase loading, persistence not yet ready
  | 'restoring-session'  // Processing redirect result / reading persisted session
  | 'authenticated'      // User confirmed
  | 'unauthenticated'    // Confirmed no session
  | 'error';             // Initialization failed

/** Auth timeout: 10s for mobile (redirect + IndexedDB can be slow) */
const AUTH_TIMEOUT_MS = 10_000;

/** Diagnostic log — only in dev, never prints tokens or credentials */
function authLog(event: string, detail?: string) {
  if (import.meta.env.DEV) {
    console.log(`[AUTH:FLOW] ${event}${detail ? ' — ' + detail : ''}`);
  }
}

/** Classify Firebase error codes into user-friendly categories */
export type AuthErrorKind = 'cancelled' | 'network' | 'timeout' | 'domain' | 'generic';

export function classifyAuthError(err: any): AuthErrorKind {
  const code = err?.code || '';
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled'
  ) {
    return 'cancelled';
  }
  if (
    code === 'auth/network-request-failed' ||
    code === 'auth/timeout' ||
    code === 'auth/internal-error'
  ) {
    return 'network';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'domain';
  }
  if (code === 'auth/auth-timeout') {
    return 'timeout';
  }
  return 'generic';
}

/** Map error kind → user-friendly message in Spanish */
export function friendlyAuthMessage(kind: AuthErrorKind): string {
  switch (kind) {
    case 'cancelled':
      return ''; // Silent — user chose to cancel
    case 'network':
      return 'Parece que hubo un problema de conexión. Revisa tu conexión e inténtalo nuevamente.';
    case 'timeout':
      return 'El inicio de sesión está tardando más de lo esperado. Inténtalo nuevamente.';
    case 'domain':
      return 'Este dominio no está configurado para autenticación. Contacta al soporte.';
    case 'generic':
    default:
      return 'No pudimos iniciar tu sesión. Inténtalo nuevamente.';
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const status = ref<AuthStatus>('initializing');
  const authError = ref<string>(''); // User-facing error message
  const isAuthReady = computed(() => status.value !== 'initializing' && status.value !== 'restoring-session');

  const userStore = useUserStore();
  const dietStore = useDietStore();
  const foodsStore = useFoodsStore();
  const logStore = useLogStore();

  // Promise that external code (router) can await to know auth is resolved
  let authReadyResolve: () => void;
  const authReadyPromise = new Promise<void>((resolve) => {
    authReadyResolve = resolve;
  });

  /**
   * Single-point auth initialization — resolves the race condition.
   * 
   * Order:
   * 1. Wait for persistence to be configured
   * 2. Check for redirect result (mobile Google Sign-In return)
   * 3. Wait for authStateReady (session restoration from IndexedDB)
   * 4. Register onAuthStateChanged for subsequent changes
   * 5. Mark auth as ready
   * 
   * All wrapped in a timeout to prevent infinite splash.
   */
  async function initAuth() {
    authLog('AUTH_FLOW_START');
    status.value = 'initializing';

    // Timeout race — prevents infinite splash
    const timeoutPromise = new Promise<'timeout'>((resolve) => {
      setTimeout(() => resolve('timeout'), AUTH_TIMEOUT_MS);
    });

    const initPromise = _doInitAuth();

    const result = await Promise.race([initPromise, timeoutPromise]);

    if (result === 'timeout' && (status.value as AuthStatus) !== 'authenticated' && (status.value as AuthStatus) !== 'unauthenticated') {
      authLog('AUTH_TIMEOUT', `Auth did not resolve within ${AUTH_TIMEOUT_MS}ms`);
      status.value = 'error';
      authError.value = 'El inicio de sesión está tardando más de lo esperado.';
      loading.value = false;
      authReadyResolve();
    }
  }

  async function _doInitAuth() {
    try {
      // Step 1: Wait for persistence setup
      authLog('PERSISTENCE_WAIT_START');
      await persistenceReady;
      authLog('PERSISTENCE_WAIT_DONE');

      // Step 2: Process redirect result (mobile Google Sign-In return)
      status.value = 'restoring-session';
      authLog('REDIRECT_RESULT_CHECK_START');
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult && redirectResult.user) {
          authLog('REDIRECT_RESULT_SUCCESS', redirectResult.user.email || 'no-email');
          user.value = redirectResult.user;
        } else {
          authLog('REDIRECT_RESULT_NONE');
        }
      } catch (err: any) {
        // credential-already-in-use is benign (user already has an account)
        if (err.code !== 'auth/credential-already-in-use') {
          authLog('REDIRECT_RESULT_ERROR', err?.code || 'unknown');
        }
      }

      // Step 3: Wait for Firebase to finish restoring persisted session
      authLog('AUTH_STATE_READY_WAIT');
      await auth.authStateReady();
      authLog('AUTH_STATE_READY_DONE');

      // Now we know the definitive auth state
      const currentUser = auth.currentUser;
      user.value = currentUser;

      if (currentUser) {
        status.value = 'authenticated';
        authLog('SESSION_RESTORED', currentUser.email || 'no-email');
        await _loadUserData();
      } else {
        status.value = 'unauthenticated';
        authLog('NO_SESSION_FOUND');
        _cleanupAllStores();
      }
    } catch (err: any) {
      authLog('INIT_ERROR', err?.message || 'unknown');
      status.value = 'error';
      authError.value = 'No pudimos verificar tu sesión. Inténtalo nuevamente.';
    } finally {
      loading.value = false;
      authReadyResolve();
      authLog('AUTH_FLOW_COMPLETE', `status=${status.value}`);
    }

    // Step 4: Register the persistent listener AFTER init is done.
    // This handles subsequent auth changes (login, logout, token refresh)
    // but does NOT control the initial loading state.
    _registerAuthListener();
  }

  /**
   * Persistent listener for auth state changes AFTER initialization.
   * This handles: new logins, logouts, token refreshes.
   * It does NOT control loading/splash state — that's handled by initAuth.
   */
  function _registerAuthListener() {
    authLog('AUTH_STATE_LISTENER_REGISTERED');

    onAuthStateChanged(auth, async (firebaseUser) => {
      const wasAuthenticated = status.value === 'authenticated';
      user.value = firebaseUser;

      try {
        if (firebaseUser) {
          status.value = 'authenticated';
          authLog('AUTH_STATE_CHANGED', `user=${firebaseUser.email || 'no-email'}`);

          // Load user data if this is a NEW login (not the initial restoration)
          if (!wasAuthenticated) {
            await _loadUserData();
          }

          // Navigate away from login if we're still there
          await router.isReady();
          const currentName = router.currentRoute.value?.name;
          if (currentName === 'login') {
            const redirect = router.currentRoute.value?.query?.redirect as string;
            const userEmail = (firebaseUser.email || '').toLowerCase().trim();
            const isAdmin = isAdminEmail(userEmail);
            let target = '/';
            if (redirect && redirect !== '/login') {
              if (redirect.startsWith('/utilities')) {
                target = isAdmin ? redirect : '/';
              } else {
                target = redirect;
              }
            }
            authLog('NAVIGATION_TO_APP', target);
            router.replace(target);
          }
        } else {
          authLog('AUTH_STATE_CHANGED', 'user=null');

          // Only redirect to login if user was previously authenticated
          // (not during initial cold boot — that's handled by initAuth)
          if (wasAuthenticated) {
            status.value = 'unauthenticated';
            _cleanupAllStores();

            if (router.currentRoute.value?.meta?.requiresAuth) {
              authLog('NAVIGATION_TO_LOGIN', 'session-lost');
              router.push({ name: 'login', query: { expired: 'true' } });
            }
          }
        }
      } catch (error: any) {
        authLog('AUTH_LISTENER_ERROR', error?.message || 'unknown');
      }
    });
  }

  /** Load Firestore data after auth is confirmed */
  async function _loadUserData() {
    authLog('STORES_LOAD_START');
    try {
      await Promise.allSettled([
        userStore.fetchProfile(),
        dietStore.fetchDiet(),
        foodsStore.fetchMyFoods()
      ]);
      authLog('STORES_LOAD_COMPLETE');
    } catch (error: any) {
      authLog('STORES_LOAD_ERROR', error?.message || 'unknown');
    }
  }

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
   * Retry auth initialization — used when timeout/error occurred.
   */
  async function retryAuth() {
    authLog('AUTH_RETRY_START');
    authError.value = '';
    loading.value = true;
    status.value = 'initializing';

    try {
      await persistenceReady;
      await auth.authStateReady();
      const currentUser = auth.currentUser;
      user.value = currentUser;

      if (currentUser) {
        status.value = 'authenticated';
        authLog('RETRY_SESSION_RESTORED', currentUser.email || 'no-email');
        await _loadUserData();
      } else {
        status.value = 'unauthenticated';
        authLog('RETRY_NO_SESSION');
        _cleanupAllStores();
      }
    } catch (err: any) {
      authLog('RETRY_ERROR', err?.message || 'unknown');
      status.value = 'error';
      authError.value = 'No pudimos verificar tu sesión. Inténtalo nuevamente.';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Logout handler:
   * 1. Detach all Firestore listeners
   * 2. signOut from Firebase Auth
   * 3. Navigate to login
   */
  const handleLogout = async () => {
    authLog('LOGOUT_START');
    _cleanupAllStores();
    await signOut(auth);
    user.value = null;
    status.value = 'unauthenticated';
    authLog('LOGOUT_COMPLETE');
    router.push({ name: 'login' });
  };

  const isAuthenticated = () => status.value === 'authenticated';

  /** Clear the user-facing error message */
  function clearError() {
    authError.value = '';
  }

  // Kick off auth initialization
  initAuth();

  return {
    user,
    loading,
    status,
    authError,
    isAuthReady,
    authReadyPromise,
    handleLogout,
    logout: handleLogout,
    isAuthenticated,
    retryAuth,
    clearError
  };
});
