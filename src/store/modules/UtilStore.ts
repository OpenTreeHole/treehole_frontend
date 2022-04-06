import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Division } from '@/models/division'
import { Hole } from '@/models/hole'

@Module({ store: store, dynamic: true, name: 'UtilStore', namespaced: true })
class UtilStore extends VuexModule {
  public isMobile: boolean = false
  public currentDivision: Division | null
  public currentHole: Hole | null

  @Mutation
  setCurrentDivision (division: Division | null) {
    this.currentDivision = division
  }

  @Mutation
  setCurrentHole (hole: Hole | null) {
    this.currentHole = hole
  }

  @Mutation
  setIsMobile (val: boolean): void {
    this.isMobile = val
  }

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  @Action
  checkDevice (): void {
    this.setIsMobile(document.body.clientWidth <= 768)
  }
}

const module = getModule(UtilStore)
export default module
