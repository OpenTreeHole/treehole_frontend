import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { AxiosStatic } from 'axios'

@Module({ store: store, dynamic: true, name: 'UtilStore', namespaced: true })
class UtilStore extends VuexModule {
  public isMobile: boolean = false
  public axios: AxiosStatic | null = null

  @Mutation
  public setIsMobile (val: boolean): void{
    this.isMobile = val
  }

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  @Action
  public checkDevice (): void {
    this.setIsMobile(document.body.clientWidth <= 768)
  }

  @Mutation
  public setAxios ($axios: AxiosStatic): void {
    this.axios = $axios
  }
}

const module = getModule(UtilStore)
export default module
