import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
import UploadView from '../views/UploadView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { layout: 'AppLayout' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { layout: 'AppLayout' }
    },
    {
      path: '/upload',
      name: 'upload',
      component: UploadView,
      meta: { layout: 'AppLayout' }
    },
    {
      path: '/planner',
      name: 'planner',
      component: () => import('../views/PlannerView.vue'),
      meta: { layout: 'AppLayout' }
    },
    {
      path: '/meal/:date/:mealId',
      name: 'mealDetail',
      component: () => import('../views/MealDetailView.vue'),
      // Use no layout or AppLayout depending on design. Since we want a back button, we can still use AppLayout, but maybe without bottom nav. Let's stick to AppLayout.
      meta: { layout: 'AppLayout' }
    }
  ]
})

export default router
