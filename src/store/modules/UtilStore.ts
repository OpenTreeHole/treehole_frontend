import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { AxiosStatic } from 'axios'

@Module({ store: store, dynamic: true, name: 'UtilStore', namespaced: true })
class UtilStore extends VuexModule {
  public _isMobile: boolean = false
  public _axios: AxiosStatic

  @Mutation
  public setIsMobile (val: boolean): void{
    this._isMobile = val
  }

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  @Action
  public checkDevice (): void {
    this.setIsMobile(document.body.clientWidth <= 768)
  }

  get isMobile (): boolean {
    return this._isMobile
  }

  get axios () {
    return this._axios
  }

  @Mutation
  public setAxios ($axios: AxiosStatic): void {
    this._axios = $axios
  }
}

const module = getModule(UtilStore)
export default module
