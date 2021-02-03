import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/home', component: Home },
  { path: '/login', component: Login },
  { path: '/', redirect: '/login' }
]

const router = new VueRouter({
  routes
})

// router.beforeEach((to, from, next) => {
//   if(to.path === '/login') return next()
//   const token = localStorage.getItem('token')
//   if(!token) return next('/login')
//   next()
// })

export default router
