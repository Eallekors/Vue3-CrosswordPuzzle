import { createRouter, createWebHistory } from 'vue-router'
import EditCrossword from '../views/EditCrossword.vue'
import SolveCrossword from '../views/SolveCrossword.vue'

const routes = [
  {
    path: '/edit',
    name: 'edit',
    component: EditCrossword,
  },
  {
    path: '/embed', 
    name: 'embed',
    component: SolveCrossword,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router