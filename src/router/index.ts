import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import UploadView from '../views/UploadView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/utilities',
      name: 'utilities',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { requiresAuth: true }
    },
    {
      path: '/planner',
      name: 'planner',
      component: () => import('../views/PlannerView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/meal/:date/:mealId',
      name: 'mealDetail',
      component: () => import('../views/MealDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, _from) => {
  // Lazy-import auth store to avoid circular dependency at module load time.
  // The store is already instantiated by App.vue before any navigation guard runs.
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()

  // Wait for the auth store's initialization to complete (single source of truth).
  // This replaces the previous direct auth.authStateReady() call which raced
  // with the auth store's own initAuth and caused duplicate waits.
  await authStore.authReadyPromise

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !authStore.isAuthenticated()) {
    // Not logged in → send to login with redirect param (never redirect back to /login itself)
    const targetRedirect = to.fullPath && to.fullPath !== '/login' ? to.fullPath : '/'
    return { name: 'login', query: { redirect: targetRedirect } }
  } else if (guestOnly && authStore.isAuthenticated()) {
    // Already logged in → skip login/register and send to intended destination
    const redirect = to.query.redirect as string
    const target = redirect && redirect !== '/login' ? redirect : '/'
    return target
  }
})

export default router
