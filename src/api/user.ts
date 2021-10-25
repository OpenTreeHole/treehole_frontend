import { WrappedHole } from '@/components/Discussion/hole'
import UtilStore from '@/store/modules/UtilStore'
import Vue from 'vue'

class Collection {
  public collectionIds: Array<number> = []
  public updateHoleMap = new Map<string, Array<WrappedHole>>()

  public clearCollection () {
    this.collectionIds = []
  }

  public getCollections (): void {
    UtilStore.axios.get('/user/favorites').then((response) => {
      this.clearCollection()
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        this.collectionIds.push(holeItem.hole_id)
      })
      for (const value of this.updateHoleMap.values()) {
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

  public isStarred (holeId: number): boolean {
    return this.collectionIds.includes(holeId)
  }

  public registerUpdateHoleArray (name: string, holeArray: Array<WrappedHole>) {
    console.log(`${name} ${holeArray}`)
    this.updateHoleMap.set(name, holeArray)
  }

  public unregisterUpdateHoleArray (name: string) {
    this.updateHoleMap.delete(name)
  }
}

export class User {
  public collection = new Collection()

  public install (): void {
    Vue.prototype.$user = this
  }
}

export default new User()
