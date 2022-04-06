import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import Vue from 'vue'

export interface IFloatBtnInfo {
  style: string
  icon: string
  callback: () => void
}

const defaultBtnInfo: IFloatBtnInfo = {
  style: '',
  icon: 'mdi-send',
  callback: () => {
  }
}

@Module({ store: store, dynamic: true, name: 'FloatBtnStore', namespaced: true })
class FloatBtnStore extends VuexModule {
  /**
   * Control what float button shows using layers.
   *
   * <p> The key of this property is the layer-order, and the value is its array of IFloatBtnInfo. </p>
   */
  floatBtnLayers: { [key: string]: IFloatBtnInfo[] } = {}

  @Mutation
  setLayer ({ order, floatBtns }: { order: number, floatBtns: Partial<IFloatBtnInfo>[] }) {
    const cFloatBtns = floatBtns.map(v => ({ ...defaultBtnInfo, ...v }))
    Vue.set(this.floatBtnLayers, order.toString(), cFloatBtns)
  }

  @Mutation
  clean () {
    this.floatBtnLayers = {}
  }

  get floatBtns () {
    let maxOrder = '-1'
    for (const order in this.floatBtnLayers) {
      maxOrder = parseInt(order) > parseInt(maxOrder) ? order : maxOrder
    }
    if (maxOrder === '-1') return null
    return this.floatBtnLayers[maxOrder]
  }
}

const module = getModule(FloatBtnStore)
export default module
