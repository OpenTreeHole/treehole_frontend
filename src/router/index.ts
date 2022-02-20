import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import HolePage from '@/views/HolePage.vue'
import DivisionPage from '@/views/DivisionPage.vue'
import AboutPage from '@/views/AboutPage.vue'
import SearchPage from '@/views/SearchPage.vue'
import LicensePage from '@/views/LicensePage.vue'
import MePage from '@/views/MePage.vue'
import ChangePasswordPage from '@/views/ChangePasswordPage.vue'
import ForgetPasswordPage from '@/views/ForgetPasswordPage.vue'
import CollectionPage from '@/views/CollectionPage.vue'
import LocalStorageStore from '../store/modules/LocalStorageStore'
import ReportPage from '@/views/ReportPage.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/license', meta: { title: '协议' }, component: LicensePage, name: 'license' },
  { path: '/licence', redirect: '/license' },
  { path: '/home', redirect: '/division/1' },
  { path: '/login', meta: { title: '登录' }, component: LoginPage, name: 'login' },
  { path: '/division/:id', meta: { title: '分区' }, component: DivisionPage, name: 'division' },
  { path: '/collections', meta: { title: '收藏' }, component: CollectionPage, name: 'collections' },
  { path: '/search', meta: { title: '搜索' }, component: SearchPage, name: 'search' },
  { path: '/', redirect: '/division/1' },
  { path: '/about', meta: { title: '关于' }, component: AboutPage, name: 'about' },
  { path: '/register', meta: { title: '注册' }, component: RegisterPage, name: 'register' },
  { path: '/changepassword', meta: { title: '修改密码' }, component: ChangePasswordPage, name: 'changepassword' },
  { path: '/forgetpassword', meta: { title: '重置密码' }, component: ForgetPasswordPage, name: 'forgetpassword' },
  { path: '/hole/:id', meta: { title: '树洞' }, component: HolePage, name: 'hole' },
  { path: '/me', meta: { title: '我的' }, component: MePage, name: 'me' },
  { path: '/report', meta: { title: '举报' }, component: ReportPage, name: 'report' }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta?.title) { document.title = to.meta.title }
  if (to.path === '/login' || to.path === '/forgetpassword' || to.path === '/register' || to.path === '/license' || to.path === '/licence') return next()
  if (!LocalStorageStore.token) return next('/login')
  next()
})

export default router
