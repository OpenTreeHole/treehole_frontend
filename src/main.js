import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import axios from 'axios'
import VueCookies from 'vue-cookies'
import vuetify from './plugins/vuetify'
import debounce from 'lodash.debounce'

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://www.fduhole.tk/api/'
axios.defaults.withCredentials = true
axios.interceptors.request.use(config => {
  config.headers.Authorization = localStorage.getItem('token')
  return config
})

Vue.prototype.$axios = axios
Vue.use(VueCookies)
Vue.use(debounce)

new Vue({
  router,
  vuetify,
  debounce,
  render: h => h(App)
}).$mount('#app')

// new Vue({
//   el: '#app',
//   router,
//   axios,
//   components: { App },
//   template: '<App/>'
// })
