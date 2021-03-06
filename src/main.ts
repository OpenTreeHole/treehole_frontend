import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import VueCookies from 'vue-cookies'
import vuetify from './plugins/vuetify'

import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'

// 引入项目配置文件
import config from './config'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import store from './store'
import ws from '@/apis/ws'
import { stopOverscroll, timeDifference } from '@/utils/utils'

import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'

stopOverscroll()

// global registration
Vue.component('overlay-scrollbars', OverlayScrollbarsComponent)

Vue.prototype.$feConfig = config
Vue.prototype.$ws = ws

Vue.config.productionTip = false

Vue.use(VueCookies)
Vue.use(Viewer)

Vue.filter('plainText', function (html: string) {
  return html
    .replace(/<img.*?>/g, '[图片]')
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
  render: (h) => h(App)
}).$mount('#app')
