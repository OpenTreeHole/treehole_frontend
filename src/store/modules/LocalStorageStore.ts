import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

@Module({ store: store, dynamic: true, name: 'LocalStorageStore', namespaced: true })
class LocalStorageStore extends VuexModule {
  token = localStorage.getItem('token') || ''
  email = localStorage.getItem('email') || ''
  newcomer = localStorage.getItem('newcomer') || ''
  refreshToken = localStorage.getItem('refresh') || ''

  get tokenNoPrefix() {
    return this.token?.substring(6)
  }

  @Mutation
  setRefreshToken(newRefreshToken: string) {
    this.refreshToken = newRefreshToken
    localStorage.setItem('refresh', newRefreshToken)
  }

  @Mutation
  setToken(newToken: string) {
    this.token = newToken
    localStorage.setItem('token', newToken)
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
    this.token = ''
    this.refreshToken = ''
    this.email = ''
    this.newcomer = ''
  }
}

const module = getModule(LocalStorageStore)
export default module
