import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Discussion from '@/views/Discussion.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/home', meta: {title: 'FDU HOLE' }, component: Home, name: 'home' },
  { path: '/login', meta: {title: '登录' }, component: Login, name: 'login' },
  { path: '/', redirect: '/home' },
  { path: '/register', meta: {title: '注册' }, component: Register, name: 'register' },
  { path: '/discussion/:id', meta: {title: 'FDU HOLE' }, component: Discussion, name: 'discussion' }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {document.title = to.meta.title}
  if (to.path === '/login' || to.path === '/register') return next()
  const token = localStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
