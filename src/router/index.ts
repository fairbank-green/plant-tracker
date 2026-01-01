import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import WeeklyReviewView from '@/views/WeeklyReviewView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/review',
      name: 'weekly-review',
      component: WeeklyReviewView,
    },
  ],
})

export default router
