import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Register from '../components/Register.vue'
import Discussion from '../components/Discussion.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/home', component: Home },
  { path: '/login', component: Login },
  { path: '/', redirect: '/home' },
  { path: '/register', component: Register },
  { path: '/discussion/:id', component: Discussion },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/register') return next()
  const token = localStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
