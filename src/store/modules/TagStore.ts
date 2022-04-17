import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import store from '@/store'
import Vue from 'vue'
import { ITag } from '@/models/tag'

@Module({ store: store, dynamic: true, name: 'TagStore', namespaced: true })
class TagStore extends VuexModule {
  /**
   * The selected tags. (as filter)
   */
  tagMap: { [key: string]: ITag } = {}

  blockedTags: ITag[] = JSON.parse(localStorage.getItem('blockedTags') ?? '[]')

  @Mutation
  addTag(payload: { route: string; tag: ITag }): void {
    Vue.set(this.tagMap, payload.route, payload.tag)
  }

  @Mutation
  setBlockedTags(blockedTags: ITag[]) {
    this.blockedTags = blockedTags
    localStorage.setItem('blockedTags', JSON.stringify(blockedTags))
  }

  @Mutation
  clearTag(route?: string): void {
    if (route) {
      Vue.delete(this.tagMap, route)
    } else {
      this.tagMap = {}
    }
  }
}

const module = getModule(TagStore)
export default module
