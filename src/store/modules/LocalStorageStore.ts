import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'

@Module({ store: store, dynamic: true, name: 'LocalStorageStore', namespaced: true })
class LocalStorageStore extends VuexModule {
  public _token = localStorage.getItem('token') || ''
  public _email = localStorage.getItem('email') || ''
  public _newcomer = localStorage.getItem('newcomer') || ''

  get token () {
    return this._token
  }

  get email () {
    return this._email
  }

  get newcomer () {
    return this._newcomer
  }

  @Mutation
  public setToken (newToken: string) {
    this._token = newToken
    localStorage.setItem('token', newToken)
  }

  @Mutation
  public setEmail (newEmail: string) {
    this._email = newEmail
    localStorage.setItem('email', newEmail)
  }

  @Mutation
  public setNewcomer (newNewcomer: string) {
    this._newcomer = newNewcomer
    localStorage.setItem('newcomer', newNewcomer)
  }

  @Mutation
  public clear () {
    localStorage.clear()
    this._token = ''
    this._email = ''
    this._newcomer = ''
  }
}

const module = getModule(LocalStorageStore)
export default module
