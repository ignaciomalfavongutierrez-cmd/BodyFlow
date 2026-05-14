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

// Auth Guard
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, _from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (await getCurrentUser()) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
