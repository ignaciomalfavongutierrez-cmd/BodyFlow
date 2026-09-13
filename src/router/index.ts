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
      meta: { requiresAuth: true, nutritionistOnly: true }
    },
    {
      path: '/utilities/pacientes',
      name: 'utilities-patients',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true, nutritionistOnly: true }
    },
    {
      path: '/utilities/pacientes/:patientId',
      name: 'utilities-patient-detail',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true, nutritionistOnly: true }
    },
    {
      path: '/utilities/pacientes/:patientId/:tabId',
      name: 'utilities-patient-tab',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true, nutritionistOnly: true }
    },
    {
      path: '/utilities/pacientes/:patientId/planes/:planId/menu',
      name: 'utilities-patient-menu',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true, nutritionistOnly: true }
    },
    {
      path: '/utilities/herramientas',
      name: 'utilities-tools-hub',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true, nutritionistOnly: true }
    },
    {
      path: '/utilities/herramientas/:toolId',
      name: 'utilities-tool',
      component: () => import('../views/UtilitiesView.vue'),
      meta: { requiresAuth: true, nutritionistOnly: true }
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
      path: '/progress',
      name: 'patient-progress',
      component: () => import('../views/PatientProgressView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tools',
      name: 'tools',
      component: () => import('../views/ToolsView.vue'),
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
  // Lazy-import stores to avoid circular dependency at module load time.
  const { useAuthStore } = await import('../stores/auth')
  const { useUserStore } = await import('../stores/user')
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // Wait for the auth store's initialization to complete (single source of truth).
  await authStore.authReadyPromise

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  const nutritionistOnly = to.matched.some(record => record.meta.nutritionistOnly || record.meta.adminOnly)

  const isNutritionist = userStore.isNutritionist

  if (requiresAuth && !authStore.isAuthenticated()) {
    // Not logged in → send to login with redirect param (never redirect back to /login itself)
    const targetRedirect = to.fullPath && to.fullPath !== '/login' ? to.fullPath : '/'
    return { name: 'login', query: { redirect: targetRedirect } }
  } else if (nutritionistOnly && (!authStore.isAuthenticated() || !isNutritionist)) {
    // Attempted to access restricted clinical utilities route without nutritionist role
    return '/'
  } else if (guestOnly && authStore.isAuthenticated()) {
    // Already logged in → by default send to '/'
    const redirect = to.query.redirect as string
    let target = redirect && redirect !== '/login' ? redirect : '/'
    if (target.startsWith('/utilities') && !isNutritionist) {
      target = '/'
    }
    return target
  }
})

export default router
