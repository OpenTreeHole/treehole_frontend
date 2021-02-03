import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import axios from 'axios'
import VueCookies from 'vue-cookies'

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://www.fduhole.tk/api/'
axios.defaults.withCredentials = true

Vue.prototype.$axios = axios
Vue.use(VueCookies)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// new Vue({
//   el: '#app',
//   router,
//   axios,
//   components: { App },
//   template: '<App/>'
// })
