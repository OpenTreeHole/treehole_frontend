import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import Cookies from 'js-cookie'
import config from '@/config'

const access = !Cookies.get('access') && localStorage.getItem('token')
const refresh = !Cookies.get('refresh') && localStorage.getItem('refresh')
if (access) {
  Cookies.set('access', access, { domain: config.cookieDomain, expires: 10 })
  localStorage.removeItem('token')
}
if (refresh) {
  Cookies.set('refresh', refresh, { domain: config.cookieDomain, expires: 10 })
  localStorage.removeItem('refresh')
}

@Module({ store: store, dynamic: true, name: 'LocalStorageStore', namespaced: true })
class LocalStorageStore extends VuexModule {
  access = Cookies.get('access') || ''
  refresh = Cookies.get('refresh') || ''
  email = localStorage.getItem('email') || ''
  newcomer = localStorage.getItem('newcomer') || ''

  @Mutation
  setRefreshToken(newRefreshToken: string) {
    this.refresh = newRefreshToken
    Cookies.set('refresh', newRefreshToken, { domain: config.cookieDomain, expires: 10 })
  }

  @Mutation
  setToken(newToken: string) {
    this.access = newToken
    Cookies.set('access', newToken, { domain: config.cookieDomain, expires: 10 })
  }

  @Mutation
  setEmail(newEmail: string) {
    this.email = newEmail
    localStorage.setItem('email', newEmail)
  }

  @Mutation
  setNewcomer(newNewcomer: string) {
    this.newcomer = newNewcomer
    localStorage.setItem('newcomer', newNewcomer)
  }

  @Mutation
  clear() {
    localStorage.clear()
    this.access = ''
    this.refresh = ''
    this.email = ''
    this.newcomer = ''
  }
}

const module = getModule(LocalStorageStore)
export default module
