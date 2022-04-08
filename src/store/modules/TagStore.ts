import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import Vue from 'vue'
import { ITag } from '@/models/tag'

@Module({ store: store, dynamic: true, name: 'TagStore', namespaced: true })
class TagStore extends VuexModule {
  /**
   * The selected tags. (as filter)
   */
  public tagMap: { [key: string]: ITag } = {}

  @Mutation
  public addTag (payload: { route: string, tag: ITag }): void {
    Vue.set(this.tagMap, payload.route, payload.tag)
  }

  @Mutation
  public clearTag (route?: string): void {
    if (route) {
      Vue.delete(this.tagMap, route)
    } else {
      this.tagMap = {}
    }
  }
}

const module = getModule(TagStore)
export default module
