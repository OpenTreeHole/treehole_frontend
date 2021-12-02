import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Register from '@/views/Register.vue'
import Hole from '@/views/Hole.vue'
import Division from '@/views/Division.vue'
import About from '@/views/About.vue'
import Search from '@/views/Search.vue'
import license from '@/views/License.vue'
import Me from '@/views/Me.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import ForgetPassword from '@/views/ForgetPassword.vue'
import Collections from '@/views/Collections.vue'
import LocalStorageStore from '../store/modules/LocalStorageStore'

Vue.use(VueRouter)

const routes = [
  { path: '/license', meta: { title: '协议' }, component: license, name: 'license' },
  { path: '/home', meta: { title: '首页' }, component: Home, name: 'home' },
  { path: '/login', meta: { title: '登录' }, component: Login, name: 'login' },
  { path: '/division/:id', meta: { title: '分区' }, component: Division, name: 'division' },
  { path: '/collections', meta: { title: '收藏' }, component: Collections, name: 'collections' },
  { path: '/search', meta: { title: '搜索' }, component: Search, name: 'search' },
  { path: '/', redirect: '/home' },
  { path: '/about', meta: { title: '关于' }, component: About, name: 'about' },
  { path: '/register', meta: { title: '注册' }, component: Register, name: 'register' },
  { path: '/changepassword', meta: { title: '修改密码' }, component: ChangePassword, name: 'changepassword' },
  { path: '/forgetpassword', meta: { title: '重置密码' }, component: ForgetPassword, name: 'forgetpassword' },
  { path: '/hole/:id', meta: { title: '树洞' }, component: Hole, name: 'hole' },
  { path: '/me', meta: { title: '我的' }, component: Me, name: 'me' }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) { document.title = to.meta.title }
  if (to.path === '/login' || to.path === '/register' || to.path === '/license') return next()
  if (!LocalStorageStore.token) return next('/login')
  next()
})

export default router
