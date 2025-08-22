import { createRouter, createWebHistory } from 'vue-router'
import StyleTransform from '@/components/StyleTransform.vue'

const routes = [
  {
    path: '/',
    redirect: '/transform'
  },
  {
    path: '/transform',
    name: 'StyleTransform',
    component: StyleTransform,
    meta: {
      title: 'Transform Your Photos - SSELFIE STUDIO',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = to.meta.title || 'SSELFIE STUDIO'
  
  // Check authentication if required
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Add authentication check logic here
    const isAuthenticated = true // Temporary, replace with actual auth check
    if (!isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router