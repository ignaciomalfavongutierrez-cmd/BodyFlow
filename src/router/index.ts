import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
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

// Single promise that resolves once Firebase Auth emits its first event.
// After that, auth.currentUser is always up-to-date — no need to re-await.
let authReady: Promise<void>
let resolveAuthReady: () => void

authReady = new Promise((resolve) => {
  resolveAuthReady = resolve
})

onAuthStateChanged(auth, () => {
  // Resolve on the very first event (page load)
  resolveAuthReady()
})

router.beforeEach(async (to, _from) => {
  // Wait for Firebase to emit the first auth state before any navigation
  await authReady

  const user = auth.currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !user) {
    // Not logged in → send to login with redirect param
    return { name: 'login', query: { redirect: to.fullPath } }
  } else if (guestOnly && user) {
    // Already logged in → skip login/register
    return { name: 'dashboard' }
  }
})
export default router
