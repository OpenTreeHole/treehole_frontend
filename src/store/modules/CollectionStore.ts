import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import Message from '@/components/Message.vue'
import store from '@/store'
import UtilStore from '@/store/modules/UtilStore'
import { WrappedHole } from '@/components/Discussion/hole'
import { camelizeKeys } from '@/utils'
import Vue from 'vue'

@Module({ store: store, dynamic: true, name: 'CollectionStore', namespaced: true })
class CollectionStore extends VuexModule {
  public collectionIds: Array<number> = []
  public updateHoleMap = new Map<string, Array<WrappedHole>>()

  @Mutation
  public clearCollection () {
    this.collectionIds = []
  }

  @Action
  public getCollections (): void {
    UtilStore.axios.get('/user/favorites').then((response) => {
      this.clearCollection()
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        this.collectionIds.push(holeItem.hole_id)
      })
      for (const value of this.updateHoleMap.values()) {
        console.log(this.updateHoleMap.values())
        for (let i = 0; i < value.length; i++) {
          if (value[i].isStarred !== this.isStarred(value[i].hole.holeId)) {
            Vue.set(value, i, new WrappedHole(value[i].hole))
          }
        }
      }
    }).catch((error) => {
      throw new Error(error)
    })
  }

  @Action
  public isStarred (holeId: number): boolean {
    return this.collectionIds.includes(holeId)
  }

  @Mutation
  public registerUpdateHoleArray (name: string, holeArray: Array<WrappedHole>) {
    console.log(`${name} ${holeArray}`)
    this.updateHoleMap.set(name, holeArray)
  }

  @Mutation
  public unregisterUpdateHoleArray (name: string) {
    this.updateHoleMap.delete(name)
  }
}

const module = getModule(CollectionStore)
export default module
