import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import UploadView from '../views/UploadView.vue'

export const ADMIN_EMAILS = [
  'lic.n.talia@gmail.com',
  'ignaciomalfavongutierrez@gmail.com'
]

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

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
      meta: { requiresAuth: true, adminOnly: true }
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
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()

  // Wait for the auth store's initialization to complete (single source of truth).
  await authStore.authReadyPromise

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  const adminOnly = to.matched.some(record => record.meta.adminOnly)

  const userEmail = authStore.user?.email?.toLowerCase().trim() || ''
  const isAdmin = isAdminEmail(userEmail)

  if (requiresAuth && !authStore.isAuthenticated()) {
    // Not logged in → send to login with redirect param (never redirect back to /login itself)
    const targetRedirect = to.fullPath && to.fullPath !== '/login' ? to.fullPath : '/'
    return { name: 'login', query: { redirect: targetRedirect } }
  } else if (adminOnly && (!authStore.isAuthenticated() || !isAdmin)) {
    // Attempted to access restricted admin utilities route without authorized admin email
    return '/'
  } else if (guestOnly && authStore.isAuthenticated()) {
    // Already logged in → by default send to '/'
    const redirect = to.query.redirect as string
    let target = redirect && redirect !== '/login' ? redirect : '/'
    if (target.startsWith('/utilities') && !isAdmin) {
      target = '/'
    }
    return target
  }
})

export default router
