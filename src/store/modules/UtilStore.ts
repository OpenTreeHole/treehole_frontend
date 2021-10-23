import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import store from '@/store'

@Module({ store: store, dynamic: true, name: 'UtilStore', namespaced: true })
class UtilStore extends VuexModule {
  public _isMobile: boolean = false

  get isMobile (): boolean {
    return this._isMobile
  }

  /**
   * Set the device info to decide which view to display.
   * @param newVal
   */
  @Mutation
  public setIsMobile (newVal: boolean): void {
    this._isMobile = newVal
  }

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  @Action
  public checkDevice (): void {
    this.setIsMobile(document.body.clientWidth <= 768)
  }
}

export default getModule(UtilStore)
