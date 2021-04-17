import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Discussion from '@/views/Discussion.vue'
import About from '@/views/About.vue'
import Liscence from '@/views/Liscence.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/liscence', meta: { title: '协议 | FDU Hole' }, component: Liscence, name: 'liscence' },
  { path: '/home', meta: { title: '首页 | FDU Hole' }, component: Home, name: 'home' },
  { path: '/login', meta: { title: '登录 | FDU Hole' }, component: Login, name: 'login' },
  { path: '/', redirect: '/home' },
  { path: '/about', meta: { title: '关于 | FDU Hole' }, component: About, name: 'about' },
  { path: '/register', meta: { title: '注册 | FDU Hole' }, component: Register, name: 'register' },
  { path: '/discussion/:id', meta: { title: 'FDU Hole' }, component: Discussion, name: 'discussion' }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) { document.title = to.meta.title }
  if (to.path === '/login' || to.path === '/register' || to.path === '/liscence') return next()
  const token = localStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
