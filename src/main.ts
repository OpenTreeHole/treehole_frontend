import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import axios from 'axios'
import VueCookies from 'vue-cookies'
import vuetify from './plugins/vuetify'

import plugins from './components/plugins'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'

// 引入项目配置文件
import FDUHoleFEConfig from './opentreehole-fe.config'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import store from './store'
import ws from '@/api/ws'
import { timeDifference } from '@/utils/utils'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

// global registration
Vue.component('overlay-scrollbars', OverlayScrollbarsComponent)

Vue.prototype.$feConfig = FDUHoleFEConfig
Vue.prototype.$ws = ws

Vue.config.productionTip = false

axios.defaults.baseURL = FDUHoleFEConfig.backEndApi
axios.interceptors.request.use(config => {
  // Put token into header.
  config.headers.Authorization = localStorage.getItem('token')
  return config
})
Vue.prototype.$axios = axios

Vue.use(VueCookies)
Vue.use(plugins)
Vue.use(Viewer)

Vue.filter('plainText', function (html: string) {
  return html.replace(/<img.*?>/g, '[图片]')
    .replace(/<.*?>/g, ' ')
    .replace(/\$+[\s\S]*?\$+/g, '[数学公式]')
    .replace(/##?\d+/g, (v) => '[回复' + v + ']')
})

Vue.filter('wordLimit', function (html: string) {
  const maxlength = document.body.clientWidth <= 454 ? 30 : 40
  return html.length > maxlength ? html.substring(0, maxlength - 4) + ' ...' : html
})

Vue.filter('timeDifference', timeDifference)

export const Main = new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
