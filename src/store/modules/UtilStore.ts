import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import { Hole } from '@/models/hole'

@Module({ store: store, dynamic: true, name: 'UtilStore', namespaced: true })
class UtilStore extends VuexModule {
  isMobile = false
  currentDivisionId: number | null = null
  currentHole: Hole | null = null

  @Mutation
  setCurrentDivisionId(divisionId: number | null) {
    this.currentDivisionId = divisionId
  }

  @Mutation
  setCurrentHole(hole: Hole | null) {
    this.currentHole = hole
  }

  @Mutation
  setIsMobile(val: boolean): void {
    this.isMobile = val
  }

  /**
   * Check whether the device is narrow-screen or wide-screen and update isMobile property.
   */
  @Action
  checkDevice(): void {
    this.setIsMobile(document.body.clientWidth <= 768)
  }
}

const module = getModule(UtilStore)
export default module
