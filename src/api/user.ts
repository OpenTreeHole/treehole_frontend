import { Division, WrappedHole } from '@/api/hole'
import UtilStore from '@/store/modules/UtilStore'
import Vue from 'vue'

export interface UserProfile {
  userId: number
  nickname: string
  permission: {
    admin: Date
    silent: Array<any>
  }
  config: {
    showFolded: string
    notify: Array<string>
  }
  joinedTime: Date
  isAdmin: boolean
}

class Collection {
  public collectionIds: Array<number> = []
  public updateHoleMap = new Map<string, Array<WrappedHole>>()

  public clearCollection () {
    this.collectionIds = []
  }

  public setCollection (collectionIds: Array<number>) {
    this.collectionIds = collectionIds
    this.update()
  }

  public update () {
    for (const value of this.updateHoleMap.values()) {
      for (let i = 0; i < value.length; i++) {
        if (value[i].isStarred !== this.isStarred(value[i].hole.holeId)) {
          Vue.set(value, i, new WrappedHole(value[i].hole))
        }
      }
    }
  }

  public getCollections (): void {
    UtilStore.axios.get('/user/favorites').then((response) => {
      this.clearCollection()
      response.data.forEach((holeItem: any) => {
        if (!holeItem.floors.first_floor || !holeItem.floors.last_floor || holeItem.reply < 0) return
        this.collectionIds.push(holeItem.hole_id)
      })
      this.update()
    }).catch((error) => {
      throw new Error(error)
    })
  }

  public isStarred (holeId: number): boolean {
    return this.collectionIds.includes(holeId)
  }

  public registerUpdateHoleArray (name: string, holeArray: Array<WrappedHole>) {
    this.updateHoleMap.set(name, holeArray)
  }

  public unregisterUpdateHoleArray (name: string) {
    this.updateHoleMap.delete(name)
  }
}

export class User {
  public collection = new Collection()
  public divisions : Division[]
  public userProfile : UserProfile

  public clear () {
    this.collection = new Collection()
  }

  public install (): void {
    Vue.prototype.$user = this
  }
}

export default new User()
