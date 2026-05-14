import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
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
      meta: { layout: 'AppLayout', requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { layout: 'AppLayout', requiresAuth: true }
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { layout: 'AppLayout', requiresAuth: true }
    },
    {
      path: '/planner',
      name: 'planner',
      component: () => import('../views/PlannerView.vue'),
      meta: { layout: 'AppLayout', requiresAuth: true }
    },
    {
      path: '/meal/:date/:mealId',
      name: 'mealDetail',
      component: () => import('../views/MealDetailView.vue'),
      meta: { layout: 'AppLayout', requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { layout: 'AppLayout', requiresAuth: true }
    }
  ]
})

let isAuthInitialized = false
let currentUser: any = null

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    if (isAuthInitialized) {
      resolve(currentUser)
      return
    }
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        currentUser = user
        isAuthInitialized = true
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, _from, next) => {
  const user = await getCurrentUser()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !user) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (guestOnly && user) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
