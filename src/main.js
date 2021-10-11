import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import axios from 'axios'
import VueCookies from 'vue-cookies'
import vuetify from './plugins/vuetify'
import debounce from 'lodash.debounce'
import VueQuillEditor from 'vue-quill-editor'
import marked from 'marked'
import plugins from './components/plugins'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'

// 引入项目配置文件
import FDUHoleFEConfig from './fduhole-fe.config.js'

// 引入实用工具
import FEUtils from './utils.js'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import store from './store'

Vue.prototype.$marked = marked
Vue.prototype.$feConfig = FDUHoleFEConfig
Vue.prototype.$feUtils = FEUtils

Vue.config.productionTip = false

axios.defaults.baseURL = FDUHoleFEConfig.backEndApi
// axios.defaults.withCredentials = true
axios.interceptors.request.use(config => {
  config.headers.Authorization = localStorage.getItem('token')
  return config
})
Vue.prototype.$axios = axios

Vue.use(VueCookies)
Vue.use(plugins)
Vue.use(VueQuillEditor /* { default global options } */)
Vue.use(Viewer)

Vue.filter('plainText', function (html) {
  return html.replace(/<img.*?>/g, '[图片]').replace(/<.*?>/g, ' ')
})

Vue.filter('timeDifference', function (datestr) {
  const date = new Date(datestr)
  const now = new Date()
  let seconds = Math.floor((now - date) / 1000)

  if (seconds < 0) {
    seconds = 0
  }
  if (seconds < 60) {
    return seconds + '秒前'
  } else if (seconds < 3600) {
    return Math.floor(seconds / 60) + '分钟前'
  } else if (seconds < 86400) {
    return Math.floor(seconds / 3600) + '小时前'
  } else if (seconds < 604800) {
    return Math.floor(seconds / 86400) + '天前'
  } else if (date.getFullYear() === now.getFullYear()) {
    return datestr.substring(5, 10)
  } else {
    return datestr.substring(0, 10)
  }
})

new Vue({
  router,
  vuetify,
  debounce,
  store,
  render: h => h(App)
}).$mount('#app')

// new Vue({
//   el: '#app',
//   router,
//   axios,
//   components: { App },
//   template: '<App/>'
// })
