import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'
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
import LocalStorageStore from './store/modules/LocalStorageStore'
import ReportPage from '@/views/ReportPage.vue'
import { RouteConfig } from 'vue-router/types/router'

Vue.use(VueRouter)

const routes: RouteConfig[] = [
  {
    path: '/license',
    meta: {
      title: '协议',
      hide: true,
      allowBack: true
    },
    component: LicensePage,
    name: 'license'
  },
  {
    path: '/licence',
    redirect: '/license',
    meta: {
      hide: true
    }
  },
  {
    path: '/home',
    redirect: '/division/1',
    meta: {
      hide: true
    }
  },
  {
    path: '/login',
    meta: {
      title: '登录',
      hide: true
    },
    component: LoginPage,
    name: 'login'
  },
  {
    path: '/division/:id',
    meta: {
      title: '分区',
      requireAuth: true,
      icon: 'mdi-home',
      children: []
    },
    name: 'division',
    component: DivisionPage,
    props: (route: Route) => ({
      divisionId: parseInt(route.params.id)
    })
  },
  {
    path: '/collections',
    meta: {
      title: '收藏',
      requireAuth: true,
      icon: 'mdi-star'
    },
    component: CollectionPage,
    name: 'collections'
  },
  {
    path: '/search',
    meta: {
      title: '搜索',
      requireAuth: true,
      hide: true,
      allowBack: true
    },
    component: SearchPage,
    name: 'search'
  },
  {
    path: '/',
    redirect: '/division/1',
    meta: {
      hide: true
    }
  },
  {
    path: '/me',
    meta: {
      title: '我的',
      requireAuth: true,
      icon: 'mdi-account'
    },
    component: MePage,
    name: 'me'
  },
  {
    path: '/report',
    meta: {
      title: '举报',
      requireAuth: true,
      requireAdmin: true,
      icon: 'mdi-alert-box-outline'
    },
    component: ReportPage,
    name: 'report'
  },
  {
    path: '/about',
    meta: {
      title: '关于',
      icon: 'mdi-information'
    },
    component: AboutPage,
    name: 'about'
  },
  {
    path: '/register',
    meta: {
      title: '注册',
      hide: true
    },
    component: RegisterPage,
    name: 'register'
  },
  {
    path: '/changepassword',
    meta: {
      title: '修改密码',
      requireAuth: true,
      hide: true
    },
    component: ChangePasswordPage,
    name: 'changepassword'
  },
  {
    path: '/forgetpassword',
    meta: {
      title: '忘记密码',
      hide: true
    },
    component: ForgetPasswordPage,
    name: 'forgetpassword'
  },
  {
    path: '/hole/:id',
    meta: {
      title: '树洞',
      requireAuth: true,
      hide: true,
      allowBack: true
    },
    component: HolePage,
    name: 'hole'
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
  if (to.meta?.requireAuth && !LocalStorageStore.token) return next('/login')
  next()
})

export default router
